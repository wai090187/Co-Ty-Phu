import React, { useEffect, useState } from 'react';
import { CharacterEvent, Player } from '../../types/game';
import { CharacterIllustration2D5 } from '../Common/CharacterIllustration2D5';

interface Props {
  event: CharacterEvent | null;
  player: Player | undefined;
  onDismiss: () => void;
}

export const CharacterEventStage: React.FC<Props> = ({ event, player, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event && player) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [event, player, onDismiss]);

  if (!event || !player || !visible) return null;

  return (
    <div
      onClick={onDismiss}
      className="fixed bottom-6 right-6 z-50 pointer-events-auto flex items-end animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="bg-slate-900/95 border-2 border-amber-500 rounded-3xl p-4 shadow-2xl backdrop-blur-md flex items-center gap-4 text-white max-w-sm">
        {/* 2.5D Full-body Illustration */}
        <div className="relative shrink-0">
          <CharacterIllustration2D5
            characterId={player.characterId}
            isAI={player.isAI}
            aiNumber={player.id}
            aiLevel={player.aiLevel}
            emotion={event.emotion}
            size="md"
            showPedestal={true}
          />
        </div>

        {/* Event Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">
              {event.type === 'buy_property' && '🏠'}
              {event.type === 'upgrade_house' && '🔨'}
              {event.type === 'use_ability' && '⚡'}
              {event.type === 'open_inventory' && '🎒'}
              {event.type === 'investigation_jailed' && '🚨'}
              {event.type === 'cleared_investigation' && '🕊️'}
              {event.type === 'money_transfer' && '💰'}
            </span>
            <span className="font-display font-black text-xs text-amber-400 uppercase tracking-wide truncate">
              {event.title}
            </span>
          </div>

          <p className="text-xs font-bold text-slate-100 leading-snug">
            {event.message}
          </p>

          {event.subMessage && (
            <p className="text-[11px] text-slate-300 mt-1">
              {event.subMessage}
            </p>
          )}

          {event.amount !== undefined && (
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded font-mono font-bold text-xs ${
                event.emotion === 'happy'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                  : 'bg-rose-950 text-rose-300 border border-rose-500'
              }`}
            >
              {event.amount > 0 ? `+${event.amount}đ` : `${event.amount}đ`}
            </span>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            setVisible(false);
            onDismiss();
          }}
          className="self-start text-slate-400 hover:text-white font-bold text-xs p-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
