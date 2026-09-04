import React from 'react';

export const StatusBadge = ({ label, type }: { label: string, type: 'repaired' | 'damaged' | 'checked' }) => {
  const colors = {
    repaired: 'bg-[#5368FF] text-white',
    damaged: 'bg-[#FF6363] text-white',
    checked: 'bg-black text-white'
  };
  return (
    <div className={`px-5 py-2 rounded-full text-[11px] font-bold tracking-wider uppercase ${colors[type]}`}>
      {label}
    </div>
  );
};
