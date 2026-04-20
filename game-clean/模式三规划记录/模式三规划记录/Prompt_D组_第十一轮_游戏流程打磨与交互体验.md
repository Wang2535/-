# D组第十一轮 — 游戏流程打磨 + 交互体验优化

## 背景

第十轮完成了基础的游戏循环(rollDice → pathSelect → move → arrive → interact → settle → endTurn),但玩家体验上还有很多不足:

- 掷骰子动画可能过于简单
- 移动过程可能没有路径动画
- 格子交互面板可能信息不全
- 战斗流程可能缺乏视觉效果
- Boss战可能不够震撼

## 本轮目标

**让每个游戏阶段都有流畅的动画和反馈**,提升整体游戏体验的精致度。

---

## 具体任务

### Task D1: ★★★ P1 — DiceRollAnimation 掷骰动画增强

**新建文件**: `src/tower-mode/components/DiceRoller/DiceRollAnimation.tsx`

```tsx
/**
 * DiceRollAnimation — 掷骰子3D动画组件
 * 
 * 功能:
 * 1. 3D骰子旋转动画(2-4种面快速切换)
 * 2. 减速到最终结果
 * 3. 结果高亮显示
 */

import React, { useState, useEffect, useCallback } from 'react';

interface DiceRollAnimationProps {
  /** 骰子面数(默认6) */
  faces?: number;
  /** 掷骰结果(由父组件控制) */
  result?: number;
  /** 是否正在滚动 */
  isRolling: boolean;
  /** 骰子修饰(来自Zone效果) */
  modifier?: number;
  /** 动画完成回调 */
  onComplete?: (result: number, finalValue: number) => void;
}

export function DiceRollAnimation({
  faces = 6,
  result,
  isRolling,
  modifier = 0,
  onComplete,
}: DiceRollAnimationProps) {
  const [displayValue, setDisplayValue] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'slowing' | 'revealed'>('idle');

  // 骰子面映射到3D旋转角度
  const faceRotations: Record<number, { x: number; y: number }> = {
    1: { x: 0, y: 0 },
    2: { x: -90, y: 0 },
    3: { x: 0, y: -90 },
    4: { x: 0, y: 90 },
    5: { x: 90, y: 0 },
    6: { x: 180, y: 0 },
  };

  useEffect(() => {
    if (!isRolling) {
      setPhase('idle');
      return;
    }

    setPhase('spinning');

    // 旋转动画
    const spinDuration = 800; // 800ms快速旋转
    const slowDuration = 600; // 600ms减速
    const totalDuration = spinDuration + slowDuration;

    const startTime = Date.now();
    const spinInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed < spinDuration) {
        // 快速旋转阶段: 随机显示不同面
        setDisplayValue(Math.floor(Math.random() * faces) + 1);
        setRotation({
          x: Math.random() * 360,
          y: Math.random() * 360,
          z: Math.random() * 45,
        });
      } else if (elapsed < totalDuration && result) {
        // 减速阶段: 逐渐稳定到结果
        const progress = (elapsed - spinDuration) / slowDuration;
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

        const targetRot = faceRotations[result];
        setRotation({
          x: targetRot.x * eased + (Math.random() * 20 * (1 - eased)),
          y: targetRot.y * eased + (Math.random() * 20 * (1 - eased)),
          z: 0,
        });
        setDisplayValue(Math.random() > progress ? Math.floor(Math.random() * faces) + 1 : result);
      } else if (result) {
        // 完成阶段
        clearInterval(spinInterval);
        const targetRot = faceRotations[result];
        setRotation(targetRot);
        setDisplayValue(result);
        setPhase('revealed');
        onComplete?.(result, result + modifier);
      }
    }, 50);

    return () => clearInterval(spinInterval);
  }, [isRolling, result, faces, modifier, onComplete]);

  if (!isRolling && phase === 'idle') {
    return (
      <div className="dice-idle">
        <div className="dice-cube" style={{ transform: 'rotateX(-15deg) rotateY(15deg)' }}>
          <div className="dice-face front">?</div>
        </div>
      </div>
    );
  }

  const finalValue = (result ?? 1) + modifier;

  return (
    <div className={`dice-container dice-${phase}`}>
      <div className="dice-cube" style={{
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
        transition: phase === 'revealed' ? 'transform 0.3s ease-out' : 'none',
      }}>
        {[1, 2, 3, 4, 5, 6].slice(0, faces).map((face) => (
          <div key={face} className={`dice-face dice-face-${face}`}>
            {displayValue === face ? face : '·'}
          </div>
        ))}
      </div>

      {/* 结果展示 */}
      {phase === 'revealed' && result && (
        <div className="dice-result">
          <span className="dice-result-value">{result}</span>
          {modifier !== 0 && (
            <span className={`dice-modifier ${modifier > 0 ? 'positive' : 'negative'}`}>
              {modifier > 0 ? `+${modifier}` : modifier}
            </span>
          )}
          {modifier !== 0 && (
            <span className="dice-final">= {finalValue}</span>
          )}
        </div>
      )}
    </div>
  );
}
```

