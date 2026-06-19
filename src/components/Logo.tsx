/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  lang?: 'en' | 'ar';
  isDarkBg?: boolean;
}

export default function Logo({ className = "h-11", showText = true, lang = 'en', isDarkBg = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Dynamic Leaf Vector matching eco recycling leaves */}
      <svg
        viewBox="0 0 200 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full select-none"
      >
        {/* Left Leaves representing Eco recycling */}
        <path
          d="M35 55C15 50 12 25 38 18C44 28 42 48 35 55Z"
          fill="#10B981"
          className="animate-pulse"
        />
        <path
          d="M10 52C2 40 10 24 25 24C27 33 22 47 10 52Z"
          fill="#34D399"
        />
        <path
          d="M35 55C25 50 22 38 38 18"
          stroke="#065F46"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* e-c-o typography custom pathways */}
        {/* 'e' */}
        <path
          d="M75 50C75 58 65 62 58 58C52 54 50 45 55 38C60 32 72 32 75 42M52 44H75"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 'c' */}
        <path
          d="M108 38C104 33 92 33 88 42C85 50 92 58 104 56"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 'o' */}
        <path
          d="M125 57C135 57 141 50 141 44C141 38 135 31 125 31C115 31 109 38 109 44C109 50 115 57 125 57Z"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <div className="flex flex-col select-none">
          <span className={`font-sans font-bold tracking-tight text-lg leading-none ${
            isDarkBg ? 'text-[#10B981]' : 'text-emerald-800 dark:text-emerald-400'
          }`}>
            {lang === 'ar' ? 'إيكو بلاست' : 'Eco Plast'}
          </span>
          <span className={`font-sans text-[10px] tracking-widest font-semibold uppercase leading-none mt-1 ${
            isDarkBg ? 'text-slate-400' : 'text-emerald-600 dark:text-emerald-500'
          }`}>
            {lang === 'ar' ? 'المستودعات والتدوير' : 'Recycling & WMS'}
          </span>
        </div>
      )}
    </div>
  );
}
