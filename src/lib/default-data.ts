import { FullInspectionReport } from './inspection-types';

export const initialReportData: FullInspectionReport = {
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

export const inspectionTypeOptions = [
  { value: '600-Points Comprehensive', label: '600-Points Comprehensive' },
  { value: '300-Points Standard', label: '300-Points Standard' },
  { value: 'Pre-Purchase Inspection', label: 'Pre-Purchase Inspection' },
  { value: 'Chassis & Drivetrain Only', label: 'Chassis & Drivetrain Only' },
  { value: 'Body & Paint Inspection', label: 'Body & Paint Inspection' },
];

export const odometerStatusOptions = [
  { value: 'Normal', label: 'Normal (Verified)' },
  { value: 'Tampered', label: 'Tampered (Inconsistency detected)' },
  { value: 'Replaced', label: 'Cluster Replaced' },
  { value: 'Inoperative', label: 'Inoperative / Broken' },
];

export const locationOptions = [
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Abu Dhabi', label: 'Abu Dhabi' },
  { value: 'Sharjah', label: 'Sharjah' },
  { value: 'Ajman', label: 'Ajman' },
  { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
  { value: 'Fujairah', label: 'Fujairah' },
  { value: 'Umm Al Quwain', label: 'Umm Al Quwain' },
];

export const inspectorOptions = [
  { value: 'Ahmed Al Mansoori (Lead Inspector)', label: 'Ahmed Al Mansoori (Lead Inspector)' },
  { value: 'David Miller (Senior Tech)', label: 'David Miller (Senior Tech)' },
  { value: 'Rashid Khan (Chassis Specialist)', label: 'Rashid Khan (Chassis Specialist)' },
  { value: 'Sarah Jenkins (Diagnostic Lead)', label: 'Sarah Jenkins (Diagnostic Lead)' },
];

export const countryCodeOptions = [
  { value: '+971', label: '+971 (UAE)' },
  { value: '+966', label: '+966 (KSA)' },
  { value: '+968', label: '+968 (Oman)' },
  { value: '+974', label: '+974 (Qatar)' },
  { value: '+965', label: '+965 (Kuwait)' },
  { value: '+973', label: '+973 (Bahrain)' },
  { value: '+1', label: '+1 (US/CA)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+91', label: '+91 (India)' },
];
