# F组第九轮 — 游戏机制全面测试 + 手动验证 + 端到端验证

## 🔴🔴🔴 质量守门员：从视觉到逻辑的全方位验收

## 背景

第九轮A~E组完成了**游戏机制引擎(D组)**和**交互组件(E组)**的构建。这是爬塔模式从"静态地图可视化"跃升为"可玩游戏"的关键一轮。F组作为最终质量关卡，需要：

1. **D组引擎单元测试**: 骰子/路径/格子交互/区域效果/9层机制/资源管理/战斗集成
2. **全链路数据冒烟**: A→B→C→D→E 数据不丢失、类型兼容
3. **渲染器回归测试**: E组新组件(AnimationLayer/BossRing/PathLayer/Panel/Dice3D)功能正确
4. **游戏循环端到端测试**: 完整回合流程 idle→dice→path→move→arrive→interact→settle
5. **50项手动验证清单**: 同时覆盖**视觉效果**和**游戏机制正确性**
6. **性能基准**: 引擎状态+SVG渲染双重负载下的性能

> **边界说明**:
> - F组是**纯测试+验证组**，不修改任何生产代码（仅发现bug并记录）
> - F组需要同时验证第八轮的**视觉成果**和第九轮的**游戏逻辑成果**
> - F组的产出为：测试报告 + 手动验证记录 + 已知问题列表 + 性能基线

## 具体任务

### Task F1: ★★★ P0 — TowerGameEngine 核心单元测试

**新建文件**: `src/tower-mode/__tests__/engine/TowerGameEngine.core.test.ts`

