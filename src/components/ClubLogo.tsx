import React, { useState, useEffect } from 'react';

interface ClubLogoProps {
  teamName: string;
  className?: string;
}

export default function ClubLogo({ teamName, className = 'w-12 h-12' }: ClubLogoProps) {
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    const checkLogos = () => {
      try {
        const savedLogosStr = localStorage.getItem('srtc_team_logos_db');
        if (savedLogosStr) {
          const savedLogos = JSON.parse(savedLogosStr);
          
          // Helper to normalize lookups
          const clean = (s: string) => s.toLowerCase().trim()
            .replace(/[^a-z0-8íáéóúñü]/g, ' ')
            .replace(/\s+/g, ' ');

          const normTeam = clean(teamName);
          
          // 1. Direct match
          let foundLogoUrl = savedLogos[teamName];
          
          // 2. Case-insensitive / normalized lookup
          if (!foundLogoUrl) {
            const matchKey = Object.keys(savedLogos).find(
              k => clean(k) === normTeam
            );
            if (matchKey) {
              foundLogoUrl = savedLogos[matchKey];
            }
          }

          // 3. Partial keyword lookup
          if (!foundLogoUrl) {
            const matchKey = Object.keys(savedLogos).find(
              k => normTeam.includes(clean(k)) || clean(k).includes(normTeam)
            );
            if (matchKey) {
              foundLogoUrl = savedLogos[matchKey];
            }
          }

          setCustomLogo(foundLogoUrl || null);
        } else {
          setCustomLogo(null);
        }
      } catch (err) {
        console.error('Error reading custom logo in ClubLogo:', err);
      }
    };

    checkLogos();
    
    // Listen to changes globally
    window.addEventListener('storage', checkLogos);
    return () => {
      window.removeEventListener('storage', checkLogos);
    };
  }, [teamName]);

  if (customLogo) {
    return (
      <img 
        src={customLogo} 
        alt={teamName} 
        className={`${className} object-contain rounded-full bg-white p-1 border border-neutral-200 shrink-0 shadow-sm`} 
        referrerPolicy="no-referrer"
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
      .filter(p => p && p !== 'A' && p !== 'B' && p !== 'C' && p !== 'RUGBY' && p !== 'CLUB' && p !== 'SRTC' && p !== 'TENIS' && p !== 'DIVISIÓN' && p !== 'DIVISIÓN' && p !== 'DIVISION');
    
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
