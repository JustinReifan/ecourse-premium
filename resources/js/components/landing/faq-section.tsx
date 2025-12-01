import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown, HelpCircle, MapPin, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    {
        id: '1',
        question: 'Apa sih yang dipelajari di kelas ini?',
        answer: 'Di kelas ini kamu akan belajar cara jualan online dari nol sampai bisa hasilin cuan, langsung dari mentor yang sudah 13 tahun berpengalaman jualan produk fisik dan digital, serta berhasil mendapatkan 100 juta pertamanya dari Lynk.id!',
    },
    {
        id: '2',
        question: 'Kelas ini cocok untuk siapa?',
        answer: 'Kelas ini cocok banget untuk: Ibu rumah tangga yang ingin punya penghasilan tambahan dari rumah, Pemula yang belum pernah jualan online, Creator yang ingin tahu cara hasilin uang dari konten, Dan siapa pun yang mau mulai bangun personal branding dan income digital tanpa bingung dari mana memulai',
    },
    {
        id: '3',
        question: 'Apa yang saya dapat setelah ikut kelas?',
        answer: 'Kamu akan mendapatkan paket lengkap belajar jualan digital, antara lain: 🎥 30+ video tutorial lengkap (Lynk.ID, Canva, CapCut, dan strategi jualan), 🧠 Video panduan membuat eBook & Storybook dari nol sampai siap jual, 🎬 Free 170+ video aesthetic untuk bahan latihan konten, 📚 Free eBook Lead Magnet, eBook panduan bisnis digital & strategi Reels viral, 💬 Free grup bimbingan Telegram berisi latihan HOOK, caption, hashtag, template konten, dan update materi, 🎙️ Live Telegram 2 minggu sekali untuk interaksi dengan mentor & member, 📲 Free bimbingan grup WA khusus untuk praktek per 10 orang jadi sangat exclusif',
    },
    {
        id: '4',
        question: 'Apakah ada bimbingan 1-on-1?',
        answer: 'Setiap 10 peserta baru akan otomatis tergabung dalam grup WhatsApp bimbingan eksklusif bersama mentor, jadi bebas tanya² selagi mini class sedang berlangsung. Di grup ini kamu akan mendapatkan: 📹 Video pembelajaran eksklusif siap tonton, 📝 10 tugas praktek yang bisa langsung dieksekusi. Seluruh proses bimbingan ini berjalan selama kurang lebih 2 bulan, dan sudah terbukti efektif membantu banyak member benar-benar paham dan praktik.',
    },
    {
        id: '5',
        question: 'Kalau saya gaptek, bisa ikut?',
        answer: 'Justru kelas ini dirancang untuk yang gaptek dan baru mulai! Materi dibuat step-by-step, dari O sampai siap jual, bahkan disertai video latihan & template siap pakai.',
    },
    {
        id: '6',
        question: 'Kapan kelas ini mulai?',
        answer: 'Sebenarnya begitu kamu checkout dan bergabung, kamu langsung bisa mulai belajar lewat dashboard yang sudah disiapkan. Tinggal menunggu undangan grup WhatsApp bimbingan per 10 orang setelah berhasil cekout dan payment.',
    },
    {
        id: '7',
        question: 'Apakah ada garansi?',
        answer: 'Tidak ada garansi, karena hasil tiap peserta berbeda-beda tergantung usaha, waktu yang disediakan untuk belajarnya dan kecepatan praktiknya. Tapi yang pasti, semua materi sudah terbukti membantu ratusan emak² lain yang sebelumnya juga mulai dari nol — dan kini sudah bisa menghasilkan cuan dari konten digital mereka sendiri.',
    },
    {
        id: '8',
        question: 'Gimana cara daftar?',
        answer: 'Klik tombol “DAFTAR SEKARANG” di bawah ini, Pilih metode pembayaranmu, lalu nikmati semua fasilitas belajar dan bimbingan langsung dari mentor berpengalaman!',
    },
    {
        id: '9',
        question: 'Apakah harga sudah termasuk langganan Canva PRO?',
        answer: 'Tentu saja TIDAK, kamu bisa berlangganan di aplikasinya secara langsung atau melalui Canvassador resmi yang tersebar di seluruh Indonesia.',
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
    const handleCtaClick = () => {
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
