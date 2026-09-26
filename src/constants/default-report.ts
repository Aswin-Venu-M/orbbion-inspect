import { FullInspectionReport } from '@/lib/inspection-types';

export const INITIAL_REPORT_DATA: FullInspectionReport = {
  id: '440',
  title: 'Report 440',
  status: 'draft',
  lastSavedAt: 'Saved just now',
  inspectionDetails: {
    date: '06-08-2025',
    time: '09:00',
    inspectionType: '600-Points Comprehensive',
    vinNumber: 'WMWWG9C51K3E40764',
  },
  vehicleSummary: {
    make: 'Toyota',
    model: 'Tundra',
    year: '2025',
    regionalSpecs: 'American',
    transmission: 'Automatic',
    engineSize: '3.5L Twin-Turbo V6',
    odometerStatus: 'Tampered',
    spareType: 'available',
    numberOfKeys: 1,
    vehicleType: 'Truck',
    externalColour: 'Grey',
    fuelType: 'Petrol',
    odometerReading: '621515',
    odometerUnit: 'KM',
    tamperedReading: '621515',
  },
  reportOverview: {
    pass: '55',
    fail: '45',
    weak: '0',
    autoCalculate: true,
  },
  clientDetails: {
    name: 'Al Tayer Motors LLC',
    countryCode: '+971',
    whatsappNumber: '054 409 3009',
    email: 'client@altayer.com',
    vehicleDetails: '2025 Toyota Tundra TRD Pro',
    location: 'Dubai',
  },
  teamDetails: {
    inspector: 'Ahmed Al Mansoori (Lead Inspector)',
  },
  tyres: {
    RR: { status: 'pass', year: '2025', comments: 'The tyre has multiple scratches', image: { url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400', progress: 100 } },
    RL: { status: 'pass', year: '2025', comments: '', image: null },
    FR: { status: 'pass', year: '2025', comments: '', image: { url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400', progress: 100 } },
    FL: { status: 'pass', year: '2025', comments: '', image: { url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400', progress: 100 } },
    ST: { status: 'pass', year: '2025', comments: '', image: { url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400', progress: 100 } },
  },
  rims: {
    RR: { status: 'pass', year: '2025', comments: 'The rim has multiple scratches', image: { url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400', progress: 100 } },
    RL: { status: 'pass', year: '2025', comments: '', image: null },
    FR: { status: 'pass', year: '2025', comments: '', image: { url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400', progress: 100 } },
    FL: { status: 'pass', year: '2025', comments: '', image: { url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400', progress: 100 } },
    ST: { status: 'pass', year: '2025', comments: '', image: { url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400', progress: 100 } },
  },
  brakes: {
    RR: { status: 'pass', year: '2025', comments: 'Brake pads within safe tolerance (6mm)', image: null },
    RL: { status: 'pass', year: '2025', comments: 'Brake pads in good condition (6mm)', image: null },
    FR: { status: 'pass', year: '2025', comments: 'Front pads 7mm, rotor smooth', image: null },
    FL: { status: 'pass', year: '2025', comments: 'Front pads 7mm, rotor smooth', image: null },
    ST: { status: 'pass', year: '2025', comments: 'Not applicable for spare', image: null },
  },
  chassisSubframeComments: 'Chassis frame rails and cross-members intact. Underbody anti-corrosion coating in good condition with no structural deformation.',
  chassisSubframeImages: [],
  chassisSubframePartStatuses: {
    1: 'checked', 2: 'checked', 3: 'checked', 4: 'checked', 5: 'checked',
    6: 'checked', 7: 'checked', 8: 'checked', 9: 'checked', 10: 'checked',
    11: 'checked', 12: 'checked', 13: 'checked', 14: 'checked', 15: 'checked',
    16: 'checked', 17: 'checked', 18: 'checked', 19: 'checked', 20: 'checked',
  },
  chassisSubframeCustomHeadlines: [
    { id: 'default-chassis', title: 'Chassis Details', comments: 'Underbody shielding securely mounted with OEM fasteners.' }
  ],
  bodyComments: 'Minor hairline scratches on rear bumper. Paint depth uniform across all panels.',
  bodyGeneralComments: 'Vehicle body panel alignment within OEM factory tolerances. Zero previous collision repairs found.',
  bodyGeneralImages: [],
  bodyImages: [],
  bodyPartStatuses: {
    frontBumper: 'good',
    hood: 'good',
    roof: 'good',
    trunk: 'good',
    rearBumper: 'good',
    leftFrontFender: 'good',
    leftFrontDoor: 'good',
    leftBackDoor: 'good',
    leftRearFender: 'good',
    rightFrontFender: 'good',
    rightFrontDoor: 'good',
    rightBackDoor: 'good',
    rightRearFender: 'good',
  },
  bodyCustomHeadlines: [
    { id: 'default-body', title: 'Underbody Shield & Chassis Frame', comments: 'Underbody aero covers intact and free from scrape damage.' }
  ],
  interiorComments: 'Dashboard, door cards, and trim panels in clean condition with no visible scuffs or fading.',
  interiorGeneralImages: [],
  seatsComments: 'Interior upholstery in clean condition. Minimal wear on steering wheel and driver bolster.',
  seatsStatus: 'pass',
  seatsImages: [],
  interiorCustomHeadlines: [
    { id: 'default-interior', title: 'Dashboard & Infotainment Screen Trim', comments: 'Touchscreen responsive with no dead pixels or software lag.' }
  ],
  electricalComments: 'Battery health measured at 92%. Alternator output stable at 14.2V under full load. All control modules clear.',
  electricalGeneralImages: [],
  electricalItems: {},
  electricalCustomHeadlines: [
    { id: 'default-electrical', title: 'OBD-II Diagnostic Scan & Fault Codes', comments: 'Zero active or pending DTC codes found across all electronic systems.' }
  ],
  engineComments: 'Engine runs smoothly without vibrations or abnormal noises. Fluid levels are optimal and no leaks detected.',
  engineGeneralImages: [],
  engineItems: {},
  engineCustomHeadlines: [
    { id: 'default-engine', title: 'Engine Compression & Fluid Diagnostics', comments: 'Clean oil condition, coolant freeze point -35°C, no belt degradation.' }
  ],
  transmissionComments: 'Transmission shifts smoothly through all gears without hesitation or slipping. Differential operates quietly with no leaks.',
  transmissionGeneralImages: [],
  transmissionItems: {},
  transmissionCustomHeadlines: [
    { id: 'default-transmission', title: 'Transmission & Drivetrain Diagnostics', comments: 'All gear engagements crisp, fluid level at factory mark.' }
  ],
  customHeadlines: [],
  generalPhotosExteriorComments: 'Exterior 360 walkaround captured in natural daylight.',
  generalPhotosExteriorImages: [],
  generalPhotosInteriorComments: 'Cabin photos captured from all passenger angles.',
  generalPhotosInteriorImages: [],
  generalPhotosEngineComments: 'Engine bay photographed with decorative cover on and off.',
  generalPhotosEngineImages: [],
};

export const INITIAL_MEDIA_FILES = [
  {
    id: 'init-1',
    url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400',
    name: 'front_wheel.jpg',
    progress: 100,
    status: 'completed' as const,
  },
  {
    id: 'init-2',
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400',
    name: 'side_profile.jpg',
    progress: 100,
    status: 'completed' as const,
  },
];

// Alias for backward compatibility
export const initialReportData = INITIAL_REPORT_DATA;

/**
 * Creates a brand new, empty inspection report with all fields cleared.
 */
export function createEmptyReport(customId?: string): FullInspectionReport {
  const id = customId || `CMC-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateStr = `${day}-${month}-${year}`;

  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

  return {
    id,
    title: `Report #${id}`,
    status: 'draft',
    lastSavedAt: 'Created just now',
    inspectionDetails: {
      date: dateStr,
      time: timeStr,
      inspectionType: '',
      vinNumber: '',
    },
    vehicleSummary: {
      make: '',
      model: '',
      year: '',
      regionalSpecs: '',
      transmission: '',
      engineSize: '',
      odometerStatus: 'Normal',
      spareType: 'available',
      numberOfKeys: 1,
      vehicleType: '',
      externalColour: '',
      fuelType: '',
      odometerReading: '',
      odometerUnit: 'KM',
      tamperedReading: '',
    },
    reportOverview: {
      pass: '0',
      fail: '0',
      weak: '0',
      autoCalculate: true,
    },
    clientDetails: {
      name: '',
      countryCode: '+971',
      whatsappNumber: '',
      email: '',
      vehicleDetails: '',
      location: '',
    },
    teamDetails: {
      inspector: '',
    },
    tyres: {
      RR: { status: null, year: '', comments: '', image: null },
      RL: { status: null, year: '', comments: '', image: null },
      FR: { status: null, year: '', comments: '', image: null },
      FL: { status: null, year: '', comments: '', image: null },
      ST: { status: null, year: '', comments: '', image: null },
    },
    rims: {
      RR: { status: null, year: '', comments: '', image: null },
      RL: { status: null, year: '', comments: '', image: null },
      FR: { status: null, year: '', comments: '', image: null },
      FL: { status: null, year: '', comments: '', image: null },
      ST: { status: null, year: '', comments: '', image: null },
    },
    brakes: {
      RR: { status: null, year: '', comments: '', image: null },
      RL: { status: null, year: '', comments: '', image: null },
      FR: { status: null, year: '', comments: '', image: null },
      FL: { status: null, year: '', comments: '', image: null },
      ST: { status: null, year: '', comments: '', image: null },
    },
    chassisSubframeComments: '',
    chassisSubframeImages: [],
    chassisSubframePartStatuses: {
      1: 'unchecked', 2: 'unchecked', 3: 'unchecked', 4: 'unchecked', 5: 'unchecked',
      6: 'unchecked', 7: 'unchecked', 8: 'unchecked', 9: 'unchecked', 10: 'unchecked',
      11: 'unchecked', 12: 'unchecked', 13: 'unchecked', 14: 'unchecked', 15: 'unchecked',
      16: 'unchecked', 17: 'unchecked', 18: 'unchecked', 19: 'unchecked', 20: 'unchecked',
    },
    chassisSubframeCustomHeadlines: [],
    bodyComments: '',
    bodyGeneralComments: '',
    bodyGeneralImages: [],
    bodyImages: [],
    bodyPartStatuses: {
      frontBumper: 'good',
      hood: 'good',
      roof: 'good',
      trunk: 'good',
      rearBumper: 'good',
      leftFrontFender: 'good',
      leftFrontDoor: 'good',
      leftBackDoor: 'good',
      leftRearFender: 'good',
      rightFrontFender: 'good',
      rightFrontDoor: 'good',
      rightBackDoor: 'good',
      rightRearFender: 'good',
    },
    bodyCustomHeadlines: [],
    interiorComments: '',
    interiorGeneralImages: [],
    seatsComments: '',
    seatsStatus: 'pass',
    seatsImages: [],
    interiorCustomHeadlines: [],
    electricalComments: '',
    electricalGeneralImages: [],
    electricalItems: {},
    electricalCustomHeadlines: [],
    engineComments: '',
    engineGeneralImages: [],
    engineItems: {},
    engineCustomHeadlines: [],
    transmissionComments: '',
    transmissionGeneralImages: [],
    transmissionItems: {},
    transmissionCustomHeadlines: [],
    customHeadlines: [],
    generalPhotosExteriorComments: '',
    generalPhotosExteriorImages: [],
    generalPhotosInteriorComments: '',
    generalPhotosInteriorImages: [],
    generalPhotosEngineComments: '',
    generalPhotosEngineImages: [],
  };
}

export const EMPTY_REPORT_DATA = createEmptyReport('CMC-0000');

