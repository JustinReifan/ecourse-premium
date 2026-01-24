import { cn } from '@/lib/utils';
import { Award, CheckCircle, Instagram, Play, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Credential {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    verified: boolean;
}

interface Achievement {
    id: string;
    image: string;
    title: string;
    description: string;
}

const credentials: Credential[] = [
    {
        id: '1',
        title: '13+ Tahun Praktisi Jualan Online',
        description: 'Bukan sekadar teori. Terbukti membangun brand @latheefa_id dengan konsistensi penjualan ribuan produk setiap tahunnya.',
        icon: <Award className="h-5 w-5" />,
        verified: true,
    },
    {
        id: '2',
        title: 'Sertifikasi BNSP Social Media Marketing',
        description: 'Kompetensi yang diakui negara. Tersertifikasi resmi sebagai ahli Social Media Marketing dengan standar profesional.',
        icon: <CheckCircle className="h-5 w-5" />,
        verified: true,
    },
    {
        id: '4',
        title: 'Impactful Content Creator',
        description: 'Strategi konten yang tervalidasi dengan 7.3 Juta+ tayangan dan komunitas loyal 48 Ribu+ pengikut di Instagram.',
        icon: <TrendingUp className="h-5 w-5" />,
        verified: true,
    },
];

const achievements: Achievement[] = [
    {
        id: '1',
        image: '/storage/landing/mentor/1.png',
        title: 'Hollywood Project',
        description: 'Color grading for indie film',
    },
    {
        id: '2',
        image: '/storage/landing/mentor/2.png',
        title: 'Netflix Series',
        description: 'Post-production supervisor',
    },
    {
        id: '3',
        image: '/storage/landing/mentor/3.png',
        title: 'Music Video',
        description: 'Grammy nominated artist',
    },
    {
        id: '4',
        image: '/storage/landing/mentor/4.png',
        title: 'Commercial Work',
        description: 'Fortune 500 companies',
    },
    {
        id: '5',
        image: '/storage/landing/mentor/5.png',
        title: 'Documentary',
        description: 'Award winning documentary',
    },
    {
        id: '6',
        image: '/storage/landing/mentor/6.png',
        title: 'Training Content',
        description: 'Educational video series',
    },
];

interface CredentialItemProps {
    credential: Credential;
    delay: number;
}

function CredentialItem({ credential, delay }: CredentialItemProps) {
    return (
        <div
            className={cn(
                'group flex items-start gap-4 rounded-xl p-4',
                'from-card/40 to-card/20 bg-gradient-to-r backdrop-blur-sm',
                'border-border/30 hover:border-primary/40 border',
                'hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg',
                'animate-fade-in cursor-pointer',
            )}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            <div
                className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                    'bg-primary/10 border-primary/20 text-primary border',
                    'group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:scale-110',
                    'transition-all duration-300',
                )}
            >
                {credential.icon}
            </div>

            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <h4 className="text-foreground group-hover:text-primary font-semibold transition-colors duration-300">{credential.title}</h4>
                    {credential.verified && (
                        <div className="bg-primary/20 border-primary/30 flex h-5 w-5 items-center justify-center rounded-full border">
                            <CheckCircle className="text-primary h-3 w-3" />
                        </div>
                    )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{credential.description}</p>
            </div>
        </div>
    );
}

interface AchievementImageProps {
    achievement: Achievement;
    delay: number;
}

