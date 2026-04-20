import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  Zap, 
  Target, 
  Package, 
  Trash2, 
  Bot, 
  Crown,
  Swords,
  BrainCircuit,
  Info,
  Eye
} from 'lucide-react';
import type { LevelGameState } from '@/types/levelTypes';
import type { Card } from '@/types/legacy/card_v16';

interface LevelResourcePanelProps {
  gameState: LevelGameState;
  className?: string;
  showHandDetails?: boolean;
}

export function LevelResourcePanel({ gameState, className, showHandDetails = true }: LevelResourcePanelProps) {
  const { playerState, dadongAIState, enemyState } = gameState;
  const [hoveredCard, setHoveredCard] = useState<{ card: Card; position: { x: number; y: number } } | null>(null);

  const handleCardHover = (card: Card | null, position: { x: number; y: number }) => {
    if (card) {
      setHoveredCard({ card, position });
    } else {
      setHoveredCard(null);
    }
  };

  return (
    <div className={cn(
      'grid grid-cols-3 gap-3 relative',
      className
    )}>
      {/* 卡牌悬停预览 */}
      {hoveredCard && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hoveredCard.position.x,
            top: hoveredCard.position.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <CardPreview card={hoveredCard.card} />
        </div>
      )}

      {/* 玩家面板 */}
      <ResourceCard
        title="小白"
        icon={<Shield className="w-5 h-5" />}
        colorTheme="blue"
      >
        {/* 安全等级 */}
        <ResourceItem
          icon={<Shield className="w-3 h-3" />}
          label="安全等级"
          value={`${playerState.securityLevel}/${playerState.maxSecurityLevel}`}
          progress={(playerState.securityLevel / playerState.maxSecurityLevel) * 100}
          color="blue"
        />
        
        {/* 资源 */}
        <div className="grid grid-cols-3 gap-1 mt-2">
          <MiniResource 
            icon="💻" 
            label="算力" 
            value={playerState.resources.computing} 
          />
          <MiniResource 
            icon="💰" 
            label="资金" 
            value={playerState.resources.funds} 
          />
          <MiniResource 
            icon="📊" 
            label="信息" 
            value={playerState.resources.information} 
          />
        </div>

        {/* 手牌状态 */}
        {showHandDetails && (
          <CardState
            handCount={playerState.hand.length}
            deckCount={playerState.deck.length}
            discardCount={playerState.discardPile.length}
            hand={playerState.hand}
            colorTheme="blue"
            onCardHover={handleCardHover}
          />
        )}
        {!showHandDetails && (
          <CardState
            handCount={playerState.hand.length}
            deckCount={playerState.deck.length}
            discardCount={playerState.discardPile.length}
          />
        )}
      </ResourceCard>

      {/* 大东AI面板 */}
      <ResourceCard
        title="大东AI"
        icon={<Bot className="w-5 h-5" />}
        colorTheme="emerald"
        isAI
      >
        {/* 行动点 */}
        <ResourceItem
          icon={<Zap className="w-3 h-3" />}
          label="行动点"
          value={`${dadongAIState.actionPoints}/${dadongAIState.maxActionPoints}`}
          progress={(dadongAIState.actionPoints / dadongAIState.maxActionPoints) * 100}
          color="yellow"
        />

        {/* 资源 */}
        <div className="grid grid-cols-3 gap-1 mt-2">
          <MiniResource 
            icon="💻" 
            label="算力" 
            value={dadongAIState.resources.computing} 
          />
          <MiniResource 
            icon="💰" 
            label="资金" 
            value={dadongAIState.resources.funds} 
          />
          <MiniResource 
            icon="📊" 
            label="信息" 
            value={dadongAIState.resources.information} 
          />
        </div>

        {/* 手牌状态 */}
        {showHandDetails && (
          <CardState
            handCount={dadongAIState.hand.length}
            deckCount={0}
            discardCount={0}
            showDeck={false}
            showDiscard={false}
            hand={dadongAIState.hand}
            colorTheme="emerald"
            onCardHover={handleCardHover}
          />
        )}
        {!showHandDetails && (
          <CardState
            handCount={dadongAIState.hand.length}
            deckCount={0}
            discardCount={0}
            showDeck={false}
            showDiscard={false}
          />
        )}

        {/* 协作加成 */}
        {dadongAIState.cooperationBonus > 0 && (
          <div className="mt-2 p-1.5 bg-emerald-500/20 rounded border border-emerald-500/30">
            <div className="flex items-center gap-1">
              <BrainCircuit className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400">
                协作加成: +{dadongAIState.cooperationBonus}
              </span>
            </div>
          </div>
        )}
      </ResourceCard>

      {/* 敌人面板 */}
      <ResourceCard
        title={enemyState.name}
        icon={<Crown className="w-5 h-5" />}
        colorTheme="rose"
        isEnemy
      >
        {/* 渗透等级 */}
        <ResourceItem
          icon={<Swords className="w-3 h-3" />}
          label="渗透等级"
          value={`${enemyState.infiltrationLevel}/100`}
          progress={enemyState.infiltrationLevel}
          color="rose"
        />

        {/* 资源 */}
        <div className="grid grid-cols-3 gap-1 mt-2">
          <MiniResource 
            icon="💻" 
            label="算力" 
            value={enemyState.resources.computing} 
          />
          <MiniResource 
            icon="💰" 
            label="资金" 
            value={enemyState.resources.funds} 
          />
          <MiniResource 
            icon="📊" 
            label="信息" 
            value={enemyState.resources.information} 
          />
        </div>

        {/* 攻击冷却 */}
        {enemyState.attackCooldown > 0 && (
          <div className="mt-2 p-1.5 bg-rose-500/20 rounded border border-rose-500/30">
            <div className="flex items-center gap-1">
              <Swords className="w-3 h-3 text-rose-400" />
              <span className="text-[10px] text-rose-400">
                攻击冷却: {enemyState.attackCooldown}回合
              </span>
            </div>
          </div>
        )}

        {/* 特殊技能状态 */}
        {enemyState.specialAbilityActive && (
          <div className="mt-2 p-1.5 bg-yellow-500/20 rounded border border-yellow-500/30">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] text-yellow-400">
                特殊技能激活中
              </span>
            </div>
          </div>
        )}
      </ResourceCard>
    </div>
  );
}

