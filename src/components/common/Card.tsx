import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  animate?: boolean;
  glow?: boolean;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  animate = false,
  glow = false,
  elevated = false
}) => {
  const baseStyles = 'glass rounded-2xl p-4 transition-all duration-300';

  const hoverStyles = hover
    ? 'glass-hover cursor-pointer'
    : '';

  const glowStyles = glow
    ? 'shadow-glow-cyan/30 hover:shadow-glow-cyan/50'
    : '';

  const elevatedStyles = elevated
    ? 'shadow-floating'
    : '';

  const Component = onClick ? 'button' : 'div';

  const content = (
    <motion.div
      whileHover={animate || hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={animate ? { scale: 0.98 } : undefined}
      className={`${baseStyles} ${hoverStyles} ${glowStyles} ${elevatedStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );

  return content;
};
