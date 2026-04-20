import { PerLayerTopologyGenerator } from './geometry/PerLayerTopologyGenerator';
import type { LayerShapeConfig } from './geometry/PerLayerTopologyGenerator';

const DEFAULT_SHAPE: LayerShapeConfig = {
  layerNumber: 1,
  upperCircle: { center: { x: 50, y: 15 }, radius: 18 },
  lowerCircle: { center: { x: 50, y: 62 }, radiusX: 22, radiusY: 20 },
  connector: { narrowPointY: 32, widthAtNarrowest: 4 },
};

const TARGET_COUNTS: Record<number, number> = { 1: 20, 2: 34, 3: 24, 4: 26, 5: 24, 6: 37, 7: 23, 8: 22, 9: 32 };

let totalErrors = 0;
let totalWarnings = 0;

for (let layer = 1; layer <= 9; layer++) {
  const shape = { ...DEFAULT_SHAPE, layerNumber: layer };
  const topo = PerLayerTopologyGenerator.generate(layer, shape);
  const expectedCount = TARGET_COUNTS[layer];
  const actualCount = topo.cells.length;

  console.log(`\n=== L${layer} ${actualCount >= expectedCount ? '✅' : '❌'} ===`);
  console.log(`  Cells: ${actualCount} (target >= ${expectedCount}) ${actualCount >= expectedCount ? '' : '⚠️ SHORT'}`);
  console.log(`  Connections: ${topo.connections.length}`);
  console.log(`  Zones: ${Object.keys(topo.zoneInfo).length} (${Object.keys(topo.zoneInfo).join(', ')})`);
  console.log(`  Start: ${topo.startCellId}, Boss: ${topo.bossCellId}`);

  if (actualCount < expectedCount) {
    console.error(`  ERROR: Cell count ${actualCount} < target ${expectedCount}`);
    totalErrors++;
  }

  const startCell = topo.cells.find(c => c.id === topo.startCellId);
  const bossCell = topo.cells.find(c => c.id === topo.bossCellId);
  if (!startCell) { console.error(`  ERROR: Start cell ${topo.startCellId} not found`); totalErrors++; }
  else if (startCell.type !== 'start') { console.error(`  ERROR: Start cell type is ${startCell.type}, expected 'start'`); totalErrors++; }
  if (!bossCell) { console.error(`  ERROR: Boss cell ${topo.bossCellId} not found`); totalErrors++; }
  else if (bossCell.type !== 'boss') { console.error(`  ERROR: Boss cell type is ${bossCell.type}, expected 'boss'`); totalErrors++; }

  if (layer === 6) {
    const hiddenConns = topo.connections.filter(c => c.type === 'hidden');
    console.log(`  Hidden connections (teleport): ${hiddenConns.length}`);
    if (hiddenConns.length < 1) { console.error(`  ERROR: L6 should have hidden teleport connections`); totalErrors++; }
  }

  if (layer === 8) {
    const collapsingConns = topo.connections.filter(c => c.type === 'collapsing');
    console.log(`  Collapsing connections: ${collapsingConns.length}`);
    if (collapsingConns.length < 1) { console.error(`  ERROR: L8 should have collapsing connections`); totalErrors++; }
  }

  if (layer === 3) {
    const hasOuter = Object.keys(topo.zoneInfo).some(z => z.toLowerCase().includes('outer'));
    const hasMid = Object.keys(topo.zoneInfo).some(z => z.toLowerCase().includes('mid'));
    const hasCore = Object.keys(topo.zoneInfo).some(z => z.toLowerCase().includes('core'));
    console.log(`  Triple ring zones: outer=${hasOuter}, mid=${hasMid}, core=${hasCore}`);
    if (!hasOuter || !hasMid || !hasCore) { console.error(`  ERROR: L3 missing triple ring zone structure`); totalErrors++; }
  }

  if (layer === 9) {
    const hasCore = Object.keys(topo.zoneInfo).some(z => z.toUpperCase() === 'CORE');
    console.log(`  Has CORE zone: ${hasCore}`);
    if (!hasCore) { console.error(`  ERROR: L9 missing CORE zone`); totalErrors++; }
  }
}

console.log(`\n总计: ${totalErrors} errors, ${totalWarnings} warnings`);
if (totalErrors > 0) process.exit(1);
