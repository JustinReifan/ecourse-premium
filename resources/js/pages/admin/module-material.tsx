import { DataTable } from '@/components/admin/data-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Database, Zap } from 'lucide-react';
import { useState } from 'react';

interface Module {
    id: number;
    name: string;
}

interface Material {
    id: number;
    name: string;
    url: string;
    text: string;
    module_id: string | number;
    module?: Module;
}

interface MaterialsPageProps {
    materials: Material[];
    modules: Module[];
}

export default function ModuleMaterialsPage({ materials, modules }: MaterialsPageProps) {
    const { flash } = usePage().props as any;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        name: '',
        url: '',
        text: '',
        module_id: '',
    });

    const breadcrumbs = [{ title: 'Admin', href: '/admin' }, { title: 'materials' }];

    const columns = [
        {
            key: 'name' as keyof Material,
            label: 'Name',
            sortable: true,
            render: (value: string, material: Material) => (
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-foreground group-hover:text-primary font-semibold transition-colors">{value}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <Database className="h-3 w-3 text-gray-500" />
                            <p className="font-mono text-xs text-gray-400">{material.module?.name || 'No Module'}</p>
                        </div>
                    </div>
                </div>
            ),
        },

        {
            key: 'url' as keyof Material,
            label: 'Url Tujuan',
            sortable: false,
            render: (value: number) => (
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 ring-primary/70 rounded-lg px-4 py-1 ring-1">
                        <span className="text-foreground font-mono text-sm font-bold">{value}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'text' as keyof Material,
            label: 'Text',
            sortable: false,
            render: (value: string) => <div className="flex items-center gap-2 font-mono text-sm text-gray-500">{value}</div>,
        },
    ];

    const handleAdd = () => {
        reset();
        setEditingMaterial(null);
        setIsModalOpen(true);
    };

    const handleEdit = (material: Material) => {
        console.log(material);

        setData({
            name: material.name,
            url: material.url,
            text: material.text,
            module_id: material.module_id.toString(),
        });
        setEditingMaterial(material);
        console.log(data);

        setIsModalOpen(true);
    };

    const handleDelete = (material: Material) => {
        if (confirm('Are you sure you want to delete this material?')) {
            destroy(`/admin/module-materials/${material.id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingMaterial) {
            put(route('admin.module-materials.update', editingMaterial.id), {
                // forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/module-materials', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Module Material Management" />

            <div className="relative p-6">
                {flash.success && (
                    <Alert variant="destructive" className="mb-4 border border-green-500/30 bg-gradient-to-r from-green-500/20 to-zinc-900">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {/* Animated background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 right-20 h-60 w-60 animate-pulse rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 h-60 w-60 animate-pulse rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl delay-1000"></div>
                </div>

                <div className="relative z-10">
                    <DataTable
                        data={materials}
                        columns={columns}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        title="Module Material Management"
                        addButtonText="Add material"
                        searchPlaceholder="Search materials..."
                    />
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-primary/10 text-foreground border-primary/20 max-w-md border backdrop-blur-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
                            <Zap className="h-6 w-6 text-cyan-400" />
                            {editingMaterial ? 'Modify material' : 'Create material'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Material Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/20"
                                placeholder="Enter material name"
                            />
                            {errors.name && <p className="mt-1 font-mono text-sm text-red-400">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="module_id" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Module
                            </Label>
                            <select
                                id="module_id"
                                value={data.module_id}
                                onChange={(e) => setData('module_id', e.target.value)}
                                className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-white backdrop-blur-sm focus:border-cyan-400 focus:outline-none"
                            >
                                <option value="">Select a module</option>
                                {modules.map((module) => (
                                    <option key={module.id} value={module.id}>
                                        {module.name}
                                    </option>
                                ))}
                            </select>
                            {errors.module_id && <p className="mt-1 font-mono text-sm text-red-400">{errors.module_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="text" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Text
                            </Label>
                            <Textarea
                                id="text"
                                rows={5}
                                value={data.text}
                                onChange={(e) => setData('text', e.target.value)}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/20"
                                placeholder="Enter text"
                            />
                            {errors.text && <p className="mt-1 font-mono text-sm text-red-400">{errors.text}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Url Tujuan
                            </Label>
                            <Input
                                id="url"
                                type="text"
                                value={data.url}
                                onChange={(e) => setData('url', e.target.value)}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/20"
                                placeholder="Enter material url"
                            />
                            {errors.url && <p className="mt-1 font-mono text-sm text-red-400">{errors.url}</p>}
                        </div>

                        <div className="flex gap-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="text-foreground flex-1 border-zinc-600/50 backdrop-blur-sm hover:bg-zinc-700/50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 font-medium text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:from-cyan-600 hover:to-blue-600 hover:shadow-cyan-500/40"
                            >
                                {processing ? 'Processing...' : editingMaterial ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
