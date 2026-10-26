export type VexCategory =
  | 'Brain'
  | 'Radio'
  | 'Motors'
  | 'Controllers'
  | 'Batteries'
  | 'Sensors'
  | 'Optical'
  | 'Distance'
  | 'Inertial'
  | 'Rotational'
  | 'Solenoids'
  | 'Other';

export const CLUB_TEAMS = [
  '654K',
  '654J',
  '654A',
  '654B',
  '654G',
  '654T',
  '654V',
  '654Y',
  '654X',
  '654Z',
  'RECF',
] as const;

export type ClubTeam = (typeof CLUB_TEAMS)[number];

export interface ClubProfile {
  schoolName: string;
  shortName: string;
  clubNumber: string;
  teams: string[];
  logoUrl?: string;
  isCustomized?: boolean;
}

export const DEFAULT_CLUB_PROFILE: ClubProfile = {
  schoolName: 'Lake Travis Robotics',
  shortName: 'LT Robotics',
  clubNumber: '654',
  teams: ['654K', '654J', '654A', '654B', '654G', '654T', '654V', '654Y', '654X', '654Z', 'RECF'],
  logoUrl: '/assets/aistudio/lt_logo_transparent.png',
  isCustomized: false,
};

export const SENSOR_CATEGORIES: VexCategory[] = ['Optical', 'Distance', 'Inertial', 'Rotational', 'Sensors'];

export const CATEGORY_PREFIX_MAP: Record<VexCategory, string> = {
  Brain: 'VEXB',
  Radio: 'VEXR',
  Motors: 'VEXM',
  Controllers: 'VEXC',
  Batteries: 'VEXBAT',
  Sensors: 'VEXS',
  Optical: 'VEXS-O',
  Distance: 'VEXS-DIST',
  Inertial: 'VEXS-INER',
  Rotational: 'VEXS-ROT',
  Solenoids: 'VEXSOL',
  Other: 'VEXP',
};

export interface PartKind {
  id: string;
  name: string;
  category: VexCategory;
  prefix: string;
  defaultLocation: string;
  description?: string;
}

export function normalizeItemId(rawId: string): string {
  if (!rawId) return '';
  const clean = rawId.trim().toUpperCase().replace(/\s+/g, '');

  // Optical: VEX-O- -> VEXS-O- (resolves spreadsheet form prefix bug)
  if (clean.startsWith('VEX-O-')) {
    return clean.replace('VEX-O-', 'VEXS-O-');
  }
  // Alternate aliases
  if (clean.startsWith('VEXMOT-')) {
    return clean.replace('VEXMOT-', 'VEXM-');
  }
  if (clean.startsWith('VEXBRN-')) {
    return clean.replace('VEXBRN-', 'VEXB-');
  }
  if (clean.startsWith('VEXRAD-')) {
    return clean.replace('VEXRAD-', 'VEXR-');
  }
  if (clean.startsWith('VEX-SOL-')) {
    return clean.replace('VEX-SOL-', 'VEXSOL-');
  }
  if (clean.startsWith('VEX-BAT-')) {
    return clean.replace('VEX-BAT-', 'VEXBAT-');
  }
  if (clean.startsWith('VEX-CTRL-')) {
    return clean.replace('VEX-CTRL-', 'VEXC-');
  }
  return clean;
}

export function isValidVexId(rawId: string): boolean {
  if (!rawId) return false;
  const clean = normalizeItemId(rawId);
  return (
    /^VEX(S-[A-Z0-9]+|SOL|B|R|M|C|BAT|P|[A-Z0-9]+)-\d+$/i.test(clean) ||
    /^VEX-O-\d+$/i.test(clean) ||
    /^VEX(BRN|RAD|SOL|MOT)-\d+$/i.test(clean)
  );
}

