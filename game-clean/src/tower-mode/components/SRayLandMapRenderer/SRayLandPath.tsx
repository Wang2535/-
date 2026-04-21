import type { SRayLandCell as SRayLandCellType } from './SRayLandMapRenderer';

interface SRayLandPathProps {
  connections: { from: string; to: string }[];
  cells: SRayLandCellType[];
}

export function SRayLandPath({ connections, cells }: SRayLandPathProps) {
  // 构建位置映射
  const cellPositions = cells.reduce<Record<string, { x: number; y: number }>>((acc, cell) => {
    acc[cell.id] = cell.position;
    return acc;
  }, {});

  return (
    <g>
      {connections.map((conn, i) => {
        // 支持不同格式的连接数据
        const fromId = conn.from || conn.fromCellId;
        const toId = conn.to || conn.toCellId;
        
        const from = cellPositions[fromId];
        const to = cellPositions[toId];
        
        if (!from || !to) return null;

        // 复古路径样式 - 更粗的线条
        return (
          <path
            key={i}
            d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
            fill="none"
            stroke="#8B4513"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
            strokeLinejoin="round"
          />
        );
      })}
    </g>
  );
}
