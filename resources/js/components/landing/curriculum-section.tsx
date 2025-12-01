import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CtaButton } from '@/components/ui/cta-button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, CirclePlay } from 'lucide-react';
import { useState } from 'react';

interface CurriculumModule {
    id: string;
    number: string | number; // Allow both string and number for flexibility
    title: string;
    videoCount: number;
    duration: string;
    description: string;
    thumbnail: string;
    topics: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    students: number;
}

const curriculumModules: CurriculumModule[] = [
    {
        id: '1',
        number: '01.',
        title: 'Cara Sederhana Menentukan Niche di Awal',
        videoCount: 12,
        duration: '2.5 jam',
        description:
            'Dulu: Bingung berminggu-minggu mikirin mau jualan apa, ujung-ujungnya ragu dan berhenti. Sekarang: Pakai Wheels of Life dan bantuan AI, kamu bisa temukan winning niche cuma dalam hitungan menit! Jangan sampai buang waktu bangun bisnis di kolam yang kering. Di sini kita bedah cara validasi ide biar nggak boncos di tengah jalan.',
        thumbnail: '/storage/landing/curriculum/14.png',
        topics: [
            'Fundamental: Menentukan Niche & Target Audience',
            "Menggunakan Framework 'Wheels of Life' untuk Validasi Niche",
            'Panduan Instalasi & Personalisasi ChatGPT',
            'Brainstorming Ide Niche & Konten dengan Bantuan AI',
            'Dasar Branding: Membuat Logo & Palet Warna',
            'Strategi Affiliate Marketing Produk Digital',
        ],
        difficulty: 'Beginner',
        students: 15420,
    },
    {
        id: '2',
        number: '02.',
        title: 'Tutorial Lengkap LYNK.ID',
        videoCount: 18,
        duration: '4.2 jam',
        description:
            'Punya followers banyak tapi nggak ada tempat jualan? Sama aja bohong. Ubah bio link kamu jadi MESIN UANG otomatis. Kita bakal setup Lynk.id dari nol sampai jadi toko online profesional yang siap terima duit 24 jam. Nggak perlu jago coding, nggak perlu bayar programmer mahal. Tinggal klik, geser, jadi!',
        thumbnail: '/storage/landing/curriculum/15.png',
        topics: [
            'Setup Akun: Pendaftaran, Profil, dan Tautkan Sosmed',
            'Kustomisasi Tampilan (Font, Button, Warna) & Statistik',
            'Integrasi WhatsApp & Landing Page Builder',
            'Desain Landing Page Estetik dengan Canva',
            'Manajemen Lead Magnet & Tautan Video',
            'Setting Bahasa & Update Informasi Rekening',
            'Manajemen Produk: Urutan, Komisi Affiliate, & Voucher',
            'Menambahkan Elemen Visual & Teks pada Halaman',
            'Integrasi Link Eksternal (Shopee, Grup WA, Youtube)',
            'Fitur Appointment & Penarikan Komisi (Withdrawal)',
            'Strategi Affiliate Produk Orang Lain & Produk Fisik',
            'Fitur Monetisasi Tambahan: Traktir Kopi & Subscription',
            'Verifikasi Akun untuk Membuka Peluang Affiliate',
        ],
        difficulty: 'Intermediate',
        students: 12850,
    },
    {
        id: '3',
        number: '03.',
        title: 'Cara Membuat Konten dari Nol',
        videoCount: 24,
        duration: '6.8 jam',
        description:
            'Masih ngedit video berjam-jam sampai mata pedes? Stop cara lama! Aku kasih tau jalan pintasnya: Bikin konten visual di Canva + edit video sat-set di CapCut. Bahkan kalau kamu blank ide, kita suruh AI mikir buat kamu. Hasilnya? Konten high quality serasa punya tim editor profesional, padahal cuma modal HP!',
        thumbnail: '/storage/landing/curriculum/16.png',
        topics: [
            'Riset Ide Hook & Caption Reels Menggunakan ChatGPT',
            'Batching Content: Strategi Konsistensi Tanpa Burnout',
            'Produksi Konten Visual Canva (Carousel, Single Post, & Animasi)',
            'Teknik ATM (Amati Tiru Modifikasi) Kreator Viral',
            'Tutorial Editing CapCut Mobile: Basic (Cut, Audio, Text)',
            'Tutorial Editing CapCut Mobile: Advanced (Overlay, Keyframe, BG Removal)',
            'Tutorial Editing CapCut Mobile: Finishing (Auto Caption, Color Grading, AI Avatar)',
            'Strategi Konten Faceless dengan Presentasi Canva',
            'Fast Track: 7 Langkah Editing Konten Tutorial',
        ],
        difficulty: 'Advanced',
        students: 9640,
    },
    {
        id: '4',
        number: '04.',
        title: 'Optimasi Akun Instagram',
        videoCount: 16,
        duration: '3.7 jam',
        description:
            'Main Instagram jangan cuma ngejar likes, tapi kejar trust. Algoritma berubah terus? Nggak masalah kalau pondasi branding kamu kuat. Di bab ini, kita bongkar rahasia bikin profil yang "mahal", strategi konten Faceless (buat yang malu tampil), sampai cara baca sinyal algoritma biar konten kamu terus disorong ke audience yang tepat.',
        thumbnail: '/storage/landing/curriculum/17.png',
        topics: [
            'Optimasi Bio & Integrasi Link LYNK.ID',
            'Strategi Akun Creator & Transisi Akun Lama vs Baru',
            'Produksi Konten: Reels Faceless & IG Story Engagement',
            'Desain Cover/Sampul Hook di Canva & CapCut',
            'Membangun Loyal Audience & Memahami Algoritma IG',
            'Ekosistem Threads: Login, Mirroring, & Konten AI',
            'Memahami Journey Audience & KPI FYP',
        ],
        difficulty: 'Advanced',
        students: 8320,
    },
    {
        id: '5',
        number: '05.',
        title: 'Optimasi Akun Tiktok',
        videoCount: 14,
        duration: '3.1 jam',
        description:
            'TikTok itu tambang emas, tapi banyak yang kena banned karena asal main. Jangan sampai akun yang udah capek dibangun hilang gitu aja. Pelajari cara main aman, teknik hook yang bikin orang betah nonton sampai habis, dan strategi naruh link jualan biar nggak dianggap spam sama TikTok. Main cerdas, bukan main ganas.',
        thumbnail: '/storage/landing/curriculum/18.png',
        topics: ['Strategi Penautan Link Bio (Di bawah & Di atas 1k Followers)', 'Teknik Recording & Hack Algoritma TikTok Anti Pelanggaran'],
        difficulty: 'Intermediate',
        students: 7890,
    },
    {
        id: '6',
        number: '06.',
        title: 'Automasi dengan ManyChat',
        videoCount: 8,
        duration: '1.8 jam',
        description:
            'Masih balesin DM satu-satu secara manual? Big No! Waktumu terlalu berharga buat jadi CS seharian. Aktifkan "Asisten Robot" kamu sekarang. Mau jam 2 pagi atau lagi liburan, ManyChat bakal bantu jawab calon pembeli dan arahkan mereka sampai closing. Otomatisasi adalah kunci passive income yang sebenarnya!',
        thumbnail: '/storage/landing/curriculum/19.png',
        topics: ['Setup Auto Reply Instagram (via HP & Laptop)', 'Setup DM Automation TikTok', 'Integrasi Lanjutan dengan DIBALES.AI'],
        difficulty: 'Beginner',
        students: 11250,
    },
    {
        id: '7',
        number: '07.',
        title: 'WhatsApp Marketing',
        videoCount: 8,
        duration: '1.8 jam',
        description:
            'Sosmed bisa hilang, tapi database kontak adalah aset abadi. Pelajari seni closing di WhatsApp tanpa terlihat maksa. Kita bahas strategi funneling, cara bikin status WA yang bikin orang kepo dan beli, sampai manajemen database pakai AI. Sekali broadcast, orderan langsung deras!',
        thumbnail: '/storage/landing/curriculum/20.png',
        topics: [
            'Strategi Funneling & Closing Cepat di WhatsApp',
            'Optimasi WhatsApp Story untuk Jangkauan Maksimal',
            'Manajemen Kolam Audience (Grup) dengan Bantuan AI',
        ],
        difficulty: 'Beginner',
        students: 11250,
    },
    {
        id: '8',
        number: '08.',
        title: 'Evaluasi & Analisis Konten',
        videoCount: 8,
        duration: '1.8 jam',
        description:
            'Bikin konten capek-capek tapi nggak tau kenapa sepi? Atau ramai tapi nggak ada yang beli? Masalahnya satu: Kamu nggak bisa baca data. Di sini kita belajar bedah insight. Cari tahu mana yang winning, mana yang sampah. Stop main tebak-tebakan, mulailah ambil keputusan bisnis berdasarkan data nyata!',
        thumbnail: '/storage/landing/curriculum/21.png',
        topics: ['Cara Membaca & Menganalisis Data Performa Konten', 'Evaluasi Strategi Berdasarkan Insight Data'],
        difficulty: 'Beginner',
        students: 11250,
    },
    {
        id: '9',
        number: '09.',
        title: 'Panduan Materi Cuan dari Konten',
        videoCount: 8,
        duration: '1.8 jam',
        description: 'Disini kamu akan belajar gimana caranya bisa mulai hasilkan uang pertama mu dengan konten',
        thumbnail: '/storage/landing/curriculum/22.png',
        topics: ['Materi cuan dari konten'],
        difficulty: 'Beginner',
        students: 11250,
    },
    {
        id: '10',
        number: '10.',
        title: 'Checklist Materi',
        videoCount: 8,
        duration: '1.8 jam',
        description: 'Checklist Materi',
        thumbnail: '/storage/landing/curriculum/23.png',
        topics: ['Checklist Materi'],
        difficulty: 'Beginner',
        students: 11250,
    },
    {
        id: '11',
        number: '11.',
        title: 'Bonus!! Cara Membuat Produk Digital Sendiri',
        videoCount: 8,
        duration: '1.8 jam',
        description: 'Disini kamu akan di siapkan untuk mulai membuat produk digital kamu sendiri.',
        thumbnail: '/storage/landing/curriculum/24.png',
        topics: [
            'Panduan membuat ebook profesional sampai layout',
            'Panduan membuat story book yang hasilin cuan',
            'Panduan membuat worksheet anak',
            'Leading the viewers eye',
            'Cara membuat game AI',
        ],
        difficulty: 'Beginner',
        students: 11250,
    },
    {
        id: '12',
        number: '12.',
        title: 'Hukum Asal Affiliator',
        videoCount: 8,
        duration: '1.8 jam',
        description: 'Hukum asal affiliator',
        thumbnail: '/storage/landing/curriculum/24.png',
        topics: ['Hukum asal affiliator'],
        difficulty: 'Beginner',
        students: 11250,
    },
];

