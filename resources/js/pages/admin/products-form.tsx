import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Course {
    id: number;
    name: string;
}

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    affiliate_commission_rate: number | null;
    thumbnail: string | null;
    type: 'ecourse' | 'ebook' | 'template' | 'affiliate_link';
    file_path: string | null;
    external_url: string | null;
    order: number;
    status: 'active' | 'inactive';
    is_default: boolean;
    is_lead_magnet: boolean;
    courses?: Course[];
}

interface ProductFormProps {
    product?: Product;
    courses: Course[];
}

export default function ProductForm({ product, courses }: ProductFormProps) {
    const isEditing = !!product;
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>(product?.courses?.map((c) => c.id) || []);

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>('/storage/' + product?.thumbnail || null);

    const { data, setData, post, processing, errors, progress } = useForm({
        title: product?.title || '',
        description: product?.description || '',
        price: product?.price || 0,
        affiliate_commission_rate: product?.affiliate_commission_rate || null,
        thumbnail: null as File | null,
        type: product?.type || ('ecourse' as const),
        file: null as File | null,
        external_url: product?.external_url || '',
        order: product?.order || 0,
        status: product?.status || ('active' as const),
        is_default: product?.is_default || false,
        is_lead_magnet: product?.is_lead_magnet || false,
        course_ids: selectedCourseIds,
    });

    useEffect(() => {
        // Ini adalah cleanup function
        return () => {
            if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnailPreview);
            }
        };
    }, [thumbnailPreview]);

    const breadcrumbs = [
        { title: 'Admin', href: '/admin' },
        { title: 'Products', href: '/admin/products' },
        { title: isEditing ? 'Edit Product' : 'Create Product' },
    ];

    const handleCourseToggle = (courseId: number) => {
        const newSelection = selectedCourseIds.includes(courseId)
            ? selectedCourseIds.filter((id) => id !== courseId)
            : [...selectedCourseIds, courseId];

        setSelectedCourseIds(newSelection);
        setData('course_ids', newSelection);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            // --- MODIFIKASI BLOK INI ---

            // 1. Salin data dari state useForm
            const submissionData: any = { ...data, _method: 'put' };

            // 2. Jika 'thumbnail' adalah null (tidak ada file baru di-upload),
            //    hapus key 'thumbnail' dari data yang akan dikirim.
            if (submissionData.thumbnail === null) {
                delete submissionData.thumbnail;
            }

            // 3. Lakukan hal yang sama untuk 'file' (Ebook/Template)
            if (submissionData.file === null) {
                delete submissionData.file;
            }

            // 4. Kirim data yang sudah dimodifikasi
            router.post(`/admin/products/${product.id}`, submissionData, {
                forceFormData: true,
                onSuccess: () => router.get('/admin/products'),
            });

            // --- SELESAI MODIFIKASI ---
        } else {
            post('/admin/products', {
                forceFormData: true,
                onSuccess: () => router.get('/admin/products'),
            });
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Product' : 'Create Product'} />

            <div className="relative p-6">
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={() => router.get('/admin/products')}
                        className="text-foreground bg-primary/10 hover:bg-primary/20 border-primary/20"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Products
                    </Button>
                </div>

                <Card className="border-primary/20 bg-primary/10">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2 text-2xl font-bold">
                            {isEditing ? 'Edit Product' : 'Create New Product'}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="font-mono text-sm tracking-wider text-gray-500 uppercase">
                                        Product Title
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="border-primary/20 bg-primary-foreground/70 text-foreground backdrop-blur-sm focus:border-cyan-400"
                                        placeholder="Enter product title"
                                    />
                                    {errors.title && <p className="font-mono text-sm text-red-400">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price" className="font-mono text-sm tracking-wider text-gray-500 uppercase">
                                        Price (Rp)
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={data.price}
                                        onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                        className="border-primary/20 bg-primary-foreground/70 text-foreground backdrop-blur-sm focus:border-cyan-400"
                                        placeholder="0"
                                    />
                                    {errors.price && <p className="font-mono text-sm text-red-400">{errors.price}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="font-mono text-sm tracking-wider text-gray-500 uppercase">
                                    Description
                                </Label>
                                <RichTextEditor
                                    value={data.description}
                                    onChange={(value) => setData('description', value)}
                                    error={errors.description}
                                    placeholder="Enter description"
                                />
                                {errors.description && <p className="font-mono text-sm text-red-400">{errors.description}</p>}
                            </div>

                            {/* Product Type */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="font-mono text-sm tracking-wider text-gray-500 uppercase">
                                        Product Type
                                    </Label>
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value as any)}
                                        className="border-primary/20 bg-primary-foreground/70 text-foreground w-full rounded-lg border px-3 py-2 backdrop-blur-sm focus:border-cyan-400 focus:outline-none"
                                    >
                                        <option value="ecourse">E-Course</option>
                                        <option value="ebook">E-Book</option>
                                        <option value="template">Template</option>
                                        <option value="affiliate_link">Affiliate Link</option>
                                    </select>
                                    {errors.type && <p className="font-mono text-sm text-red-400">{errors.type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status" className="font-mono text-sm tracking-wider text-gray-500 uppercase">
                                        Status
                                    </Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as any)}
                                        className="border-primary/20 bg-primary-foreground/70 text-foreground w-full rounded-lg border px-3 py-2 backdrop-blur-sm focus:border-cyan-400 focus:outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    {errors.status && <p className="font-mono text-sm text-red-400">{errors.status}</p>}
                                </div>
                            </div>

                            {/* Affiliate Commission Rate & Default Product */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="affiliate_commission_rate" className="font-mono text-sm tracking-wider text-gray-500 uppercase">
                                        Affiliate Commission Rate (%)
                                    </Label>
                                    <Input
                                        id="affiliate_commission_rate"
                                        type="number"
                                        step="0.01"
                                        value={data.affiliate_commission_rate || ''}
                                        onChange={(e) => setData('affiliate_commission_rate', e.target.value ? parseFloat(e.target.value) : null)}
                                        className="border-primary/20 bg-primary-foreground/70 text-foreground backdrop-blur-sm focus:border-cyan-400"
                                        placeholder="Leave empty to use global rate"
                                    />
                                    <p className="text-xs text-gray-400">Optional. Leave empty to use the global default commission rate.</p>
                                    {errors.affiliate_commission_rate && (
                                        <p className="font-mono text-sm text-red-400">{errors.affiliate_commission_rate}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-mono text-sm tracking-wider text-gray-500 uppercase">Default Product</Label>
                                    <div className="border-primary/20 bg-primary-foreground/70 flex items-center space-x-2 rounded-lg border p-4">
                                        <Checkbox
                                            id="is_default"
                                            checked={data.is_default}
                                            onCheckedChange={(checked) => setData('is_default', checked as boolean)}
                                        />
                                        <label htmlFor="is_default" className="text-sm text-gray-500">
                                            Set as default product (for registration)
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        If checked, new users will automatically get access to this product upon registration.
                                    </p>
                                    {errors.is_default && <p className="font-mono text-sm text-red-400">{errors.is_default}</p>}
                                </div>
                            </div>

                            {/* Lead Magnet Product */}
                            <div className="space-y-2">
                                <Label className="font-mono text-sm tracking-wider text-gray-500 uppercase">Lead Magnet Product</Label>
                                <div className="border-primary/20 bg-primary-foreground/70 flex items-center space-x-2 rounded-lg border p-4">
                                    <Checkbox
                                        id="is_lead_magnet"
                                        checked={data.is_lead_magnet}
                                        onCheckedChange={(checked) => setData('is_lead_magnet', checked as boolean)}
                                    />
                                    <label htmlFor="is_lead_magnet" className="text-sm text-gray-500">
                                        Set as Lead Magnet product (Bayar Suka Suka)
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400">
                                    If checked, this product will be used for the Lead Magnet landing page where users can pay any amount they want.
                                </p>
                                {errors.is_lead_magnet && <p className="font-mono text-sm text-red-400">{errors.is_lead_magnet}</p>}
                            </div>

                            {/* Type-specific fields */}
                            {data.type === 'ecourse' && (
                                <div className="space-y-2">
                                    <Label className="font-mono text-sm tracking-wider text-gray-500 uppercase">Select Courses</Label>
                                    <div className="border-primary/20 bg-primary-foreground/70 space-y-2 rounded-lg border p-4">
                                        {courses.length === 0 ? (
                                            <p className="text-sm text-gray-400">No available courses</p>
                                        ) : (
                                            courses.map((course) => (
                                                <div key={course.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`course-${course.id}`}
                                                        checked={selectedCourseIds.includes(course.id)}
                                                        onCheckedChange={() => handleCourseToggle(course.id)}
                                                    />
                                                    <label htmlFor={`course-${course.id}`} className="text-sm text-gray-500">
                                                        {course.name}
                                                    </label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {errors.course_ids && <p className="font-mono text-sm text-red-400">{errors.course_ids}</p>}
                                </div>
                            )}

                            {/* {data.type === 'template' && (
                                <div className="space-y-2">
                                    <Label htmlFor="file" className="font-mono text-sm tracking-wider text-gray-500 uppercase">
                                        Upload File
                                    </Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                        className="border-primary/20 bg-primary-foreground/70 text-foreground backdrop-blur-sm focus:border-cyan-400"
                                    />
                                    {progress && (
                                        <progress value={progress.percentage} max="100" className="w-full">
                                            {progress.percentage}%
                                        </progress>
                                    )}
                                    {errors.file && <p className="font-mono text-sm text-red-400">{errors.file}</p>}
                                </div>
                            )} */}

                            {(data.type === 'affiliate_link' || data.type === 'ebook' || data.type === 'template') && (
                                <div className="space-y-2">
                                    <Label htmlFor="external_url" className="font-mono text-sm tracking-wider text-gray-500 uppercase">
                                        URL
                                    </Label>
                                    <Input
                                        id="external_url"
                                        type="url"
                                        value={data.external_url}
                                        onChange={(e) => setData('external_url', e.target.value)}
                                        className="border-primary/20 bg-primary-foreground/70 text-foreground backdrop-blur-sm focus:border-cyan-400"
                                        placeholder="https://example.com"
                                    />
                                    {errors.external_url && <p className="font-mono text-sm text-red-400">{errors.external_url}</p>}
                                </div>
                            )}

                            {/* Files */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="thumbnail" className="font-mono text-sm tracking-wider text-gray-500 uppercase">
                                        Thumbnail
                                    </Label>
                                    <Input
                                        id="thumbnail"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setData('thumbnail', file); // Tetap update form data Inertia

                                            if (file) {
                                                // Buat blob URL untuk preview file baru
                                                setThumbnailPreview(URL.createObjectURL(file));
                                            } else {
                                                // Jika user batal pilih file, kembalikan ke thumbnail asli (jika ada)
                                                setThumbnailPreview(product?.thumbnail || null);
                                            }
                                        }}
                                        className="border-primary/20 bg-primary-foreground/70 text-foreground backdrop-blur-sm focus:border-cyan-400"
                                    />
                                    {errors.thumbnail && <p className="font-mono text-sm text-red-400">{errors.thumbnail}</p>}
                                    {/* --- TAMBAHKAN BLOK INI UNTUK PREVIEW --- */}
                                    {thumbnailPreview && (
                                        <div className="mt-4">
                                            <Label className="font-mono text-sm tracking-wider text-gray-500 uppercase">Preview</Label>
                                            <img
                                                src={thumbnailPreview}
                                                alt="Thumbnail preview"
                                                className="mt-2 aspect-video w-full max-w-xs rounded-lg border border-zinc-700/50 object-cover"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order" className="font-mono text-sm tracking-wider text-gray-500 uppercase">
                                        Display Order
                                    </Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        value={data.order}
                                        onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                        className="border-primary/20 bg-primary-foreground/70 text-foreground backdrop-blur-sm focus:border-cyan-400"
                                    />
                                    {errors.order && <p className="font-mono text-sm text-red-400">{errors.order}</p>}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.get('/admin/products')}
                                    className="text-foreground flex-1 border-zinc-600/50 backdrop-blur-sm hover:bg-gray-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 font-medium text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:from-cyan-600 hover:to-blue-600"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
