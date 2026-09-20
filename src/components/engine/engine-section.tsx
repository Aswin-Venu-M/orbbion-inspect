"use client";

import React from 'react';
import { GenericDiagnosticSection } from '@/components/sections/generic-diagnostic-section';
import { ENGINE_INSPECTION_ITEMS } from '@/constants/inspection-points';
import { CustomHeadlineItem } from '@/lib/inspection-types';

export interface EngineSectionProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  generalImages?: string[];
  onGeneralImagesChange?: (images: string[]) => void;
  items?: Record<string, { status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>;
  onItemChange?: (id: string, data: Partial<{ status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>) => void;
  customHeadlines?: CustomHeadlineItem[];
  onCustomHeadlinesChange?: (headlines: CustomHeadlineItem[]) => void;
}

export function EngineSection(props: EngineSectionProps) {
  return (
    <GenericDiagnosticSection
      id="section-engine"
      title="Engine"
      itemsConfig={ENGINE_INSPECTION_ITEMS}
      placeholder="General comments on engine oil condition, leaks, belts, engine noise..."
      defaultHeadlineId="default-engine"
      defaultHeadlineTitle="Engine Compression & Fluid Diagnostics"
      {...props}
    />
  );
}
