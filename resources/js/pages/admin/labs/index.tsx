import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { CtaData, DeviceData, HeatmapData, ReaderData } from '@/types/analytics';
import axios from 'axios';

import { DateRangePicker } from '@/components/date-range-picker';
import { AudienceSegmentation } from '@/components/labs/audience-segmentation';
import { CtaAnalysis } from '@/components/labs/cta-analysis';
import { DeviceComparison } from '@/components/labs/device-comparison';
import { Head, router } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import {
    Activity,
    AlertTriangle,
    ArrowUpDown,
    BarChart3,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    Filter,
    FlaskConical,
    MousePointerClick,
    RefreshCw,
    Target,
    TrendingUp,
    Trophy,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// ==================== INTERFACES ====================

interface MatrixItem {
    landing_source: string;
    visits: number;
    bounce_rate: number;
    lead_cr: number;
    strict_cr: number;
    rpv: number;
    revenue: number;
    conversions: number;
    payments: number;
}

interface FunnelStep {
    stage: string;
    count: number;
    percentage: number;
}

interface FunnelItem {
    landing_source: string;
    steps: FunnelStep[];
}

interface QualityMetrics {
    count: number;
    avg_scroll_depth: number;
    avg_dwell_time: number;
}

interface QualityItem {
    landing_source: string;
    buyers: QualityMetrics;
    non_buyers: QualityMetrics;
}

interface Filters {
    start_date: string;
    end_date: string;
    range: string;
    source?: string | null;
}

interface Props {
    matrix: MatrixItem[];
    funnel: FunnelItem[];
    quality: QualityItem[];
    devices: DeviceData[];
    cta: CtaData[];
    readers: ReaderData[];
    heatmap: HeatmapData[];
    availableSources: string[];
    filters: Filters;
}

// ==================== HELPER FUNCTIONS ====================

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
};

const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
};

const transformFunnelData = (funnel: FunnelItem[], selectedSources: string[]) => {
    if (funnel.length === 0 || selectedSources.length === 0) return [];

    const stages = ['Visits', 'Engaged', 'Intent', 'Leads', 'Sales'];

    return stages.map((stage) => {
        const dataPoint: Record<string, string | number> = { name: stage };

        selectedSources.forEach((source) => {
            const funnelItem = funnel.find((f) => f.landing_source === source);
            if (funnelItem) {
                const step = funnelItem.steps.find((s) => s.stage === stage);
                dataPoint[source] = step?.count ?? 0;
            }
        });

        return dataPoint;
    });
};

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

// ==================== MAIN COMPONENT ====================

