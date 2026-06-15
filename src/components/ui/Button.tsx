import React from 'react';
import { motion } from 'motion/react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  id?: string;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
}

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  disabled,
  id,
  ...props
}: ButtonProps) {
  // Base structural classes matching premium club look
  const baseClasses = 'inline-flex items-center justify-center font-bold font-sports-condensed uppercase tracking-wider transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant implementations
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-lg shadow-indigo-950/40 border border-white/10',
    secondary: 'bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-100 hover:border-neutral-500/40',
    danger: 'bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 hover:border-rose-500/60',
    ghost: 'bg-transparent hover:bg-white/5 text-neutral-300 hover:text-white',
  };

  // Size specifications
  const sizeClasses = {
    sm: 'text-[11px] py-1.5 px-3 min-h-8 gap-1',
    md: 'text-xs py-2 px-4.5 min-h-9.5 gap-1.5',
  };

  return (
    <motion.button
      id={id}
      whileHover={disabled ? undefined : { scale: 1.02, y: -0.5 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...(props as any)}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
