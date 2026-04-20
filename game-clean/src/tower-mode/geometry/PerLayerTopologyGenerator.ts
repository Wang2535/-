import { GourdRegion } from '../data/layers/gourdShapes';

export interface LayerShapeConfig {
  layerNumber: number;
  upperCircle: { center: { x: number; y: number }; radius: number; radiusY?: number };
  lowerCircle: { center: { x: number; y: number }; radiusX: number; radiusY: number };
  connector: { narrowPointY: number; widthAtNarrowest: number };
  subZones?: Array<{ id: string; label: string; shape: string; color: string; startAngle?: number; endAngle?: number; points?: Array<{ x: number; y: number }> }>;
}

export interface GeneratedCell {
  id: string;
  type: 'start' | 'level' | 'battle' | 'boss' | 'bookstore' | 'skill'
    | 'exchange' | 'opportunity' | 'chance' | 'special' | 'elite'
    | 'locked' | 'transition' | 'end';
  region: GourdRegion;
  position: { x: number; y: number };
  zoneId?: string;
  difficulty?: number;
  isElite?: boolean;
}

export interface GeneratedConnection {
  id: string;
  from: string;
  to: string;
  type: 'main' | 'branch' | 'shortcut' | 'return' | 'crossRing' | 'safeDoor' | 'hidden' | 'collapsing';
  visualStyle?: { strokeColor: string; strokeWidth: number; dashArray?: string; animated?: boolean };
}

export interface GeneratedTopology {
  cells: GeneratedCell[];
  connections: GeneratedConnection[];
  zoneInfo: Record<string, { id: string; label: string; cellIds: string[]; centerPosition: { x: number; y: number } }>;
  startCellId: string;
  bossCellId: string;
}

const CELL_TYPES = ['level', 'battle', 'opportunity', 'skill', 'exchange', 'chance', 'bookstore', 'special', 'elite'] as const;

function polarToCartesian(center: { x: number; y: number }, radius: number, angle: number): { x: number; y: number } {
  return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
}

function findNearestN(cells: GeneratedCell[], idx: number, n: number): number[] {
  const dists = cells.map((c, i) => i === idx ? Infinity : Math.hypot(c.position.x - cells[idx].position.x, c.position.y - cells[idx].position.y));
  return dists.map((d, i) => ({ d, i })).sort((a, b) => a.d - b.d).slice(0, n).map(x => x.i);
}

