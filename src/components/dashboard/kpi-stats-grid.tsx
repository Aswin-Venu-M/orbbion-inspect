'use client';

import React from 'react';
import { 
  FileCheck, CheckCircle2, Clock, AlertTriangle, Users, 
  TrendingUp, TrendingDown, ShieldAlert, ArrowUpRight 
} from 'lucide-react';
import { DashboardKPIData } from '@/lib/reports-data';

interface KPIStatsGridProps {
  data: DashboardKPIData;
  onFilterDrafts?: () => void;
  onFilterTampered?: () => void;
}

export function KPIStatsGrid({ data, onFilterDrafts, onFilterTampered }: KPIStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Total Inspections */}
      <div className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-slate-200 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume</span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-[#9723FF]">
            <FileCheck size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl font-extrabold text-[#1E1035] tracking-tight">
            {data.totalInspections.value.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              <TrendingUp size={12} />
              +{data.totalInspections.change}%
            </span>
            <span className="text-[11px] font-medium text-slate-400">{data.totalInspections.period}</span>
          </div>
        </div>

        {/* Mini Sparkline Bar representation */}
        <div className="flex items-end gap-1 h-3 mt-4 pt-1">
          <div className="w-1/6 bg-purple-100 rounded-sm h-1.5" />
          <div className="w-1/6 bg-purple-200 rounded-sm h-2" />
          <div className="w-1/6 bg-purple-200 rounded-sm h-2.5" />
          <div className="w-1/6 bg-purple-300 rounded-sm h-2" />
          <div className="w-1/6 bg-purple-400 rounded-sm h-3" />
          <div className="w-1/6 bg-[#9723FF] rounded-sm h-3" />
        </div>
      </div>

      {/* 2. Pass Rate */}
      <div className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-slate-200 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pass Rate</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#008751]">
            <CheckCircle2 size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1E1035] tracking-tight">
              {data.passRate.value}%
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                <TrendingUp size={12} />
                +{data.passRate.change}%
              </span>
              <span className="text-[11px] font-medium text-slate-400">{data.passRate.period}</span>
            </div>
          </div>

          {/* Mini Radial Indicator */}
          <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#008751]"
                strokeDasharray={`${data.passRate.value}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-extrabold text-[#008751]">
              {Math.round(data.passRate.value)}%
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
          <div 
            className="bg-[#008751] h-full rounded-full transition-all duration-700" 
            style={{ width: `${data.passRate.value}%` }} 
          />
        </div>
      </div>

      {/* 3. Drafts In-Progress */}
      <div 
        onClick={onFilterDrafts}
        className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-purple-200 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Drafts Queue</span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1E1035] tracking-tight flex items-center gap-2">
            <span>{data.pendingDrafts.value}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Active
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-xs font-bold text-amber-700">
              {data.pendingDrafts.urgentCount} pending client review
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-[#9723FF] mt-4 pt-1 border-t border-slate-100">
          <span>Filter Drafts</span>
          <ArrowUpRight size={13} />
        </div>
      </div>

      {/* 4. Flagged Severe Defects */}
      <div 
        onClick={onFilterTampered}
        className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-orange-200 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severe Flags</span>
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#FE8E4B]">
            <AlertTriangle size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1E1035] tracking-tight flex items-center gap-2">
            <span>{data.flaggedDefects.value}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 flex items-center gap-1">
              <ShieldAlert size={11} />
              {data.flaggedDefects.tamperedCount} Tampered
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-xs font-bold text-[#FE8E4B]">
              Critical chassis & odometer alerts
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-[#FE8E4B] mt-4 pt-1 border-t border-slate-100">
          <span>View Tampered Reports</span>
          <ArrowUpRight size={13} />
        </div>
      </div>

      {/* 5. Certified Inspectors */}
      <div className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-slate-200 transition-all sm:col-span-2 lg:col-span-3 xl:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inspectors</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1E1035] tracking-tight flex items-baseline gap-1.5">
            <span>{data.activeInspectors.onDuty}</span>
            <span className="text-sm font-semibold text-slate-400">/ {data.activeInspectors.total} On Duty</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-600">Dubai Al Quoz & Abu Dhabi</span>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-700" 
            style={{ width: `${(data.activeInspectors.onDuty / data.activeInspectors.total) * 100}%` }} 
          />
        </div>
      </div>
    </div>
  );
}
