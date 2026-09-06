/* eslint-disable @next/next/no-img-element */
"use client";

import { Familjen_Grotesk } from 'next/font/google';
const familjen = Familjen_Grotesk({ subsets: ['latin'] });
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from "motion/react";
import Link from 'next/link';
import {
  Calendar, Clock, ChevronDown, ChevronUp, User, MapPin, RotateCcw, RotateCw, 
  Printer, Download, Eye, Pencil, FileText, Plus, HelpCircle, Home, 
  Image as ImageIcon, Cloud, Search, Check, FileCheck, Info,
  Trash2, ZoomIn, ZoomOut, X, AlertCircle, Share2, Copy, CheckCircle2,
  ExternalLink, Sparkles, ArrowLeft, LayoutDashboard, UserCheck, Users, Hash
} from 'lucide-react';
import { EyeIcon } from '@/components/ui/eye-icon';
import { PencilIcon } from '@/components/ui/pencil-icon';
import { InputField } from '@/components/ui/input-field';
import { SelectField } from '@/components/ui/select-field';
import { ReusableSection } from '@/components/ui/reusable-section';
import { SidebarCard } from '@/components/ui/sidebar-card';
import { SectionTitlesCard } from '@/components/ui/section-titles-card';
import { InspectorSidebarTabs, SidebarTabId } from '@/components/ui/inspector-sidebar-tabs';
import { ChassisVisualizer, InspectionState } from '@/components/ui/chassis-visualizer';
import { ChassisSubframeSection } from '@/components/chassis/chassis-subframe-section';
import { InspectionDetailCard, InspectionDetailState } from '@/components/ui/inspection-detail-card';
import { ReportPreview } from '@/components/ui/report-preview';
import { InteriorExteriorSection } from '@/components/interior-exterior/interior-exterior-section';
import { GeneralPhotosSection } from '@/components/general-photos/general-photos-section';
import { BodySection } from '@/components/body/body-section';
import { ElectricalSection } from '@/components/electrical/electrical-section';
import { EngineSection } from '@/components/engine/engine-section';
import { TransmissionSection } from '@/components/transmission/transmission-section';
import { useInspectionHistory } from '@/lib/use-inspection-history';
import { SupportBadge } from '@/components/ui/support-badge';
import {
  SectionId,
  DEFAULT_SECTION_ORDER,
  INSPECTION_SECTIONS_MAP,
  SEARCHABLE_SECTIONS,
  INITIAL_MEDIA_FILES,
  inspectionTypeOptions,
  odometerStatusOptions,
  locationOptions,
  inspectorOptions,
  countryCodeOptions,
  initialReportData,
} from '@constants';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed';
  selected?: boolean;
}

