import { FullInspectionReport, CustomHeadlineItem } from './inspection-types';
import {
  ELECTRICAL_INSPECTION_ITEMS,
  ENGINE_INSPECTION_ITEMS,
  TRANSMISSION_INSPECTION_ITEMS,
} from '@/constants/inspection-points';

export interface MediaTargetInfo {
  id: string;
  section: string;
  category: string;
  label: string;
  type: 'single' | 'multiple';
  currentCount?: number;
  maxCount?: number;
}

export interface MediaUsageItem {
  targetId: string;
  section: string;
  label: string;
}

/**
 * Safe unique ID generator that falls back gracefully if crypto.randomUUID is unavailable
 */
export function generateSafeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

export const CANONICAL_MEDIA_TARGETS: Omit<MediaTargetInfo, 'currentCount'>[] = [
  // Tyres
  { id: 'tyres-RR', section: 'Tyres', category: 'Chassis & Wheels', label: 'Rear Right Tyre (RR)', type: 'single', maxCount: 1 },
  { id: 'tyres-RL', section: 'Tyres', category: 'Chassis & Wheels', label: 'Rear Left Tyre (RL)', type: 'single', maxCount: 1 },
  { id: 'tyres-FR', section: 'Tyres', category: 'Chassis & Wheels', label: 'Front Right Tyre (FR)', type: 'single', maxCount: 1 },
  { id: 'tyres-FL', section: 'Tyres', category: 'Chassis & Wheels', label: 'Front Left Tyre (FL)', type: 'single', maxCount: 1 },
  { id: 'tyres-ST', section: 'Tyres', category: 'Chassis & Wheels', label: 'Spare Tyre (ST)', type: 'single', maxCount: 1 },

  // Rims
  { id: 'rims-RR', section: 'Rims', category: 'Chassis & Wheels', label: 'Rear Right Rim (RR)', type: 'single', maxCount: 1 },
  { id: 'rims-RL', section: 'Rims', category: 'Chassis & Wheels', label: 'Rear Left Rim (RL)', type: 'single', maxCount: 1 },
  { id: 'rims-FR', section: 'Rims', category: 'Chassis & Wheels', label: 'Front Right Rim (FR)', type: 'single', maxCount: 1 },
  { id: 'rims-FL', section: 'Rims', category: 'Chassis & Wheels', label: 'Front Left Rim (FL)', type: 'single', maxCount: 1 },
  { id: 'rims-ST', section: 'Rims', category: 'Chassis & Wheels', label: 'Spare Rim (ST)', type: 'single', maxCount: 1 },

  // Brakes
  { id: 'brakes-RR', section: 'Brakes', category: 'Chassis & Wheels', label: 'Rear Right Brake (RR)', type: 'single', maxCount: 1 },
  { id: 'brakes-RL', section: 'Brakes', category: 'Chassis & Wheels', label: 'Rear Left Brake (RL)', type: 'single', maxCount: 1 },
  { id: 'brakes-FR', section: 'Brakes', category: 'Chassis & Wheels', label: 'Front Right Brake (FR)', type: 'single', maxCount: 1 },
  { id: 'brakes-FL', section: 'Brakes', category: 'Chassis & Wheels', label: 'Front Left Brake (FL)', type: 'single', maxCount: 1 },
  { id: 'brakes-ST', section: 'Brakes', category: 'Chassis & Wheels', label: 'Spare Brake (ST)', type: 'single', maxCount: 1 },

  // General Photos
  { id: 'general-photos-exterior', section: 'General Photos', category: 'Vehicle Overview', label: 'Exterior Photos (360°)', type: 'multiple', maxCount: 20 },
  { id: 'general-photos-interior', section: 'General Photos', category: 'Vehicle Overview', label: 'Interior Cabin Photos', type: 'multiple', maxCount: 20 },
  { id: 'general-photos-engine', section: 'General Photos', category: 'Vehicle Overview', label: 'Engine Bay Photos', type: 'multiple', maxCount: 20 },

  // Chassis & Subframe
  { id: 'chassis-subframe-images', section: 'Chassis & Subframe', category: 'Underbody', label: 'Chassis Subframe Photos', type: 'multiple', maxCount: 20 },

  // Body & Blueprint
  { id: 'body-images', section: 'Body & Blueprint', category: 'Exterior Panels', label: 'Body Vector / Damage Photos', type: 'multiple', maxCount: 20 },
  { id: 'body-general-images', section: 'Body & Blueprint', category: 'Exterior Panels', label: 'Body Remarks Photos', type: 'multiple', maxCount: 20 },

  // Interior & Seats
  { id: 'interior-seats-images', section: 'Interior & Exterior', category: 'Cabin', label: 'Seats & Upholstery Photos', type: 'multiple', maxCount: 20 },
  { id: 'interior-general-images', section: 'Interior & Exterior', category: 'Cabin', label: 'Interior Remarks Photos', type: 'multiple', maxCount: 20 },

  // Electrical Remarks
  { id: 'electrical-general-images', section: 'Electrical System', category: 'Diagnostics', label: 'Electrical Remarks Photos', type: 'multiple', maxCount: 20 },

  // Engine Remarks
  { id: 'engine-general-images', section: 'Engine Diagnostics', category: 'Powertrain', label: 'Engine Remarks Photos', type: 'multiple', maxCount: 20 },

  // Transmission Remarks
  { id: 'transmission-general-images', section: 'Transmission Diagnostics', category: 'Powertrain', label: 'Transmission Remarks Photos', type: 'multiple', maxCount: 20 },
];

