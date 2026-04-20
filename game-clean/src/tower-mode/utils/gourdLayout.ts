import type {
  GridCell,
  GridCoordinate,
  GridPathConnection,
  GourdMapTopology,
  GourdMapParameters,
  AreaEffectType,
  AreaEffect,
  GridType,
  GridState,
} from '../types/grid.types';
import type { LayerMapTemplate } from '../data/mapTemplates';
import type { SvgPathData } from '../types/grid.types';

export class GourdLayoutGenerator {

  calculateGourdPoint(
    angle: number,
    params: GourdMapParameters
  ): { x: number; y: number; section: 'upper' | 'lower' } {
    const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const isUpper = normalizedAngle > Math.PI * 0.75 && normalizedAngle < Math.PI * 1.25;

    if (isUpper) {
      const localAngle = normalizedAngle - Math.PI;
      const rx = params.upperRadius * (1 + params.upperEccentricity);
      const ry = params.upperRadius;
      const x = 50 + rx * Math.cos(localAngle + (params.rotation * Math.PI / 180));
      const y = params.upperCenterY + ry * Math.sin(localAngle + (params.rotation * Math.PI / 180));
      return { x, y, section: 'upper' };
    }

    const rx = params.lowerRadius * (1 + params.lowerEccentricity);
    const ry = params.lowerRadius;
    const x = 50 + rx * Math.cos(normalizedAngle + (params.rotation * Math.PI / 180));
    const y = params.lowerCenterY + ry * Math.sin(normalizedAngle + (params.rotation * Math.PI / 180));
    return { x, y, section: 'lower' };
  }

  generateGridCoordinates(
    template: LayerMapTemplate
  ): Map<string, GridCoordinate> {
    const result = new Map<string, GridCoordinate>();
    const params = template.gourdParams;
    const totalCells = template.gridConfig.totalCells;

    const upperCount = Math.ceil(totalCells * 0.3);
    const connectorCount = Math.max(2, Math.ceil(totalCells * 0.1));
    const lowerCount = totalCells - upperCount - connectorCount;

    for (let i = 0; i < upperCount; i++) {
      const angle = (2 * Math.PI * i) / upperCount;
      const point = this.calculateGourdPoint(angle, params);
      const cellId = `L${template.layer}_upper_${i}`;
      result.set(cellId, {
        x: point.x,
        y: point.y,
        section: 'upper',
        ringIndex: Math.floor(i / (upperCount / 2)),
      });
    }

    for (let i = 0; i < connectorCount; i++) {
      const t = (i + 1) / (connectorCount + 1);
      const x = 50;
      const y = params.upperCenterY + (params.lowerCenterY - params.upperCenterY) * t;
      const cellId = `L${template.layer}_conn_${i}`;
      result.set(cellId, {
        x,
        y,
        section: 'connector',
      });
    }

    for (let i = 0; i < lowerCount; i++) {
      const angle = (2 * Math.PI * i) / lowerCount;
      const point = this.calculateGourdPoint(angle, params);
      const quadrant = this.determineQuadrant(point.x, point.y, params);
      const cellId = `L${template.layer}_lower_${i}`;
      result.set(cellId, {
        x: point.x,
        y: point.y,
        section: 'lower',
        quadrant,
      });
    }

    return result;
  }

  private determineQuadrant(
    x: number,
    y: number,
    params: GourdMapParameters
  ): 1 | 2 | 3 | 4 {
    const centerX = 50;
    const centerY = params.lowerCenterY;
    const isLeft = x < centerX;
    const isTop = y < centerY;
    if (isLeft && isTop) return 1;
    if (!isLeft && isTop) return 2;
    if (isLeft && !isTop) return 3;
    return 4;
  }

