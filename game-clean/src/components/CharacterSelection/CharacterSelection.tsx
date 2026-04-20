/**
 * 角色选择界面组件
 * 
 * 功能：
 * - 展示所有可选角色
 * - 按阵营和类型筛选
 * - 显示角色详情
 * - 支持角色选择
 */

import React, { useState, useMemo } from 'react';
import type { CharacterDefinition, CharacterType, CharacterFaction } from '@/types/characterRules';
import { CHARACTER_DATABASE, getCharactersByFaction } from '@/data/characterDatabase';
import styles from './CharacterSelection.module.css';

// ============================================
// 类型定义
// ============================================

interface CharacterSelectionProps {
  playerFaction: CharacterFaction;
  onSelectCharacter: (characterId: string) => void;
  selectedCharacterId?: string;
  disabled?: boolean;
}

type FilterType = 'all' | CharacterType;

// ============================================
// 辅助组件
// ============================================

/**
 * 难度星级组件
 */
const DifficultyStars: React.FC<{ level: number }> = ({ level }) => {
  return (
    <div className={styles.difficulty}>
      <span className={styles.difficultyLabel}>难度:</span>
      <span className={styles.stars}>
        {'⭐'.repeat(level)}
      </span>
    </div>
  );
};

/**
 * 角色卡片组件
 */
