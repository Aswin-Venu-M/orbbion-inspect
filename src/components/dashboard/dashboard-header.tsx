'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Sparkles, SlidersHorizontal, Calendar, 
  ShieldCheck, RefreshCw, CarFront, FileText, ChevronDown 
} from 'lucide-react';
import { DATE_PRESET_OPTIONS } from '@/constants/options';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  datePreset: 'today' | '7d' | '30d' | 'all';
  onDatePresetChange: (preset: 'today' | '7d' | '30d' | 'all') => void;
  totalCount: number;
  publishedCount: number;
  onRefresh?: () => void;
}

export function DashboardHeader({
  searchQuery,
  onSearchChange,
  datePreset,
  onDatePresetChange,
  totalCount,
  publishedCount,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="relative w-full bg-white rounded-[20px] sm:rounded-[28px] shadow-sm border border-slate-100 p-3.5 sm:p-5 md:p-6 shrink-0 flex flex-col gap-3.5 sm:gap-4">
      {/* Top Row: Title, Live Hub Status & Primary Action */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
        {/* Title & Hub Status */}
        <div className="flex flex-col gap-1 sm:gap-1.5 w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-[#180321] text-white text-[10px] sm:text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shrink-0">
              <ShieldCheck size={12} className="text-[#008751]" />
              Enterprise Platform
            </span>
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#E8F8EE] border border-[#B3EBC8] text-[#1E7E34] text-[10px] sm:text-[11px] font-bold truncate">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#008751] animate-ping shrink-0" />
              <span className="truncate">LIVE: DUBAI AL QUOZ HUB (8/10 ON DUTY)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mt-0.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E1035] tracking-tight">
              Inspection Operations Hub
            </h1>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
              {totalCount} Total Inspections • {publishedCount} Certified & Active
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto self-end lg:self-center">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 hover:text-[#1E1035] hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          )}

          <Link
            href="/inspect"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#9723FF] to-[#7915D4] text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>+ New Inspection</span>
          </Link>
        </div>
      </div>

      {/* Bottom Row: Search Bar & Preset Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2.5 sm:pt-3 border-t border-slate-100">
        {/* Search Input */}
        <div className="relative flex-1 w-full max-w-xl">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by VIN, Vehicle Make & Model, Client Name, Inspector..."
            className="w-full pl-9 sm:pl-10 pr-12 sm:pr-14 py-2 sm:py-2.5 rounded-xl bg-[#F8F9FB] border border-slate-200/80 text-xs sm:text-sm font-medium text-[#1E1035] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9723FF]/30 focus:border-[#9723FF] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-slate-500 hover:text-[#1E1035] bg-slate-200/70 hover:bg-slate-200 rounded px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0 scrollbar-none touch-pan-x">
          <span className="text-xs font-bold text-slate-500 mr-1 hidden md:inline-flex items-center gap-1">
            <Calendar size={13} />
            Period:
          </span>
          {DATE_PRESET_OPTIONS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onDatePresetChange(preset.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
                datePreset === preset.id
                  ? 'bg-[#180321] text-white shadow-xs'
                  : 'bg-[#F8F9FB] text-slate-600 hover:text-[#1E1035] hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
