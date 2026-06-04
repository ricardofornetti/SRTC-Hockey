import React from 'react';

interface SrtcLogoProps {
  className?: string;
  withText?: boolean;
}

export default function SrtcLogo({ className = 'w-6 h-6', withText = false }: SrtcLogoProps) {
  if (withText) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        {/* Full vector logo including flag and typography */}
        <svg
          viewBox="0 0 160 170"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer wavy double flag border (Beige/Taupe light outline) */}
          <path
            d="M 28 35 C 55 10, 105 45, 132 20 L 132 75 C 105 100, 55 65, 28 90 Z"
            fill="#FFFFFF"
            stroke="#C0C0B0"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Inner waving flag border & cells */}
          <g>
            {/* Left Column Blue Cells (Top-Left and Mid-Left) */}
            {/* Cell 1: Top-Left */}
            <path
              d="M 32 38 C 45 28, 60 40, 66 38 L 66 56 C 55 58, 45 47, 32 55 Z"
              fill="#2b6c93"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {/* Cell 2: Mid-Left */}
            <path
              d="M 32 58 C 45 50, 55 60, 66 58 L 66 76 C 55 78, 45 68, 32 76 Z"
              fill="#2b6c93"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />

            {/* Right Column Blue Cell with Circle Ball */}
            <path
              d="M 70 37 C 85 27, 105 40, 128 24 L 128 55 C 105 70, 85 58, 70 65 Z"
              fill="#2b6c93"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {/* White Tennis Ball/Circle inside the right blue panel */}
            <circle cx="108" cy="42" r="5" fill="#FFFFFF" />

            {/* Bottom-Right Curved Olive-Green segment */}
            <path
              d="M 70 68 C 85 61, 105 73, 128 58 L 128 72 C 105 87, 85 75, 70 82 Z"
              fill="#799553"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          </g>

          {/* Symmetrical white center split line (Mast) */}
          <path
            d="M 68 32 L 68 85"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Typography: "SAN RAFAEL" & "TENIS CLUB" below the flag */}
          <text
            x="80"
            y="125"
            fill="#2c4257"
            fontSize="14.5"
            fontWeight="500"
            fontFamily="sans-serif"
            textAnchor="middle"
            letterSpacing="3.5"
          >
            SAN RAFAEL
          </text>
          
          <text
            x="80"
            y="152"
            fill="#7d8065"
            fontSize="14"
            fontWeight="600"
            fontFamily="sans-serif"
            textAnchor="middle"
            letterSpacing="2.8"
          >
            TENIS CLUB
          </text>
        </svg>
      </div>
    );
  }

  // Large-contained vector flag icon used for list avatars & smaller badge badges
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer waving double flag border (Beige/Taupe light outline) */}
      <path
        d="M 10 20 C 30 5, 70 30, 90 10 L 90 55 C 70 75, 30 50, 10 65 Z"
        fill="#FFFFFF"
        stroke="#C0C0B0"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      
      {/* Cells */}
      {/* Left Column Blue Cells */}
      <path
        d="M 13 22 C 22 15, 35 23, 47 21 L 47 36 C 35 38, 22 30, 13 36 Z"
        fill="#2b6c93"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      <path
        d="M 13 38 C 22 32, 35 40, 47 38 L 47 52 C 35 54, 22 46, 13 52 Z"
        fill="#2b6c93"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />

      {/* Right Column Blue Cell with tennis ball */}
      <path
        d="M 51 20 C 63 12, 77 23, 87 13 L 87 38 C 77 48, 63 40, 51 46 Z"
        fill="#2b6c93"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      <circle cx="71" cy="24" r="3.5" fill="#FFFFFF" />

      {/* Bottom-Right Curved Olive-Green segment */}
      <path
        d="M 51 48 C 63 42, 77 50, 87 40 L 87 50 C 77 60, 63 52, 51 58 Z"
        fill="#799553"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />

      {/* Center split line */}
      <path
        d="M 49 16 L 49 59"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
    </svg>
  );
}
