'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  totalCount: number;
  publishedCount: number;
  onRefresh?: () => void;
}

export function DashboardHeader({
  totalCount,
  publishedCount,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="relative w-full bg-white rounded-[20px] sm:rounded-[28px] shadow-sm border border-slate-100 p-3.5 sm:p-5 md:p-6 shrink-0">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Title & Counts */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E1035] tracking-tight truncate">
            Inspection Operations Hub
          </h1>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
            {totalCount} Total Inspections · {publishedCount} Certified &amp; Active
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2.5 sm:p-3 rounded-full border border-slate-200 text-slate-600 hover:text-[#1E1035] hover:bg-slate-50 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          )}

          <Link
            href="/inspect?new=true"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#9723FF] to-[#7915D4] text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Inspection</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
