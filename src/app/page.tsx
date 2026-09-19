'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell, dispatchToast } from '@/components/layout/app-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { KPIStatsGrid } from '@/components/dashboard/kpi-stats-grid';
import { RecentReportsCard } from '@/components/dashboard/recent-reports-card';
import { initialReportsList } from '@constants';
import {
  ReportListItem,
  DashboardKPIData,
  getStoredReports,
  calculateDynamicKPIs,
  REPORTS_UPDATED_EVENT,
} from '@/lib/reports-data';

export default function AppDashboardPage() {
  const router = useRouter();

  // Global Data State
  const [reports, setReports] = useState<ReportListItem[]>(initialReportsList);
  const [kpiData, setKpiData] = useState<DashboardKPIData>(() => calculateDynamicKPIs(initialReportsList));

  const syncReportsFromStorage = useCallback(() => {
    const loaded = getStoredReports();
    setReports(loaded);
    setKpiData(calculateDynamicKPIs(loaded));
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

  const handleRefresh = useCallback(() => {
    dispatchToast('Syncing real-time inspection records with Dubai Hub...', 'info');
    syncReportsFromStorage();
    setTimeout(() => {
      dispatchToast('All inspection records up to date', 'success');
    }, 600);
  }, [syncReportsFromStorage]);

  // KPI deep links — navigate to /reports with tab preset
  const handleFilterAll = useCallback(() => {
    router.push('/reports?tab=all');
  }, [router]);

  const handleFilterPublished = useCallback(() => {
    router.push('/reports?tab=published');
  }, [router]);

  const handleFilterDrafts = useCallback(() => {
    router.push('/reports?tab=draft');
  }, [router]);

  const handleFilterTampered = useCallback(() => {
    router.push('/reports?tab=tampered');
  }, [router]);

  const publishedCount = reports.filter((r) => r.status === 'published').length;

  return (
    <AppShell>
      {/* 1. Header Toolbar */}
      <DashboardHeader
        totalCount={reports.length}
        publishedCount={publishedCount}
        onRefresh={handleRefresh}
      />

      {/* 2. KPI Statistics Grid */}
      <div className="mt-4 sm:mt-6">
        <KPIStatsGrid
          data={kpiData}
          onFilterAll={handleFilterAll}
          onFilterPublished={handleFilterPublished}
          onFilterDrafts={handleFilterDrafts}
          onFilterTampered={handleFilterTampered}
        />
      </div>

      {/* 3. Recent Reports */}
      <div className="mt-4 sm:mt-6">
        <RecentReportsCard reports={reports} maxItems={5} />
      </div>
    </AppShell>
  );
}
