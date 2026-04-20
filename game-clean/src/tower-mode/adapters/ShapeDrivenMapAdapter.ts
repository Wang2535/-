import { GourdShapeFactory } from '../geometry/GourdShapeFactory';
import { PerLayerTopologyGenerator } from '../geometry/PerLayerTopologyGenerator';
import type { LayerShapeConfig } from '../types/gourdShapeVariants.types';
import type { GeneratedTopology } from '../geometry/PerLayerTopologyGenerator';
import type { GourdMapTopology, GridCell, GridPathConnection } from '../types/grid.types';
import { GridType, GridState, AreaEffectType, GridPathType } from '../types/grid.types';

export interface LayerRenderData {
  topology: GourdMapTopology;
  shapeConfig: LayerShapeConfig;
  cells: GridCell[];
}

const MECHANIC_TYPE_MAP: Record<number, string> = {
  1: 'acceleration',
  2: 'jump',
  3: 'sequence',
  4: 'event',
  5: 'blockade',
  6: 'teleport',
  7: 'drift',
  8: 'collapse',
  9: 'protocol',
};

const THEME_NAME_MAP: Record<number, string> = {
  1: '病毒实验室',
  2: '赛博空间',
  3: '数据金库',
  4: '城市街区',
  5: '智能工厂',
  6: '移动终端',
  7: '云端平台',
  8: '未来实验室',
  9: '指挥中心',
};

function mapCellType(type: string): GridType {
  const map: Record<string, GridType> = {
    start: GridType.START,
    boss: GridType.BOSS,
    level: GridType.LEVEL,
    battle: GridType.LEVEL,
    bookstore: GridType.BOOKSTORE,
    skill: GridType.SKILL,
    exchange: GridType.EXCHANGE,
    opportunity: GridType.OPPORTUNITY,
    chance: GridType.OPPORTUNITY,
    special: GridType.SPECIAL,
    elite: GridType.LEVEL,
    locked: GridType.LEVEL,
    transition: GridType.TRANSITION,
    end: GridType.SPECIAL,
  };
  return map[type] ?? GridType.LEVEL;
}

function mapPathType(type: string): GridPathType {
  const map: Record<string, GridPathType> = {
    main: GridPathType.MAIN,
    branch: GridPathType.BRANCH,
    shortcut: GridPathType.SHORTCUT,
    return: GridPathType.RETURN,
    crossRing: GridPathType.CROSS_RING,
    safeDoor: GridPathType.SAFE_DOOR,
    hidden: GridPathType.SHORTCUT,
    collapsing: GridPathType.BRANCH,
  };
  return map[type] ?? GridPathType.MAIN;
}

const ZONE_EFFECT_MAP: Record<string, { type: AreaEffectType; color: string; animationClass: string; description: string }> = {
  W: { type: AreaEffectType.WEAK, color: '#ff4444', animationClass: 'zone-pulse-w', description: '虚弱区' },
  N: { type: AreaEffectType.KNOWLEDGE, color: '#4488ff', animationClass: 'zone-glow-n', description: '知识区' },
  I: { type: AreaEffectType.INVERT, color: '#9944ff', animationClass: 'zone-invert', description: '反转区' },
  P: { type: AreaEffectType.SKIP, color: '#ffcc00', animationClass: 'zone-clock', description: '跳过区' },
  S: { type: AreaEffectType.SPEED, color: '#44ff88', animationClass: 'zone-flash-s', description: '加速区' },
  D: { type: AreaEffectType.DANGER, color: '#ff2222', animationClass: 'zone-warning-d', description: '危险区' },
};

function mapZoneIdToAreaEffect(zoneId: string | undefined): AreaEffect[] {
  if (!zoneId) return [];
  const upperKey = zoneId.toUpperCase().charAt(0);
  const effect = ZONE_EFFECT_MAP[upperKey] ?? ZONE_EFFECT_MAP[zoneId];
  if (!effect) {
    const fallbackType = AreaEffectType.WEAK as any;
    return [{ type: fallbackType, color: '#888888', animationClass: '', description: zoneId }];
  }
  return [effect];
}

function getQuadrantFromPosition(x: number, y: number): AreaEffectType {
  if (x < 50) return y < 60 ? AreaEffectType.WEAK : AreaEffectType.SKIP;
  return y < 60 ? AreaEffectType.KNOWLEDGE : AreaEffectType.INVERT;
}

export class ShapeDrivenMapAdapter {

  static buildRenderTopology(layerNumber: number): GourdMapTopology {
    const shapeConfig = GourdShapeFactory.generate({
      layerNumber,
      mechanicType: this.getMechanicType(layerNumber),
      themeName: this.getThemeName(layerNumber),
      difficulty: layerNumber,
    });

    const topology = PerLayerTopologyGenerator.generate(layerNumber, shapeConfig);
    const cells = this.toGridCells(layerNumber, topology);

    return this.toGourdMapTopology(layerNumber, shapeConfig, topology, cells);
  }

