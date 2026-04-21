"use client";

import React, { useState, useRef, useCallback } from 'react';

interface SwipeableCardProps {
  id: string;
  children: React.ReactNode;
  onDelete: (id: string) => void;
  noStyling?: boolean;
}

// Swipe-to-delete cards
export function SwipeableCard({ id, children, onDelete, noStyling }: SwipeableCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const startXRef = useRef(0);

  const DELETE_THRESHOLD = -80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    const clamped = Math.max(Math.min(deltaX, 0), -120);
    setOffsetX(clamped);
  }, [swiping]);

  const handleTouchEnd = useCallback(() => {
    if (offsetX < DELETE_THRESHOLD) {
      setOffsetX(-100);
      setSwiping(false);
      setConfirming(true);
    } else {
      setOffsetX(0);
      setSwiping(false);
      setConfirming(false);
    }
  }, [offsetX]);

  const handleSnapBack = useCallback(() => {
    setOffsetX(0);
    setConfirming(false);
  }, []);

  return (
    <div className={`relative overflow-hidden ${noStyling ? 'rounded-3xl' : 'rounded-2xl'}`}>
      {/* Delete zone behind the card */}
      <div
        className={`absolute inset-y-0 right-0 bg-red-500 ${noStyling ? 'rounded-r-3xl' : 'rounded-r-2xl'} flex items-center justify-end pr-6 w-32 transition-opacity duration-200 ${offsetX < 0 ? 'opacity-100' : 'opacity-0'}`}
        style={{ pointerEvents: confirming ? 'auto' : 'none' }}
        onClick={() => {
          if (confirming) onDelete(id);
        }}
      >
        <div className="flex flex-col items-center gap-0.5">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          <span className="text-[10px] text-white font-medium">Delete</span>
        </div>
      </div>

      {/* Swipeable card */}
      <div
        className={`relative w-full h-full transition-transform ${noStyling ? '' : 'bg-neutral-900 border border-neutral-800 rounded-2xl'}`}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (confirming) handleSnapBack();
        }}
      >
        {children}
      </div>
    </div>
  );
}
