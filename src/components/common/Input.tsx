import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  glow?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  glow = false,
  className = '',
  ...props
}) => {
  const inputStyles = glow
    ? 'border-glow-cyan/50 focus:border-glow-cyan focus:ring-glow-cyan/50 shadow-glow-cyan/20'
    : 'border-white/20 dark:border-gray-700/50 focus:ring-glow-cyan focus:border-glow-cyan';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-space-200 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-glow-cyan">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-4 py-3 rounded-xl border ${inputStyles} bg-white/5 dark:bg-gray-900/50 text-space-100 placeholder-space-500 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};
