'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Familjen_Grotesk } from 'next/font/google';
import Link from 'next/link';
import {
  Search, Plus, Calendar, RefreshCw, FileText,
} from 'lucide-react';

import { AppShell, dispatchToast } from '@/components/layout/app-shell';
import { ReportsListTable, TabFilter } from '@/components/dashboard/reports-list-table';
import { DATE_PRESET_OPTIONS } from '@/constants/options';
import { initialReportsList } from '@constants';
import {
  ReportListItem,
  getStoredReports,
  deleteStoredReport,
  bulkDeleteStoredReports,
  bulkUpdateStoredReportsStatus,
  duplicateStoredReport,
  resetStoredReportsToDefault,
  REPORTS_UPDATED_EVENT,
} from '@/lib/reports-data';

const familjen = Familjen_Grotesk({ subsets: ['latin'] });

function ReportsContent() {
  const searchParams = useSearchParams();

  // Read initial tab from URL query param (e.g., /reports?tab=draft)
  const initialTabParam = searchParams.get('tab') as TabFilter;
  const initialTab: TabFilter = (initialTabParam && ['all', 'published', 'draft', 'tampered', 'defects'].includes(initialTabParam))
    ? initialTabParam
    : 'all';

  // Reports Data State
  const [reports, setReports] = useState<ReportListItem[]>(initialReportsList);

  // Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [datePreset, setDatePreset] = useState<'today' | '7d' | '30d' | 'all'>('all');
  const [activeTab, setActiveTab] = useState<TabFilter>(initialTab);

  // Sync state from localStorage
  const syncReportsFromStorage = useCallback(() => {
    const loaded = getStoredReports();
    setReports(loaded);
  }, []);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    syncReportsFromStorage();
  }, [syncReportsFromStorage]);

  // Real-time listener for cross-tab and in-app catalog changes
  useEffect(() => {
    const handleUpdate = () => {
      syncReportsFromStorage();
    };

    window.addEventListener(REPORTS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(REPORTS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [syncReportsFromStorage]);

  // Sync tab from URL when searchParams change (browser back/forward or external navigation)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabFilter;
    if (tabParam && ['all', 'published', 'draft', 'tampered', 'defects'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Update tab state AND update URL search param without full reload
  const handleActiveTabChange = useCallback((newTab: TabFilter) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newTab === 'all') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', newTab);
      }
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    dispatchToast('Syncing reports directory...', 'info');
    syncReportsFromStorage();
    setTimeout(() => {
      dispatchToast('All reports up to date', 'success');
    }, 600);
  }, [syncReportsFromStorage]);

  // Delete single report
  const handleDeleteReport = useCallback((id: string) => {
    const updated = deleteStoredReport(id);
    setReports(updated);
    dispatchToast('Report deleted successfully', 'success');
  }, []);

  // Bulk delete selected reports
  const handleBulkDeleteReports = useCallback((ids: string[]) => {
    const updated = bulkDeleteStoredReports(ids);
    setReports(updated);
    dispatchToast(`${ids.length} reports deleted successfully`, 'success');
  }, []);

  // Bulk update report status
  const handleBulkStatusChange = useCallback((ids: string[], status: 'published' | 'draft') => {
    const updated = bulkUpdateStoredReportsStatus(ids, status);
    setReports(updated);
    const label = status === 'published' ? 'Published' : 'Draft';
    dispatchToast(`${ids.length} reports marked as ${label}`, 'success');
  }, []);

  // Duplicate an inspection report
  const handleDuplicateReport = useCallback((report: ReportListItem) => {
    const updated = duplicateStoredReport(report.id);
    setReports(updated);
    const vehicleLabel = `${report.vehicle?.make || ''} ${report.vehicle?.model || ''}`.trim() || 'vehicle';
    dispatchToast(`Cloned draft inspection for ${vehicleLabel}`, 'success');
  }, []);

  // Reset catalog to demo mock data
  const handleResetCatalog = useCallback(() => {
    const defaultData = resetStoredReportsToDefault();
    setReports(defaultData);
    dispatchToast('Catalog restored to default enterprise dataset', 'info');
  }, []);

  const publishedCount = reports.filter((r) => r.status === 'published').length;

  return (
    <div className={`flex flex-col gap-4 sm:gap-5 ${familjen.className}`}>
      {/* Reports Page Header */}
      <header className="relative w-full bg-white rounded-[20px] sm:rounded-[28px] shadow-sm border border-slate-100 p-3.5 sm:p-5 md:p-6 shrink-0 flex flex-col gap-3.5 sm:gap-4">
        {/* Top Row: Title & Actions */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-1 sm:gap-1.5 w-full lg:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-[#180321] text-white text-[10px] sm:text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shrink-0">
                <FileText size={12} className="text-purple-300" />
                Reports Directory
              </span>
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#E8F8EE] border border-[#B3EBC8] text-[#1E7E34] text-[10px] sm:text-[11px] font-bold truncate">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#008751] animate-ping shrink-0" />
                <span className="truncate">{publishedCount} Published • {reports.length - publishedCount} In-Progress</span>
              </div>
            </div>

            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mt-0.5">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E1035] tracking-tight">
                Inspection Reports
              </h1>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
                {reports.length} Total Records
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto self-end lg:self-center">
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 hover:text-[#1E1035] hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
              title="Refresh Data"
              aria-label="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>

            <Link
              href="/inspect?new=true"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#9723FF] to-[#7915D4] text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>+ New Inspection</span>
            </Link>
          </div>
        </div>

        {/* Bottom Row: Search & Date Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2.5 sm:pt-3 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative flex-1 w-full max-w-xl">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search by VIN, Vehicle Make & Model, Client Name, Inspector..."
              aria-label="Search reports catalog"
              className="w-full pl-9 sm:pl-10 pr-12 sm:pr-14 py-2 sm:py-2.5 rounded-xl bg-[#F8F9FB] border border-slate-200/80 text-xs sm:text-sm font-medium text-[#1E1035] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9723FF]/30 focus:border-[#9723FF] transition-all"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-slate-500 hover:text-[#1E1035] bg-slate-200/70 hover:bg-slate-200 rounded px-1.5 py-0.5 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0 scrollbar-none touch-pan-x">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden md:inline-flex items-center gap-1">
              <Calendar size={13} />
              Period:
            </span>
            {DATE_PRESET_OPTIONS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDatePreset(preset.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  datePreset === preset.id
                    ? 'bg-[#180321] text-white shadow-xs'
                    : 'bg-[#F8F9FB] text-slate-600 hover:text-[#1E1035] hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Reports Data Grid */}
      <ReportsListTable
        reports={reports}
        activeTab={activeTab}
        onActiveTabChange={handleActiveTabChange}
        globalSearch={globalSearch}
        datePreset={datePreset}
        onDeleteReport={handleDeleteReport}
        onBulkDeleteReports={handleBulkDeleteReports}
        onBulkStatusChange={handleBulkStatusChange}
        onDuplicateReport={handleDuplicateReport}
        onResetCatalog={handleResetCatalog}
      />
    </div>
  );
}

export default function ReportsPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="flex items-center justify-center p-12 text-slate-400 font-medium text-sm">
          Loading reports directory...
        </div>
      }>
        <ReportsContent />
      </Suspense>
    </AppShell>
  );
}
