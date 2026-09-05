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
    ST: { status: 'na', year: '2025', comments: 'Not applicable for spare', image: null },
  },
  bodyComments: 'Minor hairline scratches on rear bumper. Paint depth uniform across all panels.',
  interiorComments: 'Interior upholstery in clean condition. Minimal wear on steering wheel and driver bolster.',
  electricalItems: {},
  customHeadlines: [],
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