/**
 * Returns all available targets for a report, including subsystem item checkpoints and custom headlines dynamically.
 */
export function getAvailableMediaTargets(report: FullInspectionReport): MediaTargetInfo[] {
  const list: MediaTargetInfo[] = CANONICAL_MEDIA_TARGETS.map(t => {
    let currentCount = 0;
    if (t.id.startsWith('tyres-')) {
      const pos = t.id.replace('tyres-', '');
      currentCount = report.tyres?.[pos]?.image?.url ? 1 : 0;
    } else if (t.id.startsWith('rims-')) {
      const pos = t.id.replace('rims-', '');
      currentCount = report.rims?.[pos]?.image?.url ? 1 : 0;
    } else if (t.id.startsWith('brakes-')) {
      const pos = t.id.replace('brakes-', '');
      currentCount = report.brakes?.[pos]?.image?.url ? 1 : 0;
    } else if (t.id === 'general-photos-exterior') {
      currentCount = report.generalPhotosExteriorImages?.length || 0;
    } else if (t.id === 'general-photos-interior') {
      currentCount = report.generalPhotosInteriorImages?.length || 0;
    } else if (t.id === 'general-photos-engine') {
      currentCount = report.generalPhotosEngineImages?.length || 0;
    } else if (t.id === 'chassis-subframe-images') {
      currentCount = report.chassisSubframeImages?.length || 0;
    } else if (t.id === 'body-images') {
      currentCount = report.bodyImages?.length || 0;
    } else if (t.id === 'body-general-images') {
      currentCount = report.bodyGeneralImages?.length || 0;
    } else if (t.id === 'interior-seats-images') {
      currentCount = report.seatsImages?.length || 0;
    } else if (t.id === 'interior-general-images') {
      currentCount = report.interiorGeneralImages?.length || 0;
    } else if (t.id === 'electrical-general-images') {
      currentCount = report.electricalGeneralImages?.length || 0;
    } else if (t.id === 'engine-general-images') {
      currentCount = report.engineGeneralImages?.length || 0;
    } else if (t.id === 'transmission-general-images') {
      currentCount = report.transmissionGeneralImages?.length || 0;
    }
    return { ...t, currentCount };
  });

  // Diagnostic subsystem checkpoint cards: Electrical
  ELECTRICAL_INSPECTION_ITEMS.forEach(item => {
    const currentCount = report.electricalItems?.[item]?.images?.length || 0;
    list.push({
      id: `electrical-item-${item}`,
      section: 'Electrical System',
      category: 'Electrical Items',
      label: `Electrical > ${item}`,
      type: 'multiple',
      maxCount: 20,
      currentCount,
    });
  });

  // Diagnostic subsystem checkpoint cards: Engine
  ENGINE_INSPECTION_ITEMS.forEach(item => {
    const currentCount = report.engineItems?.[item]?.images?.length || 0;
    list.push({
      id: `engine-item-${item}`,
      section: 'Engine Diagnostics',
      category: 'Engine Items',
      label: `Engine > ${item}`,
      type: 'multiple',
      maxCount: 20,
      currentCount,
    });
  });

  // Diagnostic subsystem checkpoint cards: Transmission
  TRANSMISSION_INSPECTION_ITEMS.forEach(item => {
    const currentCount = report.transmissionItems?.[item]?.images?.length || 0;
    list.push({
      id: `transmission-item-${item}`,
      section: 'Transmission Diagnostics',
      category: 'Transmission Items',
      label: `Transmission > ${item}`,
      type: 'multiple',
      maxCount: 20,
      currentCount,
    });
  });

  // Dynamically add custom headlines
  const addHeadlines = (headlines: CustomHeadlineItem[] | undefined, sectionName: string, prefix: string) => {
    if (!headlines) return;
    headlines.forEach(h => {
      const count = (h.images?.length || 0) + (h.imageUrl ? 1 : 0);
      list.push({
        id: `${prefix}-headline-${h.id}`,
        section: sectionName,
        category: 'Custom Headlines',
        label: `${sectionName} > ${h.title || 'Custom Headline'}`,
        type: 'multiple',
        maxCount: 20,
        currentCount: count,
      });
    });
  };

  addHeadlines(report.chassisSubframeCustomHeadlines, 'Chassis & Subframe', 'chassis');
  addHeadlines(report.bodyCustomHeadlines, 'Body & Blueprint', 'body');
  addHeadlines(report.interiorCustomHeadlines, 'Interior & Exterior', 'interior');
  addHeadlines(report.electricalCustomHeadlines, 'Electrical System', 'electrical');
  addHeadlines(report.engineCustomHeadlines, 'Engine Diagnostics', 'engine');
  addHeadlines(report.transmissionCustomHeadlines, 'Transmission Diagnostics', 'transmission');

  return list;
}

