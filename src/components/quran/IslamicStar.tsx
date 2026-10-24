import React from 'react';

interface IslamicStarProps {
  number: number | string;
  size?: number; // size in pixels, default 36
  className?: string;
  numberClassName?: string;
}

/**
 * Islamic 8-Pointed Star (Rub el Hizb)
 * Exact geometry and bronze/gold styling as shown in user screenshots.
 */
export const IslamicStar: React.FC<IslamicStarProps> = ({
  number,
  size = 38,
  className = '',
  numberClassName = 'text-[#2dd4bf] text-xs font-semibold'
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Subtle Fill */}
        <path
          d="M50 0 L64.64 14.64 L85.36 14.64 L85.36 35.36 L100 50 L85.36 64.64 L85.36 85.36 L64.64 85.36 L50 100 L35.36 85.36 L14.64 85.36 L14.64 64.64 L0 50 L14.64 35.36 L14.64 14.64 L35.36 14.64 Z"
          fill="#121a16"
        />
        {/* Outer 8-point geometric star border */}
        <path
          d="M50 2 L64 16 L84 16 L84 36 L98 50 L84 64 L84 84 L64 84 L50 98 L36 84 L16 84 L16 64 L2 50 L16 36 L16 16 L36 16 Z"
          stroke="#8f7347"
          strokeWidth="3.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Subtle inner decorative rim */}
        <circle
          cx="50"
          cy="50"
          r="26"
          stroke="#5a472c"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.6"
        />
      </svg>
      {/* Centered Number */}
      <span className={`absolute inset-0 flex items-center justify-center ${numberClassName}`}>
        {number}
      </span>
    </div>
  );
};
