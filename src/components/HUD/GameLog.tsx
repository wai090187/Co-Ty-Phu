import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../../types/game';

interface Props {
  logs: LogEntry[];
}

export const GameLog: React.FC<Props> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogBadge = (type: LogEntry['type']) => {
    switch (type) {
      case 'money':
        return <span className="text-emerald-700 font-bold shrink-0">[$]</span>;
      case 'jail':
        return <span className="text-red-600 font-bold shrink-0">[TÙ]</span>;
      case 'ability':
        return <span className="text-purple-600 font-bold shrink-0">[PHÉP]</span>;
      case 'property':
        return <span className="text-amber-700 font-bold shrink-0">[ĐẤT]</span>;
      default:
        return <span className="text-slate-500 font-bold shrink-0">[!]</span>;
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col h-44 shadow-xs select-none">
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
        <span className="font-display font-black text-xs text-slate-800 uppercase tracking-wider">
          Nhật Ký Bàn Cờ
        </span>
        <span className="text-[10px] text-slate-400">Live Feed</span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto flex flex-col gap-1.5 text-xs text-slate-700 font-medium pr-1"
      >
        {logs.length === 0 ? (
          <span className="text-slate-400 italic text-[11px] my-auto text-center">
            Trận đấu chuẩn bị bắt đầu...
          </span>
        ) : (
          logs.map(log => (
            <div key={log.id} className="flex items-start gap-1.5 leading-snug">
              {getLogBadge(log.type)}
              <span>{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
