import { SRayLandCell as SRayLandCellType } from './SRayLandMapRenderer';

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
        const from = cellPositions[conn.from];
        const to = cellPositions[conn.to];
        if (!from || !to) return null;

        // 复古路径样式
        return (
          <path
            key={i}
            d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
            fill="none"
            stroke="#8B4513"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
        );
      })}
    </g>
  );
}
