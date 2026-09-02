/* eslint-disable @next/next/no-img-element */
"use client";
import { Familjen_Grotesk } from 'next/font/google';
const familjen = Familjen_Grotesk({ subsets: ['latin'] });
import React, { useState, useRef } from 'react';
import { motion } from "motion/react";
import {
  Calendar, Clock, ChevronDown, ChevronUp, User, MapPin, RotateCcw, RotateCw, 
  Printer, Download, Eye, Pencil, FileText, Plus, HelpCircle, Home, 
  Image as ImageIcon, Cloud, Search, Check, FileCheck, Map, Info,
  AtSign, CarFront, Trash2, ZoomIn, ZoomOut
} from 'lucide-react';
import { EyeIcon } from '@/components/ui/eye-icon';
import { PencilIcon } from '@/components/ui/pencil-icon';
import { InputField } from '@/components/ui/input-field';
import { SelectField } from '@/components/ui/select-field';
import { ReusableSection } from '@/components/ui/reusable-section';
import { SidebarCard } from '@/components/ui/sidebar-card';
import { ChassisVisualizer, InspectionState } from '@/components/ui/chassis-visualizer';
import { InspectionDetailCard, InspectionDetailState } from '@/components/ui/inspection-detail-card';
import { ReportPreview } from '@/components/ui/report-preview';

