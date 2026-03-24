'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  term: string;
  explanation: string;
  children: React.ReactNode;
}

export default function TermPopover({ term, explanation, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <span ref={ref} className="relative inline">
      <span
        onClick={() => setIsOpen(!isOpen)}
        className="underline decoration-blue-400 decoration-dotted underline-offset-2 cursor-pointer hover:bg-blue-50 rounded px-0.5 transition-colors"
      >
        {children}
      </span>
      {isOpen && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
          <span className="block font-semibold text-blue-600 mb-1">{term}</span>
          <span className="block text-gray-600 text-xs leading-relaxed">{explanation}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
        </span>
      )}
    </span>
  );
}
