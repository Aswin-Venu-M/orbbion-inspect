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
export const REPORTS_UPDATED_EVENT = 'orbbion_reports_updated';

/**
 * Dispatches an event to alert other components and tabs that the catalog has changed.
 */
export function notifyReportsUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(REPORTS_UPDATED_EVENT));
}

/**
 * Robust date parser supporting ISO (YYYY-MM-DD), UK/EU (DD-MM-YYYY, DD/MM/YYYY),
 * textual dates (e.g., '06 Aug 2025', 'Aug 06, 2025'), and timestamps.
 */
export function parseReportDate(dateStr: string | undefined): Date {
  if (!dateStr || typeof dateStr !== 'string') return new Date(0);

  const trimmed = dateStr.trim();

  // 1. UK/EU format check: DD-MM-YYYY or DD/MM/YYYY
  const ukMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ukMatch) {
    const day = parseInt(ukMatch[1], 10);
    const month = parseInt(ukMatch[2], 10) - 1;
    const year = parseInt(ukMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. ISO format or standard text parsing
  const standardDate = new Date(trimmed);
  if (!isNaN(standardDate.getTime())) {
    return standardDate;
  }

  // 3. Fallback: try replacing spaces or dots
  const sanitized = trimmed.replace(/\./g, '-');
  const fallbackDate = new Date(sanitized);
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }

  return new Date(0);
}

/**
 * Sanitizes and normalizes a report item to prevent runtime crashes
 * if localStorage contains incomplete or legacy schema objects.
 */
function sanitizeReportItem(item: any): ReportListItem {
  const fallbackImg = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=600&auto=format&fit=crop';
  const id = String(item?.id || `ORB-${Math.floor(1000 + Math.random() * 9000)}`);
  const reportNumber = String(item?.reportNumber || (id.startsWith('ORB-') || id.startsWith('CMC-') ? id : `ORB-${id}`));

  const v = item?.vehicle || {};
  const c = item?.client || {};
  const ins = item?.inspector || {};

  return {
    id,
    reportNumber,
    inspectionType: item?.inspectionType || '600-Points Comprehensive',
    status: (['published', 'draft', 'in_review'].includes(item?.status) ? item.status : 'draft') as 'published' | 'draft' | 'in_review',
    date: item?.date || new Date().toISOString().slice(0, 10),
    time: item?.time || '10:00 AM',
    passPercentage: typeof item?.passPercentage === 'number' ? item.passPercentage : 85,
    failPercentage: typeof item?.failPercentage === 'number' ? item.failPercentage : 15,
    flaggedDefectsCount: typeof item?.flaggedDefectsCount === 'number' ? item.flaggedDefectsCount : 0,
    lastUpdated: item?.lastUpdated || 'Recently updated',
    vehicle: {
      make: v.make || 'Toyota',
      model: v.model || 'Land Cruiser',
      year: Number(v.year) || 2024,
      type: (v.type || 'SUV') as VehicleType,
      color: v.color || 'Pearl White',
      colorHex: v.colorHex || '#FAFAFA',
      imageUrl: v.imageUrl || fallbackImg,
      vin: v.vin || 'JTMAB3FV1ND000000',
      odometer: v.odometer || '45,000 KM',
      odometerStatus: (ODOMETER_STATUS_OPTIONS.some(o => o.value === v.odometerStatus) ? v.odometerStatus : 'Normal') as any,
      transmission: v.transmission || 'Automatic',
      specs: v.specs || 'GCC Specs',
    },
    client: {
      name: c.name || 'Private Client',
      company: c.company || undefined,
      phone: c.phone || '+971 50 000 0000',
      email: c.email || 'client@example.com',
      location: c.location || 'Dubai',
    },
    inspector: {
      id: ins.id || 'ins-1',
      name: ins.name || 'Ahmed Al Mansoori',
      avatarUrl: ins.avatarUrl || 'https://i.pravatar.cc/150?u=ahmed_mansoori',
      badge: ins.badge || 'Master Certified',
    },
  };
}