function buildZoneInfo(cells: GeneratedCell[]): GeneratedTopology['zoneInfo'] {
  const zones: Record<string, any> = {};
  for (const cell of cells) {
    const zid = cell.zoneId ?? (cell.position.x < 50 ? (cell.position.y < 60 ? 'W' : cell.position.x < 38 ? 'W' : 'P') : (cell.position.y < 60 ? 'N' : 'I'));
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
  return zones as GeneratedTopology['zoneInfo'];
}

function generateHexGridCells(center: { x: number; y: number }, maxRadius: number, count: number): GeneratedCell[] {
  const cells: GeneratedCell[] = [];
  const spacing = maxRadius / Math.sqrt(count / 0.9);
  let ring = 0;
  let idx = 0;
  while (idx < count) {
    const r = spacing * ring;
    const countInThisRing = ring === 0 ? 1 : ring * 6;
    for (let i = 0; i < countInThisRing && idx < count; i++) {
      const angle = ring === 0 ? 0 : (i / countInThisRing) * Math.PI * 2 + (ring % 2) * (Math.PI / 6);
      cells.push({
        id: `X${idx}`,
        type: CELL_TYPES[idx % CELL_TYPES.length] as any,
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

function generateHexMazeConnections(cells: GeneratedCell[]): GeneratedConnection[] {
  const conns: GeneratedConnection[] = [];
  for (let i = 0; i < cells.length; i++) {
    const neighbors = findNearestN(cells, i, 2 + (i % 2));
    for (const n of neighbors) {
      if (n > i) {
        conns.push({
          id: `x-${i}-${n}`, from: cells[i].id, to: cells[n].id,
          type: Math.random() > 0.7 ? 'branch' : 'main',
          visualStyle: { strokeColor: '#00BCD4', strokeWidth: 0.8 },
        });
      }
    }
  }
  return conns;
}

function generateL1Standard(shape: LayerShapeConfig): GeneratedTopology {
  const uc = shape.upperCircle;
  const lc = shape.lowerCircle;
  const cells: GeneratedCell[] = [
    { id: 'U0', type: 'start', region: GourdRegion.UPPER_CIRCLE, position: { x: uc.center.x, y: uc.center.y - uc.radius * 0.75 } },
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `U${i + 1}`, type: 'level' as const, region: GourdRegion.UPPER_CIRCLE,
      position: polarToCartesian(uc.center, uc.radius * 0.75, -Math.PI / 2 + (i + 1) * (Math.PI / 3)),
    })),
    { id: 'C0', type: 'level', region: GourdRegion.CONNECTOR, position: { x: uc.center.x - 3, y: lc.center.y - lc.radiusY * 0.6 } },
    { id: 'C1', type: 'level', region: GourdRegion.CONNECTOR, position: { x: lc.center.x + 3, y: lc.center.y - lc.radiusY * 0.6 } },
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
    { id: 'L11', type: 'boss', region: GourdRegion.LOWER_CIRCLE, position: { x: lc.center.x, y: lc.center.y + lc.radiusY * 0.7 }, zoneId: 'P' },
  ];
  const connections: GeneratedConnection[] = [
    { id: 'c1', from: 'U0', to: 'U1', type: 'main' },
    { id: 'c2', from: 'U1', to: 'U2', type: 'main' },
    { id: 'c3', from: 'U2', to: 'U3', type: 'main' },
    { id: 'c4', from: 'U3', to: 'U4', type: 'main' },
    { id: 'c5', from: 'U4', to: 'U5', type: 'main' },
    { id: 'c6', from: 'U5', to: 'C0', type: 'main' },
    { id: 'c7', from: 'C0', to: 'C1', type: 'main' },
    { id: 'c8', from: 'C1', to: 'L0', type: 'main' },
    { id: 'c9', from: 'L0', to: 'L1', type: 'main' },
    { id: 'c10', from: 'L1', to: 'L2', type: 'main' },
    { id: 'c11', from: 'L2', to: 'L3', type: 'main' },
    { id: 'c-cross-1', from: 'L3', to: 'L4', type: 'crossRing', visualStyle: { strokeColor: '#FFD700', strokeWidth: 2, dashArray: '6 3', animated: true } },
    { id: 'c12', from: 'L4', to: 'L5', type: 'main' },
    { id: 'c13', from: 'L5', to: 'L6', type: 'main' },
    { id: 'c-cross-2', from: 'L6', to: 'L7', type: 'crossRing', visualStyle: { strokeColor: '#FFD700', strokeWidth: 2, dashArray: '6 3', animated: true } },
    { id: 'c14', from: 'L7', to: 'L8', type: 'main' },
    { id: 'c-cross-3', from: 'L8', to: 'L9', type: 'crossRing', visualStyle: { strokeColor: '#FFD700', strokeWidth: 2, dashArray: '6 3', animated: true } },
    { id: 'c15', from: 'L9', to: 'L10', type: 'main' },
    { id: 'c16', from: 'L10', to: 'L11', type: 'main' },
    { id: 'c-shortcut-1', from: 'L2', to: 'L7', type: 'shortcut', visualStyle: { strokeColor: '#00FF88', strokeWidth: 1.5, dashArray: '4 4', animated: true } },
  ];
  return { cells, connections, zoneInfo: buildZoneInfo(cells), startCellId: 'U0', bossCellId: 'L11' };
}

function generateL2DenseNetwork(shape: LayerShapeConfig): GeneratedTopology {
  const uc = shape.upperCircle;
  const lc = shape.lowerCircle;
  const cells: GeneratedCell[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI / 7);
    cells.push({ id: `N${i}`, type: i === 0 ? 'start' : 'level', region: GourdRegion.UPPER_CIRCLE, position: polarToCartesian(uc.center, uc.radius * 0.72, angle) });
  }
  for (let i = 0; i < 5; i++) {
    cells.push({ id: `F${i}`, type: 'level', region: GourdRegion.CONNECTOR, position: { x: 42 + i * 4, y: uc.center.y + 8 + i * 5 } });
  }
  for (let i = 0; i < 12; i++) {
    cells.push({
      id: `M${i}`, type: CELL_TYPES[i % 6] as any, region: GourdRegion.LOWER_CIRCLE,
      position: polarToCartesian(lc.center, Math.min(lc.radiusX, lc.radiusY) * 0.85, (i * Math.PI / 6) - Math.PI / 2),
    });
  }
  for (let i = 0; i < 8; i++) {
    cells.push({
      id: `C${i}`, type: ['level', 'bookstore', 'special', 'elite', 'level', 'chance', 'skill', 'level'][i] as any,
      region: GourdRegion.LOWER_CIRCLE,
      position: polarToCartesian(lc.center, Math.min(lc.radiusX, lc.radiusY) * 0.5, (i * Math.PI / 4) - Math.PI / 4),
    });
  }
  cells.push({ id: 'BOSS', type: 'boss', region: GourdRegion.LOWER_CIRCLE, position: { ...lc.center } });
  const connections: GeneratedConnection[] = [];
  for (let i = 0; i < 8; i++) connections.push({ id: `n-${i}-${(i + 1) % 8}`, from: `N${i}`, to: `N${(i + 1) % 8}`, type: 'main' });
  connections.push({ id: 'n-f0', from: 'N5', to: 'F0', type: 'main' });
  for (let i = 0; i < 4; i++) connections.push({ id: `f-${i}`, from: `F${i}`, to: `F${i + 1}`, type: 'main' });
  connections.push({ id: 'f-m', from: 'F4', to: 'M0', type: 'main' });
  for (let i = 0; i < 12; i++) connections.push({ id: `m-${i}-${(i + 1) % 12}`, from: `M${i}`, to: `M${(i + 1) % 12}`, type: 'main' });
  for (let i = 0; i < 8; i++) connections.push({ id: `m-c-${i}`, from: `M${(i * 1.5) | 0}`, to: `C${i}`, type: 'branch' });
  for (let i = 0; i < 8; i++) connections.push({ id: `c-${i}-${(i + 1) % 8}`, from: `C${i}`, to: `C${(i + 1) % 8}`, type: 'main' });
  for (let i = 0; i < 8; i += 2) connections.push({ id: `c-boss-${i}`, from: `C${i}`, to: 'BOSS', type: 'main' });
  connections.push({ id: 'jump-1', from: 'M0', to: 'M6', type: 'shortcut', visualStyle: { strokeColor: '#00FFFF', strokeWidth: 1.5, dashArray: '3 5', animated: true } });
  connections.push({ id: 'jump-2', from: 'M3', to: 'M9', type: 'shortcut', visualStyle: { strokeColor: '#00FFFF', strokeWidth: 1.5, dashArray: '3 5', animated: true } });
  return { cells, connections, zoneInfo: buildZoneInfo(cells), startCellId: 'N0', bossCellId: 'BOSS' };
}

function generateL3TripleRing(shape: LayerShapeConfig): GeneratedTopology {
  const lc = shape.lowerCircle;
  const cells: GeneratedCell[] = [];
  for (let i = 0; i < 6; i++) {
    cells.push({ id: `U${i}`, type: i === 0 ? 'start' : 'level', region: GourdRegion.UPPER_CIRCLE, position: polarToCartesian(shape.upperCircle.center, shape.upperCircle.radius * 0.7, (i * Math.PI / 3) - Math.PI / 2) });
  }
  cells.push({ id: 'C0', type: 'level', region: GourdRegion.CONNECTOR, position: { x: shape.upperCircle.center.x, y: lc.center.y - lc.radiusY * 0.55 } });
  for (let i = 0; i < 8; i++) {
    cells.push({ id: `O${i}`, type: CELL_TYPES[i % CELL_TYPES.length] as any, region: GourdRegion.LOWER_CIRCLE, position: polarToCartesian(lc.center, Math.min(lc.radiusX, lc.radiusY) * 0.85, (i * Math.PI / 4) - Math.PI / 2), zoneId: 'outer' });
  }
  for (let i = 0; i < 6; i++) {
    cells.push({ id: `MD${i}`, type: CELL_TYPES[(i + 3) % CELL_TYPES.length] as any, region: GourdRegion.LOWER_CIRCLE, position: polarToCartesian(lc.center, Math.min(lc.radiusX, lc.radiusY) * 0.55, (i * Math.PI / 3) - Math.PI / 2), zoneId: 'mid' });
  }
  for (let i = 0; i < 4; i++) {
    cells.push({ id: `CR${i}`, type: i === 3 ? 'boss' : ['level', 'skill', 'chance'][i] as any, region: GourdRegion.LOWER_CIRCLE, position: polarToCartesian(lc.center, Math.min(lc.radiusX, lc.radiusY) * 0.25, (i * Math.PI / 2) - Math.PI / 4), zoneId: 'core' });
  }
  const connections: GeneratedConnection[] = [];
  for (let i = 0; i < 5; i++) connections.push({ id: `u-${i}`, from: `U${i}`, to: `U${i + 1}`, type: 'main' });
  connections.push({ id: 'u-c', from: 'U5', to: 'C0', type: 'main' });
  connections.push({ id: 'c-o', from: 'C0', to: 'O0', type: 'main' });
  for (let i = 0; i < 8; i++) connections.push({ id: `o-${i}-${(i + 1) % 8}`, from: `O${i}`, to: `O${(i + 1) % 8}`, type: 'main' });
  for (let i = 0; i < 6; i++) connections.push({ id: `o-md-${i}`, from: `O${i}`, to: `MD${i % 6}`, type: 'branch' });
  for (let i = 0; i < 6; i++) connections.push({ id: `md-${i}-${(i + 1) % 6}`, from: `MD${i}`, to: `MD${(i + 1) % 6}`, type: 'main' });
  for (let i = 0; i < 4; i++) connections.push({ id: `md-cr-${i}`, from: `MD${i * 1.5 | 0}`, to: `CR${i}`, type: 'main' });
  for (let i = 0; i < 3; i++) connections.push({ id: `cr-${i}-${i + 1}`, from: `CR${i}`, to: `CR${i + 1}`, type: 'main' });
  return { cells, connections, zoneInfo: buildZoneInfo(cells), startCellId: 'U0', bossCellId: 'CR3' };
}

function generateL4CityDistricts(shape: LayerShapeConfig): GeneratedTopology {
  const lc = shape.lowerCircle;
  const cells: GeneratedCell[] = [];
  for (let i = 0; i < 6; i++) {
    cells.push({ id: `U${i}`, type: i === 0 ? 'start' : 'level', region: GourdRegion.UPPER_CIRCLE, position: polarToCartesian(shape.upperCircle.center, shape.upperCircle.radius * 0.7, (i * Math.PI / 3) - Math.PI / 2) });
  }
  cells.push({ id: 'C0', type: 'level', region: GourdRegion.CONNECTOR, position: { x: shape.upperCircle.center.x, y: lc.center.y - lc.radiusY * 0.55 } });
  const districtData = [
    { zone: 'NW', basePos: { x: 28, y: 48 }, count: 6 },
    { zone: 'NE', basePos: { x: 62, y: 48 }, count: 6 },
    { zone: 'SW', basePos: { x: 28, y: 70 }, count: 6 },
    { zone: 'SE', basePos: { x: 62, y: 70 }, count: 6 },
  ];
  let cellIdx = 0;
  for (const dist of districtData) {
    for (let i = 0; i < dist.count; i++) {
      cells.push({
        id: `D${dist.zone}_${i}`, type: CELL_TYPES[cellIdx % CELL_TYPES.length] as any,
        region: GourdRegion.LOWER_CIRCLE,
        position: { x: dist.basePos.x + (i % 3) * 8, y: dist.basePos.y + Math.floor(i / 3) * 10 },
        zoneId: dist.zone,
      });
      cellIdx++;
    }
  }
  cells.push({ id: 'BOSS', type: 'boss', region: GourdRegion.LOWER_CIRCLE, position: { x: lc.center.x, y: lc.center.y + lc.radiusY * 0.65 }, zoneId: 'CENTER' });
  const connections: GeneratedConnection[] = [];
  for (let i = 0; i < 5; i++) connections.push({ id: `u-${i}`, from: `U${i}`, to: `U${i + 1}`, type: 'main' });
  connections.push({ id: 'u-c', from: 'U5', to: 'C0', type: 'main' });
  connections.push({ id: 'c-nw', from: 'C0', to: 'D_NW_0', type: 'main' });
  connections.push({ id: 'c-ne', from: 'C0', to: 'D_NE_0', type: 'main' });
  for (const dz of districtData) {
    for (let i = 0; i < dz.count - 1; i++) {
      if ((i + 1) % 3 !== 0) connections.push({ id: `${dz.zone}-${i}-${i + 1}`, from: `D${dz.zone}_${i}`, to: `D${dz.zone}_${i + 1}`, type: 'main' });
      else connections.push({ id: `${dz.zone}-v-${i}`, from: `D${dz.zone}_${i}`, to: `D${dz.zone}_${i + 1}`, type: 'branch' });
    }
    const lastCell = `D${dz.zone}_${dz.count - 1}`;
    if (dz.zone === 'NW') connections.push({ id: `${dz.zone}-boss`, from: lastCell, to: 'BOSS', type: 'main' });
  }
  connections.push({ id: 'street-nw-ne', from: 'D_NW_2', to: 'D_NE_0', type: 'crossRing', visualStyle: { strokeColor: '#ff8800', strokeWidth: 1.5, dashArray: '4 2', animated: true } });
  connections.push({ id: 'street-sw-se', from: 'D_SW_2', to: 'D_SE_0', type: 'crossRing', visualStyle: { strokeColor: '#ff8800', strokeWidth: 1.5, dashArray: '4 2', animated: true } });
  return { cells, connections, zoneInfo: buildZoneInfo(cells), startCellId: 'U0', bossCellId: 'BOSS' };
}

function generateL5FactoryLine(shape: LayerShapeConfig): GeneratedTopology {
  const lc = shape.lowerCircle;
  const cells: GeneratedCell[] = [];
  for (let i = 0; i < 6; i++) {
    cells.push({ id: `U${i}`, type: i === 0 ? 'start' : 'level', region: GourdRegion.UPPER_CIRCLE, position: polarToCartesian(shape.upperCircle.center, shape.upperCircle.radius * 0.7, (i * Math.PI / 3) - Math.PI / 2) });
  }
  for (let i = 0; i < 3; i++) {
    cells.push({ id: `C${i}`, type: 'level', region: GourdRegion.CONNECTOR, position: { x: 42 + i * 8, y: lc.center.y - lc.radiusY * 0.5 + i * 4 } });
  }
  for (let i = 0; i < 8; i++) {
    cells.push({ id: `W${i}`, type: CELL_TYPES[i % CELL_TYPES.length] as any, region: GourdRegion.LOWER_CIRCLE, position: { x: 25 + (i % 4) * 7, y: 50 + Math.floor(i / 4) * 14 }, zoneId: 'W' });
  }
  for (let i = 0; i < 8; i++) {
    cells.push({ id: `S${i}`, type: CELL_TYPES[(i + 4) % CELL_TYPES.length] as any, region: GourdRegion.LOWER_CIRCLE, position: { x: 58 + (i % 4) * 7, y: 50 + Math.floor(i / 4) * 14 }, zoneId: 'S' });
  }
  cells.push({ id: 'N0', type: 'skill', region: GourdRegion.LOWER_CIRCLE, position: { x: lc.center.x, y: 46 }, zoneId: 'N' });
  cells.push({ id: 'N1', type: 'chance', region: GourdRegion.LOWER_CIRCLE, position: { x: lc.center.x, y: 56 }, zoneId: 'N' });
  cells.push({ id: 'BOSS', type: 'boss', region: GourdRegion.LOWER_CIRCLE, position: { x: lc.center.x, y: lc.center.y + lc.radiusY * 0.65 }, zoneId: 'N' });
  const connections: GeneratedConnection[] = [];
  for (let i = 0; i < 5; i++) connections.push({ id: `u-${i}`, from: `U${i}`, to: `U${i + 1}`, type: 'main' });
  connections.push({ id: 'u-c', from: 'U5', to: 'C0', type: 'main' });
  for (let i = 0; i < 2; i++) connections.push({ id: `c-${i}`, from: `C${i}`, to: `C${i + 1}`, type: 'main' });
  connections.push({ id: 'c-w', from: 'C2', to: 'W0', type: 'main' });
  connections.push({ id: 'c-s', from: 'C2', to: 'S0', type: 'main' });
  for (let i = 0; i < 7; i++) connections.push({ id: `w-${i}-${i + 1}`, from: `W${i}`, to: `W${i + 1}`, type: 'main' });
  for (let i = 0; i < 7; i++) connections.push({ id: `s-${i}-${i + 1}`, from: `S${i}`, to: `S${i + 1}`, type: 'main' });
  connections.push({ id: 'w-n', from: 'W7', to: 'N0', type: 'main' });
  connections.push({ id: 's-n', from: 'S7', to: 'N0', type: 'main' });
  connections.push({ id: 'n-0-1', from: 'N0', to: 'N1', type: 'main' });
  connections.push({ id: 'n-boss', from: 'N1', to: 'BOSS', type: 'main' });
  connections.push({ id: 'blockade-w', from: 'W3', to: 'W4', type: 'safeDoor', visualStyle: { strokeColor: '#ff4444', strokeWidth: 1.5, dashArray: '2 2', animated: true } });
  return { cells, connections, zoneInfo: buildZoneInfo(cells), startCellId: 'U0', bossCellId: 'BOSS' };
}

function generateL6HexMaze(shape: LayerShapeConfig): GeneratedTopology {
  const lc = shape.lowerCircle;
  const cells: GeneratedCell[] = [];
  for (let i = 0; i < 6; i++) {
    cells.push({ id: `H${i}`, type: i === 0 ? 'start' : 'level', region: GourdRegion.UPPER_CIRCLE, position: polarToCartesian(shape.upperCircle.center, shape.upperCircle.radius * 0.7, (i * Math.PI / 3) - Math.PI / 2) });
  }
  for (let i = 0; i < 3; i++) {
    cells.push({ id: `P${i}`, type: 'level', region: GourdRegion.CONNECTOR, position: { x: 43 + i * 7, y: shape.upperCircle.center.y + 12 + i * 6 } });
  }
  const hexCells = generateHexGridCells({ x: lc.center.x + 2, y: lc.center.y + 2 }, Math.min(lc.radiusX, lc.radiusY) * 0.82, 28);
  hexCells[hexCells.length - 1].type = 'boss';
  cells.push(...hexCells);
  const connections: GeneratedConnection[] = [];
  for (let i = 0; i < 5; i++) connections.push({ id: `h-${i}`, from: `H${i}`, to: `H${i + 1}`, type: 'main' });
  connections.push({ id: 'h-last', from: 'H5', to: 'P0', type: 'main' });
  for (let i = 0; i < 2; i++) connections.push({ id: `p-${i}`, from: `P${i}`, to: `P${i + 1}`, type: 'main' });
  connections.push({ id: 'p-to-hex', from: 'P2', to: hexCells[0].id, type: 'main' });
  const hexConns = generateHexMazeConnections(hexCells);
  connections.push(...hexConns);
  const teleportPairs = [[3, 15], [7, 22], [11, 18]];
  for (const [a, b] of teleportPairs) {
    if (hexCells[a] && hexCells[b]) {
      connections.push({ id: `teleport-${a}-${b}`, from: hexCells[a].id, to: hexCells[b].type !== 'boss' ? hexCells[b].id : hexCells[a].id, type: 'hidden', visualStyle: { strokeColor: '#E040FB', strokeWidth: 1, dashArray: '2 6', animated: true } });
    }
  }
  return { cells, connections, zoneInfo: buildZoneInfo(cells), startCellId: 'H0', bossCellId: hexCells[hexCells.length - 1].id };
}

function generateL7CloudDrift(shape: LayerShapeConfig): GeneratedTopology {
  const lc = { center: { x: shape.lowerCircle.center.x - 3, y: shape.lowerCircle.center.y + 2 }, radiusX: shape.lowerCircle.radiusX, radiusY: shape.lowerCircle.radiusY };
  const cells: GeneratedCell[] = [];
  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI / 3.5) - Math.PI / 2;
    cells.push({ id: `U${i}`, type: i === 0 ? 'start' : 'level', region: GourdRegion.UPPER_CIRCLE, position: polarToCartesian(shape.upperCircle.center, shape.upperCircle.radius * 0.68, angle) });
  }
  cells.push({ id: 'C0', type: 'level', region: GourdRegion.CONNECTOR, position: { x: shape.upperCircle.center.x - 2, y: lc.center.y - lc.radiusY * 0.5 } });
  const cloudOffsets = [
    { dx: -10, dy: -5 }, { dx: 8, dy: -8 }, { dx: -5, dy: 3 }, { dx: 12, dy: 0 },
    { dx: -8, dy: 10 }, { dx: 5, dy: 12 }, { dx: 15, dy: 8 }, { dx: -12, dy: 15 },
    { dx: 0, dy: -12 }, { dx: 18, dy: -3 }, { dx: -15, dy: 5 }, { dx: 3, dy: 18 },
    { dx: 10, dy: -15 }, { dx: -18, dy: 12 }, { dx: 8, dy: 20 }, { dx: -3, dy: -18 },
  ];
  for (let i = 0; i < 15; i++) {
    cells.push({
      id: `CL${i}`, type: CELL_TYPES[i % CELL_TYPES.length] as any, region: GourdRegion.LOWER_CIRCLE,
      position: { x: lc.center.x + cloudOffsets[i].dx, y: lc.center.y + cloudOffsets[i].dy },
      zoneId: `cloud-${(i % 5) + 1}`,
    });
  }
  cells.push({ id: 'BOSS', type: 'boss', region: GourdRegion.LOWER_CIRCLE, position: { x: lc.center.x + 5, y: lc.center.y + lc.radiusY * 0.6 }, zoneId: 'cloud-core' });
  const connections: GeneratedConnection[] = [];
  for (let i = 0; i < 6; i++) connections.push({ id: `u-${i}`, from: `U${i}`, to: `U${i + 1}`, type: 'main' });
  connections.push({ id: 'u-c', from: 'U6', to: 'C0', type: 'main' });
  connections.push({ id: 'c-cl0', from: 'C0', to: 'CL0', type: 'main' });
  for (let i = 0; i < 14; i++) {
    const nextI = (i + 1) % 15;
    if (Math.random() > 0.35 || i < 5) {
      connections.push({ id: `cl-${i}-${nextI}`, from: `CL${i}`, to: `CL${nextI}`, type: i % 5 === 0 ? 'branch' : 'main' });
    }
  }
  for (let i = 0; i < 5; i += 2) {
    connections.push({ id: `cl-boss-${i}`, from: `CL${i * 3 % 15}`, to: 'BOSS', type: 'main' });
  }
  connections.push({ id: 'drift-1', from: 'CL2', to: 'CL8', type: 'hidden', visualStyle: { strokeColor: '#a855f7', strokeWidth: 1, dashArray: '3 6', animated: true } });
  connections.push({ id: 'drift-2', from: 'CL5', to: 'CL13', type: 'hidden', visualStyle: { strokeColor: '#a855f7', strokeWidth: 1, dashArray: '3 6', animated: true } });
  return { cells, connections, zoneInfo: buildZoneInfo(cells), startCellId: 'U0', bossCellId: 'BOSS' };
}

