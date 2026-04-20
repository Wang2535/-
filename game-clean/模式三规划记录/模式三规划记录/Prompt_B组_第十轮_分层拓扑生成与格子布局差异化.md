# B组第十轮 — 分层拓扑生成器 + 格子布局差异化

## 🔴🔴🔴 让每层的**格子数量、分布位置、连接关系**各不相同

## 背景

A组解决了"形状不同"的问题（葫芦形变体工厂），但形状只是轮廓。**真正的分地图差异还体现在内部内容上**：

当前所有9层都是：
- 固定20格 (6上圆 + 2连接 + 12下圆)
- 相同的连接路径
- 相同的格子类型分布

设想要求：
- L2网络空间应有**密集节点簇**(30+小格，代表网络节点)
- L4城市街区应有多个**独立区域**(街区之间需要"街道"连接)
- L6移动终端应有**六角网格迷宫**(路径不直观)
- L8未来实验室应有**动态消失的路径**(坍缩机制视觉化)

## 具体任务

### Task B1: ★★★ P0 — PerLayerTopologyGenerator 分层拓扑生成器

**新建文件**: `src/tower-mode/geometry/PerLayerTopologyGenerator.ts`

```typescript
/**
 * PerLayerTopologyGenerator — 分层拓扑生成器
 * 
 * 为每一层生成独特的:
 * 1. cells 数组(格子ID、类型、坐标、所属区域)
 * 2. connections 数组(连接关系、类型、可视样式)
 * 3. zoneAssignments 区域归属映射
 */

import type { LayerShapeConfig } from '../types/gourdShapeVariants.types';
import { GourdRegion } from './gourdShapes';

export interface GeneratedTopology {
  cells: Array<{
    id: string;
    type: 'start' | 'level' | 'battle' | 'boss' | 'bookstore' | 'skill' 
        | 'exchange' | 'opportunity' | 'chance' | 'special' | 'elite' 
        | 'locked' | 'transition' | 'end';
    region: GourdRegion;
    position: { x: number; y: number };  // 归一化坐标 0-100
    zoneId?: string;  // 所属子区域(用于非标准分区)
    difficulty?: number;
    isElite?: boolean;
  }>;
  connections: Array<{
    id: string;
    from: string;
    to: string;
    type: 'main' | 'branch' | 'shortcut' | 'return' | 'crossRing' | 'safeDoor' | 'hidden' | 'collapsing';
    visualStyle?: {
      strokeColor: string;
      strokeWidth: number;
      dashArray?: string;
      animated?: boolean;
    };
  }>;
  zoneInfo: Record<string, {
    id: string;
    label: string;
    cellIds: string[];
    centerPosition: { x: number; y: number };
  }>;
  startCellId: string;
  bossCellId: string;
}

/** 每层拓扑模板 */
const LAYER_TOPOLOGY_TEMPLATES: Record<number, (shape: LayerShapeConfig) => GeneratedTopology> = {
  1: generateL1Standard,     // 标准布局(基准)
  2: generateL2DenseNetwork, // 密集网络节点
  3: generateL3TripleRing,   // 三环顺序
  4: generateL4CityDistricts,// 城市街区多区
  5: generateL5FactoryLine,  // 流水线传送带
  6: generateL6HexMaze,      // 六角迷宫
  7: generateL7CloudDrift,   // 云端漂移
  8: generateL8CollapseLab,  // 坍缩动态
  9: generateL9Palace,       // 宫殿终极
};

// ========== 各层拓扑生成函数 ==========

/** L1: 标准布局（与第九轮保持兼容） */
function generateL1Standard(shape: LayerShapeConfig): GeneratedTopology {
  const cells = [
    // 上圆(6格): 起点 + 5个过渡格
    { id: 'U0', type: 'start', region: GourdRegion.UPPER_CIRCLE, position: { x: 50, y: shape.upperCircle.center.y - shape.upperCircle.radius * 0.75 } },
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `U${i+1}`, type: 'level' as const, region: GourdRegion.UPPER_CIRCLE,
      position: polarToCartesian(
        shape.upperCircle.center, shape.upperCircle.radius * 0.75,
        -Math.PI/2 + (i+1) * (Math.PI / 3)
      ),
    })),
    // 连接(2格)
    { id: 'C0', type: 'level', region: GourdRegion.CONNECTOR, position: { x: 47, y: shape.upperCircle.center.y + shape.upperCircle.radius * 0.75 } },
    { id: 'C1', type: 'level', region: GourdRegion.CONNECTOR, position: { x: 53, y: shape.lowerCircle.center.y - shape.lowerCircle.radiusY * 0.75 } },
    // 下圆(12格): W区4+N区2+I区2+P区2+Boss
    { id: 'L0', type: 'battle', region: GourdRegion.LOWER_CIRCLE, position: { x: 35, y: 52 }, zoneId: 'W' },
    { id: 'L1', type: 'level', region: GourdRegion.LOWER_CIRCLE, position: { x: 30, y: 58 }, zoneId: 'W' },
    { id: 'L2', type: 'opportunity', region: GourdRegion.LOWER_CIRCLE, position: { x: 33, y: 66 }, zoneId: 'W' },
    { id: 'L3', type: 'skill', region: GourdRegion.LOWER_CIRCLE, position: { x: 42, y: 72 }, zoneId: 'W' },
    { id: 'L4', type: 'bookstore', region: GourdRegion.LOWER_CIRCLE, position: { x: 58, y: 52 }, zoneId: 'N' },
    { id: 'L5', type: 'exchange', region: GourdRegion.LOWER_CIRCLE, position: { x: 65, y: 60 }, zoneId: 'N' },
    { id: 'L6', type: 'chance', region: GourdRegion.LOWER_CIRCLE, position: { x: 62, y: 68 }, zoneId: 'I' },
    { id: 'L7', type: 'special', region: GourdRegion.LOWER_CIRCLE, position: { x: 55, y: 75 }, zoneId: 'I' },
    { id: 'L8', type: 'elite', region: GourdRegion.LOWER_CIRCLE, position: { x: 40, y: 78 }, zoneId: 'P' },
    { id: 'L9', type: 'level', region: GourdRegion.LOWER_CIRCLE, position: { x: 50, y: 80 }, zoneId: 'P' },
    { id: 'L10', type: 'chance', region: GourdRegion.LOWER_CIRCLE, position: { x: 62, y: 78 }, zoneId: 'P' },
    { id: 'L11', type: 'boss', region: GourdRegion.LOWER_CIRCLE, position: { x: 50, y: shape.lowerCircle.center.y + shape.lowerCircle.radiusY * 0.7 }, zoneId: 'P' },
  ];

  const connections = [
    { id: 'c1', from: 'U0', to: 'U1', type: 'main' as const },
    { id: 'c2', from: 'U1', to: 'U2', type: 'main' as const },
    { id: 'c3', from: 'U2', to: 'U3', type: 'main' as const },
    { id: 'c4', from: 'U3', to: 'U4', type: 'main' as const },
    { id: 'c5', from: 'U4', to: 'U5', type: 'main' as const },
    { id: 'c6', from: 'U5', to: 'C0', type: 'main' as const },
    { id: 'c7', from: 'C0', to: 'C1', type: 'main' as const },
    { id: 'c8', from: 'C1', to: 'L0', type: 'main' as const },
    { id: 'c9', from: 'L0', to: 'L1', type: 'main' as const },
    { id: 'c10', from: 'L1', to: 'L2', type: 'main' as const },
    { id: 'c11', from: 'L2', to: 'L3', type: 'main' as const },
    // W→N 跨区
    { id: 'c-cross-1', from: 'L3', to: 'L4', type: 'crossRing' as const, visualStyle: { strokeColor: '#FFD700', strokeWidth: 2, dashArray: '6 3', animated: true } },
    { id: 'c12', from: 'L4', to: 'L5', type: 'main' as const },
    { id: 'c13', from: 'L5', to: 'L6', type: 'main' as const },
    // N→I 跨区
    { id: 'c-cross-2', from: 'L6', to: 'L7', type: 'crossRing' as const, visualStyle: { strokeColor: '#FFD700', strokeWidth: 2, dashArray: '6 3', animated: true } },
    { id: 'c14', from: 'L7', to: 'L8', type: 'main' as const },
    // I→P 跨区
    { id: 'c-cross-3', from: 'L8', to: 'L9', type: 'crossRing' as const, visualStyle: { strokeColor: '#FFD700', strokeWidth: 2, dashArray: '6 3', animated: true } },
    { id: 'c15', from: 'L9', to: 'L10', type: 'main' as const },
    { id: 'c16', from: 'L10', to: 'L11', type: 'main' as const },
    // 分叉: L3处可跳到skill(L3→L7捷径)
    { id: 'c-shortcut-1', from: 'L2', to: 'L7', type: 'shortcut' as const, visualStyle: { strokeColor: '#00FF88', strokeWidth: 1.5, dashArray: '4 4', animated: true } },
  ];

  return { cells, connections, zoneInfo: buildZoneInfo(cells), startCellId: 'U0', bossCellId: 'L11' };
}

/** L2: 密集网络空间 — 30+小格，代表网络节点 */
function generateL2DenseNetwork(shape: LayerShapeConfig): GeneratedTopology {
  // 下圆扩展为更宽的区域，放置更多格子
  const lc = shape.lowerCircle;
  const cells: GeneratedTopology['cells'] = [];
  
  // 上圆: 入口节点群(8个小节点)
  for (let i = 0; i < 8; i++) {
    const angle = -Math.PI/2 + (i * Math.PI / 7);
    cells.push({
      id: `N${i}`, type: i === 0 ? 'start' : 'level',
      region: GourdRegion.UPPER_CIRCLE,
      position: polarToCartesian(shape.upperCircle.center, shape.upperCircle.radius * 0.72, angle),
    });
  }

  // 连接: 多条光缆通道(4格)
  for (let i = 0; i < 4; i++) {
    cells.push({
      id: `F${i}`, type: 'level',
      region: GourdRegion.CONNECTOR,
      position: { x: 44 + i * 4, y: shape.upperCircle.center.y + 10 + i * 5 },
    });
  }

  // 下圆: 密集节点簇(22格) — 分布在扩展的下圆区域内
  const nodePositions = [
    // 外环节点(12个)
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `M${i}`, type: ['battle','level','opportunity','skill','exchange','chance'][i % 6] as any,
      region: GourdRegion.LOWER_CIRCLE,
      position: polarToCartesian(lc.center, Math.min(lc.radiusX, lc.radiusY) * 0.85, (i * Math.PI / 6) - Math.PI/2),
    })),
    // 内环节点(8个)
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `C${i}`, type: ['level','bookstore','special','elite','level','chance','skill','level'][i] as any,
      region: GourdRegion.LOWER_CIRCLE,
      position: polarToCartesian(lc.center, Math.min(lc.radiusX, lc.radiusY) * 0.5, (i * Math.PI / 4) - Math.PI/4),
    })),
    // 核心节点(Boss)
    { id: 'BOSS', type: 'boss', region: GourdRegion.LOWER_CIRCLE, position: { ...lc.center } },
  ];
  cells.push(...nodePositions);

  // 连接: 网状互联（每个节点连接2-4个邻居）
  const connections: GeneratedTopology['connections'] = [];
  
  // 上圆环形连接
  for (let i = 0; i < 8; i++) {
    connections.push({ id: `n-${i}-${(i+1)%8}`, from: `N${i}`, to: `N${(i+1)%8}`, type: 'main' });
  }
  // 上圆到连接层
  connections.push({ id: 'n-f0', from: 'N5', to: 'F0', type: 'main' });
  for (let i = 0; i < 3; i++) {
    connections.push({ id: `f-${i}`, from: `F${i}`, to: `F${i+1}`, type: 'main' });
  }
  // 连接到下圆外环
  connections.push({ id: 'f-m', from: 'F3', to: 'M0', type: 'main' });
  // 下圆外环连接
  for (let i = 0; i < 12; i++) {
    connections.push({ id: `m-${i}-${(i+1)%12}`, from: `M${i}`, to: `M${(i+1)%12}`, type: 'main' });
  }
  // 外环到内环(辐射连接，每3个外环节点连一个内环)
  for (let i = 0; i < 8; i++) {
    connections.push({ id: `m-c-${i}`, from: `M${i * 1.5 | 0}`, to: `C${i}`, type: 'branch' });
  }
  // 内环连接
  for (let i = 0; i < 8; i++) {
    connections.push({ id: `c-${i}-${(i+1)%8}`, from: `C${i}`, to: `C${(i+1)%8}`, type: 'main' });
  }
  // 内环到Boss
  for (let i = 0; i < 8; i += 2) {
    connections.push({ id: `c-boss-${i}`, from: `C${i}`, to: 'BOSS', type: 'main' });
  }
  // 跳跃连接(体现jump机制): 远距离快捷路径
  connections.push({ id: 'jump-1', from: 'M0', to: 'M6', type: 'shortcut', visualStyle: { strokeColor: '#00FFFF', strokeWidth: 1.5, dashArray: '3 5', animated: true }});
  connections.push({ id: 'jump-2', from: 'M3', to: 'M9', type: 'shortcut', visualStyle: { strokeColor: '#00FFFF', strokeWidth: 1.5, dashArray: '3 5', animated: true }});

  return { cells, connections, zoneInfo: buildZoneInfo(cells), startCellId: 'N0', bossCellId: 'BOSS' };
}

/** L6: 六角迷宫 — 蜂窝状格子排列 + 迷惑性连接 */
function generateL6HexMaze(shape: LayerShapeConfig): GeneratedTopology {
  const lc = shape.lowerCircle;
  const cells: GeneratedTopology['cells'] = [];

  // 上圆: 6个入口(六角形顶点方向)
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI / 3) - Math.PI/2;
    cells.push({
      id: `H${i}`, type: i === 0 ? 'start' : 'level',
      region: GourdRegion.UPPER_CIRCLE,
      position: polarToCartesian(shape.upperCircle.center, shape.upperCircle.radius * 0.7, angle),
    });
  }

  // 连接通道(3格)
  for (let i = 0; i < 3; i++) {
    cells.push({
      id: `P${i}`, type: 'level', region: GourdRegion.CONNECTOR,
      position: { x: 43 + i * 7, y: shape.upperCircle.center.y + 12 + i * 6 },
    });
  }

  // 下圆: 六角蜂窝网格(约28格)
  const hexCells = generateHexGridCells(lc.center, Math.min(lc.radiusX, lc.radiusY) * 0.82, 28);
  hexCells[hexCells.length - 1].type = 'boss';  // 最后一个是Boss
  cells.push(...hexCells);

  // 六角迷宫连接: 每个格子连接周围2-3个邻居(不是全部6个，制造迷路感)
  const connections = generateHexMazeConnections(hexCells);

  // 加入上圆和连接区域的连接
  for (let i = 0; i < 5; i++) connections.push({ id: `h-${i}`, from: `H${i}`, to: `H${i+1}`, type: 'main' });
  connections.push({ id: 'h-last', from: 'H5', to: 'P0', type: 'main' });
  for (let i = 0; i < 2; i++) connections.push({ id: `p-${i}`, from: `P${i}`, to: `P${i+1}`, type: 'main' });
  connections.push({ id: 'p-to-hex', from: 'P2', to: hexCells[0].id, type: 'main' });

  // 随机传送门(teleport机制的视觉化): 几对随机配对的格子
  const teleportPairs = [[3, 15], [7, 22], [11, 18]];
  for (const [a, b] of teleportPairs) {
    if (hexCells[a] && hexCells[b]) {
      connections.push({
        id: `teleport-${a}-${b}`,
        from: hexCells[a].id, to: hexCells[b].type !== 'boss' ? hexCells[b].id : hexCells[a].id,
        type: 'hidden',
        visualStyle: { strokeColor: '#E040FB', strokeWidth: 1, dashArray: '2 6', animated: true },
      });
    }
  }

  return { cells, connections, zoneInfo: buildHexZoneInfo(hexCells), startCellId: 'H0', bossCellId: hexCells[hexCells.length-1].id };
}

// ... (L3/L4/L5/L7/L8/L9 的生成函数类似，各有特色)

// ========== 辅助函数 ==========

function polarToCartesian(center: {x:number;y:number}, radius: number, angle: number): {x:number;y:number} {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
}

function generateHexGridCells(center: {x:number;y:number}, maxRadius: number, count: number) {
  const cells: GeneratedTopology['cells'] = [];
  const spacing = maxRadius / Math.sqrt(count / 0.9);  // 蜂窝密度
  
  let ring = 0;
  let idx = 0;
  while (idx < count) {
    const r = spacing * ring;
    const countInThisRing = ring === 0 ? 1 : ring * 6;
    
    for (let i = 0; i < countInThisRing && idx < count; i++) {
      const angle = ring === 0 ? 0 : (i / countInThisRing) * Math.PI * 2 + (ring % 2) * (Math.PI / 6);
      cells.push({
        id: `X${idx}`,
        type: ['level','battle','opportunity','skill','chance','elite','bookstore','special'][idx % 8] as any,
        region: GourdRegion.LOWER_CIRCLE,
        position: { x: center.x + r * Math.cos(angle), y: center.y + r * Math.sin(angle) },
        zoneId: `hex-${(i % 6) + 1}`,
      });
      idx++;
    }
    ring++;
  }
  return cells;
}

function generateHexMazeConnections(cells: GeneratedTopology['cells']): GeneratedTopology['connections'] {
  const conns: GeneratedTopology['connections'] = [];
  for (let i = 0; i < cells.length; i++) {
    // 找最近的2-3个邻居连接(制造迷宫感，不全连通)
    const neighbors = findNearestN(cells, i, 2 + (i % 2));
    for (const n of neighbors) {
      if (n > i) {  // 避免重复
        conns.push({
          id: `x-${i}-${n}`,
          from: cells[i].id, to: cells[n].id,
          type: Math.random() > 0.7 ? 'branch' : 'main',
          visualStyle: { strokeColor: '#00BCD4', strokeWidth: 0.8 },
        });
      }
    }
  }
  return conns;
}

function findNearestN(cells: GeneratedTopology['cells'], idx: number, n: number): number[] {
  const dists = cells.map((c, i) => i === idx ? Infinity : 
    Math.hypot(c.position.x - cells[idx].position.x, c.position.y - cells[idx].position.y));
  return dists.map((d, i) => ({ d, i })).sort((a,b) => a.d - b.d).slice(0, n).map(x => x.i);
}

function buildZoneInfo(cells: GeneratedTopology['cells']): Record<string, any> {
  const zones: Record<string, any> = {};
  for (const cell of cells) {
    const zid = cell.zoneId ?? (cell.position.x < 50 ? (cell.position.y < 60 ? 'W' : (cell.position.x < 38 ? 'W' : 'P')) : (cell.position.y < 60 ? 'N' : 'I'));
    if (!zones[zid]) zones[zid] = { id: zid, label: zid.toUpperCase(), cellIds: [], centerPosition: { x: 0, y: 0 } };
    zones[zid].cellIds.push(cell.id);
    zones[zid].centerPosition.x += cell.position.x;
    zones[zid].centerPosition.y += cell.position.y;
  }
  for (const z of Object.values(zones) as any[]) {
    const len = z.cellIds.length || 1;
    z.centerPosition.x /= len;
    z.centerPosition.y /= len;
  }
  return zones;
}

function buildHexZoneInfo(cells: GeneratedTopology['cells']): Record<string, any> {
  return buildZoneInfo(cells);  // 复用通用逻辑
}

export class PerLayerTopologyGenerator {
  static generate(layerNumber: number, shape: LayerShapeConfig): GeneratedTopology {
    const generator = LAYER_TOPOLOGY_TEMPLATES[layerNumber];
    if (!generator) {
      console.warn(`No topology template for layer ${layerNumber}`);
      return generateL1Standard(shape);
    }
    return generator(shape);
  }

  static getCellCount(layerNumber: number): number {
    const counts: Record<number, number> = { 1:20, 2:34, 3:24, 4:26, 5:24, 6:37, 7:23, 8:22, 9:32 };
    return counts[layerNumber] ?? 20;
  }
}
```