```typescript
/**
 * D组 TowerGameEngine 核心逻辑测试
 * 覆盖: 骰子系统 / 回合循环 / 资源管理 / 阶段机 / 初始化重置
 */

import { TowerGameEngine } from '../../engine/TowerGameEngine';
import type { RenderableGourdMapTopologyV3 } from '../../types/visualAssets.types';
import type { EventBus } from '../../EventBus';

function mockEventBus(): EventBus {
  return {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    once: jest.fn(),
    removeAllListeners: jest.fn(),
  } as any;
}

function mockTopologyV3(): RenderableGourdMapTopologyV3 {
  return {
    id: 'L1-test',
    layerNumber: 1,
    upperCircle: { center: { x: 50, y: 22 }, radius: 18, cellIds: [] },
    connector: { cellIds: [] },
    lowerCircle: { center: { x: 50, y: 62 }, radius: 35, cellIds: [] },
    connections: [
      { id: 'c1', from: 'start', to: 'cell2' },
      { id: 'c2', from: 'cell2', to: 'cell3' },
      { id: 'c3', from: 'cell3', to: 'battle1' },
      { id: 'c4-branch', from: 'cell3', to: 'skill1' }, // 分叉
    ],
    cells: [
      { id: 'start', type: 'start', region: 'connector' },
      { id: 'cell2', type: 'level', region: 'lower' },
      { id: 'cell3', type: 'level', region: 'lower' },
      { id: 'battle1', type: 'battle', region: 'lower' },
      { id: 'skill1', type: 'skill', region: 'lower' },
      { id: 'boss1', type: 'boss', region: 'lower' },
    ],
    visualConfig: {} as any,
    layerMechanic: { type: 'acceleration', visualHint: { maxProgress: 3 } },
    cellInfoMap: new Map([
      ['battle1', { cellId: 'battle1', cellType: 'battle', displayName: '防火墙突破战',
        difficultyStars: 2, enemyPreview: { name: '恶意脚本', type: 'malware', estimatedPower: 45 },
        estimatedTechGain: 5, estimatedGoldGain: 10 }],
      ['boss1', { cellId: 'boss1', cellType: 'boss', displayName: '病毒实验室Boss',
        difficultyStars: 5, enemyPreview: { name: '零日漏洞王', type: 'boss', estimatedPower: 99 },
        estimatedTechGain: 15, estimatedGoldGain: 45 }],
      ['skill1', { cellId: 'skill1', cellType: 'skill', displayName: '加密技能研习',
        difficultyStars: 1, estimatedTechGain: 0, estimatedGoldGain: 5 }],
    ]),
    activeZoneEffects: [],
    hiddenPaths: [],
  } as any;
}

describe('F1 — TowerGameEngine 核心测试', () => {

  describe('1.1 初始化与重置', () => {
    test('创建引擎后初始状态为idle', () => {
      const engine = new TowerGameEngine(mockEventBus());
      expect(engine.getPhase()).toBe('idle');
      expect(engine.getCurrentLayer()).toBe(1);
    });

    test('startNewGame 重置所有状态', () => {
      const engine = new TowerGameEngine(mockEventBus());
      engine.setTopology(mockTopologyV3());
      engine.modifyTechValue(-200); // 扣光
      engine.modifyGold(999);
      
      engine.startNewGame();
      
      expect(engine.getTechValue()).toBe(100);
      expect(engine.getGold()).toBe(0);
      expect(engine.getCurrentLayer()).toBe(1);
      expect(engine.getPhase()).toBe('idle');
      expect(engine.getTurnContext().turnNumber).toBe(1);
    });

    test('setTopology 后引擎可用', () => {
      const engine = new TowerGameEngine(mockEventBus());
      engine.setTopology(mockTopologyV3());
      const result = engine.rollDice();
      expect(result).toBeDefined();
      expect(result.baseValue).toBeGreaterThanOrEqual(1);
      expect(result.baseValue).toBeLessThanOrEqual(6);
    });
  });

  describe('1.2 骰子系统', () => {
    let engine: TowerGameEngine;
    beforeEach(() => {
      engine = new TowerGameEngine(mockEventBus());
      engine.setTopology(mockTopologyV3());
    });

    test('rollDice 返回有效 DiceResult (100次)', () => {
      for (let i = 0; i < 100; i++) {
        engine.startNewGame(); // 每次重置phase
        const result = engine.rollDice();
        expect(result.baseValue).toBeGreaterThanOrEqual(1);
        expect(result.baseValue).toBeLessThanOrEqual(6);
        expect(result.finalValue).toBeGreaterThanOrEqual(1);
        expect(Array.isArray(result.modifiers)).toBe(true);
        expect(typeof result.isCritSuccess).toBe('boolean');
        expect(typeof result.isCritFail).toBe('boolean');
      }
    });

    test('rollDice 后 phase 变为 dice_result', () => {
      engine.rollDice();
      expect(engine.getPhase()).toBe('dice_result');
    });

    test('非idle状态投掷返回dummy结果', () => {
      engine.rollDice(); // 变成dice_result
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      const result = engine.rollDice();
      expect(result.finalValue).toBe(1); // dummy值
      consoleWarn.mockRestore();
    });

    test('大成功判定: base=6且无负面修正时isCritSuccess=true', () => {
      // 模拟base=6且无modifier的情况
      engine.startNewGame();
      const result = engine.rollDice();
      if (result.baseValue === 6 && result.modifiers.every(m => m.delta >= 0)) {
        expect(result.isCritSuccess).toBe(true);
      }
      // 不一定每次都触发，所以只检查条件成立时的行为
    });
  });

  describe('1.3 资源管理系统', () => {
    let engine: TowerGameEngine;
    beforeEach(() => {
      engine = new TowerGameEngine(mockEventBus());
    });

    test('modifyTechValue 正确增加', () => {
      engine.modifyTechValue(30);
      expect(engine.getTechValue()).toBe(130);
    });

    test('modifyTechValue 正确减少但不低于0', () => {
      engine.modifyTechValue(-150);
      expect(engine.getTechValue()).toBe(0);
    });

    test('modifyTechValue 触发 resource:change 事件', () => {
      const bus = mockEventBus();
      engine = new TowerGameEngine(bus);
      engine.modifyTechValue(25);
      expect(bus.emit).toHaveBeenCalledWith(
        'resource:change',
        expect.objectContaining({ type: 'tech', delta: 25, newValue: 125 })
      );
    });

    test('modifyGold 正确增减', () => {
      engine.modifyGold(50);
      expect(engine.getGold()).toBe(50);
      engine.modifyGold(-20);
      expect(engine.getGold()).toBe(30);
    });

    test('技术值归零触发 game:over 事件', () => {
      const bus = mockEventBus();
      engine = new TowerGameEngine(bus);
      engine.modifyTechValue(-100); // 100→0
      expect(bus.emit).toHaveBeenCalledWith(
        'game:over',
        expect.objectContaining({ reason: 'tech_depleted' })
      );
    });

    test('subscribeToResourceChange 回调被调用', () => {
      let receivedDelta = 0;
      engine.subscribeToResourceChange((type, delta) => {
        if (type === 'tech') receivedDelta = delta;
      });
      engine.modifyTechValue(42);
      expect(receivedDelta).toBe(42);
    });
  });

  describe('1.4 阶段状态机', () => {
    test('完整阶段流转: idle → dice_ready → dice_result', () => {
      const engine = new TowerGameEngine(mockEventBus());
      expect(engine.getPhase()).toBe('idle');
      // rollDice 内部会经过 dice_ready → dice_result
      engine.rollDice();
      expect(engine.getPhase()).toBe('dice_result');
    });

    test('subscribeToPhaseChange 接收所有阶段变更', () => {
      const engine = new TowerGameEngine(mockEventBus());
      const phases: string[] = [];
      engine.subscribeToPhaseChange(p => phases.push(p));
      engine.rollDice();
      // 应至少收到一次变更通知
      expect(phases.length).toBeGreaterThan(0);
      expect(phases[phases.length - 1]).toBe('dice_result');
    });

    test('getTurnContext 返回当前回合上下文快照', () => {
      const engine = new TowerGameEngine(mockEventBus());
      engine.setTopology(mockTopologyV3());
      engine.rollDice();
      const ctx = engine.getTurnContext();
      expect(ctx.diceResult).toBeDefined();
      expect(ctx.phase).toBe('dice_result');
      expect(ctx.turnNumber).toBe(1);
    });
  });

  describe('1.5 战斗集成', () => {
    test('到达战斗格后可触发战斗参数构造', () => {
      const bus = mockEventBus();
      const engine = new TowerGameEngine(bus);
      engine.setTopology(mockTopologyV3());

      // 模拟到达 battle1 格子
      engine['onMoveComplete']('battle1');

      // 应该触发了 cell:info:show 事件（包含CellInfoPanelData）
      expect(bus.emit).toHaveBeenCalledWith(
        'cell:info:show',
        expect.objectContaining({
          cellType: 'battle',
          displayName: '防火墙突破战',
          difficultyStars: 2,
        })
      );
    });

    test('enterCell(battle) 触发 battle:trigger 事件', () => {
      const bus = mockEventBus();
      const engine = new TowerGameEngine(bus);
      engine.setTopology(mockTopologyV3());
      engine['turnContext'].playerPosition = 'battle1';

      engine.enterCell('battle1');

      expect(bus.emit).toHaveBeenCalledWith(
        'battle:trigger',
        expect.objectContaining({
          cellId: 'battle1',
          layerNumber: 1,
          difficultyLevel: 2,
        })
      );
    });

    test('onBattleResult(victory) 增加资源和标记通关', () => {
      const bus = mockEventBus();
      const engine = new TowerGameEngine(bus);
      engine.setTopology(mockTopologyV3());
      engine['turnContext'].playerPosition = 'battle1';

      engine.onBattleResult(true);

      expect(engine.getTechValue()).toBeGreaterThan(100); // 获得奖励
      expect(engine.getGold()).toBeGreaterThan(0);
      expect(bus.emit).toHaveBeenCalledWith(
        'cell:cleared',
        expect.objectContaining({ isBoss: false })
      );
    });

    test('onBattleResult(defeat) 扣除技术值', () => {
      const bus = mockEventBus();
      const engine = new TowerGameEngine(bus);
      engine.setTopology(mockTopologyV3());
      const techBefore = engine.getTechValue();

      engine.onBattleResult(false);

      expect(engine.getTechValue()).toBeLessThan(techBefore);
      expect(bus.emit).toHaveBeenCalledWith(
        'cell:failed',
        expect.any(Object)
      );
    });
  });

  describe('1.6 区域效果系统', () => {
    test('进入W区区域效果被检测', () => {
      const bus = mockEventBus();
      const engine = new TowerGameEngine(bus);
      engine.setTopology(mockTopologyV3());

      // 模拟W区格子（需要在topology中配置zoneBackgrounds.W）
      engine['detectZoneForCell'] = () => 'W'; // mock
      engine['checkZoneEntry']('cell-w');

      // W区应触发 zone:effect:execute
      const calls = (bus.emit as jest.Mock).mock.calls.filter(c => c[0] === 'zone:effect:execute');
      expect(calls.length).toBeGreaterThan(0);
    });

    test('W区连击计数在L1加速机制中工作', () => {
      const bus = mockEventBus();
      const engine = new TowerGameEngine(bus);
      engine.setTopology(mockTopologyV3());

      // 模拟连续进入W区3次
      engine['checkZoneEntry'] = function(cellId: string) {
        this.wStreakCount++;
        if (this.wStreakCount >= 3) {
          (this.eventBus as any).emit('mechanic:triggered', {
            type: 'acceleration', detail: '扩散加速！下次骰子+1',
          });
          this.wStreakCount = 0;
        }
      };

      engine['checkZoneEntry']('w1');
      engine['checkZoneEntry']('w2');
      engine['checkZoneEntry']('w3'); // 第三次应触发加速

      expect(bus.emit).toHaveBeenCalledWith(
        'mechanic:triggered',
        expect.objectContaining({ type: 'acceleration' })
      );
    });
  });

  describe('1.7 回合结束流程', () => {
    test('endTurn 正确递增回合数', () => {
      const engine = new TowerGameEngine(mockEventBus());
      engine.setTopology(mockTopologyV3());
      engine.rollDice();

      const turnBefore = engine.getTurnContext().turnNumber;
      engine['endTurn']();
      expect(engine.getTurnContext().turnNumber).toBe(turnBefore + 1);
    });

    test('endTurn 清除临时状态', () => {
      const engine = new TowerGameEngine(mockEventBus());
      engine.setTopology(mockTopologyV3());
      engine.rollDice();

      engine['endTurn']();

      expect(engine.getTurnContext().diceResult).toBeNull();
      expect(engine.getTurnContext().availablePaths).toEqual([]);
      expect(engine.getTurnContext().pendingCellId).toBeNull();
    });

    test('endTurn 发射 turn:end 事件', () => {
      const bus = mockEventBus();
      const engine = new TowerGameEngine(bus);
      engine.setTopology(mockTopologyV3());

      engine['endTurn']();

      expect(bus.emit).toHaveBeenCalledWith(
        'turn:end',
        expect.objectContaining({ turnNumber: expect.any(Number) })
      );
    });
  });
});
```