function generateL8CollapseLab(shape: LayerShapeConfig): GeneratedTopology {
  const lc = { center: { x: shape.lowerCircle.center.x + 5, y: shape.lowerCircle.center.y }, radiusX: shape.lowerCircle.radiusX, radiusY: shape.lowerCircle.radiusY };
  const cells: GeneratedCell[] = [];
  for (let i = 0; i < 6; i++) {
    cells.push({ id: `U${i}`, type: i === 0 ? 'start' : 'level', region: GourdRegion.UPPER_CIRCLE, position: polarToCartesian(shape.upperCircle.center, shape.upperCircle.radius * 0.68, (i * Math.PI / 3) - Math.PI / 2) });
  }
  cells.push({ id: 'C0', type: 'level', region: GourdRegion.CONNECTOR, position: { x: shape.upperCircle.center.x + 3, y: lc.center.y - lc.radiusY * 0.5 } });
  for (let i = 0; i < 14; i++) {
    const angle = (i * Math.PI / 7) - Math.PI / 2 + (i % 2) * 0.15;
    const rMod = 0.7 + (i % 3) * 0.1;
    cells.push({
      id: `Q${i}`, type: CELL_TYPES[i % CELL_TYPES.length] as any, region: GourdRegion.LOWER_CIRCLE,
      position: polarToCartesian(lc.center, Math.min(lc.radiusX, lc.radiusY) * rMod, angle),
      zoneId: `prob-${(i % 4) + 1}`,
    });
  }
  cells.push({ id: 'BOSS', type: 'boss', region: GourdRegion.LOWER_CIRCLE, position: { x: lc.center.x, y: lc.center.y + lc.radiusY * 0.6 }, zoneId: 'prob-core' });
  const connections: GeneratedConnection[] = [];
  for (let i = 0; i < 5; i++) connections.push({ id: `u-${i}`, from: `U${i}`, to: `U${i + 1}`, type: 'main' });
  connections.push({ id: 'u-c', from: 'U5', to: 'C0', type: 'main' });
  connections.push({ id: 'c-q0', from: 'C0', to: 'Q0', type: 'main' });
  for (let i = 0; i < 13; i++) {
    connections.push({ id: `q-${i}-${i + 1}`, from: `Q${i}`, to: `Q${i + 1}`, type: i % 4 === 0 ? 'branch' : 'main' });
  }
  for (let i = 0; i < 5; i += 2) {
    connections.push({ id: `q-boss-${i}`, from: `Q${i + 1}`, to: 'BOSS', type: 'main' });
  }
  connections.push({ id: 'collapse-1', from: 'Q3', to: 'Q10', type: 'collapsing', visualStyle: { strokeColor: '#ec4899', strokeWidth: 1.5, dashArray: '2 4', animated: true } });
  connections.push({ id: 'collapse-2', from: 'Q6', to: 'Q12', type: 'collapsing', visualStyle: { strokeColor: '#ec4899', strokeWidth: 1.5, dashArray: '2 4', animated: true } });
  connections.push({ id: 'hidden-obs', from: 'Q1', to: 'Q8', type: 'hidden', visualStyle: { strokeColor: '#f8bbd0', strokeWidth: 0.8, dashArray: '1 8', animated: false } });
  return { cells, connections, zoneInfo: buildZoneInfo(cells), startCellId: 'U0', bossCellId: 'BOSS' };
}

