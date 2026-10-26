import React, { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
  Box,
  Boxes,
  Search,
  CheckCircle2,
  Trash2,
  AlertCircle,
  HelpCircle,
  Sliders,
  FolderPlus,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { InventoryItem, PartKind, VexCategory, ClubProfile } from '../types';
import {
  DEFAULT_PART_KINDS,
  adjustPartQuantity,
  incrementPartQuantity,
  decrementPartQuantity,
  generateRandomInventory,
} from '../data/mockInventory';

interface PartStockCustomizerProps {
  items: InventoryItem[];
  onUpdateItems: (newItems: InventoryItem[]) => void;
  clubProfile: ClubProfile;
  customPartKinds: PartKind[];
  onUpdateCustomPartKinds: (kinds: PartKind[]) => void;
  onAddToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  isCompact?: boolean;
}

export const PartStockCustomizer: React.FC<PartStockCustomizerProps> = ({
  items,
  onUpdateItems,
  clubProfile,
  customPartKinds,
  onUpdateCustomPartKinds,
  onAddToast,
  isCompact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);
  const [isAddingNewPart, setIsAddingNewPart] = useState(false);
  const [isRandomizeMenuOpen, setIsRandomizeMenuOpen] = useState(false);

  // New Part Form State
  const [newPartName, setNewPartName] = useState('');
  const [newPartCategory, setNewPartCategory] = useState<VexCategory>('Sensors');
  const [newPartPrefix, setNewPartPrefix] = useState('VEXS-CUSTOM');
  const [newPartLocation, setNewPartLocation] = useState('Storage Bin 1');
  const [newPartCount, setNewPartCount] = useState('10');

  // Combine default kinds and any custom kinds saved by school
  const allPartKinds = useMemo(() => {
    const list: PartKind[] = [...customPartKinds];
    // Also discover any items in current inventory that have unknown categories or prefixes
    const existingPrefixes = new Set(list.map((k) => k.prefix));
    
    // Check if there are items not matched
    const prefixMap = new Map<string, { category: VexCategory; name: string; location: string }>();
    items.forEach((item) => {
      const prefix = item.itemId.replace(/-\d+$/, '');
      if (!existingPrefixes.has(prefix) && !prefixMap.has(prefix)) {
        prefixMap.set(prefix, {
          category: item.category,
          name: item.itemName,
          location: item.location || 'Cabinet 1',
        });
      }
    });

    prefixMap.forEach((meta, prefix) => {
      list.push({
        id: `auto-${prefix.toLowerCase()}`,
        name: meta.name || `Hardware ${prefix}`,
        category: meta.category,
        prefix,
        defaultLocation: meta.location,
      });
    });

    return list;
  }, [customPartKinds, items]);

  // Compute live counts for each part kind
  const partStats = useMemo(() => {
    return allPartKinds.map((part) => {
      const matchingItems = items.filter(
        (i) => i.category === part.category && (i.itemName === part.name || i.itemId.startsWith(part.prefix))
      );
      const total = matchingItems.length;
      const checkedOut = matchingItems.filter((i) => i.status === 'Checked Out').length;
      const available = total - checkedOut;

      return {
        part,
        total,
        checkedOut,
        available,
        matchingItems,
      };
    });
  }, [allPartKinds, items]);

  // Overall totals
  const overallTotal = items.length;
  const overallCheckedOut = items.filter((i) => i.status === 'Checked Out').length;
  const overallAvailable = overallTotal - overallCheckedOut;

  // Filtered parts
  const filteredParts = useMemo(() => {
    return partStats.filter(({ part }) => {
      const matchesSearch =
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.prefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.defaultLocation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' ||
        part.category === selectedCategory ||
        (selectedCategory === 'Sensors' &&
          ['Optical', 'Distance', 'Inertial', 'Rotational', 'Sensors'].includes(part.category));

      return matchesSearch && matchesCat;
    });
  }, [partStats, searchQuery, selectedCategory]);

  // Handlers for + and -
  const handleIncrement = (part: PartKind) => {
    const result = incrementPartQuantity(items, part);
    if (result.success) {
      onUpdateItems(result.items);
      onAddToast('success', `+1 ${part.name}`, `Total is now ${result.items.filter(i => i.category === part.category && i.itemId.startsWith(part.prefix)).length}`);
    } else {
      onAddToast('error', 'Could not add part', result.message);
    }
  };

  const handleDecrement = (part: PartKind) => {
    const result = decrementPartQuantity(items, part);
    if (result.success) {
      onUpdateItems(result.items);
      onAddToast('info', `-1 ${part.name}`, result.message);
    } else {
      onAddToast('error', 'Cannot Subtract Part', result.message);
    }
  };

  const handleSetExactCount = (part: PartKind, newCount: number) => {
    if (isNaN(newCount) || newCount < 0) return;
    const result = adjustPartQuantity(items, part, newCount);
    if (result.success) {
      onUpdateItems(result.items);
      onAddToast('success', `${part.name} Quantity Updated`, result.message);
    } else {
      onAddToast('error', 'Count Not Updated', result.message);
    }
  };

  const handleBulkAdd = (part: PartKind, amount: number) => {
    const current = items.filter(
      (i) => i.category === part.category && (i.itemName === part.name || i.itemId.startsWith(part.prefix))
    ).length;
    handleSetExactCount(part, current + amount);
  };

  // Create new part model
  const handleCreateNewPart = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newPartName.trim();
    const cleanPrefix = newPartPrefix.trim().toUpperCase() || 'VEXP';
    const cleanLocation = newPartLocation.trim() || 'Cabinet 1';
    const count = parseInt(newPartCount, 10) || 5;

    if (!cleanName) {
      onAddToast('error', 'Part Name Required', 'Please enter a name for the hardware part.');
      return;
    }

    const newKind: PartKind = {
      id: `custom_${Date.now()}`,
      name: cleanName,
      category: newPartCategory,
      prefix: cleanPrefix,
      defaultLocation: cleanLocation,
    };

    const updatedKinds = [...customPartKinds, newKind];
    onUpdateCustomPartKinds(updatedKinds);

    // Seed new units into inventory
    const newItems: InventoryItem[] = [];
    for (let i = 1; i <= count; i++) {
      newItems.push({
        itemId: `${cleanPrefix}-${i}`,
        itemName: cleanName,
        category: newPartCategory,
        status: 'Available',
        currentUser: '',
        dateOut: '',
        notes: 'In storage, verified good condition',
        timesCheckedOut: 0,
        location: cleanLocation,
      });
    }

    onUpdateItems([...items, ...newItems]);
    setIsAddingNewPart(false);
    setNewPartName('');
    setNewPartCount('10');
    onAddToast(
      'success',
      'New Part Model Added',
      `Created ${count} units of "${cleanName}" (${cleanPrefix}-1 through ${cleanPrefix}-${count}).`
    );
  };

  // Randomize all stock quantities
  const handleRandomizeStock = (presetSize: 'small' | 'standard' | 'large') => {
    const randomized = generateRandomInventory({
      clubTeams: clubProfile.teams,
      clubNumber: clubProfile.clubNumber,
      presetSize,
      customPartKinds: allPartKinds,
    });
    onUpdateItems(randomized);
    setIsRandomizeMenuOpen(false);
    onAddToast(
      'success',
      `Randomized Stock Generated (${presetSize.toUpperCase()} Club)`,
      `Populated ${randomized.length} total parts across all categories with realistic active checkouts.`
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Overview & Controls */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Set Exact Part Quantities (+ / -)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                School Customizer
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Every school owns different hardware. Use <strong className="text-zinc-200">+</strong> and{' '}
              <strong className="text-zinc-200">-</strong> or type exact counts to match your lab's real stock.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Randomize Preset Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRandomizeMenuOpen(!isRandomizeMenuOpen)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Randomize Quantities</span>
                <ChevronDown className="w-3 h-3 text-indigo-400" />
              </button>

              {isRandomizeMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl p-2 z-20 space-y-1 text-xs">
                  <div className="px-2 py-1 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                    Generate Random Stock
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRandomizeStock('small')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-200 flex flex-col"
                  >
                    <span className="font-semibold text-white">Small Club (2-3 Teams)</span>
                    <span className="text-[10px] text-zinc-400">~90-140 parts total</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRandomizeStock('standard')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-200 flex flex-col"
                  >
                    <span className="font-semibold text-white">Standard Club (4-7 Teams)</span>
                    <span className="text-[10px] text-zinc-400">~180-260 parts total</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRandomizeStock('large')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-200 flex flex-col"
                  >
                    <span className="font-semibold text-white">Large / Mega Club (8+ Teams)</span>
                    <span className="text-[10px] text-zinc-400">~300-480 parts total</span>
                  </button>
                </div>
              )}
            </div>

            {/* Add New Custom Part Button */}
            <button
              type="button"
              onClick={() => setIsAddingNewPart(!isAddingNewPart)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5 text-zinc-300" />
              <span>Add Custom Part Kind</span>
            </button>
          </div>
        </div>

        {/* Aggregate Status Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-900 text-xs font-mono">
          <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <div className="text-[10px] text-zinc-400">Total Hardware Parts</div>
            <div className="text-base font-bold text-white mt-0.5">{overallTotal}</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
            <div className="text-[10px] text-emerald-400">Available in Storage</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">{overallAvailable}</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/30">
            <div className="text-[10px] text-amber-400">Checked Out to Teams</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">{overallCheckedOut}</div>
          </div>
          <div className="p-2 rounded-lg bg-indigo-950/20 border border-indigo-900/30">
            <div className="text-[10px] text-indigo-400">Distinct Part Models</div>
            <div className="text-base font-bold text-indigo-400 mt-0.5">{allPartKinds.length}</div>
          </div>
        </div>
      </div>

      {/* Optional: Add New Custom Part Form */}
      {isAddingNewPart && (
        <form onSubmit={handleCreateNewPart} className="p-4 rounded-xl bg-zinc-950 border border-indigo-500/40 space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-indigo-400" />
              <span>Add New Custom Hardware Part to Your Catalog</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNewPart(false)}
              className="text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-zinc-300 mb-1">Part Name</label>
              <input
                type="text"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                placeholder="e.g. 3D Printed Tracking Bracket"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1">Category</label>
              <select
                value={newPartCategory}
                onChange={(e) => setNewPartCategory(e.target.value as VexCategory)}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
              >
                <option value="Brain">Brain</option>
                <option value="Radio">Radio</option>
                <option value="Motors">Motors</option>
                <option value="Controllers">Controllers</option>
                <option value="Batteries">Batteries</option>
                <option value="Sensors">Sensors</option>
                <option value="Optical">Optical</option>
                <option value="Distance">Distance</option>
                <option value="Inertial">Inertial</option>
                <option value="Rotational">Rotational</option>
                <option value="Solenoids">Solenoids</option>
                <option value="Other">Other / Structural</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-300 mb-1">ID Prefix</label>
              <input
                type="text"
                value={newPartPrefix}
                onChange={(e) => setNewPartPrefix(e.target.value.toUpperCase())}
                placeholder="e.g. VEX-BRK"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg font-mono text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-zinc-300 mb-1">Storage Location</label>
              <input
                type="text"
                value={newPartLocation}
                onChange={(e) => setNewPartLocation(e.target.value)}
                placeholder="e.g. Cabinet 2, Drawer B"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1">Initial Quantity in Storage</label>
              <input
                type="number"
                min="1"
                max="500"
                value={newPartCount}
                onChange={(e) => setNewPartCount(e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNewPart(false)}
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
            >
              Create Part Kind
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search part by name, prefix, or location..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-[11px]">
          {['All', 'Brain', 'Radio', 'Motors', 'Controllers', 'Batteries', 'Sensors', 'Solenoids'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
                selectedCategory === cat
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/60 border border-zinc-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Parts List with +/- Controls */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {filteredParts.map(({ part, total, checkedOut, available, matchingItems }) => {
          const isExpanded = expandedPartId === part.id;
          const isMinLocked = total <= checkedOut;

          return (
            <div
              key={part.id}
              className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700/80 transition-all space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Part info */}
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-300">
                    <Box className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-xs truncate">{part.name}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-indigo-300">
                        {part.prefix}
                      </span>
                      <span className="text-[10px] text-zinc-500">{part.category}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                      <span>{part.defaultLocation}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-mono font-medium">{available} Available</span>
                      {checkedOut > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-amber-400 font-mono font-medium">{checkedOut} In Use</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quantity Adjuster Controls (+ / - / direct input) */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Minus button */}
                  <button
                    type="button"
                    onClick={() => handleDecrement(part)}
                    disabled={isMinLocked || total === 0}
                    title={
                      isMinLocked
                        ? `Cannot subtract: all ${checkedOut} unit(s) are currently checked out to teams`
                        : 'Subtract 1 part from total stock'
                    }
                    className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  {/* Direct Count Input */}
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1">
                    <input
                      type="number"
                      min={checkedOut}
                      max={999}
                      value={total}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          handleSetExactCount(part, val);
                        }
                      }}
                      className="w-12 text-center bg-transparent font-mono font-bold text-white text-xs focus:outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 font-mono">pcs</span>
                  </div>

                  {/* Plus button */}
                  <button
                    type="button"
                    onClick={() => handleIncrement(part)}
                    title="Add 1 part to total stock"
                    className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {/* Bulk +5 button */}
                  <button
                    type="button"
                    onClick={() => handleBulkAdd(part, 5)}
                    title="Add 5 parts to stock in one click"
                    className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    +5
                  </button>

                  {/* View Individual Items Dropdown */}
                  <button
                    type="button"
                    onClick={() => setExpandedPartId(isExpanded ? null : part.id)}
                    title="Inspect individual numbered units"
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expanded units list */}
              {isExpanded && (
                <div className="pt-2 border-t border-zinc-900 space-y-1.5 text-[11px] animate-fade-in">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 flex items-center justify-between">
                    <span>Individual Units ({matchingItems.length})</span>
                    <span>Status</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                    {matchingItems.map((item) => (
                      <div
                        key={item.itemId}
                        className="px-2 py-1 rounded bg-zinc-900/60 flex items-center justify-between text-zinc-300 border border-zinc-900"
                      >
                        <span className="font-semibold">{item.itemId}</span>
                        <div className="flex items-center gap-2">
                          {item.status === 'Checked Out' ? (
                            <span className="text-amber-400 font-sans">
                              With Team {item.currentUser} ({item.dateOut || 'Active'})
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-sans">In Cabinet</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredParts.length === 0 && (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No parts matching "{searchQuery}". Click "Add Custom Part Kind" to create one!
          </div>
        )}
      </div>
    </div>
  );
};
