"use client";

import React, { useMemo } from 'react';
import { MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { InputField } from '@/components/ui/input-field';
import { SelectField } from '@/components/ui/select-field';
import { ComboboxField } from '@/components/ui/combobox-field';
import { YearPickerInput } from '@/components/ui/year-picker-input';
import { VehicleSummaryData } from '@/lib/inspection-types';
import {
  CAR_MAKES,
  CAR_MODELS_BY_MAKE,
  POPULAR_CAR_MODELS,
  REGIONAL_SPECS_OPTIONS,
  TRANSMISSION_OPTIONS,
  ENGINE_SIZE_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  EXTERNAL_COLOUR_OPTIONS,
  FUEL_TYPE_OPTIONS,
  odometerStatusOptions,
} from '@/constants';

export interface VehicleSummarySectionProps {
  data: VehicleSummaryData;
  onChange: (data: Partial<VehicleSummaryData>) => void;
}

export const VehicleSummarySection: React.FC<VehicleSummarySectionProps> = ({
  data,
  onChange,
}) => {
  const currentMakeModels = useMemo(() => {
    const make = data.make?.trim();
    if (!make) return POPULAR_CAR_MODELS;
    const foundKey = Object.keys(CAR_MODELS_BY_MAKE).find(
      (k) => k.toLowerCase() === make.toLowerCase()
    );
    return foundKey ? CAR_MODELS_BY_MAKE[foundKey] : POPULAR_CAR_MODELS;
  }, [data.make]);

  const incrementKeys = () => {
    onChange({ numberOfKeys: Math.min((data.numberOfKeys || 0) + 1, 10) });
  };

  const decrementKeys = () => {
    onChange({ numberOfKeys: Math.max((data.numberOfKeys || 0) - 1, 0) });
  };

  const toggleOdometerUnit = () => {
    onChange({ odometerUnit: data.odometerUnit === 'KM' ? 'Miles' : 'KM' });
  };

  return (
    <div id="section-vehicle-summary" className="scroll-mt-6">
      <ReusableSection title="Vehicle Summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
          <ComboboxField 
            label="Make" 
            placeholder="Enter Make (e.g. Toyota)" 
            options={CAR_MAKES}
            value={data.make}
            onChange={(e) => onChange({ make: e.target.value })}
          />
          <ComboboxField 
            label="Model" 
            placeholder="Enter Model (e.g. Tundra)" 
            options={currentMakeModels}
            value={data.model}
            onChange={(e) => onChange({ model: e.target.value })}
          />
          <YearPickerInput 
            label="Model Year" 
            required
            placeholder="YYYY" 
            value={data.year}
            onChange={(val) => onChange({ year: val })}
            minYear={1900}
            maxYear={new Date().getFullYear() + 1}
          />
          
          <ComboboxField 
            label="Regional Specs" 
            placeholder="GCC, American, Euro..." 
            options={REGIONAL_SPECS_OPTIONS}
            rightIcon={<MapPin size={18} />} 
            value={data.regionalSpecs}
            onChange={(e) => onChange({ regionalSpecs: e.target.value })}
          />
          <ComboboxField 
            label="Transmission" 
            placeholder="Automatic, Manual..." 
            options={TRANSMISSION_OPTIONS}
            value={data.transmission}
            onChange={(e) => onChange({ transmission: e.target.value })}
          />
          <ComboboxField 
            label="Engine Size" 
            placeholder="3.5L V6, 2.0L Turbo..." 
            options={ENGINE_SIZE_OPTIONS}
            value={data.engineSize}
            onChange={(e) => onChange({ engineSize: e.target.value })}
          />
          
          <SelectField 
            label="Odometer Status" 
            placeholder="Select Odometer Status" 
            options={odometerStatusOptions}
            value={data.odometerStatus}
            onChange={(e) => {
              const newStatus = e.target.value as string;
              onChange({ 
                odometerStatus: newStatus,
                tamperedReading: newStatus === 'Tampered' ? data.tamperedReading : '',
              });
            }}
          />

          {/* Spare Type Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#1E1035]">Spare Type</label>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => onChange({ spareType: 'available' })}
                className={`flex-1 text-sm font-semibold h-[46px] rounded-[14px] transition-all cursor-pointer ${
                  data.spareType === 'available'
                    ? 'bg-[#F4E8FF] border border-[#D9A8FF] text-[#9723FF] shadow-xs'
                    : 'bg-[#F4F5F8] text-[#A0A4AB] hover:text-[#1E1035]'
                }`}
              >
                Available
              </button>
              <button 
                type="button"
                onClick={() => onChange({ spareType: 'not-available' })}
                className={`flex-1 text-sm font-semibold h-[46px] rounded-[14px] transition-all cursor-pointer ${
                  data.spareType === 'not-available'
                    ? 'bg-[#F4E8FF] border border-[#D9A8FF] text-[#9723FF] shadow-xs'
                    : 'bg-[#F4F5F8] text-[#A0A4AB] hover:text-[#1E1035]'
                }`}
              >
                Not-Available
              </button>
            </div>
          </div>

          {/* Number of Keys with Stepper */}
          <InputField 
            label="Number of Keys" 
            placeholder="Number of Keys" 
            type="number"
            min="0"
            max="10"
            value={data.numberOfKeys}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              const clamped = isNaN(parsed) ? 0 : Math.min(10, Math.max(0, parsed));
              onChange({ numberOfKeys: clamped });
            }}
            rightIcon={
              <div className="flex flex-col items-center justify-center text-slate-400">
                <button type="button" onClick={incrementKeys} className="hover:text-[#1E1035] p-0.5" aria-label="Increase number of keys">
                  <ChevronUp size={12} strokeWidth={3} />
                </button>
                <button type="button" onClick={decrementKeys} className="hover:text-[#1E1035] p-0.5" aria-label="Decrease number of keys">
                  <ChevronDown size={12} strokeWidth={3} />
                </button>
              </div>
            } 
          />

          <ComboboxField 
            label="Vehicle Type" 
            placeholder="SUV, Truck, Sedan, Coupe..." 
            options={VEHICLE_TYPE_OPTIONS}
            value={data.vehicleType}
            onChange={(e) => onChange({ vehicleType: e.target.value })}
          />
          <ComboboxField 
            label="External Colour" 
            placeholder="Grey, White, Black..." 
            options={EXTERNAL_COLOUR_OPTIONS}
            value={data.externalColour}
            onChange={(e) => onChange({ externalColour: e.target.value })}
          />
          <ComboboxField 
            label="Fuel Type" 
            placeholder="Petrol, Diesel, Hybrid, EV..." 
            options={FUEL_TYPE_OPTIONS}
            value={data.fuelType}
            onChange={(e) => onChange({ fuelType: e.target.value })}
          />
          
          <InputField 
            label="Odometer Reading" 
            placeholder="Current mileage" 
            value={data.odometerReading}
            onChange={(e) => onChange({ odometerReading: e.target.value.replace(/[^0-9]/g, '') })}
            rightText={
              <button 
                type="button" 
                onClick={toggleOdometerUnit}
                className="font-bold hover:underline cursor-pointer flex items-center gap-1"
                title="Toggle between KM and Miles"
              >
                <span className={data.odometerUnit === 'KM' ? 'text-[#9723FF]' : 'text-slate-400'}>KM</span>
                <span>/</span>
                <span className={data.odometerUnit === 'Miles' ? 'text-[#9723FF]' : 'text-slate-400'}>Miles</span>
              </button>
            } 
          />
          <InputField 
            label="Tampered Odometer Reading" 
            placeholder="Reported tampered reading" 
            value={data.tamperedReading}
            disabled={data.odometerStatus !== 'Tampered'}
            onChange={(e) => onChange({ tamperedReading: e.target.value.replace(/[^0-9]/g, '') })}
            rightText={
              <span className="font-bold text-slate-500">
                {data.odometerUnit}
              </span>
            } 
          />
        </div>
      </ReusableSection>
    </div>
  );
};
