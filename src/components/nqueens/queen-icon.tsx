'use client';

import React from 'react';

interface QueenIconProps {
  className?: string;
  style?: React.CSSProperties;
  conflict?: boolean;
}

export function QueenIcon({ className = '', style, conflict }: QueenIconProps) {
  return (
    <svg
      viewBox="0 0 45 45"
      className={className}
      style={style}
      aria-label="Chess Queen"
    >
      <g
        style={{
          fill: conflict ? '#ef4444' : '#1a1a2e',
          stroke: conflict ? '#ef4444' : '#1a1a2e',
          strokeWidth: 1.5,
          strokeLinejoin: 'round',
        }}
      >
        {/* Crown tips */}
        <path d="M 8,12 A 2,2 0 1,1 4,12 A 2,2 0 1,1 8,12 M 24,8 A 2,2 0 1,1 20,8 A 2,2 0 1,1 24,8 M 40,12 A 2,2 0 1,1 36,12 A 2,2 0 1,1 40,12" />
        {/* Crown body */}
        <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13 L 9,26 Z" style={{ strokeLinecap: 'butt' }} />
        {/* Upper base */}
        <path d="M 9,26 C 9,28 10.5,29.5 12,30 C 15,30 20,31 22.5,31 C 25,31 30,30 33,30 C 34.5,29.5 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 Z" />
        {/* Lower base */}
        <path d="M 12,30 C 12,32 14,33.5 15.5,34.5 C 18,35.5 21,36 22.5,36 C 24,36 27,35.5 29.5,34.5 C 31,33.5 33,32 33,30 C 30,30 24.5,31 22.5,31 C 20.5,31 15,30 12,30 Z" />
        {/* Bottom */}
        <path d="M 12,33.5 C 12,35.5 14,38.5 16,39.5 C 18,40.5 20.5,41 22.5,41 C 24.5,41 27,40.5 29,39.5 C 31,38.5 33,35.5 33,33.5 C 30,34 25,34.5 22.5,34.5 C 20,34.5 15,34 12,33.5 Z" />
      </g>
    </svg>
  );
}
