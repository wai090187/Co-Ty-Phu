import React from 'react';
import { AbilityNotification } from '../../types/game';

interface Props {
  notification: AbilityNotification;
  onDismiss: () => void;
}

export const PermanentTriggerModal: React.FC<Props> = ({ notification, onDismiss }) => {
  const handleConfirm = () => {
    notification.action();
    onDismiss();
  };

  return (
    <div
      onClick={handleConfirm}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-150 cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-gradient-to-b from-[#FFFDF7] to-[#FEF9C3] border-3 border-amber-600 rounded-2xl shadow-2xl p-5 text-center flex flex-col items-center animate-bounce-once"
      >
        {/* Glowing Crown Icon */}
        <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-2xl shadow-inner mb-3">
          👑
        </div>

        <span className="text-[11px] font-black tracking-widest text-amber-800 uppercase block mb-1">
          KÍCH HOẠT NĂNG LỰC ĐẶC BIỆT
        </span>

        <h3 className="font-display text-lg font-black text-slate-900 uppercase mb-2">
          {notification.title}
        </h3>

        <div className="p-3 bg-white/90 border border-amber-300 rounded-xl text-xs text-slate-700 leading-relaxed font-medium mb-4 w-full shadow-xs">
          {notification.description}
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-transform active:scale-95"
        >
          Xác Nhận Kích Hoạt (Nhấn vào màn hình để tắt)
        </button>
      </div>
    </div>
  );
};
