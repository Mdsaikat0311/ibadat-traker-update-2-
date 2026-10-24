import React from 'react';

interface IslamicStarProps {
  number: number | string;
  size?: number; // size in pixels, default 34
  className?: string;
  numberClassName?: string;
}

/**
 * Islamic 8-Lobed Scalloped Rosette (Rub el Hizb / Quran Ayah Medallion)
 * Exact geometry and bronze/gold styling as shown in user screenshots.
 */
export const IslamicStar: React.FC<IslamicStarProps> = ({
  number,
  size = 34,
  className = '',
  numberClassName = 'text-[#2dd4bf] text-[11px] font-semibold'
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
        {/* Scalloped 8-lobe Rosette Fill & Outer Stroke */}
        <path
          d="M 83.3 36.2 A 14.5 14.5 0 0 1 83.3 63.8 A 14.5 14.5 0 0 1 63.8 83.3 A 14.5 14.5 0 0 1 36.2 83.3 A 14.5 14.5 0 0 1 16.7 63.8 A 14.5 14.5 0 0 1 16.7 36.2 A 14.5 14.5 0 0 1 36.2 16.7 A 14.5 14.5 0 0 1 63.8 16.7 A 14.5 14.5 0 0 1 83.3 36.2 Z"
          fill="#0c120f"
          stroke="#9c7c4b"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Inner thin decorative hairline ring */}
        <circle
          cx="50"
          cy="50"
          r="26"
          stroke="#735932"
          strokeWidth="1.2"
          strokeDasharray="2.5 2.5"
          opacity="0.8"
        />
      </svg>
      {/* Centered Number */}
      <span className={`absolute inset-0 flex items-center justify-center ${numberClassName}`}>
        {number}
      </span>
    </div>
  );
};

