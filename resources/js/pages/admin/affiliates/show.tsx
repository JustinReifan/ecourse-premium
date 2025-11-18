import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

interface Props {
  affiliate: any;
  stats: {
    total_clicks: number;
    total_conversions: number;
    pending_conversions: number;
    total_earnings: number;
    total_paid_out: number;
  };
}

export default function AffiliateShow({ affiliate, stats }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const conversionRate = stats.total_clicks > 0
    ? ((stats.total_conversions / stats.total_clicks) * 100).toFixed(2)
    : '0.00';

  return (
    <AdminLayout>
      <Head title={`Affiliate: ${affiliate.name || affiliate.aff_key}`} />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={route('admin.affiliates.index')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {affiliate.name || 'No Name'}
            </h1>
            <p className="text-muted-foreground mt-2">{affiliate.aff_key}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total_clicks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total_conversions}</p>
              <p className="text-sm text-muted-foreground mt-1">
                CR: {conversionRate}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats.total_earnings)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Paid Out</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats.total_paid_out)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Conversions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Buyer</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Commission</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliate.conversions?.map((conversion: any) => (
                    <tr key={conversion.id} className="border-b">
                      <td className="p-4 font-mono text-sm">{conversion.order_id}</td>
                      <td className="p-4">{conversion.user?.name || 'N/A'}</td>
                      <td className="p-4">{formatCurrency(conversion.order_amount)}</td>
                      <td className="p-4 font-semibold">
                        {formatCurrency(conversion.commission_amount)}
                      </td>
                      <td className="p-4">
                        <Badge>{conversion.status}</Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(conversion.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Ledger */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4">Type</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Balance After</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Note</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliate.ledger?.map((entry: any) => (
                    <tr key={entry.id} className="border-b">
                      <td className="p-4">
                        <Badge variant={entry.type === 'credit' ? 'default' : 'destructive'}>
                          {entry.type}
                        </Badge>
                      </td>
                      <td className="p-4 font-semibold">
                        {entry.type === 'credit' ? '+' : '-'}
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="p-4">{formatCurrency(entry.balance_after)}</td>
                      <td className="p-4 text-sm">{entry.reference_type || 'N/A'}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {entry.note || '-'}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
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
