import { cn } from '@/lib/utils';
import { Rocket } from 'lucide-react';

interface HeroBadgeProps {
    text: string;
    className?: string;
}

export function HeroBadge({ text, className }: HeroBadgeProps) {
    return (
        <div
            className={cn(
                'border-primary/30 from-primary/20 to-accent/20 text-primary inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-4 py-2 text-sm font-medium',
                'animate-glow-pulse hover:border-primary/40 transition-all duration-500',
                'shadow-primary/30 shadow-lg backdrop-blur-sm',
                className,
            )}
        >
            <Rocket className="h-4 w-4" />
            <span>{text}</span>
        </div>
    );
}
