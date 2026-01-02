import AppLogo from '@/components/app-logo';
import { BonusSection } from '@/components/landing2/bonus-section';
import { CurriculumSection } from '@/components/landing2/curriculum-section';
import { FaqSection } from '@/components/landing2/faq-section';
import { HeroBadge } from '@/components/landing2/hero-badge';
import { MentorProfile } from '@/components/landing2/mentor-profile';
import { PricingSection } from '@/components/landing2/pricing-section';
import { ReasonJoinSection } from '@/components/landing2/reason-join-section';
import { TestimonialsSection } from '@/components/landing2/testimonials-section';
import { CtaButton } from '@/components/ui/cta-button';
import { useAnalytics } from '@/hooks/use-analytics';
import { useDwellTime } from '@/hooks/use-dwell-time';
import { useScrollTracking } from '@/hooks/use-scroll-tracking';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect, useState } from 'react';

export default function Mbd() {
    const { auth } = usePage<SharedData>().props;
    const { trackVisit, trackCTA } = useAnalytics();
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    // Initialize tracking hooks
    useScrollTracking();
    useDwellTime();

    // Track page visit on mount
    useEffect(() => {
        trackVisit();
    }, [trackVisit]);

    // Track CTA button click
    const handleCtaClick = () => {
        trackCTA('hero_section', 'Gabung Sekarang', '#pricing-section');
        // scroll to pricing section
        const pricingSection = document.getElementById('pricing-section');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <Head title="Landing">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800" rel="stylesheet" />
            </Head>

            <div className="from-background via-background to-secondary/10 min-h-screen bg-gradient-to-br">
                {/* Navigation */}
                <header className="border-border/50 bg-background/80 relative z-50 border-none backdrop-blur-md">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <nav className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AppLogo />
                            </div>

                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('member.index')}
                                        className="border-primary/20 text-foreground hover:border-primary/50 hover:bg-card/50 bg-card/30 inline-block rounded-lg border px-4 py-2 text-sm leading-normal transition-all duration-300"
                                    >
                                        Member area
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-muted-foreground hover:text-foreground inline-block rounded-lg px-4 py-2 text-sm leading-normal transition-colors duration-300"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="text-foreground hover:bg-card hover:border-primary/50 border-primary/30 bg-card/50 inline-block rounded-lg border px-4 py-2 text-sm leading-normal transition-all duration-300"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>

                <section
                    className="relative overflow-hidden pt-20 lg:pt-12"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-8 text-center">
                            <div data-aos="fade-up">
                                <HeroBadge text={'Kelas Hemat Bayar Suka Suka'} />
                            </div>

                            <div className="space-y-6" data-aos="fade-up">
                                <h1 className="text-foreground mx-auto max-w-6xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                                    Jangan Bully Dirimu Sendiri Dengan Meragukan{' '}
                                    <span className="from-primary via-primary/80 to-primary animate-gradient-x bg-gradient-to-r bg-clip-text text-transparent">
                                        Potensimu Di Dunia Digital
                                    </span>
                                </h1>
                                <p className="text-muted-foreground mx-auto max-w-4xl text-base leading-relaxed md:text-xl">
                                    Temukan potensi hobi dan skillmu menjadi cuan digital di kelas ini
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Hero Video Section */}
                <section className="relative overflow-hidden py-8 lg:pt-12 lg:pb-24">
                    {/* Konten Utama */}
                    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-12">
                            <div data-aos="fade-up">
                                {/* Video utama di atas background */}
                                {/* <VideoPlayer
                                    src={landingVslUrl}
                                    title="VSL - Belajar Canva"
                                    className="aspect-video w-full lg:h-[600px]"
                                    thumbnailUrl={landingVslThumbnail}
                                /> */}

                                {/* kalau gak ada vsl, thumbnail doang */}
                                <div className="overflow-hidden rounded-2xl border border-neutral-800/60 bg-black shadow-2xl">
                                    <img src="/storage/landing/hero/herosection.png" alt="" className="h-full w-full object-cover" />
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="pt-6 text-center">
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

                {/* Canva Masterclass Benefits Section */}
                <div data-aos="fade-up" data-aos-delay="200">
                    <ReasonJoinSection />
                </div>

                {/* Learning Benefits Section */}
                {/* <section className="border-border/50 relative border-t py-16 lg:py-32" data-aos="fade-up">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-16">
                            <div className="animate-fade-in lg:col-span-2" style={{ animationDelay: '1000ms', animationFillMode: 'both' }}>
                                <div className="relative">
                                    <div className="border-border/50 shadow-primary/10 aspect-[4/3] overflow-hidden rounded-2xl border shadow-2xl">
                                        <img
                                            src="/storage/canvathumb2.webp"
                                            alt="DaVinci Resolve workspace"
                                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="bg-primary/10 border-primary/20 absolute -top-4 -right-4 h-24 w-24 animate-pulse rounded-full border backdrop-blur-sm" />
                                    <div
                                        className="bg-primary/5 border-primary/10 absolute -bottom-6 -left-6 h-16 w-16 animate-pulse rounded-full border backdrop-blur-sm"
                                        style={{ animationDelay: '1s' }}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-3" data-aos="fade-up">
                                <LearningBenefits />
                            </div>
                        </div>
                    </div>
                </section> */}

                {/* Video Results Section */}
                <div data-aos="fade-up" data-aos-delay="200">
                    <TestimonialsSection />
                    {/* <VideoResults /> */}
                </div>

                {/* Curriculum Section */}
                <div data-aos="fade-up" data-aos-delay="200">
                    <CurriculumSection />
                </div>

                {/* Bonus Section */}
                <div data-aos="fade-up" data-aos-delay="200">
                    <BonusSection />
                </div>

                {/* Mentor Profile Section */}
                <div data-aos="fade-up" data-aos-delay="200">
                    <MentorProfile />
                </div>

                {/* Pricing Section */}
                <div data-aos="fade-up" data-aos-delay="200">
                    <PricingSection />
                </div>

                {/* FAQ Section */}
                <div data-aos="fade-up" data-aos-delay="200">
                    <FaqSection />
                </div>

                {/* Footer */}
                <footer className="relative backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="mb-4 flex items-center justify-center gap-3">
                                <div className="flex items-center justify-center rounded-lg">
                                    {/* <Youtube className="text-primary h-4 w-4" /> */}
                                    <AppLogo />
                                </div>
                                {/* <span className="text-foreground text-xl font-bold">Editor Amplifier</span> */}
                            </div>
                            <p className="text-muted-foreground text-sm">© 2026 Affiliate Jago Jualan. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
