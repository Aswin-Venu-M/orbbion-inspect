import { 
  Calendar, 
  CarFront, 
  PieChart, 
  CircleDot, 
  Disc, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Zap 
} from 'lucide-react';
import React from 'react';

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
    badgeColor: 'bg-amber-50 text-amber-600 border-amber-200/60',
  },
  'section-interior-exterior': {
    id: 'section-interior-exterior',
    title: 'Interior & Exterior',
    subtitle: 'Cabin, seats, trim & bodywork',
    category: 'Interior',
    icon: Sparkles,
    badgeText: 'Checked',
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
  },
  'section-electrical': {
    id: 'section-electrical',
    title: 'Electrical Diagnostic',
    subtitle: '27-point scan & battery health',
    category: 'Diagnostics',
    icon: Zap,
    badgeText: '27 Points',
    badgeColor: 'bg-purple-50 text-[#9723FF] border-purple-200/60',
  },
};

export const SEARCHABLE_SECTIONS = [
  { title: 'Inspection Details', id: 'section-inspection-details', category: 'General' },
  { title: 'Vehicle Summary', id: 'section-vehicle-summary', category: 'General' },
  { title: 'Report Overview', id: 'section-report-overview', category: 'General' },
  { title: 'Tyres Inspection', id: 'section-tyres', category: 'Chassis' },
  { title: 'Rims Inspection', id: 'section-rims', category: 'Chassis' },
  { title: 'Brakes Inspection', id: 'section-brakes', category: 'Chassis' },
  { title: 'Body & Chassis Blueprint', id: 'section-body', category: 'Body' },
  { title: 'Interior & Exterior', id: 'section-interior-exterior', category: 'Interior' },
  { title: 'Electrical Components (27 items)', id: 'section-electrical', category: 'Diagnostics' },
  { title: 'Client & Team Contacts', id: 'section-client-details', category: 'Client' },
];

export const getSectionsInOrder = (order: SectionId[]): SectionItem[] => {
  return order.map((id, index) => {
    const sec = INSPECTION_SECTIONS_MAP[id];
    const num = String(index + 1).padStart(2, '0');
    return {
      ...sec,
      num,
    };
  });
};

export const INSPECTION_SECTIONS: SectionItem[] = getSectionsInOrder(DEFAULT_SECTION_ORDER);
