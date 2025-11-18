// src/components/sections/TestimonialsSection.tsx

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import * as React from 'react';
// --- Ganti path import ini ---
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'; // <-- Sesuaikan path ke file yg Anda buat
import Autoplay from 'embla-carousel-autoplay'; // Plugin untuk autoplay

// --- 1. Data Dummy untuk Testimoni ---
interface Testimonial {
    id: string;
    imageUrl: string;
    alt: string;
}

// Ganti path ini dengan path ke gambar testimoni 9:16 Anda
const testimonials: Testimonial[] = [
    { id: '1', imageUrl: '/storage/landing/karya-mentor/1.webp', alt: 'Testimonial 1' },
    { id: '2', imageUrl: '/storage/landing/karya-mentor/2.webp', alt: 'Testimonial 2' },
    { id: '3', imageUrl: '/storage/landing/karya-mentor/3.webp', alt: 'Testimonial 3' },
    { id: '4', imageUrl: '/storage/landing/karya-mentor/4.webp', alt: 'Testimonial 4' },
    { id: '5', imageUrl: '/storage/landing/karya-mentor/5.webp', alt: 'Testimonial 5' },
    { id: '6', imageUrl: '/storage/landing/karya-mentor/6.webp', alt: 'Testimonial 6' },
    { id: '7', imageUrl: '/storage/landing/karya-mentor/7.webp', alt: 'Testimonial 7' },
    { id: '8', imageUrl: '/storage/landing/karya-mentor/8.webp', alt: 'Testimonial 8' },
    { id: '9', imageUrl: '/storage/landing/karya-mentor/9.webp', alt: 'Testimonial 9' },
    { id: '10', imageUrl: '/storage/landing/karya-mentor/10.webp', alt: 'Testimonial 10' },
    { id: '11', imageUrl: '/storage/landing/karya-mentor/11.webp', alt: 'Testimonial 11' },
    { id: '12', imageUrl: '/storage/landing/karya-mentor/12.webp', alt: 'Testimonial 12' },
    { id: '13', imageUrl: '/storage/landing/karya-mentor/13.webp', alt: 'Testimonial 13' },
    { id: '14', imageUrl: '/storage/landing/karya-mentor/14.webp', alt: 'Testimonial 14' },
    { id: '15', imageUrl: '/storage/landing/karya-mentor/15.webp', alt: 'Testimonial 15' },
    { id: '16', imageUrl: '/storage/landing/karya-mentor/16.webp', alt: 'Testimonial 16' },
    { id: '17', imageUrl: '/storage/landing/karya-mentor/17.webp', alt: 'Testimonial 17' },
    { id: '18', imageUrl: '/storage/landing/karya-mentor/18.webp', alt: 'Testimonial 18' },
    { id: '19', imageUrl: '/storage/landing/karya-mentor/19.webp', alt: 'Testimonial 19' },
    { id: '20', imageUrl: '/storage/landing/karya-mentor/20.webp', alt: 'Testimonial 20' },
    { id: '21', imageUrl: '/storage/landing/karya-mentor/21.webp', alt: 'Testimonial 21' },
    { id: '22', imageUrl: '/storage/landing/karya-mentor/22.webp', alt: 'Testimonial 22' },
    { id: '23', imageUrl: '/storage/landing/karya-mentor/23.webp', alt: 'Testimonial 23' },
    { id: '24', imageUrl: '/storage/landing/karya-mentor/24.webp', alt: 'Testimonial 24' },
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
                                <span className="text-primary text-sm font-medium">Karya Mentor</span>
                            </div>
                        </div>

                        <div className="animate-fade-in space-y-4" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                            <h2 className="text-foreground text-4xl font-bold md:text-5xl lg:text-6xl">
                                <span className="block">Belajar Langsung dari Praktisi</span>
                                <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                    Lihat Hasilnya!
                                </span>
                            </h2>
                            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
                                Mentor kami nggak cuma ngajar, mereka juga praktisi aktif. Lihat karya-karya nyata mentor yang dibuat dengan skill
                                yang sama persis seperti yang akan kamu dapatkan di kelas ini.
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
                </div>
            </div>
        </section>
    );
}
