import React, { useMemo } from 'react';
import { SRayLandCell as SRayLandCellComponent } from './SRayLandCell';
import { SRayLandPath } from './SRayLandPath';

export interface SRayLandCell {
  id: string;
  position: { x: number; y: number };
  type: 'start' | 'battle' | 'chance' | 'bookstore' | 'skill' | 'special' | 'elite' | 'boss' | 'end' | 'default';
  state: 'locked' | 'pending' | 'current' | 'cleared' | 'failed';
  label?: string;
}

export interface SRayLandMapRendererProps {
  cells?: SRayLandCell[];
  currentCellId?: string;
  onCellClick?: (cellId: string) => void;
}

// 苹果轮廓的双路径结构的格子位置
function generateGridCells(): SRayLandCell[] {
  const cells: SRayLandCell[] = [];
  
  // 上半部分 - 不规则弧形路径（苹果上半部分）
  const upperPath = [
    { id: 'u1', position: { x: 50, y: 10 }, type: 'start', state: 'current' },     // 顶部
    { id: 'u2', position: { x: 60, y: 15 }, type: 'default', state: 'pending' },     // 右上弧
    { id: 'u3', position: { x: 70, y: 22 }, type: 'chance', state: 'pending' },     // 右上弧
    { id: 'u4', position: { x: 78, y: 30 }, type: 'special', state: 'pending' },     // 右上弧
    { id: 'u5', position: { x: 82, y: 40 }, type: 'default', state: 'pending' },    // 右下方弧
    { id: 'u6', position: { x: 78, y: 50 }, type: 'chance', state: 'pending' },    // 右下方弧
    { id: 'u7', position: { x: 70, y: 58 }, type: 'default', state: 'pending' },     // 右下方弧
  ];
  
  // 连接路径
  const connectorPath = [
    { id: 'c1', position: { x: 60, y: 64 }, type: 'special', state: 'pending' },     // 连接
    { id: 'c2', position: { x: 50, y: 68 }, type: 'default', state: 'pending' },     // 连接
  ];
  
  // 下半部分 - 标准圆形路径（苹果下半部分）
  const lowerPath = [
    { id: 'l1', position: { x: 40, y: 72 }, type: 'default', state: 'pending' },     // 左下
    { id: 'l2', position: { x: 32, y: 80 }, type: 'chance', state: 'pending' },     // 左下
    { id: 'l3', position: { x: 30, y: 90 }, type: 'default', state: 'pending' },     // 左下
    { id: 'l4', position: { x: 35, y: 100 }, type: 'special', state: 'pending' },    // 底部
    { id: 'l5', position: { x: 45, y: 105 }, type: 'battle', state: 'pending' },    // 底部
    { id: 'l6', position: { x: 55, y: 105 }, type: 'default', state: 'pending' },    // 底部
    { id: 'l7', position: { x: 65, y: 100 }, type: 'chance', state: 'pending' },    // 底部
    { id: 'l8', position: { x: 70, y: 90 }, type: 'default', state: 'pending' },     // 右下
    { id: 'l9', position: { x: 68, y: 80 }, type: 'end', state: 'pending' },       // 右下（终点）
    { id: 'l10', position: { x: 60, y: 72 }, type: 'default', state: 'pending' },   // 右下
  ];
  
  // 短柄延伸
  const stemPath = [
    { id: 's1', position: { x: 45, y: 5 }, type: 'default', state: 'pending' },      // 短柄
    { id: 's2', position: { x: 40, y: 8 }, type: 'default', state: 'pending' },      // 短柄
  ];
  
  // 添加所有格子
  [...upperPath, ...connectorPath, ...lowerPath, ...stemPath].forEach(cell => {
    cells.push(cell);
  });
  
  return cells;
}

