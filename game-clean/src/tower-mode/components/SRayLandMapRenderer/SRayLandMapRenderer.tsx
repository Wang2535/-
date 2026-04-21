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

// 双闭合环8字形路径的格子位置
function generateGridCells(): SRayLandCell[] {
  const cells: SRayLandCell[] = [];
  
  // 上半环 - 圆角菱形轨道
  // 顶部
  cells.push({ id: 'u1', position: { x: 50, y: 8 }, type: 'default', state: 'pending' });
  cells.push({ id: 'u2', position: { x: 60, y: 12 }, type: 'default', state: 'pending' });
  cells.push({ id: 'u3', position: { x: 70, y: 16 }, type: 'default', state: 'pending' });
  cells.push({ id: 'u4', position: { x: 80, y: 20 }, type: 'default', state: 'pending' });
  // 右上
  cells.push({ id: 'u5', position: { x: 85, y: 28 }, type: 'default', state: 'pending' });
  cells.push({ id: 'u6', position: { x: 88, y: 36 }, type: 'default', state: 'pending' });
  cells.push({ id: 'u7', position: { x: 85, y: 44 }, type: 'default', state: 'pending' });
  cells.push({ id: 'u8', position: { x: 80, y: 52 }, type: 'default', state: 'pending' });
  // 右中
  cells.push({ id: 'u9', position: { x: 75, y: 56 }, type: 'default', state: 'pending' });
  cells.push({ id: 'u10', position: { x: 70, y: 60 }, type: 'default', state: 'pending' });
  // 中间连接 - 右
  cells.push({ id: 'c1', position: { x: 65, y: 62 }, type: 'default', state: 'pending' });
  cells.push({ id: 'c2', position: { x: 60, y: 64 }, type: 'default', state: 'pending' });
  cells.push({ id: 'c3', position: { x: 55, y: 65 }, type: 'default', state: 'pending' });
  cells.push({ id: 'c4', position: { x: 50, y: 66 }, type: 'default', state: 'pending' });
  cells.push({ id: 'c5', position: { x: 45, y: 65 }, type: 'default', state: 'pending' });
  cells.push({ id: 'c6', position: { x: 40, y: 64 }, type: 'default', state: 'pending' });
  cells.push({ id: 'c7', position: { x: 35, y: 62 }, type: 'default', state: 'pending' });
  // 中间连接 - 左
  cells.push({ id: 'l1', position: { x: 30, y: 60 }, type: 'default', state: 'pending' });
  cells.push({ id: 'l2', position: { x: 25, y: 56 }, type: 'default', state: 'pending' });
  // 左下
  cells.push({ id: 'l3', position: { x: 20, y: 52 }, type: 'default', state: 'pending' });
  cells.push({ id: 'l4', position: { x: 15, y: 44 }, type: 'default', state: 'pending' });
  cells.push({ id: 'l5', position: { x: 12, y: 36 }, type: 'default', state: 'pending' });
  cells.push({ id: 'l6', position: { x: 15, y: 28 }, type: 'default', state: 'pending' });
  // 左上
  cells.push({ id: 'l7', position: { x: 20, y: 20 }, type: 'default', state: 'pending' });
  cells.push({ id: 'l8', position: { x: 30, y: 16 }, type: 'default', state: 'pending' });
  cells.push({ id: 'l9', position: { x: 40, y: 12 }, type: 'default', state: 'pending' });
  
  // 下半环 - 圆角矩形轨道
  // 左下
  cells.push({ id: 'll1', position: { x: 25, y: 72 }, type: 'default', state: 'pending' });
  cells.push({ id: 'll2', position: { x: 22, y: 80 }, type: 'default', state: 'pending' });
  cells.push({ id: 'll3', position: { x: 22, y: 88 }, type: 'default', state: 'pending' });
  cells.push({ id: 'll4', position: { x: 25, y: 96 }, type: 'default', state: 'pending' });
  // 底部
  cells.push({ id: 'll5', position: { x: 35, y: 98 }, type: 'default', state: 'pending' });
  cells.push({ id: 'll6', position: { x: 45, y: 98 }, type: 'default', state: 'pending' });
  cells.push({ id: 'll7', position: { x: 55, y: 98 }, type: 'default', state: 'pending' });
  cells.push({ id: 'll8', position: { x: 65, y: 98 }, type: 'default', state: 'pending' });
  cells.push({ id: 'll9', position: { x: 75, y: 98 }, type: 'default', state: 'pending' });
  // 右下 - 终点
  cells.push({ id: 'll10', position: { x: 78, y: 96 }, type: 'end', state: 'pending' });
  cells.push({ id: 'll11', position: { x: 78, y: 88 }, type: 'default', state: 'pending' });
  cells.push({ id: 'll12', position: { x: 78, y: 80 }, type: 'default', state: 'pending' });
  cells.push({ id: 'll13', position: { x: 75, y: 72 }, type: 'default', state: 'pending' });
  
  // 设置起点
  const startCell = cells.find(c => c.id === 'u1');
  if (startCell) {
    startCell.type = 'start';
    startCell.state = 'current';
  }
  
  // 设置一些战斗格
  ['u4', 'u8', 'l4', 'l8', 'll3', 'll7', 'll11'].forEach(id => {
    const cell = cells.find(c => c.id === id);
    if (cell) cell.type = 'battle';
  });
  
  // 设置机会格
  ['u6', 'l6', 'll5', 'll9'].forEach(id => {
    const cell = cells.find(c => c.id === id);
    if (cell) cell.type = 'chance';
  });
  
  // 设置特殊格
  ['u10', 'l2', 'll13'].forEach(id => {
    const cell = cells.find(c => c.id === id);
    if (cell) cell.type = 'special';
  });
  
  return cells;
}

