/**
 * 《道高一丈：数字博弈》卡牌视觉组件
 * 
 * 严格遵循完善的美工.md (v18.0.0) 实现
 * A4.0 卡牌设计规范
 */

import React from 'react';
import type { CardId, CardRarity, CardFaction } from '@/types/cardRules';
import {
  FACTION_COLORS,
  CARD_DIMENSIONS,
  CARD_BORDER_DESIGN,
  CARD_TYPOGRAPHY
} from '@/types/artRules';

// ==================== 类型定义 ====================

interface CardVisualProps {
  /** 卡牌ID */
  cardId: CardId;
  /** 卡牌名称 */
  name: string;
  /** 卡牌阵营 */
  faction: CardFaction;
  /** 稀有度 */
  rarity: CardRarity;
  /** 效果描述 */
  description: string;
  /** 费用 */
  cost?: {
    compute?: number;
    funds?: number;
    information?: number;
    permission?: number;
  };
  /** 是否可交互 */
  interactive?: boolean;
  /** 是否被选中 */
  selected?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击回调 */
  onClick?: () => void;
  /** 鼠标悬停回调 */
  onHover?: (hovering: boolean) => void;
}

// ==================== 辅助函数 ====================

/**
 * 获取阵营颜色
 */
const getFactionColor = (faction: CardFaction): string => {
  switch (faction) {
    case 'attacker':
      return FACTION_COLORS.attacker.hex;
    case 'defender':
      return FACTION_COLORS.defender.hex;
    case 'common':
    default:
      return FACTION_COLORS.neutral.hex;
  }
};



/**
 * 获取稀有度边框样式
 */
const getRarityBorderStyle = (rarity: CardRarity) => {
  const borderConfig = CARD_BORDER_DESIGN[rarity];
  return {
    borderWidth: borderConfig.borderWidth,
    borderColor: borderConfig.borderColor === '对应阵营主色' 
      ? 'currentColor' 
      : borderConfig.borderColor,
    boxShadow: 'outerGlow' in borderConfig ? borderConfig.outerGlow : 'none'
  };
};

// ==================== 子组件 ====================

/**
 * 阵营图标组件
 */
const FactionIcon: React.FC<{ faction: CardFaction; size?: number }> = ({ 
  faction, 
  size = 24 
}) => {
  const color = getFactionColor(faction);
  
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}
    >
      {faction === 'attacker' && (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
          <path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          <path d="M12 5L5 8.5v4c0 4 2.5 7.5 7 8.5 4.5-1 7-4.5 7-8.5v-4L12 5z" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )}
      {faction === 'defender' && (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        </svg>
      )}
      {faction === 'common' && (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6" fill="none" stroke="white" strokeWidth="2"/>
        </svg>
      )}
    </div>
  );
};

/**
 * 资源费用组件
 */
const CardCost: React.FC<{ cost: CardVisualProps['cost'] }> = ({ cost }) => {
  if (!cost) return null;
  
  const resources = [
    { key: 'compute', label: '算', value: cost.compute, color: '#00CED1' },
    { key: 'funds', label: '资', value: cost.funds, color: '#FFD700' },
    { key: 'information', label: '信', value: cost.information, color: '#4169E1' },
    { key: 'permission', label: '权', value: cost.permission, color: '#9932CC' }
  ];
  
  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      flexWrap: 'wrap'
    }}>
      {resources.map(({ key, label, value, color }) => 
        value ? (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: color
            }}
          >
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ) : null
      )}
    </div>
  );
};

/**
 * 稀有度指示器
 */
const RarityIndicator: React.FC<{ rarity: CardRarity }> = ({ rarity }) => {
  const colors = {
    common: '#E0E0E0',
    rare: '#4FC3F7',
    epic: '#BA68C8',
    legendary: '#FFD700'
  };
  
  return (
    <div style={{
      display: 'flex',
      gap: '2px',
      alignItems: 'center'
    }}>
      {rarity !== 'common' && (
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: colors[rarity],
            boxShadow: `0 0 8px ${colors[rarity]}`
          }}
        />
      )}
      <span style={{
        fontSize: '10px',
        color: colors[rarity],
        textTransform: 'uppercase',
        fontWeight: 'bold'
      }}>
        {rarity === 'common' ? '' : rarity}
      </span>
    </div>
  );
};

