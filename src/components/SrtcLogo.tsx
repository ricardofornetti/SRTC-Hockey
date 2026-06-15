import React from 'react';

interface SrtcLogoProps {
  className?: string;
  withText?: boolean;
}

export default function SrtcLogo({ className = 'w-6 h-6', withText = false }: SrtcLogoProps) {
  // Common Gradients and Filters to make the SVG look premium & shiny
  const svgFiltersAndDefs = (
    <defs>
      {/* Club Blue Gradient (color institucional #3e7496) */}
      <linearGradient id="srtc-blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2d546c" /> {/* Azul oscuro */}
        <stop offset="50%" stopColor="#3e7496" /> {/* Azul institucional */}
        <stop offset="100%" stopColor="#5a90b3" /> {/* Azul claro */}
      </linearGradient>

      {/* Club Green Gradient (color institucional #7a9660) */}
      <linearGradient id="srtc-green-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60764c" /> {/* Verde oscuro */}
        <stop offset="100%" stopColor="#8ba573" /> {/* Verde institucional claro */}
      </linearGradient>

      {/* Pure White/Silver Sheen Gradient */}
      <linearGradient id="srtc-white-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e5e7eb" />
      </linearGradient>

      {/* Metallic Gold Trim for Crest Borders */}
      <linearGradient id="srtc-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>

      {/* Flag mast metallic core */}
      <linearGradient id="srtc-mast-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9ca3af" />
        <stop offset="50%" stopColor="#f3f4f6" />
        <stop offset="100%" stopColor="#4b5563" />
      </linearGradient>

      {/* Premium Drop Shadow */}
      <filter id="srtc-drop-shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="1" dy="2.5" stdDeviation="2" floodOpacity="0.38" floodColor="#000000" />
      </filter>
      
      {/* Outer Glow for tennis ball/stars */}
      <filter id="srtc-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );

  if (withText) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {svgFiltersAndDefs}

          {/* Premium Circular Crest Shield Background */}
          <circle cx="100" cy="100" r="95" fill="#0c0a09" stroke="url(#srtc-gold-gradient)" strokeWidth="3" filter="url(#srtc-drop-shadow)" />
          <circle cx="100" cy="100" r="88" fill="#171717" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.15" />

          {/* Waving Flag inside the circular crest */}
          <g transform="translate(36, 32) scale(1.3)" filter="url(#srtc-drop-shadow)">
            {/* Outer waving flag silhouette (White edge) */}
            <path
              d="M 10 20 C 30 5, 70 30, 90 10 L 90 55 C 70 75, 30 50, 10 65 Z"
              fill="url(#srtc-white-gradient)"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            
            {/* Left Column Blue Cells */}
            <path
              d="M 13 22 C 22 15, 35 23, 47 21 L 47 36 C 35 38, 22 30, 13 36 Z"
              fill="url(#srtc-blue-gradient)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <path
              d="M 13 38 C 22 32, 35 40, 47 38 L 47 52 C 35 54, 22 46, 13 52 Z"
              fill="url(#srtc-blue-gradient)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            {/* Right Column Blue Cell */}
            <path
              d="M 51 20 C 63 12, 77 23, 87 13 L 87 38 C 77 48, 63 40, 51 46 Z"
              fill="url(#srtc-blue-gradient)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Bright Tennis Ball with gold stroke inside right blue panel */}
            <circle cx="71" cy="24" r="4.2" fill="#ffffff" stroke="url(#srtc-gold-gradient)" strokeWidth="0.8" filter="url(#srtc-glow)" />

            {/* Bottom-Right Curved Olive-Green segment */}
            <path
              d="M 51 48 C 63 42, 77 50, 87 40 L 87 50 C 77 60, 63 52, 51 58 Z"
              fill="url(#srtc-green-gradient)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            {/* Mast Splitting the flag */}
            <path
              d="M 49 15 L 49 61"
              stroke="url(#srtc-mast-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Elegant Circular Text */}
          <path id="srtc-text-path-crest" d="M 24 140 A 78 78 0 0 0 176 140" fill="none" />
          <text fontSize="12" fontWeight="900" fill="#ffffff" letterSpacing="2.8" fontFamily="sans-serif">
            <textPath href="#srtc-text-path-crest" startOffset="50%" textAnchor="middle">
              SAN RAFAEL TENIS CLUB
            </textPath>
          </text>
        </svg>
      </div>
    );
  }

  // Classic waving flag icon with double-border container used in lists/avatars
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {svgFiltersAndDefs}
      
      {/* Outer waving double flag border (White light sheen outline) */}
      <path
        d="M 10 20 C 30 5, 70 30, 90 10 L 90 55 C 70 75, 30 50, 10 65 Z"
        fill="url(#srtc-white-gradient)"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#srtc-drop-shadow)"
      />
      
      {/* Left Column Blue Cells */}
      <path
        d="M 13 22 C 22 15, 35 23, 47 21 L 47 36 C 35 38, 22 30, 13 36 Z"
        fill="url(#srtc-blue-gradient)"
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      <path
        d="M 13 38 C 22 32, 35 40, 47 38 L 47 52 C 35 54, 22 46, 13 52 Z"
        fill="url(#srtc-blue-gradient)"
        stroke="#ffffff"
        strokeWidth="1.5"
      />

      {/* Right Column Blue Cell with white/gold tennis ball */}
      <path
        d="M 51 20 C 63 12, 77 23, 87 13 L 87 38 C 77 48, 63 40, 51 46 Z"
        fill="url(#srtc-blue-gradient)"
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      <circle cx="71" cy="24" r="4" fill="#ffffff" stroke="url(#srtc-gold-gradient)" strokeWidth="0.8" filter="url(#srtc-glow)" />

      {/* Bottom-Right Curved Green segment */}
      <path
        d="M 51 48 C 63 42, 77 50, 87 40 L 87 50 C 77 60, 63 52, 51 58 Z"
        fill="url(#srtc-green-gradient)"
        stroke="#ffffff"
        strokeWidth="1.5"
      />

      {/* Center split mast line */}
      <path
        d="M 49 16 L 49 60"
        stroke="url(#srtc-mast-gradient)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
