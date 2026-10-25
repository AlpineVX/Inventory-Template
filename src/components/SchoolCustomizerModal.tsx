import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  School,
  Sparkles,
  Share2,
  Copy,
  Check,
  Download,
  Upload,
  Plus,
  Trash2,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Laptop,
  Globe,
  Database,
  ArrowRight,
  KeyRound,
  Mail,
  Boxes,
} from 'lucide-react';
import { ClubProfile, DEFAULT_CLUB_PROFILE, InventoryItem, AuditLog, AdminSettings } from '../types';

interface SchoolCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubProfile: ClubProfile;
  onUpdateClubProfile: (profile: ClubProfile) => void;
  items: InventoryItem[];
  logs: AuditLog[];
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  onResetAllItemsToAvailable: () => void;
  onImportFullBackup: (data: { profile?: ClubProfile; adminSettings?: AdminSettings; items?: InventoryItem[]; logs?: AuditLog[] }) => void;
  onResetToTemplate: (presetKey: 'lake_travis' | 'generic' | 'fresh_starter') => void;
  onAddToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

const PRESET_SCHOOLS: {
  key: 'lake_travis' | 'generic' | 'fresh_starter';
  title: string;
  number: string;
  desc: string;
}[] = [
  {
    key: 'lake_travis',
    title: 'Lake Travis High School',
    number: '654',
    desc: '11 teams (654A, B, G, J, K, T, V, X, Y, Z, RECF) with preloaded 279-part VEX catalog.',
  },
  {
    key: 'generic',
    title: 'Sample High School Robotics',
    number: '1234',
    desc: 'Teams 1234A through 1234G with clean sample catalog.',
  },
  {
    key: 'fresh_starter',
    title: 'Clean Blank Slate',
    number: '101',
    desc: 'Start fresh for your own team with all 279 parts marked Available in storage.',
  },
];

