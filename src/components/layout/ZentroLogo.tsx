import React from 'react';

interface ZentroLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  imageSrc?: string; // Optional custom logo image
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
          className="drop-shadow-lg object-contain"
        />
        {showText && (
          <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            Zentro
          </span>
        )}
      </div>
    );
  }

  // Default gradient SVG logo
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 100 100"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="zentro-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        {/* Circle background */}
        <circle cx="50" cy="50" r="45" fill="url(#zentro-gradient)" />
        {/* Letter Z */}
        <text
          x="50"
          y="50"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={fontSize}
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
        >
          Z
        </text>
      </svg>
      {showText && (
        <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          Zentro
        </span>
      )}
    </div>
  );
};
