'use client';

import React from 'react';
import {
  FileCheck, CheckCircle2, Clock, AlertTriangle,
  ShieldAlert, ArrowUpRight,
} from 'lucide-react';
import { DashboardKPIData } from '@/lib/reports-data';

interface KPIStatsGridProps {
  data: DashboardKPIData;
  onFilterAll?: () => void;
  onFilterPublished?: () => void;
  onFilterDrafts?: () => void;
  onFilterTampered?: () => void;
}

export function KPIStatsGrid({
  data,
  onFilterAll,
  onFilterPublished,
  onFilterDrafts,
  onFilterTampered,
}: KPIStatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* 1. Total Inspections (Clickable) */}
      <div
        role={onFilterAll ? 'button' : undefined}
        tabIndex={onFilterAll ? 0 : undefined}
        aria-label="View all inspection reports"
        onClick={onFilterAll}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onFilterAll) {
            e.preventDefault();
            onFilterAll();
          }
        }}
        className={`bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between transition-all outline-none ${
          onFilterAll
            ? 'hover:shadow-md hover:border-purple-200 focus-visible:ring-2 focus-visible:ring-purple-500 cursor-pointer'
            : 'hover:shadow-md hover:border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume</span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 flex items-center justify-center text-[#9723FF]">
            <FileCheck size={17} strokeWidth={2.5} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1E1035] tracking-tight">
            {data.totalInspections.value.toLocaleString()}
          </div>
          <span className="text-[11px] font-medium text-slate-400 mt-1 block">
            Across all hubs
          </span>
        </div>
        {onFilterAll && (
          <div className="flex items-center justify-between text-[11px] font-bold text-[#9723FF] mt-3 pt-2 border-t border-slate-100">
            <span>View All Records</span>
            <ArrowUpRight size={13} />
          </div>
        )}
      </div>

      {/* 2. Pass Rate (Clickable) */}
      <div
        role={onFilterPublished ? 'button' : undefined}
        tabIndex={onFilterPublished ? 0 : undefined}
        aria-label="Filter certified published reports"
        onClick={onFilterPublished}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onFilterPublished) {
            e.preventDefault();
            onFilterPublished();
          }
        }}
        className={`bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between transition-all outline-none ${
          onFilterPublished
            ? 'hover:shadow-md hover:border-emerald-200 focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer'
            : 'hover:shadow-md hover:border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Pass Rate</span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#008751]">
            <CheckCircle2 size={17} strokeWidth={2.5} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1E1035] tracking-tight">
            {data.passRate.value}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-[#008751] h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, data.passRate.value))}%` }}
            />
          </div>
        </div>
        {onFilterPublished && (
          <div className="flex items-center justify-between text-[11px] font-bold text-[#008751] mt-3 pt-2 border-t border-slate-100">
            <span>View Published</span>
            <ArrowUpRight size={13} />
          </div>
        )}
      </div>

      {/* 3. Drafts Queue (Clickable) */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Filter reports by active drafts"
        onClick={onFilterDrafts}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFilterDrafts?.();
          }
        }}
        className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-purple-200 focus-visible:ring-2 focus-visible:ring-purple-500 transition-all cursor-pointer outline-none"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Drafts Queue</span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={17} strokeWidth={2.5} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1E1035] tracking-tight flex items-center gap-2">
            <span>{data.pendingDrafts.value}</span>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Active
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-700 mt-1.5 block">
            {data.pendingDrafts.urgentCount} pending client review
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold text-[#9723FF] mt-3 pt-2 border-t border-slate-100">
          <span>Filter Drafts</span>
          <ArrowUpRight size={13} />
        </div>
      </div>

      {/* 4. Flagged Severe Defects (Clickable) */}
      <div
        role="button"
        tabIndex={0}
        aria-label="View tampered reports"
        onClick={onFilterTampered}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFilterTampered?.();
          }
        }}
        className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-orange-200 focus-visible:ring-2 focus-visible:ring-orange-500 transition-all cursor-pointer outline-none"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Severe Flags</span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#FE8E4B]">
            <AlertTriangle size={17} strokeWidth={2.5} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1E1035] tracking-tight flex items-center gap-2">
            <span>{data.flaggedDefects.value}</span>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 flex items-center gap-1">
              <ShieldAlert size={11} />
              {data.flaggedDefects.tamperedCount} Tampered
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#FE8E4B] mt-1.5 block">
            Critical chassis &amp; odometer alerts
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold text-[#FE8E4B] mt-3 pt-2 border-t border-slate-100">
          <span>View Tampered Reports</span>
          <ArrowUpRight size={13} />
        </div>
      </div>
    </div>
  );
}
