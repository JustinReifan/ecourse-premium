import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Save, Settings, Trash2 } from 'lucide-react';
interface Milestone {
    [key: string]: string | number;
    period: string;
    target: number;
    bonus_percent: number;
}

interface ConfigFormData {
    [key: string]: string | boolean | Milestone[] | File | undefined;
    landing_headline: string;
    landing_subheadline: string;
    landing_badge: string;
    landing_vsl_url: string;
    landing_vsl_thumbnail: string;
    vsl_thumbnail?: File;
    course_price: string;
    min_lead_magnet_price: string;
    owner_whatsapp: string;
    owner_email: string;
    duitku_api_key: string;
    duitku_merchant_code: string;
    duitku_script_url: string;
    duitku_sandbox_mode: boolean;
    midtrans_api_key: string;
    midtrans_client_key: string;
    midtrans_merchant_id: string;
    midtrans_base_url: string;
    whatsapp_api_key: string;
    whatsapp_base_url: string;
    affiliate_commission_percent: string;
    affiliate_minimum_payout: string;
    affiliate_milestones: Milestone[];
}

interface ConfigPageProps {
    settings: Partial<ConfigFormData>;
}

export default function ConfigIndex({ settings }: ConfigPageProps) {
    const breadcrumbs = [{ title: 'Admin', href: '/admin' }, { title: 'Configuration' }];

    const { data, setData, post, processing, errors } = useForm({
        landing_headline: settings.landing_headline || '',
        landing_subheadline: settings.landing_subheadline || '',
        landing_badge: settings.landing_badge || '',
        landing_vsl_url: settings.landing_vsl_url || '',
        landing_vsl_thumbnail: settings.landing_vsl_thumbnail || '',
        course_price: settings.course_price || '0',
        min_lead_magnet_price: settings.min_lead_magnet_price || '0',
        owner_whatsapp: settings.owner_whatsapp || '',
        owner_email: settings.owner_email || '',
        duitku_api_key: settings.duitku_api_key || '',
        duitku_merchant_code: settings.duitku_merchant_code || '',
        duitku_script_url: settings.duitku_script_url || '',
        duitku_sandbox_mode: settings.duitku_sandbox_mode || false,
        midtrans_api_key: settings.midtrans_api_key || '',
        midtrans_client_key: settings.midtrans_client_key || '',
        midtrans_merchant_id: settings.midtrans_merchant_id || '',
        midtrans_base_url: settings.midtrans_base_url || '',
        whatsapp_api_key: settings.whatsapp_api_key || '',
        whatsapp_base_url: settings.whatsapp_base_url || '',
        affiliate_commission_percent: settings.affiliate_commission_percent || '10',
        affiliate_minimum_payout: settings.affiliate_minimum_payout || '100000',
        affiliate_milestones: settings.affiliate_milestones || [],
    } as any) as {
        data: ConfigFormData;
        setData: (key: keyof ConfigFormData | string, value: any) => void;
        post: (url: string, options?: any) => void;
        processing: boolean;
        errors: Partial<Record<keyof ConfigFormData, string>>;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/config', {
            forceFormData: true,
        });
    };

    const addMilestone = () => {
        setData('affiliate_milestones', [...(data.affiliate_milestones || []), { period: 'weekly', target: 0, bonus_percent: 0 }]);
    };

    const removeMilestone = (index: number) => {
        const newMilestones = [...(data.affiliate_milestones || [])];
        newMilestones.splice(index, 1);
        setData('affiliate_milestones', newMilestones);
    };

    const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
        const newMilestones = [...(data.affiliate_milestones || [])];
        newMilestones[index] = { ...newMilestones[index], [field]: value };
        setData('affiliate_milestones', newMilestones);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Web Configuration" />

            <div className="relative space-y-6 p-6">
                {/* Header */}
                <div className="relative mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-2 animate-pulse rounded-full bg-gradient-to-b from-cyan-400 to-blue-500"></div>
                        <h1 className="bg-gradient-to-r from-cyan-400 via-cyan-600 to-blue-500 bg-clip-text text-4xl font-bold text-transparent">
                            Web Configuration
                        </h1>
                        <Settings className="h-8 w-8 animate-pulse text-cyan-400" />
                    </div>
                    <p className="text-muted-foreground ml-6 font-mono text-sm">Manage all dynamic settings from the database</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
                        {/* sisi kiri */}
                        <div className="space-y-6">
                            {/* Landing Page Content */}
                            <Card className="bg-primary/10 border-primary/20">
                                <CardHeader>
                                    <CardTitle>Landing Page Content</CardTitle>
                                    <CardDescription>Configure the hero section text and media</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="landing_badge">Badge Text</Label>
                                        <Input
                                            id="landing_badge"
                                            value={data.landing_badge}
                                            onChange={(e) => setData('landing_badge', e.target.value)}
                                            placeholder="e.g., New Course Launch"
                                        />
                                        {errors.landing_badge && <p className="text-destructive mt-1 text-sm">{errors.landing_badge}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="landing_headline">Headline</Label>
                                        <Textarea
                                            id="landing_headline"
                                            value={data.landing_headline}
                                            onChange={(e) => setData('landing_headline', e.target.value)}
                                            placeholder="Main headline for the hero section (HTML Allowed)"
                                            rows={3}
                                        />
                                        {errors.landing_headline && <p className="text-destructive mt-1 text-sm">{errors.landing_headline}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="landing_subheadline">Subheadline</Label>
                                        <Textarea
                                            id="landing_subheadline"
                                            value={data.landing_subheadline}
                                            onChange={(e) => setData('landing_subheadline', e.target.value)}
                                            placeholder="Supporting text for the hero section"
                                            rows={2}
                                        />
                                        {errors.landing_subheadline && <p className="text-destructive mt-1 text-sm">{errors.landing_subheadline}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="landing_vsl_url">VSL Youtube Url</Label>
                                        <Input
                                            id="landing_vsl_url"
                                            value={data.landing_vsl_url}
                                            onChange={(e) => setData('landing_vsl_url', e.target.value)}
                                            placeholder="https://youtu.be/xxxxx"
                                        />
                                        {errors.landing_vsl_url && <p className="text-destructive mt-1 text-sm">{errors.landing_vsl_url}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="vsl_thumbnail">VSL Thumbnail</Label>
                                        {settings.landing_vsl_thumbnail && (
                                            <div className="mb-2">
                                                <img
                                                    src={settings.landing_vsl_thumbnail}
                                                    alt="Current VSL Thumbnail"
                                                    className="border-border/50 h-32 w-auto rounded-md border"
                                                />
                                            </div>
                                        )}
                                        <Input
                                            id="vsl_thumbnail"
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    setData('vsl_thumbnail', e.target.files[0]);
                                                }
                                            }}
                                        />
                                        <p className="text-muted-foreground mt-1 text-sm">Max 5MB. Formats: JPEG, PNG, JPG, WEBP</p>
                                        {errors.vsl_thumbnail && <p className="text-destructive mt-1 text-sm">{errors.vsl_thumbnail}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* WhatsApp Gateway */}
                            <Card className="bg-primary/10 border-primary/20">
                                <CardHeader>
                                    <CardTitle>WhatsApp Gateway</CardTitle>
                                    <CardDescription>Configure WhatsApp notifications</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="whatsapp_base_url">Base URL</Label>
                                        <Input
                                            id="whatsapp_base_url"
                                            value={data.whatsapp_base_url}
                                            onChange={(e) => setData('whatsapp_base_url', e.target.value)}
                                            placeholder="WhatsApp API base URL"
                                        />
                                        {errors.whatsapp_base_url && <p className="text-destructive mt-1 text-sm">{errors.whatsapp_api_key}</p>}
                                    </div>
                                </CardContent>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="whatsapp_api_key">API Key</Label>
                                        <Input
                                            id="whatsapp_api_key"
                                            type="password"
                                            value={data.whatsapp_api_key}
                                            onChange={(e) => setData('whatsapp_api_key', e.target.value)}
                                            placeholder="Your WhatsApp API key"
                                        />
                                        {errors.whatsapp_api_key && <p className="text-destructive mt-1 text-sm">{errors.whatsapp_api_key}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Affiliate System */}
                            <Card className="bg-primary/10 border-primary/20">
                                <CardHeader>
                                    <CardTitle>Affiliate System</CardTitle>
                                    <CardDescription>Configure affiliate commissions and bonuses</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="affiliate_commission_percent">Base Commission Rate (%)</Label>
                                        <Input
                                            id="affiliate_commission_percent"
                                            type="number"
                                            step="0.01"
                                            value={data.affiliate_commission_percent}
                                            onChange={(e) => setData('affiliate_commission_percent', e.target.value)}
                                            placeholder="10"
                                            required
                                        />
                                        {errors.affiliate_commission_percent && (
                                            <p className="text-destructive mt-1 text-sm">{errors.affiliate_commission_percent}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="affiliate_minimum_payout">Minimum Withdraw Amount (IDR)</Label>
                                        <Input
                                            id="affiliate_minimum_payout"
                                            type="number"
                                            value={data.affiliate_minimum_payout}
                                            onChange={(e) => setData('affiliate_minimum_payout', e.target.value)}
                                            placeholder="100000"
                                            required
                                        />
                                        {errors.affiliate_minimum_payout && (
                                            <p className="text-destructive mt-1 text-sm">{errors.affiliate_minimum_payout}</p>
                                        )}
                                    </div>

                                    {/* Dynamic Milestones */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Milestone Bonuses</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addMilestone} className="gap-2">
                                                <Plus className="h-4 w-4" />
                                                Add Milestone
                                            </Button>
                                        </div>

                                        {data.affiliate_milestones?.map((milestone: Milestone, index: number) => (
                                            <Card key={index} className="bg-primary-foreground/70 border-primary/20 p-4">
                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                                                    <div>
                                                        <Label className="text-xs">Period</Label>
                                                        <Input
                                                            value={milestone.period}
                                                            onChange={(e) => updateMilestone(index, 'period', e.target.value)}
                                                            placeholder="weekly"
                                                            className="h-9"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs">Target</Label>
                                                        <Input
                                                            type="number"
                                                            value={milestone.target}
                                                            onChange={(e) => updateMilestone(index, 'target', parseInt(e.target.value))}
                                                            placeholder="5"
                                                            className="h-9"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs">Bonus (%)</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={milestone.bonus_percent}
                                                            onChange={(e) => updateMilestone(index, 'bonus_percent', parseFloat(e.target.value))}
                                                            placeholder="5"
                                                            className="h-9"
                                                        />
                                                    </div>

                                                    <div className="flex items-end">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => removeMilestone(index)}
                                                            className="h-9 w-full gap-2"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}

                                        <p className="text-muted-foreground mt-1 text-sm">Period: daily, weekly, monthly</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* sisi kanan */}
                        <div className="space-y-6">
                            {/* General & Pricing */}
                            <Card className="bg-primary/10 border-primary/20">
                                <CardHeader>
                                    <CardTitle>General & Pricing</CardTitle>
                                    <CardDescription>Core application settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="course_price">Main Course Price (IDR)</Label>
                                        <Input
                                            id="course_price"
                                            type="number"
                                            value={data.course_price}
                                            onChange={(e) => setData('course_price', e.target.value)}
                                            placeholder="500000"
                                            required
                                        />
                                        {errors.course_price && <p className="text-destructive mt-1 text-sm">{errors.course_price}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="min_lead_magnet_price">Min Lead Magnet Price (IDR)</Label>
                                        <Input
                                            id="min_lead_magnet_price"
                                            type="number"
                                            value={data.min_lead_magnet_price}
                                            onChange={(e) => setData('min_lead_magnet_price', e.target.value)}
                                            placeholder="10000"
                                            required
                                        />
                                        {errors.min_lead_magnet_price && (
                                            <p className="text-destructive mt-1 text-sm">{errors.min_lead_magnet_price}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="owner_whatsapp">Owner WhatsApp Number</Label>
                                        <Input
                                            id="owner_whatsapp"
                                            value={data.owner_whatsapp}
                                            onChange={(e) => setData('owner_whatsapp', e.target.value)}
                                            placeholder="628123456789"
                                        />
                                        {errors.owner_whatsapp && <p className="text-destructive mt-1 text-sm">{errors.owner_whatsapp}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="owner_email">Owner Email Address</Label>
                                        <Input
                                            id="owner_email"
                                            value={data.owner_email}
                                            onChange={(e) => setData('owner_email', e.target.value)}
                                            placeholder="admin@gmail.com"
                                        />
                                        {errors.owner_email && <p className="text-destructive mt-1 text-sm">{errors.owner_email}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Duitku Payment Gateway */}
                            <Card className="bg-primary/10 border-primary/20">
                                <CardHeader>
                                    <CardTitle>Duitku Payment Gateway</CardTitle>
                                    <CardDescription>Configure Duitku integration</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="duitku_api_key">API Key</Label>
                                        <Input
                                            id="duitku_api_key"
                                            type="password"
                                            value={data.duitku_api_key}
                                            onChange={(e) => setData('duitku_api_key', e.target.value)}
                                            placeholder="Your Duitku API key"
                                        />
                                        {errors.duitku_api_key && <p className="text-destructive mt-1 text-sm">{errors.duitku_api_key}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="duitku_merchant_code">Merchant Code</Label>
                                        <Input
                                            id="duitku_merchant_code"
                                            value={data.duitku_merchant_code}
                                            onChange={(e) => setData('duitku_merchant_code', e.target.value)}
                                            placeholder="Your merchant code"
                                        />
                                        {errors.duitku_merchant_code && (
                                            <p className="text-destructive mt-1 text-sm">{errors.duitku_merchant_code}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="duitku_script_url">Script URL</Label>
                                        <Input
                                            id="duitku_script_url"
                                            type="url"
                                            value={data.duitku_script_url}
                                            onChange={(e) => setData('duitku_script_url', e.target.value)}
                                            placeholder="https://..."
                                        />
                                        {errors.duitku_script_url && <p className="text-destructive mt-1 text-sm">{errors.duitku_script_url}</p>}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="duitku_sandbox_mode"
                                            checked={Number(data.duitku_sandbox_mode) === 1}
                                            onCheckedChange={(checked) => setData('duitku_sandbox_mode', checked)}
                                            className="h-4 w-4 rounded border-zinc-700"
                                        />
                                        <Label htmlFor="duitku_sandbox_mode" className="cursor-pointer">
                                            Sandbox Mode
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Midtrans Payment Gateway */}
                            <Card className="bg-primary/10 border-primary/20">
                                <CardHeader>
                                    <CardTitle>Midtrans Payment Gateway</CardTitle>
                                    <CardDescription>Configure Midtrans integration</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="midtrans_api_key">Server Key</Label>
                                        <Input
                                            id="midtrans_api_key"
                                            type="password"
                                            value={data.midtrans_api_key}
                                            onChange={(e) => setData('midtrans_api_key', e.target.value)}
                                            placeholder="Your Midtrans server key"
                                        />
                                        {errors.midtrans_api_key && <p className="text-destructive mt-1 text-sm">{errors.midtrans_api_key}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="midtrans_client_key">Client Key</Label>
                                        <Input
                                            id="midtrans_client_key"
                                            value={data.midtrans_client_key}
                                            onChange={(e) => setData('midtrans_client_key', e.target.value)}
                                            placeholder="Your Midtrans client key"
                                        />
                                        {errors.midtrans_client_key && <p className="text-destructive mt-1 text-sm">{errors.midtrans_client_key}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="midtrans_merchant_id">Merchant ID</Label>
                                        <Input
                                            id="midtrans_merchant_id"
                                            value={data.midtrans_merchant_id}
                                            onChange={(e) => setData('midtrans_merchant_id', e.target.value)}
                                            placeholder="Your merchant ID"
                                        />
                                        {errors.midtrans_merchant_id && (
                                            <p className="text-destructive mt-1 text-sm">{errors.midtrans_merchant_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="midtrans_base_url">Base URL</Label>
                                        <Input
                                            id="midtrans_base_url"
                                            type="url"
                                            value={data.midtrans_base_url}
                                            onChange={(e) => setData('midtrans_base_url', e.target.value)}
                                            placeholder="https://api.midtrans.com"
                                        />
                                        {errors.midtrans_base_url && <p className="text-destructive mt-1 text-sm">{errors.midtrans_base_url}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Configuration'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
