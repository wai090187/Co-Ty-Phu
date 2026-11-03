import React from 'react';
import { Tile } from '../../../types/game';

interface Props {
  tile: Tile;
  jailMode?: 'prison' | 'investigation';
}

export const CornerTileContent: React.FC<Props> = ({ tile, jailMode = 'prison' }) => {
  if (tile.cornerType === 'go') {
    return (
      <div className="w-full h-full flex flex-col justify-between items-center text-center p-0.5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-tight text-red-600 block leading-tight">
            Trạm
          </span>
          <span className="text-xs sm:text-sm font-black uppercase text-red-600 tracking-wider block leading-tight">
            Khởi Hành
          </span>
        </div>
        <div className="relative w-10 h-5 overflow-hidden my-auto">
          <div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-amber-400 border-r-emerald-500 absolute top-0" />
        </div>
        <div className="text-[7.5px] font-bold text-red-700 bg-red-50 rounded px-1 py-0.2 border border-red-200">
          Đi qua 200đ · Dừng 400đ
        </div>
      </div>
    );
  }

  if (tile.cornerType === 'jail') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-0.5 text-center">
        <span className="text-[8px] font-bold text-slate-700 leading-tight">
          {jailMode === 'investigation' ? 'Khu Đ.Tra' : 'Thăm Tù'}
        </span>
        <div
          className={`w-8 h-8 mx-auto rounded-xs flex items-center justify-center relative overflow-hidden my-auto border-2 ${
            jailMode === 'investigation'
              ? 'bg-amber-100 border-amber-800'
              : 'bg-amber-900/10 border-slate-900'
          }`}
        >
          {jailMode === 'investigation' ? (
            <span className="text-sm">🔍</span>
          ) : (
            <>
              <div className="absolute inset-0 flex justify-evenly">
                <div className="w-[1.5px] h-full bg-slate-900" />
                <div className="w-[1.5px] h-full bg-slate-900" />
              </div>
              <span className="text-[7.5px] font-black text-slate-900 bg-white/90 px-1 rounded z-10">
                Ở TÙ
              </span>
            </>
          )}
        </div>
        <span className="text-[7px] font-semibold text-slate-500">Thăm nhận 100đ</span>
      </div>
    );
  }

  if (tile.cornerType === 'parking') {
    return (
      <div className="w-full h-full flex flex-col justify-between items-center text-center p-0.5">
        <span className="text-[10px] font-extrabold text-slate-900 uppercase leading-tight">
          Sân Bay
        </span>
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-rose-600 drop-shadow-xs my-auto">
          <path d="M16 3 L19 12 L29 16 L29 19 L19 17 L19 25 L23 28 L23 30 L16 29 L9 30 L9 28 L13 25 L13 17 L3 19 L3 16 L13 12 Z" />
        </svg>
        <span className="text-[7.5px] font-medium text-slate-600">Nghỉ an toàn</span>
      </div>
    );
  }

  if (tile.cornerType === 'gotojail') {
    return (
      <div className="w-full h-full flex flex-col justify-between items-center text-center p-0.5">
        <span className="text-[10px] font-extrabold text-red-700 uppercase leading-tight">
          {jailMode === 'investigation' ? 'Khởi Tố' : 'Vào Tù'}
        </span>
        <div className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center text-white my-auto shadow-inner border border-blue-950">
          {jailMode === 'investigation' ? (
            <span className="text-xs">🚨</span>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-amber-300">
              <path d="M12 2 L4 5 L4 11 C4 16.55 7.42 21.74 12 23 C16.58 21.74 20 16.55 20 11 L20 5 L12 2 Z" />
            </svg>
          )}
        </div>
        <span className="text-[7px] font-semibold text-red-600 leading-tight">
          {jailMode === 'investigation' ? 'Bị điều tra' : 'Bị bắt'}
        </span>
      </div>
    );
  }

  return null;
};
