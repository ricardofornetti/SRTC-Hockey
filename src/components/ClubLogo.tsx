import React, { useState, useEffect } from 'react';

interface ClubLogoProps {
  teamName: string;
  className?: string;
}

function normalizeTeamName(teamName: string): string {
  if (!teamName) return '';
  const name = teamName.toLowerCase().trim();
  if (name.includes('san rafael') || name.includes('srtc')) return 'SAN RAFAEL TENIS CLUB - A';
  if (name.includes('rivadavia')) return 'RIVADAVIA - A';
  if (name.includes('los tordos - c') || name === 'los tordos c' || name.includes('los tordos c')) return 'LOS TORDOS - C';
  if (name.includes('los tordos - b') || name === 'los tordos b' || name.includes('los tordos b')) return 'LOS TORDOS - B';
  if (name.includes('mendoza r.c.') || name.includes('mendoza r. c.') || name.includes('mendoza rc') || name === 'mendoza') return 'MENDOZA R. C. - A';
  if (name.includes('marista b') || name.includes('maristas b') || name.includes('marista - b')) return 'MARISTA - B';
  if (name.includes('marista c') || name.includes('maristas c') || name.includes('marista - c')) return 'MARISTA - C';
  if (name.includes('tacuru') || name === 'tacurú' || name.includes('tacurú')) return 'TACURU - A';
  if (name.includes('bco mza - b') || name.includes('bco mza b') || name.includes('banco mendoza b') || name.includes('banco mendoza - b')) return 'BANCO MENDOZA - B';
  if (name.includes('bco mza - c') || name.includes('bco mza c') || name.includes('banco mendoza c') || name.includes('banco mendoza - c')) return 'BANCO MENDOZA - C';
  if (name.includes('pumai') || name.includes('peumayen') || name.includes('peumayén')) return 'PUMAI RUGBY CLUB - A';
  if (name.includes('san jorge s.r.') || name.includes('san jorge')) return 'SAN JORGE S.R. - A';
  if (name.includes('cabna')) return 'CABNA - A';
  if (name.includes('murialdo')) return 'MURIALDO - B';
  if (name.includes('aleman') || name.includes('alemán') || name.includes('alemán b')) return 'ALEMAN - B';
  if (name.includes('teqüe') || name.includes('teque')) return 'TEQÜE RUGBY CLUB - B';
  
  return teamName.toUpperCase().trim();
}

export default function ClubLogo({ teamName, className = 'w-12 h-12' }: ClubLogoProps) {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadLogo = () => {
      try {
        const normalized = normalizeTeamName(teamName);
        if (normalized === 'SAN RAFAEL TENIS CLUB - A') {
          const customLogo = localStorage.getItem('srtc_custom_club_logo');
          if (customLogo) {
            setLogo(customLogo);
            return;
          }
        }
        const savedLogosStr = localStorage.getItem('srtc_team_logos_db');
        if (savedLogosStr) {
          const savedLogos = JSON.parse(savedLogosStr);
          if (savedLogos[normalized]) {
            setLogo(savedLogos[normalized]);
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLogo(null);
    };

    loadLogo();

    // Listen for storage changes to update logos dynamically
    const handleStorageChange = () => {
      loadLogo();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('srtc_logo_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('srtc_logo_updated', handleStorageChange);
    };
  }, [teamName]);

  const isSRTC = teamName ? (teamName.toLowerCase().includes('san rafael') || teamName.toLowerCase().includes('srtc')) : false;

  // Render wrapper with gradient borders & shadows
  const containerStyle = isSRTC
    ? 'relative p-[2px] bg-gradient-to-tr from-indigo-500 via-emerald-500 to-indigo-300 rounded-2xl shadow-lg ring-2 ring-emerald-500/20 shadow-emerald-950/20 ring-offset-2 ring-offset-neutral-950 accent-glow animate-in fade-in duration-300 shrink-0'
    : 'relative p-[1.5px] bg-gradient-to-tr from-neutral-800 to-neutral-700/55 rounded-2xl shadow-md border border-white/5 shrink-0';

  if (logo) {
    return (
      <div className={`${containerStyle} ${className}`}>
        <div className="w-full h-full bg-neutral-900 rounded-[14px] overflow-hidden flex items-center justify-center p-0.5">
          <img
            src={logo}
            alt={`Logo de ${teamName}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain mix-blend-normal rounded-xl"
          />
        </div>
      </div>
    );
  }

  // Generate clean 2-3 letter initials for the fallback badge
  let displayInitials = '';
  if (teamName) {
    const parts = teamName
      .toUpperCase()
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(p => p && p !== 'A' && p !== 'B' && p !== 'C' && p !== 'RUGBY' && p !== 'CLUB' && p !== 'SRTC' && p !== 'TENIS' && p !== 'DIVISIÓN' && p !== 'DIVISION');
    
    if (parts.length > 0) {
      displayInitials = parts.slice(0, 3).map(p => p[0]).join('');
    } else {
      displayInitials = teamName.substring(0, 2).toUpperCase();
    }
  }

  return (
    <div className={`${containerStyle} ${className}`}>
      <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center font-extrabold text-neutral-100 select-none shadow-inner">
        <span className="font-sport tracking-wider text-[11px] sm:text-xs">
          {displayInitials}
        </span>
      </div>
    </div>
  );
}
