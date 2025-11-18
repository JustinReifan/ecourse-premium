import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';

interface Affiliate {
  id: number;
  name?: string;
  aff_key: string;
  conversions_count: number;
  conversion_rate?: number;
}

interface Props {
  topByConversions: Affiliate[];
  topByRate: Affiliate[];
}

export default function AffiliateLeaderboard({ topByConversions, topByRate }: Props) {
  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  return (
    <AppLayout>
      <Head title="Affiliate Leaderboard" />

      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Affiliate Leaderboard</h1>
          <p className="text-xl text-muted-foreground">
            Top performing affiliates
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Top by Conversions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top by Conversions
              </CardTitle>
              <CardDescription>Most total sales generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topByConversions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No data yet
                  </p>
                ) : (
                  topByConversions.map((affiliate, index) => (
                    <div
                      key={affiliate.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${getMedalColor(index)}`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {affiliate.name || affiliate.aff_key}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {affiliate.conversions_count} conversions
                          </p>
                        </div>
                      </div>
                      {index < 3 && (
                        <Trophy className={`h-6 w-6 ${getMedalColor(index)}`} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top by Conversion Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top by Conversion Rate
              </CardTitle>
              <CardDescription>Best click-to-sale ratio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topByRate.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No data yet
                  </p>
                ) : (
                  topByRate.map((affiliate, index) => (
                    <div
                      key={affiliate.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${getMedalColor(index)}`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {affiliate.name || affiliate.aff_key}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {affiliate.conversion_rate?.toFixed(2)}% conversion rate
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {affiliate.conversions_count} sales
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
