import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, ChevronLeft, ChevronRight, Database, Plus, Search, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onAdd?: () => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    searchPlaceholder?: string;
    title: string;
    addButtonText?: string;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    onAdd,
    onEdit,
    onDelete,
    searchPlaceholder = 'Search...',
    title,
    addButtonText = 'Add New',
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filteredData = useMemo(() => {
        return data.filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(search.toLowerCase())));
    }, [data, search]);

    const sortedData = useMemo(() => {
        if (!sortColumn) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });
    }, [filteredData, sortColumn, sortDirection]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const handleSort = (column: keyof T) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500"></div>
                    <div>
                        <div className="flex items-center gap-3">
                            <Database className="h-8 w-8 text-cyan-400" />
                            <h1 className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-3xl font-bold text-transparent">
                                {title}
                            </h1>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                            <p className="font-mono text-sm text-gray-400">
                                {paginatedData.length} of {sortedData.length} entries loaded
                            </p>
                        </div>
                    </div>
                </div>
                {onAdd && (
                    <Button
                        onClick={onAdd}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:from-cyan-600 hover:to-blue-600 hover:shadow-cyan-500/40"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        {addButtonText}
                        <Zap className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Enhanced Search */}
            <div className="relative max-w-md">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-cyan-400" />
                <Input
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 rounded-xl border-zinc-700/50 bg-zinc-900/50 pl-12 text-white backdrop-blur-sm placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 transition-opacity hover:opacity-100"></div>
            </div>

            {/* Enhanced Desktop Table */}
            <Card className="hidden overflow-hidden border border-zinc-700/50 bg-gradient-to-br from-zinc-900/90 via-zinc-800/50 to-zinc-900/90 shadow-2xl backdrop-blur-sm lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm">
                            <tr className="border-b border-zinc-700/50">
                                {columns.map((column) => (
                                    <th
                                        key={String(column.key)}
                                        className="p-6 text-left text-sm font-semibold tracking-wider text-gray-300 uppercase"
                                    >
                                        {column.sortable ? (
                                            <button
                                                onClick={() => handleSort(column.key)}
                                                className="group flex items-center gap-2 transition-colors hover:text-cyan-400"
                                            >
                                                {column.label}
                                                <ArrowUpDown className="h-4 w-4 transition-transform group-hover:scale-110" />
                                            </button>
                                        ) : (
                                            column.label
                                        )}
                                    </th>
                                ))}
                                <th className="p-6 text-left text-sm font-semibold tracking-wider text-gray-300 uppercase">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((item, index) => (
                                <tr
                                    key={index}
                                    className="group border-b border-zinc-800/50 transition-all duration-300 hover:bg-gradient-to-r hover:from-zinc-800/30 hover:to-zinc-700/30"
                                >
                                    {columns.map((column) => (
                                        <td key={String(column.key)} className="p-6 text-white">
                                            {column.render ? column.render(item[column.key], item) : String(item[column.key])}
                                        </td>
                                    ))}
                                    <td className="p-6">
                                        <div className="flex gap-3">
                                            {onEdit && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onEdit(item)}
                                                    className="border-cyan-600/50 text-cyan-400 shadow-sm transition-all duration-300 hover:scale-105 hover:border-cyan-500 hover:bg-cyan-500 hover:text-white hover:shadow-cyan-500/25"
                                                >
                                                    Modify
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onDelete(item)}
                                                    className="border-red-600/50 text-red-400 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-red-600 hover:text-white hover:shadow-red-500/25"
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Enhanced Mobile Cards */}
            <div className="space-y-4 lg:hidden">
                {paginatedData.map((item, index) => (
                    <Card
                        key={index}
                        className="border border-zinc-700/50 bg-gradient-to-br from-zinc-900/90 via-zinc-800/50 to-zinc-900/90 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50"
                    >
                        <div className="space-y-4">
                            {columns.map((column) => (
                                <div key={String(column.key)} className="flex items-start justify-between">
                                    <span className="font-mono text-sm tracking-wider text-gray-400 uppercase">{column.label}:</span>
                                    <span className="ml-4 flex-1 text-right text-sm text-white">
                                        {column.render ? column.render(item[column.key], item) : String(item[column.key])}
                                    </span>
                                </div>
                            ))}
                            <div className="flex gap-3 border-t border-zinc-700/50 pt-4">
                                {onEdit && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(item)}
                                        className="flex-1 border-cyan-600/50 text-cyan-400 transition-all duration-300 hover:border-cyan-500 hover:bg-cyan-500 hover:text-white"
                                    >
                                        Modify
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(item)}
                                        className="flex-1 border-red-600/50 text-red-400 transition-all duration-300 hover:bg-red-600 hover:text-white"
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="border-zinc-600/50 text-white backdrop-blur-sm hover:bg-zinc-700/50 disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-2 backdrop-blur-sm">
                        <span className="font-mono text-sm text-cyan-400">Page</span>
                        <span className="font-bold text-white">{currentPage}</span>
                        <span className="font-mono text-sm text-gray-400">of {totalPages}</span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="border-zinc-600/50 text-white backdrop-blur-sm hover:bg-zinc-700/50 disabled:opacity-30"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