export function classifyVexCategory(category?: string, itemName?: string, itemId?: string): VexCategory {
  const c = String(category || '').toLowerCase();
  const n = String(itemName || '').toLowerCase();
  const id = String(itemId || '').toUpperCase();

  // Solenoid / Pneumatics
  if (c.includes('solenoid') || c.includes('solonoid') || c.includes('pneumatic') || id.startsWith('VEXSOL')) {
    return 'Solenoids';
  }
  // Motors
  if (c.includes('motor') || n.includes('motor') || id.startsWith('VEXM') || id.startsWith('VEXMOT')) {
    return 'Motors';
  }
  // Controllers
  if (c.includes('controller') || n.includes('controller') || id.startsWith('VEXC')) {
    return 'Controllers';
  }
  // Batteries
  if (c.includes('battery') || c.includes('batter') || n.includes('battery') || id.startsWith('VEXBAT')) {
    return 'Batteries';
  }
  // Optical Sensor
  if (c.includes('optical') || n.includes('optical') || id.includes('VEXS-O') || id.includes('-O-') || id.startsWith('VEX-O-')) {
    return 'Optical';
  }
  // Distance Sensor
  if (c.includes('dist') || n.includes('dist') || id.includes('VEXS-DIST') || id.includes('-DIST-')) {
    return 'Distance';
  }
  // Inertial Sensor
  if (c.includes('inert') || n.includes('inert') || id.includes('VEXS-INER') || id.includes('-INER-')) {
    return 'Inertial';
  }
  // Rotational Sensor
  if (c.includes('rotat') || n.includes('rotat') || id.includes('VEXS-ROT') || id.includes('-ROT-')) {
    return 'Rotational';
  }
  // Brain
  if (c.includes('brain') || n.includes('brain') || id.startsWith('VEXB') || id.startsWith('VEXBRN')) {
    return 'Brain';
  }
  // Radio
  if (c.includes('radio') || n.includes('radio') || id.startsWith('VEXR') || id.startsWith('VEXRAD')) {
    return 'Radio';
  }

  // Fallback for generic sensors
  if (id.startsWith('VEXS-O')) return 'Optical';
  if (id.startsWith('VEXS-DIST')) return 'Distance';
  if (id.startsWith('VEXS-INER')) return 'Inertial';
  if (id.startsWith('VEXS-ROT')) return 'Rotational';
  if (c.includes('sensor') || n.includes('sensor')) {
    return 'Sensors';
  }

  return 'Other';
}

export function getCategoryDefaultLocation(category: VexCategory | string): string {
  const normalized = (category || '').toLowerCase();
  if (
    normalized.includes('sensor') ||
    normalized.includes('optical') ||
    normalized.includes('distance') ||
    normalized.includes('inert') ||
    normalized.includes('rotat')
  ) {
    return 'Sensor Cabinet';
  }
  if (
    normalized.includes('solenoid') ||
    normalized.includes('solonoid') ||
    normalized.includes('pneumatic')
  ) {
    return 'Pneumatics Cabinet';
  }
  if (normalized.includes('motor')) {
    return 'Cabinet 1 (Motors)';
  }
  if (normalized.includes('controller')) {
    return 'Controller Storage Rack';
  }
  if (normalized.includes('battery') || normalized.includes('batter')) {
    return 'Battery Charging Station';
  }
  return 'Cabinet 1';
}

export type ItemStatus = 'Available' | 'Checked Out';

export interface InventoryItem {
  itemId: string;
  itemName: string;
  category: VexCategory;
  status: ItemStatus;
  currentUser: string; // e.g. "654V", "654T", "654B"
  dateOut: string;
  notes: string;
  timesCheckedOut: number;
  location?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  itemId: string;
  itemName?: string;
  action: 'Check Out' | 'Check In';
  team: string;
  notes: string;
  userEmail: string;
  category?: string;
}

export interface CompetitionPackItem {
  id: string;
  category: VexCategory;
  name: string;
  targetCount: number;
  packedCount: number;
  isPacked: boolean;
  priority: 'Critical' | 'Standard' | 'Spare';
  description: string;
}

export interface SyncStatus {
  lastSynced: Date | null;
  isSyncing: boolean;
  error: string | null;
  mode: 'live' | 'mock';
  url: string;
}

export type ActiveTab = 'dashboard' | 'inventory' | 'teams' | 'packlist' | 'logs' | 'manual';

export type UserRole = 'member' | 'admin';

export interface AdminSettings {
  adminEmails: string[];
  adminPin: string;
  isUnlocked: boolean;
  kioskOnly: boolean;
}

export const DEFAULT_ADMIN_EMAILS = [
  'yln2k20trishanth@gmail.com',
];

export const DEFAULT_ADMIN_PIN = '654';
