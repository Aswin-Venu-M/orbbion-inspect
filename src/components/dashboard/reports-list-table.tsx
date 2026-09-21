/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutList, LayoutGrid, Search, ArrowUpDown, 
  Copy, Check, Clock, CheckCircle2, 
  Car, FileEdit, Trash2, Download, X, AlertTriangle,
  ChevronLeft, ChevronRight, Files, CheckCheck, RefreshCw, Plus
} from 'lucide-react';
import { 
  ReportListItem, 
  exportReportsToCsv, 
  parseReportDate 
} from '@/lib/reports-data';
import { 
  REPORT_FILTER_TABS, 
  REPORT_LOCATION_FILTER_OPTIONS, 
  REPORT_VEHICLE_TYPE_FILTER_OPTIONS, 
  REPORT_SORT_OPTIONS 
} from '@/constants/options';

export type TabFilter = 'all' | 'published' | 'draft' | 'tampered' | 'defects';
export type SortOption = typeof REPORT_SORT_OPTIONS[number]['value'];

export interface ReportsListTableProps {
  reports: ReportListItem[];
  onDeleteReport?: (id: string) => void;
  onBulkDeleteReports?: (ids: string[]) => void;
  onBulkStatusChange?: (ids: string[], status: 'published' | 'draft') => void;
  onDuplicateReport?: (report: ReportListItem) => void;
  onResetCatalog?: () => void;
  activeTab?: TabFilter;
  onActiveTabChange?: (tab: TabFilter) => void;
  globalSearch?: string;
  datePreset?: 'today' | '7d' | '30d' | 'all';
}

const FALLBACK_VEHICLE_IMG = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=600&auto=format&fit=crop';
const PAGE_SIZE_OPTIONS = [10, 25, 50, 'all'] as const;