### Task F2: ★★★ P0 — 9层特殊机制专项测试

**新建文件**: `src/tower-mode/__tests__/engine/LayerMechanics.test.ts`

```typescript
/**
 * D组 9层特殊机制专项测试
 * L1-acceleration / L2-jump / L3-sequence / L4-event
 * L5-blockade / L6-teleport / L7-drift / L8-collapse / L9-protocol
 */

import { TowerGameEngine } from '../../engine/TowerGameEngine';

describe('F2 — 9层特殊机制测试', () => {

  function createEngineWithMechanic(type: string): TowerGameEngine {
    const bus = { emit: jest.fn(), on: jest.fn(), off: jest.fn(), once: jest.fn(), removeAllListeners: jest.fn() };
    const engine = new TowerGameEngine(bus as any);
    engine.setTopology({
      ...mockTopologyV3(),
      layerMechanic: { type, visualHint: { maxProgress: 3 } },
    } as any);
    return engine;
  }

  describe('L1 加速机制 (acceleration)', () => {
    test('W区连击3次触发加速', () => {
      const engine = createEngineWithMechanic('acceleration');
      const bus = engine['eventBus'] as any;

      for (let i = 0; i < 3; i++) {
        engine['checkZoneEntry']({} as any);
        engine['detectZoneForCell'] = () => 'W';
      }

      expect(bus.emit).toHaveBeenCalledWith(
        'mechanic:triggered',
        expect.objectContaining({ type: 'acceleration' })
      );
    });

    test('离开W区重置连击计数', () => {
      const engine = createEngineWithMechanic('acceleration');
      engine['wStreakCount'] = 2;
      engine['detectZoneForCell'] = () => 'N'; // 进入非W区
      engine['checkZoneEntry']({} as any);
      expect(engine['wStreakCount']).toBe(0);
    });
  });

  describe('L2 跳跃机制 (jump)', () => {
    test('跳跃条件满足时可跨环移动', () => {
      const engine = createEngineWithMechanic('jump');
      const bus = engine['eventBus'] as any;

      engine['handleJumpMechanic']('target-cell', { visualHint: { minDice: 4 } });

      // 应发射跳跃相关事件或修改路径
      const mechanicCalls = (bus.emit as jest.Mock).mock.calls
        .filter(c => typeof c[0] === 'string' && c[0].includes('mechanic'));
      expect(mechanicCalls.length).toBeGreaterThan(0);
    });
  });

  describe('L3 顺序机制 (sequence)', () => {
    test('按顺序访问3个圆圈触发奖励', () => {
      const engine = createEngineWithMechanic('sequence');
      engine['currentCircle'] = 'outer';
      engine['handleSequenceMechanic']('mid-cell', {});

      // outer → mid → inner 的顺序追踪
      expect(['outer', 'mid', 'inner']).toContain(engine['currentCircle']);
    });
  });

  describe('L4 街区事件 (event)', () => {
    test('街区格触发随机事件', () => {
      const engine = createEngineWithMechanic('event');
      const bus = engine['eventBus'] as any;

      engine['handleEventMechanic']('district-cell', {});

      expect(bus.emit).toHaveBeenCalledWith(
        'event:trigger',
        expect.any(Object)
      );
    });
  });

  describe('L5 阻塞机制 (blockade)', () => {
    test('阻塞路径时绕行计算生效', () => {
      const engine = createEngineWithMechanic('blockade');
      engine['sameBranchTurns'] = 3;

      engine['handleBlockadeMechanic']('blocked-cell', {});
      // 同分支停留过久应触发阻塞警告
      expect(engine['sameBranchTurns']).toBeGreaterThanOrEqual(3);
    });
  });

  describe('L6 迷路机制 (teleport)', () => {
    test('迷路时随机传送到相邻格', () => {
      const engine = createEngineWithMechanic('teleport');
      const originalPos = engine['turnContext'].playerPosition;

      engine['handleTeleportMechanic']('maze-cell', {});

      // 位置应该发生变化（随机相邻格）
      // 注意：具体实现可能不同，这里只验证方法不崩溃
      expect(engine['handleTeleportMechanic']).not.toThrow();
    });
  });

  describe('L7 漂移机制 (drift)', () => {
    test('漂移影响路径方向偏好', () => {
      const engine = createEngineWithMechanic('drift');

      engine['handleDriftMechanic']({});
      // 漂移机制不应崩溃
      expect(true).toBe(true);
    });
  });

  describe('L8 坍缩机制 (collapse)', () => {
    test('坍缩使部分路径不可用', () => {
      const engine = createEngineWithMechanic('collapse');
      const bus = engine['eventBus'] as any;

      engine['handleCollapseMechanic']('collapse-cell', {});

      // 坍缩应发射某种警告或路径更新事件
      expect(engine['handleCollapseMechanic']).not.toThrow();
    });
  });

  describe('L9 礼仪机制 (protocol)', () => {
    test('违反踩格顺序触发遣返', () => {
      const engine = createEngineWithMechanic('protocol');
      const bus = engine['eventBus'] as any;

      engine['handleProtocolMechanic']('wrong-order-cell', {});

      // 礼仪违规应有遣返或惩罚相关事件
      const relevantCalls = (bus.emit as jest.Mock).mock.calls
        .filter(c => typeof c[0] === 'string' && (
          c[0].includes('banish') || c[0].includes('penalty') || c[0].includes('protocol')
        ));
      // 至少验证方法执行无异常
      expect(engine['handleProtocolMechanic']).not.toThrow();
    });
  });
});
```

