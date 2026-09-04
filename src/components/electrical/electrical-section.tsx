import React from 'react';
import { SectionHeader } from '../ui/section-header';
import { InspectionItemCard } from '../ui/inspection-item-card';
import { GeneralCommentsCard } from '../ui/general-comments-card';
import { HeadingCard } from '../ui/heading-card';
import { AddHeadlineButton } from '../ui/add-headline-button';

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

  return (
    <div className="flex flex-col gap-6 w-full mt-4">
      <SectionHeader title="Electrical" />

      {items.map((item, index) => (
        <InspectionItemCard key={index} title={item} />
      ))}

      {/* General Comments Section */}
      <GeneralCommentsCard />

      {/* Heading Block */}
      <HeadingCard />

      {/* Add Headline Button */}
      <AddHeadlineButton />
    </div>
  );
}
