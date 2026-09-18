'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Familjen_Grotesk } from 'next/font/google';

import { AppShell, dispatchToast } from '@/components/layout/app-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { KPIStatsGrid } from '@/components/dashboard/kpi-stats-grid';
import { ActivityChartCard } from '@/components/dashboard/activity-chart-card';
import { RecentReportsCard } from '@/components/dashboard/recent-reports-card';
import {
  initialReportsList,
  initialDashboardKPI,
  weeklyActivityData,
  inspectionTypeBreakdown,
} from '@constants';
import {
  ReportListItem,
  DashboardKPIData,
  getStoredReports,
  calculateDynamicKPIs,
} from '@/lib/reports-data';

const familjen = Familjen_Grotesk({ subsets: ['latin'] });

export default function AppDashboardPage() {
  const router = useRouter();

  // Global Data State
  const [reports, setReports] = useState<ReportListItem[]>(initialReportsList);
  const [kpiData, setKpiData] = useState<DashboardKPIData>(initialDashboardKPI);

  // Dashboard Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [datePreset, setDatePreset] = useState<'today' | '7d' | '30d' | 'all'>('7d');

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
      <div className={familjen.className}>
        {/* 1. Header Toolbar */}
        <DashboardHeader
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          datePreset={datePreset}
          onDatePresetChange={setDatePreset}
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

        {/* 3. Inspection Throughput & Protocol Breakdown */}
        <div className="mt-4 sm:mt-6">
          <ActivityChartCard
            activityData={weeklyActivityData}
            typeBreakdown={inspectionTypeBreakdown}
          />
        </div>

        {/* 4. Recent Reports Compact Widget */}
        <div className="mt-4 sm:mt-6">
          <RecentReportsCard reports={reports} maxItems={5} />
        </div>
      </div>
    </AppShell>
  );
}
