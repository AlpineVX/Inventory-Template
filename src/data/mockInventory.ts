import { InventoryItem, AuditLog, CompetitionPackItem, PartKind, CLUB_TEAMS } from '../types';

/**
 * Standard Part Kinds for VEX Robotics teams.
 * Every school has different quantities of these parts, and can add, subtract,
 * or add custom parts at will.
 */
export const DEFAULT_PART_KINDS: PartKind[] = [
  {
    id: 'brain',
    name: 'V5 Robot Brain',
    category: 'Brain',
    prefix: 'VEXB',
    defaultLocation: 'Cabinet 1',
    description: 'V5 Central Microprocessor Brain with touch screen & smart ports',
  },
  {
    id: 'radio',
    name: 'V5 Robot Radio',
    category: 'Radio',
    prefix: 'VEXR',
    defaultLocation: 'Cabinet 1',
    description: 'V5 2.4 GHz wireless competition radio & bluetooth link',
  },
  {
    id: 'motor_11w',
    name: 'V5 Smart Motor (11W)',
    category: 'Motors',
    prefix: 'VEXM',
    defaultLocation: 'Cabinet 1 (Motors)',
    description: 'High-power 11W V5 Smart Motor with internal encoder & cartridges',
  },
  {
    id: 'motor_5_5w',
    name: 'V5 Smart Motor (5.5W)',
    category: 'Motors',
    prefix: 'VEXM5',
    defaultLocation: 'Cabinet 1 (Motors)',
    description: 'Compact 5.5W smart motor for intakes, indexing, and small mechanisms',
  },
  {
    id: 'controller',
    name: 'V5 Robot Controller',
    category: 'Controllers',
    prefix: 'VEXC',
    defaultLocation: 'Controller Storage Rack',
    description: 'Dual-joystick wireless handheld transmitter with LCD display',
  },
  {
    id: 'battery',
    name: 'V5 Robot Battery (Li-ion)',
    category: 'Batteries',
    prefix: 'VEXBAT',
    defaultLocation: 'Battery Charging Station',
    description: '12.8V 1100mAh LiFePO4 high-discharge competition battery pack',
  },
  {
    id: 'optical',
    name: 'Optical Sensor',
    category: 'Optical',
    prefix: 'VEXS-O',
    defaultLocation: 'Sensor Cabinet',
    description: 'Ambient light, color hue, proximity, and gesture detection sensor',
  },
  {
    id: 'distance',
    name: 'Distance Sensor',
    category: 'Distance',
    prefix: 'VEXS-DIST',
    defaultLocation: 'Sensor Cabinet',
    description: 'Class 1 eye-safe laser time-of-flight distance sensor (20mm - 2000mm)',
  },
  {
    id: 'inertial',
    name: 'Inertial Sensor (IMU)',
    category: 'Inertial',
    prefix: 'VEXS-INER',
    defaultLocation: 'Sensor Cabinet',
    description: '3-axis accelerometer and 3-axis gyroscope for autonomous odometry',
  },
  {
    id: 'rotational',
    name: 'Rotational Sensor',
    category: 'Rotational',
    prefix: 'VEXS-ROT',
    defaultLocation: 'Sensor Cabinet',
    description: 'High-resolution magnetic shaft encoder for dead-wheel tracking pods',
  },
  {
    id: 'solenoid',
    name: 'Pneumatic Solenoid Valve',
    category: 'Solenoids',
    prefix: 'VEXSOL',
    defaultLocation: 'Pneumatics Cabinet',
    description: 'Single/Double electronic solenoid valve for pneumatic cylinders',
  },
  {
    id: 'vision',
    name: 'AI Vision / Vision Sensor',
    category: 'Sensors',
    prefix: 'VEXS-VIS',
    defaultLocation: 'Sensor Cabinet',
    description: 'Color code tracking and AI object classification camera',
  },
  {
    id: 'gps',
    name: 'GPS Sensor',
    category: 'Sensors',
    prefix: 'VEXS-GPS',
    defaultLocation: 'Sensor Cabinet',
    description: 'Field code strip reader for absolute X/Y/theta navigation',
  },
  {
    id: 'bumper',
    name: 'Bumper Switch',
    category: 'Sensors',
    prefix: 'VEXS-BMP',
    defaultLocation: 'Sensor Cabinet',
    description: 'High-reliability physical limit / bumper microswitch',
  },
];

