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
  onClick?: () => void;
}

export default function Logo({ className = "h-11", showText = true, lang = 'en', isDarkBg = false, onClick }: LogoProps) {
  return (
    <div 
      className={`flex items-center gap-3 ${className} ${onClick ? 'cursor-pointer hover:opacity-85 active:scale-95 transition-all duration-150' : ''}`}
      onClick={onClick}
    >
      {/* Actual uploaded eco logo image replacement handled via direct public URL */}
      <img
        src="https://www.ecoplastegy.com/wp-content/uploads/2018/12/eco-logo-2.png"
        alt="Eco Logo"
        className="h-9 w-auto object-contain select-none rounded-md"
        referrerPolicy="no-referrer"
      />
      {showText && (
        <div className="flex flex-col select-none">
          <span className={`font-sans font-bold tracking-tight text-lg leading-none ${
            isDarkBg ? 'text-[#9BD326]' : 'text-[#5B850F] dark:text-[#9BD326]'
          }`}>
            {lang === 'ar' ? 'إيكو بلاست' : 'Eco Plast'}
          </span>
          <span className={`font-sans text-[10px] tracking-widest font-semibold uppercase leading-none mt-1 ${
            isDarkBg ? 'text-slate-400' : 'text-[#7EBA15] dark:text-[#87BF1C]'
          }`}>
            {lang === 'ar' ? 'المستودعات والتدوير' : 'Recycling & WMS'}
          </span>
        </div>
      )}
    </div>
  );
}
