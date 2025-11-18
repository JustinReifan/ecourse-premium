import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Campaign {
  id: number;
  name: string;
  description?: string;
  commission_value: { percent: number };
  starts_at?: string;
  ends_at?: string;
  active: boolean;
  clicks_count: number;
  conversions_count: number;
  created_at: string;
}

interface Props {
  campaigns: Campaign[];
}

export default function AffiliateCampaigns({ campaigns }: Props) {
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data, setData, post, put, processing, reset, errors } = useForm<{
    name: string;
    description: string;
    commission_percent: number;
    starts_at: string;
    ends_at: string;
    active: boolean;
  }>({
    name: '',
    description: '',
    commission_percent: 10,
    starts_at: '',
    ends_at: '',
    active: true,
  });

  const handleCreate = () => {
    setIsCreating(true);
    reset();
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setData({
      name: campaign.name,
      description: campaign.description || '',
      commission_percent: campaign.commission_value.percent,
      starts_at: campaign.starts_at ? campaign.starts_at.split('T')[0] + 'T' + campaign.starts_at.split('T')[1]?.substring(0, 5) : '',
      ends_at: campaign.ends_at ? campaign.ends_at.split('T')[0] + 'T' + campaign.ends_at.split('T')[1]?.substring(0, 5) : '',
      active: campaign.active,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this campaign? This action cannot be undone.')) {
      router.delete(route('admin.affiliates.campaigns.destroy', id));
    }
  };

  const submitCreate = () => {
    post(route('admin.affiliates.campaigns.store'), {
      onSuccess: () => {
        setIsCreating(false);
        reset();
      },
    });
  };

  const submitUpdate = () => {
    if (!editingCampaign) return;
    
    put(route('admin.affiliates.campaigns.update', editingCampaign.id), {
      onSuccess: () => {
        setEditingCampaign(null);
        reset();
      },
    });
  };

  return (
    <AdminLayout>
      <Head title="Affiliate Campaigns" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground mt-2">
              Create special commission campaigns to motivate affiliates
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Campaigns Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <Badge variant={campaign.active ? 'default' : 'secondary'} className="mt-2">
                      {campaign.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(campaign)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {campaign.description || 'No description'}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission:</span>
                    <span className="font-semibold">
                      {campaign.commission_value.percent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clicks:</span>
                    <span>{campaign.clicks_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversions:</span>
                    <span>{campaign.conversions_count}</span>
                  </div>
                  {campaign.starts_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start:</span>
                      <span>{new Date(campaign.starts_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {campaign.ends_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End:</span>
                      <span>{new Date(campaign.ends_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreating || !!editingCampaign}
        onOpenChange={() => {
          setIsCreating(false);
          setEditingCampaign(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create Campaign' : 'Edit Campaign'}
            </DialogTitle>
            <DialogDescription>
              Set up a special commission campaign for your affiliates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Double Commission Weekend"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="2x commission for all sales this weekend"
              />
            </div>
            <div>
              <Label htmlFor="commission_percent">Commission Percentage</Label>
              <Input
                id="commission_percent"
                type="number"
                value={data.commission_percent}
                onChange={(e) => setData('commission_percent', Number(e.target.value))}
                min="0"
                max="100"
              />
              {errors.commission_percent && (
                <p className="text-sm text-destructive mt-1">{errors.commission_percent}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="starts_at">Start Date</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  value={data.starts_at}
                  onChange={(e) => setData('starts_at', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ends_at">End Date</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  value={data.ends_at}
                  onChange={(e) => setData('ends_at', e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setEditingCampaign(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isCreating ? submitCreate : submitUpdate}
              disabled={processing}
            >
              {isCreating ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
