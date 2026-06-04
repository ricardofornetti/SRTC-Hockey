import React, { useState, useEffect } from 'react';
import SrtcLogo from './SrtcLogo';

interface ClubLogoProps {
  teamName: string;
  className?: string;
}

function normalizeTeamName(teamName: string): string {
  if (!teamName) return '';
  const name = teamName.toLowerCase().trim();
  if (name.includes('san rafael') || name.includes('srtc')) return 'SAN RAFAEL TENIS CLUB - A';
  if (name.includes('rivadavia')) return 'RIVADAVIA - A';
  if (name.includes('los tordos - c') || name === 'los tordos c') return 'LOS TORDOS - C';
  if (name.includes('los tordos - b') || name === 'los tordos b') return 'LOS TORDOS - B';
  if (name.includes('mendoza r.c.') || name.includes('mendoza r. c.') || name.includes('mendoza rc') || name === 'mendoza') return 'Mendoza R.C.';
  if (name.includes('marista b') || name.includes('maristas b') || name.includes('marista - b')) return 'MARISTA - B';
  if (name.includes('marista c') || name.includes('maristas c') || name.includes('marista - c')) return 'MARISTA - C';
  if (name.includes('tacuru') || name === 'tacurú') return 'TACURU - A';
  if (name.includes('bco mza - b') || name.includes('banco mendoza b') || name.includes('banco mendoza - b')) return 'BANCO MENDOZA - B';
  if (name.includes('bco mza - c') || name.includes('banco mendoza c') || name.includes('banco mendoza - c')) return 'BANCO MENDOZA - C';
  if (name.includes('pumai') || name.includes('peumayen') || name.includes('peumayén')) return 'PUMAI RUGBY CLUB - A';
  if (name.includes('san jorge s.r.') || name.includes('san jorge')) return 'SAN JORGE S.R. - A';
  if (name.includes('cabna')) return 'CABNA - A';
  if (name.includes('murialdo')) return 'MURIALDO - B';
  if (name.includes('aleman') || name.includes('alemán')) return 'ALEMAN - B';
  if (name.includes('teqüe') || name.includes('teque')) return 'TEQÜE RUGBY CLUB - B';
  
  return teamName.toUpperCase().trim();
}

