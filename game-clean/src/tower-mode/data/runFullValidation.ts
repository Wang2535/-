/**
 * 安全实践爬塔模式 - 地图数据全量质量验证脚本 (B组第二轮)
 * 验证版本: v2.0
 * 生成时间: 自动记录
 *
 * 功能:
 * 1. 连通性验证 - BFS遍历检查所有格子是否可达
 * 2. 区域引用校验 - 检查zone.cellIds是否存在
 * 3. 格子ID格式验证 - 正则、重复、坐标一致性
 * 4. 路径ID格式和一致性检查
 */

// ==================== 类型定义 ====================

interface ConnectivityResult {
  layerNumber: number;
  totalCells: number;
  reachableCount: number;
  unreachableIds: string[];
  startToBossPathExists: boolean;
  isValid: boolean;
}

interface ZoneValidationResult {
  validZones: number;
  totalZones: number;
  danglingRefs: Array<{ zoneId: string; cellId: string }>;
  typeDistribution: Record<string, number>;
  warnings: string[];
}

interface CellIdValidationResult {
  totalCells: number;
  validIds: number;
  invalidIds: Array<{ id: string; reason: string }>;
  duplicateIds: Array<{ id: string; count: number }>;
  coordinateMismatches: Array<{ id: string; coordinate: [number, number]; expectedRow: number; expectedCol: number }>;
  isValid: boolean;
}

interface PathIdValidationResult {
  totalPaths: number;
  validFormatCount: number;
  invalidFormatPaths: Array<{ id: string; reason: string }>;
  fromToInconsistencies: Array<{ pathId: string; from: string; to: string; issue: string }>;
  duplicatePathIds: Array<{ id: string; count: number }>;
  isValid: boolean;
}

interface LayerReport {
  connectivity: ConnectivityResult;
  zones: ZoneValidationResult;
  cellIds: CellIdValidationResult;
  pathIds: PathIdValidationResult;
}

interface IssueEntry {
  level: 'ERROR' | 'WARN' | 'INFO';
  layerNumber: number;
  message: string;
  suggestion?: string;
}

// ==================== 数据导入 ====================

import { getAllLayers } from './layerRegistry';
import type { TowerLayerData, GameCell, PathConnection, ZoneDefinition } from './layerRegistry';

// ==================== 验证函数实现 ====================

/**
 * 1. 连通性验证函数 - 从startCellId开始BFS遍历
 */
