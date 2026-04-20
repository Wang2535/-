# D组第十轮 — 引擎UI完整对接 + 游戏流程闭环

## 背景

第九轮D组完成了TowerGameEngine的代码实现(680行)，但**Gap-P1-5指出引擎与UI流程未完全打通**：

> 玩家点击"投掷骰子"按钮 → 应调用 engine.rollDice() → 触发Dice3D动画 → 显示结果 → 高亮可达路径
> 
> 但目前这个**事件链可能断裂在某个环节**

本组目标：**确保 TowerGameEngine ←→ UI组件 的完整双向通信**。

## 具体任务

### Task D1: ★★★ P0 — TowerGameController 主控制器

**新建文件**: `src/tower-mode/controllers/TowerGameController.tsx`

```tsx
/**
 * TowerGameController — 游戏主控制器
 * 
 * 作为TowerGameEngine和React UI之间的桥梁:
 * 1. 持有engine实例
 * 2. 监听engine事件，更新React state
 * 3. 将用户操作转发给engine
 * 4. 将engine状态分发给各UI组件
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { TowerGameEngine } from '../engine/TowerGameEngine';
import type { RenderableGourdMapTopologyV3 } from '../types/visualAssets.types';
import type { LayerShapeConfig } from '../types/gourdShapeVariants.types';
import type { DiceRollResult } from '../types/movement.types';
import { EventBus } from '../EventBus';

export function useTowerGameController() {
  const engineRef = useRef<TowerGameEngine | null>(null);
  const eventBusRef = useRef<EventBus>(new EventBus());
  
  // UI状态
  const [currentLayer, setCurrentLayer] = useState(1);
  const [topology, setTopology] = useState<RenderableGourdMapTopologyV3 | null>(null);
  const [shapeConfig, setShapeConfig] = useState<LayerShapeConfig | null>(null);
  
  // 游戏状态(来自engine)
  const [phase, setPhase] = useState<string>('idle');
  const [diceResult, setDiceResult] = useState<DiceRollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [pieceState, setPieceState] = useState<any>(null);
  const [cellInfoData, setCellInfoData] = useState<any>(null);
  const [availablePaths, setAvailablePaths] = useState<any[]>([]);
  const [techValue, setTechValue] = useState(100);
  const [gold, setGold] = useState(0);
  const [turnNumber, setTurnNumber] = useState(1);
  const [bossDangerActive, setBossDangerActive] = useState(false);
  const [wStreakCount, setWStreakCount] = useState(0);
  const [blockedPathIds, setBlockedPathIds] = useState<Set<string>>(new Set());
  const [activeSequenceStep, setActiveSequenceStep] = useState(0);

  // 初始化引擎
  useEffect(() => {
    engineRef.current = new TowerGameEngine(eventBusRef.current);
    
    // 订阅引擎事件
    const bus = eventBusRef.current;
    
    bus.on('phase:change', (p: string) => setPhase(p));
    bus.on('dice:start', () => setIsRolling(true));
    bus.on('dice:result', (result: any) => {
      setIsRolling(false);
      setDiceResult(result);
    });
    bus.on('path:calculated', (paths: any[]) => setAvailablePaths(paths));
    bus.on('piece:move:start', (state: any) => setPieceState(state));
    bus.on('piece:move:update', (state: any) => setPieceState(state));
    bus.on('piece:move:end', (state: any) => setPieceState({ ...state, justArrived: true }));
    bus.on('cell:info:show', (data: any) => setCellInfoData(data));
    bus.on('resource:change', ({ type, newValue }: any) => {
      if (type === 'tech') setTechValue(newValue);
      if (type === 'gold') setGold(newValue);
    });
    bus.on('turn:end', ({ turnNumber: tn }: any) => setTurnNumber(tn + 1));
    bus.on('zone:w-streak', (count: number) => setWStreakCount(count));
    bus.on('mechanic:blockade', (ids: string[]) => setBlockedPathIds(new Set(ids)));
    bus.on('mechanic:sequence-step', (step: number) => setActiveSequenceStep(step));

    // 启动新游戏
    loadLayer(1);

    return () => {
      bus.removeAllListeners();
    };
  }, []);

  /** 加载指定层级 */
  const loadLayer = useCallback((layerNum: number) => {
    if (!engineRef.current) return;
    
    // 使用第十轮新的组装函数(含A/B组形状+拓扑)
    const topo = assembleFullTopologyV10(layerNum);  // C组B3中更新的版本
    engineRef.current.setTopology(topo);
    setTopology(topo);
    setCurrentLayer(layerNum);
    
    // 获取形状配置
    import('../geometry/GourdShapeFactory').then(({ GourdShapeFactory }) => {
      setShapeConfig(GourdShapeFactory.generate({
        layerNumber: layerNum, mechanicType: '', themeName: '', difficulty: layerNum,
      }));
    });

    // 重置UI状态
    setPhase('idle');
    setDiceResult(null);
    setCellInfoData(null);
    setAvailablePaths([]);
    setBossDangerActive(false);
  }, []);

  /** 投掷骰子 */
  const rollDice = useCallback(() => {
    if (!engineRef.current || phase !== 'idle') return;
    const result = engineRef.current.rollDice();
    // dice:start 和 dice:result 事件会自动触发UI更新
    return result;
  }, [phase]);

  /** 选择路径 */
  const selectPath = useCallback((pathIndex: number) => {
    if (!engineRef.current || phase !== 'dice_result') return;
    engineRef.current.selectPath(pathIndex);
    // path:selected 事件触发后 phase 变为 moving
  }, [phase]);

  /** 进入格子 */
  const enterCell = useCallback((cellId: string) => {
    if (!engineRef.current) return;
    engineRef.current.enterCell(cellId);
    setCellInfoData(null);
  }, []);

  /** 跳过格子 */
  const skipCell = useCallback((cellId: string) => {
    if (!engineRef.current) return;
    engineRef.current.skipCell(cellId);
    setCellInfoData(null);
  }, []);

  /** 关闭信息面板 */
  const closePanel = useCallback(() => {
    setCellInfoData(null);
  }, []);

  return {
    // 状态
    currentLayer, topology, shapeConfig,
    phase, diceResult, isRolling, pieceState, cellInfoData,
    availablePaths, techValue, gold, turnNumber,
    bossDangerActive, wStreakCount, blockedPathIds, activeSequenceStep,
    // 操作
    loadLayer, rollDice, selectPath, enterCell, skipCell, closePanel,
    // 引擎引用(供高级操作)
    engine: engineRef.current,
    eventBus: eventBusRef.current,
  };
}
```

