import { ProductPurchaseModal } from '@/components/product-purchase-modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MemberLayout from '@/layouts/member-layout';
import type { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, BookOpen, CheckCircle, Download, Lock, Package } from 'lucide-react';
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
}

export default function MemberProducts({ ownedProducts, availableProducts, selectedProduct }: ProductsPageProps) {
    const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<Product | null>(selectedProduct);
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [productToPurchase, setProductToPurchase] = useState<Product | null>(null);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    // State tambahan untuk membedakan style toast sukses dan error
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const triggerToast = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);

        // Sembunyikan toast secara otomatis setelah 4 detik
        setTimeout(() => {
            setShowToast(false);
            setToastMessage('');
        }, 4000);
    };

    useEffect(() => {
        // Load script Duitku saat komponen dimuat
        const script = document.createElement('script');
        script.src = import.meta.env.VITE_DUITKU_SCRIPT_URL;
        script.async = true;

        document.body.appendChild(script);

        // Cleanup script saat komponen unmount
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleCatalogFilter = (product: Product) => {
        // if product is affiliate_link, redirect to external_url
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
        } else if (product.type === 'ebook' || product.type === 'template') {
            // Trigger download
            window.location.href = `/api/products/${product.id}/download`;
        } else if (product.type === 'affiliate_link' && product.external_url) {
            window.open(product.external_url, '_blank');
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
            </MemberLayout>
        </>
    );
}
