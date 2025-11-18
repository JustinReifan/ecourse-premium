import { DataTable } from '@/components/admin/data-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { type Voucher } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Calendar, Percent, Tag, Ticket, Zap } from 'lucide-react';
import { useState } from 'react';

interface VouchersPageProps {
    vouchers: Voucher[];
}

export default function VouchersPage({ vouchers }: VouchersPageProps) {
    const { flash } = usePage().props as any;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

    const {
        data,
        setData,
        post,
        transform,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        name: '',
        code: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: 0,
        max_discount_amount: '',
        usage_limit: 1,
        expires_at: '',
        status: 'active' as 'active' | 'inactive',
    });

    const breadcrumbs = [{ title: 'Admin', href: '/admin' }, { title: 'Vouchers' }];

    const columns = [
        {
            key: 'name' as keyof Voucher,
            label: 'Voucher Name',
            sortable: true,
            render: (value: string, voucher: Voucher) => (
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-800 to-purple-900 ring-1 ring-purple-700">
                            <Ticket className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                    </div>
                    <div>
                        <p className="font-semibold text-white transition-colors group-hover:text-purple-200">{value}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <Tag className="h-3 w-3 text-gray-500" />
                            <p className="font-mono text-xs text-gray-400 uppercase">{voucher.code}</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'type' as keyof Voucher,
            label: 'Type & Value',
            render: (_: any, voucher: Voucher) => (
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1 ring-1 ring-cyan-400/30">
                        <Percent className="h-3 w-3 text-cyan-400" />
                        <span className="font-mono text-xs font-bold text-cyan-400">
                            {voucher.type === 'percentage' ? `${voucher.value}%` : `Rp ${voucher.value.toLocaleString()}`}
                        </span>
                    </div>
                    {voucher.max_discount_amount && (
                        <div className="font-mono text-xs text-gray-400">
                            Max: Rp {voucher.max_discount_amount.toLocaleString()}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'usage_limit' as keyof Voucher,
            label: 'Usage',
            render: (_: any, voucher: Voucher) => (
                <div className="flex items-center gap-2">
                    <div className="text-center">
                        <div className="font-mono text-sm font-bold text-white">
                            {voucher.used_count}/{voucher.usage_limit}
                        </div>
                        <div className="mt-1 h-2 w-16 rounded-full bg-zinc-700">
                            <div
                                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all"
                                style={{ width: `${(voucher.used_count / voucher.usage_limit) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'status' as keyof Voucher,
            label: 'Status',
            sortable: true,
            render: (value: string, voucher: Voucher) => {
                const isExpired = voucher.expires_at && new Date(voucher.expires_at) < new Date();
                const isUsedUp = voucher.used_count >= voucher.usage_limit;
                const actualStatus = isExpired || isUsedUp ? 'expired' : value;
                
                return (
                    <Badge
                        className={`${
                            actualStatus === 'active'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                                : actualStatus === 'expired'
                                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25'
                                : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 shadow-lg shadow-gray-500/25'
                        } rounded-full px-3 py-1 font-mono text-xs tracking-wider uppercase transition-transform duration-200 hover:scale-105`}
                    >
                        <div className={`mr-2 h-2 w-2 rounded-full ${
                            actualStatus === 'active' ? 'animate-pulse bg-white' : 
                            actualStatus === 'expired' ? 'bg-red-200' :
                            'bg-gray-400'
                        }`}></div>
                        {actualStatus}
                    </Badge>
                );
            },
        },
        {
            key: 'expires_at' as keyof Voucher,
            label: 'Expires',
            sortable: true,
            render: (value: string) => (
                <div className="flex items-center gap-2 font-mono text-sm text-gray-400">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    {value ? new Date(value).toLocaleDateString() : 'Never'}
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        reset();
        setEditingVoucher(null);
        setIsModalOpen(true);
    };

    const handleEdit = (voucher: Voucher) => {
        setData({
            name: voucher.name,
            code: voucher.code,
            type: voucher.type,
            value: voucher.value,
            max_discount_amount: voucher.max_discount_amount?.toString() || '',
            usage_limit: voucher.usage_limit,
            expires_at: voucher.expires_at ? new Date(voucher.expires_at).toISOString().split('T')[0] : '',
            status: voucher.status,
        });
        setEditingVoucher(voucher);
        setIsModalOpen(true);
    };

    const handleDelete = (voucher: Voucher) => {
        if (confirm('Are you sure you want to delete this voucher?')) {
            destroy(`/admin/vouchers/${voucher.id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            ...data,
            max_discount_amount: data.max_discount_amount || null,
            expires_at: data.expires_at || null,
        };

        if (editingVoucher) {
            transform(() => ({
                ...formData,
                _method: 'put',
            }));

            post(`/admin/vouchers/${editingVoucher.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/vouchers', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Voucher Management" />

            <div className="relative p-6">
                {flash.success && (
                    <Alert variant="destructive" className="mb-4 border border-green-500/30 bg-gradient-to-r from-green-500/20 to-zinc-900">
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
                        data={vouchers}
                        columns={columns}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        title="Voucher Management"
                        addButtonText="Add Voucher"
                        searchPlaceholder="Search vouchers..."
                    />
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md border border-zinc-700/50 bg-gradient-to-br from-zinc-900/95 via-zinc-800/50 to-zinc-900/95 text-white backdrop-blur-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
                            <Zap className="h-6 w-6 text-purple-400" />
                            {editingVoucher ? 'Modify Voucher' : 'Create Voucher'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                    Voucher Name
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-purple-400/20"
                                    placeholder="Enter voucher name"
                                />
                                {errors.name && <p className="mt-1 font-mono text-sm text-red-400">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                    Voucher Code
                                </Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-purple-400/20"
                                    placeholder="SUMMER2024"
                                />
                                {errors.code && <p className="mt-1 font-mono text-sm text-red-400">{errors.code}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                    Discount Type
                                </Label>
                                <select
                                    id="type"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value as 'percentage' | 'fixed')}
                                    className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-white backdrop-blur-sm focus:border-purple-400 focus:outline-none"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (Rp)</option>
                                </select>
                                {errors.type && <p className="mt-1 font-mono text-sm text-red-400">{errors.type}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="value" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                    {data.type === 'percentage' ? 'Percentage (%)' : 'Amount (Rp)'}
                                </Label>
                                <Input
                                    id="value"
                                    type="number"
                                    min="0"
                                    step={data.type === 'percentage' ? '1' : '1000'}
                                    max={data.type === 'percentage' ? '100' : undefined}
                                    value={data.value}
                                    onChange={(e) => setData('value', parseFloat(e.target.value) || 0)}
                                    className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-purple-400/20"
                                    placeholder={data.type === 'percentage' ? '10' : '50000'}
                                />
                                {errors.value && <p className="mt-1 font-mono text-sm text-red-400">{errors.value}</p>}
                            </div>
                        </div>

                        {data.type === 'percentage' && (
                            <div className="space-y-2">
                                <Label htmlFor="max_discount_amount" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                    Max Discount Amount (Rp) - Optional
                                </Label>
                                <Input
                                    id="max_discount_amount"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={data.max_discount_amount}
                                    onChange={(e) => setData('max_discount_amount', e.target.value)}
                                    className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-purple-400/20"
                                    placeholder="100000"
                                />
                                {errors.max_discount_amount && <p className="mt-1 font-mono text-sm text-red-400">{errors.max_discount_amount}</p>}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="usage_limit" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                    Usage Limit
                                </Label>
                                <Input
                                    id="usage_limit"
                                    type="number"
                                    min="1"
                                    value={data.usage_limit}
                                    onChange={(e) => setData('usage_limit', parseInt(e.target.value) || 1)}
                                    className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-purple-400/20"
                                    placeholder="100"
                                />
                                {errors.usage_limit && <p className="mt-1 font-mono text-sm text-red-400">{errors.usage_limit}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expires_at" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                    Expires At - Optional
                                </Label>
                                <Input
                                    id="expires_at"
                                    type="date"
                                    value={data.expires_at}
                                    onChange={(e) => setData('expires_at', e.target.value)}
                                    className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-purple-400 focus:ring-purple-400/20"
                                />
                                {errors.expires_at && <p className="mt-1 font-mono text-sm text-red-400">{errors.expires_at}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Status
                            </Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-white backdrop-blur-sm focus:border-purple-400 focus:outline-none"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            {errors.status && <p className="mt-1 font-mono text-sm text-red-400">{errors.status}</p>}
                        </div>

                        <div className="flex gap-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 border-zinc-600/50 text-white backdrop-blur-sm hover:bg-zinc-700/50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 font-medium text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:shadow-purple-500/40"
                            >
                                {processing ? 'Processing...' : editingVoucher ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}