const CharacterCard: React.FC<{
  character: CharacterDefinition;
  isSelected: boolean;
  onClick: () => void;
}> = ({ character, isSelected, onClick }) => {
  const typeColors: Record<CharacterType, string> = {
    RPS: '#ff6b6b',
    Chance: '#4ecdc4',
    Special: '#ffe66d',
  };

  const typeNames: Record<CharacterType, string> = {
    RPS: '猜拳系',
    Chance: '骰子系',
    Special: '专属系',
  };

  return (
    <div
      className={`${styles.characterCard} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
      style={{ borderColor: typeColors[character.type] }}
    >
      <div className={styles.cardHeader} style={{ backgroundColor: typeColors[character.type] }}>
        <span className={styles.typeBadge}>{typeNames[character.type]}</span>
        <h3 className={styles.characterName}>{character.name.chinese}</h3>
        <span className={styles.englishName}>{character.name.english}</span>
      </div>
      
      <div className={styles.cardBody}>
        <DifficultyStars level={character.difficulty} />
        
        <div className={styles.roleInfo}>
          <span className={styles.roleLabel}>定位:</span>
          <span className={styles.roleValue}>{character.role}</span>
        </div>
        
        <div className={styles.statsPreview}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>算力:</span>
            <span className={styles.statValue}>{character.baseStats.computing.initial}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>资金:</span>
            <span className={styles.statValue}>{character.baseStats.funds.initial}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>信息:</span>
            <span className={styles.statValue}>{character.baseStats.information.initial}</span>
          </div>
        </div>
        
        <div className={styles.skillPreview}>
          <h4>核心技能:</h4>
          <ul>
            {Object.values(character.skills).map((skill) => (
              <li key={skill.id} className={styles.skillItem}>
                <span className={styles.skillName}>{skill.name}</span>
                <span className={styles.skillType}>【{skill.type === 'passive' ? '被动' : skill.type === 'active' ? '主动' : '终极'}】</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {isSelected && (
        <div className={styles.selectedIndicator}>
          <span>✓ 已选择</span>
        </div>
      )}
    </div>
  );
};

/**
 * 角色详情面板
 */
const CharacterDetailPanel: React.FC<{
  character: CharacterDefinition | null;
}> = ({ character }) => {
  if (!character) {
    return (
      <div className={styles.detailPanel}>
        <div className={styles.emptyState}>
          <p>请选择一个角色查看详情</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.detailPanel}>
      <h2 className={styles.detailTitle}>{character.name.chinese}</h2>
      <h3 className={styles.detailSubtitle}>{character.name.english}</h3>
      
      <div className={styles.detailSection}>
        <h4>背景故事</h4>
        <p className={styles.backstory}>{character.backstory}</p>
      </div>
      
      <div className={styles.detailSection}>
        <h4>基础属性</h4>
        <div className={styles.statsGrid}>
          <div className={styles.statRow}>
            <span>渗透等级:</span>
            <span>{character.baseStats.level.initial} / {character.baseStats.level.max}</span>
          </div>
          <div className={styles.statRow}>
            <span>算力:</span>
            <span>{character.baseStats.computing.initial} / {character.baseStats.computing.max}</span>
          </div>
          <div className={styles.statRow}>
            <span>资金:</span>
            <span>{character.baseStats.funds.initial} / {character.baseStats.funds.max}</span>
            {character.baseStats.funds.specialNote && (
              <span className={styles.specialNote}>{character.baseStats.funds.specialNote}</span>
            )}
          </div>
          <div className={styles.statRow}>
            <span>信息:</span>
            <span>{character.baseStats.information.initial} / {character.baseStats.information.max}</span>
            {character.baseStats.information.specialNote && (
              <span className={styles.specialNote}>{character.baseStats.information.specialNote}</span>
            )}
          </div>
          <div className={styles.statRow}>
            <span>权限:</span>
            <span>{character.baseStats.permission.initial} / {character.baseStats.permission.max}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.detailSection}>
        <h4>技能详情</h4>
        {Object.values(character.skills).map((skill) => (
          <div key={skill.id} className={styles.skillDetail}>
            <h5>{skill.name} 【{skill.type === 'passive' ? '被动' : skill.type === 'active' ? '主动' : '终极'}】</h5>
            <p className={styles.skillTrigger}>触发: {skill.trigger.description}</p>
            <p className={styles.skillEffect}>效果: {skill.effect.description}</p>
            {skill.resourceCost && (
              <p className={styles.skillCost}>
                消耗: {Object.entries(skill.resourceCost)
                  .map(([k, v]) => `${k === 'computing' ? '算力' : k === 'information' ? '信息' : k === 'funds' ? '资金' : k === 'permission' ? '权限' : k === 'any' ? '任意' : k}${v}`)
                  .join(', ')}
              </p>
            )}
            {skill.trigger.cooldownTurns && (
              <p className={styles.skillCooldown}>冷却: {skill.trigger.cooldownTurns}回合</p>
            )}
          </div>
        ))}
      </div>
      
      {character.specialMechanics && character.specialMechanics.length > 0 && (
        <div className={styles.detailSection}>
          <h4>特殊机制</h4>
          {character.specialMechanics.map((mechanic, idx) => (
            <div key={idx} className={styles.mechanic}>
              <h5>{mechanic.name}</h5>
              <p>{mechanic.description}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.detailSection}>
        <h4>使用建议</h4>
        <div className={styles.usageTips}>
          <div>
            <h6>优势对局:</h6>
            <ul>
              {character.usageTips.advantageMatchups.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
          <div>
            <h6>劣势对局:</h6>
            <ul>
              {character.usageTips.disadvantageMatchups.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
          <div>
            <h6>推荐策略:</h6>
            <ol>
              {character.usageTips.recommendedStrategy.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 主组件
// ============================================

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  playerFaction,
  onSelectCharacter,
  selectedCharacterId,
  disabled = false,
}) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewingCharacterId, setViewingCharacterId] = useState<string | null>(selectedCharacterId || null);

  // 获取可选角色
  const availableCharacters = useMemo(() => {
    const factionChars = getCharactersByFaction(playerFaction);
    if (filterType === 'all') {
      return factionChars;
    }
    return factionChars.filter(c => c.type === filterType);
  }, [playerFaction, filterType]);

  // 当前查看的角色
  const viewingCharacter = useMemo(() => {
    if (!viewingCharacterId) return null;
    return CHARACTER_DATABASE[viewingCharacterId as keyof typeof CHARACTER_DATABASE] || null;
  }, [viewingCharacterId]);

  // 处理角色选择
  const handleCharacterClick = (characterId: string) => {
    if (disabled) return;
    setViewingCharacterId(characterId);
    onSelectCharacter(characterId);
  };

  // 阵营名称
  const factionName = playerFaction === 'attacker' ? '进攻方' : '防御方';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>选择你的{factionName}角色</h1>
        <p className={styles.subtitle}>每个角色都有独特的技能和玩法风格</p>
      </div>

      <div className={styles.filterBar}>
        <button
          className={`${styles.filterBtn} ${filterType === 'all' ? styles.active : ''}`}
          onClick={() => setFilterType('all')}
        >
          全部
        </button>
        <button
          className={`${styles.filterBtn} ${filterType === 'RPS' ? styles.active : ''}`}
          onClick={() => setFilterType('RPS')}
        >
          猜拳系
        </button>
        <button
          className={`${styles.filterBtn} ${filterType === 'Chance' ? styles.active : ''}`}
          onClick={() => setFilterType('Chance')}
        >
          骰子系
        </button>
        <button
          className={`${styles.filterBtn} ${filterType === 'Special' ? styles.active : ''}`}
          onClick={() => setFilterType('Special')}
        >
          专属系
        </button>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.characterGrid}>
          {availableCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isSelected={character.id === selectedCharacterId}
              onClick={() => handleCharacterClick(character.id)}
            />
          ))}
        </div>

        <CharacterDetailPanel character={viewingCharacter} />
      </div>

      {selectedCharacterId && (
        <div className={styles.confirmationBar}>
          <span className={styles.selectedText}>
            已选择: {CHARACTER_DATABASE[selectedCharacterId as keyof typeof CHARACTER_DATABASE]?.name.chinese}
          </span>
          <button className={styles.confirmBtn} disabled={disabled}>
            确认选择
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterSelection;
