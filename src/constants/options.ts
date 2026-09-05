export interface SelectOption {
  value: string;
  label: string;
}

export const INSPECTION_TYPE_OPTIONS: SelectOption[] = [
  { value: '600-Points Comprehensive', label: '600-Points Comprehensive' },
  { value: '300-Points Standard', label: '300-Points Standard' },
  { value: 'Pre-Purchase Inspection', label: 'Pre-Purchase Inspection' },
  { value: 'Chassis & Drivetrain Only', label: 'Chassis & Drivetrain Only' },
  { value: 'Body & Paint Inspection', label: 'Body & Paint Inspection' },
];

export const ODOMETER_STATUS_OPTIONS: SelectOption[] = [
  { value: 'Normal', label: 'Normal (Verified)' },
  { value: 'Tampered', label: 'Tampered (Inconsistency detected)' },
  { value: 'Replaced', label: 'Cluster Replaced' },
  { value: 'Inoperative', label: 'Inoperative / Broken' },
];

export const LOCATION_OPTIONS: SelectOption[] = [
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Abu Dhabi', label: 'Abu Dhabi' },
  { value: 'Sharjah', label: 'Sharjah' },
  { value: 'Ajman', label: 'Ajman' },
  { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
  { value: 'Fujairah', label: 'Fujairah' },
  { value: 'Umm Al Quwain', label: 'Umm Al Quwain' },
];

export const INSPECTOR_OPTIONS: SelectOption[] = [
  { value: 'Ahmed Al Mansoori (Lead Inspector)', label: 'Ahmed Al Mansoori (Lead Inspector)' },
  { value: 'David Miller (Senior Tech)', label: 'David Miller (Senior Tech)' },
  { value: 'Rashid Khan (Chassis Specialist)', label: 'Rashid Khan (Chassis Specialist)' },
  { value: 'Sarah Jenkins (Diagnostic Lead)', label: 'Sarah Jenkins (Diagnostic Lead)' },
];

export const COUNTRY_CODE_OPTIONS: SelectOption[] = [
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

export const DATE_PRESET_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'This Month' },
  { id: 'all', label: 'All Records' },
] as const;

export const REPORT_FILTER_TABS = [
  { id: 'all', label: 'All Inspections' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
  { id: 'tampered', label: 'Tampered / Alerts' },
  { id: 'defects', label: 'High Defect (>30%)' },
] as const;

export const REPORT_LOCATION_FILTER_OPTIONS = [
  { value: 'all', label: 'All Emirates (UAE)' },
  { value: 'Dubai', label: 'Dubai Hubs' },
  { value: 'Abu Dhabi', label: 'Abu Dhabi' },
  { value: 'Sharjah', label: 'Sharjah Hub' },
] as const;

export const REPORT_VEHICLE_TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Vehicle Types' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Truck', label: 'Truck' },
  { value: 'Sports', label: 'Sports / Coupe' },
  { value: 'Sedan', label: 'Sedan' },
] as const;

export const REPORT_SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'pass_desc', label: 'Highest Pass Rate' },
  { value: 'pass_asc', label: 'Lowest Pass Rate' },
  { value: 'defects_desc', label: 'Most Defects Count' },
] as const;

// Aliases for seamless backward compatibility
export const inspectionTypeOptions = INSPECTION_TYPE_OPTIONS;
export const odometerStatusOptions = ODOMETER_STATUS_OPTIONS;
export const locationOptions = LOCATION_OPTIONS;
export const inspectorOptions = INSPECTOR_OPTIONS;
export const countryCodeOptions = COUNTRY_CODE_OPTIONS;
