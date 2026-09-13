import { INSPECTION_TYPE_OPTIONS, ODOMETER_STATUS_OPTIONS, REPORT_VEHICLE_TYPE_FILTER_OPTIONS } from '@/constants/options';
import type { FullInspectionReport } from './inspection-types';

// Omit the 'all' option from vehicle types for the strict data model
type VehicleTypeFilter = typeof REPORT_VEHICLE_TYPE_FILTER_OPTIONS[number]['value'];
type VehicleType = Exclude<VehicleTypeFilter, 'all'>;

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  color: string;
  colorHex: string;
  imageUrl: string;
  vin: string;
  odometer: string;
  odometerStatus: typeof ODOMETER_STATUS_OPTIONS[number]['value'];
  transmission: string;
  specs: string;
}

export interface ClientInfo {
  name: string;
  company?: string;
  location: string;
  phone: string;
  email: string;
}

export interface InspectorInfo {
  id: string;
  name: string;
  avatarUrl: string;
  badge: string;
}

export interface ReportListItem {
  id: string;
  reportNumber: string;
  vehicle: VehicleInfo;
  client: ClientInfo;
  inspector: InspectorInfo;
  date: string;
  time: string;
  inspectionType: typeof INSPECTION_TYPE_OPTIONS[number]['value'];
  passPercentage: number;
  failPercentage: number;
  status: 'published' | 'draft' | 'in_review';
  flaggedDefectsCount: number;
  lastUpdated: string;
}

export interface DashboardKPIData {
  totalInspections: {
    value: number;
    change: number;
    period: string;
  };
  passRate: {
    value: number;
    change: number;
    period: string;
  };
  pendingDrafts: {
    value: number;
    urgentCount: number;
  };
  flaggedDefects: {
    value: number;
    tamperedCount: number;
  };
  activeInspectors: {
    total: number;
    onDuty: number;
  };
}

export interface DailyActivityData {
  day: string;
  date: string;
  passed: number;
  failed: number;
  total: number;
}

export {
  INITIAL_DASHBOARD_KPI,
  initialDashboardKPI,
  WEEKLY_ACTIVITY_DATA,
  weeklyActivityData,
  INSPECTION_TYPE_BREAKDOWN,
  inspectionTypeBreakdown,
  INITIAL_REPORTS_LIST,
  initialReportsList,
} from '@/constants/dashboard';

import { INITIAL_REPORTS_LIST, INITIAL_DASHBOARD_KPI } from '@/constants/dashboard';

export const REPORTS_STORAGE_KEY = 'orbbion_reports_catalog_v2';

export function getStoredReports(): ReportListItem[] {
  if (typeof window === 'undefined') return INITIAL_REPORTS_LIST;
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS_LIST));
      return INITIAL_REPORTS_LIST;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_REPORTS_LIST;
  } catch (err) {
    console.warn('Failed to load reports catalog from localStorage:', err);
    return INITIAL_REPORTS_LIST;
  }
}

export function saveStoredReports(reports: ReportListItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save reports catalog to localStorage:', err);
  }
}

export function upsertStoredReport(updatedReport: ReportListItem): ReportListItem[] {
  const current = getStoredReports();
  const index = current.findIndex(r => r.id === updatedReport.id);
  let next: ReportListItem[];
  if (index >= 0) {
    next = [...current];
    next[index] = { ...current[index], ...updatedReport, lastUpdated: 'Saved just now' };
  } else {
    next = [{ ...updatedReport, lastUpdated: 'Created just now' }, ...current];
  }
  saveStoredReports(next);
  return next;
}

