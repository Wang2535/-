/**
 * 增强版手牌组件 - 科技感未来风格
 * 实现资源消耗显示、详情查看功能、按钮控制和美观度提升
 */

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TurnPhase } from '@/types/gameRules';
import { 
  Cpu, 
  Coins, 
  Eye, 
  Key,
  Zap,
  Sparkles,
  Info,
  Sword,
  Shield,
  Target,
  Play,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { COMPLETE_CARD_DATABASE } from '@/data/completeCardDatabase';
import type { CardId } from '@/types/cardRules';

// 资源图标映射
const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  compute: <Cpu className="w-3 h-3" />,
  funds: <Coins className="w-3 h-3" />,
  information: <Eye className="w-3 h-3" />,
  permission: <Key className="w-3 h-3" />,
  access: <Key className="w-3 h-3" />,
};

// 资源颜色映射 - 科技感霓虹风格
const RESOURCE_COLORS: Record<string, string> = {
  compute: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50 shadow-cyan-500/20',
  funds: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50 shadow-yellow-500/20',
  information: 'text-green-400 bg-green-500/20 border-green-500/50 shadow-green-500/20',
  permission: 'text-purple-400 bg-purple-500/20 border-purple-500/50 shadow-purple-500/20',
  access: 'text-purple-400 bg-purple-500/20 border-purple-500/50 shadow-purple-500/20',
};

// 阵营图标映射
const FACTION_ICONS: Record<string, React.ReactNode> = {
  attack: <Sword className="w-3 h-3 text-red-400" />,
  defense: <Shield className="w-3 h-3 text-blue-400" />,
  neutral: <Target className="w-3 h-3 text-slate-400" />,
};

// 稀有度样式 - 科技感霓虹发光
const RARITY_STYLES: Record<string, { border: string; glow: string; badge: string; neonColor: string }> = {
  common: {
    border: 'border-slate-600 hover:border-slate-500',
    glow: 'hover:shadow-slate-500/30',
    badge: 'bg-slate-700 text-slate-200 border-slate-600',
    neonColor: 'shadow-slate-500/20',
  },
  uncommon: {
    border: 'border-green-500/50 hover:border-green-400',
    glow: 'hover:shadow-green-500/40',
    badge: 'bg-green-600/80 text-green-100 border-green-500/50',
    neonColor: 'shadow-green-500/30',
  },
  rare: {
    border: 'border-blue-500/50 hover:border-blue-400',
    glow: 'hover:shadow-blue-500/40',
    badge: 'bg-blue-600/80 text-blue-100 border-blue-500/50',
    neonColor: 'shadow-blue-500/30',
  },
  epic: {
    border: 'border-purple-500/50 hover:border-purple-400',
    glow: 'hover:shadow-purple-500/40',
    badge: 'bg-purple-600/80 text-purple-100 border-purple-500/50',
    neonColor: 'shadow-purple-500/30',
  },
  legendary: {
    border: 'border-yellow-500/50 hover:border-yellow-400',
    glow: 'hover:shadow-yellow-500/50',
    badge: 'bg-yellow-600/80 text-yellow-100 border-yellow-500/50',
    neonColor: 'shadow-yellow-500/40',
  },
};

interface CardHandItemProps {
  cardId: CardId;
  index: number;
  isSelected: boolean;
  isComboEligible?: boolean;
  comboBonus?: number;
  onClick: () => void;
  onDetailClick: () => void;
}

