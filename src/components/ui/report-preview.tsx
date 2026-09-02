import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { ChassisVisualizer, InspectionState } from './chassis-visualizer';

interface ReportPreviewProps {
  tyres: Record<string, any>;
  rims: Record<string, any>;
}

export function ReportPreview({ tyres, rims }: ReportPreviewProps) {
  // Mock data to match the screenshot precisely
  const vehicleData = {
    make: 'Toyota',
    model: 'Tundra',
    year: '2025',
    region: 'American',
    transmission: 'Automatic',
    odometerStatus: 'Tampered',
    spareTyre: 'Available',
    keys: '1',
    type: 'Truck',
    colour: 'Grey',
    reading: '621515 Km',
    fuel: 'Petrol'
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar bg-[#E5E7EB] p-4 md:p-8 flex flex-col items-center gap-8 pb-24">
      
      {/* PAGE 1: Cover Page */}
      <div className="w-full max-w-[800px] min-h-[1131px] bg-white shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0">
        {/* Background Image Area */}
        <div className="absolute top-0 left-0 w-full h-[65%]">
          {/* We use a placeholder car image for the cover background */}
          <img 
            src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=2000" 
            alt="Cover Background" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-white"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo Area */}
          <div className="w-full flex justify-center mt-8">
            <div className="w-24 h-24 bg-[#009E49] rounded-2xl flex items-center justify-center text-white shadow-lg">
              {/* Simplified logo placeholder */}
              <div className="text-3xl font-bold italic flex items-center">
                <span className="border-4 border-white rounded-full w-14 h-14 flex items-center justify-center">
                  C
                </span>
              </div>
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
              <span className="text-lg font-bold">+971 054 409 3009</span>
            </div>
            <div className="flex flex-col gap-2 text-right">
              <div className="flex items-center justify-end gap-2 text-slate-400">
                <Mail size={16} />
                <span className="text-sm font-medium">Mail Id</span>
              </div>
              <span className="text-lg font-bold">Checkmycar.ae@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2: Vehicle Summary */}
      <div className="w-full max-w-[800px] min-h-[1131px] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-[#009E49] px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-white rounded-full inline-block"></span> CheckMyCar.ae
          </div>
          <div className="text-[#64748B] text-sm font-semibold">
            Comprehensive Green Book
          </div>
        </div>

        {/* Inspection Details */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-[#A0A4AB] text-sm font-bold mb-4">Inspection Details</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-semibold">Date</span>
              <span className="text-[15px] font-bold text-[#1E1035]">06 August 2025</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-semibold">Time</span>
              <span className="text-[15px] font-bold text-[#1E1035]">09:00 PM</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-semibold">Inspection Type</span>
              <span className="text-[15px] font-bold text-[#1E1035]">600-Points</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-semibold">VIN Number</span>
              <span className="text-[15px] font-bold text-[#1E1035]">WMWWG9C51K3E40764</span>
            </div>
          </div>
        </div>

        {/* Vehicle Summary Banner */}
        <div className="bg-[#1F2022] rounded-[24px] px-6 py-4 mb-6 shadow-sm">
          <h2 className="text-white text-lg font-semibold">Vehicle Summary</h2>
        </div>

        <h2 className="text-[22px] font-bold text-[#1E1035] mb-4">Toyota Tundra</h2>

        {/* Main Content Grid */}
        <div className="flex gap-4 mb-6">
          {/* Left Column: Image + Readings */}
          <div className="w-[55%] flex flex-col gap-4">
            <div className="bg-white rounded-3xl overflow-hidden aspect-[4/3] shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=1000" 
                alt="Toyota Tundra" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-sm grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">Odometer Reading</span>
                <span className="text-[14px] font-bold text-[#1E1035]">{vehicleData.reading}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">Tampered Reading</span>
                <span className="text-[14px] font-bold text-red-600">{vehicleData.reading}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">Fuel type</span>
                <span className="text-[14px] font-bold text-[#1E1035]">{vehicleData.fuel}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details List */}
          <div className="w-[45%] bg-white rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Make</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.make}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Model</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.model}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Model Year</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.year}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Regional Specs</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.region}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Transmission</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.transmission}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Odometer</span>
              <span className="text-red-600 text-[14px] font-bold flex-1">{vehicleData.odometerStatus}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Spare Tyre</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.spareTyre}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Number of Keys</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.keys}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">Vehicle Type</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#A0A4AB] text-[13px] font-semibold w-28">External Colour</span>
              <span className="text-[#1E1035] text-[14px] font-bold flex-1">{vehicleData.colour}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto"></div>

        {/* Report Overview Footer */}
        <div className="bg-[#1F2022] rounded-[32px] p-8 flex items-center justify-between shadow-sm mt-auto">
          <h2 className="text-white text-[28px] font-medium tracking-tight">Report Overview</h2>
          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="text-white text-sm">Pass</span>
              <span className="text-white text-lg font-bold">55%</span>
            </div>
            
            {/* CSS Pie Chart */}
            <div className="w-[140px] h-[140px] rounded-full relative" style={{
              background: 'conic-gradient(#5BC335 0% 55%, #3F8C22 55% 100%)'
            }}>
              {/* Inner cutout for donut if needed, but mockup shows pie */}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-white text-sm">Defects</span>
              <span className="text-white text-lg font-bold">45%</span>
            </div>
          </div>
        </div>

      </div>

      {/* PAGE 3: Tyres Section */}
      <div className="w-full max-w-[800px] min-h-[1131px] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-[#009E49] px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-white rounded-full inline-block"></span> CheckMyCar.ae
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
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm relative flex flex-col items-center justify-center min-h-[250px]">
          <div className="absolute top-6 left-6 text-[#A0A4AB] font-bold text-[15px]">Available</div>
          <div className="scale-90 pointer-events-none">
            {/* Reusing existing ChassisVisualizer but without interaction */}
            <ChassisVisualizer items={tyres} setItemStatus={() => {}} />
          </div>
        </div>

        {/* Tyre Cards Grid */}
        <div className="grid grid-cols-3 gap-4">
          
          {/* Card: Rear Right */}
          <div className="bg-white rounded-3xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#1E1035] text-[14px] font-bold">Rear Right (RR)</span>
              <span className="bg-[#5BC335] text-white px-2 py-0.5 rounded text-[10px] font-bold">PASS</span>
            </div>
            <span className="text-[11px] text-[#A0A4AB] font-semibold mb-1">Manufacturing year</span>
            <span className="text-[#1E1035] text-[15px] font-bold mb-4">2025</span>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-4 mt-auto">
              <img src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400" alt="Tyre RR" className="w-full h-full object-cover" />
            </div>
            <p className="text-[#1E1035] text-[12px] font-bold leading-tight">The tyre has multiple scratches</p>
          </div>

          {/* Card: Rear Left */}
          <div className="bg-white rounded-3xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#1E1035] text-[14px] font-bold">Rear Left (RL)</span>
              <span className="bg-[#5BC335] text-white px-2 py-0.5 rounded text-[10px] font-bold">PASS</span>
            </div>
            <span className="text-[11px] text-[#A0A4AB] font-semibold mb-1">Manufacturing year</span>
            <span className="text-[#1E1035] text-[15px] font-bold mb-4">2025</span>
            {/* Empty space for missing image in mockup */}
          </div>

          {/* Card: Spare Tyre */}
          <div className="bg-white rounded-3xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#1E1035] text-[14px] font-bold">Spare tyre (ST)</span>
              <span className="bg-[#5BC335] text-white px-2 py-0.5 rounded text-[10px] font-bold">PASS</span>
            </div>
            <span className="text-[11px] text-[#A0A4AB] font-semibold mb-1">Manufacturing year</span>
            <span className="text-[#1E1035] text-[15px] font-bold mb-4">2025</span>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] mt-auto">
              <img src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400" alt="Tyre ST" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Card: Front Right */}
          <div className="bg-white rounded-3xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#1E1035] text-[14px] font-bold">Front Right (FR)</span>
              <span className="bg-[#5BC335] text-white px-2 py-0.5 rounded text-[10px] font-bold">PASS</span>
            </div>
            <span className="text-[11px] text-[#A0A4AB] font-semibold mb-1">Manufacturing year</span>
            <span className="text-[#1E1035] text-[15px] font-bold mb-4">2025</span>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] mt-auto">
              <img src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400" alt="Tyre FR" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Card: Front Left */}
          <div className="bg-white rounded-3xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#1E1035] text-[14px] font-bold">Front Left (FL)</span>
              <span className="bg-[#5BC335] text-white px-2 py-0.5 rounded text-[10px] font-bold">PASS</span>
            </div>
            <span className="text-[11px] text-[#A0A4AB] font-semibold mb-1">Manufacturing year</span>
            <span className="text-[#1E1035] text-[15px] font-bold mb-4">2025</span>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] mt-auto">
              <img src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400" alt="Tyre FL" className="w-full h-full object-cover" />
            </div>
          </div>

        </div>

      </div>

      {/* PAGE 4: Rims Section */}
      <div className="w-full max-w-[800px] min-h-[1131px] bg-[#F4F5F8] shadow-xl rounded-sm flex flex-col relative overflow-hidden shrink-0 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-[#009E49] px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-white rounded-full inline-block"></span> CheckMyCar.ae
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
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm relative flex flex-col items-center justify-center min-h-[250px]">
          <div className="absolute top-6 left-6 text-[#A0A4AB] font-bold text-[15px]">Available</div>
          <div className="scale-90 pointer-events-none">
            {/* Reusing existing ChassisVisualizer but without interaction */}
            <ChassisVisualizer items={rims} setItemStatus={() => {}} />
          </div>
        </div>

        {/* Rim Cards Grid */}
        <div className="grid grid-cols-3 gap-4">
          
          {/* Card: Rear Right */}
          <div className="bg-white rounded-3xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#1E1035] text-[14px] font-bold">Rear Right (RR)</span>
              <span className="bg-[#5BC335] text-white px-2 py-0.5 rounded text-[10px] font-bold">PASS</span>
            </div>
            <span className="text-[11px] text-[#A0A4AB] font-semibold mb-1">Manufacturing year</span>
            <span className="text-[#1E1035] text-[15px] font-bold mb-4">2025</span>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-4 mt-auto">
              <img src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400" alt="Rim RR" className="w-full h-full object-cover" />
            </div>
            <p className="text-[#1E1035] text-[12px] font-bold leading-tight">The rim has multiple scratches</p>
          </div>

          {/* Card: Rear Left */}
          <div className="bg-white rounded-3xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#1E1035] text-[14px] font-bold">Rear Left (RL)</span>
              <span className="bg-[#5BC335] text-white px-2 py-0.5 rounded text-[10px] font-bold">PASS</span>
            </div>
            <span className="text-[11px] text-[#A0A4AB] font-semibold mb-1">Manufacturing year</span>
            <span className="text-[#1E1035] text-[15px] font-bold mb-4">2025</span>
            {/* Empty space for missing image in mockup */}
          </div>

          {/* Card: Spare Tyre */}
          <div className="bg-white rounded-3xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#1E1035] text-[14px] font-bold">Spare tyre (ST)</span>
              <span className="bg-[#5BC335] text-white px-2 py-0.5 rounded text-[10px] font-bold">PASS</span>
            </div>
            <span className="text-[11px] text-[#A0A4AB] font-semibold mb-1">Manufacturing year</span>
            <span className="text-[#1E1035] text-[15px] font-bold mb-4">2025</span>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] mt-auto">
              <img src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400" alt="Rim ST" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Card: Front Right */}
          <div className="bg-white rounded-3xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#1E1035] text-[14px] font-bold">Front Right (FR)</span>
              <span className="bg-[#5BC335] text-white px-2 py-0.5 rounded text-[10px] font-bold">PASS</span>
            </div>
            <span className="text-[11px] text-[#A0A4AB] font-semibold mb-1">Manufacturing year</span>
            <span className="text-[#1E1035] text-[15px] font-bold mb-4">2025</span>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] mt-auto">
              <img src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400" alt="Rim FR" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Card: Front Left */}
          <div className="bg-white rounded-3xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#1E1035] text-[14px] font-bold">Front Left (FL)</span>
              <span className="bg-[#5BC335] text-white px-2 py-0.5 rounded text-[10px] font-bold">PASS</span>
            </div>
            <span className="text-[11px] text-[#A0A4AB] font-semibold mb-1">Manufacturing year</span>
            <span className="text-[#1E1035] text-[15px] font-bold mb-4">2025</span>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] mt-auto">
              <img src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400" alt="Rim FL" className="w-full h-full object-cover" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
