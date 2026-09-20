"use client";

import React from 'react';
import { GenericDiagnosticSection } from '@/components/sections/generic-diagnostic-section';
import { ELECTRICAL_INSPECTION_ITEMS } from '@/constants/inspection-points';
import { CustomHeadlineItem } from '@/lib/inspection-types';

export interface ElectricalSectionProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  generalImages?: string[];
  onGeneralImagesChange?: (images: string[]) => void;
  items?: Record<string, { status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>;
  onItemChange?: (id: string, data: Partial<{ status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>) => void;
  customHeadlines?: CustomHeadlineItem[];
  onCustomHeadlinesChange?: (headlines: CustomHeadlineItem[]) => void;
}

export function ElectricalSection(props: ElectricalSectionProps) {
  return (
    <GenericDiagnosticSection
      id="section-electrical"
      title="Electrical"
      itemsConfig={ELECTRICAL_INSPECTION_ITEMS}
      placeholder="General comments on vehicle battery, fuses, wiring harness..."
      defaultHeadlineId="default-electrical"
      defaultHeadlineTitle="OBD-II Diagnostic Scan & Fault Codes"
      {...props}
    />
  );
}
