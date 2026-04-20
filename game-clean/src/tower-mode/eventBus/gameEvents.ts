// F组 Round 6 - 结构化游戏事件映射
// 定义跨组通信的事件类型

// 基础类型（实际类型来自其他组，此处为简化接口）
interface BattleResult {
  victory: boolean;
  rewards: unknown[];
}

interface BattleSetup {
  levelId: string;
  cellId: string;
}

// D组 Round 7 - 轨迹点类型
export interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  opacity: number;
}

// D组 → E组+F组 (engine → UI + flow)
interface EngineToUIEvents {
  'battle:end': { result: BattleResult; cellId: string };
  'battle:start': { setup: BattleSetup; cellId: string };
  'map:flip': { topology: unknown; flipCount: number };
  'state:change': { state: unknown };
  'position:change': { fromCellId: string; toCellId: string };
  'technicalValue:change': { oldValue: number; newValue: number };
  'milestone:reached': { milestone: unknown };
  'game:over': { reason: string };
  'layer:transition': { fromLayer: number; toLayer: number };
}

// E组 → D组 (UI → engine)
interface UIToEngineEvents {
  'cell:click': { cellId: string };
  'path:select': { pathIndex: number };
  'dice:roll': {};
}

// D组 → E组 (L7/L8 dynamic updates)
interface DynamicUpdateEvents {
  'dynamic:shift': { shiftedCells: string[]; newPositions: Record<string, [number, number]> };
  'dynamic:collapse': { activated: string[]; deactivated: string[] };
}

// D组 Round 7 - 移动动画事件 (D组 → E组)
interface PieceMoveEvents {
  'piece:move:start': { fromCellId: string; toCellId: string; pathLength: number };
  'piece:move:update': { position: { x: number; y: number }; progress: number; trail: TrailPoint[] };
  'piece:move:end': { arrivedCellId: string; trail: TrailPoint[] };
  'cell:enter': { cellId: string; zoneType?: string };
  'zone:effect:trigger': { zoneType: string; cellId: string };
}

// 合并所有事件域
export type GameEventMap = EngineToUIEvents & UIToEngineEvents & DynamicUpdateEvents & PieceMoveEvents;

// 导出基础类型供外部使用
export type { BattleResult, BattleSetup };
export type { EngineToUIEvents, UIToEngineEvents, DynamicUpdateEvents, PieceMoveEvents };
