import React, { useEffect, useRef, useState } from 'react';

interface AdaptiveHoverCardProps {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}

export const AdaptiveHoverCard: React.FC<AdaptiveHoverCardProps> = ({
  children,
  isVisible,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const [horizontalAlign, setHorizontalAlign] = useState<'center' | 'left' | 'right'>('center');

  useEffect(() => {
    if (!isVisible || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Check if card goes below viewport
    if (rect.bottom > viewportHeight - 20) {
      setPosition('top');
    } else {
      setPosition('bottom');
    }

    // Check horizontal positioning
    if (rect.left < 20) {
      setHorizontalAlign('left');
    } else if (rect.right > viewportWidth - 20) {
      setHorizontalAlign('right');
    } else {
      setHorizontalAlign('center');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getPositionClasses = () => {
    let classes = 'absolute z-50 w-80 bg-card border border-border rounded-lg shadow-card p-4 transition-smooth max-h-96 overflow-y-auto ';
    
    // Vertical positioning
    if (position === 'bottom') {
      classes += 'top-full mt-2 ';
    } else {
      classes += 'bottom-full mb-2 ';
    }

    // Horizontal positioning
    if (horizontalAlign === 'center') {
      classes += 'left-1/2 transform -translate-x-1/2 ';
    } else if (horizontalAlign === 'left') {
      classes += 'left-0 ';
    } else {
      classes += 'right-0 ';
    }

    return classes + className;
  };

  return (
    <div ref={cardRef} className={getPositionClasses()}>
      {children}
    </div>
  );
};