**配套CSS**: `src/tower-mode/components/DiceRoller/styles.css`

```css
.dice-cube {
  width: 60px;
  height: 60px;
  position: relative;
  transform-style: preserve-3d;
}

.dice-face {
  position: absolute;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(135deg, #ffffff, #e0e0e0);
  border: 2px solid #cccccc;
  border-radius: 8px;
}

.dice-face-1 { transform: translateZ(30px); }
.dice-face-2 { transform: rotateX(90deg) translateZ(30px); }
.dice-face-3 { transform: rotateY(90deg) translateZ(30px); }
.dice-face-4 { transform: rotateY(-90deg) translateZ(30px); }
.dice-face-5 { transform: rotateX(-90deg) translateZ(30px); }
.dice-face-6 { transform: rotateX(180deg) translateZ(30px); }

.dice-result {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.dice-result-value {
  font-size: 32px;
  font-weight: 900;
  color: #ffd700;
}

.dice-modifier.positive {
  color: #44ff88;
  font-size: 18px;
}

.dice-modifier.negative {
  color: #ff4444;
  font-size: 18px;
}

.dice-final {
  color: #ffffff;
  font-size: 18px;
  opacity: 0.8;
}
```

### Task D2: ★★☆ P1 — MovementAnimation 移动路径动画

**新建文件**: `src/tower-mode/components/Animation/MovementAnimation.tsx`

```tsx
/**
 * MovementAnimation — 玩家沿路径移动的动画
 * 
 * 功能:
 * 1. 棋子沿路径逐步移动(每格停留0.3s)
 * 2. 当前格高亮
 * 3. 已走过的路径标记
 */

import React, { useEffect, useState, useCallback } from 'react';

interface MovementAnimationProps {
  /** 路径上的格子ID序列 */
  pathCellIds: string[];
  /** 格子位置映射 */
  cellPositions: Record<string, { x: number; y: number }>;
  /** 移动速度(每格毫秒) */
  speedPerCell?: number;
  /** 移动完成回调 */
  onComplete?: () => void;
}

export function MovementAnimation({
  pathCellIds,
  cellPositions,
  speedPerCell = 300,
  onComplete,
}: MovementAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (pathCellIds.length === 0) return;

    setCurrentIndex(0);
    setIsComplete(false);

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx >= pathCellIds.length) {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      } else {
        setCurrentIndex(idx);
      }
    }, speedPerCell);

    return () => clearInterval(interval);
  }, [pathCellIds, speedPerCell, onComplete]);

  if (pathCellIds.length === 0 || isComplete) return null;

  // 计算棋子当前位置(带插值)
  const currentCellId = pathCellIds[currentIndex];
  const position = cellPositions[currentCellId];

  if (!position) return null;

  // 已走过的路径
  const walkedPath = pathCellIds.slice(0, currentIndex + 1);

  return (
    <g className="movement-animation">
      {/* 已走过的路径(虚线高亮) */}
      {walkedPath.length > 1 && (
        <polyline
          points={walkedPath.map(id => {
            const p = cellPositions[id];
            return p ? `${p.x},${p.y}` : '';
          }).filter(Boolean).join(' ')}
          fill="none"
          stroke="#ffd700"
          strokeWidth="3"
          strokeDasharray="4 4"
          opacity="0.8"
        />
      )}

      {/* 玩家棋子(脉动) */}
      <g transform={`translate(${position.x}, ${position.y})`}>
        <circle r="12" fill="#4488ff" opacity="0.3">
          <animate attributeName="r" values="10;14;10" dur="0.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.4;0.2" dur="0.6s" repeatCount="indefinite" />
        </circle>
        <circle r="8" fill="#4488ff" stroke="#ffffff" strokeWidth="2" />
        <text y="3" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">P</text>
      </g>
    </g>
  );
}
```