export function ReportsListTable({ 
  reports, 
  onDeleteReport,
  onBulkDeleteReports,
  onBulkStatusChange,
  onDuplicateReport,
  onResetCatalog,
  activeTab: externalActiveTab,
  onActiveTabChange,
  globalSearch = '',
  datePreset = 'all',
}: ReportsListTableProps) {
  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [internalActiveTab, setInternalActiveTab] = useState<TabFilter>('all');
  
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = onActiveTabChange || setInternalActiveTab;

  // Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  
  // Selection states
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  
  // Modals
  const [reportToDelete, setReportToDelete] = useState<ReportListItem | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  
  // UI states
  const [copiedVinId, setCopiedVinId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(10);

  // Reset pagination to page 1 whenever filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, globalSearch, locationFilter, vehicleTypeFilter, datePreset, sortBy]);

  // Copy VIN to clipboard
  const handleCopyVin = (e: React.MouseEvent, vin: string, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(vin);
      setCopiedVinId(id);
      setTimeout(() => setCopiedVinId(null), 2000);
    }
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: reports.length,
      published: reports.filter((r) => r.status === 'published').length,
      draft: reports.filter((r) => r.status === 'draft').length,
      tampered: reports.filter((r) => r.vehicle?.odometerStatus === 'Tampered' || (r.flaggedDefectsCount ?? 0) >= 4).length,
      defects: reports.filter((r) => (r.failPercentage ?? 0) >= 30).length,
    };
  }, [reports]);

  // Filtered & Sorted Reports
  const filteredReports = useMemo(() => {
    const referenceTimestamp = (() => {
      let maxTime = Date.now();
      for (const r of reports) {
        const t = parseReportDate(r.date).getTime();
        if (t > maxTime) maxTime = t;
      }
      return maxTime;
    })();

    return reports
      .filter((r) => {
        // 1. Tab Filter
        if (activeTab === 'published' && r.status !== 'published') return false;
        if (activeTab === 'draft' && r.status !== 'draft') return false;
        if (activeTab === 'tampered' && r.vehicle?.odometerStatus !== 'Tampered' && (r.flaggedDefectsCount ?? 0) < 4) return false;
        if (activeTab === 'defects' && (r.failPercentage ?? 0) < 30) return false;

        // 2. Date Preset Filter
        if (datePreset && datePreset !== 'all') {
          const reportTime = parseReportDate(r.date).getTime();
          if (reportTime > 0) {
            const diffMs = referenceTimestamp - reportTime;
            if (datePreset === 'today' && diffMs > 24 * 3600 * 1000) return false;
            if (datePreset === '7d' && diffMs > 7 * 24 * 3600 * 1000) return false;
            if (datePreset === '30d' && diffMs > 30 * 24 * 3600 * 1000) return false;
          }
        }

        // 3. Location Filter
        if (locationFilter !== 'all') {
          const loc = (r.client?.location || '').toLowerCase();
          if (!loc.includes(locationFilter.toLowerCase())) return false;
        }

        // 4. Vehicle Type Filter
        if (vehicleTypeFilter !== 'all') {
          const vt = (r.vehicle?.type || '').toLowerCase();
          if (vt !== vehicleTypeFilter.toLowerCase()) return false;
        }

        // 5. Combined Search Query (VIN, Make, Model, Client, Company, Inspector, Report ID)
        const combinedSearch = (globalSearch || searchQuery).trim();
        if (combinedSearch) {
          const q = combinedSearch.toLowerCase();
          const vin = (r.vehicle?.vin || '').toLowerCase();
          const vehicleText = `${r.vehicle?.year || ''} ${r.vehicle?.make || ''} ${r.vehicle?.model || ''}`.toLowerCase();
          const clientText = `${r.client?.name || ''} ${r.client?.company || ''}`.toLowerCase();
          const inspectorText = (r.inspector?.name || '').toLowerCase();
          const reportNum = (r.reportNumber || r.id || '').toLowerCase();

          return (
            vin.includes(q) ||
            vehicleText.includes(q) ||
            clientText.includes(q) ||
            inspectorText.includes(q) ||
            reportNum.includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        // Full implementation of all 6 sort options
        if (sortBy === 'pass_desc') return (b.passPercentage ?? 0) - (a.passPercentage ?? 0);
        if (sortBy === 'pass_asc') return (a.passPercentage ?? 0) - (b.passPercentage ?? 0);
        if (sortBy === 'defects_desc') return (b.flaggedDefectsCount ?? 0) - (a.flaggedDefectsCount ?? 0);
        if (sortBy === 'defects_asc') return (a.flaggedDefectsCount ?? 0) - (b.flaggedDefectsCount ?? 0);
        if (sortBy === 'date_asc') {
          const timeA = parseReportDate(a.date).getTime();
          const timeB = parseReportDate(b.date).getTime();
          if (timeA !== timeB) return timeA - timeB;
          return a.id.localeCompare(b.id);
        }
        // Default: 'date_desc' (Newest first)
        const timeA = parseReportDate(a.date).getTime();
        const timeB = parseReportDate(b.date).getTime();
        if (timeA !== timeB) return timeB - timeA;
        return b.id.localeCompare(a.id);
      });
  }, [reports, activeTab, locationFilter, vehicleTypeFilter, searchQuery, globalSearch, datePreset, sortBy]);

  // Paginated records
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredReports.length / pageSize));
  
  const paginatedReports = useMemo(() => {
    if (pageSize === 'all') return filteredReports;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredReports.slice(startIndex, startIndex + pageSize);
  }, [filteredReports, currentPage, pageSize]);

  // Selection state computation
  const isAllFilteredSelected = useMemo(() => {
    return filteredReports.length > 0 && filteredReports.every((r) => selectedReportIds.includes(r.id));
  }, [filteredReports, selectedReportIds]);

  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      const filteredIdSet = new Set(filteredReports.map((r) => r.id));
      setSelectedReportIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      const newIds = new Set([...selectedReportIds, ...filteredReports.map((r) => r.id)]);
      setSelectedReportIds(Array.from(newIds));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedReportIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetAllFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setLocationFilter('all');
    setVehicleTypeFilter('all');
    setSortBy('date_desc');
  };

  return (
    <section id="reports-section" className="w-full bg-white rounded-[20px] sm:rounded-[28px] border border-slate-100 shadow-sm p-3.5 sm:p-5 md:p-6 flex flex-col gap-4 sm:gap-5">
      {/* 1. Header Toolbar: Tabs, Views & Filters */}
      <div className="flex flex-col gap-3.5 sm:gap-4">
        {/* Top line: Tabs & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none touch-pan-x">
            {REPORT_FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#180321] text-white shadow-xs'
                    : 'bg-[#F8F9FB] text-slate-600 hover:text-[#1E1035] hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                    activeTab === tab.id
                      ? 'bg-[#9723FF] text-white'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {tabCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>

          {/* Top Actions: Export CSV & View Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => exportReportsToCsv(filteredReports)}
              disabled={filteredReports.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F9FB] hover:bg-[#EAEBED] text-[#1E1035] text-xs font-bold border border-slate-200/80 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              title="Download current filtered table as CSV spreadsheet"
            >
              <Download size={14} />
              <span>Export Table (CSV)</span>
            </button>

            <div className="bg-[#F8F9FB] p-1 rounded-xl border border-slate-200/80 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#180321] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#1E1035]'
                }`}
                title="Table List View"
                aria-label="Switch to table list view"
              >
                <LayoutList size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#180321] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#1E1035]'
                }`}
                title="Card Grid View"
                aria-label="Switch to card grid view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Filter Bar: Search within view, Location, Vehicle Type, Sorting */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            {/* Quick Filter Search inside reports list */}
            <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[200px] flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter current view..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F8F9FB] border border-slate-200/80 text-xs font-medium text-[#1E1035] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9723FF]/30"
              />
            </div>

            {/* Location Dropdown */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              aria-label="Filter by Hub Location"
              className="flex-1 sm:flex-initial min-w-[130px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#F8F9FB] border border-slate-200/80 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#9723FF]/30 cursor-pointer"
            >
              {REPORT_LOCATION_FILTER_OPTIONS.map((loc) => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>

            {/* Vehicle Type Dropdown */}
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              aria-label="Filter by Vehicle Type"
              className="flex-1 sm:flex-initial min-w-[130px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#F8F9FB] border border-slate-200/80 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#9723FF]/30 cursor-pointer"
            >
              {REPORT_VEHICLE_TYPE_FILTER_OPTIONS.map((vt) => (
                <option key={vt.value} value={vt.value}>{vt.label}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <ArrowUpDown size={13} />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort reports"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#F8F9FB] border border-slate-200/80 text-xs font-bold text-[#1E1035] focus:outline-none focus:ring-2 focus:ring-[#9723FF]/30 cursor-pointer"
            >
              {REPORT_SORT_OPTIONS.map((sort) => (
                <option key={sort.value} value={sort.value}>{sort.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Bulk Selection Actions Bar */}
      {selectedReportIds.length > 0 && (
        <div className="bg-[#180321] text-white px-3.5 sm:px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-bold">
            <span className="bg-[#9723FF] text-white px-2 py-0.5 rounded-md text-[11px]">
              {selectedReportIds.length} Selected
            </span>
            <span className="hidden sm:inline text-slate-300">Batch operations:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Batch Status: Published */}
            {onBulkStatusChange && (
              <button
                type="button"
                onClick={() => {
                  onBulkStatusChange(selectedReportIds, 'published');
                  setSelectedReportIds([]);
                }}
                className="px-2.5 py-1 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
                title="Mark selected as Published"
              >
                <CheckCheck size={12} />
                <span>Publish</span>
              </button>
            )}

            {/* Batch Status: Draft */}
            {onBulkStatusChange && (
              <button
                type="button"
                onClick={() => {
                  onBulkStatusChange(selectedReportIds, 'draft');
                  setSelectedReportIds([]);
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
                title="Mark selected as Draft"
              >
                <Clock size={12} />
                <span>Draft</span>
              </button>
            )}

            {/* Export CSV */}
            <button
              type="button"
              onClick={() => {
                const targetReports = reports.filter(r => selectedReportIds.includes(r.id));
                exportReportsToCsv(targetReports.length > 0 ? targetReports : filteredReports);
              }}
              className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download size={12} />
              <span>Export CSV</span>
            </button>

            {/* Batch Delete */}
            {onBulkDeleteReports && (
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
                title="Delete selected reports"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            )}

            {/* Clear Selection */}
            <button
              type="button"
              onClick={() => setSelectedReportIds([])}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Empty States */}
      {/* 3a. Completely empty catalog */}
      {reports.length === 0 && (
        <div className="py-16 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#9723FF] flex items-center justify-center mb-3">
            <Car size={28} />
          </div>
          <h3 className="text-base font-bold text-[#1E1035]">Your inspection catalog is currently empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
            All records have been cleared. You can start a new inspection session or restore the sample enterprise dataset.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onResetCatalog && (
              <button
                type="button"
                onClick={onResetCatalog}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-[#1E1035] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Reset Demo Catalog</span>
              </button>
            )}
            <Link
              href="/inspect?new=true"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#180321] text-white text-xs font-bold hover:bg-[#9723FF] transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Start New Inspection</span>
            </Link>
          </div>
        </div>
      )}

      {/* 3b. Filters match zero reports */}
      {reports.length > 0 && filteredReports.length === 0 && (
        <div className="py-16 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#9723FF] flex items-center justify-center mb-3">
            <Car size={28} />
          </div>
          <h3 className="text-base font-bold text-[#1E1035]">No inspection reports match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            Try adjusting your search criteria, clearing selected categories, or choosing a different date range.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-xl bg-[#180321] text-white text-xs font-bold hover:bg-[#2C184A] transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* 4. Table View Mode */}
      {filteredReports.length > 0 && viewMode === 'table' && (
        <div className="w-full overflow-x-auto rounded-xl sm:rounded-2xl border border-slate-100 shadow-2xs scrollbar-thin touch-pan-x">
          <table className="w-full min-w-[940px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FB] border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all reports"
                    className="rounded text-[#9723FF] focus:ring-purple-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Vehicle Details</th>
                <th className="py-3 px-3">VIN Identifier</th>
                <th className="py-3 px-3">Protocol & Date</th>
                <th className="py-3 px-3">Pass / Defects</th>
                <th className="py-3 px-3">Odometer</th>
                <th className="py-3 px-3">Client & Hub</th>
                <th className="py-3 px-3">Inspector</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {paginatedReports.map((report) => {
                const isSelected = selectedReportIds.includes(report.id);
                const passPct = report.passPercentage ?? 85;
                const isPassHigh = passPct >= 80;
                const isTampered = report.vehicle?.odometerStatus === 'Tampered';
                const hasImgError = imageErrors[report.id];
                const imgSrc = hasImgError ? FALLBACK_VEHICLE_IMG : (report.vehicle?.imageUrl || FALLBACK_VEHICLE_IMG);
                const vin = report.vehicle?.vin || 'VIN Not Available';

                return (
                  <tr
                    key={report.id}
                    className={`group hover:bg-[#FAF8FD] transition-colors ${
                      isSelected ? 'bg-purple-50/50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(report.id)}
                        aria-label={`Select report ${report.reportNumber}`}
                        className="rounded text-[#9723FF] focus:ring-purple-500 cursor-pointer"
                      />
                    </td>

                    {/* Vehicle Details */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                          <img
                            src={imgSrc}
                            alt={report.vehicle?.model || 'Vehicle'}
                            onError={() => handleImageError(report.id)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/inspect?id=${report.id}`}
                            className="font-bold text-[#1E1035] hover:text-[#9723FF] transition-colors flex items-center gap-1.5 truncate"
                          >
                            <span>{report.vehicle?.year} {report.vehicle?.make} {report.vehicle?.model}</span>
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">{report.reportNumber}</span>
                            <span>•</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                              {report.vehicle?.type}
                            </span>
                            <span>•</span>
                            <span>{report.vehicle?.specs}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* VIN */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 font-semibold bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60 w-fit">
                        <span>{vin}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyVin(e, vin, report.id)}
                          className="text-slate-400 hover:text-[#1E1035] transition-colors cursor-pointer"
                          title="Copy VIN"
                          aria-label={`Copy VIN ${vin}`}
                        >
                          {copiedVinId === report.id ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Protocol & Date */}
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-bold text-[#1E1035] block text-[11px] truncate max-w-[170px]">
                          {report.inspectionType}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {report.date} • {report.time}
                        </span>
                      </div>
                    </td>

                    {/* Pass / Defects Progress Bar */}
                    <td className="py-3.5 px-3">
                      <div className="min-w-[110px]">
                        <div className="flex items-baseline justify-between mb-1 text-[11px] font-bold">
                          <span className={isPassHigh ? 'text-[#008751]' : 'text-amber-600'}>
                            {passPct}% Pass
                          </span>
                          {(report.flaggedDefectsCount ?? 0) > 0 && (
                            <span className="text-[10px] text-[#FE8E4B] font-extrabold">
                              {report.flaggedDefectsCount} defects
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isPassHigh ? 'bg-[#008751]' : 'bg-[#FE8E4B]'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, passPct))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Odometer */}
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-bold text-[#1E1035] block text-[11px]">
                          {report.vehicle?.odometer}
                        </span>
                        {isTampered ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded-md mt-0.5">
                            <AlertTriangle size={10} />
                            Tampered
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700">
                            Verified Normal
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Client & Hub */}
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-bold text-[#1E1035] block text-[11px] truncate max-w-[150px]">
                          {report.client?.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {report.client?.location}
                        </span>
                      </div>
                    </td>

                    {/* Inspector */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={report.inspector?.avatarUrl || 'https://i.pravatar.cc/150?u=inspector'}
                          alt={report.inspector?.name || 'Inspector'}
                          className="w-6 h-6 rounded-full border border-slate-200 object-cover shrink-0"
                        />
                        <span className="font-semibold text-slate-700 text-[11px] truncate max-w-[120px]">
                          {report.inspector?.name}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 text-center">
                      {report.status === 'published' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F8EE] text-[#1E7E34] border border-[#B3EBC8] text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={10} />
                          Published
                        </span>
                      )}
                      {report.status === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                          <Clock size={10} />
                          Draft
                        </span>
                      )}
                      {report.status === 'in_review' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                          In Review
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/inspect?id=${report.id}`}
                          className="px-2.5 py-1 rounded-xl bg-[#180321] text-white hover:bg-[#9723FF] transition-all font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Open Interactive Inspection Workspace"
                        >
                          <FileEdit size={12} />
                          <span>Open</span>
                        </Link>
                        {onDuplicateReport && (
                          <button
                            type="button"
                            onClick={() => onDuplicateReport(report)}
                            className="p-1 rounded-lg text-slate-400 hover:text-[#9723FF] hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Duplicate inspection report"
                            aria-label={`Duplicate report ${report.reportNumber}`}
                          >
                            <Files size={13} />
                          </button>
                        )}
                        {onDeleteReport && (
                          <button
                            type="button"
                            onClick={() => setReportToDelete(report)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete report"
                            aria-label={`Delete report ${report.reportNumber}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Card Grid View Mode */}
      {filteredReports.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {paginatedReports.map((report) => {
            const isSelected = selectedReportIds.includes(report.id);
            const passPct = report.passPercentage ?? 85;
            const isPassHigh = passPct >= 80;
            const isTampered = report.vehicle?.odometerStatus === 'Tampered';
            const hasImgError = imageErrors[report.id];
            const imgSrc = hasImgError ? FALLBACK_VEHICLE_IMG : (report.vehicle?.imageUrl || FALLBACK_VEHICLE_IMG);
            const vin = report.vehicle?.vin || 'VIN Not Available';

            return (
              <div
                key={report.id}
                className={`bg-white rounded-[20px] sm:rounded-[24px] border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                  isSelected ? 'ring-2 ring-[#9723FF] border-[#9723FF]' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Image & Badges */}
                <div className="relative h-40 sm:h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={report.vehicle?.model || 'Vehicle'}
                    onError={() => handleImageError(report.id)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges & Select Checkbox */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(report.id)}
                        aria-label={`Select report ${report.reportNumber}`}
                        className="w-4 h-4 rounded text-[#9723FF] focus:ring-purple-500 cursor-pointer bg-black/40 border-white/40"
                      />
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[10.5px] font-bold border border-white/20">
                        {report.reportNumber}
                      </span>
                    </div>

                    {report.status === 'published' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#008751] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                        Published
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-3 inset-x-3 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                        {report.vehicle?.type} • {report.vehicle?.specs}
                      </span>
                      <h4 className="text-white text-sm font-bold truncate">
                        {report.vehicle?.year} {report.vehicle?.make} {report.vehicle?.model}
                      </h4>
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${
                        isPassHigh
                          ? 'bg-[#008751] text-white'
                          : 'bg-[#FE8E4B] text-white'
                      }`}
                    >
                      {passPct}%
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                  {/* VIN & Odometer */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 font-mono text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                        <span>{vin}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyVin(e, vin, report.id)}
                          className="hover:text-black cursor-pointer"
                          title="Copy VIN"
                          aria-label={`Copy VIN ${vin}`}
                        >
                          {copiedVinId === report.id ? (
                            <Check size={11} className="text-emerald-600" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      </div>

                      <span className="text-[11px] font-bold text-slate-700">
                        {report.vehicle?.odometer}
                      </span>
                    </div>

                    {isTampered && (
                      <div className="p-2 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center gap-2 text-[11px] font-bold text-orange-800">
                        <AlertTriangle size={13} className="shrink-0 text-[#FE8E4B]" />
                        <span>Odometer Discrepancy Flagged</span>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                      <span>{report.inspectionType}</span>
                      <span>{report.date}</span>
                    </div>
                  </div>

                  {/* Client & Inspector Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Client</span>
                      <span className="text-xs font-bold text-[#1E1035] block truncate max-w-[110px]">
                        {report.client?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <img
                        src={report.inspector?.avatarUrl || 'https://i.pravatar.cc/150?u=inspector'}
                        alt={report.inspector?.name || 'Inspector'}
                        className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                      />
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block">Inspector</span>
                        <span className="text-xs font-bold text-[#1E1035] block truncate max-w-[90px]">
                          {report.inspector?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/inspect?id=${report.id}`}
                      className="flex-1 py-2 rounded-xl bg-[#180321] text-white hover:bg-[#9723FF] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <FileEdit size={13} />
                      <span>Open</span>
                    </Link>
                    {onDuplicateReport && (
                      <button
                        type="button"
                        onClick={() => onDuplicateReport(report)}
                        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-[#9723FF] hover:bg-purple-50 transition-colors cursor-pointer"
                        title="Duplicate report"
                        aria-label={`Duplicate report ${report.reportNumber}`}
                      >
                        <Files size={14} />
                      </button>
                    )}
                    {onDeleteReport && (
                      <button
                        type="button"
                        onClick={() => setReportToDelete(report)}
                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete report"
                        aria-label={`Delete report ${report.reportNumber}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Pagination & Bottom Meta Controls */}
      {filteredReports.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
          {/* Record Count & Page Size */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              Showing <span className="font-bold text-[#1E1035]">
                {pageSize === 'all'
                  ? filteredReports.length
                  : Math.min(filteredReports.length, (currentPage - 1) * pageSize + 1)}
                -
                {pageSize === 'all'
                  ? filteredReports.length
                  : Math.min(filteredReports.length, currentPage * pageSize)}
              </span> of{' '}
              <span className="font-bold text-[#1E1035]">{filteredReports.length}</span> records
            </div>

            {/* Page Size Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value;
                  setPageSize(val === 'all' ? 'all' : Number(val));
                  setCurrentPage(1);
                }}
                aria-label="Records per page"
                className="px-2 py-0.5 rounded-lg bg-[#F8F9FB] border border-slate-200/80 text-[11px] font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'all' ? 'All' : opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Page Numbers & Navigation Buttons */}
          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#1E1035] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-[#180321] text-white shadow-xs'
                      : 'border border-slate-200 text-slate-600 hover:text-[#1E1035] hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#1E1035] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
                aria-label="Next Page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Live Sync Status */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto text-[11px] text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-synced with Dubai Hub</span>
          </div>
        </div>
      )}

      {/* Delete Single Report Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={() => setReportToDelete(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 z-10">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E1035]">Delete Inspection Report?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete report <span className="font-bold text-slate-800">{reportToDelete.reportNumber}</span> ({reportToDelete.vehicle?.year} {reportToDelete.vehicle?.make} {reportToDelete.vehicle?.model})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteReport) onDeleteReport(reportToDelete.id);
                  setReportToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
              >
                Yes, Delete Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={() => setIsBulkDeleteModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 z-10">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E1035]">Delete Selected Reports?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800">{selectedReportIds.length}</span> selected inspection reports? This permanent action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onBulkDeleteReports) {
                    onBulkDeleteReports(selectedReportIds);
                  }
                  setSelectedReportIds([]);
                  setIsBulkDeleteModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
              >
                Yes, Delete {selectedReportIds.length} Reports
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
