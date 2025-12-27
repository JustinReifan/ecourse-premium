import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VoucherInput } from '@/components/voucher-input';
import { useAnalytics } from '@/hooks/use-analytics';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Calendar, CheckCircle, Infinity, LoaderCircle } from 'lucide-react';
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

type SubscriptionPlan = 'lifetime' | 'yearly';

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
    coursePriceYearly: number;
    enableYearlyPlan: boolean;
    subscriptionPlan: SubscriptionPlan;
    duitkuScriptUrl: string;
}

export default function Register({ 
    coursePrice, 
    coursePriceYearly = 0, 
    enableYearlyPlan = false,
    subscriptionPlan = 'lifetime',
    duitkuScriptUrl 
}: RegisterProps) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
    const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(subscriptionPlan);
    
    // Calculate base price based on plan
    const basePrice = currentPlan === 'yearly' ? coursePriceYearly : coursePrice;
    const [finalPrice, setFinalPrice] = useState(basePrice);
    
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

    // Update final price when plan changes
    useEffect(() => {
        const newBasePrice = currentPlan === 'yearly' ? coursePriceYearly : coursePrice;
        if (appliedVoucher) {
            // Recalculate voucher discount with new base price
            const discountPercent = appliedVoucher.voucher?.type === 'percentage' 
                ? appliedVoucher.voucher?.value || 0 
                : 0;
            const fixedDiscount = appliedVoucher.voucher?.type === 'fixed' 
                ? appliedVoucher.voucher?.value || 0 
                : 0;
            
            let discountAmount = 0;
            if (appliedVoucher.voucher?.type === 'percentage') {
                discountAmount = Math.floor((newBasePrice * discountPercent) / 100);
                // Apply max discount cap if set
                if (appliedVoucher.voucher?.max_discount_amount && discountAmount > appliedVoucher.voucher.max_discount_amount) {
                    discountAmount = appliedVoucher.voucher.max_discount_amount;
                }
            } else {
                discountAmount = fixedDiscount;
            }
            
            // Update appliedVoucher with recalculated values
            setAppliedVoucher({
                ...appliedVoucher,
                discount: discountAmount,
                final_price: Math.max(0, newBasePrice - discountAmount),
                original_price: newBasePrice,
            });
            setFinalPrice(Math.max(0, newBasePrice - discountAmount));
        } else {
            setFinalPrice(newBasePrice);
        }
    }, [currentPlan, coursePrice, coursePriceYearly]);

    useEffect(() => {
        // Dynamically load Duitku script
        const script = document.createElement('script');
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
        setFinalPrice(basePrice);
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
                subscription_plan: currentPlan,
            };

            // check if price = 0, bypass payment
            if (finalPrice === 0) {
                const response = await axios.post(route('register.force'), registrationData);

                if (response.data.success) {
                    window.location.href = route('member.index');
                    return;
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
                            original_amount: basePrice,
                            discount_amount: appliedVoucher?.discount || 0,
                            voucher_code: appliedVoucher?.voucher?.code || null,
                            subscription_plan: currentPlan,
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
                console.error('Duitku checkout script not loaded.');
                setToastMessage('Gagal memuat gateway pembayaran. Coba refresh halaman.');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
            } else {
                console.error('Invalid response type from server:', res.data.type);
                setToastMessage('Respon server tidak valid. Hubungi admin.');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
            }
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.errors) {
                const validationErrors = err.response.data.errors;

                Object.keys(validationErrors).forEach((field) => {
                    if (field in data) {
                        setError(field as keyof RegisterForm, validationErrors[field][0]);
                    }
                });
            } else {
                const message = err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.';
                setToastMessage(message);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
                console.error(err);
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
                    {/* Plan Selection - Only show if yearly plan is enabled */}
                    {enableYearlyPlan && (
                        <div className="grid gap-2">
                            <Label>Pilih Paket Akses</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPlan('yearly')}
                                    className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                                        currentPlan === 'yearly'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-primary h-4 w-4" />
                                        <span className="font-medium">1 Tahun</span>
                                    </div>
                                    <div className="text-primary mt-1 text-lg font-bold">Rp {formatRupiah(coursePriceYearly)}</div>
                                    <div className="text-muted-foreground text-xs">Akses 1 tahun penuh</div>
                                    {currentPlan === 'yearly' && (
                                        <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white">Dipilih</Badge>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPlan('lifetime')}
                                    className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                                        currentPlan === 'lifetime'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Infinity className="text-primary h-4 w-4" />
                                        <span className="font-medium">Lifetime</span>
                                    </div>
                                    <div className="text-primary mt-1 text-lg font-bold">Rp {formatRupiah(coursePrice)}</div>
                                    <div className="text-muted-foreground text-xs">Akses selamanya</div>
                                    {currentPlan === 'lifetime' && (
                                        <Badge className="absolute -top-2 -right-2">Dipilih</Badge>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

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
                            originalPrice={basePrice}
                            disabled={processing}
                        />
                    </div>

                    {/* Final Price Display */}
                    <div className="grid gap-4">
                        <div className="relative">
                            <div className="border-primary/50 from-primary/5 to-primary/10 rounded-lg border bg-gradient-to-r p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium text-gray-300">Total Pembayaran:</span>
                                        {enableYearlyPlan && (
                                            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                                                {currentPlan === 'yearly' ? (
                                                    <>
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Akses 1 Tahun</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Infinity className="h-3 w-3" />
                                                        <span>Lifetime Access</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {appliedVoucher && <div className="text-xs text-gray-500 line-through">Rp {formatRupiah(basePrice)}</div>}
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
