import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { MemberSidebar } from '@/components/member-sidebar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

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

interface MemberLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
    availableProducts: Product[];
    selectedProductId: number | null;
    onLibraryClick: () => void;
    onProductClick: (product: Product) => void;
}

export default function MemberLayout({ 
    children, 
    breadcrumbs = [], 
    availableProducts,
    selectedProductId,
    onLibraryClick,
    onProductClick
}: PropsWithChildren<MemberLayoutProps>) {
    return (
        <AppShell variant="sidebar">
            <MemberSidebar 
                availableProducts={availableProducts}
                selectedProductId={selectedProductId}
                onLibraryClick={onLibraryClick}
                onProductClick={onProductClick}
            />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
