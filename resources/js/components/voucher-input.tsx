import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { Check, LoaderCircle, Tag, X } from 'lucide-react';
import { useState } from 'react';

interface VoucherInputProps {
    onVoucherApplied: (voucherData: any) => void;
    onVoucherRemoved: () => void;
    originalPrice: number;
    disabled?: boolean;
}

export function VoucherInput({ onVoucherApplied, onVoucherRemoved, originalPrice, disabled = false }: VoucherInputProps) {
    const [voucherCode, setVoucherCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
    const [error, setError] = useState('');

    const validateVoucher = async () => {
        if (!voucherCode.trim()) return;

        setIsValidating(true);
        setError('');

        try {
            const response = await axios.post('/api/vouchers/validate', {
                code: voucherCode.trim().toUpperCase(),
            });

            const voucherData = response.data;
            setAppliedVoucher(voucherData);
            onVoucherApplied(voucherData);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to validate voucher');
        } finally {
            setIsValidating(false);
        }
    };

    const removeVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode('');
        setError('');
        onVoucherRemoved();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            validateVoucher();
        }
    };

    if (appliedVoucher) {
        return (
            <div className="space-y-4">
                <div className="relative">
                    <div className="overflow-hidden rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 p-4">
                        {/* Animated background effect */}
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-green-500/5 to-transparent opacity-50"></div>

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 ring-2 ring-green-500/30">
                                    <Check className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-bold tracking-wider text-green-400 uppercase">
                                            {appliedVoucher.voucher.code}
                                        </span>
                                        <div className="rounded-full bg-green-500/20 px-2 py-0.5 font-mono text-xs text-green-400">
                                            {appliedVoucher.voucher.type === 'percentage'
                                                ? `${appliedVoucher.voucher.value}% OFF`
                                                : `Rp ${appliedVoucher.voucher.value.toLocaleString()} OFF`}
                                        </div>
                                    </div>
                                    <p className="text-sm text-green-300">{appliedVoucher.voucher.name}</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={removeVoucher}
                                disabled={disabled}
                                className="border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Discount breakdown */}
                <div className="space-y-2 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Harga asli:</span>
                        <span className="font-mono text-white">Rp {originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-green-400">Diskon:</span>
                        <span className="font-mono text-green-400">-Rp {appliedVoucher.discount.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-zinc-700/50 pt-2">
                        <div className="flex justify-between font-bold">
                            <span className="text-white">Harga setelah diskon:</span>
                            <span className="font-mono text-lg text-white">Rp {appliedVoucher.final_price.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <div className="absolute top-1/2 left-3 -translate-y-1/2">
                        <Tag className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        onKeyPress={handleKeyPress}
                        placeholder="Kode Voucher"
                        disabled={disabled || isValidating}
                        className="border-zinc-700/50 bg-zinc-800/50 pl-10 font-mono text-sm tracking-wider uppercase focus:border-purple-400 focus:ring-purple-400/20"
                    />
                </div>
                <Button
                    type="button"
                    onClick={validateVoucher}
                    disabled={disabled || isValidating || !voucherCode.trim()}
                    className="min-w-[120px] bg-gradient-to-r from-purple-500 to-pink-500 px-6 font-medium text-white hover:from-purple-600 hover:to-pink-600"
                >
                    {isValidating ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Checking...
                        </>
                    ) : (
                        'Gunakan Voucher'
                    )}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                    <X className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
            )}

            <div className="text-center text-xs text-gray-500">Punya kode voucher? Masukkan untuk mendapatkan diskon!</div>
        </div>
    );
}