const difficultyColors = {
    Beginner: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    Intermediate: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400',
    Advanced: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
};

interface CurriculumCardProps {
    module: CurriculumModule;
    delay: number;
}

function CurriculumCard({ module, delay }: CurriculumCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl',
                'from-card/90 to-card/50 bg-gradient-to-br backdrop-blur-sm',
                'border-border/30 hover:border-primary/40 border',
                'transition-[transform,box-shadow] duration-700 hover:-translate-y-1 hover:scale-[1.01]',
                'hover:shadow-primary/10 hover:shadow-2xl',
                'animate-fade-in',
            )}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            {/* Floating Number Badge */}
            {/* <div className="absolute -top-1 -left-1 z-10">
                <div
                    className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-2xl',
                        'from-primary to-primary/80 bg-gradient-to-br',
                        'border-primary/30 shadow-primary/20 border shadow-lg',
                        'text-primary-foreground text-lg font-bold',
                        'transition-transform duration-300 group-hover:scale-110',
                    )}
                >
                    {module.number}
                </div>
            </div> */}

            <div className="bg-primary/15 p-6 md:flex md:gap-6">
                {/* Thumbnail Section */}
                <div className="mb-6 md:mb-0 md:w-2/5">
                    <div className="relative aspect-video overflow-hidden rounded-xl">
                        {/* Loading skeleton */}
                        {!imageLoaded && <div className="from-muted/20 via-muted/10 to-muted/20 absolute inset-0 animate-pulse bg-gradient-to-r" />}

                        <img
                            src={module.thumbnail}
                            alt={module.title}
                            className={cn(
                                'h-full w-full object-cover transition-all duration-700',
                                'group-hover:scale-110',
                                imageLoaded ? 'opacity-100' : 'opacity-0',
                            )}
                            onLoad={() => setImageLoaded(true)}
                            loading="lazy"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Play Button */}
                        {/* <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="bg-primary/90 border-primary/30 flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-sm">
                                <Play className="text-primary-foreground ml-0.5 h-5 w-5" fill="currentColor" />
                            </div>
                        </div> */}

                        {/* Stats Overlay */}
                        {/* <div className="absolute right-3 bottom-3 left-3 flex justify-between">
                            <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                                <Play className="h-3 w-3 text-white/80" />
                                <span className="text-xs text-white/80">{module.videoCount} videos</span>
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                                <Clock className="h-3 w-3 text-white/80" />
                                <span className="text-xs text-white/80">{module.duration}</span>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4 md:w-3/5">
                    {/* Header */}
                    <div className="space-y-3">
                        <h2 className="text-primary text-2xl font-bold">{module.number}</h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-foreground group-hover:text-primary text-3xl font-bold transition-colors duration-300">
                                {module.title}
                            </h3>
                            {/* <div
                                className={cn(
                                    'rounded-full border px-2 py-1 text-xs font-medium',
                                    'bg-gradient-to-r backdrop-blur-sm',
                                    difficultyColors[module.difficulty],
                                )}
                            >
                                {module.difficulty}
                            </div> */}
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed">{module.description}</p>
                    </div>

                    {/* Stats */}
                    {/* <div className="text-muted-foreground flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{module.students.toLocaleString()} siswa</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                            <span>4.9 rating</span>
                        </div>
                    </div> */}

                    {/* Expkamuble Topics */}
                    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3">
                        <CollapsibleTrigger asChild>
                            <div
                                role="button"
                                tabIndex={0}
                                className="hover:bg-primary/10 flex w-full cursor-pointer items-center justify-between rounded-lg bg-transparent px-4 py-3 text-left transition-colors"
                            >
                                <span className="text-foreground text-sm font-medium">
                                    <CirclePlay className="me-2 inline-block" />
                                    {module.topics.length} topik pembelajaran
                                </span>
                                {isOpen ? (
                                    <ChevronDown className="text-muted-foreground h-4 w-4 transition-transform duration-200" />
                                ) : (
                                    <ChevronRight className="text-muted-foreground h-4 w-4 transition-transform duration-200" />
                                )}
                            </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="space-y-2">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {module.topics.map((topic, index) => (
                                    <div key={index} className="bg-card/50 flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
                                        <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                                        <span className="text-muted-foreground">{topic}</span>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div
                className="from-primary/20 to-primary/20 absolute -inset-px rounded-2xl bg-gradient-to-r via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ pointerEvents: 'none' }}
            />
        </div>
    );
}

export function CurriculumSection() {
    const handleCtaClick = () => {
        // scroll to pricing section
        const pricingSection = document.getElementById('pricing-section');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const totalVideos = curriculumModules.reduce((sum, module) => sum + module.videoCount, 0);
    const totalDuration = curriculumModules.reduce((sum, module) => {
        const hours = parseFloat(module.duration.replace(' jam', ''));
        return sum + hours;
    }, 0);

    return (
        <section className="relative py-20 lg:py-32">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_50%)]" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="space-y-16">
                    {/* Section Header */}
                    <div className="space-y-6 text-center">
                        <div className="animate-fade-in">
                            <div className="bg-primary/10 border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
                                <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                                <span className="text-primary text-sm font-medium">Kurikulum Komprehensif</span>
                            </div>
                        </div>

                        <div className="animate-fade-in space-y-4" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                            <h2 className="text-foreground text-4xl font-bold md:text-5xl lg:text-6xl">
                                <span className="block">Kurikulum Affiliate</span>
                                <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                    Jago Jualan
                                </span>
                            </h2>
                            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
                                Aku udah susun materinya dari A-Z biar kamu bisa ikuti polanya, praktekkan strateginya, dan siap-siap tembus income 5
                                juta pertamamu dengan lebih cepat.
                            </p>
                        </div>

                        {/* Course Stats */}
                        {/* <div className="animate-fade-in flex justify-center" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                            <div className="bg-card/30 border-border/30 inline-flex items-center gap-8 rounded-2xl border px-8 py-4 backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="text-primary text-2xl font-bold">{curriculumModules.length}</div>
                                    <div className="text-muted-foreground text-xs">Modul</div>
                                </div>
                                <div className="bg-border/30 h-8 w-px" />
                                <div className="text-center">
                                    <div className="text-primary text-2xl font-bold">{totalVideos}</div>
                                    <div className="text-muted-foreground text-xs">Video</div>
                                </div>
                                <div className="bg-border/30 h-8 w-px" />
                                <div className="text-center">
                                    <div className="text-primary text-2xl font-bold">{totalDuration.toFixed(1)}h</div>
                                    <div className="text-muted-foreground text-xs">Durasi</div>
                                </div>
                            </div>
                        </div> */}
                    </div>

                    {/* Curriculum Cards */}
                    <div className="space-y-8">
                        {curriculumModules.map((module, index) => (
                            <CurriculumCard key={module.id} module={module} delay={600 + index * 100} />
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    {/* <div className="animate-fade-in space-y-6 text-center" style={{ animationDelay: '1400ms', animationFillMode: 'both' }}>
                        <div className="from-primary/10 via-primary/5 to-primary/10 border-primary/20 rounded-2xl border bg-gradient-to-r p-8 backdrop-blur-sm">
                            <h3 className="text-foreground mb-4 text-2xl font-bold">Siap Mulai Journey Editing Professional kamu?</h3>
                            <p className="text-muted-foreground mx-auto mb-6 max-w-2xl">
                                Bergabung dengan ribuan creator yang sudah mentransformasi skill editing mereka dan meningkatkan engagement video
                                hingga 300%.
                            </p>
                            <div className="text-muted-foreground flex items-center justify-center gap-4 text-sm">
                                <span>✓ Akses seumur hidup</span>
                                <span>✓ Update konten gratis</span>
                                <span>✓ Komunitas eksklusif</span>
                            </div>
                        </div>
                    </div> */}

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
