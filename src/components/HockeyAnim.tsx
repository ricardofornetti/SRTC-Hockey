import React from 'react';
import { motion } from 'motion/react';

interface HockeyAnimProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function HockeyAnim({ className = '', size = 'md' }: HockeyAnimProps) {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${sizeMap[size]}`}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full overflow-visible">
          {/* Campo/Cancha de hockey estilizado - líneas en baja opacidad */}
          <circle cx="50" cy="50" r="45" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />

          {/* Trayectoria/Estela de la bocha (glowing trail) */}
          <motion.path
            d="M 25,65 Q 50,65 75,65"
            stroke="url(#trail-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.35"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Bocha / Pelota de hockey */}
          <motion.circle
            cx="32"
            cy="65"
            r="4"
            fill="#FFFFFF"
            className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            animate={{
              cx: [32, 68, 32],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Stick de Hockey de SRTC */}
          <motion.g
            initial={{ rotate: -15 }}
            animate={{
              rotate: [-15, 12, -15],
              x: [0, 5, 0],
              y: [0, -3, 0]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: '28px 25px' }}
          >
            {/* Mango del stick */}
            <path
              d="M 28,15 L 34,55"
              stroke="url(#stick-shaft-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Grip / Cinta de agarre texturizada */}
            <path
              d="M 28.5,18 L 31.5,38"
              stroke="#ffffff"
              strokeWidth="4.2"
              opacity="0.9"
              strokeDasharray="1 1.5"
            />
            {/* Curva y cabeza del palo de hockey (Hook) */}
            <path
              d="M 34,55 Q 36,68 28,68 Q 23,68 23,63 Q 23,59 27,59 Q 31,59 31,56"
              stroke="url(#stick-head-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Detalle decorativo institucional de SRTC */}
            <path
              d="M 31,59 Q 32,63 29,63"
              stroke="#34d399"
              strokeWidth="1.5"
              fill="none"
              opacity="0.75"
            />
          </motion.g>

          {/* Gradientes Definidos */}
          <defs>
            {/* Gradiente de la estela */}
            <linearGradient id="trail-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3e7496" stopOpacity="0" />
              <stop offset="50%" stopColor="#7a9660" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>

            {/* Gradiente del mango */}
            <linearGradient id="stick-shaft-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="60%" stopColor="#3e7496" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>

            {/* Gradiente de la cabeza */}
            <linearGradient id="stick-head-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3e7496" />
              <stop offset="50%" stopColor="#7a9660" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Halo resplandeciente de fondo */}
        <div className="absolute inset-0 bg-emerald-500/5 rounded-full filter blur-xl -z-10 animate-pulse pointer-events-none" />
      </div>
    </div>
  );
}
