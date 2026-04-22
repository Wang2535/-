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

        // 参考图风格的路径 - 黄色和白色相间的复古路径
        return (
          <>
            {/* 路径底色（白色） */}
            <path
              key={`${i}-white`}
              d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.9"
              strokeLinejoin="round"
            />
            {/* 路径主色（橙黄色） */}
            <path
              key={`${i}-orange`}
              d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
              fill="none"
              stroke="#FFA500"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.9"
              strokeLinejoin="round"
            />
          </>
        );
      })}
    </g>
  );
}
