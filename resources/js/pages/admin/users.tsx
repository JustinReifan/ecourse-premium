
import { DataTable } from '@/components/admin/data-table';
import { ExpandableText } from '@/components/expandable-text';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Calendar, Shield, User as UserIcon, Zap } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    role: 'admin' | 'member';
    created_at: string;
}

interface UsersPageProps {
    users: User[];
}

export default function UsersPage({ users }: UsersPageProps) {
    const { flash } = usePage().props as any;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

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
        username: '',
        name: '',
        email: '',
        password: '',
        role: 'member' as 'admin' | 'member',
    });

    const breadcrumbs = [{ title: 'Admin', href: '/admin' }, { title: 'Users' }];

    const columns = [
        {
            key: 'username' as keyof User,
            label: 'Username',
            sortable: true,
            render: (value: string, user: User) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-400/30">
                        <UserIcon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-white transition-colors group-hover:text-cyan-200">@{value}</p>
                        <p className="text-sm text-gray-400">{user.name}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'email' as keyof User,
            label: 'Email',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono text-sm text-gray-300">{value}</span>
            ),
        },
        {
            key: 'role' as keyof User,
            label: 'Role',
            render: (value: string) => (
                <Badge
                    className={`${
                        value === 'admin'
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/25'
                            : 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-200 shadow-lg shadow-slate-500/25'
                    } rounded-full px-3 py-1 font-mono text-xs tracking-wider uppercase transition-transform duration-200 hover:scale-105`}
                >
                    <div className={`mr-2 h-2 w-2 rounded-full ${value === 'admin' ? 'bg-black animate-pulse' : 'bg-slate-300'}`}></div>
                    <Shield className="mr-1 h-3 w-3" />
                    {value}
                </Badge>
            ),
        },
        {
            key: 'created_at' as keyof User,
            label: 'Registered',
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
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setData({
            username: user.username,
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
        });
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = (user: User) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(`/admin/users/${user.id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            put(`/admin/users/${editingUser.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/users', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="relative p-6">
                {flash.success && (
                    <Alert variant="destructive" className="mb-4 border border-green-500/30 bg-gradient-to-r from-green-500/20 to-zinc-900">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {/* Animated background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 right-20 h-60 w-60 animate-pulse rounded-full bg-gradient-to-r from-yellow-500/10 to-amber-500/10 blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 h-60 w-60 animate-pulse rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl delay-1000"></div>
                </div>

                <div className="relative z-10">
                    <DataTable
                        data={users}
                        columns={columns}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        title="User Management"
                        addButtonText="Add User"
                        searchPlaceholder="Search users..."
                    />
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md border border-zinc-700/50 bg-gradient-to-br from-zinc-900/95 via-zinc-800/50 to-zinc-900/95 text-white backdrop-blur-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-2xl font-bold text-transparent">
                            <Zap className="h-6 w-6 text-yellow-400" />
                            {editingUser ? 'Modify User' : 'Create User'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Username
                            </Label>
                            <Input
                                id="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-yellow-400 focus:ring-yellow-400/20"
                                placeholder="Enter username"
                            />
                            {errors.username && <p className="mt-1 font-mono text-sm text-red-400">{errors.username}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-yellow-400 focus:ring-yellow-400/20"
                                placeholder="Enter full name"
                            />
                            {errors.name && <p className="mt-1 font-mono text-sm text-red-400">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={!!editingUser}
                                className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-yellow-400 focus:ring-yellow-400/20 disabled:opacity-50"
                                placeholder="Enter email"
                            />
                            {errors.email && <p className="mt-1 font-mono text-sm text-red-400">{errors.email}</p>}
                        </div>

                        {!editingUser && (
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="rounded-lg border-zinc-700/50 bg-zinc-800/50 text-white backdrop-blur-sm focus:border-yellow-400 focus:ring-yellow-400/20"
                                    placeholder="Enter password"
                                />
                                {errors.password && <p className="mt-1 font-mono text-sm text-red-400">{errors.password}</p>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="role" className="font-mono text-sm tracking-wider text-gray-300 uppercase">
                                Role
                            </Label>
                            <select
                                id="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value as 'admin' | 'member')}
                                className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-white backdrop-blur-sm focus:border-yellow-400 focus:outline-none"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors.role && <p className="mt-1 font-mono text-sm text-red-400">{errors.role}</p>}
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
                                className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 font-medium text-black shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:from-yellow-600 hover:to-amber-600 hover:shadow-yellow-500/40"
                            >
                                {processing ? 'Processing...' : editingUser ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
