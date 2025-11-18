import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { Course, PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Airplay, Rocket, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface MemberDashboardProps extends PageProps {
    courses: Course[];
}

function CourseCardSkeleton() {
    return (
        <Card className="group border-border/50 bg-card/50 overflow-hidden backdrop-blur-sm">
            <div className="relative aspect-video">
                <Skeleton className="h-full w-full" />
            </div>
            <CardContent className="p-6">
                <Skeleton className="mb-3 h-6 w-3/4" />
                <div className="mb-4 flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
            </CardContent>
        </Card>
    );
}

function visitCourse(slug: string) {
    return () => {
        router.get(route('member.course', { course: slug }));
    };
}

function CourseCard({ course }: { course: Course }) {
    const progressColor = course.completion_percentage > 75 ? 'bg-primary' : course.completion_percentage > 50 ? 'bg-yellow-500' : 'bg-orange-500';

    return (
        <Card
            className={cn(
                'group bg-card/50 border-border/50 overflow-hidden backdrop-blur-sm',
                'hover:border-primary/50 hover:bg-card/70 hover:shadow-primary/10 hover:shadow-2xl',
                'transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02]',
                'before:from-primary/5 relative cursor-pointer before:absolute before:inset-0 before:bg-gradient-to-br before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100',
            )}
            onClick={visitCourse(course.slug)}
        >
            <div className="from-secondary to-muted relative aspect-video overflow-hidden bg-gradient-to-br">
                {course.thumbnail ? (
                    <img
                        src={'/storage/' + course.thumbnail}
                        alt={course.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="from-primary/20 via-secondary to-muted flex h-full w-full items-center justify-center bg-gradient-to-br">
                        <div className="space-y-2 text-center">
                            <Rocket className="text-primary/60 mx-auto h-12 w-12" />
                            <div className="bg-primary/30 mx-auto h-1 w-16 animate-pulse rounded-full" />
                        </div>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Progress badge */}
                <div className="absolute top-3 right-3">
                    <Badge
                        variant="secondary"
                        className={cn('border-primary/30 bg-black/70 text-white', course.completion_percentage === 100 && 'text-primary')}
                    >
                        <Airplay className="mr-1 h-3 w-3" />
                        {course.completion_percentage}%
                    </Badge>
                </div>
            </div>

            <CardContent className="space-y-4 p-6">
                <div>
                    <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-lg font-semibold transition-colors duration-300">
                        {course.name}
                    </h3>

                    <div className="text-muted-foreground mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <Rocket className="h-4 w-4" />
                            <span>{course.module_count} Modules</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <div className={cn('h-2 w-2 rounded-full', progressColor)} />
                            <span>
                                {course.completion_percentage == 100
                                    ? 'Completed'
                                    : course.completion_percentage == 0
                                      ? 'Not Started'
                                      : 'In Progress'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="text-muted-foreground flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{course.completion_percentage}%</span>
                    </div>
                    <div className="bg-secondary h-2 overflow-hidden rounded-full">
                        <div
                            className={cn(
                                'relative h-full overflow-hidden rounded-full transition-all duration-1000',
                                progressColor,
                                // course.completion_percentage > 0 && 'animate-pulse',
                            )}
                            style={{ width: `${course.completion_percentage}%` }}
                        >
                            {course.completion_percentage > 0 && (
                                <div className="animate-data-flow absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function MemberDashboard({ courses = [] }: MemberDashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) return courses;

        return courses.filter(
            (course) =>
                course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [courses, searchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <>
            <Head title="Member Dashboard" />

            <AppLayout>
                <div className="from-background via-background to-secondary/10 min-h-screen bg-gradient-to-br">
                    {/* Hero Section */}
                    <div className="from-background via-primary/5 to-background border-border/50 relative overflow-hidden border-b bg-gradient-to-r">
                        {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23059669" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" /> */}

                        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                            <div className="animate-fade-in space-y-4 text-center">
                                <div className="bg-primary/10 border-primary/20 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium">
                                    <Rocket className="h-4 w-4" />
                                    <span>Learning Dashboard</span>
                                </div>

                                <h1 className="from-foreground via-primary to-foreground animate-gradient-x bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
                                    Your Learning Journey
                                </h1>

                                <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
                                    Continue your progress and explore new courses to advance your skills
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="bg-background/80 border-border/50 sticky top-0 z-10 border-b backdrop-blur-md">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            <div className="relative mx-auto max-w-md">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform" />
                                <Input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="bg-card/50 border-border/50 border-primary/30 focus:border-primary/50 focus:ring-primary/20 rounded-xl border py-3 pr-4 pl-10 text-base backdrop-blur-sm"
                                />
                                {searchQuery && (
                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                        <Badge variant="outline" className="text-xs">
                                            {filteredCourses.length} found
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Courses Grid */}
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <CourseCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div className="space-y-4 py-16 text-center">
                                <div className="bg-secondary/20 mx-auto flex h-24 w-24 items-center justify-center rounded-full">
                                    <Search className="text-muted-foreground h-10 w-10" />
                                </div>
                                <h3 className="text-foreground text-xl font-semibold">{searchQuery ? 'No courses found' : 'No courses available'}</h3>
                                <p className="text-muted-foreground mx-auto max-w-md">
                                    {searchQuery
                                        ? `No courses match "${searchQuery}". Try a different search term.`
                                        : 'There are no courses available at the moment. Check back later!'}
                                </p>
                            </div>
                        ) : (
                            <div className="animate-fade-in grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                                {filteredCourses.map((course, index) => (
                                    <div
                                        key={course.id}
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                            animationFillMode: 'both',
                                        }}
                                        className="animate-fade-in"
                                    >
                                        <CourseCard course={course} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
