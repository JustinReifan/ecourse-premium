import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    BookOpenCheck,
    ChartSpline,
    DollarSign,
    Folder,
    Handshake,
    LayoutGrid,
    Library,
    Megaphone,
    Receipt,
    Settings,
    ShoppingBag,
    SquarePlay,
    TicketPercent,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Orders',
        href: '/admin/orders',
        icon: Receipt,
    },
    {
        title: 'Products',
        href: '/admin/products',
        icon: ShoppingBag,
    },
    {
        title: 'Courses',
        href: '/admin/courses',
        icon: BookOpenCheck,
    },
    {
        title: 'Modules',
        href: '/admin/modules',
        icon: SquarePlay,
    },
    {
        title: 'Materials',
        href: '/admin/module-materials',
        icon: Library,
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: ChartSpline,
    },
    {
        title: 'Vouchers',
        href: '/admin/vouchers',
        icon: TicketPercent,
    },
    {
        title: 'Configuration',
        href: '/admin/config',
        icon: Settings,
    },
];

const affiliateNavItems = [
    {
        title: 'Dashboard',
        href: '/admin/affiliates',
        icon: Users,
    },
    {
        title: 'Conversions',
        href: '/admin/affiliates/conversions/list',
        icon: TrendingUp,
    },
    {
        title: 'Payouts',
        href: '/admin/affiliates/payouts/list',
        icon: Wallet,
    },
    {
        title: 'Campaigns',
        href: '/admin/affiliates/campaigns/list',
        icon: Megaphone,
    },
    {
        title: 'Payout Methods',
        href: '/admin/payout-methods',
        icon: DollarSign,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />

                <SidebarGroup>
                    <Collapsible defaultOpen className="group/collapsible">
                        <SidebarGroupLabel asChild>
                            <CollapsibleTrigger className="flex w-full items-center">
                                <Handshake className="mr-2 h-4 w-4" />
                                Affiliates
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {affiliateNavItems.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton asChild>
                                            <Link href={item.href}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
