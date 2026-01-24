import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowDown } from 'lucide-react';
import * as React from 'react';

const ctaButtonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 group relative overflow-hidden',
    {
        variants: {
            variant: {
                primary:
                    'bg-primary text-primary-foreground shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-105 hover:-translate-y-1 border border-primary/50 hover:border-primary',
                secondary:
                    'bg-transparent text-secondary-foreground border border-primary/50 hover:bg-secondary hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 backdrop-blur-sm',
            },
            size: {
                default: 'h-12 px-8 py-3 text-base',
                lg: 'h-12 px-10 py-4 text-base md:h-14 md:text-lg',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    },
);

// --- INTERFACE ---
interface CtaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof ctaButtonVariants> {
    asChild?: boolean;
    withInstruction?: boolean; // <--- Prop baru untuk mengaktifkan teks instruksi
    instructionText?: string; // <--- Opsional: jika ingin mengubah kata-katanya nanti
}

// --- COMPONENT ---
const CtaButton2 = React.forwardRef<HTMLButtonElement, CtaButtonProps>(
    ({ className, variant, size, asChild = false, withInstruction = false, instructionText, children, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';

        // 1. Render Tombol Utama
        const ButtonElement = (
            <Comp className={cn(ctaButtonVariants({ variant, size }), className)} ref={ref} {...props}>
                {/* Animated Gradient */}
                <div className="from-primary via-primary/80 to-primary absolute inset-0 rounded-full bg-gradient-to-r opacity-0 transition-opacity duration-1000 group-hover:opacity-100" />

                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

                {/* Content */}
                <span className="relative z-10 flex items-center gap-2">{children}</span>
            </Comp>
        );

        // 2. Logic Pengecekan: Apakah perlu instruksi?
        if (withInstruction) {
            return (
                <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-muted-foreground flex items-center justify-center gap-2 text-sm font-light">
                        <ArrowDown className="h-4 w-4" />

                        {instructionText || 'Klik tombol ini untuk gabung'}

                        <ArrowDown className="h-4 w-4" />
                    </span>

                    {ButtonElement}
                </div>
            );
        }

        // 3. Jika tidak butuh instruksi, render tombol saja (agar aman dipakai di navbar dll)
        return ButtonElement;
    },
);

CtaButton2.displayName = 'CtaButton2';

export { CtaButton2, ctaButtonVariants };
