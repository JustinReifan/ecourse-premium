import { CtaButton2 } from '@/components/landing3/cta-button-2';
import { useAnalytics } from '@/hooks/use-analytics';
import { Sparkles } from 'lucide-react';

export function LearningBenefits() {
    const { trackVisit, trackCTA } = useAnalytics();

    const handleCtaClick = () => {
        trackCTA('benefits_section', 'Gabung Sekarang', '#pricing-section');
        // scroll to pricing section
        const pricingSection = document.getElementById('pricing-section');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative py-16 lg:py-32">
            {/* Background Effect */}
            <div className="via-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* 1. HEADER SECTION (Badge, Headline, Subheadline) */}
                <div className="mx-auto mb-8 max-w-4xl space-y-6 text-center md:mb-16">
                    {/* Badge */}
                    <div className="border-primary/20 bg-primary/10 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
                        <Sparkles className="text-primary h-4 w-4" />
                        <span className="text-primary text-sm font-medium">Benefit Eksklusif</span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                        <span className="block">Rule Bimbingan WA</span>
                        <span className="from-primary via-primary/80 to-primary mt-1 block bg-gradient-to-r bg-clip-text text-transparent">
                            10 x 7 Hari Praktek
                        </span>
                    </h3>

                    {/* Subheadline */}
                    <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
                        Akan berjalan selama <span className="font-bold">70 hari</span>, 1 tugas diberi durasi 7 hari
                    </p>
                </div>

                {/* Container diubah: lg:max-w-4xl -> lg:max-w-lg */}
                <div className="relative mx-auto mb-6 w-full max-w-xl md:max-w-3xl md:max-w-lg">
                    <div className="overflow-hidden rounded-3xl">
                        <img
                            src="/storage/landing3/benefit.png"
                            alt="Detail Benefit Kurikulum"
                            // Tetap gunakan w-full agar mengisi container yang sudah dikecilkan
                            className="h-auto w-full object-cover"
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* 3. CTA SECTION */}
                <div className="flex justify-center md:mt-16">
                    <CtaButton2 size="lg" withInstruction onClick={handleCtaClick}>
                        Gabung Sekarang
                    </CtaButton2>
                </div>
            </div>
        </section>
    );
}
