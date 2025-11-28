import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock, Copy, DollarSign, Megaphone, MousePointerClick } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Stats {
    total_clicks: number;
    total_conversions: number;
    pending_conversions: number;
    conversion_rate: number;
    pending_balance: number;
    available_balance: number;
    total_earnings: number;
}

interface Conversion {
    id: number;
    order_id: string;
    order_amount: number;
    commission_amount: number;
    status: string;
    created_at: string;
    user?: { name: string; email: string };
    product?: { id: number; title: string };
}

interface LedgerEntry {
    id: number;
    type: 'credit' | 'debit';
    amount: number;
    balance_after: number;
    reference_type: string;
    note: string;
    created_at: string;
}

interface Payout {
    id: number;
    amount: number;
    status: string;
    payout_method: any;
    tx_reference?: string;
    created_at: string;
}

interface Campaign {
    id: number;
    name: string;
    description?: string;
    commission_value: { percent: number };
    starts_at?: string;
    ends_at?: string;
}

interface PayoutMethod {
    id: number;
    name: string;
    type: string;
}

interface Props {
    affiliate: any;
    stats: Stats;
    conversions: Conversion[];
    ledger: LedgerEntry[];
    payouts: Payout[];
    shareLink: string;
    activeCampaigns: Campaign[];
    minimumPayouts: number;
}

export default function AffiliateDashboard({ affiliate, stats, conversions, ledger, payouts, shareLink, activeCampaigns, minimumPayouts }: Props) {
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutMethodId, setPayoutMethodId] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [showPayoutForm, setShowPayoutForm] = useState(false);
    const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
    const { success, error } = useToast();

    useEffect(() => {
        fetch('/api/payout-methods/active')
            .then((res) => res.json())
            .then((data) => setPayoutMethods(data.payoutMethods))
            .catch(() => error('Failed to load payout methods'));
    }, []);

    const copyShareLink = () => {
        navigator.clipboard.writeText(shareLink);
        success('Affiliate link copied to clipboard');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    const handlePayoutRequest = () => {
        router.post(
            '/affiliate/payout',
            {
                amount: parseFloat(payoutAmount),
                payout_method_id: payoutMethodId,
                account_name: accountName,
                account_number: accountNumber,
            },
            {
                onSuccess: () => {
                    success('Payout request submitted');
                    setShowPayoutForm(false);
                    setPayoutAmount('');
                    setPayoutMethodId('');
                    setAccountName('');
                    setAccountNumber('');
                },
                onError: (errors) => {
                    error(errors.error || 'Failed to request payout');
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Affiliate Dashboard" />

            <div className="container mx-auto space-y-8 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-foreground text-3xl font-bold">Affiliate Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Track your performance and earnings</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                            <MousePointerClick className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_clicks}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                            <CheckCircle2 className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_conversions}</div>
                            <p className="text-muted-foreground text-xs">{stats.conversion_rate.toFixed(2)}% conversion rate</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                            <DollarSign className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.available_balance)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.pending_balance)}</div>
                            <p className="text-muted-foreground text-xs">{stats.pending_conversions} conversions pending</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Share Link */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Affiliate Link</CardTitle>
                        <CardDescription>Share this link to earn commissions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input value={shareLink} readOnly className="flex-1" />
                            <Button onClick={copyShareLink} variant="outline">
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Campaigns */}
                {activeCampaigns.length > 0 && (
                    <Card className="border-primary/50 bg-primary/5">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Megaphone className="text-primary h-5 w-5" />
                                <CardTitle>Active Campaigns</CardTitle>
                            </div>
                            <CardDescription>Special commission opportunities available now!</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {activeCampaigns.map((campaign) => (
                                <div key={campaign.id} className="bg-card rounded-lg border p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold">{campaign.name}</h4>
                                            <p className="text-muted-foreground mt-1 text-sm">{campaign.description}</p>
                                        </div>
                                        <Badge className="bg-primary text-primary-foreground">{campaign.commission_value.percent}% Commission</Badge>
                                    </div>
                                    {campaign.ends_at && (
                                        <p className="text-muted-foreground mt-2 text-xs">Ends: {new Date(campaign.ends_at).toLocaleDateString()}</p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Payout Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Request Payout</CardTitle>
                        <CardDescription>Minimum payout: {formatCurrency(minimumPayouts)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!showPayoutForm ? (
                            <Button onClick={() => setShowPayoutForm(true)} disabled={stats.available_balance < minimumPayouts}>
                                Request Payout
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        value={payoutAmount}
                                        onChange={(e) => setPayoutAmount(e.target.value)}
                                        max={stats.available_balance}
                                        placeholder="Enter amount"
                                    />
                                </div>

                                <div>
                                    <Label>Payout Method</Label>
                                    <Select value={payoutMethodId} onValueChange={setPayoutMethodId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {payoutMethods.map((method) => (
                                                <SelectItem key={method.id} value={method.id.toString()}>
                                                    {method.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Account Name</Label>
                                    <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Your account name" />
                                </div>

                                <div>
                                    <Label>Account Number</Label>
                                    <Input
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder="Your account number"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handlePayoutRequest}>Submit Request</Button>
                                    <Button variant="outline" onClick={() => setShowPayoutForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Conversions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Conversions</CardTitle>
                        <CardDescription>Your latest affiliate earnings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {conversions.length === 0 ? (
                                <p className="text-muted-foreground py-8 text-center">No conversions yet</p>
                            ) : (
                                conversions.map((conversion) => (
                                    <div key={conversion.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">Order #{conversion.order_id}</p>
                                            <p className="text-muted-foreground text-sm">
                                                {conversion.product ? conversion.product.title : 'Initial Registration'}
                                            </p>
                                            <p className="text-muted-foreground text-xs">{new Date(conversion.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-primary font-bold">{formatCurrency(conversion.commission_amount)}</p>
                                            <Badge variant={conversion.status === 'approved' ? 'default' : 'secondary'}>{conversion.status}</Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Payout History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payout History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {payouts.length === 0 ? (
                                <p className="text-muted-foreground py-8 text-center">No payouts yet</p>
                            ) : (
                                payouts.map((payout) => (
                                    <div key={payout.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">{formatCurrency(payout.amount)}</p>
                                            <p className="text-muted-foreground text-sm">{new Date(payout.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant={payout.status === 'paid' ? 'default' : 'secondary'}>{payout.status}</Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