### Task B2: ★★☆ P1 — SubZoneRenderer 子区域渲染器

**新建文件**: `src/tower-mode/components/GourdMapRenderer/SubZoneLayer.tsx`

为使用非标准四象限分区的层(L3三环/L4街块/L5流水线/L6六角/L7云状/L8坍缩/L9宫殿)渲染自定义子区域：

```tsx
/**
 * SubZoneLayer — 自定义子区域渲染
 * 
 * 当 LayerShapeConfig.lowerCircle.subZones 存在时，
 * 渲染非标准W/N/I/P四象限的区域划分。
 * 支持: sector(扇形)/rect(矩形)/polygon(多边形)/irregular(不规则)/circle(圆形)
 */

interface SubZoneLayerProps {
  subZones: LayerShapeConfig['lowerCircle']['subZones'];
  activeZoneId?: string;
}

export function SubZoneLayer({ subZones, activeZoneId }: SubZoneLayerProps) {
  if (!subZones || subZones.length === 0) return null;

  return (
    <g className="sub-zone-layer" pointerEvents="none">
      {subZones.map(zone => (
        <g key={zone.id} className={`sub-zone ${zone.id} ${activeZoneId === zone.id ? 'active' : ''}`}>
          {zone.shape === 'sector' && (
            <path
              d={describeSectorArc(
                50, 64,  // 近似中心
                34, zone.startAngle ?? 0, zone.endAngle ?? 360
              )}
              fill={zone.color}
              opacity={activeZoneId === zone.id ? 0.25 : 0.12}
              stroke={zone.color}
              strokeWidth={activeZoneId === zone.id ? 1.2 : 0.4}
            />
          )}
          {zone.shape === 'rect' && (
            <rect x="26" y={zone.id.includes('loading')?48:zone.id.includes('processing')?56:zone.id.includes('inspection')?64:72} 
                  width="48" height="12" rx="3"
                  fill={zone.color} opacity="0.12" stroke={zone.color} strokeWidth="0.4" />
          )}
          {zone.shape === 'polygon' && zone.points && (
            <polygon
              points={zone.points.map(p => `${p.x},${p.y}`).join(' ')}
              fill={zone.color} opacity="0.12" stroke={zone.color} strokeWidth="0.4"
            />
          )}
          {zone.shape === 'circle' && (
            <circle cx="50" cy="64" r="10" fill={zone.color} opacity="0.2" stroke={zone.color} strokeWidth="0.8" />
          )}
          {/* 区域标签 */}
          <text x={getZoneLabelPos(zone).x} y={getZoneLabelPos(zone).y}
                textAnchor="middle" fontSize="3%" fontWeight="900"
                fill={zone.color.replace(/[\d.]+\)$/, '0.7)')}
                opacity="0.5">
            {zone.label}
          </text>
        </g>
      ))}
    </g>
  );
}
```

