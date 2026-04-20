# D组第十一轮 — 交互体验打磨与Boss战系统

## 背景

游戏核心逻辑打通后，需要提升交互体验的品质：掷骰动画、移动反馈、格子交互面板、Boss战UI等。

## 🎯 本轮目标

**让每个游戏阶段都有流畅的动画和即时反馈**，提升整体体验的精致度。

---

## 任务详情

### Task D1: ★★☆ P1 — 掷骰动画增强

**新建文件**: `src/tower-mode/components/DiceRoller/DiceRoller.tsx`

```tsx
/**
 * DiceRoller — 掷骰子动画组件
 * 
 * 功能:
 * 1. 3D骰子旋转动画(面快速切换)
 * 2. 减速到最终结果
 * 3. 显示结果+修饰符
 */

import React, { useState, useEffect } from 'react';

interface DiceRollerProps {
  result?: number;
  isRolling: boolean;
  modifier?: number;
  onComplete?: (result: number, final: number) => void;
}

export function DiceRoller({ result, isRolling, modifier = 0, onComplete }: DiceRollerProps) {
  const [display, setDisplay] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'rolling' | 'done'>('idle');

  useEffect(() => {
    if (!isRolling) { setPhase('idle'); return; }
    setPhase('rolling');

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 50;
      if (elapsed < 800) {
        setDisplay(Math.floor(Math.random() * 6) + 1);
      } else if (result) {
        clearInterval(interval);
        setDisplay(result);
        setPhase('done');
        onComplete?.(result, result + modifier);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isRolling, result, modifier, onComplete]);

  const final = (result ?? 1) + modifier;

  return (
    <div className={`dice-roller dice-${phase}`}>
      <div className="dice-face">{display}</div>
      {phase === 'done' && modifier !== 0 && (
        <div className="dice-modifier">
          <span className={modifier > 0 ? 'pos' : 'neg'}>{modifier > 0 ? '+' : ''}{modifier}</span>
          <span className="final">= {final}</span>
        </div>
      )}
    </div>
  );
}
```

### Task D2: ★★☆ P1 — 格子交互面板增强

**新建/修改文件**: `src/tower-mode/components/CellInfoPanel/CellInfoPanel.tsx`

要求根据格子类型和Zone显示不同操作:

- 书店格: "购买书籍"按钮
- 技能格: "选择技能"按钮
- Boss格: "开始战斗"按钮
- 交流会格: "交换"按钮
- 显示当前Zone效果提示

### Task D3: ★★★ P1 — BossBattleView Boss战界面

**新建文件**: `src/tower-mode/components/BossBattle/BossBattleView.tsx`

```tsx
/**
 * BossBattleView — Boss战斗界面
 */

interface BossBattleViewProps {
  bossName: string;
  bossHp: number;
  bossMaxHp: number;
  playerHp: number;
  playerMaxHp: number;
  playerTech: number;
  skills: Array<{ id: string; name: string; cost: number; damage: number }>;
  onAttack: (skillId: string) => void;
  onDefend: () => void;
}

export function BossBattleView({
  bossName, bossHp, bossMaxHp,
  playerHp, playerMaxHp, playerTech,
  skills, onAttack, onDefend,
}: BossBattleViewProps) {
  return (
    <div className="boss-battle-view">
      {/* Boss区域 */}
      <div className="boss-section">
        <div className="boss-name">{bossName}</div>
        <div className="boss-hp-bar">
          <div className="boss-hp-fill" style={{ width: `${(bossHp / bossMaxHp) * 100}%` }} />
          <span>{bossHp}/{bossMaxHp}</span>
        </div>
      </div>

      <div className="vs">VS</div>

      {/* 玩家区域 */}
      <div className="player-section">
        <div className="player-hp-bar">
          <div className="player-hp-fill" style={{ width: `${(playerHp / playerMaxHp) * 100}%` }} />
          <span>{playerHp}/{playerMaxHp}</span>
        </div>
        <div className="player-tech">💡 {playerTech}</div>
      </div>

      {/* 操作面板 */}
      <div className="battle-actions">
        {skills.map(s => (
          <button key={s.id} onClick={() => onAttack(s.id)} disabled={playerTech < s.cost}>
            {s.name} (💡{s.cost})
          </button>
        ))}
        <button onClick={onDefend}>🛡️ 防御</button>
      </div>
    </div>
  );
}
```

---

## 验收标准

- [ ] 掷骰子有旋转动画(>500ms)
- [ ] 掷骰结果+修饰符正确显示
- [ ] 书店格显示购买按钮
- [ ] Boss格显示战斗按钮
- [ ] Zone效果在面板有文字提示
- [ ] Boss战有独立界面
- [ ] Boss/玩家血量条正确