export function getStoredReports(): ReportListItem[] {
  if (typeof window === 'undefined') return INITIAL_REPORTS_LIST;
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    // If raw key doesn't exist at all, seed with INITIAL_REPORTS_LIST
    if (raw === null) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS_LIST));
      return INITIAL_REPORTS_LIST;
    }
    const parsed = JSON.parse(raw);
    // Even if parsed is empty array [], this is valid (user deliberately deleted all records)
    if (Array.isArray(parsed)) {
      return parsed.map(sanitizeReportItem);
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
    notifyReportsUpdated();
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

export function deleteStoredReport(id: string): ReportListItem[] {
  const current = getStoredReports();
  const next = current.filter(r => r.id !== id);
  saveStoredReports(next);
  return next;
}

export function bulkDeleteStoredReports(ids: string[]): ReportListItem[] {
  const idSet = new Set(ids);
  const current = getStoredReports();
  const next = current.filter(r => !idSet.has(r.id));
  saveStoredReports(next);
  return next;
}

export function bulkUpdateStoredReportsStatus(ids: string[], status: 'published' | 'draft'): ReportListItem[] {
  const idSet = new Set(ids);
  const current = getStoredReports();
  const next = current.map(r => {
    if (idSet.has(r.id)) {
      return { ...r, status, lastUpdated: 'Updated just now' };
    }
    return r;
  });
  saveStoredReports(next);
  return next;
}

export function duplicateStoredReport(id: string): ReportListItem[] {
  const current = getStoredReports();
  const target = current.find(r => r.id === id);
  if (!target) return current;

  const newNumericId = Math.floor(1000 + Math.random() * 9000);
  const newId = `CMC-${newNumericId}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const duplicated: ReportListItem = {
    ...target,
    id: newId,
    reportNumber: newId,
    status: 'draft',
    date: dateStr,
    time: timeStr,
    lastUpdated: 'Duplicated just now',
    vehicle: {
      ...target.vehicle,
      vin: `${target.vehicle.vin.slice(0, -4)}${Math.floor(1000 + Math.random() * 9000)}`,
    },
  };

  const next = [duplicated, ...current];
  saveStoredReports(next);
  return next;
}

export function resetStoredReportsToDefault(): ReportListItem[] {
  saveStoredReports(INITIAL_REPORTS_LIST);
  return INITIAL_REPORTS_LIST;
}

/**
 * Counts all flagged defects across all subsystems of the FullInspectionReport.
 */
function countReportDefects(report: FullInspectionReport): number {
  let count = 0;

  // 1. Tyres, Rims, Brakes
  if (report.tyres) {
    count += Object.values(report.tyres).filter(item => item && (item.status === 'fail' || item.status === 'weak')).length;
  }
  if (report.rims) {
    count += Object.values(report.rims).filter(item => item && (item.status === 'fail' || item.status === 'weak')).length;
  }
  if (report.brakes) {
    count += Object.values(report.brakes).filter(item => item && (item.status === 'fail' || item.status === 'weak')).length;
  }

  // 2. Chassis subframe damaged or repaired parts
  if (report.chassisSubframePartStatuses) {
    count += Object.values(report.chassisSubframePartStatuses).filter(status => status === 'damaged' || status === 'repaired').length;
  }

  // 3. Body damaged or defect parts
  if (report.bodyPartStatuses) {
    count += Object.values(report.bodyPartStatuses).filter(status => status === 'damaged' || status === 'fail' || status === 'attention').length;
  }

  // 4. Electrical items failed
  if (report.electricalItems) {
    count += Object.values(report.electricalItems).filter(item => item && (item.status === 'fail' || item.status === 'weak')).length;
  }

  // 5. Engine items failed
  if (report.engineItems) {
    count += Object.values(report.engineItems).filter(item => item && (item.status === 'fail' || item.status === 'weak')).length;
  }

  // 6. Transmission items failed
  if (report.transmissionItems) {
    count += Object.values(report.transmissionItems).filter(item => item && (item.status === 'fail' || item.status === 'weak')).length;
  }

  // 7. Seats status
  if (report.seatsStatus === 'fail' || report.seatsStatus === 'weak') {
    count += 1;
  }

  // 8. Odometer status tampered is a severe alert defect
  if (report.vehicleSummary?.odometerStatus === 'Tampered') {
    count += 1;
  }

  return count;
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
    : '600-Points Comprehensive') as typeof INSPECTION_TYPE_OPTIONS[number]['value'];

  const validOdoStatus = (ODOMETER_STATUS_OPTIONS.some(o => o.value === vehicleSummary.odometerStatus)
    ? vehicleSummary.odometerStatus
    : 'Normal') as typeof ODOMETER_STATUS_OPTIONS[number]['value'];

  // Calculate genuine defects count across all inspected sections
  const flaggedDefectsCount = countReportDefects(report);

  return {
    id: report.id,
    reportNumber: report.id.startsWith('CMC-') || report.id.startsWith('ORB-') ? report.id : `CMC-${report.id}`,
    inspectionType: validInspectionType,
    status: report.status || 'draft',
    date: inspectionDetails.date || new Date().toISOString().slice(0, 10),
    time: inspectionDetails.time || '10:00 AM',
    passPercentage: passPct,
    failPercentage: failPct,
    flaggedDefectsCount,
    lastUpdated: report.lastSavedAt || 'Just now',
    vehicle: {
      make: vehicleSummary.make || 'Draft Vehicle',
      model: vehicleSummary.model || '',
      year: Number(vehicleSummary.year) || new Date().getFullYear(),
      type: (vehicleSummary.vehicleType as VehicleType) || 'SUV',
      color: vehicleSummary.externalColour || 'Unspecified',
      colorHex: '#FAFAFA',
      imageUrl: imgUrl,
      vin: inspectionDetails.vinNumber || 'Pending VIN',
      odometer: vehicleSummary.odometerReading ? `${vehicleSummary.odometerReading} ${vehicleSummary.odometerUnit || 'KM'}` : '0 KM',
      odometerStatus: validOdoStatus,
      transmission: vehicleSummary.transmission || 'Automatic',
      specs: vehicleSummary.regionalSpecs || 'GCC Specs',
    },
    client: {
      name: clientDetails.name || 'Unassigned Client',
      phone: clientDetails.whatsappNumber ? `${clientDetails.countryCode || '+971'} ${clientDetails.whatsappNumber}` : '',
      email: clientDetails.email || '',
      location: clientDetails.location || '',
    },
    inspector: {
      id: 'ins-1',
      name: teamDetails.inspector || 'Unassigned Inspector',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      badge: 'Certified QA',
    },
  };
}

export function calculateDynamicKPIs(reports: ReportListItem[]): DashboardKPIData {
  if (!reports || reports.length === 0) {
    return {
      totalInspections: {
        value: 0,
        change: 0,
        period: 'vs last month',
      },
      passRate: {
        value: 0,
        change: 0,
        period: 'vs last month',
      },
      pendingDrafts: {
        value: 0,
        urgentCount: 0,
      },
      flaggedDefects: {
        value: 0,
        tamperedCount: 0,
      },
      activeInspectors: {
        total: 0,
        onDuty: 0,
      },
    };
  }

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
      total: Math.max(inspectorIds.size, 1),
      onDuty: Math.min(Math.max(inspectorIds.size, 1), 8),
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
    `${r.passPercentage ?? 0}%`,
    `${r.failPercentage ?? 0}%`,
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

  // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows correctly renders Arabic and non-ASCII text
  const csvContent = '\uFEFF' + [
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
