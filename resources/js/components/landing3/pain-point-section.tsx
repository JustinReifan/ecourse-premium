import { CtaButton2 } from '@/components/landing3/cta-button-2';
import { useAnalytics } from '@/hooks/use-analytics';
import { Award, BookCheck } from 'lucide-react';

interface BenefitCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay?: number;
    gradient: string;
}

export function PainPointSection() {
    const { trackCTA } = useAnalytics();

    const painPoints = [
        'Bingung mulai dari mana',
        'Udah coba jualan & ngonten tapi sepi',
        'Nyoba iklan berbayar tapi boncos',
        'Udah coba affiliate/bikin produk digital tapi gatau cara promosiin nya',
        'Malu nampilin wajah buat ngonten',
    ];

    const handleCtaClick = () => {
        trackCTA('pain_point_section', 'Gabung Sekarang', '#pricing-section');
        // scroll to pricing section
        const pricingSection = document.getElementById('pricing-section');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="border-border/20 relative overflow-hidden border-t py-20 lg:py-32">
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-6 text-center lg:mb-16">
                    <h2 className="text-foreground mb-3 text-2xl font-bold lg:text-6xl">
                        Aku Tahu Kamu Pengen Punya Penghasilan Sendiri, <span className="text-primary text-4xl lg:text-6xl">Tapi Bingung:</span>
                    </h2>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* Visual Section */}
                    <div className="hidden md:block lg:col-span-5">
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
                                                <Award className="text-primary h-4 w-4" />
                                                <span className="text-foreground text-sm font-semibold">E-certificate</span>
                                            </div>
                                        </div>
                                        <div className="bg-primary/10 border-border/20 rounded-xl border px-4 py-2 backdrop-blur-xl">
                                            <div className="flex items-center gap-2">
                                                <BookCheck className="h-4 w-4 text-emerald-400" />
                                                <span className="text-foreground text-sm font-semibold">Free E-book</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="from-primary/10 via-primary/5 to-accent/10 border-primary/20 rounded-2xl border bg-gradient-to-r p-6 backdrop-blur-xl">
                            {/* LIST PAIN POINTS */}
                            <ul className="text-muted-foreground space-y-4 text-lg leading-tight lg:text-xl">
                                {painPoints.map((item, index) => (
                                    <li key={index} className="flex items-start gap-4">
                                        <span className="bg-primary mt-2.5 h-2 w-2 flex-shrink-0 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />

                                        <span className="block">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-5 text-center md:text-start">
                                <h3 className="text-foreground text-xl font-medium md:text-2xl">Tenang, Kamu gak sendiri!</h3>
                                <p className="text-muted-foreground mt-1 text-lg">Aku dulu ngalamin hal yang sama.</p>
                            </div>
                        </div>
                        <div className="pt-3 text-center text-2xl leading-tight font-semibold md:py-6">
                            <h3 className="text-primary">Kabar baiknya, aku mau bimbing kamu</h3>
                            <p className="text-foreground mt-1">Secara langsung 1-on-1 via WA</p>
                        </div>

                        {/* CTA Button */}
                        <div className="text-center">
                            <CtaButton2 onClick={handleCtaClick} size="lg" withInstruction>
                                Gabung Sekarang
                            </CtaButton2>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
