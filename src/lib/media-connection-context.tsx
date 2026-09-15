"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FullInspectionReport } from './inspection-types';
import { INITIAL_MEDIA_FILES } from '@/constants/default-report';
import {
  MediaUsageItem,
  getMediaUsageInReport,
  attachMediaToReportTarget,
  removeMediaFromReportEntirely,
  getAvailableMediaTargets,
  MediaTargetInfo,
} from './media-targets';

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed';
  selected?: boolean;
}

export type MediaFilterType = 'all' | 'unassigned' | 'assigned';

export interface GalleryPickerOptions {
  title?: string;
  multiple?: boolean;
  onSelect: (urls: string[]) => void;
}

interface MediaConnectionContextType {
  mediaFiles: MediaItem[];
  filter: MediaFilterType;
  setFilter: (filter: MediaFilterType) => void;
  filteredMediaFiles: MediaItem[];
  selectedMediaCount: number;
  toggleMediaSelect: (id: string) => void;
  toggleSelectAllMedia: () => void;
  getMediaUsage: (url: string) => MediaUsageItem[];
  assignMediaToTarget: (targetId: string, mediaUrls: string[]) => void;
  addDirectUpload: (fileOrUrl: File | string, name?: string) => string;
  addMediaFiles: (files: FileList | File[]) => void;
  removeMedia: (id: string, removeFromReport?: boolean) => void;
  deleteSelectedMedia: (removeFromReport?: boolean) => void;
  isDraggingMedia: boolean;
  draggedMedia: MediaItem | null;
  startDraggingMedia: (media: MediaItem, e: React.DragEvent) => void;
  endDraggingMedia: () => void;
  activePicker: GalleryPickerOptions | null;
  openGalleryPicker: (options: GalleryPickerOptions) => void;
  closeGalleryPicker: () => void;
  isAssignModalOpen: boolean;
  openAssignModal: () => void;
  closeAssignModal: () => void;
  availableTargets: MediaTargetInfo[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const MediaConnectionContext = createContext<MediaConnectionContextType | null>(null);

export function useMediaConnection() {
  const context = useContext(MediaConnectionContext);
  if (!context) {
    throw new Error('useMediaConnection must be used within a MediaConnectionProvider');
  }
  return context;
}

interface MediaConnectionProviderProps {
  children: React.ReactNode;
  report: FullInspectionReport;
  updateReport: (patch: Partial<FullInspectionReport>, recordHistory?: boolean) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const MediaConnectionProvider: React.FC<MediaConnectionProviderProps> = ({
  children,
  report,
  updateReport,
  showToast,
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('orbbion_media_files_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_MEDIA_FILES;
  });

  const [filter, setFilter] = useState<MediaFilterType>('all');
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [draggedMedia, setDraggedMedia] = useState<MediaItem | null>(null);
  const [activePicker, setActivePicker] = useState<GalleryPickerOptions | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const activeUploadIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Save media files to localStorage whenever updated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Only persist completed items or non-temporary ones
        const toSave = mediaFiles.map(m => ({ ...m, selected: false }));
        localStorage.setItem('orbbion_media_files_v1', JSON.stringify(toSave));
      } catch {
        // ignore
      }
    }
  }, [mediaFiles]);

  // Clean intervals on unmount
  useEffect(() => {
    const intervals = activeUploadIntervals.current;
    return () => {
      intervals.forEach(intId => clearInterval(intId));
      intervals.clear();
    };
  }, []);

  const getMediaUsage = useCallback((url: string) => {
    return getMediaUsageInReport(url, report);
  }, [report]);

  const availableTargets = useMemo(() => {
    return getAvailableMediaTargets(report);
  }, [report]);

  const filteredMediaFiles = useMemo(() => {
    if (filter === 'all') return mediaFiles;
    return mediaFiles.filter(item => {
      const usage = getMediaUsage(item.url);
      const isAssigned = usage.length > 0;
      return filter === 'assigned' ? isAssigned : !isAssigned;
    });
  }, [mediaFiles, filter, getMediaUsage]);

  const selectedMediaCount = useMemo(() => {
    return mediaFiles.filter(m => m.selected).length;
  }, [mediaFiles]);

  const toggleMediaSelect = useCallback((id: string) => {
    setMediaFiles(prev => prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  }, []);

  const toggleSelectAllMedia = useCallback(() => {
    const allSelected = mediaFiles.length > 0 && mediaFiles.every(m => m.selected);
    setMediaFiles(prev => prev.map(m => ({ ...m, selected: !allSelected })));
  }, [mediaFiles]);

  const simulateUpload = useCallback((id: string) => {
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
  }, []);

  const addMediaFiles = useCallback((files: FileList | File[]) => {
    const allFiles = Array.from(files);
    const validFiles = allFiles.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);

    if (validFiles.length === 0) {
      showToast('No valid images found (Max 10MB per file)', 'error');
      return;
    }

    if (validFiles.length < allFiles.length) {
      showToast(`${allFiles.length - validFiles.length} file(s) skipped (exceeded 10MB limit or invalid format)`, 'error');
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
  }, [showToast, simulateUpload]);

  // Direct upload from report form fields -> adds to media gallery
  const addDirectUpload = useCallback((fileOrUrl: File | string, name?: string): string => {
    let url: string;
    let fileName = name || 'Inspection Photo';

    if (typeof fileOrUrl === 'string') {
      url = fileOrUrl;
      // Check if already in mediaFiles
      if (mediaFiles.some(m => m.url === url)) {
        return url;
      }
    } else {
      url = URL.createObjectURL(fileOrUrl);
      fileName = fileOrUrl.name;
    }

    const newItem: MediaItem = {
      id: Math.random().toString(36).substring(7),
      url,
      name: fileName,
      progress: 100,
      status: 'completed',
    };

    setMediaFiles(prev => {
      if (prev.some(m => m.url === url)) return prev;
      return [newItem, ...prev];
    });

    return url;
  }, [mediaFiles]);

  const removeMedia = useCallback((id: string, removeFromReport = false) => {
    const item = mediaFiles.find(m => m.id === id);
    if (!item) return;

    if (removeFromReport) {
      const updated = removeMediaFromReportEntirely(report, item.url);
      updateReport(updated);
    }

    if (item.url.startsWith('blob:')) {
      // Check if used anywhere else before revoking
      const remainingUsage = getMediaUsageInReport(item.url, report);
      if (remainingUsage.length === 0 || removeFromReport) {
        URL.revokeObjectURL(item.url);
      }
    }

    const activeInterval = activeUploadIntervals.current.get(id);
    if (activeInterval) {
      clearInterval(activeInterval);
      activeUploadIntervals.current.delete(id);
    }

    setMediaFiles(prev => prev.filter(m => m.id !== id));
    showToast(removeFromReport ? 'Image removed from gallery and report' : 'Image removed from gallery', 'info');
  }, [mediaFiles, report, updateReport, showToast]);

  const deleteSelectedMedia = useCallback((removeFromReport = false) => {
    const selected = mediaFiles.filter(m => m.selected);
    if (selected.length === 0) return;

    let currentReport = report;
    selected.forEach(item => {
      if (removeFromReport) {
        currentReport = removeMediaFromReportEntirely(currentReport, item.url);
      }
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      const activeInterval = activeUploadIntervals.current.get(item.id);
      if (activeInterval) {
        clearInterval(activeInterval);
        activeUploadIntervals.current.delete(item.id);
      }
    });

    if (removeFromReport) {
      updateReport(currentReport);
    }

    setMediaFiles(prev => prev.filter(m => !m.selected));
    showToast(`${selected.length} image(s) deleted`, 'info');
  }, [mediaFiles, report, updateReport, showToast]);

  const assignMediaToTarget = useCallback((targetId: string, mediaUrls: string[]) => {
    const { updatedReport, attachedCount } = attachMediaToReportTarget(report, targetId, mediaUrls);
    if (attachedCount > 0) {
      updateReport(updatedReport);
      const targetObj = availableTargets.find(t => t.id === targetId);
      showToast(`Attached ${attachedCount} photo(s) to ${targetObj?.label || targetId}`, 'success');
      // Unselect assigned items
      setMediaFiles(prev => prev.map(m => mediaUrls.includes(m.url) ? { ...m, selected: false } : m));
    } else {
      showToast('No photos attached (may already exist or capacity reached)', 'info');
    }
  }, [report, updateReport, availableTargets, showToast]);

  const startDraggingMedia = useCallback((media: MediaItem, e: React.DragEvent) => {
    if (media.status !== 'completed') {
      e.preventDefault();
      showToast('Please wait until photo upload completes', 'info');
      return;
    }
    setIsDraggingMedia(true);
    setDraggedMedia(media);

    e.dataTransfer.setData('application/x-orbbion-media', JSON.stringify({
      id: media.id,
      url: media.url,
      name: media.name,
    }));
    e.dataTransfer.setData('text/plain', media.url);
    e.dataTransfer.effectAllowed = 'copyMove';
  }, [showToast]);

  const endDraggingMedia = useCallback(() => {
    setIsDraggingMedia(false);
    setDraggedMedia(null);
  }, []);

  const openGalleryPicker = useCallback((options: GalleryPickerOptions) => {
    setActivePicker(options);
  }, []);

  const closeGalleryPicker = useCallback(() => {
    setActivePicker(null);
  }, []);

  const openAssignModal = useCallback(() => {
    setIsAssignModalOpen(true);
  }, []);

  const closeAssignModal = useCallback(() => {
    setIsAssignModalOpen(false);
  }, []);

  return (
    <MediaConnectionContext.Provider
      value={{
        mediaFiles,
        filter,
        setFilter,
        filteredMediaFiles,
        selectedMediaCount,
        toggleMediaSelect,
        toggleSelectAllMedia,
        getMediaUsage,
        assignMediaToTarget,
        addDirectUpload,
        addMediaFiles,
        removeMedia,
        deleteSelectedMedia,
        isDraggingMedia,
        draggedMedia,
        startDraggingMedia,
        endDraggingMedia,
        activePicker,
        openGalleryPicker,
        closeGalleryPicker,
        isAssignModalOpen,
        openAssignModal,
        closeAssignModal,
        availableTargets,
        showToast,
      }}
    >
      {children}
    </MediaConnectionContext.Provider>
  );
};