### Task D3: ★★☆ P1 — CellInteractionPanel 格子交互面板增强

**修改文件**: `src/tower-mode/components/CellInfoPanel/CellInfoPanel.tsx`

根据格子类型和Zone显示不同的交互选项:

```tsx
interface EnhancedCellInfoPanelProps {
  cellId: string;
  cellType: string;
  zoneId?: string;
  layerNumber: number;
  onEnter: () => void;
  onSkip: () => void;
  onClose: () => void;
  // 特殊操作
  onBuyBook?: () => void;
  onSelectSkill?: () => void;
  onExchange?: () => void;
  onStartBattle?: () => void;
}

export function EnhancedCellInfoPanel({
  cellId, cellType, zoneId, layerNumber,
  onEnter, onSkip, onClose,
  onBuyBook, onSelectSkill, onExchange, onStartBattle,
}: EnhancedCellInfoPanelProps) {
  
  // 根据格子类型显示不同的操作按钮
  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    // 基础操作
    actions.push(
      <button key="enter" onClick={onEnter} className="btn-enter">进入</button>,
      <button key="skip" onClick={onSkip} className="btn-skip">跳过</button>,
    );

    // 特殊操作
    if (cellType === 'bookstore' && onBuyBook) {
      actions.push(
        <button key="buy" onClick={onBuyBook} className="btn-buy">📖 购买书籍</button>
      );
    }

    if (cellType === 'skill' && onSelectSkill) {
      actions.push(
        <button key="skill" onClick={onSelectSkill} className="btn-skill">⚡ 选择技能</button>
      );
    }

    if (cellType === 'exchange' && onExchange) {
      actions.push(
        <button key="exchange" onClick={onExchange} className="btn-exchange">🔄 交换</button>
      );
    }

    if (cellType === 'boss' && onStartBattle) {
      actions.push(
        <button key="battle" onClick={onStartBattle} className="btn-battle">⚔️ 开始战斗</button>
      );
    }

    return actions;
  };

  // Zone效果提示
  const renderZoneTip = () => {
    if (!zoneId) return null;

    const zoneTips: Record<string, string> = {
      W: '⚠️ 虚弱区域: 下次掷骰-1',
      N: '📚 知识区域: 获得随机书籍,算力+2',
      I: '🔄 反转区域: 地图倒置,移动方向反转',
      P: '⏭️ 跳过区域: 下回合将被跳过',
      S: '💨 加速区域: 下次掷骰+1',
      D: '💀 危险区域: 随机损失技术值',
    };

    return (
      <div className="zone-tip" style={{
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        fontSize: '0.85rem',
        color: getZoneColor(zoneId),
      }}>
        {zoneTips[zoneId.toUpperCase()] ?? ''}
      </div>
    );
  };

  return (
    <div className="cell-info-panel">
      <div className="cell-header">
        <span className="cell-id">{cellId}</span>
        <span className="cell-type-badge">{getCellTypeLabel(cellType)}</span>
      </div>

      {renderZoneTip()}
      <div className="cell-actions">{renderActions()}</div>
      <button onClick={onClose} className="btn-close">关闭</button>
    </div>
  );
}

function getZoneColor(zoneId: string): string {
  const colors: Record<string, string> = {
    W: '#ff6666', N: '#4488ff', I: '#9944ff',
    P: '#ffcc00', S: '#44ff88', D: '#ff3333',
  };
  return colors[zoneId.toUpperCase()] ?? '#cccccc';
}

function getCellTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    start: '起点', level: '关卡', battle: '战斗',
    boss: 'Boss', bookstore: '书店', skill: '技能',
    exchange: '交流会', opportunity: '机会', chance: '未知',
    special: '特殊', elite: '精英', locked: '锁定',
    transition: '过渡', end: '终点',
  };
  return labels[type] ?? type;
}
```

