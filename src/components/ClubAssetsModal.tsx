import React, { useState, useEffect } from 'react';
import { X, Download, QrCode, Image as ImageIcon, Sparkles, Check, Copy, ExternalLink, Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { ClubProfile } from '../types';

interface ClubAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubProfile: ClubProfile;
}

export const ClubAssetsModal: React.FC<ClubAssetsModalProps> = ({ isOpen, onClose, clubProfile }) => {
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate live QR code for the current app deployment URL
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const liveUrl = window.location.href.split('#')[0];
      QRCode.toDataURL(liveUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((dataUrl: string) => setDynamicQrUrl(dataUrl))
        .catch((err: unknown) => console.error('Failed to generate dynamic QR code', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const sampleBadges = [
    {
      title: 'QR Center Badge (Circular)',
      subtitle: 'Solid badge with dark shield border for QR centers',
      src: '/lake_travis_qr_badge_round.png',
      downloadName: 'vex_qr_badge_round.png',
      tag: 'Sample Badge',
    },
    {
      title: 'QR Center Badge (Squircle)',
      subtitle: 'Rounded-corner solid badge optimized for custom QR codes',
      src: '/lake_travis_qr_badge_squircle.png',
      downloadName: 'vex_qr_badge_squircle.png',
      tag: 'Sample Badge',
    },
    {
      title: 'Dark High-Contrast Shield Badge',
      subtitle: 'High contrast black & white shield for pit box signage',
      src: '/lake_travis_qr_badge_dark_shield.png',
      downloadName: 'vex_qr_badge_shield.png',
      tag: 'Signage',
    },
    {
      title: 'Transparent Sample Emblem',
      subtitle: 'Sample emblem template with transparent background',
      src: '/assets/aistudio/lt_logo_transparent.png',
      downloadName: 'sample_club_emblem.png',
      tag: 'Template Asset',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>Printable QR Badges &amp; Club Assets</span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Live QR code generated for {clubProfile.schoolName} (Team {clubProfile.clubNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs text-zinc-300">
          {/* 1. Real Dynamic QR Code Card for THIS specific deployment */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-indigo-500/30 flex flex-col sm:flex-row items-center gap-5 shadow-lg">
            <div className="w-44 h-44 bg-white p-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-md">
              {dynamicQrUrl ? (
                <img
                  src={dynamicQrUrl}
                  alt={`${clubProfile.schoolName} QR Code`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-zinc-500 text-center font-mono text-[11px]">Generating QR...</div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Ready for Pit Box &amp; Cabinets</span>
              </div>
              <h3 className="text-base font-bold text-white">
                {clubProfile.schoolName} — Kiosk QR Code
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Scan with any smartphone camera to instantly open this inventory system for Team {clubProfile.clubNumber}. Print and tape this to parts cabinets, battery charging stations, or pit boxes.
              </p>
              <div className="text-[11px] text-zinc-500 font-mono truncate max-w-md">
                {currentUrl}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                {dynamicQrUrl && (
                  <a
                    href={dynamicQrUrl}
                    download={`${clubProfile.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_QR_Code.png`}
                    className="px-3.5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR Code (PNG)</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'URL Copied!' : 'Copy Web Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. School Custom Logo Section */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-700 p-1 flex items-center justify-center shrink-0">
                {clubProfile.logoUrl ? (
                  <img
                    src={clubProfile.logoUrl}
                    alt="Current Club Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-zinc-500" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100">
                  {clubProfile.schoolName} Active Logo
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Displayed in the top navigation bar and reports
                </p>
              </div>
            </div>

            {clubProfile.logoUrl && (
              <a
                href={clubProfile.logoUrl}
                download={`${clubProfile.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_logo.png`}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Logo</span>
              </a>
            )}
          </div>

          {/* 3. Sample Badges & Emblem Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Sample Badges &amp; Center Inserts
              </span>
              <span className="text-[11px] text-zinc-500">Design Templates</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {sampleBadges.map((asset, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-2.5 flex flex-col justify-between hover:border-zinc-700 transition-colors text-center"
                >
                  <div className="w-full h-20 bg-zinc-900/50 rounded-lg flex items-center justify-center p-1.5 mb-2 border border-zinc-800/50">
                    <img
                      src={asset.src}
                      alt={asset.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] font-semibold text-zinc-200 truncate">
                    {asset.title}
                  </div>
                  <a
                    href={asset.src}
                    download={asset.downloadName}
                    className="mt-2 flex items-center justify-center gap-1 w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium rounded-md transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
