export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  type: 'Truck' | 'SUV' | 'Sedan' | 'Coupe' | 'Sports' | 'Hatchback';
  color: string;
  colorHex: string;
  imageUrl: string;
  vin: string;
  odometer: string;
  odometerStatus: 'Normal' | 'Tampered' | 'Replaced' | 'Inoperative';
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
  inspectionType: '600-Points Comprehensive' | '300-Points Standard' | 'Pre-Purchase Inspection' | 'Chassis & Drivetrain';
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
