/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { ChassisVisualizer } from './chassis-visualizer';
import { InspectionDetailState } from './inspection-detail-card';
import {
  InspectionDetailsData,
  VehicleSummaryData,
  ClientDetailsData,
  ReportOverviewData,
} from '@/lib/inspection-types';

interface ReportPreviewProps {
  tyres: Record<string, InspectionDetailState>;
  rims: Record<string, InspectionDetailState>;
  brakes?: Record<string, InspectionDetailState>;
  vehicleData?: VehicleSummaryData;
  inspectionDetails?: InspectionDetailsData;
  clientDetails?: ClientDetailsData;
  overviewStats?: ReportOverviewData;
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
    <div className="bg-white rounded-3xl p-5 flex flex-col shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[#1E1035] text-[13px] font-bold">{title}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getBadgeStyle()}`}>
          {getStatusText()}
        </span>
      </div>

      <span className="text-[11px] text-[#A0A4AB] font-semibold mb-0.5">Manufacturing year</span>
      <span className="text-[#1E1035] text-[14px] font-bold mb-3">{data?.year || '2025'}</span>

      {data?.image?.url ? (
        <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-3 mt-auto bg-slate-100 border border-slate-200">
          <img
            src={data.image.url}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-3 mt-auto bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs font-semibold">
          No Image Provided
        </div>
      )}

      {data?.comments ? (
        <p className="text-[#1E1035] text-[12px] font-medium leading-tight line-clamp-2">
          {data.comments}
        </p>
      ) : (
        <p className="text-[#A0A4AB] text-[11px] italic">No remarks recorded</p>
      )}
    </div>
  );
}

export function ReportPreview({
  tyres,
  rims,
  brakes,
  vehicleData = defaultVehicleData,
  inspectionDetails = defaultInspectionDetails,
  clientDetails = defaultClientDetails,
  overviewStats = defaultOverviewStats,
}: ReportPreviewProps) {
  const passVal = Math.max(0, Math.min(100, overviewStats.pass !== undefined ? Number(overviewStats.pass) : 55));
  const failVal = Math.max(0, Math.min(100 - passVal, overviewStats.fail !== undefined ? Number(overviewStats.fail) : (100 - passVal)));

  return (
    <div className="w-full p-4 md:p-8 flex flex-col items-center gap-8 pb-24 relative print:p-0 print:gap-0 print:pb-0">
      
      {/* PAGE 1: Cover Page */}
      <div
        id="preview-page-1"
        className="w-full max-w-[800px] min-h-[1131px] bg-white shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 print:shadow-none print:m-0 print:w-full print:max-w-none print:break-after-page"
      >
        {/* Background Image Area */}
        <div className="absolute top-0 left-0 w-full h-[65%]">
          <img 
            src="/assets/report-front.png" 
            alt="Cover Background" 
            className="w-full h-full object-cover opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo Area */}
          <div className="w-full flex justify-center mt-8">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center bg-white/10 backdrop-blur-xs border border-white/40">
              <img 
                src="/assets/checkmycar-logo.png" 
                alt="CheckMyCar Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>

          <div className="flex-1"></div>

          {/* Title Area */}
          <div className="w-full flex flex-col items-center justify-center text-center mt-auto mb-16">
            <h1 className="text-[64px] font-bold leading-tight tracking-tight text-[#009E49]">
              Comprehensive<br/>
              <span className="text-[#18181B]">Green Book</span>
            </h1>
            <div className="flex items-center gap-2 mt-4 text-[#4B5563]">
              <div className="w-5 h-5 rounded-full border-2 border-[#009E49] flex items-center justify-center">
                <div className="w-3 h-3 bg-[#009E49] rounded-full"></div>
              </div>
              <span className="text-[15px] font-semibold">www.checkmycar.ae</span>
            </div>
          </div>

          {/* Footer Card */}
          <div className="w-full bg-[#1F2022] rounded-3xl p-8 flex justify-between items-center text-white mt-auto">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Phone size={16} />
                <span className="text-sm font-medium">Contact Us</span>
              </div>
              <span className="text-lg font-bold">
                {clientDetails.whatsappNumber || '+971 054 409 3009'}
              </span>
            </div>
            <div className="flex flex-col gap-2 text-right">
              <div className="flex items-center justify-end gap-2 text-slate-400">
                <Mail size={16} />
                <span className="text-sm font-medium">Mail Id</span>
              </div>
              <span className="text-lg font-bold">
                {clientDetails.email || 'Checkmycar.ae@gmail.com'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2: Vehicle Summary */}
      <div
        id="preview-page-2"
        className="w-full max-w-[800px] min-h-[1131px] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8 print:shadow-none print:m-0 print:w-full print:max-w-none print:break-after-page"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-[#009E49] px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
            <img src="/assets/checkmycar-logo.png" alt="CheckMyCar" className="w-3.5 h-3.5 object-contain rounded-xs" /> CheckMyCar.ae
          </div>
          <div className="text-[#64748B] text-sm font-semibold">
            Comprehensive Green Book
          </div>
        </div>

        {/* Inspection Details */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-[#A0A4AB] text-sm font-bold mb-4">Inspection Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-semibold">Date</span>
              <span className="text-[15px] font-bold text-[#1E1035]">{inspectionDetails.date || '—'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-semibold">Time</span>
              <span className="text-[15px] font-bold text-[#1E1035]">{inspectionDetails.time || '—'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-semibold">Inspection Type</span>
              <span className="text-[15px] font-bold text-[#1E1035]">{inspectionDetails.inspectionType || '—'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-semibold">VIN Number</span>
              <span className="text-[15px] font-bold text-[#1E1035] font-mono tracking-wider">{inspectionDetails.vinNumber || '—'}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Summary Banner */}
        <div className="bg-[#1F2022] rounded-[24px] px-6 py-4 mb-6 shadow-sm">
          <h2 className="text-white text-lg font-semibold">Vehicle Summary</h2>
        </div>

        <h2 className="text-[22px] font-bold text-[#1E1035] mb-4">
          {vehicleData.make} {vehicleData.model}
        </h2>

        {/* Main Content Grid */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Left Column: Image + Readings */}
          <div className="w-full sm:w-[55%] flex flex-col gap-4">
            <div className="bg-white rounded-3xl overflow-hidden aspect-[4/3] shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=1000" 
                alt={`${vehicleData.make} ${vehicleData.model}`} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-sm grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">Odometer</span>
                <span className="text-[14px] font-bold text-[#1E1035]">{vehicleData.odometerReading} {vehicleData.odometerUnit}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">Tampered</span>
                <span className="text-[14px] font-bold text-red-600">{vehicleData.tamperedReading} {vehicleData.odometerUnit}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">Fuel</span>
                <span className="text-[14px] font-bold text-[#1E1035]">{vehicleData.fuelType}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details List */}
          <div className="w-full sm:w-[45%] bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Make</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.make || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Model</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.model || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Model Year</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.year || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Regional Specs</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.regionalSpecs || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Transmission</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.transmission || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Odometer</span>
              <span className="text-red-600 text-[14px] font-bold flex-1">{vehicleData.odometerStatus || 'Normal'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Spare Tyre</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1 capitalize">{vehicleData.spareType || 'Available'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Keys</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.numberOfKeys}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Vehicle Type</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.vehicleType || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">External Colour</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.externalColour || '—'}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto"></div>

        {/* Report Overview Footer */}
        <div className="bg-[#1F2022] rounded-[32px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm mt-auto">
          <h2 className="text-white text-[24px] sm:text-[28px] font-medium tracking-tight">Report Overview</h2>
          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="text-white text-xs uppercase tracking-wider font-semibold opacity-70">Pass</span>
              <span className="text-[#7FD159] text-xl font-bold">{passVal}%</span>
            </div>
            
            {/* Real CSS Conic Pie Chart */}
            <div 
              className="w-[120px] h-[120px] rounded-full shadow-lg border-2 border-white/10" 
              style={{
                background: `conic-gradient(#5BC335 0% ${passVal}%, #FE8E4B ${passVal}% 100%)`
              }}
            />

            <div className="flex flex-col text-left">
              <span className="text-white text-xs uppercase tracking-wider font-semibold opacity-70">Defects</span>
              <span className="text-[#FE8E4B] text-xl font-bold">{failVal}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* PAGE 3: Tyres Section */}
      <div
        id="preview-page-3"
        className="w-full max-w-[800px] min-h-[1131px] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8 print:shadow-none print:m-0 print:w-full print:max-w-none print:break-after-page"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-[#009E49] px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
            <img src="/assets/checkmycar-logo.png" alt="CheckMyCar" className="w-3.5 h-3.5 object-contain rounded-xs" /> CheckMyCar.ae
          </div>
          <div className="text-[#64748B] text-sm font-semibold">
            Comprehensive Green Book
          </div>
        </div>

        {/* Tyres Banner */}
        <div className="bg-[#1F2022] rounded-[24px] px-6 py-4 mb-6 shadow-sm">
          <h2 className="text-white text-lg font-semibold">Tyres</h2>
        </div>

        {/* Visualizer Block */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm relative flex flex-col items-center justify-center min-h-[230px]">
          <div className="absolute top-6 left-6 text-[#A0A4AB] font-bold text-[14px]">
            Chassis Alignment
          </div>
          <div className="scale-90 pointer-events-none">
            <ChassisVisualizer items={tyres} setItemStatus={() => {}} />
          </div>
        </div>

        {/* Tyre Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <PreviewPositionCard title="Rear Right (RR)" data={tyres.RR} />
          <PreviewPositionCard title="Rear Left (RL)" data={tyres.RL} />
          <PreviewPositionCard title="Spare tyre (ST)" data={tyres.ST} />
          <PreviewPositionCard title="Front Right (FR)" data={tyres.FR} />
          <PreviewPositionCard title="Front Left (FL)" data={tyres.FL} />
        </div>

      </div>

      {/* PAGE 4: Rims Section */}
      <div
        id="preview-page-4"
        className="w-full max-w-[800px] min-h-[1131px] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8 print:shadow-none print:m-0 print:w-full print:max-w-none print:break-after-page"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-[#009E49] px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
            <img src="/assets/checkmycar-logo.png" alt="CheckMyCar" className="w-3.5 h-3.5 object-contain rounded-xs" /> CheckMyCar.ae
          </div>
          <div className="text-[#64748B] text-sm font-semibold">
            Comprehensive Green Book
          </div>
        </div>

        {/* Rims Banner */}
        <div className="bg-[#1F2022] rounded-[24px] px-6 py-4 mb-6 shadow-sm">
          <h2 className="text-white text-lg font-semibold">Rims</h2>
        </div>

        {/* Visualizer Block */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm relative flex flex-col items-center justify-center min-h-[230px]">
          <div className="absolute top-6 left-6 text-[#A0A4AB] font-bold text-[14px]">
            Wheel Status
          </div>
          <div className="scale-90 pointer-events-none">
            <ChassisVisualizer items={rims} setItemStatus={() => {}} />
          </div>
        </div>

        {/* Rim Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <PreviewPositionCard title="Rear Right (RR)" data={rims.RR} />
          <PreviewPositionCard title="Rear Left (RL)" data={rims.RL} />
          <PreviewPositionCard title="Spare tyre (ST)" data={rims.ST} />
          <PreviewPositionCard title="Front Right (FR)" data={rims.FR} />
          <PreviewPositionCard title="Front Left (FL)" data={rims.FL} />
        </div>

      </div>

      {/* PAGE 5: Brakes Section */}
      {brakes && (
        <div
          id="preview-page-5"
          className="w-full max-w-[800px] min-h-[1131px] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8 print:shadow-none print:m-0 print:w-full print:max-w-none print:break-after-page"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="bg-[#009E49] px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
              <img src="/assets/checkmycar-logo.png" alt="CheckMyCar" className="w-3.5 h-3.5 object-contain rounded-xs" /> CheckMyCar.ae
            </div>
            <div className="text-[#64748B] text-sm font-semibold">
              Comprehensive Green Book
            </div>
          </div>

          {/* Brakes Banner */}
          <div className="bg-[#1F2022] rounded-[24px] px-6 py-4 mb-6 shadow-sm">
            <h2 className="text-white text-lg font-semibold">Brakes</h2>
          </div>

          {/* Visualizer Block */}
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm relative flex flex-col items-center justify-center min-h-[230px]">
            <div className="absolute top-6 left-6 text-[#A0A4AB] font-bold text-[14px]">
              Brake Status
            </div>
            <div className="scale-90 pointer-events-none">
              <ChassisVisualizer items={brakes} setItemStatus={() => {}} />
            </div>
          </div>

          {/* Brakes Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <PreviewPositionCard title="Rear Right (RR)" data={brakes.RR} />
            <PreviewPositionCard title="Rear Left (RL)" data={brakes.RL} />
            <PreviewPositionCard title="Spare tyre (ST)" data={brakes.ST} />
            <PreviewPositionCard title="Front Right (FR)" data={brakes.FR} />
            <PreviewPositionCard title="Front Left (FL)" data={brakes.FL} />
          </div>
        </div>
      )}

    </div>
  );
}
