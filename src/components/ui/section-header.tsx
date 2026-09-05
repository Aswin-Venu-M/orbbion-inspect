import React from 'react';

export const SectionHeader = ({ title }: { title: string }) => (
  <div className="w-full bg-[#1E1035] rounded-[16px] px-6 py-3.5 flex items-center shadow-xs">
    <h2 className="text-white font-bold text-[14.5px] tracking-wide leading-none">{title}</h2>
  </div>
);
