import { ProductPurchaseModal } from '@/components/product-purchase-modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MemberLayout from '@/layouts/member-layout';
import type { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, BookOpen, CheckCircle, Download, Lock, Package, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Course {
    id: number;
    name: string;
    slug: string;
    thumbnail: string | null;
    completion_percentage?: number;
}

interface Product {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    thumbnail: string | null;
    type: 'ecourse' | 'ebook' | 'template' | 'affiliate_link';
    file_path: string | null;
    external_url: string | null;
    courses?: Course[];
}

interface ProductsPageProps extends PageProps {
    ownedProducts: Product[];
    availableProducts: Product[];
    selectedProduct: Product | null;
    duitkuScriptUrl: string;
    triggerSurvey?: boolean;
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

const REFERRAL_SOURCES = [
    { value: 'tiktok', label: 'TikTok' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'threads', label: 'Threads' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'friend', label: 'Teman/Keluarga' },
    { value: 'google', label: 'Google Search' },
    { value: 'other', label: 'Lainnya' },
];

export default function MemberProducts({ ownedProducts, availableProducts, selectedProduct, duitkuScriptUrl, triggerSurvey }: ProductsPageProps) {
    const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<Product | null>(selectedProduct);
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [productToPurchase, setProductToPurchase] = useState<Product | null>(null);
    const [surveyModalOpen, setSurveyModalOpen] = useState(false);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const surveyForm = useForm({
        customer_age: '',
        referral_source: '',
    });

    const triggerToast = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);

        setTimeout(() => {
            setShowToast(false);
            setToastMessage('');
        }, 4000);
    };

    useEffect(() => {
        // Load script Duitku saat komponen dimuat
        const existingScript = document.querySelector(`script[src="${duitkuScriptUrl}"]`);

        if (!existingScript && duitkuScriptUrl) {
            const script = document.createElement('script');
            script.src = duitkuScriptUrl;
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => console.log('Duitku script loaded');
        }
    }, [duitkuScriptUrl]);

    // Trigger survey modal for fresh registrations
    useEffect(() => {
        if (triggerSurvey) {
            setSurveyModalOpen(true);
        }
    }, [triggerSurvey]);

    const handleSurveySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        surveyForm.post('/member/survey', {
            onSuccess: () => {
                setSurveyModalOpen(false);
                triggerToast('Terima kasih telah mengisi survey!', 'success');
            },
            onError: () => {
                triggerToast('Gagal menyimpan survey. Silakan coba lagi.', 'error');
            },
        });
    };

    const handleCatalogFilter = (product: Product) => {
        if (product.type === 'affiliate_link' && product.external_url) {
            window.open(product.external_url, '_blank');
            return;
        }
        setSelectedCatalogProduct(product);
        router.get(route('member.products', { product_id: product.id }), {}, { preserveState: true });
    };

    const handleLibraryClick = () => {
        setSelectedCatalogProduct(null);
        router.get(route('member.products'), {}, { preserveState: true });
    };

    const breadcrumbs = selectedCatalogProduct
        ? [{ title: 'Products', href: route('member.products') }, { title: selectedCatalogProduct.title }]
        : [{ title: 'My Library' }];

    const handleProductClick = (product: Product) => {
        if (product.type === 'ecourse') {
            router.get(route('member.product.show', { product: product.slug }));
        } else if (product.type === 'template') {
            window.location.href = `/api/products/${product.id}/download`;
        } else if (product.type === 'affiliate_link' || (product.type === 'ebook' && product.external_url)) {
            if (product.external_url) {
                window.open(product.external_url, '_blank');
            }
        }
    };

    const handleLockedProductClick = (product: Product) => {
        setProductToPurchase(product);
        setPurchaseModalOpen(true);
    };

    const renderLockedCourse = (course: Course) => (
        <Card
            key={course.id}
            className="group border-border/50 bg-card/50 hover:border-primary/50 relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
            onClick={() => selectedCatalogProduct && handleLockedProductClick(selectedCatalogProduct)}
        >
            {/* Lock overlay */}
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-center">
                    <Lock className="text-primary mx-auto mb-2 h-12 w-12" />
                    <p className="text-sm font-medium text-white">Click to Purchase</p>
                </div>
            </div>

            <div className="from-secondary to-muted relative aspect-video overflow-hidden bg-gradient-to-br">
                {course.thumbnail ? (
                    <img src={'/storage/' + course.thumbnail} alt={course.name} className="h-full w-full object-cover opacity-30" />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <BookOpen className="text-muted-foreground h-12 w-12 opacity-30" />
                    </div>
                )}
            </div>

            <CardContent className="p-4">
                <h3 className="text-foreground line-clamp-2 font-semibold opacity-50">{course.name}</h3>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Head title="My Products" />

            <MemberLayout
                breadcrumbs={breadcrumbs}
                availableProducts={availableProducts}
                selectedProductId={selectedCatalogProduct?.id || null}
                onLibraryClick={handleLibraryClick}
                onProductClick={handleCatalogFilter}
            >
                {showToast && (
                    <div className="animate-fade-in fixed top-20 right-4 z-50 w-auto max-w-sm">
                        <Alert
                            className={
                                toastType === 'success'
                                    ? 'border-primary/50 bg-primary/10 backdrop-blur-sm'
                                    : 'border-red-500/50 bg-red-900/50 backdrop-blur-sm'
                            }
                        >
                            {toastType === 'success' ? (
                                <CheckCircle className="text-primary h-4 w-4" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                            )}
                            <AlertDescription className={toastType === 'success' ? 'text-primary font-medium' : 'font-medium text-red-300'}>
                                {toastMessage}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <div className="p-6">
                    {/* Show owned products (My Library view) */}
                    {!selectedCatalogProduct && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-foreground mb-2 text-3xl font-bold">My Library</h1>
                                <p className="text-muted-foreground">Access all your purchased products</p>
                            </div>

                            {ownedProducts.length === 0 ? (
                                <Card className="border-border/50 bg-card/30 p-12 text-center">
                                    <Package className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                                    <h3 className="text-foreground mb-2 text-xl font-semibold">No Products Yet</h3>
                                    <p className="text-muted-foreground">Explore our catalog to find products that interest you</p>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {ownedProducts.map((product) => (
                                        <Card
                                            key={product.id}
                                            className="group border-border/50 bg-card/50 hover:border-primary/50 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
                                            onClick={() => handleProductClick(product)}
                                        >
                                            <div className="from-secondary to-muted relative aspect-video overflow-hidden bg-gradient-to-br">
                                                {product.thumbnail ? (
                                                    <img
                                                        src={'/storage/' + product.thumbnail}
                                                        alt={product.title}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <BookOpen className="text-muted-foreground h-16 w-16" />
                                                    </div>
                                                )}
                                            </div>

                                            <CardContent className="p-6">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <Badge>{product.type.replace('_', ' ')}</Badge>
                                                    {(product.type === 'ebook' || product.type === 'template') && (
                                                        <Download className="text-primary h-4 w-4" />
                                                    )}
                                                </div>
                                                <h3 className="text-foreground mb-2 line-clamp-2 text-lg font-semibold">{product.title}</h3>
                                                {product.type === 'ecourse' && product.courses && (
                                                    <p className="text-muted-foreground text-sm">
                                                        {product.courses.length} Course{product.courses.length !== 1 ? 's' : ''}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Show locked product content (Catalog view) */}
                    {selectedCatalogProduct && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h1 className="text-foreground mb-2 text-3xl font-bold">{selectedCatalogProduct.title}</h1>
                                    <p className="text-muted-foreground mb-4">{selectedCatalogProduct.description}</p>
                                    <Badge variant="outline" className="text-base">
                                        Rp {selectedCatalogProduct.price.toLocaleString('id-ID')}
                                    </Badge>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={() => handleLockedProductClick(selectedCatalogProduct)}
                                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                                >
                                    <Lock className="mr-2 h-5 w-5" />
                                    Purchase Now
                                </Button>
                            </div>

                            <Card
                                className="group border-border/50 bg-card/50 hover:border-primary/50 relative mx-auto max-w-2xl cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
                                onClick={() => handleLockedProductClick(selectedCatalogProduct)}
                            >
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
                                    <div className="text-center">
                                        <Lock className="text-primary mx-auto mb-2 h-16 w-16" />
                                        <p className="text-lg font-medium text-white">Click to Purchase</p>
                                    </div>
                                </div>

                                <div className="from-secondary to-muted relative aspect-video overflow-hidden bg-gradient-to-br">
                                    {selectedCatalogProduct.thumbnail ? (
                                        <img
                                            src={'/storage/' + selectedCatalogProduct.thumbnail}
                                            alt={selectedCatalogProduct.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <BookOpen className="text-muted-foreground h-20 w-20 opacity-30" />
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-8">
                                    <h3 className="text-foreground mb-2 text-2xl font-bold opacity-50">{selectedCatalogProduct.title}</h3>
                                    <p className="text-muted-foreground opacity-50">{selectedCatalogProduct.description}</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                <ProductPurchaseModal
                    open={purchaseModalOpen}
                    onOpenChange={setPurchaseModalOpen}
                    product={productToPurchase}
                    triggerToast={triggerToast}
                />

                {/* Survey Modal */}
                <Dialog open={surveyModalOpen} onOpenChange={() => {}}>
                    <DialogContent className="bg-card/95 border-primary/20 max-w-md border backdrop-blur-xl sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
                        <DialogHeader className="text-center">
                            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                <Sparkles className="text-primary h-8 w-8" />
                            </div>
                            <DialogTitle className="text-foreground text-2xl font-bold">
                                Selamat Datang! 🎉
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-2">
                                Sebelum mulai belajar, bantu kami mengenal kamu lebih baik dengan mengisi survey singkat ini.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSurveySubmit} className="mt-6 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="customer_age" className="text-foreground font-medium">
                                    Berapa umur kamu?
                                </Label>
                                <Input
                                    id="customer_age"
                                    type="text"
                                    placeholder="Contoh: 25"
                                    value={surveyForm.data.customer_age}
                                    onChange={(e) => surveyForm.setData('customer_age', e.target.value)}
                                    className="border-border/50 bg-background/50 focus:border-primary h-12 text-lg"
                                    required
                                />
                                {surveyForm.errors.customer_age && (
                                    <p className="text-sm text-red-400">{surveyForm.errors.customer_age}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="referral_source" className="text-foreground font-medium">
                                    Dari mana kamu tau tentang kami?
                                </Label>
                                <select
                                    id="referral_source"
                                    value={surveyForm.data.referral_source}
                                    onChange={(e) => surveyForm.setData('referral_source', e.target.value)}
                                    className="border-border/50 bg-background/50 focus:border-primary text-foreground h-12 w-full rounded-lg border px-4 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                                    required
                                >
                                    <option value="">Pilih sumber...</option>
                                    {REFERRAL_SOURCES.map((source) => (
                                        <option key={source.value} value={source.value}>
                                            {source.label}
                                        </option>
                                    ))}
                                </select>
                                {surveyForm.errors.referral_source && (
                                    <p className="text-sm text-red-400">{surveyForm.errors.referral_source}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={surveyForm.processing}
                                className="bg-primary hover:bg-primary/90 h-12 w-full text-lg font-semibold text-white shadow-lg transition-all duration-300"
                            >
                                {surveyForm.processing ? 'Menyimpan...' : 'Mulai Belajar 🚀'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </MemberLayout>
        </>
    );
}
