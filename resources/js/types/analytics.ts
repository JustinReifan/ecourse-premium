// Advanced Analytics Types for Labs Dashboard

export interface DeviceMetrics {
    visits: number;
    conversion_rate: number;
}

export interface DeviceData {
    landing_source: string;
    mobile: DeviceMetrics;
    desktop: DeviceMetrics;
}

export interface CtaLocation {
    location: string;
    click_count: number;
    conversions: number;
    conversion_rate: number;
}

export interface CtaData {
    landing_source: string;
    cta_locations: CtaLocation[];
}

export interface Persona {
    name: string;
    percentage: number;
    count: number;
}

export interface ReaderData {
    landing_source: string;
    personas: Persona[];
}

export interface DepthAnalysis {
    depth: number;
    percentage: number;
}

export interface HeatmapData {
    landing_source: string;
    depth_analysis: DepthAnalysis[];
}

// Props interfaces for components
export interface DeviceComparisonProps {
    data: DeviceData[];
}

export interface CtaAnalysisProps {
    data: CtaData[];
}

export interface AudienceSegmentationProps {
    readers: ReaderData[];
    heatmap: HeatmapData[];
}

// Filter interfaces
export interface LabsFilters {
    start_date: string;
    end_date: string;
    range: string;
    source?: string | null;
}
