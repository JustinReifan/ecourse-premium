import { DataTable } from '@/components/admin/data-table';
import { ExpandableText } from '@/components/expandable-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, ShoppingBag, BookOpen } from 'lucide-react';

interface Product {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    thumbnail: string | null;
    type: 'ecourse' | 'ebook' | 'template' | 'affiliate_link';
    order: number;
    status: 'active' | 'inactive';
    created_at: string;
    courses_count?: number;
    purchases_count?: number;
}

interface ProductsPageProps {
    products: Product[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
    const { flash } = usePage().props as any;

    const breadcrumbs = [{ title: 'Admin', href: '/admin' }, { title: 'Products' }];

    const columns = [
        {
            key: 'title' as keyof Product,
            label: 'Product Title',
            sortable: true,
            render: (value: string, product: Product) => (
                <div className="flex items-center justify-end gap-4 lg:justify-normal">
                    <div>
                        <p className="font-semibold text-white transition-colors group-hover:text-cyan-200">{value}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <ShoppingBag className="h-3 w-3 text-gray-500" />
                            <p className="font-mono text-xs text-gray-400">
                                {product.purchases_count || 0} purchases
                                {product.type === 'ecourse' && ` • ${product.courses_count || 0} courses`}
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'type' as keyof Product,
            label: 'Type',
            sortable: true,
            render: (value: string) => {
                const typeColors: Record<string, string> = {
                    ecourse: 'from-blue-500 to-cyan-500',
                    ebook: 'from-purple-500 to-pink-500',
                    template: 'from-orange-500 to-red-500',
                    affiliate_link: 'from-green-500 to-emerald-500',
                };
                return (
                    <Badge
                        className={`bg-gradient-to-r ${typeColors[value]} rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider text-white shadow-lg transition-transform duration-200 hover:scale-105`}
                    >
                        {value.replace('_', ' ')}
                    </Badge>
                );
            },
        },
        {
            key: 'price' as keyof Product,
            label: 'Price',
            sortable: true,
            render: (value: number) => (
                <span className="font-mono text-sm font-semibold text-green-400">Rp {value.toLocaleString('id-ID')}</span>
            ),
        },
        {
            key: 'status' as keyof Product,
            label: 'Status',
            sortable: true,
            render: (value: string) => (
                <Badge
                    className={` ${
                        value === 'active'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                            : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 shadow-lg shadow-gray-500/25'
                    } rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider transition-transform duration-200 hover:scale-105`}
                >
                    <div className={`mr-2 h-2 w-2 rounded-full ${value === 'active' ? 'animate-pulse bg-white' : 'bg-gray-400'}`}></div>
                    {value}
                </Badge>
            ),
        },
        {
            key: 'created_at' as keyof Product,
            label: 'Created',
            sortable: true,
            render: (value: string) => (
                <div className="flex items-center gap-2 font-mono text-sm text-gray-400">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    {new Date(value).toLocaleDateString()}
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        router.get('/admin/products/create');
    };

    const handleEdit = (product: Product) => {
        router.get(`/admin/products/${product.id}/edit`);
    };

    const handleDelete = (product: Product) => {
        if (confirm('Are you sure you want to delete this product? This will remove all associated courses.')) {
            router.delete(`/admin/products/${product.id}`);
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Management" />

            <div className="relative p-6">
                {flash.success && (
                    <Alert variant="destructive" className="mb-4 border border-blue-500/30 bg-gradient-to-r from-green-500/20 to-zinc-900">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {/* Animated background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 right-20 h-60 w-60 animate-pulse rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 h-60 w-60 animate-pulse rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl delay-1000"></div>
                </div>

                <div className="relative z-10">
                    <DataTable
                        data={products}
                        columns={columns}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        title="Product Management"
                        addButtonText="Add Product"
                        searchPlaceholder="Search products..."
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