/**
 * Realistic random checkout notes used during generation
 */
const CHECKOUT_NOTES = [
  'Primary robot drive base',
  'Odometry tracking pod testing',
  'Intake flywheel mechanism',
  'Pneumatic cylinder clamp',
  'Autonomous calibration & testing',
  'Tournament competition robot',
  'Lift tilt arm assembly',
  'Active scoring indexing wheel',
  'Pit testing & programming practice',
  'Working properly, verified by driver',
];

/**
 * Helper to generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats a date N days ago as YYYY-MM-DD
 */
function getRecentDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

/**
 * Generate a fresh, realistic, randomized inventory.
 * Each part kind is allocated a varied realistic stock count (e.g. 10 to 45 parts).
 * A subset of items (approx 15-25%) are realistically checked out to active teams.
 */
export function generateRandomInventory(options?: {
  clubTeams?: string[];
  clubNumber?: string;
  presetSize?: 'small' | 'standard' | 'large';
  customPartKinds?: PartKind[];
}): InventoryItem[] {
  const teams = options?.clubTeams && options.clubTeams.length > 0 ? options.clubTeams : [...CLUB_TEAMS];
  const partKinds = options?.customPartKinds || DEFAULT_PART_KINDS;
  const size = options?.presetSize || 'standard';

  const items: InventoryItem[] = [];

  // Multiplier based on club size
  const multipliers: Record<string, { min: number; max: number }> = {
    small: { min: 0.6, max: 0.8 },
    standard: { min: 0.9, max: 1.3 },
    large: { min: 1.4, max: 2.0 },
  };
  const mult = multipliers[size] || multipliers.standard;

  // Base range for each part kind
  const baseRanges: Record<string, [number, number]> = {
    brain: [10, 18],
    radio: [12, 22],
    motor_11w: [32, 54],
    motor_5_5w: [12, 24],
    controller: [10, 20],
    battery: [16, 32],
    optical: [14, 28],
    distance: [12, 24],
    inertial: [8, 16],
    rotational: [14, 28],
    solenoid: [14, 30],
    vision: [4, 10],
    gps: [3, 8],
    bumper: [8, 18],
  };

  for (const part of partKinds) {
    const range = baseRanges[part.id] || [8, 20];
    const rawCount = randomInt(
      Math.max(2, Math.round(range[0] * mult.min)),
      Math.max(4, Math.round(range[1] * mult.max))
    );

    // Realistic checkout count: ~15% to 30% of items are currently with teams
    const checkoutRate = randomInt(12, 28) / 100;
    const checkoutCount = Math.min(rawCount - 1, Math.round(rawCount * checkoutRate));

    for (let i = 1; i <= rawCount; i++) {
      const itemId = `${part.prefix}-${i}`;
      const isCheckedOut = i <= checkoutCount;
      const assignedTeam = isCheckedOut ? teams[(i * 3 + part.name.length) % teams.length] : '';
      const daysAgo = randomInt(1, 28);
      const note = isCheckedOut
        ? CHECKOUT_NOTES[(i + part.name.length) % CHECKOUT_NOTES.length]
        : 'In storage, verified good condition';

      items.push({
        itemId,
        itemName: part.name,
        category: part.category,
        status: isCheckedOut ? 'Checked Out' : 'Available',
        currentUser: assignedTeam,
        dateOut: isCheckedOut ? getRecentDate(daysAgo) : '',
        notes: note,
        timesCheckedOut: isCheckedOut ? randomInt(1, 4) : randomInt(0, 2),
        location: isCheckedOut ? `With Team ${assignedTeam}` : part.defaultLocation,
      });
    }
  }

  return items;
}

/**
 * Backward compatibility alias for initial load.
 * Returns a randomized realistic inventory.
 */
export function generateDefaultInventory(): InventoryItem[] {
  return generateRandomInventory({ presetSize: 'standard' });
}

