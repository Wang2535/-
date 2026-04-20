/**
 * 《道高一丈：数字博弈》角色视觉组件
 * 
 * 严格遵循完善的美工.md (v18.0.0) 实现
 * A5.0 角色形象设计规范
 */

import React from 'react';
import type { CharacterId, CharacterType, CharacterFaction } from '@/types/characterRules';
import {
  FACTION_COLORS,
  CHARACTER_CARD_SPEC,
  CHARACTER_VISUAL_CATEGORIES
} from '@/types/artRules';

// ==================== 类型定义 ====================

interface CharacterVisualProps {
  /** 角色ID */
  characterId: CharacterId;
  /** 角色名称 */
  name: string;
  /** 角色类型 */
  type: CharacterType;
  /** 角色阵营 */
  faction: CharacterFaction;
  /** 难度等级 (1-5星) */
  difficulty: number;
  /** 基础属性 */
  stats: {
    infiltration: number;
    compute: number;
    funds: number;
    information: number;
    permission: number;
  };
  /** 技能列表 */
  skills: Array<{
    name: string;
    description: string;
  }>;
  /** 是否被选中 */
  selected?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击回调 */
  onClick?: () => void;
}

// ==================== 辅助函数 ====================

/**
 * 获取阵营颜色
 */
const getFactionColor = (faction: CharacterFaction): string => {
  switch (faction) {
    case 'attacker':
      return FACTION_COLORS.attacker.hex;
    case 'defender':
      return FACTION_COLORS.defender.hex;
    default:
      return FACTION_COLORS.neutral.hex;
  }
};

/**
 * 获取角色类型颜色倾向
 */
const getCharacterTypeColors = (type: CharacterType) => {
  switch (type) {
    case 'RPS':
      return {
        primary: '#8B0000',
        secondary: '#4B0082',
        gradient: 'linear-gradient(135deg, #8B0000 0%, #4B0082 100%)'
      };
    case 'Chance':
      return {
        primary: '#C0C0C0',
        secondary: '#05D9E8',
        gradient: 'linear-gradient(135deg, #C0C0C0 0%, #05D9E8 100%)'
      };
    case 'Special':
      return {
        primary: '#C0C0C0',
        secondary: '#FFFFFF',
        gradient: 'linear-gradient(135deg, #C0C0C0 0%, #FFFFFF 100%)'
      };
    default:
      return {
        primary: '#A855F7',
        secondary: '#C084FC',
        gradient: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)'
      };
  }
};

/**
 * 获取角色类型名称
 */
const getCharacterTypeName = (type: CharacterType): string => {
  const names: Record<CharacterType, string> = {
    RPS: '猜拳系',
    Chance: '骰子系',
    Special: '专属系'
  };
  return names[type];
};

/**
 * 获取角色类型特征
 */
const getCharacterTypeCharacteristics = (type: CharacterType): string => {
  const key = type.toLowerCase() as 'rps' | 'chance' | 'special';
  return CHARACTER_VISUAL_CATEGORIES[key].characteristics;
};

// ==================== 子组件 ====================

/**
 * 难度星级组件
 */
const DifficultyStars: React.FC<{ level: number; maxLevel?: number }> = ({ 
  level, 
  maxLevel = 5 
}) => {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: maxLevel }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < level ? '#FFD700' : '#444',
            fontSize: '14px',
            textShadow: i < level ? '0 0 5px #FFD700' : 'none'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

/**
 * 属性条组件
 */
const StatBar: React.FC<{ 
  label: string; 
  value: number; 
  maxValue?: number;
  color: string;
}> = ({ label, value, maxValue = 10, color }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span style={{ 
        fontSize: '11px', 
        color: '#888', 
        width: '40px',
        textAlign: 'right'
      }}>
        {label}
      </span>
      <div style={{
        flex: 1,
        height: '6px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: color,
          borderRadius: '3px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      <span style={{ 
        fontSize: '11px', 
        color: color,
        width: '20px',
        textAlign: 'right',
        fontWeight: 'bold'
      }}>
        {value}
      </span>
    </div>
  );
};

/**
 * 技能标签组件
 */
const SkillTag: React.FC<{ name: string; index: number }> = ({ name, index }) => {
  const colors = ['#FF2A6D', '#05D9E8', '#A855F7'];
  const color = colors[index % colors.length];
  
  return (
    <div style={{
      background: `${color}20`,
      border: `1px solid ${color}50`,
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '11px',
      color: color,
      fontWeight: 'bold'
    }}>
      技能{index + 1}: {name}
    </div>
  );
};

