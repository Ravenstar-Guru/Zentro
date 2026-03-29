import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  as?: 'button' | 'link';
  to?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  as = 'button',
  to,
  onClick,
  ...rest
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm';

  const variants = {
    primary: 'bg-gradient-to-r from-glow-cyan to-glow-blue text-white shadow-lg hover:shadow-xl hover:shadow-glow-cyan/50 hover:scale-105',
    glow: 'bg-gradient-to-r from-glow-cyan to-glow-purple text-white shadow-lg shadow-glow-cyan/50 hover:shadow-glow-cyan/70 hover:scale-105 animate-pulse-glow',
    secondary: 'bg-white/10 dark:bg-gray-800/80 text-space-100 border border-white/20 dark:border-gray-700/50 hover:bg-white/20 dark:hover:bg-gray-700/80 backdrop-blur-sm',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/50 hover:scale-105',
    ghost: 'bg-transparent text-glow-cyan hover:bg-glow-cyan/10 border border-glow-cyan/30 hover:border-glow-cyan/50'
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  };

  if (as === 'link') {
    return (
      <Link
        to={to || '#'}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        aria-disabled={disabled || loading}
        onClick={onClick as any}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        )}
        {!loading && icon}
        {children}
      </Link>
    );
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      )}
      {!loading && icon}
      {children}
    </button>
  );
};
