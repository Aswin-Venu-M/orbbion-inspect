import React from 'react';
import { ImageUploadBox } from './image-upload-box';

interface InspectionItemCardProps {
  title: string;
  hasMultipleImages?: boolean;
  showToggle?: boolean;
}

export const InspectionItemCard: React.FC<InspectionItemCardProps> = ({ title, hasMultipleImages = false, showToggle = true }) => {
  return (
    <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-5">
          <h3 className="text-[16px] font-bold text-[#1E1035]">{title}</h3>
          {showToggle && (
            <div className="flex bg-[#F4F5F8] p-[3px] rounded-full border border-[#E2E4EB] self-start sm:self-auto">
              <button className="px-6 py-1 rounded-full text-[11px] tracking-wide font-bold bg-[#71D64B] text-white shadow-sm">PASS</button>
              <button className="px-6 py-1 rounded-full text-[11px] tracking-wide font-bold text-[#74768B] hover:text-[#1E1035] transition-colors">FAIL</button>
              <button className="px-6 py-1 rounded-full text-[11px] tracking-wide font-bold text-[#74768B] hover:text-[#1E1035] transition-colors">WEAK</button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-[#1E1035]">Comments</label>
          <input 
            type="text" 
            placeholder="Enter comments" 
            className="w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-1 focus:ring-[#1E1035]/20 transition-all" 
          />
        </div>

        {hasMultipleImages ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <ImageUploadBox status="uploading" progress={56} url="/assets/car-tw.png" />
            <ImageUploadBox status="uploading" progress={56} url="/assets/car-tw.png" />
            <ImageUploadBox status="completed" url="/assets/car-tw.png" />
            <ImageUploadBox status="empty" />
          </div>
        ) : (
          <div className="w-full sm:w-[220px] mt-1">
            <ImageUploadBox status="empty" />
          </div>
        )}
      </div>
    </section>
  );
};
