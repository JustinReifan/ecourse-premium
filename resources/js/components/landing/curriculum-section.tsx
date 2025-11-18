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
        title: 'INTRODUCTION',
        videoCount: 12,
        duration: '2.5 jam',
        description:
            'Dibagian ini kamu akan mendapatkan materi pengenalan Kelas dan fundamental mengapa kamu harus mempelajari skill Canva dan desain grafis. Kamu akan mendapatkan wawasan kenapa skill ini dibutuhkan di dunia digital saat ini, sehingga menjadi modal untuk mendapatkan cuan tambahan. ',
        thumbnail: '/storage/landing/curriculum/1.webp',
        topics: ['Belajar Apa Aja di Kelas Ini', 'Kenapa Harus Canva', 'Prinsip Dasar Desain Grafis'],
        difficulty: 'Beginner',
        students: 15420,
    },
    {
        id: '2',
        number: '02.',
        title: 'PENGENALAN USER INTERFACE CANVA',
        videoCount: 12,
        duration: '2.5 jam',
        description:
            'Disini akan dijelaskan mengenai Tampilan Menu Canva yang menjadi dasar dalam pembuatan karya di Canva. Menu yang dikenalkan yaitu menu dashboard ditampilkan awal Canva, juga akan dijelaskan bagaimana cara login, membuat akun dan berlangganan akun Canva pro secara resmi. ',
        thumbnail: '/storage/landing/curriculum/2.webp',
        topics: ['Login & Buat Akun', 'Cara Berlangganan Akun Pro Canva', 'Pengenalan Dashboard Canva'],
        difficulty: 'Beginner',
        students: 15420,
    },
    {
        id: '3',
        number: '03.',
        title: 'FITUR CANVA',
        videoCount: 18,
        duration: '4.2 jam',
        description:
            'Di Materi ini kamu akan lebih spesifik dijelaskan mengenai tampilan editor Canva secara umum, mulai dari menu desain, menu elemen, menu teks sampai seterusnya, lalu akan dijelaskan juga beberapa shortcut untuk mempermudah dalam mengerjakan project di Canva Desktop. ',
        thumbnail: '/storage/landing/curriculum/3.webp',
        topics: ['Menu Editor Canva', 'Shortcut Canva'],
        difficulty: 'Intermediate',
        students: 12850,
    },
    {
        id: '4',
        number: '04.',
        title: 'TYPE/TEXT TOOL',
        videoCount: 24,
        duration: '6.8 jam',
        description:
            'Materi ini membahas tentang penggunaan teks/type di Canva. Bagaimana cara membuat dan mengatur teks dengan baik dan membuat teks menarik di Canva',
        thumbnail: '/storage/landing/curriculum/4.webp',
        topics: [
            'Mengenal Tipografi dan Tips/Triknya',
            'Dasar Text Tool di Canva',
            'Memilih dan Menambahkan Font',
            'Memberikan Efak Pada Teks',
            'Huruf Besar dan Perataan',
            'Daftar dan Atur Jarak Huruf/Paragraf',
            'Pemformatan Lanjutan',
            'Transparansi dan Effek',
        ],
        difficulty: 'Advanced',
        students: 9640,
    },
    {
        id: '5',
        number: '05.',
        title: 'SHAPE TOOL',
        videoCount: 16,
        duration: '3.7 jam',
        description:
            'Materi ini membahas tentang shape yang merupakan bagian dari elemen desain. Cara mengatur dan mengedit shape serta customisasi dan memberikan efek pada shape. ',
        thumbnail: '/storage/landing/curriculum/5.webp',
        topics: ['Mengenal Apa Itu Shape', 'Menambah dan Mengedit Shape', 'Customisasi dan Menambahkan Efek Pada Shape'],
        difficulty: 'Advanced',
        students: 8320,
    },
    {
        id: '6',
        number: '06.',
        title: 'COLOR TOOL',
        videoCount: 14,
        duration: '3.1 jam',
        description:
            'Di materi ini kamu akan mendapatkan insight tentang warna. Bagaimana warna membentuk sebuah karya yang menarik. Ini adalah fundamental dalam desain di Canva. ',
        thumbnail: '/storage/landing/curriculum/6.webp',
        topics: [
            'Dasar Color Tool dan Cara Menggunakan Eyedropper Tool',
            'Menggunakan Gradient Tool',
            'Meniru Warna dari Website (color palette)',
            'Mengubah Warna Gambar',
        ],
        difficulty: 'Intermediate',
        students: 7890,
    },
    {
        id: '7',
        number: '07.',
        title: 'POSITIONING',
        videoCount: 8,
        duration: '1.8 jam',
        description:
            'Materi ini membahas tentang pengaturan posisi dan perataan dalam sebuah desain di Canva, dengan memiliki pengetahuan ini kamu dapat membuat karya yang lebih proporsional. ',
        thumbnail: '/storage/landing/curriculum/7.webp',
        topics: ['Allignment dan Arrange', 'Layer', 'Clipping Mask With Frame'],
        difficulty: 'Beginner',
        students: 11250,
    },
    {
        id: '8',
        number: '08.',
        title: 'EFFECT',
        videoCount: 8,
        duration: '1.8 jam',
        description: 'Ini adalah materi inti dari kelas Canva Masterclass. Semua hal terkait hack dan fitur rahasia akan di share disini. ',
        thumbnail: '/storage/landing/curriculum/8.webp',
        topics: [
            'Logo Desain, Animation Efffect,Website Desain, Ilustrasi Desain dan AI Coding',
            'Canva Sheet & Canva Doc',
            'Cara Blending Foto Transparan dan menambahkan teksture pada desain',
            'Cara membuat shape custom dengan efek remove background',
            'Cara memiringkan sebuah gambar, memiringkan huruf dan Membuat efek refleksi pada gambar',
            'Cara membuat efek blur pada gambar dan membuat efek clipping mask',
            'Cara membuat foto hitam putih menjadi berwarna',
            'Cara mendapatkan efek teks keren dan membuat teks gradasi',
            'Cara membuat mockup desain dan input logo brand di Canva langsung',
            'Cara Crop Foto ala efek kertas dan memperjernih gambar',
            'Cara buat efek teks 3D dan menambahkan noise ke gambar',
            'Cara menambahkan efek lighting ke gambar dan membuat efek huruf berisi gambar',
            'Cara menggabungkan dua gambar dan membuat teks melengkung',
            'Cara membuat QR Code menarik dan mengubah wajah dengan wajah lain',
            'Cara membuat frame/bingkai custom dan mengambil thumbnail youtube',
            'Cara memperluas gambar dan ubah warna gambar menjadi satu warna',
            'Cara dapetin pallete warna dan mencari bendera negara',
            'Cara menambahkan grid atau patokan pada canvas',
            'Cara membuat shape gelombang dan membuat replikasi ada gambar',
            'Cara membuat efek halftone dan Cara membagi/memotong gambar carousell',
            'Cara membuat animasi menulis dan membuat text putus-putus',
            'Cara membuat efek gambar slice/memotong dan membuat efek mencair',
            'Cara membuat style text menarik dan menambahkan text lorem ipsum',
            'Cara membuat animasi text dan membuat efek pangkat 2 pada teks',
            'Cara membuat huruf kapital otomatis pada semua teks',
            'Cara menambahkan outline/stroke pada teks atau gambar',
            'Cara membuat sudut gambar menjadi lengkung/tumpul',
        ],
        difficulty: 'Beginner',
        students: 11250,
    },
    {
        id: '9',
        number: '09.',
        title: 'PRAKTIK MEMBUAT PRODUK DIGITAL',
        videoCount: 8,
        duration: '1.8 jam',
        description:
            'Di materi ini kamu akan mendapatkan informasi dalam membuat produk digital. Harapannya kamu dapat menjualnya ketika kamu sudah mahir dalam membuat produk digital di Canva. Produk tersebut diantaranya, Template Poster, Video Undangan, Surat Undangan, Video Motion Grafis, Template Worksheet Anak, Video animasi dari Canva Code, dan Website Interaktif dari Canva Code',
        thumbnail: '/storage/landing/curriculum/9.webp',
        topics: [
            'Membuat Template Poster',
            'Membuat Video Undangan',
            'Membuat Surat Undangan',
            'Membuat Video Motion Grafis',
            'Membuat Template Worksheet Anak',
            'Membuat Video Animasi dari Canva Code',
            'Membuat Website Interaktif dari Canva Code',
        ],
        difficulty: 'Beginner',
        students: 11250,
    },
    {
        id: '10',
        number: '10.',
        title: 'KUMPULAN REKAMAN ZOOM',
        videoCount: 8,
        duration: '1.8 jam',
        description:
            'Semua rekaman zoom dari batch 1 sampai seterusnya akan di update disini, kamu dapat mengakses kembali rekaman zoom secara full. ',
        thumbnail: '/storage/landing/curriculum/10.webp',
        topics: ['Bongkar Menu dan Fitur Canva', 'Potensi Skill Canva di Era Digital', 'Membuat Poster Bola', 'Membuat Poster Dakwah'],
        difficulty: 'Beginner',
        students: 11250,
    },
    {
        id: '11',
        number: '11.',
        title: 'UPDATE MATERI',
        videoCount: 8,
        duration: '1.8 jam',
        description:
            'Selain materi setiap hari di grup Telegram, kamu juga akan mendapatkan update materi di website, agar kamu dapat mempelajarinya secara sistematis',
        thumbnail: '/storage/landing/curriculum/11.webp',
        topics: ['Update dalam waktu dekat'],
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

                    {/* Expandable Topics */}
                    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3">
                        <CollapsibleTrigger asChild>
                            <div
                                role="button"
                                tabIndex={0}
                                className="hover:bg-muted/30 flex w-full cursor-pointer items-center justify-between rounded-lg bg-transparent px-4 py-3 text-left transition-colors"
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
                                <span className="block">Apa Aja yang akan</span>
                                <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                    Kamu Pelajari?
                                </span>
                            </h2>
                            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
                                Kamu bakal dipandu dari <span className="text-primary">A-Z</span> lewat modul terstruktur yang udah kami susun.
                                Dijamin kamu bisa belajar step by step sampai kamu jago
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
                            <h3 className="text-foreground mb-4 text-2xl font-bold">Siap Mulai Journey Editing Professional Anda?</h3>
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
