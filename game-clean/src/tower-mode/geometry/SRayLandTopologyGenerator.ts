import type { GourdMapTopology, GridCell } from '../types/grid.types';

// SRayLand 地图拓扑生成器
export function generateSRayLandTopology(layerNumber: number = 1): GourdMapTopology {
  // 生成上半环 - 圆角菱形轨道
  const upperCircle = {
    center: { x: 50, y: 25 },
    radius: 20,
    cellIds: Array.from({ length: 10 }, (_, i) => `u${i + 1}`),
  };

  // 生成中间连接
  const connector = {
    width: 10,
    cellIds: Array.from({ length: 7 }, (_, i) => `c${i + 1}`),
  };

  // 生成左下连接
  const leftConnector = {
    cellIds: Array.from({ length: 9 }, (_, i) => `l${i + 1}`),
  };

  // 生成下半环 - 圆角矩形轨道
  const lowerCircle = {
    center: { x: 50, y: 80 },
    radius: 25,
    cellIds: Array.from({ length: 13 }, (_, i) => `ll${i + 1}`),
  };

  // 生成连接
  const connections = [];

  // 上半环连接
  for (let i = 0; i < upperCircle.cellIds.length - 1; i++) {
    connections.push({
      id: `conn_u${i+1}_u${i+2}`,
      fromCellId: upperCircle.cellIds[i],
      toCellId: upperCircle.cellIds[i + 1],
      pathType: 'normal',
    });
  }
  connections.push({
    id: `conn_u10_c1`,
    fromCellId: upperCircle.cellIds[upperCircle.cellIds.length - 1],
    toCellId: connector.cellIds[0],
    pathType: 'normal',
  });

  // 中间连接
  for (let i = 0; i < connector.cellIds.length - 1; i++) {
    connections.push({
      id: `conn_c${i+1}_c${i+2}`,
      fromCellId: connector.cellIds[i],
      toCellId: connector.cellIds[i + 1],
      pathType: 'normal',
    });
  }
  connections.push({
    id: `conn_c7_l1`,
    fromCellId: connector.cellIds[connector.cellIds.length - 1],
    toCellId: leftConnector.cellIds[0],
    pathType: 'normal',
  });

  // 左下连接 - 回到起点
  for (let i = 0; i < leftConnector.cellIds.length - 1; i++) {
    connections.push({
      id: `conn_l${i+1}_l${i+2}`,
      fromCellId: leftConnector.cellIds[i],
      toCellId: leftConnector.cellIds[i + 1],
      pathType: 'normal',
    });
  }
  connections.push({
    id: `conn_l9_u1`,
    fromCellId: leftConnector.cellIds[leftConnector.cellIds.length - 1],
    toCellId: upperCircle.cellIds[0],
    pathType: 'normal',
  });

  // 下半环连接
  connections.push({
    id: `conn_c4_ll1`,
    fromCellId: connector.cellIds[3], // c4
    toCellId: lowerCircle.cellIds[0],
    pathType: 'normal',
  });
  for (let i = 0; i < lowerCircle.cellIds.length - 1; i++) {
    connections.push({
      id: `conn_ll${i+1}_ll${i+2}`,
      fromCellId: lowerCircle.cellIds[i],
      toCellId: lowerCircle.cellIds[i + 1],
      pathType: 'normal',
    });
  }
  connections.push({
    id: `conn_ll13_c4`,
    fromCellId: lowerCircle.cellIds[lowerCircle.cellIds.length - 1],
    toCellId: connector.cellIds[3], // c4
    pathType: 'normal',
  });

  // 生成格子数据
  const cells: GridCell[] = [];

  // 上半环格子
  upperCircle.cellIds.forEach((cellId, index) => {
    cells.push({
      id: cellId,
      coordinate: [0, 0], // 实际位置会在渲染时计算
      type: index === 0 ? 'start' : 'battle',
      state: index === 0 ? 'unlocked' : 'locked',
      difficulty: Math.floor(index / 3) + 1,
      metadata: { label: `上${index + 1}` },
    });
  });

  // 中间连接格子
  connector.cellIds.forEach((cellId, index) => {
    cells.push({
      id: cellId,
      coordinate: [0, 0],
      type: 'chance',
      state: 'locked',
      difficulty: 2,
      metadata: { label: `中${index + 1}` },
    });
  });

  // 左下连接格子
  leftConnector.cellIds.forEach((cellId, index) => {
    cells.push({
      id: cellId,
      coordinate: [0, 0],
      type: 'skill',
      state: 'locked',
      difficulty: 3,
      metadata: { label: `左${index + 1}` },
    });
  });

  // 下半环格子
  lowerCircle.cellIds.forEach((cellId, index) => {
    cells.push({
      id: cellId,
      coordinate: [0, 0],
      type: index === lowerCircle.cellIds.length - 1 ? 'boss' : 'battle',
      state: 'locked',
      difficulty: Math.floor(index / 3) + 3,
      metadata: { label: `下${index + 1}` },
    });
  });

  return {
    id: `srayland-layer-${layerNumber}`,
    upperCircle,
    lowerCircle,
    connector,
    connections,
    cells,
  };
}

// 获取SRayLand地图拓扑
export function getSRayLandTopology(layerNumber: number = 1): GourdMapTopology {
  return generateSRayLandTopology(layerNumber);
}
