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
  Gauge,
  Cog 
} from 'lucide-react';
import React from 'react';

export type SectionId = 
  | 'section-inspection-details'
  | 'section-vehicle-summary'
  | 'section-report-overview'
  | 'section-tyres'
  | 'section-rims'
  | 'section-brakes'
  | 'section-chassis-subframe'
  | 'section-interior-exterior'
  | 'section-electrical'
  | 'section-body'
  | 'section-engine'
  | 'section-transmission'
  | 'section-general-photos'
  | 'section-client-details'
  | 'section-team-details';

export interface SectionItem {
  id: SectionId;
  num: string;
  title: string;
  subtitle: string;
  category: 'General' | 'Chassis' | 'Body' | 'Interior' | 'Diagnostics' | 'Engine' | 'Transmission' | 'Client' | 'Team';
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
  'section-chassis-subframe',
  'section-interior-exterior',
  'section-electrical',
  'section-body',
  'section-engine',
  'section-transmission',
  'section-general-photos',
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
  'section-chassis-subframe': {
    id: 'section-chassis-subframe',
    title: 'Chassis & Subframe',
    subtitle: 'Structural integrity & blueprint',
    category: 'Chassis',
    icon: Layers,
    badgeText: '20 Points',
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
  'section-engine': {
    id: 'section-engine',
    title: 'Engine Inspection',
    subtitle: '15-point powertrain & fluids check',
    category: 'Engine',
    icon: Gauge,
    badgeText: '15 Points',
    badgeColor: 'bg-orange-50 text-orange-600 border-orange-200/60',
  },
  'section-transmission': {
    id: 'section-transmission',
    title: 'Transmission',
    subtitle: '6-point gearbox & differential check',
    category: 'Transmission',
    icon: Cog,
    badgeText: '6 Points',
    badgeColor: 'bg-blue-50 text-blue-600 border-blue-200/60',
  },
  'section-general-photos': {
    id: 'section-general-photos',
    title: 'General Photos',
    subtitle: 'Exterior, Interior & Engine Bay',
    category: 'General',
    icon: Sparkles,
    badgeText: 'Required',
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
  },
  'section-client-details': {
    id: 'section-client-details',
    title: 'Client Details',
    subtitle: 'Client contact information & location',
    category: 'Client',
    icon: Calendar,
    badgeText: 'Client',
    badgeColor: 'bg-purple-50 text-[#9723FF] border-purple-200/60',
  },
  'section-team-details': {
    id: 'section-team-details',
    title: 'Team Details',
    subtitle: 'Details related to our inspection team',
    category: 'Team',
    icon: Calendar,
    badgeText: 'Assigned',
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
  },
};

export const SEARCHABLE_SECTIONS: Array<{ title: string; id: SectionId; category: SectionItem['category'] }> = [
  { title: 'Inspection Details', id: 'section-inspection-details', category: 'General' },
  { title: 'Vehicle Summary', id: 'section-vehicle-summary', category: 'General' },
  { title: 'Report Overview', id: 'section-report-overview', category: 'General' },
  { title: 'Tyres Inspection', id: 'section-tyres', category: 'Chassis' },
  { title: 'Rims Inspection', id: 'section-rims', category: 'Chassis' },
  { title: 'Brakes Inspection', id: 'section-brakes', category: 'Chassis' },
  { title: 'Chassis & Subframe', id: 'section-chassis-subframe', category: 'Chassis' },
  { title: 'Interior & Exterior', id: 'section-interior-exterior', category: 'Interior' },
  { title: 'Electrical Components (27 items)', id: 'section-electrical', category: 'Diagnostics' },
  { title: 'Body & Chassis Blueprint', id: 'section-body', category: 'Body' },
  { title: 'Engine Inspection (15 items)', id: 'section-engine', category: 'Engine' },
  { title: 'Transmission Inspection (6 items)', id: 'section-transmission', category: 'Transmission' },
  { title: 'General Photos', id: 'section-general-photos', category: 'General' },
  { title: 'Client & Team Contacts', id: 'section-client-details', category: 'Client' },
];

export const getSectionsInOrder = (order: SectionId[]): SectionItem[] => {
  return order
    .map((id, index) => {
      const sec = INSPECTION_SECTIONS_MAP[id];
      if (!sec) return null;
      const num = String(index + 1).padStart(2, '0');
      return {
        ...sec,
        num,
      };
    })
    .filter((sec): sec is SectionItem => sec !== null);
};

export const INSPECTION_SECTIONS: SectionItem[] = getSectionsInOrder(DEFAULT_SECTION_ORDER);
