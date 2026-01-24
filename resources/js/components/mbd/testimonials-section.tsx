// src/components/sections/TestimonialsSection.tsx

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import * as React from 'react';
// --- Ganti path import ini ---
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'; // <-- Sesuaikan path ke file yg Anda buat
import { CtaButton } from '@/components/ui/cta-button';
import Autoplay from 'embla-carousel-autoplay'; // Plugin untuk autoplay

// --- 1. Data Dummy untuk Testimoni ---
interface Testimonial {
    id: string;
    imageUrl: string;
    alt: string;
}

// Ganti path ini dengan path ke gambar testimoni 9:16 Anda
const testimonials: Testimonial[] = [
    { id: '1', imageUrl: '/storage/landing/testimonials2/1.jpeg', alt: 'Testimonial 1' },
    { id: '2', imageUrl: '/storage/landing/testimonials2/2.jpeg', alt: 'Testimonial 2' },
    { id: '3', imageUrl: '/storage/landing/testimonials2/3.jpeg', alt: 'Testimonial 3' },
    { id: '4', imageUrl: '/storage/landing/testimonials2/4.jpeg', alt: 'Testimonial 4' },
    { id: '5', imageUrl: '/storage/landing/testimonials2/5.jpeg', alt: 'Testimonial 5' },
    { id: '6', imageUrl: '/storage/landing/testimonials2/6.jpeg', alt: 'Testimonial 6' },
];

// --- 2. Komponen Card untuk Carousel Item ---
interface TestimonialCardProps {
    testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
    const [imageLoaded, setImageLoaded] = React.useState(false);

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl',
                'aspect-[3/4]', // Aspek rasio 9:16 (potret)
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
    const handleCtaClick = () => {
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
                                <span className="block">Ini Kata Mereka</span>
                                <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                    Yang Udah Gabung Kelas ini
                                </span>
                            </h2>
                            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
                                Awalnya mereka juga ragu dan merasa gaptek, persis seperti yang kamu rasakan. Tapi karena berani mencoba, sekarang
                                mereka sudah bisa menghasilkan meskipun dari rumah
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

                    <div className="pt-6 text-center">
                        <button onClick={handleCtaClick}>
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
