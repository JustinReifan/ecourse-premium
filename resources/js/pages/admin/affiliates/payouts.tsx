import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

interface Payout {
    id: number;
    amount: number;
    status: string;
    payout_method: any;
    tx_reference?: string;
    created_at: string;
    affiliate: {
        id: number;
        aff_key: string;
        name?: string;
        email?: string;
    };
}

interface Props {
    payouts: {
        data: Payout[];
        links: any;
        meta: any;
    };
    filters: {
        status?: string;
    };
}

export default function AffiliatePayouts({ payouts, filters }: Props) {
    const [status, setStatus] = useState(filters.status || '');
    const [processingPayout, setProcessingPayout] = useState<Payout | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        tx_reference: '',
    });

    const handleFilter = () => {
        router.get('/admin/affiliates/payouts', { status }, { preserveState: true, preserveScroll: true });
    };

    const handleProcess = (payout: Payout) => {
        setProcessingPayout(payout);
    };

    const handleReject = (id: number) => {
        if (confirm('Reject this payout? Amount will be returned to affiliate balance.')) {
            router.post(`/admin/affiliates/payouts/${id}/reject`);
        }
    };

    const submitProcess = () => {
        if (!processingPayout) return;

        post(route('admin.affiliates.payouts.process', processingPayout.id), {
            onSuccess: () => {
                setProcessingPayout(null);
                reset();
            },
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            requested: 'secondary',
            processing: 'default',
            paid: 'outline',
            rejected: 'destructive',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <AdminLayout>
            <Head title="Affiliate Payouts" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-foreground text-3xl font-bold">Payouts</h1>
                    <p className="text-muted-foreground mt-2">Process affiliate payout requests</p>
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
                                    <SelectItem value="requested">Requested</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleFilter}>Apply Filter</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Payouts Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="p-4">Affiliate</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Method</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">TX Ref</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.data.map((payout) => (
                                        <tr key={payout.id} className="hover:bg-accent border-b">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{payout.affiliate.name || 'No name'}</p>
                                                    <p className="text-muted-foreground text-sm">{payout.affiliate.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 font-semibold">{formatCurrency(payout.amount)}</td>
                                            <td className="p-4">
                                                {payout.payout_method?.method_name || 'N/A'}
                                                <br />
                                                <span className="text-muted-foreground text-sm">{payout.payout_method?.account_number || ''}</span>
                                            </td>
                                            <td className="p-4">{getStatusBadge(payout.status)}</td>
                                            <td className="text-muted-foreground p-4 text-sm">{new Date(payout.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 font-mono text-sm">{payout.tx_reference || '-'}</td>
                                            <td className="p-4">
                                                {payout.status === 'requested' && (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="default" onClick={() => handleProcess(payout)}>
                                                            <Check className="mr-2 h-4 w-4" />
                                                            Process
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleReject(payout.id)}>
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

            {/* Process Payout Dialog */}
            <Dialog open={!!processingPayout} onOpenChange={() => setProcessingPayout(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Payout</DialogTitle>
                        <DialogDescription>Mark this payout as paid and provide transaction reference</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Amount</Label>
                            <p className="text-2xl font-bold">{processingPayout && formatCurrency(processingPayout.amount)}</p>
                        </div>
                        <div>
                            <Label htmlFor="tx_reference">Transaction Reference</Label>
                            <Input
                                id="tx_reference"
                                value={data.tx_reference}
                                onChange={(e) => setData('tx_reference', e.target.value)}
                                placeholder="Enter bank transfer reference or transaction ID"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProcessingPayout(null)}>
                            Cancel
                        </Button>
                        <Button onClick={submitProcess} disabled={processing || !data.tx_reference}>
                            Mark as Paid
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
