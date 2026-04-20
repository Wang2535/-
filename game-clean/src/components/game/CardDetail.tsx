/**
 * 卡牌详情展示组件
 * 规则依据: 完善的游戏规则.md 卡牌系统
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Cpu, 
  Coins, 
  Eye, 
  Key, 
  Zap,
  Shield,
  Sword,
  Clock,
  Skull,
  Sparkles,
  Target
} from 'lucide-react';

export type CardType = 
  | 'basic_recon'      // 基础侦查
  | 'vuln_exploit'     // 漏洞利用
  | 'privilege_escalation' // 权限提升
  | 'advanced_attack'  // 高级攻击
  | 'basic_defense'    // 基础防御
  | 'intrusion_detection' // 入侵检测
  | 'access_control'   // 访问控制
  | 'total_control';   // 完全控制

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardFaction = 'attacker' | 'defender' | 'neutral';

interface CardEffect {
  type: string;
  description: string;
  value?: number;
}

export interface CardData {
  id: string;
  name: string;
  type: CardType;
  faction: CardFaction;
  rarity: CardRarity;
  techLevel: number;
  description: string;
  flavorText?: string;
  cost: {
    compute: number;
    funds: number;
    information: number;
    permission: number;
  };
  effects: CardEffect[];
  keywords: string[]; // 亡语、光环、持续、响应等
  difficulty?: number; // 判定难度
  target?: string; // 目标
}

interface CardDetailProps {
  card: CardData | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
  canPlay?: boolean;
  currentResources?: {
    compute: number;
    funds: number;
    information: number;
    permission: number;
  };
}

const TYPE_CONFIG: Record<CardType, { name: string; icon: React.ReactNode; color: string }> = {
  basic_recon: { 
    name: '基础侦查', 
    icon: <Eye className="w-4 h-4" />, 
    color: 'text-blue-400' 
  },
  vuln_exploit: { 
    name: '漏洞利用', 
    icon: <Target className="w-4 h-4" />, 
    color: 'text-red-400' 
  },
  privilege_escalation: { 
    name: '权限提升', 
    icon: <Key className="w-4 h-4" />, 
    color: 'text-purple-400' 
  },
  advanced_attack: { 
    name: '高级攻击', 
    icon: <Sword className="w-4 h-4" />, 
    color: 'text-orange-400' 
  },
  basic_defense: { 
    name: '基础防御', 
    icon: <Shield className="w-4 h-4" />, 
    color: 'text-cyan-400' 
  },
  intrusion_detection: { 
    name: '入侵检测', 
    icon: <Eye className="w-4 h-4" />, 
    color: 'text-green-400' 
  },
  access_control: { 
    name: '访问控制', 
    icon: <Key className="w-4 h-4" />, 
    color: 'text-yellow-400' 
  },
  total_control: { 
    name: '完全控制', 
    icon: <Zap className="w-4 h-4" />, 
    color: 'text-pink-400' 
  }
};

const RARITY_CONFIG: Record<CardRarity, { name: string; color: string; bgColor: string; borderColor: string }> = {
  common: { 
    name: '普通', 
    color: 'text-slate-300',
    bgColor: 'bg-slate-800',
    borderColor: 'border-slate-600'
  },
  rare: { 
    name: '稀有', 
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
    borderColor: 'border-blue-500'
  },
  epic: { 
    name: '史诗', 
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
    borderColor: 'border-purple-500'
  },
  legendary: { 
    name: '传说', 
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
    borderColor: 'border-yellow-500'
  }
};

const KEYWORD_ICONS: Record<string, React.ReactNode> = {
  '亡语': <Skull className="w-3 h-3" />,
  '光环': <Sparkles className="w-3 h-3" />,
  '持续': <Clock className="w-3 h-3" />,
  '响应': <Zap className="w-3 h-3" />
};

export function CardDetail({
  card,
  isOpen,
  onClose,
  onPlay,
  canPlay = false,
  currentResources
}: CardDetailProps) {
  if (!isOpen || !card) return null;

  const typeConfig = TYPE_CONFIG[card.type] || TYPE_CONFIG['basic_recon'];
  const rarityConfig = RARITY_CONFIG[card.rarity] || RARITY_CONFIG['common'];

  // 检查资源是否足够
  const hasEnoughResources = currentResources ? (
    currentResources.compute >= card.cost.compute &&
    currentResources.funds >= card.cost.funds &&
    currentResources.information >= card.cost.information &&
    currentResources.permission >= card.cost.permission
  ) : true;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className={cn(
        "rounded-xl shadow-2xl max-w-md w-full overflow-hidden",
        rarityConfig.bgColor,
        "border-2",
        rarityConfig.borderColor
      )}>
        {/* 卡牌头部 */}
        <div className={cn(
          "p-4 border-b",
          rarityConfig.borderColor,
          "bg-black/20"
        )}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={typeConfig.color}>{typeConfig.icon}</span>
                <span className={cn("text-xs font-medium", typeConfig.color)}>
                  {typeConfig.name}
                </span>
              </div>
              <h3 className={cn("text-2xl font-bold", rarityConfig.color)}>
                {card.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className={cn(
              "px-2 py-0.5 rounded text-xs",
              rarityConfig.bgColor,
              rarityConfig.color,
              "border",
              rarityConfig.borderColor
            )}>
              {rarityConfig.name}
            </span>
            <span className="text-xs text-slate-400">
              科技等级 T{card.techLevel}
            </span>
            {card.faction !== 'neutral' && (
              <span className={cn(
                "px-2 py-0.5 rounded text-xs",
                card.faction === 'attacker' 
                  ? "bg-red-900/50 text-red-400" 
                  : "bg-blue-900/50 text-blue-400"
              )}>
                {card.faction === 'attacker' ? '进攻方' : '防御方'}
              </span>
            )}
          </div>
        </div>

        {/* 卡牌图片区域 */}
        <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          </div>
          <div className="text-6xl opacity-50">
            {typeConfig.icon}
          </div>
          <div className={cn(
            "absolute top-2 right-2 px-2 py-1 rounded text-xs",
            rarityConfig.bgColor,
            rarityConfig.color
          )}>
            {card.id}
          </div>
        </div>

        {/* 资源消耗 */}
        <div className="p-4 border-b border-slate-700/50">
          <h4 className="text-sm font-medium text-slate-400 mb-2">资源消耗</h4>
          <div className="grid grid-cols-4 gap-2">
            <ResourceCost 
              icon={<Cpu className="w-4 h-4" />} 
              value={card.cost.compute} 
              current={currentResources?.compute}
              label="算力"
            />
            <ResourceCost 
              icon={<Coins className="w-4 h-4" />} 
              value={card.cost.funds} 
              current={currentResources?.funds}
              label="资金"
            />
            <ResourceCost 
              icon={<Eye className="w-4 h-4" />} 
              value={card.cost.information} 
              current={currentResources?.information}
              label="信息"
            />
            <ResourceCost 
              icon={<Key className="w-4 h-4" />} 
              value={card.cost.permission} 
              current={currentResources?.permission}
              label="权限"
            />
          </div>
        </div>

        {/* 效果描述 */}
        <div className="p-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">效果</h4>
            <p className="text-white leading-relaxed">{card.description}</p>
          </div>

          {card.effects.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">详细效果</h4>
              <ul className="space-y-1">
                {card.effects.map((effect, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-400 mt-0.5">▸</span>
                    <span className="text-slate-300">{effect.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {card.keywords.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">关键词</h4>
              <div className="flex flex-wrap gap-2">
                {card.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-300"
                  >
                    {KEYWORD_ICONS[keyword]}
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {card.difficulty && (
            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
              <span className="text-sm text-slate-400">判定难度:</span>
              <span className="text-lg font-bold text-yellow-400">{card.difficulty}+</span>
            </div>
          )}

          {card.flavorText && (
            <div className="pt-2 border-t border-slate-700/50">
              <p className="text-sm text-slate-500 italic">"{card.flavorText}"</p>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {onPlay && (
          <div className="p-4 border-t border-slate-700/50">
            <Button
              onClick={onPlay}
              disabled={!canPlay || !hasEnoughResources}
              className="w-full"
              variant={canPlay && hasEnoughResources ? "default" : "outline"}
            >
              {!hasEnoughResources 
                ? '资源不足' 
                : canPlay 
                  ? '使用卡牌' 
                  : '无法使用'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// 资源消耗组件
function ResourceCost({ 
  icon, 
  value, 
  current,
  label 
}: { 
  icon: React.ReactNode; 
  value: number; 
  current?: number;
  label: string;
}) {
  const isInsufficient = current !== undefined && current < value;
  const isFree = value === 0;

  return (
    <div className={cn(
      "flex flex-col items-center p-2 rounded",
      isInsufficient ? "bg-red-900/30" : "bg-slate-800/50"
    )}>
      <div className={cn(
        "text-slate-400 mb-1",
        isInsufficient && "text-red-400"
      )}>
        {icon}
      </div>
      <div className={cn(
        "font-bold",
        isFree ? "text-slate-500" : isInsufficient ? "text-red-400" : "text-white"
      )}>
        {isFree ? '-' : value}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
      {current !== undefined && (
        <div className={cn(
          "text-xs mt-1",
          isInsufficient ? "text-red-400" : "text-slate-600"
        )}>
          ({current})
        </div>
      )}
    </div>
  );
}

// 卡牌预览组件（用于手牌展示）
interface CardPreviewProps {
  card: CardData;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function CardPreview({ card, isSelected, onClick, disabled }: CardPreviewProps) {
  const typeConfig = TYPE_CONFIG[card.type] || TYPE_CONFIG['basic_recon'];
  const rarityConfig = RARITY_CONFIG[card.rarity] || RARITY_CONFIG['common'];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative p-3 rounded-lg border-2 text-left transition-all w-36",
        rarityConfig.bgColor,
        rarityConfig.borderColor,
        isSelected && "ring-2 ring-white scale-105 shadow-lg",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && !isSelected && "hover:scale-102 hover:shadow-md"
      )}
    >
      {/* 消耗 */}
      <div className="absolute top-1 right-1 flex flex-col items-end gap-0.5">
        {card.cost.compute > 0 && (
          <span className="text-xs bg-slate-900/80 px-1 rounded text-cyan-400">
            {card.cost.compute}⚡
          </span>
        )}
        {card.cost.funds > 0 && (
          <span className="text-xs bg-slate-900/80 px-1 rounded text-yellow-400">
            {card.cost.funds}💰
          </span>
        )}
      </div>

      {/* 类型图标 */}
      <div className={cn("mb-2", typeConfig.color)}>
        {typeConfig.icon}
      </div>

      {/* 名称 */}
      <h4 className={cn("font-bold text-sm mb-1 line-clamp-2", rarityConfig.color)}>
        {card.name}
      </h4>

      {/* 稀有度 */}
      <div className="flex items-center gap-1">
        <span className={cn("text-xs", rarityConfig.color)}>
          {rarityConfig.name}
        </span>
      </div>

      {/* 选中指示 */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          ✓
        </div>
      )}
    </button>
  );
}

export default CardDetail;
