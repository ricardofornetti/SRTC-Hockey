import React from 'react';

interface ClubLogoProps {
  teamName: string;
  className?: string;
}

export default function ClubLogo({ teamName, className = 'w-12 h-12' }: ClubLogoProps) {
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

