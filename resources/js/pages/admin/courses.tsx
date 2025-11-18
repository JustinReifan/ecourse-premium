import { DataTable } from '@/components/admin/data-table';
import { ExpandableText } from '@/components/expandable-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, Database, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Course {
    id: number;
    name: string;
    description: string;
    thumbnail: string | null;
    order: number;
    status: 'active' | 'inactive';
    created_at: string;
    modules_count?: number;
}

interface CoursesPageProps {
    courses: Course[];
}

export default function CoursesPage({ courses }: CoursesPageProps) {
    const { flash } = usePage().props as any;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const {
        data,
        setData,
        post,
        transform,
        delete: destroy,
        processing,
        errors,
        reset,
        progress,
    } = useForm({
        name: '',
        description: '',
        thumbnail: null as File | null,
        order: 0,
        status: 'active' as 'active' | 'inactive',
    });

    useEffect(() => {
        return () => {
            if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnailPreview);
            }
        };
    }, [thumbnailPreview]);

    // Fungsi helper untuk menutup dan me-reset modal
    const closeModal = () => {
        setIsModalOpen(false);
        setThumbnailPreview(null); // Reset preview
        setEditingCourse(null);
        reset(); // Reset form Inertia
    };

    const breadcrumbs = [{ title: 'Admin', href: '/admin' }, { title: 'Courses' }];

    const columns = [
        {
            key: 'name' as keyof Course,
            label: 'Course Name',
            sortable: true,
            render: (value: string, course: Course) => (
                <div className="flex items-center justify-end gap-4 lg:justify-normal">
                    <div>
                        <p className="font-semibold text-white transition-colors group-hover:text-cyan-200">{value}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <Database className="h-3 w-3 text-gray-500" />
                            <p className="font-mono text-xs text-gray-400">{course.modules_count || 0} modules</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'thumbnail' as keyof Course,
            label: 'Thumbnail',
            render: (value: string) => <img src={'/storage/' + value} className="w-12 rounded bg-cover" alt="thumbnail" />,
        },
        {
            key: 'description' as keyof Course,
            label: 'Description',
            render: (value: string) => <ExpandableText text={value} />,
        },
        {
            key: 'status' as keyof Course,
            label: 'Status',
            sortable: true,
            render: (value: string) => (
                <Badge
                    className={` ${
                        value === 'active'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                            : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 shadow-lg shadow-gray-500/25'
                    } rounded-full px-3 py-1 font-mono text-xs tracking-wider uppercase transition-transform duration-200 hover:scale-105`}
                >
                    <div className={`mr-2 h-2 w-2 rounded-full ${value === 'active' ? 'animate-pulse bg-white' : 'bg-gray-400'}`}></div>
                    {value}
                </Badge>
            ),
        },
        {
            key: 'created_at' as keyof Course,
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
        setEditingCourse(null);
        setThumbnailPreview(null);
        setIsModalOpen(true);
    };

    const handleEdit = (course: Course) => {
        setData({
            name: course.name,
            description: course.description,
            thumbnail: null,
            order: course.order,
            status: course.status,
        });
        setEditingCourse(course);
        setThumbnailPreview(course.thumbnail ? `/storage/${course.thumbnail}` : null);
        setIsModalOpen(true);
    };

    const handleDelete = (course: Course) => {
        if (confirm('Are you sure you want to delete this course?')) {
            destroy(`/admin/courses/${course.id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCourse) {
            const submissionData: any = { ...data, _method: 'put' };

            // 2. Hapus key 'thumbnail' jika tidak ada file baru
            if (submissionData.thumbnail === null) {
                delete submissionData.thumbnail;
            }

            // 3. Gunakan router.post untuk mengirim
            router.post(`/admin/courses/${editingCourse.id}`, submissionData, {
                forceFormData: true, // Wajib untuk file upload!
                onSuccess: () => closeModal(), // Gunakan helper
            });
        } else {
            post('/admin/courses', {
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
            <Head title="Course Management" />

            <div className="relative p-6">
                {/* flash success */}
                {flash.success && (
                    <Alert variant="destructive" className="mb-4 border border-blue-500/30 bg-gradient-to-r from-green-500/20 to-zinc-900">
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
                        data={courses}
                        columns={columns}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        title="Course Management"
                        addButtonText="Add Course"
                        searchPlaceholder="Search courses..."
                    />
                </div>
            </div>

            <Dialog
                open={isModalOpen}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        closeModal(); // Panggil helper saat dialog ditutup
                    } else {
                        setIsModalOpen(true);
                    }
                }}
            >
                <DialogContent className="max-w-md border border-zinc-700/50 bg-gradient-to-br from-zinc-900/95 via-zinc-800/50 to-zinc-900/95 text-white backdrop-blur-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
                            <Zap className="h-6 w-6 text-cyan-400" />
                            {editingCourse ? 'Modify Course' : 'Create Course'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Course Name
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/20"
                                placeholder="Enter course name"
                            />
                            {errors.name && <p className="mt-1 font-mono text-sm text-red-400">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/20"
                                placeholder="Enter description"
                            />
                            {errors.description && <p className="mt-1 font-mono text-sm text-red-400">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="thumbnail" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Thumbnail
                            </Label>
                            <Input
                                id="thumbnail"
                                type="file"
                                accept="image/*" // Tambahkan ini
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setData('thumbnail', file); // Update form data

                                    // Update preview
                                    if (file) {
                                        setThumbnailPreview(URL.createObjectURL(file));
                                    } else {
                                        // Jika batal, kembalikan ke preview asli (jika ada)
                                        setThumbnailPreview(editingCourse?.thumbnail ? `/storage/${editingCourse.thumbnail}` : null);
                                    }
                                }}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-cyan-400 focus:ring-cyan-400/20"
                            />

                            {errors.thumbnail && <p className="mt-1 font-mono text-sm text-red-400">{errors.thumbnail}</p>}

                            {thumbnailPreview && (
                                <div className="mt-4">
                                    <Label className="font-mono text-sm tracking-wider text-gray-300 uppercase">Preview</Label>
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className="mt-2 aspect-video w-64 rounded-lg border border-zinc-700/50 object-cover"
                                    />
                                </div>
                            )}
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
                                onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-white backdrop-blur-sm focus:border-cyan-400 focus:outline-none"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            {errors.status && <p className="mt-1 font-mono text-sm text-red-400">{errors.status}</p>}
                        </div>

                        <div className="flex gap-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 border-zinc-600/50 text-white backdrop-blur-sm hover:bg-zinc-700/50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 font-medium text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:from-cyan-600 hover:to-blue-600 hover:shadow-cyan-500/40"
                            >
                                {processing ? 'Processing...' : editingCourse ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
