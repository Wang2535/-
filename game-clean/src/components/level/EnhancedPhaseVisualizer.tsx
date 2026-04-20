import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { LevelTurnPhase, AIOperationLog } from '@/types/levelTypes';
import { LEVEL_PHASE_NAMES } from '@/types/levelTypes';
import {
  Scale,
  Sparkles,
  HandCoins,
  Zap,
  Timer,
  Trash2,
  Flag,
  CheckCircle2
} from 'lucide-react';

export type TurnActor = 'player' | 'dadong' | 'enemy';

interface PhaseConfig {
  id: LevelTurnPhase;
  name: string;
  icon: React.ReactNode;
  description: string;
  duration: number;
  color: string;
  gradient: string;
}

const PHASES: PhaseConfig[] = [
  {
    id: 'judgment',
    name: '判定阶段',
    icon: <Scale className="w-5 h-5" />,
    description: '进行判定，触发效果',
    duration: 15,
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'recovery',
    name: '恢复阶段',
    icon: <Sparkles className="w-5 h-5" />,
    description: '恢复算力、资金、信息',
    duration: 3,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: 'draw',
    name: '摸牌阶段',
    icon: <HandCoins className="w-5 h-5" />,
    description: '从牌库抽取卡牌',
    duration: 3,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'action',
    name: '行动阶段',
    icon: <Zap className="w-5 h-5" />,
    description: '出牌、使用技能、移动标记',
    duration: 60,
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'response',
    name: '响应阶段',
    icon: <Timer className="w-5 h-5" />,
    description: '响应对方行动',
    duration: 10,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'discard',
    name: '弃牌阶段',
    icon: <Trash2 className="w-5 h-5" />,
    description: '弃置多余手牌',
    duration: 15,
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'end',
    name: '结束阶段',
    icon: <Flag className="w-5 h-5" />,
    description: '触发结束效果',
    duration: 3,
    color: 'text-rose-400',
    gradient: 'from-rose-500 to-pink-600'
  }
];

const ACTOR_CONFIG: Record<TurnActor, { name: string; color: string; bgColor: string; icon: string; gradient: string }> = {
  player: { name: '小白', color: 'text-blue-400', bgColor: 'bg-blue-500', icon: '🧑‍💻', gradient: 'from-blue-500 to-cyan-600' },
  dadong: { name: '大东', color: 'text-emerald-400', bgColor: 'bg-emerald-500', icon: '🤖', gradient: 'from-emerald-500 to-teal-600' },
  enemy: { name: '敌人', color: 'text-rose-400', bgColor: 'bg-rose-500', icon: '👹', gradient: 'from-rose-500 to-red-600' }
};

interface EnhancedPhaseVisualizerProps {
  currentPhase: LevelTurnPhase;
  currentActor: TurnActor;
  roundNumber: number;
  maxRounds: number;
  actionPoints: { current: number; max: number };
  onPhaseClick?: (phase: LevelTurnPhase) => void;
  showActorInfo?: boolean;
  aiOperationLogs?: AIOperationLog[];
  showAIOperations?: boolean;
  className?: string;
}