// ==================== 主组件 ====================

export const CardVisual: React.FC<CardVisualProps> = ({
  cardId,
  name,
  faction,
  rarity,
  description,
  cost,
  interactive = true,
  selected = false,
  disabled = false,
  onClick,
  onHover
}) => {
  const factionColor = getFactionColor(faction);
  const borderStyle = getRarityBorderStyle(rarity);
  
  // 计算边框颜色
  const borderColor = borderStyle.borderColor === 'currentColor' 
    ? factionColor 
    : borderStyle.borderColor;
  
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      style={{
        width: CARD_DIMENSIONS.width.px,
        height: CARD_DIMENSIONS.height.px,
        borderRadius: CARD_DIMENSIONS.borderRadius.px,
        background: 'linear-gradient(180deg, #1A1A2E 0%, #0A0A0F 100%)',
        border: `${borderStyle.borderWidth} solid ${borderColor}`,
        boxShadow: selected 
          ? `0 0 20px ${factionColor}, ${borderStyle.boxShadow}`
          : borderStyle.boxShadow,
        position: 'relative',
        overflow: 'hidden',
        cursor: interactive && !disabled ? 'pointer' : 'default',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.3s ease',
        transform: selected ? 'translateY(-8px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 顶部区域 - 阵营图标和稀有度 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <FactionIcon faction={faction} size={24} />
        <RarityIndicator rarity={rarity} />
      </div>
      
      {/* 插画区域 */}
      <div style={{
        width: '180px',
        height: '140px',
        margin: '0 auto',
        background: `linear-gradient(135deg, ${factionColor}20 0%, ${factionColor}10 100%)`,
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 渐变遮罩 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)'
        }} />
        
        {/* 占位符图标 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '48px',
          opacity: 0.3,
          color: factionColor
        }}>
          {faction === 'attacker' ? '⚔️' : faction === 'defender' ? '🛡️' : '⚡'}
        </div>
      </div>
      
      {/* 卡牌名称 */}
      <div style={{
        padding: '8px 12px',
        textAlign: 'center'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: CARD_TYPOGRAPHY.cardName.fontSize,
          fontWeight: CARD_TYPOGRAPHY.cardName.weight,
          color: CARD_TYPOGRAPHY.cardName.color,
          lineHeight: CARD_TYPOGRAPHY.cardName.lineHeight,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          {name}
        </h3>
      </div>
      
      {/* 效果描述 */}
      <div style={{
        flex: 1,
        padding: '0 12px',
        overflow: 'hidden'
      }}>
        <p style={{
          margin: 0,
          fontSize: CARD_TYPOGRAPHY.effectDescription.fontSize,
          fontWeight: CARD_TYPOGRAPHY.effectDescription.weight,
          color: CARD_TYPOGRAPHY.effectDescription.color,
          lineHeight: CARD_TYPOGRAPHY.effectDescription.lineHeight,
          textAlign: 'left'
        }}>
          {description}
        </p>
      </div>
      
      {/* 底部区域 - 费用和ID */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        background: 'rgba(0,0,0,0.3)',
        borderTop: `1px solid ${factionColor}30`
      }}>
        <CardCost cost={cost} />
        <span style={{
          fontSize: CARD_TYPOGRAPHY.idLevel.fontSize,
          color: CARD_TYPOGRAPHY.idLevel.color,
          fontFamily: 'monospace'
        }}>
          {cardId}
        </span>
      </div>
      
      {/* 选中高亮效果 */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: `2px solid ${factionColor}`,
          borderRadius: CARD_DIMENSIONS.borderRadius.px,
          pointerEvents: 'none',
          boxShadow: `inset 0 0 20px ${factionColor}40`
        }} />
      )}
    </div>
  );
};

export default CardVisual;