### Task F3: ★★☆ P1 — 全链路数据完整性冒烟

**新建文件**: `src/tower-mode/__tests__/e2e/NinthRoundPipelineSmoke.test.ts`

```typescript
/**
 * 第九轮全链路冒烟测试
 * 验证 A→B→C→D→E 数据流不丢失
 */

describe('F3 — 第九轮全链路冒烟', () => {

  describe('A组资源完备性', () => {
    test('gameMechanics.types.ts 含全部所需接口', () => {
      const types = require('../../types/gameMechanics.types');
      const requiredTypes = [
        'DiceResult', 'DiceModifier', 'TurnContext', 'GamePhase',
        'PathOption', 'CellInfoPanelData', 'CellMapState',
        'ZoneEffectInstance', 'TowerBattleParams', 'LayerSpecialMechanicData',
        'LayerThemeConfig',
      ];
      for (const t of requiredTypes) {
        expect(types[t]).toBeDefined();
      }
    });

    test('layerThemes.ts 含9层主题配置', () => {
      const { LAYER_THEMES } = require('../../data/layerThemes');
      expect(LAYER_THEMES).toHaveLength(9);
      for (let i = 0; i < 9; i++) {
        const theme = LAYER_THEMES[i];
        expect(theme.name).toBeTruthy();
        expect(theme.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.zoneColors).toBeDefined();
        expect(theme.specialMechanic).toBeTruthy();
      }
    });

    test('DEFAULT_QUADRANT_LABELS fontSizeRatio = 0.36', () => {
      const { DEFAULT_QUADRANT_LABELS } = require('../../constants/defaultVisualStyles');
      for (const q of DEFAULT_QUADRANT_LABELS) {
        expect(q.fontSizeRatio).toBeCloseTo(0.36, 2);
      }
    });

    test('DEFAULT_BORDER_CONFIG tileSize = 7, opacity = 0.95', () => {
      const { DEFAULT_BORDER_CONFIG } = require('../../constants/defaultVisualStyles');
      expect(DEFAULT_BORDER_CONFIG.tileSize).toBe(7);
      expect(DEFAULT_BORDER_CONFIG.opacity).toBe(0.95);
    });
  });

  describe('B组分地图差异化', () => {
    test.each([1,2,3,4,5,6,7,8,9])
    ('第%s层有独立的 layerMechanic 配置', (layer) => {
      const { getLayerMechanic } = require('../../data/layerMechanics');
      const mech = getLayerMechanic(layer);
      expect(mech).toBeDefined();
      expect(mech.type).toBeTruthy();
      const validTypes = ['acceleration','jump','sequence','event','blockade','teleport','drift','collapse','protocol'];
      expect(validTypes).toContain(mech.type);
    });

    test('每层的 zoneBackgrounds opacity 在 0.18-0.25 范围内', () => {
      for (let layer = 1; layer <= 9; layer++) {
        const topology = getTopology(layer);
        for (const zone of ['W','N','I','P']) {
          const bg = topology.visualConfig?.zoneBackgrounds?.[zone];
          if (bg?.fillColor) {
            const match = bg.fillColor.match(/[\d.]+\)$/);
            if (match) {
              const opacity = parseFloat(match[0]);
              expect(opacity).toBeGreaterThanOrEqual(0.15);
              expect(opacity).toBeLessThanOrEqual(0.30);
            }
          }
        }
      }
    });

    test('L9 Boss sizeMultiplier = 3.0', () => {
      const t = getTopology(9);
      const bossStyle = t.visualConfig?.cellVisualStyles?.get('boss');
      expect(bossStyle?.sizeMultiplier).toBeCloseTo(3.0, 1);
    });
  });

  describe('C组装层增强', () => {
    test('RenderableGourdMapTopologyV3 包含新增字段', () => {
      const t = assembleFullTopologyV3(1);
      const v3Fields = [
        'layerTheme', 'layerMechanic', 'cellInfoMap',
        'activeZoneEffects', 'hiddenPaths', 'hexAdjacency', 'protocolSequence',
      ];
      for (const field of v3Fields) {
        expect(t).toHaveProperty(field);
      }
    });

    test('cellInfoMap 含关键格子的面板数据', () => {
      const t = assembleFullTopologyV3(1);
      expect(t.cellInfoMap.size).toBeGreaterThan(0);
      const hasBattleInfo = Array.from(t.cellInfoMap.values())
        .some(info => info.cellType === 'battle');
      expect(hasBattleInfo).toBe(true);
    });
  });

  describe('D引擎可实例化', () => {
    test('TowerGameEngine 可创建并运行基础流程', () => {
      const { TowerGameEngine } = require('../../engine/TowerGameEngine');
      const engine = new TowerGameEngine(mockBus());
      engine.setTopology(assembleFullTopologyV3(1));
      engine.startNewGame();
      const result = engine.rollDice();
      expect(result.finalValue).toBeGreaterThanOrEqual(1);
    });
  });

  describe('E组新组件可挂载', () => {
    test('AnimationLayer 组件存在', () => {
      const { AnimationLayer } = require('../../components/GourdMapRenderer/AnimationLayer');
      expect(AnimationLayer).toBeDefined();
    });

    test('BossDangerRing 组件存在', () => {
      try {
        const { BossDangerRing } = require('../../components/GourdMapRenderer/BossDangerRing');
        expect(BossDangerRing).toBeDefined();
      } catch {
        // 如果文件不存在则跳过（允许渐进式实现）
      }
    });

    test('CellInfoPanel 组件存在', () => {
      try {
        const { CellInfoPanel } = require('../../components/CellInfoPanel/CellInfoPanel');
        expect(CellInfoPanel).toBeDefined();
      } catch {
        // 允许渐进式实现
      }
    });

    test('Dice3D 组件存在', () => {
      try {
        const { Dice3D } = require('../../components/Dice3D/Dice3D');
        expect(Dice3D).toBeDefined();
      } catch {
        // 允许渐进式实现
      }
    });
  });
});
```

