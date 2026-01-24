import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CtaButton } from '@/components/ui/cta-button';
import { useAnalytics } from '@/hooks/use-analytics';
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
        title: 'SADARIN DIRI DULU',
        videoCount: 12,
        duration: '2.5 jam',
        description:
            'Sering ngerasa "Ah, aku cuma ibu rumah tangga, bisa apa?" atau "Aku gaptek banget, mana mungkin bisa bisnis?" Stop. Tarik napas dulu, Di bab pertama ini, kita gak akan langsung bahas teknis yang bikin pusing. Kita akan benerin dulu fondasinya. Kita akan ubah mindset kamu lewat materi-materi ini:',
        thumbnail: '/storage/landing/curriculum2/1.png',
        topics: [
            '🎬 “Aku Cuma Ibu Rumah Tangga? Salah Besar!”',
            'Apa Itu Produk Digital & Kenapa Ini Jalan Termurah Buat Muslimah Mulai Bisnis',
            'Bedanya Jualan Online Biasa vs Bisnis Produk Digital (No Modal, No Gudang!)',
            'Perbedaan punya produk sendiri dan Affiliate produk digital',
            'Apa itu MRR dan PLR?',
            'Apa itu konten? dan kenapa harus ngonten?',
            'Aku Gaptek Tapi Mau Belajar — Harus Mulai dari Mana?',
        ],
        difficulty: 'Beginner',
        students: 15420,
    },
    {
        id: '2',
        number: '02.',
        title: 'TEMUKAN POTENSIMU',
        videoCount: 18,
        duration: '4.2 jam',
        description:
            'Sering bingung kalau ditanya, "Keahlianmu apa?" Terus jadi insecure karena ngerasa nggak punya bakat spesial kayak orang-orang di sosmed? Padahal, percaya deh, Allah itu adil. Setiap dari kita pasti dikasih kelebihan. Cuma kadang, kitanya aja yang nggak sadar atau menganggap itu hal sepele. Lewat materi ini, kita bakal panen ide dari keseharian kamu!',
        thumbnail: '/storage/landing/curriculum2/2.png',
        topics: [
            'Kamu Bisa Apa Sih? Nih Cara Tahu Bakatmu Buat Bisnis Digital',
            'Jangan Remehkan Diri Sendiri: Hal Receh yang Bisa Jadi Produk Digital!',
            'Rumus 3 Lingkaran Emas: Ketemu Ide Produk yang Laku dan Bermanfaat',
        ],
        difficulty: 'Intermediate',
        students: 12850,
    },
    {
        id: '3',
        number: '03.',
        title: 'PRAKTIK BIKIN PRODUK DIGITAL',
        videoCount: 24,
        duration: '6.8 jam',
        description:
            'Ide udah ada di tangan, sekarang saatnya kita masak idenya jadi produk beneran! Buat yang dari kemarin bilang "Aduh aku gaptek, takut salah pencet"... Tenang aja di sini kita nggak akan pakai software canggih yang bikin otak ngebul. Kita bakal pakai tools yang ramah banget buat pemula.',
        thumbnail: '/storage/landing/curriculum2/3.png',
        topics: [
            'Tutorial Bikin E-Book di Canva, Step by Step Buat Pemula',
            'Cara Riset Produk Digital yang Laku: Gak Usah Nebak-nebak!',
            'Bikin Template Lucu Tapi Bermanfaat — Cuma Modal Canva Gratisan',
            'Cara Simpen, Export, dan Siapin Produk Digital Biar Siap Dijual',
        ],
        difficulty: 'Advanced',
        students: 9640,
    },
    {
        id: '4',
        number: '04.',
        title: 'BRANDING & NGONTEN TANPA MUKA',
        videoCount: 16,
        duration: '3.7 jam',
        description:
            'Suka minder kalau harus ngomong di depan kamera? Tos dulu! ✋ Kamu nggak sendirian. Di dunia produk digital, kamu gak perlu tampil muka juga gapapa kok. Yang penting itu value (manfaat) yang kamu kasih. Di bab ini, aku ajarin caranya bangun personal branding yang kuat tanpa perlu nunjukin wajah di sosmed!',
        thumbnail: '/storage/landing/curriculum2/4.png',
        topics: [
            'Bikin Nama Brand & Bio Instagram yang Langsung Dikenal Orang',
            'Ngonten Tanpa Tampil Wajah: Caraku Tetap Dapet Cuannya!',
            '1 Hari 1 Konten — Rahasia Biar Gak Burnout & Tetep Konsisten',
            'Bikin Caption yang Bikin Orang ‘Ngerasa Disindir Tapi Tersadar',
        ],
        difficulty: 'Advanced',
        students: 8320,
    },
    {
        id: '5',
        number: '05.',
        title: 'CARA JUALAN TANPA MAKSA',
        videoCount: 14,
        duration: '3.1 jam',
        description:
            'Kita buang jauh-jauh cara jualan yang agresif dan bikin orang kabur. Di bab ini, kita belajar cara jualan yang elegan. Prinsipnya kita nggak nodong orang buat beli, tapi kita bikin mereka yang butuh dan nyariin produk kamu.',
        thumbnail: '/storage/landing/curriculum2/5.png',
        topics: ['Soft Selling: Cara Jualan Halus Tapi Bikin Orang Pengen Beli', 'Platform Jual Produk Digital: Dari LYNK ID sampe WhatsApp Catalog'],
        difficulty: 'Intermediate',
        students: 7890,
    },
    {
        id: '6',
        number: '06.',
        title: 'HIDUP SEIMBANG, BISNIS JALAN',
        videoCount: 8,
        duration: '1.8 jam',
        description:
            'Bisnis jalan terus, tapi cucian numpuk dan anak rewel? Duh, jangan sampai kejadian ya Bun. Tujuan kita belajar bisnis digital itu biar punya waktu lebih banyak sama keluarga, bukan malah jadi stres sendiri. Kita nggak perlu jadi Superwoman yang sempurna 24 jam. Kita cuma perlu strategi yang pas buat ibu-ibu kayak kita. ',
        thumbnail: '/storage/landing/curriculum2/6.png',
        topics: [
            'Gimana Aku Ngatur Waktu Antara Dapur, Anak, & Bisnis Digital',
            'Checklist Mingguan Biar Hidup Gak Berantakan',
            'Waktu Hasil Belum Kelihatan: Cara Biar Gak Patah Semangat',
            'Kenapa Komunitas Penting Buat Ibu Rumah Tangga yang Belajar Digital',
            'Level Up Biar Makin Expert',
            'Bonus Grup Bimbingan per 10 Orang [EXCLUSIF]',
        ],
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
    const { trackCTA } = useAnalytics();

    const handleCtaClick = () => {
        trackCTA('curriculum_section', 'Gabung Sekarang', '#pricing-section');
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
                                <span className="text-primary text-sm font-medium">Belajar Tanpa Ribet</span>
                            </div>
                        </div>

                        <div className="animate-fade-in space-y-4" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                            <h2 className="text-foreground text-4xl font-bold md:text-5xl lg:text-6xl">
                                <span className="block">Kurikulum Manisnya</span>
                                <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                    Produk Digital
                                </span>
                            </h2>
                            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
                                Aku udah susun materinya dari A-Z dengan terstruktur. Tujuannya biar kamu paham dan punya bekal buat dapet cuan dari
                                bisnis digital ini
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
