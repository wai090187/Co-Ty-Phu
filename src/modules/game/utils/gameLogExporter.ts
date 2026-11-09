/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APP_VERSION } from '../../../constants/version';
import { LogEntry, Player, SpecialInvestigatorState, GameSettings } from '../../../types/game';

export interface GameLogExportContext {
  logs: LogEntry[];
  currentRound?: number;
  players?: Player[];
  activePlayer?: Player | null;
  investigator?: SpecialInvestigatorState;
  settings?: GameSettings;
}

/**
 * Builds a structured debug JSON object for full diagnostics.
 */
export function buildGameLogDebugJson(ctx: GameLogExportContext) {
  return {
    appName: 'Co Ty Phu Viet Nam',
    version: APP_VERSION,
    exportTimestamp: new Date().toISOString(),
    matchState: {
      currentRound: ctx.currentRound ?? 1,
      activePlayerName: ctx.activePlayer?.name ?? null,
      activePlayerId: ctx.activePlayer?.id ?? null,
    },
    investigator: ctx.investigator
      ? {
          active: ctx.investigator.active,
          position: ctx.investigator.position,
          lapsCompleted: ctx.investigator.lapsCompleted,
          currentAbilityId: ctx.investigator.currentAbilityId,
          usedAbilityIds: ctx.investigator.usedAbilityIds,
        }
      : null,
    players: (ctx.players || []).map(p => ({
      id: p.id,
      name: p.name,
      isAI: p.isAI,
      aiLevel: p.aiLevel,
      cash: p.cash,
      position: p.position,
      inJail: p.inJail,
      jailTurns: p.jailTurns,
      bankrupt: p.bankrupt,
      propertiesOwnedCount: p.propertiesOwned.length,
      propertiesOwnedIds: p.propertiesOwned,
      houses: p.houses,
      mortgaged: p.mortgaged,
      consumableAbilities: p.consumableAbilities,
      permanentAbilities: p.permanentAbilities,
      getOutOfJailCards: p.getOutOfJailCards,
    })),
    settings: ctx.settings ?? null,
    totalLogsCount: ctx.logs.length,
    logs: ctx.logs.map((log, index) => ({
      index: index + 1,
      id: log.id,
      timestamp: log.timestamp ? new Date(log.timestamp).toISOString() : null,
      type: log.type,
      text: log.text,
    })),
  };
}

/**
 * Builds a human-readable text log for quick review and pasting into prompts.
 */
export function buildGameLogText(ctx: GameLogExportContext): string {
  const now = new Date();
  const divider = '='.repeat(60);
  const subDivider = '-'.repeat(60);

  const lines: string[] = [
    divider,
    `📜 NHẬT KÝ VÁN ĐẤU CỜ TỶ PHÚ VIỆT NAM (DEBUG LOG)`,
    `Phiên bản: ${APP_VERSION} | Thời gian xuất: ${now.toLocaleString('vi-VN')} (${now.toISOString()})`,
    `Vòng hiện tại: ${ctx.currentRound ?? 1} | Lượt hiện tại: ${ctx.activePlayer?.name ?? 'Chưa xác định'}`,
    divider,
    '',
    '👥 THÔNG TIN NGƯỜI CHƠI:',
  ];

  (ctx.players || []).forEach(p => {
    lines.push(
      `  • [${p.id}] ${p.name}${p.isAI ? ` (AI: ${p.aiLevel})` : ' (Người chơi)'}: ` +
        `Tiền: ${p.cash}đ | Vị trí: Ô ${p.position} | ${p.inJail ? `[ĐANG TRONG TÙ ${p.jailTurns} lượt]` : 'Tự do'} | ` +
        `BĐS: ${p.propertiesOwned.length} ô | Phép vĩnh viễn: [${p.permanentAbilities.join(', ') || 'không'}] | Phép 1 lần: [${p.consumableAbilities.join(', ') || 'không'}]`
    );
  });

  if (ctx.investigator) {
    lines.push('');
    lines.push('🕵️‍♂️ ĐIỀU TRA VIÊN:');
    lines.push(
      `  • Kích hoạt: ${ctx.investigator.active ? 'CÓ' : 'CHƯA'} | Vị trí: Ô ${ctx.investigator.position} | Đã tuần tra: ${ctx.investigator.lapsCompleted} vòng | Năng lực hiện tại: [${ctx.investigator.currentAbilityId || 'Chưa kích hoạt'}]`
    );
  }

  lines.push('');
  lines.push(subDivider);
  lines.push(`📝 CHI TIẾT TỪNG DÒNG NHẬT KÝ (${ctx.logs.length} sự kiện):`);
  lines.push(subDivider);

  ctx.logs.forEach((log, idx) => {
    const timeStr = log.timestamp
      ? new Date(log.timestamp).toLocaleTimeString('vi-VN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : '--:--:--';
    const tag = log.type ? `[${log.type.toUpperCase()}]` : '[INFO]';
    lines.push(`[#${idx + 1}] [${timeStr}] ${tag} ${log.text}`);
  });

  lines.push(divider);
  lines.push(`--- HẾT NHẬT KÝ ---`);

  return lines.join('\n');
}

/**
 * Triggers a download of the match log file in either JSON or TXT format.
 */
export function downloadGameLogFile(
  format: 'json' | 'txt',
  ctx: GameLogExportContext
): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const round = ctx.currentRound ?? 1;

  let content: string;
  let filename: string;
  let mimeType: string;

  if (format === 'json') {
    content = JSON.stringify(buildGameLogDebugJson(ctx), null, 2);
    filename = `monopoly-debug-round${round}-${timestamp}.json`;
    mimeType = 'application/json';
  } else {
    content = buildGameLogText(ctx);
    filename = `monopoly-debug-round${round}-${timestamp}.txt`;
    mimeType = 'text/plain;charset=utf-8';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies the text debug log to user clipboard.
 */
export async function copyGameLogToClipboard(
  ctx: GameLogExportContext
): Promise<boolean> {
  try {
    const text = buildGameLogText(ctx);
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy game log to clipboard:', err);
    return false;
  }
}
