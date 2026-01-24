// src/components/sections/TestimonialsSection.tsx
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CtaButton } from '@/components/ui/cta-button';
import { useAnalytics } from '@/hooks/use-analytics';

import { cn } from '@/lib/utils';
import Autoplay from 'embla-carousel-autoplay';
import { Star } from 'lucide-react';
import * as React from 'react';

interface Testimonial {
    id: string;
    imageUrl: string;
    alt: string;
    subtitle: string;
}

const testimonials: Testimonial[] = [
    { id: '1', imageUrl: '/storage/landing/testimonials/testimoni1.png', alt: 'Testimonial 1', subtitle: 'tes' },
    { id: '2', imageUrl: '/storage/landing/testimonials/testimoni2.png', alt: 'Testimonial 2', subtitle: 'tes' },
    { id: '3', imageUrl: '/storage/landing/testimonials/testimoni3.png', alt: 'Testimonial 3', subtitle: 'tes' },
    { id: '4', imageUrl: '/storage/landing/testimonials/testimoni4.png', alt: 'Testimonial 4', subtitle: 'tes' },
    { id: '5', imageUrl: '/storage/landing/testimonials/testimoni5.png', alt: 'Testimonial 5', subtitle: 'tes' },
    { id: '6', imageUrl: '/storage/landing/testimonials/testimoni6.png', alt: 'Testimonial 6', subtitle: 'tes' },
    { id: '7', imageUrl: '/storage/landing/testimonials/testimoni7.png', alt: 'Testimonial 7', subtitle: 'tes' },
    { id: '8', imageUrl: '/storage/landing/testimonials/testimoni8.png', alt: 'Testimonial 8', subtitle: 'tes' },
    { id: '9', imageUrl: '/storage/landing/testimonials/testimoni9.png', alt: 'Testimonial 9', subtitle: 'tes' },
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
        <section className="relative py-20 lg:py-32">
            {/* Background */}
            <div className="via-primary/5 absolute inset-0 bg-gradient-to-b from-transparent to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="space-y-16">
                    {/* Header Section */}
                    <div className="space-y-6 text-center">
                        <div className="animate-fade-in">
                            <div className="bg-primary/10 border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
                                <Star className="text-primary h-4 w-4" />
                                <span className="text-primary text-sm font-medium">Hasil Nyata Alumni</span>
                            </div>
                        </div>

                        <div className="animate-fade-in space-y-4" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                            <h2 className="text-foreground text-4xl font-bold md:text-5xl lg:text-6xl">
                                <span className="block">Jangan Percaya Sama Aku,</span>
                                <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                    Tapi Lihat Kata Mereka!
                                </span>
                            </h2>
                            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
                                Aku nggak mau kasih janji manis. Biar alumni yang kasih bukti nyata gimana materi ini bisa mengubah isi rekening
                                mereka, walau awalnya gaptek parah.
                            </p>
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

                    {/* CTA Button */}
                    <div className="text-center">
                        <button onClick={() => handleCtaClick()}>
                            <CtaButton
                                variant="primary"
                                size="lg"
                                className="group transform text-center transition-all duration-300 hover:scale-105"
                            >
                                <span className="relative z-10">Gabung Sekarang</span>
                            </CtaButton>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
