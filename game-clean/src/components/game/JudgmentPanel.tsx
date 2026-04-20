/**
 * 判定面板 - 猜拳和骰子判定
 * 规则依据: R6.0 骰子判定 + R8.0 猜拳判定
 */

import { cn } from '@/lib/utils';
import { Hand, Scroll, Dices, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type RPSChoice = 'rock' | 'paper' | 'scissors';
export type JudgmentType = 'rps' | 'dice' | null;

interface RPSState {
  playerChoice?: RPSChoice;
  opponentChoice?: RPSChoice;
  playerCommitted: boolean;
  opponentCommitted: boolean;
  result?: 'win' | 'lose' | 'draw';
}

interface DiceState {
  playerRoll: number;
  opponentRoll?: number;
  difficulty: number;
  isCriticalSuccess: boolean;
  isCriticalFail: boolean;
  canReroll: boolean;
  hasRerolled: boolean;
}

interface JudgmentPanelProps {
  type: JudgmentType;
  rpsState?: RPSState;
  diceState?: DiceState;
  onRPSChoice: (choice: RPSChoice) => void;
  onRPSCommit: (commit: boolean) => void;
  onDiceRoll: () => void;
  onDiceReroll: () => void;
  onClose: () => void;
}

const RPS_CONFIG: Record<RPSChoice, { name: string; icon: React.ReactNode; beats: RPSChoice; loses: RPSChoice }> = {
  rock: {
    name: '石头',
    icon: <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-2xl">✊</div>,
    beats: 'scissors',
    loses: 'paper'
  },
  paper: {
    name: '布',
    icon: <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-2xl">✋</div>,
    beats: 'rock',
    loses: 'scissors'
  },
  scissors: {
    name: '剪刀',
    icon: <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-2xl">✌️</div>,
    beats: 'paper',
    loses: 'rock'
  }
};

export function JudgmentPanel({
  type,
  rpsState,
  diceState,
  onRPSChoice,
  onRPSCommit,
  onDiceRoll,
  onDiceReroll,
  onClose
}: JudgmentPanelProps) {
  if (!type) return null;

  const renderRPSPanel = () => {
    if (!rpsState) return null;

    const getResultDisplay = () => {
      if (!rpsState.result) return null;
      const configs = {
        win: { text: '胜利！', color: 'text-green-400', bg: 'bg-green-500/20' },
        lose: { text: '失败！', color: 'text-red-400', bg: 'bg-red-500/20' },
        draw: { text: '平局', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
      };
      const config = configs[rpsState.result];
      return (
        <div className={cn("p-4 rounded-lg text-center", config.bg)}>
          <div className={cn("text-2xl font-bold", config.color)}>{config.text}</div>
          <div className="text-sm text-slate-400 mt-1">
            {rpsState.result === 'win' && '你成功压制了对手！'}
            {rpsState.result === 'lose' && '对手占据了上风！'}
            {rpsState.result === 'draw' && '势均力敌，不分胜负！'}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {/* 资源投入选择 */}
        {!rpsState.playerCommitted && !rpsState.result && (
          <div className="p-4 bg-slate-800 rounded-lg">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span>💰</span> 资源投入
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onRPSCommit(true)}
                className="flex-1"
              >
                投入资源 (效果+50%)
              </Button>
              <Button
                variant="outline"
                onClick={() => onRPSCommit(false)}
                className="flex-1"
              >
                不投入资源
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              投入资源：效果+50%，但失败损失也+50%
            </p>
          </div>
        )}

        {/* 猜拳选择 */}
        {rpsState.playerCommitted && !rpsState.result && (
          <div className="p-4 bg-slate-800 rounded-lg">
            <h4 className="font-bold mb-3 text-center">选择你的出拳</h4>
            <div className="flex justify-center gap-4">
              {(Object.keys(RPS_CONFIG) as RPSChoice[]).map((choice) => (
                <button
                  key={choice}
                  onClick={() => onRPSChoice(choice)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg transition-all",
                    rpsState.playerChoice === choice
                      ? "bg-blue-600 ring-2 ring-blue-400 scale-110"
                      : "bg-slate-700 hover:bg-slate-600"
                  )}
                >
                  {RPS_CONFIG[choice].icon}
                  <span className="text-sm">{RPS_CONFIG[choice].name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 结果展示 */}
        {rpsState.result && (
          <div className="space-y-4">
            <div className="flex justify-center items-center gap-8">
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-2">你的选择</div>
                {rpsState.playerChoice && RPS_CONFIG[rpsState.playerChoice].icon}
                <div className="mt-2">{rpsState.playerChoice && RPS_CONFIG[rpsState.playerChoice].name}</div>
              </div>
              <div className="text-2xl font-bold text-slate-500">VS</div>
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-2">对手选择</div>
                {rpsState.opponentChoice && RPS_CONFIG[rpsState.opponentChoice].icon}
                <div className="mt-2">{rpsState.opponentChoice && RPS_CONFIG[rpsState.opponentChoice].name}</div>
              </div>
            </div>
            {getResultDisplay()}
          </div>
        )}

        {/* 规则说明 */}
        <div className="p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400">
          <div className="flex items-center gap-2 mb-2">
            <Scroll className="w-4 h-4" />
            <span className="font-medium">猜拳规则</span>
          </div>
          <ul className="space-y-1">
            <li>• 石头 克 剪刀 | 剪刀 克 布 | 布 克 石头</li>
            <li>• 胜利：触发卡牌效果</li>
            <li>• 平局：双方各抽1张卡</li>
            <li>• 失败：承受对方卡牌效果</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderDicePanel = () => {
    if (!diceState) return null;

    const getSuccessChance = () => {
      const needed = diceState.difficulty;
      const successSides = Math.max(0, 6 - needed + 1);
      return Math.round((successSides / 6) * 100);
    };

    return (
      <div className="space-y-4">
        {/* 难度和目标 */}
        <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
          <div>
            <div className="text-sm text-slate-400">判定难度</div>
            <div className="text-2xl font-bold">{diceState.difficulty}+</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">成功率</div>
            <div className="text-2xl font-bold text-blue-400">{getSuccessChance()}%</div>
          </div>
        </div>

        {/* 骰子展示 */}
        <div className="flex justify-center gap-8 py-4">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-2">你的骰子</div>
            <div className={cn(
              "w-20 h-20 rounded-xl flex items-center justify-center text-4xl font-bold transition-all",
              diceState.playerRoll >= diceState.difficulty
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white",
              diceState.isCriticalSuccess && "ring-4 ring-yellow-400 animate-pulse",
              diceState.isCriticalFail && "ring-4 ring-red-600 animate-shake"
            )}>
              {diceState.playerRoll}
            </div>
            {diceState.isCriticalSuccess && (
              <div className="mt-2 text-yellow-400 font-bold">🌟 大成功！</div>
            )}
            {diceState.isCriticalFail && (
              <div className="mt-2 text-red-400 font-bold">💀 大失败！</div>
            )}
          </div>

          {diceState.opponentRoll !== undefined && (
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-2">对手骰子</div>
              <div className="w-20 h-20 rounded-xl bg-slate-700 flex items-center justify-center text-4xl font-bold">
                {diceState.opponentRoll}
              </div>
            </div>
          )}
        </div>

        {/* 结果判定 */}
        {diceState.playerRoll > 0 && (
          <div className={cn(
            "p-4 rounded-lg text-center",
            diceState.playerRoll >= diceState.difficulty
              ? "bg-green-500/20 border border-green-500"
              : "bg-red-500/20 border border-red-500"
          )}>
            <div className={cn(
              "text-xl font-bold",
              diceState.playerRoll >= diceState.difficulty ? "text-green-400" : "text-red-400"
            )}>
              {diceState.playerRoll >= diceState.difficulty ? '判定成功！' : '判定失败！'}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              需要 {diceState.difficulty}+，掷出了 {diceState.playerRoll}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {diceState.playerRoll === 0 ? (
            <Button onClick={onDiceRoll} className="flex-1">
              <Dices className="w-4 h-4 mr-2" />
              投掷骰子
            </Button>
          ) : (
            <>
              {diceState.canReroll && !diceState.hasRerolled && (
                <Button onClick={onDiceReroll} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重投骰子
                </Button>
              )}
              <Button onClick={onClose} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                确认结果
              </Button>
            </>
          )}
        </div>

        {/* 规则说明 */}
        <div className="p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400">
          <div className="flex items-center gap-2 mb-2">
            <Scroll className="w-4 h-4" />
            <span className="font-medium">骰子规则</span>
          </div>
          <ul className="space-y-1">
            <li>• 6 = 大成功：效果翻倍，额外抽1张卡</li>
            <li>• 1 = 大失败：触发负面效果</li>
            <li>• 判定值 ≥ 难度 = 成功</li>
            <li>• 每回合可重投1次</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {type === 'rps' ? (
              <><Hand className="w-6 h-6" /> 猜拳判定</>
            ) : (
              <><Dices className="w-6 h-6" /> 骰子判定</>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {type === 'rps' ? renderRPSPanel() : renderDicePanel()}
        </div>
      </div>
    </div>
  );
}

export default JudgmentPanel;
