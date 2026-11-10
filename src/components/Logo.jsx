import React from 'react';

const MARK = {
  sm: 'w-7 h-8',
  md: 'w-9 h-10',
  lg: 'w-12 h-[3.35rem]'
};

const WORD = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl'
};

export default function Logo({ size = 'md', className = '' }) {
  return (
    <span className={`inline-flex items-end gap-2 text-gov-forest ${className}`}>
      <img src="/petapuk-mark.svg" alt="" className={`${MARK[size]} shrink-0 object-contain`} />
      <span className={`font-sans font-bold leading-none tracking-tight ${WORD[size]}`}>PetaPuk</span>
    </span>
  );
}
