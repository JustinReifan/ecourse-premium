import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function AffiliateRegister() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    upline_aff_key: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/affiliate/register');
  };

  return (
    <AppLayout>
      <Head title="Join Affiliate Program" />

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Join Our Affiliate Program
            </h1>
            <p className="text-xl text-muted-foreground">
              Earn commissions by promoting our courses
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Earn 10% Commission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get 10% commission on every sale you refer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Milestone Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn extra bonuses when you hit weekly targets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>30-Day Cookie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get credited for sales up to 30 days after click
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Register as Affiliate</CardTitle>
              <CardDescription>
                Fill in your details to get your unique affiliate link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Your display name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upline_aff_key">
                    Referrer Code (Optional)
                  </Label>
                  <Input
                    id="upline_aff_key"
                    value={data.upline_aff_key}
                    onChange={(e) => setData('upline_aff_key', e.target.value)}
                    placeholder="Enter referrer's affiliate code"
                  />
                  {errors.upline_aff_key && (
                    <p className="text-sm text-destructive">
                      {errors.upline_aff_key}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={processing} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register Now
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Register</h3>
                  <p className="text-muted-foreground">
                    Sign up and get your unique affiliate link
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Share</h3>
                  <p className="text-muted-foreground">
                    Promote the courses using your link on social media, blogs, or
                    direct messages
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Earn</h3>
                  <p className="text-muted-foreground">
                    Receive 10% commission for every successful purchase made through
                    your link
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
