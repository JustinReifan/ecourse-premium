import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';
import { ChevronDown, HelpCircle, MapPin, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    {
        id: '1',
        question: 'Ini beneran cocok buat pemula yang gaptek?',
        answer: 'Iya. Kelas ini dibuat dari nol banget. Bahkan buat kamu yang baru kenal istilah produk digital pun masih aman. Semua dijelasin pelan, step by step, dan bisa diputar ulang kapan aja.',
    },
    {
        id: '2',
        question: 'Kenapa bayarnya suka-suka? Seriusan?',
        answer: 'Serius. Karena tujuan kelas ini bukan langsung jualan besar, tapi bantu kamu mulai dulu dan percaya sama potensi diri. Mau Rp10 ribu atau Rp50 ribu, yang penting kamu niat belajar dan praktek.',
    },
    {
        id: '3',
        question: 'Ini ada bimbingan atau mentoring langsung?',
        answer: 'Tidak ada. Ini pure course video yang bisa kamu pelajari mandiri. Justru cocok buat kamu yang pengen belajar tanpa tekanan dan tanpa takut salah.',
    },
    {
        id: '4',
        question: 'Harus jago ngonten atau tampil di kamera?',
        answer: 'Nggak sama sekali. Di kelas ini dibahas ngonten tanpa muka dan cara bikin konten simple pakai bantuan AI, jadi tetap bisa jalan walau sambil ngurus rumah.',
    },
    {
        id: '5',
        question: 'Setelah ikut kelas ini, aku langsung bisa jualan?',
        answer: 'Targetnya: kamu paham + tau harus ngapain aja + bisa praktek. Kamu akan tau arah, jenis produk digital yang cocok buatmu, dan cara mulai jualannya. Hasil tiap orang beda, tapi kamu nggak lagi bingung harus mulai dari mana.',
    },
    {
        id: '6',
        question: 'Ini cocok buat siapa aja?',
        answer: 'Khusus buat muslimah, terutama ibu rumah tangga yang pengen punya karya, penghasilan tambahan, dan tetap waras secara mental — tanpa harus ninggalin peran utama di rumah.',
    },
];

interface FaqItemProps {
    faq: (typeof faqs)[0];
    index: number;
}

function FaqItem({ faq, index }: FaqItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div
                className={cn(
                    'group overflow-hidden rounded-2xl transition-all duration-500',
                    'from-card/80 to-card/40 bg-gradient-to-br backdrop-blur-sm',
                    'border transition-all duration-300',
                    isOpen ? 'border-primary/50 shadow-primary/20 shadow-lg' : 'border-border/30 hover:border-primary/30',
                    'animate-fade-in',
                )}
                style={{ animationDelay: `${600 + index * 100}ms`, animationFillMode: 'both' }}
            >
                <CollapsibleTrigger className="w-full text-left">
                    <div className="hover:bg-primary/5 flex items-center justify-between p-6 transition-colors duration-300">
                        <h3 className="text-foreground group-hover:text-primary pr-4 text-lg leading-tight font-semibold transition-colors duration-300">
                            {faq.question}
                        </h3>
                        <div
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full',
                                'bg-primary/20 border-primary/30 flex-shrink-0 border',
                                'transition-all duration-300',
                                'group-hover:bg-primary/30 group-hover:border-primary/50',
                                isOpen && 'bg-primary/40 border-primary rotate-180',
                            )}
                        >
                            <ChevronDown className="text-primary h-4 w-4 transition-transform duration-300" />
                        </div>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
                    <div className="px-6 pb-6">
                        <div className="border-primary/20 border-t pt-4">
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

export function FaqSection() {
    const { trackCTA } = useAnalytics();

    const handleCtaClick = () => {
        trackCTA('faq_section', 'Join Sekarang', '#pricing-section');

        // scroll to pricing section
        const pricingSection = document.getElementById('pricing-section');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="border-border/50 relative border-none py-20 lg:py-32">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="via-primary/5 absolute inset-0 bg-gradient-to-b from-transparent to-transparent" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Left Column - Header */}
                    <div className="space-y-8 lg:sticky lg:top-8">
                        <div className="space-y-6">
                            <div className="animate-fade-in">
                                <div className="bg-primary/10 border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
                                    <HelpCircle className="text-primary h-4 w-4" />
                                    <span className="text-primary text-sm font-medium">FAQ</span>
                                </div>
                            </div>

                            <div className="animate-fade-in space-y-4" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                                <h2 className="text-foreground text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                                    <span className="block">Pertanyaan Yang</span>
                                    <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                        Sering Ditanyakan
                                    </span>
                                </h2>
                                <p className="text-muted-foreground text-xl leading-relaxed">
                                    kontak email dibawah untuk pertanyaan! : gumpreneur91@gmail.com
                                </p>
                            </div>
                        </div>

                        {/* Contact CTA */}
                        <div className="animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                            <div className="space-y-4 rounded-2xl py-2 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 border-primary/30 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border">
                                        <MessageCircle className="text-primary h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-foreground font-semibold">Whatsapp</h3>
                                        <p className="text-muted-foreground text-sm">+6282253204242</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 border-primary/30 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border">
                                        <MapPin className="text-primary h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-foreground font-semibold">Alamat</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Toko (LATHEEFA) SEBRANG MUSHOLA AL-HUDA Link Ciberko Kecil Rt.1 Rw.3 No 12, 42424, Kalitimbang, Cibeber,
                                            Kota Cilegon, Cibeber, Banten, Indonesia 
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCtaClick}
                                    className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 hover:border-primary/50 w-full rounded-xl border px-4 py-3 font-medium transition-all duration-300"
                                >
                                    Join Sekarang
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - FAQ Items */}
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <FaqItem key={faq.id} faq={faq} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
