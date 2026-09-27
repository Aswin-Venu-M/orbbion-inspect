"use client";

import React from 'react';
import { SectionHeader } from '../ui/section-header';
import { InspectionItemCard } from '../ui/inspection-item-card';
import { GeneralCommentsCard } from '../ui/general-comments-card';
import { DynamicHeadlineGroup } from '../ui/dynamic-headline-group';
import { CustomHeadlineItem } from '@/lib/inspection-types';

export interface GenericDiagnosticSectionProps {
  id: string;
  title: string;
  itemsConfig: readonly string[];
  placeholder?: string;
  defaultHeadlineId: string;
  defaultHeadlineTitle: string;
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  generalImages?: string[];
  onGeneralImagesChange?: (images: string[]) => void;
  items?: Record<string, { status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>;
  onItemChange?: (id: string, data: Partial<{ status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>) => void;
  customHeadlines?: CustomHeadlineItem[];
  onCustomHeadlinesChange?: (headlines: CustomHeadlineItem[]) => void;
}

export function GenericDiagnosticSection({
  id,
  title,
  itemsConfig,
  placeholder,
  defaultHeadlineId,
  defaultHeadlineTitle,
  initialComments = '',
  onCommentsChange,
  generalImages = [],
  onGeneralImagesChange,
  items = {},
  onItemChange,
  customHeadlines = [],
  onCustomHeadlinesChange,
}: GenericDiagnosticSectionProps) {
  return (
    <div id={id} className="flex flex-col gap-2 w-full scroll-mt-6">
      <SectionHeader title={title} />

      <div className="flex flex-col gap-2">
        {itemsConfig.map((item, index) => {
          const itemData = items[item] || { status: 'pass', comments: '', images: [] };
          return (
            <InspectionItemCard
              key={`${item}-${index}`}
              id={`${id}-${item}`}
              title={item}
              status={itemData.status}
              initialStatus={itemData.status}
              comments={itemData.comments}
              initialComments={itemData.comments}
              imageUrls={itemData.images}
              onStatusChange={(status) => onItemChange?.(item, { status })}
              onCommentsChange={(comments) => onItemChange?.(item, { comments })}
              onImagesChange={(images) => onItemChange?.(item, { images })}
            />
          );
        })}
      </div>

      {/* General Comments Section */}
      <GeneralCommentsCard
        placeholder={placeholder || `General comments on vehicle ${title.toLowerCase()}...`}
        initialComments={initialComments}
        onCommentsChange={onCommentsChange}
        initialImages={generalImages}
        onImagesChange={onGeneralImagesChange}
      />

      {/* Dynamically added headlines including default headline */}
      <DynamicHeadlineGroup
        defaultHeadlineId={defaultHeadlineId}
        defaultHeadlineTitle={defaultHeadlineTitle}
        headlines={customHeadlines}
        onChange={onCustomHeadlinesChange}
      />
    </div>
  );
}
