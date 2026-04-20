/**
 * 卡牌详情弹窗组件
 * 用于显示AI手牌库中卡牌的详细信息
 * 格式与玩家手牌库一致
 */

import { cn } from '@/lib/utils';
import { Cpu, Coins, Eye, Shield, X, Sword, Search } from 'lucide-react';
import type { CardInfo } from './AIActionVisualizer';

export interface CardDetailModalProps {
  card: CardInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

const RARITY_STYLES: Record<string, { color: string; bgColor: string; name: string; borderColor: string; badge: string }> = {
  common: { 
    color: 'text-slate-300', 
    bgColor: 'bg-slate-600', 
    name: '普通',
    borderColor: 'border-slate-500',
    badge: 'bg-slate-700 text-slate-200 border-slate-600'
  },
  uncommon: { 
    color: 'text-green-300', 
    bgColor: 'bg-green-600', 
    name: '优秀',
    borderColor: 'border-green-500',
    badge: 'bg-green-700 text-green-200 border-green-600'
  },
  rare: { 
    color: 'text-blue-300', 
    bgColor: 'bg-blue-600', 
    name: '稀有',
    borderColor: 'border-blue-500',
    badge: 'bg-blue-700 text-blue-200 border-blue-600'
  },
  epic: { 
    color: 'text-purple-300', 
    bgColor: 'bg-purple-600', 
    name: '史诗',
    borderColor: 'border-purple-500',
    badge: 'bg-purple-700 text-purple-200 border-purple-600'
  },
  legendary: { 
    color: 'text-yellow-300', 
    bgColor: 'bg-yellow-600', 
    name: '传说',
    borderColor: 'border-yellow-500',
    badge: 'bg-yellow-700 text-yellow-200 border-yellow-600'
  }
};

const RESOURCE_COLORS = {
  compute: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50 shadow-cyan-500/20',
  funds: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50 shadow-yellow-500/20',
  information: 'text-purple-400 bg-purple-500/20 border-purple-500/50 shadow-purple-500/20',
  permission: 'text-orange-400 bg-orange-500/20 border-orange-500/50 shadow-orange-500/20'
};

const RESOURCE_ICONS = {
  compute: <Cpu className="w-3 h-3" />,
  funds: <Coins className="w-3 h-3" />,
  information: <Eye className="w-3 h-3" />,
  permission: <Shield className="w-3 h-3" />
};

// 卡牌类型图标映射
const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  attack: { 
    icon: <Sword className="w-4 h-4" />, 
    color: 'text-red-400', 
    label: '攻击' 
  },
  defense_in_depth: { 
    icon: <Shield className="w-4 h-4" />, 
    color: 'text-blue-400', 
    label: '防御' 
  },
  absolute_security: { 
    icon: <Shield className="w-4 h-4" />, 
    color: 'text-green-400', 
    label: '绝对防御' 
  },
  intrusion_detection: { 
    icon: <Search className="w-4 h-4" />, 
    color: 'text-yellow-400', 
    label: '检测' 
  },
  default: { 
    icon: <Shield className="w-4 h-4" />, 
    color: 'text-blue-400', 
    label: '未知' 
  }
};

export function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  if (!isOpen || !card) return null;

  const cost = card.cost || {};
  const rarityStyle = card.rarity ? RARITY_STYLES[card.rarity] : RARITY_STYLES.common;
  
  // 获取卡牌类型对应的图标和颜色
  const typeStyle = card.type ? (TYPE_ICONS[card.type] || TYPE_ICONS.default) : TYPE_ICONS.default;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className={cn(
          'bg-slate-900/95 border-2 rounded-xl p-6 max-w-md w-full shadow-2xl',
          'backdrop-blur-md',
          rarityStyle.borderColor
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* 卡牌标题 */}
        <div className="flex items-start justify-between mb-4 pr-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={typeStyle.color}>{typeStyle.icon}</span>
              <h3 className="text-xl font-bold text-white drop-shadow-lg">{card.name}</h3>
            </div>
            <p className="text-sm text-slate-400 font-mono">{card.card_code || '未知代码'}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={cn(
              'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium border',
              rarityStyle.badge
            )}>
              {card.rarity || 'common'}
            </span>
            <span className="inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium text-yellow-400 border-yellow-500/50">
              T{card.techLevel || 1}
            </span>
          </div>
        </div>

        {/* 资源消耗 */}
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

        {/* 卡牌效果 */}
        <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700/50">
          <p className="text-sm text-slate-300 leading-relaxed">{card.effect || '暂无效果描述'}</p>
        </div>

        {/* 判定难度 */}
        {card.difficulty !== undefined && card.difficulty > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-slate-400">判定难度:</span>
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center text-xs font-bold border',
                    i < (card.difficulty || 0)
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

        {/* 关闭按钮 */}
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
