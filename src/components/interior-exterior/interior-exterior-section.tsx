"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { StatusBadge } from '@/components/ui/status-badge';
import { ImageUploadBox } from '@/components/ui/image-upload-box';
import { ImageLightboxModal } from '@/components/ui/image-lightbox-modal';
import { GeneralCommentsCard } from '@/components/ui/general-comments-card';
import { HeadingCard } from '@/components/ui/heading-card';
import { AddHeadlineButton } from '@/components/ui/add-headline-button';
import { Trash2, AlertCircle, X } from 'lucide-react';
import { INTERIOR_EXTERIOR_POINTS } from '@/constants/inspection-points';
import { CustomHeadlineItem } from '@/lib/inspection-types';
import { validateImageFiles, revokeBlobUrl, DEFAULT_MAX_IMAGES } from '@/lib/image-upload-utils';
import { useMediaConnection } from '@/lib/media-connection-context';

interface InteriorExteriorSectionProps {
  seatsComments?: string;
  onSeatsCommentsChange?: (comments: string) => void;
  seatsStatus?: 'pass' | 'fail' | 'weak' | 'na';
  onSeatsStatusChange?: (status: 'pass' | 'fail' | 'weak' | 'na') => void;
  seatsImages?: { id: string; url: string }[];
  onSeatsImagesChange?: (images: { id: string; url: string }[]) => void;
  generalComments?: string;
  onGeneralCommentsChange?: (comments: string) => void;
  generalImages?: string[];
  onGeneralImagesChange?: (images: string[]) => void;
  customHeadlines?: CustomHeadlineItem[];
  onCustomHeadlinesChange?: (headlines: CustomHeadlineItem[]) => void;
  maxImages?: number;
}

