export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  type: 'Truck' | 'SUV' | 'Sedan' | 'Coupe' | 'Sports' | 'Hatchback';
  color: string;
  colorHex: string;
  imageUrl: string;
  vin: string;
  odometer: string;
  odometerStatus: 'Normal' | 'Tampered' | 'Replaced' | 'Inoperative';
  transmission: string;
  specs: string;
}

export interface ClientInfo {
  name: string;
  company?: string;
  location: string;
  phone: string;
  email: string;
}

export interface InspectorInfo {
  id: string;
  name: string;
  avatarUrl: string;
  badge: string;
}

export interface ReportListItem {
  id: string;
  reportNumber: string;
  vehicle: VehicleInfo;
  client: ClientInfo;
  inspector: InspectorInfo;
  date: string;
  time: string;
  inspectionType: '600-Points Comprehensive' | '300-Points Standard' | 'Pre-Purchase Inspection' | 'Chassis & Drivetrain';
  passPercentage: number;
  failPercentage: number;
  status: 'published' | 'draft' | 'in_review';
  flaggedDefectsCount: number;
  lastUpdated: string;
}

export interface DashboardKPIData {
  totalInspections: {
    value: number;
    change: number;
    period: string;
  };
  passRate: {
    value: number;
    change: number;
    period: string;
  };
  pendingDrafts: {
    value: number;
    urgentCount: number;
  };
  flaggedDefects: {
    value: number;
    tamperedCount: number;
  };
  activeInspectors: {
    total: number;
    onDuty: number;
  };
}

export interface DailyActivityData {
  day: string;
  date: string;
  passed: number;
  failed: number;
  total: number;
}

export const initialDashboardKPI: DashboardKPIData = {
  totalInspections: {
    value: 1428,
    change: 12.4,
    period: 'vs last month',
  },
  passRate: {
    value: 86.4,
    change: 3.2,
    period: 'vs last month',
  },
  pendingDrafts: {
    value: 14,
    urgentCount: 3,
  },
  flaggedDefects: {
    value: 28,
    tamperedCount: 4,
  },
  activeInspectors: {
    total: 10,
    onDuty: 8,
  },
};

export const weeklyActivityData: DailyActivityData[] = [
  { day: 'Mon', date: 'Aug 01', passed: 18, failed: 4, total: 22 },
  { day: 'Tue', date: 'Aug 02', passed: 24, failed: 3, total: 27 },
  { day: 'Wed', date: 'Aug 03', passed: 21, failed: 6, total: 27 },
  { day: 'Thu', date: 'Aug 04', passed: 28, failed: 5, total: 33 },
  { day: 'Fri', date: 'Aug 05', passed: 32, failed: 4, total: 36 },
  { day: 'Sat', date: 'Aug 06', passed: 35, failed: 8, total: 43 },
  { day: 'Sun', date: 'Aug 07', passed: 15, failed: 2, total: 17 },
];

export const inspectionTypeBreakdown = [
  { label: '600-Points Comprehensive', count: 742, percentage: 52, color: '#9723FF' },
  { label: 'Pre-Purchase Inspection', count: 386, percentage: 27, color: '#008751' },
  { label: '300-Points Standard', count: 214, percentage: 15, color: '#5368FF' },
  { label: 'Chassis & Drivetrain Only', count: 86, percentage: 6, color: '#FE8E4B' },
];

