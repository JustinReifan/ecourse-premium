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
import { CheckCircle, Eye, EyeOff, LoaderCircle } from 'lucide-react';
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
    registrationType?: 'standard' | 'lead_magnet';
    minLeadMagnetPrice?: number;
}

export default function Register({ coursePrice, duitkuScriptUrl, registrationType = 'standard', minLeadMagnetPrice = 10000 }: RegisterProps) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
    const [finalPrice, setFinalPrice] = useState(coursePrice);
    const [customAmount, setCustomAmount] = useState<number>(minLeadMagnetPrice);
    const { trackEngagement, trackConversion, trackPayment } = useAnalytics();
    const [isSendingNotif, setIsSendingNotif] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState('duitku');

    const isLeadMagnet = registrationType === 'lead_magnet';

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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        // For lead magnet, validate minimum amount
        if (isLeadMagnet && customAmount < minLeadMagnetPrice) {
            setToastMessage(`Minimal pembayaran adalah Rp ${formatRupiah(minLeadMagnetPrice)}`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
            return;
        }

        let paymentData;

        // Determine the final price to use
        const priceToCharge = isLeadMagnet ? customAmount : finalPrice;

        try {
            // 1. Minta Snap Token + validasi form
            const registrationData = {
                ...data,
                register: true,
                gateway: selectedGateway,
                final_price: priceToCharge,
                voucher_code: appliedVoucher?.voucher?.code || null,
                discount_amount: appliedVoucher?.discount || 0,
                registration_type: registrationType,
                payment_amount: isLeadMagnet ? customAmount : null,
            };

            // check if price = 0, bypass payment
            if (priceToCharge === 0) {
                setToastMessage('Memproses akun...');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);

                const response = await axios.post(route('register.force'), registrationData);

                if (response.data.success) {
                    setToastMessage('Sukses membuat akun! Redirecting...');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 4000);

                    window.location.href = route('member.index');
                } else {
                    setToastMessage(response.data.message || 'Gagal memproses akun.');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 4000);
                }
                return;
            }

            setToastMessage('Memproses pembayaran...');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);

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
                    },
                    errorEvent: function (error: any) {
                        setToastMessage('Payment failed, please try again.');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 4000);
                    },
                    closeEvent: function (result: any) {
                        setToastMessage('Payment canceled');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 4000);
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
                            <Label htmlFor="username">
                                Username <span className="text-muted-foreground ml-1 text-[11px] font-normal">(Tanpa spasi & simbol)</span>
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="username"
                                value={data.username}
                                onChange={(e) => {
                                    let val = e.target.value;

                                    // 1. Ubah ke huruf kecil semua (opsional, tapi disarankan)
                                    val = val.toLowerCase();

                                    // 2. Hapus Spasi & Simbol (Hanya terima a-z dan 0-9)
                                    // Regex ini berarti: Ganti karakter APAPUN yang BUKAN huruf kecil/angka dengan string kosong
                                    val = val.replace(/[^a-z0-9]/g, '');

                                    setData('username', val);
                                }}
                                // --------------------------
                                onFocus={() => handleFieldFocus('username')}
                                onBlur={() => handleFieldBlur('username')}
                                disabled={processing}
                                placeholder="contoh: sariputri88"
                            />

                            {/* Helper Text untuk memperjelas */}
                            {/* <p className="text-muted-foreground -mt-2 text-[11px]">*Hanya huruf dan angka, disambung</p> */}

                            <InputError message={errors.username} className="mt-2" />
                        </div>
                        <div className="grid gap-4">
                            <Label htmlFor="name">
                                Name <span className="text-muted-foreground ml-1 text-[11px] font-normal">(Nama lengkap, boleh spasi)</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                tabIndex={1}
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                onFocus={() => handleFieldFocus('name')}
                                onBlur={() => handleFieldBlur('name')}
                                disabled={processing}
                                placeholder="Nama lengkap anda"
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
                            placeholder="nama@gmail.com"
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
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
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
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>
                        <div className="grid gap-4">
                            <Label htmlFor="password_confirmation">Confirm password</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    onFocus={() => handleFieldFocus('password_confirmation')}
                                    onBlur={() => handleFieldBlur('password_confirmation')}
                                    disabled={processing}
                                    placeholder="Konfirmasi password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </div>

                    {/* Voucher Section - Only show for standard registration */}
                    {!isLeadMagnet && (
                        <div className="grid gap-4">
                            <VoucherInput
                                onVoucherApplied={handleVoucherApplied}
                                onVoucherRemoved={handleVoucherRemoved}
                                originalPrice={coursePrice}
                                disabled={processing}
                            />
                        </div>
                    )}

                    {/* PWYW Input - Only show for lead magnet */}
                    {isLeadMagnet && (
                        <div className="grid gap-4">
                            <Label htmlFor="custom_amount">Nominal Pembayaran (Pay What You Want)</Label>
                            <div className="relative">
                                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">Rp</span>
                                <Input
                                    id="custom_amount"
                                    type="number"
                                    min={minLeadMagnetPrice}
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(Math.max(0, parseInt(e.target.value) || 0))}
                                    disabled={processing}
                                    className="pl-10"
                                    placeholder={`Minimal ${formatRupiah(minLeadMagnetPrice)}`}
                                />
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Minimal pembayaran: Rp {formatRupiah(minLeadMagnetPrice)}
                            </p>
                        </div>
                    )}

                    {/* Final Price Display */}
                    <div className="grid gap-4">
                        <div className="relative">
                            <div className="border-primary/50 from-primary/5 to-primary/10 rounded-lg border bg-gradient-to-r p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-foreground text-sm font-medium">
                                        {isLeadMagnet ? 'Total Pembayaran:' : 'Harga:'}
                                    </span>
                                    <div className="text-right">
                                        {!isLeadMagnet && appliedVoucher && (
                                            <div className="text-xs text-gray-500 line-through">Rp {formatRupiah(coursePrice)}</div>
                                        )}
                                        <div className="text-primary text-lg font-bold">
                                            Rp {formatRupiah(isLeadMagnet ? customAmount : finalPrice)}
                                        </div>
                                        {!isLeadMagnet && appliedVoucher && (
                                            <div className="text-xs text-green-400">Hemat Rp {formatRupiah(appliedVoucher.discount)}!</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={6} disabled={processing}>
                        {processing ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Memproses Pembayaran...
                            </>
                        ) : (
                            'Gabung Sekarang'
                        )}
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
