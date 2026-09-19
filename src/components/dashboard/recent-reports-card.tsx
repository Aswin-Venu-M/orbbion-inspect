/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, Clock, AlertTriangle,
  FileText, Copy, Check,
} from 'lucide-react';
import type { ReportListItem } from '@/lib/reports-data';

interface RecentReportsCardProps {
  reports: ReportListItem[];
  maxItems?: number;
}

export function RecentReportsCard({ reports, maxItems = 5 }: RecentReportsCardProps) {
  const recentReports = reports.slice(0, maxItems);
  const [copiedVinId, setCopiedVinId] = React.useState<string | null>(null);

  const handleCopyVin = (e: React.MouseEvent, vin: string, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(vin);
    setCopiedVinId(id);
    setTimeout(() => setCopiedVinId(null), 2000);
  };

  return (
    <section className="bg-white rounded-[20px] sm:rounded-[28px] border border-slate-100 shadow-sm p-4 sm:p-5 md:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#9723FF]">
            <FileText size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1E1035]">Recent Inspections</h2>
            <p className="text-[11px] text-slate-500 font-medium">Latest {recentReports.length} of {reports.length} total records</p>
          </div>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#180321] text-white text-xs font-bold hover:bg-[#9723FF] transition-all shadow-xs cursor-pointer group"
        >
          <span>View All Reports</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Reports List */}
      {recentReports.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500 font-medium">
          No inspection reports yet. Start a new inspection to see reports here.
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {recentReports.map((report) => {
            const isPassHigh = report.passPercentage >= 80;
            const isTampered = report.vehicle.odometerStatus === 'Tampered';

            return (
              <Link
                key={report.id}
                href={`/inspect?id=${report.id}`}
                className="flex items-center gap-3 sm:gap-4 p-3 rounded-2xl hover:bg-[#FAF8FD] border border-transparent hover:border-purple-100/60 transition-all group"
              >
                {/* Vehicle Thumbnail */}
                <div className="w-14 h-11 sm:w-16 sm:h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                  <img
                    src={report.vehicle.imageUrl}
                    alt={report.vehicle.model}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isTampered && (
                    <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                      <AlertTriangle size={9} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1E1035] group-hover:text-[#9723FF] transition-colors truncate">
                      {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                      {report.reportNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-slate-500 truncate">
                      {report.vehicle.vin}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyVin(e, report.vehicle.vin, report.id)}
                      className="text-slate-400 hover:text-[#1E1035] transition-colors cursor-pointer shrink-0"
                      title="Copy VIN"
                    >
                      {copiedVinId === report.id ? (
                        <Check size={10} className="text-emerald-600" />
                      ) : (
                        <Copy size={10} />
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400 shrink-0">•</span>
                    <span className="text-[10px] text-slate-500 shrink-0">{report.date}</span>
                  </div>
                </div>

                {/* Pass Rate & Status */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Mini pass bar */}
                  <div className="hidden sm:flex flex-col items-end gap-0.5 w-16">
                    <span className={`text-[11px] font-extrabold ${isPassHigh ? 'text-[#008751]' : 'text-amber-600'}`}>
                      {report.passPercentage}%
                    </span>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isPassHigh ? 'bg-[#008751]' : 'bg-[#FE8E4B]'}`}
                        style={{ width: `${report.passPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  {report.status === 'published' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8F8EE] text-[#1E7E34] border border-[#B3EBC8] text-[9px] font-bold uppercase tracking-wider shrink-0">
                      <CheckCircle2 size={9} />
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold uppercase tracking-wider shrink-0">
                      <Clock size={9} />
                      Draft
                    </span>
                  )}

                  {/* Chevron */}
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-[#9723FF] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
