"use client";

import React from 'react';
import { GenericDiagnosticSection } from '@/components/sections/generic-diagnostic-section';
import { TRANSMISSION_INSPECTION_ITEMS } from '@/constants/inspection-points';
import { CustomHeadlineItem } from '@/lib/inspection-types';

export interface TransmissionSectionProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  generalImages?: string[];
  onGeneralImagesChange?: (images: string[]) => void;
  items?: Record<string, { status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>;
  onItemChange?: (id: string, data: Partial<{ status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>) => void;
  customHeadlines?: CustomHeadlineItem[];
  onCustomHeadlinesChange?: (headlines: CustomHeadlineItem[]) => void;
}

export function TransmissionSection(props: TransmissionSectionProps) {
  return (
    <GenericDiagnosticSection
      id="section-transmission"
      title="Transmission"
      itemsConfig={TRANSMISSION_INSPECTION_ITEMS}
      placeholder="General comments on gearbox shifting, clutch engaging, fluid leaks..."
      defaultHeadlineId="default-transmission"
      defaultHeadlineTitle="Transmission & Drivetrain Diagnostics"
      {...props}
    />
  );
}
