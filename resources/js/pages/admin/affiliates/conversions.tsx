import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { Check, Download, X } from 'lucide-react';
import { useState } from 'react';

interface Conversion {
    id: number;
    order_id: string;
    order_amount: number;
    commission_amount: number;
    status: string;
    created_at: string;
    affiliate: {
        id: number;
        aff_key: string;
        name?: string;
    };
    user: {
        name: string;
        email: string;
    };
    product?: {
        id: number;
        title: string;
    };
}

interface Props {
    conversions: {
        data: Conversion[];
        links: any;
        meta: any;
    };
    filters: {
        status?: string;
    };
}

export default function AffiliateConversions({ conversions, filters }: Props) {
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get('/admin/affiliates/conversions/list', { status }, { preserveState: true, preserveScroll: true });
    };

    const handleApprove = (id: number) => {
        if (confirm('Approve this conversion?')) {
            router.post(`/admin/affiliates/conversions/${id}/approve`);
        }
    };

    const handleReject = (id: number) => {
        if (confirm('Reject this conversion? This will deduct from affiliate pending balance.')) {
            router.post(`/admin/affiliates/conversions/${id}/reject`);
        }
    };

    const handleExport = () => {
        window.location.href = route('admin.affiliates.conversions.export', { status });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
            paid: 'outline',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <AdminLayout>
            <Head title="Affiliate Conversions" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-foreground text-3xl font-bold">Conversions</h1>
                        <p className="text-muted-foreground mt-2">Manage affiliate conversions</p>
                    </div>
                    <Button onClick={handleExport} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleFilter}>Apply Filter</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Conversions Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="p-4">Order ID</th>
                                        <th className="p-4">Affiliate</th>
                                        <th className="p-4">Buyer</th>
                                        <th className="p-4">Product</th>
                                        <th className="p-4">Order Amount</th>
                                        <th className="p-4">Commission</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conversions.data.map((conversion) => (
                                        <tr key={conversion.id} className="hover:bg-accent border-b">
                                            <td className="p-4 font-mono text-sm">{conversion.order_id}</td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{conversion.affiliate.name || 'No name'}</p>
                                                    <p className="text-muted-foreground text-sm">{conversion.affiliate.aff_key}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{conversion.user?.name || 'No name'}</p>
                                                    <p className="text-muted-foreground text-sm">{conversion.user?.email || 'No email'}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm">{conversion.product ? conversion.product.title : 'Initial Registration'}</p>
                                            </td>
                                            <td className="p-4">{formatCurrency(conversion.order_amount)}</td>
                                            <td className="p-4 font-semibold">{formatCurrency(conversion.commission_amount)}</td>
                                            <td className="p-4">{getStatusBadge(conversion.status)}</td>
                                            <td className="text-muted-foreground p-4 text-sm">
                                                {new Date(conversion.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                {conversion.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="default" onClick={() => handleApprove(conversion.id)}>
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleReject(conversion.id)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