export function convertFullReportToListItem(report: FullInspectionReport): ReportListItem {
  const vehicleSummary = report.vehicleSummary || ({} as Partial<FullInspectionReport['vehicleSummary']>);
  const inspectionDetails = report.inspectionDetails || ({} as Partial<FullInspectionReport['inspectionDetails']>);
  const clientDetails = report.clientDetails || ({} as Partial<FullInspectionReport['clientDetails']>);
  const teamDetails = report.teamDetails || ({} as Partial<FullInspectionReport['teamDetails']>);
  const reportOverview = report.reportOverview || ({} as Partial<FullInspectionReport['reportOverview']>);

  const passPct = Number(reportOverview.pass) || 85;
  const failPct = Number(reportOverview.fail) || (100 - passPct);

  const fallbackImg = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=600&auto=format&fit=crop';
  const imgUrl = (report.generalPhotosExteriorImages && report.generalPhotosExteriorImages[0]?.url) ||
    (report.bodyImages && report.bodyImages[0]) ||
    fallbackImg;

  const validInspectionType = (INSPECTION_TYPE_OPTIONS.some(o => o.value === inspectionDetails.inspectionType)
    ? inspectionDetails.inspectionType
    : 'Comprehensive Inspection') as typeof INSPECTION_TYPE_OPTIONS[number]['value'];

  const validOdoStatus = (ODOMETER_STATUS_OPTIONS.some(o => o.value === vehicleSummary.odometerStatus)
    ? vehicleSummary.odometerStatus
    : 'Normal') as typeof ODOMETER_STATUS_OPTIONS[number]['value'];

  return {
    id: report.id,
    reportNumber: report.id.startsWith('CMC-') ? report.id : `CMC-${report.id}`,
    inspectionType: validInspectionType,
    status: report.status || 'draft',
    date: inspectionDetails.date || new Date().toISOString().slice(0, 10),
    time: inspectionDetails.time || '10:00 AM',
    passPercentage: passPct,
    failPercentage: failPct,
    flaggedDefectsCount: 0,
    lastUpdated: report.lastSavedAt || 'Just now',
    vehicle: {
      make: vehicleSummary.make || 'Toyota',
      model: vehicleSummary.model || 'Land Cruiser',
      year: Number(vehicleSummary.year) || 2024,
      type: (vehicleSummary.vehicleType as VehicleType) || 'SUV',
      color: vehicleSummary.externalColour || 'Pearl White',
      colorHex: '#FAFAFA',
      imageUrl: imgUrl,
      vin: inspectionDetails.vinNumber || 'JTMAB3FV1ND000000',
      odometer: `${vehicleSummary.odometerReading || '45,000'} ${vehicleSummary.odometerUnit || 'KM'}`,
      odometerStatus: validOdoStatus,
      transmission: vehicleSummary.transmission || 'Automatic',
      specs: vehicleSummary.regionalSpecs || 'GCC Specs',
    },
    client: {
      name: clientDetails.name || 'Private Client',
      phone: `${clientDetails.countryCode || '+971'} ${clientDetails.whatsappNumber || '50 000 0000'}`,
      email: clientDetails.email || 'client@example.com',
      location: clientDetails.location || 'Dubai, UAE',
    },
    inspector: {
      id: 'INS-01',
      name: teamDetails.inspector || 'Lead Specialist',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      badge: 'Master Certified',
    },
  };
}

export function deleteStoredReport(id: string): ReportListItem[] {
  const current = getStoredReports();
  const next = current.filter(r => r.id !== id);
  saveStoredReports(next);
  return next;
}

export function calculateDynamicKPIs(reports: ReportListItem[]): DashboardKPIData {
  if (!reports || reports.length === 0) return INITIAL_DASHBOARD_KPI;

  const total = reports.length;
  const totalPassPct = reports.reduce((acc, r) => acc + (r.passPercentage || 0), 0);
  const avgPassRate = Number((totalPassPct / total).toFixed(1));

  const drafts = reports.filter(r => r.status === 'draft');
  const urgentDrafts = drafts.filter(r => (r.flaggedDefectsCount || 0) >= 3);

  const totalFlaggedDefects = reports.reduce((acc, r) => acc + (r.flaggedDefectsCount || 0), 0);
  const tamperedCount = reports.filter(r => r.vehicle?.odometerStatus === 'Tampered').length;

  const inspectorIds = new Set(reports.map(r => r.inspector?.id || r.inspector?.name).filter(Boolean));

  return {
    totalInspections: {
      value: total,
      change: INITIAL_DASHBOARD_KPI.totalInspections.change,
      period: 'vs last month',
    },
    passRate: {
      value: avgPassRate,
      change: INITIAL_DASHBOARD_KPI.passRate.change,
      period: 'vs last month',
    },
    pendingDrafts: {
      value: drafts.length,
      urgentCount: urgentDrafts.length,
    },
    flaggedDefects: {
      value: totalFlaggedDefects,
      tamperedCount,
    },
    activeInspectors: {
      total: Math.max(inspectorIds.size, INITIAL_DASHBOARD_KPI.activeInspectors.total),
      onDuty: Math.min(Math.max(inspectorIds.size, 8), INITIAL_DASHBOARD_KPI.activeInspectors.onDuty),
    },
  };
}

export function exportReportsToCsv(reports: ReportListItem[], filename?: string): void {
  if (!reports || reports.length === 0) return;

  const headers = [
    'Report Number',
    'VIN',
    'Make',
    'Model',
    'Year',
    'Vehicle Type',
    'Exterior Color',
    'Transmission',
    'Regional Specs',
    'Odometer',
    'Odometer Status',
    'Pass Percentage',
    'Fail Percentage',
    'Flagged Defects Count',
    'Inspection Protocol',
    'Date',
    'Time',
    'Client Name',
    'Client Phone',
    'Client Email',
    'Client Location',
    'Inspector Name',
    'Status',
  ];

  const rows = reports.map(r => [
    r.reportNumber || `ORB-${r.id}`,
    r.vehicle?.vin || '',
    r.vehicle?.make || '',
    r.vehicle?.model || '',
    r.vehicle?.year || '',
    r.vehicle?.type || '',
    r.vehicle?.color || '',
    r.vehicle?.transmission || '',
    r.vehicle?.specs || '',
    r.vehicle?.odometer || '',
    r.vehicle?.odometerStatus || '',
    `${r.passPercentage}%`,
    `${r.failPercentage}%`,
    r.flaggedDefectsCount ?? 0,
    r.inspectionType || '',
    r.date || '',
    r.time || '',
    r.client?.name || '',
    r.client?.phone || '',
    r.client?.email || '',
    r.client?.location || '',
    r.inspector?.name || '',
    r.status || 'draft',
  ]);

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `orbbion_inspections_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
