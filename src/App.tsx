/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  InventoryItem,
  AuditLog,
  VexCategory,
  ActiveTab,
  SyncStatus,
  AdminSettings,
  ClubProfile,
  DEFAULT_CLUB_PROFILE,
  DEFAULT_ADMIN_EMAILS,
  DEFAULT_ADMIN_PIN,
  getCategoryDefaultLocation,
  classifyVexCategory,
  normalizeItemId,
  PartKind,
} from './types';
import {
  generateDefaultInventory,
  generateRandomInventory,
  DEFAULT_PART_KINDS,
  INITIAL_LOGS,
} from './data/mockInventory';
import {
  getStoredApiUrl,
  saveStoredApiUrl,
  disconnectSpreadsheet,
  getCachedInventory,
  saveCachedInventory,
  getCachedLogs,
  saveCachedLogs,
  getLastSyncTime,
  fetchLiveInventory,
  postInventoryAction,
} from './services/sheetApi';
import { Header } from './components/Header';
import { MobileTopHeader } from './components/MobileTopHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ClubAssetsModal } from './components/ClubAssetsModal';
import { CommandCenter } from './components/CommandCenter';
import { InventoryBrowser } from './components/InventoryBrowser';
import { TeamLookup } from './components/TeamLookup';
import { CompetitionPackList } from './components/CompetitionPackList';
import { ActivityLogs } from './components/ActivityLogs';
import { CheckInOutModal } from './components/CheckInOutModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminUnlockModal } from './components/AdminUnlockModal';
import { SchoolCustomizerModal } from './components/SchoolCustomizerModal';
import { InstructionManual } from './components/InstructionManual';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // 1. Core State
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const version = typeof window !== 'undefined' ? localStorage.getItem('vex_schema_ver') : null;
    if (version !== 'v8_random_custom_stock') {
      const fresh = generateDefaultInventory();
      if (typeof window !== 'undefined') {
        localStorage.setItem('vex_schema_ver', 'v8_random_custom_stock');
      }
      saveCachedInventory(fresh);
      return fresh;
    }
    const cached = getCachedInventory();
    return cached && cached.length > 0 ? cached : generateDefaultInventory();
  });

  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const version = typeof window !== 'undefined' ? localStorage.getItem('vex_schema_ver_logs') : null;
    if (version !== 'v5') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vex_schema_ver_logs', 'v5');
      }
      saveCachedLogs(INITIAL_LOGS);
      return INITIAL_LOGS;
    }
    const cached = getCachedLogs();
    return cached && cached.length > 0 ? cached : INITIAL_LOGS;
  });

  // Custom Part Kinds list (allows schools to add custom part models)
  const [customPartKinds, setCustomPartKinds] = useState<PartKind[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vex_custom_part_kinds');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse custom part kinds', e);
        }
      }
    }
    return DEFAULT_PART_KINDS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vex_custom_part_kinds', JSON.stringify(customPartKinds));
    }
  }, [customPartKinds]);

  // School & Team Configuration (Allows any school or club to use this website)
  const [clubProfile, setClubProfile] = useState<ClubProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vex_club_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse club profile', e);
        }
      }
    }
    return DEFAULT_CLUB_PROFILE;
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    const url = getStoredApiUrl();
    return {
      url,
      isSyncing: false,
      error: null,
      lastSynced: getLastSyncTime(),
      mode: url ? 'live' : 'mock',
    };
  });

  // Admin access control state
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vex_admin_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            isUnlocked: false, // Default to locked on startup so regular people can only check out/in
          };
        } catch (e) {
          console.error('Failed to parse admin settings', e);
        }
      }
    }
    return {
      adminEmails: [...DEFAULT_ADMIN_EMAILS],
      adminPin: DEFAULT_ADMIN_PIN,
      isUnlocked: false,
      kioskOnly: false,
    };
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<VexCategory | 'All'>('All');
  const [selectedTeam, setSelectedTeam] = useState<string>(() => clubProfile.teams[0] || '654V');

  // Modal states
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutTargetItem, setCheckoutTargetItem] = useState<InventoryItem | undefined>(undefined);
  const [checkoutDefaultAction, setCheckoutDefaultAction] = useState<'Check Out' | 'Check In'>('Check Out');
  const [checkoutPresetTeam, setCheckoutPresetTeam] = useState<string>(() => clubProfile.teams[0] || '654V');

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isAdminUnlockModalOpen, setIsAdminUnlockModalOpen] = useState<boolean>(false);
  const [isSchoolCustomizerOpen, setIsSchoolCustomizerOpen] = useState<boolean>(false);
  const [schoolCustomizerTab, setSchoolCustomizerTab] = useState<'customize' | 'parts_stock' | 'clone_guide' | 'backup'>('customize');
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const handleOpenSchoolCustomizer = (tab: 'customize' | 'parts_stock' | 'clone_guide' | 'backup' = 'customize') => {
    setSchoolCustomizerTab(tab);
    setIsSchoolCustomizerOpen(true);
  };

  // Mobile viewport detection and manual layout mode switch
  const [viewMode, setViewMode] = useState<'auto' | 'mobile' | 'desktop'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('vex_view_mode') as 'auto' | 'mobile' | 'desktop') || 'auto';
    }
    return 'auto';
  });

  const [isWindowMobile, setIsWindowMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsWindowMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewMode === 'mobile' || (viewMode === 'auto' && isWindowMobile);

  const handleToggleViewMode = () => {
    const next = isMobile ? 'desktop' : 'mobile';
    setViewMode(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vex_view_mode', next);
    }
    addToast(
      'info',
      next === 'mobile' ? 'Switched to Dedicated Phone UI' : 'Switched to Desktop UI',
      'You can switch layouts anytime using the top bar switcher icon or footer link.'
    );
  };

  // Toast Helper
  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveCachedInventory(items);
  }, [items]);

  useEffect(() => {
    saveCachedLogs(logs);
  }, [logs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vex_admin_settings', JSON.stringify(adminSettings));
    }
  }, [adminSettings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vex_club_profile', JSON.stringify(clubProfile));
    }
  }, [clubProfile]);

  // Enforce spreadsheet disconnected by default so other schools have a clean standalone system
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const disconnectedMarker = localStorage.getItem('vex_disconnected_enforced_v1');
      if (!disconnectedMarker) {
        disconnectSpreadsheet();
        localStorage.setItem('vex_disconnected_enforced_v1', 'true');
        setSyncStatus((prev) => ({
          ...prev,
          url: '',
          mode: 'mock',
          error: null,
          isSyncing: false,
        }));
      }
    }
  }, []);

  // Live Sync execution
  const handleLiveSync = async (apiUrl: string, showToastOnSuccess = true) => {
    if (!apiUrl) {
      addToast(
        'info',
        'Standalone Local Mode',
        'The spreadsheet is disconnected. Inventory and checkouts operate standalone on local device storage.'
      );
      return;
    }

    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const data = await fetchLiveInventory(apiUrl);
      if (data.inventory && data.inventory.length > 0) {
        setItems(data.inventory);
        saveCachedInventory(data.inventory);
      }

      if (data.logs && data.logs.length > 0) {
        setLogs((prevLogs) => {
          const map = new Map<string, AuditLog>();
          prevLogs.forEach((l) => {
            const key = `${l.timestamp}_${l.itemId}_${l.action}`;
            map.set(key, l);
          });
          data.logs.forEach((l) => {
            const key = `${l.timestamp}_${l.itemId}_${l.action}`;
            map.set(key, l);
          });
          const merged = Array.from(map.values()).sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime() || 0;
            const timeB = new Date(b.timestamp).getTime() || 0;
            return timeB - timeA;
          });
          saveCachedLogs(merged);
          return merged;
        });
      }

      const now = new Date();
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSynced: now,
        error: null,
        mode: 'live',
      }));

      if (showToastOnSuccess) {
        addToast(
          'success',
          'Google Sheet Synced',
          `Successfully refreshed ${data.inventory.length} items from live spreadsheet.`
        );
      }
    } catch (err: any) {
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: err.message,
      }));
      addToast('error', 'Sync Failed', err.message);
    }
  };

  // Sync on initial mount if URL exists
  useEffect(() => {
    if (syncStatus.url) {
      handleLiveSync(syncStatus.url, false);
    }
  }, []);

  // URL save from Settings Modal
  const handleSaveApiUrl = async (newUrl: string) => {
    saveStoredApiUrl(newUrl);
    setSyncStatus((prev) => ({ ...prev, url: newUrl, mode: newUrl ? 'live' : 'mock' }));
    if (newUrl) {
      await handleLiveSync(newUrl, true);
    } else {
      addToast('info', 'Disconnected from Google Sheet', 'Switched back to standalone local inventory storage.');
    }
  };

  // Disconnect spreadsheet action
  const handleDisconnectSpreadsheet = () => {
    disconnectSpreadsheet();
    setSyncStatus((prev) => ({
      ...prev,
      url: '',
      mode: 'mock',
      error: null,
      isSyncing: false,
    }));
    addToast(
      'success',
      'Spreadsheet Disconnected',
      'The website is now disconnected from Google Sheets and operating completely in standalone local inventory mode.'
    );
  };

  // Admin access handlers
  const handleOpenAdminUnlock = () => {
    setIsAdminUnlockModalOpen(true);
  };

  const handleUnlockAdminSuccess = () => {
    setAdminSettings((prev) => ({ ...prev, isUnlocked: true }));
    addToast(
      'success',
      'Admin Privileges Unlocked',
      'You now have full access to spreadsheet API settings, data reset, and admin functions.'
    );
  };

  const handleLockAdmin = () => {
    setAdminSettings((prev) => ({ ...prev, isUnlocked: false }));
    addToast(
      'info',
      'Member Mode Active',
      'Admin privileges locked. Regular checkout and check-in station active.'
    );
  };

  const handleOpenSettingsProtected = () => {
    if (!adminSettings.isUnlocked) {
      setIsAdminUnlockModalOpen(true);
      addToast(
        'info',
        'Admin Access Required',
        'Please enter the Admin PIN or an authorized admin email to access settings.'
      );
    } else {
      setIsSettingsModalOpen(true);
    }
  };

  // Check In / Check Out submission
  const handleSubmitAction = async (payload: {
    action: 'Check Out' | 'Check In';
    itemId: string;
    team: string;
    notes: string;
    email: string;
    category?: string;
  }) => {
    const isOut = payload.action === 'Check Out';
    const normalizedId = normalizeItemId(payload.itemId);
    const targetClean = normalizedId.toUpperCase();
    const targetCleanNoDash = targetClean.replace(/[-\s]/g, '');

    // Find matched item
    const matchedItem = items.find((i) => {
      const curClean = normalizeItemId(i.itemId).toUpperCase();
      const curNoDash = curClean.replace(/[-\s]/g, '');
      return curClean === targetClean || curNoDash === targetCleanNoDash;
    });

    // 1. Add entry to audit logs
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      itemId: normalizedId,
      itemName: matchedItem?.itemName || `${payload.category || 'Component'} #${normalizedId}`,
      action: payload.action,
      team: payload.team,
      notes: payload.notes || (isOut ? 'Checked out' : 'Returned'),
      userEmail: payload.email,
      category: matchedItem?.category || payload.category,
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveCachedLogs(updatedLogs);

    // 2. Update local items state so checkouts/returns immediately reflect across all tabs
    setItems((prevItems) => {
      const idx = prevItems.findIndex((item) => {
        const curClean = normalizeItemId(item.itemId).toUpperCase();
        const curNoDash = curClean.replace(/[-\s]/g, '');
        return curClean === targetClean || curNoDash === targetCleanNoDash;
      });

      const nowStr = new Date().toISOString().split('T')[0];
      if (idx >= 0) {
        const next = [...prevItems];
        const cur = next[idx];
        if (payload.action === 'Check Out') {
          next[idx] = {
            ...cur,
            status: 'Checked Out',
            currentUser: payload.team,
            dateOut: nowStr,
            notes: payload.notes || 'Checked out',
            timesCheckedOut: (cur.timesCheckedOut || 0) + 1,
            location: `With Team ${payload.team}`,
          };
        } else {
          next[idx] = {
            ...cur,
            status: 'Available',
            currentUser: '',
            dateOut: '',
            notes: payload.notes || 'Returned',
            location: getCategoryDefaultLocation(cur.category),
          };
        }
        saveCachedInventory(next);
        return next;
      } else {
        const cat = (payload.category as VexCategory) || classifyVexCategory(undefined, undefined, normalizedId);
        const newItem: InventoryItem = {
          itemId: normalizedId,
          itemName: `${cat} #${normalizedId}`,
          category: cat,
          status: payload.action === 'Check Out' ? 'Checked Out' : 'Available',
          currentUser: payload.action === 'Check Out' ? payload.team : '',
          dateOut: payload.action === 'Check Out' ? nowStr : '',
          notes: payload.notes || (payload.action === 'Check Out' ? 'Checked out' : 'Returned'),
          timesCheckedOut: 1,
          location: payload.action === 'Check Out' ? `With Team ${payload.team}` : getCategoryDefaultLocation(cat),
        };
        const next = [newItem, ...prevItems];
        saveCachedInventory(next);
        return next;
      }
    });

    // 3. Post record to Google Apps Script only if live connected
    if (syncStatus.url) {
      try {
        await postInventoryAction(syncStatus.url, payload);
        addToast(
          'success',
          'Logged to Google Sheet',
          `Added ${payload.action} for ${normalizedId} to live spreadsheet.`
        );
        handleLiveSync(syncStatus.url, false);
      } catch (err: any) {
        addToast(
          'error',
          'Google Sheet Notice',
          `Log saved locally, but Google Sheet returned: ${err.message}`
        );
      }
    } else {
      addToast(
        'success',
        payload.action === 'Check Out' ? 'Checked Out' : 'Returned',
        `Recorded ${payload.action} of ${normalizedId} for Team ${payload.team}.`
      );
    }
  };

  // Fast single return from Team view (Admin only)
  const handleReturnItem = async (item: InventoryItem) => {
    if (!adminSettings.isUnlocked) {
      handleOpenAdminUnlock();
      addToast('info', 'Admin Access Required', 'Quick return is only available to admins. Regular members must use Check Out / Check In with email and notes.');
      return;
    }

    await handleSubmitAction({
      action: 'Check In',
      itemId: item.itemId,
      team: item.currentUser,
      notes: 'Returned by Admin from Team Hardware Lookup',
      email: adminSettings.adminEmails[0] || 'admin@vex.club',
      category: item.category,
    });
  };

  // Batch return all items for a team (Admin only)
  const handleReturnAllForTeam = async (team: string, itemsToReturn: InventoryItem[]) => {
    if (!adminSettings.isUnlocked) {
      handleOpenAdminUnlock();
      addToast('info', 'Admin Access Required', 'Batch returns require admin authorization.');
      return;
    }

    if (itemsToReturn.length === 0) return;

    for (const item of itemsToReturn) {
      await handleSubmitAction({
        action: 'Check In',
        itemId: item.itemId,
        team,
        notes: `Batch return for Team ${team}`,
        email: adminSettings.adminEmails[0] || 'admin@vex.club',
        category: item.category,
      });
    }

    addToast('success', 'Batch Return Complete', `Returned ${itemsToReturn.length} items from Team ${team}.`);
  };

  // Batch action from Inventory Browser
  const handleBatchInventoryAction = async (
    selected: InventoryItem[],
    action: 'Check Out' | 'Check In'
  ) => {
    if (!adminSettings.isUnlocked) {
      handleOpenAdminUnlock();
      addToast('info', 'Admin Access Required', 'Bulk inventory changes require admin authorization.');
      return;
    }

    for (const item of selected) {
      await handleSubmitAction({
        action,
        itemId: item.itemId,
        team: action === 'Check Out' ? selectedTeam || clubProfile.teams[0] || '654V' : item.currentUser,
        notes: `Bulk ${action}`,
        email: adminSettings.adminEmails[0] || 'admin@vex.club',
        category: item.category,
      });
    }
    addToast('success', 'Batch Operation Completed', `${selected.length} items processed.`);
  };

  // Factory reset (admin protected)
  const handleResetFactoryData = () => {
    if (!adminSettings.isUnlocked) {
      handleOpenAdminUnlock();
      addToast('info', 'Admin Access Required', 'Resetting benchmark data requires admin authorization.');
      return;
    }

    const factory = generateDefaultInventory();
    setItems(factory);
    saveCachedInventory(factory);
    setLogs(INITIAL_LOGS);
    saveCachedLogs(INITIAL_LOGS);
    addToast('info', 'Inventory Reset', 'Restored original 279 items: 238 Available, 41 Checked Out.');
  };

  // Multi-school backup import & preset reset handlers
  const handleImportFullBackup = (data: { profile?: ClubProfile; adminSettings?: AdminSettings; items?: InventoryItem[]; logs?: AuditLog[] }) => {
    if (data.profile) {
      setClubProfile(data.profile);
    }
    if (data.adminSettings) {
      setAdminSettings(data.adminSettings);
    }
    if (data.items && data.items.length > 0) {
      setItems(data.items);
      saveCachedInventory(data.items);
    }
    if (data.logs && data.logs.length > 0) {
      setLogs(data.logs);
      saveCachedLogs(data.logs);
    }
    addToast('success', 'Backup Restored', 'All school profiles, PINs, inventory items, and logs loaded successfully.');
  };

  const handleResetAllItemsToAvailable = () => {
    setItems((prev) => {
      const allAvailable = prev.map((item) => ({
        ...item,
        status: 'Available' as const,
        currentUser: '',
        dateOut: '',
        notes: 'Ready in storage',
        location: getCategoryDefaultLocation(item.category),
      }));
      saveCachedInventory(allAvailable);
      return allAvailable;
    });
    addToast(
      'success',
      'All Items Checked In',
      'All 279 catalog parts are now Available in their designated storage cabinets.'
    );
  };

  const handleResetToTemplate = (presetKey: 'lake_travis' | 'generic' | 'fresh_starter' | 'random_stock') => {
    if (presetKey === 'random_stock') {
      const fresh = generateRandomInventory({ presetSize: 'standard', clubTeams: clubProfile.teams });
      setItems(fresh);
      saveCachedInventory(fresh);
      addToast('success', 'Random Stock Generated', `Loaded fresh randomized inventory with ${fresh.length} hardware items.`);
    } else if (presetKey === 'lake_travis') {
      setClubProfile(DEFAULT_CLUB_PROFILE);
      const fresh = generateDefaultInventory();
      setItems(fresh);
      saveCachedInventory(fresh);
      setLogs(INITIAL_LOGS);
      saveCachedLogs(INITIAL_LOGS);
      addToast('success', 'Preset Loaded', 'Switched to Lake Travis 654 benchmark template.');
    } else if (presetKey === 'generic') {
      const genericProfile: ClubProfile = {
        schoolName: 'Sample High School Robotics',
        shortName: 'Sample Robotics',
        clubNumber: '1234',
        teams: ['1234A', '1234B', '1234C', '1234D', '1234E', '1234V'],
        logoUrl: '',
        isCustomized: true,
      };
      setClubProfile(genericProfile);
      const fresh = generateRandomInventory({ presetSize: 'standard', clubTeams: genericProfile.teams });
      setItems(fresh);
      saveCachedInventory(fresh);
      setLogs([]);
      saveCachedLogs([]);
      addToast('success', 'Preset Loaded', 'Switched to Sample High School Robotics 1234.');
    } else {
      const freshProfile: ClubProfile = {
        schoolName: 'My School Robotics',
        shortName: 'Robotics Club',
        clubNumber: '101',
        teams: ['101A', '101B', '101V'],
        logoUrl: '',
        isCustomized: true,
      };
      setClubProfile(freshProfile);
      const fresh = generateRandomInventory({ presetSize: 'small', clubTeams: freshProfile.teams });
      const clean = fresh.map((i) => ({
        ...i,
        status: 'Available' as const,
        currentUser: '',
        dateOut: '',
        notes: 'Ready in storage',
      }));
      setItems(clean);
      saveCachedInventory(clean);
      setLogs([]);
      saveCachedLogs([]);
      addToast('success', 'Clean Slate Loaded', 'Initialized fresh inventory ready for your team.');
    }
  };

  // Navigation callbacks
  const handleNavigateToCategory = (cat: VexCategory | 'All') => {
    setSelectedCategory(cat);
    setActiveTab('inventory');
  };

  const handleNavigateToTeam = (team: string) => {
    setSelectedTeam(team);
    setActiveTab('teams');
  };

  const handleOpenCheckoutModal = (
    item?: InventoryItem,
    defaultAction: 'Check Out' | 'Check In' = 'Check Out',
    presetTeam?: string
  ) => {
    setCheckoutTargetItem(item);
    setCheckoutDefaultAction(defaultAction);
    setCheckoutPresetTeam(presetTeam || clubProfile.teams[0] || '654V');
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-zinc-100 flex flex-col font-sans selection:bg-zinc-700 selection:text-zinc-100">
      {/* Top Header: Specialized Mobile Header or Desktop Header */}
      {isMobile ? (
        <MobileTopHeader
          syncStatus={syncStatus}
          adminSettings={adminSettings}
          clubProfile={clubProfile}
          onOpenSettings={handleOpenSettingsProtected}
          onSyncNow={() => handleLiveSync(syncStatus.url, true)}
          onOpenAdminUnlock={handleOpenAdminUnlock}
          onLockAdmin={handleLockAdmin}
          onOpenSchoolCustomizer={() => handleOpenSchoolCustomizer('customize')}
          onOpenManual={() => setActiveTab('manual')}
          isMobileModeForced={viewMode === 'mobile'}
          onToggleViewMode={handleToggleViewMode}
          onOpenAssetsModal={() => setIsAssetsModalOpen(true)}
        />
      ) : (
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          syncStatus={syncStatus}
          adminSettings={adminSettings}
          clubProfile={clubProfile}
          onOpenSettings={handleOpenSettingsProtected}
          onOpenCheckout={() => handleOpenCheckoutModal()}
          onSyncNow={() => handleLiveSync(syncStatus.url, true)}
          onOpenAdminUnlock={handleOpenAdminUnlock}
          onLockAdmin={handleLockAdmin}
          onOpenSchoolCustomizer={() => handleOpenSchoolCustomizer('customize')}
          onOpenStockCustomizer={() => handleOpenSchoolCustomizer('parts_stock')}
          onToggleViewMode={handleToggleViewMode}
          onOpenAssetsModal={() => setIsAssetsModalOpen(true)}
        />
      )}

      {/* Main Container Viewport */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 ${isMobile ? 'pb-24' : ''}`}>
        {activeTab === 'dashboard' && (
          <CommandCenter
            items={items}
            logs={logs}
            isAdmin={adminSettings.isUnlocked}
            onOpenAdminUnlock={handleOpenAdminUnlock}
            onNavigateToCategory={handleNavigateToCategory}
            onNavigateToTeam={handleNavigateToTeam}
            onNavigateTab={setActiveTab}
            onOpenCheckout={(item) => handleOpenCheckoutModal(item, 'Check Out')}
            clubProfile={clubProfile}
            onOpenSchoolCustomizer={() => handleOpenSchoolCustomizer('customize')}
            onOpenStockCustomizer={() => handleOpenSchoolCustomizer('parts_stock')}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryBrowser
            items={items}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onOpenCheckout={(item, action) => handleOpenCheckoutModal(item, action || 'Check Out')}
            onBatchAction={handleBatchInventoryAction}
            isAdmin={adminSettings.isUnlocked}
            onOpenAdminUnlock={handleOpenAdminUnlock}
            isMobileMode={isMobile}
            clubProfile={clubProfile}
            onOpenStockCustomizer={() => handleOpenSchoolCustomizer('parts_stock')}
            onUpdateItems={setItems}
            customPartKinds={customPartKinds}
            onUpdateCustomPartKinds={setCustomPartKinds}
            onAddToast={addToast}
          />
        )}

        {activeTab === 'teams' && (
          <TeamLookup
            items={items}
            selectedTeam={selectedTeam}
            onSelectTeam={setSelectedTeam}
            onOpenCheckout={(item, action, team) =>
              handleOpenCheckoutModal(item, action || 'Check Out', team || selectedTeam)
            }
            onReturnItem={handleReturnItem}
            onReturnAllForTeam={handleReturnAllForTeam}
            isAdmin={adminSettings.isUnlocked}
            onOpenAdminUnlock={handleOpenAdminUnlock}
            clubProfile={clubProfile}
          />
        )}

        {activeTab === 'packlist' && <CompetitionPackList items={items} />}

        {activeTab === 'logs' && <ActivityLogs logs={logs} />}

        {activeTab === 'manual' && (
          <InstructionManual
            clubProfile={clubProfile}
            onOpenSchoolCustomizer={() => setIsSchoolCustomizerOpen(true)}
            onOpenAssetsModal={() => setIsAssetsModalOpen(true)}
            onOpenCheckout={() => handleOpenCheckoutModal()}
            onOpenSettings={handleOpenSettingsProtected}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Nav (Natural thumb zone) */}
      {isMobile && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCheckout={() => handleOpenCheckoutModal()}
          availableCount={items.filter((i) => i.status === 'Available').length}
          totalCount={items.length}
          adminSettings={adminSettings}
          onOpenAdminUnlock={handleOpenAdminUnlock}
          onOpenAssetsModal={() => setIsAssetsModalOpen(true)}
        />
      )}

      {/* Footer */}
      <footer className={`mt-auto border-t border-zinc-900 bg-zinc-950/80 py-4 text-xs text-zinc-500 ${isMobile ? 'pb-24' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-semibold text-zinc-300">{clubProfile.schoolName}</span>
            <span>·</span>
            <span>{items.length} Items</span>
            <span>·</span>
            <span className="font-mono text-zinc-400">
              Teams: {clubProfile.teams.join(', ')}
            </span>
            <span>·</span>
            <span className="text-zinc-400">
              Created by <span className="font-semibold text-zinc-200">Trishanth Yakkala</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400 shrink-0 flex-wrap justify-center">
            <button
              onClick={() => setIsSchoolCustomizerOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors underline"
            >
              Customize / Clone for Your School
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className="text-zinc-200 hover:text-white font-medium transition-colors underline"
            >
              Instruction Manual
            </button>
            <span>·</span>
            <button
              onClick={() => setIsAssetsModalOpen(true)}
              className="hover:text-zinc-200 transition-colors underline"
            >
              Logos &amp; QR Badges
            </button>
            <span>·</span>
            <button
              onClick={handleToggleViewMode}
              className="hover:text-blue-300 transition-colors"
            >
              {isMobile ? 'Switch to Desktop UI' : 'Switch to Phone UI'}
            </button>
            <span>·</span>
            <button
              onClick={handleOpenSettingsProtected}
              className="hover:text-zinc-200 transition-colors"
            >
              Spreadsheet &amp; Admin Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Check In / Out Action Modal */}
      <CheckInOutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        items={items}
        preselectedItem={checkoutTargetItem}
        defaultAction={checkoutDefaultAction}
        presetTeam={checkoutPresetTeam}
        defaultEmail=""
        clubProfile={clubProfile}
        onSubmit={handleSubmitAction}
      />

      {/* Settings / API Modal (Admin only) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        syncStatus={syncStatus}
        onSaveUrl={handleSaveApiUrl}
        onDisconnectSpreadsheet={handleDisconnectSpreadsheet}
        onResetFactoryData={handleResetFactoryData}
        adminSettings={adminSettings}
        onUpdateAdminSettings={setAdminSettings}
        onOpenSchoolCustomizer={() => {
          setIsSettingsModalOpen(false);
          setIsSchoolCustomizerOpen(true);
        }}
      />

      {/* Admin Unlock Modal */}
      <AdminUnlockModal
        isOpen={isAdminUnlockModalOpen}
        onClose={() => setIsAdminUnlockModalOpen(false)}
        adminSettings={adminSettings}
        onUnlockSuccess={handleUnlockAdminSuccess}
      />

      {/* School Customizer & Cloning Guide Modal */}
      <SchoolCustomizerModal
        isOpen={isSchoolCustomizerOpen}
        onClose={() => setIsSchoolCustomizerOpen(false)}
        clubProfile={clubProfile}
        onUpdateClubProfile={setClubProfile}
        items={items}
        onUpdateItems={setItems}
        logs={logs}
        adminSettings={adminSettings}
        onUpdateAdminSettings={setAdminSettings}
        onResetAllItemsToAvailable={handleResetAllItemsToAvailable}
        onImportFullBackup={handleImportFullBackup}
        onResetToTemplate={handleResetToTemplate}
        onAddToast={addToast}
        customPartKinds={customPartKinds}
        onUpdateCustomPartKinds={setCustomPartKinds}
        initialTab={schoolCustomizerTab}
      />

      {/* Club Assets & QR Badges Download Modal */}
      <ClubAssetsModal
        isOpen={isAssetsModalOpen}
        onClose={() => setIsAssetsModalOpen(false)}
        clubProfile={clubProfile}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