// ==================== 主组件 ====================

export const CharacterVisual: React.FC<CharacterVisualProps> = ({
  characterId,
  name,
  type,
  faction,
  difficulty,
  stats,
  skills,
  selected = false,
  disabled = false,
  onClick
}) => {
  const factionColor = getFactionColor(faction);
  const typeColors = getCharacterTypeColors(type);
  const typeName = getCharacterTypeName(type);
  const characteristics = getCharacterTypeCharacteristics(type);
  
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        width: CHARACTER_CARD_SPEC.dimensions.px,
        height: CHARACTER_CARD_SPEC.dimensions.height.px,
        borderRadius: '16px',
        background: 'linear-gradient(180deg, #1A1A2E 0%, #0A0A0F 100%)',
        border: `3px solid ${selected ? factionColor : `${factionColor}50`}`,
        boxShadow: selected 
          ? `0 0 30px ${factionColor}80, 0 10px 40px rgba(0,0,0,0.5)`
          : '0 10px 40px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.3s ease',
        transform: selected ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 顶部渐变条 */}
      <div style={{
        height: '6px',
        background: typeColors.gradient
      }} />
      
      {/* 角色插画区域 */}
      <div style={{
        height: '280px',
        background: `linear-gradient(135deg, ${typeColors.primary}30 0%, ${typeColors.secondary}20 100%)`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* 背景装饰 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 30% 20%, ${factionColor}20 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, ${typeColors.primary}20 0%, transparent 50%)
          `
        }} />
        
        {/* 角色占位符 */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${factionColor}40 0%, ${typeColors.primary}40 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '60px',
          border: `3px solid ${factionColor}`,
          boxShadow: `0 0 30px ${factionColor}50`
        }}>
          {faction === 'attacker' ? '⚔️' : '🛡️'}
        </div>
        
        {/* 类型标签 */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(0,0,0,0.7)',
          border: `1px solid ${typeColors.primary}`,
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '10px',
          color: typeColors.primary,
          fontWeight: 'bold'
        }}>
          {typeName}
        </div>
        
        {/* 阵营标签 */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: factionColor,
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '10px',
          color: '#000',
          fontWeight: 'bold'
        }}>
          {faction === 'attacker' ? '进攻方' : '防御方'}
        </div>
      </div>
      
      {/* 角色信息区域 */}
      <div style={{
        flex: 1,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* 名称和难度 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            textShadow: `0 0 10px ${factionColor}50`
          }}>
            {name}
          </h3>
          <DifficultyStars level={difficulty} />
        </div>
        
        {/* 特征描述 */}
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: '#888',
          fontStyle: 'italic'
        }}>
          {characteristics}
        </p>
        
        {/* 属性面板 */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <StatBar 
            label="渗透" 
            value={stats.infiltration} 
            color="#FF2A6D" 
          />
          <StatBar 
            label="算力" 
            value={stats.compute} 
            color="#00CED1" 
          />
          <StatBar 
            label="资金" 
            value={stats.funds} 
            color="#FFD700" 
          />
          <StatBar 
            label="信息" 
            value={stats.information} 
            color="#4169E1" 
          />
          <StatBar 
            label="权限" 
            value={stats.permission} 
            color="#9932CC" 
          />
        </div>
        
        {/* 技能列表 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <span style={{
            fontSize: '11px',
            color: '#666',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            技能
          </span>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            {skills.map((skill, index) => (
              <SkillTag 
                key={index} 
                name={skill.name} 
                index={index} 
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* 底部ID */}
      <div style={{
        padding: '8px 16px',
        background: 'rgba(0,0,0,0.5)',
        borderTop: `1px solid ${factionColor}30`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          fontSize: '10px',
          color: '#666',
          fontFamily: 'monospace'
        }}>
          {characterId}
        </span>
        <span style={{
          fontSize: '10px',
          color: factionColor,
          fontWeight: 'bold'
        }}>
          道高一丈
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
          borderRadius: '16px',
          pointerEvents: 'none',
          boxShadow: `inset 0 0 40px ${factionColor}30`
        }} />
      )}
    </div>
  );
};

export default CharacterVisual;
