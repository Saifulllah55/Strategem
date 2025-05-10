import React from 'react';

const Button = ({ children, variant = 'solid', size = 'base', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors';
  const variantClasses = variant === 'outline'
    ? 'border border-gray-400 text-gray-800 hover:bg-gray-100'
    : variant === 'ghost'
    ? 'text-gray-600 hover:bg-gray-100'
    : 'bg-black text-white hover:bg-gray-800';

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : '';

  return (
    <button className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