export default function LabsIndex({ matrix, funnel, quality, devices, cta, readers, heatmap, availableSources, filters }: Props) {
    // State
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [sortColumn, setSortColumn] = useState<keyof MatrixItem>('rpv');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Date range state for custom filter
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        if (filters.start_date && filters.end_date) {
            return {
                from: parse(filters.start_date, 'yyyy-MM-dd', new Date()),
                to: parse(filters.end_date, 'yyyy-MM-dd', new Date()),
            };
        }
        return undefined;
    });

    const triggerToast = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);

        setTimeout(() => {
            setShowToast(false);
            setToastMessage('');
        }, 4000);
    };

    const [selectedFunnelSources, setSelectedFunnelSources] = useState<string[]>(() => {
        // Default: Top 2 by RPV
        return matrix.slice(0, 2).map((m) => m.landing_source);
    });

    const itemsPerPage = 10;

    // Find winner (highest RPV)
    const winner = useMemo(() => {
        if (matrix.length === 0) return null;
        return matrix.reduce((prev, curr) => (curr.rpv > prev.rpv ? curr : prev));
    }, [matrix]);

    // Sorted matrix data
    const sortedMatrix = useMemo(() => {
        return [...matrix].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            if (sortDirection === 'asc') {
                return (aVal as number) > (bVal as number) ? 1 : -1;
            }
            return (aVal as number) < (bVal as number) ? 1 : -1;
        });
    }, [matrix, sortColumn, sortDirection]);

    // Paginated matrix
    const paginatedMatrix = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedMatrix.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedMatrix, currentPage]);

    const totalPages = Math.ceil(sortedMatrix.length / itemsPerPage);

    // Transform funnel data for chart
    const chartData = useMemo(() => {
        return transformFunnelData(funnel, selectedFunnelSources);
    }, [funnel, selectedFunnelSources]);

    // Handlers
    const handleRangeChange = (value: string) => {
        if (value === 'custom') {
            // Just show the date picker, don't trigger router yet
            router.get(
                route('admin.labs'),
                {
                    range: 'custom',
                    start_date: filters.start_date,
                    end_date: filters.end_date,
                    source: filters.source || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        } else {
            // Preset range - trigger immediately
            router.get(
                route('admin.labs'),
                {
                    range: value,
                    source: filters.source || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }
    };

    const handleDateUpdate = (date: DateRange | undefined) => {
        setDateRange(date);
        // Only trigger router if both dates are selected
        if (date?.from && date?.to) {
            router.get(
                route('admin.labs'),
                {
                    range: 'custom',
                    start_date: format(date.from, 'yyyy-MM-dd'),
                    end_date: format(date.to, 'yyyy-MM-dd'),
                    source: filters.source || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }
    };

    const handleSourceChange = (value: string) => {
        const sourceValue = value === 'all' ? undefined : value;
        const params: Record<string, string | undefined> = {
            range: filters.range,
            source: sourceValue,
        };
        // Preserve custom date range parameters
        if (filters.range === 'custom') {
            params.start_date = filters.start_date;
            params.end_date = filters.end_date;
        }
        router.get(route('admin.labs'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClearSource = () => {
        const params: Record<string, string | undefined> = {
            range: filters.range,
            source: undefined,
        };
        // Preserve custom date range parameters
        if (filters.range === 'custom') {
            params.start_date = filters.start_date;
            params.end_date = filters.end_date;
        }
        router.get(route('admin.labs'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleRefreshCache = async () => {
        setIsRefreshing(true);
        try {
            const response = await axios.post(route('admin.labs.clear-cache'), {
                range: filters.range,
                source: filters.source,
                start_date: filters.start_date,
                end_date: filters.end_date,
            });

            if (response.data.success) {
                triggerToast('Data cached successfully', 'success');
            }

            router.reload();
        } catch (error: any) {
            triggerToast('Failed to cache data: ' + error || '', 'error');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSort = (column: keyof MatrixItem) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const toggleFunnelSource = (source: string) => {
        setSelectedFunnelSources((prev) => (prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]));
    };

    const hasData = matrix.length > 0;

    return (
        <AdminLayout>
            <Head title="A/B Testing Labs" />

            <div className="container mx-auto space-y-8 p-4 md:p-6">
                {showToast && (
                    <div className="animate-fade-in fixed top-20 right-4 z-50 w-auto max-w-sm">
                        <Alert
                            className={
                                toastType === 'success'
                                    ? 'border-primary/50 bg-primary/10 backdrop-blur-sm'
                                    : 'border-red-500/50 bg-red-900/50 backdrop-blur-sm'
                            }
                        >
                            {toastType === 'success' ? (
                                <CheckCircle className="text-primary h-4 w-4" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                            )}
                            <AlertDescription className={toastType === 'success' ? 'text-primary font-medium' : 'font-medium text-red-300'}>
                                {toastMessage}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* ==================== CONTROL BAR ==================== */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl">
                            <FlaskConical className="text-primary h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-foreground text-2xl font-bold md:text-3xl">A/B Testing Labs</h1>
                            <p className="text-muted-foreground text-sm">Optimize your landing page performance</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Source Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="text-muted-foreground h-4 w-4" />
                            <Select value={filters.source || 'all'} onValueChange={handleSourceChange}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="All Sources" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sources</SelectItem>
                                    {availableSources.map((source) => (
                                        <SelectItem key={source} value={source}>
                                            {source === 'direct' ? 'Direct Traffic' : source}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {filters.source && (
                                <Button variant="ghost" size="icon" onClick={handleClearSource} className="h-8 w-8">
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Date Range Dropdown */}
                        <Select value={filters.range} onValueChange={handleRangeChange}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">Last 3 Days</SelectItem>
                                <SelectItem value="5">Last 5 Days</SelectItem>
                                <SelectItem value="7">Last 7 Days</SelectItem>
                                <SelectItem value="14">Last 14 Days</SelectItem>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Custom Date Range Picker - Conditional */}
                        {filters.range === 'custom' && (
                            <DateRangePicker date={dateRange} onUpdate={handleDateUpdate} />
                        )}

                        <Button variant="outline" type="button" onClick={handleRefreshCache} disabled={isRefreshing} className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh Data</span>
                        </Button>
                    </div>
                </div>

                {/* Date Range Info & Active Filters */}
                <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                    <span>
                        Showing data from <span className="text-foreground font-medium">{filters.start_date}</span> to{' '}
                        <span className="text-foreground font-medium">{filters.end_date}</span>
                    </span>
                    {filters.source && (
                        <Badge variant="secondary" className="gap-1">
                            <Filter className="h-3 w-3" />
                            {filters.source === 'direct' ? 'Direct Traffic' : filters.source}
                        </Badge>
                    )}
                </div>

                {!hasData ? (
                    <Card className="py-16 text-center">
                        <CardContent>
                            <BarChart3 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                            <h3 className="text-foreground text-lg font-semibold">No Analytics Data</h3>
                            <p className="text-muted-foreground mt-2">
                                There's no data available for the selected filters. Try adjusting the date range or source filter.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* ==================== SECTION A: PERFORMANCE MATRIX ==================== */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <Trophy className="text-primary h-5 w-5" />
                                    <div>
                                        <CardTitle>Performance Matrix</CardTitle>
                                        <CardDescription>Landing page comparison sorted by Revenue Per Visit</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Desktop Table */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-border border-b">
                                                <th className="text-muted-foreground p-4 text-left text-sm font-medium">Source</th>
                                                <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                                                    <button
                                                        onClick={() => handleSort('visits')}
                                                        className="hover:text-foreground flex items-center gap-1"
                                                    >
                                                        <Eye className="h-4 w-4" /> Visits
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                                                    <button
                                                        onClick={() => handleSort('bounce_rate')}
                                                        className="hover:text-foreground flex items-center gap-1"
                                                    >
                                                        Bounce
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                                                    <button
                                                        onClick={() => handleSort('conversions')}
                                                        className="hover:text-foreground flex items-center gap-1"
                                                    >
                                                        <MousePointerClick className="h-4 w-4" /> Intent
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                                                    <button
                                                        onClick={() => handleSort('lead_cr')}
                                                        className="hover:text-foreground flex items-center gap-1"
                                                    >
                                                        Lead CR
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                                                    <button
                                                        onClick={() => handleSort('strict_cr')}
                                                        className="hover:text-foreground flex items-center gap-1"
                                                    >
                                                        <Target className="h-4 w-4" /> Sales CR
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="text-muted-foreground p-4 text-left text-sm font-medium">
                                                    <button
                                                        onClick={() => handleSort('rpv')}
                                                        className="hover:text-foreground flex items-center gap-1"
                                                    >
                                                        <TrendingUp className="h-4 w-4" /> RPV
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </th>
                                                <th className="text-muted-foreground p-4 text-left text-sm font-medium">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedMatrix.map((item) => {
                                                const isWinner = winner && item.landing_source === winner.landing_source;
                                                const isHighBounce = item.bounce_rate > 80;

                                                return (
                                                    <tr key={item.landing_source} className="border-border hover:bg-muted/50 border-b transition">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-foreground font-mono text-sm font-medium">
                                                                    {item.landing_source}
                                                                </span>
                                                                {isWinner && (
                                                                    <Badge variant="default" className="bg-chart-4 text-foreground gap-1">
                                                                        <Trophy className="h-3 w-3" /> Winner
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-foreground p-4 font-medium">{formatNumber(item.visits)}</td>
                                                        <td className="p-4">
                                                            <span className={isHighBounce ? 'text-destructive font-medium' : 'text-foreground'}>
                                                                {item.bounce_rate.toFixed(1)}%
                                                            </span>
                                                        </td>
                                                        <td className="text-foreground p-4">{formatNumber(item.conversions)}</td>
                                                        <td className="p-4">
                                                            <Badge variant="secondary">{item.lead_cr.toFixed(2)}%</Badge>
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge variant="outline">{item.strict_cr.toFixed(2)}%</Badge>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`font-bold ${isWinner ? 'text-chart-4' : 'text-foreground'}`}>
                                                                {formatCurrency(item.rpv)}
                                                            </span>
                                                        </td>
                                                        <td className="text-foreground p-4">{formatCurrency(item.revenue)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="space-y-4 lg:hidden">
                                    {paginatedMatrix.map((item) => {
                                        const isWinner = winner && item.landing_source === winner.landing_source;
                                        const isHighBounce = item.bounce_rate > 80;

                                        return (
                                            <Card key={item.landing_source} className={`${isWinner ? 'border-chart-4 border-2' : ''}`}>
                                                <CardContent className="space-y-3 pt-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-foreground font-mono font-medium">{item.landing_source}</span>
                                                        {isWinner && (
                                                            <Badge variant="default" className="bg-chart-4 text-foreground gap-1">
                                                                <Trophy className="h-3 w-3" /> Winner
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground">Visits:</span>{' '}
                                                            <span className="text-foreground font-medium">{formatNumber(item.visits)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Bounce:</span>{' '}
                                                            <span className={isHighBounce ? 'text-destructive' : 'text-foreground'}>
                                                                {item.bounce_rate.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Lead CR:</span>{' '}
                                                            <Badge variant="secondary">{item.lead_cr.toFixed(2)}%</Badge>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Sales CR:</span>{' '}
                                                            <Badge variant="outline">{item.strict_cr.toFixed(2)}%</Badge>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">RPV:</span>{' '}
                                                            <span className={`font-bold ${isWinner ? 'text-chart-4' : 'text-foreground'}`}>
                                                                {formatCurrency(item.rpv)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Revenue:</span>{' '}
                                                            <span className="text-foreground">{formatCurrency(item.revenue)}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-6 flex items-center justify-center gap-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-muted-foreground text-sm">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* ==================== SECTION B: SPLIT FUNNEL ==================== */}
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <Activity className="text-primary h-5 w-5" />
                                        <div>
                                            <CardTitle>Split Funnel</CardTitle>
                                            <CardDescription>Compare conversion journey across landing pages</CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Source Selector */}
                                <div className="flex flex-wrap gap-4">
                                    {funnel.map((f, index) => (
                                        <div key={f.landing_source} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`funnel-${f.landing_source}`}
                                                checked={selectedFunnelSources.includes(f.landing_source)}
                                                onCheckedChange={() => toggleFunnelSource(f.landing_source)}
                                            />
                                            <Label htmlFor={`funnel-${f.landing_source}`} className="flex cursor-pointer items-center gap-2 text-sm">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                                />
                                                {f.landing_source}
                                            </Label>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart */}
                                {selectedFunnelSources.length > 0 ? (
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                                <XAxis dataKey="name" className="fill-muted-foreground text-xs" />
                                                <YAxis className="fill-muted-foreground text-xs" />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'var(--popover)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '8px',
                                                        color: 'var(--popover-foreground)',
                                                    }}
                                                    formatter={(value: number, name: string) => [formatNumber(value), name]}
                                                />
                                                <Legend />
                                                {selectedFunnelSources.map((source, index) => (
                                                    <Bar
                                                        key={source}
                                                        dataKey={source}
                                                        fill={
                                                            CHART_COLORS[funnel.findIndex((f) => f.landing_source === source) % CHART_COLORS.length]
                                                        }
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                ))}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground py-12 text-center">
                                        Select at least one landing page to view the funnel chart
                                    </div>
                                )}

                                {/* Funnel Details Table */}
                                {selectedFunnelSources.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-border border-b">
                                                    <th className="text-muted-foreground p-3 text-left font-medium">Stage</th>
                                                    {selectedFunnelSources.map((source) => (
                                                        <th key={source} className="text-muted-foreground p-3 text-left font-medium">
                                                            {source}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {['Visits', 'Engaged', 'Intent', 'Leads', 'Sales'].map((stage) => (
                                                    <tr key={stage} className="border-border border-b">
                                                        <td className="text-foreground p-3 font-medium">{stage}</td>
                                                        {selectedFunnelSources.map((source) => {
                                                            const funnelItem = funnel.find((f) => f.landing_source === source);
                                                            const step = funnelItem?.steps.find((s) => s.stage === stage);
                                                            return (
                                                                <td key={source} className="p-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-foreground">{formatNumber(step?.count ?? 0)}</span>
                                                                        <span className="text-muted-foreground text-xs">
                                                                            ({step?.percentage.toFixed(1) ?? 0}%)
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* ==================== SECTION C: DEVICE PERFORMANCE ==================== */}
                        {devices && devices.length > 0 && <DeviceComparison data={devices} />}

                        {/* ==================== SECTION D: CTA ANALYSIS ==================== */}
                        {cta && cta.length > 0 && <CtaAnalysis data={cta} />}

                        {/* ==================== SECTION E: AUDIENCE SEGMENTATION ==================== */}
                        {((readers && readers.length > 0) || (heatmap && heatmap.length > 0)) && (
                            <AudienceSegmentation readers={readers || []} heatmap={heatmap || []} />
                        )}

                        {/* ==================== SECTION F: QUALITY ANALYSIS ==================== */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Users className="text-primary h-5 w-5" />
                                <div>
                                    <h2 className="text-foreground text-xl font-semibold">Behavior Analysis</h2>
                                    <p className="text-muted-foreground text-sm">Buyers vs Non-Buyers engagement comparison</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {quality.map((item) => {
                                    const scrollGap = Math.abs(item.buyers.avg_scroll_depth - item.non_buyers.avg_scroll_depth);
                                    const dwellGap = Math.abs(item.buyers.avg_dwell_time - item.non_buyers.avg_dwell_time);
                                    const hasSignificantGap = scrollGap > 30 || dwellGap > 60;

                                    return (
                                        <Card key={item.landing_source} className={hasSignificantGap ? 'border-chart-4/50' : ''}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="font-mono text-sm">{item.landing_source}</CardTitle>
                                                    {hasSignificantGap && (
                                                        <Badge variant="outline" className="border-chart-4 text-chart-4 text-xs">
                                                            High Gap
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Scroll Depth Comparison */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            <TrendingUp className="h-3 w-3" /> Scroll Depth
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-primary">Buyers ({item.buyers.count})</span>
                                                            <span className="text-foreground font-medium">
                                                                {item.buyers.avg_scroll_depth.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                                            <div
                                                                className="bg-primary h-full rounded-full transition-all"
                                                                style={{ width: `${Math.min(item.buyers.avg_scroll_depth, 100)}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">Others ({item.non_buyers.count})</span>
                                                            <span className="text-foreground">{item.non_buyers.avg_scroll_depth.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                                            <div
                                                                className="bg-muted-foreground h-full rounded-full transition-all"
                                                                style={{ width: `${Math.min(item.non_buyers.avg_scroll_depth, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dwell Time Comparison */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> Dwell Time
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="text-center">
                                                            <div className="text-primary text-lg font-bold">
                                                                {formatDuration(item.buyers.avg_dwell_time)}
                                                            </div>
                                                            <div className="text-muted-foreground text-xs">Buyers</div>
                                                        </div>
                                                        <div className="text-muted-foreground text-xl">vs</div>
                                                        <div className="text-center">
                                                            <div className="text-foreground text-lg font-bold">
                                                                {formatDuration(item.non_buyers.avg_dwell_time)}
                                                            </div>
                                                            <div className="text-muted-foreground text-xs">Others</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
