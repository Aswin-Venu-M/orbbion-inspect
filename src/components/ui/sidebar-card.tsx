import React from 'react';

interface SidebarCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const SidebarCard: React.FC<SidebarCardProps> = ({ title, description, children }) => (
  <div className="bg-white rounded-[32px] shadow-sm p-5 border border-slate-100 flex flex-col shrink-0">
    <h3 className="text-[15px] font-bold text-[#1E1035] mb-1 tracking-tight">{title}</h3>
    <p className="text-slate-400 text-[10px] mb-4 leading-relaxed">{description}</p>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);
