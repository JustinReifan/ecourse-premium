import { cn } from '@/lib/utils';
import { Award, Briefcase, Heart, Rocket, Sparkles, TrendingUp, Users } from 'lucide-react';

interface BenefitCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay?: number;
    gradient: string;
}

function BenefitCard({ icon, title, description, delay = 0, gradient }: BenefitCardProps) {
    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl p-6',
                'from-card/5 via-card/10 to-background/5 bg-gradient-to-br',
                'border-border/20 border backdrop-blur-xl',
                'hover:border-primary/30 hover:shadow-primary/5 hover:shadow-2xl',
                'transition-all duration-700 hover:-translate-y-2 hover:scale-[1.02]',
                'animate-fade-in cursor-pointer',
            )}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            {/* Background gradient effect */}
            <div
                className={cn('absolute inset-0 opacity-0 group-hover:opacity-100', 'bg-gradient-to-br transition-opacity duration-500', gradient)}
            />

            {/* Content */}
            <div className="relative z-10">
                <div
                    className={cn(
                        'mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl',
                        'bg-primary/10 border-primary/20 text-primary border',
                        'group-hover:bg-primary/20 group-hover:border-primary/40',
                        'group-hover:shadow-primary/20 group-hover:shadow-lg',
                        'transition-all duration-500 group-hover:scale-110 group-hover:rotate-3',
                    )}
                >
                    {icon}
                </div>
                <h3 className="text-foreground group-hover:text-primary mb-3 text-lg font-bold transition-colors duration-300">{title}</h3>
                <p className="text-muted-foreground group-hover:text-foreground/90 text-sm leading-relaxed transition-colors duration-300">
                    {description}
                </p>
            </div>

            {/* Floating particles effect */}
            <div
                className="bg-primary/30 absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full"
                style={{ animationDelay: `${delay + 500}ms` }}
            />
            <div
                className="bg-accent/40 absolute top-1/3 -left-1 h-1 w-1 animate-pulse rounded-full"
                style={{ animationDelay: `${delay + 1000}ms` }}
            />
        </div>
    );
}

export function ReasonJoinSection() {
    const benefits = [
        {
            icon: <Rocket className="h-7 w-7" />,
            title: 'Mentor Praktisi, Bukan Teoretisi',
            description:
                'Dibimbing langsung oleh praktisi 13 tahun pengalaman yang sudah terbukti mencetak 100 Juta pertamanya dari Lynk.id. Ilmu yang diajarkan murni dari pengalaman lapangan.',
            gradient: 'from-blue-500/10 via-purple-500/10 to-pink-500/10',
        },
        {
            icon: <Award className="h-7 w-7" />,
            title: 'Track Record Penjualan Nyata',
            description:
                'Bukan orang baru. Mentor memiliki portofolio bisnis yang konsisten menjual ribuan produk setiap tahunnya selama lebih dari satu dekade.',
            gradient: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10',
        },
        {
            icon: <Heart className="h-7 w-7" />,
            title: 'Circle Positif & Mentor Tersertifikasi',
            description:
                'Gabung bareng 400+ Emak-emak produktif di komunitas. Mentornya juga Certified BNSP & Resmi aktif sebagai Canvassador (Duta Canva Indonesia)',
            gradient: 'from-pink-500/10 via-purple-500/10 to-red-500/10',
        },
        {
            icon: <Briefcase className="h-7 w-7" />,
            title: 'Peluang Cuan Affiliate',
            description: 'Sambil belajar, bisa langsung cuan! Dapatkan akses eksklusif affiliate dengan komisi jumbo 50% (khusus member kelas ini)',
            gradient: 'from-blue-500/10 via-pink-500/10 to-purple-500/10',
        },
    ];

    return (
        <section className="border-border/20 relative overflow-hidden border-t py-24 lg:py-32">
            {/* Background effects */}
            {/* <div className="from-background via-background/50 to-background absolute inset-0 bg-gradient-to-b" />
            <div className="via-primary/20 absolute top-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" /> */}

            {/* Floating orbs */}
            {/* <div className="bg-primary/5 absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full blur-3xl" />
            <div
                className="bg-accent/5 absolute right-1/4 bottom-1/4 h-80 w-80 animate-pulse rounded-full blur-3xl"
                style={{ animationDelay: '2s' }}
            /> */}

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="animate-fade-in mb-16 text-center" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                    <div className="bg-primary/10 border-primary/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm">
                        <Sparkles className="h-4 w-4" />
                        Gabung Affiliate Jago Jualan
                    </div>
                    <h2 className="text-foreground mb-6 text-4xl font-bold lg:text-6xl">
                        Bingung Harus <span className="text-primary">Mulai dari Mana?</span>
                    </h2>
                    <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed">
                        Tenang, kamu nggak sendirian. Aku paham banget rasanya ingin mulai tapi takut salah langkah. Makanya, kelas ini disusun
                        pelan-pelan, urut dari dasar, dengan bahasa yang paling mudah dimengerti.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* Visual Section */}
                    <div className="animate-fade-in lg:col-span-5" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                        <div className="relative">
                            {/* Main image */}
                            <div className="border-border/20 shadow-primary/5 relative overflow-hidden rounded-3xl border shadow-2xl">
                                <img
                                    src="/storage/landing/whyjoin.png"
                                    alt="Professional designer working with Canva interface creating stunning designs"
                                    className="h-[400px] w-full object-cover transition-transform duration-1000 hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />

                                {/* Stats overlay */}
                                <div className="absolute right-4 bottom-4 left-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="bg-primary/10 border-border/20 rounded-xl border px-4 py-2 backdrop-blur-xl">
                                            <div className="flex items-center gap-2">
                                                <Users className="text-primary h-4 w-4" />
                                                <span className="text-foreground text-sm font-semibold">100M+ Users</span>
                                            </div>
                                        </div>
                                        <div className="bg-background/90 border-border/20 rounded-xl border px-4 py-2 backdrop-blur-xl">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                                                <span className="text-foreground text-sm font-semibold">100K+ Templates</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating elements */}
                            {/* <div className="bg-primary/10 border-primary/20 absolute -top-6 -right-6 flex h-20 w-20 animate-bounce items-center justify-center rounded-2xl border backdrop-blur-xl">
                                <Zap className="text-primary h-8 w-8" />
                            </div> */}

                            {/* <div className="bg-accent border-accent/20 absolute -bottom-6 -left-6 flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl border backdrop-blur-xl">
                                <Sparkles className="text-accent h-6 w-6" />
                            </div> */}
                        </div>
                    </div>

                    {/* Benefits Grid */}
                    <div className="animate-fade-in lg:col-span-7" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {benefits.map((benefit, index) => (
                                <BenefitCard
                                    key={benefit.title}
                                    icon={benefit.icon}
                                    title={benefit.title}
                                    description={benefit.description}
                                    gradient={benefit.gradient}
                                    delay={800 + index * 100}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="animate-fade-in mt-16 text-center" style={{ animationDelay: '1400ms', animationFillMode: 'both' }}>
                    <div className="from-primary/10 via-primary/5 to-accent/10 border-primary/20 rounded-2xl border bg-gradient-to-r p-8 backdrop-blur-xl">
                        <h3 className="text-foreground mb-4 text-xl font-bold">Mungkin Ini Jawaban yang Kamu Cari Selama Ini...</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Bukan kebetulan kamu membaca tulisan ini. Mungkin ini adalah sinyal kalau sudah saatnya kamu berhenti bingung dan mulai
                            melangkah. Mentornya sudah jelas, jalannya sudah ada. Sayang banget kan, kalau peluang sebaik ini dilewatkan begitu aja?
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