/**
 * Adjust the total quantity of a specific kind of part.
 * - If increasing: adds new numbered units marked 'Available' in storage.
 * - If decreasing: safely removes unborrowed 'Available' units from the top down.
 * - Cannot reduce total below currently checked-out quantity.
 */
export function adjustPartQuantity(
  currentItems: InventoryItem[],
  partKind: PartKind,
  newTotal: number
): { items: InventoryItem[]; success: boolean; message: string } {
  const matchingItems = currentItems.filter(
    (i) => i.category === partKind.category && (i.itemName === partKind.name || i.itemId.startsWith(partKind.prefix))
  );

  const checkedOutCount = matchingItems.filter((i) => i.status === 'Checked Out').length;
  const currentTotal = matchingItems.length;

  if (newTotal < checkedOutCount) {
    return {
      items: currentItems,
      success: false,
      message: `Cannot reduce total to ${newTotal}. ${checkedOutCount} unit(s) are currently checked out to teams. Return them first.`,
    };
  }

  if (newTotal === currentTotal) {
    return { items: currentItems, success: true, message: 'Quantity unchanged.' };
  }

  if (newTotal > currentTotal) {
    // Add new units
    const toAdd = newTotal - currentTotal;
    const nextItems = [...currentItems];

    // Find highest existing numeric index for this prefix
    let maxIdx = 0;
    for (const item of matchingItems) {
      const match = item.itemId.match(/-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIdx) maxIdx = num;
      }
    }

    for (let k = 1; k <= toAdd; k++) {
      const nextNum = maxIdx + k;
      nextItems.push({
        itemId: `${partKind.prefix}-${nextNum}`,
        itemName: partKind.name,
        category: partKind.category,
        status: 'Available',
        currentUser: '',
        dateOut: '',
        notes: 'In storage, verified good condition',
        timesCheckedOut: 0,
        location: partKind.defaultLocation,
      });
    }

    return {
      items: nextItems,
      success: true,
      message: `Added ${toAdd} unit(s) of ${partKind.name} (Total now: ${newTotal}).`,
    };
  } else {
    // Decrease units: remove 'Available' units starting from highest ID
    const toRemove = currentTotal - newTotal;
    const availableMatching = matchingItems.filter((i) => i.status === 'Available');

    // Sort by numeric id descending so we remove highest numbers first
    availableMatching.sort((a, b) => {
      const numA = parseInt(a.itemId.match(/-(\d+)$/)?.[1] || '0', 10);
      const numB = parseInt(b.itemId.match(/-(\d+)$/)?.[1] || '0', 10);
      return numB - numA;
    });

    const idsToRemove = new Set(availableMatching.slice(0, toRemove).map((i) => i.itemId));
    const nextItems = currentItems.filter((i) => !idsToRemove.has(i.itemId));

    return {
      items: nextItems,
      success: true,
      message: `Removed ${idsToRemove.size} unit(s) of ${partKind.name} (Total now: ${newTotal}).`,
    };
  }
}

/**
 * Increment a part's total quantity by 1
 */
export function incrementPartQuantity(
  currentItems: InventoryItem[],
  partKind: PartKind
): { items: InventoryItem[]; success: boolean; message: string } {
  const currentCount = currentItems.filter(
    (i) => i.category === partKind.category && (i.itemName === partKind.name || i.itemId.startsWith(partKind.prefix))
  ).length;
  return adjustPartQuantity(currentItems, partKind, currentCount + 1);
}

/**
 * Decrement a part's total quantity by 1
 */
export function decrementPartQuantity(
  currentItems: InventoryItem[],
  partKind: PartKind
): { items: InventoryItem[]; success: boolean; message: string } {
  const currentCount = currentItems.filter(
    (i) => i.category === partKind.category && (i.itemName === partKind.name || i.itemId.startsWith(partKind.prefix))
  ).length;
  return adjustPartQuantity(currentItems, partKind, Math.max(0, currentCount - 1));
}

