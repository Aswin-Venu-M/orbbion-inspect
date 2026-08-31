import React from 'react';

export const SectionHeader = ({ title }: { title: string }) => (
  <div className="bg-[#1E1035] rounded-[16px] px-5 py-3 mb-2">
    <h2 className="text-white font-medium text-[14px]">{title}</h2>
  </div>
);