### Task B3: ★★☆ P1 — 更新 assembleFullTopologyV3 集成新数据

修改 C 组的组装函数，使其消费 A 组的 LayerShapeConfig 和 B 组的 GeneratedTopology：

```typescript
// 在 assembleFullTopologyV3 中增加:
import { GourdShapeFactory } from '../geometry/GourdShapeFactory';
import { PerLayerTopologyGenerator } from '../geometry/PerLayerTopologyGenerator';

export function assembleFullTopologyV3(layerNumber: number): RenderableGourdMapTopologyV3 {
  // 1. 获取形状配置(A组)
  const shapeConfig = GourdShapeFactory.generate({ layerNumber, mechanicType: '', themeName: '', difficulty: layerNumber });
  
  // 2. 生成拓扑(B组) — 使用新的格子布局和连接方式
  const generatedTopo = PerLayerTopologyGenerator.generate(layerNumber, shapeConfig);
  
  // 3. 合并到原有结构
  return {
    ...baseTopology,
    // 用生成的cells和connections覆盖原有的固定值
    cells: generatedTopo.cells,
    connections: generatedTopo.connections,
    // 新增字段
    shapeConfig,
    zoneInfo: generatedTopo.zoneInfo,
    startCellId: generatedTopo.startCellId,
    bossCellId: generatedTopo.bossCellId,
    // ...其余字段保持不变
  };
}
```

