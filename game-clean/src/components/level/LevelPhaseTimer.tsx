import React, { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LevelTurnPhase } from '@/types/levelTypes';
import { PhaseTimer, type PhaseTimerState, PHASE_TIME_CONFIGS } from '@/engine/PhaseTimerSystem';
import { PhaseTimerEventBus } from '@/engine/PhaseTimerEventBus';

interface LevelPhaseTimerProps {
  currentPhase: LevelTurnPhase;
  onTimerTimeout?: (phase: LevelTurnPhase) => void;
}

export function LevelPhaseTimer({
  currentPhase,
  onTimerTimeout
}: LevelPhaseTimerProps) {
  const [timerState, setTimerState] = useState<PhaseTimerState | null>(null);
  const timerRef = useRef<PhaseTimer | null>(null);
  const prevPhaseRef = useRef<LevelTurnPhase | null>(null);

  useEffect(() => {
    if (prevPhaseRef.current === currentPhase) return;
    prevPhaseRef.current = currentPhase;

    if (timerRef.current) {
      timerRef.current.stop();
    }

    const timer = new PhaseTimer(currentPhase as any);
    
    timer.setOnTick((state) => {
      setTimerState(state);
    });

    timer.setOnTimeout(() => {
      console.log('[LevelPhaseTimer] Timer timeout for phase:', currentPhase);
      PhaseTimerEventBus.triggerTimerEnd();
      onTimerTimeout?.(currentPhase);
    });

    const config = PHASE_TIME_CONFIGS[currentPhase as any];
    if (config && config.baseTime > 0) {
      timer.start();
    }

    timerRef.current = timer;
    setTimerState(timer.getState());

    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
      }
    };
  }, [currentPhase, onTimerTimeout]);

  useEffect(() => {
    const unsubscribe = PhaseTimerEventBus.onAddTime((seconds) => {
      if (timerRef.current && currentPhase === 'action') {
        timerRef.current.addTime(seconds);
        setTimerState(timerRef.current.getState());
      }
    });

    return unsubscribe;
  }, [currentPhase]);

  if (!timerState || timerState.totalTime === 0) {
    return null;
  }

  const isWarning = timerRef.current?.isAboutToTimeout() ?? false;
  const progress = timerRef.current?.getProgressPercent() ?? 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn(
      'p-3 border-2 transition-all duration-300',
      isWarning 
        ? 'bg-red-900/30 border-red-500/50 shadow-lg shadow-red-500/20'
        : 'bg-slate-800/80 border-slate-600'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            'w-4 h-4',
            isWarning ? 'text-red-400 animate-pulse' : 'text-cyan-400'
          )} />
          <span className={cn(
            'text-sm font-semibold',
            isWarning ? 'text-red-300' : 'text-slate-200'
          )}>
            {PHASE_TIME_CONFIGS[currentPhase as any].description}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isWarning && (
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              即将超时
            </Badge>
          )}
          <span className={cn(
            'text-lg font-bold font-mono',
            isWarning ? 'text-red-400' : 'text-cyan-400'
          )}>
            {formatTime(timerState.remainingTime)}
          </span>
        </div>
      </div>
      <Progress 
        value={progress}
        className={cn(
          'h-2',
          isWarning ? 'bg-red-900/50' : 'bg-slate-700'
        )}
      />
      {currentPhase === 'action' && (
        <div className="mt-2 text-xs text-slate-400">
          已出牌: {timerState.cardsPlayed} 张 (+10秒/张)
        </div>
      )}
    </Card>
  );
}

export default LevelPhaseTimer;
