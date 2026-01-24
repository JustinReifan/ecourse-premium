import { CtaButton2 } from '@/components/landing3/cta-button-2';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import 'aos/dist/aos.css';
import { ArrowBigDown, Gift, Sparkles, Tag } from 'lucide-react';
import { useState } from 'react';

interface BonusData {
    id: number;
    badge: string;
    title: string;
    value: string;
    description: string;
    image: string;
}

const bonusData: BonusData[] = [
    {
        id: 1,
        badge: 'Bonus #01',
        title: 'Fasilitas Mentorship Live 2 minggu 1x',
        value: 'Rp 4.599.000',
        description:
            'Kita tatap muka virtual rutin tiap 2 minggu! Sesi bedah akun, evaluasi progress, dan tanya jawab langsung biar kamu dipastikan nggak salah arah',
        image: '/storage/landing3/bonus/1.jpeg',
    },
    {
        id: 2,
        badge: 'Bonus #02',
        title: 'Grup Bimbingan Latihan Bahan Konten Reels',
        value: 'Rp 4.694.000',
        description:
            'Lingkungan itu pengaruh banget. Gabung bareng temen-temen seperjuangan, kita saling support, koreksi konten dan tumbuh bareng biar semangatmu gak kendor.',
        image: '/storage/landing3/bonus/2.png',
    },
];

function BonusCard({ bonus }: { bonus: BonusData }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl',
                'from-card/90 to-card/50 bg-gradient-to-br backdrop-blur-sm',
                'border-border/30 hover:border-primary/40 border',
                'transition-[transform,box-shadow] duration-700 hover:-translate-y-1 hover:scale-[1.01]',
                'hover:shadow-primary/10 hover:shadow-2xl',
                'animate-fade-in',
            )}
        >
            {/* Floating Number Badge */}
            <div className="absolute -top-1 -left-1 z-10">
                <div
                    className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-2xl',
                        'from-primary to-primary/80 bg-gradient-to-br',
                        'border-primary/30 shadow-primary/20 border shadow-lg',
                        'text-primary-foreground text-lg font-bold',
                        'transition-transform duration-300 group-hover:scale-110',
                    )}
                >
                    <Gift className="h-4 w-4" />
                </div>
            </div>

            <div className="bg-primary/15 p-6 md:flex md:gap-6">
                {/* Thumbnail Section */}
                <div className="mb-6 md:mb-0 md:w-2/5">
                    <div className="relative aspect-video overflow-hidden rounded-xl">
                        {/* Loading skeleton */}
                        {!imageLoaded && <div className="from-muted/20 via-muted/10 to-muted/20 absolute inset-0 animate-pulse bg-gradient-to-r" />}

                        <img
                            src={bonus.image}
                            alt={bonus.title}
                            className={cn(
                                'h-full w-full object-cover transition-all duration-700',
                                'group-hover:scale-110',
                                imageLoaded ? 'opacity-100' : 'opacity-0',
                            )}
                            onLoad={() => setImageLoaded(true)}
                            loading="lazy"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-3 md:w-3/5">
                    {/* Header */}
                    <div className="space-y-1">
                        <h2 className="text-primary text-2xl font-bold">Bonus #{bonus.id}</h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-foreground group-hover:text-primary text-2xl font-bold transition-colors duration-300 lg:text-3xl">
                                {bonus.title}
                            </h3>
                        </div>
                    </div>
                    <p className="text-muted-foreground md:text-md text-sm leading-relaxed">{bonus.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 md:mt-5">
                        {/* 1. Badge "Senilai" (Tampilan Redup/Coret) */}
                        <div className="border-muted-foreground/20 bg-primary/10 text-muted-foreground decoration-destructive inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xl decoration-8 lg:text-2xl">
                            <Tag className="h-6 w-6" />
                            <span className="decoration-destructive/60 font-bold line-through decoration-2">{bonus.value} </span>
                            <span className="font-bold tracking-wider uppercase">GRATIS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div
                className="from-primary/20 to-primary/20 absolute -inset-px rounded-2xl bg-gradient-to-r via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ pointerEvents: 'none' }}
            />
        </div>
    );
}

