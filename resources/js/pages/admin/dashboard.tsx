import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { Activity, BookOpen, Play, TrendingUp, Users, Zap } from 'lucide-react';

interface AdminDashboardProps {
    stats: {
        total_users: number;
        total_courses: number;
        total_modules: number;
        active_courses: number;
    };
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
    const breadcrumbs = [{ title: 'Admin', href: '/admin' }, { title: 'Dashboard' }];

    const statCards = [
        {
            title: 'Total Users',
            value: stats.total_users,
            icon: Users,
            color: 'from-cyan-400 to-blue-500',
            glow: 'shadow-cyan-500/20',
        },
        {
            title: 'Total Courses',
            value: stats.total_courses,
            icon: BookOpen,
            color: 'from-purple-400 to-pink-500',
            glow: 'shadow-purple-500/20',
        },
        {
            title: 'Total Modules',
            value: stats.total_modules,
            icon: Play,
            color: 'from-green-400 to-emerald-500',
            glow: 'shadow-green-500/20',
        },
        {
            title: 'Active Courses',
            value: stats.active_courses,
            icon: TrendingUp,
            color: 'from-yellow-400 to-orange-500',
            glow: 'shadow-yellow-500/20',
        },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="relative space-y-8 p-6">
                {/* Animated background elements */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl delay-1000"></div>
                </div>

                {/* Header with futuristic styling */}
                <div className="relative">
                    <div className="mb-2 flex items-center gap-4">
                        <div className="h-8 w-2 animate-pulse rounded-full bg-gradient-to-b from-cyan-400 to-blue-500"></div>
                        <h1 className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-4xl font-bold text-transparent">
                            Command Center
                        </h1>
                        <Zap className="h-8 w-8 animate-pulse text-yellow-400" />
                    </div>
                    <p className="ml-6 font-mono text-gray-400">SYSTEM STATUS: OPERATIONAL</p>
                </div>

                {/* Enhanced stats cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((stat, index) => (
                        <Card
                            key={index}
                            className={`border border-zinc-700/50 bg-gradient-to-br from-zinc-900/90 via-zinc-800/50 to-zinc-900/90 transition-all duration-500 hover:scale-105 hover:border-cyan-400/50 hover:shadow-2xl ${stat.glow} group animate-fade-in cursor-pointer backdrop-blur-sm`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative overflow-hidden p-6">
                                {/* Card glow effect */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
                                ></div>

                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className="mb-1 font-mono text-xs tracking-wider text-gray-500 uppercase">{stat.title}</p>
                                        <p className="text-3xl font-bold text-white transition-colors duration-300 group-hover:text-cyan-200">
                                            {stat.value.toLocaleString()}
                                        </p>
                                    </div>
                                    <div
                                        className={`rounded-xl bg-gradient-to-r p-4 ${stat.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>

                                {/* Progress indicator */}
                                <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-700">
                                    <div
                                        className={`h-full bg-gradient-to-r ${stat.color} -translate-x-full transform rounded-full transition-transform duration-1000 group-hover:translate-x-0`}
                                    ></div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                    {/* Enhanced Quick Actions */}
                    <Card className="border border-zinc-700/50 bg-gradient-to-br from-zinc-900/90 via-zinc-800/50 to-zinc-900/90 backdrop-blur-sm transition-all duration-500 hover:border-cyan-400/30">
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <Activity className="h-6 w-6 text-cyan-400" />
                                <h3 className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-xl font-bold text-transparent">
                                    Quick Actions
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { href: '/admin/courses', icon: BookOpen, label: 'Manage Courses', color: 'from-purple-500 to-pink-500' },
                                    { href: '/admin/users', icon: Users, label: 'Manage Users', color: 'from-blue-500 to-cyan-500' },
                                    { href: '/admin/modules', icon: Play, label: 'Manage Modules', color: 'from-green-500 to-emerald-500' },
                                ].map((action, index) => (
                                    <a
                                        key={index}
                                        href={action.href}
                                        className="group flex items-center gap-4 rounded-xl border border-zinc-700/30 bg-zinc-800/50 p-4 transition-all duration-300 hover:scale-102 hover:border-cyan-400/50 hover:bg-zinc-700/50"
                                    >
                                        <div
                                            className={`rounded-lg bg-gradient-to-r p-3 ${action.color} transition-transform duration-300 group-hover:scale-110`}
                                        >
                                            <action.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="font-medium text-white transition-colors group-hover:text-cyan-200">{action.label}</span>
                                        <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                                            <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400"></div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Enhanced Recent Activity */}
                    <Card className="border border-zinc-700/50 bg-gradient-to-br from-zinc-900/90 via-zinc-800/50 to-zinc-900/90 backdrop-blur-sm transition-all duration-500 hover:border-cyan-400/30">
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="h-3 w-3 animate-pulse rounded-full bg-green-400"></div>
                                <h3 className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-xl font-bold text-transparent">
                                    System Activity
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { status: 'success', message: 'New course created', time: '2 min ago', color: 'green' },
                                    { status: 'warning', message: 'Module updated', time: '5 min ago', color: 'yellow' },
                                    { status: 'info', message: 'User registered', time: '10 min ago', color: 'blue' },
                                ].map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 rounded-lg border border-zinc-700/20 bg-zinc-800/30 p-3 transition-colors hover:bg-zinc-700/30"
                                    >
                                        <div className={`h-3 w-3 bg-${activity.color}-400 animate-pulse rounded-full`}></div>
                                        <span className="flex-1 font-mono text-sm text-gray-300">{activity.message}</span>
                                        <Badge variant="secondary" className="bg-zinc-700/50 font-mono text-xs text-gray-400">
                                            {activity.time}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