export function SRayLandMapRenderer({ cells, currentCellId, onCellClick }: SRayLandMapRendererProps) {
  const defaultCells = useMemo(() => generateGridCells(), []);
  const displayCells = cells || defaultCells;
  
  // 构建连接路径 - 苹果轮廓的双路径结构
  const connections = useMemo(() => {
    const paths: { from: string; to: string }[] = [];
    
    // 短柄延伸连接
    paths.push({ from: 's2', to: 's1' });
    paths.push({ from: 's1', to: 'u1' });
    
    // 上半部分 - 不规则弧形路径
    const upperPath = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'];
    for (let i = 0; i < upperPath.length - 1; i++) {
      paths.push({ from: upperPath[i], to: upperPath[i + 1] });
    }
    
    // 连接路径
    const connectorPath = ['u7', 'c1', 'c2'];
    for (let i = 0; i < connectorPath.length - 1; i++) {
      paths.push({ from: connectorPath[i], to: connectorPath[i + 1] });
    }
    
    // 下半部分 - 标准圆形路径
    const lowerPath = ['c2', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10', 'c2'];
    for (let i = 0; i < lowerPath.length - 1; i++) {
      paths.push({ from: lowerPath[i], to: lowerPath[i + 1] });
    }
    
    return paths;
  }, []);
  
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(180deg, #F5DEB3 0%, #DEB887 50%, #D2B48C 100%)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '4px solid #8B4513',
      boxShadow: 'inset 0 0 50px rgba(139, 69, 19, 0.3)',
    }}>
      <svg 
        viewBox="0 0 100 108" 
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* 复古纸张纹理背景 */}
        <defs>
          <pattern id="paperTexture" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="#F5DEB3" />
            <circle cx="25" cy="25" r="1" fill="#D2B48C" opacity="0.5" />
            <circle cx="75" cy="75" r="1.5" fill="#DEB887" opacity="0.4" />
            <circle cx="50" cy="50" r="1" fill="#D2B48C" opacity="0.6" />
          </pattern>
          
          {/* 罗盘针旋转动画 */}
          <radialGradient id="compassGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
          
          {/* 格子填充图案 */}
          <pattern id="orangeTile" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#FFA500" />
          </pattern>
          <pattern id="whiteTile" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#FFFFFF" />
          </pattern>
        </defs>
        
        {/* 复古拼贴风格的奇幻地图背景 */}
        <g style={{ opacity: 0.6 }}>
          {/* 复古地图纹理 */}
          <rect width="100" height="100" fill="#F5DEB3" />
          <pattern id="vintageTexture" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 10 L 20 10" stroke="#DEB887" strokeWidth="0.5" strokeOpacity="0.3" />
            <path d="M 10 0 L 10 20" stroke="#DEB887" strokeWidth="0.5" strokeOpacity="0.3" />
            <circle cx="5" cy="5" r="0.5" fill="#8B4513" opacity="0.2" />
            <circle cx="15" cy="15" r="0.3" fill="#8B4513" opacity="0.1" />
          </pattern>
          <rect width="100" height="100" fill="url(#vintageTexture)" />
          
          {/* 手绘森林/山脉景观 */}
          <path d="M 10 70 Q 20 65 30 70 Q 40 75 50 70 Q 60 65 70 70 Q 80 75 90 70" fill="#228B22" opacity="0.4" />
          <path d="M 15 60 Q 25 55 35 60 Q 45 65 55 60 Q 65 55 75 60 Q 85 65 95 60" fill="#2E8B57" opacity="0.3" />
          
          {/* 星球插画 */}
          <circle cx="10" cy="20" r="5" fill="#FFD700" opacity="0.7" />
          <circle cx="85" cy="15" r="3" fill="#1E90FF" opacity="0.8" />
          
          {/* 复古地理元素 */}
          <path d="M 20 30 L 25 25 L 30 30 L 25 35 Z" fill="#8B4513" opacity="0.5" />
          <path d="M 70 40 L 75 35 L 80 40 L 75 45 Z" fill="#8B4513" opacity="0.5" />
        </g>
        
        {/* 下方圆形路径内部的白色十字线 */}
        <g>
          {/* 十字线 */}
          <line x1="50" y1="70" x2="50" y2="105" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.8" />
          <line x1="30" y1="87" x2="70" y2="87" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.8" />
          
          {/* 四个象限标注 */}
          <text x="40" y="80" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="10" fontWeight="bold" fontFamily="'Georgia', serif">W</text>
          <text x="60" y="80" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="10" fontWeight="bold" fontFamily="'Georgia', serif">N</text>
          <text x="40" y="95" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="10" fontWeight="bold" fontFamily="'Georgia', serif">I</text>
          <text x="60" y="95" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="10" fontWeight="bold" fontFamily="'Georgia', serif">P</text>
          
          {/* 右上N象限的end标记 */}
          <text x="68" y="75" textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize="3" fontWeight="bold" fontFamily="'Georgia', serif">end</text>
        </g>
        
        {/* 路径层 */}
        <SRayLandPath connections={connections} cells={displayCells} />
        
        {/* 格子节点 */}
        {displayCells.map((cell, index) => (
          <SRayLandCellComponent
            key={cell.id}
            cell={cell}
            isCurrent={currentCellId === cell.id}
            isAlternate={index % 2 === 0}
            onClick={() => onCellClick?.(cell.id)}
          />
        ))}
        
        {/* 底部SRayLand标签 */}
        <text x="50" y="106" textAnchor="middle" dominantBaseline="middle" fill="#8B4513" fontSize="7" fontWeight="bold" fontFamily="'Georgia', serif" style={{ letterSpacing: '2px' }}>
          SRayLand
        </text>
      </svg>
    </div>
  );
}
