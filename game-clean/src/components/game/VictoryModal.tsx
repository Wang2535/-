import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VictoryResult } from '@/engine/VictoryConditionSystem';
import type { GameLogEntry } from '@/types/gameRules';

interface VictoryModalProps {
  victoryResult: VictoryResult | null;
  isOpen: boolean;
  onClose: () => void;
  onBackToLobby: () => void;
  gameLogs: GameLogEntry[];
  totalRounds: number;
}

const VICTORY_TYPE_NAMES: Record<string, string> = {
  complete_infiltration: '完全渗透',
  security_collapse: '安全瓦解',
  rapid_attack: '速攻胜利',
  absolute_security: '绝对安全',
  threat_elimination: '威胁清除',
  counter_attack: '反击胜利',
  timeout: '时间耗尽',
};

const VICTORY_TYPE_DESCRIPTIONS: Record<string, string> = {
  complete_infiltration: '进攻方成功控制了整个系统（渗透等级达到75并持续2个轮次）',
  security_collapse: '安全瓦解！防御系统完全崩溃（第7轮次后防守方安全等级降至0）',
  rapid_attack: '闪电战击溃防御（第6轮次前渗透等级≥50且防御方安全等级<50）',
  absolute_security: '防守方成功抵御了所有攻击（安全等级达到75并持续2个轮次）',
  threat_elimination: '威胁清除！进攻方渗透等级降至0（第7轮次后）',
  counter_attack: '防守方成功反击（第6轮次前安全等级≥50且进攻方渗透等级<50）',
  timeout: '游戏时间耗尽，根据当前状态判定胜负',
};

export function VictoryModal({
  victoryResult,
  isOpen,
  onClose,
  onBackToLobby,
  gameLogs,
  totalRounds,
}: VictoryModalProps) {
  const [showReplay, setShowReplay] = useState(false);
  const [replayRound, setReplayRound] = useState(1);

  useEffect(() => {
    if (isOpen && victoryResult) {
      console.log('[VictoryModal] 胜利结果:', victoryResult);
    }
  }, [isOpen, victoryResult]);

  if (!isOpen || !victoryResult) return null;

  const winnerName = victoryResult.winner === 'attacker' ? '进攻方' : '防守方';
  const winnerColor = victoryResult.winner === 'attacker' ? 'text-red-400' : 'text-blue-400';
  const victoryTypeName = VICTORY_TYPE_NAMES[victoryResult.victoryType || ''] || '未知胜利';
  const victoryDescription = VICTORY_TYPE_DESCRIPTIONS[victoryResult.victoryType || ''] || '';

  // 按轮次分组日志
  const logsByRound = gameLogs.reduce((acc, log) => {
    const round = log.round || 1;
    if (!acc[round]) acc[round] = [];
    acc[round].push(log);
    return acc;
  }, {} as Record<number, GameLogEntry[]>);

  const maxRound = Math.max(...Object.keys(logsByRound).map(Number), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 胜利标题 */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-white mb-2">游戏结束</h1>
          <div className={`text-2xl font-bold ${winnerColor}`}>
            {winnerName} 获胜！
          </div>
          <Badge variant="outline" className="mt-2 text-white border-white/30">
            {victoryTypeName}
          </Badge>
        </div>

        {/* 胜利信息 */}
        <div className="p-6 border-b border-slate-700">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-slate-400 text-sm mb-1">胜利方式</div>
              <div className="text-white font-bold">{victoryTypeName}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-slate-400 text-sm mb-1">游戏轮次</div>
              <div className="text-white font-bold">{totalRounds} 轮</div>
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="text-slate-300 text-sm">
              {victoryDescription}
            </div>
          </div>
        </div>

        {/* 功能按钮 */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setShowReplay(!showReplay)}
              variant="outline"
              className="px-6 py-3"
            >
              {showReplay ? '隐藏复盘' : '全局复盘'}
            </Button>
            <Button
              onClick={onBackToLobby}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700"
            >
              返回主界面
            </Button>
          </div>
        </div>

        {/* 全局复盘 */}
        {showReplay && (
          <div className="p-6 max-h-[400px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">游戏日志复盘</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReplayRound(Math.max(1, replayRound - 1))}
                  disabled={replayRound <= 1}
                >
                  上一轮
                </Button>
                <span className="text-slate-400">
                  第 {replayRound} / {maxRound} 轮
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReplayRound(Math.min(maxRound, replayRound + 1))}
                  disabled={replayRound >= maxRound}
                >
                  下一轮
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {(logsByRound[replayRound] || []).map((log, index) => (
                <div
                  key={log.id || index}
                  className="bg-slate-800/50 p-3 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <span className="text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {log.action}
                    </Badge>
                  </div>
                  <div className="text-slate-200">{log.message}</div>
                </div>
              ))}
              {(!logsByRound[replayRound] || logsByRound[replayRound].length === 0) && (
                <div className="text-center text-slate-500 py-8">
                  该轮次暂无日志记录
                </div>
              )}
            </div>
          </div>
        )}

        {/* 关闭按钮 */}
        <div className="p-4 border-t border-slate-700 flex justify-end">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VictoryModal;