### Task D2: ★★☆ P1 — GameHUD 游戏状态面板

**新建文件**: `src/tower-mode/components/GameHUD/GameHUD.tsx`

```tsx
/**
 * GameHUD — 游戏状态抬头显示
 * 显示: 层级名/回合数/技术值/金币/当前阶段/操作按钮
 */
export function GameHUD({
  layerName, turnNumber, techValue, gold, phase,
  onRollDice, isRolling, canRoll,
}: {
  layerName: string; turnNumber: number; techValue: number; gold: number;
  phase: string; onRollDice: () => void; isRolling: boolean; canRoll: boolean;
}) {
  const phaseLabels: Record<string, string> = {
    idle: '⏳ 等待投掷',
    dice_ready: '🎲 准备投掷',
    dice_result: '📍 选择路径',
    moving: '🏃 移动中...',
    cell_arrived: '👀 到达新位置',
    cell_interacting: '⚡ 格子交互中',
    settling: '✅ 结算中...',
    turn_end: '🔄 回合结束',
  };

  return (
    <div className="game-hud">
      <div className="hud-left">
        <span className="hud-layer">{layerName}</span>
        <span className="hud-turn">第{turnNumber}回合</span>
      </div>
      <div className="hud-center">
        <span className={`hud-phase ${phase}`}>{phaseLabels[phase] ?? phase}</span>
      </div>
      <div className="hud-right">
        <span className="hud-tech">💡 技术值: <b>{techValue}</b></span>
        <span className="hud-gold">💰 金币: <b>{gold}</b></span>
      </div>
      <button className={`hud-roll-btn ${isRolling ? 'rolling' : ''} ${!canRoll ? 'disabled' : ''}`}
              onClick={onRollDice} disabled={!canRoll || isRolling}>
        {isRolling ? '🎲 投掷中...' : '🎲 投掷骰子'}
      </button>
    </div>
  );
}
```

