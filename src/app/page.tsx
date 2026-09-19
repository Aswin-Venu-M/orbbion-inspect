'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { AppShell, dispatchToast } from '@/components/layout/app-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { KPIStatsGrid } from '@/components/dashboard/kpi-stats-grid';
import { RecentReportsCard } from '@/components/dashboard/recent-reports-card';
import { initialReportsList, initialDashboardKPI } from '@constants';
import {
  ReportListItem,
  DashboardKPIData,
  getStoredReports,
  calculateDynamicKPIs,
} from '@/lib/reports-data';

export default function AppDashboardPage() {
  const router = useRouter();

  // Global Data State
  const [reports, setReports] = useState<ReportListItem[]>(initialReportsList);
  const [kpiData, setKpiData] = useState<DashboardKPIData>(initialDashboardKPI);

  // Hydrate from localStorage on client mount
  React.useEffect(() => {
    const loaded = getStoredReports();
    setReports(loaded);
    setKpiData(calculateDynamicKPIs(loaded));
  }, []);

  const handleRefresh = useCallback(() => {
    dispatchToast('Syncing real-time inspection records with Dubai Hub...', 'info');
    const loaded = getStoredReports();
    setReports(loaded);
    setKpiData(calculateDynamicKPIs(loaded));
    setTimeout(() => {
      dispatchToast('All inspection records up to date', 'success');
    }, 600);
  }, []);

  // KPI deep links — navigate to /reports with tab preset
  const handleFilterDrafts = useCallback(() => {
    router.push('/reports?tab=draft');
  }, [router]);

  const handleFilterTampered = useCallback(() => {
    router.push('/reports?tab=tampered');
  }, [router]);

  return (
    <AppShell>
      {/* 1. Header Toolbar */}
      <DashboardHeader
        totalCount={reports.length}
        publishedCount={reports.filter((r) => r.status === 'published').length}
        onRefresh={handleRefresh}
      />

      {/* 2. KPI Statistics Grid */}
      <div className="mt-4 sm:mt-6">
        <KPIStatsGrid
          data={kpiData}
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