function validateLayerConnectivity(layerData: TowerLayerData): ConnectivityResult {
  const { layerNumber, cells, adjacencyList, startCellId, bossCellId } = layerData;
  const totalCells = cells.length;

  if (!startCellId) {
    return {
      layerNumber,
      totalCells,
      reachableCount: 0,
      unreachableIds: cells.map(c => c.id),
      startToBossPathExists: false,
      isValid: false,
    };
  }

  // BFS遍历
  const visited = new Set<string>();
  const queue: string[] = [startCellId];
  visited.add(startCellId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacencyList[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  const unreachableIds = cells.filter(c => !visited.has(c.id)).map(c => c.id);
  const reachableCount = visited.size;
  const startToBossPathExists = bossCellId ? visited.has(bossCellId) : false;
  const isValid = unreachableIds.length === 0 && startToBossPathExists;

  return {
    layerNumber,
    totalCells,
    reachableCount,
    unreachableIds,
    startToBossPathExists,
    isValid,
  };
}

/**
 * 2. 区域引用校验函数 - 检查zone.cellIds是否存在于cellIndex
 */
function validateZoneReferences(layerData: TowerLayerData): ZoneValidationResult {
  const { zones, cells } = layerData;
  const cellIndex = new Set(cells.map(c => c.id));

  const totalZones = zones?.length || 0;
  let validZones = 0;
  const danglingRefs: Array<{ zoneId: string; cellId: string }> = [];
  const typeDistribution: Record<string, number> = {};
  const warnings: string[] = [];

  if (!zones || zones.length === 0) {
    return {
      validZones: 0,
      totalZones: 0,
      danglingRefs: [],
      typeDistribution: {},
      warnings: ['该层没有定义区域(zones)'],
    };
  }

  for (const zone of zones) {
    let zoneValid = true;

    // 统计类型分布
    const zoneType = zone.type || 'UNKNOWN';
    typeDistribution[zoneType] = (typeDistribution[zoneType] || 0) + 1;

    // 检查每个cellId是否存在于cells中
    for (const cellId of zone.cellIds) {
      if (!cellIndex.has(cellId)) {
        danglingRefs.push({ zoneId: zone.id, cellId });
        zoneValid = false;
      }
    }

    if (zoneValid) {
      validZones++;
    }
  }

  // 检查是否有格子未被任何区域覆盖
  const zonedCells = new Set<string>();
  for (const zone of zones) {
    for (const cellId of zone.cellIds) {
      zonedCells.add(cellId);
    }
  }
  const unzonedCells = cells.filter(c => c.zone === undefined && !zonedCells.has(c.id));
  if (unzonedCells.length > 0 && totalZones > 0) {
    warnings.push(`${unzonedCells.length}个格子未被任何区域覆盖: ${unzonedCells.map(c => c.id).join(', ')}`);
  }

  return {
    validZones,
    totalZones,
    danglingRefs,
    typeDistribution,
    warnings,
  };
}

/**
 * 3. 格子ID格式验证函数
 */
function validateCellIdFormat(layerData: TowerLayerData): CellIdValidationResult {
  const { layerNumber, cells } = layerData;
  const totalCells = cells.length;

  const idPattern = /^R\d+C\d+$/;
  const validIds: string[] = [];
  const invalidIds: Array<{ id: string; reason: string }> = [];

  // 检查ID格式
  const idCountMap: Record<string, number> = {};
  for (const cell of cells) {
    idCountMap[cell.id] = (idCountMap[cell.id] || 0) + 1;

    if (idPattern.test(cell.id)) {
      validIds.push(cell.id);
    } else {
      invalidIds.push({ id: cell.id, reason: '不符合 R{row}C{col} 格式' });
    }
  }

  // 检测重复ID
  const duplicateIds: Array<{ id: string; count: number }> = [];
  for (const [id, count] of Object.entries(idCountMap)) {
    if (count > 1) {
      duplicateIds.push({ id, count });
    }
  }

  // 坐标与ID一致性检查
  const coordinateMismatches: Array<{ id: string; coordinate: [number, number]; expectedRow: number; expectedCol: number }> = [];
  for (const cell of cells) {
    const match = cell.id.match(/^R(\d+)C(\d+)$/);
    if (match) {
      const expectedRow = parseInt(match[1], 10);
      const expectedCol = parseInt(match[2], 10);
      if (cell.coordinate[0] !== expectedRow || cell.coordinate[1] !== expectedCol) {
        coordinateMismatches.push({
          id: cell.id,
          coordinate: cell.coordinate as [number, number],
          expectedRow,
          expectedCol,
        });
      }
    }
  }

  const isValid = invalidIds.length === 0 && duplicateIds.length === 0 && coordinateMismatches.length === 0;

  return {
    totalCells,
    validIds: validIds.length,
    invalidIds,
    duplicateIds,
    coordinateMismatches,
    isValid,
  };
}

/**
 * 4. 路径ID格式和一致性检查函数
 */
function validatePathIds(layerData: TowerLayerData): PathIdValidationResult {
  const { paths, cells } = layerData;
  const totalPaths = paths?.length || 0;

  if (totalPaths === 0) {
    return {
      totalPaths: 0,
      validFormatCount: 0,
      invalidFormatPaths: [],
      fromToInconsistencies: [],
      duplicatePathIds: [],
      isValid: true, // 无路径不算错误
    };
  }

  const cellIndex = new Set(cells.map(c => c.id));
  const pathPattern = /^p_R\d+C\d+_R\d+C\d+$/;
  const validFormatCount: number[] = [];
  const invalidFormatPaths: Array<{ id: string; reason: string }> = [];
  const fromToInconsistencies: Array<{ pathId: string; from: string; to: string; issue: string }> = [];

  // 检测重复路径ID
  const pathIdCountMap: Record<string, number> = {};
  for (const path of paths!) {
    pathIdCountMap[path.id] = (pathIdCountMap[path.id] || 0) + 1;
  }
  const duplicatePathIds: Array<{ id: string; count: number }> = [];
  for (const [id, count] of Object.entries(pathIdCountMap)) {
    if (count > 1) {
      duplicatePathIds.push({ id, count });
    }
  }

  for (const path of paths!) {
    // 格式检查
    if (pathPattern.test(path.id)) {
      validFormatCount.push(1);

      // 检查from/to是否与ID一致
      const idMatch = path.id.match(/^p_(R\d+C\d+)_(R\d+C\d+)$/);
      if (idMatch) {
        const idFrom = idMatch[1];
        const idTo = idMatch[2];

        if (path.from !== idFrom) {
          fromToInconsistencies.push({
            pathId: path.id,
            from: path.from,
            to: path.to,
            issue: `from字段(${path.from})与ID中的起点(${idFrom})不一致`,
          });
        }
        if (path.to !== idTo) {
          fromToInconsistencies.push({
            pathId: path.id,
            from: path.from,
            to: path.to,
            issue: `to字段(${path.to})与ID中的终点(${idTo})不一致`,
          });
        }
      }
    } else {
      invalidFormatPaths.push({ id: path.id, reason: '不符合 p_R{row}C{col}_R{row}C{col} 格式' });
    }

    // 检查from/to是否存在于cells中
    if (!cellIndex.has(path.from)) {
      fromToInconsistencies.push({
        pathId: path.id,
        from: path.from,
        to: path.to,
        issue: `起点${path.from}不存在于cells中`,
      });
    }
    if (!cellIndex.has(path.to)) {
      fromToInconsistencies.push({
        pathId: path.id,
        from: path.from,
        to: path.to,
        issue: `终点${path.to}不存在于cells中`,
      });
    }
  }

  const isValid = invalidFormatPaths.length === 0 && duplicatePathIds.length === 0 &&
                  fromToInconsistencies.filter(i => i.issue.includes('不一致') || i.issue.includes('不存在')).length === 0;

  return {
    totalPaths,
    validFormatCount: validFormatCount.length,
    invalidFormatPaths,
    fromToInconsistencies,
    duplicatePathIds,
    isValid,
  };
}

// ==================== 主验证函数 ====================

function runFullValidation(): void {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     安全实践爬塔模式 - 地图数据质量报告                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`生成时间: ${new Date().toISOString()}`);
  console.log('验证版本: v2.0 (B组第二轮)');
  console.log('');

  const allLayers = getAllLayers();
  const layerReports: LayerReport[] = [];
  const allIssues: IssueEntry[] = [];

  // 对每层执行验证
  for (const layerData of allLayers) {
    const report: LayerReport = {
      connectivity: validateLayerConnectivity(layerData),
      zones: validateZoneReferences(layerData),
      cellIds: validateCellIdFormat(layerData),
      pathIds: validatePathIds(layerData),
    };
    layerReports.push(report);

    // 收集问题
    const conn = report.connectivity;
    if (!conn.isValid) {
      if (conn.unreachableIds.length > 0) {
        allIssues.push({
          level: 'ERROR',
          layerNumber: layerData.layerNumber,
          message: `连通性失败: ${conn.unreachableIds.length}个格子从起点不可达 (${conn.unreachableIds.join(', ')})`,
          suggestion: '检查adjacencyList确保所有格子通过路径连接到起点',
        });
      }
      if (!conn.startToBossPathExists) {
        allIssues.push({
          level: 'ERROR',
          layerNumber: layerData.layerNumber,
          message: '起点到BOSS的路径不存在',
          suggestion: '确保存在从startCellId到bossCellId的连通路径',
        });
      }
    }

    const zone = report.zones;
    if (zone.danglingRefs.length > 0) {
      allIssues.push({
        level: 'ERROR',
        layerNumber: layerData.layerNumber,
        message: `区域引用错误: ${zone.danglingRefs.length}个悬空引用`,
        suggestion: `删除或修正以下悬空引用: ${zone.danglingRefs.map(r => `${r.zoneId}->${r.cellId}`).join(', ')}`,
      });
    }
    for (const warn of zone.warnings) {
      allIssues.push({
        level: 'WARN',
        layerNumber: layerData.layerNumber,
        message: warn,
      });
    }

    const cellId = report.cellIds;
    if (cellId.invalidIds.length > 0) {
      allIssues.push({
        level: 'ERROR',
        layerNumber: layerData.layerNumber,
        message: `ID格式无效: ${cellId.invalidIds.map(i => i.id).join(', ')}`,
        suggestion: '将ID改为 R{row}C{col} 格式，如 R0C0, R1C2',
      });
    }
    if (cellId.duplicateIds.length > 0) {
      allIssues.push({
        level: 'ERROR',
        layerNumber: layerData.layerNumber,
        message: `重复ID检测: ${cellId.duplicateIds.map(d => `${d.id}(x${d.count})`).join(', ')}`,
        suggestion: '确保每个格子的ID唯一',
      });
    }
    if (cellId.coordinateMismatches.length > 0) {
      allIssues.push({
        level: 'WARN',
        layerNumber: layerData.layerNumber,
        message: `坐标不匹配: ${cellId.coordinateMismatches.length}个格子的coordinate与ID行列号不一致`,
      });
    }

    const pathId = report.pathIds;
    if (pathId.invalidFormatPaths.length > 0) {
      allIssues.push({
        level: 'ERROR',
        layerNumber: layerData.layerNumber,
        message: `路径ID格式无效: ${pathId.invalidFormatPaths.map(p => p.id).join(', ')}`,
        suggestion: '将路径ID改为 p_R{row}C{col}_R{row}C{col} 格式',
      });
    }
    if (pathId.duplicatePathIds.length > 0) {
      allIssues.push({
        level: 'ERROR',
        layerNumber: layerData.layerNumber,
        message: `重复路径ID: ${pathId.duplicatePathIds.map(d => `${d.id}(x${d.count})`).join(', ')}`,
        suggestion: '确保每条路径的ID唯一',
      });
    }
    if (pathId.fromToInconsistencies.length > 0) {
      for (const inc of pathId.fromToInconsistencies) {
        allIssues.push({
          level: inc.issue.includes('不存在') ? 'ERROR' : 'WARN',
          layerNumber: layerData.layerNumber,
          message: `路径${inc.pathId}: ${inc.issue}`,
        });
      }
    }
  }

  // ════════════════════════════════════════
  // 一、连通性矩阵
  // ════════════════════════════════════════
  console.log('═══════════════════════════════════════');
  console.log('一、连通性矩阵');
  console.log('═══════════════════════════════════════');
  console.log('Layer | 总格 | 可达 | 不可达 | 起点→BOSS | 状态');
  console.log('------|------|------|--------|-----------|------');

  for (const report of layerReports) {
    const conn = report.connectivity;
    const status = conn.isValid ? 'PASS' : 'FAIL';
    const bossStatus = conn.startToBossPathExists ? '✅' : '❌';
    console.log(
      `L${String(conn.layerNumber).padStart(1)}    | ${
        String(conn.totalCells).padStart(4)
      } | ${String(conn.reachableCount).padStart(4)} | ${
        String(conn.unreachableIds.length).padStart(6)
      } | ${bossStatus.padEnd(9)} | ${status}`
    );
  }
  console.log('');

  // ════════════════════════════════════════
  // 二、区域覆盖统计
  // ════════════════════════════════════════
  console.log('═══════════════════════════════════════');
  console.log('二、区域覆盖统计');
  console.log('═══════════════════════════════════════');
  console.log('Layer | W | N | I | P | S | D | 总计');
  console.log('------|---|---|---|---|---|---|-----');

  for (let i = 0; i < layerReports.length; i++) {
    const report = layerReports[i];
    const zoneDist = report.zones.typeDistribution;
    const total = report.zones.totalZones;
    console.log(
      `L${String(allLayers[i].layerNumber).padStart(1)}    | ${
        String(zoneDist['W'] || 0).padStart(1)
      } | ${String(zoneDist['N'] || 0).padStart(1)} | ${
        String(zoneDist['I'] || 0).padStart(1)
      } | ${String(zoneDist['P'] || 0).padStart(1)} | ${
        String(zoneDist['S'] || 0).padStart(1)
      } | ${String(zoneDist['D'] || 0).padStart(1)} | ${
        String(total).padStart(3)
      }`
    );
  }
  console.log('');

  // ════════════════════════════════════════
  // 三、格子ID格式检查
  // ════════════════════════════════════════
  console.log('═══════════════════════════════════════');
  console.log('三、格子ID格式检查');
  console.log('═══════════════════════════════════════');
  console.log('Layer | 总格 | 有效 | 无效 | 重复 | 坐标不匹配 | 状态');
  console.log('------|------|------|------|------|-----------|------');

  for (let i = 0; i < layerReports.length; i++) {
    const report = layerReports[i];
    const cid = report.cellIds;
    const status = cid.isValid ? 'PASS' : 'FAIL';
    console.log(
      `L${String(allLayers[i].layerNumber).padStart(1)}    | ${
        String(cid.totalCells).padStart(4)
      } | ${String(cid.validIds).padStart(4)} | ${
        String(cid.invalidIds.length).padStart(4)
      } | ${String(cid.duplicateIds.length).padStart(4)} | ${
        String(cid.coordinateMismatches.length).padStart(9)
      } | ${status}`
    );
  }
  console.log('');

  // ════════════════════════════════════════
  // 四、路径ID格式检查
  // ════════════════════════════════════════
  console.log('═══════════════════════════════════════');
  console.log('四、路径ID格式检查');
  console.log('═══════════════════════════════════════');
  console.log('Layer | 总路径 | 格式正确 | from/to一致 | 重复ID | 状态');
  console.log('------|--------|----------|-------------|--------|------');

  for (let i = 0; i < layerReports.length; i++) {
    const report = layerReports[i];
    const pid = report.pathIds;
    const consistentCount = pid.totalPaths - pid.fromToInconsistencies.length;
    const status = pid.isValid ? 'PASS' : 'FAIL';
    console.log(
      `L${String(allLayers[i].layerNumber).padStart(1)}    | ${
        String(pid.totalPaths).padStart(6)
      } | ${String(pid.validFormatCount).padStart(8)} | ${
        String(consistentCount).padStart(11)
      } | ${String(pid.duplicatePathIds.length).padStart(6)} | ${status}`
    );
  }
  console.log('');

  // ════════════════════════════════════════
  // 五、问题清单
  // ════════════════════════════════════════
  console.log('═══════════════════════════════════════');
  console.log('五、问题清单 (ERROR/WARN/INFO)');
  console.log('═══════════════════════════════════════');

  if (allIssues.length === 0) {
    console.log('[INFO] 所有层数据验证通过，未发现问题！');
  } else {
    // 按严重程度排序：ERROR -> WARN -> INFO
    const sortedIssues = [...allIssues].sort((a, b) => {
      const order = { ERROR: 0, WARN: 1, INFO: 2 };
      return order[a.level] - order[b.level];
    });

    for (const issue of sortedIssues) {
      const prefix = `[${issue.level}]`;
      console.log(
        `${prefix.padEnd(7)} Layer ${issue.layerNumber}: ${issue.message}`
      );
      if (issue.suggestion) {
        console.log(`         → 建议: ${issue.suggestion}`);
      }
    }
  }
  console.log('');

  // ════════════════════════════════════════
  // 六、结论与统计
  // ════════════════════════════════════════
  console.log('═══════════════════════════════════════');
  console.log('六、结论与统计');
  console.log('═══════════════════════════════════════');

  const passedLayers = layerReports.filter(r =>
    r.connectivity.isValid &&
    r.zones.danglingRefs.length === 0 &&
    r.cellIds.isValid &&
    r.pathIds.isValid
  ).length;

  const errorCount = allIssues.filter(i => i.level === 'ERROR').length;
  const warnCount = allIssues.filter(i => i.level === 'WARN').length;
  const infoCount = allIssues.filter(i => i.level === 'INFO').length;

  const passRate = ((passedLayers / allLayers.length) * 100).toFixed(1);
  console.log(`通过率: ${passedLayers}/${allLayers.length} 层 (${passRate}%)`);
  console.log(`ERROR数: ${errorCount}`);
  console.log(`WARN数: ${warnCount}`);
  console.log(`INFO数: ${infoCount}`);
  console.log('');

  if (passedLayers === allLayers.length) {
    console.log('✅ 结论: 全部9层数据质量验证通过！');
  } else if (passedLayers >= allLayers.length * 0.8) {
    console.log(`⚠️  结论: 大部分层通过验证 (${passedLayers}/${allLayers.length})，需修复 ${allLayers.length - passedLayers} 层的问题`);
  } else {
    console.log(`❌ 结论: 多层数据存在问题，需要全面修复 (${passedLayers}/${allLayers.length} 通过)`);
  }
  console.log('');
  console.log('========================================');
  console.log('         验证报告结束');
  console.log('========================================');
}

// 执行验证
runFullValidation();
