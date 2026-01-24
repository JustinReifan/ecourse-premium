import { cn } from '@/lib/utils';
import { CheckCircle, HandCoins, Shield } from 'lucide-react';

interface BenefitItemProps {
    icon: React.ReactNode;
    title: string;
    delay?: number;
}

function BenefitItem({ icon, title, delay = 0 }: BenefitItemProps) {
    return (
        <div
            className={cn(
                'group flex items-center gap-4 rounded-xl p-4',
                'bg-card/30 border-border/30 border backdrop-blur-sm',
                'hover:bg-card/50 hover:border-primary/30 hover:shadow-primary/10 hover:shadow-lg',
                'transition-all duration-500 hover:-translate-y-1',
                'animate-fade-in cursor-pointer',
            )}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            <div
                className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                    'bg-primary/10 border-primary/20 text-primary border',
                    'group-hover:bg-primary/20 group-hover:border-primary/40',
                    'transition-all duration-300 group-hover:scale-110',
                )}
            >
                {icon}
            </div>
            <span className="text-foreground group-hover:text-primary flex-1 font-medium transition-colors duration-300">{title}</span>
        </div>
    );
}

export function LearningBenefits() {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-full">
                        <CheckCircle className="text-primary h-12 w-12" />
                    </div>
                    <h3 className="text-foreground text-2xl font-bold">Kalian Akan Belajar</h3>
                </div>
                <h2 className="text-primary text-5xl font-bold">Davinci Resolve</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    Davinci Resolve adalah software editing powerfull all in one yang dikembangkan oleh blackmagic design software ini akan menjadi
                    software utama yang kalian gunakan dalam editor amplifier karena :
                </p>
                {/* <p className="text-muted-foreground/80 text-sm">
                    Dari basic hingga advanced techniques yang akan mengubah konten Anda menjadi karya profesional.
                </p> */}
            </div>

            <div className="space-y-4">
                <BenefitItem icon={<HandCoins className="h-6 w-6" />} title="Gratis, jadi gaperlu bayar apa apa lagi" delay={100} />
                <BenefitItem
                    icon={<CheckCircle className="h-6 w-6" />}
                    title="Fitur Lengkap, vfx, animasi, color grade (semuanya lengkap jadi gaperlu belajar software lain)"
                    delay={200}
                />
                <BenefitItem
                    icon={<Shield className="h-6 w-6" />}
                    title="Reliable, sudah berjalan dari 2004 dan fundamentalnya selalu sama"
                    delay={300}
                />
            </div>
        </div>
    );
}
