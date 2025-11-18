
import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href?: string;
}

export interface Voucher {
    id: number;
    name: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    max_discount_amount?: number;
    usage_limit: number;
    used_count: number;
    expires_at?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash: {
        success?: string;
        error?: string;
    };
};

export interface Course {
    id: number;
    name: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    order?: number;
    status: string;
    module_count?: number;
    completion_percentage: number;
    created_at: string;
    updated_at: string;
    modules?: Module[];
}

export interface Module {
    id: number;
    name: string;
    slug?: string;
    video_path?: string;
    order?: number;
    status: string;
    course_id: number;
    created_at: string;
    updated_at: string;
    is_completed?: boolean;
    duration?: string;
}

export interface UserProgress {
    id: number;
    user_id: number;
    course_id: number;
    module_id?: number;
    is_module_completed: boolean;
    course_completion_percentage: number;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Affiliate {
    id: number;
    user_id?: number;
    aff_key: string;
    name?: string;
    email?: string;
    upline_affiliate_id?: number;
    status: 'pending' | 'active' | 'banned';
    meta?: any;
    balance: number;
    pending_balance: number;
    created_at: string;
    updated_at: string;
}

export interface AffiliateConversion {
    id: number;
    affiliate_id?: number;
    campaign_id?: number;
    order_id: string;
    user_id?: number;
    click_id?: number;
    order_amount: number;
    commission_amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'reversed' | 'paid';
    meta?: any;
    created_at: string;
    updated_at: string;
}