### Task D3: ★★☆ P1 — PathSelector 路径选择器

当骰子结果出来后，高亮显示可选路径并允许玩家点击选择：

```tsx
/**
 * PathSelector — 可达路径选择UI
 * 当 phase='dice_result' 时显示，让玩家选择要走哪条路
 */
export function PathSelector({
  availablePaths, onSelect, highlightedCells,
}: {
  availablePaths: Array<{ targetCellId: string; pathCellIds: string[]; length: number }>;
  onSelect: (index: number) => void;
  highlightedCells: string[];
}) {
  if (availablePaths.length === 0) return null;

  return (
    <div className="path-selector">
      <span className="ps-title">📍 选择路径 ({availablePaths.length}条可选)</span>
      <div className="ps-options">
        {availablePaths.map((path, i) => (
          <button key={i} className="ps-option" onClick={() => onSelect(i)}>
            <span className="ps-label">路径{i + 1}</span>
            <span className="ps-length">{path.length}步</span>
            <span className="ps-target">→ {path.targetCellId}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

## 第十轮D组改动总览

| 任务 | 对应Gap | 改动内容 |
|------|---------|---------|
| **D1** | **Gap-P1-5核心** | TowerGameController(useTowerGameController hook) — 引擎↔UI完整桥梁 |
| **D2** | Gap-P2-5 | GameHUD — 层级名/回合数/技术值/金币/阶段/投掷按钮 |
| **D3** | — | PathSelector — 骰子后的路径选择UI |

## 验收标准

1. ✅ 点击"投掷骰子"按钮 → Dice3D开始翻滚动画 → 1.7s后显示结果
2. ✅ 骰子结果显示后 → 地图上对应步数的格子高亮发光
3. ✅ 出现分叉时 → PathSelector显示多条可选路径按钮
4. ✅ 选择路径后 → 棋子沿曲线路径移动 → 到达波纹 → CellInfoPanel弹出
5. ✅ CellInfoPanel点"进入" → 面板关闭 → 战斗/Boss/商店等逻辑执行
6. ✅ 技术值/金币变化实时反映在GameHUD上
7. ✅ 回合结束后turnNumber自动+1，phase回到idle

## 完整事件流（闭环验证）

```
玩家点击[投掷骰子]
  → Controller.rollDice()
  → Engine.rollDice() → emit('dice:start')
  → Controller: isRolling=true → Dice3D开始翻滚
  → Engine计算完 → emit('dice:result', result)
  → Controller: diceResult=result, isRolling=false, phase='dice_result'
  → Engine.calculateAvailablePaths() → emit('path:calculated', paths)
  → Controller: availablePaths=paths → PathSelector显示选项
  → 玩家点击[路径X]
  → Controller.selectPath(X)
  → Engine.selectPath(X) → emit('path:selected') → phase='moving'
  → Engine移动棋子 → emit('piece:move:start/update/end')
  → AnimationLayer渲染移动动画
  → Engine到达目标格 → emit('cell:arrived')
  → Engine检测区域 → emit('zone:effect:trigger' / 'zone:w-streak')
  → MechanicVisualizer渲染机制效果
  → Engine进入交互 → emit('cell:info:show', data)
  → Controller: cellInfoData=data → CellInfoPanel弹出
  → 玩家点击[进入]
  → Controller.enterCell(id)
  → Engine.enterCell(id) → 触发战斗/商店等 → emit('battle:trigger'/etc.)
  → Engine结算 → emit('resource:change') → HUD数值更新
  → Engine.endTurn() → emit('turn:end')
  → Controller: turnNumber++, phase='idle'
  → 等待下一轮投掷...
```