interface ResourceCardProps {
  title: string;
  icon: React.ReactNode;
  colorTheme: 'blue' | 'emerald' | 'rose';
  children: React.ReactNode;
  isAI?: boolean;
  isEnemy?: boolean;
}

function ResourceCard({ 
  title, 
  icon, 
  colorTheme, 
  children, 
  isAI, 
  isEnemy 
}: ResourceCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      iconBg: 'bg-gradient-to-br from-rose-500 to-red-600'
    }
  };

  const colors = colorClasses[colorTheme];

  return (
    <div className={cn(
      'relative rounded-xl p-3 transition-all duration-300',
      colors.bg,
      colors.border,
      'border backdrop-blur-sm'
    )}>
      {/* 头部 */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          colors.iconBg,
          'shadow-md'
        )}>
          <span className="text-white">{icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className={cn('font-bold text-sm', colors.text)}>
              {title}
            </span>
            {isAI && (
              <span className="text-[9px] bg-slate-700 px-1 rounded text-slate-300">
                AI
              </span>
            )}
            {isEnemy && (
              <span className="text-[9px] bg-rose-700 px-1 rounded text-rose-100">
                BOSS
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

interface ResourceItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  progress: number;
  color: 'blue' | 'yellow' | 'rose';
}

function ResourceItem({ icon, label, value, progress, color }: ResourceItemProps) {
  const colorClasses = {
    blue: 'bg-blue-600',
    yellow: 'bg-yellow-500',
    rose: 'bg-rose-600'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className={cn(
            'text-slate-400',
            progress >= 80 ? 'text-green-400' :
            progress >= 50 ? 'text-yellow-400' :
            'text-slate-400'
          )}>{icon}</span>
          <span className="text-[10px] text-slate-400">{label}</span>
        </div>
        <span className={cn(
          'text-[10px] font-mono font-bold',
          progress >= 80 ? 'text-green-400' :
          progress >= 50 ? 'text-yellow-400' :
          'text-slate-300'
        )}>
          {value}
        </span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500',
            colorClasses[color],
            progress >= 75 && 'animate-pulse'
          )}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
}

interface MiniResourceProps {
  icon: string;
  label: string;
  value: number;
}

function MiniResource({ icon, label, value }: MiniResourceProps) {
  return (
    <div className="text-center p-1 bg-slate-800/50 rounded">
      <div className="text-lg">{icon}</div>
      <div className="text-[9px] text-slate-400">{label}</div>
      <div className="text-[10px] font-mono font-bold text-slate-200">
        {value}
      </div>
    </div>
  );
}

interface CardStateProps {
  handCount: number;
  deckCount: number;
  discardCount: number;
  showDeck?: boolean;
  showDiscard?: boolean;
  hand?: Card[];
  colorTheme?: 'blue' | 'emerald' | 'rose';
  onCardHover?: (card: Card | null, position: { x: number; y: number }) => void;
}

function CardState({ 
  handCount, 
  deckCount, 
  discardCount, 
  showDeck = true, 
  showDiscard = true,
  hand,
  colorTheme = 'blue',
  onCardHover
}: CardStateProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      badge: 'bg-blue-600/30 border-blue-500/30'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badge: 'bg-emerald-600/30 border-emerald-500/30'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      badge: 'bg-rose-600/30 border-rose-500/30'
    }
  };

  const colors = colorClasses[colorTheme];

  return (
    <div className="mt-2 space-y-2">
      <div className="p-1.5 bg-slate-800/50 rounded border border-slate-700/30">
        <div className="flex justify-between text-[10px]">
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span className="text-slate-300">手牌: {handCount}</span>
          </div>
          {showDeck && (
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-green-400" />
              <span className="text-slate-300">牌库: {deckCount}</span>
            </div>
          )}
          {showDiscard && (
            <div className="flex items-center gap-1">
              <Trash2 className="w-3 h-3 text-orange-400" />
              <span className="text-slate-300">弃牌: {discardCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* 手牌详细展示 */}
      {hand && hand.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {hand.map((card, index) => (
            <div
              key={index}
              className={cn(
                'relative group cursor-pointer',
                'transition-all duration-200 hover:scale-105'
              )}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onCardHover?.(card, { x: rect.left, y: rect.top - 100 });
              }}
              onMouseLeave={() => onCardHover?.(null, { x: 0, y: 0 })}
            >
              <div className={cn(
                'w-10 h-14 rounded border flex items-center justify-center text-xs font-mono',
                colors.bg,
                colors.border,
                colors.text,
                'hover:bg-opacity-30 transition-colors'
              )}>
                {card.name.charAt(0)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CardPreviewProps {
  card: Card;
}

function CardPreview({ card }: CardPreviewProps) {
  const cost = (card.cost as Record<string, number>) || {};
  
  const rarityColors = {
    common: 'border-slate-500 bg-slate-800/90',
    rare: 'border-blue-500 bg-blue-900/90',
    epic: 'border-purple-500 bg-purple-900/90',
    legendary: 'border-yellow-500 bg-yellow-900/90'
  };

  const rarityBadge = {
    common: 'bg-slate-600 text-slate-200',
    rare: 'bg-blue-600 text-blue-100',
    epic: 'bg-purple-600 text-purple-100',
    legendary: 'bg-yellow-600 text-yellow-100'
  };

  return (
    <div className={cn(
      'w-56 rounded-lg border-2 p-3 shadow-2xl backdrop-blur-md',
      rarityColors[card.rarity as keyof typeof rarityColors] || rarityColors.common,
      'animate-in fade-in zoom-in duration-200'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-white text-sm">{card.name}</h4>
        </div>
        <span className={cn(
          'text-[9px] px-1.5 py-0.5 rounded font-bold',
          rarityBadge[card.rarity as keyof typeof rarityBadge] || rarityBadge.common
        )}>
          {card.rarity}
        </span>
      </div>

      <div className="mb-2">
        <span className="text-[10px] text-slate-400 block mb-1">技术等级</span>
        <span className="text-sm font-bold text-yellow-400">T{card.techLevel}</span>
      </div>

      {/* 资源消耗 */}
      {(cost.compute > 0 || cost.funds > 0 || cost.information > 0 || (cost.access || cost.permission) > 0) && (
        <div className="mb-2">
          <span className="text-[10px] text-slate-400 block mb-1">资源消耗</span>
          <div className="flex flex-wrap gap-1">
            {cost.compute > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                💻 {cost.compute}
              </span>
            )}
            {cost.funds > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300">
                💰 {cost.funds}
              </span>
            )}
            {cost.information > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-green-300">
                📊 {cost.information}
              </span>
            )}
            {(cost.access || cost.permission) > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300">
                🔑 {cost.access || cost.permission}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 卡牌描述 */}
      <div className="mb-2">
        <span className="text-[10px] text-slate-400 block mb-1">效果描述</span>
        <p className="text-[11px] text-slate-200 leading-relaxed">{card.description}</p>
      </div>

      {/* 判定难度 */}
      {card.difficulty > 0 && (
        <div>
          <span className="text-[10px] text-slate-400 block mb-1">判定难度</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold border',
                  i < card.difficulty
                    ? 'bg-yellow-500/80 text-yellow-950 border-yellow-400'
                    : 'bg-slate-700 text-slate-500 border-slate-600'
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LevelResourcePanel;