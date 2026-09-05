"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CarFront, 
  PieChart, 
  CircleDot, 
  Disc, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Zap, 
  ChevronRight,
  ListOrdered
} from 'lucide-react';
import { SidebarCard } from './sidebar-card';

export type SectionId = 
  | 'section-inspection-details'
  | 'section-vehicle-summary'
  | 'section-report-overview'
  | 'section-tyres'
  | 'section-rims'
  | 'section-brakes'
  | 'section-body'
  | 'section-interior-exterior'
  | 'section-electrical';

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  'section-inspection-details',
  'section-vehicle-summary',
  'section-report-overview',
  'section-tyres',
  'section-rims',
  'section-brakes',
  'section-body',
  'section-interior-exterior',
  'section-electrical',
];

export interface SectionItem {
  id: SectionId;
  num: string;
  title: string;
  subtitle: string;
  category: 'General' | 'Chassis' | 'Body' | 'Interior' | 'Diagnostics';
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badgeText?: string;
  badgeColor?: string;
}

export const INSPECTION_SECTIONS_MAP: Record<SectionId, Omit<SectionItem, 'num'>> = {
  'section-inspection-details': {
    id: 'section-inspection-details',
    title: 'Inspection Details',
    subtitle: 'Date, hub & inspection type',
    category: 'General',
    icon: Calendar,
    badgeText: 'Verified',
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
  },
  'section-vehicle-summary': {
    id: 'section-vehicle-summary',
    title: 'Vehicle Summary',
    subtitle: 'VIN, odometer, specs & paint',
    category: 'General',
    icon: CarFront,
    badgeText: 'TRD Pro',
    badgeColor: 'bg-purple-50 text-[#9723FF] border-purple-200/60',
  },
  'section-report-overview': {
    id: 'section-report-overview',
    title: 'Report Overview & Scoring',
    subtitle: 'Dynamic pass / defect ratio',
    category: 'General',
    icon: PieChart,
    badgeText: 'Calculated',
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
  },
  'section-tyres': {
    id: 'section-tyres',
    title: 'Tyres Assessment',
    subtitle: '5 wheels inspection & tread depth',
    category: 'Chassis',
    icon: CircleDot,
    badgeText: '5 Wheels',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  'section-rims': {
    id: 'section-rims',
    title: 'Rims Assessment',
    subtitle: 'Alloy condition, scratches & bends',
    category: 'Chassis',
    icon: Disc,
    badgeText: '5 Rims',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  'section-brakes': {
    id: 'section-brakes',
    title: 'Brakes Inspection',
    subtitle: 'Pad wear, rotors & calipers',
    category: 'Chassis',
    icon: ShieldCheck,
    badgeText: '5 Brakes',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  'section-body': {
    id: 'section-body',
    title: 'Body & Blueprint',
    subtitle: 'Vector damage hotspots map',
    category: 'Body',
    icon: Layers,
    badgeText: 'Hotspots',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/60',
  },
  'section-interior-exterior': {
    id: 'section-interior-exterior',
    title: 'Interior & Exterior',
    subtitle: 'Cabin, seats, trim & bodywork',
    category: 'Interior',
    icon: Sparkles,
    badgeText: 'Checked',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  'section-electrical': {
    id: 'section-electrical',
    title: 'Electrical Diagnostic',
    subtitle: '27-point scan & battery health',
    category: 'Diagnostics',
    icon: Zap,
    badgeText: '27 Points',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/60',
  },
};

export const getSectionsInOrder = (order: SectionId[]): SectionItem[] => {
  return order.map((id, index) => {
    const item = INSPECTION_SECTIONS_MAP[id];
    return {
      ...item,
      num: String(index + 1).padStart(2, '0'),
    };
  });
};

export const INSPECTION_SECTIONS: SectionItem[] = getSectionsInOrder(DEFAULT_SECTION_ORDER);

interface SectionTitlesCardProps {
  activeSectionId?: string;
  onSectionClick?: (sectionId: string) => void;
  defaultOpen?: boolean;
}

export const SectionTitlesCard: React.FC<SectionTitlesCardProps> = ({
  activeSectionId,
  onSectionClick,
  defaultOpen = true,
}) => {
  const [activeId, setActiveId] = useState<string>(activeSectionId || 'section-inspection-details');

  const scrollToSection = (id: string) => {
    setActiveId(id);
    if (onSectionClick) {
      onSectionClick(id);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Apply subtle highlight animation
      element.classList.add('ring-2', 'ring-[#9723FF]', 'ring-offset-2', 'transition-all', 'duration-300');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-[#9723FF]', 'ring-offset-2');
      }, 1500);
    }
  };

  return (
    <SidebarCard
      id="section-titles-index"
      title="Section Titles"
      description="Interactive outline and quick navigation of all report sections"
      isAccordion={true}
      defaultOpen={defaultOpen}
      icon={<ListOrdered size={16} />}
      badge={
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9723FF]/10 text-[#9723FF] border border-[#9723FF]/20">
          {INSPECTION_SECTIONS.length} Sections
        </span>
      }
    >
      <div className="flex flex-col gap-1.5 -mx-1">
        {INSPECTION_SECTIONS.map((sec) => {
          const IconComp = sec.icon;
          const isActive = activeId === sec.id;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              className={`w-full group text-left flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#9723FF]/10 text-[#1E1035] border border-[#9723FF]/25 shadow-xs'
                  : 'hover:bg-slate-50 text-slate-700 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className={`text-[10px] font-bold tracking-tight px-1.5 py-0.5 rounded-md shrink-0 transition-colors ${
                  isActive ? 'bg-[#9723FF] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  {sec.num}
                </span>

                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-[#9723FF] group-hover:bg-[#9723FF]/10 transition-colors shrink-0">
                  <IconComp size={13} />
                </div>

                <div className="min-w-0 flex flex-col">
                  <span className={`text-[12px] font-bold tracking-tight truncate leading-tight transition-colors ${
                    isActive ? 'text-[#9723FF]' : 'text-[#1E1035] group-hover:text-[#9723FF]'
                  }`}>
                    {sec.title}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate leading-tight">
                    {sec.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {sec.badgeText && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md border ${sec.badgeColor}`}>
                    {sec.badgeText}
                  </span>
                )}
                <ChevronRight 
                  size={14} 
                  className={`text-slate-300 group-hover:text-[#9723FF] group-hover:translate-x-0.5 transition-all ${
                    isActive ? 'text-[#9723FF]' : ''
                  }`} 
                />
              </div>
            </button>
          );
        })}
      </div>
    </SidebarCard>
  );
};
