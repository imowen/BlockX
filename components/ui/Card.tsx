import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-[24px] border border-apple-border/60 p-6 ${className}`}>
      {children}
    </div>
  );
};