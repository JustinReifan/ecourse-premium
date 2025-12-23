import { DataTable } from '@/components/admin/data-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Calendar, Download, Receipt, User2, Zap } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string | null;
    customer_age: string | null;
    referral_source: string | null;
}

interface Product {
    id: number;
    title: string;
}

interface Order {
    id: number;
    order_id: string;
    user_id: number;
    amount: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    type: 'registration' | 'product_purchase';
    payment_method: string | null;
    meta: { product?: { id: number; title: string } } | null;
    user?: User;
    created_at: string;
}

interface OrdersPageProps {
    orders: { data: Order[] };
    products: Product[];
    users: User[];
}

export default function OrdersPage({ orders, products, users }: OrdersPageProps) {
    const { flash } = usePage().props as any;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    const { data, setData, post, transform, delete: destroy, processing, errors, reset } = useForm({
        user_id: '',
        amount: '',
        status: 'pending' as 'pending' | 'completed' | 'failed' | 'refunded',
        type: 'registration' as 'registration' | 'product_purchase',
        payment_method: '',
        product_id: '',
    });

    const breadcrumbs = [{ title: 'Admin', href: '/admin' }, { title: 'Orders' }];

    const statusColors: Record<string, string> = {
        completed: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25',
        pending: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/25',
        failed: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25',
        refunded: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/25',
    };

    const columns = [
        {
            key: 'order_id' as keyof Order,
            label: 'Order',
            sortable: true,
            render: (value: string, order: Order) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-400/30">
                        <Receipt className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-foreground font-mono text-sm font-semibold">{value}</p>
                        <Badge className={order.type === 'registration' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}>
                            {order.type === 'registration' ? 'Registration' : 'Product'}
                        </Badge>
                    </div>
                </div>
            ),
        },
        {
            key: 'user' as keyof Order,
            label: 'Customer',
            render: (_: any, order: Order) => (
                <div className="flex items-center gap-2">
                    <User2 className="h-4 w-4 text-gray-400" />
                    <div>
                        <p className="text-foreground font-medium">{order.user?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-400">@{order.user?.username || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'amount' as keyof Order,
            label: 'Amount',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono font-semibold text-green-400">Rp {Number(value).toLocaleString('id-ID')}</span>
            ),
        },
        {
            key: 'status' as keyof Order,
            label: 'Status',
            sortable: true,
            render: (value: string) => (
                <Badge className={`${statusColors[value]} rounded-full px-3 py-1 font-mono text-xs uppercase`}>
                    {value}
                </Badge>
            ),
        },
        {
            key: 'created_at' as keyof Order,
            label: 'Date',
            sortable: true,
            render: (value: string) => (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    {new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        reset();
        setEditingOrder(null);
        setIsModalOpen(true);
    };

    const handleEdit = (order: Order) => {
        setData('user_id', String(order.user_id));
        setData('amount', order.amount);
        setData('status', order.status);
        setData('type', order.type || 'registration');
        setData('payment_method', order.payment_method || '');
        setData('product_id', String(order.meta?.product?.id || ''));
        setEditingOrder(order);
        setIsModalOpen(true);
    };

    const handleDelete = (order: Order) => {
        if (confirm('Are you sure you want to delete this order?')) {
            destroy(`/admin/orders/${order.id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingOrder) {
            transform((data) => ({ ...data, _method: 'put' }));
            post(`/admin/orders/${editingOrder.id}`, { onSuccess: () => { setIsModalOpen(false); reset(); } });
        } else {
            post('/admin/orders', { onSuccess: () => { setIsModalOpen(false); reset(); } });
        }
    };

    const handleExport = () => {
        window.location.href = '/admin/orders/export';
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Order Management" />
            <div className="relative p-6">
                {flash.success && (
                    <Alert variant="destructive" className="mb-4 border border-green-500/30 bg-gradient-to-r from-green-500/20 to-primary/50">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                <div className="relative z-10">
                    <DataTable
                        data={orders.data}
                        columns={columns}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        title="Order Management"
                        addButtonText="Add Order"
                        searchPlaceholder="Search orders..."
                        headerActions={
                            <Button onClick={handleExport} variant="outline" className="gap-2">
                                <Download className="h-4 w-4" /> Export CSV
                            </Button>
                        }
                    />
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-primary/10 text-foreground border-primary/20 max-h-[90vh] max-w-md overflow-y-auto border backdrop-blur-sm sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
                            <Zap className="h-6 w-6 text-cyan-400" />
                            {editingOrder ? 'Edit Order' : 'Create Order'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!editingOrder && (
                            <div className="space-y-2">
                                <Label className="font-mono text-sm uppercase text-gray-300">Customer</Label>
                                <select value={data.user_id} onChange={(e) => setData('user_id', e.target.value)} className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-white" required>
                                    <option value="">Select customer</option>
                                    {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                </select>
                                {errors.user_id && <p className="text-sm text-red-400">{errors.user_id}</p>}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-mono text-sm uppercase text-gray-300">Amount</Label>
                                <Input type="number" value={data.amount} onChange={(e) => setData('amount', e.target.value)} className="border-zinc-700/50 bg-zinc-800/50 text-white" required />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-mono text-sm uppercase text-gray-300">Status</Label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value as any)} className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-white">
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-mono text-sm uppercase text-gray-300">Type</Label>
                                <select value={data.type} onChange={(e) => setData('type', e.target.value as any)} className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-white">
                                    <option value="registration">Registration</option>
                                    <option value="product_purchase">Product Purchase</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-mono text-sm uppercase text-gray-300">Payment Method</Label>
                                <Input value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)} className="border-zinc-700/50 bg-zinc-800/50 text-white" placeholder="e.g., Duitku - VA" />
                            </div>
                        </div>

                        {data.type === 'product_purchase' && (
                            <div className="space-y-2">
                                <Label className="font-mono text-sm uppercase text-gray-300">Product</Label>
                                <select value={data.product_id} onChange={(e) => setData('product_id', e.target.value)} className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-white">
                                    <option value="">Select product</option>
                                    {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="flex gap-3 pt-6">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-zinc-600/50 text-foreground hover:bg-gray-200">Cancel</Button>
                            <Button type="submit" disabled={processing} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25">
                                {processing ? 'Processing...' : editingOrder ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
