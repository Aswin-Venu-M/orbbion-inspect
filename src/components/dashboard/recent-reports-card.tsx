/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, Clock, AlertTriangle,
  FileText, Copy, Check, Car, Plus,
} from 'lucide-react';
import type { ReportListItem } from '@/lib/reports-data';

interface RecentReportsCardProps {
  reports: ReportListItem[];
  maxItems?: number;
}

const FALLBACK_VEHICLE_IMG = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=600&auto=format&fit=crop';

export function RecentReportsCard({ reports, maxItems = 5 }: RecentReportsCardProps) {
  const recentReports = reports.slice(0, maxItems);
  const [copiedVinId, setCopiedVinId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleCopyVin = (e: React.MouseEvent, vin: string, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(vin);
      setCopiedVinId(id);
      setTimeout(() => setCopiedVinId(null), 2000);
    }
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
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
            <p className="text-[11px] text-slate-500 font-medium">
              Latest {recentReports.length} of {reports.length} total records
            </p>
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
        <div className="py-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200/80 rounded-2xl p-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[#9723FF] mb-3">
            <Car size={24} />
          </div>
          <h3 className="text-sm font-bold text-[#1E1035]">No inspection reports found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            Get started by launching a new vehicle inspection session or importing records.
          </p>
          <Link
            href="/inspect?new=true"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#180321] text-white text-xs font-bold hover:bg-[#9723FF] transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Start New Inspection</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {recentReports.map((report) => {
            const passPct = report.passPercentage ?? 85;
            const isPassHigh = passPct >= 80;
            const isTampered = report.vehicle?.odometerStatus === 'Tampered';
            const vehicleMake = report.vehicle?.make || 'Vehicle';
            const vehicleModel = report.vehicle?.model || '';
            const vehicleYear = report.vehicle?.year || '';
            const vin = report.vehicle?.vin || 'VIN Not Specified';
            const hasImgError = imageErrors[report.id];
            const imgSrc = hasImgError ? FALLBACK_VEHICLE_IMG : (report.vehicle?.imageUrl || FALLBACK_VEHICLE_IMG);

            return (
              <Link
                key={report.id}
                href={`/inspect?id=${report.id}`}
                className="flex items-center gap-3 sm:gap-4 p-3 rounded-2xl hover:bg-[#FAF8FD] border border-transparent hover:border-purple-100/60 transition-all group"
              >
                {/* Vehicle Thumbnail */}
                <div className="w-14 h-11 sm:w-16 sm:h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                  <img
                    src={imgSrc}
                    alt={`${vehicleMake} ${vehicleModel}`}
                    onError={() => handleImageError(report.id)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isTampered && (
                    <div
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center"
                      title="Odometer Tampered Alert"
                    >
                      <AlertTriangle size={9} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1E1035] group-hover:text-[#9723FF] transition-colors truncate">
                      {vehicleYear} {vehicleMake} {vehicleModel}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                      {report.reportNumber || report.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-slate-500 truncate">
                      {vin}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyVin(e, vin, report.id)}
                      className="text-slate-400 hover:text-[#1E1035] transition-colors cursor-pointer shrink-0"
                      title="Copy VIN"
                      aria-label={`Copy VIN ${vin}`}
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
                      {passPct}%
                    </span>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isPassHigh ? 'bg-[#008751]' : 'bg-[#FE8E4B]'}`}
                        style={{ width: `${Math.min(100, Math.max(0, passPct))}%` }}
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
