"use client";

import React, { useState } from 'react';
import { SectionHeader } from '../ui/section-header';
import { InspectionItemCard } from '../ui/inspection-item-card';
import { GeneralCommentsCard } from '../ui/general-comments-card';
import { HeadingCard } from '../ui/heading-card';
import { AddHeadlineButton } from '../ui/add-headline-button';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export function ElectricalSection() {
  const items = [
    'Gear Lever',
    'Doors',
    'Rear Windscreen',
    'Steering',
    'Key',
    'Infotainment',
    'Windows Operation',
    'Seats Adjustment',
    'Door Lock',
    'A/C Control & Cooling',
    'Cameras',
    'Gauges',
    'Rear View / Side Mirror',
    'A/C Grilles',
    'Ignition System',
    'Brake Lights',
    'Headlights',
    'Fog Lights',
    'Reverse Lights',
    'Number Plate Lights',
    'Indicators & Hazards',
    'Wipers',
    'Soft Closing Doors',
    'Interior Lights',
    'Cruise Control',
    'Horn',
    'Parking Sensors',
  ];

  // Key to force reset / re-render if "Mark All" is clicked
  const [bulkStatus, setBulkStatus] = useState<'pass' | 'fail' | 'weak' | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [customHeadlines, setCustomHeadlines] = useState<{ id: string }[]>([]);

  const handleMarkAll = (status: 'pass' | 'fail' | 'weak') => {
    setBulkStatus(status);
    setResetKey(prev => prev + 1);
  };

  const addHeadline = () => {
    setCustomHeadlines(prev => [...prev, { id: Math.random().toString(36).substring(7) }]);
  };

  const removeHeadline = (id: string) => {
    setCustomHeadlines(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div id="section-electrical" className="flex flex-col gap-6 w-full mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionHeader title="Electrical" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleMarkAll('pass')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F8EE] border border-[#B3EBC8] text-[#1E7E34] text-xs font-bold rounded-xl hover:bg-[#D4F3DE] transition-colors"
          >
            <CheckCircle2 size={14} />
            Mark All Pass
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('weak')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDE6] border border-[#FEEA85] text-[#856404] text-xs font-bold rounded-xl hover:bg-[#FFF9C4] transition-colors"
          >
            Mark All Weak
          </button>
        </div>
      </div>

      <div key={resetKey} className="flex flex-col gap-5">
        {items.map((item, index) => (
          <InspectionItemCard
            key={`${item}-${index}`}
            title={item}
            initialStatus={bulkStatus || 'pass'}
          />
        ))}
      </div>

      {/* General Comments Section */}
      <GeneralCommentsCard placeholder="General comments on vehicle battery, fuses, wiring harness..." />

      {/* Default Heading Block */}
      <HeadingCard initialTitle="OBD-II Diagnostic Scan & Fault Codes" />

      {/* Dynamically added headlines */}
      {customHeadlines.map(h => (
        <HeadingCard
          key={h.id}
          isRemovable
          onRemove={() => removeHeadline(h.id)}
        />
      ))}

      {/* Add Headline Button */}
      <AddHeadlineButton onClick={addHeadline} label="Add Electrical Headline" />
    </div>
  );
}
