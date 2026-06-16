import React from 'react';
import { motion } from 'motion/react';

interface HockeyStickBallProps {
  className?: string;
  animate?: boolean;
}

export default function HockeyStickBall({ className = 'w-16 h-16', animate = true }: HockeyStickBallProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Grass outline / Field Line with institutional green */}
        <motion.path
          d="M 10 85 L 90 85"
          stroke="#7a9660"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Dynamic suttle grass patch elements */}
        <path d="M 25 85 L 22 78 M 27 85 L 29 76 M 72 85 L 70 77 M 75 85 L 77 75" stroke="#7a9660" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

        {/* Ball shadow / glow */}
        <ellipse cx="65" cy="85" rx="6" ry="1.5" fill="black" opacity="0.2" />

        {/* Hockey Ball (White/Yellow texturized, animated bouncing/spinning) */}
        <motion.circle
          cx="65"
          cy="81"
          r="4.5"
          fill="#FFFFFF"
          stroke="#3e7496"
          strokeWidth="1.5"
          animate={animate ? {
            y: [0, -6, 0],
            scaleY: [1, 0.85, 1],
            scaleX: [1, 1.15, 1],
          } : {}}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Hockey Stick (Institutional Blue and details) */}
        <motion.g
          animate={animate ? {
            rotate: [0, -10, 4, 0],
            x: [0, -2, 1, 0],
          } : {}}
          style={{ transformOrigin: '25px 25px' }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut'
          }}
        >
          {/* Stick Handle / Grip wrap */}
          <path
            d="M 30 15 L 43 55"
            stroke="#1d3056"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Stick shaft body */}
          <path
            d="M 43 55 L 53 80"
            stroke="#3e7496"
            strokeWidth="4.5"
          />
          {/* Hook / Blade signature bend with swoosh style */}
          <path
            d="M 53 80 C 56 83, 62 84, 65 79 C 67 76, 64 72, 60 72"
            stroke="#3e7496"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Wrapping detail / stripe grip with green */}
          <path d="M 33 24 L 38 27" stroke="#7a9660" strokeWidth="2" />
          <path d="M 36 33 L 41 36" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M 39 42 L 44 45" stroke="#7a9660" strokeWidth="2" />
        </motion.g>

        {/* Aesthetic swoosh arc when hitting the ball */}
        <motion.path
          d="M 40 65 Q 52 75 62 80"
          stroke="url(#arcGlow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.75"
          animate={animate ? {
            pathLength: [0, 1, 0],
            opacity: [0, 0.8, 0]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />

        <defs>
          <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7a9660" />
            <stop offset="100%" stopColor="#3e7496" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
