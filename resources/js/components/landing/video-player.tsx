import { cn } from '@/lib/utils';
import { Pause, Play } from 'lucide-react';
import { useState } from 'react';

export function VideoPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="relative mx-auto max-w-6xl">
            <div
                className={cn(
                    'border-border/50 relative aspect-video overflow-hidden rounded-2xl border',
                    'from-secondary via-muted to-secondary/50 bg-gradient-to-br',
                    'shadow-primary/20 hover:shadow-primary/30 shadow-2xl transition-all duration-700',
                    'group',
                )}
            >
                {/* Video placeholder with gradient overlay */}
                <div className="from-primary/20 to-secondary/30 absolute inset-0 bg-gradient-to-br via-transparent" />

                {/* Demo content */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=675&fit=crop"
                        alt="Video editing demonstration"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                </div>

                {/* Glass morphism play controls */}
                <div
                    className={cn(
                        'absolute inset-0 flex items-center justify-center',
                        'bg-black/20 backdrop-blur-sm transition-opacity duration-500',
                        isPlaying ? 'opacity-0' : 'opacity-100 group-hover:opacity-80',
                    )}
                >
                    <button
                        onClick={togglePlay}
                        className={cn(
                            'flex h-20 w-20 items-center justify-center rounded-full',
                            'bg-primary/90 border-primary/50 shadow-primary/40 border shadow-2xl',
                            'hover:bg-primary transition-all duration-300 hover:scale-110',
                            'backdrop-blur-md group-hover:animate-pulse',
                        )}
                    >
                        {isPlaying ? (
                            <Pause className="text-primary-foreground ml-0 h-8 w-8" />
                        ) : (
                            <Play className="text-primary-foreground ml-1 h-8 w-8" />
                        )}
                    </button>
                </div>

                {/* Particle animation overlay */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="animate-data-flow bg-primary/30 absolute top-1/4 left-1/4 h-2 w-2 rounded-full" />
                    <div
                        className="animate-data-flow bg-primary/20 absolute top-3/4 right-1/4 h-1 w-1 rounded-full"
                        style={{ animationDelay: '1s' }}
                    />
                    <div
                        className="animate-data-flow bg-primary/25 absolute top-1/2 left-3/4 h-1.5 w-1.5 rounded-full"
                        style={{ animationDelay: '2s' }}
                    />
                </div>
            </div>
        </div>
    );
}