/**
 * Returns all places in the report where the given media URL is currently attached.
 */
export function getMediaUsageInReport(mediaUrl: string, report: FullInspectionReport): MediaUsageItem[] {
  if (!mediaUrl) return [];
  const cleanUrl = mediaUrl.trim();
  const usages: MediaUsageItem[] = [];

  // Tyres
  (['RR', 'RL', 'FR', 'FL', 'ST'] as const).forEach(pos => {
    if (report.tyres?.[pos]?.image?.url === cleanUrl) {
      usages.push({ targetId: `tyres-${pos}`, section: 'Tyres', label: `${pos} Tyre` });
    }
  });

  // Rims
  (['RR', 'RL', 'FR', 'FL', 'ST'] as const).forEach(pos => {
    if (report.rims?.[pos]?.image?.url === cleanUrl) {
      usages.push({ targetId: `rims-${pos}`, section: 'Rims', label: `${pos} Rim` });
    }
  });

  // Brakes
  (['RR', 'RL', 'FR', 'FL', 'ST'] as const).forEach(pos => {
    if (report.brakes?.[pos]?.image?.url === cleanUrl) {
      usages.push({ targetId: `brakes-${pos}`, section: 'Brakes', label: `${pos} Brake` });
    }
  });

  // General Photos
  if (report.generalPhotosExteriorImages?.some(i => i.url === cleanUrl)) {
    usages.push({ targetId: 'general-photos-exterior', section: 'General Photos', label: 'Exterior (360°)' });
  }
  if (report.generalPhotosInteriorImages?.some(i => i.url === cleanUrl)) {
    usages.push({ targetId: 'general-photos-interior', section: 'General Photos', label: 'Interior Cabin' });
  }
  if (report.generalPhotosEngineImages?.some(i => i.url === cleanUrl)) {
    usages.push({ targetId: 'general-photos-engine', section: 'General Photos', label: 'Engine Bay' });
  }

  // Chassis
  if (report.chassisSubframeImages?.includes(cleanUrl)) {
    usages.push({ targetId: 'chassis-subframe-images', section: 'Chassis', label: 'Chassis Subframe' });
  }

  // Body
  if (report.bodyImages?.includes(cleanUrl)) {
    usages.push({ targetId: 'body-images', section: 'Body', label: 'Body Vector' });
  }
  if (report.bodyGeneralImages?.includes(cleanUrl)) {
    usages.push({ targetId: 'body-general-images', section: 'Body', label: 'Body Remarks' });
  }

  // Interior & Seats
  if (report.seatsImages?.some(i => i.url === cleanUrl)) {
    usages.push({ targetId: 'interior-seats-images', section: 'Interior', label: 'Seats & Trim' });
  }
  if (report.interiorGeneralImages?.includes(cleanUrl)) {
    usages.push({ targetId: 'interior-general-images', section: 'Interior', label: 'Interior Remarks' });
  }

  // Diagnostics Remarks
  if (report.electricalGeneralImages?.includes(cleanUrl)) {
    usages.push({ targetId: 'electrical-general-images', section: 'Electrical', label: 'Electrical Remarks' });
  }
  if (report.engineGeneralImages?.includes(cleanUrl)) {
    usages.push({ targetId: 'engine-general-images', section: 'Engine', label: 'Engine Remarks' });
  }
  if (report.transmissionGeneralImages?.includes(cleanUrl)) {
    usages.push({ targetId: 'transmission-general-images', section: 'Transmission', label: 'Transmission Remarks' });
  }

  // Diagnostic Item Cards
  const checkItems = (items: Record<string, any> | undefined, sectionName: string) => {
    if (!items) return;
    Object.entries(items).forEach(([key, val]) => {
      if (Array.isArray(val?.images) && val.images.includes(cleanUrl)) {
        usages.push({ targetId: `${sectionName.toLowerCase()}-item-${key}`, section: sectionName, label: `${sectionName} > ${key}` });
      }
    });
  };
  checkItems(report.electricalItems, 'Electrical');
  checkItems(report.engineItems, 'Engine');
  checkItems(report.transmissionItems, 'Transmission');

  // Custom Headlines
  const checkHeadlines = (headlines: CustomHeadlineItem[] | undefined, sectionName: string) => {
    if (!headlines) return;
    headlines.forEach(h => {
      if (h.imageUrl === cleanUrl || h.images?.includes(cleanUrl)) {
        usages.push({ targetId: `${sectionName.toLowerCase()}-headline-${h.id}`, section: sectionName, label: `${h.title || 'Headline'}` });
      }
    });
  };
  checkHeadlines(report.chassisSubframeCustomHeadlines, 'Chassis');
  checkHeadlines(report.bodyCustomHeadlines, 'Body');
  checkHeadlines(report.interiorCustomHeadlines, 'Interior');
  checkHeadlines(report.electricalCustomHeadlines, 'Electrical');
  checkHeadlines(report.engineCustomHeadlines, 'Engine');
  checkHeadlines(report.transmissionCustomHeadlines, 'Transmission');

  return usages;
}

