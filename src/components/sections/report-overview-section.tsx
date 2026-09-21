"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { InputField } from '@/components/ui/input-field';
import { ReportOverviewData } from '@/lib/inspection-types';

export interface ReportOverviewSectionProps {
  data: ReportOverviewData;
  calculatedStats: { pass: number; fail: number };
  onChange: (data: Partial<ReportOverviewData>) => void;
}

export const ReportOverviewSection: React.FC<ReportOverviewSectionProps> = ({
  data,
  calculatedStats,
  onChange,
}) => {
  const passNum = Math.min(100, Math.max(0, parseInt(data?.pass || '0', 10) || 0));
  const failNum = 100 - passNum;

  return (
    <div id="section-report-overview" className="scroll-mt-6">
      <ReusableSection title="Report Overview" className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="w-full sm:w-1/3 flex flex-col gap-4">
          <InputField 
            label="Pass Percentage" 
            placeholder="e.g. 55" 
            type="number"
            min="0"
            max="100"
            rightText="%" 
            value={data?.pass ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              const num = Math.min(100, Math.max(0, Number(val) || 0));
              onChange({
                pass: String(num),
                fail: String(100 - num),
                autoCalculate: false,
              });
            }}
          />
          <InputField 
            label="Defects / Fail Percentage" 
            placeholder="e.g. 45" 
            type="number"
            min="0"
            max="100"
            rightText="%" 
            value={data?.fail ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              const num = Math.min(100, Math.max(0, Number(val) || 0));
              onChange({
                fail: String(num),
                pass: String(100 - num),
                autoCalculate: false,
              });
            }}
          />
          <button
            type="button"
            onClick={() => onChange({
              autoCalculate: true,
              pass: String(calculatedStats.pass),
              fail: String(calculatedStats.fail),
            })}
            className="text-xs font-semibold text-[#9723FF] hover:underline flex items-center gap-1 w-fit focus-visible:ring-2 focus-visible:ring-[#9723FF] focus-visible:outline-none rounded cursor-pointer"
          >
            <Sparkles size={13} />
            Auto-calculate from points
          </button>
        </div>

        {/* Dynamic Conic-Gradient Pie Chart */}
        <div className="w-full sm:w-1/3 flex flex-col items-center justify-center py-4">
          <div 
            className="w-[130px] h-[130px] rounded-full shadow-md border-4 border-white transition-all duration-500" 
            style={{
              background: `conic-gradient(#5BC335 0% ${passNum}%, #FE8E4B ${passNum}% 100%)`
            }}
          />
          <div className="flex items-center gap-4 mt-3 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#5BC335]" />
              <span>Pass {passNum}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FE8E4B]" />
              <span>Defects {failNum}%</span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-1/3 text-xs text-slate-500 leading-relaxed bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100">
          <span className="font-bold text-[#1E1035] block mb-1">Inspection Formula</span>
          Scores are calculated across chassis, tyres, rims, brakes, and electrical subsystems. Green represents safe parameters; orange indicates repairs or defects required.
        </div>
      </ReusableSection>
    </div>
  );
};
