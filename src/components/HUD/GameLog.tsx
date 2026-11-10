import React, { useRef, useEffect, useState } from 'react';
import { LogEntry, Player, SpecialInvestigatorState, GameSettings } from '../../types/game';
import {
  GameLogExportContext,
  downloadGameLogFile,
  copyGameLogToClipboard,
} from '../../modules/game/utils/gameLogExporter';

interface Props {
  logs: LogEntry[];
  className?: string;
  exportContext?: {
    currentRound?: number;
    players?: Player[];
    activePlayer?: Player | null;
    investigator?: SpecialInvestigatorState;
    settings?: GameSettings;
  };
}

export const GameLog: React.FC<Props> = ({ logs, className, exportContext }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

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

  const getContext = (): GameLogExportContext => ({
    logs,
    currentRound: exportContext?.currentRound,
    players: exportContext?.players,
    activePlayer: exportContext?.activePlayer,
    investigator: exportContext?.investigator,
    settings: exportContext?.settings,
  });

  const handleDownload = (format: 'json' | 'txt') => {
    downloadGameLogFile(format, getContext());
    setShowExportMenu(false);
    setCopyFeedback(format === 'json' ? 'Đã tải file .json!' : 'Đã tải file .txt!');
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleCopy = async () => {
    const success = await copyGameLogToClipboard(getContext());
    setShowExportMenu(false);
    setCopyFeedback(success ? 'Đã sao chép log!' : 'Lỗi khi sao chép!');
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  return (
    <div
      className={`bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col shadow-xs select-none relative ${
        className || 'h-[450px] xl:h-[504px]'
      }`}
    >
      {/* Header with Title and Export Actions */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 relative">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-black text-xs text-slate-800 uppercase tracking-wider">
            Nhật Ký Bàn Cờ
          </span>
          <span className="text-[9px] px-1 py-0.2 rounded-full bg-slate-100 text-slate-500 font-mono font-bold">
            {logs.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {copyFeedback && (
            <span className="text-[10px] text-emerald-600 font-bold animate-in fade-in">
              ✓ {copyFeedback}
            </span>
          )}

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(prev => !prev)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 border border-slate-300 transition-colors cursor-pointer"
              title="Xuất file nhật ký để debug lỗi"
            >
              <span>📥</span>
              <span className="hidden sm:inline">Xuất Log</span>
            </button>

            {/* Dropdown Menu */}
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[9px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800">
                  Xuất Log Để Debug
                </div>
                <button
                  onClick={() => handleDownload('json')}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>📦</span>
                  <span>Tải file JSON (.json)</span>
                </button>
                <button
                  onClick={() => handleDownload('txt')}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>📄</span>
                  <span>Tải file Text (.txt)</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-800"
                >
                  <span>📋</span>
                  <span>Sao chép vào Clipboard</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logs Scrollable Stream */}
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