/**
 * Attaches one or more media URLs to a target in the report immutably.
 * Returns the updated report and count of newly attached images.
 */
export function attachMediaToReportTarget(
  report: FullInspectionReport,
  targetId: string,
  mediaUrls: string[]
): { updatedReport: FullInspectionReport; attachedCount: number } {
  if (!mediaUrls || mediaUrls.length === 0) return { updatedReport: report, attachedCount: 0 };

  const cleanUrls = mediaUrls.map(u => u.trim()).filter(Boolean);
  let attachedCount = 0;
  const next = { ...report };

  // Helper for string[] arrays
  const appendStringArray = (existing: string[] | undefined, max = 20): string[] => {
    const arr = existing ? [...existing] : [];
    for (const url of cleanUrls) {
      if (!arr.includes(url) && arr.length < max) {
        arr.push(url);
        attachedCount++;
      }
    }
    return arr;
  };

  // Helper for { id, url }[] arrays
  const appendObjectArray = (existing: { id: string; url: string }[] | undefined, max = 20): { id: string; url: string }[] => {
    const arr = existing ? [...existing] : [];
    for (const url of cleanUrls) {
      if (!arr.some(item => item.url === url) && arr.length < max) {
        arr.push({ id: generateSafeId(), url });
        attachedCount++;
      }
    }
    return arr;
  };

  // Handle single-image tyre/rim/brake targets
  if (targetId.startsWith('tyres-')) {
    const pos = targetId.replace('tyres-', '');
    if (next.tyres?.[pos]) {
      const current = next.tyres[pos];
      next.tyres = {
        ...next.tyres,
        [pos]: { ...current, image: { url: cleanUrls[0], progress: 100 } },
      };
      attachedCount = 1;
    }
    return { updatedReport: next, attachedCount };
  }

  if (targetId.startsWith('rims-')) {
    const pos = targetId.replace('rims-', '');
    if (next.rims?.[pos]) {
      const current = next.rims[pos];
      next.rims = {
        ...next.rims,
        [pos]: { ...current, image: { url: cleanUrls[0], progress: 100 } },
      };
      attachedCount = 1;
    }
    return { updatedReport: next, attachedCount };
  }

  if (targetId.startsWith('brakes-')) {
    const pos = targetId.replace('brakes-', '');
    if (next.brakes?.[pos]) {
      const current = next.brakes[pos];
      next.brakes = {
        ...next.brakes,
        [pos]: { ...current, image: { url: cleanUrls[0], progress: 100 } },
      };
      attachedCount = 1;
    }
    return { updatedReport: next, attachedCount };
  }

  // Diagnostic Subsystem Checkpoint Items
  if (targetId.startsWith('electrical-item-')) {
    const itemKey = targetId.replace('electrical-item-', '');
    const currentItems = next.electricalItems ? { ...next.electricalItems } : {};
    const currentItem = currentItems[itemKey] || { status: 'pass' as const, comments: '', images: [] };
    const updatedImages = appendStringArray(currentItem.images);
    currentItems[itemKey] = { ...currentItem, images: updatedImages };
    next.electricalItems = currentItems;
    return { updatedReport: next, attachedCount };
  }

  if (targetId.startsWith('engine-item-')) {
    const itemKey = targetId.replace('engine-item-', '');
    const currentItems = next.engineItems ? { ...next.engineItems } : {};
    const currentItem = currentItems[itemKey] || { status: 'pass' as const, comments: '', images: [] };
    const updatedImages = appendStringArray(currentItem.images);
    currentItems[itemKey] = { ...currentItem, images: updatedImages };
    next.engineItems = currentItems;
    return { updatedReport: next, attachedCount };
  }

  if (targetId.startsWith('transmission-item-')) {
    const itemKey = targetId.replace('transmission-item-', '');
    const currentItems = next.transmissionItems ? { ...next.transmissionItems } : {};
    const currentItem = currentItems[itemKey] || { status: 'pass' as const, comments: '', images: [] };
    const updatedImages = appendStringArray(currentItem.images);
    currentItems[itemKey] = { ...currentItem, images: updatedImages };
    next.transmissionItems = currentItems;
    return { updatedReport: next, attachedCount };
  }

  // General Photos
  if (targetId === 'general-photos-exterior') {
    next.generalPhotosExteriorImages = appendObjectArray(next.generalPhotosExteriorImages);
    return { updatedReport: next, attachedCount };
  }
  if (targetId === 'general-photos-interior') {
    next.generalPhotosInteriorImages = appendObjectArray(next.generalPhotosInteriorImages);
    return { updatedReport: next, attachedCount };
  }
  if (targetId === 'general-photos-engine') {
    next.generalPhotosEngineImages = appendObjectArray(next.generalPhotosEngineImages);
    return { updatedReport: next, attachedCount };
  }

  // Chassis
  if (targetId === 'chassis-subframe-images') {
    next.chassisSubframeImages = appendStringArray(next.chassisSubframeImages);
    return { updatedReport: next, attachedCount };
  }

  // Body
  if (targetId === 'body-images') {
    next.bodyImages = appendStringArray(next.bodyImages);
    return { updatedReport: next, attachedCount };
  }
  if (targetId === 'body-general-images') {
    next.bodyGeneralImages = appendStringArray(next.bodyGeneralImages);
    return { updatedReport: next, attachedCount };
  }

  // Interior & Seats
  if (targetId === 'interior-seats-images') {
    next.seatsImages = appendObjectArray(next.seatsImages);
    return { updatedReport: next, attachedCount };
  }
  if (targetId === 'interior-general-images') {
    next.interiorGeneralImages = appendStringArray(next.interiorGeneralImages);
    return { updatedReport: next, attachedCount };
  }

  // Diagnostics Remarks
  if (targetId === 'electrical-general-images') {
    next.electricalGeneralImages = appendStringArray(next.electricalGeneralImages);
    return { updatedReport: next, attachedCount };
  }
  if (targetId === 'engine-general-images') {
    next.engineGeneralImages = appendStringArray(next.engineGeneralImages);
    return { updatedReport: next, attachedCount };
  }
  if (targetId === 'transmission-general-images') {
    next.transmissionGeneralImages = appendStringArray(next.transmissionGeneralImages);
    return { updatedReport: next, attachedCount };
  }

  // Custom Headlines
  const updateHeadlines = (headlines: CustomHeadlineItem[] | undefined, prefix: string) => {
    if (!headlines) return headlines;
    return headlines.map(h => {
      if (`${prefix}-headline-${h.id}` === targetId) {
        const existingImages = h.images ? [...h.images] : (h.imageUrl ? [h.imageUrl] : []);
        const updated = appendStringArray(existingImages);
        return { ...h, images: updated, imageUrl: updated[0] };
      }
      return h;
    });
  };

  if (targetId.startsWith('chassis-headline-')) {
    next.chassisSubframeCustomHeadlines = updateHeadlines(next.chassisSubframeCustomHeadlines, 'chassis');
  } else if (targetId.startsWith('body-headline-')) {
    next.bodyCustomHeadlines = updateHeadlines(next.bodyCustomHeadlines, 'body');
  } else if (targetId.startsWith('interior-headline-')) {
    next.interiorCustomHeadlines = updateHeadlines(next.interiorCustomHeadlines, 'interior');
  } else if (targetId.startsWith('electrical-headline-')) {
    next.electricalCustomHeadlines = updateHeadlines(next.electricalCustomHeadlines, 'electrical');
  } else if (targetId.startsWith('engine-headline-')) {
    next.engineCustomHeadlines = updateHeadlines(next.engineCustomHeadlines, 'engine');
  } else if (targetId.startsWith('transmission-headline-')) {
    next.transmissionCustomHeadlines = updateHeadlines(next.transmissionCustomHeadlines, 'transmission');
  }

  return { updatedReport: next, attachedCount };
}

