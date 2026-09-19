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
  ExternalLink, Sparkles, ArrowLeft, LayoutDashboard, UserCheck, Users, Hash, ListOrdered,
  ArrowRightLeft,
} from 'lucide-react';
import { MediaConnectionProvider, useMediaConnection } from '@/lib/media-connection-context';
import { MediaAssignModal } from '@/components/ui/media-assign-modal';
import { MediaGalleryPickerModal } from '@/components/ui/media-gallery-picker-modal';
import { EyeIcon } from '@/components/ui/eye-icon';
import { PencilIcon } from '@/components/ui/pencil-icon';
import { GalleryIcon } from '@/components/ui/gallery-icon';
import { InputField } from '@/components/ui/input-field';
import { DatePickerInput, parseDate } from '@/components/ui/date-picker-input';
import { TimePickerInput, parseTimeString } from '@/components/ui/time-picker-input';
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
import { FullInspectionReport } from '@/lib/inspection-types';
import { getStoredReports, upsertStoredReport, convertFullReportToListItem } from '@/lib/reports-data';
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
  initialReportsList,
} from '@constants';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed';
  selected?: boolean;
}

function InspectDashboardContent({
  history,
  toastMessage,
  showToast,
}: {
  history: ReturnType<typeof useInspectionHistory>;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const {
    report,
    updateReport,
    undo,
    redo,
    resetReport,
    canUndo,
    canRedo,
    saveStatus,
  } = history;

  const {
    mediaFiles,
    filter,
    setFilter,
    filteredMediaFiles,
    selectedMediaCount,
    toggleMediaSelect,
    toggleSelectAllMedia,
    getMediaUsage,
    addDirectUpload,
    addMediaFiles,
    removeMedia,
    deleteSelectedMedia,
    startDraggingMedia,
    endDraggingMedia,
    openGalleryPicker,
    openAssignModal,
  } = useMediaConnection();

  // Tab & Gallery State
  const [activeTab, setActiveTab] = useState<'edit' | 'view'>('edit');
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTabId>('sections');
  const [activeLeftDrawer, setActiveLeftDrawer] = useState<'sections' | 'gallery' | null>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      return null;
    }
    return 'sections';
  });
  const isSectionsOpen = activeLeftDrawer === 'sections';
  const isGalleryOpen = activeLeftDrawer === 'gallery';
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
  const previewScrollRef = useRef<HTMLDivElement>(null);

  // Dialogs & Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  // Handle ?new=true or ?id=... or ?tab=view from navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id');
    const isNew = params.get('new') === 'true';
    const tabParam = params.get('tab');

    if (tabParam === 'view') {
      setActiveTab('view');
    }

    if (isNew) {
      const newId = `CMC-${Math.floor(1000 + Math.random() * 9000)}`;
      const freshReport: FullInspectionReport = {
        ...initialReportData,
        id: newId,
        title: `Report #${newId}`,
        status: 'draft',
        lastSavedAt: 'Created just now',
        inspectionDetails: {
          ...initialReportData.inspectionDetails,
          date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        },
      };
      resetReport(freshReport);
      upsertStoredReport(convertFullReportToListItem(freshReport));
      window.history.replaceState({}, '', '/inspect');
      showToast(`Started new inspection session (${newId})`, 'info');
      return;
    }

    if (requestedId && requestedId !== report.id) {
      const catalog = getStoredReports();
      const match = catalog.find(r => r.id === requestedId || r.reportNumber === requestedId);
      if (match) {
        const loadedReport: FullInspectionReport = {
          ...initialReportData,
          id: match.id,
          title: `Report #${match.reportNumber || match.id}`,
          status: match.status,
          lastSavedAt: 'Loaded from catalog',
          inspectionDetails: {
            ...initialReportData.inspectionDetails,
            date: match.date || initialReportData.inspectionDetails.date,
            time: match.time || initialReportData.inspectionDetails.time,
            inspectionType: match.inspectionType || initialReportData.inspectionDetails.inspectionType,
            vinNumber: match.vehicle?.vin || initialReportData.inspectionDetails.vinNumber,
          },
          vehicleSummary: {
            ...initialReportData.vehicleSummary,
            make: match.vehicle?.make || initialReportData.vehicleSummary.make,
            model: match.vehicle?.model || initialReportData.vehicleSummary.model,
            year: String(match.vehicle?.year || initialReportData.vehicleSummary.year),
            vehicleType: match.vehicle?.type || initialReportData.vehicleSummary.vehicleType,
            externalColour: match.vehicle?.color || initialReportData.vehicleSummary.externalColour,
            transmission: match.vehicle?.transmission || initialReportData.vehicleSummary.transmission,
            regionalSpecs: match.vehicle?.specs || initialReportData.vehicleSummary.regionalSpecs,
            odometerStatus: match.vehicle?.odometerStatus || initialReportData.vehicleSummary.odometerStatus,
            odometerReading: match.vehicle?.odometer ? match.vehicle.odometer.replace(/[^0-9]/g, '') : initialReportData.vehicleSummary.odometerReading,
          },
          clientDetails: {
            ...initialReportData.clientDetails,
            name: match.client?.name || initialReportData.clientDetails.name,
            whatsappNumber: match.client?.phone || initialReportData.clientDetails.whatsappNumber,
            email: match.client?.email || initialReportData.clientDetails.email,
            location: match.client?.location || initialReportData.clientDetails.location,
          },
          teamDetails: {
            inspector: match.inspector?.name || initialReportData.teamDetails.inspector,
          },
          reportOverview: {
            ...initialReportData.reportOverview,
            pass: String(match.passPercentage),
            fail: String(match.failPercentage),
          },
        };
        resetReport(loadedReport);
        showToast(`Loaded ${match.vehicle.year} ${match.vehicle.make} ${match.vehicle.model} (${match.id})`, 'info');
      }
    }
  }, [resetReport, showToast, report.id]);

  // Dynamic calculation of Pass/Fail Overview
  const calculatedStats = useMemo(() => {
    const allItems: (InspectionState | null)[] = [
      ...(report.tyres ? Object.values(report.tyres) : []).map(i => i?.status ?? null),
      ...(report.rims ? Object.values(report.rims) : []).map(i => i?.status ?? null),
      ...(report.brakes ? Object.values(report.brakes) : []).map(i => i?.status ?? null),
    ];
    const total = allItems.filter(s => s !== null && s !== 'na').length;
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

  // Hydrate report by query param id if opened from dashboard
  const hydratedFromUrlRef = useRef(false);
  useEffect(() => {
    if (hydratedFromUrlRef.current) return;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const reportId = urlParams.get('id');
      if (reportId && initialReportsList) {
        const matchedItem = initialReportsList.find(r => r.id === reportId);
        if (matchedItem) {
          hydratedFromUrlRef.current = true;
          updateReport({
            id: matchedItem.id,
            title: `${matchedItem.vehicle.year} ${matchedItem.vehicle.make} ${matchedItem.vehicle.model}`,
            status: matchedItem.status,
            inspectionDetails: {
              ...report.inspectionDetails,
              date: matchedItem.date,
              time: matchedItem.time,
              inspectionType: matchedItem.inspectionType,
              vinNumber: matchedItem.vehicle.vin,
            },
            vehicleSummary: {
              ...report.vehicleSummary,
              make: matchedItem.vehicle.make,
              model: matchedItem.vehicle.model,
              year: String(matchedItem.vehicle.year),
              vehicleType: matchedItem.vehicle.type,
              externalColour: matchedItem.vehicle.color,
              transmission: matchedItem.vehicle.transmission,
              regionalSpecs: matchedItem.vehicle.specs,
              odometerReading: matchedItem.vehicle.odometer.replace(/[^\d,]/g, '').trim(),
              odometerStatus: matchedItem.vehicle.odometerStatus,
            },
            clientDetails: {
              ...report.clientDetails,
              name: matchedItem.client.name,
              location: matchedItem.client.location,
              email: matchedItem.client.email,
              whatsappNumber: matchedItem.client.phone,
              vehicleDetails: `${matchedItem.vehicle.year} ${matchedItem.vehicle.make} ${matchedItem.vehicle.model}`,
            },
            teamDetails: {
              ...report.teamDetails,
              inspector: matchedItem.inspector.name,
            },
            reportOverview: {
              ...report.reportOverview,
              pass: String(matchedItem.passPercentage),
              fail: String(matchedItem.failPercentage),
            },
          }, false);
        }
      }
    }
  }, [report.inspectionDetails, report.vehicleSummary, report.clientDetails, report.teamDetails, report.reportOverview, updateReport]);

  // Dynamic calculation of total preview pages (up to 12)
  const totalPreviewPages = useMemo(() => {
    let pages = 4; // Cover, Vehicle Summary, Tyres, Rims
    if (report.brakes) pages++;
    if (report.chassisSubframePartStatuses) pages++;
    if (report.bodyPartStatuses) pages++;
    if (report.seatsStatus || report.interiorCustomHeadlines || report.seatsComments || report.interiorComments) pages++;
    if (report.engineItems) pages++;
    if (report.transmissionItems) pages++;
    if (report.electricalItems) pages++;
    if (
      report.generalPhotosExteriorImages?.length ||
      report.generalPhotosInteriorImages?.length ||
      report.generalPhotosEngineImages?.length ||
      report.generalPhotosExteriorComments ||
      report.generalPhotosInteriorComments ||
      report.generalPhotosEngineComments
    ) pages++;
    return Math.max(1, pages);
  }, [report]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 20, 50));
  const handleZoomReset = () => setZoomLevel(100);

  // Smooth Preview Page Navigation
  const scrollToPreviewPage = (pageNumber: number) => {
    const el = (previewScrollRef.current?.querySelector(`#preview-page-${pageNumber}`) as HTMLElement) || document.getElementById(`preview-page-${pageNumber}`);
    if (el) {
      if (previewScrollRef.current) {
        const container = previewScrollRef.current;
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offset = rect.top - containerRect.top + container.scrollTop;
        container.scrollTo({ top: Math.max(0, offset - 10), behavior: 'smooth' });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
    const pages = Array.from(target.querySelectorAll('[id^="preview-page-"]')) as HTMLElement[];
    if (pages.length === 0) return;
    const containerTop = target.scrollTop;
    let activePage = 1;
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (page.offsetTop - target.offsetTop <= containerTop + 150) {
        const match = page.id.match(/preview-page-(\d+)/);
        if (match) {
          activePage = parseInt(match[1], 10);
        }
      }
    }
    if (activePage !== previewPage) {
      setPreviewPage(activePage);
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

  // Dedicated Card File Upload Handler - synchronized with central media album
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

    // Automatically sync direct card upload into central media album
    const url = addDirectUpload(file, file.name);
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

  // Dedicated Choose Wheel Image From Gallery
  const handleChooseWheelImageFromGallery = (type: 'tyre' | 'rim' | 'brake', id: string, title: string) => {
    openGalleryPicker({
      title: `Select Photo for ${title}`,
      multiple: false,
      onSelect: (urls) => {
        if (urls.length > 0) {
          if (type === 'tyre') updateTyreData(id, { image: { url: urls[0], progress: 100 } });
          if (type === 'rim') updateRimData(id, { image: { url: urls[0], progress: 100 } });
          if (type === 'brake') updateBrakeData(id, { image: { url: urls[0], progress: 100 } });
          showToast(`Photo attached to ${title}`, 'success');
        }
      }
    });
  };

  // Safe Deletion Confirmation State for in-use photos
  interface DeleteConfirmState {
    type: 'single' | 'selected';
    id?: string;
    count: number;
    usageCount: number;
    usedTargets: string[];
  }

  const [deleteConfirmState, setDeleteConfirmState] = useState<DeleteConfirmState | null>(null);

  const handleRequestDeleteSingle = (media: MediaItem) => {
    const usage = getMediaUsage(media.url);
    if (usage.length > 0) {
      setDeleteConfirmState({
        type: 'single',
        id: media.id,
        count: 1,
        usageCount: usage.length,
        usedTargets: usage.map(u => `${u.label} (${u.section})`),
      });
    } else {
      removeMedia(media.id, false);
    }
  };

  const handleRequestDeleteSelected = () => {
    const selected = mediaFiles.filter(m => m.selected);
    if (selected.length === 0) return;

    const inUseList: string[] = [];
    let inUseCount = 0;
    selected.forEach(m => {
      const usage = getMediaUsage(m.url);
      if (usage.length > 0) {
        inUseCount++;
        usage.forEach(u => inUseList.push(`${u.label} (${u.section})`));
      }
    });

    if (inUseCount > 0) {
      setDeleteConfirmState({
        type: 'selected',
        count: selected.length,
        usageCount: inUseCount,
        usedTargets: Array.from(new Set(inUseList)),
      });
    } else {
      deleteSelectedMedia(false);
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addMediaFiles(e.dataTransfer.files);
    }
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
    window.print();
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

    if (report.inspectionDetails.date && !parseDate(report.inspectionDetails.date)) {
      showToast('Please enter a valid date in DD-MM-YYYY format.', 'error');
      document.getElementById('section-inspection-details')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (report.inspectionDetails.time && !parseTimeString(report.inspectionDetails.time)) {
      showToast('Please enter a valid time (e.g. 09:00 AM).', 'error');
      document.getElementById('section-inspection-details')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const rawVin = report.inspectionDetails.vinNumber || '';
    const cleanVin = rawVin.trim().toUpperCase();
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    if (!vinRegex.test(cleanVin)) {
      showToast('VIN must be exactly 17 alphanumeric characters (excluding I, O, Q).', 'error');
      document.getElementById('section-inspection-details')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const yearStr = String(report.vehicleSummary.year || '').trim();
    if (!yearStr) {
      showToast('Model Year is required.', 'error');
      document.getElementById('section-vehicle-summary')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const year = Number(yearStr);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      showToast(`Model Year must be between 1900 and ${currentYear + 1}.`, 'error');
      document.getElementById('section-vehicle-summary')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const updatedReport: FullInspectionReport = {
      ...report,
      inspectionDetails: { ...report.inspectionDetails, vinNumber: cleanVin },
      vehicleSummary: { ...report.vehicleSummary, year: String(year) },
      status: 'published'
    };
    updateReport(updatedReport);
    upsertStoredReport(convertFullReportToListItem(updatedReport));
    setIsPublishModalOpen(true);
    showToast('Inspection report published and certificate verified!', 'success');
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
                <DatePickerInput 
                  label="Date" 
                  required 
                  placeholder="DD-MM-YYYY"
                  dateFormat="DD-MM-YYYY"
                  value={report.inspectionDetails.date}
                  onChange={(dateVal) => updateReport({
                    inspectionDetails: { ...report.inspectionDetails, date: dateVal }
                  })}
                  className="w-full"
                />
                <TimePickerInput 
                  label="Time" 
                  required 
                  placeholder="09:00 AM" 
                  value={report.inspectionDetails.time}
                  onChange={(timeVal) => updateReport({
                    inspectionDetails: { ...report.inspectionDetails, time: timeVal }
                  })}
                  className="w-full"
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
              <InspectionDetailCard 
                title="Rear Right (RR)" 
                data={report.tyres.RR} 
                onChange={(d) => updateTyreData('RR', d)} 
                onImageClick={() => handleTyreImageClick('RR')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('tyre', 'RR', 'Tyre Rear Right (RR)')}
              />
              <InspectionDetailCard 
                title="Rear Left (RL)" 
                data={report.tyres.RL} 
                onChange={(d) => updateTyreData('RL', d)} 
                onImageClick={() => handleTyreImageClick('RL')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('tyre', 'RL', 'Tyre Rear Left (RL)')}
              />
              <InspectionDetailCard 
                title="Front Right (FR)" 
                data={report.tyres.FR} 
                onChange={(d) => updateTyreData('FR', d)} 
                onImageClick={() => handleTyreImageClick('FR')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('tyre', 'FR', 'Tyre Front Right (FR)')}
              />
              <InspectionDetailCard 
                title="Front Left (FL)" 
                data={report.tyres.FL} 
                onChange={(d) => updateTyreData('FL', d)} 
                onImageClick={() => handleTyreImageClick('FL')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('tyre', 'FL', 'Tyre Front Left (FL)')}
              />
              <InspectionDetailCard 
                title="Spare tyre (ST)" 
                data={report.tyres.ST} 
                onChange={(d) => updateTyreData('ST', d)} 
                onImageClick={() => handleTyreImageClick('ST')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('tyre', 'ST', 'Spare Tyre (ST)')}
              />
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
              <InspectionDetailCard 
                title="Rear Right (RR)" 
                data={report.rims.RR} 
                onChange={(d) => updateRimData('RR', d)} 
                onImageClick={() => handleRimImageClick('RR')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('rim', 'RR', 'Rim Rear Right (RR)')}
              />
              <InspectionDetailCard 
                title="Rear Left (RL)" 
                data={report.rims.RL} 
                onChange={(d) => updateRimData('RL', d)} 
                onImageClick={() => handleRimImageClick('RL')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('rim', 'RL', 'Rim Rear Left (RL)')}
              />
              <InspectionDetailCard 
                title="Front Right (FR)" 
                data={report.rims.FR} 
                onChange={(d) => updateRimData('FR', d)} 
                onImageClick={() => handleRimImageClick('FR')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('rim', 'FR', 'Rim Front Right (FR)')}
              />
              <InspectionDetailCard 
                title="Front Left (FL)" 
                data={report.rims.FL} 
                onChange={(d) => updateRimData('FL', d)} 
                onImageClick={() => handleRimImageClick('FL')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('rim', 'FL', 'Rim Front Left (FL)')}
              />
              <InspectionDetailCard 
                title="Spare tyre (ST)" 
                data={report.rims.ST} 
                onChange={(d) => updateRimData('ST', d)} 
                onImageClick={() => handleRimImageClick('ST')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('rim', 'ST', 'Rim Spare Tyre (ST)')}
              />
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
              <InspectionDetailCard 
                title="Rear Right (RR)" 
                data={report.brakes.RR} 
                onChange={(d) => updateBrakeData('RR', d)} 
                onImageClick={() => handleBrakeImageClick('RR')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('brake', 'RR', 'Brake Rear Right (RR)')}
              />
              <InspectionDetailCard 
                title="Rear Left (RL)" 
                data={report.brakes.RL} 
                onChange={(d) => updateBrakeData('RL', d)} 
                onImageClick={() => handleBrakeImageClick('RL')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('brake', 'RL', 'Brake Rear Left (RL)')}
              />
              <InspectionDetailCard 
                title="Front Right (FR)" 
                data={report.brakes.FR} 
                onChange={(d) => updateBrakeData('FR', d)} 
                onImageClick={() => handleBrakeImageClick('FR')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('brake', 'FR', 'Brake Front Right (FR)')}
              />
              <InspectionDetailCard 
                title="Front Left (FL)" 
                data={report.brakes.FL} 
                onChange={(d) => updateBrakeData('FL', d)} 
                onImageClick={() => handleBrakeImageClick('FL')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('brake', 'FL', 'Brake Front Left (FL)')}
              />
              <InspectionDetailCard 
                title="Spare tyre (ST)" 
                data={report.brakes.ST} 
                onChange={(d) => updateBrakeData('ST', d)} 
                onImageClick={() => handleBrakeImageClick('ST')} 
                onChooseFromGallery={() => handleChooseWheelImageFromGallery('brake', 'ST', 'Brake Spare Tyre (ST)')}
              />
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
              generalComments={report.bodyGeneralComments || ''}
              onGeneralCommentsChange={(c) => updateReport({ bodyGeneralComments: c }, false)}
              generalImages={report.bodyGeneralImages || []}
              onGeneralImagesChange={(imgs) => updateReport({ bodyGeneralImages: imgs }, false)}
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
              seatsComments={report.seatsComments || ''}
              onSeatsCommentsChange={(c) => updateReport({ seatsComments: c }, false)}
              seatsStatus={report.seatsStatus}
              onSeatsStatusChange={(s) => updateReport({ seatsStatus: s }, false)}
              seatsImages={report.seatsImages}
              onSeatsImagesChange={(imgs) => updateReport({ seatsImages: imgs }, false)}
              generalComments={report.interiorComments || ''}
              onGeneralCommentsChange={(c) => updateReport({ interiorComments: c }, false)}
              generalImages={report.interiorGeneralImages || []}
              onGeneralImagesChange={(imgs) => updateReport({ interiorGeneralImages: imgs }, false)}
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
            <ElectricalSection 
              initialComments={report.electricalComments || ''}
              onCommentsChange={(c) => updateReport({ electricalComments: c }, false)}
              generalImages={report.electricalGeneralImages || []}
              onGeneralImagesChange={(imgs) => updateReport({ electricalGeneralImages: imgs }, false)}
              items={report.electricalItems as any}
              onItemChange={(id, data) => {
                const currentItems = report.electricalItems || {};
                updateReport({
                  electricalItems: {
                    ...currentItems,
                    [id]: { ...currentItems[id], ...data } as any
                  }
                }, false);
              }}
              customHeadlines={report.electricalCustomHeadlines || []}
              onCustomHeadlinesChange={(h) => updateReport({ electricalCustomHeadlines: h }, false)}
            />
          </div>
        );

      case 'section-engine':
        return (
          <div key="section-engine" className="scroll-mt-6">
            <EngineSection 
              initialComments={report.engineComments || ''}
              onCommentsChange={(c) => updateReport({ engineComments: c }, false)}
              generalImages={report.engineGeneralImages || []}
              onGeneralImagesChange={(imgs) => updateReport({ engineGeneralImages: imgs }, false)}
              items={report.engineItems as any}
              onItemChange={(id, data) => {
                const currentItems = report.engineItems || {};
                updateReport({
                  engineItems: {
                    ...currentItems,
                    [id]: { ...currentItems[id], ...data } as any
                  }
                }, false);
              }}
              customHeadlines={report.engineCustomHeadlines || []}
              onCustomHeadlinesChange={(h) => updateReport({ engineCustomHeadlines: h }, false)}
            />
          </div>
        );

      case 'section-transmission':
        return (
          <div key="section-transmission" className="scroll-mt-6">
            <TransmissionSection 
              initialComments={report.transmissionComments}
              onCommentsChange={(c) => updateReport({ transmissionComments: c }, false)}
              generalImages={report.transmissionGeneralImages || []}
              onGeneralImagesChange={(imgs) => updateReport({ transmissionGeneralImages: imgs }, false)}
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
              customHeadlines={report.transmissionCustomHeadlines || []}
              onCustomHeadlinesChange={(headlines) => updateReport({ transmissionCustomHeadlines: headlines }, false)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderSectionsDrawerContent = (isMobileOverlay = false) => (
    <div className="w-full xl:w-[320px] h-full flex flex-col overflow-hidden">
      <InspectorSidebarTabs 
        className="h-full border-0 shadow-none"
        showTabs={isMobileOverlay}
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
        onSectionSelect={isMobileOverlay ? () => setActiveLeftDrawer(null) : undefined}
      />
    </div>
  );

  const renderGalleryDrawerContent = () => (
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
                    onClick={handleRequestDeleteSelected}
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
                  className={`flex-1 py-1.5 px-1 rounded-lg transition-all text-center cursor-pointer ${
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
                  className={`flex-1 py-1.5 px-1 rounded-lg transition-all text-center cursor-pointer ${
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
                  className={`flex-1 py-1.5 px-1 rounded-lg transition-all text-center cursor-pointer ${
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
                              handleRequestDeleteSingle(media);
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

  return (
    <>
      {/* Dedicated Print-Only Report Container: 100% pure A4 output matching Report Preview exactly */}
      <div className="hidden print:block w-[210mm] max-w-[210mm] min-w-[210mm] mx-auto p-0 m-0 bg-white">
        <ReportPreview 
          idPrefix="print-page-"
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

      {/* Screen Interactive Workspace */}
      <div 
        className={`bg-[#F8F9FB] bg-dot-pattern flex flex-col xl:flex-row p-2.5 sm:p-4 pl-2.5 sm:pl-4 md:pl-[106px] gap-3 sm:gap-4 overflow-x-hidden ${
          activeTab === 'view' ? 'h-screen overflow-hidden' : 'min-h-screen xl:h-screen overflow-y-auto xl:overflow-hidden'
        } print:hidden ${familjen.className}`}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-slate-100 flex items-center justify-around px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,0px)] print:hidden">
        <button 
          onClick={() => setActiveTab(activeTab === 'edit' ? 'view' : 'edit')}
          className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-all cursor-pointer ${
            activeTab === 'view' ? 'text-[#9723FF] font-bold' : 'text-[#180321] opacity-70 hover:opacity-100'
          }`}
        >
          {activeTab === 'edit' ? (
            <>
              <Eye size={20} strokeWidth={2.2} />
              <span className="text-[10px] font-medium">Preview</span>
            </>
          ) : (
            <>
              <Pencil size={20} strokeWidth={2.2} />
              <span className="text-[10px] font-medium">Edit</span>
            </>
          )}
        </button>
        <button 
          onClick={() => setActiveLeftDrawer(activeLeftDrawer === 'gallery' ? null : 'gallery')}
          className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-all cursor-pointer ${isGalleryOpen ? 'text-[#9723FF] font-bold' : 'text-[#180321] opacity-60 hover:opacity-100'}`}
        >
          <GalleryIcon size={20} className={isGalleryOpen ? 'drop-shadow-sm' : ''} />
          <span className="text-[10px] font-medium">Gallery</span>
        </button>
        <button 
          onClick={() => setActiveLeftDrawer(activeLeftDrawer === 'sections' ? null : 'sections')}
          className={`flex flex-col items-center justify-center gap-1 w-14 h-full transition-all cursor-pointer ${isSectionsOpen ? 'text-[#9723FF] font-bold' : 'text-[#180321] opacity-60 hover:opacity-100'}`}
        >
          <ListOrdered size={20} strokeWidth={2.2} />
          <span className="text-[10px] font-medium">Sections</span>
        </button>
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center gap-1 w-14 h-full text-[#180321] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Search size={20} strokeWidth={2.2} />
          <span className="text-[10px] font-medium">Search</span>
        </button>
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="flex flex-col items-center justify-center gap-1 w-14 h-full text-[#180321] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <HelpCircle size={20} strokeWidth={2.2} />
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
          
          <div className="flex flex-col gap-4 w-full mt-7">
            {/* Gallery Drawer Toggle */}
            <button 
              onClick={() => setActiveLeftDrawer(activeLeftDrawer === 'gallery' ? null : 'gallery')}
              className="w-full flex flex-col justify-start items-center gap-1 group cursor-pointer"
              title={isGalleryOpen ? 'Hide Media Gallery' : 'Show Media Gallery'}
            >
              <div className={`w-[46px] h-[46px] rounded-[14px] inline-flex justify-center items-center shadow-sm transition-all ${
                isGalleryOpen 
                  ? 'bg-[#180321] text-white ring-2 ring-[#9723FF] ring-offset-1' 
                  : 'bg-[#F8F9FB] border border-[#E2E4EB] text-[#645A6C] group-hover:bg-[#F3F4F6] group-hover:text-[#1E1035]'
              }`}>
                <GalleryIcon size={22} />
              </div>
              <span className={`text-center text-[10.5px] font-semibold transition-colors ${isGalleryOpen ? 'text-[#9723FF]' : 'text-[#463B4D]'}`}>
                Gallery
              </span>
            </button>

            {/* Sections Drawer Toggle */}
            <button 
              onClick={() => setActiveLeftDrawer(activeLeftDrawer === 'sections' ? null : 'sections')}
              className="w-full flex flex-col justify-start items-center gap-1 group cursor-pointer"
              title={isSectionsOpen ? 'Hide Sections Panel' : 'Show Sections Panel'}
            >
              <div className={`w-[46px] h-[46px] rounded-[14px] inline-flex justify-center items-center shadow-sm transition-all ${
                isSectionsOpen 
                  ? 'bg-[#180321] text-white ring-2 ring-[#9723FF] ring-offset-1' 
                  : 'bg-[#F8F9FB] border border-[#E2E4EB] text-[#645A6C] group-hover:bg-[#F3F4F6] group-hover:text-[#1E1035]'
              }`}>
                <ListOrdered size={22} strokeWidth={2} />
              </div>
              <span className={`text-center text-[10.5px] font-semibold transition-colors ${isSectionsOpen ? 'text-[#9723FF]' : 'text-[#463B4D]'}`}>
                Sections
              </span>
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
      <div className={`flex-1 flex flex-col gap-3 sm:gap-4 ${
        activeTab === 'view' ? 'h-full overflow-hidden' : 'overflow-visible xl:overflow-hidden'
      } min-w-0`}>
                {/* Top Header */}
        <header className="relative w-full bg-white rounded-[20px] sm:rounded-[24px] shadow-sm border border-slate-100 shrink-0 flex flex-col xl:flex-row items-stretch xl:items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 xl:py-0 xl:min-h-[72px] gap-2.5 xl:gap-0 z-10 print:hidden">
          
          {/* Top Row / Desktop Left Section */}
          <div className="flex items-center justify-between xl:justify-start gap-2 sm:gap-4 w-full xl:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link 
                href="/"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E1035] text-xs font-bold transition-all border border-slate-200/70 shrink-0"
                title="Go back"
              >
                <ArrowLeft size={14} strokeWidth={2.5} />
                <span className="hidden sm:inline">Back</span>
              </Link>
              
              <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-[15px] sm:text-[17px] md:text-[18px] font-bold text-[#1E1035] tracking-tight truncate max-w-[130px] sm:max-w-xs md:max-w-md">
                    {report.title}
                  </h1>
                  <button 
                    onClick={() => setIsHelpOpen(true)}
                    className="w-5 h-5 rounded-full bg-[#EBDCF9] flex items-center justify-center text-[#9723FF] hover:bg-[#D9A8FF] transition-colors shrink-0 cursor-pointer"
                    title="View report details"
                  >
                    <Info size={12} strokeWidth={3} />
                  </button>
                  {report.status === 'published' && (
                    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                      <span className="bg-[#E8F8EE] text-[#1E7E34] border border-[#B3EBC8] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Published
                      </span>
                      <button
                        type="button"
                        onClick={copyPublishLink}
                        title="Copy Public Certificate Link"
                        className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#9723FF] hover:text-[#7915D4] bg-purple-50 hover:bg-purple-100 border border-purple-200/70 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        {isCopied ? <Check size={11} className="text-green-600" /> : <Share2 size={11} />}
                        <span>{isCopied ? 'Copied' : 'Share'}</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Cloud 
                    size={11} 
                    className={`transition-colors ${saveStatus === 'saving' ? 'text-amber-500 animate-pulse' : 'text-[#1E1035]'}`} 
                    strokeWidth={2.5} 
                  />
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-[#1E1035] truncate">
                    {saveStatus === 'saving' ? 'Saving changes...' : report.lastSavedAt}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile-only right action buttons (Reset + Publish) */}
            <div className="flex xl:hidden items-center gap-1.5 shrink-0">
              <button 
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="bg-[#f1f2f6] border border-[#cfd2e0] flex items-center justify-center px-2.5 py-1.5 rounded-xl text-[#3e045a] hover:bg-[#e4e5e9] transition-colors cursor-pointer text-xs font-bold"
                title="Reset Report"
              >
                Reset
              </button>
              <button 
                type="button"
                onClick={handlePublish}
                className="bg-[#3e045a] border border-[#cfd2e0] flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-white hover:bg-[#2c0340] active:scale-[0.98] transition-all cursor-pointer shadow-xs text-xs font-bold"
                title="Publish Report"
              >
                <span>Publish</span>
              </button>
            </div>
          </div>

          {/* Tools Center Bar: On desktop centered; on mobile a sleek second row */}
          <div className="flex xl:absolute xl:left-1/2 xl:-translate-x-1/2 items-center justify-between sm:justify-center gap-1.5 sm:gap-3 w-full xl:w-auto pt-1.5 xl:pt-0 border-t xl:border-t-0 border-slate-100">
            {/* Edit/View Toggle */}
            <div className="p-0.5 sm:p-1 bg-[#F3F4F9] rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#CFD2DF] inline-flex justify-start items-center gap-1 shadow-xs">
              <button 
                onClick={() => setActiveTab('edit')}
                className="relative h-8 sm:h-10 px-2.5 sm:w-10 rounded-xl flex items-center justify-center gap-1 transition-opacity cursor-pointer"
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
                <div className="relative z-10 flex items-center gap-1">
                  <PencilIcon size={14} className={activeTab === 'edit' ? 'text-white' : 'text-[#180321]'} />
                  <span className={`text-[11px] font-bold sm:hidden ${activeTab === 'edit' ? 'text-white' : 'text-[#180321]'}`}>Edit</span>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('view')}
                className="relative h-8 sm:h-10 px-2.5 sm:w-10 rounded-xl flex items-center justify-center gap-1 transition-opacity cursor-pointer"
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
                <div className="relative z-10 flex items-center gap-1">
                  <EyeIcon size={16} className={activeTab === 'view' ? 'text-white' : 'text-[#180321]'} />
                  <span className={`text-[11px] font-bold sm:hidden ${activeTab === 'view' ? 'text-white' : 'text-[#180321]'}`}>Preview</span>
                </div>
              </button>
            </div>

            <div className="w-px h-5 bg-slate-200 mx-0.5 sm:mx-1"></div>

            {/* Undo / Redo */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F4F5F8] rounded-xl sm:rounded-[14px] flex items-center justify-center text-[#74768B] hover:bg-[#E9EAF2] hover:text-[#1E1035] transition-colors border border-slate-100 shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCcw size={15} />
              </button>
              <button 
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F4F5F8] rounded-xl sm:rounded-[14px] flex items-center justify-center text-[#74768B] hover:bg-[#E9EAF2] hover:text-[#1E1035] transition-colors border border-slate-100 shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCw size={15} />
              </button>
            </div>

            <div className="w-px h-5 bg-slate-200 mx-0.5 sm:mx-1"></div>

            {/* Print / Download */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={handlePrint}
                title="Print Report (PDF)"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F4F5F8] rounded-xl sm:rounded-[14px] flex items-center justify-center text-[#1E1035] hover:bg-[#E9EAF2] transition-colors border border-slate-100 shadow-2xs cursor-pointer"
              >
                <Printer size={15} strokeWidth={2.2} />
              </button>
              <button 
                onClick={handleDownload}
                title="Download JSON Report Data"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F4F5F8] rounded-xl sm:rounded-[14px] flex items-center justify-center text-[#74768B] hover:bg-[#E9EAF2] hover:text-[#1E1035] transition-colors border border-slate-100 shadow-2xs cursor-pointer"
              >
                <Download size={15} />
              </button>
            </div>
          </div>

          {/* Right Section: Desktop only */}
          <div className="hidden xl:flex items-center gap-2">
            <div className="border-2 border-[#92a2f6] p-[2px] rounded-full shrink-0 size-[42px] flex items-center justify-center">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="size-full object-cover rounded-full" />
            </div>
            <button 
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="bg-[#f1f2f6] border border-[#cfd2e0] flex items-center justify-center px-[20px] py-[12px] rounded-[16px] text-[#3e045a] hover:bg-[#e4e5e9] transition-colors whitespace-nowrap cursor-pointer text-xs font-bold"
            >
              <span>Reset Report</span>
            </button>
            <button 
              type="button"
              onClick={handlePublish}
              className="bg-[#3e045a] border border-[#cfd2e0] flex items-center justify-center gap-1.5 px-[24px] py-[12px] rounded-[16px] text-white hover:bg-[#2c0340] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer shadow-sm text-xs font-bold"
            >
              <span>Publish</span>
              <FileText size={15} />
            </button>
          </div>
        </header>

        {/* 3 Columns Layout or Preview */}
        <div className={`flex-1 flex flex-col xl:flex-row gap-4 ${
          activeTab === 'view' ? 'overflow-hidden pb-0' : 'overflow-visible xl:overflow-hidden pb-32 md:pb-6 xl:pb-0'
        } custom-scrollbar relative`}>
          
          {activeTab === 'edit' ? (
            <>
              {/* Desktop Sections Drawer (Collapsible) */}
              <div 
                className={`hidden xl:block shrink-0 overflow-hidden transition-all duration-500 ease-in-out ${
                  isSectionsOpen 
                    ? 'max-w-[320px] opacity-100' 
                    : 'max-w-0 opacity-0 pointer-events-none'
                }`}
              >
                {renderSectionsDrawerContent(false)}
              </div>

              {/* Desktop Media Drawer (Collapsible) */}
              <div 
                className={`hidden xl:block shrink-0 overflow-hidden transition-all duration-500 ease-in-out ${
                  isGalleryOpen 
                    ? 'max-w-[310px] opacity-100' 
                    : 'max-w-0 opacity-0 pointer-events-none'
                }`}
              >
                <div className="w-[310px] bg-white rounded-[32px] shadow-sm flex flex-col p-5 z-10 border border-slate-100 h-full">
                  {renderGalleryDrawerContent()}
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

              {/* 4. Right Sidebar Container with Client & Team Details */}
              <aside 
                id="sidebar-inspector-controls"
                className="w-full xl:w-[336px] flex flex-col gap-4 h-auto xl:h-full overflow-visible xl:overflow-y-auto custom-scrollbar shrink-0 z-10 pb-20 xl:pb-0"
              >
                {/* Client Details Card */}
                <SidebarCard
                  title="Client Details"
                  description="Client contact & inspection address"
                  isAccordion={true}
                  defaultOpen={true}
                  id="section-client-details"
                  badge={
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#9723FF] border border-purple-200/60">
                      Client
                    </span>
                  }
                >
                  <InputField 
                    label="Client Name" 
                    placeholder="Enter Client Name" 
                    icon={<User size={16} fill="currentColor" strokeWidth={0} />} 
                    value={report.clientDetails.name}
                    onChange={(e) => updateReport({
                      clientDetails: { ...report.clientDetails, name: e.target.value }
                    })}
                  />
                  
                  {/* WhatsApp Number with Country Code Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#1E1035]">WhatsApp Number</label>
                    <div className="relative flex items-center w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-3 focus-within:ring-2 focus-within:ring-[#1E1035]/20 transition-all">
                      <div className="flex items-center gap-1 pr-1.5 border-r border-slate-200">
                        <select
                          value={report.clientDetails.countryCode}
                          onChange={(e) => updateReport({
                            clientDetails: { ...report.clientDetails, countryCode: e.target.value }
                          })}
                          className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                        >
                          {countryCodeOptions.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <input 
                        type="tel" 
                        placeholder="54 409 3009" 
                        value={report.clientDetails.whatsappNumber}
                        onChange={(e) => updateReport({
                          clientDetails: { ...report.clientDetails, whatsappNumber: e.target.value }
                        })}
                        className="flex-1 min-w-0 bg-transparent text-sm text-[#190933] placeholder-slate-400 pl-2 focus:outline-none" 
                      />
                    </div>
                  </div>
                  
                  <InputField 
                    label="Email Address" 
                    placeholder="client@example.com" 
                    type="email"
                    icon={<Eye size={16} fill="currentColor" strokeWidth={0} />} 
                    value={report.clientDetails.email}
                    onChange={(e) => updateReport({
                      clientDetails: { ...report.clientDetails, email: e.target.value }
                    })}
                  />

                  <InputField 
                    label="Vehicle Details" 
                    placeholder="2025 Toyota Tundra TRD Pro" 
                    value={report.clientDetails.vehicleDetails}
                    onChange={(e) => updateReport({
                      clientDetails: { ...report.clientDetails, vehicleDetails: e.target.value }
                    })}
                  />

                  <SelectField 
                    label="Location" 
                    placeholder="Select Location" 
                    options={locationOptions}
                    icon={<MapPin size={16} fill="currentColor" strokeWidth={0} />} 
                    value={report.clientDetails.location}
                    onChange={(e) => updateReport({
                      clientDetails: { ...report.clientDetails, location: String(e.target.value ?? '') }
                    })}
                  />
                </SidebarCard>

                {/* Team Details Card */}
                <SidebarCard
                  title="Our Team"
                  description="Assigned inspector & QA details"
                  isAccordion={true}
                  defaultOpen={true}
                  id="section-team-details"
                  badge={
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#008751] border border-emerald-200/60">
                      Assigned
                    </span>
                  }
                >
                  <SelectField 
                    label="Inspector" 
                    placeholder="Select Inspector" 
                    options={inspectorOptions}
                    icon={<User size={16} />} 
                    value={report.teamDetails.inspector}
                    onChange={(e) => updateReport({
                      teamDetails: { ...report.teamDetails, inspector: String(e.target.value ?? '') }
                    })}
                  />
                </SidebarCard>
              </aside>
            </>
          ) : (
            <>
              {/* Preview Mode */}
              <div 
                ref={previewScrollRef}
                onScroll={handlePreviewScroll}
                className="flex-1 flex justify-center w-full h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] xl:px-4 pb-28 xl:pb-0"
              >
                <div 
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`, 
                    transition: 'transform 0.15s ease-out',
                    transformOrigin: 'top center'
                  }} 
                  className="w-full max-w-[900px] flex justify-center print:transform-none print:w-full print:max-w-none"
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
                  </div>                </div>

              </aside>

              {/* Mobile Floating Bar for Preview */}
              <div className="xl:hidden fixed bottom-[84px] left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xl border border-slate-200/80 flex items-center gap-2.5 sm:gap-3.5 text-[#1E1035] max-w-[95vw]">
                {/* Page Stepper */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handlePrevPage} 
                    disabled={previewPage <= 1}
                    aria-label="Previous Page"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#1E1035] hover:bg-[#F4F5F8] active:bg-slate-200 disabled:opacity-25 transition-colors cursor-pointer"
                  >
                    <ChevronUp size={16} className="-rotate-90 stroke-[2.5]" />
                  </button>
                  <span className="text-[11px] font-bold text-[#1E1035] whitespace-nowrap">
                    {String(previewPage).padStart(2, '0')} / {String(totalPreviewPages).padStart(2, '0')}
                  </span>
                  <button 
                    onClick={handleNextPage} 
                    disabled={previewPage >= totalPreviewPages}
                    aria-label="Next Page"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#1E1035] hover:bg-[#F4F5F8] active:bg-slate-200 disabled:opacity-25 transition-colors cursor-pointer"
                  >
                    <ChevronDown size={16} className="-rotate-90 stroke-[2.5]" />
                  </button>
                </div>

                <div className="w-px h-4 bg-slate-200"></div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={handleZoomOut} 
                    aria-label="Zoom Out"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#1E1035] active:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <button 
                    onClick={handleZoomReset} 
                    className="text-[10px] font-bold text-slate-600 hover:text-[#1E1035] px-1 cursor-pointer"
                  >
                    {zoomLevel}%
                  </button>
                  <button 
                    onClick={handleZoomIn} 
                    aria-label="Zoom In"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#1E1035] active:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>

                <div className="w-px h-4 bg-slate-200"></div>

                {/* Print PDF Button */}
                <button 
                  onClick={handlePrint}
                  aria-label="Print Report"
                  className="w-7 h-7 rounded-lg bg-[#3e045a] text-white flex items-center justify-center active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  <Printer size={13} strokeWidth={2.2} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Slide-Over Sections Drawer */}
      <AnimatePresence>
        {isSectionsOpen && (
          <div className="xl:hidden fixed inset-0 z-[140] flex flex-col justify-end bg-black/50 backdrop-blur-xs">
            <div 
              className="fixed inset-0" 
              onClick={() => setActiveLeftDrawer(null)}
              aria-label="Close sections overlay"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-h-[85vh] bg-white rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden border-t border-slate-100 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]"
            >
              <div className="flex items-center justify-between px-5 pt-3.5 pb-2.5 border-b border-slate-100">
                <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2" />
                <h3 className="text-base font-bold text-[#1E1035] flex items-center gap-2 mt-1">
                  <ListOrdered size={18} className="text-[#9723FF]" />
                  Inspection Sections
                </h3>
                <button
                  onClick={() => setActiveLeftDrawer(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {renderSectionsDrawerContent(true)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Slide-Over Media Gallery Drawer */}
      <AnimatePresence>
        {isGalleryOpen && (
          <div className="xl:hidden fixed inset-0 z-[140] flex flex-col justify-end bg-black/50 backdrop-blur-xs">
            <div 
              className="fixed inset-0" 
              onClick={() => setActiveLeftDrawer(null)}
              aria-label="Close gallery overlay"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-h-[85vh] bg-white rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden border-t border-slate-100 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]"
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-2" />
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#1E1035] flex items-center gap-2">
                  <GalleryIcon size={20} className="text-[#9723FF]" />
                  Media Gallery
                </h3>
                <button
                  onClick={() => setActiveLeftDrawer(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col">
                {renderGalleryDrawerContent()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 1: Spotlight Quick Jump Search */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
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
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
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
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
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
                    const newId = `CMC-${Math.floor(1000 + Math.random() * 9000)}`;
                    const cleanReport: FullInspectionReport = {
                      ...initialReportData,
                      id: newId,
                      title: `Report #${newId}`,
                      status: 'draft',
                      lastSavedAt: 'Reset just now',
                      inspectionDetails: {
                        ...initialReportData.inspectionDetails,
                        date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                      },
                    };
                    resetReport(cleanReport);
                    upsertStoredReport(convertFullReportToListItem(cleanReport));
                    handleSectionOrderChange(DEFAULT_SECTION_ORDER);
                    setIsResetConfirmOpen(false);
                    showToast(`Inspection reset to new draft (${newId})`, 'success');
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
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
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
                  {isCopied ? 'Copied' : 'Share'}
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

      {/* MODAL 5: Safe Media Deletion Confirmation */}
      <AnimatePresence>
        {deleteConfirmState && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[460px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col gap-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <AlertCircle size={26} strokeWidth={2.5} />
              </div>

              <div>
                <h3 className="text-[18px] font-bold text-[#1E1035]">Photo Attached to Report</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {deleteConfirmState.type === 'single'
                    ? `This photo is currently attached to ${deleteConfirmState.usageCount} field(s) in this inspection report.`
                    : `${deleteConfirmState.usageCount} of the selected photos are currently attached to fields in this inspection report.`}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 max-h-[140px] overflow-y-auto custom-scrollbar border border-slate-200/60 text-left">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Currently Attached To:
                </span>
                <ul className="space-y-1">
                  {deleteConfirmState.usedTargets.map((target, idx) => (
                    <li key={idx} className="text-xs font-semibold text-[#1E1035] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9723FF] shrink-0" />
                      <span className="truncate">{target}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] text-slate-500">
                Choose how you would like to proceed with deletion:
              </p>

              <div className="flex flex-col gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirmState.type === 'single' && deleteConfirmState.id) {
                      removeMedia(deleteConfirmState.id, true);
                    } else {
                      deleteSelectedMedia(true);
                    }
                    setDeleteConfirmState(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 size={15} />
                  <span>Delete & Remove from Report Fields</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirmState.type === 'single' && deleteConfirmState.id) {
                      removeMedia(deleteConfirmState.id, false);
                    } else {
                      deleteSelectedMedia(false);
                    }
                    setDeleteConfirmState(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
                >
                  Delete from Gallery Only (Keep in Report)
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmState(null)}
                  className="w-full py-2 px-4 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Connection Modals */}
      <MediaAssignModal />
      <MediaGalleryPickerModal />

      {/* Persistent Bottom-Right Support Badge */}
      <SupportBadge />

      </div>
    </>
  );
}

export default function HomeDashboard() {
  const history = useInspectionHistory();
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  return (
    <MediaConnectionProvider
      report={history.report}
      updateReport={history.updateReport}
      showToast={showToast}
    >
      <InspectDashboardContent
        history={history}
        toastMessage={toastMessage}
        showToast={showToast}
      />
    </MediaConnectionProvider>
  );
}
