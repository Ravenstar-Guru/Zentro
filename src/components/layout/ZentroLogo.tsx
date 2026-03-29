import React from 'react';

interface ZentroLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  imageSrc?: string; // Optional custom logo
}

export const ZentroLogo: React.FC<ZentroLogoProps> = ({
  size = 80,
  showText = true,
  className = '',
  imageSrc
}) => {
  // Dynamic sizing based on prop
  const svgSize = size;
  const fontSize = size * 0.4; // 40% of size

  if (imageSrc) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src={imageSrc}
          alt="Zentro"
          width={svgSize}
          height={svgSize}
          className="drop-shadow-glow-cyan object-contain"
        />
        {showText && (
          <span className="text-2xl md:text-3xl font-bold gradient-text">
            Zentro
          </span>
        )}
      </div>
    );
  }

  // Default futuristic gradient SVG logo with glow
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 blur-xl bg-gradient-to-r from-glow-cyan to-glow-purple opacity-60 scale-110"></div>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 100 100"
          className="relative drop-shadow-glow-cyan"
        >
          <defs>
            <linearGradient id="zentro-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Hexagon background */}
          <polygon
            points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
            fill="url(#zentro-gradient)"
            opacity="0.9"
          />
          {/* Letter Z */}
          <text
            x="50"
            y="50"
            fontFamily="Inter, Arial, Helvetica, sans-serif"
            fontSize={fontSize}
            fontWeight="800"
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            filter="url(#glow)"
          >
            Z
          </text>
        </svg>
      </div>
      {showText && (
        <span className="text-2xl md:text-3xl font-bold gradient-text">
          Zentro
        </span>
      )}
    </div>
  );
};