function generateL9Palace(shape: LayerShapeConfig): GeneratedTopology {
  const lc = shape.lowerCircle;
  const cells: GeneratedCell[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI / 4) - Math.PI / 2;
    cells.push({ id: `G${i}`, type: i === 0 ? 'start' : 'level', region: GourdRegion.UPPER_CIRCLE, position: polarToCartesian(shape.upperCircle.center, shape.upperCircle.radius * 0.65, angle) });
  }
  cells.push({ id: 'C0', type: 'level', region: GourdRegion.CONNECTOR, position: { x: shape.upperCircle.center.x, y: lc.center.y - lc.radiusY * 0.45 } });
  const quadrantData = [
    { zone: 'W', baseX: 26, baseY: 48, count: 7 },
    { zone: 'N', baseX: 54, baseY: 44, count: 6 },
    { zone: 'E', baseX: 64, baseY: 58, count: 7 },
    { zone: 'S', baseX: 36, baseY: 66, count: 6 },
  ];
  let cIdx = 0;
  for (const q of quadrantData) {
    for (let i = 0; i < q.count; i++) {
      cells.push({
        id: `PAL_${q.zone}${i}`, type: CELL_TYPES[cIdx % CELL_TYPES.length] as any,
        region: GourdRegion.LOWER_CIRCLE,
        position: { x: q.baseX + (i % 3) * 8 + (q.zone === 'N' || q.zone === 'S' ? (i % 3) * 2 : 0), y: q.baseY + Math.floor(i / 3) * 10 },
        zoneId: q.zone,
      });
      cIdx++;
    }
  }
  cells.push({ id: 'CORE_0', type: 'elite', region: GourdRegion.LOWER_CIRCLE, position: { x: lc.center.x - 6, y: lc.center.y + 4 }, zoneId: 'CORE' });
  cells.push({ id: 'CORE_1', type: 'elite', region: GourdRegion.LOWER_CIRCLE, position: { x: lc.center.x + 6, y: lc.center.y + 4 }, zoneId: 'CORE' });
  cells.push({ id: 'CORE_2', type: 'special', region: GourdRegion.LOWER_CIRCLE, position: { x: lc.center.x, y: lc.center.y + 12 }, zoneId: 'CORE' });
  cells.push({ id: 'BOSS', type: 'boss', region: GourdRegion.LOWER_CIRCLE, position: { x: lc.center.x, y: lc.center.y + lc.radiusY * 0.65 }, zoneId: 'CORE' });
  const connections: GeneratedConnection[] = [];
  for (let i = 0; i < 7; i++) connections.push({ id: `g-${i}`, from: `G${i}`, to: `G${i + 1}`, type: 'main' });
  connections.push({ id: 'g-c', from: 'G7', to: 'C0', type: 'main' });
  connections.push({ id: 'c-w', from: 'C0', to: 'PAL_W0', type: 'main' });
  connections.push({ id: 'c-n', from: 'C0', to: 'PAL_N0', type: 'main' });
  for (const q of quadrantData) {
    for (let i = 0; i < q.count - 1; i++) {
      connections.push({ id: `${q.zone}-${i}-${i + 1}`, from: `PAL_${q.zone}${i}`, to: `PAL_${q.zone}${i + 1}`, type: 'main' });
    }
    const last = `PAL_${q.zone}${q.count - 1}`;
    if (q.zone === 'W') connections.push({ id: `${q.zone}-core`, from: last, to: 'CORE_0', type: 'main' });
    else if (q.zone === 'E') connections.push({ id: `${q.zone}-core`, from: last, to: 'CORE_1', type: 'main' });
    else if (q.zone === 'N') connections.push({ id: `${q.zone}-core`, from: last, to: 'CORE_2', type: 'main' });
  }
  connections.push({ id: 'core-0-1', from: 'CORE_0', to: 'CORE_1', type: 'main' });
  connections.push({ id: 'core-1-2', from: 'CORE_1', to: 'CORE_2', type: 'main' });
  connections.push({ id: 'core-2-boss', from: 'CORE_2', to: 'BOSS', type: 'main' });
  connections.push({ id: 'palace-gate-W-N', from: 'PAL_W3', to: 'PAL_N0', type: 'crossRing', visualStyle: { strokeColor: '#f43f5e', strokeWidth: 2, dashArray: '4 3', animated: true } });
  connections.push({ id: 'palace-gate-E-S', from: 'PAL_E3', to: 'PAL_S0', type: 'crossRing', visualStyle: { strokeColor: '#f43f5e', strokeWidth: 2, dashArray: '4 3', animated: true } });
  return { cells, connections, zoneInfo: buildZoneInfo(cells), startCellId: 'G0', bossCellId: 'BOSS' };
}

const LAYER_TOPOLOGY_TEMPLATES: Record<number, (shape: LayerShapeConfig) => GeneratedTopology> = {
  1: generateL1Standard,
  2: generateL2DenseNetwork,
  3: generateL3TripleRing,
  4: generateL4CityDistricts,
  5: generateL5FactoryLine,
  6: generateL6HexMaze,
  7: generateL7CloudDrift,
  8: generateL8CollapseLab,
  9: generateL9Palace,
};

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
    const counts: Record<number, number> = { 1: 20, 2: 34, 3: 25, 4: 32, 5: 28, 6: 37, 7: 24, 8: 22, 9: 39 };
    return counts[layerNumber] ?? 20;
  }

  static getAllLayerCounts(): Record<number, number> {
    return { 1: 20, 2: 34, 3: 25, 4: 32, 5: 28, 6: 37, 7: 24, 8: 22, 9: 39 };
  }
}
