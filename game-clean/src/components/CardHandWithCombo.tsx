/**
 * 带连击效果的手牌组件
 * 
 * 功能：
 * 1. 显示手牌列表
 * 2. 连击激活时显示金边特效（支持同名和同类型连击）
 * 3. 实时检测连击状态
 * 4. 显示连击加成预览
 */

import React, { useEffect, useState } from 'react';
import type { Card as CardV16 } from '@/types/legacy/card_v16';
import { ComboStateManager, type ComboState } from '@/engine/ComboStateManager';
import { ComboEffectOverlay } from './game/ComboEffectOverlay';
import { COMPLETE_CARD_DATABASE } from '@/data/completeCardDatabase';

// 使用CardV16类型
type Card = CardV16;

interface CardHandWithComboProps {
  /** 玩家ID */
  playerId: string;
  /** 手牌代码列表 */
  cardCodes: string[];
  /** 选中的卡牌索引 */
  selectedIndex: number | null;
  /** 卡牌选择回调 */
  onCardSelect: (index: number) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 带连击效果的手牌组件
 */
export const CardHandWithCombo: React.FC<CardHandWithComboProps> = ({
  playerId,
  cardCodes,
  selectedIndex,
  onCardSelect,
  disabled = false,
}) => {
  const [comboState, setComboState] = useState<ComboState>(ComboStateManager.getState(playerId));

  // 订阅连击状态变化
  useEffect(() => {
    const unsubscribe = ComboStateManager.subscribe((pid, state) => {
      if (pid === playerId) {
        setComboState(state);
      }
    });

    return () => unsubscribe();
  }, [playerId]);

  // 获取卡牌信息
  const getCardInfo = (code: string): Card | undefined => {
    return COMPLETE_CARD_DATABASE[code] as Card | undefined;
  };

  // 检查卡牌是否可触发连击（包括同名和同类型）
  const isComboEligible = (cardCode: string): boolean => {
    const card = getCardInfo(cardCode);
    if (!card) return false;
    
    // 检查是否已有连击激活
    if (comboState.activeCombo) {
      // 同名连击激活
      if (comboState.activeCombo.comboType === 'same_name' && 
          comboState.activeCombo.requiredCardCode === cardCode) {
        return true;
      }
      // 同类型连击激活
      if (comboState.activeCombo.comboType === 'same_type' && 
          comboState.activeCombo.requiredCardType === card.type) {
        return true;
      }
    }
    
    // 检查是否可以触发新的连击
    return ComboStateManager.canTriggerCombo(playerId, card);
  };

  // 获取连击加成值
  const getComboBonus = (cardCode: string): number => {
    const card = getCardInfo(cardCode);
    // 优先使用激活的连击加成
    if (comboState.activeCombo) {
      return comboState.activeCombo.bonus;
    }
    return card?.comboEffect?.bonus || 0.5;
  };

  // 获取连击描述
  const getComboDescription = (cardCode: string): string => {
    const card = getCardInfo(cardCode);
    // 优先使用激活的连击描述
    if (comboState.activeCombo) {
      return comboState.activeCombo.description;
    }
    return card?.comboEffect?.description || '连击效果激活';
  };

  // 获取连击计数
  const getComboCount = (cardCode: string): number => {
    if (comboState.activeCombo?.comboType === 'same_name' && 
        comboState.activeCombo.requiredCardCode === cardCode) {
      return comboState.activeCombo.comboCount;
    }
    if (comboState.activeCombo?.comboType === 'same_type') {
      return comboState.activeCombo.comboCount;
    }
    return comboState.sameNameConsecutiveCount[cardCode] || 0;
  };

  return (
    <div className="flex gap-3 flex-wrap">
      {cardCodes.map((cardCode, index) => {
        const card = getCardInfo(cardCode);
        const isSelected = selectedIndex === index;
        const isEligible = isComboEligible(cardCode);
        const comboCount = getComboCount(cardCode);

        return (
          <div
            key={`${cardCode}-${index}`}
            className="relative"
          >
            <button
              onClick={() => !disabled && onCardSelect(index)}
              disabled={disabled}
              className={`
                relative p-4 border-2 rounded-lg min-w-[100px] text-center transition-all duration-200
                ${isSelected
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isEligible ? 'transform hover:scale-105' : ''}
              `}
            >
              {/* 卡牌内容 */}
              <div className="text-xs font-mono text-slate-400 mb-1">{cardCode}</div>
              <div className="text-sm font-bold truncate max-w-[80px]">
                {card?.name?.split('（')[0] || cardCode}
              </div>
              
              {/* 费用显示 */}
              {card?.cost && (
                <div className="mt-2 flex justify-center gap-1 text-[10px]">
                  {card.cost.compute !== undefined && card.cost.compute > 0 && (
                    <span className="text-cyan-400">算{card.cost.compute}</span>
                  )}
                  {card.cost.funds !== undefined && card.cost.funds > 0 && (
                    <span className="text-yellow-400">资{card.cost.funds}</span>
                  )}
                  {card.cost.information !== undefined && card.cost.information > 0 && (
                    <span className="text-purple-400">信{card.cost.information}</span>
                  )}
                </div>
              )}

              {/* 连击计数显示 */}
              {comboCount > 0 && (
                <div className="absolute -top-1 -left-1 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {comboCount}
                </div>
              )}

              {/* 连击效果覆盖层 */}
              <ComboEffectOverlay
                isActive={isEligible}
                bonus={getComboBonus(cardCode)}
                description={getComboDescription(cardCode)}
                size="sm"
              />
            </button>
          </div>
        );
      })}

      {/* 连击状态提示 */}
      {comboState.cardsPlayedThisTurn.length > 0 && (
        <div className="w-full mt-2 p-2 bg-slate-800/50 rounded-lg">
          <div className="text-xs text-slate-400">
            本回合已使用: {comboState.cardsPlayedThisTurn.length} 张卡牌
            {comboState.activeCombo && (
              <span className="ml-2 text-yellow-400 font-bold">
                ⚡ {comboState.activeCombo.description} (+{comboState.activeCombo.bonus})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardHandWithCombo;
