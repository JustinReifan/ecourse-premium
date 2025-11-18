import { cn } from '@/lib/utils';
import { Clock, Play } from 'lucide-react';
import { useState } from 'react';

interface VideoResult {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    views: string;
    duration: string;
    description: string;
}

const videoResults: VideoResult[] = [
    {
        id: '1',
        title: 'Cara Heroisgod Menjadi Anomali TERBERSAR Di Youtube',
        thumbnail: '/storage/landing/thumbnailResult/heroisgod.jpg',
        url: 'https://www.youtube.com/watch?v=8OFFMcRVaT4',
        views: '2.1M',
        duration: '12:45',
        description:
            'Biar gw bilang sekarang. lu lagi ngeliat Anomali TERBESAR di youtube, HEROISGOD. hertod, sang youtuber kecil, pencetus saber roam, si analyst ato analisis.......',
    },
    {
        id: '2',
        title: 'Cara Gen Z Kehilangan 30 Tahun Umur Mereka',
        thumbnail: '/storage/landing/thumbnailResult/genz.jpg',
        url: 'https://www.youtube.com/watch?v=pUxudulRizo',
        views: '1.8M',
        duration: '8:05',
        description:
            'Gen z sering digadang gadang dengan steriotipe sebagai generasi tanpa harapan, manja, lemah, oleh orang orang. akan tetapi faktanya...... ',
    },
    {
        id: '3',
        title: '7 Hal Yang Gw Harap Gw Tau Sebelum Jadi Youtuber Gaming',
        thumbnail: '/storage/landing/thumbnailResult/7hal.jpg',
        url: 'https://www.youtube.com/watch?v=9SjnozcsnJU',
        views: '1.5M',
        duration: '18:22',
        description:
            'Gw udah jadi youtuber selama 6 tahun, dan ini udah jadi perjalanan yang panjang. mulai dari channel pertama gw yang gajelas seperti kebanyakan youtuber pemula.......',
    },
    {
        id: '4',
        title: 'Youtuber, Lu Gobl*k Kalo Masi Lakuin Ini',
        thumbnail: '/storage/landing/thumbnailResult/intro.jpg',
        url: 'https://www.youtube.com/watch?v=IXO_tCg1F0Q&t=327s',
        views: '2.3M',
        duration: '14:18',
        description:
            'Ya, Lu denger gw bener, intro itu gaguna dan buang buang waktu. mau lu youtuber pemula yang masi kecil, youtuber gaming yang konsisten.........',
    },
    {
        id: '5',
        title: 'Kalo Lu Youtuber Gaming Yang Viewsnya Kecil, Tonton Ini',
        thumbnail: '/storage/landing/thumbnailResult/kaloluyutubergeming.jpg',
        url: 'https://www.youtube.com/watch?v=UhAoE4OLIV8',
        views: '1.2M',
        duration: '8:11',
        description:
            'Ada beberapa channel gaming yang udah mendapat kesuksesan diluar perkiraan lu. disaat lu masih kesusahan buat dapetin 1000 subscriber dan 4000 jam tayang..........',
    },
    {
        id: '6',
        title: 'Cara Memulai Channel Youtube Di 2025 (Full Course)',
        thumbnail: '/storage/landing/thumbnailResult/vsl.webp',
        url: 'https://www.youtube.com/watch?v=HTMep-Lwde8',
        views: '980K',
        duration: '52:08',
        description:
            'Jadi, selamat datang di full course youtube bervalue. ini bakal jadi breakdown penuh gimana lu bisa merubah channel lu, mau yang masi youtuber pemul........',
    },
];

interface VideoCardProps {
    video: VideoResult;
    delay: number;
}

