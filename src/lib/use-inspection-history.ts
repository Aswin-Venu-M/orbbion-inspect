"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { FullInspectionReport } from './inspection-types';
import { initialReportData } from './default-data';

const STORAGE_KEY = 'orbbion_inspection_report_v2';
const MAX_HISTORY = 30;

export function useInspectionHistory() {
  const [report, setReport] = useState<FullInspectionReport>(initialReportData);
  const [past, setPast] = useState<FullInspectionReport[]>([]);
  const [future, setFuture] = useState<FullInspectionReport[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isLoaded, setIsLoaded] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setReport(prev => ({
          ...prev,
          ...parsed,
          lastSavedAt: 'Loaded from local save',
        }));
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    setReport(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      
      if (addToHistory) {
        setPast(p => [...p.slice(-MAX_HISTORY + 1), prev]);
        setFuture([]); // Clear future redo stack
      }

      triggerAutoSave(next);
      return next;
    });
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

  const resetReport = useCallback((customData?: FullInspectionReport) => {
    const data = customData || initialReportData;
    setPast(p => [...p, report]);
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
