/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, LayoutDashboard, FileText, Pencil,
  HelpCircle, CheckCircle2, Info,
  X, ArrowRight, ShieldCheck,
} from 'lucide-react';

import { SupportBadge } from '@/components/ui/support-badge';
import { getStoredReports } from '@/lib/reports-data';
import type { ReportListItem } from '@/lib/reports-data';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Toast notification system
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Modals
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Spotlight search state
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [debouncedSpotlightQuery, setDebouncedSpotlightQuery] = useState('');
  const [spotlightReports, setSpotlightReports] = useState<ReportListItem[]>([]);

  // Load reports for spotlight when modal opens
  React.useEffect(() => {
    if (isSearchModalOpen) {
      setSpotlightReports(getStoredReports());
    }
  }, [isSearchModalOpen]);

  // Debounce spotlight search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSpotlightQuery(spotlightQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [spotlightQuery]);

  // Spotlight search results
  const spotlightSearchResults = useMemo(() => {
    if (!debouncedSpotlightQuery.trim()) return spotlightReports.slice(0, 5);
    const q = debouncedSpotlightQuery.toLowerCase();
    return spotlightReports.filter((r) =>
      (r.vehicle?.vin || '').toLowerCase().includes(q) ||
      `${r.vehicle?.year || ''} ${r.vehicle?.make || ''} ${r.vehicle?.model || ''}`.toLowerCase().includes(q) ||
      (r.client?.name || '').toLowerCase().includes(q) ||
      (r.client?.company || '').toLowerCase().includes(q) ||
      (r.inspector?.name || '').toLowerCase().includes(q) ||
      (r.reportNumber || r.id || '').toLowerCase().includes(q)
    );
  }, [spotlightReports, debouncedSpotlightQuery]);

  // Keyboard shortcut for Spotlight (Ctrl+K or Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isSearchModalOpen) {
          setIsSearchModalOpen(true);
        } else {
          document.getElementById('spotlight-search-input')?.focus();
        }
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setIsHelpModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen]);

  // Toast helper
  const showToast = useCallback((text: string, type: 'success' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Expose showToast globally for child pages to use via CustomEvent
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.text) {
        showToast(detail.text, detail.type || 'info');
      }
    };
    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, [showToast]);

  // Route-aware nav items
  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, matchExact: true },
    { href: '/reports', label: 'Reports', icon: FileText, matchExact: false },
    { href: '/inspect', label: 'Inspect', icon: Pencil, matchExact: false },
  ];

  const isNavActive = (item: typeof navItems[number]) => {
    if (item.matchExact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] bg-dot-pattern flex flex-col md:flex-row p-3 sm:p-4 md:p-5 pl-3 sm:pl-4 md:pl-[106px] gap-4 sm:gap-5 overflow-x-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-[#E8F8EE] border-[#B3EBC8] text-[#1E7E34]'
                : 'bg-[#180321] border-purple-900 text-white'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-slate-100 flex items-center justify-around px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] print:hidden">
        {navItems.map((item) => {
          const active = isNavActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 ${
                active ? 'text-[#9723FF] font-bold' : 'text-slate-500 hover:text-[#1E1035]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setIsHelpModalOpen(true)}
          aria-expanded={isHelpModalOpen}
          aria-label="Help and documentation"
          className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#1E1035]"
        >
          <HelpCircle size={20} />
          <span className="text-[10px]">Help</span>
        </button>
      </nav>

      {/* Desktop Left Rail Navigation (Fixed) */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-[90px] flex-col justify-between items-center px-3 py-6 z-50 bg-white border-r border-slate-100 print:hidden">
        {/* Top Group: Brand + Nav Links */}
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
            {navItems.map((item) => {
              const active = isNavActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className="w-full flex flex-col justify-start items-center gap-1 group cursor-pointer"
                >
                  <div
                    className={`w-[46px] h-[46px] rounded-[14px] inline-flex justify-center items-center transition-all ${
                      active
                        ? 'bg-[#9723FF] text-white shadow-md shadow-purple-500/20 ring-2 ring-purple-300'
                        : 'bg-[#F8F9FB] border border-[#E2E4EB] shadow-sm group-hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <Icon
                      size={active ? 21 : 20}
                      className={active ? '' : 'text-[#645A6C] group-hover:text-[#1E1035] transition-colors'}
                    />
                  </div>
                  <span
                    className={`text-center text-[10.5px] ${
                      active ? 'text-[#9723FF] font-bold' : 'text-[#463B4D] font-semibold'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Group: Help */}
        <button
          onClick={() => setIsHelpModalOpen(true)}
          aria-expanded={isHelpModalOpen}
          aria-label="Open Inspection SOP & Standard Guide"
          title="Inspection SOP & Standard Guide"
          className="w-9 h-9 rounded-full bg-[#9CA3AF] hover:bg-[#85808B] transition-colors flex items-center justify-center text-white text-[15px] font-bold shadow-sm mb-2 cursor-pointer"
        >
          ?
        </button>
      </nav>

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col gap-4 sm:gap-6 max-w-[1600px] w-full mx-auto pb-32 md:pb-12 min-w-0">
        {children}
      </main>

      {/* Persistent Bottom-Right Support Badge */}
      <SupportBadge />

      {/* Spotlight Search Modal (Ctrl+K) */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10"
            >
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <Search size={20} className="text-[#9723FF]" />
                <input
                  id="spotlight-search-input"
                  type="text"
                  value={spotlightQuery}
                  onChange={(e) => setSpotlightQuery(e.target.value)}
                  placeholder="Search any VIN, Make, Model, Client, or Report ID..."
                  autoFocus
                  aria-label="Search reports"
                  className="flex-1 text-sm font-semibold text-[#1E1035] placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  onClick={() => setIsSearchModalOpen(false)}
                  aria-label="Close search"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#9723FF] focus-visible:outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-2">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Direct Matches ({spotlightSearchResults.length})
                </div>

                {spotlightSearchResults.map((report) => (
                  <Link
                    key={report.id}
                    href={`/inspect?id=${report.id}`}
                    onClick={() => setIsSearchModalOpen(false)}
                    className="p-3 rounded-2xl hover:bg-purple-50/70 border border-transparent hover:border-purple-100 flex items-center justify-between transition-colors group focus-visible:ring-2 focus-visible:ring-[#9723FF] focus-visible:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={report.vehicle.imageUrl}
                          alt={report.vehicle.model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E1035] group-hover:text-[#9723FF] transition-colors">
                          {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          VIN: {report.vehicle.vin} • {report.client.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#008751]">
                        {report.passPercentage}% Pass
                      </span>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-[#9723FF] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOP Help Modal */}
      <AnimatePresence>
        {isHelpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 z-10 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#9723FF]">
                    <ShieldCheck size={18} />
                  </div>
                  <h3 className="text-base font-bold text-[#1E1035]">Inspection Operations Guide</h3>
                </div>
                <button
                  onClick={() => setIsHelpModalOpen(false)}
                  aria-label="Close help"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong className="text-[#1E1035]">Protocol Grading:</strong> Any defect scored above 30% flags the vehicle for secondary supervisory sign-off.
                </p>
                <p>
                  <strong className="text-[#1E1035]">Odometer Verification:</strong> Mileage status marked as <em>Tampered</em> automatically blocks the vehicle from retail auction export until reviewed by legal compliance.
                </p>
                <p>
                  <strong className="text-[#1E1035]">Shortcuts:</strong> Press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono border">Ctrl+K</kbd> to launch Spotlight search across all VINs and reports.
                </p>
              </div>

              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#180321] text-white font-bold text-xs hover:bg-[#2C184A] transition-colors"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Helper to dispatch a toast from any child page.
 * Usage: dispatchToast('Report saved', 'success');
 */
export function dispatchToast(text: string, type: 'success' | 'info' = 'info') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { text, type } }));
  }
}