function VideoCard({ video, delay }: VideoCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleVisitVideo = (url: string) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl',
                'from-card/80 to-card/40 bg-gradient-to-br backdrop-blur-sm',
                'border-border/30 hover:border-primary/40 border',
                'transition-all duration-700 hover:-translate-y-2 hover:scale-[1.02]',
                'hover:shadow-primary/20 hover:shadow-2xl',
                'animate-fade-in cursor-pointer',
            )}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => handleVisitVideo(video.url)}
        >
            {/* Video Thumbnail Container */}
            <div className="relative aspect-video overflow-hidden">
                {/* Loading skeleton */}
                {!imageLoaded && <div className="from-muted/20 via-muted/10 to-muted/20 absolute inset-0 animate-pulse bg-gradient-to-r" />}

                {/* Thumbnail Image */}
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className={cn(
                        'h-full w-full object-cover transition-all duration-700',
                        'group-hover:scale-110',
                        imageLoaded ? 'opacity-100' : 'opacity-0',
                    )}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Play Button with Glow Effect */}
                <div
                    className={cn(
                        'absolute inset-0 flex items-center justify-center',
                        'transition-all duration-500',
                        isHovered ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    <div
                        className={cn(
                            'flex h-16 w-16 items-center justify-center rounded-full',
                            'bg-primary/90 backdrop-blur-sm',
                            'border-primary/50 border-2',
                            'transition-all duration-300',
                            'hover:bg-primary hover:scale-110',
                            'shadow-primary/40 shadow-2xl',
                        )}
                    >
                        <Play className="text-primary-foreground ml-1 h-6 w-6" fill="currentColor" />
                    </div>
                </div>

                {/* Video Stats */}
                <div className="absolute top-3 right-3 flex gap-2">
                    {/* <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                        <Eye className="h-3 w-3 text-white/80" />
                        <span className="text-xs text-white/80">{video.views}</span>
                    </div> */}
                    <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                        <Clock className="h-3 w-3 text-white/80" />
                        <span className="text-xs text-white/80">{video.duration}</span>
                    </div>
                </div>

                {/* Animated Border Glow */}
                {/* <div
                    className={cn(
                        'absolute inset-0 rounded-2xl',
                        'from-primary/30 via-primary/10 to-primary/30 bg-gradient-to-r',
                        'opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                        'animate-gradient-x',
                    )}
                    style={{ padding: '1px' }}
                >
                    <div className="bg-card h-full w-full rounded-2xl" />
                </div> */}
            </div>

            {/* Content Section */}
            <div className="space-y-3 p-6">
                <h3
                    className={cn(
                        'text-foreground leading-tight font-semibold',
                        'group-hover:text-primary transition-colors duration-300',
                        'line-clamp-2',
                    )}
                >
                    {video.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">{video.description}</p>

                {/* Hover Action Bar */}
                <div
                    className={cn(
                        'flex items-center justify-between pt-2',
                        'opacity-0 transition-all duration-300 group-hover:opacity-100',
                        'translate-y-2 transform group-hover:translate-y-0',
                    )}
                >
                    <span className="text-primary text-xs font-medium">Watch Now</span>
                    <div className="from-primary/30 mx-3 h-px flex-1 bg-gradient-to-r to-transparent" />
                    <Play className="text-primary h-4 w-4" />
                </div>
            </div>

            {/* Floating Glow Effect */}
            <div
                className={cn(
                    'absolute -top-1 -right-1 h-6 w-6 rounded-full',
                    'bg-primary/20 blur-lg',
                    'opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                    'animate-pulse',
                )}
            />
        </div>
    );
}

export function VideoResults() {
    return (
        <section className="relative py-20 lg:py-32">
            {/* Background Effects */}
            <div className="via-primary/5 absolute inset-0 bg-gradient-to-b from-transparent to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="space-y-16">
                    {/* Section Header */}
                    <div className="space-y-6 text-center">
                        <div className="animate-fade-in">
                            <div className="bg-primary/10 border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
                                <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                                <span className="text-primary text-sm font-medium">Hasil Video Editing</span>
                            </div>
                        </div>

                        <div className="animate-fade-in space-y-4" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                            <h2 className="text-foreground text-4xl font-bold md:text-5xl lg:text-6xl">
                                <span className="block">Ga Percaya Bisa Bagus?</span>
                                <span className="from-primary via-primary/80 to-primary bg-gradient-to-r bg-clip-text text-transparent">
                                    Lihat Hasilnya!
                                </span>
                            </h2>
                            <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
                                Hasil video youtube mentor yang di edit dengan pengetahuan yang ada di kelas ini. yang menyentuh puluhan sampai
                                ratusan ribu views
                            </p>
                        </div>
                    </div>

                    {/* Video Grid */}
                    <div
                        className={cn('grid gap-8', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', 'animate-fade-in')}
                        style={{ animationDelay: '400ms', animationFillMode: 'both' }}
                    >
                        {videoResults.map((video, index) => (
                            <VideoCard key={video.id} video={video} delay={600 + index * 100} />
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <div className="animate-fade-in text-center" style={{ animationDelay: '1200ms', animationFillMode: 'both' }}>
                        <p className="text-muted-foreground mb-6">
                            Ingin hasil seperti ini? Bergabunglah dengan ratusan member yang sudah merasakan transformasi.
                        </p>
                        <div className="from-primary/20 to-primary/10 border-primary/30 inline-flex items-center gap-3 rounded-full border bg-gradient-to-r px-6 py-3 backdrop-blur-sm">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="bg-primary/20 border-primary/30 h-8 w-8 rounded-full border-2" />
                                ))}
                            </div>
                            <span className="text-foreground text-sm">
                                <span className="text-primary font-semibold">200+</span> murid sudah bergabung
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
