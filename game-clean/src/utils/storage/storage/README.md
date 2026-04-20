# 数据隔离系统 - Data Isolation System

## 概述

数据隔离系统确保关卡模式和安全实践模式的数据完全隔离，防止跨模式数据污染。

## 文件结构

```
src/utils/storage/
├── index.ts           # 模块导出
├── StorageManager.ts  # 核心存储管理类
└── README.md          # 使用文档
```

## 核心概念

### 存储命名空间

- `level_` - 关卡模式数据前缀
- `tower_` - 安全实践模式数据前缀
- `shared_` - 共享数据前缀

### 游戏模式

- `level` - 关卡模式（对战模式）
- `tower` - 安全实践模式（爬塔模式）
- `shared` - 共享数据（设置、用户偏好等）

## 使用方式

### 1. 使用 StorageManager 类

```typescript
import { storageManager, StorageManager } from '@/utils/storage';

// 使用单例实例
storageManager.setLevelData('playerProgress', { level: 5, score: 1000 });
const progress = storageManager.getLevelData('playerProgress');

// 创建新实例
const sessionManager = new StorageManager('sessionStorage');
sessionManager.setTowerData('runProgress', { floor: 10, health: 80 });
```

### 2. 使用 useStorage Hook

```typescript
import { useStorage } from '@/hooks';

function MyComponent() {
  const {
    currentMode,      // 当前检测到的模式
    setItem,          // 存储数据（自动使用当前模式）
    getItem,          // 获取数据
    removeItem,       // 删除数据
    clear,            // 清空当前模式数据
    exportData,       // 导出数据
    importData,       // 导入数据
    setLevelData,     // 存储关卡模式数据
    getTowerData,     // 获取安全实践模式数据
    // ... 更多方法
  } = useStorage();

  // 存储数据
  const saveProgress = () => {
    setItem('gameState', { turn: 5, phase: 'action' });
  };

  // 获取数据
  const loadProgress = () => {
    const state = getItem<{ turn: number; phase: string }>('gameState');
    return state;
  };

  return (
    <div>
      <p>当前模式: {currentMode}</p>
      <button onClick={saveProgress}>保存</button>
      <button onClick={loadProgress}>加载</button>
    </div>
  );
}
```

### 3. 使用专用 Hooks

```typescript
import { useLevelStorage, useTowerStorage, useSharedStorage } from '@/hooks';

// 关卡模式专用
function LevelComponent() {
  const { setItem, getItem } = useLevelStorage();
  // 自动使用 level 模式
}

// 安全实践模式专用
function TowerComponent() {
  const { setItem, getItem } = useTowerStorage();
  // 自动使用 tower 模式
}

// 共享数据
function SettingsComponent() {
  const { setItem, getItem } = useSharedStorage();
  // 自动使用 shared 模式
}
```

## API 参考

### StorageManager

#### 构造函数

```typescript
new StorageManager(storageType?: 'localStorage' | 'sessionStorage', config?: Partial<StorageConfig>)
```

#### 核心方法

| 方法 | 说明 |
|------|------|
| `setItem<T>(key, value, mode?)` | 存储数据 |
| `getItem<T>(key, mode?)` | 获取数据 |
| `removeItem(key, mode?)` | 删除数据 |
| `clear(mode?)` | 清空指定模式数据 |
| `getAllKeys(mode?)` | 获取所有键名 |
| `migrateData(fromMode, toMode)` | 数据迁移 |
| `exportData(mode?)` | 导出数据为JSON |
| `importData(json, mode?)` | 导入JSON数据 |

#### 模式特定方法

| 方法 | 说明 |
|------|------|
| `setLevelData<T>(key, value)` | 存储关卡模式数据 |
| `getLevelData<T>(key)` | 获取关卡模式数据 |
| `setTowerData<T>(key, value)` | 存储安全实践数据 |
| `getTowerData<T>(key)` | 获取安全实践数据 |
| `setSharedData<T>(key, value)` | 存储共享数据 |
| `getSharedData<T>(key)` | 获取共享数据 |

### useStorage Hook

#### 配置选项

```typescript
interface UseStorageOptions {
  storageType?: 'localStorage' | 'sessionStorage';  // 默认 'localStorage'
  autoDetectMode?: boolean;                          // 默认 true
  mode?: 'level' | 'tower' | 'shared';              // 手动指定模式
  watchStorage?: boolean;                            // 默认 true
  onStorageChange?: (key, newValue, oldValue) => void;
}
```

#### 返回值

