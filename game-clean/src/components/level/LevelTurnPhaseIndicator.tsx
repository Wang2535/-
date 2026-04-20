/**
 * 关卡模式回合阶段指示器
 * 参考对战模式的TurnPhaseIndicator设计
 */

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { LevelTurnPhase, AIOperationLog } from '@/types/levelTypes';
import { LEVEL_PHASE_NAMES } from '@/types/levelTypes';
import { PhaseTimerEventBus } from '@/engine/PhaseTimerEventBus';

export type TurnActor = 'player' | 'dadong' | 'enemy' | 'enemy2';

interface PhaseConfig {
  id: LevelTurnPhase;
  name: string;
  icon: string;
  description: string;
  duration: number;
}

const PHASES: PhaseConfig[] = [
  { id: 'judgment', name: '判定阶段', icon: '⚖️', description: '进行猜拳或骰子判定', duration: 15 },
  { id: 'recovery', name: '恢复阶段', icon: '💫', description: '恢复算力、资金、信息', duration: 3 },
  { id: 'draw', name: '摸牌阶段', icon: '🎴', description: '从牌库抽取卡牌', duration: 3 },
  { id: 'action', name: '行动阶段', icon: '⚡', description: '出牌、使用技能、移动标记', duration: 60 },
  { id: 'response', name: '响应阶段', icon: '⏱️', description: '响应对方行动', duration: 10 },
  { id: 'discard', name: '弃牌阶段', icon: '🗑️', description: '弃置多余手牌', duration: 15 },
  { id: 'end', name: '结束阶段', icon: '🏁', description: '触发结束效果', duration: 3 }
];

const ACTOR_CONFIG: Record<TurnActor, { name: string; color: string; bgColor: string; icon: string }> = {
  player: { name: '小白', color: 'text-blue-400', bgColor: 'bg-blue-500', icon: '🧑‍💻' },
  dadong: { name: '大东', color: 'text-emerald-400', bgColor: 'bg-emerald-500', icon: '🤖' },
  enemy: { name: '敌人1', color: 'text-red-400', bgColor: 'bg-red-500', icon: '👹' },
  enemy2: { name: '敌人2', color: 'text-orange-400', bgColor: 'bg-orange-500', icon: '👺' }
};

interface LevelTurnPhaseIndicatorProps {
  currentPhase: LevelTurnPhase;
  currentActor: TurnActor;
  roundNumber: number;
  maxRounds: number;
  actionPoints: { current: number; max: number };
  onPhaseClick?: (phase: LevelTurnPhase) => void;
  showActorInfo?: boolean;
  aiOperationLogs?: AIOperationLog[];
  showAIOperations?: boolean;
}

export function LevelTurnPhaseIndicator({
  currentPhase,
  currentActor,
  roundNumber,
  maxRounds,
  actionPoints,
  onPhaseClick,
  showActorInfo = true,
  aiOperationLogs = [],
  showAIOperations = true
}: LevelTurnPhaseIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentAIPhase, setCurrentAIPhase] = useState<LevelTurnPhase | null>(null);
  const [aiPhaseProgress, setAIPhaseProgress] = useState<string>('');
  const [phaseTransitioning, setPhaseTransitioning] = useState(false);
  const prevPhaseRef = useRef<LevelTurnPhase | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  const currentPhaseIndex = PHASES.findIndex(p => p.id === currentPhase);
  const currentPhaseConfig = PHASES[currentPhaseIndex];
  const actorConfig = ACTOR_CONFIG[currentActor];

  useEffect(() => {
    if (currentActor !== 'player' && aiOperationLogs.length > 0) {
      const latestLog = aiOperationLogs[aiOperationLogs.length - 1];
      setCurrentAIPhase(latestLog.phase);
      setAIPhaseProgress(latestLog.description);
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiOperationLogs, currentActor]);

  useEffect(() => {
    if (prevPhaseRef.current !== null && prevPhaseRef.current !== currentPhase) {
      setPhaseTransitioning(true);
      setTimeout(() => setPhaseTransitioning(false), 300);
    }
    prevPhaseRef.current = currentPhase;

    if (!currentPhaseConfig) return;
    setTimeRemaining(currentPhaseConfig.duration);
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          PhaseTimerEventBus.triggerTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const unsubscribeAddTime = PhaseTimerEventBus.onAddTime((seconds: number) => {
      setTimeRemaining(prev => prev + seconds);
    });
    
    return () => {
      clearInterval(timer);
      unsubscribeAddTime();
    };
  }, [currentPhase, currentPhaseConfig]);

  return (
    <div className={cn(
      "bg-slate-900 rounded-lg p-4 border border-slate-700 shadow-lg transition-all duration-300",
      phaseTransitioning && "ring-2 ring-cyan-400/50"
    )}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">轮次</span>
          <span className="text-2xl font-bold text-white">{roundNumber}</span>
          <span className="text-slate-500">/ {maxRounds}</span>
        </div>
        
        {showActorInfo && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 transition-all duration-300",
            phaseTransitioning && "scale-105"
          )}>
            <span className="text-lg">{actorConfig.icon}</span>
            <span className={cn("font-semibold", actorConfig.color)}>
              {actorConfig.name}的回合
            </span>
          </div>
        )}
        
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

      <div className="flex gap-1 mb-3">
        {PHASES.map((phase, index) => {
          const isActive = index === currentPhaseIndex;
          const isCompleted = index < currentPhaseIndex;
          return (
            <button
              key={phase.id}
              onClick={() => onPhaseClick?.(phase.id)}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-500 ease-out",
                isActive && cn(
                  "animate-pulse",
                  actorConfig.bgColor,
                  "scale-y-125",
                  phaseTransitioning && "scale-y-150"
                ),
                isCompleted && "bg-green-500",
                !isActive && !isCompleted && "bg-slate-700 hover:bg-slate-600"
              )}
              title={`${phase.icon} ${phase.name}: ${phase.description}`}
            />
          );
        })}
      </div>

      <div className={cn(
        "flex items-center justify-between transition-all duration-300",
        phaseTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
      )}>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-2xl transition-all duration-300",
            phaseTransitioning && "scale-125 rotate-5"
          )}>
            {currentPhaseConfig?.icon}
          </span>
          <div>
            <div className={cn("font-semibold", actorConfig.color)}>
              {currentPhaseConfig?.name}
            </div>
            <div className="text-xs text-slate-400">
              {currentPhaseConfig?.description}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-slate-400">剩余时间</div>
          <div className={cn(
            "font-mono font-bold transition-all duration-200",
            timeRemaining <= 5 ? "text-red-400 animate-pulse" : "text-slate-300"
          )}>
            {timeRemaining}s
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {PHASES.map((phase, index) => {
          const isActive = index === currentPhaseIndex;
          const isCompleted = index < currentPhaseIndex;
          return (
            <div
              key={phase.id}
              className={cn(
                "text-center py-1 px-1 rounded text-[10px] transition-all duration-400",
                isActive && cn(
                  "bg-slate-700 font-semibold",
                  actorConfig.color,
                  "scale-110 shadow-lg",
                  phaseTransitioning && "scale-125"
                ),
                isCompleted && "text-green-400 bg-green-900/20",
                !isActive && !isCompleted && "text-slate-500"
              )}
            >
              <div className="mb-0.5">{phase.icon}</div>
              <div className="truncate">{phase.name.slice(0, 2)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LevelTurnPhaseIndicator;