function AchievementImage({ achievement, delay }: AchievementImageProps) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-xl',
                'bg-card/30 border-border/30 hover:border-primary/40 border',
                'transition-all duration-500 hover:-translate-y-1 hover:scale-105',
                'hover:shadow-primary/10 hover:shadow-xl',
                'animate-fade-in cursor-pointer',
            )}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                {/* Loading skeleton */}
                {!imageLoaded && <div className="from-muted/20 via-muted/10 to-muted/20 absolute inset-0 animate-pulse bg-gradient-to-r" />}

                <img
                    src={achievement.image}
                    alt={achievement.title}
                    className={cn(
                        'h-full w-full object-cover transition-all duration-700',
                        'group-hover:scale-110',
                        imageLoaded ? 'opacity-100' : 'opacity-0',
                    )}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content Overlay */}
                {/* <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h4 className="mb-1 font-semibold text-white">{achievement.title}</h4>
                    <p className="text-xs text-white/80">{achievement.description}</p>
                </div> */}

                {/* Play Icon Overlay */}
                {/* <div
                    className={cn(
                        'absolute inset-0 flex items-center justify-center',
                        'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                    )}
                >
                    <div className="bg-primary/90 border-primary/30 flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-sm">
                        <Play className="text-primary-foreground ml-0.5 h-5 w-5" fill="currentColor" />
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export function MentorProfile() {
    const [profileImageLoaded, setProfileImageLoaded] = useState(false);

    return (
        <section className="relative py-20 lg:py-32">
            {/* Background Effects */}
            <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1)_0%,transparent_50%)]" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="space-y-16">
                    {/* Section Header */}
                    <div className="space-y-6 text-center">
                        <div className="animate-fade-in">
                            <div className="bg-primary/10 border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
                                <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                                <span className="text-primary text-sm font-medium">Mentor Exclusive</span>
                            </div>
                        </div>

                        <div className="animate-fade-in space-y-4" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                            <h2 className="text-foreground text-4xl font-bold md:text-5xl lg:text-6xl">
                                <span className="block">Mentor Tepat untuk </span>
                                <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                    Langkah Awalmu
                                </span>
                            </h2>
                            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
                                Gak perlu bingung karena kamu bakal dipandu sama mentor terbaik yang udah punya pengalaman jualan online 13 tahun
                            </p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
                        {/* Left Side - Profile */}
                        <div className="space-y-8">
                            {/* Profile Image with Depth Effect */}
                            <div className="animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                                <div className="relative">
                                    {/* Background Glow */}
                                    <div className="from-primary/20 via-primary/10 to-primary/20 absolute -inset-4 rounded-full bg-gradient-to-r blur-2xl" />

                                    {/* Main Image Container */}
                                    <div className="relative">
                                        <div
                                            className={cn(
                                                'relative aspect-square overflow-hidden rounded-2xl',
                                                'from-card/80 to-card/40 bg-gradient-to-br backdrop-blur-sm',
                                                'border-primary/20 shadow-primary/10 border-2 shadow-2xl',
                                            )}
                                        >
                                            {/* Loading skeleton */}
                                            {!profileImageLoaded && (
                                                <div className="from-muted/20 via-muted/10 to-muted/20 absolute inset-0 animate-pulse bg-gradient-to-r" />
                                            )}

                                            <img
                                                src="/storage/landing/mentor/hero.png"
                                                alt="Professional Video Editor"
                                                className={cn(
                                                    'h-full w-full object-cover transition-all duration-700',
                                                    'hover:scale-105',
                                                    profileImageLoaded ? 'opacity-100' : 'opacity-0',
                                                )}
                                                onLoad={() => setProfileImageLoaded(true)}
                                                loading="lazy"
                                            />

                                            {/* Subtle Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                                        </div>

                                        {/* Floating Status Badge */}
                                        <div className="absolute -right-4 -bottom-4">
                                            <div className="bg-primary border-primary/30 flex items-center gap-2 rounded-full border-2 px-4 py-2 shadow-lg backdrop-blur-sm">
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                                <span className="text-primary-foreground text-sm font-medium">Mentor</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Nameplate */}
                            <div className="animate-fade-in space-y-4 text-center" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
                                <div>
                                    <h3 className="text-foreground mb-2 text-3xl font-bold">Tsania Latheefa</h3>
                                    <p className="text-primary text-lg font-medium">Content Creator</p>
                                    <p className="text-muted-foreground">Instagram</p>
                                </div>

                                {/* Social Links */}
                                <div className="flex items-center justify-center gap-4">
                                    {/* <div className="bg-card/30 border-border/30 flex items-center gap-2 rounded-full border px-3 py-2 backdrop-blur-sm">
                                        <Youtube className="h-4 w-4 text-red-500" />
                                        <span className="text-muted-foreground text-sm">2.1M subscribers</span>
                                    </div> */}
                                    <div className="bg-card/30 border-border/30 flex items-center gap-2 rounded-full border px-3 py-2 backdrop-blur-sm">
                                        <Instagram className="h-4 w-4 text-pink-500" />
                                        <span className="text-muted-foreground text-sm">50K+ Followers</span>
                                    </div>
                                </div>
                            </div>

                            {/* Credentials */}
                            <div className="animate-fade-in space-y-4" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
                                <h4 className="text-foreground flex items-center gap-2 text-xl font-bold">
                                    <Award className="text-primary h-5 w-5" />
                                    Credentials & Achievements
                                </h4>
                                <div className="space-y-3">
                                    {credentials.map((credential, index) => (
                                        <CredentialItem key={credential.id} credential={credential} delay={1000 + index * 100} />
                                    ))}
                                </div>
                            </div>
                            {/* <div className="from-primary/10 via-primary/5 to-primary/10 border-primary/20 rounded-2xl border bg-gradient-to-r p-6 backdrop-blur-sm">
                                <h5 className="text-foreground mb-4 font-bold">Mengapa Memilih Yuven?</h5>
                                <div className="text-muted-foreground space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                                        <span>6+ Tahun Pengalaman Dalam Membuat Video Youtube</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                                        <span>Berhasil Membuat 2 Channel Yang Sukses Dimonetisasi</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                                        <span>Secara Aktif Membuat Konten Dalam Channel “Yuven Lie"</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                                        <span>Portfolio internasional dengan brand Fortune 500</span>
                                    </div>
                                </div>
                            </div> */}
                        </div>

                        {/* Right Side - Portfolio Grid */}
                        <div className="space-y-8">
                            <div className="animate-fade-in" style={{ animationDelay: '1200ms', animationFillMode: 'both' }}>
                                <h4 className="text-foreground mb-6 flex items-center gap-2 text-xl font-bold">
                                    <Play className="text-primary h-5 w-5" />
                                    Portfolio & Recent Works
                                </h4>
                            </div>

                            {/* Achievement Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {achievements.map((achievement, index) => (
                                    <AchievementImage key={achievement.id} achievement={achievement} delay={1400 + index * 100} />
                                ))}
                            </div>

                            {/* Trust Indicators */}
                            <div className="animate-fade-in space-y-6" style={{ animationDelay: '2000ms', animationFillMode: 'both' }}>
                                {/* <div className="from-primary/10 via-primary/5 to-primary/10 border-primary/20 rounded-2xl border bg-gradient-to-r p-6 backdrop-blur-sm">
                                    <h5 className="text-foreground mb-4 font-bold">Mengapa Memilih Tsania?</h5>
                                    <div className="text-muted-foreground space-y-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                                            <span>8+ tahun pengalaman di industri Hollywood & Netflix</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                                            <span>50,000+ siswa telah berhasil menguasai editing professional</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                                            <span>Tersertifikasi langsung dari Blackmagic Design</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                                            <span>Portfolio internasional dengan brand Fortune 500</span>
                                        </div>
                                    </div>
                                </div> */}

                                {/* Personal Quote */}
                                <div className="bg-card/30 border-border/30 relative rounded-2xl border p-6 backdrop-blur-sm">
                                    <div className="text-primary/30 absolute -top-2 -left-2 font-serif text-4xl">"</div>
                                    <blockquote className="text-foreground pl-6 leading-relaxed italic">
                                        "Semakin banyak membuat alasan, semakin sedikit langkahmu berjalan"
                                    </blockquote>
                                    <div className="mt-4 text-right">
                                        <cite className="text-muted-foreground text-sm not-italic">- Tsania Latheefa</cite>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
