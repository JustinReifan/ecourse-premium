import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PayoutMethod {
    id: number;
    name: string;
    type: string;
    description?: string;
    active: boolean;
    created_at: string;
}

interface Props {
    payoutMethods: PayoutMethod[];
}

export default function PayoutMethods({ payoutMethods }: Props) {
    const [editingMethod, setEditingMethod] = useState<PayoutMethod | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const { success } = useToast();

    const { data, setData, post, put, processing, reset, errors } = useForm<{
        name: string;
        type: string;
        description: string;
        active: boolean;
    }>({
        name: '',
        type: 'bank',
        description: '',
        active: true,
    });

    const handleCreate = () => {
        setIsCreating(true);
        reset();
    };

    const handleEdit = (method: PayoutMethod) => {
        setEditingMethod(method);
        setData('name', method.name);
        setData('type', method.type);
        setData('description', method.description || '');
        setData('active', method.active);
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this payout method?')) {
            router.delete(route('admin.payout-methods.destroy', id), {
                onSuccess: () => success('Payout method deleted'),
            });
        }
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.payout-methods.store'), {
            onSuccess: () => {
                setIsCreating(false);
                reset();
                success('Payout method created');
            },
        });
    };

    const submitUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMethod) return;

        put(route('admin.payout-methods.update', editingMethod.id), {
            onSuccess: () => {
                setEditingMethod(null);
                reset();
                success('Payout method updated');
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Payout Methods" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-foreground text-3xl font-bold">Payout Methods</h1>
                        <p className="text-muted-foreground mt-2">Manage available payout methods for affiliates</p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Method
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {payoutMethods.map((method) => (
                        <Card key={method.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{method.name}</CardTitle>
                                        <div className="mt-2 flex gap-2">
                                            <Badge variant="outline">{method.type}</Badge>
                                            <Badge variant={method.active ? 'default' : 'secondary'}>{method.active ? 'Active' : 'Inactive'}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => handleEdit(method)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(method.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            {method.description && (
                                <CardContent>
                                    <p className="text-muted-foreground text-sm">{method.description}</p>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            </div>

            <Dialog
                open={isCreating || !!editingMethod}
                onOpenChange={() => {
                    setIsCreating(false);
                    setEditingMethod(null);
                    reset();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isCreating ? 'Add Payout Method' : 'Edit Payout Method'}</DialogTitle>
                        <DialogDescription>Configure a payout method for affiliates</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={isCreating ? submitCreate : submitUpdate} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Method Name</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g., Bank Transfer BCA" required />
                            {errors.name && <p className="text-destructive mt-1 text-sm">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="type">Type</Label>
                            <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bank">Bank Transfer</SelectItem>
                                    <SelectItem value="ewallet">E-Wallet</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-destructive mt-1 text-sm">{errors.type}</p>}
                        </div>

                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Additional details..." />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="active" checked={data.active} onChange={(e) => setData('active', e.target.checked)} className="h-4 w-4" />
                            <Label htmlFor="active">Active</Label>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingMethod(null);
                                    reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {isCreating ? 'Create' : 'Update'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
