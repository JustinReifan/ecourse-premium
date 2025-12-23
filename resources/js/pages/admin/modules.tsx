import { DataTable } from '@/components/admin/data-table';
import { ExpandableText } from '@/components/expandable-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Calendar, Database, PlayCircle, Upload, Zap } from 'lucide-react';
import { useState } from 'react';

interface Course {
    id: number;
    name: string;
}

interface Module {
    id: number;
    name: string;
    description: string;
    video_path: string;
    order: number;
    status: 'draft' | 'published';
    course_id: number;
    course?: Course;
    created_at: string;
}

interface ModulesPageProps {
    modules: Module[];
    courses: Course[];
}

export default function ModulesPage({ modules, courses }: ModulesPageProps) {
    const { flash } = usePage().props as any;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);

    const {
        data,
        setData,
        post,
        progress,
        transform,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        name: '',
        description: '',
        video_path: '',
        order: 0,
        status: 'draft' as 'draft' | 'published',
        course_id: '',
    });

    const breadcrumbs = [{ title: 'Admin', href: '/admin' }, { title: 'Modules' }];

    const columns = [
        {
            key: 'name' as keyof Module,
            label: 'Module Name',
            sortable: true,
            render: (value: string, module: Module) => (
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 ring-1 ring-zinc-700">
                            {module.video_path ? <PlayCircle className="h-6 w-6 text-cyan-400" /> : <Upload className="h-5 w-5 text-gray-500" />}
                        </div>
                        {module.video_path && (
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                        )}
                    </div>
                    <div>
                        <p className="text-foreground group-hover:text-primary font-semibold transition-colors">{value}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <Database className="h-3 w-3 text-gray-500" />
                            <p className="font-mono text-xs text-gray-400">{module.course?.name || 'No Course'}</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'description' as keyof Module,
            label: 'Description',
            render: (value: string) => <ExpandableText text={value} />,
        },

        {
            key: 'order' as keyof Module,
            label: 'Order',
            sortable: true,
            render: (value: number) => (
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-1 ring-purple-400/30">
                        <span className="font-mono text-sm font-bold text-purple-400">#{value}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'status' as keyof Module,
            label: 'Status',
            sortable: true,
            render: (value: string) => (
                <Badge
                    className={`${
                        value === 'published'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                    } rounded-full px-3 py-1 font-mono text-xs tracking-wider uppercase transition-transform duration-200 hover:scale-105`}
                >
                    <div className={`mr-2 h-2 w-2 rounded-full ${value === 'published' ? 'animate-pulse bg-white' : 'bg-amber-200'}`}></div>
                    {value}
                </Badge>
            ),
        },
        {
            key: 'created_at' as keyof Module,
            label: 'Created',
            sortable: true,
            render: (value: string) => (
                <div className="flex items-center gap-2 font-mono text-sm text-gray-400">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    {new Date(value).toLocaleDateString()}
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        reset();
        setEditingModule(null);
        setIsModalOpen(true);
    };

    const handleEdit = (module: Module) => {
        setData('name', module.name);
        setData('description', module.description);
        setData('video_path', module.video_path);
        setData('order', module.order);
        setData('status', module.status);
        setData('course_id', String(module.course_id));
        setEditingModule(module);
        setIsModalOpen(true);
    };

    const handleDelete = (module: Module) => {
        if (confirm('Are you sure you want to delete this module?')) {
            destroy(`/admin/modules/${module.id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingModule) {
            transform((data) => ({
                ...data,
                _method: 'put',
            }));
            post(`/admin/modules/${editingModule.id}`, {
                // forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/modules', {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Module Management" />

            <div className="relative p-6">
                {flash.success && (
                    <Alert variant="destructive" className="to-primary/50 mb-4 border border-green-500/30 bg-gradient-to-r from-green-500/20">
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
                        data={modules}
                        columns={columns}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        title="Module Management"
                        addButtonText="Add Module"
                        searchPlaceholder="Search modules..."
                    />
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-primary/10 text-foreground border-primary/20 max-h-[90vh] max-w-md overflow-y-auto border to-zinc-900/95 backdrop-blur-sm sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
                            <Zap className="h-6 w-6 text-cyan-400" />
                            {editingModule ? 'Modify Module' : 'Create Module'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Module Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/20"
                                placeholder="Enter module name"
                            />
                            {errors.name && <p className="mt-1 font-mono text-sm text-red-400">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="course_id" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Course
                            </Label>
                            <select
                                id="course_id"
                                value={data.course_id}
                                onChange={(e) => setData('course_id', e.target.value)}
                                className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-white backdrop-blur-sm focus:border-cyan-400 focus:outline-none"
                            >
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                            {errors.course_id && <p className="mt-1 font-mono text-sm text-red-400">{errors.course_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Description
                            </Label>
                            <RichTextEditor
                                value={data.description}
                                onChange={(value) => setData('description', value)}
                                error={errors.description}
                                placeholder="Enter description"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="video_path" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Video
                            </Label>
                            <Input
                                id="video_path"
                                value={data.video_path}
                                onChange={(e) => setData('video_path', e.target.value)}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/20"
                                placeholder="Enter video URL"
                            />
                            {errors.video_path && <p className="mt-1 font-mono text-sm text-red-400">{errors.video_path}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="order" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Order
                            </Label>
                            <Input
                                id="order"
                                type="number"
                                value={data.order}
                                onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/20"
                                placeholder="Enter order"
                            />
                            {errors.order && <p className="mt-1 font-mono text-sm text-red-400">{errors.order}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Status
                            </Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as 'draft' | 'published')}
                                className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-white backdrop-blur-sm focus:border-cyan-400 focus:outline-none"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                            {errors.status && <p className="mt-1 font-mono text-sm text-red-400">{errors.status}</p>}
                        </div>

                        <div className="flex gap-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="text-foreground flex-1 border-zinc-600/50 backdrop-blur-sm hover:bg-gray-200"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 font-medium text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:from-cyan-600 hover:to-blue-600 hover:shadow-cyan-500/40"
                            >
                                {processing ? 'Processing...' : editingModule ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