## 第十轮B组改动总览

| 任务 | 对应Gap | 改动内容 |
|------|---------|---------|
| **B1** | **Gap-P0-2核心** | PerLayerTopologyGenerator + 9种独立拓扑生成函数(L1标准20格/L2密集34格/L6六角37格等) |
| **B2** | Gap-P1-1 | SubZoneRenderer支持sector/rect/polygon/circle/irregular 5种子区域形状 |
| **B3** | — | assembleFullTopologyV3集成A/B两组新数据 |

## 各层格子数量对比

| 层级 | 第九轮(相同) | 第十轮(差异化) | 增量 | 特色 |
|------|-------------|---------------|------|------|
| L1 | 20 | 20 | 0 | 标准基准 |
| L2 | 20 | **~34** | +70% | 密集网络节点 |
| L3 | 20 | **~24** | +20% | 三环嵌套 |
| L4 | 20 | **~26** | +30% | 多街区分散 |
| L5 | 20 | **~24** | +20% | 传送带长条 |
| L6 | 20 | **~37** | +85% | **六角迷宫最多** |
| L7 | 20 | **~23** | +15% | 不规则云状 |
| L8 | 20 | **~22** | +10% | 不对称坍缩 |
| L9 | 20 | **~32** | +60% | 宫殿扩展 |

## 验收标准

1. ✅ L2生成的拓扑包含34+个格子（远超标准的20）
2. ✅ L6生成的拓扑包含六角形排列的格子（从坐标可见蜂窝状分布）
3. ✅ L6包含`type:'hidden'`的传送门连接（teleport机制可视化）
4. ✅ L8的格子整体偏移不对称（center.x ≠ 50）
5. ✅ L3的zoneInfo包含outer/mid/core三个子区域
6. ✅ L4的zoneInfo包含4个polygon类型的街区子区域
7. ✅ 所有层的 startCellId 和 bossCellId 正确设置
8. ✅ TypeScript 编译零错误