export const InteriorExteriorSection: React.FC<InteriorExteriorSectionProps> = ({
  seatsComments = '',
  onSeatsCommentsChange,
  seatsStatus = 'pass',
  onSeatsStatusChange,
  seatsImages = [],
  onSeatsImagesChange,
  generalComments = '',
  onGeneralCommentsChange,
  generalImages = [],
  onGeneralImagesChange,
  customHeadlines = [],
  onCustomHeadlinesChange,
  maxImages = DEFAULT_MAX_IMAGES,
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      seatsImages.forEach((img) => revokeBlobUrl(img.url));
    };
  }, [seatsImages]);

  const chunk1 = INTERIOR_EXTERIOR_POINTS.chunk1;
  const chunk2 = INTERIOR_EXTERIOR_POINTS.chunk2;
  const chunk3 = INTERIOR_EXTERIOR_POINTS.chunk3;

  const defaultHeadlines = customHeadlines.length > 0 ? customHeadlines : [
    { id: 'default-interior', title: 'Dashboard & Infotainment Screen Trim', comments: '', imageUrl: undefined }
  ];

  const handleSeatsCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (onSeatsCommentsChange) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSeatsCommentsChange(val);
      }, 400);
    }
  };

  let mediaContext: ReturnType<typeof useMediaConnection> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    mediaContext = useMediaConnection();
  } catch {
    // ignore
  }

  const addFiles = (files: FileList | File[]) => {
    const { validFiles, errors } = validateImageFiles(files, {
      currentCount: seatsImages.length,
      maxImages,
    });

    if (errors.length > 0) {
      setUploadError(errors.join(' '));
    } else {
      setUploadError(null);
    }

    if (validFiles.length > 0 && onSeatsImagesChange) {
      const newImages = validFiles.map(f => {
        const url = URL.createObjectURL(f);
        mediaContext?.addDirectUpload(f, f.name);
        return {
          id: crypto.randomUUID(),
          url,
        };
      });
      onSeatsImagesChange([...seatsImages, ...newImages]);
    }
  };

  const handleAddMediaUrl = (url: string) => {
    if (!onSeatsImagesChange) return;
    if (seatsImages.some(i => i.url === url)) {
      setUploadError('This photo is already attached to this section');
      return;
    }
    if (seatsImages.length >= maxImages) {
      setUploadError(`Maximum photo limit (${maxImages}) reached for this section`);
      return;
    }
    onSeatsImagesChange([...seatsImages, { id: crypto.randomUUID(), url }]);
    setUploadError(null);
  };

  const handleGallerySelect = () => {
    if (mediaContext) {
      mediaContext.openGalleryPicker({
        title: 'Add Photos to Seats & Trim',
        multiple: true,
        onSelect: (selectedUrls) => {
          if (!onSeatsImagesChange) return;
          const toAdd = selectedUrls.filter(u => !seatsImages.some(i => i.url === u));
          const availableSlots = maxImages - seatsImages.length;
          const finalAdd = toAdd.slice(0, availableSlots).map(u => ({
            id: crypto.randomUUID(),
            url: u,
          }));
          if (finalAdd.length > 0) {
            onSeatsImagesChange([...seatsImages, ...finalAdd]);
          }
        },
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // 1. Check for Media Bar dragged item
    const mediaJson = e.dataTransfer.getData('application/x-orbbion-media');
    if (mediaJson) {
      try {
        const parsed = JSON.parse(mediaJson);
        if (parsed.url) {
          handleAddMediaUrl(parsed.url);
          return;
        }
      } catch {
        // ignore
      }
    }

    const textUrl = e.dataTransfer.getData('text/plain');
    if (textUrl && (textUrl.startsWith('blob:') || textUrl.startsWith('http'))) {
      handleAddMediaUrl(textUrl);
      return;
    }

    // 2. Fallback to OS files
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const removeSeatsImage = (idToRemove: string) => {
    const imgToRemove = seatsImages.find(i => i.id === idToRemove);
    if (imgToRemove) {
      revokeBlobUrl(imgToRemove.url);
    }
    onSeatsImagesChange?.(seatsImages.filter(i => i.id !== idToRemove));
    setUploadError(null);
  };

  const addHeadline = () => {
    onCustomHeadlinesChange?.([...defaultHeadlines, { id: crypto.randomUUID(), title: '', comments: '' }]);
  };

  const removeHeadline = (id: string) => {
    onCustomHeadlinesChange?.(defaultHeadlines.filter(h => h.id !== id));
  };

  const updateHeadline = (id: string, updates: Partial<CustomHeadlineItem>) => {
    onCustomHeadlinesChange?.(defaultHeadlines.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  return (
    <div id="section-interior-exterior" className="flex flex-col gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        multiple
        className="hidden"
      />
      
      <ReusableSection title="Interior & Exterior">
        {/* Top Badges */}
        <div className="flex justify-center items-center gap-3 mt-4 mb-10">
          <StatusBadge label="REPAIRED" type="repaired" />
          <StatusBadge label="DAMAGED" type="damaged" />
          <StatusBadge label="CHECKED" type="checked" />
        </div>

        {/* Car Diagram */}
        <div className="relative w-full max-w-[700px] mx-auto px-6 sm:px-10 mt-6 mb-12">
          <div className="relative w-full">
            <img src="/assets/car-tw.png" alt="Car Top View" className="w-full h-auto block" />
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 659 285" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 z" fill="#1E1035" />
                </marker>
              </defs>
              {[
                { id: 12, cx: 100, cy: -30, tx: 150, ty: 120 },
                { id: 13, cx: 180, cy: -30, tx: 190, ty: 70 },
                { id: 7, cx: 250, cy: -30, tx: 270, ty: 142 },
                { id: 4, cx: 320, cy: -30, tx: 320, ty: 100 },
                { id: 3, cx: 390, cy: -30, tx: 380, ty: 120 },
                { id: 8, cx: 460, cy: -30, tx: 440, ty: 100 },
                { id: 11, cx: 530, cy: -30, tx: 480, ty: 120 },
                
                { id: 6, cx: 140, cy: 315, tx: 110, ty: 180 },
                { id: 10, cx: 230, cy: 315, tx: 240, ty: 220 },
                { id: 5, cx: 300, cy: 315, tx: 320, ty: 155 },
                { id: 9, cx: 380, cy: 315, tx: 370, ty: 200 },
                { id: 2, cx: 450, cy: 315, tx: 405, ty: 265 },
                { id: 1, cx: 520, cy: 315, tx: 450, ty: 240 },
                
                { id: 17, cx: -20, cy: 110, tx: 65, ty: 142 },
                { id: 15, cx: -10, cy: 190, tx: 100, ty: 160 },
                
                { id: 16, cx: 679, cy: 110, tx: 590, ty: 142 },
                { id: 14, cx: 669, cy: 190, tx: 540, ty: 170 },
              ].map(p => (
                <g key={p.id}>
                  <path d={`M ${p.cx} ${p.cy} L ${p.tx} ${p.ty}`} stroke="#1E1035" strokeWidth="1" markerEnd="url(#arrowhead)" />
                  <circle cx={p.cx} cy={p.cy} r="14" fill="#000" />
                  <text x={p.cx} y={p.cy} fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                    {p.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Legend Grid */}
          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 px-2 sm:px-8 mt-12 mb-6">
            <div className="flex flex-col gap-3">
              {chunk1.map(item => (
                <div key={item.num} className="flex gap-2.5 text-[12px] font-bold text-[#1E1035]">
                  <span className="w-4">{item.num}.</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {chunk2.map(item => (
                <div key={item.num} className="flex gap-2.5 text-[12px] font-bold text-[#1E1035]">
                  <span className="w-[18px]">{item.num}.</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {chunk3.map(item => (
                <div key={item.num} className="flex gap-2.5 text-[12px] font-bold text-[#1E1035]">
                  <span className="w-[18px]">{item.num}.</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReusableSection>

      {/* Seats Upholstery Section */}
      <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-5">
            <h3 className="text-[16px] font-bold text-[#1E1035]">Seats Upholstery</h3>
            <div className="flex items-center flex-nowrap bg-[#F4F5F8] p-[3px] rounded-full border border-[#E2E4EB] shrink-0">
              <button 
                type="button"
                onClick={() => onSeatsStatusChange?.('pass')}
                className={`px-5 py-1 rounded-full text-[11px] tracking-wide font-bold transition-all whitespace-nowrap ${
                  seatsStatus === 'pass' ? 'bg-[#71D64B] text-white shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                PASS
              </button>
              <button 
                type="button"
                onClick={() => onSeatsStatusChange?.('fail')}
                className={`px-5 py-1 rounded-full text-[11px] tracking-wide font-bold transition-all whitespace-nowrap ${
                  seatsStatus === 'fail' ? 'bg-[#FE8E4B] text-white shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                FAIL
              </button>
              <button 
                type="button"
                onClick={() => onSeatsStatusChange?.('weak')}
                className={`px-5 py-1 rounded-full text-[11px] tracking-wide font-bold transition-all whitespace-nowrap ${
                  seatsStatus === 'weak' ? 'bg-[#FFED00] text-[#7A7000] shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                WEAK
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="seats-comments" className="text-[14px] font-bold text-[#1E1035]">Comments</label>
            <textarea 
              id="seats-comments"
              defaultValue={seatsComments}
              onChange={handleSeatsCommentChange}
              maxLength={1000}
              rows={3}
              placeholder="Enter observations regarding seats, wear and tear, or stains..." 
              className="w-full bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 py-3 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-1 focus:ring-[#1E1035]/20 transition-all resize-y" 
            />
          </div>

          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-xs font-medium animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{uploadError}</span>
              </div>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="p-1 hover:bg-red-100 rounded-lg text-red-500 transition-colors cursor-pointer"
                aria-label="Dismiss error"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {seatsImages.map((img) => (
              <div key={img.id} className="relative group/img">
                <ImageUploadBox 
                  status="completed" 
                  url={img.url} 
                  onPreview={() => setPreviewUrl(img.url)}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSeatsImage(img.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10 cursor-pointer opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100"
                  title="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {seatsImages.length < maxImages ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="cursor-pointer"
              >
                <ImageUploadBox 
                  status="empty" 
                  isDragOver={isDragOver} 
                  onChooseFromGallery={handleGallerySelect}
                  onDropMediaUrl={handleAddMediaUrl}
                />
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-medium px-4 py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center text-center">
                Maximum limit ({maxImages}) reached
              </div>
            )}
          </div>
        </div>
      </section>

      {/* General Comments Section */}
      <GeneralCommentsCard 
        placeholder="General interior & exterior comments..." 
        initialComments={generalComments}
        onCommentsChange={onGeneralCommentsChange}
        initialImages={generalImages}
        onImagesChange={onGeneralImagesChange}
      />

      {/* Dynamically added headlines */}
      {defaultHeadlines.map(h => (
        <HeadingCard
          key={h.id}
          initialTitle={h.title}
          initialComments={h.comments}
          initialImageUrl={h.imageUrl}
          initialImages={h.images || (h.imageUrl ? [h.imageUrl] : [])}
          isRemovable={defaultHeadlines.length > 1}
          onRemove={() => removeHeadline(h.id)}
          onChangeTitle={(title) => updateHeadline(h.id, { title })}
          onChangeComments={(comments) => updateHeadline(h.id, { comments })}
          onChangeImage={(imageUrl) => updateHeadline(h.id, { imageUrl: imageUrl || undefined })}
          onChangeImages={(images) => updateHeadline(h.id, { images, imageUrl: images[0] || undefined })}
        />
      ))}

      {/* Add Headline Button */}
      <AddHeadlineButton onClick={addHeadline} label="Add Interior Headline" />

      {previewUrl && (
        <ImageLightboxModal 
          imageUrl={previewUrl} 
          title="Interior & Exterior Photo" 
          onClose={() => setPreviewUrl(null)} 
        />
      )}
    </div>
  );
};
