import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VoucherInput } from '@/components/voucher-input';
import { useAnalytics } from '@/hooks/use-analytics';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircle, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

// Declare global checkout variable for Duitku
declare global {
    interface Window {
        checkout: {
            process: (
                reference: string,
                options: {
                    defaultLanguage?: string;
                    currency?: string;
                    successEvent?: (result: any) => void;
                    pendingEvent?: (result: any) => void;
                    errorEvent?: (result: any) => void;
                    closeEvent?: (result: any) => void;
                },
            ) => void;
        };
    }
}

type RegisterForm = {
    username: string;
    name: string;
    phone: string;
    email: string;
    password: string;
    password_confirmation: string;
};

interface RegisterProps {
    coursePrice: number;
    duitkuScriptUrl: string;
}

export default function Register({ coursePrice, duitkuScriptUrl }: RegisterProps) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
    const [finalPrice, setFinalPrice] = useState(coursePrice);
    const { trackEngagement, trackConversion, trackPayment } = useAnalytics();
    const [isSendingNotif, setIsSendingNotif] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState('duitku'); // pilihan payment gateway

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID').format(number);
    };

    const { data, setData, post, processing, errors, reset, setError } = useForm<Required<RegisterForm>>({
        username: '',
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        // Dynamically load Midtrans script
        const script = document.createElement('script');
        // script.src = 'https://app.midtrans.com/snap/snap.js';
        // script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
        // script.type = 'text/javascript';
        // script.async = true;

        // Duitku - use the script URL from props (database)
        script.src = duitkuScriptUrl || import.meta.env.VITE_DUITKU_SCRIPT_URL || '';

        if (script.src) {
            document.body.appendChild(script);
        }
    }, []);

    const handleVoucherApplied = (voucherData: any) => {
        setAppliedVoucher(voucherData);
        setFinalPrice(voucherData.final_price);
    };

    const handleVoucherRemoved = () => {
        setAppliedVoucher(null);
        setFinalPrice(coursePrice);
    };

    const sendNotification = async (phone: string, message: string) => {
        setIsSendingNotif(true);

        try {
            const response = await axios.post('/api/send-message', {
                message: message,
                phone: phone,
            });
        } catch (err: any) {
            const message = err.response?.data?.message || 'Gagal mengirim pesan.';
            setToastMessage(message);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        } finally {
            setIsSendingNotif(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        trackConversion('registration');

        let paymentData;

        try {
            // 1. Minta Snap Token + validasi form
            const registrationData = {
                ...data,
                register: true,
                gateway: selectedGateway,
                final_price: finalPrice,
                voucher_code: appliedVoucher?.voucher?.code || null,
                discount_amount: appliedVoucher?.discount || 0,
            };

            // check if price = 0, bypass payment
            if (finalPrice === 0) {
                const response = await axios.post(route('register.force'), registrationData);

                if (response.data.success) {
                    window.location.href = route('member.index');
                } else {
                    setToastMessage(response.data.message || 'Gagal memproses akun.');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 4000);
                }
            }

            const res = await axios.post(route('register.create-payment'), registrationData);
            const checkout = window.checkout;

            if (res.data.type === 'duitku_reference' && checkout) {
                checkout.process(res.data.reference, {
                    defaultLanguage: 'id',
                    currency: 'IDR',
                    successEvent: async function (result: any) {
                        setToastMessage('Pembayaran berhasil! Memproses akun...'); // Pesan baru
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 5000); // Durasi lebih lama

                        trackPayment('success', {
                            payment_method: 'duitku',
                            amount: finalPrice,
                            original_amount: coursePrice,
                            discount_amount: appliedVoucher?.discount || 0,
                            voucher_code: appliedVoucher?.voucher?.code || null,
                        });

                        try {
                            const response = await axios.post(route('payments.confirm-registration'), {
                                reference: result.reference,
                                order_id: result.merchantOrderId,
                            });

                            if (response.data.success) {
                                window.location.href = route('member.index');
                            } else {
                                setToastMessage(response.data.message || 'Gagal memproses akun.');
                                setShowToast(true);
                                setTimeout(() => setShowToast(false), 4000);
                            }
                        } catch (err: any) {
                            setToastMessage(err.response?.data?.message || 'Gagal membuat akun.');
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 4000);
                        }
                    },
                    pendingEvent: function (result: any) {
                        setToastMessage('Payment pending, silakan selesaikan pembayaran.');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 4000);
                        trackPayment('pending');
                    },
                    errorEvent: function (error: any) {
                        setToastMessage('Payment failed, please try again.');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 4000);
                        trackPayment('failed', { error: error.message });
                    },
                    closeEvent: function (result: any) {
                        setToastMessage('Payment canceled');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 4000);
                        trackPayment('closed');
                    },
                });
            } else if (!checkout) {
                // 3. TAMBAHKAN INI: Error jika script Duitku gagal di-load
                console.error('Duitku checkout script not loaded.');
                setToastMessage('Gagal memuat gateway pembayaran. Coba refresh halaman.');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
            } else {
                // 4. TAMBAHKAN INI: Error jika respon server tidak valid
                console.error('Invalid response type from server:', res.data.type);
                setToastMessage('Respon server tidak valid. Hubungi admin.');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
            }
            // --- SELESAI PERBAIKAN ---
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.errors) {
                const validationErrors = err.response.data.errors;

                Object.keys(validationErrors).forEach((field) => {
                    if (field in data) {
                        setError(field as keyof RegisterForm, validationErrors[field][0]);
                    }
                });
            } else {
                // 5. PERBAIKI BLOK CATCH ANDA: Tampilkan error ke user
                const message = err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.';
                setToastMessage(message);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
                console.error(err); // Tetap log di console
            }
        }
    };

    const handleFieldFocus = (fieldName: string) => {
        // trackEngagement('form_field_focus', { field: fieldName });
    };

    const handleFieldBlur = (fieldName: string) => {
        // trackEngagement('form_field_blur', { field: fieldName });
    };

    return (
        <AuthLayout title="Daftar Akun" description="Masukkan informasi anda untuk membuat akun">
            <Head title="Register" />
            {/* Toast Notification */}
            {showToast && (
                <div className="animate-fade-in fixed top-4 right-4 z-50">
                    <Alert className="border-primary/50 bg-primary/10 backdrop-blur-sm">
                        <CheckCircle className="text-primary h-4 w-4" />
                        <AlertDescription className="text-primary font-medium">{toastMessage}</AlertDescription>
                    </Alert>
                </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-4">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                onFocus={() => handleFieldFocus('username')}
                                onBlur={() => handleFieldBlur('username')}
                                disabled={processing}
                                placeholder="Username"
                            />
                            <InputError message={errors.username} className="mt-2" />
                        </div>
                        <div className="grid gap-4">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                onFocus={() => handleFieldFocus('name')}
                                onBlur={() => handleFieldBlur('name')}
                                disabled={processing}
                                placeholder="Full name"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            onFocus={() => handleFieldFocus('email')}
                            onBlur={() => handleFieldBlur('email')}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-4">
                        <Label htmlFor="phone">Phone number</Label>
                        <Input
                            id="phone"
                            type="phone"
                            required
                            tabIndex={2}
                            autoComplete="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            onFocus={() => handleFieldFocus('phone')}
                            onBlur={() => handleFieldBlur('phone')}
                            disabled={processing}
                            placeholder="628xxxxxxxxx"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="grid gap-4">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                onFocus={() => handleFieldFocus('password')}
                                onBlur={() => handleFieldBlur('password')}
                                disabled={processing}
                                placeholder="Password"
                            />
                            <InputError message={errors.password} />
                        </div>
                        <div className="grid gap-4">
                            <Label htmlFor="password_confirmation">Confirm password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                onFocus={() => handleFieldFocus('password_confirmation')}
                                onBlur={() => handleFieldBlur('password_confirmation')}
                                disabled={processing}
                                placeholder="Confirm password"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </div>

                    {/* Voucher Section */}
                    <div className="grid gap-4">
                        <VoucherInput
                            onVoucherApplied={handleVoucherApplied}
                            onVoucherRemoved={handleVoucherRemoved}
                            originalPrice={coursePrice}
                            disabled={processing}
                        />
                    </div>

                    {/* Final Price Display */}
                    <div className="grid gap-4">
                        <div className="relative">
                            <div className="border-primary/50 from-primary/5 to-primary/10 rounded-lg border bg-gradient-to-r p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground text-sm font-medium">Harga:</span>
                                    <div className="text-right">
                                        {appliedVoucher && <div className="text-xs text-gray-500 line-through">Rp {formatRupiah(coursePrice)}</div>}
                                        <div className="text-primary text-lg font-bold">Rp {formatRupiah(finalPrice)}</div>
                                        {appliedVoucher && (
                                            <div className="text-xs text-green-400">Hemat Rp {formatRupiah(appliedVoucher.discount)}!</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={6} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Gabung Sekarang
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Sudah punya akun?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Masuk
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
