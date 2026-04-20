# A组 - 第五轮：层级元数据与热区配置开发 Prompt

## 任务目标
实现9层塔主地图的基础数据层，包括层级元数据类型定义、9层层级元数据、热区配置数据和layerRegistry集成。

## 参考设计
参考文件：`tower_final_interactive.html` 中的 tierData 和 hotspotConfig

## 具体任务

### Task A1: 创建层级元数据类型定义
创建文件 `src/tower-mode/types/layerMetadata.types.ts`，定义以下类型：

```typescript
// 层级特色功能项
interface LayerFeature {
  icon: string;      // emoji图标
  text: string;      // 功能描述
}

// 层级元数据
interface LayerMetadata {
  name: string;           // 完整名称（如"病毒实验室"）
  shortName: string;      // 短名称（如"病毒实验室"）
  color: string;          // 主题色（HEX格式，如"#228B22"）
  theme: string;          // 主题描述（如"恶意软件与病毒防御"）
  features: LayerFeature[]; // 5个特色功能
  progress: number;       // 进度百分比（0-100）
}

// 热区配置
interface HotspotConfig {
  bottom: number;   // 距离底部百分比（0-100）
  height: number;   // 热区高度百分比
  width: number;    // 热区宽度百分比
}

// 层级解锁状态
type LayerUnlockState = 'locked' | 'unlocked' | 'completed';

interface LayerState {
  unlocked: boolean;
  completed: boolean;
  progress: number;
}
```

### Task A2: 实现9层层级元数据
创建文件 `src/tower-mode/data/layerMetadata.ts`，实现9层元数据：

```typescript
export const TIER_DATA: Record<number, LayerMetadata> = {
  1: {
    name: '病毒实验室',
    shortName: '病毒实验室',
    color: '#228B22',
    theme: '恶意软件与病毒防御',
    features: [
      { icon: '🦠', text: '计算机病毒基础认知' },
      { icon: '🛡️', text: '勒索软件防御策略' },
      { icon: '🔬', text: '恶意软件分析技术' },
      { icon: '⚔️', text: '病毒防护实战演练' },
      { icon: '☣️', text: '生物危害隔离系统' }
    ],
    progress: 0
  },
  2: {
    name: '网络空间',
    shortName: '网络空间',
    color: '#00CED1',
    theme: '网络攻击与防御',
    features: [
      { icon: '🌐', text: 'DDoS攻击识别与防御' },
      { icon: '🔥', text: '防火墙与边界防护' },
      { icon: '👁️', text: '入侵检测系统(IDS)' },
      { icon: '📊', text: '网络流量分析技术' },
      { icon: '🔗', text: '中间人攻击防护' }
    ],
    progress: 0
  },
  // ... 继续实现3-9层
};
```

各层颜色配置：
- L1: #228B22 (生物绿)
- L2: #00CED1 (赛博青)
- L3: #4169E1 (深蓝)
- L4: #FF8C00 (暖橙)
- L5: #DAA520 (工业黄)
- L6: #9370DB (移动紫)
- L7: #87CEEB (天蓝)
- L8: #FF69B4 (量子粉)
- L9: #FFD700 (皇家金)

### Task A3: 实现热区配置数据
在同一文件中添加热区配置：

```typescript
export const HOTSPOT_CONFIG: Record<number, HotspotConfig> = {
  1: { bottom: 8, height: 10, width: 82 },
  2: { bottom: 19, height: 10, width: 76 },
  3: { bottom: 30, height: 10, width: 70 },
  4: { bottom: 41, height: 10, width: 63 },
  5: { bottom: 52, height: 10, width: 55 },
  6: { bottom: 63, height: 9, width: 47 },
  7: { bottom: 73, height: 9, width: 39 },
  8: { bottom: 83, height: 7, width: 31 },
  9: { bottom: 90, height: 9, width: 23 }
};
```

### Task A4: 更新 layerRegistry
修改 `src/tower-mode/data/layerRegistry.ts`，添加导出函数：

```typescript
import { TIER_DATA, HOTSPOT_CONFIG } from './layerMetadata';
import type { LayerMetadata, HotspotConfig, LayerState } from '../types/layerMetadata.types';

export function getLayerMetadata(layerNumber: number): LayerMetadata {
  const data = TIER_DATA[layerNumber];
  if (!data) {
    throw new Error(`Invalid layer number: ${layerNumber}`);
  }
  return data;
}

export function getHotspotConfig(layerNumber: number): HotspotConfig {
  const config = HOTSPOT_CONFIG[layerNumber];
  if (!config) {
    throw new Error(`Invalid layer number: ${layerNumber}`);
  }
  return config;
}

export function getAllLayerMetadata(): Record<number, LayerMetadata> {
  return { ...TIER_DATA };
}

// 默认层级状态（仅第1层解锁）
export function getDefaultLayerStates(): Record<number, LayerState> {
  const states: Record<number, LayerState> = {};
  for (let i = 1; i <= 9; i++) {
    states[i] = {
      unlocked: i === 1,
      completed: false,
      progress: 0
    };
  }
  return states;
}
```

## 验收标准
- [ ] LayerMetadata类型定义完整
- [ ] 9层元数据实现正确（名称、颜色、主题、5个特色功能）
- [ ] 热区配置数据准确（bottom从8%到90%，width从82%到23%）
- [ ] layerRegistry导出函数可用
- [ ] TypeScript编译无错误
