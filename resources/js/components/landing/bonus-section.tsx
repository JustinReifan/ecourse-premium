import { IndividualBonusSection } from '@/components/landing/individual-bonus-section';
import { CtaButton } from '@/components/ui/cta-button';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export const bonusData = {
    premium: {
        title: 'Full Course Value Youtuber Eksklusif',
        badge: 'Bonus #01',
        value: 'Rp 1.500.000',
        description:
            'Lu bakal dapet akses ke Full Course Youtube Eksklusif yang akan membahas semua aspek soal youtube. mulai dari ide video, thumbnail, hook, scriptwriting, dll.',
        courses: [
            {
                id: 1,
                title: 'Full Course Youtube 1',
                duration: '1 jam 40 Menit',
                description:
                    'Ini adalah Full Course Pertama sekaligus Terpanjang yang pernah gw buat. didalamnya berisi semua pembahasan aspek youtube mulai dari niche, circle of competition, thumbnail, scriptwriting, video editing, algoritma youtube, dll. ini adalah materi terdaging yang ada disini',
                thumbnail: '/storage/landing/bonusCourses/bonus-course-1.jpg',
            },
            {
                id: 2,
                title: 'Full Course Youtube 2',
                duration: '50+ Menit',
                description:
                    'Di Full Course kedua ini, lu bakal belajar  lebih lanjut soal cara membangun channel baru dan sampai ke 1000 subscriber dan 4000 jam tayang dari 0. Kita akan mendalami banyak hal mulai dari faktor x, tipe tipe youtuber, dan proses penuh gimana caranya lu bisa membuat video youtube yang bisa mendapat banyak views',
                thumbnail: '/storage/landing/bonusCourses/bonus-course-2.jpg',
            },
            {
                id: 3,
                title: 'Full Course Ide Video',
                duration: '24+ Menit',
                description:
                    'Di Full Course ini, lu bakal belajar  metode mencari ide video TERBAIK sekaligus TERCEPAT. metode ini udah digunain oleh youtuber besar seperti mrbeast, ryan trahan, dan youtuber besar lainnya. bisa dibilang, ini adalah rahasia mereka, itu kenapa course ini akan sangat valuable. ',
                thumbnail: '/storage/landing/bonusCourses/bonus-course-3.jpg',
            },
            {
                id: 4,
                title: 'Full Course Algorithm',
                duration: '??+ Menit',
                description:
                    'Sebelum lu mulai lakuin apapun buat sukses. tentunya lu harus pahamin game yang lu coba mainin. disini lu bakal belajar secara lengkap gimana persisnya algoritma youtube bekerja. dan apa yang bikin video dapet views dan enggak.',
                thumbnail: '/storage/landing/bonusCourses/tanda-tanya.jpg',
            },
            {
                id: 5,
                title: 'Full Course Thumbnail',
                duration: '??+ Menit',
                description:
                    'Di Full Course ini, lu bakal belajar semua yang lu perlu tahu soal thumbnail. mulai dari apa itu thumbnail, gimana cara thumbnail bisa bikin lu dapet banyak views, serta formula asli dan panduan lengkap soal gimana caranya lu bisa membuat thumbnail lu sendiri untuk video youtube lu',
                thumbnail: '/storage/landing/bonusCourses/tanda-tanya.jpg',
            },
            {
                id: 6,
                title: 'Full Course Hook',
                duration: '??+ Menit',
                description:
                    'Di Full Course ini, lu bakal belajar Hook. salah satu bagian terpenting di youtube yaitu 30 detik pertama yang terkenal karena memiliki penuruan paling drastis di retensi penonton. disini lu bakal belajar lengkap caranya menyusun hook yang bisa membuat persentase retensi tinggi.',
                thumbnail: '/storage/landing/bonusCourses/tanda-tanya.jpg',
            },
            {
                id: 7,
                title: 'Full Course Scriptwriting',
                duration: '??+ Menit',
                description:
                    'Dan di Full Course Terakhir ini, lu bakal belajar Scriptwriting. ini akan menjadi seluruh inti dari video lu. dan yang nentuin video lu bagus atau enggak yaitu seni dari penyusunan script video itu sendiri. disini kita bakal bahas lengkap struktur struktur dan apa yang harus lu pahami soal script, demi membuat video youtube lu sendiri,',
                thumbnail: '/storage/landing/bonusCourses/tanda-tanya.jpg',
            },
        ],
    },
    standard: [
        {
            id: 1,
            badge: 'Bonus #01',
            title: 'Akses 30+ video tutorial lynk.id, editing capcut & canva',
            value: 'Rp 399.000',
            description:
                'Selain kurikulum dari kelas ini, kamu juga bakal dapet akses ke 30+ video tutorial lynk.id, editing capcut, editing canva, dari O sampai siap jual beserta update materinya',
            image: '/storage/landing/bonus/1.png',
            features: ['50+ Template Premium', 'Color Grading Presets', 'Custom Transitions'],
        },
        {
            id: 2,
            badge: 'Bonus #02',
            title: 'Webinar ngonten dari O sampai bisa cuan',
            value: 'Rp 499.000',
            description:
                'Bongkar peta jalan dari nol banget sampai pecah telur. Kita bahas mindset dan strategi biar kontenmu bukan cuma dapet likes, tapi beneran bisa menghasilkan duit.',
            image: '/storage/landing/bonus/2.png',
            features: ['200+ Music Tracks', 'Bebas Copyright', 'Update Bulanan'],
        },
        {
            id: 3,
            badge: 'Bonus #03',
            title: 'Video cara membuat ebook dan storybook dari O',
            value: 'Rp 399.000',
            description:
                'Mau punya produk digital sendiri? Aku ajarin cara bikin Ebook & Storybook yang layak jual dari nol, walau kamu merasa nggak jago nulis sekalipun.',
            image: '/storage/landing/bonus/3.png',
            features: ['60 Menit Review', 'Feedback Detail', 'Action Plan'],
        },
        {
            id: 4,
            badge: 'Bonus #04',
            title: '170+ Video aesthetic untuk bahan latihan ngonten',
            value: 'Rp 149.000',
            description:
                'Gak PD nampil muka? Atau lagi males syuting? Tenang, aku kasih stok 170+ video estetik siap pakai. Tinggal templok teks, upload, beres! Gak ada alasan kehabisan stok konten',
            image: '/storage/landing/bonus/4.png',
            features: ['60 Menit Review', 'Feedback Detail', 'Action Plan'],
        },
        {
            id: 5,
            badge: 'Bonus #05',
            title: 'E-book lead magnet untuk praktek, E-book panduan bisnis digital, dan strategi reels viral',
            value: 'Rp 249.000',
            description:
                'Contekan strategi lewat tulisan. Mulai dari ide lead magnet penarik massa sampai rahasia algoritma Reels viral, semuanya tinggal kamu baca dan tiru polanya',
            image: '/storage/landing/bonus/5.png',
            features: ['60 Menit Review', 'Feedback Detail', 'Action Plan'],
        },
        {
            id: 6,
            badge: 'Bonus #06',
            title: 'Bimbingan Personal Via WhatsApp',
            value: 'Rp 2.999.000',
            description:
                'Bingung pas praktek? Chat aku aja! Ini jalur VIP khusus buat kamu tanya-tanya sepuasnya langsung ke WhatsApp pribadiku. Serasa punya mentor privat!',
            image: '/storage/landing/bonus/6.png',
            features: ['60 Menit Review', 'Feedback Detail', 'Action Plan'],
        },
        {
            id: 7,
            badge: 'Bonus #07',
            title: 'Grup bimbingan latihan bahan konten reels via telegram',
            value: 'Rp 1.499.000',
            description:
                'Lingkungan itu pengaruh banget. Gabung bareng temen-temen seperjuangan, kita saling support, koreksi konten, dan tumbuh bareng biar semangatmu gak kendor.',
            image: '/storage/landing/bonus/7.png',
            features: ['60 Menit Review', 'Feedback Detail', 'Action Plan'],
        },
        {
            id: 8,
            badge: 'Bonus #08',
            title: 'Fasilitas Mentorship Live 2 minggu 1x',
            value: 'Rp 4.599.000',
            description:
                'Kita tatap muka virtual rutin tiap 2 minggu! Sesi bedah akun, evaluasi progress, dan tanya jawab langsung biar kamu dipastikan nggak salah arah. ',
            image: '/storage/landing/bonus/8.png',
            features: ['60 Menit Review', 'Feedback Detail', 'Action Plan'],
        },
    ],
};

