import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Lock, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

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

export function ProductPurchaseModal({ open, onOpenChange, product, triggerToast }: ProductPurchaseModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const { success, error } = useToast();

    if (!product) return null;

    const handlePurchase = async () => {
        setIsProcessing(true);

        const checkout = window.checkout;
        if (!checkout) {
            triggerToast('Gagal memuat gateway pembayaran. Silakan refresh halaman.', 'error');
            setIsProcessing(false);
            return;
        }

        let paymentData;
        try {
            const res = await axios.post(route('products.create-payment'), {
                product_id: product.id,
                gateway: 'duitku', // Kirim gateway yang dipilih
            });

            paymentData = res.data;

            if (!paymentData || !paymentData.reference) {
                triggerToast(res.data.message || 'Gagal mendapatkan referensi pembayaran.', 'error');
                setIsProcessing(false);
                return;
            }
        } catch (err: any) {
            triggerToast(err.response?.data?.message || err.message || 'Gagal memproses.', 'error');
            setIsProcessing(false);
            return;
        }

        // 2. JIKA DAPAT REFERENSI: Tutup modal
        onOpenChange(false);

        // 3. Panggil Duitku SETELAH modal ditutup
        setTimeout(() => {
            checkout.process(paymentData.reference, {
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
        }, 200); // 200ms delay untuk transisi modal
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/50 bg-card sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Lock className="text-primary h-6 w-6" />
                        Unlock This Product
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
                        {product.description && <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>}
                    </div>

                    <div className="bg-primary/10 border-primary/30 rounded-lg border p-4">
                        <div className="flex items-baseline justify-between">
                            <span className="text-muted-foreground text-sm">Price</span>
                            <span className="text-primary text-3xl font-bold">Rp {product.price.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handlePurchase} disabled={isProcessing} className="bg-primary hover:bg-primary/90">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {isProcessing ? 'Processing...' : 'Purchase Now'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
