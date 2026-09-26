/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Phone, Mail, Globe } from 'lucide-react';
import { Familjen_Grotesk } from 'next/font/google';
import { ChassisVisualizer } from './chassis-visualizer';
import { CarBodyVisualizer } from '@/components/body/car-body-visualizer';
import { SUBFRAME_PARTS } from '@/components/chassis/chassis-subframe-section';
import { InspectionDetailState } from './inspection-detail-card';
import { BODY_PART_LABELS, BodyPartId, BodyPartStatus } from '@/constants/visualizers';
import {
  InspectionDetailsData,
  VehicleSummaryData,
  ClientDetailsData,
  ReportOverviewData,
  FullInspectionReport,
  CustomHeadlineItem,
} from '@/lib/inspection-types';

const familjen = Familjen_Grotesk({ subsets: ['latin'] });

interface ReportPreviewProps {
  idPrefix?: string;
  tyres: Record<string, InspectionDetailState>;
  rims: Record<string, InspectionDetailState>;
  brakes?: Record<string, InspectionDetailState>;
  vehicleData?: VehicleSummaryData;
  inspectionDetails?: InspectionDetailsData;
  clientDetails?: ClientDetailsData;
  overviewStats?: ReportOverviewData;
  report?: FullInspectionReport;
}

const defaultVehicleData: VehicleSummaryData = {
  make: 'Toyota',
  model: 'Tundra',
  year: '2025',
  regionalSpecs: 'American',
  transmission: 'Automatic',
  engineSize: '3.5L Twin-Turbo V6',
  odometerStatus: 'Tampered',
  spareType: 'available',
  numberOfKeys: 1,
  vehicleType: 'Truck',
  externalColour: 'Grey',
  fuelType: 'Petrol',
  odometerReading: '621515',
  odometerUnit: 'KM',
  tamperedReading: '621515',
};

const defaultInspectionDetails: InspectionDetailsData = {
  date: '06 August 2025',
  time: '09:00 PM',
  inspectionType: '600-Points Comprehensive',
  vinNumber: 'WMWWG9C51K3E40764',
};

const defaultClientDetails: ClientDetailsData = {
  name: 'Al Tayer Motors',
  countryCode: '+971',
  whatsappNumber: '+971 054 409 3009',
  email: 'Checkmycar.ae@gmail.com',
  vehicleDetails: '2025 Toyota Tundra TRD Pro',
  location: 'Dubai',
};

const defaultOverviewStats: ReportOverviewData = {
  pass: '55',
  fail: '45',
  autoCalculate: false,
};