export default function HomeDashboard() {
  const [activeTab, setActiveTab] = useState<'edit' | 'view'>('edit');
  const [isGalleryOpen, setIsGalleryOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(100);
  const [previewPage, setPreviewPage] = useState(1);
  const totalPreviewPages = 4;
  const previewScrollRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 20, 50));

  const handlePrevPage = () => {
    setPreviewPage(prev => {
      const newPage = Math.max(prev - 1, 1);
      document.getElementById(`preview-page-${newPage}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return newPage;
    });
  };

  const handleNextPage = () => {
    setPreviewPage(prev => {
      const newPage = Math.min(prev + 1, totalPreviewPages);
      document.getElementById(`preview-page-${newPage}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return newPage;
    });
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const zoomFactor = zoomLevel / 100;
    const zoomedPageHeight = 1163 * zoomFactor;
    const calculatedPage = Math.floor((target.scrollTop + (zoomedPageHeight / 2)) / zoomedPageHeight) + 1;
    if (calculatedPage !== previewPage && calculatedPage >= 1 && calculatedPage <= totalPreviewPages) {
      setPreviewPage(calculatedPage);
    }
  };


  const [mediaFiles, setMediaFiles] = useState<{ id: string; url: string; name: string; progress: number; status: 'uploading' | 'completed' }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [tyres, setTyres] = useState<Record<string, InspectionDetailState>>({
    RR: { status: 'pass', year: '', comments: '', image: null },
    RL: { status: 'pass', year: '', comments: '', image: null },
    FR: { status: 'pass', year: '', comments: '', image: null },
    FL: { status: 'pass', year: '', comments: '', image: null },
    ST: { status: 'pass', year: '', comments: '', image: null },
  });

  const [rims, setRims] = useState<Record<string, InspectionDetailState>>({
    RR: { status: 'pass', year: '', comments: '', image: null },
    RL: { status: 'pass', year: '', comments: '', image: null },
    FR: { status: 'pass', year: '', comments: '', image: null },
    FL: { status: 'pass', year: '', comments: '', image: null },
    ST: { status: 'pass', year: '', comments: '', image: null },
  });

  const [brakes, setBrakes] = useState<Record<string, InspectionDetailState>>({
    RR: { status: 'pass', year: '', comments: '', image: null },
    RL: { status: 'pass', year: '', comments: '', image: null },
    FR: { status: 'pass', year: '', comments: '', image: null },
    FL: { status: 'pass', year: '', comments: '', image: null },
    ST: { status: 'pass', year: '', comments: '', image: null },
  });

  const [uploadTarget, setUploadTarget] = useState<{ type: 'tyre' | 'rim' | 'brake', id: string } | null>(null);

  const updateTyreData = (id: string, data: Partial<InspectionDetailState>) => {
    setTyres(prev => ({ ...prev, [id]: { ...prev[id], ...data } }));
  };

  const setTyreStatus = (id: string, status: InspectionState) => {
    updateTyreData(id, { status });
  };

  const handleTyreImageClick = (id: string) => {
    setUploadTarget({ type: 'tyre', id });
    fileInputRef.current?.click();
  };

  const updateRimData = (id: string, data: Partial<InspectionDetailState>) => {
    setRims(prev => ({ ...prev, [id]: { ...prev[id], ...data } }));
  };

  const setRimStatus = (id: string, status: InspectionState) => {
    updateRimData(id, { status });
  };

  const handleRimImageClick = (id: string) => {
    setUploadTarget({ type: 'rim', id });
    fileInputRef.current?.click();
  };

  const updateBrakeData = (id: string, data: Partial<InspectionDetailState>) => {
    setBrakes(prev => ({ ...prev, [id]: { ...prev[id], ...data } }));
  };

  const setBrakeStatus = (id: string, status: InspectionState) => {
    updateBrakeData(id, { status });
  };

  const handleBrakeImageClick = (id: string) => {
    setUploadTarget({ type: 'brake', id });
    fileInputRef.current?.click();
  };

  const simulateUpload = (id: string) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 20) + 10; // Random jump between 10-30%
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setMediaFiles(prev => prev.map(m => m.id === id ? { ...m, progress: 100, status: 'completed' } : m));
      } else {
        setMediaFiles(prev => prev.map(m => m.id === id ? { ...m, progress: currentProgress } : m));
      }
    }, 400); // Update every 400ms for a visible staggered upload effect
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    if (uploadTarget) {
      const file = Array.from(files)[0];
      if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        if (uploadTarget.type === 'tyre') {
          updateTyreData(uploadTarget.id, { image: { url, progress: 100 } });
        } else if (uploadTarget.type === 'rim') {
          updateRimData(uploadTarget.id, { image: { url, progress: 100 } });
        } else if (uploadTarget.type === 'brake') {
          updateBrakeData(uploadTarget.id, { image: { url, progress: 100 } });
        }
        setUploadTarget(null);
      }
      return;
    }

    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/')).map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      name: file.name,
      progress: 0,
      status: 'uploading' as const
    }));
    
    setMediaFiles(prev => [...prev, ...newFiles]);
    
    newFiles.forEach(file => {
      simulateUpload(file.id);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeMedia = (id: string) => {
    setMediaFiles(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className={`h-screen bg-[#F8F9FB] bg-dot-pattern flex p-3 md:p-4 pl-3 md:pl-[106px] gap-4 overflow-hidden ${familjen.className}`}>
      
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[76px] bg-white border-t border-slate-100 flex items-center justify-around px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-2">
        <button className="flex flex-col items-center justify-center gap-1.5 w-16 h-full text-[#180321] opacity-50 hover:opacity-100 transition-opacity">
          <Home size={22} fill="currentColor" strokeWidth={0} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button 
          onClick={() => setIsGalleryOpen(!isGalleryOpen)}
          className={`flex flex-col items-center justify-center gap-1.5 w-16 h-full transition-all ${isGalleryOpen ? 'text-[#9723FF] opacity-100' : 'text-[#180321] opacity-50 hover:opacity-100'}`}
        >
          <ImageIcon size={22} strokeWidth={isGalleryOpen ? 2.5 : 2} className={isGalleryOpen ? 'drop-shadow-sm' : ''} />
          <span className="text-[10px] font-medium">Gallery</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-1.5 w-16 h-full text-[#180321] opacity-50 hover:opacity-100 transition-opacity">
          <Search size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Search</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-1.5 w-16 h-full text-[#180321] opacity-50 hover:opacity-100 transition-opacity">
          <HelpCircle size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Help</span>
        </button>
      </nav>

      {/* 1. Icon Rail (Fixed Desktop) */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-[90px] flex-col justify-between items-center px-4 py-6 z-50 bg-white border-r border-slate-100">
        
        {/* Top Group: Search + Home + Gallery */}
        <div className="flex flex-col justify-start items-center w-full">
          {/* Brand/App Icon (Search) */}
          <button className="w-[46px] h-[46px] bg-[#008751] rounded-[14px] flex items-center justify-center shadow-sm relative hover:bg-[#007043] transition-colors shrink-0">
            <Search size={22} strokeWidth={2.5} className="text-white transform -scale-x-100" />
            <CarFront size={11} strokeWidth={2.5} className="text-white absolute mt-[2px] ml-[2px]" />
          </button>
          
          <div className="flex flex-col gap-6 w-full mt-8">
            {/* Home */}
            <button className="w-full flex flex-col justify-start items-center gap-1.5 group">
              <div className="w-[46px] h-[46px] bg-[#F8F9FB] rounded-[14px] border border-[#E2E4EB] inline-flex justify-center items-center shadow-sm group-hover:bg-[#F3F4F6] transition-colors relative">
                <Home size={22} fill="currentColor" strokeWidth={0} className="text-[#645A6C]" />
              </div>
              <span className="text-center text-[#463B4D] text-[11px] font-semibold">Home</span>
            </button>

            {/* Gallery */}
            <button 
              onClick={() => setIsGalleryOpen(!isGalleryOpen)}
              className="w-full flex flex-col justify-start items-center gap-1.5 group cursor-pointer"
            >
              <div className={`w-[46px] h-[46px] bg-[#F8F9FB] rounded-[14px] border border-[#E2E4EB] inline-flex justify-center items-center shadow-sm transition-colors ${isGalleryOpen ? 'bg-[#F3F4F6] ring-2 ring-fuchsia-950/10' : 'group-hover:bg-[#F3F4F6]'}`}>
                <div className="w-[26px] h-[26px] bg-[#180321] rounded-[8px] flex items-center justify-center overflow-hidden">
                  <ImageIcon size={15} strokeWidth={2.5} className="text-white mt-1" />
                </div>
              </div>
              <span className="text-center text-[#463B4D] text-[11px] font-semibold">Gallery</span>
            </button>
          </div>
        </div>

        {/* Bottom Group: Help */}
        <button className="w-9 h-9 rounded-full bg-[#9CA3AF] hover:bg-[#85808B] transition-colors flex items-center justify-center text-white text-[15px] font-bold shadow-sm mb-2">
          ?
        </button>
      </nav>

      {/* Main Workspace Area containing header + 3 columns */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        
        {/* Top Header */}
        <header className="relative w-full min-h-[72px] h-auto bg-white rounded-[24px] shadow-sm border border-slate-100 shrink-0 flex flex-wrap xl:flex-nowrap items-center justify-between px-4 sm:px-5 py-3 xl:py-0 gap-4 xl:gap-0 z-10">
          
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Title & Status */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-[18px] font-bold text-[#1E1035] tracking-tight">Report 440</h1>
                <div className="w-5 h-5 rounded-full bg-[#EBDCF9] flex items-center justify-center text-[#9723FF]">
                  <Info size={12} strokeWidth={3} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Cloud size={12} className="text-[#1E1035]" strokeWidth={2.5} />
                <span className="text-[11px] font-semibold text-[#1E1035]">Saved just now</span>
              </div>
            </div>
          </div>

          {/* Tools */}
          <div className="flex xl:absolute xl:left-1/2 xl:-translate-x-1/2 items-center justify-center gap-2 sm:gap-3 order-last xl:order-none w-full xl:w-auto mt-2 xl:mt-0">
            {/* Edit/View Toggle */}
              <div className="p-1 bg-[#F3F4F9] rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#CFD2DF] inline-flex justify-start items-center gap-1 shadow-sm">
                {/* Edit Tab */}
                <button 
                  onClick={() => setActiveTab('edit')}
                  className="relative w-10 h-10 rounded-xl flex justify-center items-center transition-opacity"
                  style={{ opacity: activeTab === 'edit' ? 1 : 0.5 }}
                >
                  {activeTab === 'edit' && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute inset-0 bg-gradient-to-tr from-black to-fuchsia-950 rounded-[40px] outline outline-1 outline-offset-[-1px] outline-slate-300 shadow-sm"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <div className="relative z-10 w-6 h-6 flex flex-col items-center justify-center">
                    <PencilIcon size={14} className={`absolute top-1 ml-[3px] transition-colors ${activeTab === 'edit' ? 'text-white' : 'text-[#180321]'}`} />
                    <div className={`w-4 h-[2px] absolute bottom-[1px] rounded-full transition-colors ${activeTab === 'edit' ? 'bg-white opacity-50' : 'bg-[#180321] opacity-30'}`}></div>
                  </div>
                </button>

                {/* View Tab */}
                <button 
                  onClick={() => setActiveTab('view')}
                  className="relative w-10 h-10 rounded-xl flex justify-center items-center transition-opacity"
                  style={{ opacity: activeTab === 'view' ? 1 : 0.5 }}
                >
                  {activeTab === 'view' && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute inset-0 bg-gradient-to-tr from-black to-fuchsia-950 rounded-[40px] outline outline-1 outline-offset-[-1px] outline-slate-300 shadow-sm"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <div className="relative z-10 w-6 h-6 flex items-center justify-center">
                    <EyeIcon size={20} className={`transition-colors ${activeTab === 'view' ? 'text-white' : 'text-[#180321]'}`} />
                  </div>
                </button>
              </div>

              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              {/* Undo/Redo */}
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 bg-[#F4F5F8] rounded-[14px] flex items-center justify-center text-[#74768B] hover:bg-[#E9EAF2] transition-colors border border-slate-100 shadow-sm">
                  <RotateCcw size={16} />
                </button>
                <button className="w-10 h-10 bg-[#F4F5F8] rounded-[14px] flex items-center justify-center text-[#74768B] hover:bg-[#E9EAF2] transition-colors border border-slate-100 shadow-sm">
                  <RotateCw size={16} />
                </button>
              </div>

              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              {/* Print/Download */}
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 bg-[#F4F5F8] rounded-[14px] flex items-center justify-center text-[#1E1035] hover:bg-[#E9EAF2] transition-colors border border-slate-100 shadow-sm">
                  <Printer size={16} strokeWidth={2.5} />
                </button>
                <button className="w-10 h-10 bg-[#F4F5F8] rounded-[14px] flex items-center justify-center text-[#74768B] hover:bg-[#E9EAF2] transition-colors border border-slate-100 shadow-sm">
                  <Download size={16} />
                </button>
              </div>
            </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-100 shadow-sm shrink-0 hidden sm:block">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button className="h-10 px-3 sm:px-5 bg-[#F4F5F8] rounded-[14px] text-[12px] sm:text-[13px] font-semibold text-[#310b4d] hover:bg-[#E9EAF2] transition-colors border border-slate-100 shadow-sm whitespace-nowrap">
              Cancel <span className="hidden sm:inline">Report</span>
            </button>
            <button className="h-10 px-3 sm:px-5 bg-[#310b4d] rounded-[14px] text-[12px] sm:text-[13px] font-semibold text-white flex items-center gap-2 hover:bg-[#1f0730] transition-colors shadow-sm whitespace-nowrap">
              Publish <FileText size={14} className="hidden sm:block" />
            </button>
          </div>
        </header>

        {/* 3 Columns Layout or Preview */}
        <div className="flex-1 flex flex-col xl:flex-row gap-4 overflow-y-auto xl:overflow-hidden pb-[90px] md:pb-4 xl:pb-0 custom-scrollbar">
          
          {activeTab === 'edit' ? (
            <>
              {/* 2. Media Drawer (Floating Card) */}
              <div 
            className={`shrink-0 overflow-hidden transition-all duration-500 ease-in-out ${
              isGalleryOpen 
                ? 'max-h-[600px] xl:max-h-none w-full xl:max-w-[310px] opacity-100' 
                : 'max-h-0 xl:max-h-none w-full xl:max-w-0 opacity-0'
            }`}
          >
            <div className="w-full xl:w-[310px] bg-white rounded-[32px] shadow-sm flex flex-col p-5 z-10 border border-slate-100 h-[400px] xl:h-full">
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[15px] font-bold text-[#1E1035] tracking-tight">Media Gallery</h3>
                {mediaFiles.length > 0 && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 rounded-xl bg-[#F4F5F8] flex items-center justify-center text-[#1E1035] hover:bg-[#E9EAF2] transition-colors"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              <motion.div 
                animate={{
                  scale: isDragging ? 0.98 : 1,
                  backgroundColor: isDragging ? "#F8FAFC" : "transparent",
                  borderColor: isDragging ? "#1E1035" : "transparent"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`flex-1 flex flex-col relative rounded-[24px] border-2 border-dashed overflow-hidden`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />

                {mediaFiles.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center relative">
                    {/* Placeholder Graphic for Empty State */}
                    <div className="relative w-full flex items-center justify-center mb-6">
                      <img 
                        src="/assets/empty-media.png" 
                        alt="Empty Media" 
                        className="w-full h-auto object-contain pointer-events-none"
                      />
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: isGalleryOpen ? 1 : 0, y: isGalleryOpen ? 0 : 15 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
                      className="text-center z-20"
                    >
                      <motion.h2 
                        key={isDragging ? "dragging" : "empty"}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="text-[#1E1035] text-[26px] font-bold mb-2 tracking-tight"
                      >
                        {isDragging ? "Drop it here!" : "It's empty in here."}
                      </motion.h2>
                      <motion.p 
                        key={isDragging ? "dragging-desc" : "empty-desc"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, type: "spring", stiffness: 400, damping: 25 }}
                        className="text-[#A0A4AB] text-[13px] leading-relaxed mb-5 px-4"
                      >
                        {isDragging ? "Release to add files to your album." : "Add some media to bring this album to life."}
                      </motion.p>
                      <motion.button 
                        onClick={() => fileInputRef.current?.click()}
                        animate={{
                          opacity: isDragging ? 0 : 1,
                          scale: isDragging ? 0.8 : 1,
                          y: isDragging ? 10 : 0
                        }}
                        whileHover={{ scale: 1.04, boxShadow: "0px 8px 16px rgba(30, 16, 53, 0.15)" }}
                        whileTap={{ scale: 0.96 }}
                        className={`bg-[#1E1035] text-white px-7 py-3.5 rounded-2xl flex items-center gap-2 text-sm font-semibold hover:bg-[#281446] transition-colors shadow-sm mx-auto ${isDragging ? 'pointer-events-none' : ''}`}
                      >
                        Add Media <Plus size={16} strokeWidth={3} />
                      </motion.button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 -mr-2">
                    <div className="grid grid-cols-2 gap-3">
                      {mediaFiles.map((media, index) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -20 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 25,
                            delay: media.status === 'uploading' ? (index % 5) * 0.1 : 0 
                          }}
                          key={media.id} 
                          className="relative group rounded-2xl overflow-hidden aspect-square border border-slate-100 shadow-sm bg-slate-100"
                        >
                          <img 
                            src={media.url} 
                            alt={media.name} 
                            className={`w-full h-full object-cover transition-all duration-700 ${media.status === 'uploading' ? 'scale-110 blur-[2px]' : 'scale-100 blur-0'}`} 
                          />
                          
                          {media.status === 'uploading' && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                              <div className="absolute inset-0 flex flex-col justify-between p-3 z-10">
                                <div className="flex justify-end">
                                  <motion.button 
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => removeMedia(media.id)}
                                    className="w-8 h-8 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shadow-sm border border-red-200/50"
                                  >
                                    <Trash2 size={16} strokeWidth={2.5} />
                                  </motion.button>
                                </div>
                                <div className="flex flex-col gap-2 mt-auto">
                                  <span className="text-white font-bold text-[14px] leading-none tracking-wide drop-shadow-md">Uploading.....</span>
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 bg-white/30 rounded-full flex-1 overflow-hidden">
                                      <motion.div 
                                        className="h-full bg-white rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${media.progress}%` }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                      />
                                    </div>
                                    <span className="text-white font-bold text-[13px] leading-none w-10 text-right drop-shadow-md">{media.progress} %</span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {media.status === 'completed' && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                              <button 
                                onClick={() => removeMedia(media.id)}
                                className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 backdrop-blur-sm text-white flex items-center justify-center transition-all shadow-lg scale-90 group-hover:scale-100"
                              >
                                <Trash2 size={18} strokeWidth={2} />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* 3. Main Content Canvas */}
          <main className="flex-1 flex flex-col overflow-visible xl:overflow-hidden min-w-0 xl:min-w-[500px]">
            <div className="flex-1 overflow-visible xl:overflow-y-auto custom-scrollbar xl:pr-3 xl:pb-6 space-y-5">
              
              {/* Inspection Details Section */}
              <ReusableSection title="Inspection Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputField label="Date" required rightIcon={<Calendar size={18} />} placeholder="DD-MM-YYYY" />
                  <InputField label="Time" required rightIcon={<Clock size={18} />} placeholder="HH-MM" />
                  <SelectField label="Inspection Type" required placeholder="Select Inspection Type" />
                  <InputField label="VIN Number" required placeholder="Enter VIN Number" />
                </div>
              </ReusableSection>

              {/* Vehicle Summary Section */}
              <ReusableSection title="Vehicle Summary">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
                  <InputField label="Make" placeholder="Enter Make" />
                  <InputField label="Model" placeholder="Enter Model" />
                  <InputField label="Model Year" placeholder="YYYY" rightIcon={<Calendar size={18} />} />
                  
                  <InputField label="Regional Specs" placeholder="Enter Region" rightIcon={<MapPin size={18} />} />
                  <InputField label="Transmission" placeholder="Enter Transmission" />
                  <InputField label="Engine Size" placeholder="Enter Engine Size" />
                  
                  <SelectField label="Odometer" placeholder="Select Odometer" />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#1E1035]">Spare Type</label>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 bg-[#F4E8FF] border border-[#D9A8FF] text-[#9723FF] text-sm font-semibold h-[46px] rounded-[14px] shadow-sm">
                        Available
                      </button>
                      <button className="flex-1 bg-[#F4F5F8] text-[#A0A4AB] text-sm font-semibold h-[46px] rounded-[14px]">
                        Not-Available
                      </button>
                    </div>
                  </div>
                  <InputField label="Number of Keys" placeholder="Enter Number of Keys" rightIcon={
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <ChevronDown size={14} className="-rotate-180 -mb-1" strokeWidth={3} />
                      <ChevronDown size={14} className="-mt-1" strokeWidth={3} />
                    </div>
                  } />

                  <InputField label="Vehicle Type" placeholder="Enter Vehicle Type" />
                  <InputField label="External Colour" placeholder="Enter External Colour" />
                  <InputField label="Fuel Type" placeholder="Enter Fuel Type" />
                  
                  <InputField label="Odometer Reading" placeholder="Enter Odometer Reading" rightText={<><span className="font-bold text-[#1E1035]">KM</span> / Miles</>} />
                  <InputField label="Tampered Odometer Reading" placeholder="Enter Odometer Reading" rightText={<><span className="font-bold text-[#1E1035]">KM</span> / Miles</>} />
                </div>
              </ReusableSection>

              {/* Report Overview Section */}
              <ReusableSection title="Report Overview" className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-0">
                <div className="w-full sm:w-1/3 flex flex-col gap-4">
                  <InputField label="Pass" placeholder="Enter Pass Value" rightText="% / Miles" />
                  <InputField label="Fail" placeholder="Enter Fail Value" rightText="% / Miles" />
                </div>
                <div className="w-full sm:w-1/3 flex justify-center py-4 sm:py-0">
                  {/* Simple CSS pie chart for the overview */}
                  <div className="w-[120px] h-[120px] rounded-full shadow-sm" style={{
                    background: 'conic-gradient(#5BC335 0% 50%, #1A7011 50% 100%)'
                  }}></div>
                </div>
                <div className="w-full sm:w-1/3"></div>
              </ReusableSection>
              
              {/* Tyres Section */}
              <ReusableSection title="Tyres" className="pb-8">
                <ChassisVisualizer items={tyres} setItemStatus={setTyreStatus} />
              </ReusableSection>

              {/* Tyre Details Section */}
              <div className="flex flex-col gap-4">
                <InspectionDetailCard title="Rear Right (RR)" data={tyres.RR} onChange={(d) => updateTyreData('RR', d)} onImageClick={() => handleTyreImageClick('RR')} />
                <InspectionDetailCard title="Rear Left (RL)" data={tyres.RL} onChange={(d) => updateTyreData('RL', d)} onImageClick={() => handleTyreImageClick('RL')} />
                <InspectionDetailCard title="Front Right (FR)" data={tyres.FR} onChange={(d) => updateTyreData('FR', d)} onImageClick={() => handleTyreImageClick('FR')} />
                <InspectionDetailCard title="Front Left (FL)" data={tyres.FL} onChange={(d) => updateTyreData('FL', d)} onImageClick={() => handleTyreImageClick('FL')} />
                <InspectionDetailCard title="Spare tyre (ST)" data={tyres.ST} onChange={(d) => updateTyreData('ST', d)} onImageClick={() => handleTyreImageClick('ST')} />
              </div>

              {/* Rims Section */}
              <ReusableSection title="Rims" className="pb-8 mt-8">
                <ChassisVisualizer items={rims} setItemStatus={setRimStatus} />
              </ReusableSection>

              {/* Rim Details Section */}
              <div className="flex flex-col gap-4">
                <InspectionDetailCard title="Rear Right (RR)" data={rims.RR} onChange={(d) => updateRimData('RR', d)} onImageClick={() => handleRimImageClick('RR')} />
                <InspectionDetailCard title="Rear Left (RL)" data={rims.RL} onChange={(d) => updateRimData('RL', d)} onImageClick={() => handleRimImageClick('RL')} />
                <InspectionDetailCard title="Front Right (FR)" data={rims.FR} onChange={(d) => updateRimData('FR', d)} onImageClick={() => handleRimImageClick('FR')} />
                <InspectionDetailCard title="Front Left (FL)" data={rims.FL} onChange={(d) => updateRimData('FL', d)} onImageClick={() => handleRimImageClick('FL')} />
                <InspectionDetailCard title="Spare tyre (ST)" data={rims.ST} onChange={(d) => updateRimData('ST', d)} onImageClick={() => handleRimImageClick('ST')} />
              </div>

              {/* Brakes Section */}
              <ReusableSection title="Brakes" className="pb-8 mt-8">
                <ChassisVisualizer items={brakes} setItemStatus={setBrakeStatus} />
              </ReusableSection>

              {/* Brake Details Section */}
              <div className="flex flex-col gap-4">
                <InspectionDetailCard title="Rear Right (RR)" data={brakes.RR} onChange={(d) => updateBrakeData('RR', d)} onImageClick={() => handleBrakeImageClick('RR')} />
                <InspectionDetailCard title="Rear Left (RL)" data={brakes.RL} onChange={(d) => updateBrakeData('RL', d)} onImageClick={() => handleBrakeImageClick('RL')} />
                <InspectionDetailCard title="Front Right (FR)" data={brakes.FR} onChange={(d) => updateBrakeData('FR', d)} onImageClick={() => handleBrakeImageClick('FR')} />
                <InspectionDetailCard title="Front Left (FL)" data={brakes.FL} onChange={(d) => updateBrakeData('FL', d)} onImageClick={() => handleBrakeImageClick('FL')} />
                <InspectionDetailCard title="Spare tyre (ST)" data={brakes.ST} onChange={(d) => updateBrakeData('ST', d)} onImageClick={() => handleBrakeImageClick('ST')} />
              </div>
              
            </div>
          </main>

          {/* 4. Right Sidebar Container */}
          <aside className="w-full xl:w-[320px] flex flex-col gap-4 h-auto xl:h-full overflow-visible xl:overflow-y-auto custom-scrollbar shrink-0 z-10">
            
            {/* Box 1: Add Client Details */}
            <SidebarCard title="Add Client Details" description="Client's contact information to associate them with this report">
              <InputField label="Client Name" placeholder="Enter Client Name" icon={<User size={16} fill="currentColor" strokeWidth={0} />} />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1E1035]">WhatsApp Number</label>
                <div className="relative flex items-center w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-3 focus-within:ring-2 focus-within:ring-[#1E1035]/20 transition-all">
                  <div className="flex items-center gap-1.5 pr-2 text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="text-[13px] font-medium text-slate-500">+971</span>
                    <ChevronDown size={14} strokeWidth={2.5} className="text-slate-500 ml-0.5" />
                  </div>
                  <input type="text" placeholder="XXX-XXX-XXX" className="flex-1 min-w-0 bg-transparent text-sm text-[#190933] placeholder-slate-400 focus:outline-none" />
                </div>
              </div>
              
              <InputField label="Email Address" placeholder="Enter Email" icon={<Eye size={16} fill="currentColor" strokeWidth={0} />} />
              <InputField label="Vehicle Details" placeholder="Vehicle Details" icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-slate-400">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                  <path d="M12 7c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3z" />
                  <circle cx="12" cy="12" r="1.5" />
                  <path d="M12 4v3m0 10v3m7.07-12.07l-2.12 2.12m-9.9 9.9l-2.12 2.12m14.14 0l-2.12-2.12m-9.9-9.9L5.05 4.93M20 12h-3M7 12H4" />
                </svg>
              } />
              <SelectField label="Location" placeholder="Select Location" icon={<MapPin size={16} fill="currentColor" strokeWidth={0} />} />
            </SidebarCard>
            
            {/* Box 2: Our Team */}
            <SidebarCard title="Our Team" description="Details related to our team to the report">
              <SelectField label="Inspector" placeholder="Select Inspector" icon={<User size={16} />} />
            </SidebarCard>
            
            {/* Footer / Support Link */}
            <div className="mt-auto flex items-end justify-between px-2 pb-2 shrink-0">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#1E1035]">Support@orbbion.com</span>
                <span className="text-[10px] font-medium text-slate-400">v.2.0</span>
              </div>
              <div className="w-8 h-8 bg-[#1E1035] rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-serif italic text-sm font-bold">O</span>
              </div>
            </div>
          </aside>
          </>
        ) : (
          <>
            <div 
              ref={previewScrollRef}
              onScroll={handlePreviewScroll}
              className="flex-1 flex justify-center w-full h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] xl:px-4 pb-10 xl:pb-0"
            >
              <div style={{ zoom: zoomLevel / 100, width: '100%', display: 'flex', justifyContent: 'center', transition: 'zoom 0.2s ease-in-out' }}>
                <ReportPreview tyres={tyres} rims={rims} />
              </div>
            </div>

            {/* Right Sidebar for Preview Actions */}
            <aside className="hidden xl:flex w-[320px] flex-col justify-between items-end h-full shrink-0 z-10 relative">
              <div className="flex flex-col items-center bg-white rounded-[24px] shadow-sm border border-slate-100 p-4 w-[84px] gap-6 absolute top-1/2 -translate-y-1/2 right-4">
                <div className="flex flex-col items-center gap-3 w-full">
                  <button onClick={handlePrevPage} className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[#1E1035] hover:bg-[#F4F5F8] transition-colors"><ChevronUp size={24} strokeWidth={2.5} /></button>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[14px] font-bold text-[#1E1035] leading-none">{String(previewPage).padStart(2, '0')}</span>
                    <div className="w-5 h-px bg-slate-200 my-1"></div>
                    <span className="text-[14px] font-bold text-[#A0A4AB] leading-none">{String(totalPreviewPages).padStart(2, '0')}</span>
                  </div>
                  <button onClick={handleNextPage} className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[#1E1035] hover:bg-[#F4F5F8] transition-colors"><ChevronDown size={24} strokeWidth={2.5} /></button>
                </div>
                
                <div className="w-[52px] h-px bg-slate-200"></div>
                
                <div className="flex flex-col items-center gap-3 w-full">
                  <button onClick={handleZoomIn} className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[#1E1035] hover:bg-[#F4F5F8] transition-colors"><ZoomIn size={22} strokeWidth={2} /></button>
                  <button onClick={handleZoomOut} className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[#1E1035] hover:bg-[#F4F5F8] transition-colors"><ZoomOut size={22} strokeWidth={2} /></button>
                </div>
              </div>

              {/* Footer / Support Link */}
              <div className="mt-auto flex items-end justify-between px-2 pb-2 w-full">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#1E1035]">Support@orbbion.com</span>
                  <span className="text-[10px] font-medium text-slate-400">v.2.0</span>
                </div>
                <div className="w-8 h-8 bg-[#1E1035] rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-serif italic text-sm font-bold">O</span>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  </div>
);
}
