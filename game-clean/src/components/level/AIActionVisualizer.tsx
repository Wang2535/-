/**
 * AI行动可视化组件
 * 整合了AI行动阶段窗口和AI状态面板
 * 固定显示在页面中间偏下位置
 */

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';
import type { LevelTurnPhase } from '@/types/levelTypes';
import { LEVEL_PHASE_NAMES } from '@/types/levelTypes';
import { CardDetailModal } from './CardDetailModal';

export type AIActor = 'dadong' | 'enemy' | 'enemy2';

export interface CardInfo {
  name: string;
  type: string;
  card_code?: string;
  cost?: Record<string, number>;
  effect: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  techLevel?: number;
  difficulty?: number;
  icon?: string;
}

export interface HandState {
  count: number;
  typeDistribution: Record<string, number>;
}

export interface JudgmentInfo {
  success: boolean;
  result?: string;
  details?: string;
  cardName?: string;
  diceRoll?: number;
  difficulty?: number;
  isCriticalSuccess?: boolean;
  isCriticalFailure?: boolean;
  effectDescription?: string;
  judgmentType?: 'skill' | 'card' | 'ability' | 'status';
  phase?: 'start' | 'rolling' | 'comparing' | 'result' | 'effect';
  resultType?: 'critical_success' | 'critical_failure' | 'success' | 'failure';
  responseType?: 'accept' | 'reject' | 'pass';
  responseAction?: string;
  responseReason?: string;
  responseCard?: CardInfo;
  responseResult?: {
    success: boolean;
    action: string;
    reason: string;
    timestamp: number;
  };
}

export interface AIResourceState {
  computing: number;
  funds: number;
  information: number;
  maxComputing?: number;
  maxFunds?: number;
  maxInformation?: number;
}

export interface AIActionVisualizerProps {
  actor: AIActor;
  phase: LevelTurnPhase;
  actionType?: string;
  targetCard?: { name: string; type: string };
  targetArea?: string;
  progress: number;
  isVisible: boolean;
  actionDescription?: string;
  estimatedTime?: number;
  showDetails?: boolean;
  className?: string;
  onComplete?: () => void;
  onCancel?: () => void;
  playedCard?: CardInfo;
  handState?: HandState;
  judgmentInfo?: JudgmentInfo;
  drawnCards?: CardInfo[];
  handCountBefore?: number;
  handCountAfter?: number;
  actionLog?: string;
  targetInfo?: {
    area?: string;
    areaName?: string;
    description?: string;
  };
  skillInfo?: {
    name: string;
    description: string;
    cooldown?: number;
  };
  skillVisualization?: {
    skillName: string;
    skillDescription: string;
    targetArea?: string;
    intensity: 'low' | 'medium' | 'high';
    effects: {
      id: string;
      type: 'resource' | 'status' | 'card' | 'area';
      target: 'self' | 'ally' | 'enemy' | 'all';
      value?: number;
      description: string;
    }[];
  };
  resources?: AIResourceState;
  handCards?: CardInfo[];
  enemyName?: string;
  enemyType?: string;
}

const ACTOR_CONFIG: Record<AIActor, {
  name: string;
  title: string;
  color: string;
  bgColor: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  borderColor: string;
  glowColor: string;
}> = {
  dadong: {
    name: '大东',
    title: 'AI助手',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
    icon: '🤖',
    borderColor: 'border-emerald-500/50',
    glowColor: 'shadow-emerald-500/30'
  },
  enemy: {
    name: '敌人1',
    title: '敌对AI',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-red-600',
    icon: '👹',
    borderColor: 'border-rose-500/50',
    glowColor: 'shadow-rose-500/30'
  },
  enemy2: {
    name: '敌人2',
    title: '敌对AI',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-amber-600',
    icon: '👺',
    borderColor: 'border-orange-500/50',
    glowColor: 'shadow-orange-500/30'
  }
};

