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

  if (logo) {
    return (
      <img
        src={logo}
        alt={`Logo de ${teamName}`}
        referrerPolicy="no-referrer"
        className={`${className} object-contain p-1 bg-white rounded-full border border-white/20 shadow-md shrink-0`}
      />
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
    <div className={`${className} bg-club-gradient-elements border border-white/20 rounded-full flex items-center justify-center font-extrabold text-white text-xs md:text-sm shadow-md shrink-0`}>
      {displayInitials}
    </div>
  );
}

