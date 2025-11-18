import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar, // <-- 1. Import hook 'useSidebar'
} from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { Package, ShoppingBag } from 'lucide-react';
import AppLogo from './app-logo';

interface Product {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    thumbnail: string | null;
    type: 'ecourse' | 'ebook' | 'template' | 'affiliate_link';
    file_path: string | null;
    external_url: string | null;
    courses?: any[];
}

interface MemberSidebarProps {
    availableProducts: Product[];
    selectedProductId: number | null;
    onLibraryClick: () => void;
    onProductClick: (product: Product) => void;
}

export function MemberSidebar({ availableProducts, selectedProductId, onLibraryClick, onProductClick }: MemberSidebarProps) {
    // 2. Dapatkan state dan fungsi dari sidebar context
    const { isMobile, setOpenMobile } = useSidebar();

    // 3. Buat fungsi "wrapper" yang juga menutup sidebar
    const handleLibraryClick = () => {
        onLibraryClick(); // Jalankan fungsi navigasi asli
        if (isMobile) {
            setOpenMobile(false); // <-- Tutup sidebar jika di mobile
        }
    };

    const handleProductClick = (product: Product) => {
        onProductClick(product); // Jalankan fungsi navigasi asli
        if (isMobile) {
            setOpenMobile(false); // <-- Tutup sidebar jika di mobile
        }
    };

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('member.index')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* My Library Section */}
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={handleLibraryClick} // <-- 4. Gunakan fungsi wrapper
                                isActive={!selectedProductId}
                                className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground/90"
                            >
                                <Package className="h-4 w-4" />
                                <span>My Library</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {/* Explore More Section */}
                {availableProducts.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Explore More</SidebarGroupLabel>
                        <SidebarMenuSub>
                            {availableProducts.map((product) => (
                                <SidebarMenuSubItem key={product.id}>
                                    <SidebarMenuSubButton
                                        onClick={() => handleProductClick(product)} // <-- 4. Gunakan fungsi wrapper
                                        isActive={selectedProductId === product.id}
                                    >
                                        <ShoppingBag className="h-4 w-4" />
                                        <span className="truncate">{product.title}</span>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