const PHASE_CONFIG: Record<LevelTurnPhase, {
  icon: string;
  description: string;
  animation: string;
}> = {
  judgment: {
    icon: '⚖️',
    description: '正在进行判定...',
    animation: 'animate-bounce'
  },
  recovery: {
    icon: '💫',
    description: '正在恢复资源...',
    animation: 'animate-pulse'
  },
  draw: {
    icon: '🎴',
    description: '正在抽取卡牌...',
    animation: 'animate-pulse'
  },
  action: {
    icon: '⚡',
    description: '正在执行行动...',
    animation: 'animate-pulse'
  },
  response: {
    icon: '⏱️',
    description: '正在响应...',
    animation: 'animate-bounce'
  },
  discard: {
    icon: '🗑️',
    description: '正在弃牌...',
    animation: 'animate-pulse'
  },
  end: {
    icon: '🏁',
    description: '正在结束回合...',
    animation: 'animate-pulse'
  }
};

const ACTION_TYPE_NAMES: Record<string, string> = {
  'play_card': '打出卡牌',
  'use_skill': '使用技能',
  'move_marker': '移动标记',
  'activate_ability': '激活能力',
  'judge': '进行判定',
  'draw_card': '抽取卡牌',
  'discard_card': '弃置卡牌',
  'attack': '发起攻击',
  'defend': '进行防御',
  'cooperate': '协同作战',
  'analyze': '分析局势',
  'wait': '等待时机',
  'special_ability': '使用特殊能力',
  'special_ability_skip': '特殊能力检查',
  'phase_start': '开始阶段',
  'turn_start': '回合开始',
  'turn_end': '回合结束',
  'judgment_start': '判定开始',
  'dice_rolling': '骰子判定',
  'dice_result': '判定结果',
  'effect_applied': '应用效果',
  'no_judgment': '无待处理判定',
  'no_action': '无需行动',
  'no_draw': '无需摸牌',
  'draw_card_animation': '摸牌动画',
  'discard_card_animation': '弃牌动画',
  'discard_complete': '弃牌完成',
  'strategy': '制定策略',
  'attacking': '发起攻击',
  'using_skill': '使用技能',
  'passive_skill': '被动技能触发',
  'event_detected': '发现事件',
  'analyzing': '分析中',
  'responding': '响应中',
  'response_complete': '响应完成',
  'pass_response': '放弃响应'
};

const AREA_NAMES: Record<string, string> = {
  'internal': '内网',
  'industrial': '工控系统',
  'dmz': 'DMZ区',
  'external': '外网',
  'hand': '手牌区',
  'deck': '牌库',
  'discard': '弃牌堆'
};

const RARITY_CONFIG: Record<string, { color: string; bgColor: string; name: string }> = {
  common: { color: 'text-slate-400', bgColor: 'bg-slate-600', name: '普通' },
  uncommon: { color: 'text-green-400', bgColor: 'bg-green-600', name: '优秀' },
  rare: { color: 'text-blue-400', bgColor: 'bg-blue-600', name: '稀有' },
  epic: { color: 'text-purple-400', bgColor: 'bg-purple-600', name: '史诗' },
  legendary: { color: 'text-yellow-400', bgColor: 'bg-yellow-600', name: '传说' }
};

