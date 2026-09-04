import React from 'react';

export const AddHeadlineButton = () => {
  return (
    <button className="w-full bg-[#F2F4FF] border border-dashed border-[#8C9FFF] text-[#5368FF] rounded-[16px] py-[16px] text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#E5E9FF] transition-colors">
      Add Headline <span className="text-[18px] leading-none mb-[2px]">+</span>
    </button>
  );
};
