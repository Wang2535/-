/**
 * AI状态面板组件
 * 固定显示在页面中间偏下位置，实时展示AI的手牌库状态和资源情况
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { AIActor, CardInfo, HandState } from './AIActionVisualizer';
import { CardDetailModal } from './CardDetailModal';

export interface AIResourceState {
  computing: number;
  funds: number;
  information: number;
  maxComputing?: number;
  maxFunds?: number;
  maxInformation?: number;
}

export interface AIStatusPanelProps {
  actor: AIActor;
  handState?: HandState;
  resources?: AIResourceState;
  handCards?: CardInfo[];
  isVisible?: boolean;
  className?: string;
}

const ACTOR_CONFIG: Record<AIActor, {
  name: string;
  color: string;
  bgColor: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  borderColor: string;
}> = {
  dadong: {
    name: '大东',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
    icon: '🤖',
    borderColor: 'border-emerald-500/50'
  },
  enemy: {
    name: '敌人',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-red-600',
    icon: '👹',
    borderColor: 'border-rose-500/50'
  }
};

const RESOURCE_CONFIG = {
  computing: { icon: '💻', name: '算力', color: 'text-cyan-400', bgColor: 'bg-cyan-500' },
  funds: { icon: '💰', name: '资金', color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
  information: { icon: '📊', name: '信息', color: 'text-purple-400', bgColor: 'bg-purple-500' }
};

const RARITY_CONFIG: Record<string, { color: string; bgColor: string; name: string }> = {
  common: { color: 'text-slate-400', bgColor: 'bg-slate-600', name: '普通' },
  uncommon: { color: 'text-green-400', bgColor: 'bg-green-600', name: '优秀' },
  rare: { color: 'text-blue-400', bgColor: 'bg-blue-600', name: '稀有' },
  epic: { color: 'text-purple-400', bgColor: 'bg-purple-600', name: '史诗' },
  legendary: { color: 'text-yellow-400', bgColor: 'bg-yellow-600', name: '传说' }
};

export function AIStatusPanel({
  actor,
  handState,
  resources,
  handCards,
  isVisible = true,
  className
}: AIStatusPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [animatingResource, setAnimatingResource] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardInfo | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  const actorConfig = ACTOR_CONFIG[actor];

  // 处理右键点击卡牌
  const handleCardRightClick = (e: React.MouseEvent, card: CardInfo) => {
    e.preventDefault();
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  useEffect(() => {
    if (resources) {
      setAnimatingResource('update');
      const timer = setTimeout(() => setAnimatingResource(null), 500);
      return () => clearTimeout(timer);
    }
  }, [resources?.computing, resources?.funds, resources?.information]);

  if (!isVisible) return null;

  const totalHand = handState?.count || handCards?.length || 0;
  const typeDistribution = handState?.typeDistribution || {};

  return (
    <div
      className={cn(
        'fixed left-1/2 -translate-x-1/2 bottom-24 z-40',
        'transition-all duration-300 ease-out',
        isExpanded ? 'w-[480px]' : 'w-[200px]',
        className
      )}
    >
      <div
        className={cn(
          'bg-slate-900/95 backdrop-blur-xl rounded-2xl',
          'border-2 shadow-2xl',
          actorConfig.borderColor,
          'overflow-hidden'
        )}
      >
        {/* 顶部渐变条 */}
        <div
          className={cn(
            'h-1 bg-gradient-to-r',
            actorConfig.gradientFrom,
            actorConfig.gradientTo
          )}
        />

        {/* 头部 */}
        <div
          className={cn(
            'px-4 py-3 flex items-center justify-between',
            'bg-slate-800/50 cursor-pointer'
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                'bg-gradient-to-br',
                actorConfig.gradientFrom,
                actorConfig.gradientTo
              )}
            >
              <span className="text-xl">{actorConfig.icon}</span>
            </div>
            <div>
              <div className={cn('font-bold', actorConfig.color)}>
                {actorConfig.name}
              </div>
              <div className="text-xs text-slate-400">AI状态面板</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

        {/* 展开内容 */}
        {isExpanded && (
          <div className="p-4 space-y-4">
            {/* 手牌库状态 */}
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

              {/* 类型分布 */}
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

              {/* 手牌列表（最多显示5张） */}
              {handCards && handCards.length > 0 && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  <div className="text-xs text-slate-500 mb-1">具体卡牌（右键查看详情）</div>
                  {handCards.slice(0, 5).map((card, index) => (
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
                  {handCards.length > 5 && (
                    <div className="text-xs text-slate-500 text-center py-1">
                      还有 {handCards.length - 5} 张卡牌...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 资源情况 */}
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

            {/* 无数据提示 */}
            {!handState && !resources && !handCards && (
              <div className="text-center py-4 text-slate-500">
                <span className="text-2xl">📊</span>
                <div className="text-sm mt-2">等待AI数据...</div>
              </div>
            )}
          </div>
        )}

        {/* 收起状态显示 */}
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
          </div>
        )}
      </div>

      {/* 卡牌详情弹窗 */}
      <CardDetailModal
        card={selectedCard}
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
      />
    </div>
  );
}

export default AIStatusPanel;