// 单张手牌组件 - 科技感未来风格
function CardHandItem({
  cardId,
  index,
  isSelected,
  isComboEligible,
  comboBonus,
  onClick,
  onDetailClick,
}: CardHandItemProps) {
  const card = COMPLETE_CARD_DATABASE[cardId];
  
  if (!card) {
    return (
      <div className="w-32 h-44 bg-slate-900/80 rounded-lg border border-slate-700 flex items-center justify-center">
        <span className="text-slate-500 text-xs">未知卡牌</span>
      </div>
    );
  }

  const cost = (card.cost as Record<string, number>) || {};
  const rarityStyle = RARITY_STYLES[card.rarity] || RARITY_STYLES.common;
  const hasCost = cost.compute > 0 || cost.funds > 0 || cost.information > 0 || (cost.access || cost.permission) > 0;

  // 阵营霓虹颜色
  const factionNeonColor = card.faction === 'attack' 
    ? 'shadow-red-500/30 hover:shadow-red-500/50' 
    : card.faction === 'defense' 
    ? 'shadow-blue-500/30 hover:shadow-blue-500/50'
    : 'shadow-purple-500/30 hover:shadow-purple-500/50';

  return (
    <div className="relative group">
      {/* 连击效果指示器 - 科技感脉冲 */}
      {isComboEligible && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-orange-500/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-orange-500/50 animate-pulse border border-orange-400/50">
            <Zap className="w-3 h-3" />
            <span>+{comboBonus}</span>
          </div>
        </div>
      )}

      {/* 卡牌主体 - 科技感霓虹边框 */}
      <button
        onClick={onClick}
        className={cn(
          'relative w-32 h-44 rounded-lg border-2 transition-all duration-300 overflow-hidden',
          'flex flex-col',
          rarityStyle.border,
          rarityStyle.glow,
          factionNeonColor,
          isSelected 
            ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105 shadow-lg shadow-cyan-500/50 border-cyan-400' 
            : 'hover:scale-105 hover:shadow-xl',
          card.faction === 'attack' && 'bg-gradient-to-br from-red-950/90 via-slate-900 to-slate-950',
          card.faction === 'defense' && 'bg-gradient-to-br from-blue-950/90 via-slate-900 to-slate-950',
          card.faction === 'neutral' && 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950',
        )}
      >
        {/* 顶部：名称和阵营 - 科技感样式 */}
        <div className="flex items-center justify-between p-2 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-1">
            {FACTION_ICONS[card.faction]}
            <span className="text-[10px] font-bold text-white truncate max-w-[60px]">
              {card.name.replace(/（[^）]+）/, '')}
            </span>
          </div>
          <span className={cn('text-[8px] px-1 py-0.5 rounded border', rarityStyle.badge)}>
            T{card.techLevel}
          </span>
        </div>

        {/* 中部：卡牌插图区域 */}
        <div className="flex-1 relative flex items-center justify-center p-2">
          {/* 背景图案 - 科技感网格 */}
          <div className="absolute inset-2 bg-slate-800/30 rounded flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:10px_10px]" />
            <span className="text-4xl opacity-30">
              {card.faction === 'attack' ? '⚔️' : card.faction === 'defense' ? '🛡️' : '⚡'}
            </span>
          </div>
          
          {/* 判定难度指示 - 霓虹点 */}
          {card.difficulty > 0 && (
            <div className="absolute top-1 right-1 flex gap-0.5">
              {Array.from({ length: Math.min(card.difficulty, 3) }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50" />
              ))}
            </div>
          )}

          {/* 连击图标 */}
          {card.comboEffect && (
            <div className="absolute bottom-1 right-1">
              <Sparkles className="w-4 h-4 text-orange-400 drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* 底部：资源消耗和描述 */}
        <div className="p-2 space-y-1 border-t border-slate-700/50 bg-slate-900/50">
          {/* 资源消耗 - 霓虹标签 */}
          {hasCost && (
            <div className="flex flex-wrap gap-1">
              {cost.compute > 0 && (
                <span className={cn('text-[8px] px-1 py-0.5 rounded border flex items-center gap-0.5 shadow-sm', RESOURCE_COLORS.compute)}>
                  {RESOURCE_ICONS.compute} {cost.compute}
                </span>
              )}
              {cost.funds > 0 && (
                <span className={cn('text-[8px] px-1 py-0.5 rounded border flex items-center gap-0.5 shadow-sm', RESOURCE_COLORS.funds)}>
                  {RESOURCE_ICONS.funds} {cost.funds}
                </span>
              )}
              {cost.information > 0 && (
                <span className={cn('text-[8px] px-1 py-0.5 rounded border flex items-center gap-0.5 shadow-sm', RESOURCE_COLORS.information)}>
                  {RESOURCE_ICONS.information} {cost.information}
                </span>
              )}
              {(cost.access || cost.permission) > 0 && (
                <span className={cn('text-[8px] px-1 py-0.5 rounded border flex items-center gap-0.5 shadow-sm', RESOURCE_COLORS.permission)}>
                  {RESOURCE_ICONS.permission} {cost.access || cost.permission}
                </span>
              )}
            </div>
          )}

          {/* 简短描述 */}
          <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight">
            {card.description.slice(0, 30)}...
          </p>
        </div>

        {/* 选中指示器 - 青色光晕 */}
        {isSelected && (
          <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
        )}
      </button>

      {/* 详情按钮 - 科技感 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDetailClick();
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 hover:bg-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 opacity-0 group-hover:opacity-100 transition-all duration-300 border border-slate-600 hover:border-cyan-400 z-10"
      >
        <Info className="w-3 h-3 text-white" />
      </button>

      {/* 序号标记 - 霓虹边框 */}
      <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-cyan-400 font-mono border border-cyan-500/50 shadow-lg shadow-cyan-500/20">
        {index + 1}
      </div>
    </div>
  );
}

