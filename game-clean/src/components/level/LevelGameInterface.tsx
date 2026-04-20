﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  Cpu, 
  Coins, 
  Eye, 
  Key,
  Zap, 
  ArrowRight,
  Users,
  Skull,
  Target,
  Info,
  Play,
  Trash2,
  CheckCircle2,
  Sparkles,
  Sword,
  History,
  AlertTriangle,
  Clock
} from 'lucide-react';
import type { LevelGameState, LevelId, AreaType, LevelTurnPhase, TurnActor } from '@/types/levelTypes';
import { AREA_NAMES, TUTORIAL_FOCUS_NAMES, getLevelHandLimit } from '@/types/levelTypes';
import { XIAOBAI_CHARACTER, DADONG_AI } from '@/data/levelCharacters';
import { getEnemiesByLevel, getEnemyById, type EnemyCharacter } from '@/data/levelEnemies';
import type { Card as CardType } from '@/types/legacy/card_v16';
import { LevelTurnPhaseIndicator } from './LevelTurnPhaseIndicator';
import { AreaSelectionModal } from './AreaSelectionModal';
import { SkillDetailPanel } from './SkillDetailPanel';
import { JudgmentProcessPanel } from '@/components/game/judgment/JudgmentProcessPanel';
import { JudgmentEventBus, type JudgmentEventData, type JudgmentResultData } from '@/engine/JudgmentEventBus';
import { PhaseTimerEventBus } from '@/engine/PhaseTimerEventBus';
import { LevelPhaseTimer } from './LevelPhaseTimer';
import { AIActionVisualizer, type AIActor, type CardInfo, type HandState, type JudgmentInfo, type AIResourceState } from './AIActionVisualizer';
import { GameLogPanel } from '@/components/game/GameLogPanel';
import type { GameLogEntry } from '@/types/gameRules';
import { KnowledgePopup } from './KnowledgePopup';
import './SkillButtonEffect.css';
import { useSkillButtonEffect } from '@/hooks/useSkillButtonEffect';

const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  compute: <Cpu className="w-3 h-3" />,
  funds: <Coins className="w-3 h-3" />,
  information: <Eye className="w-3 h-3" />,
  permission: <Key className="w-3 h-3" />,
};

const RESOURCE_COLORS: Record<string, string> = {
  compute: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50 shadow-cyan-500/20',
  funds: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50 shadow-yellow-500/20',
  information: 'text-green-400 bg-green-500/20 border-green-500/50 shadow-green-500/20',
  permission: 'text-purple-400 bg-purple-500/20 border-purple-500/50 shadow-purple-500/20',
};

const RARITY_STYLES: Record<string, { border: string; glow: string; badge: string }> = {
  common: {
    border: 'border-slate-600 hover:border-slate-500',
    glow: 'hover:shadow-slate-500/30',
    badge: 'bg-slate-700 text-slate-200 border-slate-600',
  },
  rare: {
    border: 'border-blue-500/50 hover:border-blue-400',
    glow: 'hover:shadow-blue-500/40',
    badge: 'bg-blue-600/80 text-blue-100 border-blue-500/50',
  },
  epic: {
    border: 'border-purple-500/50 hover:border-purple-400',
    glow: 'hover:shadow-purple-500/40',
    badge: 'bg-purple-600/80 text-purple-100 border-purple-500/50',
  },
  legendary: {
    border: 'border-yellow-500/50 hover:border-yellow-400',
    glow: 'hover:shadow-yellow-500/50',
    badge: 'bg-yellow-600/80 text-yellow-100 border-yellow-500/50',
  },
};

const PHASE_NAMES: Record<LevelTurnPhase, string> = {
  judgment: '判定阶段',
  recovery: '恢复阶段',
  draw: '摸牌阶段',
  action: '行动阶段',
  response: '响应阶段',
  discard: '弃牌阶段',
  end: '结束阶段'
};

interface LevelCardHandItemProps {
  card: CardType;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDetailClick: () => void;
}

function LevelCardHandItem({
  card,
  index,
  isSelected,
  onClick,
  onDetailClick,
}: LevelCardHandItemProps) {
  const rarityStyle = RARITY_STYLES[card.rarity] || RARITY_STYLES.common;
  const cost = (card.cost as Record<string, number>) || {};
  const hasCost = cost.compute > 0 || cost.funds > 0 || cost.information > 0 || (cost.access || cost.permission) > 0;

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          'relative w-28 h-40 rounded-lg border-2 transition-all duration-300 overflow-hidden',
          'flex flex-col',
          rarityStyle.border,
          rarityStyle.glow,
          'bg-gradient-to-br from-blue-950/90 via-slate-900 to-slate-950',
          isSelected 
            ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105 shadow-lg shadow-cyan-500/50 border-cyan-400' 
            : 'hover:scale-105 hover:shadow-xl'
        )}
      >
        <div className="flex items-center justify-between p-1.5 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-400" />
            <span className="text-[9px] font-bold text-white truncate max-w-[50px]">
              {card.name}
            </span>
          </div>
          <span className={cn('text-[7px] px-1 py-0.5 rounded border', rarityStyle.badge)}>
            T{card.techLevel}
          </span>
        </div>

        <div className="flex-1 relative flex items-center justify-center p-1.5">
          <div className="absolute inset-1 bg-slate-800/30 rounded flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:8px_8px]" />
            <span className="text-3xl opacity-30">🛡️</span>
          </div>
          
          {card.difficulty > 0 && (
            <div className="absolute top-0.5 right-0.5 flex gap-0.5">
              {Array.from({ length: Math.min(card.difficulty, 3) }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50" />
              ))}
            </div>
          )}

          {card.comboEffect && (
            <div className="absolute bottom-0.5 right-0.5">
              <Sparkles className="w-3 h-3 text-orange-400 drop-shadow-lg" />
            </div>
          )}
        </div>

        <div className="p-1.5 space-y-1 border-t border-slate-700/50 bg-slate-900/50">
          {hasCost && (
            <div className="flex flex-wrap gap-0.5">
              {cost.compute > 0 && (
                <span className={cn('text-[7px] px-1 py-0.5 rounded border flex items-center gap-0.5', RESOURCE_COLORS.compute)}>
                  {RESOURCE_ICONS.compute} {cost.compute}
                </span>
              )}
              {cost.funds > 0 && (
                <span className={cn('text-[7px] px-1 py-0.5 rounded border flex items-center gap-0.5', RESOURCE_COLORS.funds)}>
                  {RESOURCE_ICONS.funds} {cost.funds}
                </span>
              )}
              {cost.information > 0 && (
                <span className={cn('text-[7px] px-1 py-0.5 rounded border flex items-center gap-0.5', RESOURCE_COLORS.information)}>
                  {RESOURCE_ICONS.information} {cost.information}
                </span>
              )}
              {(cost.access || cost.permission) > 0 && (
                <span className={cn('text-[7px] px-1 py-0.5 rounded border flex items-center gap-0.5', RESOURCE_COLORS.permission)}>
                  {RESOURCE_ICONS.permission} {cost.access || cost.permission}
                </span>
              )}
            </div>
          )}

          <p className="text-[8px] text-slate-400 line-clamp-2 leading-tight">
            {card.description.slice(0, 25)}...
          </p>
        </div>

        {isSelected && (
          <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDetailClick();
        }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 hover:bg-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 opacity-0 group-hover:opacity-100 transition-all duration-300 border border-slate-600 hover:border-cyan-400 z-10"
      >
        <Info className="w-2.5 h-2.5 text-white" />
      </button>

      <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center text-[8px] text-cyan-400 font-mono border border-cyan-500/50 shadow-lg shadow-cyan-500/20">
        {index + 1}
      </div>
    </div>
  );
}

interface CardDetailModalProps {
  card: CardType | null;
  isOpen: boolean;
  onClose: () => void;
}