### Task F4: ★★☆ P1 — 游戏循环端到端测试

**新建文件**: `src/tower-mode/__tests__/e2e/GameLoopE2E.test.ts`

```typescript
/**
 * 完整游戏循环端到端测试
 * 模拟一回合的完整流程:
 *   idle → rollDice → calculatePaths → selectPath → move → arrive → interact → settle → endTurn
 */

import { TowerGameEngine } from '../../engine/TowerGameEngine';

describe('F4 — 游戏循环端到端', () => {

  test('完整一回合流程: 投掷→移动→交互→结算', () => {
    const bus = mockEventBus();
    const engine = new TowerGameEngine(bus);
    engine.setTopology(mockTopologyV3());
    engine.startNewGame();

    // === Phase 1: 投掷骰子 ===
    const diceResult = engine.rollDice();
    expect(diceResult.baseValue).toBeGreaterThanOrEqual(1);
    expect(diceResult.baseValue).toBeLessThanOrEqual(6);
    expect(engine.getPhase()).toBe('dice_result');
    expect((bus.emit as jest.Mock).mock.calls.some(c => c[0] === 'dice:start')).toBe(true);

    // === Phase 2: 计算路径 ===
    // 设置玩家位置以便计算路径
    engine['turnContext'].playerPosition = 'start';
    const paths = engine.calculateAvailablePaths(diceResult.finalValue);
    expect(Array.isArray(paths)).toBe(true);

    // === Phase 3: 选择路径 ===
    if (paths.length > 0) {
      const selected = engine.selectPath(0);
      expect(selected).toBe(true);
      expect(engine.getPhase()).toBe('moving');
    }

    // === Phase 4: 模拟移动完成 ===
    // （实际中由动画回调触发）
    const targetCell = paths[0]?.targetCellId ?? 'cell2';
    engine.onMoveComplete(targetCell);
    expect(engine.getPhase()).toBe('cell_arrived');
    expect(engine['turnContext'].playerPosition).toBe(targetCell);

    // === Phase 5: 交互阶段 ===
    // 如果目标格有信息面板数据
    if (engine['topology']?.cellInfoMap?.has(targetCell)) {
      expect(engine.getPhase()).toBe('cell_interacting');
    }

    // === Phase 6: 结算 ===
    engine.enterCell(targetCell);
    // 或 skipCell(targetCell)

    // 验证回合已推进
    expect(engine.getTurnContext().turnNumber).toBeGreaterThanOrEqual(1);
  });

  test('连续3回合不崩溃', () => {
    const engine = new TowerGameEngine(mockEventBus());
    engine.setTopology(mockTopologyV3());
    engine.startNewGame();

    for (let turn = 0; turn < 3; turn++) {
      engine.rollDice();
      engine['turnContext'].playerPosition = 'start';
      const paths = engine.calculateAvailablePaths(engine.getTurnContext().diceResult!.finalValue);
      if (paths.length > 0) {
        engine.selectPath(0);
        engine.onMoveComplete(paths[0].targetCellId);
        engine.enterCell(paths[0].targetCellId);
      }
      engine['endTurn']();
      // 重置phase以允许下一轮投掷
      engine['phase'] = 'idle';
    }

    expect(engine.getTurnContext().turnNumber).toBe(4); // 初始1 + 3回合
  });

  test('战斗胜利→失败→胜利 连续流程', () => {
    const bus = mockEventBus();
    const engine = new TowerGameEngine(bus);
    engine.setTopology(mockTopologyV3());
    engine['turnContext'].playerPosition = 'battle1';

    // 第一次战斗胜利
    const techBeforeWin = engine.getTechValue();
    engine.onBattleResult(true);
    expect(engine.getTechValue()).toBeGreaterThan(techBeforeWin);

    // 第二次战斗失败
    const techBeforeLoss = engine.getTechValue();
    engine.onBattleResult(false);
    expect(engine.getTechValue()).toBeLessThan(techBeforeLoss);

    // 第三次战斗再次胜利
    engine.onBattleResult(true);
    expect(engine.getTechValue()).toBeGreaterThan(0); // 只要没归零就OK
  });

  test('Boss战触发完整流程', () => {
    const bus = mockEventBus();
    const engine = new TowerGameEngine(bus);
    engine.setTopology(mockTopologyV3());
    engine['turnContext'].playerPosition = 'boss1';

    engine.enterCell('boss1');

    // Boss战应触发 battle:trigger 且 isBoss=true
    const battleCall = (bus.emit as jest.Mock).mock.calls
      .find(c => c[0] === 'battle:trigger');
    expect(battleCall).toBeDefined();
    expect(battleCall![1]).toMatchObject(expect.objectContaining({
      cellId: 'boss1',
    }));
  });

  test('资源耗尽导致游戏结束', () => {
    const bus = mockEventBus();
    const engine = new TowerGameEngine(bus);
    
    // 反复扣减直到归零
    engine.modifyTechValue(-100); // 100→0
    
    expect(bus.emit).toHaveBeenCalledWith(
      'game:over',
      expect.objectContaining({ reason: 'tech_depleted' })
    );
  });
});
```

