"use client";

import React from 'react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { DatePickerInput } from '@/components/ui/date-picker-input';
import { TimePickerInput } from '@/components/ui/time-picker-input';
import { SelectField } from '@/components/ui/select-field';
import { InputField } from '@/components/ui/input-field';
import { InspectionDetailsData } from '@/lib/inspection-types';
import { inspectionTypeOptions } from '@/constants/options';

export interface InspectionDetailsSectionProps {
  data: InspectionDetailsData;
  onChange: (data: Partial<InspectionDetailsData>) => void;
}

export const InspectionDetailsSection: React.FC<InspectionDetailsSectionProps> = ({
  data,
  onChange,
}) => {
  return (
    <div id="section-inspection-details" className="scroll-mt-6">
      <ReusableSection title="Inspection Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DatePickerInput 
            label="Date" 
            required 
            placeholder="DD-MM-YYYY"
            dateFormat="DD-MM-YYYY"
            value={data?.date ?? ''}
            onChange={(dateVal) => onChange({ date: dateVal })}
            className="w-full"
          />
          <TimePickerInput 
            label="Time" 
            required 
            placeholder="09:00 AM" 
            value={data?.time ?? ''}
            onChange={(timeVal) => onChange({ time: timeVal })}
            className="w-full"
          />
          <SelectField 
            label="Inspection Type" 
            required 
            placeholder="Select Inspection Type"
            options={inspectionTypeOptions}
            value={data?.inspectionType ?? ''}
            onChange={(e) => onChange({ inspectionType: e.target.value as string })}
          />
          <InputField 
            label="VIN Number" 
            required 
            placeholder="Enter 17-digit VIN" 
            maxLength={17}
            value={data?.vinNumber ?? ''}
            onChange={(e) => {
              const sanitized = e.target.value
                .toUpperCase()
                .replace(/[^A-HJ-NPR-Z0-9]/g, '')
                .slice(0, 17);
              onChange({ vinNumber: sanitized });
            }}
          />
        </div>
      </ReusableSection>
    </div>
  );
};
