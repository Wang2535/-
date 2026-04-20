interface PathLayerProps {
  connections: any[];
  cellPositions: Record<string, { x: number; y: number }>;
  highlightedCells?: string[];
  layerTheme?: { accentColor: string };
  layerNumber?: number;
  getControlPoint?: (from: any, to: any) => any;
  visitedPaths?: Set<string>;
  availablePaths?: Set<string>;
}

// 完整设想中要求的路径颜色
const LAYER_PATH_COLORS: Record<number, string> = {
  1: '#44ff88', // 病毒实验室 - 绿色
  2: '#2196F3', // 网络空间 - 蓝色
  3: '#ffc107', // 数据保险库 - 金色
  4: '#ff9800', // 城市街区 - 橙色
  5: '#795548', // 智能工厂 - 棕色
  6: '#9C27B0', // 移动终端 - 紫色
  7: '#00BCD4', // 云端平台 - 青色
  8: '#E91E63', // 未来实验室 - 粉色
  9: '#ffd700', // 指挥中心 - 金色
};

export function PathLayer({
  connections, cellPositions, highlightedCells = [], layerTheme, layerNumber = 1
}: PathLayerProps) {
  const accentColor = layerTheme?.accentColor || LAYER_PATH_COLORS[layerNumber] || '#44ff88';
  
  return (
    <g>
      {connections.map((conn: any, i: number) => {
        const from = cellPositions[conn.fromCellId];
        const to = cellPositions[conn.toCellId];
        if (!from || !to) return null;
        
        // 判断这条路径是否被高亮
        const isHighlighted = highlightedCells.includes(conn.fromCellId) || 
                              highlightedCells.includes(conn.toCellId);
        
        // 简洁的直线！
        return (
          <path 
            key={conn.id || i}
            d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
            fill="none"
            stroke={isHighlighted ? accentColor : '#555566'}
            strokeWidth={isHighlighted ? 1.2 : 0.7}
            strokeLinecap="round"
            opacity={isHighlighted ? 1 : 0.6}
            strokeDasharray={isHighlighted ? undefined : '3 3'}
          />
        );
      })}
    </g>
  );
}