export default function ClubLogo({ teamName, className = 'w-6 h-6' }: ClubLogoProps) {
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const normalized = normalizeTeamName(teamName);

  useEffect(() => {
    try {
      const savedLogosStr = localStorage.getItem('srtc_team_logos_db');
      if (savedLogosStr) {
        const savedLogos = JSON.parse(savedLogosStr);
        // Try exact match first using normalized name
        let foundLogoUrl = savedLogos[normalized];
        if (!foundLogoUrl) {
          // Try case-insensitive matching
          const matchKey = Object.keys(savedLogos).find(
            k => k.toLowerCase().trim() === normalized.toLowerCase().trim()
          );
          if (matchKey) {
            foundLogoUrl = savedLogos[matchKey];
          }
        }
        if (!foundLogoUrl) {
          // Try partial keyword match
          const partKey = Object.keys(savedLogos).find(
            k => normalized.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(normalized.toLowerCase())
          );
          if (partKey) {
            foundLogoUrl = savedLogos[partKey];
          }
        }
        
        // Special unification: if it's a Marista team, find any custom logo saved for Marista so they are all identically unified
        if (normalized.toLowerCase().includes('marista')) {
          const maristaKey = Object.keys(savedLogos).find(
            k => k.toLowerCase().includes('marista') && savedLogos[k]
          );
          if (maristaKey) {
            foundLogoUrl = savedLogos[maristaKey];
          }
        }

        // Special fallback lookup for Mendoza Rugby Club to support historical custom logo keys like 'MENDOZA R. C. - A' or 'Mendoza'
        if (!foundLogoUrl && normalized.toLowerCase().includes('mendoza') && !normalized.toLowerCase().includes('banco')) {
          const mendozaKey = Object.keys(savedLogos).find(
            k => k.toLowerCase().includes('mendoza') && !k.toLowerCase().includes('banco') && savedLogos[k]
          );
          if (mendozaKey) {
            foundLogoUrl = savedLogos[mendozaKey];
          }
        }

        setCustomLogo(foundLogoUrl || null);
      } else {
        setCustomLogo(null);
      }
    } catch (err) {
      console.error('Error reading custom logo in ClubLogo:', err);
    }
  }, [normalized]);

  if (customLogo) {
    return (
      <img 
        src={customLogo} 
        alt={teamName} 
        className={`${className} object-contain rounded-full bg-white p-1 border border-neutral-800 shrink-0`} 
        referrerPolicy="no-referrer"
      />
    );
  }

  const name = normalized.toLowerCase();

  // 1. San Rafael Tenis Club
  if (name.includes('tenis club') || name.includes('srtc') || name.includes('san rafael')) {
    const srtcSavedLogo = localStorage.getItem('srtc_custom_club_logo');
    if (srtcSavedLogo) {
      return (
        <img 
          src={srtcSavedLogo} 
          alt={teamName} 
          className={`${className} object-contain rounded-full bg-white p-1 border border-neutral-200 shrink-0`} 
          referrerPolicy="no-referrer"
        />
      );
    }
    return <SrtcLogo className={className} />;
  }

  // 2. Club Alemán (Eagle, Circular German Ring)
  if (name.includes('alemán') || name.includes('aleman')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" stroke="#222" strokeWidth="2" className="fill-neutral-950" />
        {/* Flag arches */}
        <path d="M 12 50 A 38 38 0 0 1 88 50" stroke="#ffcc00" strokeWidth="6" strokeLinecap="round" />
        <path d="M 15 45 A 35 35 0 0 1 85 45" stroke="#dd0000" strokeWidth="6" strokeLinecap="round" />
        <path d="M 19 40 A 31 31 0 0 1 81 40" stroke="#111111" strokeWidth="6" strokeLinecap="round" />
        {/* Eagle profile silhouette */}
        <path
          d="M 50 30 Q 52 35 55 35 Q 52 38 52 42 Q 55 40 58 43 Q 54 45 54 48 Q 63 47 68 38 Q 68 47 62 52 Q 62 57 58 59 Q 62 60 65 67 Q 58 64 54 62 Q 53 66 53 69 L 51 69 L 51 65 Q 50 63 49 65 L 49 69 L 47 69 Q 47 66 46 62 Q 42 64 35 67 Q 38 60 42 59 Q 38 57 38 52 Q 32 47 32 38 Q 37 47 46 48 Q 46 45 42 43 Q 45 40 48 42 Q 48 38 45 35 Q 48 35 50 30 Z"
          fill="#111"
          stroke="#dd0000"
          strokeWidth="1"
        />
        {/* Gold claws / beak highlight */}
        <circle cx="50" cy="35" r="1.5" fill="#ffcc00" />
      </svg>
    );
  }

  // 3. Banco Mendoza (CPBM - grape leaf shield)
  if (name.includes('banco mendoza') || name.includes('bco mza') || name.includes('cpbm')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        <path d="M 15 15 H 85 V 50 Q 85 85 50 95 Q 15 85 15 50 Z" fill="#ffffff" stroke="#111111" strokeWidth="3" />
        <path d="M 20 20 H 80 V 50 Q 80 81 50 90 Q 20 81 20 50 Z" stroke="#c0a060" strokeWidth="2" />
        {/* Grape vine leaf (Half green, half black) */}
        <g transform="translate(25, 25) scale(0.5)">
          {/* Left side green leaf */}
          <path d="M 50 10 Q 30 5 25 30 Q 10 30 15 50 Q 5 65 25 80 Q 40 95 50 100 Z" fill="#198754" />
          {/* Right side black leaf */}
          <path d="M 50 10 Q 70 5 75 30 Q 90 30 85 50 Q 95 65 75 80 Q 60 95 50 100 Z" fill="#111111" />
        </g>
        {/* CPBM text representation */}
        <text x="50" y="80" textAnchor="middle" fill="#111111" fontSize="10" fontWeight="900" fontFamily="serif">
          CPBM
        </text>
      </svg>
    );
  }

  // 4. CABNA (Light Blue Shield, Map, Banner)
  if (name.includes('cabna')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        <path d="M 15 20 C 15 20 30 10 50 15 C 70 10 85 20 85 20 C 85 55 75 85 50 95 C 25 85 15 55 15 20 Z" fill="#ffffff" stroke="#1e40af" strokeWidth="4" />
        <path d="M 20 24 C 20 24 32 15 50 19 C 68 15 80 24 80 24 C 80 52 71 78 50 87 C 29 78 20 52 20 24 Z" fill="#93c5fd" />
        {/* Argentina map outline in the center */}
        <path d="M 45 35 Q 52 40 50 48 Q 53 52 48 58 Q 51 68 47 75 L 44 79 L 46 72 Q 44 65 42 60 Z" fill="#1e3a8a" />
        {/* Banner CABNA */}
        <path d="M 10 40 H 90 V 52 H 10 Z" fill="#1e40af" stroke="#ffffff" strokeWidth="1.5" />
        <text x="50" y="49" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900" letterSpacing="1">
          CABNA
        </text>
      </svg>
    );
  }

  // 5. Los Tordos (Navy Shield, Crimson St. Andrew's Cross, LTRC)
  if (name.includes('los tordos') || name.includes('tordos') || name.includes('ltrc')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        <path d="M 15 15 C 15 15 50 5 85 15 C 85 55 75 85 50 95 C 25 85 15 55 15 15 Z" fill="#1e1b4b" stroke="#ffffff" strokeWidth="2" />
        {/* Red cross diagonal */}
        <path d="M 15 15 L 85 91 M 85 15 L 15 91" stroke="#dc2626" strokeWidth="12" />
        {/* White letters in quadrants */}
        <text x="50" y="27" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="sans-serif">L</text>
        <text x="25" y="55" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="sans-serif">T</text>
        <text x="75" y="55" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="sans-serif">R</text>
        <text x="50" y="82" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="sans-serif">C</text>
      </svg>
    );
  }

  // 6. Maristas (Split Vertical Red/White Shield, Gold Monogram & Olive Wreath)
  if (name.includes('maristas') || name.includes('marista')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        {/* Background shield split */}
        <clipPath id="maristas-shield">
          <path d="M 15 25 H 85 V 60 C 85 85 50 95 50 95 C 50 95 15 85 15 60 Z" />
        </clipPath>
        <g clipPath="url(#maristas-shield)">
          <rect x="15" y="0" width="35" height="100" fill="#851414" />
          <rect x="50" y="0" width="35" height="100" fill="#ffffff" />
        </g>
        <path d="M 15 25 H 85 V 60 C 85 85 50 95 50 95 C 50 95 15 85 15 60 Z" stroke="#3730a3" strokeWidth="3" />
        {/* MARISTA Banner */}
        <path d="M 15 15 H 85 V 25 H 15 Z" fill="#111827" />
        <text x="50" y="23" textAnchor="middle" fill="#eab308" fontSize="8" fontWeight="900" letterSpacing="0.5">
          MARISTA
        </text>
        {/* Golden wreath on sides */}
        <path d="M 10 50 Q 12 82 35 92 Q 35 88 20 78 Z" fill="#eab308" opacity="0.8" />
        <path d="M 90 50 Q 88 82 65 92 Q 65 88 80 78 Z" fill="#eab308" opacity="0.8" />
        {/* M monogram inside shield */}
        <text x="50" y="60" textAnchor="middle" fill="#eab308" fontSize="22" fontWeight="bold" fontFamily="serif" stroke="#111111" strokeWidth="0.5">
          M
        </text>
      </svg>
    );
  }

  // 7. Murialdo (Leonardo Murialdo - Yellow shield, monogram, blue border)
  if (name.includes('murialdo')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        <path d="M 15 15 H 85 V 50 Q 85 85 50 95 Q 15 85 15 50 Z" fill="#facc15" stroke="#1d4ed8" strokeWidth="4" />
        {/* Red circle in center */}
        <circle cx="50" cy="50" r="22" fill="none" stroke="#dc2626" strokeWidth="3" />
        {/* Monogram L M */}
        <text x="50" y="55" textAnchor="middle" fill="#dc2626" fontSize="14" fontWeight="900" fontFamily="sans-serif">
          LM
        </text>
      </svg>
    );
  }

  // 8. Pumai Rugby Club (Mountains on top, green grape split right red rugby ball)
  if (name.includes('pumai') || name.includes('peumayen') || name.includes('peumayén')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        <rect x="15" y="10" width="70" height="80" rx="6" fill="#ffffff" stroke="#111111" strokeWidth="3" />
        {/* Top banner: PUMAI */}
        <rect x="15" y="10" width="70" height="20" fill="#111111" />
        <text x="50" y="24" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900" letterSpacing="1">
          PUMAI
        </text>
        {/* Mountain skyline */}
        <path d="M 18 45 L 35 34 L 52 42 L 70 33 L 82 45 Z" fill="#38bdf8" />
        {/* Bottom vertical split: Left Green (Grapes), Right Red (Rugby ball) */}
        <g clipPath="url(#pumai-split)">
          <clipPath id="pumai-split">
            <rect x="18" y="45" width="64" height="42" />
          </clipPath>
          <rect x="18" y="45" width="32" height="42" fill="#15803d" />
          <rect x="50" y="45" width="32" height="42" fill="#b91c1c" />
          {/* Grape outline representation */}
          <circle cx="34" cy="66" r="4" fill="#ffffff" opacity="0.8" />
          <circle cx="30" cy="72" r="3" fill="#ffffff" opacity="0.8" />
          <circle cx="38" cy="72" r="3" fill="#ffffff" opacity="0.8" />
          {/* Rugby ball representation */}
          <ellipse cx="66" cy="66" rx="6" ry="10" transform="rotate(-30, 66, 66)" fill="#ffffff" />
        </g>
        {/* Frame border inner line */}
        <rect x="18" y="13" width="64" height="74" fill="none" stroke="#111111" strokeWidth="1" />
      </svg>
    );
  }

  // 9. Rivadavia Hockey (Orange shield with R and Crossed Sticks)
  if (name.includes('rivadavia') || name.includes('cdr')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        <path d="M 15 15 L 85 15 C 85 45 80 75 50 95 C 20 75 15 45 15 15 Z" fill="#ffffff" stroke="#f97316" strokeWidth="4" />
        {/* Vertical split grey/white inside */}
        <path d="M 18 18 H 50 V 91 Q 50 91 50 91 C 32 79 18 52 18 18 Z" fill="#e5e5e5" />
        {/* Crossed hockey sticks */}
        <line x1="25" y1="75" x2="75" y2="25" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
        <line x1="75" y1="75" x2="25" y2="25" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
        {/* Yellow ball */}
        <circle cx="50" cy="65" r="5" fill="#facc15" stroke="#111111" strokeWidth="1" />
        {/* Center Orange "R" letter */}
        <text x="50" y="52" textAnchor="middle" fill="#f97316" fontSize="24" fontWeight="black" fontFamily="sans-serif">
          R
        </text>
        <text x="50" y="85" textAnchor="middle" fill="#f97316" fontSize="8" fontWeight="black">
          C. D. R.
        </text>
      </svg>
    );
  }

  // 10. San Jorge S.R. (Quartered check design checkered, SJRC, Red/White)
  if (name.includes('san jorge') || name.includes('sjrc') || name.includes('jorge')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        <path d="M 15 15 H 85 V 55 C 85 80 50 95 50 95 C 50 95 15 80 15 55 Z" fill="#ffffff" stroke="#111" strokeWidth="4" />
        <g clipPath="url(#sanjorge-split)">
          <clipPath id="sanjorge-split">
            <path d="M 15 15 H 85 V 55 C 85 80 50 95 50 95 C 50 95 15 80 15 55 Z" />
          </clipPath>
          {/* Checkered top-right and bottom-left in crimson red */}
          <rect x="50" y="15" width="35" height="35" fill="#dc2626" />
          <rect x="15" y="50" width="35" height="45" fill="#dc2626" />
        </g>
        <path d="M 15 15 H 85 V 55 C 85 80 50 95 50 95 C 50 95 15 80 15 55 Z" stroke="#111" strokeWidth="2" />
        {/* Vertical & Horizontal lines */}
        <line x1="50" y1="15" x2="50" y2="93" stroke="#111" strokeWidth="2.5" />
        <line x1="15" y1="50" x2="85" y2="50" stroke="#111" strokeWidth="2.5" />
        {/* Letters S J R C */}
        <text x="32" y="38" textAnchor="middle" fill="#111111" fontSize="16" fontWeight="900">S</text>
        <text x="68" y="38" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900">J</text>
        <text x="32" y="73" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900">R</text>
        <text x="68" y="73" textAnchor="middle" fill="#111111" fontSize="16" fontWeight="900">C</text>
      </svg>
    );
  }

  // 11. Tacurú (Yellow & Blue quadrants)
  if (name.includes('tacuru') || name.includes('tacurú')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        <path d="M 15 15 C 15 15 50 5 85 15 C 85 55 75 85 50 95 C 25 85 15 55 15 15 Z" fill="#ffffff" stroke="#1e3a8a" strokeWidth="4" />
        <g clipPath="url(#tacuru-split)">
          <clipPath id="tacuru-split">
            <path d="M 15 15 C 15 15 50 5 85 15 C 85 55 75 85 50 95 C 25 85 15 55 15 15 Z" />
          </clipPath>
          {/* Yellow/blue diagonals */}
          <path d="M 15 15 L 85 95 L 15 95 Z" fill="#eab308" />
          <path d="M 85 15 L 15 15 L 85 95 Z" fill="#2563eb" />
          <path d="M 15 15 L 50 55 L 15 95 Z" fill="#2563eb" />
          <path d="M 85 15 L 50 55 L 85 95 Z" fill="#eab308" />
        </g>
        <path d="M 15 15 C 15 15 50 5 85 15 C 85 55 75 85 50 95 C 25 85 15 55 15 15 Z" stroke="#1e3a8a" strokeWidth="2" />
        {/* Inner small blue shield with letters */}
        <circle cx="50" cy="53" r="16" fill="#1e3a8a" stroke="#ffffff" strokeWidth="1.5" />
        <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900">
          RCTH
        </text>
      </svg>
    );
  }

  // 12. Teqüe Rugby Club (Two Llamas holding red/blue shield)
  if (name.includes('teqüe') || name.includes('teque') || name.includes('trc')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="46" ry="46" fill="#ffffff" stroke="#3b82f6" strokeWidth="2.5" />
        {/* Left and Right Guanacos/Llamas in Gold */}
        <path d="M 14 62 Q 22 55 24 45 L 23 25 Q 26 21 28 25 L 29 40 L 32 50 L 34 65 L 30 75" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
        <path d="M 86 62 Q 78 55 76 45 L 77 25 Q 74 21 72 25 L 71 40 L 68 50 L 66 65 L 70 75" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
        {/* Central Shield Red top, Blue bottom, white bar with TRC */}
        <path d="M 37 32 H 63 V 55 Q 63 70 50 75 Q 37 70 37 55 Z" fill="#1d4ed8" stroke="#111111" strokeWidth="1.5" />
        <path d="M 37 32 H 63 V 45 H 37 Z" fill="#dc2626" />
        <rect x="36" y="43" width="28" height="6" fill="#ffffff" stroke="#111111" strokeWidth="1" />
        <text x="50" y="48" textAnchor="middle" fill="#111111" fontSize="5" fontWeight="900" letterSpacing="0.5">TRC</text>
        {/* Bottom banner: TEQÜE */}
        <path d="M 20 70 Q 50 82 80 70 L 78 78 Q 50 90 22 78 Z" fill="#1e3a8a" />
        <text x="50" y="78" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">TEQÜE</text>
      </svg>
    );
  }

  // 13. Mendoza Rugby Club (Rabbit Mascot Logo & Rugby ball)
  if (name.includes('mendoza r. c. - a') || name.includes('mendoza r.c.') || name.includes('mendoza rc')) {
    return (
      <svg className={`${className} fill-none`} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.5" />
        
        {/* Draw a gorgeous stylized rabbit */}
        <g transform="translate(15, 12) scale(0.7)">
          {/* Back ear */}
          <path d="M 42 18 C 36 2 28 2 30 26 C 32 44 38 44 38 44" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
          <path d="M 40 18 C 36 6 32 6 34 26" fill="#ffffff" />
          
          {/* Front ear */}
          <path d="M 52 14 C 47 -4 38 -4 41 24 C 44 42 46 42 46 42" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="2" />
          <path d="M 49 14 C 45 4 40 4 42 24" fill="#f43f5e" opacity="0.4" />

          {/* Head */}
          <path d="M 32 46 C 32 30 48 30 58 35 C 68 40 72 50 68 60 C 63 70 48 70 38 64 Z" fill="#ffffff" stroke="#1d4ed8" strokeWidth="2" />
          <path d="M 29 46 Q 22 41 18 49 Q 25 56 32 46" fill="#3b82f6" />

          {/* Eye */}
          <circle cx="50" cy="46" r="3.5" fill="#111111" />
          <circle cx="51.2" cy="44.8" r="1.3" fill="#ffffff" />

          {/* Nose */}
          <polygon points="68,53 72,51 70,56" fill="#f43f5e" />

          {/* Arms reaching */}
          <path d="M 22 62 C 12 57 2 67 7 77 C 12 87 22 82 32 77 Z" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="1.5" />
          <path d="M 32 77 C 42 82 52 82 62 77 C 72 72 77 67 82 72" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />

          {/* Red Rugby ball */}
          <ellipse cx="59" cy="67" rx="14" ry="8" transform="rotate(-25, 59, 67)" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M 47 72 Q 59 62 71 62" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,2" />
        </g>
        
        {/* Curvaceous text indicator for MRC */}
        <path id="mrc-rabbit-text-path" d="M 22 84 A 36 36 0 0 0 78 84" fill="none" />
        <text fontSize="7" fontWeight="900" fill="#1d4ed8" letterSpacing="1.5">
          <textPath href="#mrc-rabbit-text-path" startOffset="50%" textAnchor="middle">
            MENDOZA R.C.
          </textPath>
        </text>
      </svg>
    );
  }

  // Default fallback (Simple shield outline with initials)
  const initials = teamName.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
  return (
    <div className={`${className} bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-300 text-[9px] shadow-inner shrink-0`}>
      {initials}
    </div>
  );
}
