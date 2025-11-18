import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { Airplay, ArrowLeft, BookOpen, Rocket } from 'lucide-react';

interface Course {
    id: number;
    name: string;
    slug: string;
    thumbnail: string | null;
    completion_percentage: number;
    module_count?: number;
}

interface Product {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    courses: Course[];
}

interface ProductDetailProps {
    product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
    const visitCourse = (slug: string) => {
        router.get(route('member.course', { course: slug }));
    };

    return (
        <>
            <Head title={product.title} />

            <AppLayout>
                <div className="from-background via-background to-secondary/10 min-h-screen bg-gradient-to-br">
                    {/* Header */}
                    <div className="border-border/50 from-background via-primary/5 to-background relative overflow-hidden border-b bg-gradient-to-r">
                        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                            <Button variant="outline" onClick={() => router.get(route('member.products'))} className="mb-6">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Library
                            </Button>

                            <div className="space-y-4">
                                <h1 className="animate-gradient-x from-foreground via-primary to-foreground bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
                                    {product.title}
                                </h1>
                                {product.description && <p className="text-muted-foreground max-w-2xl text-xl">{product.description}</p>}
                                <Badge className="rounded-full px-3 text-base">
                                    {product.courses.length} Course{product.courses.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Courses Grid */}
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {product.courses.length === 0 ? (
                            <Card className="border-border/50 bg-card/30 p-12 text-center">
                                <BookOpen className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                                <h3 className="text-foreground mb-2 text-xl font-semibold">No Courses Yet</h3>
                                <p className="text-muted-foreground">Courses will be added soon</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                                {product.courses.map((course) => {
                                    const progressColor =
                                        course.completion_percentage > 75
                                            ? 'bg-primary'
                                            : course.completion_percentage > 50
                                              ? 'bg-yellow-500'
                                              : 'bg-orange-500';

                                    return (
                                        <Card
                                            key={course.id}
                                            className={cn(
                                                'group bg-card/50 border-border/50 overflow-hidden backdrop-blur-sm',
                                                'hover:border-primary/50 hover:bg-card/70 hover:shadow-primary/10 hover:shadow-2xl',
                                                'transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02]',
                                                'before:from-primary/5 relative cursor-pointer before:absolute before:inset-0 before:bg-gradient-to-br before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100',
                                            )}
                                            onClick={() => visitCourse(course.slug)}
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

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                                <div className="absolute top-3 right-3">
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn(
                                                            'border-primary/30 bg-black/70 text-white',
                                                            course.completion_percentage === 100 && 'text-primary',
                                                        )}
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
                                                            <span>{course.module_count || 0} Modules</span>
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
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