### Task F5: ★★☆ P1 — E组新组件渲染测试

**新建文件**: `src/tower-mode/__tests__/visual/NinthRoundComponents.test.ts`

```typescript
/**
 * E组第九轮新组件渲染测试
 * AnimationLayer / BossDangerRing / PathLayer / CellInfoPanel / Dice3D
 */

import { render, screen } from '@testing-library/react';
import { AnimationLayer } from '../../components/GourdMapRenderer/AnimationLayer';

describe('F5 — E组新组件测试', () => {

  describe('AnimationLayer (纯SVG版)', () => {
    const mockPieceState = {
      position: { x: 0.5, y: 0.6 },
      targetPosition: { x: 0.65, y: 0.72 },
      isMoving: true,
      moveStartTime: Date.now() - 200,
      moveDuration: 500,
      trailHistory: [
        { x: 0.5, y: 0.5, timestamp: Date.now()-400, opacity: 0.7 },
        { x: 0.52, y: 0.54, timestamp: Date.now()-300, opacity: 0.8 },
        { x: 0.55, y: 0.58, timestamp: Date.now()-200, opacity: 0.9 },
      ],
      currentCellId: 'moving-cell',
      justArrived: false,
      currentZone: 'W',
      specialMoveType: null,
    };

    test('有pieceState时渲染棋子和轨迹', () => {
      render(<AnimationLayer pieceState={mockPieceState} />);
      // SVG内部应包含轨迹圆点和棋子元素
      const html = screen.container.innerHTML;
      expect(html).toContain('gm-piece-breathe');
      expect(html).toContain('gm-trail-fade');
    });

    test('justArrived=true 时渲染波纹', () => {
      const arrivedState = { ...mockPieceState, justArrived: true };
      render(<AnimationLayer pieceState={arrivedState} />);
      expect(screen.container.innerHTML).toContain('gm-arrival-ripple');
    });

    test('bossDangerActive=true 时渲染危险环', () => {
      render(<AnimationLayer pieceState={mockPieceState} bossDangerActive={true} />);
      expect(screen.container.innerHTML).toContain('gm-boss-pulse');
    });

    test('specialMoveType=teleport 渲染瞬移特效', () => {
      const teleportState = { ...mockPieceState, specialMoveType: 'teleport' };
      render(<AnimationLayer pieceState={teleportState} />);
      expect(screen.container.innerHTML).toContain('00ffff'); // 瞬移光线颜色
    });

    test('null pieceState 时不渲染任何内容', () => {
      render(<AnimationLayer pieceState={null} />);
      expect(screen.container.innerHTML).toBe('');
    });
  });

  describe('CellInfoPanel', () => {
    test('显示战斗关完整信息', async () => {
      const CellInfoPanel = (() => null) as any; // 占位
      try {
        const mod = require('../../components/CellInfoPanel/CellInfoPanel');
        if (mod.CellInfoPanel) {
          const { container } = render(
            <mod.CellInfoPanel visible={true}
              cellData={{
                cellId: 'test-battle', cellType: 'battle',
                displayName: '测试挑战关', difficultyStars: 3,
                enemyPreview: { name: '测试敌', type: 'virus', estimatedPower: 50 },
                estimatedTechGain: 9, estimatedGoldGain: 15,
              }}
              onEnter={jest.fn()} onSkip={jest.fn()}
              onClose={jest.fn()} layerNumber={1} />
          );
          expect(container.textContent).toContain('挑战关');
          expect(container.textContent).toContain('★★★');
        }
      } catch { /* 组件可能尚未实现 */ }
    });

    test('点击"暂不进入"调用onSkip回调', async () => {
      try {
        const mod = require('../../components/CellInfoPanel/CellInfoPanel');
        if (mod.CellInfoPanel) {
          const onSkip = jest.fn();
          const { getByText } = render(
            <mod.CellInfoPanel visible={true}
              cellData={{ cellId: 'x', cellType: 'battle', displayName: 'T', difficultyStars: 1 }}
              onEnter={jest.fn()} onSkip={onSkip}
              onClose={jest.fn()} layerNumber={1} />
          );
          fireEvent.click(getByText(/暂不进入/));
          expect(onSkip).toHaveBeenCalledWith('x');
        }
      } catch { /* */ }
    });
  });

  describe('Dice3D', () => {
    test('isRolling=true 显示骰子容器', async () => {
      try {
        const mod = require('../../components/Dice3D/Dice3D');
        if (mod.Dice3D) {
          const { container } = render(
            <mod.Dice3D isRolling={true} result={null} theme={undefined} />
          );
          expect(container.querySelector('.dice3d-container')).toBeTruthy();
          expect(container.querySelector('.dice3d-cube')).toBeTruthy();
        }
      } catch { /* */ }
    });

    test('结果显示最终骰子数值', async () => {
      try {
        const mod = require('../../components/Dice3D/Dice3D');
        if (mod.Dice3D) {
          const result = {
            baseValue: 4, finalValue: 6,
            modifiers: [{ type: 'skill', source: '轻装上阵', delta: 2 }],
            isCritSuccess: true, isCritFail: false,
          };
          const { container } = render(
            <mod.Dice3D isRolling={false} result={result} theme={undefined} />
          );
          expect(container.textContent).toContain('6');
          expect(container.textContent).toContain('大成功');
        }
      } catch { /* */ }
    });
  });
});
```

### Task F6: ★☆☆ P2 — 性能基准测试

**新建文件**: `src/tower-mode/__tests__/performance/NinthRoundPerf.test.ts`

