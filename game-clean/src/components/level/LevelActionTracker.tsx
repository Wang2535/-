import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  Play,
  Trash2,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertTriangle,
  History,
  ChevronUp,
  ChevronDown,
  Eye
} from 'lucide-react';

export type CardActionType = 'draw' | 'play' | 'discard' | 'judgment' | 'skill';

export interface CardActionLog {
  id: string;
  timestamp: number;
  actor: 'player' | 'dadong' | 'enemy';
  type: CardActionType;
  cardName?: string;
  cardIcon?: string;
  description: string;
  result?: 'success' | 'failure' | 'critical_success' | 'critical_failure';
  details?: Record<string, any>;
}

interface LevelActionTrackerProps {
  logs: CardActionLog[];
  maxLogs?: number;
  className?: string;
  showHistoryToggle?: boolean;
}

export function LevelActionTracker({ logs, maxLogs = 10, className, showHistoryToggle = true }: LevelActionTrackerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  
  const displayLogs = showFullHistory ? logs : logs.slice(-maxLogs);

  useEffect(() => {
    if (scrollRef.current && !showFullHistory) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, showFullHistory]);

  return (
    <div className={cn(
      'bg-slate-900/90 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col',
      className
    )}>
      {/* 头部 */}
      <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            行动记录
            {logs.length > 0 && (
              <span className="text-[10px text-slate-500">
                ({logs.length}条
              </span>
            )}
          </h4>
          
          {showHistoryToggle && logs.length > maxLogs && (
            <button
              onClick={() => setShowFullHistory(!showFullHistory)}
              className="flex items-center gap-1 px-2 py-0.5 text-[10px rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 transition-colors"
            >
              <History className="w-3 h-3" />
              {showFullHistory ? '收起' : '查看全部'}
            </button>
          )}
        </div>
      </div>

      {/* 日志列表 */}
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto p-3 space-y-2',
          showFullHistory ? 'max-h-80' : 'max-h-48'
        )}
      >
        {displayLogs.length === 0 ? (
          <div className="text-center py-4 text-sm text-slate-500">
            暂无行动记录
          </div>
        ) : (
          displayLogs.map((log, index) => (
            <ActionLogItem
              key={log.id}
              log={log}
              isLatest={index === displayLogs.length - 1 && !showFullHistory}
              isExpanded={expandedLog === log.id}
              onToggleExpand={() => setExpandedLog(
                expandedLog === log.id ? null : log.id
              )}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ActionLogItemProps {
  log: CardActionLog;
  isLatest: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

function ActionLogItem({ log, isLatest, isExpanded, onToggleExpand }: ActionLogItemProps) {
  const [isAnimating, setIsAnimating] = useState(isLatest);

  useEffect(() => {
    if (isLatest) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLatest, log.id]);

  const actorConfig = {
    player: { color: 'text-blue-400', bg: 'bg-blue-500/10', name: '小白' },
    dadong: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', name: '大东' },
    enemy: { color: 'text-rose-400', bg: 'bg-rose-500/10', name: '敌人' }
  };

  const typeConfig = {
    draw: { icon: '🎴', label: '抽牌' },
    play: { icon: '🎯', label: '出牌' },
    discard: { icon: '🗑️', label: '弃牌' },
    judgment: { icon: '⚖️', label: '判定' },
    skill: { icon: '✨', label: '技能' }
  };

  const resultConfig = {
    success: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
    failure: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
    critical_success: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    critical_failure: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/20' }
  };

  const actor = actorConfig[log.actor];
  const type = typeConfig[log.type];
  const result = log.result ? resultConfig[log.result] : null;

  return (
    <div className={cn(
      'relative transition-all duration-300',
      isAnimating && 'animate-in slide-in-from-left-4 fade-in'
    )}>
      <div className={cn(
        'flex items-start gap-2 p-2 rounded-lg cursor-pointer',
        actor.bg,
        'border border-transparent hover:border-slate-600/50',
        isLatest && 'border-slate-600/50'
      )}
        onClick={onToggleExpand}
      >
        {/* 时间点 */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
          <span className="text-xs text-slate-400">{type.icon}</span>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-2 flex-1">
              <span className={cn('text-xs font-semibold', actor.color)}>
                {actor.name}
              </span>
              <span className="text-[10px] text-slate-500">
                {type.label}
              </span>
              {result && (
                <div className={cn(
                  'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]',
                  result.bg
                )}>
                  <result.icon className="w-3 h-3" />
                  <span className={result.color}>
                    {log.result === 'critical_success' ? '大成功' :
                     log.result === 'critical_failure' ? '大失败' :
                     log.result === 'success' ? '成功' : '失败'}
                  </span>
                </div>
              )}
            </div>
            
            {/* 时间戳 */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-500 font-mono">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              {log.details && onToggleExpand && (
                isExpanded ? 
                  <ChevronUp className="w-3 h-3 text-slate-400" /> :
                  <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {log.description}
          </p>

          {log.cardName && (
            <div className="mt-1 flex items-center gap-1">
              {log.cardIcon && <span className="text-sm">{log.cardIcon}</span>}
              <span className="text-[10px] text-slate-400 font-medium">
                {log.cardName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 展开详情 */}
      {isExpanded && log.details && (
        <div className="mt-1 ml-8 p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
          <div className="text-[10px] text-slate-400 mb-1">详细信息</div>
          <div className="space-y-1">
            {Object.entries(log.details).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{key}:</span>
                <span className="text-slate-300 font-mono">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 动画卡片组件
interface AnimatedCardProps {
  cardName?: string;
  cardIcon?: string;
  fromPosition?: 'hand' | 'deck' | 'discard';
  toPosition?: 'hand' | 'field' | 'discard';
  fromElement?: HTMLElement | null;
  toElement?: HTMLElement | null;
  onComplete?: () => void;
  className?: string;
  duration?: number;
}

export function AnimatedCard({
  cardName,
  cardIcon,
  fromPosition = 'hand',
  toPosition = 'field',
  fromElement,
  toElement,
  onComplete,
  className,
  duration = 1200
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'start' | 'moving' | 'end'>('start');

  const positionConfig = {
    hand: { color: 'text-blue-400', border: 'border-blue-500', gradient: 'from-blue-500 to-cyan-600' },
    deck: { color: 'text-green-400', border: 'border-green-500', gradient: 'from-green-500 to-emerald-600' },
    discard: { color: 'text-orange-400', border: 'border-orange-500', gradient: 'from-orange-500 to-red-600' },
    field: { color: 'text-purple-400', border: 'border-purple-500', gradient: 'from-purple-500 to-pink-600' }
  };

  const fromConfig = positionConfig[fromPosition];
  const toConfig = positionConfig[toPosition];

  useEffect(() => {
    setAnimationPhase('start');
    
    const startTimer = setTimeout(() => {
      setAnimationPhase('moving');
    }, 100);

    const endTimer = setTimeout(() => {
      setAnimationPhase('end');
    }, duration - 300);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 z-50 pointer-events-none flex items-center justify-center',
      className
    )}>
      <div className="relative">
        {/* 背景光晕 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-pulse" />
        </div>

        {/* 动画卡片 */}
        <div className={cn(
          'relative w-36 h-52 rounded-xl border-2 shadow-2xl transition-all duration-1000',
          'bg-gradient-to-br from-slate-800 to-slate-900',
          animationPhase === 'start' && cn('scale-75 opacity-0', fromConfig.border),
          animationPhase === 'moving' && cn('scale-100 opacity-100', 'border-yellow-500/50'),
          animationPhase === 'end' && cn('scale-75 opacity-0', toConfig.border)
        )}>
          {/* 装饰条 */}
          <div className={cn(
            'absolute top-0 left-0 right-0 h-3 rounded-t-xl bg-gradient-to-r transition-all duration-500',
            animationPhase === 'start' && fromConfig.gradient,
            animationPhase === 'moving' && 'from-yellow-500 to-orange-500',
            animationPhase === 'end' && toConfig.gradient
          )} />
          
          {/* 卡片内容 */}
          <div className="p-4 pt-8 text-center">
            <div className={cn(
              'text-5xl mb-3 transition-all duration-500',
              animationPhase === 'moving' && 'animate-bounce'
            )}>
              {cardIcon || '🃏'}
            </div>
            <div className="text-base font-bold text-white mb-2">
              {cardName || '卡牌'}
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>
                {fromPosition === 'hand' && toPosition === 'field' && '🎯 出牌中...'}
                {fromPosition === 'deck' && toPosition === 'hand' && '🎴 抽牌中...'}
                {fromPosition === 'hand' && toPosition === 'discard' && '🗑️ 弃牌中...'}
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px]">
                <span className={fromConfig.color}>
                  {fromPosition === 'hand' && '手牌'}
                  {fromPosition === 'deck' && '牌库'}
                  {fromPosition === 'discard' && '弃牌'}
                </span>
                <ArrowUpRight className="w-3 h-3 text-slate-500" />
                <span className={toConfig.color}>
                  {toPosition === 'field' && '战场'}
                  {toPosition === 'hand' && '手牌'}
                  {toPosition === 'discard' && '弃牌'}
                </span>
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className={cn(
                'h-full bg-gradient-to-r transition-all duration-200',
                animationPhase === 'start' && 'w-0',
                animationPhase === 'moving' && 'w-1/2 from-yellow-500 to-orange-500',
                animationPhase === 'end' && 'w-full from-green-500 to-emerald-500'
              )} />
            </div>
          </div>
        </div>

        {/* 轨迹特效 */}
        {animationPhase === 'moving' && (
          <>
            {/* 粒子效果 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-emerald-400/50"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-40px)`,
                    animation: `pulse 1s ease-in-out infinite ${i * 0.1}s`
                  }}
                />
              ))}
            </div>
            
            {/* 旋转光晕 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 border-2 border-dashed border-yellow-500/30 rounded-full animate-spin" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 行动记录管理器 Hook
export function useActionTracker() {
  const [logs, setLogs] = useState<CardActionLog[]>([]);
  const [pendingAnimation, setPendingAnimation] = useState<{
    cardName?: string;
    cardIcon?: string;
    fromPosition?: 'hand' | 'deck' | 'discard';
    toPosition?: 'hand' | 'field' | 'discard';
  } | null>(null);

  const addLog = (log: Omit<CardActionLog, 'id' | 'timestamp'>) => {
    const newLog: CardActionLog = {
      ...log,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    setLogs(prev => [...prev, newLog]);
  };

  const playCardAnimation = (
    cardName?: string,
    cardIcon?: string,
    fromPosition: 'hand' | 'deck' | 'discard' = 'hand',
    toPosition: 'hand' | 'field' | 'discard' = 'field'
  ) => {
    setPendingAnimation({ cardName, cardIcon, fromPosition, toPosition });
  };

  const clearAnimation = () => {
    setPendingAnimation(null);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return {
    logs,
    addLog,
    pendingAnimation,
    playCardAnimation,
    clearAnimation,
    clearLogs
  };
}

export default LevelActionTracker;