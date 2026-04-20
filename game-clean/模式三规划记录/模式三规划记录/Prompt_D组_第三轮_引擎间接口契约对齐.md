# D组 第三轮操作，核心主题：引擎间接口契约对齐与集成测试打通

## 📊 当前开发状态

**完成度：96% ✅ 引擎功能完整，类型导入已修复**

### 已有成果
- ✅ `CellStateMachine.ts` — 已从 `../types` 导入，6态转换完整
- ✅ `ZoneEffectManager.ts` — 已从 `../types` + `../constants` 导入，6种效果完整
- ✅ `MovementEngine.ts` — 已从 `../types` 导入，BFS寻路完整
- ✅ 140个单元测试全部通过
- ✅ `MovementEngineState` 接口在引擎内定义（合理，属于内部状态）

### 🔴 仍存在的问题

#### 问题1：MovementEngine 与 ZoneEffectManager 的交互接口未对齐
`MovementEngine` 构造函数接收 `ZoneEffectManager` 实例，但实际调用时：
- `rollDice()` 是否正确调用了 `zoneManager.getDiceModifier()`？
- `executeMove()` 途经区域时是否触发了 `zoneManager.applyEffectsOnEnter()`？

#### 问题2：CellStateMachine 与 CellActionExecutor 的分发接口未对齐
`CellStateMachine` 有 `CellTypeDispatcher` 进行类型分发，但 `CellActionExecutor` 也有自己的分发逻辑。两者如何协调？
- 应该是：M06 分发 → 判断类型 → M09 执行具体逻辑
- 当前：M06 和 M09 各自独立，缺少明确的调用链

#### 问题3：引擎间缺少集成测试
虽然有140个单元测试，但没有跨引擎的集成测试（如：移动→触发区域→状态变更→执行格子的完整链路）。

---

## 🎯 本轮任务

### 任务1：定义并实现引擎间调用契约

创建文件 `engine/engineContracts.ts`，明确定义引擎间的调用接口：

```typescript
/**
 * 引擎间调用契约
 * 定义一个引擎调用另一个引擎时的参数和返回值类型
 */

// MovementEngine → ZoneEffectManager
export interface MovementZoneContract {
  getDiceModifier(position: Coordinate2D, layerData: TowerLayerData): number;
  applyEffectsOnEnter(
    position: Coordinate2D,
    layerData: TowerLayerData,
    turnNumber: number,
    context: ZoneEffectContext
  ): ZoneApplicationResult;
}

// MovementEngine → CellStateMachine
export interface MovementCellContract {
  handlePlayerEnter(cellId: string, context: CellTriggerContext): StateTransitionResult[];
  handlePlayerExit(cellId: string): StateTransitionResult;
  getState(cellId: string): CellState;
}

// CellActionExecutor → RewardSystem
export interface ExecutionRewardContract {
  grantBattleReward(levelId: string, victory: boolean): Promise<BattleRewardResult>;
  grantDataPacket(packet: DataPacket, source: RewardSource): Promise<GrantResult<DataPacket>>;
  grantBook(book: Book, source: RewardSource): Promise<GrantResult<Book>>;
  grantSkill(skill: Skill, source: RewardSource, replaceSlotIndex?: number): Promise<GrantResult<Skill>>;
}

// CellActionExecutor → ProgressManager
export interface ExecutionProgressContract {
  recordBattle(result: BattleActionResult): void;
  recordBossDefeat(layerNumber: number, packets: DataPacket[]): void;
  recordLayerComplete(layerNumber: number): void;
  recordZoneTrigger(zoneType: ZoneType): void;
  recordRewardAcquired(source: RewardSource, item: GrantedItem): void;
}
```

### 任务2：验证 MovementEngine 的区域效果调用

检查 `MovementEngine.rollDice()` 和 `executeMove()` 中是否正确调用了 `ZoneEffectManager`：

```typescript
// rollDice() 中应有类似逻辑：
rollDice(): DiceRollResult {
  const rawValue = this.diceSystem.roll();
  const zoneModifier = this.zoneManager?.getDiceModifier(
    this.state.currentPosition,
    this.layerData!
  ) ?? 0;
  return this.diceSystem.applyModifiers(rawValue, [
    { source: 'zone', delta: zoneModifier, description: '区域效果' }
  ]);
}

// executeMove() 到达目标后应有类似逻辑：
const zoneResult = this.zoneManager?.applyEffectsOnEnter(
  targetCoord,
  this.layerData!,
  this.state.turnNumber,
  zoneContext
);
```

如果缺失，补充这些调用。

### 任务3：编写跨引擎集成测试

创建 `engine/__tests__/engineIntegration.test.ts`：

```typescript
describe('引擎集成测试', () => {
  it('移动→区域效果→状态变更 完整链路', async () => {
    const zoneManager = new ZoneEffectManager(zones, ZONE_EFFECT_CONFIG);
    const cellStateMachine = new CellStateMachine(cells);
    const movementEngine = new MovementEngine(zoneManager);
    movementEngine.loadLayerData(layerData);
    movementEngine.setStartPosition('R0C0');

    // 投骰
    const diceResult = movementEngine.rollDice();
    expect(diceResult.modifiedValue).toBeGreaterThan(0);

    // 获取可移动选项
    const options = movementEngine.getMoveOptions(diceResult.modifiedValue);
    expect(options.length).toBeGreaterThan(0);

    // 移动到目标
    const moveResult = await movementEngine.executeMove(options[0].targetCell.id);
    expect(moveResult.success).toBe(true);

    // 验证状态变更
    const newState = cellStateMachine.getState(options[0].targetCell.id);
    expect(['current', 'visited']).toContain(newState);
  });

  it('W区效果应减少骰子值', () => {
    // 设置玩家在W区
    // 投骰
    // 验证 modifiedValue < rawValue
  });

  it('战斗完成→奖励发放→进度记录 链路', async () => {
    // 模拟战斗胜利
    cellStateMachine.handleBattleComplete('R1C1', true);
    // 验证状态变为 completed
    // 验证奖励已发放
    // 验证进度已记录
  });
});
```

### 任务4：运行全部测试

```bash
cd game-temp && npx vitest run src/tower-mode/engine/__tests__/
```

确保原有140个单测 + 新增集成测试全部通过。

---

## ✅ 完成标准

- [ ] 引擎间调用契约文件创建完成
- [ ] MovementEngine 正确调用 ZoneEffectManager
- [ ] 跨引擎集成测试至少3个场景通过
- [ ] 原有140个单元测试仍全部通过
- [ ] TypeScript 编译零错误