export const initialReportsList: ReportListItem[] = [
  {
    id: '440',
    reportNumber: 'ORB-440',
    vehicle: {
      make: 'Toyota',
      model: 'Tundra TRD Pro',
      year: 2025,
      type: 'Truck',
      color: 'Magnetic Grey',
      colorHex: '#646669',
      imageUrl: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=600',
      vin: 'WMWWG9C51K3E40764',
      odometer: '621,515 KM',
      odometerStatus: 'Tampered',
      transmission: 'Automatic 10-Speed',
      specs: 'American Specs',
    },
    client: {
      name: 'Al Tayer Motors LLC',
      company: 'Al Tayer Fleet Services',
      location: 'Dubai',
      phone: '+971 054 409 3009',
      email: 'fleet@altayer.com',
    },
    inspector: {
      id: 'ins-1',
      name: 'Ahmed Al Mansoori',
      avatarUrl: 'https://i.pravatar.cc/150?u=ahmed_mansoori',
      badge: 'Lead Master Inspector',
    },
    date: '06 Aug 2025',
    time: '09:00 PM',
    inspectionType: '600-Points Comprehensive',
    passPercentage: 55,
    failPercentage: 45,
    status: 'published',
    flaggedDefectsCount: 6,
    lastUpdated: 'Saved 2m ago',
  },
  {
    id: '439',
    reportNumber: 'ORB-439',
    vehicle: {
      make: 'Porsche',
      model: '911 GT3 (992)',
      year: 2024,
      type: 'Sports',
      color: 'Shark Blue',
      colorHex: '#1E64C8',
      imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600',
      vin: 'WP0AF2A97NS284910',
      odometer: '8,420 KM',
      odometerStatus: 'Normal',
      transmission: 'PDK 7-Speed',
      specs: 'GCC Specs',
    },
    client: {
      name: 'Ali & Sons Luxury Cars',
      company: 'Ali & Sons Holding',
      location: 'Abu Dhabi',
      phone: '+971 050 312 8899',
      email: 'vip.concierge@ali-sons.ae',
    },
    inspector: {
      id: 'ins-2',
      name: 'David Miller',
      avatarUrl: 'https://i.pravatar.cc/150?u=david_miller',
      badge: 'Senior Chassis Specialist',
    },
    date: '06 Aug 2025',
    time: '04:30 PM',
    inspectionType: '600-Points Comprehensive',
    passPercentage: 98,
    failPercentage: 2,
    status: 'published',
    flaggedDefectsCount: 0,
    lastUpdated: '1 hour ago',
  },
  {
    id: '438',
    reportNumber: 'ORB-438',
    vehicle: {
      make: 'Land Rover',
      model: 'Defender 110 V8',
      year: 2023,
      type: 'SUV',
      color: 'Santorini Black',
      colorHex: '#111215',
      imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600',
      vin: 'SALWR2V45PA118932',
      odometer: '41,200 KM',
      odometerStatus: 'Normal',
      transmission: 'Automatic 8-Speed',
      specs: 'GCC Specs',
    },
    client: {
      name: 'Al Naboodah Automobiles',
      company: 'Pre-Owned Direct',
      location: 'Dubai',
      phone: '+971 052 841 9021',
      email: 'preowned@alnaboodah.com',
    },
    inspector: {
      id: 'ins-3',
      name: 'Sarah Jenkins',
      avatarUrl: 'https://i.pravatar.cc/150?u=sarah_jenkins',
      badge: 'Diagnostic Lead',
    },
    date: '05 Aug 2025',
    time: '11:15 AM',
    inspectionType: 'Pre-Purchase Inspection',
    passPercentage: 74,
    failPercentage: 26,
    status: 'draft',
    flaggedDefectsCount: 3,
    lastUpdated: '3 hours ago',
  },
  {
    id: '437',
    reportNumber: 'ORB-437',
    vehicle: {
      make: 'Mercedes-Benz',
      model: 'G63 AMG Magno',
      year: 2025,
      type: 'SUV',
      color: 'Night Black Magno',
      colorHex: '#25262A',
      imageUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&q=80&w=600',
      vin: 'W1N4632761X991823',
      odometer: '1,200 KM',
      odometerStatus: 'Normal',
      transmission: 'AMG SPEEDSHIFT 9G',
      specs: 'GCC Specs',
    },
    client: {
      name: 'Gargash Enterprises',
      company: 'Gargash Prime Motors',
      location: 'Dubai',
      phone: '+971 055 993 1184',
      email: 'tradein@gargash.ae',
    },
    inspector: {
      id: 'ins-1',
      name: 'Ahmed Al Mansoori',
      avatarUrl: 'https://i.pravatar.cc/150?u=ahmed_mansoori',
      badge: 'Lead Master Inspector',
    },
    date: '04 Aug 2025',
    time: '02:00 PM',
    inspectionType: '600-Points Comprehensive',
    passPercentage: 94,
    failPercentage: 6,
    status: 'published',
    flaggedDefectsCount: 1,
    lastUpdated: '1 day ago',
  },
  {
    id: '436',
    reportNumber: 'ORB-436',
    vehicle: {
      make: 'Nissan',
      model: 'Patrol Nismo V8',
      year: 2022,
      type: 'SUV',
      color: 'Pearl White',
      colorHex: '#F0EFEA',
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
      vin: 'JN8BY2NY6N0289111',
      odometer: '98,600 KM',
      odometerStatus: 'Normal',
      transmission: 'Automatic 7-Speed',
      specs: 'GCC Specs',
    },
    client: {
      name: 'Arabian Automobiles Co.',
      company: 'AW Rostamani Group',
      location: 'Sharjah',
      phone: '+971 050 821 7741',
      email: 'inspections@rostamani.ae',
    },
    inspector: {
      id: 'ins-4',
      name: 'Rashid Khan',
      avatarUrl: 'https://i.pravatar.cc/150?u=rashid_khan',
      badge: 'Chassis & Drivetrain Specialist',
    },
    date: '03 Aug 2025',
    time: '05:45 PM',
    inspectionType: '300-Points Standard',
    passPercentage: 62,
    failPercentage: 38,
    status: 'published',
    flaggedDefectsCount: 5,
    lastUpdated: '2 days ago',
  },
  {
    id: '435',
    reportNumber: 'ORB-435',
    vehicle: {
      make: 'BMW',
      model: 'M4 Competition M xDrive',
      year: 2024,
      type: 'Coupe',
      color: 'Isle of Man Green',
      colorHex: '#1B5E41',
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600',
      vin: 'WBA43AZ00PCK77102',
      odometer: '14,350 KM',
      odometerStatus: 'Normal',
      transmission: 'M Steptronic 8-Speed',
      specs: 'Euro Specs',
    },
    client: {
      name: 'AGMC BMW Dubai',
      company: 'AGMC Premium Selection',
      location: 'Dubai',
      phone: '+971 056 441 9090',
      email: 'certified@agmc.ae',
    },
    inspector: {
      id: 'ins-2',
      name: 'David Miller',
      avatarUrl: 'https://i.pravatar.cc/150?u=david_miller',
      badge: 'Senior Chassis Specialist',
    },
    date: '02 Aug 2025',
    time: '10:00 AM',
    inspectionType: '600-Points Comprehensive',
    passPercentage: 89,
    failPercentage: 11,
    status: 'published',
    flaggedDefectsCount: 2,
    lastUpdated: '3 days ago',
  },
  {
    id: '434',
    reportNumber: 'ORB-434',
    vehicle: {
      make: 'Ford',
      model: 'F-150 Raptor R 5.2L',
      year: 2023,
      type: 'Truck',
      color: 'Code Orange',
      colorHex: '#E85B28',
      imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=600',
      vin: '1FTFW1RJ8PFA99104',
      odometer: '58,900 KM',
      odometerStatus: 'Tampered',
      transmission: 'Automatic 10-Speed',
      specs: 'American Specs',
    },
    client: {
      name: 'Premier Desert Auto Trading',
      company: 'Premier Motors',
      location: 'Dubai',
      phone: '+971 050 119 2244',
      email: 'desert.trade@premiermotors.ae',
    },
    inspector: {
      id: 'ins-4',
      name: 'Rashid Khan',
      avatarUrl: 'https://i.pravatar.cc/150?u=rashid_khan',
      badge: 'Chassis & Drivetrain Specialist',
    },
    date: '01 Aug 2025',
    time: '03:15 PM',
    inspectionType: 'Chassis & Drivetrain',
    passPercentage: 58,
    failPercentage: 42,
    status: 'draft',
    flaggedDefectsCount: 7,
    lastUpdated: '4 days ago',
  },
  {
    id: '433',
    reportNumber: 'ORB-433',
    vehicle: {
      make: 'Lexus',
      model: 'LX600 VIP Black Edition',
      year: 2025,
      type: 'SUV',
      color: 'Sonic Quartz',
      colorHex: '#ECEBE6',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
      vin: 'JTJHY7AX8P4019283',
      odometer: '3,800 KM',
      odometerStatus: 'Normal',
      transmission: 'Direct-Shift 10-Speed',
      specs: 'GCC Specs',
    },
    client: {
      name: 'Al-Futtaim Automotive',
      company: 'Lexus Prestige Centre',
      location: 'Abu Dhabi',
      phone: '+971 054 772 1088',
      email: 'prestige@alfuttaim.com',
    },
    inspector: {
      id: 'ins-3',
      name: 'Sarah Jenkins',
      avatarUrl: 'https://i.pravatar.cc/150?u=sarah_jenkins',
      badge: 'Diagnostic Lead',
    },
    date: '31 Jul 2025',
    time: '12:30 PM',
    inspectionType: '600-Points Comprehensive',
    passPercentage: 96,
    failPercentage: 4,
    status: 'published',
    flaggedDefectsCount: 1,
    lastUpdated: '5 days ago',
  },
];
