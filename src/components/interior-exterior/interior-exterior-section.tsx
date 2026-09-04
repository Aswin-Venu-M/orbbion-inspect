"use client";

import React from 'react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { StatusBadge } from '@/components/ui/status-badge';
import { ImageUploadBox } from '@/components/ui/image-upload-box';
import { GeneralCommentsCard } from '@/components/ui/general-comments-card';
import { HeadingCard } from '@/components/ui/heading-card';
import { AddHeadlineButton } from '@/components/ui/add-headline-button';

export const InteriorExteriorSection = () => {
  const chunk1 = [
    { num: 1, label: "Roof Lining" },
    { num: 2, label: "Rear View Mirror" },
    { num: 3, label: "Steering Wheel Upholstery" },
    { num: 4, label: "Seats Upholstery" },
    { num: 5, label: "Gear Lever" },
    { num: 6, label: "Trunk Lining" },
  ];
  
  const chunk2 = [
    { num: 7, label: "Armrest & Side Pockets" },
    { num: 8, label: "Dashboard" },
    { num: 9, label: "Floor Mats" },
    { num: 10, label: "Doors" },
    { num: 11, label: "Front Windscreen" },
    { num: 12, label: "Rear Windscreen" },
  ];
  
  const chunk3 = [
    { num: 13, label: "Side windows" },
    { num: 14, label: "Hood" },
    { num: 15, label: "Trunk" },
    { num: 16, label: "Front Bumper" },
    { num: 17, label: "Back Bumper" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ReusableSection title="Interior & Exterior">
        
        {/* Top Badges */}
        <div className="flex justify-center items-center gap-3 mt-4 mb-10">
          <StatusBadge label="REPAIRED" type="repaired" />
          <StatusBadge label="DAMAGED" type="damaged" />
          <StatusBadge label="CHECKED" type="checked" />
        </div>

        {/* Car Diagram */}
        <div className="relative w-full max-w-[700px] mx-auto px-10 mt-10 mb-12">
          <div className="relative w-full">
            <img src="/assets/car-tw.png" alt="Car Top View" className="w-full h-auto block" />
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 659 285" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 z" fill="#1E1035" />
                </marker>
              </defs>
              {[
                { id: 12, cx: 100, cy: -30, tx: 150, ty: 120 },
                { id: 13, cx: 180, cy: -30, tx: 190, ty: 70 },
                { id: 7, cx: 250, cy: -30, tx: 270, ty: 142 },
                { id: 4, cx: 320, cy: -30, tx: 320, ty: 100 },
                { id: 3, cx: 390, cy: -30, tx: 380, ty: 120 },
                { id: 8, cx: 460, cy: -30, tx: 440, ty: 100 },
                { id: 11, cx: 530, cy: -30, tx: 480, ty: 120 },
                
                { id: 6, cx: 140, cy: 315, tx: 110, ty: 180 },
                { id: 10, cx: 230, cy: 315, tx: 240, ty: 220 },
                { id: 5, cx: 300, cy: 315, tx: 320, ty: 155 },
                { id: 9, cx: 380, cy: 315, tx: 370, ty: 200 },
                { id: 2, cx: 450, cy: 315, tx: 405, ty: 265 },
                { id: 1, cx: 520, cy: 315, tx: 450, ty: 240 },
                
                { id: 17, cx: -20, cy: 110, tx: 65, ty: 142 },
                { id: 15, cx: -10, cy: 190, tx: 100, ty: 160 },
                
                { id: 16, cx: 679, cy: 110, tx: 590, ty: 142 },
                { id: 14, cx: 669, cy: 190, tx: 540, ty: 170 },
              ].map(p => (
                <g key={p.id}>
                  <path d={`M ${p.cx} ${p.cy} L ${p.tx} ${p.ty}`} stroke="#1E1035" strokeWidth="1" markerEnd="url(#arrowhead)" />
                  <circle cx={p.cx} cy={p.cy} r="14" fill="#000" />
                  <text x={p.cx} y={p.cy} fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                    {p.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Legend Grid */}
          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 px-4 md:px-12 mt-12 mb-10">
            <div className="flex flex-col gap-3">
              {chunk1.map(item => (
                <div key={item.num} className="flex gap-2.5 text-[12px] font-bold text-[#1E1035]">
                  <span className="w-4">{item.num}.</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {chunk2.map(item => (
                <div key={item.num} className="flex gap-2.5 text-[12px] font-bold text-[#1E1035]">
                  <span className="w-[18px]">{item.num}.</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {chunk3.map(item => (
                <div key={item.num} className="flex gap-2.5 text-[12px] font-bold text-[#1E1035]">
                  <span className="w-[18px]">{item.num}.</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReusableSection>

      {/* Seats Upholstery Section */}
      <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-5">
            <h3 className="text-[16px] font-bold text-[#1E1035]">Seats Upholstery</h3>
            <div className="flex bg-[#F4F5F8] p-[3px] rounded-full border border-[#E2E4EB]">
              <button className="px-6 py-1 rounded-full text-[11px] tracking-wide font-bold bg-[#71D64B] text-white shadow-sm">PASS</button>
              <button className="px-6 py-1 rounded-full text-[11px] tracking-wide font-bold text-[#74768B] hover:text-[#1E1035] transition-colors">FAIL</button>
              <button className="px-6 py-1 rounded-full text-[11px] tracking-wide font-bold text-[#74768B] hover:text-[#1E1035] transition-colors">WEAK</button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1E1035]">Comments</label>
            <input 
              type="text" 
              placeholder="Enter comments" 
              className="w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-1 focus:ring-[#1E1035]/20 transition-all" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <ImageUploadBox status="uploading" progress={56} url="/assets/car-tw.png" />
            <ImageUploadBox status="uploading" progress={56} url="/assets/car-tw.png" />
            <ImageUploadBox status="completed" url="/assets/car-tw.png" />
            <ImageUploadBox status="empty" />
          </div>
        </div>
      </section>

      {/* General Comments Section */}
      <GeneralCommentsCard />

      {/* Heading Block */}
      <HeadingCard />

      {/* Add Headline Button */}
      <AddHeadlineButton />
    </div>
  );
};