  generateConnections(
    cells: GridCell[],
    template: LayerMapTemplate
  ): GridPathConnection[] {
    const connections: GridPathConnection[] = [];
    const upperCells = cells.filter(c => c.coordinate.section === 'upper');
    const connectorCells = cells.filter(c => c.coordinate.section === 'connector');
    const lowerCells = cells.filter(c => c.coordinate.section === 'lower');

    for (let i = 0; i < upperCells.length; i++) {
      const next = upperCells[(i + 1) % upperCells.length];
      connections.push({
        id: `path_${upperCells[i].id}_${next.id}`,
        fromCellId: upperCells[i].id,
        toCellId: next.id,
        pathType: 0 as any,
        bidirectional: true,
        distance: 1,
      });
    }

    if (upperCells.length > 0 && connectorCells.length > 0) {
      connections.push({
        id: `path_${upperCells[0].id}_${connectorCells[0].id}`,
        fromCellId: upperCells[0].id,
        toCellId: connectorCells[0].id,
        pathType: 0 as any,
        bidirectional: true,
        distance: 1,
      });
    }

    for (let i = 0; i < connectorCells.length - 1; i++) {
      connections.push({
        id: `path_${connectorCells[i].id}_${connectorCells[i + 1].id}`,
        fromCellId: connectorCells[i].id,
        toCellId: connectorCells[i + 1].id,
        pathType: 0 as any,
        bidirectional: true,
        distance: 1,
      });
    }

    if (connectorCells.length > 0 && lowerCells.length > 0) {
      connections.push({
        id: `path_${connectorCells[connectorCells.length - 1].id}_${lowerCells[0].id}`,
        fromCellId: connectorCells[connectorCells.length - 1].id,
        toCellId: lowerCells[0].id,
        pathType: 0 as any,
        bidirectional: true,
        distance: 1,
      });
    }

    for (let i = 0; i < lowerCells.length; i++) {
      const next = lowerCells[(i + 1) % lowerCells.length];
      connections.push({
        id: `path_${lowerCells[i].id}_${next.id}`,
        fromCellId: lowerCells[i].id,
        toCellId: next.id,
        pathType: 0 as any,
        bidirectional: true,
        distance: 1,
      });
    }

    return connections;
  }

  assignAreaEffects(
    cells: GridCell[],
    template: LayerMapTemplate
  ): void {
    const areaEffectMap: Record<string, AreaEffect> = {
      W: { type: 'W' as AreaEffectType, color: '#FF6B6B', animationClass: 'zone-weak', description: '虚弱区：骰子-1' },
      N: { type: 'N' as AreaEffectType, color: '#4ECDC4', animationClass: 'zone-knowledge', description: '知识区：获书籍+资源' },
      I: { type: 'I' as AreaEffectType, color: '#9B59B6', animationClass: 'zone-invert', description: '反转区：地图倒置' },
      P: { type: 'P' as AreaEffectType, color: '#F39C12', animationClass: 'zone-skip', description: '跳过区：跳过回合' },
      S: { type: 'S' as AreaEffectType, color: '#2ECC71', animationClass: 'zone-speed', description: '加速区：额外投掷' },
      D: { type: 'D' as AreaEffectType, color: '#E74C3C', animationClass: 'zone-danger', description: '危险区：随机损失' },
    };

    for (const cell of cells) {
      if (cell.coordinate.section === 'upper') {
        for (const effectConfig of template.areaConfig.upperAreaEffects) {
          if (Math.random() < effectConfig.ratio) {
            cell.areaEffects.push(areaEffectMap[effectConfig.type]);
          }
        }
      } else if (cell.coordinate.section === 'lower' && cell.coordinate.quadrant) {
        const quadrantEffect = template.areaConfig.lowerQuadrantEffects[cell.coordinate.quadrant - 1];
        cell.areaEffects.push(areaEffectMap[quadrantEffect]);
      }
    }
  }