export function SRayLandMapRenderer({ cells, currentCellId, onCellClick }: SRayLandMapRendererProps) {
  const defaultCells = useMemo(() => generateGridCells(), []);
  const displayCells = cells || defaultCells;
  
  // 构建连接路径 - 确保连续的线条
  const connections = useMemo(() => {
    const paths: { from: string; to: string }[] = [];
    
    // 上半环连接 - 圆角菱形轨道
    const upperRing = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10'];
    for (let i = 0; i < upperRing.length - 1; i++) {
      paths.push({ from: upperRing[i], to: upperRing[i + 1] });
    }
    paths.push({ from: upperRing[upperRing.length - 1], to: 'c1' });
    
    // 中间连接
    const middleConnector = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
    for (let i = 0; i < middleConnector.length - 1; i++) {
      paths.push({ from: middleConnector[i], to: middleConnector[i + 1] });
    }
    paths.push({ from: middleConnector[middleConnector.length - 1], to: 'l1' });
    
    // 左上连接 - 回到起点
    const leftConnector = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9'];
    for (let i = 0; i < leftConnector.length - 1; i++) {
      paths.push({ from: leftConnector[i], to: leftConnector[i + 1] });
    }
    paths.push({ from: leftConnector[leftConnector.length - 1], to: 'u1' });
    
    // 下半环连接 - 圆角矩形轨道
    const lowerRing = ['c4', 'll1', 'll2', 'll3', 'll4', 'll5', 'll6', 'll7', 'll8', 'll9', 'll10', 'll11', 'll12', 'll13'];
    for (let i = 0; i < lowerRing.length - 1; i++) {
      paths.push({ from: lowerRing[i], to: lowerRing[i + 1] });
    }
    paths.push({ from: lowerRing[lowerRing.length - 1], to: 'c4' });
    
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
        
        {/* 复古大航海背景插画 */}
        <g style={{ opacity: 0.6 }}>
          {/* 海洋波浪 */}
          <path d="M 0 60 Q 10 55 20 60 Q 30 65 40 60 Q 50 55 60 60 Q 70 65 80 60 Q 90 55 100 60 L 100 100 L 0 100 Z" fill="#4682B4" />
          <path d="M 0 68 Q 15 63 30 68 Q 45 73 60 68 Q 75 63 90 68 L 100 68 L 100 100 L 0 100 Z" fill="#5F9EA0" />
          
          {/* 火山 */}
          <path d="M 10 55 L 15 40 L 20 55 L 25 45 L 30 55 Z" fill="#8B0000" />
          <path d="M 15 40 Q 17.5 35 20 40 Q 22.5 35 25 45" fill="none" stroke="#FF4500" strokeWidth="1" />
          
          {/* 森林 */}
          <path d="M 70 50 L 72 42 L 74 50 Z" fill="#228B22" />
          <path d="M 75 48 L 77 40 L 79 48 Z" fill="#2E8B57" />
          <path d="M 80 50 L 82 43 L 84 50 Z" fill="#228B22" />
          
          {/* 雪山 */}
          <path d="M 8 45 L 12 38 L 16 45 Z" fill="#FFFAFA" />
          <path d="M 18 48 L 21 42 L 24 48 Z" fill="#F0F8FF" />
          
          {/* 天体 - 星星 */}
          <path d="M 15 15 L 16 16 L 17 15 L 16 14 Z" fill="#FFD700" />
          <path d="M 85 25 L 86 26 L 87 25 L 86 24 Z" fill="#FFD700" />
          <path d="M 45 10 L 46 11 L 47 10 L 46 9 Z" fill="#FFD700" />
          
          {/* 罗盘 */}
          <circle cx="50" cy="35" r="6" fill="none" stroke="#8B4513" strokeWidth="1.5" />
          <circle cx="50" cy="35" r="4" fill="none" stroke="#8B4513" strokeWidth="1" />
          <path d="M 50 30 L 52 35 L 50 40 L 48 35 Z" fill="#FF0000" />
          <path d="M 50 30 L 48 35 L 50 40 L 52 35 Z" fill="#FFFFFF" />
          <circle cx="50" cy="35" r="1" fill="#8B4513" />
        </g>
        
        {/* 田字格核心区 - W N I P */}
        <g>
          <rect x="35" y="70" width="15" height="15" fill="rgba(255,165,0,0.2)" stroke="#8B4513" strokeWidth="1.5" />
          <rect x="50" y="70" width="15" height="15" fill="rgba(255,165,0,0.2)" stroke="#8B4513" strokeWidth="1.5" />
          <rect x="35" y="85" width="15" height="15" fill="rgba(255,165,0,0.2)" stroke="#8B4513" strokeWidth="1.5" />
          <rect x="50" y="85" width="15" height="15" fill="rgba(255,165,0,0.2)" stroke="#8B4513" strokeWidth="1.5" />
          
          <text x="42.5" y="81" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">W</text>
          <text x="57.5" y="81" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">N</text>
          <text x="42.5" y="96" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">I</text>
          <text x="57.5" y="96" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">P</text>
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
