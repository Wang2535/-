/**
 * 7阶段回合流程指示器
 * 规则依据: R4.2 回合流程
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TurnPhase } from '@/types/gameRules';

interface PhaseConfig {
  id: TurnPhase;
  name: string;
  icon: string;
  description: string;
  duration: number; // 预计持续时间(秒)
}

const PHASES: PhaseConfig[] = [
  { 
    id: 'judgment', 
    name: '判定阶段', 
    icon: '🎲', 
    description: '进行猜拳或骰子判定',
    duration: 15 
  },
  { 
    id: 'recovery', 
    name: '恢复阶段', 
    icon: '💰', 
    description: '恢复算力、资金、信息',
    duration: 3 
  },
  { 
    id: 'draw', 
    name: '抽卡阶段', 
    icon: '🎴', 
    description: '从牌库抽取卡牌',
    duration: 3 
  },
  { 
    id: 'action', 
    name: '行动阶段', 
    icon: '⚡', 
    description: '出牌、使用技能、移动标记',
    duration: 60 
  },
  { 
    id: 'response', 
    name: '响应阶段', 
    icon: '⚔️', 
    description: '响应对方行动',
    duration: 10 
  },
  { 
    id: 'discard', 
    name: '弃牌阶段', 
    icon: '🗑️', 
    description: '弃置多余手牌',
    duration: 15 
  },
  { 
    id: 'end', 
    name: '结束阶段', 
    icon: '🔚', 
    description: '触发结束效果',
    duration: 3 
  }
];

interface TurnPhaseIndicatorProps {
  currentPhase: TurnPhase;
  /** 当前轮次数 */
  roundNumber: number;
  /** 最大轮次数 */
  maxRounds: number;
  /** @deprecated 使用 roundNumber 替代 */
  turnNumber?: number;
  actionPoints: {
    current: number;
    max: number;
  };
  onPhaseClick?: (phase: TurnPhase) => void;
}

export function TurnPhaseIndicator({
  currentPhase,
  roundNumber,
  maxRounds,
  actionPoints,
  onPhaseClick
}: TurnPhaseIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const currentPhaseIndex = PHASES.findIndex(p => p.id === currentPhase);
  const currentPhaseConfig = PHASES[currentPhaseIndex];

  // 倒计时效果
  useEffect(() => {
    if (!currentPhaseConfig) return;
    
    setTimeRemaining(currentPhaseConfig.duration);
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPhase, currentPhaseConfig]);

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      {/* 回合信息 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">轮次</span>
          <span className="text-2xl font-bold text-white">{roundNumber}</span>
          <span className="text-slate-500">/ {maxRounds}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">行动点</span>
          <span className={cn(
            "text-xl font-bold",
            actionPoints.current === 0 ? "text-red-400" : "text-blue-400"
          )}>
            {actionPoints.current}
          </span>
          <span className="text-slate-500">/ {actionPoints.max}</span>
        </div>
      </div>

      {/* 阶段进度条 */}
      <div className="flex gap-1 mb-3">
        {PHASES.map((phase, index) => {
          const isActive = index === currentPhaseIndex;
          const isCompleted = index < currentPhaseIndex;
          
          return (
            <button
              key={phase.id}
              onClick={() => onPhaseClick?.(phase.id)}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-300",
                isActive && "bg-blue-500 animate-pulse",
                isCompleted && "bg-green-500",
                !isActive && !isCompleted && "bg-slate-700 hover:bg-slate-600"
              )}
              title={`${phase.name}: ${phase.description}`}
            />
          );
        })}
      </div>

      {/* 当前阶段信息 */}
      {currentPhaseConfig && (
        <div className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentPhaseConfig.icon}</span>
            <div>
              <div className="font-bold text-white">{currentPhaseConfig.name}</div>
              <div className="text-sm text-slate-400">{currentPhaseConfig.description}</div>
            </div>
          </div>
          <div className={cn(
            "text-xl font-mono font-bold",
            timeRemaining <= 5 ? "text-red-400 animate-pulse" : "text-blue-400"
          )}>
            {timeRemaining}s
          </div>
        </div>
      )}

      {/* 阶段列表 */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        {PHASES.map((phase, index) => {
          const isActive = index === currentPhaseIndex;
          const isCompleted = index < currentPhaseIndex;
          
          return (
            <button
              key={phase.id}
              onClick={() => onPhaseClick?.(phase.id)}
              className={cn(
                "p-2 rounded text-center transition-all duration-200",
                isActive && "bg-blue-600 text-white ring-2 ring-blue-400",
                isCompleted && "bg-green-900/50 text-green-400",
                !isActive && !isCompleted && "bg-slate-800 text-slate-400 hover:bg-slate-700"
              )}
            >
              <div className="text-lg mb-1">{phase.icon}</div>
              <div className="text-xs">{phase.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TurnPhaseIndicator;