  validateTopology(topology: GourdMapTopology): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!topology.layer || topology.layer < 1 || topology.layer > 9) {
      errors.push(`Invalid layer number: ${topology.layer}`);
    }

    if (!topology.upperCircle || !topology.upperCircle.cellIds || topology.upperCircle.cellIds.length === 0) {
      errors.push('upperCircle must have at least one cell');
    }

    if (!topology.connector || !topology.connector.cellIds || topology.connector.cellIds.length === 0) {
      warnings.push('connector has no cells');
    }

    if (!topology.lowerCircle || !topology.lowerCircle.cellIds || topology.lowerCircle.cellIds.length === 0) {
      errors.push('lowerCircle must have at least one cell');
    }

    const allCellIds = new Set<string>([
      ...(topology.upperCircle?.cellIds ?? []),
      ...(topology.connector?.cellIds ?? []),
      ...(topology.lowerCircle?.cellIds ?? []),
    ]);

    const duplicateIds = this.findDuplicateIds(topology);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate cell IDs found: ${duplicateIds.join(', ')}`);
    }

    for (const conn of topology.connections) {
      if (!allCellIds.has(conn.fromCellId)) {
        errors.push(`Connection ${conn.id} references unknown fromCellId: ${conn.fromCellId}`);
      }
      if (!allCellIds.has(conn.toCellId)) {
        errors.push(`Connection ${conn.id} references unknown toCellId: ${conn.toCellId}`);
      }
    }

    if (topology.upperCircle?.center) {
      const { x, y } = topology.upperCircle.center;
      if (x < 0 || x > 100 || y < 0 || y > 100) {
        errors.push(`upperCircle center (${x},${y}) out of range 0-100`);
      }
    }

    if (topology.lowerCircle?.center) {
      const { x, y } = topology.lowerCircle.center;
      if (x < 0 || x > 100 || y < 0 || y > 100) {
        errors.push(`lowerCircle center (${x},${y}) out of range 0-100`);
      }
    }

    if (topology.stats.totalCells !== allCellIds.size) {
      warnings.push(`stats.totalCells (${topology.stats.totalCells}) does not match actual cell count (${allCellIds.size})`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private findDuplicateIds(topology: GourdMapTopology): string[] {
    const allIds = [
      ...(topology.upperCircle?.cellIds ?? []),
      ...(topology.connector?.cellIds ?? []),
      ...(topology.lowerCircle?.cellIds ?? []),
    ];
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const id of allIds) {
      if (seen.has(id)) {
        duplicates.push(id);
      }
      seen.add(id);
    }
    return duplicates;
  }

  exportToSvgPathData(topology: GourdMapTopology): SvgPathData {
    const regions: SvgPathData['regions'] = [];

    if (topology.upperCircle.center && topology.upperCircle.radius) {
      const { center, radius } = topology.upperCircle;
      regions.push({
        id: 'upper_circle',
        path: this.circleToSvgPath(center.x, center.y, radius),
        fill: 'rgba(100, 200, 100, 0.15)',
      });
    }

    if (topology.lowerCircle.center && topology.lowerCircle.radius) {
      const { center, radius } = topology.lowerCircle;
      regions.push({
        id: 'lower_circle',
        path: this.circleToSvgPath(center.x, center.y, radius),
        fill: 'rgba(100, 100, 200, 0.15)',
      });
    }

    const connections: SvgPathData['connections'] = topology.connections.map(conn => ({
      fromId: conn.fromCellId,
      toId: conn.toCellId,
      path: `M0,0 L0,0`,
    }));

    return {
      outline: this.gourdOutlineToSvgPath(topology),
      regions,
      connections,
    };
  }

  private circleToSvgPath(cx: number, cy: number, r: number): string {
    return `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z`;
  }

  private gourdOutlineToSvgPath(topology: GourdMapTopology): string {
    const uc = topology.upperCircle;
    const lc = topology.lowerCircle;
    if (!uc.center || !lc.center) return '';

    const ur = uc.radius ?? 15;
    const lr = lc.radius ?? 35;
    const ucx = uc.center.x;
    const ucy = uc.center.y;
    const lcx = lc.center.x;
    const lcy = lc.center.y;

    const tangentOffset = Math.min(ur, lr) * 0.6;

    return [
      `M${ucx - ur},${ucy}`,
      `A${ur},${ur} 0 1,0 ${ucx + ur},${ucy}`,
      `A${ur},${ur} 0 1,0 ${ucx - ur},${ucy}`,
      `L${lcx - tangentOffset},${lcy - lr + tangentOffset}`,
      `A${lr},${lr} 0 1,0 ${lcx + tangentOffset},${lcy - lr + tangentOffset}`,
      `L${ucx + ur},${ucy}`,
    ].join(' ');
  }
}