// 卡牌详情弹窗 - 科技感风格
interface CardDetailModalProps {
  cardId: CardId | null;
  isOpen: boolean;
  onClose: () => void;
}

function CardDetailModal({ cardId, isOpen, onClose }: CardDetailModalProps) {
  if (!isOpen || !cardId) return null;

  const card = COMPLETE_CARD_DATABASE[cardId];
  if (!card) return null;

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
          rarityStyle.border,
          rarityStyle.neonColor
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 - 科技感 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {FACTION_ICONS[card.faction]}
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">{card.name}</h3>
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

        {/* 资源消耗 - 霓虹卡片 */}
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

        {/* 描述 */}
        <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700/50">
          <p className="text-sm text-slate-300 leading-relaxed">{card.description}</p>
        </div>

        {/* 效果 */}
        {card.effects && card.effects.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-2">效果</p>
            <div className="space-y-2">
              {card.effects.map((effect, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>{(effect as { description?: string }).description || '特殊效果'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 连击效果 */}
        {card.comboEffect && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-orange-400">连击效果</span>
            </div>
            <p className="text-sm text-slate-300">{card.comboEffect.description}</p>
            <p className="text-xs text-orange-400 mt-1">加成: +{card.comboEffect.bonus}</p>
          </div>
        )}

        {/* 判定难度 */}
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

        {/* 关闭按钮 - 科技感 */}
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

// 科技感按钮组件
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
      active: 'active:bg-blue-700',
      disabled: 'opacity-50 cursor-not-allowed bg-blue-600/40 border-blue-500/20',
      icon: <Play className="w-4 h-4" />,
    },
    discard: {
      base: 'bg-red-600/80 border-red-500/50 text-red-100',
      hover: 'hover:bg-red-500 hover:border-red-400 hover:shadow-red-500/40',
      active: 'active:bg-red-700',
      disabled: 'opacity-50 cursor-not-allowed bg-red-600/40 border-red-500/20',
      icon: <Trash2 className="w-4 h-4" />,
    },
    end: {
      base: 'bg-slate-700/80 border-slate-600/50 text-slate-200',
      hover: 'hover:bg-slate-600 hover:border-slate-500 hover:shadow-slate-500/30',
      active: 'active:bg-slate-800',
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
        'flex items-center gap-2 shadow-lg',
        style.base,
        !disabled && style.hover,
        !disabled && style.active,
        disabled && style.disabled
      )}
    >
      {style.icon}
      {children}
    </button>
  );
}

interface EnhancedCardHandProps {
  hand: CardId[];
  selectedCardIndex: number | null;
  onSelectCard: (index: number) => void;
  onPlayCard?: (cardIndex: number) => void;
  onDiscardCard?: (cardIndex: number) => void;
  onEndDiscard?: () => void; // 结束弃牌阶段
  onEndTurn?: () => void;
  currentPhase: TurnPhase;
  isPlayerTurn: boolean;
  comboState?: {
    activeCombo?: {
      comboType: string;
      requiredCardCode?: string;
      requiredCardType?: string;
      bonus: number;
      description?: string;
    } | null;
    sameNameConsecutiveCount?: Record<string, number>;
  };
  currentPlayerId: string;
  maxHandSize?: number;
}