```typescript
interface UseStorageReturn {
  // 状态
  currentMode: GameMode | null;
  isLoading: boolean;
  error: StorageError | null;

  // 通用存储方法
  setItem: <T>(key: string, value: T) => void;
  getItem: <T>(key: string) => T | null;
  removeItem: (key: string) => void;
  clear: () => void;
  getAllKeys: () => string[];
  hasItem: (key: string) => boolean;
  getMetadata: (key: string) => StorageItemMetadata | null;

  // 模式特定方法
  setLevelData: <T>(key: string, value: T) => void;
  getLevelData: <T>(key: string) => T | null;
  setTowerData: <T>(key: string, value: T) => void;
  getTowerData: <T>(key: string) => T | null;
  setSharedData: <T>(key: string, value: T) => void;
  getSharedData: <T>(key: string) => T | null;

  // 数据迁移和导入导出
  exportData: () => string;
  importData: (json: string) => { success: number; failed: number; errors: string[] };
  migrateData: (fromMode: GameMode, toMode: GameMode) => { success: number; failed: number };

  // 统计信息
  getStats: () => { totalKeys: number; levelKeys: number; towerKeys: number; sharedKeys: number; estimatedSize: number };

  // 工具方法
  clearError: () => void;
  refreshMode: () => void;
}
```

## 数据安全特性

### 1. 数据完整性验证

所有存储的数据都包含校验和，读取时自动验证：

```typescript
const item = {
  data: { /* 实际数据 */ },
  metadata: {
    version: '1.0.0',
    createdAt: 1234567890,
    updatedAt: 1234567890,
    mode: 'level',
    checksum: 'a1b2c3d4'  // 校验和
  }
};
```

### 2. 模式隔离

数据访问时自动验证模式匹配：

```typescript
// 如果尝试用错误模式读取数据，会返回 null
const data = storageManager.getItem('key', 'level');
// 如果实际存储的是 tower 模式数据，返回 null 并输出警告
```

### 3. 版本控制

数据包含版本信息，支持未来迁移：

```typescript
// 初始化时检查版本
storageManager.checkAndMigrateVersion();
```

## 使用示例

### 示例 1: 保存和加载游戏状态

```typescript
import { useStorage } from '@/hooks';

function GameComponent() {
  const { setItem, getItem, currentMode } = useStorage();

  const saveGame = (gameState: GameState) => {
    setItem('gameState', gameState);
    setItem('lastSaveTime', Date.now());
  };

  const loadGame = (): GameState | null => {
    return getItem<GameState>('gameState');
  };

  return (
    <div>
      <button onClick={() => saveGame(currentState)}>保存游戏</button>
      <button onClick={() => loadGame()}>加载游戏</button>
    </div>
  );
}
```

### 示例 2: 跨模式数据访问

```typescript
import { useStorage } from '@/hooks';

function CrossModeComponent() {
  const { getLevelData, getTowerData, setSharedData } = useStorage();

  const syncProgress = () => {
    // 读取关卡模式进度
    const levelProgress = getLevelData('playerStats');
    // 读取安全实践模式进度
    const towerProgress = getTowerData('runStats');

    // 合并到共享数据
    setSharedData('unifiedStats', {
      level: levelProgress,
      tower: towerProgress,
      lastSync: Date.now()
    });
  };

  return <button onClick={syncProgress}>同步进度</button>;
}
```

### 示例 3: 数据导出和导入

```typescript
import { useStorage } from '@/hooks';

function BackupComponent() {
  const { exportData, importData, getStats } = useStorage();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-backup-${Date.now()}.json`;
    a.click();
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const result = importData(text);
    console.log(`导入成功: ${result.success}, 失败: ${result.failed}`);
    if (result.errors.length > 0) {
      console.error('错误:', result.errors);
    }
  };

  const stats = getStats();

  return (
    <div>
      <p>总键数: {stats.totalKeys}</p>
      <p>估计大小: {stats.estimatedSize} bytes</p>
      <button onClick={handleExport}>导出数据</button>
      <input type="file" onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])} />
    </div>
  );
}
```

### 示例 4: 监听存储变化

```typescript
import { useStorage } from '@/hooks';

function SyncComponent() {
  const { setItem } = useStorage({
    watchStorage: true,
    onStorageChange: (key, newValue, oldValue) => {
      console.log(`键 "${key}" 发生变化:`, oldValue, '->', newValue);
    }
  });

  return <div>监听存储变化中...</div>;
}
```

## 注意事项

1. **模式检测**：自动模式检测基于 URL 路径，确保路由配置正确
2. **错误处理**：所有操作都包装了错误处理，可以通过 `error` 状态获取错误信息
3. **性能考虑**：大量数据操作时考虑使用批量操作或数据压缩
4. **存储限制**：注意浏览器 localStorage 的 5MB 限制

## 迁移指南

### 从旧存储系统迁移

```typescript
import { storageManager } from '@/utils/storage';

function migrateFromOldSystem() {
  // 读取旧数据
  const oldData = localStorage.getItem('old_key');
  if (oldData) {
    const parsed = JSON.parse(oldData);
    // 存储到新系统（自动添加前缀和元数据）
    storageManager.setLevelData('new_key', parsed);
    // 删除旧数据
    localStorage.removeItem('old_key');
  }
}
```