  static buildLayerRenderData(layerNumber: number): LayerRenderData {
    const shapeConfig = GourdShapeFactory.generate({
      layerNumber,
      mechanicType: this.getMechanicType(layerNumber),
      themeName: this.getThemeName(layerNumber),
      difficulty: layerNumber,
    });

    const generated = PerLayerTopologyGenerator.generate(layerNumber, shapeConfig);
    const cells = this.toGridCells(layerNumber, generated);
    const topology = this.toGourdMapTopology(layerNumber, shapeConfig, generated, cells);

    return { topology, shapeConfig, cells };
  }

  static getShapeConfig(layerNumber: number): LayerShapeConfig {
    return GourdShapeFactory.generate({
      layerNumber,
      mechanicType: this.getMechanicType(layerNumber),
      themeName: this.getThemeName(layerNumber),
      difficulty: layerNumber,
    });
  }

  static getMechanicType(layerNumber: number): string {
    return MECHANIC_TYPE_MAP[layerNumber] ?? 'acceleration';
  }

  static getThemeName(layerNumber: number): string {
    return THEME_NAME_MAP[layerNumber] ?? '未知';
  }

  private static toGourdMapTopology(
    layerNumber: number,
    shapeConfig: LayerShapeConfig,
    topology: GeneratedTopology,
    cells: GridCell[],
  ): GourdMapTopology {
    const uc = shapeConfig.upperCircle;
    const lc = shapeConfig.lowerCircle;

    const upperCellIds: string[] = [];
    const connectorCellIds: string[] = [];
    const lowerCellIds: string[] = [];

    for (const cell of topology.cells) {
      const region = cell.region;
      if (region === 'UPPER_CIRCLE') {
        upperCellIds.push(cell.id);
      } else if (region === 'CONNECTOR') {
        connectorCellIds.push(cell.id);
      } else {
        lowerCellIds.push(cell.id);
      }
    }

    const connections: GridPathConnection[] = topology.connections.map((c, idx) => ({
      id: c.id,
      fromCellId: c.from,
      toCellId: c.to,
      pathType: mapPathType(c.type),
      bidirectional: true,
      distance: 1,
      condition: undefined,
      visualStyle: c.visualStyle
        ? {
            color: c.visualStyle.strokeColor,
            width: c.visualStyle.strokeWidth,
            dashArray: c.visualStyle.dashArray
              ? c.visualStyle.dashArray.split(' ').map(Number)
              : undefined,
            animated: c.visualStyle.animated,
          }
        : undefined,
    }));

    const cellsByType: Partial<Record<GridType, number>> = {};
    for (const cell of topology.cells) {
      const gt = mapCellType(cell.type);
      cellsByType[gt] = (cellsByType[gt] ?? 0) + 1;
    }

    const lowerQuadrantCells = topology.cells.filter(c => c.region === 'LOWER_CIRCLE');
    const quadrants = {
      1: getQuadrantFromPosition(35, 55),
      2: getQuadrantFromPosition(65, 55),
      3: getQuadrantFromPosition(35, 70),
      4: getQuadrantFromPosition(65, 70),
    };

    return {
      layer: layerNumber,
      cells,
      upperCircle: {
        cellIds: upperCellIds,
        center: { x: uc.center.x, y: uc.center.y },
        radius: uc.radius,
      },
      connector: {
        cellIds: connectorCellIds,
        width: shapeConfig.connector.width,
      },
      lowerCircle: {
        cellIds: lowerCellIds,
        center: { x: lc.center.x, y: lc.center.y },
        radius: lc.radiusX,
        quadrants,
      },
      connections,
      stats: {
        totalCells: topology.cells.length,
        cellsByType,
        avgPathLength: 1,
        loopPaths: 0,
      },
    };
  }

  static buildAllLayers(): Record<number, GourdMapTopology> {
    const result: Record<number, GourdMapTopology> = {};
    for (let i = 1; i <= 9; i++) {
      result[i] = this.buildRenderTopology(i);
    }
    return result;
  }

  private static toGridCells(layerNumber: number, topology: GeneratedTopology): GridCell[] {
    return topology.cells.map(gc => {
      const section = gc.region === 'UPPER_CIRCLE' ? 'upper' as const
        : gc.region === 'CONNECTOR' ? 'connector' as const
        : 'lower' as const;
      return {
        id: gc.id,
        layer: layerNumber,
        type: mapCellType(gc.type),
        state: gc.type === 'start' ? GridState.CURRENT : GridState.LOCKED,
        coordinate: { x: gc.position.x, y: gc.position.y, section },
        difficulty: gc.difficulty ?? Math.min(5, Math.max(1, Math.ceil(layerNumber / 2))) as 1 | 2 | 3 | 4 | 5,
        areaEffects: mapZoneIdToAreaEffect(gc.zoneId),
        adjacentCells: [],
        eliteMarker: gc.isElite ? {
          isElite: true,
          borderStyle: 'double',
          icon: 'skull',
          penaltyMultiplier: 1.5,
          rewardMultiplier: 2.0,
        } : undefined,
      };
    });
  }
}