export function EnhancedPhaseVisualizer({
  currentPhase,
  currentActor,
  roundNumber,
  maxRounds,
  actionPoints,
  onPhaseClick,
  showActorInfo = true,
  aiOperationLogs = [],
  showAIOperations = true,
  className
}: EnhancedPhaseVisualizerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPhaseEntering, setIsPhaseEntering] = useState(false);
  const [isPhaseExiting, setIsPhaseExiting] = useState(false);
  const [previousPhase, setPreviousPhase] = useState<LevelTurnPhase | null>(null);
  const [currentAIPhase, setCurrentAIPhase] = useState<LevelTurnPhase | null>(null);
  const [aiPhaseProgress, setAIPhaseProgress] = useState<string>('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const currentPhaseIndex = PHASES.findIndex(p => p.id === currentPhase);
  const currentPhaseConfig = PHASES[currentPhaseIndex];
  const actorConfig = ACTOR_CONFIG[currentActor];

  useEffect(() => {
    if (previousPhase && previousPhase !== currentPhase) {
      setIsPhaseExiting(true);
      const exitTimer = setTimeout(() => {
        setIsPhaseExiting(false);
        setIsPhaseEntering(true);
        const enterTimer = setTimeout(() => {
          setIsPhaseEntering(false);
        }, 500);
        return () => clearTimeout(enterTimer);
      }, 300);
      return () => clearTimeout(exitTimer);
    }
    setPreviousPhase(currentPhase);
  }, [currentPhase, previousPhase]);

  useEffect(() => {
    if (currentActor !== 'player' && aiOperationLogs.length > 0) {
      const latestLog = aiOperationLogs[aiOperationLogs.length - 1];
      setCurrentAIPhase(latestLog.phase);
      setAIPhaseProgress(latestLog.description);
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiOperationLogs, currentActor]);

  useEffect(() => {
    if (!currentPhaseConfig) return;
    setTimeRemaining(currentPhaseConfig.duration);
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev <= 0 ? 0 : prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentPhase, currentPhaseConfig]);

  return (
    <div className={cn(
      'relative bg-slate-900/95 rounded-2xl p-6 border border-slate-700/50 shadow-2xl backdrop-blur-xl',
      className
    )}>
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Round</span>
              <span className="text-3xl font-bold text-white">{roundNumber}</span>
              <span className="text-slate-500 text-sm">/ {maxRounds}</span>
            </div>
          </div>

          {showActorInfo && (
            <div className={cn(
              'flex items-center gap-3 px-5 py-2.5 rounded-full transition-all duration-500',
              'bg-gradient-to-r',
              actorConfig.gradient,
              'shadow-lg',
              isPhaseEntering && 'scale-105',
              isPhaseExiting && 'scale-95 opacity-50'
            )}>
              <span className="text-2xl">{actorConfig.icon}</span>
              <span className={cn("font-bold text-white", isPhaseEntering && 'animate-pulse')}>
                {actorConfig.name}的回合
              </span>
            </div>
          )}

          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">行动点</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: actionPoints.max }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-4 h-4 rounded-full transition-all duration-300',
                      i < actionPoints.current
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30'
                        : 'bg-slate-700'
                    )}
                  />
                ))}
              </div>
              <span className={cn(
                "text-2xl font-bold font-mono",
                actionPoints.current === 0 ? "text-red-400" : "text-yellow-400"
              )}>
                {actionPoints.current}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="flex gap-2">
            {PHASES.map((phase, index) => {
              const isActive = index === currentPhaseIndex;
              const isCompleted = index < currentPhaseIndex;
              const isNext = index === currentPhaseIndex + 1;

              return (
                <button
                  key={phase.id}
                  onClick={() => onPhaseClick?.(phase.id)}
                  className={cn(
                    "flex-1 h-4 rounded-xl transition-all duration-500 relative overflow-hidden group",
                    isActive && cn(
                      "bg-gradient-to-r shadow-xl",
                      phase.gradient
                    ),
                    isCompleted && "bg-green-500 shadow-green-500/30",
                    isNext && "bg-slate-600",
                    !isActive && !isCompleted && !isNext && "bg-slate-700 hover:bg-slate-600 transition-colors"
                  )}
                  title={`${phase.name}: ${phase.description}`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  )}
                  {isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className={cn(
          "relative flex items-center justify-between p-6 rounded-xl border transition-all duration-700",
          "bg-slate-800/50 border-slate-700/30",
          isPhaseEntering && "scale-105 bg-slate-800/80 border-slate-600/50",
          isPhaseExiting && "scale-95 opacity-50"
        )}>
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            {currentPhaseConfig && (
              <div className={cn(
                "absolute inset-0 opacity-10 bg-gradient-to-r",
                currentPhaseConfig.gradient
              )} />
            )}
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-2xl transition-all duration-500",
              currentPhaseConfig?.gradient,
              isPhaseEntering && "animate-bounce"
            )}>
              <div className="text-3xl">{currentPhaseConfig?.icon}</div>
            </div>
            <div>
              <div className={cn(
                "text-2xl font-bold transition-all duration-500",
                currentPhaseConfig?.color,
                isPhaseEntering && "text-3xl"
              )}>
                {currentPhaseConfig?.name}
              </div>
              <div className="text-sm text-slate-400">
                {currentPhaseConfig?.description}
              </div>
            </div>
          </div>

          <div className="relative z-10 text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">剩余时间</div>
            <div className={cn(
              "text-4xl font-mono font-bold transition-all duration-300",
              timeRemaining <= 5 ? "text-red-400 animate-pulse" :
              timeRemaining <= 10 ? "text-yellow-400" : "text-slate-300"
            )}>
              {timeRemaining}
              <span className="text-lg text-slate-500">s</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {PHASES.map((phase, index) => {
            const isActive = index === currentPhaseIndex;
            const isCompleted = index < currentPhaseIndex;

            return (
              <div
                key={phase.id}
                className={cn(
                  "text-center py-3 px-2 rounded-xl text-xs transition-all duration-300 cursor-pointer group",
                  isActive && cn(
                    "bg-gradient-to-br shadow-xl scale-110 z-10",
                    phase.gradient
                  ),
                  isCompleted && "text-green-400 bg-green-900/30 border border-green-500/30",
                  !isActive && !isCompleted && "text-slate-500 bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/30"
                )}
                onClick={() => onPhaseClick?.(phase.id)}
              >
                <div className={cn(
                  "text-xl mb-1 transition-transform duration-300",
                  isActive && "scale-125",
                  !isActive && !isCompleted && "group-hover:scale-110"
                )}>
                  {phase.icon}
                </div>
                <div className={cn(
                  "truncate font-medium",
                  isActive && "text-white"
                )}>
                  {phase.name.slice(0, 2)}
                </div>
                {isActive && (
                  <div className="w-8 h-0.5 mx-auto mt-1 bg-white/50 rounded" />
                )}
              </div>
            );
          })}
        </div>

        {showAIOperations && currentActor !== 'player' && (
          <div className="mt-6 bg-slate-800/80 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md",
                  actorConfig.gradient
                )}>
                  <span className="text-2xl">{actorConfig.icon}</span>
                </div>
                <div>
                  <span className={cn("font-bold text-base", actorConfig.color)}>
                    {actorConfig.name}正在行动
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-slate-500">进行中...</span>
                  </div>
                </div>
              </div>
              {currentAIPhase && (
                <div className="text-right">
                  <div className="text-xs text-slate-500">当前阶段</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{PHASES.find(p => p.id === currentAIPhase)?.icon}</span>
                    <span className="text-sm text-slate-300 font-medium">
                      {LEVEL_PHASE_NAMES[currentAIPhase]}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {aiPhaseProgress && (
              <div className="mb-3 px-4 py-3 bg-slate-700/50 rounded-lg border border-slate-600/30">
                <div className="flex items-start gap-2">
                  <span className="text-xl animate-pulse">⚡</span>
                  <div className="flex-1">
                    <span className="text-sm text-slate-300">{aiPhaseProgress}</span>
                  </div>
                </div>
              </div>
            )}

            {aiOperationLogs.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs">
                {aiOperationLogs.slice(-8).map((log, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-slate-700/30",
                      log.actor === 'dadong'
                        ? "bg-emerald-900/20 text-emerald-300 border border-emerald-500/20"
                        : "bg-rose-900/20 text-rose-300 border border-rose-500/20"
                    )}
                  >
                    <span className="opacity-60 text-[10px]">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-base">{PHASES.find(p => p.id === log.phase)?.icon}</span>
                    <span className="flex-1">{log.description}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedPhaseVisualizer;