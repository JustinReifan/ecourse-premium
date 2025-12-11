import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { type Module } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, BookOpen, CheckCircle, ChevronRight, Clock, Download, ExternalLink, FileText, ListVideo, Play } from 'lucide-react';
import { useState } from 'react';

interface ModulePageProps {
    module: Module & {
        is_completed: boolean;
        description: string;
        duration: string;
        video_path: string;
        materials: {
            id: number;
            name: string;
            module_id: number;
            url: string;
            text: string;
        }[];
        course: {
            id: number;
            name: string;
            slug: string;
            description?: string;
            thumbnail?: string;
            completion_percentage: number;
            modules: (Module & {
                is_completed: boolean;
                duration: string;
                is_current: boolean;
            })[];
        };
    };
    prevModule?: { id: number; name: string; slug: string } | null;
    nextModule?: { id: number; name: string; slug: string } | null;
}

function ModuleCard({ module }: { module: ModulePageProps['module']['course']['modules'][0] }) {
    const visitModule = () => {
        router.get(route('member.module', { module: module.slug }));
    };

    return (
        <div
            className={`group hover:shadow-primary/10 relative cursor-pointer rounded-xl border p-4 transition-all duration-300 hover:shadow-2xl ${
                module.is_current
                    ? 'border-primary/50 from-primary/10 shadow-primary/20 to-primary/30 bg-gradient-to-r shadow-lg'
                    : 'hover:border-primary/30 border-primary/50 bg-primary/5 hover:bg-card'
            }`}
            onClick={visitModule}
        >
            {/* Animated border effect */}
            <div className="from-primary/0 via-primary/5 to-primary/0 absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative flex items-center space-x-4">
                {/* Play/Status Icon */}
                <div className="flex-shrink-0">
                    {module.is_completed ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-500/30 bg-green-500/20">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                        </div>
                    ) : module.is_current ? (
                        <div className="border-primary/80 bg-primary/50 animate-glow-pulse flex h-10 w-10 items-center justify-center rounded-full border-2">
                            <Play className="text-primary ml-0.5 h-5 w-5" fill="currentColor" />
                        </div>
                    ) : (
                        <div className="group-hover:border-primary/50 bg-primary/10 border-primary/30 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300">
                            <Play className="group-hover:text-primary ml-0.5 h-4 w-4 text-neutral-400" fill="currentColor" />
                        </div>
                    )}
                </div>

                {/* Module Info */}
                <div className="w-0 min-w-0 flex-1">
                    <h3
                        className={`truncate font-semibold transition-colors duration-300 ${
                            module.is_current ? 'text-primary' : 'group-hover:text-primary text-foreground'
                        }`}
                    >
                        {module.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="text-foreground flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{module.duration}</span>
                        </div>
                        {module.is_completed == true && <span className="text-xs font-medium text-green-400">Completed</span>}
                        {module.is_current && <span className="text-primary text-xs font-medium">Currently Playing</span>}
                    </div>
                </div>

                {/* Navigation Arrow */}
                <div className="flex-shrink-0">
                    <ChevronRight
                        className={`h-5 w-5 transition-all duration-300 ${
                            module.is_current ? 'text-primary' : 'group-hover:text-primary text-neutral-600 group-hover:translate-x-1'
                        }`}
                    />
                </div>
            </div>
        </div>
    );
}

function MaterialCard({ material }: { material: ModulePageProps['module']['materials'][0] }) {
    const handleMaterialClick = () => {
        if (material.url) {
            window.open(material.url, '_blank', 'noopener,noreferrer');
        }
    };

    const isExternalLink = !!material.url;

    return (
        <div
            className={`group hover:border-primary/30 hover:shadow-primary/10 border-primary/30 bg-primary/10 relative rounded-xl border p-4 transition-all duration-300 hover:shadow-2xl ${
                isExternalLink ? 'cursor-pointer' : ''
            }`}
            onClick={isExternalLink ? handleMaterialClick : undefined}
        >
            {/* Animated border effect */}
            <div className="from-primary/0 via-primary/5 to-primary/0 absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative flex items-start space-x-4">
                {/* Material Icon */}
                <div className="flex-shrink-0">
                    <div className="group-hover:border-primary/50 bg-primary/10transition-all border-primary/30 flex h-12 w-12 items-center justify-center rounded-full border-2 duration-300">
                        {isExternalLink ? (
                            <ExternalLink className="group-hover:text-primary text-foreground h-6 w-6 transition-colors" />
                        ) : (
                            <FileText className="group-hover:text-primary text-foreground h-6 w-6 transition-colors" />
                        )}
                    </div>
                </div>

                {/* Material Content */}
                <div className="w-0 min-w-0 flex-1">
                    <h3 className="group-hover:text-primary text-foreground mb-2 truncate font-semibold transition-colors duration-300">
                        {material.name}
                    </h3>

                    {material.text && <p className="text-muted-foreground text-sm leading-relaxed break-words">{material.text}</p>}

                    {isExternalLink && (
                        <div className="text-muted-foreground mt-2 flex items-center space-x-2 text-xs">
                            <span>Click to open external resource</span>
                            <ExternalLink className="h-3 w-3" />
                        </div>
                    )}
                </div>

                {/* Action Arrow for external links */}
                {isExternalLink && (
                    <div className="flex-shrink-0">
                        <ChevronRight className="group-hover:text-primary text-foreground h-5 w-5 transition-all duration-300 group-hover:translate-x-1" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Module({ module, prevModule, nextModule }: ModulePageProps) {
    const [isCompleted, setIsCompleted] = useState(module.is_completed);
    const [courseProgress, setCourseProgress] = useState(module.course.completion_percentage);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVideoProgress = (progress: number) => {
        // Video progress tracking
    };

    const handleVideoComplete = () => {
        if (!isCompleted) {
            markCompleteHandler();
        }
    };

    const markCompleteHandler = async () => {
        if (isLoading || isCompleted) return;

        setIsLoading(true);

        try {
            const response = await axios.post(
                route('member.module.complete', { module: module.id }),
                {}, // jika tidak ada payload
            );

            const data = response.data;

            if (data.success) {
                setIsCompleted(true);
                setCourseProgress(data.completion_percentage);
                setToastMessage(data.message);
                setShowToast(true);

                setTimeout(() => setShowToast(false), 3000);
            } else {
                throw new Error(data.message || 'Failed to mark module as complete');
            }
        } catch (error: any) {
            console.error('Error marking module complete:', error);
            setToastMessage(error.response?.data?.message || 'Failed to mark module as complete. Please try again.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToModule = (moduleSlug: string) => {
        router.get(route('member.module', { module: moduleSlug }));
    };

    return (
        <AppHeaderLayout
            breadcrumbs={[
                { title: 'Courses', href: route('member.index') },
                { title: module.course.name, href: route('member.course', { course: module.course.slug }) },
                { title: module.name },
            ]}
        >
            <Head title={`${module.name} - ${module.course.name}`} />

            {/* Toast Notification */}
            {showToast && (
                <div className="animate-fade-in fixed top-4 right-4 z-50">
                    <Alert className="border-primary/50 bg-primary/10 backdrop-blur-sm">
                        <CheckCircle className="text-primary h-4 w-4" />
                        <AlertDescription className="text-primary font-medium">{toastMessage}</AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="min-h-screen overflow-hidden">
                {/* Video Hero Section */}
                <div className="relative">
                    {/* Background Effects */}
                    <div className="absolute inset-0">
                        <div className="bg-primary/10 absolute top-20 left-1/4 h-32 w-32 animate-pulse rounded-full blur-3xl" />
                        <div
                            className="absolute right-1/3 bottom-10 h-24 w-24 animate-pulse rounded-full bg-cyan-500/10 blur-2xl"
                            style={{ animationDelay: '1s' }}
                        />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-12">
                        {/* Back Navigation */}
                        <div className="mb-6">
                            <Link href={route('member.course', { course: module.course.slug })}>
                                <Button
                                    variant="ghost"
                                    className="text-foreground h-auto cursor-pointer items-center p-0 text-left hover:bg-transparent hover:text-black"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4 flex-shrink-0" />
                                    <span className="whitespace-normal">Back to {module.course.name}</span>
                                </Button>
                            </Link>
                        </div>

                        {/* Module Header */}
                        <div className="mb-8">
                            <div className="mb-2 flex items-center space-x-2">
                                <BookOpen className="text-primary h-5 w-5" />
                                <span className="text-primary text-sm font-medium">{module.course.name}</span>
                            </div>
                            <h1 className="text-foreground mb-4 text-4xl font-bold lg:text-5xl">{module.name}</h1>

                            {module.description && (
                                <div 
                                    className="prose prose-invert max-w-3xl text-muted-foreground mb-4 prose-p:text-lg prose-p:leading-relaxed prose-li:text-base"
                                    dangerouslySetInnerHTML={{ __html: module.description }}
                                />
                            )}

                            <div className="text-foreground flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{module.duration}</span>
                                </div>
                                {isCompleted == true && (
                                    <div className="flex items-center space-x-2 text-green-400">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Completed</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Video Player */}
                        <div className="relative mb-8">
                            <VideoPlayer
                                src={module.video_path}
                                title={module.name}
                                onProgress={handleVideoProgress}
                                onComplete={handleVideoComplete}
                                className="aspect-video w-full lg:h-[600px]"
                            />

                            {/* Completion Actions */}
                            {!isCompleted && (
                                <div className="absolute top-4 right-4">
                                    <Button
                                        onClick={markCompleteHandler}
                                        disabled={isLoading}
                                        className="bg-primary/70 border-primary/50 hover:bg-primary border text-xs text-black transition-all duration-300 hover:text-black lg:text-sm"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {isLoading ? 'Marking...' : 'Mark Complete'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Navigation Controls */}
                        <div className="mb-12 flex items-center justify-between">
                            {prevModule ? (
                                <Button
                                    onClick={() => navigateToModule(prevModule.slug)}
                                    variant="outline"
                                    className="group hover:border-primary/50 hover:bg-primary/20 bg-primary/10 border-primary/30 text-foreground text-wrap hover:text-black"
                                >
                                    <ArrowLeft className="group-hover:text-primary mr-2 h-4 w-4 transition-colors" />
                                    Previous
                                </Button>
                            ) : (
                                <div />
                            )}

                            {nextModule && (
                                <Button
                                    onClick={() => navigateToModule(nextModule.slug)}
                                    className="group bg-primary/20 border-primary/50 text-primary hover:bg-primary border text-wrap hover:text-black"
                                >
                                    Next
                                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Module Materials Section */}
                {module.materials && module.materials.length > 0 && (
                    <div className="mx-auto max-w-7xl px-4 pb-12">
                        <div className="space-y-6">
                            <div className="text-center lg:text-left">
                                <div className="mb-2 flex items-center space-x-3">
                                    <Download className="text-primary h-6 w-6" />
                                    <h2 className="text-foreground text-3xl font-bold">Module Materials</h2>
                                </div>
                                <p className="text-muted-foreground">Additional resources and materials for this module</p>
                            </div>

                            {/* Materials Grid */}
                            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                                {module.materials.map((material, index) => (
                                    <div key={material.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                        <MaterialCard material={material} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Course Modules Section */}
                <div className="mx-auto max-w-7xl px-4 pb-16">
                    <div className="space-y-8">
                        <div className="text-center lg:text-left">
                            <div className="mb-2 flex items-center space-x-3">
                                <ListVideo className="text-primary h-6 w-6" />
                                <h2 className="text-foreground mb-2 text-3xl font-bold">Course Modules</h2>
                            </div>
                            <p className="text-muted-foreground">
                                {module.course.modules.filter((m) => m.is_completed).length} of {module.course.modules.length} modules completed
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-foreground text-sm font-medium">Course Progress</span>
                                <span className="text-primary text-sm font-bold">{courseProgress}%</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-800 backdrop-blur-sm">
                                <div
                                    className="from-primary/70 animate-glow-pulse via-primary/80 to-primary h-full rounded-full bg-gradient-to-r transition-all duration-1000"
                                    style={{ width: `${courseProgress}%` }}
                                />
                            </div>
                        </div>

                        {/* Modules List */}
                        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                            {module.course.modules.map((courseModule, index) => (
                                <div key={courseModule.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                    <ModuleCard module={courseModule} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppHeaderLayout>
    );
}
