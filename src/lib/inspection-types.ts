import { InspectionDetailState } from '@/components/ui/inspection-detail-card';

export interface InspectionDetailsData {
  date: string;
  time: string;
  inspectionType: string;
  vinNumber: string;
}

export interface VehicleSummaryData {
  make: string;
  model: string;
  year: string;
  regionalSpecs: string;
  transmission: string;
  engineSize: string;
  odometerStatus: string;
  spareType: 'available' | 'not-available';
  numberOfKeys: number;
  vehicleType: string;
  externalColour: string;
  fuelType: string;
  odometerReading: string;
  odometerUnit: 'KM' | 'Miles';
  tamperedReading: string;
}

export interface ReportOverviewData {
  pass: string;
  fail: string;
  weak?: string;
  autoCalculate: boolean;
}

export interface ClientDetailsData {
  name: string;
  countryCode: string;
  whatsappNumber: string;
  email: string;
  vehicleDetails: string;
  location: string;
}

export interface TeamDetailsData {
  inspector: string;
}

export interface CustomHeadlineItem {
  id: string;
  title: string;
  comments: string;
  imageUrl?: string;
  images?: string[];
}

export interface FullInspectionReport {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'in_review';
  lastSavedAt: string;
  inspectionDetails: InspectionDetailsData;
  vehicleSummary: VehicleSummaryData;
  reportOverview: ReportOverviewData;
  clientDetails: ClientDetailsData;
  teamDetails: TeamDetailsData;
  tyres: Record<string, InspectionDetailState>;
  rims: Record<string, InspectionDetailState>;
  brakes: Record<string, InspectionDetailState>;
  bodyComments?: string;
  bodyImages?: string[];
  bodyPartStatuses?: Record<string, string>;
  bodyCustomHeadlines?: CustomHeadlineItem[];

  chassisSubframeComments?: string;
  chassisSubframeImages?: string[];
  chassisSubframePartStatuses?: Record<number, 'unchecked' | 'checked' | 'repaired' | 'damaged'>;
  chassisSubframeCustomHeadlines?: CustomHeadlineItem[];

  interiorComments?: string;
  seatsComments?: string;
  interiorCustomHeadlines?: CustomHeadlineItem[];

  bodyGeneralComments?: string;

  electricalComments?: string;
  electricalItems?: Record<string, { status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>;
  electricalCustomHeadlines?: CustomHeadlineItem[];

  engineComments?: string;
  engineItems?: Record<string, { status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>;
  engineCustomHeadlines?: CustomHeadlineItem[];

  transmissionComments?: string;
  transmissionItems?: Record<string, { status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>;
  transmissionCustomHeadlines?: CustomHeadlineItem[];

  customHeadlines?: CustomHeadlineItem[]; // Legacy or general Custom Headlines if any
  seatsStatus?: 'pass' | 'fail' | 'weak' | 'na';
  seatsImages?: { id: string; url: string }[];
  generalPhotosExteriorComments?: string;
  generalPhotosExteriorImages?: { id: string; url: string }[];
  generalPhotosInteriorComments?: string;
  generalPhotosInteriorImages?: { id: string; url: string }[];
  generalPhotosEngineComments?: string;
  generalPhotosEngineImages?: { id: string; url: string }[];
  inspectorComments?: string;
}
