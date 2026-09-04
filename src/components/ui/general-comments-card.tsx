import React from 'react';
import { ImageUploadBox } from './image-upload-box';

export const GeneralCommentsCard = () => {
  return (
    <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-[#1E1035]">Comments</label>
          <input 
            type="text" 
            placeholder="Enter comments" 
            className="w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-1 focus:ring-[#1E1035]/20 transition-all" 
          />
        </div>

        <div className="w-full sm:w-[220px] mt-1">
          <ImageUploadBox status="empty" />
        </div>
      </div>
    </section>
  );
};