/**
 * Removes a media URL from all places in the report immutably.
 */
export function removeMediaFromReportEntirely(
  report: FullInspectionReport,
  mediaUrl: string
): FullInspectionReport {
  if (!mediaUrl) return report;
  const cleanUrl = mediaUrl.trim();
  const next: FullInspectionReport = { ...report };

  // Tyres, rims, brakes
  const clearWheels = (dict: FullInspectionReport['tyres'] | undefined): FullInspectionReport['tyres'] => {
    if (!dict) return {};
    const updated = { ...dict };
    Object.keys(updated).forEach(k => {
      if (updated[k]?.image?.url === cleanUrl) {
        updated[k] = { ...updated[k], image: null };
      }
    });
    return updated;
  };
  if (next.tyres) next.tyres = clearWheels(next.tyres);
  if (next.rims) next.rims = clearWheels(next.rims);
  if (next.brakes) next.brakes = clearWheels(next.brakes);

  // Filter string arrays
  const filterStr = (arr: string[] | undefined) => arr?.filter(u => u !== cleanUrl);
  // Filter obj arrays
  const filterObj = (arr: { id: string; url: string }[] | undefined) => arr?.filter(i => i.url !== cleanUrl);

  next.generalPhotosExteriorImages = filterObj(next.generalPhotosExteriorImages);
  next.generalPhotosInteriorImages = filterObj(next.generalPhotosInteriorImages);
  next.generalPhotosEngineImages = filterObj(next.generalPhotosEngineImages);
  next.seatsImages = filterObj(next.seatsImages);

  next.chassisSubframeImages = filterStr(next.chassisSubframeImages);
  next.bodyImages = filterStr(next.bodyImages);
  next.bodyGeneralImages = filterStr(next.bodyGeneralImages);
  next.interiorGeneralImages = filterStr(next.interiorGeneralImages);
  next.electricalGeneralImages = filterStr(next.electricalGeneralImages);
  next.engineGeneralImages = filterStr(next.engineGeneralImages);
  next.transmissionGeneralImages = filterStr(next.transmissionGeneralImages);

  // Filter diagnostic subsystem checkpoint card items
  const filterItemImages = (items: Record<string, { status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }> | undefined) => {
    if (!items) return items;
    const updated = { ...items };
    let hasChanges = false;
    Object.keys(updated).forEach(k => {
      if (updated[k]?.images?.includes(cleanUrl)) {
        hasChanges = true;
        updated[k] = {
          ...updated[k],
          images: updated[k].images?.filter(u => u !== cleanUrl),
        };
      }
    });
    return hasChanges ? updated : items;
  };

  if (next.electricalItems) next.electricalItems = filterItemImages(next.electricalItems);
  if (next.engineItems) next.engineItems = filterItemImages(next.engineItems);
  if (next.transmissionItems) next.transmissionItems = filterItemImages(next.transmissionItems);

  const filterHeadlines = (headlines: CustomHeadlineItem[] | undefined) => {
    if (!headlines) return headlines;
    return headlines.map(h => ({
      ...h,
      imageUrl: h.imageUrl === cleanUrl ? undefined : h.imageUrl,
      images: h.images?.filter(u => u !== cleanUrl),
    }));
  };

  next.chassisSubframeCustomHeadlines = filterHeadlines(next.chassisSubframeCustomHeadlines);
  next.bodyCustomHeadlines = filterHeadlines(next.bodyCustomHeadlines);
  next.interiorCustomHeadlines = filterHeadlines(next.interiorCustomHeadlines);
  next.electricalCustomHeadlines = filterHeadlines(next.electricalCustomHeadlines);
  next.engineCustomHeadlines = filterHeadlines(next.engineCustomHeadlines);
  next.transmissionCustomHeadlines = filterHeadlines(next.transmissionCustomHeadlines);

  return next;
}