function OtherBonusCard() {
    return (
        <div className="group mx-auto flex w-full max-w-lg flex-col items-center text-center">
            <div className="border-border/50 bg-muted/5 relative aspect-[4/3] w-full overflow-hidden rounded-2xl border">
                <img
                    src="/storage/landing3/bonus/otherbonus.png" // Placeholder
                    alt="Other Bonus"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />
            </div>

            {/* 2. KONTEN */}
            <div className="mt-5 flex flex-col items-center gap-2">
                {/* Judul: Ukuran font diperkecil (text-xl) agar tidak raksasa */}
                <h3 className="text-foreground text-2xl leading-tight font-bold duration-300 md:text-4xl">
                    4+ Bonus Lainnya <br />
                    <span className="text-primary text-2xl font-bold md:text-4xl">Untuk Mempercepat Proses Belajar Kamu</span>
                </h3>

                {/* Value Tag */}
                <div className="mt-3 flex flex-wrap items-center gap-3 md:mt-5">
                    {/* 1. Badge "Senilai" (Tampilan Redup/Coret) */}
                    <div className="border-muted-foreground/30 bg-primary/10 text-muted-foreground decoration-destructive inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xl decoration-8 lg:text-2xl">
                        <Tag className="h-6 w-6" />
                        <span className="decoration-destructive/60 font-bold line-through decoration-2">Rp 1.499.000 </span>
                        <span className="font-bold tracking-wider uppercase">GRATIS</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BonusSection() {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const { trackCTA } = useAnalytics();
    const totalValue = 10792000; // Rp 1,190,000

    const handleCtaClick = () => {
        trackCTA('bonus_section', 'Ambil Bonus Sekarang', '#pricing-section');
        const pricingSection = document.getElementById('pricing-section');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative overflow-hidden py-12 lg:py-32">
            {/* Background Effects */}
            <div className="from-background via-background to-primary/5 absolute inset-0 bg-gradient-to-br" />
            <div className="bg-primary/10 absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl" />
            <div
                className="bg-accent/10 absolute right-1/4 bottom-1/4 h-80 w-80 animate-pulse rounded-full blur-3xl"
                style={{ animationDelay: '1s' }}
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Bonus Introduction */}
                <div className="mb-12 space-y-8 text-center">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                            <p className="text-foreground">Khusus Gabung Hari Ini</p>
                            <p className="mt-2">
                                {/* <span className="text-foreground"> </span> */}
                                <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                    Kamu Bakal Dapetin:
                                </span>
                            </p>
                        </h2>
                    </div>

                    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 py-3 tracking-tight md:grid-cols-2 md:py-12">
                        <div className="max-w-2xl">
                            <p className="text-foreground block text-6xl font-bold md:text-8xl">30+</p>
                            <p className="from-primary via-primary/80 to-primary mt-2 block bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
                                Module Pembelajaran
                            </p>
                            <span className="text-muted-foreground text-sm font-medium md:text-base">
                                Kurikulum step-by-step yang sudah terbukti menghasilkan Rp100+ JUTA
                            </span>
                        </div>

                        <div className="max-w-2xl">
                            <p className="text-foreground block text-6xl font-bold md:text-8xl">7+</p>
                            <p className="from-primary via-primary/80 to-primary mt-2 block bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
                                Bonus GRATIS
                            </p>
                            <span className="text-muted-foreground text-sm font-medium md:text-base">
                                Dapatkan bimbingan dan tools yang dapat mempercepat proses kamu hasilin uang
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bonus Cards */}
                <div className="mx-auto mb-12 max-w-6xl space-y-8">
                    {bonusData.map((bonus, index) => (
                        <BonusCard key={index} bonus={bonus} />
                    ))}
                </div>

                <div className="mx-auto mb-12 max-w-6xl">
                    <OtherBonusCard />
                </div>

                {/* Value Summary */}
                <div className="text-center">
                    <div className="from-primary/10 via-card/50 to-accent/10 border-primary/30 inline-block rounded-3xl border bg-gradient-to-br p-8 backdrop-blur-sm">
                        <div className="space-y-4">
                            <h3 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">Total Bonus Yang Kamu Dapatkan Senilai</h3>
                            <div className="from-primary via-primary/80 to-accent bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                                Rp {totalValue.toLocaleString('id-ID')}
                            </div>
                            <p className="text-foreground mx-auto max-w-2xl text-xl font-bold">
                                <ArrowBigDown className="text-primary inline-block h-12 w-12" />
                                <span className="text-primary block py-2 text-5xl underline">GRATIS</span> saat bergabung di kelas ini!
                            </p>

                            <div className="pt-4">
                                <button onClick={handleCtaClick}>
                                    <CtaButton2 size="lg" className="group" withInstruction instructionText="Klik tombol ini untuk ambil bonus">
                                        <Sparkles className="me-3 inline-block h-3 w-3 group-hover:animate-spin" />
                                        <span>Ambil Bonus Sekarang</span>
                                        {/* <div className="bg-primary absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full" /> */}
                                    </CtaButton2>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
