page_tsx = """import React from 'react';
import {
  Calendar, Clock, ChevronDown, User, MapPin, RotateCcw, RotateCw, 
  Printer, Download, Eye, Pencil, FileText, Plus, HelpCircle, Home, 
  Image as ImageIcon, Cloud, Search, Check, FileCheck, Map, Info,
  AtSign
} from 'lucide-react';

const InputField = ({ label, required, placeholder, icon, rightIcon, rightText, type = "text", value, defaultValue, className }: any) => (
  <div className={`flex flex-col gap-1.5 ${className || ""}`}>
    <label className="text-xs font-semibold text-[#1E1035]">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative flex items-center">
      {icon && (
        <div className="absolute left-3.5 text-slate-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder}
        className={`w-full bg-[#F4F5F8] text-sm text-[#190933] placeholder-slate-400 rounded-[14px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all ${
          icon ? "pl-11" : ""
        } ${rightIcon || rightText ? "pr-12" : ""}`}
      />
      {rightIcon && (
        <div className="absolute right-3.5 text-slate-400">
          {rightIcon}
        </div>
      )}
      {rightText && (
        <div className="absolute right-4 text-xs font-semibold text-[#190933]">
          {rightText}
        </div>
      )}
    </div>
  </div>
);

const SelectField = ({ label, required, placeholder, icon }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-[#1E1035]">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative flex items-center">
      {icon && (
        <div className="absolute left-3.5 text-slate-400">
          {icon}
        </div>
      )}
      <select
        className={`w-full bg-[#F4F5F8] text-sm text-slate-400 rounded-[14px] px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all ${
          icon ? "pl-11" : ""
        }`}
        defaultValue=""
      >
        <option value="" disabled>{placeholder}</option>
      </select>
      <div className="absolute right-3.5 text-[#190933] pointer-events-none">
        <ChevronDown size={16} strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="bg-[#1E1035] rounded-[16px] px-6 py-3.5 mb-2">
    <h2 className="text-white font-medium text-[14px]">{title}</h2>
  </div>
);

export default function HomeDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] bg-dot-pattern flex p-5 gap-6 overflow-hidden font-sans">
      
      {/* 1. Icon Rail (Floating) */}
      <nav className="w-16 flex flex-col items-center py-2 gap-8 z-10 shrink-0">
        <button className="w-12 h-12 bg-[#008751] rounded-2xl flex items-center justify-center text-white shadow-sm hover:bg-[#007043] transition-colors">
          <Search size={22} />
        </button>
        <button className="flex flex-col items-center gap-1.5 group">
          <div className="w-12 h-12 bg-[#E9EAF2] rounded-2xl flex items-center justify-center text-[#74768B] group-hover:bg-[#d6d8eb] transition-colors">
            <Home size={22} />
          </div>
          <span className="text-[11px] font-medium text-[#1E1035]">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1.5">
          <div className="w-12 h-12 bg-[#1E1035] rounded-full flex items-center justify-center text-white shadow-md">
            <ImageIcon size={22} />
          </div>
          <span className="text-[11px] font-medium text-[#1E1035]">Gallery</span>
        </button>
        <button className="mt-auto flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 bg-[#A0A4AB] rounded-full flex items-center justify-center text-white hover:bg-[#74768B] transition-colors">
            <HelpCircle size={22} />
          </div>
        </button>
      </nav>

      {/* 2. Media Drawer (Floating Card) */}
      <aside className="w-[310px] bg-white rounded-[32px] shadow-sm flex flex-col p-6 z-10 border border-slate-100 shrink-0 h-[calc(100vh-40px)]">
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Placeholder Graphic for Empty State */}
          <div className="relative w-full aspect-square flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white z-10 pointer-events-none"></div>
            <div className="w-48 h-48 bg-[#F4F5F8] rounded-[32px] shadow-inner border border-white flex flex-col p-4 relative z-0">
               <div className="w-full h-1/2 bg-white rounded-2xl mb-2 flex items-center justify-center text-orange-200 shadow-sm">
                 <ImageIcon size={40} />
               </div>
               <div className="flex gap-2 h-1/3">
                 <div className="flex-1 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-200"><ImageIcon size={24} /></div>
                 <div className="flex-1 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-200"><ImageIcon size={24} /></div>
               </div>
               <div className="mt-auto flex justify-center gap-1 opacity-50">
                 <div className="w-2 h-1 bg-slate-300 rounded-full"></div><div className="w-4 h-1 bg-slate-300 rounded-full"></div><div className="w-2 h-1 bg-slate-300 rounded-full"></div>
               </div>
            </div>
          </div>
          
          <div className="text-center z-20">
            <h2 className="text-[#1E1035] text-[26px] font-bold mb-2 font-serif tracking-tight">It's empty in here.</h2>
            <p className="text-[#A0A4AB] text-[13px] leading-relaxed mb-8 px-4">
              Add some media to bring this album to life.
            </p>
            <button className="bg-[#1E1035] text-white px-7 py-3.5 rounded-2xl flex items-center gap-2 text-sm font-semibold hover:bg-[#281446] transition-colors shadow-sm mx-auto">
              Add Media <Plus size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Main Content Canvas */}
      <main className="flex-1 flex flex-col h-[calc(100vh-40px)] z-10 overflow-hidden min-w-[600px]">
        
        {/* Header Bar */}
        <header className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 mb-6 shrink-0">
          
          {/* Header Left */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-[#1E1035] font-serif tracking-tight">Report 440</h1>
              <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center cursor-help">
                <Info size={12} strokeWidth={3} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Cloud size={12} className="text-[#1E1035]/60" />
              Saved just now
            </div>
          </div>

          {/* Header Center Toolbar */}
          <div className="flex items-center gap-6">
            <div className="bg-slate-50 p-1 flex items-center gap-1 border border-slate-200/80 rounded-[20px]">
              <button className="bg-[#1E1035] text-white p-2.5 rounded-[14px] shadow-sm flex items-center justify-center">
                <Pencil size={18} />
              </button>
              <button className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2.5 rounded-[14px] transition-colors flex items-center justify-center">
                <Eye size={18} />
              </div>
            </div>
            
            <div className="h-6 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-2">
              <button className="bg-white border border-slate-200 text-slate-400 hover:text-slate-700 p-2.5 rounded-[14px] transition-colors flex items-center justify-center shadow-sm">
                <RotateCcw size={18} />
              </button>
              <button className="bg-white border border-slate-200 text-slate-400 hover:text-slate-700 p-2.5 rounded-[14px] transition-colors flex items-center justify-center shadow-sm">
                <RotateCw size={18} />
              </button>
            </div>
            
            <div className="h-6 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-2">
              <button className="bg-white border border-slate-200 text-slate-400 hover:text-slate-700 p-2.5 rounded-[14px] transition-colors flex items-center justify-center shadow-sm">
                <Printer size={18} />
              </button>
              <button className="bg-white border border-slate-200 text-slate-400 hover:text-slate-700 p-2.5 rounded-[14px] transition-colors flex items-center justify-center shadow-sm">
                <Download size={18} />
              </button>
            </div>
          </div>

          {/* Header Right */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=1E1035" alt="User" className="w-full h-full object-cover" />
            </div>
            <button className="bg-slate-50 text-slate-700 border border-slate-200 px-6 py-2.5 rounded-[14px] text-[13px] font-semibold hover:bg-slate-100 transition-colors shadow-sm">
              Cancel Report
            </button>
            <button className="bg-[#1E1035] text-white px-6 py-2.5 rounded-[14px] flex items-center gap-2 text-[13px] font-semibold shadow-sm hover:bg-[#281446] transition-colors">
              Publish <FileText size={14} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 pb-10 space-y-7">
          
          {/* Inspection Details Section */}
          <section>
            <SectionHeader title="Inspection Details" />
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
              <div className="grid grid-cols-4 gap-4">
                <InputField label="Date" required rightIcon={<Calendar size={18} />} placeholder="DD-MM-YYYY" />
                <InputField label="Time" required rightIcon={<Clock size={18} />} placeholder="HH-MM" />
                <SelectField label="Inspection Type" required placeholder="Select Inspection" />
                <InputField label="VIN Number" required placeholder="Enter VIN Number" />
              </div>
            </div>
          </section>

          {/* Vehicle Summary Section */}
          <section>
            <SectionHeader title="Vehicle Summary" />
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
              <div className="grid grid-cols-3 gap-x-5 gap-y-6">
                <InputField label="Make" placeholder="Enter Make" />
                <InputField label="Model" placeholder="Enter Model" />
                <InputField label="Model Year" placeholder="YYYY" rightIcon={<Calendar size={18} />} />
                
                <InputField label="Regional Specs" placeholder="Enter Region" rightIcon={<MapPin size={18} />} />
                <InputField label="Transmission" placeholder="Enter Transmission" />
                <InputField label="Engine Size" placeholder="Enter Engine Size" />
                
                <SelectField label="Odometer" placeholder="Select Odometer" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1E1035]">Spare Type</label>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 bg-[#F4E8FF] border border-[#D9A8FF] text-[#9723FF] text-sm font-semibold py-3 rounded-[14px] shadow-sm">
                      Available
                    </button>
                    <button className="flex-1 bg-[#F4F5F8] text-[#A0A4AB] text-sm font-semibold py-3 rounded-[14px]">
                      Not Available
                    </button>
                  </div>
                </div>
                <InputField label="Number of Keys" placeholder="Enter Number" rightIcon={
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <ChevronDown size={14} className="rotate-180 -mb-1" strokeWidth={3} />
                    <ChevronDown size={14} className="-mt-1" strokeWidth={3} />
                  </div>
                } />

                <InputField label="Vehicle Type" placeholder="Enter Vehicle Type" />
                <InputField label="External Colour" placeholder="Enter External Colour" />
                <InputField label="Fuel Type" placeholder="Enter Fuel Type" />
                
                <InputField label="Odometer Reading" placeholder="Enter Reading" rightText="KM / Miles" />
                <InputField label="Tampered Odometer Reading" placeholder="Enter Reading" rightText="KM / Miles" />
              </div>
            </div>
          </section>

          {/* Report Overview Section */}
          <section>
            <SectionHeader title="Report Overview" />
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="w-1/3 flex flex-col gap-5">
                <InputField label="Pass" placeholder="Enter Pass Value" rightText="% / Miles" />
                <InputField label="Fail" placeholder="Enter Fail Value" rightText="% / Miles" />
              </div>
              <div className="w-1/3 flex justify-center">
                {/* Simple CSS pie chart for the overview */}
                <div className="w-[120px] h-[120px] rounded-full shadow-sm" style={{
                  background: 'conic-gradient(#5BC335 0% 50%, #1A7011 50% 100%)'
                }}></div>
              </div>
              <div className="w-1/3"></div>
            </div>
          </section>
          
          {/* Tyres Section */}
          <section>
             <SectionHeader title="Tyres" />
             <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 h-24 flex items-center justify-center">
                <span className="text-slate-400 text-sm font-medium">Tyre Data Section</span>
             </div>
          </section>
          
        </div>
      </main>

      {/* 4. Right Sidebar (Floating Card) */}
      <aside className="w-[320px] bg-white rounded-[32px] shadow-sm p-6 z-10 border border-slate-100 flex flex-col h-[calc(100vh-40px)] overflow-y-auto custom-scrollbar shrink-0">
        <div className="flex flex-col gap-6 flex-1">
          {/* Add Client Details */}
          <div>
            <h3 className="text-[15px] font-bold text-[#1E1035] mb-1 tracking-tight">Add Client Details</h3>
            <p className="text-slate-400 text-[10px] mb-5 leading-relaxed">Client's contact information to associate them with this report</p>
            
            <div className="space-y-4">
              <InputField label="Client Name" placeholder="Enter Client Name" icon={<User size={16} />} />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1E1035]">WhatsApp Number</label>
                <div className="flex items-center gap-2">
                  <div className="w-[100px] bg-[#F4F5F8] rounded-[14px] flex items-center justify-center gap-1.5 px-3 py-3 text-[13px] font-medium text-slate-500 shadow-sm border border-slate-100">
                    <span className="w-4 h-4 bg-slate-300 rounded-full flex items-center justify-center text-white"><Cloud size={10}/></span>
                    +971 <ChevronDown size={14} strokeWidth={3} />
                  </div>
                  <input type="text" placeholder="XXX-XXX-XXX" className="flex-1 min-w-0 bg-[#F4F5F8] text-[13px] text-[#190933] placeholder-slate-400 rounded-[14px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20" />
                </div>
              </div>
              
              <InputField label="Email Address" placeholder="Enter Email" icon={<AtSign size={16} />} />
              <InputField label="Vehicle Details" placeholder="Vehicle Details" icon={<FileCheck size={16} />} />
              <SelectField label="Location" placeholder="Select Location" icon={<MapPin size={16} />} />
            </div>
          </div>
          
          <div className="w-full h-px border-t border-dashed border-slate-200 my-1"></div>
          
          {/* Our Team */}
          <div>
            <h3 className="text-[15px] font-bold text-[#1E1035] mb-1 tracking-tight">Our Team</h3>
            <p className="text-slate-400 text-[10px] mb-5 leading-relaxed">Details related to our team to the report</p>
            
            <div className="space-y-4">
              <SelectField label="Inspector" placeholder="Select Inspector" icon={<User size={16} />} />
            </div>
          </div>
        </div>
        
        {/* Footer / Support Link */}
        <div className="mt-auto flex items-end justify-between pt-8">
           <div className="flex flex-col">
             <span className="text-[11px] font-bold text-[#1E1035]">Support@orbbion.com</span>
             <span className="text-[10px] font-medium text-slate-400">v.2.0</span>
           </div>
           <div className="w-8 h-8 bg-[#1E1035] rounded-xl flex items-center justify-center shadow-sm">
             <span className="text-white font-serif italic text-sm font-bold">O</span>
           </div>
        </div>
      </aside>

    </div>
  );
}
"""

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page_tsx)
