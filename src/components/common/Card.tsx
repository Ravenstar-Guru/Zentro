import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  animate = false
}) => {
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 transition-all duration-300';

  const hoverStyles = hover
    ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
    : '';

  const Component = onClick ? 'button' : 'div';

  const content = (
    <motion.div
      whileHover={animate ? { scale: 1.02 } : undefined}
      whileTap={animate ? { scale: 0.98 } : undefined}
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );

  return content;
};
