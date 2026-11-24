import React from 'react';
import aiOrbImg from '../../assets/ai-orb.png';

export interface AiOrbProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'hero';
  pulse?: boolean;
  glow?: boolean;
  className?: string;
  alt?: string;
}

export const AiOrb: React.FC<AiOrbProps> = ({
  size = 'md',
  pulse = true,
  glow = true,
  className = '',
  alt = 'EduPath AI Orb'
}) => {
  const sizeMap: Record<string, string> = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32 sm:w-36 sm:h-36',
    '3xl': 'w-44 h-44 sm:w-52 sm:h-52',
    '4xl': 'w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72',
    hero: 'w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80',
  };

  const orbSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${orbSize} ${className}`}
    >
      {/* Soft atmospheric blue-lavender-pink glow aura */}
      {glow && (
        <div
          className={`absolute inset-[-12%] rounded-full blur-[8px] sm:blur-[14px] pointer-events-none transition-all duration-700 ${
            pulse ? 'animate-pulse-soft opacity-75' : 'opacity-40'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(199, 181, 217, 0.55) 0%, rgba(168, 185, 208, 0.35) 45%, rgba(244, 215, 230, 0.2) 65%, transparent 80%)'
          }}
        />
      )}

      {/* The Glass AI Orb Image */}
      <img
        src={aiOrbImg}
        alt={alt}
        className={`relative z-10 w-full h-full object-contain pointer-events-none transition-transform duration-500 ${
          pulse ? 'animate-float' : ''
        }`}
        style={{
          filter: 'drop-shadow(0 4px 14px rgba(83, 108, 138, 0.12))'
        }}
        loading="eager"
      />
    </div>
  );
};
