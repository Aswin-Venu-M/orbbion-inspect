/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef } from 'react';
import { motion } from "motion/react";
import {
  Plus, Check, Trash2, ArrowRightLeft, Image as ImageIcon,
} from 'lucide-react';
import { useMediaConnection, MediaItem } from '@/lib/media-connection-context';

export interface InspectMediaDrawerProps {
  onRequestDeleteSingle: (media: MediaItem) => void;
  onRequestDeleteSelected: () => void;
}

export const InspectMediaDrawer: React.FC<InspectMediaDrawerProps> = ({
  onRequestDeleteSingle,
  onRequestDeleteSelected,
}) => {
  const {
    mediaFiles,
    filter,
    setFilter,
    filteredMediaFiles,
    selectedMediaCount,
    toggleMediaSelect,
    toggleSelectAllMedia,
    getMediaUsage,
    addMediaFiles,
    removeMedia,
    startDraggingMedia,
    endDraggingMedia,
    openAssignModal,
  } = useMediaConnection();

  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addMediaFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {mediaFiles.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-3 shrink-0 min-h-[44px] sm:min-h-[48px] gap-2">
            {selectedMediaCount > 0 ? (
              <>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-[#1E1035] text-[14px] sm:text-[15px] font-bold tracking-tight leading-tight truncate">
                    {selectedMediaCount} Selected
                  </h3>
                  <button 
                    onClick={toggleSelectAllMedia}
                    className="flex items-center gap-1 mt-1 text-[#3b59ff] group w-fit cursor-pointer"
                  >
                    <Check size={13} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] sm:text-[11.5px] font-bold leading-tight underline decoration-1 underline-offset-2">
                      {mediaFiles.every(m => m.selected) ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button 
                    type="button"
                    onClick={openAssignModal}
                    className="h-[36px] sm:h-[38px] px-3 rounded-[12px] bg-[#9723FF] hover:bg-[#8213e4] text-white flex items-center gap-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Assign selected photos to report field"
                  >
                    <ArrowRightLeft size={14} />
                    <span>Assign</span>
                  </button>
                  <button 
                    type="button"
                    onClick={onRequestDeleteSelected}
                    className="w-[36px] h-[36px] sm:w-[38px] sm:h-[38px] rounded-[12px] bg-[#fae5e6] hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer border border-red-200 shadow-xs"
                    title="Delete Selected"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <h3 className="text-[#1E1035] text-[15px] sm:text-[16px] font-bold tracking-tight leading-tight">
                    {mediaFiles.length} Media
                  </h3>
                  <p className="text-[#74768B] text-[11px] sm:text-[12px] font-medium leading-tight mt-0.5">
                    Drag to field or click +
                  </p>
                </div>
                <button 
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] rounded-[14px] bg-[#3e045a] hover:bg-[#280445] flex items-center justify-center text-white transition-colors cursor-pointer shadow-xs"
                  title="Add Media Files"
                >
                  <Plus size={20} strokeWidth={2.5} />
                </button>
              </>
            )}
          </div>

          {/* Filter Tabs */}
          {(() => {
            const assignedCount = mediaFiles.filter(m => getMediaUsage(m.url).length > 0).length;
            const unassignedCount = mediaFiles.length - assignedCount;
            return (
              <div className="flex items-center gap-1 p-1 bg-[#F4F5F8] rounded-xl mb-3 text-[11px] font-semibold shrink-0 border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`flex-1 py-1.5 px-1.5 rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                    filter === 'all' 
                      ? 'bg-white text-[#1E1035] shadow-xs font-bold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({mediaFiles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('unassigned')}
                  className={`flex-1 py-1.5 px-1.5 rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                    filter === 'unassigned' 
                      ? 'bg-white text-[#1E1035] shadow-xs font-bold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Unassigned ({unassignedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('assigned')}
                  className={`flex-1 py-1.5 px-1.5 rounded-lg transition-all text-center whitespace-nowrap cursor-pointer ${
                    filter === 'assigned' 
                      ? 'bg-white text-[#1E1035] shadow-xs font-bold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  In Report ({assignedCount})
                </button>
              </div>
            );
          })()}
        </>
      )}

      <motion.div 
        animate={{
          scale: isDragging ? 0.98 : 1,
          backgroundColor: isDragging ? "#F8FAFC" : "rgba(255, 255, 255, 0)",
          borderColor: isDragging ? "#1E1035" : "rgba(226, 228, 235, 0.5)"
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`flex-1 flex flex-col relative overflow-hidden ${mediaFiles.length === 0 ? 'rounded-[24px] border-2 border-dashed' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={galleryFileInputRef} 
          onChange={(e) => {
            if (e.target.files) addMediaFiles(e.target.files);
            if (e.target) e.target.value = '';
          }} 
          multiple 
          accept="image/*" 
          className="hidden" 
        />

        {mediaFiles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center relative p-4 text-center">
            <div className="relative w-full flex items-center justify-center mb-4">
              <img 
                src="/assets/empty-media.png" 
                alt="Empty Media" 
                className="w-40 sm:w-48 h-auto object-contain pointer-events-none"
              />
            </div>
            
            <h2 className="text-[#1E1035] text-[18px] sm:text-[20px] font-bold mb-1">It&apos;s empty in here.</h2>
            <p className="text-[#A0A4AB] text-[12px] mb-4">Add some media to bring this album to life.</p>
            <button 
              onClick={() => galleryFileInputRef.current?.click()}
              className="bg-[#3e045a] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-[16px] flex items-center gap-2 text-[12px] font-medium font-['Familjen_Grotesk'] hover:bg-[#281446] transition-colors shadow-sm cursor-pointer"
            >
              Add Media <Plus size={16} />
            </button>
          </div>
        ) : filteredMediaFiles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <ImageIcon size={32} className="mb-2 opacity-40 text-[#1E1035]" />
            <p className="text-xs font-semibold text-slate-600">
              No {filter === 'assigned' ? 'assigned' : 'unassigned'} photos found
            </p>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-2 text-xs font-bold text-[#9723FF] hover:underline cursor-pointer"
            >
              View all ({mediaFiles.length})
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-2.5">
              {filteredMediaFiles.map((media) => {
                const usage = getMediaUsage(media.url);
                const isInReport = usage.length > 0;
                return (
                  <div 
                    key={media.id} 
                    draggable={media.status === 'completed'}
                    onDragStart={(e) => startDraggingMedia(media, e)}
                    onDragEnd={endDraggingMedia}
                    className={`relative group rounded-[16px] overflow-hidden aspect-square border transition-all ${
                      media.selected 
                        ? 'border-[#9723FF] ring-2 ring-[#9723FF]/40 shadow-sm' 
                        : isInReport 
                          ? 'border-emerald-400 ring-1 ring-emerald-400/40' 
                          : 'border-[#cfd2e0]'
                    } ${media.status === 'completed' ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'cursor-default'} bg-slate-100 select-none`}
                  >
                    <img 
                      src={media.url} 
                      alt={media.name} 
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        media.status === 'uploading' ? 'scale-105 blur-[2px]' : 'scale-100 group-hover:scale-105'
                      }`} 
                    />

                    {/* Usage badge in bottom left */}
                    {media.status === 'completed' && isInReport && (
                      <div 
                        title={`Attached in:\n${usage.map(u => `• ${u.label} (${u.section})`).join('\n')}`}
                        className="absolute bottom-1.5 left-1.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#1E1035]/85 backdrop-blur-xs text-[9.5px] font-bold text-white shadow-xs pointer-events-auto cursor-help"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{usage.length > 1 ? `${usage.length} in report` : 'in report'}</span>
                      </div>
                    )}

                    {/* Drag hint on hover */}
                    {media.status === 'completed' && !isInReport && (
                      <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 text-[9px] bg-black/60 text-white font-medium px-1.5 py-0.5 rounded backdrop-blur-xs pointer-events-none">
                        Drag
                      </div>
                    )}

                    {media.status === 'uploading' && (
                      <div className="absolute inset-0 bg-black/30 flex flex-col justify-between p-2 z-10">
                        <div className="flex justify-end w-full">
                          <button 
                            onClick={() => removeMedia(media.id)}
                            className="bg-[#fae5e6] text-red-500 p-1 rounded-[8px] hover:bg-red-100 transition-colors cursor-pointer border border-red-200 shadow-xs"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="flex flex-col gap-1 w-full bg-black/60 p-2 rounded-xl backdrop-blur-xs">
                          <span className="text-white text-[10.5px] font-medium tracking-wide">Uploading...</span>
                          <div className="flex items-center gap-1.5 w-full">
                            <div className="h-[3px] bg-[#f1f2f6]/60 flex-1 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${media.progress}%` }} />
                            </div>
                            <span className="text-white text-[10px] font-medium whitespace-nowrap">{media.progress}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {media.status === 'completed' && (
                      <>
                        {/* Top right delete button */}
                        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 opacity-85 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity z-20">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestDeleteSingle(media);
                            }}
                            className="bg-[#fae5e6] text-red-500 p-1 rounded-[8px] hover:bg-red-100 transition-colors cursor-pointer shadow-sm border border-red-200"
                            title={isInReport ? 'Delete photo (attached to report)' : 'Delete photo'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        {/* Center checkmark toggle */}
                        <div className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-200 ${media.selected ? 'opacity-100' : 'opacity-70 xl:opacity-0 xl:group-hover:opacity-100'}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMediaSelect(media.id);
                            }}
                            className={`p-1.5 rounded-full shadow-sm flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                              media.selected 
                                ? 'bg-white border-white scale-110 shadow-md' 
                                : 'backdrop-blur-[2px] bg-black/40 border-white/60 hover:bg-black/60 hover:scale-110'
                            } border cursor-pointer`}
                            title={media.selected ? 'Deselect photo' : 'Select photo'}
                          >
                            <Check size={18} className={media.selected ? "text-[#3e045a]" : "text-white"} strokeWidth={media.selected ? 3.5 : 2} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
