import React from 'react';

interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollContainer: React.FC<ScrollContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`
        overflow-x-auto overflow-y-visible 
        scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 
        hover:scrollbar-thumb-white/40 
        pb-8 
        ${className}
      `}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
      }}
    >
      {children}
    </div>
  );
};