### Task D4: ★☆☆ P2 — BossBattleView Boss战界面

**新建文件**: `src/tower-mode/components/BossBattle/BossBattleView.tsx`

```tsx
/**
 * BossBattleView — Boss战斗专用界面
 * 
 * 功能:
 * 1. Boss血量/状态显示
 * 2. 战斗回合制UI
 * 3. 技能选择
 * 4. 战斗结果展示
 */

import React from 'react';

interface BossBattleViewProps {
  bossName: string;
  bossHealth: number;
  bossMaxHealth: number;
  playerHealth: number;
  playerMaxHealth: number;
  playerTech: number;
  availableSkills: Array<{ id: string; name: string; cost: number; damage: number }>;
  onAttack: (skillId: string) => void;
  onDefend: () => void;
  onUseItem: (itemId: string) => void;
}

export function BossBattleView({
  bossName, bossHealth, bossMaxHealth,
  playerHealth, playerMaxHealth, playerTech,
  availableSkills, onAttack, onDefend, onUseItem,
}: BossBattleViewProps) {
  const bossHealthPercent = (bossHealth / bossMaxHealth) * 100;
  const playerHealthPercent = (playerHealth / playerMaxHealth) * 100;

  return (
    <div className="boss-battle-view">
      {/* Boss区域 */}
      <div className="boss-area">
        <div className="boss-name">{bossName}</div>
        <div className="boss-health-bar">
          <div
            className="boss-health-fill"
            style={{
              width: `${bossHealthPercent}%`,
              background: bossHealthPercent > 50 ? '#ff4444' : '#ff0000',
            }}
          />
          <span className="boss-health-text">{bossHealth}/{bossMaxHealth}</span>
        </div>
        {/* Boss形象 */}
        <div className="boss-avatar">
          {/* Boss SVG形象 */}
        </div>
      </div>

      {/* VS分隔线 */}
      <div className="vs-divider">
        <span className="vs-text">VS</span>
      </div>

      {/* 玩家区域 */}
      <div className="player-area">
        <div className="player-health-bar">
          <div
            className="player-health-fill"
            style={{ width: `${playerHealthPercent}%` }}
          />
          <span className="player-health-text">{playerHealth}/{playerMaxHealth}</span>
        </div>
        <div className="player-tech">💡 {playerTech} 技术值</div>
      </div>

      {/* 操作面板 */}
      <div className="battle-actions">
        {availableSkills.map((skill) => (
          <button
            key={skill.id}
            onClick={() => onAttack(skill.id)}
            disabled={playerTech < skill.cost}
            className="btn-skill"
          >
            {skill.name} (💡{skill.cost})
          </button>
        ))}
        <button onClick={onDefend} className="btn-defend">🛡️ 防御</button>
      </div>
    </div>
  );
}
```

---

## 第十一轮D组改动总览

| 任务 | 优先级 | 改动内容 | 预期效果 |
|------|--------|---------|---------|
| **D1** | P1 | DiceRollAnimation 3D骰子 | 掷骰有3D旋转+减速动画 |
| **D2** | P1 | MovementAnimation 路径移动 | 棋子沿路径逐步移动 |
| **D3** | P1 | CellInteractionPanel增强 | 格子交互面板按类型显示不同操作 |
| **D4** | P2 | BossBattleView Boss战界面 | Boss战有专用战斗UI |

## 验收标准

1. ✅ 掷骰子有3D旋转动画(至少800ms)
2. ✅ 掷骰结果+修饰符正确显示(如"4+1=5")
3. ✅ 棋子沿路径逐步移动(非瞬移)
4. ✅ 到达格子后显示正确的交互面板
5. ✅ 书店格显示"购买书籍"按钮
6. ✅ Boss格显示"开始战斗"按钮
7. ✅ Zone效果在交互面板有文字提示
8. ✅ Boss战有独立战斗界面
9. ✅ Boss和玩家血量条正确显示
10. ✅ 动画流畅无卡顿
