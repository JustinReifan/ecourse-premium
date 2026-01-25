// src/components/sections/TestimonialsSection.tsx
import { CtaButton2 } from '@/components/landing3/cta-button-2';
import { useAnalytics } from '@/hooks/use-analytics';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'; // <-- Sesuaikan path ke file yg Anda buat
import { cn } from '@/lib/utils';
import Autoplay from 'embla-carousel-autoplay'; // Plugin untuk autoplay
import { Star } from 'lucide-react';
import * as React from 'react';

interface TestimonialGrid {
    id: string;
    imageUrl: string;
    alt: string;
    subtitle: string;
}

const testimonialsGrid: TestimonialGrid[] = [
    {
        id: '1',
        imageUrl: '/storage/landing3/testimonials/1.png',
        alt: 'Testimonial 1',
        subtitle: 'Seorang Bapak-Bapak Guru Ngaji biasa bisa dapetin penghasilan tambahan Rp 5 JUTA',
    },
    {
        id: '2',
        imageUrl: '/storage/landing3/testimonials/2.png',
        alt: 'Testimonial 2',
        subtitle: 'Awalnya Ibu Rumah Tangga ini Takut Jualan, tapi Dibimbing Sampai Berani Jualan dan Dapetin Rp 2 JUTA',
    },
    {
        id: '3',
        imageUrl: '/storage/landing3/testimonials/3.png',
        alt: 'Testimonial 3',
        subtitle: 'Bapak Ini awalnya bingung cara jualan di Sosmed, tapi Diajarin Sampai Bisa Hasilin Rp 80 JUTA',
    },
    {
        id: '4',
        imageUrl: '/storage/landing3/testimonials/4.png',
        alt: 'Testimonial 4',
        subtitle: 'Ibu Ini Awalnya Gaptek dan Sibuk Ngurus Anak Tapi Bisa Hasilkan Uang Pertamanya Dari Sosmed',
    },
];

interface Testimonial {
    id: string;
    imageUrl: string;
    alt: string;
}

// Ganti path ini dengan path ke gambar testimoni 9:16 Anda
const testimonials: Testimonial[] = [
    { id: '1', imageUrl: '/storage/landing/testimonials/testimoni3.png', alt: 'Testimonial 1' },
    { id: '2', imageUrl: '/storage/landing/testimonials/testimoni4.png', alt: 'Testimonial 2' },
    { id: '3', imageUrl: '/storage/landing/testimonials/testimoni5.png', alt: 'Testimonial 3' },
    { id: '4', imageUrl: '/storage/landing/testimonials/testimoni6.png', alt: 'Testimonial 4' },
    { id: '5', imageUrl: '/storage/landing/testimonials/testimoni7.png', alt: 'Testimonial 5' },
    { id: '6', imageUrl: '/storage/landing/testimonials/testimoni8.png', alt: 'Testimonial 6' },
    { id: '7', imageUrl: '/storage/landing/testimonials/testimoni9.png', alt: 'Testimonial 7' },
];

interface TestimonialCardProps {
    testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
    const [imageLoaded, setImageLoaded] = React.useState(false);

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl',
                'aspect-[9/16]', // Aspek rasio 9:16 (potret)
                'from-card/80 to-card/40 bg-gradient-to-br backdrop-blur-sm',
                'border-border/30 border',
                'transition-all duration-700',
                'hover:shadow-primary/20 hover:shadow-2xl',
            )}
        >
            {/* Skeleton loading */}
            {!imageLoaded && <div className="from-muted/20 via-muted/10 to-muted/20 absolute inset-0 animate-pulse bg-gradient-to-r" />}

            {/* Gambar Testimoni */}
            <img
                src={testimonial.imageUrl}
                alt={testimonial.alt}
                className={cn(
                    'h-full w-full object-cover transition-all duration-700',
                    'group-hover:scale-110',
                    imageLoaded ? 'opacity-100' : 'opacity-0',
                    'rounded-2xl',
                )}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
            />
        </div>
    );
}

// --- 3. Komponen Section Utama ---

export function TestimonialsSection() {
    const { trackVisit, trackCTA } = useAnalytics();

    const handleCtaClick = () => {
        trackCTA('testimonial_section', 'Gabung Sekarang', '#pricing-section');
        // scroll to pricing section
        const pricingSection = document.getElementById('pricing-section');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative py-6 lg:py-32">
            {/* Background */}
            <div className="via-primary/5 absolute inset-0 bg-gradient-to-b from-transparent to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 space-y-6 md:mb-12 md:space-y-16">
                    {/* Header Section */}
                    <div className="space-y-6 text-center">
                        <div className="animate-fade-in">
                            <div className="bg-primary/10 border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
                                <Star className="text-primary h-4 w-4" />
                                <span className="text-primary text-sm font-medium">Testimoni Member</span>
                            </div>
                        </div>

                        <div className="animate-fade-in space-y-4">
                            <h2 className="text-foreground text-4xl font-bold md:text-5xl lg:text-6xl">
                                <span className="block">Hasil Nyata Member yang Sudah </span>
                                <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                    Terapkan Strategi Di Kelas Ini!
                                </span>
                            </h2>
                        </div>
                    </div>

                    {/* --- Grid Testimonial (Pengganti Carousel) --- */}
                    <div className="animate-fade-in mx-auto max-w-5xl" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                            {testimonialsGrid.map((testimonial, index) => (
                                <div key={testimonial.id || index} className="group flex flex-col gap-4">
                                    <div className="border-border/50 bg-background hover:border-primary/20 relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md">
                                        <img
                                            src={testimonial.imageUrl}
                                            alt={`${testimonial.alt}`}
                                            className="h-full w-full object-cover object-center"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Subtitle / Highlight Text */}
                                    <div className="px-2 text-center">
                                        <p className="text-foreground/90 text-lg leading-snug font-medium">
                                            {/* Pastikan di data testimonials ada field 'subtitle' atau 'highlight' */}"
                                            {testimonial.subtitle || 'Tulis highlight testimoni di sini...'}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- Carousel Responsif --- */}
                    <div className="animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                        <Carousel
                            plugins={[
                                Autoplay({
                                    delay: 4000,
                                    stopOnInteraction: true,
                                }),
                            ]}
                            opts={{
                                align: 'center', // Item aktif akan selalu di tengah
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {testimonials.map((testimonial) => (
                                    <CarouselItem
                                        key={testimonial.id}
                                        className={cn(
                                            'pl-4',
                                            // --- INI KUNCI RESPONSIVENYA ---
                                            // HP (default): 75% width
                                            'basis-3/4',
                                            // Tablet kecil (sm): 50% width
                                            'sm:basis-1/2',
                                            // Tablet besar (lg): 33.3% width
                                            'lg:basis-1/3',
                                            // Desktop (xl): 25% width
                                            'xl:basis-1/4',
                                        )}
                                    >
                                        <div className="p-1">
                                            <TestimonialCard testimonial={testimonial} />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>

                            {/* Tombol Navigasi (tersembunyi di HP, muncul di desktop) */}
                            <CarouselPrevious className="hidden sm:inline-flex" />
                            <CarouselNext className="hidden sm:inline-flex" />
                        </Carousel>
                    </div>
                </div>
                {/* CTA Button */}
                <div className="text-center">
                    <button onClick={() => handleCtaClick()}>
                        <CtaButton2 size="lg" withInstruction className="group transform text-center transition-all duration-300 hover:scale-105">
                            <span className="relative z-10">Gabung Sekarang</span>
                        </CtaButton2>
                    </button>
                </div>
            </div>
        </section>
    );
}
