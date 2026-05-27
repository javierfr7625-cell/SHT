import React from 'react';

export default function Logo({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Premium circular badge with purple-to-indigo gradient */}
      <rect 
        x="2" 
        y="2" 
        width="20" 
        height="20" 
        rx="6" 
        fill="url(#logo-grad-bg)" 
      />
      
      {/* Thick clean checkmark representing completion */}
      <path 
        d="M7.5 12L10.5 15L16.5 9" 
        stroke="white" 
        strokeWidth="2.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      <defs>
        <linearGradient id="logo-grad-bg" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" /> {/* purple-500 */}
          <stop offset="1" stopColor="#4f46e5" /> {/* indigo-600 */}
        </linearGradient>
      </defs>
    </svg>
  );
}
