import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin' }, { title: 'Affiliates' }];

interface Affiliate {
    id: number;
    aff_key: string;
    name?: string;
    email?: string;
    status: string;
    balance: number;
    pending_balance: number;
    clicks_count: number;
    conversions_count: number;
    created_at: string;
}

interface Props {
    affiliates: {
        data: Affiliate[];
        links: any;
        meta: any;
    };
    filters: {
        status?: string;
        search?: string;
    };
}

export default function AffiliatesIndex({ affiliates, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get('/admin/affiliates', { search, status }, { preserveState: true, preserveScroll: true });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Affiliates Management" />

            <div className="space-y-6">
                <div className="px-6 py-8">
                    <div>
                        <h1 className="text-foreground text-3xl font-bold">Affiliates</h1>
                        <p className="text-muted-foreground mt-2">Manage affiliate partners</p>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Input
                                    placeholder="Search by name, email, or key..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="max-w-sm"
                                />
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="banned">Banned</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleFilter}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Affiliates Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b">
                                        <tr className="text-left">
                                            <th className="p-4">Affiliate</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Clicks</th>
                                            <th className="p-4">Conversions</th>
                                            <th className="p-4">Available</th>
                                            <th className="p-4">Pending</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {affiliates.data.map((affiliate) => (
                                            <tr key={affiliate.id} className="hover:bg-accent border-b">
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium">{affiliate.name || 'No name'}</p>
                                                        <p className="text-muted-foreground text-sm">{affiliate.aff_key}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={affiliate.status === 'active' ? 'default' : 'secondary'}>
                                                        {affiliate.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">{affiliate.clicks_count}</td>
                                                <td className="p-4">{affiliate.conversions_count}</td>
                                                <td className="p-4">{formatCurrency(affiliate.balance)}</td>
                                                <td className="p-4">{formatCurrency(affiliate.pending_balance)}</td>
                                                <td className="p-4">
                                                    <Link href={`/admin/affiliates/${affiliate.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
