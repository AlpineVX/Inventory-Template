import React from 'react';
import {
  RefreshCw,
  Settings,
  Lock,
  ShieldCheck,
  Smartphone,
  Monitor,
  Download,
  Sparkles,
  School,
  BookOpen,
} from 'lucide-react';
import { SyncStatus, AdminSettings, ClubProfile } from '../types';

interface MobileTopHeaderProps {
  syncStatus: SyncStatus;
  adminSettings: AdminSettings;
  clubProfile: ClubProfile;
  onOpenSettings: () => void;
  onSyncNow: () => void;
  onOpenAdminUnlock: () => void;
  onLockAdmin: () => void;
  onOpenSchoolCustomizer: () => void;
  onOpenManual?: () => void;
  isMobileModeForced: boolean;
  onToggleViewMode: () => void;
  onOpenAssetsModal?: () => void;
}

export const MobileTopHeader: React.FC<MobileTopHeaderProps> = ({
  syncStatus,
  adminSettings,
  clubProfile,
  onOpenSettings,
  onSyncNow,
  onOpenAdminUnlock,
  onLockAdmin,
  onOpenSchoolCustomizer,
  onOpenManual,
  isMobileModeForced,
  onToggleViewMode,
  onOpenAssetsModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 h-13 px-3 flex items-center justify-between">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenSchoolCustomizer}
          title="Customize School Profile"
          className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 overflow-hidden shrink-0 hover:border-zinc-700 transition-colors"
        >
          {clubProfile.logoUrl ? (
            <img
              src={clubProfile.logoUrl}
              alt="Logo"
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <School className="w-4 h-4 text-indigo-400" />
          )}
        </button>
        <div className="min-w-0">
          <h1 className="text-sm font-bold tracking-tight text-zinc-100 truncate flex items-center gap-1.5">
            <span className="truncate">{clubProfile.shortName || 'VEX Inv'}</span>
            <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded shrink-0">
              {clubProfile.clubNumber || 'VEX'}
            </span>
          </h1>
          <p className="text-[10px] text-zinc-400 truncate leading-none mt-0.5">
            By Trishanth Yakkala
          </p>
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Instruction Manual */}
        {onOpenManual && (
          <button
            onClick={onOpenManual}
            title="Instruction Manual & Setup Guide"
            aria-label="Instruction Manual"
            className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 rounded-lg active:scale-95 transition-transform"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Customize school / clone modal */}
        <button
          onClick={onOpenSchoolCustomizer}
          title="Customize School / Clone Template"
          aria-label="Customize School"
          className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 rounded-lg active:scale-95 transition-transform"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>

        {/* Sync status */}
        <button
          onClick={onSyncNow}
          disabled={syncStatus.isSyncing}
          title={syncStatus.url ? 'Sync with Google Sheet' : 'Spreadsheet Disconnected (Standalone Local Mode)'}
          aria-label="Sync status"
          className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg active:scale-95 transition-transform relative"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin text-white' : ''}`} />
          <span
            className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
              syncStatus.url ? 'bg-emerald-500' : 'bg-zinc-600'
            }`}
          />
        </button>

        {/* Admin status / login */}
        {adminSettings.isUnlocked ? (
          <button
            onClick={onLockAdmin}
            title="Admin Unlocked (Tap to lock)"
            className="flex items-center gap-1 px-2 py-1 min-h-[36px] bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Admin</span>
          </button>
        ) : (
          <button
            onClick={onOpenAdminUnlock}
            title="Admin Login"
            aria-label="Admin Login"
            className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg active:scale-95 transition-transform"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        )}

        {/* View mode toggle button */}
        <button
          onClick={onToggleViewMode}
          title={isMobileModeForced ? 'Switch to Desktop Layout' : 'Switch to Dedicated Mobile Layout'}
          className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg active:scale-95 transition-transform"
        >
          {isMobileModeForced ? (
            <Monitor className="w-3.5 h-3.5 text-zinc-300" />
          ) : (
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg active:scale-95 transition-transform relative"
        >
          <Settings className="w-3.5 h-3.5" />
          {syncStatus.url && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
};
