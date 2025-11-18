import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { type Course, type Module } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BookCopy, CheckCircle, ChevronDown, Clock, Play } from 'lucide-react';
import { useState } from 'react';

interface CoursePageProps {
    course: Course & {
        modules: (Module & {
            is_completed: boolean;
            duration: string;
        })[];
    };
}

function visitModule(slug: string) {
    return () => {
        router.get(route('member.module', { module: slug }));
    };
}

function ModuleCard({ module, index }: { module: CoursePageProps['course']['modules'][0]; index: number }) {
    return (
        <div className="group hover:border-primary/30 hover:shadow-primary/10 hover-scale-102 relative rounded-xl border border-neutral-800/50 bg-gradient-to-r from-neutral-900/50 to-black/50 p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
            {/* Animated border effect */}
            <div className="from-primary/0 via-primary/5 to-primary/0 absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative flex items-center space-x-4">
                {/* Module Number */}
                <div className="flex-shrink-0">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                            module.is_completed
                                ? 'border-2 border-green-500/30 bg-green-500/20 text-green-400'
                                : 'group-hover:border-primary/50 border-2 border-neutral-700 bg-neutral-800 text-neutral-400'
                        }`}
                    >
                        {module.is_completed == true ? <CheckCircle className="h-5 w-5" /> : <span>{index + 1}</span>}
                    </div>
                </div>

                {/* Module Info */}
                <div className="min-w-0 flex-1">
                    <h3 className="group-hover:text-primary truncate font-semibold text-white transition-colors duration-300">{module.name}</h3>
                    <div className="mt-1 flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-neutral-400">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{module.duration}</span>
                        </div>
                        {module.is_completed == true && <span className="text-xs font-medium text-green-400">Completed</span>}
                    </div>
                </div>

                {/* Play Button */}
                <div className="flex-shrink-0">
                    <button
                        className="bg-primary/10 border-primary/30 text-primary hover:bg-primary group-hover:animate-glow-pulse flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 hover:text-black"
                        onClick={visitModule(module.slug!)}
                    >
                        <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Course({ course }: CoursePageProps) {
    const [openModules, setOpenModules] = useState<number[]>([0]); // First module open by default

    const toggleModule = (moduleIndex: number) => {
        setOpenModules((prev) => (prev.includes(moduleIndex) ? prev.filter((i) => i !== moduleIndex) : [...prev, moduleIndex]));
    };

    // Group modules into sections (for demo purposes, grouping every 3-4 modules)
    const moduleSections = course.modules.reduce((sections: any[], module, index) => {
        const sectionIndex = Math.floor(index / 50);
        if (!sections[sectionIndex]) {
            sections[sectionIndex] = {
                title: `Modules`,
                modules: [],
            };
        }
        sections[sectionIndex].modules.push({ ...module, originalIndex: index });
        return sections;
    }, []);

    // const mobileSidebarContent = <CourseMobileSidebar course={course} />;

    return (
        <AppHeaderLayout breadcrumbs={[{ title: 'Courses', href: route('member.index') }, { title: course.name }]}>
            <Head title={course.name} />

            <div className="min-h-screen bg-black">
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="from-primary/5 absolute inset-0 bg-gradient-to-b via-transparent to-transparent" />
                    <div className="absolute inset-0">
                        <div className="bg-primary/10 absolute top-20 left-1/4 h-32 w-32 animate-pulse rounded-full blur-3xl" />
                        <div
                            className="absolute right-1/3 bottom-10 h-24 w-24 animate-pulse rounded-full bg-cyan-500/10 blur-2xl"
                            style={{ animationDelay: '1s' }}
                        />
                    </div>

                    <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-12 md:pt-16 md:pb-20">
                        <div className="mb-6 lg:hidden">
                            <Link href="/">
                                <Button variant="ghost" className="p-0 text-neutral-400 hover:text-white">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Courses
                                </Button>
                            </Link>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
                            <div className="lg:hidden">
                                <div className="sticky top-8">
                                    <div className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black">
                                        <img
                                            src={'/storage/' + course.thumbnail}
                                            alt={course.name}
                                            className="h-64 w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Progress Overlay */}
                                        <div className="absolute right-4 bottom-4 left-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-medium text-white">Progress</span>
                                                <span className="text-foreground text-sm font-bold">{course.completion_percentage}%</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-black/40 backdrop-blur-sm">
                                                <div
                                                    className="bg-primary h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${course.completion_percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Course Info */}
                            <div className="space-y-6 lg:col-span-2">
                                <div className="animate-fade-in">
                                    <h1 className="mb-4 text-4xl leading-tight font-bold text-white lg:text-5xl">
                                        <span className="from-primary to-primary animate-gradient-x via-foreground bg-gradient-to-r bg-clip-text text-transparent">
                                            {course.name}
                                        </span>
                                    </h1>

                                    {course.description && <p className="max-w-3xl text-lg leading-relaxed text-neutral-300">{course.description}</p>}
                                </div>

                                {/* Course Stats */}
                                <div className="flex flex-wrap gap-6 border-t border-b border-neutral-800 py-6">
                                    <div className="text-center">
                                        <div className="text-primary text-2xl font-bold">{course.modules.length}</div>
                                        <div className="text-sm text-neutral-400">Modules</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-primary text-2xl font-bold">{course.completion_percentage}%</div>
                                        <div className="text-sm text-neutral-400">Complete</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-primary text-2xl font-bold">{course.modules.filter((m) => m.is_completed).length}</div>
                                        <div className="text-sm text-neutral-400">Finished</div>
                                    </div>
                                </div>
                            </div>

                            {/* Course Thumbnail - Desktop Only */}
                            <div className="hidden lg:block">
                                <div className="sticky top-8">
                                    <div className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black">
                                        <img
                                            src={'/storage/' + course.thumbnail}
                                            alt={course.name}
                                            className="h-64 w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Progress Overlay */}
                                        <div className="absolute right-4 bottom-4 left-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-medium text-white">Progress</span>
                                                <span className="text-foreground text-sm font-bold">{course.completion_percentage}%</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-black/40 backdrop-blur-sm">
                                                <div
                                                    className="bg-primary h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${course.completion_percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modules Section */}
                <div className="mx-auto max-w-6xl px-4 pb-16">
                    <div className="space-y-8">
                        <div className="text-center lg:text-left">
                            <h2 className="mb-2 text-3xl font-bold text-white">Course Modules</h2>
                            <p className="text-neutral-400">Expand sections to view individual modules</p>
                        </div>

                        {/* Module Sections */}
                        <div className="space-y-4">
                            {moduleSections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="animate-fade-in" style={{ animationDelay: `${sectionIndex * 100}ms` }}>
                                    <Collapsible open={openModules.includes(sectionIndex)} onOpenChange={() => toggleModule(sectionIndex)}>
                                        <CollapsibleTrigger className="group w-full">
                                            <div className="hover:border-primary/30 hover:shadow-primary/5 flex items-center justify-between rounded-xl border border-neutral-800 bg-gradient-to-r from-neutral-900/80 to-black/80 p-6 transition-all duration-300 hover:shadow-lg">
                                                <div className="flex items-center space-x-4">
                                                    <div className="from-primary/20 to-primary/5 border-primary/30 flex h-12 w-12 items-center justify-center rounded-full border bg-gradient-to-br">
                                                        <span className="text-primary font-bold">
                                                            <BookCopy />
                                                        </span>
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="group-hover:text-primary text-xl font-semibold text-white transition-colors duration-300">
                                                            {section.title}
                                                        </h3>
                                                        <p className="text-sm text-neutral-400">
                                                            {section.modules.length} modules •{' '}
                                                            {section.modules.filter((m: any) => m.is_completed).length} completed
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronDown
                                                    className={`group-hover:text-primary h-6 w-6 text-neutral-400 transition-all duration-300 ${openModules.includes(sectionIndex) ? 'rotate-180' : ''}`}
                                                />
                                            </div>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent className="overflow-hidden">
                                            <div className="mt-4 space-y-3 pl-6">
                                                {section.modules.map((module: any, moduleIndex: number) => (
                                                    <ModuleCard key={module.id} module={module} index={module.originalIndex} />
                                                ))}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppHeaderLayout>
    );
}