export function EnhancedCardHand({
  hand,
  selectedCardIndex,
  onSelectCard,
  onPlayCard,
  onDiscardCard,
  onEndDiscard,
  onEndTurn,
  currentPhase,
  isPlayerTurn,
  comboState = {},
  currentPlayerId,
  maxHandSize = 3,
}: EnhancedCardHandProps) {
  const [detailCardId, setDetailCardId] = useState<CardId | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleShowDetail = useCallback((cardId: CardId) => {
    setDetailCardId(cardId);
    setIsDetailOpen(true);
  }, []);

  // 检查卡牌是否可触发连击
  const isComboEligible = useCallback((cardId: CardId, _index: number) => {
    if (!comboState.activeCombo) return false;
    
    const card = COMPLETE_CARD_DATABASE[cardId];
    if (!card) return false;

    const consecutiveCount = comboState.sameNameConsecutiveCount?.[cardId] || 0;

    return (
      (comboState.activeCombo.comboType === 'same_name' && 
       comboState.activeCombo.requiredCardCode === cardId) ||
      (comboState.activeCombo.comboType === 'same_type' && 
       comboState.activeCombo.requiredCardType === card.type) ||
      (consecutiveCount >= 1)
    );
  }, [comboState]);

  // 处理出牌
  const handlePlayCard = () => {
    if (selectedCardIndex !== null && onPlayCard) {
      onPlayCard(selectedCardIndex);
    }
  };

  // 处理弃牌
  const handleDiscardCard = () => {
    if (selectedCardIndex !== null && onDiscardCard) {
      onDiscardCard(selectedCardIndex);
    }
  };

  // 处理结束弃牌阶段
  const handleEndDiscard = () => {
    if (onEndDiscard) {
      onEndDiscard();
    }
  };

  // 处理结束回合
  const handleEndTurn = () => {
    if (onEndTurn) {
      onEndTurn();
    }
  };

  // 是否显示按钮
  const showButtons = isPlayerTurn;
  const canPlayCard = currentPhase === 'action' && selectedCardIndex !== null;
  const canDiscardCard = currentPhase === 'discard' && selectedCardIndex !== null;
  const canEndTurn = currentPhase === 'action';
  const canEndDiscard = currentPhase === 'discard' && hand.length <= maxHandSize; // 手牌<=上限时可以结束弃牌

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-700/50 p-4 shadow-xl">
      {/* 头部信息 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="text-cyan-400">🎴</span> 
          <span>手牌</span>
          <span className="text-slate-400">({hand.length}/{maxHandSize})</span>
          {currentPhase === 'discard' && hand.length > maxHandSize && (
            <span className="text-sm text-red-400 animate-pulse">
              需弃{hand.length - maxHandSize}张
            </span>
          )}
          {comboState.activeCombo && (
            <span className="text-sm text-orange-400 animate-pulse flex items-center gap-1">
              <Zap className="w-3 h-3" />
              连击! +{comboState.activeCombo.bonus}
            </span>
          )}
        </h3>
      </div>

      {/* 手牌区域 */}
      {hand.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>暂无手牌</p>
          <p className="text-xs mt-1">请在抽卡阶段抽取</p>
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap justify-center mb-4">
          {hand.map((cardId, index) => (
            <CardHandItem
              key={`${cardId}-${index}`}
              cardId={cardId}
              index={index}
              isSelected={selectedCardIndex === index}
              isComboEligible={isComboEligible(cardId, index)}
              comboBonus={comboState.activeCombo?.bonus}
              onClick={() => onSelectCard(index)}
              onDetailClick={() => handleShowDetail(cardId)}
            />
          ))}
        </div>
      )}

      {/* 按钮控制栏 - 科技感 */}
      {showButtons && (
        <div className="flex justify-center gap-3 pt-4 border-t border-slate-700/50">
          {currentPhase === 'action' && (
            <>
              <TechButton
                onClick={handlePlayCard}
                disabled={!canPlayCard}
                variant="play"
              >
                出牌
              </TechButton>
              <TechButton
                onClick={handleEndTurn}
                disabled={!canEndTurn}
                variant="end"
              >
                结束回合
              </TechButton>
            </>
          )}
          {currentPhase === 'discard' && (
            <>
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
                  disabled={!canEndDiscard}
                  variant="end"
                >
                  结束弃牌
                </TechButton>
              )}
            </>
          )}
        </div>
      )}

      {/* 卡牌详情弹窗 */}
      <CardDetailModal
        cardId={detailCardId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailCardId(null);
        }}
      />
    </div>
  );
}

export default EnhancedCardHand;