export const SchoolCustomizerModal: React.FC<SchoolCustomizerModalProps> = ({
  isOpen,
  onClose,
  clubProfile,
  onUpdateClubProfile,
  items,
  logs,
  adminSettings,
  onUpdateAdminSettings,
  onResetAllItemsToAvailable,
  onImportFullBackup,
  onResetToTemplate,
  onAddToast,
}) => {
  const [activeTab, setActiveTab] = useState<'customize' | 'clone_guide' | 'backup'>('customize');
  const [formProfile, setFormProfile] = useState<ClubProfile>(clubProfile);
  const [formAdminPin, setFormAdminPin] = useState<string>(adminSettings.adminPin);
  const [formAdminEmail, setFormAdminEmail] = useState<string>(adminSettings.adminEmails[0] || '');
  const [newTeamName, setNewTeamName] = useState('');
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setFormProfile(clubProfile);
      setFormAdminPin(adminSettings.adminPin);
      setFormAdminEmail(adminSettings.adminEmails[0] || '');
    }
  }, [clubProfile, adminSettings, isOpen]);

  if (!isOpen) return null;

  // Handle saving profile & admin changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = formProfile.clubNumber.trim().toUpperCase() || '654';
    const cleanSchool = formProfile.schoolName.trim() || 'Robotics Club';
    const cleanShort = formProfile.shortName.trim() || cleanSchool;

    const updated: ClubProfile = {
      ...formProfile,
      clubNumber: cleanNumber,
      schoolName: cleanSchool,
      shortName: cleanShort,
      isCustomized: true,
    };

    onUpdateClubProfile(updated);

    // Save Admin PIN & Email if changed
    const cleanPin = formAdminPin.trim();
    const cleanEmail = formAdminEmail.trim().toLowerCase();
    if (cleanPin.length >= 3) {
      const updatedEmails = cleanEmail
        ? Array.from(new Set([cleanEmail, ...adminSettings.adminEmails]))
        : adminSettings.adminEmails;

      onUpdateAdminSettings({
        ...adminSettings,
        adminPin: cleanPin,
        adminEmails: updatedEmails,
      });
    }

    onAddToast(
      'success',
      'Team & School Profile Updated',
      `Configured "${cleanSchool}" (Team ${cleanNumber}) with ${updated.teams.length} sub-teams.`
    );
    onClose();
  };

  // Add individual team
  const handleAddTeam = () => {
    const raw = newTeamName.trim().toUpperCase();
    if (!raw) return;
    if (formProfile.teams.includes(raw)) {
      onAddToast('info', 'Team Exists', `${raw} is already in your team roster.`);
      return;
    }
    setFormProfile((prev) => ({
      ...prev,
      teams: [...prev.teams, raw],
    }));
    setNewTeamName('');
  };

  // Remove individual team
  const handleRemoveTeam = (teamToRemove: string) => {
    if (formProfile.teams.length <= 1) {
      onAddToast('error', 'Minimum Teams', 'Keep at least one team in your roster.');
      return;
    }
    setFormProfile((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t !== teamToRemove),
    }));
  };

  // Quick generator for standard sub-teams (e.g. 1234A, 1234B, etc.)
  const handleGenerateStandardTeams = () => {
    const num = formProfile.clubNumber.trim() || '1234';
    const letters = ['A', 'B', 'C', 'D', 'E', 'V', 'X'];
    const generated = letters.map((l) => `${num}${l}`);
    setFormProfile((prev) => ({
      ...prev,
      teams: Array.from(new Set([...prev.teams, ...generated])),
    }));
    onAddToast('success', 'Teams Generated', `Added standard letter divisions for Team ${num}`);
  };

  // Handle custom logo image file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onAddToast('error', 'Invalid File', 'Please upload an image file (PNG, JPG, SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      onAddToast('error', 'File Too Large', 'Please upload a logo image smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormProfile((prev) => ({
          ...prev,
          logoUrl: dataUrl,
        }));
        onAddToast('success', 'Logo Uploaded', 'New school logo loaded into preview.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Export full JSON package
  const handleExportJson = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      generator: 'VEX Robotics Inventory Control — Open Template',
      profile: formProfile,
      adminSettings,
      items,
      logs,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formProfile.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_VEX_Inventory_Setup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onAddToast('success', 'Backup Exported', 'Full school setup, PIN, and inventory catalog downloaded.');
  };

  // Import JSON package
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || (!parsed.items && !parsed.profile)) {
          throw new Error('Invalid inventory backup file structure.');
        }

        onImportFullBackup({
          profile: parsed.profile,
          adminSettings: parsed.adminSettings,
          items: parsed.items,
          logs: parsed.logs,
        });

        if (parsed.profile) {
          setFormProfile(parsed.profile);
        }

        onAddToast('success', 'Import Successful', 'Restored custom school configuration and inventory items.');
        onClose();
      } catch (err: any) {
        onAddToast('error', 'Import Failed', err.message || 'Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Copy current share link
  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : 'https://aistudio.google.com';
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
    onAddToast('info', 'Link Copied', 'App URL copied to clipboard for sharing with other teams.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Make It Your Own — School &amp; Team Setup</span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Easily adapt this website for any school, robotics team, or club
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-zinc-800 flex items-center gap-4 text-xs font-medium bg-zinc-950/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('customize')}
            className={`pb-2.5 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'customize'
                ? 'text-white border-b-2 border-indigo-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Customize School Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('clone_guide')}
            className={`pb-2.5 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'clone_guide'
                ? 'text-white border-b-2 border-indigo-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>How Any Team Can Copy This</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'text-white border-b-2 border-indigo-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Export &amp; Import Setup (.json)</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-zinc-300">
          {/* TAB 1: CUSTOMIZE */}
          {activeTab === 'customize' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Live Preview Banner */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    {formProfile.logoUrl ? (
                      <img
                        src={formProfile.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <School className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-semibold">
                      Live Preview
                    </div>
                    <div className="text-sm font-bold text-white truncate">
                      {formProfile.schoolName || 'Your School Name'}
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-zinc-300 font-semibold">
                        Team {formProfile.clubNumber || '1234'}
                      </span>
                      <span>·</span>
                      <span>{formProfile.teams.length} Active Teams</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium border border-zinc-700 transition-colors flex items-center gap-1.5">
                    <Upload className="w-3 h-3" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {formProfile.logoUrl && formProfile.logoUrl !== DEFAULT_CLUB_PROFILE.logoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormProfile((prev) => ({
                          ...prev,
                          logoUrl: DEFAULT_CLUB_PROFILE.logoUrl,
                        }))
                      }
                      title="Reset to default logo"
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* School Name & Club Number Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-zinc-200">
                    Full School / Club Name
                  </label>
                  <input
                    type="text"
                    value={formProfile.schoolName}
                    onChange={(e) =>
                      setFormProfile((prev) => ({ ...prev, schoolName: e.target.value }))
                    }
                    placeholder="e.g. Westlake High School Robotics"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-400 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-200">
                    VEX Club Number
                  </label>
                  <input
                    type="text"
                    value={formProfile.clubNumber}
                    onChange={(e) =>
                      setFormProfile((prev) => ({
                        ...prev,
                        clubNumber: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. 654 or 1234"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-400 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-200">
                  Header Display Name (Short Wordmark)
                </label>
                <input
                  type="text"
                  value={formProfile.shortName}
                  onChange={(e) =>
                    setFormProfile((prev) => ({ ...prev, shortName: e.target.value }))
                  }
                  placeholder="e.g. Westlake Robotics or WHS Robotics"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-400 text-xs"
                />
              </div>

              {/* Sub-Teams Manager */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-zinc-200">
                      Active Sub-Teams &amp; Letters ({formProfile.teams.length})
                    </label>
                    <p className="text-[11px] text-zinc-400">
                      These appear in the checkout dropdown and team inventory lookup
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateStandardTeams}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate A-G</span>
                  </button>
                </div>

                {/* Team Badges Grid */}
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                  {formProfile.teams.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-xs font-semibold group"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeam(t)}
                        title={`Remove ${t}`}
                        className="text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Custom Team Input */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTeam();
                      }
                    }}
                    placeholder={`e.g. ${formProfile.clubNumber || '1234'}W or Mentor`}
                    className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-400 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTeam}
                    disabled={!newTeamName.trim()}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Team</span>
                  </button>
                </div>
              </div>

              {/* Security & Admin PIN customization */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Security &amp; PIN</span>
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    Controls access to Settings, data reset, and spreadsheet configuration.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Admin Security PIN
                    </label>
                    <input
                      type="text"
                      value={formAdminPin}
                      onChange={(e) => setFormAdminPin(e.target.value)}
                      placeholder="e.g. 654 or 1234"
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Coach / Lead Admin Email
                    </label>
                    <input
                      type="email"
                      value={formAdminEmail}
                      onChange={(e) => setFormAdminEmail(e.target.value)}
                      placeholder="coach@school.edu"
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Clean Storage Option */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    Start of Season: Check In All Parts
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Marks all 279 catalog items as Available in storage cabinets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Check in all 279 items so everything is Available in cabinets?')) {
                      onResetAllItemsToAvailable();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Check In All Parts</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFormProfile(DEFAULT_CLUB_PROFILE)}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 underline"
                >
                  Reset to Default Preset
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-indigo-400 hover:bg-indigo-300 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to Website</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: CLONE & DEPLOY GUIDE */}
          {activeTab === 'clone_guide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                  <Share2 className="w-4 h-4" />
                  <span>How Any Team Can Copy This</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  This entire inventory system is designed as a standalone, zero-dependency web application.
                  Another team does <strong className="text-white">not</strong> need to write code or set up complex databases. Here is how they can create their own instance:
                </p>
              </div>

              {/* Option 1: AI Studio Remix */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-[11px]">
                      1
                    </span>
                    <span>Option 1: 1-Click Fork in Google AI Studio (Easiest)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    Instant Live URL
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Share this web app's URL with the other team. When they open it in Google AI Studio Build, they can click <strong className="text-zinc-200">"Remix"</strong> or <strong className="text-zinc-200">"Duplicate"</strong>. AI Studio will immediately deploy a private copy with its own unique URL hosted on Google Cloud.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShareLink ? 'Link Copied!' : 'Copy Website URL to Share'}</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Deploy to GitHub / Netlify / Vercel */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono text-[11px]">
                      2
                    </span>
                    <span>Option 2: Free 24/7 Hosting on Vercel or Netlify</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                    Custom Domain
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  The code is a standard React + Vite + Tailwind web app. Any school can push the repository to GitHub, link it to <strong className="text-zinc-200">Vercel</strong> or <strong className="text-zinc-200">Netlify</strong> (both 100% free for schools and clubs), and get a permanent URL like <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">team1234inventory.vercel.app</code>.
                </p>
              </div>

              {/* Option 3: Offline Tournament Laptop */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-[11px]">
                      3
                    </span>
                    <span>Option 3: Offline Pit Station (No Wi-Fi Needed)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                    Competition Pit Box
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Because the spreadsheet is disconnected and the app stores everything in browser local storage, any team can run it right in their pit box on a laptop or tablet without needing arena Wi-Fi!
                </p>
              </div>

              {/* Option 4: Connect their own Google Sheet */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-[11px]">
                    4
                  </span>
                  <span>Option 4: Linking Their Own Google Sheet (Optional)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  If they want cloud sync with Google Sheets, they just go to <strong className="text-zinc-200">Settings &gt; Apps Script Backend Code</strong>, copy the single script, paste it into their own Google Sheet, and paste their deployment link.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP / EXPORT / IMPORT */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>1. Export Team Setup Package (.json)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Download a complete backup containing your school name, team numbers, custom logo, 279-item VEX catalog, and all current checkout records. You can send this file to other team mentors or keep it as a safety backup.
                </p>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Setup File (.json)</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>2. Import Team Setup Package (.json)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Upload a previously exported JSON package to immediately populate this website with your school's data, parts, and logs on a new computer.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-xs font-semibold cursor-pointer border border-zinc-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Select JSON File to Restore</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>3. Quick Starter Templates</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Select a starter preset to test or initialize the site:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESET_SCHOOLS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => {
                        if (confirm(`Switch to preset "${p.title}"?`)) {
                          onResetToTemplate(p.key);
                          onClose();
                        }
                      }}
                      className="p-3 text-left rounded-lg bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                    >
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300">
                        {p.title}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        Team {p.number}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 leading-tight">
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