// Subcomponent for Tyre & Rim preview cards
function PreviewPositionCard({
  title,
  data,
}: {
  title: string;
  data?: InspectionDetailState;
}) {
  const status = data?.status || 'pass';
  
  const getBadgeStyle = () => {
    switch (status) {
      case 'pass':
        return 'bg-[#5BC335] text-white';
      case 'fail':
        return 'bg-[#FE8E4B] text-white';
      case 'weak':
        return 'bg-[#FFED00] text-[#7A7000]';
      case 'na':
        return 'bg-[#D3D3D3] text-[#4A4A4A]';
      default:
        return 'bg-[#5BC335] text-white';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pass': return 'PASS';
      case 'fail': return 'FAIL';
      case 'weak': return 'WEAK';
      case 'na': return 'N/A';
      default: return 'PASS';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3 flex flex-col shadow-xs border border-slate-100 min-h-0">
      <div className="flex justify-between items-center mb-1 gap-1.5">
        <span className="text-[#1E1035] text-[12px] font-bold truncate">{title}</span>
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase shrink-0 ${getBadgeStyle()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[10px] text-[#A0A4AB] font-semibold">Mfg Year:</span>
        <span className="text-[#1E1035] text-[11px] font-bold">{data?.year || '2025'}</span>
      </div>

      {data?.image?.url ? (
        <div className="rounded-xl overflow-hidden aspect-[16/10] max-h-[80px] mb-1.5 mt-auto bg-slate-100 border border-slate-200">
          <img
            src={data.image.url}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden aspect-[16/10] max-h-[75px] mb-1.5 mt-auto bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[10px] font-semibold">
          No Image Provided
        </div>
      )}

      {data?.comments ? (
        <p className="text-[#1E1035] text-[11px] font-medium leading-tight line-clamp-2">
          {data.comments}
        </p>
      ) : (
        <p className="text-[#A0A4AB] text-[10px] italic">No remarks recorded</p>
      )}
    </div>
  );
}

function GenericItemCard({
  title,
  status,
  comments,
  images = [],
}: {
  title: string;
  status?: string;
  comments?: string;
  images?: string[];
}) {
  const getBadgeStyle = () => {
    switch (status?.toLowerCase()) {
      case 'pass':
      case 'good':
      case 'checked':
        return 'bg-[#5BC335] text-white';
      case 'fail':
      case 'damaged':
        return 'bg-[#FE8E4B] text-white';
      case 'weak':
      case 'repaired':
        return 'bg-[#FFED00] text-[#7A7000]';
      case 'na':
      case 'unchecked':
        return 'bg-[#D3D3D3] text-[#4A4A4A]';
      default:
        return 'bg-[#F4F5F8] text-[#1E1035] border border-slate-200';
    }
  };

  const getStatusText = () => {
    switch (status?.toLowerCase()) {
      case 'pass': return 'PASS';
      case 'good': return 'GOOD';
      case 'fail': return 'FAIL';
      case 'weak': return 'WEAK';
      case 'na': return 'N/A';
      case 'checked': return 'CHECKED';
      case 'unchecked': return 'UNCHECKED';
      case 'repaired': return 'REPAIRED';
      case 'damaged': return 'DAMAGED';
      default: return status ? status.toUpperCase() : 'N/A';
    }
  };

  const hasImages = images && images.length > 0;
  const hasComments = Boolean(comments && comments.trim().length > 0);

  // Compact row representation when no images and no remarks are attached
  if (!hasImages && !hasComments) {
    return (
      <div className="bg-white rounded-xl px-3 py-2 flex items-center justify-between shadow-xs border border-slate-100 min-h-[36px] gap-1">
        <span className="text-[#1E1035] text-[11px] font-bold truncate pr-1" title={title}>{title}</span>
        {status && (
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase shrink-0 ${getBadgeStyle()}`}>
            {getStatusText()}
          </span>
        )}
      </div>
    );
  }

  // Full card representation when images or comments exist
  return (
    <div className="bg-white rounded-2xl p-3.5 flex flex-col shadow-xs border border-slate-100">
      <div className="flex justify-between items-center mb-2 gap-2">
        <span className="text-[#1E1035] text-[12px] font-bold truncate">{title}</span>
        {status && (
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase shrink-0 ${getBadgeStyle()}`}>
            {getStatusText()}
          </span>
        )}
      </div>

      {hasImages && (
        images.length > 1 ? (
          <div className={`grid ${images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5 mb-2 mt-auto`}>
            {images.map((img, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                <img src={img} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden aspect-[16/10] max-h-[105px] mb-2 mt-auto bg-slate-100 border border-slate-200">
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )
      )}

      {hasComments && (
        <p className="text-[#1E1035] text-[11px] font-medium leading-tight line-clamp-2">
          {comments}
        </p>
      )}
    </div>
  );
}

export function hasInspectionItems(
  items?: Record<string, any>,
  comments?: string,
  images?: any[],
  customHeadlines?: CustomHeadlineItem[]
): boolean {
  const hasKeys = items ? Object.keys(items).length > 0 : false;
  const hasRemarks = Boolean(comments && comments.trim().length > 0);
  const hasImgs = Boolean(images && images.length > 0);
  const hasHeadlines = Boolean(customHeadlines && customHeadlines.length > 0);
  return hasKeys || hasRemarks || hasImgs || hasHeadlines;
}

export function getReportPreviewPagesCount(
  report?: FullInspectionReport,
  brakes?: Record<string, InspectionDetailState>
): number {
  let count = 4; // 1: Cover, 2: Vehicle Summary, 3: Tyres, 4: Rims
  const activeBrakes = brakes || report?.brakes;
  if (activeBrakes && Object.keys(activeBrakes).length > 0) count++;
  
  if (report?.chassisSubframePartStatuses && Object.keys(report.chassisSubframePartStatuses).length > 0) count++;
  if (report?.bodyPartStatuses && Object.keys(report.bodyPartStatuses).length > 0) count++;
  
  const hasInterior = Boolean(
    report?.seatsStatus ||
    (report?.interiorCustomHeadlines && report.interiorCustomHeadlines.length > 0) ||
    (report?.seatsComments && report.seatsComments.trim().length > 0) ||
    (report?.interiorComments && report.interiorComments.trim().length > 0) ||
    (report?.interiorGeneralImages && report.interiorGeneralImages.length > 0)
  );
  if (hasInterior) count++;

  if (hasInspectionItems(report?.engineItems, report?.engineComments, report?.engineGeneralImages, report?.engineCustomHeadlines)) count++;
  if (hasInspectionItems(report?.transmissionItems, report?.transmissionComments, report?.transmissionGeneralImages, report?.transmissionCustomHeadlines)) count++;
  if (hasInspectionItems(report?.electricalItems, report?.electricalComments, report?.electricalGeneralImages, report?.electricalCustomHeadlines)) count++;

  const hasPhotos = Boolean(
    (report?.generalPhotosExteriorImages && report.generalPhotosExteriorImages.length > 0) ||
    (report?.generalPhotosInteriorImages && report.generalPhotosInteriorImages.length > 0) ||
    (report?.generalPhotosEngineImages && report.generalPhotosEngineImages.length > 0) ||
    (report?.generalPhotosExteriorComments && report.generalPhotosExteriorComments.trim().length > 0) ||
    (report?.generalPhotosInteriorComments && report.generalPhotosInteriorComments.trim().length > 0) ||
    (report?.generalPhotosEngineComments && report.generalPhotosEngineComments.trim().length > 0)
  );
  if (hasPhotos) count++;

  // Final Page: Back Cover (Thank You Page)
  count++;

  return count;
}

function PageHeader({ pageNumber, totalPages }: { pageNumber?: number; totalPages?: number }) {
  return (
    <div className="w-full flex justify-between items-center mb-4 shrink-0">
      <div className="bg-[#009E49] px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
        <img src="/assets/checkmycar-logo.png" alt="CheckMyCar" className="w-3.5 h-3.5 object-contain rounded-xs" /> CheckMyCar.ae
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#64748B] text-sm font-semibold">
          Comprehensive Green Book
        </span>
        {pageNumber !== undefined && totalPages !== undefined && (
          <span className="text-[11px] font-bold bg-white text-slate-500 px-2.5 py-0.5 rounded-full shadow-xs border border-slate-200">
            {String(pageNumber).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </span>
        )}
      </div>
    </div>
  );
}

function PreviewPage({
  id,
  title,
  pageNumber,
  totalPages,
  children,
}: {
  id: string;
  title: string;
  pageNumber?: number;
  totalPages?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={`a4-print-page w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8 box-border print:shadow-none print:m-0 print:p-8 print:w-[210mm] print:h-[297mm] print:min-h-[297mm] print:max-h-[297mm] print:overflow-hidden print:box-border print:break-inside-avoid ${familjen.className}`}
    >
      <PageHeader pageNumber={pageNumber} totalPages={totalPages} />
      <div className="w-full bg-[#1F2022] rounded-[20px] px-5 py-3 mb-4 shadow-sm shrink-0">
        <h2 className="text-white text-base font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function ReportPreview({
  idPrefix = 'preview-page-',
  tyres,
  rims,
  brakes,
  vehicleData = defaultVehicleData,
  inspectionDetails = defaultInspectionDetails,
  clientDetails = defaultClientDetails,
  overviewStats = defaultOverviewStats,
  report,
}: ReportPreviewProps) {
  const passVal = Math.max(0, Math.min(100, overviewStats.pass !== undefined ? Number(overviewStats.pass) : 55));
  const failVal = Math.max(0, Math.min(100 - passVal, overviewStats.fail !== undefined ? Number(overviewStats.fail) : (100 - passVal)));

  const activeBrakes = brakes || report?.brakes;
  const totalPages = getReportPreviewPagesCount(report, activeBrakes);

  let pageCounter = 1;
  const coverPageNum = pageCounter++;
  const summaryPageNum = pageCounter++;
  const tyresPageNum = pageCounter++;
  const rimsPageNum = pageCounter++;

  const hasBrakes = Boolean(activeBrakes && Object.keys(activeBrakes).length > 0);
  const brakesPageNum = hasBrakes ? pageCounter++ : undefined;

  const hasChassis = Boolean(report?.chassisSubframePartStatuses && Object.keys(report.chassisSubframePartStatuses).length > 0);
  const chassisPageNum = hasChassis ? pageCounter++ : undefined;

  const hasBody = Boolean(report?.bodyPartStatuses && Object.keys(report.bodyPartStatuses).length > 0);
  const bodyPageNum = hasBody ? pageCounter++ : undefined;

  const hasInterior = Boolean(
    report?.seatsStatus ||
    (report?.interiorCustomHeadlines && report.interiorCustomHeadlines.length > 0) ||
    (report?.seatsComments && report.seatsComments.trim().length > 0) ||
    (report?.interiorComments && report.interiorComments.trim().length > 0) ||
    (report?.interiorGeneralImages && report.interiorGeneralImages.length > 0)
  );
  const interiorPageNum = hasInterior ? pageCounter++ : undefined;

  const hasEngine = hasInspectionItems(
    report?.engineItems,
    report?.engineComments,
    report?.engineGeneralImages,
    report?.engineCustomHeadlines
  );
  const enginePageNum = hasEngine ? pageCounter++ : undefined;

  const hasTransmission = hasInspectionItems(
    report?.transmissionItems,
    report?.transmissionComments,
    report?.transmissionGeneralImages,
    report?.transmissionCustomHeadlines
  );
  const transmissionPageNum = hasTransmission ? pageCounter++ : undefined;

  const hasElectrical = hasInspectionItems(
    report?.electricalItems,
    report?.electricalComments,
    report?.electricalGeneralImages,
    report?.electricalCustomHeadlines
  );
  const electricalPageNum = hasElectrical ? pageCounter++ : undefined;

  const hasPhotos = Boolean(
    (report?.generalPhotosExteriorImages && report.generalPhotosExteriorImages.length > 0) ||
    (report?.generalPhotosInteriorImages && report.generalPhotosInteriorImages.length > 0) ||
    (report?.generalPhotosEngineImages && report.generalPhotosEngineImages.length > 0) ||
    (report?.generalPhotosExteriorComments && report.generalPhotosExteriorComments.trim().length > 0) ||
    (report?.generalPhotosInteriorComments && report.generalPhotosInteriorComments.trim().length > 0) ||
    (report?.generalPhotosEngineComments && report.generalPhotosEngineComments.trim().length > 0)
  );
  const photosPageNum = hasPhotos ? pageCounter++ : undefined;
  const backPageNum = pageCounter++;

  return (
    <div 
      id={`${idPrefix}container`} 
      className={`w-[210mm] flex flex-col items-center gap-8 pb-24 relative print:p-0 print:gap-0 print:pb-0 print:w-[210mm] ${familjen.className}`}
    >
      
      {/* PAGE 1: Cover Page */}
      <div
        id={`${idPrefix}${coverPageNum}`}
        className={`a4-print-page a4-print-page-cover w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] bg-white shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-0 box-border print:shadow-none print:m-0 print:p-0 print:w-[210mm] print:h-[297mm] print:min-h-[297mm] print:max-h-[297mm] print:overflow-hidden print:box-border print:break-inside-avoid ${familjen.className}`}
      >
        {/* Background Image Area */}
        <div className="absolute top-[4%] left-0 w-full h-[78%] pointer-events-none select-none overflow-hidden">
          <img 
            src="/assets/report-front.png" 
            alt="Cover Background" 
            className="w-full h-full object-cover object-center"
          />
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0) 12%, rgba(255,255,255,0) 84%, #ffffff 100%)',
            }}
          />
        </div>

        {/* Top White Circular / Elliptical Gradient Dome */}
        <div 
          className="absolute top-0 left-0 right-0 h-[38%] pointer-events-none select-none z-[1]"
          style={{
            background: 'radial-gradient(ellipse 130% 90% at 50% 0%, #ffffff 0%, #ffffff 46%, rgba(255, 255, 255, 0.86) 72%, rgba(255, 255, 255, 0) 100%)',
          }}
        />

        {/* Bottom White Circular / Elliptical Gradient Dome */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[50%] pointer-events-none select-none z-[1]"
          style={{
            background: 'radial-gradient(ellipse 140% 85% at 50% 100%, #ffffff 0%, #ffffff 52%, rgba(255, 255, 255, 0.9) 74%, rgba(255, 255, 255, 0) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 w-full justify-between items-center p-10">
          {/* Logo Area */}
          <div className="w-full flex justify-center mt-4">
            <div className="w-[76px] h-[76px] rounded-[16px] overflow-hidden shadow-md flex items-center justify-center bg-[#009E49]">
              <img 
                src="/assets/checkmycar-logo.png" 
                alt="CheckMyCar Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>

          <div className="flex-1"></div>

          {/* Title Area */}
          <div className="w-full flex flex-col items-center justify-center text-center mt-auto mb-6">
            <h1 
              className={`text-[52px] font-bold leading-[1.12] tracking-tight text-center break-words bg-clip-text text-transparent ${familjen.className}`}
              style={{
                backgroundImage: 'linear-gradient(92.32deg, #009E49 0%, #062817 55.83%, #009E49 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Comprehensive<br/>
              Green Book
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[#64748B]">
              <Globe size={15} className="text-[#009E49] shrink-0" strokeWidth={2.2} />
              <span className={`text-sm font-semibold tracking-wide ${familjen.className}`}>
                www.checkmycar.ae
              </span>
            </div>
          </div>

          {/* Bottom Client Details Bar */}
          <div className="w-full bg-[#18191B] text-white rounded-[22px] p-5 shadow-2xl flex justify-between items-center mt-2">
            <div className="flex flex-col gap-0.5 min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Phone size={14} />
                <span className="text-xs font-medium">Contact Us</span>
              </div>
              <span className="text-base font-bold truncate">
                {clientDetails.whatsappNumber || '+971 054 409 3009'}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-right min-w-0 pl-2">
              <div className="flex items-center justify-end gap-1.5 text-slate-400">
                <Mail size={14} />
                <span className="text-xs font-medium">Mail Id</span>
              </div>
              <span className="text-base font-bold truncate">
                {clientDetails.email || 'Checkmycar.ae@gmail.com'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2: Vehicle Summary */}
      <div
        id={`${idPrefix}${summaryPageNum}`}
        className={`a4-print-page w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8 box-border print:shadow-none print:m-0 print:p-8 print:w-[210mm] print:h-[297mm] print:min-h-[297mm] print:max-h-[297mm] print:overflow-hidden print:box-border print:break-inside-avoid ${familjen.className}`}
      >
        <PageHeader pageNumber={summaryPageNum} totalPages={totalPages} />

        {/* Inspection Details */}
        <div className="w-full bg-white rounded-2xl p-5 mb-4 shadow-sm shrink-0">
          <h3 className="text-[#A0A4AB] text-xs font-bold mb-3">Inspection Details</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-400 font-semibold">Date</span>
              <span className="text-[14px] font-bold text-[#1E1035]">{inspectionDetails.date || '—'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-400 font-semibold">Time</span>
              <span className="text-[14px] font-bold text-[#1E1035]">{inspectionDetails.time || '—'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-400 font-semibold">Inspection Type</span>
              <span className="text-[14px] font-bold text-[#1E1035] truncate">{inspectionDetails.inspectionType || '—'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-400 font-semibold">VIN Number</span>
              <span className="text-[14px] font-bold text-[#1E1035] font-mono tracking-wider truncate">{inspectionDetails.vinNumber || '—'}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Summary Banner */}
        <div className="w-full bg-[#1F2022] rounded-[20px] px-5 py-3 mb-3.5 shadow-sm shrink-0">
          <h2 className="text-white text-base font-semibold">Vehicle Summary</h2>
        </div>

        <h2 className="text-[20px] font-bold text-[#1E1035] mb-3 shrink-0 text-left">
          {vehicleData.make} {vehicleData.model}
        </h2>

        {/* Main Content Grid */}
        <div className="w-full flex gap-3.5 mb-4">
          {/* Left Column: Image + Readings */}
          <div className="w-[54%] flex flex-col gap-3">
            <div className="bg-white rounded-2xl overflow-hidden aspect-[4/3] max-h-[220px] shadow-sm">
              <img 
                src={
                  report?.generalPhotosExteriorImages?.[0]?.url ||
                  report?.bodyImages?.[0] ||
                  "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=1000"
                } 
                alt={`${vehicleData.make} ${vehicleData.model}`} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white rounded-2xl p-3.5 shadow-sm grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-semibold">Odometer</span>
                <span className="text-[13px] font-bold text-[#1E1035] truncate">{vehicleData.odometerReading} {vehicleData.odometerUnit}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-semibold">Tampered</span>
                <span className="text-[13px] font-bold text-red-600 truncate">{vehicleData.tamperedReading} {vehicleData.odometerUnit}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-semibold">Fuel</span>
                <span className="text-[13px] font-bold text-[#1E1035] truncate">{vehicleData.fuelType}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details List */}
          <div className="w-[46%] bg-white rounded-2xl p-3.5 shadow-sm flex flex-col justify-between gap-1.5">
            {[
              { label: 'Make', value: vehicleData.make },
              { label: 'Model', value: vehicleData.model },
              { label: 'Model Year', value: vehicleData.year },
              { label: 'Regional Specs', value: vehicleData.regionalSpecs },
              { label: 'Transmission', value: vehicleData.transmission },
              { label: 'Odometer', value: vehicleData.odometerStatus, isAlert: true },
              { label: 'Spare Tyre', value: vehicleData.spareType },
              { label: 'Keys', value: vehicleData.numberOfKeys },
              { label: 'Vehicle Type', value: vehicleData.vehicleType },
              { label: 'External Colour', value: vehicleData.externalColour },
            ].map((row, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11.5px] py-0.5 border-b border-slate-50 last:border-0">
                <span className="text-[#A0A4AB] font-semibold w-28">{row.label}</span>
                <span className={`font-bold flex-1 text-right truncate ${row.isAlert ? 'text-red-600' : 'text-[#1E1035]'}`}>{row.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Report Overview Footer */}
        <div className="w-full bg-[#1F2022] rounded-[24px] p-5 flex items-center justify-between shadow-sm mt-auto shrink-0">
          <h2 className="text-white text-[20px] font-medium tracking-tight">Report Overview</h2>
          <div className="flex items-center gap-5">
            <div className="flex flex-col text-right">
              <span className="text-white text-[10px] uppercase tracking-wider font-semibold opacity-70">Pass</span>
              <span className="text-[#7FD159] text-lg font-bold">{passVal}%</span>
            </div>
            
            {/* Real CSS Conic Pie Chart */}
            <div 
              className="w-[85px] h-[85px] rounded-full shadow-lg border-2 border-white/10 shrink-0" 
              style={{
                background: `conic-gradient(#5BC335 0% ${passVal}%, #FE8E4B ${passVal}% 100%)`
              }}
            />

            <div className="flex flex-col text-left">
              <span className="text-white text-[10px] uppercase tracking-wider font-semibold opacity-70">Defects</span>
              <span className="text-[#FE8E4B] text-lg font-bold">{failVal}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* PAGE 3: Tyres Section */}
      <div
        id={`${idPrefix}${tyresPageNum}`}
        className={`a4-print-page w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8 box-border print:shadow-none print:m-0 print:p-8 print:w-[210mm] print:h-[297mm] print:min-h-[297mm] print:max-h-[297mm] print:overflow-hidden print:box-border print:break-inside-avoid ${familjen.className}`}
      >
        <PageHeader pageNumber={tyresPageNum} totalPages={totalPages} />

        {/* Tyres Banner */}
        <div className="w-full bg-[#1F2022] rounded-[20px] px-5 py-3 mb-2.5 shadow-sm shrink-0">
          <h2 className="text-white text-base font-semibold">Tyres</h2>
        </div>

        {/* Visualizer Block */}
        <div className="w-full bg-white rounded-2xl p-2 mb-2.5 shadow-sm relative flex flex-col items-center justify-center h-[145px] max-h-[145px] overflow-hidden shrink-0">
          <div className="absolute top-2 left-4 text-[#A0A4AB] font-bold text-[11px]">
            Chassis Alignment
          </div>
          <div className="scale-[0.62] origin-center pointer-events-none -my-6">
            <ChassisVisualizer items={tyres} setItemStatus={() => {}} hideLegend={true} compact={true} />
          </div>
        </div>

        {/* Tyre Cards Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5">
          <PreviewPositionCard title="Rear Right (RR)" data={tyres.RR} />
          <PreviewPositionCard title="Rear Left (RL)" data={tyres.RL} />
          <PreviewPositionCard title="Spare tyre (ST)" data={tyres.ST} />
          <PreviewPositionCard title="Front Right (FR)" data={tyres.FR} />
          <PreviewPositionCard title="Front Left (FL)" data={tyres.FL} />
        </div>

      </div>

      {/* PAGE 4: Rims Section */}
      <div
        id={`${idPrefix}${rimsPageNum}`}
        className={`a4-print-page w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8 box-border print:shadow-none print:m-0 print:p-8 print:w-[210mm] print:h-[297mm] print:min-h-[297mm] print:max-h-[297mm] print:overflow-hidden print:box-border print:break-inside-avoid ${familjen.className}`}
      >
        <PageHeader pageNumber={rimsPageNum} totalPages={totalPages} />

        {/* Rims Banner */}
        <div className="w-full bg-[#1F2022] rounded-[20px] px-5 py-3 mb-2.5 shadow-sm shrink-0">
          <h2 className="text-white text-base font-semibold">Rims</h2>
        </div>

        {/* Visualizer Block */}
        <div className="w-full bg-white rounded-2xl p-2 mb-2.5 shadow-sm relative flex flex-col items-center justify-center h-[145px] max-h-[145px] overflow-hidden shrink-0">
          <div className="absolute top-2 left-4 text-[#A0A4AB] font-bold text-[11px]">
            Wheel Status
          </div>
          <div className="scale-[0.62] origin-center pointer-events-none -my-6">
            <ChassisVisualizer items={rims} setItemStatus={() => {}} hideLegend={true} compact={true} />
          </div>
        </div>

        {/* Rim Cards Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5">
          <PreviewPositionCard title="Rear Right (RR)" data={rims.RR} />
          <PreviewPositionCard title="Rear Left (RL)" data={rims.RL} />
          <PreviewPositionCard title="Spare tyre (ST)" data={rims.ST} />
          <PreviewPositionCard title="Front Right (FR)" data={rims.FR} />
          <PreviewPositionCard title="Front Left (FL)" data={rims.FL} />
        </div>

      </div>

      {/* PAGE 5: Brakes Section */}
      {hasBrakes && activeBrakes && (
        <div
          id={`${idPrefix}${brakesPageNum}`}
          className={`a4-print-page w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8 box-border print:shadow-none print:m-0 print:p-8 print:w-[210mm] print:h-[297mm] print:min-h-[297mm] print:max-h-[297mm] print:overflow-hidden print:box-border print:break-inside-avoid ${familjen.className}`}
        >
          <PageHeader pageNumber={brakesPageNum} totalPages={totalPages} />

          {/* Brakes Banner */}
          <div className="w-full bg-[#1F2022] rounded-[20px] px-5 py-3 mb-2.5 shadow-sm shrink-0">
            <h2 className="text-white text-base font-semibold">Brakes</h2>
          </div>

          {/* Visualizer Block */}
          <div className="w-full bg-white rounded-2xl p-2 mb-2.5 shadow-sm relative flex flex-col items-center justify-center h-[145px] max-h-[145px] overflow-hidden shrink-0">
            <div className="absolute top-2 left-4 text-[#A0A4AB] font-bold text-[11px]">
              Brake Status
            </div>
            <div className="scale-[0.62] origin-center pointer-events-none -my-6">
              <ChassisVisualizer items={activeBrakes} setItemStatus={() => {}} hideLegend={true} compact={true} />
            </div>
          </div>

          {/* Brakes Cards Grid */}
          <div className="w-full grid grid-cols-3 gap-2.5">
            <PreviewPositionCard title="Rear Right (RR)" data={activeBrakes.RR} />
            <PreviewPositionCard title="Rear Left (RL)" data={activeBrakes.RL} />
            <PreviewPositionCard title="Spare tyre (ST)" data={activeBrakes.ST} />
            <PreviewPositionCard title="Front Right (FR)" data={activeBrakes.FR} />
            <PreviewPositionCard title="Front Left (FL)" data={activeBrakes.FL} />
          </div>
        </div>
      )}

      {/* PAGE 6: Chassis & Subframe */}
      {hasChassis && report?.chassisSubframePartStatuses && (
        <PreviewPage id={`${idPrefix}${chassisPageNum}`} title="Chassis & Subframe" pageNumber={chassisPageNum} totalPages={totalPages}>
          {report.chassisSubframeComments && (
            <div className="bg-white rounded-2xl p-3 mb-3 shadow-xs border border-slate-100 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1">Inspector Comments</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">{report.chassisSubframeComments}</p>
            </div>
          )}

          {/* Chassis & Subframe Diagram Visualizer Block */}
          <div className="bg-white rounded-2xl p-2.5 mb-2.5 shadow-xs relative flex flex-col items-center justify-center shrink-0">
            <div className="w-full flex items-center justify-between mb-1">
              <span className="text-[#A0A4AB] font-bold text-[12px]">Subframe Structural Points (20 Points)</span>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#000000]"></span> Checked</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4A72FF]"></span> Repaired</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F54752]"></span> Damaged</span>
              </div>
            </div>
            
            <div className="relative w-full max-w-[450px] aspect-[16/9] select-none pointer-events-none">
              {/* SVG lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                {SUBFRAME_PARTS.map((part) => (
                  <g key={`preview-subframe-line-${part.id}`}>
                    <line x1={`${part.bx}%`} y1={`${part.by}%`} x2={`${part.cx}%`} y2={`${part.cy}%`} stroke="#A0A4AB" strokeWidth="1.2" strokeDasharray="2,2" />
                    <circle cx={`${part.cx}%`} cy={`${part.cy}%`} r="2.5" fill="#A0A4AB" />
                  </g>
                ))}
              </svg>
              <img src="/assets/car-perspective.png" alt="Chassis Subframe" className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0 opacity-90" />
              <div className="absolute inset-0 z-20 pointer-events-none">
                {SUBFRAME_PARTS.map((part) => {
                  const status = report.chassisSubframePartStatuses?.[part.id] || 'checked';
                  const bgColor = status === 'repaired' ? '#4A72FF' : status === 'damaged' ? '#F54752' : '#000000';
                  return (
                    <div
                      key={`preview-bubble-${part.id}`}
                      className="absolute flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-bold shadow-xs"
                      style={{
                        top: `${part.by}%`,
                        left: `${part.bx}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: bgColor,
                      }}
                    >
                      {part.id}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {report.chassisSubframeImages && report.chassisSubframeImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3 shrink-0">
              {report.chassisSubframeImages.map((img, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-xs border border-slate-100">
                  <img src={img} alt="Chassis" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* 20 Subframe Points Grid */}
          <div className="grid grid-cols-4 gap-2">
            {SUBFRAME_PARTS.map((part) => {
              const status = report.chassisSubframePartStatuses?.[part.id] || 'checked';
              const title = `${part.id}. ${part.label}`;
              return (
                <GenericItemCard key={part.id} title={title} status={status} />
              );
            })}
          </div>

          {report.chassisSubframeCustomHeadlines && report.chassisSubframeCustomHeadlines.length > 0 && (
            <div className="mt-3 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1.5">Additional Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {report.chassisSubframeCustomHeadlines.map(h => (
                  <GenericItemCard key={h.id} title={h.title} comments={h.comments} images={h.images && h.images.length > 0 ? h.images : (h.imageUrl ? [h.imageUrl] : [])} />
                ))}
              </div>
            </div>
          )}
        </PreviewPage>
      )}

      {/* PAGE 7: Body */}
      {hasBody && report?.bodyPartStatuses && (
        <PreviewPage id={`${idPrefix}${bodyPageNum}`} title="Body" pageNumber={bodyPageNum} totalPages={totalPages}>
          {(report.bodyGeneralComments || report.bodyComments || (report.bodyGeneralImages && report.bodyGeneralImages.length > 0)) && (
            <div className="bg-white rounded-2xl p-2.5 mb-2.5 shadow-xs border border-slate-100 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1">Inspector Comments</h3>
              {(report.bodyGeneralComments || report.bodyComments) && (
                <p className="text-[11px] text-slate-600 leading-relaxed">{report.bodyGeneralComments || report.bodyComments}</p>
              )}
              {report.bodyGeneralImages && report.bodyGeneralImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {report.bodyGeneralImages.map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden shadow-xs border border-slate-100">
                      <img src={img} alt="Body observation" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Car Body Blueprint Visualizer Block */}
          <div className="bg-white rounded-2xl p-2.5 mb-2.5 shadow-xs relative flex flex-col items-center justify-center shrink-0">
            <div className="w-full flex items-center justify-between mb-1">
              <span className="text-[#A0A4AB] font-bold text-[12px]">Vehicle Body Panels Blueprint (13 Panels)</span>
              <span className="text-[11px] font-semibold text-slate-500">Certified Body Inspection</span>
            </div>
            <div className="w-full flex justify-center pointer-events-none scale-[0.78] origin-center -my-6">
              <CarBodyVisualizer 
                statuses={report.bodyPartStatuses as BodyPartStatus} 
                readOnly={true} 
                hideToolbar={true} 
              />
            </div>
          </div>

          {report.bodyImages && report.bodyImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3 shrink-0">
              {report.bodyImages.map((img, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-xs border border-slate-100">
                  <img src={img} alt="Body" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(report.bodyPartStatuses).map(([key, status]) => (
              <GenericItemCard 
                key={key} 
                title={BODY_PART_LABELS[key as BodyPartId] || key} 
                status={status as string} 
              />
            ))}
          </div>

          {report.bodyCustomHeadlines && report.bodyCustomHeadlines.length > 0 && (
            <div className="mt-3 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1.5">Additional Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {report.bodyCustomHeadlines.map(h => (
                  <GenericItemCard key={h.id} title={h.title} comments={h.comments} images={h.images && h.images.length > 0 ? h.images : (h.imageUrl ? [h.imageUrl] : [])} />
                ))}
              </div>
            </div>
          )}
        </PreviewPage>
      )}

      {/* PAGE 8: Interior & Exterior */}
      {hasInterior && (
        <PreviewPage id={`${idPrefix}${interiorPageNum}`} title="Interior & Exterior" pageNumber={interiorPageNum} totalPages={totalPages}>
          {report?.seatsComments && (
            <div className="bg-white rounded-2xl p-3 mb-3 shadow-xs border border-slate-100 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1">Seats Comments</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">{report.seatsComments}</p>
            </div>
          )}
          {report?.seatsStatus && (
             <div className="mb-3 shrink-0">
               <GenericItemCard title="Seats Condition" status={report.seatsStatus} images={report.seatsImages?.map(i => i.url)} />
             </div>
          )}
          {(report?.interiorComments || (report?.interiorGeneralImages && report.interiorGeneralImages.length > 0)) && (
            <div className="bg-white rounded-2xl p-3 mb-3 shadow-xs border border-slate-100 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1">General Comments</h3>
              {report.interiorComments && (
                <p className="text-[11px] text-slate-600 leading-relaxed">{report.interiorComments}</p>
              )}
              {report.interiorGeneralImages && report.interiorGeneralImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {report.interiorGeneralImages.map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden shadow-xs border border-slate-100">
                      <img src={img} alt="Interior observation" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {report?.interiorCustomHeadlines && report.interiorCustomHeadlines.length > 0 && (
            <div className="mt-2 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1.5">Additional Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {report.interiorCustomHeadlines.map(h => (
                  <GenericItemCard key={h.id} title={h.title} comments={h.comments} images={h.images && h.images.length > 0 ? h.images : (h.imageUrl ? [h.imageUrl] : [])} />
                ))}
              </div>
            </div>
          )}
        </PreviewPage>
      )}

      {/* PAGE 9: Engine */}
      {hasEngine && (
        <PreviewPage id={`${idPrefix}${enginePageNum}`} title="Engine" pageNumber={enginePageNum} totalPages={totalPages}>
          {(report?.engineComments || (report?.engineGeneralImages && report.engineGeneralImages.length > 0)) && (
            <div className="bg-white rounded-2xl p-3 mb-3 shadow-xs border border-slate-100 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1">Inspector Comments</h3>
              {report?.engineComments && (
                <p className="text-[11px] text-slate-600 leading-relaxed">{report.engineComments}</p>
              )}
              {report?.engineGeneralImages && report.engineGeneralImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {report.engineGeneralImages.map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden shadow-xs border border-slate-100">
                      <img src={img} alt="Engine observation" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {report?.engineItems && Object.keys(report.engineItems).length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(report.engineItems).map(([key, data]) => (
                <GenericItemCard key={key} title={key} status={data.status} comments={data.comments} images={data.images} />
              ))}
            </div>
          )}
          {report?.engineCustomHeadlines && report.engineCustomHeadlines.length > 0 && (
            <div className="mt-3 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1.5">Additional Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {report.engineCustomHeadlines.map(h => (
                  <GenericItemCard key={h.id} title={h.title} comments={h.comments} images={h.images && h.images.length > 0 ? h.images : (h.imageUrl ? [h.imageUrl] : [])} />
                ))}
              </div>
            </div>
          )}
        </PreviewPage>
      )}

      {/* PAGE 10: Transmission */}
      {hasTransmission && (
        <PreviewPage id={`${idPrefix}${transmissionPageNum}`} title="Transmission" pageNumber={transmissionPageNum} totalPages={totalPages}>
          {(report?.transmissionComments || (report?.transmissionGeneralImages && report.transmissionGeneralImages.length > 0)) && (
            <div className="bg-white rounded-2xl p-3 mb-3 shadow-xs border border-slate-100 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1">Inspector Comments</h3>
              {report?.transmissionComments && (
                <p className="text-[11px] text-slate-600 leading-relaxed">{report.transmissionComments}</p>
              )}
              {report?.transmissionGeneralImages && report.transmissionGeneralImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {report.transmissionGeneralImages.map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden shadow-xs border border-slate-100">
                      <img src={img} alt="Transmission observation" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {report?.transmissionItems && Object.keys(report.transmissionItems).length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(report.transmissionItems).map(([key, data]) => (
                <GenericItemCard key={key} title={key} status={data.status} comments={data.comments} images={data.images} />
              ))}
            </div>
          )}
          {report?.transmissionCustomHeadlines && report.transmissionCustomHeadlines.length > 0 && (
            <div className="mt-3 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1.5">Additional Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {report.transmissionCustomHeadlines.map(h => (
                  <GenericItemCard key={h.id} title={h.title} comments={h.comments} images={h.images && h.images.length > 0 ? h.images : (h.imageUrl ? [h.imageUrl] : [])} />
                ))}
              </div>
            </div>
          )}
        </PreviewPage>
      )}

      {/* PAGE 11: Electrical */}
      {hasElectrical && (
        <PreviewPage id={`${idPrefix}${electricalPageNum}`} title="Electrical" pageNumber={electricalPageNum} totalPages={totalPages}>
          {(report?.electricalComments || (report?.electricalGeneralImages && report.electricalGeneralImages.length > 0)) && (
            <div className="bg-white rounded-2xl p-3 mb-3 shadow-xs border border-slate-100 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1">Inspector Comments</h3>
              {report?.electricalComments && (
                <p className="text-[11px] text-slate-600 leading-relaxed">{report.electricalComments}</p>
              )}
              {report?.electricalGeneralImages && report.electricalGeneralImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {report.electricalGeneralImages.map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden shadow-xs border border-slate-100">
                      <img src={img} alt="Electrical observation" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {report?.electricalItems && Object.keys(report.electricalItems).length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(report.electricalItems).map(([key, data]) => (
                <GenericItemCard key={key} title={key} status={data.status} comments={data.comments} images={data.images} />
              ))}
            </div>
          )}
          {report?.electricalCustomHeadlines && report.electricalCustomHeadlines.length > 0 && (
            <div className="mt-3 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1.5">Additional Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {report.electricalCustomHeadlines.map(h => (
                  <GenericItemCard key={h.id} title={h.title} comments={h.comments} images={h.images && h.images.length > 0 ? h.images : (h.imageUrl ? [h.imageUrl] : [])} />
                ))}
              </div>
            </div>
          )}
        </PreviewPage>
      )}

      {/* PAGE 12: General Photos */}
      {hasPhotos && (
        <PreviewPage id={`${idPrefix}${photosPageNum}`} title="General Photos" pageNumber={photosPageNum} totalPages={totalPages}>
          
          {/* Exterior */}
          {(report?.generalPhotosExteriorImages && report.generalPhotosExteriorImages.length > 0) || (report?.generalPhotosExteriorComments && report.generalPhotosExteriorComments.trim().length > 0) ? (
            <div className="mb-4 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1.5">Exterior</h3>
              {report?.generalPhotosExteriorComments && (
                <div className="bg-white rounded-xl p-3 mb-2 shadow-xs border border-slate-100">
                  <p className="text-[11px] text-slate-600 leading-relaxed">{report.generalPhotosExteriorComments}</p>
                </div>
              )}
              {report?.generalPhotosExteriorImages && report.generalPhotosExteriorImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {report.generalPhotosExteriorImages.map((img) => (
                    <div key={img.id} className="aspect-[4/3] rounded-xl overflow-hidden shadow-xs bg-white p-0.5 border border-slate-100">
                      <img src={img.url} alt="Exterior" className="w-full h-full object-cover rounded-lg" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Interior */}
          {(report?.generalPhotosInteriorImages && report.generalPhotosInteriorImages.length > 0) || (report?.generalPhotosInteriorComments && report.generalPhotosInteriorComments.trim().length > 0) ? (
            <div className="mb-4 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1.5">Interior</h3>
              {report?.generalPhotosInteriorComments && (
                <div className="bg-white rounded-xl p-3 mb-2 shadow-xs border border-slate-100">
                  <p className="text-[11px] text-slate-600 leading-relaxed">{report.generalPhotosInteriorComments}</p>
                </div>
              )}
              {report?.generalPhotosInteriorImages && report.generalPhotosInteriorImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {report.generalPhotosInteriorImages.map((img) => (
                    <div key={img.id} className="aspect-[4/3] rounded-xl overflow-hidden shadow-xs bg-white p-0.5 border border-slate-100">
                      <img src={img.url} alt="Interior" className="w-full h-full object-cover rounded-lg" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Engine */}
          {(report?.generalPhotosEngineImages && report.generalPhotosEngineImages.length > 0) || (report?.generalPhotosEngineComments && report.generalPhotosEngineComments.trim().length > 0) ? (
            <div className="mb-4 shrink-0">
              <h3 className="text-xs font-bold text-[#1E1035] mb-1.5">Engine</h3>
              {report?.generalPhotosEngineComments && (
                <div className="bg-white rounded-xl p-3 mb-2 shadow-xs border border-slate-100">
                  <p className="text-[11px] text-slate-600 leading-relaxed">{report.generalPhotosEngineComments}</p>
                </div>
              )}
              {report?.generalPhotosEngineImages && report.generalPhotosEngineImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {report.generalPhotosEngineImages.map((img) => (
                    <div key={img.id} className="aspect-[4/3] rounded-xl overflow-hidden shadow-xs bg-white p-0.5 border border-slate-100">
                      <img src={img.url} alt="Engine" className="w-full h-full object-cover rounded-lg" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </PreviewPage>
      )}

      {/* PAGE: Report Back Page (Thank You Cover) */}
      <div
        id={`${idPrefix}${backPageNum}`}
        className={`a4-print-page a4-print-page-back w-[210mm] min-h-[297mm] h-[297mm] max-h-[297mm] bg-white shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-0 box-border print:shadow-none print:m-0 print:p-0 print:w-[210mm] print:h-[297mm] print:min-h-[297mm] print:max-h-[297mm] print:overflow-hidden print:box-border print:break-inside-avoid ${familjen.className}`}
      >
        {/* Background Image Area with Edge Fading */}
        <div className="absolute top-[20%] left-0 w-full h-[72%] pointer-events-none select-none overflow-hidden">
          <img 
            src="/assets/report-back.png" 
            alt="Inspection Completion" 
            className="w-full h-full object-cover object-center"
          />
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 12%, rgba(255,255,255,0) 24%, rgba(255,255,255,0) 80%, #ffffff 100%)',
            }}
          />
        </div>

        {/* Top White Circular / Elliptical Gradient Dome */}
        <div 
          className="absolute top-0 left-0 right-0 h-[46%] pointer-events-none select-none z-[1]"
          style={{
            background: 'radial-gradient(ellipse 150% 92% at 50% 0%, #ffffff 0%, #ffffff 52%, rgba(255, 255, 255, 0.88) 74%, rgba(255, 255, 255, 0) 100%)',
          }}
        />

        {/* Bottom White Circular / Elliptical Gradient Dome */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[48%] pointer-events-none select-none z-[1]"
          style={{
            background: 'radial-gradient(ellipse 140% 85% at 50% 100%, #ffffff 0%, #ffffff 50%, rgba(255, 255, 255, 0.9) 72%, rgba(255, 255, 255, 0) 100%)',
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col flex-1 w-full justify-between items-center px-12 py-16">
          {/* Top Header Block */}
          <div className="flex flex-col items-center text-center mt-8">
            <h1 
              className={`text-[46px] font-bold leading-[1.14] tracking-tight text-center max-w-[560px] bg-clip-text text-transparent ${familjen.className}`}
              style={{
                backgroundImage: 'linear-gradient(92.32deg, #17C964 0%, #052615 55.83%, #17C964 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Thank You for Choosing<br />
              CheckMyCar
            </h1>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-[#666666]">
              <Globe size={15} className="text-[#17C964] shrink-0" strokeWidth={2.2} />
              <span className={`text-[13px] font-medium tracking-wide ${familjen.className}`}>
                www.checkmycar.ae
              </span>
            </div>
          </div>

          {/* Bottom CheckMyCar Logo Card */}
          <div className="w-full flex justify-center mb-4">
            <div className="w-[75px] h-[75px] rounded-[15px] overflow-hidden shadow-lg flex items-center justify-center bg-[#009E49]">
              <img 
                src="/assets/checkmycar-logo.png" 
                alt="CheckMyCar Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