// Initial realistic audit logs
export const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    itemId: 'VEXM-14',
    itemName: 'V5 Smart Motor (11W)',
    action: 'Check Out',
    team: '654V',
    notes: 'Drive base 4-motor gearbox testing',
    userEmail: 'team.driver@vex.club',
    category: 'Motors',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    itemId: 'VEXS-ROT-6',
    itemName: 'Rotational Sensor',
    action: 'Check Out',
    team: '654J',
    notes: 'Odometry tracking wheels installation',
    userEmail: 'builder@vex.club',
    category: 'Rotational',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    itemId: 'VEXSOL-4',
    itemName: 'Pneumatic Solenoid Valve',
    action: 'Check In',
    team: '654T',
    notes: 'Returned to storage, fully operational',
    userEmail: 'pit.captain@vex.club',
    category: 'Solenoids',
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    itemId: 'VEXB-3',
    itemName: 'V5 Robot Brain',
    action: 'Check Out',
    team: '654X',
    notes: 'Firmware upgrade and match autonomous programming',
    userEmail: 'coder@vex.club',
    category: 'Brain',
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
    itemId: 'VEXS-DIST-5',
    itemName: 'Distance Sensor',
    action: 'Check Out',
    team: '654A',
    notes: 'Goal detection sensor tuning',
    userEmail: 'lead@vex.club',
    category: 'Distance',
  },
];

// Competition Pack List for tournament preparation
export const INITIAL_PACK_LIST: CompetitionPackItem[] = [
  {
    id: 'pack-brain',
    category: 'Brain',
    name: 'V5 Robot Brain',
    targetCount: 2,
    packedCount: 2,
    isPacked: true,
    priority: 'Critical',
    description: '1 primary tournament brain + 1 flashing backup',
  },
  {
    id: 'pack-radio',
    category: 'Radio',
    name: 'V5 Robot Radio',
    targetCount: 2,
    packedCount: 2,
    isPacked: true,
    priority: 'Critical',
    description: 'Tournament field radio + pit spare',
  },
  {
    id: 'pack-motors',
    category: 'Motors',
    name: 'V5 Smart Motor (11W)',
    targetCount: 8,
    packedCount: 8,
    isPacked: true,
    priority: 'Critical',
    description: 'Drive base, lift, and intake motors with spare cartridges',
  },
  {
    id: 'pack-controller',
    category: 'Controllers',
    name: 'V5 Robot Controller',
    targetCount: 2,
    packedCount: 2,
    isPacked: true,
    priority: 'Critical',
    description: 'Primary driver controller + secondary partner/backup',
  },
  {
    id: 'pack-battery',
    category: 'Batteries',
    name: 'V5 Robot Battery (Li-ion)',
    targetCount: 4,
    packedCount: 4,
    isPacked: true,
    priority: 'Critical',
    description: '4 fully charged competition batteries with chargers',
  },
  {
    id: 'pack-optical',
    category: 'Optical',
    name: 'Optical Sensor',
    targetCount: 2,
    packedCount: 2,
    isPacked: true,
    priority: 'Standard',
    description: 'Alliance element / color optical sensor',
  },
  {
    id: 'pack-dist',
    category: 'Distance',
    name: 'Distance Sensor',
    targetCount: 2,
    packedCount: 2,
    isPacked: true,
    priority: 'Standard',
    description: 'Front & side field perimeter distance sensor',
  },
  {
    id: 'pack-inertial',
    category: 'Inertial',
    name: 'Inertial Sensor (IMU)',
    targetCount: 2,
    packedCount: 2,
    isPacked: true,
    priority: 'Critical',
    description: 'Heading & gyro odometry tracker for auto routine',
  },
  {
    id: 'pack-rotational',
    category: 'Rotational',
    name: 'Rotational Sensor',
    targetCount: 3,
    packedCount: 3,
    isPacked: true,
    priority: 'Standard',
    description: 'Tracking wheel encoders for autonomous position tracking',
  },
  {
    id: 'pack-solenoid',
    category: 'Solenoids',
    name: 'Pneumatic Solenoid Valve',
    targetCount: 4,
    packedCount: 4,
    isPacked: true,
    priority: 'Critical',
    description: 'Solenoid drivers, manifold, air reservoirs & fittings',
  },
];
