/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  position: 'left' | 'right';
  title: string;
  icon?: string;
  children: React.ReactNode;
  widthClass?: string;
}

export const GameDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  position,
  title,
  icon,
  children,
  widthClass = 'w-80 sm:w-96',
}) => {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Container */}
      <div
        className={`absolute inset-y-0 ${
          position === 'left' ? 'left-0' : 'right-0'
        } max-w-full flex`}
      >
        <div
          className={`${widthClass} bg-slate-900 border-${
            position === 'left' ? 'r' : 'l'
          }-2 border-amber-600/80 shadow-2xl flex flex-col text-white animate-in ${
            position === 'left' ? 'slide-in-from-left' : 'slide-in-from-right'
          } duration-200`}
        >
          {/* Header */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon && <span className="text-lg">{icon}</span>}
              <h3 className="font-display font-black text-sm uppercase tracking-wide text-amber-400">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs transition-colors"
              title="Đóng (Esc)"
            >
              ✕
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2.5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
