import { cn } from '@/lib/utils';
import { Briefcase, Heart, Sparkles, TicketPercent, TrendingUp, Users } from 'lucide-react';

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
            icon: <Users className="h-7 w-7" />,
            title: 'Step by step bikin produk digital pertama',
            description: 'Step by step kamu faham bisnis produk digital secara sederhana',
            gradient: 'from-blue-500/10 via-purple-500/10 to-pink-500/10',
        },
        {
            icon: <TrendingUp className="h-7 w-7" />,
            title: 'Ide produk yang bisa laku & bermanfaat',
            description:
                'Bingung mau jual apa? Kita akan gali potensi dirimu untuk nemuin ide produk yang nggak cuma laku, tapi juga bawa manfaat buat orang lain',
            gradient: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10',
        },
        {
            icon: <Heart className="h-7 w-7" />,
            title: 'Belajar branding dan jualan halus, tanpa maksa',
            description:
                'Jualan nggak harus nyepam atau ganggu teman. Kamu bakal belajar cara elegan biar pembeli yang nyari kamu, bukan kamu yang ngejar-ngejar mereka',
            gradient: 'from-pink-500/10 via-purple-500/10 to-red-500/10',
        },
        {
            icon: <Briefcase className="h-7 w-7" />,
            title: 'Mindset & manajemen waktu biar gak burnout',
            description:
                'Bangun bisnis bukan berarti ninggalin kewajiban rumah. Kita benahi pola pikir dan cara atur waktu biar tetap produktif tanpa harus burnout.',
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
                        Tempat Belajar Terbaik
                    </div>
                    <h2 className="text-foreground mb-6 text-4xl font-bold capitalize lg:text-6xl">
                        Kamu ibu rumah tangga, <span className="text-primary">pengen bantu suami tapi takut karena gaptek?</span>
                    </h2>
                    <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed">
                        Tenang. Di kelas ini kamu gak cuma belajar teknis, tapi juga dipandu lewat video step by step dari yang gak tau apa itu produk
                        digital sampe beneran ngerti dan praktek.
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
                                    src="/storage/landing/whyjoin2.webp"
                                    alt="Professional designer working with Canva interface creating stunning designs"
                                    className="h-[400px] w-full object-cover transition-transform duration-1000 hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="from-background/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />

                                {/* Stats overlay */}
                                <div className="absolute right-4 bottom-4 left-4">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* <div className="bg-primary/10 border-border/20 rounded-xl border px-4 py-2 backdrop-blur-xl">
                                            <div className="flex items-center gap-2">
                                                <Award className="text-primary h-4 w-4" />
                                                <span className="text-foreground text-sm font-semibold">E-certificate</span>
                                            </div>
                                        </div> */}
                                        <div className="bg-primary/10 border-border/20 rounded-xl border px-4 py-2 backdrop-blur-xl">
                                            <div className="flex items-center gap-2">
                                                <TicketPercent className="h-4 w-4 text-emerald-400" />
                                                <span className="text-foreground text-sm font-semibold">Bayar Suka Suka</span>
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
                        <h3 className="text-foreground mb-4 text-xl font-bold">💸 Bayar suka-suka aja.</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Aku buatin ini khusus biar kamu bisa kenal dulu sama potensi digital, tanpa takut pusing, tanpa tekanan.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Mau Rp. 10 ribu, mau 50 ribu, terserah — yang penting kamu niat mulai.{' '}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