const bonusImages = [
    { id: 1, image: '/storage/landing/bonus/7.png' },
    { id: 2, image: '/storage/landing/bonus/4.png' },
    { id: 3, image: '/storage/landing/bonus/1.png' },
    { id: 4, image: '/storage/landing/bonus/8.png' },
];

export function BonusSection() {
    const [activePreview, setActivePreview] = useState(1);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    const handleCtaClick = () => {
        // scroll to pricing section
        const pricingSection = document.getElementById('pricing-section');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        AOS.init({
            duration: 1000, // Animation duration in milliseconds
            // easing: 'ease-in-out', // Easing function for the animation
            // delay: 100,
            once: true, // Whether animation should only happen once
        });
        // Optional: Call AOS.refresh() if your content changes dynamically after initial load
        // AOS.refresh();
    }, []);

    const handleCtaClick2 = () => {
        // scroll to pricing section
        const pricingSection = document.getElementById('pricing-section');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const totalValue = 10792000; // Rp 1,190,000

    return (
        <section className="relative overflow-hidden py-20 lg:py-32">
            {/* Background Effects */}
            <div className="from-background via-background to-primary/5 absolute inset-0 bg-gradient-to-br" />
            <div className="bg-primary/10 absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl" />
            <div
                className="bg-accent/10 absolute right-1/4 bottom-1/4 h-80 w-80 animate-pulse rounded-full blur-3xl"
                style={{ animationDelay: '1s' }}
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Bonus Introduction */}
                <div className="mb-16 space-y-8 text-center">
                    <div className="animate-fade-in">
                        <div className="bg-primary/10 border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
                            <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                            <span className="text-primary text-sm font-medium">Bonus Tambahan</span>
                        </div>
                    </div>

                    <div className="animate-fade-in space-y-4" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                        <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                            <span className="text-foreground block">Takut Gak Bisa Praktek?</span>
                            <span className="mt-2 block">
                                {/* <span className="text-foreground"> </span> */}
                                <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                    Tenang, Aku Udah Siapin Bonus!
                                </span>
                            </span>
                        </h2>
                        <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
                            Gak ada alasan lagi buat nunda. Mulai dari stok video, template, sampai bimbingan personal, semua tools pendukungnya udah
                            aku sediain. Kamu tinggal pake dan langsung bisa praktek
                        </p>
                    </div>

                    {/* Bonus Preview Grid */}
                    <div
                        className="animate-fade-in mx-auto grid max-w-3xl grid-cols-2 gap-4" // <-- UBAH DI SINI
                        style={{ animationDelay: '400ms', animationFillMode: 'both' }}
                    >
                        {bonusImages.map((bonus) => (
                            <div
                                key={bonus.id}
                                className="group from-card/50 to-card/20 border-border/50 hover:border-primary/50 relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border bg-gradient-to-br transition-all duration-500 hover:scale-105"
                                onMouseEnter={() => setHoveredCard(bonus.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                        className={`bg-primary/20 border-primary/50 flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 ${hoveredCard === index ? 'bg-primary/30 scale-110' : ''}`}
                                    >
                                        <Play className="text-primary h-5 w-5" />
                                    </div>
                                </div> */}
                                <img
                                    src={bonus.image} // ganti sesuai path gambar lo
                                    alt={`Bonus ${bonus.id}`}
                                    className="h-full w-full object-cover"
                                />

                                {/* Hover Glow Effect */}
                                {hoveredCard === bonus.id && <div className="bg-primary/10 absolute inset-0 animate-pulse" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Premium Bonus Section */}
                {/* <div className="py-20 lg:py-32">
                    <div
                        className="from-card/50 via-card/30 to-background border-border/50 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 lg:p-12"
                        data-aos="fade-up"
                        data-aos-delay="200"
                    >
                        <div className="absolute inset-0 opacity-5">
                            <div
                                className="absolute top-0 left-0 h-full w-full"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                }}
                            />
                        </div>

                        <div className="relative">
                            <div className="space-y-16">
                                <div className="mb-16 space-y-6 text-center">
                                    <div className="animate-fade-in mb-6">
                                        <div className="bg-primary/10 border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
                                            <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                                            <span className="text-primary text-sm font-medium">{bonusData.premium.badge}</span>
                                        </div>
                                    </div>
                                    <h3 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
                                        <span className="text-foreground">{bonusData.premium.title.split(' ').slice(0, 3).join(' ')}</span>{' '}
                                        <span className="from-primary via-primary/80 to-primary block bg-gradient-to-r bg-clip-text text-transparent">
                                            {bonusData.premium.title.split(' ').slice(3).join(' ')}
                                        </span>
                                    </h3>
                                    <div className="from-primary/20 to-accent/20 border-primary/30 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-4 py-2">
                                        <Tag className="text-primary h-4 w-4" />
                                        <span className="text-primary font-bold">Value Senilai {bonusData.premium.value}</span>
                                    </div>
                                    <p className="text-muted-foreground mx-auto max-w-4xl text-lg leading-relaxed">{bonusData.premium.description}</p>
                                </div>

                                <div className="grid items-start gap-8 lg:grid-cols-5">
                                    <div className="space-y-4 lg:col-span-2">
                                        {bonusData.premium.courses.map((course, index) => (
                                            <div
                                                key={course.id}
                                                className={`group relative cursor-pointer transition-all duration-500 ${activePreview === course.id ? 'scale-105' : 'hover:scale-102'}`}
                                                onClick={() => setActivePreview(course.id)}
                                            >
                                                <div
                                                    className={`relative aspect-video overflow-hidden rounded-xl border-2 transition-all duration-300 ${activePreview === course.id ? 'border-primary shadow-primary/25 shadow-2xl' : 'border-border/50 hover:border-primary/50'}`}
                                                >
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="from-primary/20 to-accent/20 flex h-full w-full items-center justify-center bg-gradient-to-br">
                                                            <Youtube className="text-primary h-8 w-8" />
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                        <div className="bg-primary/90 flex h-16 w-16 scale-90 transform items-center justify-center rounded-full backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
                                                            <Play className="text-primary-foreground ml-1 h-6 w-6" />
                                                        </div>
                                                    </div>

                                                    <div className="absolute top-3 left-3">
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${activePreview === course.id ? 'bg-primary text-primary-foreground' : 'bg-black/50 text-white'}`}
                                                        >
                                                            {String(index + 1).padStart(2, '0')}
                                                        </div>
                                                    </div>

                                                    {index === 0 && (
                                                        <div className="absolute right-3 bottom-3">
                                                            <div className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                                                                100% GRATIS
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="lg:col-span-3">
                                        <div className="space-y-6">
                                            {bonusData.premium.courses.map((course, index) => (
                                                <div
                                                    key={course.id}
                                                    className={`transition-all duration-500 ${activePreview === course.id ? 'translate-y-0 transform opacity-100' : 'translate-y-4 transform opacity-60'}`}
                                                >
                                                    <div className="from-card/50 border-border/30 hover:border-primary/30 flex items-start gap-4 rounded-2xl border bg-gradient-to-r to-transparent p-6 transition-all duration-300">
                                                        <div className="flex-shrink-0">
                                                            <div className="from-primary to-accent bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
                                                                {String(index + 1).padStart(2, '0')}.
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-foreground mb-2 text-xl font-bold">{course.title}</h4>
                                                            <div className="mb-3 flex items-center gap-2">
                                                                <Clock className="text-primary h-4 w-4" />
                                                                <span className="text-primary text-sm font-medium">{course.duration}</span>
                                                            </div>
                                                            <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
                    </div>
                </div> */}

                {/* Individual Bonus Sections */}
                {/* Note: Individual bonus sections are now rendered separately */}
                {bonusData.standard.map((bonus, index) => (
                    <IndividualBonusSection key={bonus.id} bonus={bonus} index={index} />
                ))}

                {/* Value Summary */}
                <div className="animate-fade-in text-center" style={{ animationDelay: '1400ms', animationFillMode: 'both' }}>
                    <div className="from-primary/10 via-card/50 to-accent/10 border-primary/30 inline-block rounded-3xl border bg-gradient-to-br p-8 backdrop-blur-sm">
                        <div className="space-y-4">
                            <h3 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">Total Value Yang Kamu Dapatkan</h3>
                            <div className="from-primary via-primary/80 to-accent bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                                Rp {totalValue.toLocaleString('id-ID')}
                            </div>
                            <p className="text-muted-foreground mx-auto max-w-2xl">
                                Semua bonus senilai <span className="text-primary font-bold">Rp {totalValue.toLocaleString('id-ID')}</span> ini kamu
                                dapatkan <span className="text-primary font-bold">GRATIS</span> saat bergabung di kelas ini!
                            </p>

                            <div className="pt-4">
                                <button onClick={handleCtaClick2}>
                                    <CtaButton variant="primary" size="lg" className="group">
                                        <Sparkles className="me-3 inline-block h-3 w-3 group-hover:animate-spin" />
                                        <span>Ambil Bonus Sekarang</span>
                                        {/* <div className="bg-primary absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full" /> */}
                                    </CtaButton>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
