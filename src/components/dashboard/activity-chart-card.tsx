'use client';

import React, { useState } from 'react';
import { BarChart3, PieChart, Sparkles, TrendingUp, Calendar, Info } from 'lucide-react';
import { DailyActivityData } from '@/lib/reports-data';

interface ActivityChartCardProps {
  activityData: DailyActivityData[];
  typeBreakdown: {
    label: string;
    count: number;
    percentage: number;
    color: string;
  }[];
}

export function ActivityChartCard({ activityData, typeBreakdown }: ActivityChartCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chartMode, setChartMode] = useState<'stacked' | 'total'>('stacked');

  const maxTotal = Math.max(...activityData.map((d) => d.total), 45);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 1. Left 8 Cols: Weekly Throughput Bar Chart */}
      <div className="lg:col-span-8 bg-white rounded-[20px] sm:rounded-[28px] p-4 sm:p-5 md:p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9723FF]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1E1035]">Weekly Inspection Throughput</h2>
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5">
              Daily inspection volumes across all certified technician bays (Passed vs. Flagged)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Legend */}
            <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-xs bg-[#008751]" />
                <span>Passed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-xs bg-[#FE8E4B]" />
                <span>Flagged</span>
              </div>
            </div>

            {/* Toggle Mode */}
            <div className="bg-[#F8F9FB] p-0.5 rounded-xl border border-slate-200/80 flex items-center">
              <button
                type="button"
                onClick={() => setChartMode('stacked')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMode === 'stacked'
                    ? 'bg-[#180321] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#1E1035]'
                }`}
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setChartMode('total')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMode === 'total'
                    ? 'bg-[#180321] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#1E1035]'
                }`}
              >
                Total
              </button>
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="relative pt-6 pb-2">
          {/* Chart Grid Lines */}
          <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-35">
            <div className="border-b border-dashed border-slate-300 w-full" />
            <div className="border-b border-dashed border-slate-300 w-full" />
            <div className="border-b border-dashed border-slate-300 w-full" />
            <div className="border-b border-slate-200 w-full" />
          </div>

          {/* Bars Container */}
          <div className="relative h-48 sm:h-56 flex items-end justify-between gap-1 sm:gap-4 px-1 sm:px-6">
            {activityData.map((item, index) => {
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20 bg-[#180321] text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-xl text-center pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-[10px] sm:text-[11px] font-bold">
                        {item.day} ({item.date}): {item.total} Cars
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-300 flex items-center justify-center gap-1.5 font-medium">
                        <span className="text-emerald-400 font-bold">{item.passed} Pass</span>
                        <span>•</span>
                        <span className="text-orange-300 font-bold">{item.failed} Flag</span>
                      </div>
                      <div className="w-2 h-2 bg-[#180321] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                    </div>
                  )}

                  {/* The Bar */}
                  <div className="w-full max-w-[28px] sm:max-w-[42px] flex flex-col justify-end transition-transform duration-200 group-hover:scale-y-[1.03] origin-bottom">
                    {chartMode === 'stacked' ? (
                      <div className="w-full flex flex-col rounded-t-xl overflow-hidden shadow-xs">
                        {/* Failed Top Segment */}
                        <div
                          className="w-full bg-[#FE8E4B] transition-all duration-500"
                          style={{ height: `${(item.failed / item.total) * ((item.total / maxTotal) * 180)}px` }}
                          title={`Flagged: ${item.failed}`}
                        />
                        {/* Passed Bottom Segment */}
                        <div
                          className="w-full bg-[#008751] transition-all duration-500"
                          style={{ height: `${(item.passed / item.total) * ((item.total / maxTotal) * 180)}px` }}
                          title={`Passed: ${item.passed}`}
                        />
                      </div>
                    ) : (
                      <div
                        className="w-full bg-gradient-to-t from-[#9723FF] to-[#BD66FF] rounded-t-xl transition-all duration-500 shadow-xs"
                        style={{ height: `${(item.total / maxTotal) * 180}px` }}
                      />
                    )}
                  </div>

                  {/* Day Label & Total */}
                  <div className="mt-3 text-center">
                    <span className={`block text-xs font-bold transition-colors ${isHovered ? 'text-[#9723FF]' : 'text-[#1E1035]'}`}>
                      {item.day}
                    </span>
                    <span className="block text-[10px] font-semibold text-slate-400">
                      {item.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Summary Note */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <TrendingUp size={14} className="text-[#008751]" />
            <span>Saturday achieved peak inspection velocity (43 vehicles processed in 1 day)</span>
          </div>
          <span className="font-bold text-[#1E1035]">Weekly Total: 204 Inspections</span>
        </div>
      </div>

      {/* 2. Right 4 Cols: Inspection Type Distribution */}
      <div className="lg:col-span-4 bg-white rounded-[20px] sm:rounded-[28px] p-4 sm:p-5 md:p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#1E1035]">Inspection Protocols</h3>
              <p className="text-xs text-slate-500">Service tier breakdown</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#9723FF]">
              <PieChart size={16} />
            </div>
          </div>

          {/* Multi-Segment Proportion Bar */}
          <div className="mt-5">
            <div className="flex h-3 w-full rounded-full overflow-hidden shadow-inner gap-0.5 p-0.5 bg-slate-100">
              {typeBreakdown.map((type) => (
                <div
                  key={type.label}
                  className="h-full rounded-sm transition-all duration-500 hover:opacity-90"
                  style={{ width: `${type.percentage}%`, backgroundColor: type.color }}
                  title={`${type.label}: ${type.percentage}%`}
                />
              ))}
            </div>
          </div>

          {/* Protocol Items List */}
          <div className="mt-5 flex flex-col gap-3">
            {typeBreakdown.map((type) => (
              <div
                key={type.label}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8F9FB] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-xs font-bold text-[#1E1035] truncate" title={type.label}>
                    {type.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-500">
                    {type.count}
                  </span>
                  <span className="text-xs font-extrabold text-[#1E1035] w-9 text-right">
                    {type.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tip Callout */}
        <div className="mt-4 p-3 rounded-2xl bg-purple-50/70 border border-purple-100/80 flex items-start gap-2.5">
          <Sparkles size={16} className="text-[#9723FF] shrink-0 mt-0.5" />
          <p className="text-[11px] text-purple-900 leading-relaxed font-medium">
            <span className="font-bold">600-Points Comprehensive</span> is the most requested package in Dubai & Abu Dhabi auctions this month.
          </p>
        </div>
      </div>
    </div>
  );
}
