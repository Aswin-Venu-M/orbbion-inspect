"use client";

import React from 'react';
import { HeadingCard } from './heading-card';
import { AddHeadlineButton } from './add-headline-button';
import { CustomHeadlineItem } from '@/lib/inspection-types';
import { generateSafeId } from '@/lib/media-targets';

export interface DynamicHeadlineGroupProps {
  defaultHeadlineId: string;
  defaultHeadlineTitle: string;
  headlines?: CustomHeadlineItem[];
  onChange?: (headlines: CustomHeadlineItem[]) => void;
  maxImages?: number;
}

export const DynamicHeadlineGroup: React.FC<DynamicHeadlineGroupProps> = ({
  defaultHeadlineId,
  defaultHeadlineTitle,
  headlines = [],
  onChange,
  maxImages,
}) => {
  const fallbackHeadlines = React.useMemo<CustomHeadlineItem[]>(() => [
    { id: defaultHeadlineId, title: defaultHeadlineTitle, comments: '', imageUrl: undefined, images: [] }
  ], [defaultHeadlineId, defaultHeadlineTitle]);

  const activeHeadlines: CustomHeadlineItem[] = headlines.length > 0 ? headlines : fallbackHeadlines;

  const handleAdd = () => {
    if (!onChange) return;
    const newId = generateSafeId();
    onChange([...activeHeadlines, { id: newId, title: '', comments: '', images: [] }]);
  };

  const handleRemove = (id: string) => {
    if (!onChange || id === defaultHeadlineId) return;
    onChange(activeHeadlines.filter(h => h.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<CustomHeadlineItem>) => {
    if (!onChange) return;
    onChange(
      activeHeadlines.map(h => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {activeHeadlines.map((h) => (
        <HeadingCard
          key={h.id}
          initialTitle={h.title}
          initialComments={h.comments}
          initialImageUrl={h.imageUrl}
          initialImages={h.images || (h.imageUrl ? [h.imageUrl] : [])}
          isRemovable={h.id !== defaultHeadlineId}
          onRemove={() => handleRemove(h.id)}
          onChangeTitle={(title) => handleUpdate(h.id, { title })}
          onChangeComments={(comments) => handleUpdate(h.id, { comments })}
          onChangeImage={(imageUrl) => handleUpdate(h.id, { imageUrl: imageUrl || undefined })}
          onChangeImages={(images) => handleUpdate(h.id, { images, imageUrl: images[0] || undefined })}
          maxImages={maxImages}
        />
      ))}

      <AddHeadlineButton onClick={handleAdd} />
    </div>
  );
};