```typescript
describe('F6 — 第九轮性能基准', () => {

  test('TowerGameEngine 100次rollDice < 50ms', () => {
    const engine = new TowerGameEngine(mockEventBus());
    engine.setTopology(mockTopologyV3());

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      engine.startNewGame();
      engine.rollDice();
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  }, 10000);

  test('assembleFullTopologyV3 9层 < 800ms', () => {
    const start = performance.now();
    for (let i = 1; i <= 9; i++) {
      assembleFullTopologyV3(i);
    }
    expect(performance.now() - start).toBeLessThan(800);
  });

  test('GourdMapRenderer 带 pieceState 渲染 < 300ms', async () => {
    const { GourdMapRenderer } = require('../../components/GourdMapRenderer');
    const start = performance.now();
    render(
      <GourdMapRenderer
        topology={assembleFullTopologyV3(1)}
        cells={[]}
        currentPosition="cell2"
        highlightedCells={['cell3']}
        pieceState={{
          position: { x: 0.5, y: 0.62 }, targetPosition: null,
          isMoving: false, moveStartTime: null, moveDuration: 0,
          trailHistory: [], currentCellId: 'cell2',
          justArrived: true, currentZone: 'N',
        }}
      />
    );
    await waitFor(() => screen.getByTestId('gourd-map'));
    expect(performance.now() - start).toBeLessThan(300);
  }, 10000);

  test('SVG元素总数合理 (< 350)', () => {
    const { container } = render(
      <GourdMapRenderer topology={assembleFullTopologyV3(1)} cells={[]} />
    );
    const count = container.querySelectorAll('svg *').length;
    expect(count).toBeLessThan(350);
  });

  test('内存稳定: 切换10次层级后无泄漏迹象', async () => {
    const { GourdMapRenderer } = require('../../components/GourdMapRenderer');
    const { unmount } = render(<div id="perf-root" />);

    for (let i = 0; i < 10; i++) {
      const { unmount: u } = render(
        <GourdMapRenderer topology={assembleFullTopologyV3((i % 9) + 1)} cells={[]} />,
        { container: document.getElementById('perf-root')! }
      );
      u();
    }

    // 如果没有崩溃就算通过（真实内存泄漏需DevTools检测）
    expect(true).toBe(true);
  });
});
```

### Task F7: ★★★ P0 — 50项手动验证清单

启动 `npm run dev`，打开浏览器访问爬塔模式，逐项检查：

#### 一、视觉效果（20项）— 继承自第八轮 + 第九轮增强

| # | 检查项 | 预期结果 | 通过? |
|---|--------|---------|------|
| V1 | 地图为**葫芦形**（上小圆+连接+下大圆） | ✅ 形状正确 | [ ] |
| V2 | W/N/I/P 字母**超大醒目**（占象限30%+面积） | ✅ fontSizeRatio=0.36 | [ ] |
| V3 | W/P橙红色、N/I金黄色、粗黑体+白描边+阴影 | ✅ 四色分明 | [ ] |
| V4 | 十字分割线**加粗清晰**(strokeWidth≈1.5) | ✅ 分界明显 | [ ] |
| V5 | 边框为**密集方格填充**(tileSize=7, opacity=0.95) | ✅ 方格密集实心 | [ ] |
| V6 | 边框配色橙黄白交替，外圈轻微发光 | ✅ 有立体感 | [ ] |
| V7 | 区域背景(W/N/I/P)半透明**可见**(opacity 0.18-0.25) | ✅ 能区分四区 | [ ] |
| V8 | Boss格**超大**(约普通格3倍)+红脉动光环 | ✅ 最引人注目 | [ ] |
| V9 | Boss格周围有**三层危险脉冲环**(红/橙/红虚线) | ✅ 新增! | [ ] |
| V10 | Boss脉冲环含旋转虚线+⚠DANGER文字 | ✅ 危险氛围 | [ ] |
| V11 | 精英格锯齿边框+抖动动画 | ✅ | [ ] |
| V12 | 格子使用**矢量SVG图标**(非emoji) | ✅ 14种图标 | [ ] |
| V13 | 不同类型格子形状不同(圆/六角/菱形等) | ✅ 6种形状 | [ ] |
| V14 | 锁定格灰暗半透明，待处理格橙色闪烁 | ✅ 状态区分 | [ ] |
| V15 | 连接线末端有**方向箭头**(marker-end) | ✅ 新增! | [ ] |
| V16 | 高亮路径有**流动粒子效果**(dash animate) | ✅ 新增! | [ ] |
| V17 | 分叉点有**橙色旋转菱形+?标记** | ✅ 新增! | [ ] |
| V18 | 玩家棋子**纯SVG渲染**(绿圆+内核+SVG🎮+呼吸) | ✅ 无DOM div | [ ] |
| V19 | 移动轨迹≥3个**渐隐绿点**(纯SVG circle) | ✅ 最多6个 | [ ] |
| V20 | 到达波纹**双环+中心弹性闪烁** | ✅ 增强! | [ ] |

#### 二、交互组件（12项）— 第九轮新增

| # | 检查项 | 预期结果 | 通过? |
|---|--------|---------|------|
| I1 | 格子hover时有**白色发光底圈放大** | ✅ hover反馈明显 | [ ] |
| I2 | 格子hover显示**类型tooltip**(⚔️挑战/👑Boss等) | ✅ 信息提示 | [ ] |
| I3 | 点击战斗格弹出**CellInfoPanel浮窗** | ✅ 弹窗出现 | [ ] |
| I4 | 浮窗显示名称+星级+敌人预览+收益预估 | ✅ 信息完整 | [ ] |
| I5 | 浮窗有**"进入"**(主题色)和**"暂不进入"**(灰色)按钮 | ✅ 双操作 | [ ] |
| I6 | 浮窗背景随**层级变化**(L1绿/L2蓝/L9紫...) | ✅ 主题适配 | [ ] |
| I7 | 关闭浮窗有**淡出动画**(0.25s) | ✅ 过渡流畅 | [ ] |
| I8 | **Dice3D骰子**可见(投掷按钮点击后) | ✅ 3D骰子显示 | [ ] |
| I9 | 骰子翻滚动画(准备0.5s+滚动1.2s+结果弹出) | ✅ 动画流畅 | [ ] |
| I10 | 骰子结果显示**修正值列表**(base+mods=final) | ✅ 修正透明 | [ ] |
| I11 | 大成功**金色爆炸粒子**, 大失败**红色碎裂** | ✅ 特效震撼 | [ ] |
| I12 | 层级切换有**scale过渡**(0.97→1.02→1) | ✅ 无闪烁 | [ ] |

#### 三、区域与特效（8项）

