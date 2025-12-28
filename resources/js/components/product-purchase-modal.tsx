import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VoucherInput } from '@/components/voucher-input'; // Pastikan path import benar
import { router } from '@inertiajs/react';
import axios from 'axios';
import { LoaderCircle, Lock, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    thumbnail: string | null;
    type: string;
}

interface ProductPurchaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    triggerToast: (message: string, type: 'success' | 'error') => void;
}

export function ProductPurchaseModal({ open, onOpenChange, product, triggerToast }: ProductPurchaseModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    // State untuk Voucher
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
    const [finalPrice, setFinalPrice] = useState(0);

    // Reset state saat modal dibuka/tutup atau produk berubah
    useEffect(() => {
        if (product) {
            setFinalPrice(product.price);
            setAppliedVoucher(null);
        }
    }, [product, open]);

    if (!product) return null;

    // Handle Voucher Applied
    const handleVoucherApplied = (voucherData: any) => {
        setAppliedVoucher(voucherData);

        setFinalPrice(voucherData.final_price);
    };

    const handleVoucherRemoved = () => {
        setAppliedVoucher(null);
        setFinalPrice(product.price);
    };

    const handlePurchase = async () => {
        setIsProcessing(true);

        const payload = {
            product_id: product.id,
            final_price: finalPrice,
            gateway: 'duitku',
            voucher_code: appliedVoucher?.voucher?.code || null,
            discount_amount: appliedVoucher?.discount || 0,
        };

        try {
            if (finalPrice <= 0) {
                triggerToast('Memproses pesanan...', 'success');

                const response = await axios.post(route('products.force-purchase'), payload);

                if (response.data.success) {
                    triggerToast('Sukses membuat pesanan! redirecting...', 'success');
                    onOpenChange(false);
                    setTimeout(() => {
                        router.visit(route('member.index'));
                    }, 1000);
                }
            } else {
                triggerToast('Membuat pembayaran...', 'success');

                const response = await axios.post(route('products.create-payment'), payload);

                // 2. JIKA DAPAT REFERENSI: Tutup modal
                onOpenChange(false);

                // 3. Panggil Duitku SETELAH modal ditutup
                if (response.data.paymentUrl) {
                    if (window.checkout && response.data.reference) {
                        window.checkout.process(response.data.reference, {
                            defaultLanguage: 'id',
                            currency: 'IDR',

                            // --- INI PERUBAHAN BESARNYA ---
                            successEvent: async (result: any) => {
                                // result berisi: { reference, merchantOrderId }
                                // 'merchantOrderId' adalah 'order_id' kita

                                triggerToast('Pembayaran berhasil! Memproses produk...', 'success');

                                try {
                                    const response = await axios.post('/api/payments/confirm-instant', {
                                        reference: result.reference,
                                        order_id: result.merchantOrderId,
                                    });

                                    // Jika back-end konfirmasi sukses
                                    if (response.data.success) {
                                        triggerToast('Produk berhasil ditambahkan! Memuat ulang...', 'success');
                                        setTimeout(() => {
                                            // Reload halaman untuk melihat produk baru
                                            router.visit(route('member.index'));
                                        }, 500);
                                    } else {
                                        triggerToast(response.data.message || 'Gagal memproses pembelian.', 'error');
                                    }
                                } catch (err: any) {
                                    triggerToast(err.response?.data?.message || err.message || 'Terjadi kesalahan.', 'error');
                                }
                            },

                            pendingEvent: (result: any) => {
                                triggerToast('Pembayaran ditutup, silakan coba lagi.', 'error');
                            },
                            errorEvent: (errorMsg: any) => {
                                triggerToast(errorMsg.message || 'Gagal memproses pembayaran.', 'error');
                            },
                            closeEvent: (result: any) => {
                                // User sengaja menutup popup, tidak perlu error
                                triggerToast('Pembayaran dibatalkan.', 'error');
                            },
                        });
                    } else {
                        // Fallback jika pakai redirect url
                        window.location.href = response.data.paymentUrl;
                    }
                }
            }
        } catch (err: any) {
            triggerToast(err.response?.data?.message || err.message || 'Gagal memproses.', 'error');
            setIsProcessing(false);
            return;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/50 bg-background/90 sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Lock className="text-primary h-6 w-6" />
                        Purchase This Product
                    </DialogTitle>
                    <DialogDescription>Purchase this product to access all its content</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {product.thumbnail && (
                        <div className="aspect-video w-full overflow-hidden rounded-lg">
                            <img src={'/storage/' + product.thumbnail} alt={product.title} className="h-full w-full object-cover" />
                        </div>
                    )}

                    <div>
                        <h3 className="text-foreground mb-2 text-xl font-semibold">{product.title}</h3>
                        {/* {product.description && <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>} */}
                    </div>

                    <div className="space-y-2">
                        <VoucherInput
                            onVoucherApplied={handleVoucherApplied}
                            onVoucherRemoved={handleVoucherRemoved}
                            originalPrice={product.price}
                            disabled={isProcessing}
                        />
                    </div>

                    {!appliedVoucher && (
                        <div className="bg-primary/10 border-primary/30 rounded-lg border p-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Price</span>
                                    <span className="text-primary text-3xl font-bold">Rp {product.price.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handlePurchase} disabled={isProcessing} className="bg-primary hover:bg-primary/90">
                        {isProcessing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                        {finalPrice == 0 ? 'Claim for Free' : 'Purchase Now'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
