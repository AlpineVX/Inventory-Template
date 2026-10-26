import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Share2,
  Download,
  Upload,
  QrCode,
  Laptop,
  Smartphone,
  KeyRound,
  FileSpreadsheet,
  HelpCircle,
  ArrowRight,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { ClubProfile } from '../types';

interface InstructionManualProps {
  clubProfile: ClubProfile;
  onOpenSchoolCustomizer: () => void;
  onOpenAssetsModal: () => void;
  onOpenCheckout: () => void;
  onOpenSettings: () => void;
}

type ManualSection =
  | 'quickstart'
  | 'cloning'
  | 'customize'
  | 'daily_usage'
  | 'qr_setup'
  | 'backup'
  | 'google_sheets'
  | 'faq';

export const InstructionManual: React.FC<InstructionManualProps> = ({
  clubProfile,
  onOpenSchoolCustomizer,
  onOpenAssetsModal,
  onOpenCheckout,
  onOpenSettings,
}) => {
  const [activeSection, setActiveSection] = useState<ManualSection>('quickstart');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const sections: { id: ManualSection; label: string; icon: any }[] = [
    { id: 'quickstart', label: '1. 60-Second Quick Start', icon: Lightbulb },
    { id: 'cloning', label: '2. How to Copy This Site', icon: Share2 },
    { id: 'customize', label: '3. Setup Your School', icon: Sparkles },
    { id: 'daily_usage', label: '4. Daily Student Checkout Guide', icon: Package },
    { id: 'qr_setup', label: '5. Cabinet QR Code Setup', icon: QrCode },
    { id: 'backup', label: '6. Backups & Exporting', icon: Download },
    { id: 'google_sheets', label: '7. Google Sheets Sync (Optional)', icon: FileSpreadsheet },
    { id: 'faq', label: '8. FAQ & Troubleshooting', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-zinc-900 to-zinc-950 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-mono font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official VEX Inventory Manual</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Complete Beginner-Proof Instruction Manual
          </h1>
          <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
            Everything any robotics team, student, coach, or teacher needs to clone, customize, and operate this inventory system with zero technical hurdles.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSchoolCustomizer}
            className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-indigo-400 hover:bg-indigo-300 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customize My School Now</span>
          </button>
        </div>
      </div>

      {/* Manual Layout: Sidebar Nav + Main Content Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Index */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-2 md:sticky md:top-20 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Table of Contents
          </div>
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-all text-left font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-6 text-sm text-zinc-300">
          {/* SECTION 1: QUICK START */}
          {activeSection === 'quickstart' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <span>The 60-Second Quick Start Guide</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  If you just opened this website and want your team up and running right now:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-xs">
                      Click the "Customize / Clone" button in the top bar
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Or click the purple button right here:
                    </p>
                    <button
                      onClick={onOpenSchoolCustomizer}
                      className="mt-1 px-3 py-1 bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-bold text-xs rounded-md flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open Setup Wizard</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-xs">
                      Type your School Name &amp; VEX Team Number
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      For example: <strong>"Westlake Robotics"</strong> and <strong>"1234"</strong>. Then click <strong>"Auto-Generate A–G"</strong> to instantly create sub-teams 1234A, 1234B, etc.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-xs">
                      Click "Apply to Website"
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Done! The header, checkouts, team tabs, and inventory browser now reflect your school. All data saves automatically in your browser.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-white text-xs">
                      Print your Pit QR Code (Optional but highly recommended)
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Click <strong>"Logos &amp; QR Badges"</strong> in the top or bottom bar to download a real scannable QR code. Tape it onto your tool cabinet so students can scan and check parts out on their phones.
                    </p>
                    <button
                      onClick={onOpenAssetsModal}
                      className="mt-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-md flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View &amp; Download My QR Code</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: HOW TO COPY THIS SITE */}
          {activeSection === 'cloning' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-400" />
                  <span>How Any School Can Make Their Own Copy</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Want your own dedicated URL that belongs exclusively to your school? Choose any of these 3 easy methods:
                </p>
              </div>

              {/* Method A */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-indigo-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
                      A
                    </span>
                    <span>Method 1: 1-Click Remix in Google AI Studio (Instant Live Link)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-mono">
                    Zero Setup
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400 pl-2">
                  <li>Copy this website's link using the button below.</li>
                  <li>Open it in Google AI Studio Build.</li>
                  <li>Click <strong>"Remix"</strong> or <strong>"Duplicate"</strong> in the top corner.</li>
                  <li>AI Studio creates a private copy hosted 24/7 on Google Cloud with its own free web link!</li>
                </ol>
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied to Clipboard!' : 'Copy Website Link to Share'}</span>
                </button>
              </div>

              {/* Method B */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">
                      B
                    </span>
                    <span>Method 2: Free 24/7 Hosting on Vercel or Netlify</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded font-mono">
                    Permanent Club Domain
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The codebase is standard React + Vite + Tailwind with zero external server requirements.
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400 pl-2">
                  <li>Push this repository to your school club's GitHub account.</li>
                  <li>Go to <strong>Vercel.com</strong> or <strong>Netlify.com</strong> (both are 100% free for educational teams).</li>
                  <li>Click <strong>"Import Git Repository"</strong> and select your project.</li>
                  <li>Click <strong>Deploy</strong>. You immediately get a permanent link like <code className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-300">ourteam-vex.vercel.app</code>.</li>
                </ol>
              </div>

              {/* Method C */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                      C
                    </span>
                    <span>Method 3: Offline Pit Laptop (Tournament Safe)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded font-mono">
                    No Internet Required
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Competition venues often have weak or blocked Wi-Fi. This system stores everything in your local browser storage. Simply bookmark the website on your team's pit laptop, and students can check out motors, sensors, and pneumatics with zero internet!
                </p>
              </div>
            </div>
          )}

          {/* SECTION 3: CUSTOMIZE YOUR SCHOOL */}
          {activeSection === 'customize' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Customizing the Template for Your School</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  How to adapt all names, colors, teams, and administrative PINs in under 2 minutes:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-white">1. School Name &amp; Team Number</span>
                  <p className="text-xs text-zinc-400">
                    Enter your official school name (e.g. <em>Oak Ridge High School</em>) and VEX club number (e.g. <em>999</em>). This appears in reports, header branding, and audit logs.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-white">2. Sub-Teams List</span>
                  <p className="text-xs text-zinc-400">
                    Click <strong>"Auto-Generate A–G"</strong> to generate standard competition divisions, or add custom entries like <em>"Drive Team"</em>, <em>"Mentor"</em>, or <em>"Pit Box"</em>.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-white">3. Admin PIN &amp; Coach Email</span>
                  <p className="text-xs text-zinc-400">
                    The default factory template PIN is <code className="bg-zinc-800 px-1 py-0.5 rounded text-amber-300">654</code>. You can change this to any PIN you want (like your team number or room code). This stops curious students from modifying backend settings.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-white">4. Setting Exact Part Quantities (+ / -) for Your School</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Every school owns a different amount of parts. Under the <strong>"Set Part Quantities (+ / -)"</strong> tab (or the button in the Inventory Browser), you can:
                  </p>
                  <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1 pl-2">
                    <li>Click <strong className="text-zinc-200">+</strong> to add 1 part, or <strong className="text-zinc-200">-</strong> to subtract 1 part of any kind.</li>
                    <li>Type the exact count directly in the number box (e.g. change 15 to 28 motors) and press enter.</li>
                    <li>Click <strong className="text-zinc-200">+5</strong> to bulk add incoming hardware packs.</li>
                    <li>Click <strong className="text-indigo-300">"Randomize Quantities"</strong> to automatically generate realistic random hardware numbers (Small, Standard, or Mega club).</li>
                    <li>Click <strong className="text-zinc-200">"Add Custom Part Kind"</strong> to add any custom 3D printed parts, flex wheels, or tools to your catalog.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-white">5. Starting Fresh: "Check In All Parts"</span>
                  <p className="text-xs text-zinc-400">
                    If you want to start a brand-new season with all parts ready inside your storage cabinet, click the <strong>"Check In All Parts"</strong> button in the School Setup tab.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenSchoolCustomizer}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open School &amp; Stock Customizer Now</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 4: DAILY USAGE */}
          {activeSection === 'daily_usage' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-400" />
                  <span>Daily Student Checkout &amp; Return Guide</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  How team members and builders check parts in and out:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <span>Checking OUT a Part</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400 pl-1">
                    <li>Click <strong>"+ Check Out"</strong> at the top.</li>
                    <li>Click the component type (e.g. <em>Optical</em>, <em>Distance</em>, <em>Brain</em>, <em>Solenoid</em>).</li>
                    <li>Tap the part number or type the number (e.g. <code className="text-zinc-200">001</code>).</li>
                    <li>Select your sub-team (e.g. <em>Team A</em>).</li>
                    <li>Enter your email address (so the mentor knows who holds it).</li>
                    <li>Click <strong>"Complete Check Out"</strong>.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <span>Checking IN a Returned Part</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400 pl-1">
                    <li>Click <strong>"Check In / Return"</strong> at the top.</li>
                    <li>Select the component type &amp; number being returned.</li>
                    <li>Select your team and note condition (e.g. <em>"Works great"</em> or <em>"Cable damaged"</em>).</li>
                    <li>Click <strong>"Return Component to Pit"</strong>.</li>
                    <li>The item instantly marks as Available in storage!</li>
                  </ol>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <h3 className="font-bold text-white text-xs">What Part IDs Mean</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 bg-zinc-900 rounded-lg">
                    <div className="text-zinc-400 text-[10px]">BRAIN</div>
                    <div className="text-white font-bold">VEXB-1...20</div>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded-lg">
                    <div className="text-zinc-400 text-[10px]">RADIO</div>
                    <div className="text-white font-bold">VEXR-1...30</div>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded-lg">
                    <div className="text-zinc-400 text-[10px]">SOLENOID</div>
                    <div className="text-white font-bold">VEXSOL-1...31</div>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded-lg">
                    <div className="text-zinc-400 text-[10px]">DISTANCE</div>
                    <div className="text-white font-bold">VEXS-DIST-1...30</div>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenCheckout}
                className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <span>Test Check Out Modal Now</span>
              </button>
            </div>
          )}

          {/* SECTION 5: QR SETUP */}
          {activeSection === 'qr_setup' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-indigo-400" />
                  <span>Setting Up the Cabinet QR Code</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  How to make checkouts completely effortless for your robotics lab:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="font-bold text-white text-xs">Step 1: Download Your Live QR Code</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Open the <strong>"Logos &amp; QR Badges"</strong> window. The system automatically creates a crisp, high-resolution QR code that links directly to this website with your school name printed on it.
                  </p>
                  <button
                    onClick={onOpenAssetsModal}
                    className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR Code Image (PNG)</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="font-bold text-white text-xs">Step 2: Print &amp; Tape to Cabinets</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Print the PNG on standard paper or sticker paper. Tape it directly onto:
                  </p>
                  <ul className="list-disc list-inside text-xs text-zinc-400 pl-2 space-y-0.5">
                    <li>The front of Cabinet 1 (Brain &amp; Radio storage)</li>
                    <li>The Sensor drawer or organizer bins</li>
                    <li>The Pneumatics &amp; Solenoids toolbox</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="font-bold text-white text-xs">Step 3: Students Scan with Phone Camera</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Whenever a builder grabs a sensor, they open their iPhone or Android camera, tap the link, and check it out in 5 seconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: BACKUPS & EXPORT */}
          {activeSection === 'backup' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <span>Backups, Exporting, and Transferring Data</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  How to safely backup your team's records or share them with another computer:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Exporting a Backup (.json)</span>
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    In <strong>"Customize / Clone" &gt; "Export &amp; Import Setup"</strong>, click <strong>"Download Setup File (.json)"</strong>. This saves a single lightweight file with all your parts, current borrowers, and admin settings.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Restoring on Another Laptop</span>
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Opening the website on a new computer? Go to <strong>"Export &amp; Import Setup"</strong>, click <strong>"Select JSON File to Restore"</strong>, and pick your backup. Everything loads instantly!
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="font-bold text-white text-xs">Exporting CSV Spreadsheets</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  In the <strong>"Inventory"</strong> tab, click <strong>"Export CSV"</strong> to download an Excel-compatible spreadsheet of all cataloged components and who currently has them checked out.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 7: GOOGLE SHEETS SYNC (OPTIONAL) */}
          {activeSection === 'google_sheets' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>Google Sheets Integration (Optional)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  You do <strong className="text-white">NOT</strong> need Google Sheets to use this website. But if your school district specifically requires a live Google Sheet, here is how to connect it:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-xs font-bold text-white">Step 1: Open Google Sheets</span>
                  <p className="text-xs text-zinc-400">
                    Create a new Google Sheet or open your existing VEX inventory spreadsheet.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-xs font-bold text-white">Step 2: Copy the Apps Script Backend</span>
                  <p className="text-xs text-zinc-400">
                    In this website, click <strong>Settings (gear icon) &gt; "Apps Script Backend Code"</strong> tab, and click <strong>"Copy Complete Code"</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-xs font-bold text-white">Step 3: Paste into Google Sheet</span>
                  <p className="text-xs text-zinc-400">
                    In Google Sheets, click <strong>Extensions &gt; Apps Script</strong>. Replace the empty function with the copied code and press Save.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-xs font-bold text-white">Step 4: Deploy as Web App</span>
                  <p className="text-xs text-zinc-400">
                    Click <strong>Deploy &gt; New deployment &gt; Select type: Web app</strong>. Set <em>"Who has access"</em> to <strong>"Anyone"</strong>. Copy the URL ending in <code className="text-zinc-200">/exec</code>.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                  <span className="text-xs font-bold text-white">Step 5: Connect in Settings</span>
                  <p className="text-xs text-zinc-400">
                    Paste that URL into <strong>Settings &gt; API Endpoint Connection</strong> and click <strong>Connect &amp; Sync</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenSettings}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open Spreadsheet Settings Modal</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 8: FAQ & TROUBLESHOOTING */}
          {activeSection === 'faq' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <span>Frequently Asked Questions &amp; Troubleshooting</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Common questions answered in simple terms:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <h3 className="font-bold text-white text-xs">
                    Q: What is the default Admin PIN?
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    The initial template PIN is <code className="bg-zinc-800 px-1 py-0.5 rounded text-amber-300 font-bold">654</code>. Once you enter it, click <strong>"Customize / Clone"</strong> to set your own private PIN.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <h3 className="font-bold text-white text-xs">
                    Q: Do my changes stay saved if I close the browser or shut down the laptop?
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Yes! All custom school names, sub-teams, logos, checked-out parts, and logs are automatically preserved in the browser's persistent storage.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <h3 className="font-bold text-white text-xs">
                    Q: Can students check parts out on their phones?
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Yes! The entire interface is 100% responsive and includes a dedicated smartphone bottom navigation bar optimized for quick thumb checkouts.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <h3 className="font-bold text-white text-xs">
                    Q: How do we start fresh for a new robotics season?
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Open <strong>"Customize / Clone"</strong> and click <strong>"Check In All Parts"</strong>. All items will be marked Available in cabinets, ready to check out for your new robot builds.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <h3 className="font-bold text-white text-xs">
                    Q: Can I backup all our data in case someone clears the browser cache?
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Yes! In <strong>"Customize / Clone" &gt; "Export &amp; Import Setup"</strong>, click <strong>"Download Setup File (.json)"</strong>. Save this file on your Google Drive or USB stick.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