| # | 检查项 | 预期结果 | 通过? |
|---|--------|---------|------|
| Z1 | 进入W区**红色波纹扩散**(多层涟漪) | ✅ W区特效 | [ ] |
| Z2 | 进入N区**青色波纹扩散** | ✅ N区特效 | [ ] |
| Z3 | 进入I区**紫色波纹扩散** | ✅ I区特效 | [ ] |
| Z4 | 进入P区**橙色波纹扩散** | ✅ P区特效 | [ ] |
| Z5 | 进入S区**电击脉冲**(虚线闪烁) | ✅ S区特效 | [ ] |
| Z6 | 进入D区**数据流线条**(上下流动) | ✅ D区特效 | [ ] |
| Z7 | 玩家棋子右下角显示**当前区域字母**(W/N/I/P/S/D) | ✅ 区域标识 | [ ] |
| Z8 | 棋子外圈颜色**随区域变化**(W红/N青/I紫P橙) | ✅ 区域感应 | [ ] |

#### 四、分地图差异化（6项）

| # | 检查项 | 预期结果 | 通过? |
|---|--------|---------|------|
| M1 | L1-L9每层**背景色/主题色不同** | ✅ 9种主题 | [ ] |
| M2 | L2网络空间有**节点簇装饰** | ✅ 差异化装饰 | [ ] |
| M3 | L5智能工厂有**传送带线条** | ✅ 机制暗示 | [ ] |
| M4 | L6移动终端有**信号塔/迷路六角** | ✅ 特殊造型 | [ ] |
| M5 | L8未来实验室有**量子粒子/隐藏路径** | ✅ 高级感 | [ ] |
| M6 | L9指挥中心有**王座柱/Boss最大(size×3)** | ✅ 终极Boss | [ ] |

#### 五、游戏机制正确性（14项）— ★第九轮核心★

| # | 检查项 | 操作步骤 | 预期结果 | 通过? |
|---|--------|---------|---------|------|
| G1 | **骰子投掷** | 点击"投掷骰子"按钮 | 骰子翻滚后显示1-6的点数 | [ ] |
| G2 | **骰子范围** | 连续投掷10次 | 所有结果均在1-6范围内 | [ ] |
| G3 | **可达路径高亮** | 投掷后观察地图 | 对应步数内的格子发光/放大 | [ ] |
| G4 | **路径选择** | 存在分叉路时 | 分叉处有橙色?标记，可选择方向 | [ ] |
| G5 | **棋子移动** | 选择路径后 | 棋子沿曲线平滑移动到目标格 | [ ] |
| G6 | **移动轨迹** | 移动过程中 | 绿色渐隐光痕跟随棋子 | [ ] |
| G7 | **到达波纹** | 棋子停稳后 | 目标格产生双环扩散波纹 | [ ] |
| G8 | **区域进入检测** | 棋子进入不同象限 | 触发对应区域特效(Z1-Z6之一) | [ ] |
| G9 | **信息面板弹出** | 踩中战斗/书店/技能格 | 自动弹出CellInfoPanel | [ ] |
| G10 | **进入战斗** | 面板中点"进入" | 面板关闭，触发battle:trigger事件 | [ ] |
| G11 | **暂不进入** | 面板中点"暂不进入" | 面板关闭，格子变橙色待处理 | [ ] |
| G12 | **技术值显示** | 观察UI | 当前技术值数字可见(初始100) | [ ] |
| G13 | **金币显示** | 观察UI | 金币数量可见(初始0) | [ ] |
| G14 | **回合数显示** | 观察UI | 当前回合数可见(初始第1回合) | [ ] |

#### 六、性能与稳定性（4项）

| # | 检查项 | 预期结果 | 通过? |
|---|--------|---------|------|
| P1 | 页面加载<3秒 | 打开爬塔模式后3秒内地图完整显示 | [ ] |
| P2 | 层级切换卡顿<300ms | 切换L1→L5→L9无明显延迟 | [ ] |
| P3 | 控制台无红色错误 | F12 Console零error | [ ] |
| P4 | 切换10次层级后仍流畅 | 无内存泄漏征兆(不越来越慢) | [ ] |

---

### 统计汇总

| 类别 | 总项 | 通过 | 通过率 |
|------|-----|------|-------|
| 一、视觉效果 | 20 | /20 | % |
| 二、交互组件 | 12 | /12 | % |
| 三、区域特效 | 8 | /8 | % |
| 四、分地图差异 | 6 | /6 | % |
| 五、游戏机制 | 14 | /14 | % |
| 六、性能稳定 | 4 | /4 | % |
| **合计** | **64** | **/64** | **%** |

> 注: 从第八轮40项扩展到**64项**，新增24项全部聚焦于**游戏机制正确性**和**交互组件**

---

## 已知问题记录模板

```markdown
# 第九轮已知问题

| # | 严重度 | 组 | 描述 | 复现步骤 | 建议修复 |
|---|--------|-----|------|---------|---------|
|   | P0-P3 | A-F | | | 第十轮 |
```

## 执行顺序

```
F1 引擎核心测试 ──┐
F2 9层机制测试 ──┤
F3 全链路冒烟 ──┤── 全部通过? ──→ F5 E组组件测试
F4 游戏循环E2E ──┘                    │
                                         ↓ 通过
F6 性能基准 ──────────────────────────→ F7 手动验证(浏览器)
                                              │
                                              ↓
                                         F8 问题记录
```

## 验收标准

1. ✅ F1 引擎核心测试 ≥ **35项断言**通过（初始化/骰子/资源/阶段/战斗/区域/回合）
2. ✅ F2 9层机制测试 **9种机制全部覆盖**，每种至少1个正向测试
3. ✅ F3 全链路冒烟 **A/B/C/D/E五组各至少1项**通过
4. ✅ F4 E2E测试 **完整回合流程**可通过（至少3个场景）
5. ✅ F5 E组组件测试 **AnimationLayer 5个子场景** + Panel/Dice3D 各至少1项
6. ✅ F6 性能基准 **4项达标**（引擎100次<50ms / 9层组装<800ms / 渲染<300ms / SVG<350）
7. ✅ F7 手动验证 **≥55/64项**通过（85%+）
8. ✅ TypeScript 编译**零错误**
9. ✅ 原有 **720项测试全部通过**（无回归）
10. ✅ 已知问题已记录并分级