export default function HomeDashboard() {
  const {
    report,
    updateReport,
    undo,
    redo,
    resetReport,
    canUndo,
    canRedo,
    saveStatus,
  } = useInspectionHistory();

  // Tab & Gallery State
  const [activeTab, setActiveTab] = useState<'edit' | 'view'>('edit');
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTabId>('sections');
  const [isGalleryOpen, setIsGalleryOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  // Section Order Interchangeable State
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('orbbion_section_order_v4');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === DEFAULT_SECTION_ORDER.length) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_SECTION_ORDER;
  });

  // Preview Navigation & Zoom
  const [zoomLevel, setZoomLevel] = useState(100);
  const [previewPage, setPreviewPage] = useState(1);
  const totalPreviewPages = 4;
  const previewScrollRef = useRef<HTMLDivElement>(null);

  // Dialogs & Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const handleSectionOrderChange = useCallback((newOrder: SectionId[]) => {
    setSectionOrder(newOrder);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('orbbion_section_order_v4', JSON.stringify(newOrder));
      } catch {
        // ignore
      }
    }
    showToast('Section order updated', 'success');
  }, [showToast]);

  // Separate file inputs to prevent upload race conditions
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);
  const [cardUploadTarget, setCardUploadTarget] = useState<{ type: 'tyre' | 'rim' | 'brake'; id: string } | null>(null);

  // Media Gallery files state
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>(INITIAL_MEDIA_FILES);

  const activeUploadIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup active intervals on unmount
  useEffect(() => {
    const intervals = activeUploadIntervals.current;
    return () => {
      intervals.forEach(intId => clearInterval(intId));
      intervals.clear();
    };
  }, []);

  // Dynamic calculation of Pass/Fail Overview
  const calculatedStats = useMemo(() => {
    const allItems: (InspectionState | null)[] = [
      ...Object.values(report.tyres).map(i => i.status),
      ...Object.values(report.rims).map(i => i.status),
      ...Object.values(report.brakes).map(i => i.status),
    ];
    const total = allItems.filter(s => s !== 'na').length;
    if (total === 0) return { pass: 55, fail: 45 };

    const passCount = allItems.filter(s => s === 'pass').length;
    const passPercentage = Math.round((passCount / total) * 100);
    const failPercentage = 100 - passPercentage;

    return {
      pass: passPercentage,
      fail: failPercentage,
    };
  }, [report.tyres, report.rims, report.brakes]);

  // Keep reportOverview stats synchronized if autoCalculate is active
  useEffect(() => {
    if (report.reportOverview.autoCalculate) {
      if (
        report.reportOverview.pass !== String(calculatedStats.pass) ||
        report.reportOverview.fail !== String(calculatedStats.fail)
      ) {
        updateReport({
          reportOverview: {
            ...report.reportOverview,
            pass: String(calculatedStats.pass),
            fail: String(calculatedStats.fail),
          },
        }, false);
      }
    }
  }, [calculatedStats, report.reportOverview, updateReport]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 20, 50));
  const handleZoomReset = () => setZoomLevel(100);

  // Smooth Preview Page Navigation
  const scrollToPreviewPage = (pageNumber: number) => {
    const el = document.getElementById(`preview-page-${pageNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPreviewPage(pageNumber);
    }
  };

  const handlePrevPage = () => {
    const newPage = Math.max(previewPage - 1, 1);
    scrollToPreviewPage(newPage);
  };

  const handleNextPage = () => {
    const newPage = Math.min(previewPage + 1, totalPreviewPages);
    scrollToPreviewPage(newPage);
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const totalHeight = target.scrollHeight;
    const pageHeight = totalHeight / totalPreviewPages;
    const calculatedPage = Math.min(
      totalPreviewPages,
      Math.max(1, Math.floor((target.scrollTop + (pageHeight * 0.3)) / pageHeight) + 1)
    );
    if (calculatedPage !== previewPage) {
      setPreviewPage(calculatedPage);
    }
  };

  // Component Status Updaters
  const updateTyreData = (id: string, data: Partial<InspectionDetailState>) => {
    updateReport({
      tyres: {
        ...report.tyres,
        [id]: { ...report.tyres[id], ...data },
      },
    });
  };

  const setTyreStatus = (id: string, status: InspectionState) => {
    updateTyreData(id, { status });
  };

  const handleTyreImageClick = (id: string) => {
    setCardUploadTarget({ type: 'tyre', id });
    cardFileInputRef.current?.click();
  };

  const updateRimData = (id: string, data: Partial<InspectionDetailState>) => {
    updateReport({
      rims: {
        ...report.rims,
        [id]: { ...report.rims[id], ...data },
      },
    });
  };

  const setRimStatus = (id: string, status: InspectionState) => {
    updateRimData(id, { status });
  };

  const handleRimImageClick = (id: string) => {
    setCardUploadTarget({ type: 'rim', id });
    cardFileInputRef.current?.click();
  };

  const updateBrakeData = (id: string, data: Partial<InspectionDetailState>) => {
    updateReport({
      brakes: {
        ...report.brakes,
        [id]: { ...report.brakes[id], ...data },
      },
    });
  };

  const setBrakeStatus = (id: string, status: InspectionState) => {
    updateBrakeData(id, { status });
  };

  const handleBrakeImageClick = (id: string) => {
    setCardUploadTarget({ type: 'brake', id });
    cardFileInputRef.current?.click();
  };

  // Dedicated Card File Upload Handler
  const handleCardFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cardUploadTarget) {
      setCardUploadTarget(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      setCardUploadTarget(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'error');
      setCardUploadTarget(null);
      if (e.target) e.target.value = '';
      return;
    }

    const url = URL.createObjectURL(file);
    const { type, id } = cardUploadTarget;

    if (type === 'tyre') {
      updateTyreData(id, { image: { url, progress: 100 } });
    } else if (type === 'rim') {
      updateRimData(id, { image: { url, progress: 100 } });
    } else if (type === 'brake') {
      updateBrakeData(id, { image: { url, progress: 100 } });
    }

    showToast(`Image attached to ${type.toUpperCase()} (${id})`, 'success');
    setCardUploadTarget(null);
    if (e.target) e.target.value = '';
  };

  // Media Gallery Upload Simulator
  const simulateUpload = (id: string) => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 20) + 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        activeUploadIntervals.current.delete(id);
        setMediaFiles(prev => prev.map(m => m.id === id ? { ...m, progress: 100, status: 'completed' } : m));
      } else {
        setMediaFiles(prev => prev.map(m => m.id === id ? { ...m, progress: currentProgress } : m));
      }
    }, 300);

    activeUploadIntervals.current.set(id, interval);
  };

  const handleGalleryFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const allFiles = Array.from(files);
    const validFiles = allFiles.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
    
    if (validFiles.length === 0) {
      showToast('No valid images found (Max 10MB per file)', 'error');
      return;
    }

    if (validFiles.length < allFiles.length) {
      showToast(`${allFiles.length - validFiles.length} file(s) skipped (exceeded 10MB limit or invalid type)`, 'error');
    }

    const newFiles: MediaItem[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      name: file.name,
      progress: 0,
      status: 'uploading',
    }));

    setMediaFiles(prev => [...newFiles, ...prev]);
    newFiles.forEach(f => simulateUpload(f.id));
    showToast(`${newFiles.length} image(s) uploading to gallery`, 'info');
  };

  const toggleMediaSelect = (id: string) => {
    setMediaFiles(prev => prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };

  const toggleSelectAllMedia = () => {
    const allSelected = mediaFiles.length > 0 && mediaFiles.every(m => m.selected);
    setMediaFiles(prev => prev.map(m => ({ ...m, selected: !allSelected })));
  };

  const deleteSelectedMedia = () => {
    const selected = mediaFiles.filter(m => m.selected);
    selected.forEach(item => {
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      const activeInterval = activeUploadIntervals.current.get(item.id);
      if (activeInterval) {
        clearInterval(activeInterval);
        activeUploadIntervals.current.delete(item.id);
      }
    });
    setMediaFiles(prev => prev.filter(m => !m.selected));
    if (selected.length > 0) {
      showToast(`${selected.length} image(s) removed`, 'info');
    }
  };

  const removeMedia = (id: string) => {
    const item = mediaFiles.find(m => m.id === id);
    if (item?.url.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }
    const activeInterval = activeUploadIntervals.current.get(id);
    if (activeInterval) {
      clearInterval(activeInterval);
      activeUploadIntervals.current.delete(id);
    }
    setMediaFiles(prev => prev.filter(m => m.id !== id));
    showToast('Image removed from gallery', 'info');
  };

  // Drag & Drop for Media Gallery
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
    handleGalleryFiles(e.dataTransfer.files);
  };

  // Stepper for Keys
  const incrementKeys = () => {
    updateReport({
      vehicleSummary: {
        ...report.vehicleSummary,
        numberOfKeys: Math.min((report.vehicleSummary.numberOfKeys || 0) + 1, 10),
      },
    });
  };

  const decrementKeys = () => {
    updateReport({
      vehicleSummary: {
        ...report.vehicleSummary,
        numberOfKeys: Math.max((report.vehicleSummary.numberOfKeys || 0) - 1, 0),
      },
    });
  };

  // Toggle Odometer Unit
  const toggleOdometerUnit = () => {
    const nextUnit = report.vehicleSummary.odometerUnit === 'KM' ? 'Miles' : 'KM';
    updateReport({
      vehicleSummary: {
        ...report.vehicleSummary,
        odometerUnit: nextUnit,
      },
    });
  };

  // Print Action
  const handlePrint = () => {
    if (activeTab !== 'view') {
      setActiveTab('view');
      setTimeout(() => {
        window.print();
      }, 350);
    } else {
      window.print();
    }
  };

  // Export JSON
  const handleDownload = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `orbbion_inspection_${report.id || 'report'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Report JSON downloaded successfully', 'success');
    } catch {
      showToast('Failed to export report', 'error');
    }
  };

  // Publish Action & Validation
  const handlePublish = () => {
    const missing: string[] = [];
    if (!report.inspectionDetails.date) missing.push('Date');
    if (!report.inspectionDetails.time) missing.push('Time');
    if (!report.inspectionDetails.inspectionType) missing.push('Inspection Type');
    if (!report.inspectionDetails.vinNumber) missing.push('VIN Number');
    if (!report.clientDetails.name) missing.push('Client Name');
    if (!report.vehicleSummary.make) missing.push('Make');
    if (!report.vehicleSummary.model) missing.push('Model');
    if (!report.vehicleSummary.odometerReading) missing.push('Odometer Reading');
    if (!report.vehicleSummary.fuelType) missing.push('Fuel Type');

    if (missing.length > 0) {
      showToast(`Required fields missing: ${missing.join(', ')}`, 'error');
      // Scroll to Inspection Details
      document.getElementById('section-inspection-details')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    if (!vinRegex.test(report.inspectionDetails.vinNumber)) {
      showToast('VIN must be exactly 17 alphanumeric characters (excluding I, O, Q).', 'error');
      document.getElementById('section-inspection-details')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!report.vehicleSummary.year) {
      showToast('Model Year is required.', 'error');
      document.getElementById('section-vehicle-summary')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const year = Number(report.vehicleSummary.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      showToast(`Model Year must be between 1900 and ${currentYear + 1}.`, 'error');
      document.getElementById('section-vehicle-summary')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    updateReport({ status: 'published' });
    setIsPublishModalOpen(true);
  };

  const copyPublishLink = () => {
    navigator.clipboard.writeText(`https://checkmycar.ae/report/${report.id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Interactive Mouse Flashlight Effect
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  const handleAppMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(() => {
      target.style.setProperty('--mouse-x', `${x}px`);
      target.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  const filteredSearchSections = SEARCHABLE_SECTIONS.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderInspectionSection = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'section-inspection-details':
        return (
          <div id="section-inspection-details" className="scroll-mt-6">
            <ReusableSection title="Inspection Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField 
                  label="Date" 
                  required 
                  rightIcon={<Calendar size={18} />} 
                  placeholder="DD-MM-YYYY"
                  value={report.inspectionDetails.date}
                  onChange={(e) => updateReport({
                    inspectionDetails: { ...report.inspectionDetails, date: e.target.value }
                  })}
                />
                <InputField 
                  label="Time" 
                  required 
                  rightIcon={<Clock size={18} />} 
                  placeholder="HH:MM" 
                  value={report.inspectionDetails.time}
                  onChange={(e) => updateReport({
                    inspectionDetails: { ...report.inspectionDetails, time: e.target.value }
                  })}
                />
                <SelectField 
                  label="Inspection Type" 
                  required 
                  placeholder="Select Inspection Type"
                  options={inspectionTypeOptions}
                  value={report.inspectionDetails.inspectionType}
                  onChange={(e) => updateReport({
                    inspectionDetails: { ...report.inspectionDetails, inspectionType: e.target.value as string }
                  })}
                />
                <InputField 
                  label="VIN Number" 
                  required 
                  placeholder="Enter 17-digit VIN" 
                  maxLength={17}
                  value={report.inspectionDetails.vinNumber}
                  onChange={(e) => updateReport({
                    inspectionDetails: { ...report.inspectionDetails, vinNumber: e.target.value.toUpperCase() }
                  })}
                />
              </div>
            </ReusableSection>
          </div>
        );

      case 'section-vehicle-summary':
        return (
          <div id="section-vehicle-summary" className="scroll-mt-6">
            <ReusableSection title="Vehicle Summary">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
                <InputField 
                  label="Make" 
                  placeholder="Enter Make (e.g. Toyota)" 
                  value={report.vehicleSummary.make}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, make: e.target.value }
                  })}
                />
                <InputField 
                  label="Model" 
                  placeholder="Enter Model (e.g. Tundra)" 
                  value={report.vehicleSummary.model}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, model: e.target.value }
                  })}
                />
                <InputField 
                  label="Model Year" 
                  placeholder="YYYY" 
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  rightIcon={<Hash size={18} />} 
                  value={report.vehicleSummary.year}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, year: e.target.value }
                  })}
                />
                
                <InputField 
                  label="Regional Specs" 
                  placeholder="GCC, American, Euro..." 
                  rightIcon={<MapPin size={18} />} 
                  value={report.vehicleSummary.regionalSpecs}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, regionalSpecs: e.target.value }
                  })}
                />
                <InputField 
                  label="Transmission" 
                  placeholder="Automatic, Manual..." 
                  value={report.vehicleSummary.transmission}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, transmission: e.target.value }
                  })}
                />
                <InputField 
                  label="Engine Size" 
                  placeholder="3.5L V6, 2.0L Turbo..." 
                  value={report.vehicleSummary.engineSize}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, engineSize: e.target.value }
                  })}
                />
                
                <SelectField 
                  label="Odometer Status" 
                  placeholder="Select Odometer Status" 
                  options={odometerStatusOptions}
                  value={report.vehicleSummary.odometerStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value as string;
                    const isTampered = newStatus === 'Tampered';
                    updateReport({
                      vehicleSummary: { 
                        ...report.vehicleSummary, 
                        odometerStatus: newStatus,
                        ...( !isTampered && { tamperedReading: '' } )
                      }
                    });
                  }}
                />

                {/* Spare Type Toggle */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1E1035]">Spare Type</label>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => updateReport({
                        vehicleSummary: { ...report.vehicleSummary, spareType: 'available' }
                      })}
                      className={`flex-1 text-sm font-semibold h-[46px] rounded-[14px] transition-all cursor-pointer ${
                        report.vehicleSummary.spareType === 'available'
                          ? 'bg-[#F4E8FF] border border-[#D9A8FF] text-[#9723FF] shadow-xs'
                          : 'bg-[#F4F5F8] text-[#A0A4AB] hover:text-[#1E1035]'
                      }`}
                    >
                      Available
                    </button>
                    <button 
                      type="button"
                      onClick={() => updateReport({
                        vehicleSummary: { ...report.vehicleSummary, spareType: 'not-available' }
                      })}
                      className={`flex-1 text-sm font-semibold h-[46px] rounded-[14px] transition-all cursor-pointer ${
                        report.vehicleSummary.spareType === 'not-available'
                          ? 'bg-[#F4E8FF] border border-[#D9A8FF] text-[#9723FF] shadow-xs'
                          : 'bg-[#F4F5F8] text-[#A0A4AB] hover:text-[#1E1035]'
                      }`}
                    >
                      Not-Available
                    </button>
                  </div>
                </div>

                {/* Number of Keys with Stepper */}
                <InputField 
                  label="Number of Keys" 
                  placeholder="Number of Keys" 
                  type="number"
                  min="0"
                  max="10"
                  value={report.vehicleSummary.numberOfKeys}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, numberOfKeys: Number(e.target.value) || 0 }
                  })}
                  rightIcon={
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <button type="button" onClick={incrementKeys} className="hover:text-[#1E1035] p-0.5" aria-label="Increase number of keys">
                        <ChevronUp size={12} strokeWidth={3} />
                      </button>
                      <button type="button" onClick={decrementKeys} className="hover:text-[#1E1035] p-0.5" aria-label="Decrease number of keys">
                        <ChevronDown size={12} strokeWidth={3} />
                      </button>
                    </div>
                  } 
                />

                <InputField 
                  label="Vehicle Type" 
                  placeholder="SUV, Truck, Sedan, Coupe..." 
                  value={report.vehicleSummary.vehicleType}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, vehicleType: e.target.value }
                  })}
                />
                <InputField 
                  label="External Colour" 
                  placeholder="Grey, White, Black..." 
                  value={report.vehicleSummary.externalColour}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, externalColour: e.target.value }
                  })}
                />
                <InputField 
                  label="Fuel Type" 
                  placeholder="Petrol, Diesel, Hybrid, EV..." 
                  value={report.vehicleSummary.fuelType}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, fuelType: e.target.value }
                  })}
                />
                
                <InputField 
                  label="Odometer Reading" 
                  placeholder="Current mileage" 
                  value={report.vehicleSummary.odometerReading}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, odometerReading: e.target.value }
                  })}
                  rightText={
                    <button 
                      type="button" 
                      onClick={toggleOdometerUnit}
                      className="font-bold hover:underline cursor-pointer flex items-center gap-1"
                      title="Toggle between KM and Miles"
                    >
                      <span className={report.vehicleSummary.odometerUnit === 'KM' ? 'text-[#9723FF]' : 'text-slate-400'}>KM</span>
                      <span>/</span>
                      <span className={report.vehicleSummary.odometerUnit === 'Miles' ? 'text-[#9723FF]' : 'text-slate-400'}>Miles</span>
                    </button>
                  } 
                />
                <InputField 
                  label="Tampered Odometer Reading" 
                  placeholder="Reported tampered reading" 
                  value={report.vehicleSummary.tamperedReading}
                  disabled={report.vehicleSummary.odometerStatus !== 'Tampered'}
                  onChange={(e) => updateReport({
                    vehicleSummary: { ...report.vehicleSummary, tamperedReading: e.target.value }
                  })}
                  rightText={
                    <span className="font-bold text-slate-500">
                      {report.vehicleSummary.odometerUnit}
                    </span>
                  } 
                />
              </div>
            </ReusableSection>
          </div>
        );

      case 'section-report-overview':
        return (
          <div id="section-report-overview" className="scroll-mt-6">
            <ReusableSection title="Report Overview" className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="w-full sm:w-1/3 flex flex-col gap-4">
                <InputField 
                  label="Pass Percentage" 
                  placeholder="e.g. 55" 
                  type="number"
                  min="0"
                  max="100"
                  rightText="%" 
                  value={report.reportOverview.pass}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = Math.min(100, Math.max(0, Number(val) || 0));
                    updateReport({
                      reportOverview: {
                        ...report.reportOverview,
                        pass: String(num),
                        fail: String(100 - num),
                        autoCalculate: false,
                      },
                    });
                  }}
                />
                <InputField 
                  label="Defects / Fail Percentage" 
                  placeholder="e.g. 45" 
                  type="number"
                  min="0"
                  max="100"
                  rightText="%" 
                  value={report.reportOverview.fail}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = Math.min(100, Math.max(0, Number(val) || 0));
                    updateReport({
                      reportOverview: {
                        ...report.reportOverview,
                        fail: String(num),
                        pass: String(100 - num),
                        autoCalculate: false,
                      },
                    });
                  }}
                />
                <button
                  type="button"
                  onClick={() => updateReport({
                    reportOverview: {
                      ...report.reportOverview,
                      autoCalculate: true,
                      pass: String(calculatedStats.pass),
                      fail: String(calculatedStats.fail),
                    },
                  })}
                  className="text-xs font-semibold text-[#9723FF] hover:underline flex items-center gap-1 w-fit focus-visible:ring-2 focus-visible:ring-[#9723FF] focus-visible:outline-none rounded"
                >
                  <Sparkles size={13} />
                  Auto-calculate from points
                </button>
              </div>

              {/* Real Dynamic Conic-Gradient Pie Chart */}
              <div className="w-full sm:w-1/3 flex flex-col items-center justify-center py-4">
                <div 
                  className="w-[130px] h-[130px] rounded-full shadow-md border-4 border-white transition-all duration-500" 
                  style={{
                    background: `conic-gradient(#5BC335 0% ${report.reportOverview.pass}%, #FE8E4B ${report.reportOverview.pass}% 100%)`
                  }}
                />
                <div className="flex items-center gap-4 mt-3 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#5BC335]" />
                    <span>Pass {report.reportOverview.pass}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FE8E4B]" />
                    <span>Defects {report.reportOverview.fail}%</span>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-1/3 text-xs text-slate-500 leading-relaxed bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100">
                <span className="font-bold text-[#1E1035] block mb-1">Inspection Formula</span>
                Scores are calculated across chassis, tyres, rims, brakes, and electrical subsystems. Green represents safe parameters; orange indicates repairs or defects required.
              </div>
            </ReusableSection>
          </div>
        );

      case 'section-tyres':
        return (
          <div id="section-tyres" className="flex flex-col gap-2 scroll-mt-6">
            <ReusableSection title="Tyres" className="pb-8">
              <ChassisVisualizer items={report.tyres} setItemStatus={setTyreStatus} />
            </ReusableSection>
            <div className="flex flex-col gap-2">
              <InspectionDetailCard title="Rear Right (RR)" data={report.tyres.RR} onChange={(d) => updateTyreData('RR', d)} onImageClick={() => handleTyreImageClick('RR')} />
              <InspectionDetailCard title="Rear Left (RL)" data={report.tyres.RL} onChange={(d) => updateTyreData('RL', d)} onImageClick={() => handleTyreImageClick('RL')} />
              <InspectionDetailCard title="Front Right (FR)" data={report.tyres.FR} onChange={(d) => updateTyreData('FR', d)} onImageClick={() => handleTyreImageClick('FR')} />
              <InspectionDetailCard title="Front Left (FL)" data={report.tyres.FL} onChange={(d) => updateTyreData('FL', d)} onImageClick={() => handleTyreImageClick('FL')} />
              <InspectionDetailCard title="Spare tyre (ST)" data={report.tyres.ST} onChange={(d) => updateTyreData('ST', d)} onImageClick={() => handleTyreImageClick('ST')} />
            </div>
          </div>
        );

      case 'section-rims':
        return (
          <div id="section-rims" className="flex flex-col gap-2 scroll-mt-6">
            <ReusableSection title="Rims" className="pb-8">
              <ChassisVisualizer items={report.rims} setItemStatus={setRimStatus} />
            </ReusableSection>
            <div className="flex flex-col gap-2">
              <InspectionDetailCard title="Rear Right (RR)" data={report.rims.RR} onChange={(d) => updateRimData('RR', d)} onImageClick={() => handleRimImageClick('RR')} />
              <InspectionDetailCard title="Rear Left (RL)" data={report.rims.RL} onChange={(d) => updateRimData('RL', d)} onImageClick={() => handleRimImageClick('RL')} />
              <InspectionDetailCard title="Front Right (FR)" data={report.rims.FR} onChange={(d) => updateRimData('FR', d)} onImageClick={() => handleRimImageClick('FR')} />
              <InspectionDetailCard title="Front Left (FL)" data={report.rims.FL} onChange={(d) => updateRimData('FL', d)} onImageClick={() => handleRimImageClick('FL')} />
              <InspectionDetailCard title="Spare tyre (ST)" data={report.rims.ST} onChange={(d) => updateRimData('ST', d)} onImageClick={() => handleRimImageClick('ST')} />
            </div>
          </div>
        );

      case 'section-brakes':
        return (
          <div id="section-brakes" className="flex flex-col gap-2 scroll-mt-6">
            <ReusableSection title="Brakes" className="pb-8">
              <ChassisVisualizer items={report.brakes} setItemStatus={setBrakeStatus} />
            </ReusableSection>
            <div className="flex flex-col gap-2">
              <InspectionDetailCard title="Rear Right (RR)" data={report.brakes.RR} onChange={(d) => updateBrakeData('RR', d)} onImageClick={() => handleBrakeImageClick('RR')} />
              <InspectionDetailCard title="Rear Left (RL)" data={report.brakes.RL} onChange={(d) => updateBrakeData('RL', d)} onImageClick={() => handleBrakeImageClick('RL')} />
              <InspectionDetailCard title="Front Right (FR)" data={report.brakes.FR} onChange={(d) => updateBrakeData('FR', d)} onImageClick={() => handleBrakeImageClick('FR')} />
              <InspectionDetailCard title="Front Left (FL)" data={report.brakes.FL} onChange={(d) => updateBrakeData('FL', d)} onImageClick={() => handleBrakeImageClick('FL')} />
              <InspectionDetailCard title="Spare tyre (ST)" data={report.brakes.ST} onChange={(d) => updateBrakeData('ST', d)} onImageClick={() => handleBrakeImageClick('ST')} />
            </div>
          </div>
        );

      case 'section-chassis-subframe':
        return (
          <div key="section-chassis-subframe" className="scroll-mt-6">
            <ChassisSubframeSection 
              initialComments={report.chassisSubframeComments || ''}
              onCommentsChange={(c) => updateReport({ chassisSubframeComments: c }, false)}
              partStatuses={report.chassisSubframePartStatuses}
              onPartStatusesChange={(s) => updateReport({ chassisSubframePartStatuses: s }, false)}
              chassisImages={report.chassisSubframeImages}
              onChassisImagesChange={(i) => updateReport({ chassisSubframeImages: i }, false)}
              customHeadlines={report.chassisSubframeCustomHeadlines}
              onCustomHeadlinesChange={(h) => updateReport({ chassisSubframeCustomHeadlines: h }, false)}
            />
          </div>
        );

      case 'section-body':
        return (
          <div key="section-body" className="scroll-mt-6">
            <BodySection 
              initialComments={report.bodyComments}
              onCommentsChange={(c) => updateReport({ bodyComments: c }, false)}
              partStatuses={report.bodyPartStatuses as Record<string, string>}
              onPartStatusesChange={(s) => updateReport({ bodyPartStatuses: s }, false)}
              bodyImages={report.bodyImages}
              onBodyImagesChange={(i) => updateReport({ bodyImages: i }, false)}
              customHeadlines={report.bodyCustomHeadlines}
              onCustomHeadlinesChange={(h) => updateReport({ bodyCustomHeadlines: h }, false)}
            />
          </div>
        );

      case 'section-interior-exterior':
        return (
          <div key="section-interior-exterior" className="scroll-mt-6">
            <InteriorExteriorSection 
              seatsComments={report.interiorComments}
              onSeatsCommentsChange={(c) => updateReport({ interiorComments: c }, false)}
              seatsStatus={report.seatsStatus}
              onSeatsStatusChange={(s) => updateReport({ seatsStatus: s }, false)}
              seatsImages={report.seatsImages}
              onSeatsImagesChange={(imgs) => updateReport({ seatsImages: imgs }, false)}
              generalComments={report.generalPhotosInteriorComments}
              onGeneralCommentsChange={(c) => updateReport({ generalPhotosInteriorComments: c }, false)}
              customHeadlines={report.interiorCustomHeadlines}
              onCustomHeadlinesChange={(h) => updateReport({ interiorCustomHeadlines: h }, false)}
            />
          </div>
        );

      case 'section-general-photos':
        return (
          <div key="section-general-photos" className="scroll-mt-6">
            <GeneralPhotosSection 
              exteriorComments={report.generalPhotosExteriorComments}
              interiorComments={report.generalPhotosInteriorComments}
              engineComments={report.generalPhotosEngineComments}
              exteriorImages={report.generalPhotosExteriorImages}
              interiorImages={report.generalPhotosInteriorImages}
              engineImages={report.generalPhotosEngineImages}
              onExteriorCommentsChange={(c) => updateReport({ generalPhotosExteriorComments: c }, false)}
              onInteriorCommentsChange={(c) => updateReport({ generalPhotosInteriorComments: c }, false)}
              onEngineCommentsChange={(c) => updateReport({ generalPhotosEngineComments: c }, false)}
              onExteriorImagesChange={(imgs) => updateReport({ generalPhotosExteriorImages: imgs }, false)}
              onInteriorImagesChange={(imgs) => updateReport({ generalPhotosInteriorImages: imgs }, false)}
              onEngineImagesChange={(imgs) => updateReport({ generalPhotosEngineImages: imgs }, false)}
            />
          </div>
        );

      case 'section-electrical':
        return (
          <div key="section-electrical" className="scroll-mt-6">
            <ElectricalSection />
          </div>
        );

      case 'section-engine':
        return (
          <div key="section-engine" className="scroll-mt-6">
            <EngineSection 
              initialComments={report.engineComments}
              onCommentsChange={(c) => updateReport({ engineComments: c }, false)}
            />
          </div>
        );

      case 'section-transmission':
        return (
          <div key="section-transmission" className="scroll-mt-6">
            <TransmissionSection 
              initialComments={report.transmissionComments}
              onCommentsChange={(c) => updateReport({ transmissionComments: c }, false)}
              items={report.transmissionItems as Record<string, any>}
              onItemChange={(id, data) => {
                const currentItems = report.transmissionItems || {};
                updateReport({
                  transmissionItems: {
                    ...currentItems,
                    [id]: { ...currentItems[id], ...data } as any
                  }
                }, false);
              }}
              customHeadlines={report.customHeadlines}
              onCustomHeadlinesChange={(headlines) => updateReport({ customHeadlines: headlines }, false)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const selectedMediaCount = mediaFiles.filter(m => m.selected).length;

  return (
    <div 
      className={`min-h-screen xl:h-screen bg-[#F8F9FB] bg-dot-pattern flex flex-col xl:flex-row p-2.5 sm:p-4 pl-2.5 sm:pl-4 md:pl-[106px] gap-3 sm:gap-4 overflow-x-hidden overflow-y-auto xl:overflow-hidden ${familjen.className}`}
      onMouseMove={handleAppMouseMove}
    >
      {/* Hidden Card Image Selector Input */}
      <input
        type="file"
        ref={cardFileInputRef}
        onChange={handleCardFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-sm font-semibold backdrop-blur-md ${
              toastMessage.type === 'success' ? 'bg-[#E8F8EE] border-[#B3EBC8] text-[#1E7E34]' :
              toastMessage.type === 'error' ? 'bg-[#FDECEC] border-[#F8B6B6] text-[#C53030]' :
              'bg-[#1E1035] border-purple-900 text-white'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 size={18} />}
            {toastMessage.type === 'error' && <AlertCircle size={18} />}
            {toastMessage.type === 'info' && <Info size={18} />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[76px] bg-white border-t border-slate-100 flex items-center justify-around px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-2 print:hidden">
        <button 
          onClick={() => setActiveTab(activeTab === 'edit' ? 'view' : 'edit')}
          className="flex flex-col items-center justify-center gap-1.5 w-16 h-full text-[#180321] opacity-70 hover:opacity-100 transition-opacity"
        >
          <Home size={22} fill={activeTab === 'edit' ? "currentColor" : "none"} strokeWidth={2} />
          <span className="text-[10px] font-medium">{activeTab === 'edit' ? 'View' : 'Edit'}</span>
        </button>
        <button 
          onClick={() => setIsGalleryOpen(!isGalleryOpen)}
          className={`flex flex-col items-center justify-center gap-1.5 w-16 h-full transition-all ${isGalleryOpen ? 'text-[#9723FF] opacity-100' : 'text-[#180321] opacity-50 hover:opacity-100'}`}
        >
          <ImageIcon size={22} strokeWidth={isGalleryOpen ? 2.5 : 2} className={isGalleryOpen ? 'drop-shadow-sm' : ''} />
          <span className="text-[10px] font-medium">Gallery</span>
        </button>
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center gap-1.5 w-16 h-full text-[#180321] opacity-60 hover:opacity-100 transition-opacity"
        >
          <Search size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Search</span>
        </button>
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="flex flex-col items-center justify-center gap-1.5 w-16 h-full text-[#180321] opacity-60 hover:opacity-100 transition-opacity"
        >
          <HelpCircle size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Help</span>
        </button>
      </nav>

      {/* 1. Icon Rail (Fixed Desktop) */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-[90px] flex-col justify-between items-center px-3 py-6 z-50 bg-white border-r border-slate-100 print:hidden">
        
        {/* Top Group: Search + Navigation Links */}
        <div className="flex flex-col justify-start items-center w-full">
          {/* Brand Logo */}
          <Link 
            href="/"
            title="CheckMyCar"
            className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shadow-xs relative hover:scale-105 active:scale-95 transition-all shrink-0 group cursor-pointer overflow-hidden"
          >
            <img 
              src="/assets/checkmycar-logo.png" 
              alt="CheckMyCar" 
              className="w-full h-full object-contain select-none" 
            />
          </Link>
          
          <div className="flex flex-col gap-5 w-full mt-7">
            {/* Dashboard / Home */}
            <Link 
              href="/"
              title="Return to Main Dashboard"
              className="w-full flex flex-col justify-start items-center gap-1 group cursor-pointer"
            >
              <div className="w-[46px] h-[46px] bg-[#F8F9FB] rounded-[14px] border border-[#E2E4EB] inline-flex justify-center items-center shadow-sm group-hover:bg-[#F3F4F6] transition-colors">
                <LayoutDashboard size={20} className="text-[#645A6C] group-hover:text-[#1E1035] transition-colors" />
              </div>
              <span className="text-center text-[#463B4D] text-[10.5px] font-semibold">Dashboard</span>
            </Link>

            {/* Reports Directory */}
            <Link 
              href="/#reports-section"
              title="All Reports Directory"
              className="w-full flex flex-col justify-start items-center gap-1 group cursor-pointer"
            >
              <div className="w-[46px] h-[46px] bg-[#F8F9FB] rounded-[14px] border border-[#E2E4EB] inline-flex justify-center items-center shadow-sm group-hover:bg-[#F3F4F6] transition-colors">
                <FileText size={20} className="text-[#645A6C] group-hover:text-[#1E1035] transition-colors" />
              </div>
              <span className="text-center text-[#463B4D] text-[10.5px] font-semibold">Reports</span>
            </Link>

            {/* Active Inspect Page Indicator / Toggle Active View */}
            <button 
              onClick={() => setActiveTab(prev => prev === 'edit' ? 'view' : 'edit')}
              className="w-full flex flex-col justify-start items-center gap-1 group cursor-pointer"
              title={activeTab === 'edit' ? 'Switch to Live PDF Preview' : 'Switch to Interactive Editor'}
            >
              <div className="w-[46px] h-[46px] bg-[#9723FF] text-white rounded-[14px] inline-flex justify-center items-center shadow-md shadow-purple-500/20 ring-2 ring-purple-300 transition-all">
                {activeTab === 'edit' ? <Pencil size={20} /> : <Eye size={20} />}
              </div>
              <span className="text-center text-[#9723FF] text-[10.5px] font-bold">
                {activeTab === 'edit' ? 'Edit Mode' : 'Preview'}
              </span>
            </button>

            {/* Gallery Drawer Toggle */}
            <button 
              onClick={() => setIsGalleryOpen(!isGalleryOpen)}
              className="w-full flex flex-col justify-start items-center gap-1 group cursor-pointer"
              title={isGalleryOpen ? 'Hide Media Gallery' : 'Show Media Gallery'}
            >
              <div className={`w-[46px] h-[46px] bg-[#F8F9FB] rounded-[14px] border border-[#E2E4EB] inline-flex justify-center items-center shadow-sm transition-all ${isGalleryOpen ? 'bg-[#F3F4F6] ring-2 ring-[#1E1035]' : 'group-hover:bg-[#F3F4F6]'}`}>
                <div className="w-[24px] h-[24px] bg-[#180321] rounded-[7px] flex items-center justify-center overflow-hidden">
                  <ImageIcon size={14} strokeWidth={2.5} className="text-white" />
                </div>
              </div>
              <span className="text-center text-[#463B4D] text-[10.5px] font-semibold">Gallery</span>
            </button>
          </div>
        </div>

        {/* Bottom Group: Help Guide */}
        <button 
          onClick={() => setIsHelpOpen(true)}
          title="Inspection SOP & Shortcuts Help"
          className="w-9 h-9 rounded-full bg-[#9CA3AF] hover:bg-[#85808B] transition-colors flex items-center justify-center text-white text-[15px] font-bold shadow-sm mb-2 cursor-pointer"
        >
          ?
        </button>
      </nav>

      {/* Main Workspace Area containing header + 3 columns */}
      <div className="flex-1 flex flex-col gap-3 sm:gap-4 overflow-visible xl:overflow-hidden min-w-0">
        
        {/* Top Header */}
        <header className="relative w-full min-h-[64px] sm:min-h-[72px] h-auto bg-white rounded-[20px] sm:rounded-[24px] shadow-sm border border-slate-100 shrink-0 flex flex-wrap xl:flex-nowrap items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 xl:py-0 gap-3 xl:gap-0 z-10 print:hidden">
          
          {/* Left Section with Breadcrumb */}
          <div className="flex items-center gap-3 md:gap-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E1035] text-xs font-bold transition-all border border-slate-200/70 shrink-0"
              title="Go back to Dashboard"
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              <span>Dashboard</span>
            </Link>
            
            <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] md:text-[18px] font-bold text-[#1E1035] tracking-tight">{report.title}</h1>
                <button 
                  onClick={() => setIsHelpOpen(true)}
                  className="w-5 h-5 rounded-full bg-[#EBDCF9] flex items-center justify-center text-[#9723FF] hover:bg-[#D9A8FF] transition-colors"
                  title="View report details"
                >
                  <Info size={12} strokeWidth={3} />
                </button>
                {report.status === 'published' && (
                  <span className="bg-[#E8F8EE] text-[#1E7E34] border border-[#B3EBC8] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Published
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Cloud 
                  size={12} 
                  className={`transition-colors ${saveStatus === 'saving' ? 'text-amber-500 animate-pulse' : 'text-[#1E1035]'}`} 
                  strokeWidth={2.5} 
                />
                <span className="text-[11px] font-semibold text-[#1E1035]">
                  {saveStatus === 'saving' ? 'Saving changes...' : report.lastSavedAt}
                </span>
              </div>
            </div>
          </div>

          {/* Tools Center Bar */}
          <div className="flex xl:absolute xl:left-1/2 xl:-translate-x-1/2 items-center justify-center gap-2 sm:gap-3 order-last xl:order-none w-full xl:w-auto mt-2 xl:mt-0">
            {/* Edit/View Toggle */}
            <div className="p-1 bg-[#F3F4F9] rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#CFD2DF] inline-flex justify-start items-center gap-1 shadow-sm">
              <button 
                onClick={() => setActiveTab('edit')}
                className="relative w-10 h-10 rounded-xl flex justify-center items-center transition-opacity cursor-pointer"
                style={{ opacity: activeTab === 'edit' ? 1 : 0.5 }}
                title="Edit Report"
              >
                {activeTab === 'edit' && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-gradient-to-tr from-black to-fuchsia-950 rounded-[12px] outline outline-1 outline-offset-[-1px] outline-slate-300 shadow-sm"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <div className="relative z-10 w-6 h-6 flex flex-col items-center justify-center">
                  <PencilIcon size={14} className={`absolute top-1 ml-[3px] transition-colors ${activeTab === 'edit' ? 'text-white' : 'text-[#180321]'}`} />
                  <div className={`w-4 h-[2px] absolute bottom-[1px] rounded-full transition-colors ${activeTab === 'edit' ? 'bg-white opacity-50' : 'bg-[#180321] opacity-30'}`}></div>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('view')}
                className="relative w-10 h-10 rounded-xl flex justify-center items-center transition-opacity cursor-pointer"
                style={{ opacity: activeTab === 'view' ? 1 : 0.5 }}
                title="Preview Live Document"
              >
                {activeTab === 'view' && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-gradient-to-tr from-black to-fuchsia-950 rounded-[12px] outline outline-1 outline-offset-[-1px] outline-slate-300 shadow-sm"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <div className="relative z-10 w-6 h-6 flex items-center justify-center">
                  <EyeIcon size={20} className={`transition-colors ${activeTab === 'view' ? 'text-white' : 'text-[#180321]'}`} />
                </div>
              </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            {/* Undo / Redo */}
            <div className="flex items-center gap-2">
              <button 
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="w-10 h-10 bg-[#F4F5F8] rounded-[14px] flex items-center justify-center text-[#74768B] hover:bg-[#E9EAF2] hover:text-[#1E1035] transition-colors border border-slate-100 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCcw size={16} />
              </button>
              <button 
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="w-10 h-10 bg-[#F4F5F8] rounded-[14px] flex items-center justify-center text-[#74768B] hover:bg-[#E9EAF2] hover:text-[#1E1035] transition-colors border border-slate-100 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCw size={16} />
              </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            {/* Print / Download */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrint}
                title="Print Report (PDF)"
                className="w-10 h-10 bg-[#F4F5F8] rounded-[14px] flex items-center justify-center text-[#1E1035] hover:bg-[#E9EAF2] transition-colors border border-slate-100 shadow-sm cursor-pointer"
              >
                <Printer size={16} strokeWidth={2.5} />
              </button>
              <button 
                onClick={handleDownload}
                title="Download JSON Report Data"
                className="w-10 h-10 bg-[#F4F5F8] rounded-[14px] flex items-center justify-center text-[#74768B] hover:bg-[#E9EAF2] hover:text-[#1E1035] transition-colors border border-slate-100 shadow-sm cursor-pointer"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex border-2 border-[#92a2f6] p-[2px] rounded-full shrink-0 size-[38px] sm:size-[42px] items-center justify-center">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="size-full object-cover rounded-full" />
            </div>
            <button 
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="bg-[#f1f2f6] border border-[#cfd2e0] flex items-center justify-center px-3 sm:px-[20px] py-2 sm:py-[12px] rounded-[14px] sm:rounded-[16px] text-[#3e045a] hover:bg-[#e4e5e9] transition-colors whitespace-nowrap cursor-pointer text-xs font-bold"
            >
              <span>Reset <span className="hidden sm:inline">Report</span></span>
            </button>
            <button 
              type="button"
              onClick={handlePublish}
              className="bg-[#3e045a] border border-[#cfd2e0] flex items-center justify-center gap-1.5 px-3.5 sm:px-[24px] py-2 sm:py-[12px] rounded-[14px] sm:rounded-[16px] text-white hover:bg-[#2c0340] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer shadow-sm text-xs font-bold"
            >
              <span>Publish</span>
              <FileText size={15} className="hidden sm:block" />
            </button>
          </div>
        </header>

        {/* 3 Columns Layout or Preview */}
        <div className="flex-1 flex flex-col xl:flex-row gap-4 overflow-visible xl:overflow-hidden pb-32 md:pb-6 xl:pb-0 custom-scrollbar relative">
          
          {activeTab === 'edit' ? (
            <>
              {/* 2. Media Drawer */}
              <div 
                className={`shrink-0 overflow-hidden transition-all duration-500 ease-in-out ${
                  isGalleryOpen 
                    ? 'max-h-[600px] xl:max-h-none w-full xl:max-w-[310px] opacity-100' 
                    : 'max-h-0 xl:max-h-none w-full xl:max-w-0 opacity-0'
                }`}
              >
                <div className="w-full xl:w-[310px] bg-white rounded-[32px] shadow-sm flex flex-col p-5 z-10 border border-slate-100 h-[400px] xl:h-full">
                  
                  {mediaFiles.length > 0 && (
                    <div className="flex justify-between items-center mb-4 shrink-0 h-[48px]">
                      {selectedMediaCount > 0 ? (
                        <>
                          <div className="flex flex-col">
                            <h3 className="text-[#1E1035] text-[16px] font-bold tracking-tight leading-tight">{selectedMediaCount} Media Selected</h3>
                            <button 
                              onClick={toggleSelectAllMedia}
                              className="flex items-center gap-1 mt-1 text-[#3b59ff] group w-fit"
                            >
                              <Check size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                              <span className="text-[12px] font-bold leading-tight underline decoration-1 underline-offset-2">{mediaFiles.every(m => m.selected) ? 'Deselect All' : 'Select All'}</span>
                            </button>
                          </div>
                          <button 
                            onClick={deleteSelectedMedia}
                            className="w-[48px] h-[48px] rounded-[16px] bg-[#c50000] hover:bg-[#a00000] flex items-center justify-center text-white transition-colors cursor-pointer shadow-sm"
                            title="Delete Selected"
                          >
                            <Trash2 size={20} strokeWidth={2} />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <h3 className="text-[#1E1035] text-[16px] font-bold tracking-tight leading-tight">{mediaFiles.length} Media</h3>
                            <p className="text-[#74768B] text-[12px] font-medium leading-tight mt-0.5">Click + to add more</p>
                          </div>
                          <button 
                            onClick={() => galleryFileInputRef.current?.click()}
                            className="w-[48px] h-[48px] rounded-[16px] bg-[#3e045a] hover:bg-[#280445] flex items-center justify-center text-white transition-colors cursor-pointer"
                            title="Add Media Files"
                          >
                            <Plus size={20} strokeWidth={2.5} />
                          </button>
                        </>
                      )}
                    </div>
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
                      onChange={(e) => handleGalleryFiles(e.target.files)} 
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
                            className="w-48 h-auto object-contain pointer-events-none"
                          />
                        </div>
                        
                        <h2 className="text-[#1E1035] text-[20px] font-bold mb-1">It&apos;s empty in here.</h2>
                        <p className="text-[#A0A4AB] text-[12px] mb-4">Add some media to bring this album to life.</p>
                        <button 
                          onClick={() => galleryFileInputRef.current?.click()}
                          className="bg-[#3e045a] text-white px-8 py-4 rounded-[16px] flex items-center gap-2 text-[12px] font-medium font-['Familjen_Grotesk'] hover:bg-[#281446] transition-colors shadow-sm"
                        >
                          Add Media <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
                        <div className="grid grid-cols-2 gap-[10px]">
                          {mediaFiles.map((media) => (
                            <div 
                              key={media.id} 
                              className="relative group rounded-[16px] overflow-hidden aspect-square border border-[#cfd2e0] bg-slate-100"
                            >
                              <img 
                                src={media.url} 
                                alt={media.name} 
                                className={`w-full h-full object-cover transition-all ${media.status === 'uploading' ? 'scale-105 blur-[2px]' : 'scale-100'}`} 
                              />
                              
                              {media.status === 'uploading' && (
                                <div className="absolute inset-0 bg-black/10 flex flex-col justify-between p-2 z-10">
                                  <div className="flex justify-end w-full">
                                    <button 
                                      onClick={() => removeMedia(media.id)}
                                      className="bg-[#fae5e6] text-red-500 p-1 rounded-[8px] hover:bg-red-100 transition-colors cursor-pointer border border-[#cfd2e0]"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  <div className="flex flex-col gap-1 w-full bg-black/40 p-2 rounded-xl backdrop-blur-[2px]">
                                    <span className="text-white text-[11px] font-medium tracking-wide font-['Familjen_Grotesk']">Uploading.....</span>
                                    <div className="flex items-center gap-1.5 w-full">
                                      <div className="h-[3px] bg-[#f1f2f6]/60 flex-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-white rounded-full" style={{ width: `${media.progress}%` }} />
                                      </div>
                                      <span className="text-white text-[11px] font-medium font-['Familjen_Grotesk'] whitespace-nowrap">{media.progress} %</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {media.status === 'completed' && (
                                <>
                                  {/* Top right delete button visible on hover */}
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button 
                                      onClick={() => removeMedia(media.id)}
                                      className="bg-[#fae5e6] text-red-500 p-1 rounded-[8px] hover:bg-red-100 transition-colors cursor-pointer shadow-sm border border-[#cfd2e0]"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  
                                  {/* Center checkmark toggle */}
                                  <div className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-200 ${media.selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <button
                                      onClick={() => toggleMediaSelect(media.id)}
                                      className={`p-1.5 rounded-full shadow-sm flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                                        media.selected 
                                          ? 'bg-white border-white scale-110 shadow-md' 
                                          : 'backdrop-blur-[2px] bg-black/40 border-white/60 hover:bg-black/60 hover:scale-110'
                                      } border`}
                                    >
                                      <Check size={18} className={media.selected ? "text-[#3e045a]" : "text-white"} strokeWidth={media.selected ? 3.5 : 2} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* 3. Main Content Canvas */}
              <main className="flex-1 flex flex-col overflow-visible xl:overflow-hidden min-w-0 xl:min-w-[500px]">
                <div className="flex-1 overflow-visible xl:overflow-y-auto custom-scrollbar xl:pr-3 xl:pb-6 space-y-6">
                  {/* Dynamic Interchangeable Inspection Sections */}
                  {sectionOrder.map((secId) => (
                    <div key={secId} className="transition-all duration-300">
                      {renderInspectionSection(secId)}
                    </div>
                  ))}
                  
                </div>
              </main>

              {/* 4. Right Sidebar Container with Segmented Tabs */}
              <aside 
                id="sidebar-inspector-controls"
                className="w-full xl:w-[336px] flex flex-col gap-4 h-auto xl:h-full overflow-visible xl:overflow-y-auto custom-scrollbar shrink-0 z-10 pb-20 xl:pb-0"
              >
                <InspectorSidebarTabs 
                  activeTab={activeSidebarTab}
                  onTabChange={setActiveSidebarTab}
                  sectionOrder={sectionOrder}
                  onSectionOrderChange={handleSectionOrderChange}
                  report={report}
                  onUpdateClientDetails={(details) => updateReport({
                    clientDetails: { ...report.clientDetails, ...details }
                  })}
                  onUpdateTeamDetails={(details) => updateReport({
                    teamDetails: { ...report.teamDetails, ...details }
                  })}
                  countryCodeOptions={countryCodeOptions}
                  locationOptions={locationOptions}
                  inspectorOptions={inspectorOptions}
                />
              </aside>
            </>
          ) : (
            <>
              {/* Preview Mode */}
              <div 
                ref={previewScrollRef}
                onScroll={handlePreviewScroll}
                className="flex-1 flex justify-center w-full h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] xl:px-4 pb-10 xl:pb-0"
              >
                <div 
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`, 
                    transition: 'transform 0.15s ease-out',
                    transformOrigin: 'top center'
                  }} 
                  className="w-full max-w-[900px] flex justify-center"
                >
                  <ReportPreview 
                    tyres={report.tyres} 
                    rims={report.rims} 
                    brakes={report.brakes}
                    vehicleData={report.vehicleSummary}
                    inspectionDetails={report.inspectionDetails}
                    clientDetails={report.clientDetails}
                    overviewStats={report.reportOverview}
                    report={report}
                  />
                </div>
              </div>

              {/* Right Floating Controls for Preview */}
              <aside className="hidden xl:block absolute inset-0 pointer-events-none z-10 print:hidden">
                <div className="flex flex-col items-center bg-white rounded-[24px] shadow-lg border border-slate-100 p-3 w-[80px] gap-4 absolute top-1/2 -translate-y-1/2 right-6 pointer-events-auto">
                  {/* Page Stepper */}
                  <div className="flex flex-col items-center gap-2 w-full">
                    <button 
                      onClick={handlePrevPage} 
                      disabled={previewPage <= 1}
                      title="Previous Page"
                      aria-label="Previous Page"
                      className="w-[40px] h-[40px] rounded-xl flex items-center justify-center text-[#1E1035] hover:bg-[#F4F5F8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronUp size={22} strokeWidth={2.5} />
                    </button>
                    <div className="flex flex-col items-center">
                      <span className="text-[14px] font-bold text-[#1E1035] leading-none">{String(previewPage).padStart(2, '0')}</span>
                      <div className="w-4 h-px bg-slate-200 my-1"></div>
                      <span className="text-[12px] font-semibold text-[#A0A4AB] leading-none">{String(totalPreviewPages).padStart(2, '0')}</span>
                    </div>
                    <button 
                      onClick={handleNextPage} 
                      disabled={previewPage >= totalPreviewPages}
                      title="Next Page"
                      aria-label="Next Page"
                      className="w-[40px] h-[40px] rounded-xl flex items-center justify-center text-[#1E1035] hover:bg-[#F4F5F8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronDown size={22} strokeWidth={2.5} />
                    </button>
                  </div>
                  
                  <div className="w-[44px] h-px bg-slate-200"></div>
                  
                  {/* Zoom Controls */}
                  <div className="flex flex-col items-center gap-2 w-full">
                    <button 
                      onClick={handleZoomIn} 
                      title="Zoom In"
                      className="w-[40px] h-[40px] rounded-xl flex items-center justify-center text-[#1E1035] hover:bg-[#F4F5F8] transition-colors cursor-pointer"
                    >
                      <ZoomIn size={20} strokeWidth={2} />
                    </button>
                    <button 
                      onClick={handleZoomReset} 
                      title="Reset Zoom (100%)"
                      className="text-[10px] font-bold text-slate-500 hover:text-[#1E1035] py-0.5"
                    >
                      {zoomLevel}%
                    </button>
                    <button 
                      onClick={handleZoomOut} 
                      title="Zoom Out"
                      className="w-[40px] h-[40px] rounded-xl flex items-center justify-center text-[#1E1035] hover:bg-[#F4F5F8] transition-colors cursor-pointer"
                    >
                      <ZoomOut size={20} strokeWidth={2} />
                    </button>
                  </div>
                </div>

              </aside>
            </>
          )}
        </div>
      </div>


      {/* MODAL 1: Spotlight Quick Jump Search */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-[540px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
            >
              <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Jump to section (e.g. Tyres, Body, Electrical, VIN...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm text-[#1E1035] placeholder-slate-400 outline-none"
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                {filteredSearchSections.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No matching sections found</div>
                ) : (
                  filteredSearchSections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setActiveTab('edit');
                        setTimeout(() => {
                          document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#F4F5F8] text-left transition-colors group cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-[#1E1035] group-hover:text-[#9723FF] transition-colors">{sec.title}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{sec.category}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Inspection SOP Help Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[620px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EBDCF9] text-[#9723FF] flex items-center justify-center font-bold">
                    ?
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1E1035]">Inspector&apos;s Field Guide</h2>
                    <span className="text-xs text-slate-400">Orbbion Quality Assurance Protocols</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status Definitions */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rating Scale</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#E8F8EE] rounded-2xl border border-[#B3EBC8] flex items-start gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#5BC335] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-[#1E7E34] block">PASS</span>
                      <span className="text-[11px] text-[#285e36]">Meets OEM specifications with no immediate hazard or repair required.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#FEF4E6] rounded-2xl border border-[#FCD8A5] flex items-start gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#FE8E4B] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-[#A84B05] block">FAIL</span>
                      <span className="text-[11px] text-[#7A3603]">Severe wear, structural damage, or critical defect detected.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#FFFEEB] rounded-2xl border border-[#FEEA85] flex items-start gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#FFED00] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-[#856404] block">WEAK</span>
                      <span className="text-[11px] text-[#634A00]">Moderate wear nearing service limit (e.g. tyre tread &lt; 3mm).</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#F4F5F8] rounded-2xl border border-[#E2E4EB] flex items-start gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#D3D3D3] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-slate-600 block">N/A</span>
                      <span className="text-[11px] text-slate-500">Feature or equipment not equipped on this particular vehicle.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Undo Action</span>
                    <kbd className="px-2 py-1 bg-white border rounded shadow-xs font-mono font-bold">Ctrl + Z</kbd>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-600">Redo Action</span>
                    <kbd className="px-2 py-1 bg-white border rounded shadow-xs font-mono font-bold">Ctrl + Y</kbd>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="w-full bg-[#1E1035] text-white py-3 rounded-2xl font-bold text-sm hover:bg-[#2A154A] transition-colors"
              >
                Got it, close guide
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Reset Report Confirmation */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col gap-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <h2 className="text-[18px] font-bold text-[#1E1035]">Reset Inspection Report?</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                This action will restore all fields, tyres, rims, and body notes to clean default values. Any custom comments and attached photos will be cleared.
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetReport(initialReportData);
                    handleSectionOrderChange(DEFAULT_SECTION_ORDER);
                    setIsResetConfirmOpen(false);
                    showToast('Report reset to clean defaults', 'info');
                  }}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-sm"
                >
                  Reset All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Publish Celebration & Share */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[500px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col gap-5 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#E8F8EE] text-[#1E7E34] flex items-center justify-center mx-auto shadow-sm">
                <FileCheck size={28} />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-[#1E1035]">Report #{report.id} Published!</h2>
                <p className="text-xs text-slate-500 mt-1">
                  The inspection certificate is verified and ready for client delivery.
                </p>
              </div>

              {/* Share URL Box */}
              <div className="flex items-center gap-2 bg-[#F4F5F8] p-2.5 rounded-2xl border border-[#E2E4EB]">
                <span className="text-xs text-slate-600 font-mono flex-1 text-left truncate pl-2">
                  https://checkmycar.ae/report/{report.id}
                </span>
                <button
                  type="button"
                  onClick={copyPublishLink}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#1E1035] hover:bg-slate-50 flex items-center gap-1 transition-colors"
                >
                  {isCopied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPublishModalOpen(false);
                    setActiveTab('view');
                  }}
                  className="flex-1 py-3 rounded-2xl bg-[#1E1035] text-white text-sm font-bold hover:bg-[#2C184A] transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View Live Preview
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-5 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Bottom-Right Support Badge */}
      <SupportBadge />

    </div>
  );
}