const RESOURCE_CONFIG = {
  computing: { icon: '💻', name: '算力', color: 'text-cyan-400', bgColor: 'bg-cyan-500' },
  funds: { icon: '💰', name: '资金', color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
  information: { icon: '📊', name: '信息', color: 'text-purple-400', bgColor: 'bg-purple-500' }
};

export function AIActionVisualizer({
  actor,
  phase,
  actionType,
  targetCard,
  targetArea,
  progress,
  isVisible,
  actionDescription,
  estimatedTime = 3,
  showDetails = true,
  className,
  onComplete,
  onCancel,
  playedCard,
  handState,
  judgmentInfo,
  drawnCards,
  handCountBefore,
  handCountAfter,
  actionLog,
  targetInfo,
  skillInfo,
  skillVisualization,
  resources,
  handCards,
  enemyName,
  enemyType
}: AIActionVisualizerProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);
  const [showGlow, setShowGlow] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showStatusPanel, setShowStatusPanel] = useState(true);
  const [animatingResource, setAnimatingResource] = useState<string | null>(null);
  const [showSkillTrigger, setShowSkillTrigger] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardInfo | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const actorConfig = ACTOR_CONFIG[actor];
  const phaseConfig = PHASE_CONFIG[phase];

  // 处理右键点击卡牌
  const handleCardRightClick = (e: React.MouseEvent, card: CardInfo) => {
    e.preventDefault();
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };
  
  const displayName = (actor === 'enemy' || actor === 'enemy2') && enemyName ? enemyName : actorConfig.name;
  const displayTitle = (actor === 'enemy' || actor === 'enemy2') && enemyType ? enemyType : actorConfig.title;

  useEffect(() => {
    if (resources) {
      setAnimatingResource('update');
      const timer = setTimeout(() => setAnimatingResource(null), 500);
      return () => clearTimeout(timer);
    }
  }, [resources?.computing, resources?.funds, resources?.information]);

  useEffect(() => {
    if (!isVisible) {
      setDisplayProgress(0);
      setTimeRemaining(estimatedTime);
      return;
    }

    const progressInterval = setInterval(() => {
      setDisplayProgress(prev => {
        const diff = progress - prev;
        if (Math.abs(diff) < 2) return progress;
        return prev + diff * 0.15;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [progress, isVisible, estimatedTime]);

  useEffect(() => {
    if (!isVisible || estimatedTime <= 0) return;

    setTimeRemaining(estimatedTime);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0.1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onComplete?.();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible, estimatedTime, onComplete]);

  useEffect(() => {
    if (displayProgress >= 100 && progress >= 100) {
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [displayProgress, progress, onComplete]);

  useEffect(() => {
    if (skillVisualization && isVisible && !showSkillTrigger) {
      setShowSkillTrigger(true);
      const timer = setTimeout(() => {
        setShowSkillTrigger(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [skillVisualization, isVisible]);

  useEffect(() => {
    const glowInterval = setInterval(() => {
      setShowGlow(prev => !prev);
    }, 1000);
    return () => clearInterval(glowInterval);
  }, []);

  if (!isVisible) return null;

  const actionTypeName = actionType ? (ACTION_TYPE_NAMES[actionType] || actionType) : null;
  const areaName = targetArea ? (AREA_NAMES[targetArea] || targetArea) : null;
  const totalHand = handCards?.length || handState?.count || 0;
  const typeDistribution = handState?.typeDistribution || {};

  return (
    <div
      className={cn(
        'fixed left-1/2 -translate-x-1/2 bottom-24 z-40',
        'transition-all duration-300 ease-out',
        isExpanded ? 'w-[720px]' : 'w-[320px]',
        className
      )}
    >
      <div
        className={cn(
          'relative bg-slate-900/95 backdrop-blur-xl rounded-2xl',
          'border-2 shadow-2xl',
          actorConfig.borderColor,
          showGlow ? cn('shadow-2xl', actorConfig.glowColor) : 'shadow-lg',
          'overflow-hidden'
        )}
      >
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1 rounded-t-2xl',
            'bg-gradient-to-r',
            actorConfig.gradientFrom,
            actorConfig.gradientTo
          )}
        />

        <div
          className={cn(
            'px-4 py-3 flex items-center justify-between',
            'bg-slate-800/50 cursor-pointer'
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'relative w-12 h-12 rounded-xl flex items-center justify-center',
                'bg-gradient-to-br',
                actorConfig.gradientFrom,
                actorConfig.gradientTo,
                'shadow-lg',
                phaseConfig.animation
              )}
            >
              <span className="text-2xl">{actorConfig.icon}</span>
              <div
                className={cn(
                  'absolute -bottom-1 -right-1 w-5 h-5 rounded-full',
                  'border-2 border-slate-900',
                  actorConfig.bgColor,
                  'animate-pulse'
                )}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn('text-xl font-bold', actorConfig.color)}>
                  {displayName}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  {displayTitle}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                {phaseConfig.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isExpanded && (
              <div className="text-right">
                <div className={cn(
                  'text-2xl font-mono font-bold',
                  timeRemaining <= 1 ? 'text-red-400 animate-pulse' : 'text-slate-300'
                )}>
                  {timeRemaining.toFixed(1)}s
                </div>
                <div className="text-xs text-slate-500">预计时间</div>
              </div>
            )}
            {isExpanded && showStatusPanel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusPanel(false);
                }}
                className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                title="隐藏状态面板"
              >
                📊
              </button>
            )}
            {isExpanded && !showStatusPanel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusPanel(true);
                }}
                className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                title="显示状态面板"
              >
                📦
              </button>
            )}
            <span className="text-xs text-slate-500">
              {isExpanded ? '点击收起' : '点击展开'}
            </span>
            <span className={cn(
              'transition-transform duration-200',
              isExpanded ? 'rotate-180' : ''
            )}>
              ▼
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="flex">
            <div className={cn(
              'flex-1 p-4 space-y-4',
              showStatusPanel && resources ? 'border-r border-slate-700/50' : ''
            )}>
              <div className="px-2 py-2 bg-slate-800/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'text-2xl',
                      phaseConfig.animation
                    )}>
                      {phaseConfig.icon}
                    </span>
                    <div>
                      <div className={cn('font-semibold', actorConfig.color)}>
                        {LEVEL_PHASE_NAMES[phase]}
                      </div>
                      <div className="text-xs text-slate-400">
                        阶段 {Object.keys(PHASE_CONFIG).indexOf(phase) + 1} / 7
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Object.keys(PHASE_CONFIG).map((p, index) => {
                      const currentIndex = Object.keys(PHASE_CONFIG).indexOf(phase);
                      const isActive = index === currentIndex;
                      const isCompleted = index < currentIndex;

                      return (
                        <div
                          key={p}
                          className={cn(
                            'w-2 h-2 rounded-full transition-all duration-300',
                            isActive && cn('w-6', actorConfig.bgColor, 'animate-pulse'),
                            isCompleted && 'bg-green-500',
                            !isActive && !isCompleted && 'bg-slate-600'
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">执行进度</span>
                </div>
                <div
                  ref={progressRef}
                  className="relative h-3 bg-slate-700 rounded-full overflow-hidden"
                >
                  <div
                    className={cn(
                      'absolute top-0 left-0 h-full rounded-full',
                      'bg-gradient-to-r transition-all duration-500 ease-out',
                      actorConfig.gradientFrom,
                      actorConfig.gradientTo,
                      displayProgress >= 100 && 'animate-pulse'
                    )}
                    style={{ width: `${displayProgress}%` }}
                  >
                  </div>
                </div>
              </div>

              {playedCard && (
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <span>{playedCard.type === '特殊能力' ? '✨' : '🎴'}</span>
                    {playedCard.type === '特殊能力' ? '特殊能力' : '已使用卡牌'}
                  </h4>
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-16 h-20 rounded-lg flex items-center justify-center flex-shrink-0',
                        'bg-gradient-to-br',
                        playedCard.type === '特殊能力' ? 'from-purple-500 to-pink-600' : cn(actorConfig.gradientFrom, actorConfig.gradientTo),
                        'shadow-md',
                        playedCard.type === '特殊能力' && 'animate-pulse'
                      )}
                    >
                      <span className="text-3xl">{playedCard.icon || '🃏'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-200 truncate">
                          {playedCard.name}
                        </span>
                        {playedCard.rarity && (
                          <span className={cn(
                            'text-xs px-1.5 py-0.5 rounded',
                            RARITY_CONFIG[playedCard.rarity].bgColor,
                            'text-white'
                          )}>
                            {RARITY_CONFIG[playedCard.rarity].name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded text-white',
                          playedCard.type === '特殊能力' ? 'bg-purple-600' : 'bg-slate-700'
                        )}>
                          {playedCard.type}
                        </span>
                        {playedCard.cost && Object.keys(playedCard.cost).length > 0 && (
                          <div className="flex items-center gap-1">
                            {Object.entries(playedCard.cost).map(([resource, amount]) => (
                              <span key={resource} className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                                {resource}: {amount}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {playedCard.effect}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 判定阶段展示 */}
              {judgmentInfo && (
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <span>🎲</span>
                    判定阶段
                  </h4>
                  <div className="space-y-3">
                    {/* 判定卡牌信息 */}
                    {judgmentInfo.cardName && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">判定卡牌</span>
                        <span className="font-medium text-slate-200">{judgmentInfo.cardName}</span>
                      </div>
                    )}
                    
                    {/* 判定难度 */}
                    {judgmentInfo.difficulty !== undefined && judgmentInfo.difficulty > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">判定难度:</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                'w-6 h-6 rounded flex items-center justify-center text-xs font-bold border',
                                i < judgmentInfo.difficulty!
                                  ? 'bg-yellow-500/80 text-yellow-950 border-yellow-400 shadow-lg shadow-yellow-500/30' 
                                  : 'bg-slate-800 text-slate-500 border-slate-700'
                              )}
                            >
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 骰子结果 */}
                    {judgmentInfo.diceRoll !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">骰子点数</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-2xl font-bold',
                            judgmentInfo.isSuccess ? 'text-green-400' : 'text-red-400'
                          )}>
                            {judgmentInfo.diceRoll}
                          </span>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded',
                            judgmentInfo.isSuccess 
                              ? 'bg-green-600 text-white' 
                              : 'bg-red-600 text-white'
                          )}>
                            {judgmentInfo.isSuccess ? '成功' : '失败'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* 判定结果 */}
                    {judgmentInfo.result && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            'text-lg',
                            judgmentInfo.isSuccess ? 'text-green-400' : 'text-red-400'
                          )}>
                            {judgmentInfo.isSuccess ? '✓' : '✗'}
                          </span>
                          <span className={cn(
                            'font-semibold',
                            judgmentInfo.isSuccess ? 'text-green-400' : 'text-red-400'
                          )}>
                            {judgmentInfo.result}
                          </span>
                        </div>
                        {judgmentInfo.effectDescription && (
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {judgmentInfo.effectDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showDetails && (
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <span>📋</span>
                    行动详情
                  </h4>
                  <div className="space-y-2">
                    {actionTypeName && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">行动类型</span>
                        <span className={cn('font-medium', actorConfig.color)}>
                          {actionTypeName}
                        </span>
                      </div>
                    )}
                    {targetCard && !playedCard && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">目标卡牌</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                            {targetCard.type}
                          </span>
                          <span className="font-medium text-slate-200">
                            {targetCard.name}
                          </span>
                        </div>
                      </div>
                    )}
                    {areaName && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">目标区域</span>
                        <span className="font-medium text-slate-200">
                          {areaName}
                        </span>
                      </div>
                    )}
                    {actionDescription && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {actionDescription}
                        </p>
                      </div>
                    )}
                    {!actionTypeName && !targetCard && !areaName && !actionDescription && !playedCard && !handState && !judgmentInfo && !drawnCards && !actionLog && !targetInfo && !skillInfo && (
                      <div className="text-sm text-slate-500 text-center py-2">
                        正在分析局势，准备行动...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isExpanded && showStatusPanel && (
              <div className="w-64 p-4 space-y-4 bg-slate-800/30">
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <span>🃏</span>
                      手牌库
                    </h4>
                    <div className={cn(
                      'text-2xl font-bold font-mono',
                      actorConfig.color
                    )}>
                      {totalHand}
                      <span className="text-sm text-slate-400 ml-1">张</span>
                    </div>
                  </div>

                  {Object.keys(typeDistribution).length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-slate-500 mb-2">类型分布</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(typeDistribution).map(([type, count]) => (
                          <div
                            key={type}
                            className={cn(
                              'px-2 py-1 rounded-lg text-xs',
                              'bg-slate-700/50 border border-slate-600/50'
                            )}
                          >
                            <span className="text-slate-300">{type}</span>
                            <span className={cn('ml-1 font-bold', actorConfig.color)}>
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {handCards && handCards.length > 0 && (
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      <div className="text-xs text-slate-500 mb-1">具体卡牌（右键查看详情）</div>
                      {handCards.slice(0, 4).map((card, index) => (
                        <div
                          key={index}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-lg',
                            'bg-slate-700/30 border border-slate-600/30',
                            'transition-all duration-200',
                            'hover:bg-slate-700/50',
                            'cursor-context-menu'
                          )}
                          onContextMenu={(e) => handleCardRightClick(e, card)}
                          title="右键点击查看卡牌详情"
                        >
                          <span className="text-lg">{card.icon || '🃏'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-200 truncate">
                                {card.name}
                              </span>
                              {card.rarity && (
                                <span className={cn(
                                  'text-xs px-1 py-0.5 rounded',
                                  RARITY_CONFIG[card.rarity]?.bgColor || 'bg-slate-600',
                                  'text-white'
                                )}>
                                  {RARITY_CONFIG[card.rarity]?.name || '普通'}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              {card.type}
                            </div>
                          </div>
                        </div>
                      ))}
                      {handCards.length > 4 && (
                        <div className="text-xs text-slate-500 text-center py-1">
                          还有 {handCards.length - 4} 张卡牌...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {resources && (
                  <div className="bg-slate-800/60 rounded-xl p-3">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                      <span>📦</span>
                      资源状态
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(RESOURCE_CONFIG).map(([key, config]) => {
                        const value = resources[key as keyof AIResourceState] || 0;
                        const maxKey = `max${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof AIResourceState;
                        const max = resources[maxKey] as number || 10;
                        const percent = Math.min(100, (value / max) * 100);

                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>{config.icon}</span>
                                <span className="text-sm text-slate-300">{config.name}</span>
                              </div>
                              <div className={cn(
                                'font-mono font-bold transition-all duration-300',
                                config.color,
                                animatingResource && 'scale-110'
                              )}>
                                {value}
                                <span className="text-xs text-slate-500">/{max}</span>
                              </div>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-500',
                                  config.bgColor
                                )}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!handState && !resources && !handCards && (
                  <div className="text-center py-4 text-slate-500">
                    <span className="text-2xl">📊</span>
                    <div className="text-sm mt-2">等待AI数据...</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!isExpanded && (
          <div className="px-4 py-3 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <span>🃏</span>
              <span className={cn('font-bold', actorConfig.color)}>{totalHand}</span>
            </div>
            {resources && (
              <>
                <div className="w-px h-4 bg-slate-600" />
                <div className="flex items-center gap-2">
                  <span>💻</span>
                  <span className="text-cyan-400 font-bold">{resources.computing}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💰</span>
                  <span className="text-yellow-400 font-bold">{resources.funds}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span className="text-purple-400 font-bold">{resources.information}</span>
                </div>
              </>
            )}
            <div className="w-px h-4 bg-slate-600" />
            <span className={cn(
              'text-lg font-mono font-bold',
              timeRemaining <= 1 ? 'text-red-400 animate-pulse' : 'text-slate-300'
            )}>
              {timeRemaining.toFixed(1)}s
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden">
          <div
            className={cn(
              'h-full bg-gradient-to-r',
              actorConfig.gradientFrom,
              actorConfig.gradientTo,
              'opacity-50'
            )}
            style={{ width: `${displayProgress}%` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(-20px); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* 技能触发弹窗 */}
      {showSkillTrigger && skillVisualization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-slate-900/95 border-2 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border-emerald-500/50 shadow-emerald-500/20 animate-bounce-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/50">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{skillVisualization.skillName}</h3>
                <p className="text-sm text-slate-400">技能触发</p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700/50">
              <p className="text-sm text-slate-200 leading-relaxed mb-3">
                {skillVisualization.skillDescription}
              </p>
              
              {skillVisualization.effects.length > 0 && (
                <div className="space-y-2">
                  {skillVisualization.effects.map((effect) => (
                    <div key={effect.id} className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        effect.type === 'resource' && 'bg-yellow-400',
                        effect.type === 'status' && 'bg-blue-400',
                        effect.type === 'card' && 'bg-purple-400',
                        effect.type === 'area' && 'bg-red-400'
                      )} />
                      <span className="text-slate-300">{effect.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-xs text-slate-500">技能效果已应用</p>
            </div>
          </div>
        </div>
      )}

      {/* 卡牌详情弹窗 */}
      <CardDetailModal
        card={selectedCard}
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
      />
    </div>
  );
}

export default AIActionVisualizer;