function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  if (!isOpen || !card) return null;

  const cost = (card.cost as Record<string, number>) || {};
  const rarityStyle = RARITY_STYLES[card.rarity] || RARITY_STYLES.common;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className={cn(
          'bg-slate-900/95 border-2 rounded-xl p-6 max-w-md w-full shadow-2xl',
          'backdrop-blur-md',
          rarityStyle.border
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-blue-400" />
              <h3 className="text-xl font-bold text-white drop-shadow-lg">{card.name}</h3>
            </div>
            <p className="text-sm text-slate-400 font-mono">{card.card_code}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={cn(rarityStyle.badge, 'border')}>
              {card.rarity}
            </Badge>
            <Badge variant="outline" className="text-yellow-400 border-yellow-500/50">
              T{card.techLevel}
            </Badge>
          </div>
        </div>

        {(cost.compute > 0 || cost.funds > 0 || cost.information > 0 || (cost.access || cost.permission) > 0) && (
          <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700/50">
            <p className="text-sm text-slate-400 mb-2">资源消耗</p>
            <div className="flex flex-wrap gap-2">
              {cost.compute > 0 && (
                <div className={cn('px-3 py-1.5 rounded-lg border flex items-center gap-2 shadow-lg', RESOURCE_COLORS.compute)}>
                  {RESOURCE_ICONS.compute}
                  <span className="font-bold">算力 {cost.compute}</span>
                </div>
              )}
              {cost.funds > 0 && (
                <div className={cn('px-3 py-1.5 rounded-lg border flex items-center gap-2 shadow-lg', RESOURCE_COLORS.funds)}>
                  {RESOURCE_ICONS.funds}
                  <span className="font-bold">资金 {cost.funds}</span>
                </div>
              )}
              {cost.information > 0 && (
                <div className={cn('px-3 py-1.5 rounded-lg border flex items-center gap-2 shadow-lg', RESOURCE_COLORS.information)}>
                  {RESOURCE_ICONS.information}
                  <span className="font-bold">信息 {cost.information}</span>
                </div>
              )}
              {(cost.access || cost.permission) > 0 && (
                <div className={cn('px-3 py-1.5 rounded-lg border flex items-center gap-2 shadow-lg', RESOURCE_COLORS.permission)}>
                  {RESOURCE_ICONS.permission}
                  <span className="font-bold">权限 {cost.access || cost.permission}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700/50">
          <p className="text-sm text-slate-300 leading-relaxed">{card.description}</p>
        </div>

        {card.difficulty > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-slate-400">判定难度:</span>
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center text-xs font-bold border',
                    i < card.difficulty 
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

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-cyan-600 text-white rounded-lg transition-all duration-300 border border-slate-600 hover:border-cyan-400 shadow-lg hover:shadow-cyan-500/30"
        >
          关闭
        </button>
      </div>
    </div>
  );
}

interface TechButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant: 'play' | 'discard' | 'end';
  children: React.ReactNode;
}

function TechButton({ onClick, disabled, variant, children }: TechButtonProps) {
  const variantStyles = {
    play: {
      base: 'bg-blue-600/80 border-blue-500/50 text-blue-100',
      hover: 'hover:bg-blue-500 hover:border-blue-400 hover:shadow-blue-500/40',
      disabled: 'opacity-50 cursor-not-allowed bg-blue-600/40 border-blue-500/20',
      icon: <Play className="w-4 h-4" />,
    },
    discard: {
      base: 'bg-red-600/80 border-red-500/50 text-red-100',
      hover: 'hover:bg-red-500 hover:border-red-400 hover:shadow-red-500/40',
      disabled: 'opacity-50 cursor-not-allowed bg-red-600/40 border-red-500/20',
      icon: <Trash2 className="w-4 h-4" />,
    },
    end: {
      base: 'bg-slate-700/80 border-slate-600/50 text-slate-200',
      hover: 'hover:bg-slate-600 hover:border-slate-500 hover:shadow-slate-500/30',
      disabled: 'opacity-50 cursor-not-allowed bg-slate-700/40 border-slate-600/20',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  };

  const style = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded-lg border-2 font-medium transition-all duration-300',
        'flex items-center gap-2 shadow-lg w-full justify-center',
        style.base,
        !disabled && style.hover,
        disabled && style.disabled
      )}
    >
      {style.icon}
      {children}
    </button>
  );
}

interface LevelGameInterfaceProps {
  gameState: LevelGameState;
  onPlayCard: (cardIndex: number) => boolean | 'needs_area_selection' | 'needs_advance_to_response';
  onPlayCardWithArea: (cardIndex: number, area: AreaType) => boolean | 'needs_advance_to_response';
  onDiscardCard?: (cardIndex: number) => void;
  onEndTurn: () => void;
  onEndDiscard?: () => void;
  onAdvancePhase?: () => Promise<void> | void;
  onExit: () => void;
  getCardAreaSelectionInfo?: (card: CardType) => { title: string; description: string } | null;
  onJudgmentComplete?: (judgmentId: string, resultData: any) => void;
}

export function LevelGameInterface({
  gameState,
  onPlayCard,
  onPlayCardWithArea,
  onDiscardCard,
  onEndTurn,
  onEndDiscard,
  onAdvancePhase,
  onExit,
  getCardAreaSelectionInfo,
  onJudgmentComplete
}: LevelGameInterfaceProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [detailCard, setDetailCard] = useState<CardType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [phaseLog, setPhaseLog] = useState<string[]>([]);
  const [isAreaSelectionOpen, setIsAreaSelectionOpen] = useState(false);
  const [areaSelectionInfo, setAreaSelectionInfo] = useState<{ title: string; description: string; cardName: string } | null>(null);
  const [pendingCardIndex, setPendingCardIndex] = useState<number | null>(null);
  
  // 技能面板状态
  const [skillPanelOpen, setSkillPanelOpen] = useState(false);
  const [skillPanelTarget, setSkillPanelTarget] = useState<'player' | 'dadong' | 'enemy' | null>(null);
  const [skillPanelPosition, setSkillPanelPosition] = useState({ x: 0, y: 0 });
  const [skillPanelData, setSkillPanelData] = useState<{
    characterName: string;
    characterTitle?: string;
    skills: Array<{
      id: string;
      name: string;
      description: string;
      type: 'active' | 'passive' | 'trigger';
      cooldown?: number;
      currentCooldown?: number;
      effect: string;
    }>;
  } | null>(null);
  const prevPhaseRef = useRef<LevelTurnPhase | null>(null);
  const isAdvancingRef = useRef(false);
  const onAdvancePhaseRef = useRef(onAdvancePhase);
  const isFirstRenderRef = useRef(true);
  const aiVisualizationActiveRef = useRef(false);
  // 全局AI执行锁 - 防止AI回合期间任何自动阶段推进
  const aiTurnExecutingRef = useRef(false);
  // 定时器引用 - 用于跨渲染清除定时器
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 判定UI状态
  const [judgmentProcessOpen, setJudgmentProcessOpen] = useState(false);
  const [currentJudgmentEvent, setCurrentJudgmentEvent] = useState<JudgmentEventData | null>(null);

  // 日志面板状态
  const [gameLogs, setGameLogs] = useState<GameLogEntry[]>([]);
  const [showLogPanel, setShowLogPanel] = useState(false);
  const lastLogKeyRef = useRef<string | null>(null);

  // AI行动可视化状态
  const [aiVisualization, setAiVisualization] = useState<{
    isVisible: boolean;
    actor: AIActor;
    phase: LevelTurnPhase;
    actionType?: string;
    targetCard?: { name: string; type: string };
    targetArea?: string;
    progress: number;
    actionDescription?: string;
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
    enemyName?: string;
    enemyType?: string;
  }>({
    isVisible: false,
    actor: 'dadong',
    phase: 'judgment',
    progress: 0,
    enemyName: undefined,
    enemyType: undefined
  });

  onAdvancePhaseRef.current = onAdvancePhase;

  const playerState = gameState.playerState;
  const enemyState = gameState.enemyState;
  const areaControl = gameState.areaControl;
  const currentPhase = gameState.currentPhase || 'action';
  const currentRound = gameState.round || 1;
  const currentActor = gameState.currentActor || 'player';
  const pendingJudgments = gameState.pendingJudgments || [];
  const responseEvents = gameState.responseEvents || [];
  const hasPendingDelayedJudgments = pendingJudgments.some(j => !j.resolved && !(j as any).isImmediate);
  const hasPendingImmediateJudgments = pendingJudgments.some(j => !j.resolved && (j as any).isImmediate === true);
  const hasResponseEvents = responseEvents.some(e => !e.responded);

  // 知识弹窗状态
  const [knowledgePopup, setKnowledgePopup] = useState<{
    isOpen: boolean;
    knowledge: import('@/data/dadongKnowledgeBase').KnowledgeEntry | null;
    onComplete?: (resourceType: 'computing' | 'funds' | 'information', resourceName: string) => void;
  }>({
    isOpen: false,
    knowledge: null
  });

  // 技能按钮特效
  const { registerSkillButton, triggerSkillEffect, clearAllEffects } = useSkillButtonEffect();

  // 准备AI资源和手牌数据
  const aiResources: AIResourceState | undefined = currentActor === 'dadong' ? {
    computing: gameState.dadongAIState.resources.computing,
    funds: gameState.dadongAIState.resources.funds,
    information: gameState.dadongAIState.resources.information,
    maxComputing: 10,
    maxFunds: 10,
    maxInformation: 10
  } : currentActor === 'enemy' ? {
    computing: enemyState.resources?.computing || 0,
    funds: enemyState.resources?.funds || 0,
    information: enemyState.resources?.information || 0,
    maxComputing: 10,
    maxFunds: 10,
    maxInformation: 10
  } : currentActor === 'enemy2' ? {
    computing: gameState.enemy2State?.resources?.computing || 0,
    funds: gameState.enemy2State?.resources?.funds || 0,
    information: gameState.enemy2State?.resources?.information || 0,
    maxComputing: 10,
    maxFunds: 10,
    maxInformation: 10
  } : undefined;

  // 大东手牌 - 仅在大东回合显示
  const dadongHandCards: CardInfo[] | undefined = currentActor === 'dadong' 
    ? gameState.dadongAIState.hand.map(card => ({
        name: card.name,
        type: card.type || '普通',
        card_code: card.card_code,
        cost: card.cost,
        effect: card.description || card.effect,
        rarity: card.rarity as any,
        techLevel: card.techLevel,
        difficulty: card.difficulty,
        icon: card.icon || '🃏'
      }))
    : undefined;
  
  // 敌人手牌 - 始终显示（不管当前是谁的回合）
  // 敌人1手牌
  const enemy1HandCards: CardInfo[] | undefined = gameState.enemyState.hand?.length > 0
    ? gameState.enemyState.hand.map(card => ({
        name: card.name,
        type: card.type || '普通',
        card_code: card.card_code,
        cost: card.cost,
        effect: card.description || card.effect,
        rarity: card.rarity as any,
        techLevel: card.techLevel,
        difficulty: card.difficulty,
        icon: card.icon || '🃏'
      }))
    : undefined;
  
  // 敌人2手牌（如果有）
  const enemy2HandCards: CardInfo[] | undefined = gameState.enemy2State?.hand?.length > 0
    ? gameState.enemy2State.hand.map(card => ({
        name: card.name,
        type: card.type || '普通',
        card_code: card.card_code,
        cost: card.cost,
        effect: card.description || card.effect,
        rarity: card.rarity as any,
        techLevel: card.techLevel,
        difficulty: card.difficulty,
        icon: card.icon || '🃏'
      }))
    : undefined;
  
  // 根据当前回合决定显示哪个AI的手牌
  const aiHandCards: CardInfo[] | undefined = currentActor === 'dadong' 
    ? dadongHandCards 
    : currentActor === 'enemy'
    ? enemy1HandCards 
    : currentActor === 'enemy2'
    ? enemy2HandCards
    : undefined;

  // 组件挂载时强制触发一次阶段检查
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      console.log('[LevelGameInterface] First render, current phase:', currentPhase);
      // 如果是判定阶段且没有待处理判定，立即触发推进
      if (currentPhase === 'judgment' && !hasPendingDelayedJudgments && onAdvancePhaseRef.current) {
        console.log('[LevelGameInterface] First render judgment phase, scheduling advance');
        setTimeout(() => {
          onAdvancePhaseRef.current?.();
        }, 500);
      }
    }
  }, []);

  useEffect(() => {
    console.log('[LevelGameInterface] useEffect triggered', { 
      currentPhase, 
      prevPhase: prevPhaseRef.current,
      hasPendingDelayedJudgments,
      hasPendingImmediateJudgments,
      hasResponseEvents,
      hasOnAdvancePhase: !!onAdvancePhaseRef.current,
      isAdvancing: isAdvancingRef.current,
      isDadongTurn: gameState.isDadongTurn,
      isEnemyTurn: gameState.isEnemyTurn,
      isEnemy2Turn: gameState.isEnemy2Turn
    });
    
    // 关键修复：如果当前是AI回合，不执行任何自动推进逻辑，并清除任何待处理的定时器
    if (gameState.isDadongTurn || gameState.isEnemyTurn || gameState.isEnemy2Turn) {
      console.log('[LevelGameInterface] AI turn in progress - skipping all auto-advance logic and clearing timers');
      // 清除任何待处理的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      isAdvancingRef.current = false;
      // 更新 prevPhase 以避免AI回合结束后立即触发自动推进
      prevPhaseRef.current = currentPhase;
      return;
    }
    
    // 额外保护：如果全局AI执行锁激活，跳过自动推进
    if (aiTurnExecutingRef.current) {
      console.log('[LevelGameInterface] AI turn executing lock active - skipping auto-advance');
      prevPhaseRef.current = currentPhase;
      return;
    }
    
    if (prevPhaseRef.current === currentPhase) {
      console.log('[LevelGameInterface] Same phase, skipping');
      return;
    }
    
    prevPhaseRef.current = currentPhase;
    isAdvancingRef.current = false;

    setPhaseLog(prev => [...prev, `进入${PHASE_NAMES[currentPhase]}`]);

    // 添加日志记录 - 完整格式：轮次·回合·阶段·具体行为
    // 仅在玩家回合时记录阶段变化日志，AI回合的日志由handleVisualizationUpdate处理
    if (currentActor === 'player') {
      const actorName = '玩家';
      const phaseName = PHASE_NAMES[currentPhase] || currentPhase;
      const newLog: GameLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        round: gameState.round,
        phase: currentPhase as any,
        actor: currentActor,
        type: 'phase_change',
        message: `轮${gameState.round}·${actorName}回合·${phaseName}·进入阶段`,
        details: {}
      };
      setGameLogs(prev => [...prev, newLog]);
    }

    const autoAdvanceDelay = 800;

    // 检查是否正在执行AI回合 - 如果是，禁止自动推进阶段
    const isAITurn = gameState.isDadongTurn || gameState.isEnemyTurn || gameState.isEnemy2Turn;
    console.log('[LevelGameInterface] auto advance check:', { currentPhase, isAITurn, isDadongTurn: gameState.isDadongTurn, isEnemyTurn: gameState.isEnemyTurn, isEnemy2Turn: gameState.isEnemy2Turn });

    const scheduleAdvance = (delay: number) => {
      // AI回合时不自动推进阶段 - AI有自己的阶段执行流程
      if (isAITurn) {
        console.log('[LevelGameInterface] AI turn in progress, skip auto advance');
        return;
      }
      // 关键保护：如果AI可视化激活期间，不自动推进
      if (aiVisualizationActiveRef.current) {
        console.log('[LevelGameInterface] AI visualization active, skip auto advance');
        return;
      }
      // 额外保护：如果全局AI执行锁激活，不自动推进
      if (aiTurnExecutingRef.current) {
        console.log('[LevelGameInterface] AI turn executing lock active, skip auto advance');
        return;
      }
      if (isAdvancingRef.current) {
        console.log('[LevelGameInterface] Already advancing, skip scheduling');
        return;
      }
      isAdvancingRef.current = true;
      timerRef.current = setTimeout(() => {
        console.log('[LevelGameInterface] Timer fired, calling onAdvancePhase, current phase:', currentPhase);
        isAdvancingRef.current = false;
        timerRef.current = null;
        onAdvancePhaseRef.current?.();
      }, delay);
    };

    // 阶段自动推进逻辑
    switch (currentPhase) {
      case 'judgment':
        console.log('[LevelGameInterface] Judgment phase, hasPendingDelayedJudgments:', hasPendingDelayedJudgments);
        if (!hasPendingDelayedJudgments) {
          scheduleAdvance(autoAdvanceDelay);
        }
        break;
      case 'recovery':
      case 'draw':
        // 恢复和摸牌阶段自动推进
        scheduleAdvance(autoAdvanceDelay);
        break;
      case 'action':
        // 行动阶段：当玩家行动点用完或主动结束回合时推进
        // 注意：行动阶段不由界面自动推进，由玩家点击"结束回合"按钮触发
        console.log('[LevelGameInterface] Action phase - waiting for player action');
        break;
      case 'response':
        console.log('[LevelGameInterface] Response phase, hasPendingImmediateJudgments:', hasPendingImmediateJudgments, 'hasResponseEvents:', hasResponseEvents);
        if (!hasPendingImmediateJudgments && !hasResponseEvents) {
          scheduleAdvance(500);
        }
        break;
      case 'discard':
        const handLimit = getLevelHandLimit(currentRound);
        if (playerState.hand.length <= handLimit) {
          scheduleAdvance(500);
        }
        break;
      case 'end':
        scheduleAdvance(autoAdvanceDelay);
        break;
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        isAdvancingRef.current = false;
      }
    };
  }, [currentPhase, currentRound, playerState.hand.length, hasPendingDelayedJudgments, hasPendingImmediateJudgments, hasResponseEvents]);

  // 监听判定事件总线
  useEffect(() => {
    const handleJudgmentStart = (data: JudgmentEventData) => {
      console.log('[LevelGameInterface] 收到判定开始事件:', data);
      setCurrentJudgmentEvent(data);
      setJudgmentProcessOpen(true);
    };

    const handleJudgmentEnd = (data: JudgmentResultData) => {
      console.log('[LevelGameInterface] 收到判定结束事件:', data);
      setTimeout(() => {
        setJudgmentProcessOpen(false);
        setCurrentJudgmentEvent(null);
      }, 1500);
    };

    const unsubscribeStart = JudgmentEventBus.onJudgmentStart(handleJudgmentStart);
    const unsubscribeEnd = JudgmentEventBus.onJudgmentEnd(handleJudgmentEnd);

    return () => {
      unsubscribeStart();
      unsubscribeEnd();
    };
  }, []);

  const handleTimerTimeout = useCallback((phase: LevelTurnPhase) => {
    console.log('[LevelGameInterface] Timer timeout for phase:', phase);
    
    if (phase === 'action') {
      console.log('[LevelGameInterface] Action phase timeout, ending turn');
      onEndTurn();
    } else if (phase === 'discard') {
      const handLimit = getLevelHandLimit(currentRound);
      if (playerState.hand.length > handLimit && onDiscardCard) {
        console.log('[LevelGameInterface] Discard phase timeout, forced discard');
        
        const discardCount = playerState.hand.length - handLimit;
        for (let i = 0; i < discardCount; i++) {
          setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * playerState.hand.length);
            onDiscardCard(randomIndex);
          }, i * 300);
        }
      } else if (playerState.hand.length <= handLimit && onEndDiscard) {
        // 手牌数量符合要求，自动结束弃牌阶段
        console.log('[LevelGameInterface] Discard phase timeout, hand limit satisfied, auto ending discard');
        onEndDiscard();
      }
    }
  }, [currentRound, playerState.hand.length, onDiscardCard, onEndDiscard, onEndTurn]);

  // AI行动可视化更新处理
  useEffect(() => {
    // 当当前行动者变化时，控制可视化显示/隐藏
    if (currentActor === 'player') {
      // 玩家回合时隐藏AI可视化
      setAiVisualization(prev => ({
        ...prev,
        isVisible: false
      }));
    } else if (currentActor === 'dadong' || currentActor === 'enemy' || currentActor === 'enemy2') {
      // 大东或敌人回合时显示AI可视化
      setAiVisualization(prev => ({
        ...prev,
        isVisible: true,
        actor: currentActor === 'enemy2' ? 'enemy' : currentActor,
        phase: 'judgment',
        progress: 0,
        enemyName: currentActor === 'enemy' || currentActor === 'enemy2' ? enemyState.name : undefined,
        enemyType: currentActor === 'enemy' || currentActor === 'enemy2' ? enemyState.type : undefined
      }));
    }
  }, [currentActor, enemyState.name, enemyState.type]);

  // 处理AI可视化更新回调
  const handleVisualizationUpdate = useCallback((data: {
    actor: AIActor;
    phase: LevelTurnPhase;
    actionType?: string;
    progress: number;
    isVisible: boolean;
    message?: string;
    targetCard?: { name: string; type: string };
    targetArea?: string;
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
    enemyName?: string;
    enemyType?: string;
  }) => {
    console.log('[LevelGameInterface] AI可视化更新:', data);
    
    // 关键保护：如果AI可视化激活期间，设置锁定标志
    if (data.isVisible) {
      aiVisualizationActiveRef.current = true;
      aiTurnExecutingRef.current = true; // 设置全局AI执行锁
      console.log('[LevelGameInterface] AI可视化激活，设置锁定标志');
    } else {
      aiVisualizationActiveRef.current = false;
      // 当AI回合结束阶段且可视化关闭时，解锁全局AI执行锁
      if (data.phase === 'end') {
        aiTurnExecutingRef.current = false;
        console.log('[LevelGameInterface] AI回合结束，解除全局执行锁');
      }
      console.log('[LevelGameInterface] AI可视化关闭，解除锁定标志');
    }
    
    // 根据阶段类型记录详细日志
    const actorName = data.actor === 'dadong' ? '大东' : data.actor === 'enemy2' ? '敌人2' : (data.enemyName || '敌人1');
    const phaseName = PHASE_NAMES[data.phase] || data.phase;
    const roundInfo = `轮${gameState.round}·${actorName}回合·${phaseName}`;
    let logDescription = '';
    let logType: GameLogEntry['type'] = 'phase_change';
    
    switch (data.phase) {
      case 'judgment':
        if (data.judgmentInfo) {
          logType = 'judgment';
          const judgmentType = data.judgmentInfo.judgmentType === 'dice' ? '骰子判定' : '猜拳判定';
          const resultText = data.judgmentInfo.resultType === 'critical_success' ? '🎯大成功' : 
                            data.judgmentInfo.resultType === 'critical_failure' ? '💥大失败' :
                            data.judgmentInfo.success ? '✅成功' : '❌失败';
          logDescription = `${roundInfo}·判定【${data.judgmentInfo.cardName || '未知卡牌'}】 - ${judgmentType} - ${resultText}`;
          if (data.judgmentInfo.diceRoll) {
            logDescription += ` (掷骰:${data.judgmentInfo.diceRoll}/${data.judgmentInfo.difficulty || '?'})`;
          }
          if (data.judgmentInfo.effectDescription) {
            logDescription += ` | 效果:${data.judgmentInfo.effectDescription}`;
          }
        } else {
          logDescription = `${roundInfo}·进入判定阶段`;
        }
        break;
      case 'recovery':
        logType = 'resource_change';
        if (data.handState?.count !== undefined) {
          logDescription = `${roundInfo}·资源已恢复`;
        } else {
          logDescription = `${roundInfo}·资源已恢复`;
        }
        break;
      case 'draw':
        if (data.drawnCards && data.drawnCards.length > 0) {
          logType = 'card_draw';
          // 统计牌型分布
          const typeCount: Record<string, number> = {};
          data.drawnCards.forEach(card => {
            const type = card.type || '普通';
            typeCount[type] = (typeCount[type] || 0) + 1;
          });
          const typeSummary = Object.entries(typeCount).map(([type, count]) => `${type}${count}张`).join('、');
          
          logDescription = `${roundInfo}·摸牌: ${data.drawnCards.map(c => c.name).join('、')}`;
          logDescription += ` (共${data.drawnCards.length}张 | 牌型:${typeSummary})`;
          if (data.handCountBefore !== undefined && data.handCountAfter !== undefined) {
            logDescription += ` | 手牌:${data.handCountBefore}→${data.handCountAfter}`;
          }
        } else {
          logDescription = `${roundInfo}·摸牌阶段 (手牌:${data.handCountAfter || 0})`;
        }
        break;
      case 'action':
        if (data.playedCard) {
          logType = 'card_play';
          const cardType = data.playedCard.type || '普通';
          const costInfo: string[] = [];
          if (data.playedCard.cost) {
            if (data.playedCard.cost.compute) costInfo.push(`算力${data.playedCard.cost.compute}`);
            if (data.playedCard.cost.funds) costInfo.push(`资金${data.playedCard.cost.funds}`);
            if (data.playedCard.cost.information) costInfo.push(`信息${data.playedCard.cost.information}`);
          }
          const costStr = costInfo.length > 0 ? ` (消耗:${costInfo.join('、')})` : '';
          
          logDescription = `${roundInfo}·使用【${data.playedCard.name}】(${cardType})${costStr}`;
          if (data.playedCard.effect) {
            logDescription += ` | 效果:${data.playedCard.effect}`;
          }
          if (data.targetInfo?.areaName) {
            logDescription += ` | 目标:${data.targetInfo.areaName}`;
          }
        } else if (data.skillInfo) {
          logType = 'skill_use';
          logDescription = `${roundInfo}·使用技能【${data.skillInfo.name}】 - ${data.skillInfo.description}`;
          if (data.skillInfo.cooldown) {
            logDescription += ` (冷却:${data.skillInfo.cooldown})`;
          }
        } else if (data.actionLog) {
          logType = 'action';
          logDescription = `${roundInfo}·${data.actionLog}`;
        } else {
          logDescription = `${roundInfo}·行动阶段`;
        }
        break;
      case 'response':
        if (data.judgmentInfo) {
          logType = 'judgment';
          const judgmentType = data.judgmentInfo.judgmentType === 'dice' ? '骰子判定' : '猜拳判定';
          const resultText = data.judgmentInfo.resultType === 'critical_success' ? '🎯大成功' : 
                            data.judgmentInfo.resultType === 'critical_failure' ? '💥大失败' :
                            data.judgmentInfo.success ? '✅成功' : '❌失败';
          logDescription = `${roundInfo}·响应判定【${data.judgmentInfo.cardName || '未知卡牌'}】 - ${judgmentType} - ${resultText}`;
          if (data.judgmentInfo.diceRoll) {
            logDescription += ` (掷骰:${data.judgmentInfo.diceRoll})`;
          }
          if (data.judgmentInfo.responseAction) {
            logDescription += ` | 行动:${data.judgmentInfo.responseAction}`;
          }
        } else {
          logDescription = `${roundInfo}·响应阶段`;
        }
        break;
      case 'discard':
        if (data.handCountBefore !== undefined && data.handCountAfter !== undefined && data.handCountBefore > data.handCountAfter) {
          logType = 'card_discard';
          const discardCount = data.handCountBefore - data.handCountAfter;
          logDescription = `${roundInfo}·弃牌: ${discardCount}张`;
          if (data.discardedCards && data.discardedCards.length > 0) {
            // 统计弃牌类型
            const typeCount: Record<string, number> = {};
            data.discardedCards.forEach(card => {
              const type = card.type || '普通';
              typeCount[type] = (typeCount[type] || 0) + 1;
            });
            const typeSummary = Object.entries(typeCount).map(([type, count]) => `${type}${count}张`).join('、');
            const cardNames = data.discardedCards.map(c => c.name).join('、');
            logDescription += ` (${cardNames} | 牌型:${typeSummary})`;
          }
          logDescription += ` | 手牌:${data.handCountBefore}→${data.handCountAfter}`;
        } else {
          logDescription = `${roundInfo}·弃牌阶段 (手牌:${data.handCountAfter || 0})`;
        }
        break;
      case 'end':
        logDescription = `${roundInfo}·回合结束`;
        break;
      default:
        logDescription = `${roundInfo}·${data.actionType || ''}`;
    }
    
    if (logDescription) {
      // 日志去重：使用轮次+角色+阶段+描述作为唯一键
      const logKey = `${gameState.round}-${data.actor}-${data.phase}-${logDescription}`;
      if (lastLogKeyRef.current !== logKey) {
        lastLogKeyRef.current = logKey;
        const newLog: GameLogEntry = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          round: gameState.round,
          phase: data.phase,
          actor: data.actor === 'dadong' ? 'dadong' : data.actor === 'enemy2' ? 'enemy2' : 'enemy',
          type: logType,
          message: logDescription,
          details: {
            cardName: data.playedCard?.name || data.judgmentInfo?.cardName,
            target: data.targetInfo?.areaName,
            result: data.judgmentInfo?.result
          }
        };
        setGameLogs(prev => [...prev, newLog]);
      }
    }
    
    setAiVisualization({
      isVisible: data.isVisible,
      actor: data.actor,
      phase: data.phase,
      actionType: data.actionType,
      targetCard: data.targetCard,
      targetArea: data.targetArea,
      progress: data.progress,
      actionDescription: data.message,
      playedCard: data.playedCard,
      handState: data.handState,
      judgmentInfo: data.judgmentInfo,
      drawnCards: data.drawnCards,
      handCountBefore: data.handCountBefore,
      handCountAfter: data.handCountAfter,
      actionLog: data.actionLog,
      targetInfo: data.targetInfo,
      skillInfo: data.skillInfo,
      enemyName: data.enemyName,
      enemyType: data.enemyType
    });
  }, [gameState.round]);

  // 暴露可视化更新回调给父组件
  useEffect(() => {
    // 将回调函数附加到 window 对象，以便 LevelAIController 可以访问
    (window as unknown as { onLevelAIVisualizationUpdate?: typeof handleVisualizationUpdate }).onLevelAIVisualizationUpdate = handleVisualizationUpdate;
    
    return () => {
      delete (window as unknown as { onLevelAIVisualizationUpdate?: typeof handleVisualizationUpdate }).onLevelAIVisualizationUpdate;
    };
  }, [handleVisualizationUpdate]);

  // 处理大东知识讲解技能
  const handleKnowledgeTeaching = useCallback(async (knowledge: import('@/data/dadongKnowledgeBase').KnowledgeEntry): Promise<{ resourceType: string; resourceName: string }> => {
    return new Promise((resolve) => {
      setKnowledgePopup({
        isOpen: true,
        knowledge,
        onComplete: (resourceType, resourceName) => {
          resolve({ resourceType, resourceName });
        }
      });
    });
  }, []);

  // 暴露知识讲解回调给 LevelAIController
  useEffect(() => {
    (window as unknown as { onKnowledgeTeaching?: typeof handleKnowledgeTeaching }).onKnowledgeTeaching = handleKnowledgeTeaching;
    
    return () => {
      delete (window as unknown as { onKnowledgeTeaching?: typeof handleKnowledgeTeaching }).onKnowledgeTeaching;
    };
  }, [handleKnowledgeTeaching]);

  // 处理技能触发特效
  const handleSkillTrigger = useCallback((skillId: string, skillName: string, actor: string, instanceId?: string) => {
    // 构建技能按钮的ID
    const buttonId = actor === 'dadong' ? `dadong-${skillId}` : `enemy-${instanceId}-${skillId}`;
    
    // 触发技能特效
    triggerSkillEffect(buttonId);
    
    console.log(`[Skill Effect] ${actor} triggered ${skillName} (${skillId})`);
  }, [triggerSkillEffect]);

  // 暴露技能触发回调给 LevelAIController
  useEffect(() => {
    (window as unknown as { onSkillTrigger?: typeof handleSkillTrigger }).onSkillTrigger = handleSkillTrigger;
    
    return () => {
      delete (window as unknown as { onSkillTrigger?: typeof handleSkillTrigger }).onSkillTrigger;
    };
  }, [handleSkillTrigger]);

  const getAreaColor = (area: AreaType, controller: string) => {
    if (controller === 'player') {
      return 'bg-blue-600/30 border-blue-500';
    } else if (controller === 'enemy') {
      return 'bg-red-600/30 border-red-500';
    }
    return 'bg-gray-600/30 border-gray-500';
  };

  const handleCardClick = (index: number) => {
    if (selectedCard === index) {
      setSelectedCard(null);
    } else {
      setSelectedCard(index);
    }
  };

  const handleShowDetail = (card: CardType) => {
    setDetailCard(card);
    setIsDetailOpen(true);
  };

  const handlePlayCard = () => {
    if (selectedCard !== null) {
      const card = playerState.hand[selectedCard];
      const result = onPlayCard(selectedCard);
      
      if (result === 'needs_area_selection') {
        // 需要区域选择
        const info = getCardAreaSelectionInfo?.(card);
        if (info) {
          setAreaSelectionInfo({
            title: info.title,
            description: info.description,
            cardName: card.name
          });
          setPendingCardIndex(selectedCard);
          setIsAreaSelectionOpen(true);
        }
      } else if (result === 'needs_advance_to_response') {
        // 成功打出即时判定卡牌，但不立即进入响应阶段
        // 让玩家继续在行动阶段行动，直到玩家主动结束行动阶段
        if (currentPhase === 'action') {
          PhaseTimerEventBus.triggerAddTime(10);
        }
        setSelectedCard(null);
      } else if (result) {
        // 成功打出普通卡牌
        if (currentPhase === 'action') {
          PhaseTimerEventBus.triggerAddTime(10);
        }
        setSelectedCard(null);
      }
    }
  };

  const handleAreaSelect = (area: AreaType) => {
    if (pendingCardIndex !== null) {
      const result = onPlayCardWithArea(pendingCardIndex, area);
      setIsAreaSelectionOpen(false);
      setAreaSelectionInfo(null);
      setPendingCardIndex(null);
      setSelectedCard(null);
      
      if (result === 'needs_advance_to_response') {
        // 成功打出即时判定卡牌，但不立即进入响应阶段
        // 让玩家继续在行动阶段行动，直到玩家主动结束行动阶段
        if (currentPhase === 'action') {
          PhaseTimerEventBus.triggerAddTime(10);
        }
      } else if (result && currentPhase === 'action') {
        PhaseTimerEventBus.triggerAddTime(10);
      }
    }
  };

  const handleAreaSelectionCancel = () => {
    setIsAreaSelectionOpen(false);
    setAreaSelectionInfo(null);
    setPendingCardIndex(null);
  };

  const handleDiscardCard = () => {
    if (selectedCard !== null && onDiscardCard) {
      onDiscardCard(selectedCard);
      setSelectedCard(null);
    }
  };

  const handleEndDiscard = () => {
    if (onEndDiscard) {
      onEndDiscard();
    }
  };

  // 处理技能右键点击 - 显示技能详情面板
  const handleSkillRightClick = (
    e: React.MouseEvent,
    target: 'player' | 'dadong' | 'enemy',
    skills: Array<{
      id: string;
      name: string;
      description: string;
      effect?: string;
      type: 'active' | 'passive' | 'special' | 'trigger';
      cooldown?: number;
      maxCooldown?: number;
    }>,
    skillCooldowns: Record<string, number> | undefined,
    characterName: string,
    characterTitle?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 转换技能数据格式
    const formattedSkills = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      type: (skill.type === 'special' ? 'active' : skill.type) as 'active' | 'passive' | 'trigger',
      cooldown: skill.cooldown || skill.maxCooldown,
      currentCooldown: skillCooldowns?.[skill.id] || 0,
      effect: skill.effect || skill.description
    }));
    
    setSkillPanelData({
      characterName,
      characterTitle,
      skills: formattedSkills
    });
    setSkillPanelTarget(target);
    setSkillPanelPosition({ x: e.clientX, y: e.clientY });
    setSkillPanelOpen(true);
  };

  // 关闭技能面板
  const handleCloseSkillPanel = () => {
    setSkillPanelOpen(false);
    setSkillPanelTarget(null);
    setSkillPanelData(null);
  };

  const getObjectiveIcon = (type: string) => {
    switch (type) {
      case 'survive': return <Target className="w-4 h-4" />;
      case 'maintain_security': return <Shield className="w-4 h-4" />;
      case 'protect_areas': return <Users className="w-4 h-4" />;
      case 'collect_info': return <Eye className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const canPlayCard = currentPhase === 'action' && selectedCard !== null && playerState.actionPoints > 0;
  const canDiscardCard = currentPhase === 'discard' && selectedCard !== null;
  const canEndTurn = currentPhase === 'action';
  const handLimit = getLevelHandLimit(currentRound);
  const needsDiscard = currentPhase === 'discard' && playerState.hand.length > handLimit;

  const getPhaseActionButton = () => {
    switch (currentPhase) {
      case 'judgment':
        if (hasPendingDelayedJudgments) {
          const pendingCount = pendingJudgments.filter(j => !j.resolved && !(j as any).isImmediate).length;
          return (
            <div className="space-y-2">
              <div className="text-center text-xs text-amber-400 mb-2">
                ⚖️ 有 {pendingCount} 个待处理判定
              </div>
              <TechButton onClick={() => onAdvancePhase?.()} variant="play">
                进行判定
              </TechButton>
            </div>
          );
        }
        return (
          <div className="text-center text-sm text-slate-400 py-2">
            <div className="animate-pulse">⚖️ 判定阶段执行中...</div>
          </div>
        );
      case 'recovery':
        return (
          <div className="text-center text-sm text-slate-400 py-2">
            <div className="animate-pulse">💫 资源恢复中...</div>
          </div>
        );
      case 'draw':
        return (
          <div className="text-center text-sm text-slate-400 py-2">
            <div className="animate-pulse">🎴 抽牌中...</div>
          </div>
        );
      case 'action':
        return (
          <>
            <TechButton
              onClick={handlePlayCard}
              disabled={!canPlayCard}
              variant="play"
            >
              出牌
            </TechButton>
            <TechButton
              onClick={onEndTurn}
              disabled={!canEndTurn}
              variant="end"
            >
              结束行动
            </TechButton>
          </>
        );
      case 'response':
        if (hasResponseEvents) {
          const eventCount = responseEvents.filter(e => !e.responded).length;
          return (
            <div className="space-y-2">
              <div className="text-center text-xs text-amber-400 mb-2">
                ⏱️ 有 {eventCount} 个事件需要响应
              </div>
              <TechButton onClick={() => onAdvancePhase?.()} variant="play">
                进行响应
              </TechButton>
            </div>
          );
        }
        return (
          <div className="text-center text-sm text-slate-400 py-2">
            <div className="animate-pulse">⏱️ 响应阶段...</div>
          </div>
        );
      case 'discard':
        if (!needsDiscard) {
          return (
            <>
              <div className="text-center text-sm text-slate-400 py-2">
                <div className="animate-pulse">✅ 手牌数量符合要求</div>
              </div>
              {onEndDiscard && (
                <TechButton
                  onClick={handleEndDiscard}
                  disabled={false}
                  variant="end"
                >
                  结束弃牌
                </TechButton>
              )}
            </>
          );
        }
        return (
          <>
            <div className="text-center text-xs text-amber-400 mb-2">
              需弃置 {playerState.hand.length - handLimit} 张卡牌
            </div>
            {onDiscardCard && (
              <TechButton
                onClick={handleDiscardCard}
                disabled={!canDiscardCard}
                variant="discard"
              >
                弃牌
              </TechButton>
            )}
            {onEndDiscard && (
              <TechButton
                onClick={handleEndDiscard}
                disabled={needsDiscard}
                variant="end"
              >
                结束弃牌
              </TechButton>
            )}
          </>
        );
      case 'end':
        return (
          <div className="text-center text-sm text-slate-400 py-2">
            <div className="animate-pulse">🏁 回合结束...</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="p-3 border-b border-slate-700 bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onExit} className="text-gray-400 hover:text-white text-sm">
                退出关卡
              </Button>
              <div className="h-5 w-px bg-slate-600" />
              <div>
                <h1 className="text-lg font-bold text-white">{gameState.currentLevel.name}</h1>
                <p className="text-xs text-gray-400">{gameState.currentLevel.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LevelTurnPhaseIndicator
                currentPhase={currentPhase}
                currentActor={currentActor}
                roundNumber={currentRound}
                maxRounds={gameState.currentLevel.maxTurns || 10}
                actionPoints={{
                  current: playerState.actionPoints,
                  max: playerState.maxActionPoints
                }}
                aiOperationLogs={gameState.aiOperationLogs || []}
                showAIOperations={true}
              />
              <Badge variant="secondary" className="bg-blue-600 text-xs">
                {TUTORIAL_FOCUS_NAMES[gameState.currentLevel.tutorialFocus]}
              </Badge>
            </div>
          </div>
          <LevelPhaseTimer 
            currentPhase={currentPhase}
            onTimerTimeout={handleTimerTimeout}
          />
        </div>
      </div>

      <div className="flex-1 p-3 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-12 gap-3">
          <div className="col-span-3 space-y-3">
            <Card className="bg-slate-800/80 border-slate-600 p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  小
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{XIAOBAI_CHARACTER.name}</h3>
                  <p className="text-xs text-gray-400">{XIAOBAI_CHARACTER.title}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-400" />
                      安全等级
                    </span>
                    <span className="text-white">{playerState.securityLevel}/{playerState.maxSecurityLevel}</span>
                  </div>
                  <Progress 
                    value={(playerState.securityLevel / playerState.maxSecurityLevel) * 100}
                    className="h-1.5"
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="text-center p-1.5 rounded bg-slate-700/50">
                    <Cpu className="w-3 h-3 mx-auto text-cyan-400 mb-0.5" />
                    <div className="text-xs font-semibold text-white">{playerState.resources.computing}</div>
                    <div className="text-[10px] text-gray-400">算力</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-slate-700/50">
                    <Coins className="w-3 h-3 mx-auto text-yellow-400 mb-0.5" />
                    <div className="text-xs font-semibold text-white">{playerState.resources.funds}</div>
                    <div className="text-[10px] text-gray-400">资金</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-slate-700/50">
                    <Eye className="w-3 h-3 mx-auto text-green-400 mb-0.5" />
                    <div className="text-xs font-semibold text-white">{playerState.resources.information}</div>
                    <div className="text-[10px] text-gray-400">信息</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-slate-700/50">
                  <span className="text-gray-400 flex items-center gap-1 text-xs">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    行动点
                  </span>
                  <span className="text-white font-semibold text-xs">
                    {playerState.actionPoints}/{playerState.maxActionPoints}
                  </span>
                </div>
              </div>
            </Card>

            <Card className={cn(
              "bg-slate-800/80 border-slate-600 p-3 transition-all duration-300",
              currentActor === 'dadong' && "ring-2 ring-green-500 border-green-500"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                  currentActor === 'dadong' ? "bg-green-600 animate-pulse" : "bg-green-800"
                )}>
                  东
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{DADONG_AI.name}</h3>
                  <p className="text-xs text-gray-400">{DADONG_AI.title} (AI队友)</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-400" />
                      安全等级
                    </span>
                    <span className="text-white">{gameState.dadongAIState.securityLevel || 50}/100</span>
                  </div>
                  <Progress 
                    value={gameState.dadongAIState.securityLevel || 50}
                    className="h-1.5 bg-green-900/50"
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="text-center p-1.5 rounded bg-slate-700/50">
                    <Cpu className="w-3 h-3 mx-auto text-cyan-400 mb-0.5" />
                    <div className="text-xs font-semibold text-white">{gameState.dadongAIState.resources?.computing || 0}</div>
                    <div className="text-[10px] text-gray-400">算力</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-slate-700/50">
                    <Coins className="w-3 h-3 mx-auto text-yellow-400 mb-0.5" />
                    <div className="text-xs font-semibold text-white">{gameState.dadongAIState.resources?.funds || 0}</div>
                    <div className="text-[10px] text-gray-400">资金</div>
                  </div>
                  <div className="text-center p-1.5 rounded bg-slate-700/50">
                    <Eye className="w-3 h-3 mx-auto text-green-400 mb-0.5" />
                    <div className="text-xs font-semibold text-white">{gameState.dadongAIState.resources?.information || 0}</div>
                    <div className="text-[10px] text-gray-400">信息</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-slate-700/50">
                  <span className="text-gray-400 flex items-center gap-1 text-xs">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    行动点
                  </span>
                  <span className="text-white font-semibold text-xs">
                    {gameState.dadongAIState.actionPoints || 4}/{gameState.dadongAIState.maxActionPoints || 4}
                  </span>
                </div>
              </div>
              {DADONG_AI.skills && DADONG_AI.skills.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700">
                  <div className="text-[10px] text-gray-400 mb-1">技能冷却</div>
                  <div className="flex flex-wrap gap-1">
                    {DADONG_AI.skills.map((skill) => {
                      const cooldown = gameState.dadongAIState.skillCooldowns?.[skill.id] || 0;
                      const isReady = cooldown === 0;
                      return (
                        <button
                          key={skill.id}
                          ref={(el) => registerSkillButton(`dadong-${skill.id}`, el)}
                          onContextMenu={(e) => handleSkillRightClick(
                            e,
                            'dadong',
                            DADONG_AI.skills || [],
                            gameState.dadongAIState.skillCooldowns,
                            DADONG_AI.name,
                            DADONG_AI.title
                          )}
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-all hover:ring-1 hover:ring-cyan-400",
                            isReady 
                              ? "bg-green-900/50 text-green-400 hover:bg-green-800/50" 
                              : "bg-orange-900/50 text-orange-400 hover:bg-orange-800/50"
                          )}
                          title="右键查看详情"
                        >
                          <span className="skill-name">{skill.name}</span>{isReady ? ' ✓' : ` (${cooldown})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {(() => {
              const levelEnemies = getEnemiesByLevel(parseInt(gameState.currentLevel.id.replace('LV', '')));
              const enemyInstances = enemyState.enemyInstances || [];
              const activeEnemyIndex = enemyState.activeEnemyIndex ?? 0;
              
              if (levelEnemies.length > 1 || enemyInstances.length > 1) {
                return levelEnemies.map((enemy, idx) => {
                  const instance = enemyInstances[idx] || enemyState;
                  const isActive = idx === activeEnemyIndex;
                  
                  return (
                    <Card 
                      key={enemy.id}
                      className={cn(
                        "bg-slate-800/80 border-slate-600 p-3 transition-all duration-300",
                        isActive && "ring-2 ring-red-500 border-red-500"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                          isActive ? "bg-red-600 animate-pulse" : "bg-red-800"
                        )}>
                          {enemy.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{enemy.name}</h3>
                          <p className="text-xs text-gray-400">{enemy.type}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-400 flex items-center gap-1">
                              <Skull className="w-3 h-3 text-red-400" />
                              渗透等级
                            </span>
                            <span className="text-white">{instance.infiltrationLevel || 0}/100</span>
                          </div>
                          <Progress 
                            value={instance.infiltrationLevel || 0}
                            className="h-1.5 bg-red-900/50"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <div className="text-center p-1.5 rounded bg-slate-700/50">
                            <Cpu className="w-3 h-3 mx-auto text-cyan-400 mb-0.5" />
                            <div className="text-xs font-semibold text-white">{instance.resources?.computing || 0}</div>
                            <div className="text-[10px] text-gray-400">算力</div>
                          </div>
                          <div className="text-center p-1.5 rounded bg-slate-700/50">
                            <Coins className="w-3 h-3 mx-auto text-yellow-400 mb-0.5" />
                            <div className="text-xs font-semibold text-white">{instance.resources?.funds || 0}</div>
                            <div className="text-[10px] text-gray-400">资金</div>
                          </div>
                          <div className="text-center p-1.5 rounded bg-slate-700/50">
                            <Eye className="w-3 h-3 mx-auto text-green-400 mb-0.5" />
                            <div className="text-xs font-semibold text-white">{instance.resources?.information || 0}</div>
                            <div className="text-[10px] text-gray-400">信息</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-slate-700/50">
                          <span className="text-gray-400 flex items-center gap-1 text-xs">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            行动点
                          </span>
                          <span className="text-white font-semibold text-xs">
                            {instance.actionPoints || 4}/{instance.maxActionPoints || 4}
                          </span>
                        </div>
                      </div>
                      {enemy.skills && enemy.skills.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <div className="text-[10px] text-gray-400 mb-1">技能冷却</div>
                          <div className="flex flex-wrap gap-1">
                            {enemy.skills.map((skill) => {
                              const cooldown = instance.skillCooldowns?.[skill.id] || 0;
                              const isReady = cooldown === 0;
                              return (
                                <button
                                  key={skill.id}
                                  ref={(el) => registerSkillButton(`enemy-${instance.id}-${skill.id}`, el)}
                                  onContextMenu={(e) => handleSkillRightClick(
                                    e,
                                    'enemy',
                                    enemy.skills || [],
                                    instance.skillCooldowns,
                                    enemy.name,
                                    enemy.type
                                  )}
                                  className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-all hover:ring-1 hover:ring-red-400",
                                    isReady 
                                      ? "bg-green-900/50 text-green-400 hover:bg-green-800/50" 
                                      : "bg-orange-900/50 text-orange-400 hover:bg-orange-800/50"
                                  )}
                                  title="右键查看详情"
                                >
                                  <span className="skill-name">{skill.name}</span>{isReady ? ' ✓' : ` (${cooldown})`}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                });
              }
              
              return (
                <Card className="bg-slate-800/80 border-slate-600 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                      <Skull className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{enemyState.name}</h3>
                      <p className="text-xs text-gray-400">敌人 ({enemyState.type})</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">渗透等级</span>
                      <span className="text-red-400">{enemyState.infiltrationLevel}</span>
                    </div>
                    <Progress 
                      value={enemyState.infiltrationLevel}
                      max={100}
                      className="h-1.5 bg-red-900/50"
                    />
                  </div>
                </Card>
              );
            })()}
          </div>

          <div className="col-span-6 flex flex-col gap-3">
            <Card className="flex-1 bg-slate-800/80 border-slate-600 p-3">
              <h3 className="text-xs font-semibold text-gray-300 mb-2">区域控制</h3>
              <div className="grid grid-cols-2 gap-2 h-[calc(100%-1.5rem)]">
                {(Object.keys(areaControl) as AreaType[]).map((area) => {
                  const status = areaControl[area];
                  return (
                    <div
                      key={area}
                      className={cn(
                        'rounded-lg border-2 p-2 transition-all',
                        getAreaColor(area, status.controller)
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white text-xs">{AREA_NAMES[area]}</span>
                        <Badge variant="secondary" className={cn(
                          'text-[10px]',
                          status.controller === 'player' ? 'bg-blue-600' :
                          status.controller === 'enemy' ? 'bg-red-600' :
                          'bg-gray-600'
                        )}>
                          {status.controller === 'player' ? '我方' :
                           status.controller === 'enemy' ? '敌方' : '中立'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-blue-400">防御: {status.defenseMarkers}</span>
                        <span className="text-red-400">攻击: {status.attackMarkers}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="bg-slate-800/80 border-slate-600 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-300">关卡目标</h3>
                <Badge variant="secondary" className="bg-blue-600/80 text-[10px] text-blue-100">满足任意2个条件即可胜利</Badge>
              </div>
              <div className="space-y-1.5">
                {gameState.objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className={cn(
                      'flex items-center gap-2 p-1.5 rounded',
                      obj.completed ? 'bg-green-600/20 border border-green-500' : 'bg-slate-700/50'
                    )}
                  >
                    <div className={obj.completed ? 'text-green-400' : 'text-gray-400'}>
                      {getObjectiveIcon(obj.type)}
                    </div>
                    <span className={cn('flex-1 text-xs', obj.completed ? 'text-green-300' : 'text-gray-300')}>
                      {obj.description}
                    </span>
                    {obj.current !== undefined && (
                      <span className="text-xs text-gray-400">
                        {obj.current}/{obj.target}
                      </span>
                    )}
                    {obj.completed && (
                      <Badge variant="secondary" className="bg-green-600 text-[10px]">完成</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* 失败条件展示 */}
            <Card className="bg-slate-800/80 border-slate-600 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-red-300">失败条件</h3>
                <Badge variant="secondary" className="bg-red-600/80 text-[10px] text-red-100">满足任意1个即失败</Badge>
              </div>
              <div className="space-y-1.5">
                {/* 失败条件1：安全等级归零 */}
                <div className="flex items-center gap-2 p-1.5 rounded bg-slate-700/50">
                  <div className="text-red-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-xs text-gray-300">
                    【条件1】安全等级归零
                  </span>
                  <span className="text-xs text-gray-400">
                    {gameState.playerState.securityLevel}/0
                  </span>
                </div>
                
                {/* 失败条件2：全面感染 */}
                <div className="flex items-center gap-2 p-1.5 rounded bg-slate-700/50">
                  <div className="text-red-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-xs text-gray-300">
                    【条件2】全面感染：敌方标记 ≥ 20个
                  </span>
                  <span className="text-xs text-gray-400">
                    {Object.values(gameState.areaControl).reduce((sum, area) => sum + area.attackMarkers, 0)}/20
                  </span>
                </div>
                
                {/* 失败条件3：系统崩溃 */}
                <div className="flex items-center gap-2 p-1.5 rounded bg-slate-700/50">
                  <div className="text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-xs text-gray-300">
                    【条件3】系统崩溃：4个区域防御标记为0
                  </span>
                  <span className="text-xs text-gray-400">
                    {Object.values(gameState.areaControl).filter(area => area.defenseMarkers === 0).length}/4
                  </span>
                </div>
                
                {/* 失败条件4：轮次超限 */}
                <div className="flex items-center gap-2 p-1.5 rounded bg-slate-700/50">
                  <div className="text-red-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-xs text-gray-300">
                    【条件4】轮次超限：超过10轮次
                  </span>
                  <span className="text-xs text-gray-400">
                    {gameState.round}/10轮
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="col-span-3 flex flex-col">
            <Card className="flex-1 bg-slate-900/80 rounded-xl border border-slate-700/50 p-3 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                  <span className="text-cyan-400">🎴</span> 
                  <span>手牌</span>
                  <span className="text-slate-400 text-xs">({playerState.hand.length})</span>
                </h3>
              </div>

              {playerState.hand.length === 0 ? (
                <div className="text-center py-6 text-slate-500 flex-1 flex flex-col items-center justify-center">
                  <p className="text-xs">暂无手牌</p>
                  <p className="text-[10px] mt-1">请在摸牌阶段抽取</p>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap justify-center flex-1 overflow-y-auto">
                  {playerState.hand.map((card, index) => (
                    <LevelCardHandItem
                      key={`${card.card_code}-${index}`}
                      card={card}
                      index={index}
                      isSelected={selectedCard === index}
                      onClick={() => handleCardClick(index)}
                      onDetailClick={() => handleShowDetail(card)}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-1.5 pt-3 mt-3 border-t border-slate-700/50">
                {getPhaseActionButton()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogPanel(!showLogPanel)}
                  className="w-full text-xs bg-slate-700/50 border-slate-600 hover:bg-slate-600/50"
                >
                  <History className="w-3 h-3 mr-1" />
                  游戏日志 ({gameLogs.length})
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 游戏日志面板 */}
      {showLogPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[80vh] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                游戏日志
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogPanel(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <div className="p-4 max-h-[calc(80vh-60px)] overflow-hidden">
              <GameLogPanel
                logs={gameLogs}
                currentRound={gameState.round}
                currentPhase={currentPhase as any}
                maxHeight="calc(80vh - 100px)"
              />
            </div>
          </div>
        </div>
      )}

      <CardDetailModal
        card={detailCard}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailCard(null);
        }}
      />

      <AreaSelectionModal
        isOpen={isAreaSelectionOpen}
        title={areaSelectionInfo?.title || '选择目标区域'}
        description={areaSelectionInfo?.description || '请选择一个区域'}
        cardName={areaSelectionInfo?.cardName || ''}
        onSelect={handleAreaSelect}
        onCancel={handleAreaSelectionCancel}
        areaControl={areaControl}
      />

      <JudgmentProcessPanel
        isOpen={judgmentProcessOpen}
        eventData={currentJudgmentEvent}
        currentPlayerId="player"
        onComplete={(result: JudgmentResultData) => {
          console.log('[LevelGameInterface] 判定完成:', result);
          
          // 调用判定完成回调
          if (onJudgmentComplete && currentJudgmentEvent) {
            onJudgmentComplete(currentJudgmentEvent.id, result);
          }
          
          // 延迟后关闭判定面板
          setTimeout(() => {
            setJudgmentProcessOpen(false);
            setCurrentJudgmentEvent(null);
            
            // 判定完成后自动推进阶段
            setTimeout(() => {
              onAdvancePhase?.();
            }, 300);
          }, 1500);
        }}
      />

      {/* AI行动可视化组件（已整合AI状态面板） */}
      <AIActionVisualizer
        actor={aiVisualization.actor}
        phase={aiVisualization.phase}
        actionType={aiVisualization.actionType}
        targetCard={aiVisualization.targetCard}
        targetArea={aiVisualization.targetArea}
        progress={aiVisualization.progress}
        isVisible={aiVisualization.isVisible}
        actionDescription={aiVisualization.actionDescription}
        playedCard={aiVisualization.playedCard}
        handState={aiVisualization.handState}
        judgmentInfo={aiVisualization.judgmentInfo}
        drawnCards={aiVisualization.drawnCards}
        handCountBefore={aiVisualization.handCountBefore}
        handCountAfter={aiVisualization.handCountAfter}
        actionLog={aiVisualization.actionLog}
        targetInfo={aiVisualization.targetInfo}
        skillInfo={aiVisualization.skillInfo}
        resources={aiResources}
        handCards={aiHandCards}
        enemyName={aiVisualization.enemyName || (currentActor === 'enemy' ? enemyState.name : currentActor === 'enemy2' ? gameState.enemy2State?.name : undefined)}
        enemyType={aiVisualization.enemyType || (currentActor === 'enemy' ? enemyState.type : currentActor === 'enemy2' ? gameState.enemy2State?.type : undefined)}
        estimatedTime={3}
        showDetails={true}
        onComplete={() => {
          console.log('[LevelGameInterface] AI行动可视化完成');
        }}
        onCancel={() => {
          setAiVisualization(prev => ({ ...prev, isVisible: false }));
        }}
      />

      {/* 知识弹窗组件 */}
      <KnowledgePopup
        knowledge={knowledgePopup.knowledge}
        isOpen={knowledgePopup.isOpen}
        onClose={() => {
          setKnowledgePopup(prev => ({ ...prev, isOpen: false }));
        }}
        onComplete={knowledgePopup.onComplete}
      />

      {/* 技能详情面板 */}
      {skillPanelData && (
        <SkillDetailPanel
          isOpen={skillPanelOpen}
          characterName={skillPanelData.characterName}
          characterTitle={skillPanelData.characterTitle}
          characterType={skillPanelTarget || 'dadong'}
          skills={skillPanelData.skills}
          position={skillPanelPosition}
          onClose={handleCloseSkillPanel}
        />
      )}
    </div>
  );
}

export default LevelGameInterface;
