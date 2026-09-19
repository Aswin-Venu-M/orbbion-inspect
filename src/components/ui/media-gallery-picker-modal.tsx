"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Image as ImageIcon, CheckCircle2, Plus, Sparkles, Filter } from 'lucide-react';
import { useMediaConnection } from '@/lib/media-connection-context';

export const MediaGalleryPickerModal: React.FC = () => {
  const {
    activePicker,
    closeGalleryPicker,
    mediaFiles,
    getMediaUsage,
    addMediaFiles,
    showToast,
  } = useMediaConnection();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');

  const isMultiple = activePicker?.multiple ?? false;

  const completedMedia = useMemo(() => {
    return mediaFiles.filter(m => m.status === 'completed');
  }, [mediaFiles]);

  const filteredMedia = useMemo(() => {
    if (filter === 'all') return completedMedia;
    return completedMedia.filter(item => {
      const isUsed = getMediaUsage(item.url).length > 0;
      return filter === 'assigned' ? isUsed : !isUsed;
    });
  }, [completedMedia, filter, getMediaUsage]);

  // Reset local selection when modal opens
  React.useEffect(() => {
    setSelectedUrls([]);
    setFilter('all');
  }, [activePicker]);

  const toggleSelect = (url: string) => {
    if (!isMultiple) {
      // Single selection: toggle or set
      setSelectedUrls(prev => prev.includes(url) ? [] : [url]);
    } else {
      setSelectedUrls(prev => 
        prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
      );
    }
  };

  const handleConfirm = () => {
    if (selectedUrls.length === 0) {
      showToast('Please select at least one image', 'info');
      return;
    }
    activePicker?.onSelect(selectedUrls);
    closeGalleryPicker();
  };

  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addMediaFiles(e.target.files);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <AnimatePresence>
      {activePicker && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <motion.div
            key="gallery-picker-content"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[24px] sm:rounded-[28px] shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
          >
          {/* Header */}
          <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-[16px] sm:text-[18px] font-bold text-[#1E1035] flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#F4E8FF] text-[#9723FF] flex items-center justify-center shrink-0">
                  <ImageIcon size={18} />
                </span>
                <span className="truncate">{activePicker.title || 'Choose from Media Gallery'}</span>
              </h2>
              <p className="text-[11px] sm:text-[12px] text-[#74768B] font-medium mt-0.5">
                {isMultiple 
                  ? 'Select one or more photos from your uploaded media album' 
                  : 'Tap a photo to attach it to this section'}
              </p>
            </div>
            <button
              onClick={closeGalleryPicker}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Subheader: Filters & Upload Button */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#F8F9FC] border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5 max-w-full">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#1E1035] text-white'
                    : 'bg-white border border-slate-200 text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                All ({completedMedia.length})
              </button>
              <button
                onClick={() => setFilter('unassigned')}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filter === 'unassigned'
                    ? 'bg-[#9723FF] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                Unassigned ({completedMedia.filter(m => getMediaUsage(m.url).length === 0).length})
              </button>
              <button
                onClick={() => setFilter('assigned')}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filter === 'assigned'
                    ? 'bg-[#1E1035] text-white'
                    : 'bg-white border border-slate-200 text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                In Report ({completedMedia.filter(m => getMediaUsage(m.url).length > 0).length})
              </button>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#9723FF] text-xs font-semibold text-[#1E1035] hover:text-[#9723FF] transition-all cursor-pointer shadow-xs min-h-[36px]"
            >
              <Plus size={14} />
              Upload Photo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLocalUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-6">
            {filteredMedia.length === 0 ? (
              <div className="py-12 sm:py-16 text-center text-slate-400 flex flex-col items-center">
                <ImageIcon size={40} className="opacity-40 mb-3" />
                <p className="text-base font-bold text-[#1E1035]">No media found in this filter</p>
                <p className="text-xs text-[#74768B] mt-1 mb-4">Upload new photos or switch filter to view all</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#3e045a] hover:bg-[#2a033d] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Upload Photos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                {filteredMedia.map((item) => {
                  const isSelected = selectedUrls.includes(item.url);
                  const usages = getMediaUsage(item.url);
                  const isUsed = usages.length > 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelect(item.url)}
                      className={`group relative rounded-[16px] sm:rounded-[18px] overflow-hidden aspect-square border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#9723FF] ring-3 ring-[#9723FF]/30 scale-[1.02] shadow-md'
                          : 'border-slate-200 hover:border-slate-400 bg-slate-50'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />

                      {/* Selection Checkmark Indicator */}
                      <div className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#9723FF] text-white shadow-sm'
                          : 'bg-black/35 text-white/90 sm:opacity-0 sm:group-hover:opacity-100'
                      }`}>
                        <Check size={14} strokeWidth={3} />
                      </div>

                      {/* Used Badge */}
                      {isUsed && (
                        <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 sm:py-1 rounded-lg text-[10px] font-semibold truncate flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                          <span className="truncate">{usages.map(u => u.label).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-3 sm:p-4 px-4 sm:px-6 border-t border-slate-100 bg-[#FDFDFE] flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#74768B] truncate">
              {selectedUrls.length} selected
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={closeGalleryPicker}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-[#74768B] hover:text-[#1E1035] hover:bg-slate-100 transition-colors cursor-pointer min-h-[40px]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedUrls.length === 0}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm min-h-[40px] ${
                  selectedUrls.length > 0
                    ? 'bg-[#9723FF] hover:bg-[#8318e3] hover:shadow-md active:scale-95'
                    : 'bg-slate-300 opacity-60 cursor-not-allowed'
                }`}
              >
                Attach Photo{selectedUrls.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
