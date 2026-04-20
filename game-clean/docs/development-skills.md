# 开发流程技能手册

## 目录

1. [代码开发技能](#一代码开发技能)
2. [调试排查技能](#二调试排查技能)
3. [数据配置技能](#三数据配置技能)
4. [UI开发技能](#四ui开发技能)
5. [游戏逻辑开发技能](#五游戏逻辑开发技能)
6. [关卡设计标准模板](#六关卡设计标准模板)

---

## 一、代码开发技能

### 1.1 代码规范和命名约定

#### TypeScript类型定义规范

**基本原则**:
- 所有接口和类型定义必须以大写字母开头
- 使用描述性名称，避免缩写
- 复杂类型应拆分为多个小类型

**示例**:
```typescript
// ✅ 好的实践
interface PlayerCardProgress {
  unlockedCards: CardUnlockStatus[];
  totalCards: number;
  playerDeck: PlayerDeckConfig | null;
  version: number;
}

interface CardUnlockStatus {
  cardCode: string;
  isUnlocked: boolean;
  unlockedAt: number;
  unlockedByLevel: string;
}

// ❌ 避免的做法
interface PlayerData {
  cards: any[];  // 避免使用any
  total: number;
  deck: object;  // 使用具体类型而非object
}
```

**枚举定义规范**:
```typescript
// 使用const enum提高性能
export const enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

// 使用as const确保类型安全
export const RARITY_COLORS = {
  [CardRarity.COMMON]: '#9ca3af',
  [CardRarity.UNCOMMON]: '#22c55e',
  [CardRarity.RARE]: '#3b82f6',
  [CardRarity.EPIC]: '#a855f7',
  [CardRarity.LEGENDARY]: '#eab308',
} as const;
```

#### 组件命名规范

**文件命名**:
- 组件文件使用 PascalCase: `LevelGameInterface.tsx`
- 工具文件使用 camelCase: `playerCardProgressManager.ts`
- 类型文件使用 camelCase: `levelTypes.ts`

**组件命名**:
```typescript
// ✅ 好的实践
export function LevelGameInterface({ levelId }: LevelGameInterfaceProps) {
  // ...
}

export function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  // ...
}

// ❌ 避免的做法
export function game_interface() {  // 使用小写
  // ...
}

export function Card() {  // 过于简单，容易冲突
  // ...
}
```

#### 函数和变量命名规范

**函数命名**:
- 使用动词开头: `handleAddCard`, `validateDeck`, `processTurn`
- 事件处理函数使用handle前缀: `handleClick`, `handleSubmit`
- 获取数据函数使用get前缀: `getCardByCode`, `getUnlockedCardCodes`
- 布尔函数使用is/has前缀: `isCardUnlocked`, `hasPlayerDeck`

**变量命名**:
```typescript
// ✅ 好的实践
const currentDeck: PlayerDeckConfig = { ... };
const unlockedCardCodes: string[] = [];
const isValidationPassed = true;

// ❌ 避免的做法
const cd = { ... };  // 缩写不清晰
const cards = [];  // 过于简单
const flag = true;  // 含义不明确
```

### 1.2 设计模式应用

#### 状态管理模式

使用React Context + useReducer管理全局状态:

```typescript
// 定义State和Action类型
interface GameState {
  currentLevel: LevelDefinition | null;
  playerState: PlayerState;
  areaControl: AreaControlState;
  enemies: EnemyState[];
}

type GameAction =
  | { type: 'START_LEVEL'; payload: LevelDefinition }
  | { type: 'UPDATE_PLAYER_STATE'; payload: Partial<PlayerState> }
  | { type: 'UPDATE_AREA_CONTROL'; payload: AreaControlState }
  | { type: 'END_TURN' };

// Reducer实现
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_LEVEL':
      return { ...state, currentLevel: action.payload };
    case 'UPDATE_PLAYER_STATE':
      return { ...state, playerState: { ...state.playerState, ...action.payload } };
    default:
      return state;
  }
}

// Context创建
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);
```

#### 策略模式在AI中的应用

```typescript
// 定义策略接口
interface EnemyStrategy {
  execute(enemy: EnemyState, gameState: GameState): Promise<ActionResult>;
}

// 具体策略实现
class DisruptStrategy implements EnemyStrategy {
  async execute(enemy: EnemyState, gameState: GameState): Promise<ActionResult> {
    // 干扰策略：使用技能、放置标记
    const skill = this.selectAvailableSkill(enemy);
    if (skill) {
      return await this.useSkill(skill, enemy, gameState);
    }
    return await this.placeMarker(enemy, gameState);
  }
}

class AggressiveStrategy implements EnemyStrategy {
  async execute(enemy: EnemyState, gameState: GameState): Promise<ActionResult> {
    // 激进策略：集中攻击
    return await this.attackPlayer(enemy, gameState);
  }
}

// 策略上下文
class EnemyAI {
  private strategies: Map<string, EnemyStrategy> = new Map();
  
  constructor() {
    this.strategies.set('disrupt', new DisruptStrategy());
    this.strategies.set('aggressive', new AggressiveStrategy());
    this.strategies.set('balanced', new BalancedStrategy());
  }
  
  async executeStrategy(strategyName: string, enemy: EnemyState, gameState: GameState) {
    const strategy = this.strategies.get(strategyName);
    if (strategy) {
      return await strategy.execute(enemy, gameState);
    }
  }
}
```

#### 观察者模式在事件系统中的应用

```typescript
// 事件类型定义
type GameEventType = 'TURN_START' | 'TURN_END' | 'CARD_PLAYED' | 'SKILL_USED';

interface GameEvent {
  type: GameEventType;
  payload: unknown;
  timestamp: number;
}

type EventHandler = (event: GameEvent) => void;

// 事件管理器
class EventManager {
  private listeners: Map<GameEventType, Set<EventHandler>> = new Map();
  
  subscribe(eventType: GameEventType, handler: EventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.get(eventType)?.delete(handler);
    };
  }
  
  emit(eventType: GameEventType, payload: unknown) {
    const event: GameEvent = {
      type: eventType,
      payload,
      timestamp: Date.now(),
    };
    
    this.listeners.get(eventType)?.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
      }
    });
  }
}

// 使用示例
const eventManager = new EventManager();

// 订阅事件
const unsubscribe = eventManager.subscribe('CARD_PLAYED', (event) => {
  console.log('Card played:', event.payload);
});

// 触发事件
eventManager.emit('CARD_PLAYED', { cardCode: 'NF0-1T1', player: 'player1' });
```

### 1.3 最佳实践

#### 错误处理规范

```typescript
// 使用Result类型处理操作结果
interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

// 示例：卡牌解锁操作
function unlockCard(cardCode: string, levelId: string): Result<CardUnlockStatus> {
  try {
    const progress = loadCardProgress();
    
    // 检查是否已解锁
    if (progress.unlockedCards.some(c => c.cardCode === cardCode)) {
      return { success: false, error: new Error('Card already unlocked') };
    }
    
    // 执行解锁
    const unlockStatus: CardUnlockStatus = {
      cardCode,
      isUnlocked: true,
      unlockedAt: Date.now(),
      unlockedByLevel: levelId,
    };
    
    progress.unlockedCards.push(unlockStatus);
    saveCardProgress(progress);
    
    return { success: true, data: unlockStatus };
  } catch (error) {
    console.error('Failed to unlock card:', error);
    return { success: false, error: error as Error };
  }
}

// 使用示例
const result = unlockCard('NF0-1T1', 'LV1');
if (result.success) {
  console.log('Card unlocked:', result.data);
} else {
  console.error('Failed to unlock:', result.error?.message);
}
```

#### 日志记录规范

```typescript
// 日志级别
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// 结构化日志
interface GameLog {
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

class GameLogger {
  private static instance: GameLogger;
  private logs: GameLog[] = [];
  
  static getInstance(): GameLogger {
    if (!GameLogger.instance) {
      GameLogger.instance = new GameLogger();
    }
    return GameLogger.instance;
  }
  
  log(level: LogLevel, category: string, message: string, data?: Record<string, unknown>) {
    const log: GameLog = {
      level,
      category,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    
    this.logs.push(log);
    
    // 控制台输出
    const consoleMethod = level === LogLevel.ERROR ? console.error :
                         level === LogLevel.WARN ? console.warn :
                         level === LogLevel.DEBUG ? console.debug : console.log;
    
    consoleMethod(`[${category}] ${message}`, data || '');
  }
  
  debug(category: string, message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, category, message, data);
  }
  
  info(category: string, message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.INFO, category, message, data);
  }
  
  warn(category: string, message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.WARN, category, message, data);
  }
  
  error(category: string, message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, category, message, data);
  }
  
  getLogs(): GameLog[] {
    return [...this.logs];
  }
  
  clearLogs() {
    this.logs = [];
  }
}

// 使用示例
const logger = GameLogger.getInstance();
logger.info('CardPlay', 'Player played card', { cardCode: 'NF0-1T1', area: 'internal' });
logger.error('SkillExecution', 'Failed to execute skill', { skillId: 'floppy_infection', error: 'Cooldown not ready' });
```

#### 性能优化技巧

**1. 使用useMemo缓存计算结果**

```typescript
// ✅ 好的实践
const deckStats = useMemo(() => getDeckStatistics(currentDeck), [currentDeck]);

// ❌ 避免的做法
const deckStats = getDeckStatistics(currentDeck); // 每次渲染都重新计算
```

**2. 使用useCallback缓存函数引用**

```typescript
// ✅ 好的实践
const handleAddCard = useCallback((cardCode: string) => {
  setCurrentDeck(prev => addCardToDeck(prev, cardCode));
}, []);

// ❌ 避免的做法
const handleAddCard = (cardCode: string) => { // 每次渲染都创建新函数
  setCurrentDeck(prev => addCardToDeck(prev, cardCode));
};
```

**3. 虚拟列表处理大量数据**

```typescript
import { FixedSizeList as List } from 'react-window';

// 当卡牌数量很多时使用虚拟列表
function CardList({ cards }: { cards: Card[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <CardItem card={cards[index]} />
    </div>
  );
  
  return (
    <List
      height={500}
      itemCount={cards.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

---

## 二、调试排查技能

### 2.1 日志分析方法

#### 游戏日志结构说明

```typescript
// 游戏日志条目结构
interface GameLogEntry {
  id: string;                    // 唯一标识
  timestamp: number;             // 时间戳
  turn: number;                  // 当前回合
  round: number;                 // 当前轮次
  phase: GamePhase;              // 当前阶段
  actor: string;                 // 行动者
  action: string;                // 行动类型
  target?: string;               // 目标
  result: string;                // 结果描述
  data?: Record<string, unknown>; // 附加数据
}

// 日志分类
enum LogCategory {
  PHASE_TRANSITION = 'PHASE',    // 阶段转换
  CARD_PLAY = 'CARD',            // 卡牌使用
  SKILL_USE = 'SKILL',           // 技能使用
  RESOURCE_CHANGE = 'RESOURCE',  // 资源变化
  AREA_CONTROL = 'AREA',         // 区域控制
  AI_DECISION = 'AI',            // AI决策
  ERROR = 'ERROR',               // 错误
}
```

#### 关键日志字段解释

| 字段 | 说明 | 示例 |
|------|------|------|
| `turn` | 当前回合数（1-40） | 5 |
| `round` | 当前轮次（1-10） | 2 |
| `phase` | 游戏阶段 | 'player_draw' |
| `actor` | 行动者 | 'player', 'dadong', 'elk_cloner' |
| `action` | 行动类型 | 'draw_card', 'play_card', 'use_skill' |
| `target` | 行动目标 | 'internal', 'industrial' |

#### 日志过滤和搜索技巧

```typescript
// 按类别过滤日志
function filterLogsByCategory(logs: GameLogEntry[], category: LogCategory): GameLogEntry[] {
  return logs.filter(log => log.action.startsWith(category));
}

// 按行动者过滤日志
function filterLogsByActor(logs: GameLogEntry[], actor: string): GameLogEntry[] {
  return logs.filter(log => log.actor === actor);
}

// 按回合范围过滤日志
function filterLogsByTurnRange(logs: GameLogEntry[], startTurn: number, endTurn: number): GameLogEntry[] {
  return logs.filter(log => log.turn >= startTurn && log.turn <= endTurn);
}

// 搜索特定关键词
function searchLogs(logs: GameLogEntry[], keyword: string): GameLogEntry[] {
  const lowerKeyword = keyword.toLowerCase();
  return logs.filter(log => 
    log.action.toLowerCase().includes(lowerKeyword) ||
    log.result.toLowerCase().includes(lowerKeyword) ||
    JSON.stringify(log.data).toLowerCase().includes(lowerKeyword)
  );
}

// 使用示例
const cardPlayLogs = filterLogsByCategory(allLogs, LogCategory.CARD_PLAY);
const playerLogs = filterLogsByActor(allLogs, 'player');
const errorLogs = searchLogs(allLogs, 'error');
```

### 2.2 常见问题解决方案

#### 黑屏问题排查

**症状**: 页面完全空白，控制台无错误

**排查步骤**:
1. 检查React渲染错误
   ```typescript
   // 在index.tsx中添加错误边界
   import { ErrorBoundary } from 'react-error-boundary';
   
   function ErrorFallback({ error }: { error: Error }) {
     return (
       <div role="alert">
         <p>应用发生错误:</p>
         <pre>{error.message}</pre>
         <pre>{error.stack}</pre>
       </div>
     );
   }
   
   root.render(
     <ErrorBoundary FallbackComponent={ErrorFallback}>
       <App />
     </ErrorBoundary>
   );
   ```

2. 检查路由配置
   ```typescript
   // 确保路由配置正确
   <Routes>
     <Route path="/" element={<Lobby />} />
     <Route path="/level/:levelId" element={<LevelGameInterface />} />
   </Routes>
   ```

3. 检查初始状态
   ```typescript
   // 确保初始状态不为null
   const [gameState, setGameState] = useState<GameState | null>(null);
   
   if (!gameState) {
     return <div>加载中...</div>; // 添加加载状态
   }
   ```

#### 阶段推进问题排查

**症状**: 游戏阶段不自动推进，或重复执行

**排查步骤**:
1. 检查阶段状态
   ```typescript
   // 在控制台查看当前阶段
   console.log('Current phase:', gameState.currentPhase);
   console.log('Phase history:', gameState.phaseHistory);
   ```

2. 检查阶段转换逻辑
   ```typescript
   // 确保阶段转换条件正确
   function shouldAdvancePhase(currentPhase: GamePhase, gameState: GameState): boolean {
     switch (currentPhase) {
       case 'player_draw':
         return gameState.playerState.hand.length >= 3; // 手牌已满
       case 'player_action':
         return gameState.playerState.actionPoints <= 0; // 行动点用完
       default:
         return false;
     }
   }
   ```

3. 检查定时器
   ```typescript
   // 确保定时器正确清理
   useEffect(() => {
     const timer = setTimeout(() => {
       advancePhase();
     }, 2000);
     
     return () => clearTimeout(timer); // 清理函数
   }, [gameState.currentPhase]);
   ```

#### 卡牌效果不生效排查

**症状**: 使用卡牌后效果未执行

**排查步骤**:
1. 检查卡牌定义
   ```typescript
   // 确认卡牌在数据库中存在
   const card = getCardByCode('NF0-1T1');
   console.log('Card definition:', card);
   ```

2. 检查效果执行逻辑
   ```typescript
   // 在效果执行处添加日志
   function executeCardEffect(card: Card, target?: AreaType) {
     console.log(`Executing effect for ${card.name}`, { card, target });
     
     switch (card.card_code) {
       case 'NF0-1T1':
         console.log('Executing firewall deployment');
         // ...
         break;
       default:
         console.warn('Unknown card effect:', card.card_code);
     }
   }
   ```

3. 检查资源消耗
   ```typescript
   // 确保资源足够
   function canPlayCard(card: Card, playerState: PlayerState): boolean {
     const hasEnoughResources = 
       playerState.resources.compute >= (card.cost.compute || 0) &&
       playerState.resources.funds >= (card.cost.funds || 0) &&
       playerState.resources.information >= (card.cost.information || 0);
     
     console.log('Resource check:', { card: card.name, hasEnoughResources });
     return hasEnoughResources;
   }
   ```

#### AI行为异常排查

**症状**: AI不行动、重复使用技能或行为不符合预期

**排查步骤**:
1. 检查AI状态
   ```typescript
   // 查看AI当前状态
   console.log('Enemy state:', enemyState);
   console.log('Skill cooldowns:', enemyState.skillCooldowns);
   console.log('Action points:', enemyState.actionPoints);
   ```

2. 检查策略选择
   ```typescript
   // 在策略选择处添加日志
   function selectStrategy(enemy: EnemyState, gameState: GameState): string {
     const random = Math.random();
     let selectedStrategy: string;
     
     if (random < 0.4) {
       selectedStrategy = 'disrupt';
     } else if (random < 0.75) {
       selectedStrategy = 'balanced';
     } else {
       selectedStrategy = 'aggressive';
     }
     
     console.log(`Enemy ${enemy.name} selected strategy:`, selectedStrategy);
     return selectedStrategy;
   }
   ```

3. 检查技能触发
   ```typescript
   // 在技能触发处添加日志
   function shouldTriggerSkill(skill: EnemySkill, enemyState: EnemyState): boolean {
     const currentCooldown = enemyState.skillCooldowns?.[skill.id] || 0;
     const shouldTrigger = skill.type === 'active' && currentCooldown <= 0;
     
     console.log(`Skill ${skill.name} trigger check:`, {
       cooldown: currentCooldown,
       shouldTrigger,
     });
     
     return shouldTrigger;
   }
   ```

### 2.3 调试工具使用

#### 浏览器开发者工具

**1. React DevTools**
- 安装React DevTools浏览器扩展
- 使用Components面板查看组件树
- 使用Profiler面板分析性能

**2. Redux DevTools** (如果使用Redux)
- 查看状态变化历史
- 时间旅行调试
- 导出/导入状态

**3. 网络面板**
- 检查API请求
- 查看响应数据
- 模拟慢速网络

#### React DevTools使用

```typescript
// 为组件添加displayName便于调试
const LevelGameInterface = ({ levelId }: LevelGameInterfaceProps) => {
  // ...
};
LevelGameInterface.displayName = 'LevelGameInterface';

// 使用useDebugValue在DevTools中显示自定义值
function useGameState() {
  const [state, setState] = useState<GameState>(initialState);
  
  useDebugValue(state, state => {
    return `Turn: ${state.currentTurn}, Phase: ${state.currentPhase}`;
  });
  
  return [state, setState];
}
```

#### 状态检查方法

```typescript
// 在控制台暴露状态供调试
if (process.env.NODE_ENV === 'development') {
  (window as any).gameState = gameState;
  (window as any).checkState = () => {
    console.log('Current game state:', gameState);
    console.log('Player state:', gameState.playerState);
    console.log('Area control:', gameState.areaControl);
    console.log('Enemies:', gameState.enemies);
  };
}

// 然后在浏览器控制台使用
checkState(); // 查看完整状态
gameState.playerState.securityLevel; // 查看特定值
```

---

## 三、数据配置技能

### 3.1 关卡数据配置

#### levelDatabase.ts配置说明

```typescript
// 关卡定义接口
interface LevelDefinition {
  id: LevelId;                    // 关卡唯一标识
  name: string;                   // 关卡名称
  subtitle: string;               // 副标题
  difficulty: number;             // 难度等级（1-5）
  tutorialFocus: TutorialFocus;   // 教学重点
  maxTurns: number;               // 最大回合数
  initialSetup: InitialSetup;     // 初始设置
  enemies: EnemyConfig[];         // 敌人配置
  objectives: LevelObjective[];   // 目标列表
  failureConditions: FailureCondition[]; // 失败条件
  rewards: LevelRewards;          // 通关奖励
}

// 配置示例
export const LEVEL1_CONFIG: LevelDefinition = {
  id: 'LV1',
  name: '病毒初现',
  subtitle: '认识计算机病毒',
  difficulty: 1,
  tutorialFocus: 'basic_defense',
  maxTurns: 10,
  initialSetup: {
    playerResources: { computing: 2, funds: 2, information: 2 },
    playerSecurityLevel: 50,
    controlledAreas: ['internal', 'industrial', 'external'],
    areaMarkers: {
      internal: { defense: 2, attack: 1 },
      industrial: { defense: 2, attack: 0 },
      dmz: { defense: 1, attack: 1 },
      external: { defense: 1, attack: 0 },
    },
  },
  enemies: LEVEL1_ENEMIES,
  objectives: [
    {
      id: 'clear_virus',
      description: '清除病毒：所有区域敌方标记总数降至0',
      type: 'defeat_enemies',
      targetValue: 0,
    },
  ],
  failureConditions: [
    {
      id: 'security_zero',
      description: '安全等级归零',
      check: (state) => state.playerState.securityLevel === 0,
    },
  ],
  rewards: {
    experience: 100,
    unlockedCards: ['LF1-1T1', 'LI1-1T1'],
    achievement: '病毒猎人入门',
    unlockLevel: 'LV2',
  },
};
```

#### 敌人配置（levelEnemies.ts）

```typescript
// 敌人配置接口
interface EnemyConfig {
  id: string;
  name: string;
  type: 'virus' | 'hacker' | 'ai';
  attackStyle: string;
  weakness: string;
  actionPoints: number;
  handSize: number;
  skills: EnemySkill[];
}

interface EnemySkill {
  id: string;
  name: string;
  type: 'active' | 'passive';
  description: string;
  effect: string;
  cooldown: number;
}

// 配置示例
export const LEVEL1_ENEMIES: EnemyConfig[] = [
  {
    id: 'elk_cloner',
    name: '埃尔克克隆者',
    type: 'virus',
    attackStyle: '潜伏复制、软盘感染',
    weakness: '签名接种、系统重写',
    actionPoints: 4,
    handSize: 2,
    skills: [
      {
        id: 'floppy_infection',
        name: '软盘感染',
        type: 'active',
        description: '在随机区域放置1个攻击标记',
        effect: '放置攻击标记',
        cooldown: 2,
      },
    ],
  },
];
```

#### 卡牌配置（cardDatabase.ts、levelCardDatabase.ts）

```typescript
// 卡牌定义接口
interface Card {
  card_code: string;
  name: string;
  description: string;
  type: CardType;
  faction: Faction;
  rarity: CardRarity;
  techLevel: TechLevel;
  cost: ResourceCost;
  difficulty: number;
  effects: CardEffect[];
}

// 基础卡牌配置
export const DEFENDER_T1_CARDS: Card[] = [
  {
    card_code: 'NF0-1T1',
    name: '防火墙部署',
    description: '消耗：算力1；效果：安全+1',
    type: 'basic_defense',
    faction: 'defense',
    rarity: 'common',
    techLevel: 1,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 0,
    effects: [{ type: 'security_gain', baseValue: 1 }],
  },
];

// 关卡专属卡牌配置
export const LEVEL1_CARDS: Card[] = [
  {
    card_code: 'LF1-1T1',
    name: '签名接种',
    description: '为目标区域添加"已接种"标记',
    type: 'basic_defense',
    faction: 'defense',
    rarity: 'rare',
    techLevel: 1,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 0,
    effects: [{ type: 'vaccinate', duration: 3 }],
  },
];
```

### 3.2 数据验证方法

#### 类型检查

```typescript
// 使用Zod进行运行时类型检查
import { z } from 'zod';

const CardSchema = z.object({
  card_code: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['basic_defense', 'intrusion_detection', 'active_defense', 'resource']),
  faction: z.enum(['defense', 'attack']),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  techLevel: z.number().min(1).max(5),
  cost: z.object({
    compute: z.number().default(0),
    funds: z.number().default(0),
    information: z.number().default(0),
  }),
  difficulty: z.number().min(0).max(6),
  effects: z.array(z.object({
    type: z.string(),
    baseValue: z.number().optional(),
    description: z.string().optional(),
  })),
});

// 验证函数
function validateCard(card: unknown): Card {
  return CardSchema.parse(card);
}

// 批量验证
function validateAllCards(cards: unknown[]): { valid: Card[]; invalid: unknown[] } {
  const valid: Card[] = [];
  const invalid: unknown[] = [];
  
  for (const card of cards) {
    try {
      valid.push(validateCard(card));
    } catch (error) {
      console.error('Invalid card:', card, error);
      invalid.push(card);
    }
  }
  
  return { valid, invalid };
}
```

#### 数据完整性验证

```typescript
// 检查关卡配置完整性
function validateLevelConfig(level: LevelDefinition): string[] {
  const errors: string[] = [];
  
  // 检查必需字段
  if (!level.id) errors.push('Missing level ID');
  if (!level.name) errors.push('Missing level name');
  if (!level.enemies || level.enemies.length === 0) {
    errors.push('Level must have at least one enemy');
  }
  if (!level.objectives || level.objectives.length === 0) {
    errors.push('Level must have at least one objective');
  }
  
  // 检查敌人配置
  level.enemies?.forEach((enemy, index) => {
    if (!enemy.id) errors.push(`Enemy ${index} missing ID`);
    if (!enemy.name) errors.push(`Enemy ${index} missing name`);
    if (!enemy.skills || enemy.skills.length === 0) {
      errors.push(`Enemy ${enemy.name || index} must have at least one skill`);
    }
  });
  
  // 检查目标配置
  level.objectives?.forEach((objective, index) => {
    if (!objective.id) errors.push(`Objective ${index} missing ID`);
    if (!objective.description) errors.push(`Objective ${index} missing description`);
  });
  
  return errors;
}

// 使用示例
const validationErrors = validateLevelConfig(LEVEL1_CONFIG);
if (validationErrors.length > 0) {
  console.error('Level validation failed:', validationErrors);
} else {
  console.log('Level validation passed!');
}
```

#### 配置测试方法

```typescript
// 单元测试示例
import { describe, it, expect } from 'vitest';

describe('Level Configuration', () => {
  it('should have valid level 1 configuration', () => {
    const errors = validateLevelConfig(LEVEL1_CONFIG);
    expect(errors).toHaveLength(0);
  });
  
  it('should have all required enemies', () => {
    expect(LEVEL1_CONFIG.enemies).toHaveLength(2);
    expect(LEVEL1_CONFIG.enemies[0].id).toBe('elk_cloner');
    expect(LEVEL1_CONFIG.enemies[1].id).toBe('skrenta_spreader');
  });
  
  it('should have valid card codes in rewards', () => {
    const cardCodes = LEVEL1_CONFIG.rewards.unlockedCards;
    cardCodes.forEach(code => {
      const card = getCardByCode(code);
      expect(card).toBeDefined();
    });
  });
});
```

### 3.3 数据迁移和版本控制

#### 数据格式变更处理

```typescript
// 数据版本管理
interface DataVersion {
  version: number;
  migrate: (data: unknown) => unknown;
}

const migrations: DataVersion[] = [
  {
    version: 1,
    migrate: (data: any) => {
      // v1: 初始版本
      return data;
    },
  },
  {
    version: 2,
    migrate: (data: any) => {
      // v2: 添加playerDeck字段
      if (!data.playerDeck) {
        data.playerDeck = null;
      }
      return data;
    },
  },
  {
    version: 3,
    migrate: (data: any) => {
      // v3: 重命名deckConfigs为playerDeck
      if (data.deckConfigs && !data.playerDeck) {
        const firstDeck = Object.values(data.deckConfigs)[0];
        data.playerDeck = firstDeck || null;
        delete data.deckConfigs;
      }
      return data;
    },
  },
];

// 执行迁移
function migrateData(data: unknown, targetVersion: number): unknown {
  let currentData = data;
  const currentVersion = (data as any)?.version || 1;
  
  for (let i = currentVersion; i < targetVersion; i++) {
    const migration = migrations.find(m => m.version === i + 1);
    if (migration) {
      console.log(`Migrating data from v${i} to v${i + 1}`);
      currentData = migration.migrate(currentData);
      (currentData as any).version = i + 1;
    }
  }
  
  return currentData;
}
```

#### 向后兼容策略

```typescript
// 加载玩家进度（带迁移）
function loadPlayerProgress(): PlayerProgress {
  const stored = localStorage.getItem('player_progress');
  if (!stored) return createDefaultProgress();
  
  try {
    let data = JSON.parse(stored);
    
    // 检查版本并迁移
    if (data.version !== CURRENT_DATA_VERSION) {
      data = migrateData(data, CURRENT_DATA_VERSION);
      savePlayerProgress(data); // 保存迁移后的数据
    }
    
    return data as PlayerProgress;
  } catch (error) {
    console.error('Failed to load player progress:', error);
    return createDefaultProgress();
  }
}

// 创建默认进度
function createDefaultProgress(): PlayerProgress {
  return {
    version: CURRENT_DATA_VERSION,
    unlockedCards: [],
    completedLevels: [],
    achievements: [],
    playerDeck: null,
  };
}
```

---

## 四、UI开发技能

### 4.1 组件开发规范

#### shadcn/ui组件使用

**安装组件**:
```bash
npx shadcn add button
npx shadcn add card
npx shadcn add dialog
```

**使用示例**:
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function LevelCard({ level }: { level: LevelDefinition }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{level.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{level.subtitle}</p>
        <Button>开始关卡</Button>
      </CardContent>
    </Card>
  );
}
```

#### 自定义组件开发

**组件结构**:
```tsx
// CardDetail.tsx
import { cn } from '@/lib/utils';

interface CardDetailProps {
  card: Card;
  className?: string;
  onClose?: () => void;
}

export function CardDetail({ card, className, onClose }: CardDetailProps) {
  return (
    <div className={cn('rounded-lg border bg-slate-900 p-4', className)}>
      {/* 组件内容 */}
    </div>
  );
}

// 导出类型
export type { CardDetailProps };
```

#### 组件样式规范

**使用Tailwind CSS**:
```tsx
// ✅ 好的实践
function CardItem({ card }: { card: Card }) {
  return (
    <div className="
      flex items-center gap-3 
      p-3 rounded-lg 
      bg-slate-800 border border-slate-700
      hover:border-slate-600 transition-colors
    ">
      <span className="font-medium text-sm">{card.name}</span>
    </div>
  );
}

// ❌ 避免的做法
function CardItem({ card }: { card: Card }) {
  return (
    <div style={{ 
      display: 'flex', 
      padding: '12px',
      backgroundColor: '#1e293b' 
    }}>
      <span style={{ fontSize: '14px' }}>{card.name}</span>
    </div>
  );
}
```

### 4.2 响应式设计

#### 断点设置

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'sm': '640px',   // 手机横屏
      'md': '768px',   // 平板
      'lg': '1024px',  // 小型桌面
      'xl': '1280px',  // 标准桌面
      '2xl': '1536px', // 大屏幕
    },
  },
};
```

#### 布局适配

```tsx
function LevelGameInterface() {
  return (
    <div className="
      grid 
      grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
      gap-4 p-4
    ">
      {/* 玩家区域 */}
      <div className="col-span-1">
        <PlayerPanel />
      </div>
      
      {/* 游戏主区域 */}
      <div className="col-span-1 md:col-span-1 lg:col-span-1">
        <GameBoard />
      </div>
      
      {/* 敌人区域 */}
      <div className="col-span-1">
        <EnemyPanel />
      </div>
    </div>
  );
}
```

#### 移动端优化

```tsx
function CardLibrary() {
  return (
    <div className="
      grid 
      grid-cols-2 sm:grid-cols-3 md:grid-cols-4 
      gap-2 sm:gap-3 md:gap-4
    ">
      {cards.map(card => (
        <CardItem 
          key={card.card_code} 
          card={card}
          className="text-xs sm:text-sm" // 响应式文字大小
        />
      ))}
    </div>
  );
}
```

### 4.3 动画和交互

#### 动画实现方法

**使用Framer Motion**:
```tsx
import { motion, AnimatePresence } from 'framer-motion';

function CardHand({ cards }: { cards: Card[] }) {
  return (
    <AnimatePresence>
      {cards.map((card, index) => (
        <motion.div
          key={card.card_code}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <CardItem card={card} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

**使用Tailwind CSS动画**:
```tsx
function LoadingSpinner() {
  return (
    <div className="
      animate-spin 
      rounded-full 
      h-8 w-8 
      border-b-2 border-blue-500
    " />
  );
}

function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}

// tailwind.config.ts
export default {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
};
```

#### 交互反馈设计

```tsx
function ActionButton({ onClick, children }: ActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className="
        relative
        transition-all duration-200
        active:scale-95
        disabled:opacity-50
      "
    >
      {isLoading && (
        <LoadingSpinner className="absolute left-2" />
      )}
      {children}
    </Button>
  );
}
```

#### 性能优化

```tsx
// 使用will-change优化动画
function AnimatedCard({ card }: { card: Card }) {
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ willChange: 'transform' }}
    >
      <CardItem card={card} />
    </motion.div>
  );
}

// 使用CSS transform代替top/left
function DraggableCard({ card }: { card: Card }) {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      whileDrag={{ scale: 1.1 }}
    >
      <CardItem card={card} />
    </motion.div>
  );
}
```

---

## 五、游戏逻辑开发技能

### 5.1 回合制系统实现

#### 回合流转逻辑

```typescript
// 游戏阶段定义
enum GamePhase {
  PLAYER_DRAW = 'player_draw',       // 玩家摸牌阶段
  PLAYER_ACTION = 'player_action',   // 玩家行动阶段
  DADONG_DRAW = 'dadong_draw',       // 大东摸牌阶段
  DADONG_ACTION = 'dadong_action',   // 大东行动阶段
  ENEMY1_ACTION = 'enemy1_action',   // 敌人1行动阶段
  ENEMY2_ACTION = 'enemy2_action',   // 敌人2行动阶段
  JUDGMENT = 'judgment',             // 判定阶段
  END_TURN = 'end_turn',             // 回合结束阶段
}

// 阶段流转图
const PHASE_FLOW: Record<GamePhase, GamePhase> = {
  [GamePhase.PLAYER_DRAW]: GamePhase.PLAYER_ACTION,
  [GamePhase.PLAYER_ACTION]: GamePhase.DADONG_DRAW,
  [GamePhase.DADONG_DRAW]: GamePhase.DADONG_ACTION,
  [GamePhase.DADONG_ACTION]: GamePhase.ENEMY1_ACTION,
  [GamePhase.ENEMY1_ACTION]: GamePhase.ENEMY2_ACTION,
  [GamePhase.ENEMY2_ACTION]: GamePhase.JUDGMENT,
  [GamePhase.JUDGMENT]: GamePhase.END_TURN,
  [GamePhase.END_TURN]: GamePhase.PLAYER_DRAW,
};

// 阶段推进函数
function advancePhase(currentPhase: GamePhase): GamePhase {
  const nextPhase = PHASE_FLOW[currentPhase];
  console.log(`Phase transition: ${currentPhase} -> ${nextPhase}`);
  return nextPhase;
}
```

#### 阶段划分和推进

```typescript
class LevelGameStateManager {
  private state: GameState;
  
  // 执行当前阶段
  async executeCurrentPhase(): Promise<void> {
    const { currentPhase } = this.state;
    
    switch (currentPhase) {
      case GamePhase.PLAYER_DRAW:
        await this.executePlayerDrawPhase();
        break;
      case GamePhase.PLAYER_ACTION:
        // 等待玩家操作
        break;
      case GamePhase.DADONG_DRAW:
        await this.executeDadongDrawPhase();
        break;
      case GamePhase.DADONG_ACTION:
        await this.executeDadongActionPhase();
        break;
      case GamePhase.ENEMY1_ACTION:
        await this.executeEnemyActionPhase(0);
        break;
      case GamePhase.ENEMY2_ACTION:
        await this.executeEnemyActionPhase(1);
        break;
      case GamePhase.JUDGMENT:
        await this.executeJudgmentPhase();
        break;
      case GamePhase.END_TURN:
        await this.executeEndTurnPhase();
        break;
    }
  }
  
  // 玩家摸牌阶段
  private async executePlayerDrawPhase(): Promise<void> {
    const drawCount = 2; // 摸2张牌
    
    for (let i = 0; i < drawCount; i++) {
      const card = this.drawCardFromPlayerDeck();
      if (card) {
        this.state.playerState.hand.push(card);
        this.logOperation('player', 'draw', card.name, `摸取${card.name}`);
      }
    }
    
    // 自动推进到下一阶段
    await this.delay(1000);
    this.advancePhase();
  }
  
  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 轮次计算

```typescript
// 轮次计算逻辑
function calculateRound(currentTurn: number): number {
  // 每4个回合 = 1个轮次（玩家+大东+敌人1+敌人2）
  return Math.ceil(currentTurn / 4);
}

// 在状态管理器中
function incrementTurn(state: GameState): GameState {
  const newTurn = state.currentTurn + 1;
  const newRound = calculateRound(newTurn);
  
  // 检查是否进入新轮次
  if (newRound > state.round) {
    console.log(`🔄 进入轮次 ${newRound}`);
    // 触发轮次开始事件
    triggerRoundStart(newRound);
  }
  
  return {
    ...state,
    currentTurn: newTurn,
    round: newRound,
  };
}

// 轮次开始处理
function triggerRoundStart(round: number): void {
  // 处理潜伏标记转换
  processLatentMarkers();
  
  // 减少技能冷却
  reduceSkillCooldowns();
  
  // 恢复资源
  restoreResources();
}
```

### 5.2 AI系统实现

#### AI决策逻辑

```typescript
// AI决策上下文
interface AIDecisionContext {
  enemy: EnemyState;
  gameState: GameState;
  availableActions: Action[];
}

// AI决策结果
interface AIDecision {
  action: Action;
  target?: AreaType;
  priority: number;
}

// 策略接口
interface AIStrategy {
  name: string;
  evaluate(context: AIDecisionContext): AIDecision[];
}

// 干扰策略
class DisruptStrategy implements AIStrategy {
  name = 'disrupt';
  
  evaluate(context: AIDecisionContext): AIDecision[] {
    const decisions: AIDecision[] = [];
    const { enemy, gameState } = context;
    
    // 评估使用技能
    for (const skill of enemy.skills) {
      if (skill.type === 'active' && this.canUseSkill(skill, enemy)) {
        decisions.push({
          action: { type: 'use_skill', skillId: skill.id },
          priority: 80,
        });
      }
    }
    
    // 评估放置标记
    const targetArea = this.selectTargetArea(gameState);
    decisions.push({
      action: { type: 'place_marker' },
      target: targetArea,
      priority: 60,
    });
    
    return decisions;
  }
  
  private canUseSkill(skill: EnemySkill, enemy: EnemyState): boolean {
    const cooldown = enemy.skillCooldowns?.[skill.id] || 0;
    return cooldown <= 0;
  }
  
  private selectTargetArea(gameState: GameState): AreaType {
    // 优先攻击玩家控制区域
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    return areas.find(area => 
      gameState.areaControl[area].controller === 'player'
    ) || 'internal';
  }
}

// AI控制器
class LevelAIController {
  private strategies: Map<string, AIStrategy> = new Map();
  
  constructor() {
    this.strategies.set('disrupt', new DisruptStrategy());
    this.strategies.set('aggressive', new AggressiveStrategy());
    this.strategies.set('balanced', new BalancedStrategy());
  }
  
  async makeDecision(enemy: EnemyState, gameState: GameState): Promise<Action> {
    // 选择策略
    const strategyName = this.selectStrategy(enemy);
    const strategy = this.strategies.get(strategyName)!;
    
    // 评估所有可能的行动
    const context: AIDecisionContext = {
      enemy,
      gameState,
      availableActions: this.getAvailableActions(enemy),
    };
    
    const decisions = strategy.evaluate(context);
    
    // 按优先级排序并选择最高优先级的行动
    decisions.sort((a, b) => b.priority - a.priority);
    
    return decisions[0]?.action || { type: 'pass' };
  }
  
  private selectStrategy(enemy: EnemyState): string {
    const random = Math.random();
    if (random < 0.4) return 'disrupt';
    if (random < 0.7) return 'balanced';
    return 'aggressive';
  }
}
```

#### 技能触发机制

```typescript
// 技能触发器
class SkillTrigger {
  private triggers: Map<string, SkillTriggerCondition[]> = new Map();
  
  // 注册技能触发条件
  register(skillId: string, condition: SkillTriggerCondition): void {
    if (!this.triggers.has(skillId)) {
      this.triggers.set(skillId, []);
    }
    this.triggers.get(skillId)!.push(condition);
  }
  
  // 检查技能是否可以触发
  canTrigger(skillId: string, context: TriggerContext): boolean {
    const conditions = this.triggers.get(skillId) || [];
    return conditions.every(condition => condition.check(context));
  }
  
  // 触发技能
  async trigger(skillId: string, context: TriggerContext): Promise<SkillResult> {
    const skill = getSkillById(skillId);
    
    // 检查触发条件
    if (!this.canTrigger(skillId, context)) {
      return { success: false, reason: 'Trigger conditions not met' };
    }
    
    // 执行技能效果
    const result = await this.executeSkillEffect(skill, context);
    
    // 设置冷却
    if (skill.cooldown > 0) {
      this.setCooldown(skillId, context.enemyId, skill.cooldown);
    }
    
    return result;
  }
  
  private async executeSkillEffect(
    skill: EnemySkill, 
    context: TriggerContext
  ): Promise<SkillResult> {
    switch (skill.id) {
      case 'floppy_infection':
        return this.executeFloppyInfection(context);
      case 'fiftieth_boot':
        return this.executeFiftiethBoot(context);
      case 'social_engineering':
        return this.executeSocialEngineering(context);
      case 'latent_replication':
        return this.executeLatentReplication(context);
      default:
        return { success: false, reason: 'Unknown skill' };
    }
  }
}

// 触发条件接口
interface SkillTriggerCondition {
  check(context: TriggerContext): boolean;
}

// 冷却条件
class CooldownCondition implements SkillTriggerCondition {
  check(context: TriggerContext): boolean {
    const { skillId, enemyState } = context;
    const cooldown = enemyState.skillCooldowns?.[skillId] || 0;
    return cooldown <= 0;
  }
}

// 概率条件
class ProbabilityCondition implements SkillTriggerCondition {
  constructor(private probability: number) {}
  
  check(): boolean {
    return Math.random() < this.probability;
  }
}
```

#### 行为树/状态机应用

```typescript
// 行为树节点基类
abstract class BTNode {
  abstract execute(context: AIContext): BTStatus;
}

enum BTStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  RUNNING = 'running',
}

// 选择器节点（顺序执行子节点，直到有一个成功）
class SelectorNode extends BTNode {
  constructor(private children: BTNode[]) {
    super();
  }
  
  execute(context: AIContext): BTStatus {
    for (const child of this.children) {
      const status = child.execute(context);
      if (status !== BTStatus.FAILURE) {
        return status;
      }
    }
    return BTStatus.FAILURE;
  }
}

// 序列节点（顺序执行子节点，直到有一个失败）
class SequenceNode extends BTNode {
  constructor(private children: BTNode[]) {
    super();
  }
  
  execute(context: AIContext): BTStatus {
    for (const child of this.children) {
      const status = child.execute(context);
      if (status !== BTStatus.SUCCESS) {
        return status;
      }
    }
    return BTStatus.SUCCESS;
  }
}

// 条件节点
class ConditionNode extends BTNode {
  constructor(private condition: (context: AIContext) => boolean) {
    super();
  }
  
  execute(context: AIContext): BTStatus {
    return this.condition(context) ? BTStatus.SUCCESS : BTStatus.FAILURE;
  }
}

// 动作节点
class ActionNode extends BTNode {
  constructor(private action: (context: AIContext) => Promise<void>) {
    super();
  }
  
  async execute(context: AIContext): Promise<BTStatus> {
    try {
      await this.action(context);
      return BTStatus.SUCCESS;
    } catch (error) {
      return BTStatus.FAILURE;
    }
  }
}

// 构建敌人AI行为树
function buildEnemyBehaviorTree(): BTNode {
  return new SelectorNode([
    // 优先使用技能
    new SequenceNode([
      new ConditionNode(ctx => hasAvailableSkill(ctx.enemy)),
      new ActionNode(ctx => useSkill(ctx.enemy)),
    ]),
    // 其次放置标记
    new SequenceNode([
      new ConditionNode(ctx => hasActionPoints(ctx.enemy)),
      new ActionNode(ctx => placeMarker(ctx.enemy)),
    ]),
    // 默认行动
    new ActionNode(ctx => defaultAction(ctx.enemy)),
  ]);
}
```

### 5.3 卡牌系统实现

#### 卡牌效果执行

```typescript
// 卡牌效果执行器
class CardEffectExecutor {
  private effects: Map<string, EffectHandler> = new Map();
  
  constructor() {
    this.registerEffects();
  }
  
  private registerEffects(): void {
    this.effects.set('security_gain', this.handleSecurityGain);
    this.effects.set('marker_remove', this.handleMarkerRemove);
    this.effects.set('resource_gain', this.handleResourceGain);
    this.effects.set('vaccinate', this.handleVaccinate);
  }
  
  async execute(
    card: Card, 
    context: EffectContext
  ): Promise<EffectResult> {
    const results: EffectResult[] = [];
    
    for (const effect of card.effects) {
      const handler = this.effects.get(effect.type);
      if (handler) {
        const result = await handler(effect, context);
        results.push(result);
      } else {
        console.warn(`Unknown effect type: ${effect.type}`);
      }
    }
    
    return {
      success: results.every(r => r.success),
      effects: results,
    };
  }
  
  private handleSecurityGain = async (
    effect: CardEffect,
    context: EffectContext
  ): Promise<EffectResult> => {
    const amount = effect.baseValue || 1;
    context.playerState.securityLevel += amount;
    
    return {
      success: true,
      message: `安全等级+${amount}`,
      data: { amount },
    };
  };
  
  private handleMarkerRemove = async (
    effect: CardEffect,
    context: EffectContext
  ): Promise<EffectResult> => {
    const { targetArea } = context;
    const amount = effect.baseValue || 1;
    
    if (targetArea) {
      const removed = Math.min(
        targetArea.attackMarkers,
        amount
      );
      targetArea.attackMarkers -= removed;
      
      return {
        success: true,
        message: `移除${removed}个敌方标记`,
        data: { removed, area: targetArea },
      };
    }
    
    return { success: false, message: '未指定目标区域' };
  };
}
```

#### 资源消耗计算

```typescript
// 资源消耗计算器
class ResourceCalculator {
  // 计算卡牌实际消耗
  calculateCost(
    card: Card,
    playerState: PlayerState,
    context: CostContext
  ): ResourceCost {
    let cost = { ...card.cost };
    
    // 应用区域特性折扣
    if (context.targetArea) {
      const areaBonus = this.getAreaCostBonus(
        context.targetArea, 
        playerState
      );
      cost = this.applyCostBonus(cost, areaBonus);
    }
    
    // 应用连击折扣
    if (context.comboCount > 0) {
      const comboBonus = this.getComboCostBonus(
        card,
        context.comboCount
      );
      cost = this.applyCostBonus(cost, comboBonus);
    }
    
    // 确保消耗不为负
    return {
      compute: Math.max(0, cost.compute || 0),
      funds: Math.max(0, cost.funds || 0),
      information: Math.max(0, cost.information || 0),
    };
  }
  
  // 检查资源是否足够
  hasEnoughResources(
    cost: ResourceCost,
    playerState: PlayerState
  ): boolean {
    return (
      playerState.resources.compute >= (cost.compute || 0) &&
      playerState.resources.funds >= (cost.funds || 0) &&
      playerState.resources.information >= (cost.information || 0)
    );
  }
  
  // 扣除资源
  deductResources(
    cost: ResourceCost,
    playerState: PlayerState
  ): void {
    playerState.resources.compute -= (cost.compute || 0);
    playerState.resources.funds -= (cost.funds || 0);
    playerState.resources.information -= (cost.information || 0);
  }
  
  private getAreaCostBonus(
    area: AreaType,
    playerState: PlayerState
  ): Partial<ResourceCost> {
    // 如果玩家控制该区域，获得折扣
    if (area.controller === 'player') {
      return { compute: -1 };
    }
    return {};
  }
  
  private getComboCostBonus(
    card: Card,
    comboCount: number
  ): Partial<ResourceCost> {
    // 连击减少消耗
    const discount = Math.min(comboCount * 0.5, 2);
    return {
      compute: -discount,
    };
  }
  
  private applyCostBonus(
    cost: ResourceCost,
    bonus: Partial<ResourceCost>
  ): ResourceCost {
    return {
      compute: (cost.compute || 0) + (bonus.compute || 0),
      funds: (cost.funds || 0) + (bonus.funds || 0),
      information: (cost.information || 0) + (bonus.information || 0),
    };
  }
}
```

#### 判定机制

```typescript
// 判定系统
class JudgmentSystem {
  // 执行判定
  async executeJudgment(
    difficulty: number,
    context: JudgmentContext
  ): Promise<JudgmentResult> {
    // 投掷骰子（1-6）
    const roll = this.rollDice();
    
    // 计算修正值
    const modifier = this.calculateModifier(context);
    
    // 计算最终结果
    const finalResult = roll + modifier;
    
    // 判断是否成功
    const isSuccess = finalResult >= difficulty;
    
    // 计算成功等级
    const successLevel = this.calculateSuccessLevel(
      finalResult,
      difficulty
    );
    
    return {
      roll,
      modifier,
      finalResult,
      difficulty,
      isSuccess,
      successLevel,
    };
  }
  
  private rollDice(): number {
    return Math.floor(Math.random() * 6) + 1;
  }
  
  private calculateModifier(context: JudgmentContext): number {
    let modifier = 0;
    
    // 区域控制加成
    if (context.controlledAreas > 0) {
      modifier += context.controlledAreas * 0.5;
    }
    
    // 信息资源加成
    modifier += context.informationResources * 0.3;
    
    // 技能加成
    if (context.hasAnalysisSkill) {
      modifier += 1;
    }
    
    return modifier;
  }
  
  private calculateSuccessLevel(
    result: number,
    difficulty: number
  ): SuccessLevel {
    const difference = result - difficulty;
    
    if (difference >= 3) return 'critical';
    if (difference >= 0) return 'success';
    if (difference >= -2) return 'partial';
    return 'failure';
  }
}

// 判定结果
interface JudgmentResult {
  roll: number;
  modifier: number;
  finalResult: number;
  difficulty: number;
  isSuccess: boolean;
  successLevel: SuccessLevel;
}

type SuccessLevel = 'critical' | 'success' | 'partial' | 'failure';
```

---

## 六、关卡设计标准模板

### 6.1 关卡基础信息模板

```markdown
## 关卡基础信息

| 属性 | 内容 |
|------|------|
| **关卡ID** | LV{X} |
| **关卡名称** | {名称} |
| **副标题** | {副标题} |
| **难度等级** | {1-5} |
| **教学重点** | {教学主题} |
| **预计轮次** | {X}轮 |
| **最大轮次** | {X}轮 |

### 关联文章

- **文章标题**: {文章标题}
- **内容主题**: {主题描述}

### 关卡背景

{关卡背景故事}
```

### 6.2 敌人设计模板

```markdown
## 敌人配置

### 敌人{N}: {敌人名称}

#### 基础属性

| 属性 | 内容 |
|------|------|
| **ID** | {enemy_id} |
| **名称** | {名称} |
| **类型** | {virus/hacker/ai} |
| **攻击风格** | {风格描述} |
| **弱点** | {弱点描述} |
| **行动点** | {X}点/回合 |
| **手牌数** | {X}张 |

#### 背景故事

> {背景故事}

#### 技能列表

##### 技能{N}: {技能名称}

| 属性 | 内容 |
|------|------|
| **技能ID** | {skill_id} |
| **类型** | {active/passive} |
| **冷却** | {X}回合 |
| **触发条件** | {条件} |

**效果描述**:
{效果描述}

**实现逻辑**:
\`\`\`typescript
// 实现代码
\`\`\`
```

### 6.3 AI配置模板

```markdown
## 大东AI配置

### 基础属性

| 属性 | 内容 |
|------|------|
| **行动点** | {X}点/回合 |
| **手牌数** | {X}张 |
| **每回合出牌** | {X}张 |

### 行为逻辑

#### 决策优先级

1. {优先级1}
2. {优先级2}
3. {优先级3}

#### 协作机制

- {协作方式1}
- {协作方式2}

### 卡组配置

| 卡牌代码 | 卡牌名称 | 效果 |
|----------|----------|------|
| {代码} | {名称} | {效果} |
```

### 6.4 玩家配置模板

```markdown
## 玩家配置

### 基础属性

| 属性 | 内容 |
|------|------|
| **行动点** | {X}点/回合 |
| **手牌上限** | {X}张 |

### 初始资源

| 资源类型 | 初始值 | 恢复速率 |
|----------|--------|----------|
| 算力 | {X} | {X}/回合 |
| 资金 | {X} | {X}/回合 |
| 信息 | {X} | {X}/回合 |
| 安全等级 | {X} | - |

### 初始区域控制

| 区域 | 友方标记 | 敌方标记 | 控制器 |
|------|----------|----------|--------|
| {区域} | {X} | {X} | {controller} |
```

### 6.5 胜利/失败条件模板

```markdown
## 胜利与失败条件

### 胜利条件

#### 主要目标: {目标名称}

- **条件**: {条件描述}
- **奖励**: {奖励}

#### 次要目标{N}: {目标名称}

- **条件**: {条件描述}
- **奖励**: {奖励}

### 失败条件

#### 条件{N}: {条件名称}

- **条件**: {条件描述}
- **提示**: {提示信息}

### 判定逻辑

\`\`\`typescript
// 胜利条件检查
function checkVictory(): boolean {
  // 实现代码
}

// 失败条件检查
function checkFailure(): string | null {
  // 实现代码
}
\`\`\`
```

### 6.6 代码实现模板

#### 新关卡数据配置模板

```typescript
// levelDatabase.ts
export const LEVEL{X}_CONFIG: LevelDefinition = {
  id: 'LV{X}',
  name: '{关卡名称}',
  subtitle: '{副标题}',
  difficulty: {1-5},
  tutorialFocus: '{教学重点}',
  maxTurns: {X},
  initialSetup: {
    playerResources: { computing: {X}, funds: {X}, information: {X} },
    playerSecurityLevel: {X},
    controlledAreas: [{区域列表}],
    areaMarkers: {
      {区域}: { defense: {X}, attack: {X} },
    },
  },
  enemies: LEVEL{X}_ENEMIES,
  objectives: [
    {
      id: '{objective_id}',
      description: '{描述}',
      type: '{类型}',
      targetValue: {X},
    },
  ],
  failureConditions: [
    {
      id: '{condition_id}',
      description: '{描述}',
      check: (state) => {条件},
    },
  ],
  rewards: {
    experience: {X},
    unlockedCards: [{卡牌代码}],
    achievement: '{成就名称}',
    unlockLevel: 'LV{X+1}',
  },
};
```

#### 新敌人配置模板

```typescript
// levelEnemies.ts
export const LEVEL{X}_ENEMIES: EnemyConfig[] = [
  {
    id: '{enemy_id}',
    name: '{敌人名称}',
    type: '{类型}',
    attackStyle: '{风格}',
    weakness: '{弱点}',
    actionPoints: {X},
    handSize: {X},
    skills: [
      {
        id: '{skill_id}',
        name: '{技能名称}',
        type: '{active/passive}',
        description: '{描述}',
        effect: '{效果}',
        cooldown: {X},
      },
    ],
  },
];
```

#### 新卡牌配置模板

```typescript
// cardDatabase.ts
{
  card_code: '{代码}',
  name: '{名称}',
  description: '{描述}',
  type: '{类型}' as CardType,
  faction: '{阵营}' as Faction,
  rarity: '{稀有度}' as CardRarity,
  techLevel: {X} as TechLevel,
  cost: { compute: {X}, funds: {X}, information: {X} },
  difficulty: {X},
  effects: [
    { type: '{效果类型}', baseValue: {X}, description: '{描述}' }
  ],
},
```

---

**文档版本**: 1.0
**最后更新**: 2025年
**作者**: AI Assistant
