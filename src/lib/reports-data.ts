import { INSPECTION_TYPE_OPTIONS, ODOMETER_STATUS_OPTIONS, REPORT_VEHICLE_TYPE_FILTER_OPTIONS } from '@/constants/options';

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
