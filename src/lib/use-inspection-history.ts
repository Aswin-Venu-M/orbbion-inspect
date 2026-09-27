"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { FullInspectionReport } from './inspection-types';
import { initialReportData, createEmptyReport } from './default-data';
import { upsertStoredReport, convertFullReportToListItem } from './reports-data';

const STORAGE_KEY = 'orbbion_inspection_report_v2';
const MAX_HISTORY = 30;

export function cleanReportForStorage(data: FullInspectionReport): FullInspectionReport {
  const sanitize = (val: any): any => {
    if (val === null || val === undefined) return val;
    if (typeof val === 'string') {
      return val.startsWith('blob:') ? '' : val;
    }
    if (Array.isArray(val)) {
      return val
        .filter((item) => {
          if (typeof item === 'string') return !item.startsWith('blob:');
          if (item && typeof item === 'object' && typeof item.url === 'string') {
            return !item.url.startsWith('blob:');
          }
          return true;
        })
        .map(sanitize);
    }
    if (typeof val === 'object') {
      const copy: any = {};
      for (const k of Object.keys(val)) {
        if (k === 'image' && val[k] && typeof val[k].url === 'string' && val[k].url.startsWith('blob:')) {
          copy[k] = null;
        } else {
          copy[k] = sanitize(val[k]);
        }
      }
      return copy;
    }
    return val;
  };

  return sanitize(data) as FullInspectionReport;
}

export function useInspectionHistory() {
  const [report, setReport] = useState<FullInspectionReport>(initialReportData);
  const [past, setPast] = useState<FullInspectionReport[]>([]);
  const [future, setFuture] = useState<FullInspectionReport[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isLoaded, setIsLoaded] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reportRef = useRef<FullInspectionReport>(report);
  useEffect(() => {
    reportRef.current = report;
  }, [report]);

  // Load from localStorage on mount with safe deep merge
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('new') === 'true') {
          // Defer to page.tsx which handles the full new-report lifecycle
          setIsLoaded(true);
          return;
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setReport(prev => ({
            ...initialReportData,
            ...prev,
            ...parsed,
            inspectionDetails: {
              ...initialReportData.inspectionDetails,
              ...(prev.inspectionDetails || {}),
              ...(parsed.inspectionDetails || {}),
            },
            vehicleSummary: {
              ...initialReportData.vehicleSummary,
              ...(prev.vehicleSummary || {}),
              ...(parsed.vehicleSummary || {}),
            },
            reportOverview: {
              ...initialReportData.reportOverview,
              ...(prev.reportOverview || {}),
              ...(parsed.reportOverview || {}),
            },
            clientDetails: {
              ...initialReportData.clientDetails,
              ...(prev.clientDetails || {}),
              ...(parsed.clientDetails || {}),
            },
            teamDetails: {
              ...initialReportData.teamDetails,
              ...(prev.teamDetails || {}),
              ...(parsed.teamDetails || {}),
            },
            tyres: {
              ...initialReportData.tyres,
              ...(prev.tyres || {}),
              ...(parsed.tyres || {}),
            },
            rims: {
              ...initialReportData.rims,
              ...(prev.rims || {}),
              ...(parsed.rims || {}),
            },
            brakes: {
              ...initialReportData.brakes,
              ...(prev.brakes || {}),
              ...(parsed.brakes || {}),
            },
            bodyPartStatuses: {
              ...initialReportData.bodyPartStatuses,
              ...(prev.bodyPartStatuses || {}),
              ...(parsed.bodyPartStatuses || {}),
            },
            chassisSubframePartStatuses: {
              ...initialReportData.chassisSubframePartStatuses,
              ...(prev.chassisSubframePartStatuses || {}),
              ...(parsed.chassisSubframePartStatuses || {}),
            },
            bodyCustomHeadlines: Array.isArray(parsed.bodyCustomHeadlines)
              ? parsed.bodyCustomHeadlines
              : (prev.bodyCustomHeadlines || initialReportData.bodyCustomHeadlines),
            chassisSubframeCustomHeadlines: Array.isArray(parsed.chassisSubframeCustomHeadlines)
              ? parsed.chassisSubframeCustomHeadlines
              : (prev.chassisSubframeCustomHeadlines || initialReportData.chassisSubframeCustomHeadlines),
            interiorCustomHeadlines: Array.isArray(parsed.interiorCustomHeadlines)
              ? parsed.interiorCustomHeadlines
              : (prev.interiorCustomHeadlines || initialReportData.interiorCustomHeadlines),
            electricalCustomHeadlines: Array.isArray(parsed.electricalCustomHeadlines)
              ? parsed.electricalCustomHeadlines
              : (prev.electricalCustomHeadlines || initialReportData.electricalCustomHeadlines),
            engineCustomHeadlines: Array.isArray(parsed.engineCustomHeadlines)
              ? parsed.engineCustomHeadlines
              : (prev.engineCustomHeadlines || initialReportData.engineCustomHeadlines),
            transmissionCustomHeadlines: Array.isArray(parsed.transmissionCustomHeadlines)
              ? parsed.transmissionCustomHeadlines
              : (prev.transmissionCustomHeadlines || initialReportData.transmissionCustomHeadlines),
            lastSavedAt: parsed.lastSavedAt || 'Loaded from local save',
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to load inspection report from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Debounced auto-save
  const triggerAutoSave = useCallback((data: FullInspectionReport) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const cleaned = cleanReportForStorage(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        upsertStoredReport(convertFullReportToListItem(cleaned));
        setSaveStatus('saved');
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
        setSaveStatus('unsaved');
      }
    }, 800);
  }, []);

  // Update report state with optional history snapshot
  const updateReport = useCallback((
    updater: Partial<FullInspectionReport> | ((prev: FullInspectionReport) => FullInspectionReport),
    addToHistory: boolean = true
  ) => {
    const current = reportRef.current;
    const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };

    if (addToHistory) {
      setPast(p => [...p.slice(-MAX_HISTORY + 1), current]);
      setFuture([]); // Clear future redo stack
    }

    setReport(next);
    triggerAutoSave(next);
  }, [triggerAutoSave]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture(f => [report, ...f]);
    setReport(previous);
    triggerAutoSave(previous);
  }, [past, report, triggerAutoSave]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast(p => [...p, report]);
    setFuture(newFuture);
    setReport(next);
    triggerAutoSave(next);
  }, [future, report, triggerAutoSave]);

  const resetReport = useCallback((customData?: FullInspectionReport, clearHistory = false) => {
    const data = customData || createEmptyReport();
    if (clearHistory) {
      setPast([]);
    } else {
      setPast(p => [...p, report]);
    }
    setFuture([]);
    setReport(data);
    triggerAutoSave(data);
  }, [report, triggerAutoSave]);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    report,
    updateReport,
    undo,
    redo,
    resetReport,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    saveStatus,
    isLoaded,
  };
}
