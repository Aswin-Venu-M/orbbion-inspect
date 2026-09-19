"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Check, Layers, Image as ImageIcon, ArrowRight, ShieldCheck, Disc, CircleDot, Sparkles, AlertCircle } from 'lucide-react';
import { useMediaConnection } from '@/lib/media-connection-context';
import { MediaTargetInfo } from '@/lib/media-targets';

export const MediaAssignModal: React.FC = () => {
  const {
    isAssignModalOpen,
    closeAssignModal,
    mediaFiles,
    availableTargets,
    assignMediaToTarget,
  } = useMediaConnection();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Selected media items to assign
  const selectedMedia = useMemo(() => {
    const selected = mediaFiles.filter(m => m.selected && m.status === 'completed');
    if (selected.length > 0) return selected;
    // Fallback if none explicitly selected: completed items
    return mediaFiles.filter(m => m.status === 'completed').slice(0, 1);
  }, [mediaFiles]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    availableTargets.forEach(t => cats.add(t.category));
    return ['All', ...Array.from(cats)];
  }, [availableTargets]);

  const filteredTargets = useMemo(() => {
    return availableTargets.filter(target => {
      const matchesSearch = 
        target.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        target.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        target.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || target.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [availableTargets, searchQuery, selectedCategory]);

  const handleAssign = (target: MediaTargetInfo) => {
    const urls = selectedMedia.map(m => m.url);
    assignMediaToTarget(target.id, urls);
    closeAssignModal();
  };

  return (
    <AnimatePresence>
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <motion.div
            key="assign-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[24px] sm:rounded-[28px] shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
          >
          {/* Header */}
          <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-[16px] sm:text-[18px] font-bold text-[#1E1035] flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#F4E8FF] text-[#9723FF] flex items-center justify-center shrink-0">
                  <ArrowRight size={18} />
                </span>
                <span className="truncate">Assign Media to Report Field</span>
              </h2>
              <p className="text-[11px] sm:text-[12px] text-[#74768B] font-medium mt-0.5">
                Select where to place {selectedMedia.length} photo{selectedMedia.length === 1 ? '' : 's'} in the inspection form
              </p>
            </div>
            <button
              onClick={closeAssignModal}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Selected Photos Strip */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#F8F9FC] border-b border-slate-100 flex items-center gap-2.5 sm:gap-3 overflow-x-auto custom-scrollbar">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#74768B] uppercase tracking-wider shrink-0">
              Selected ({selectedMedia.length}):
            </span>
            <div className="flex items-center gap-2">
              {selectedMedia.map((m) => (
                <div
                  key={m.id}
                  className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 border-[#9723FF] shrink-0 shadow-xs group"
                >
                  <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="p-4 sm:p-6 pb-2.5 sm:pb-3 flex flex-col gap-2.5 sm:gap-3">
            <div className="relative flex items-center w-full">
              <Search size={16} className="absolute left-3.5 text-[#74768B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by field, part, or section (e.g., FL Tyre, Brakes...)"
                className="w-full h-[42px] sm:h-[44px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] pl-10 pr-4 text-[12px] sm:text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-2 focus:ring-[#9723FF]/30 transition-all"
              />
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#1E1035] text-white shadow-xs'
                      : 'bg-[#F4F5F8] text-[#74768B] hover:text-[#1E1035] hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Targets List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 pb-4 sm:pb-6">
            {filteredTargets.length === 0 ? (
              <div className="py-10 sm:py-12 text-center text-slate-400">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No matching report targets found</p>
                <p className="text-xs mt-1">Try searching for something else</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredTargets.map((target) => {
                  const isSingle = target.type === 'single';
                  const hasPhotos = (target.currentCount || 0) > 0;
                  const isMaxReached = target.maxCount && (target.currentCount || 0) >= target.maxCount;

                  return (
                    <button
                      key={target.id}
                      onClick={() => handleAssign(target)}
                      className="flex items-center justify-between p-3 sm:p-3.5 rounded-[16px] sm:rounded-[18px] border border-slate-200 hover:border-[#9723FF] bg-white hover:bg-[#FAF6FF] active:bg-[#F4E8FF] transition-all text-left group cursor-pointer shadow-xs hover:shadow-sm min-h-[48px]"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9723FF]">
                          {target.section}
                        </span>
                        <span className="text-[12px] sm:text-[13px] font-bold text-[#1E1035] group-hover:text-[#9723FF] transition-colors truncate">
                          {target.label}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            hasPhotos 
                              ? 'bg-slate-100 text-slate-700' 
                              : 'bg-emerald-50 text-emerald-700 font-bold'
                          }`}>
                            {hasPhotos 
                              ? `${target.currentCount}${target.maxCount ? `/${target.maxCount}` : ''} photo${target.currentCount === 1 ? '' : 's'}` 
                              : 'Empty'}
                          </span>
                          {isSingle && hasPhotos && (
                            <span className="text-[10px] text-amber-600 font-medium">
                              (Will replace)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-[#9723FF] text-slate-400 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                        <Check size={16} strokeWidth={2.5} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
