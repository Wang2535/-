import React, { useMemo, useState, useEffect } from 'react';
import { SRayLandCell as SRayLandCellComponent } from './SRayLandCell';
import { SRayLandPath } from './SRayLandPath';
import { LevelAssignmentEngine } from '../../engine/LevelAssignmentEngine';
import { THEME_LEVELS, BOSS_LEVELS, TIER_THEME_MAP } from '../../data/themeLevelMapping';

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
  layerNumber?: number;
}

// 葫芦形路径的格子位置 - 严格按照参考图设计
function generateGridCells(): SRayLandCell[] {
  const cells: SRayLandCell[] = [];
  
  // 上半部分 - 葫芦形上半部分路径
  const upperPath = [
    { id: 'u1', position: { x: 50, y: 5 }, type: 'start', state: 'current' },      // 顶部起点
    { id: 'u2', position: { x: 60, y: 12 }, type: 'battle', state: 'pending' },     // 右上弧
    { id: 'u3', position: { x: 70, y: 20 }, type: 'battle', state: 'pending' },     // 右上弧
    { id: 'u4', position: { x: 78, y: 30 }, type: 'battle', state: 'pending' },     // 右上弧
    { id: 'u5', position: { x: 82, y: 42 }, type: 'battle', state: 'pending' },     // 右下方弧
    { id: 'u6', position: { x: 78, y: 55 }, type: 'battle', state: 'pending' },     // 右下方弧
    { id: 'u7', position: { x: 70, y: 65 }, type: 'battle', state: 'pending' },     // 右下方弧
  ];
  
  // 连接路径
  const connectorPath = [
    { id: 'c1', position: { x: 60, y: 72 }, type: 'battle', state: 'pending' },    // 连接
    { id: 'c2', position: { x: 50, y: 75 }, type: 'battle', state: 'pending' },    // 连接
  ];
  
  // 下半部分 - 葫芦形底部圆形区域（W-N-I-P十字分区）
  const lowerPath = [
    { id: 'l1', position: { x: 40, y: 80 }, type: 'battle', state: 'pending' },    // 左下（W区域）
    { id: 'l2', position: { x: 35, y: 90 }, type: 'battle', state: 'pending' },    // 左下（I区域）
    { id: 'l3', position: { x: 40, y: 100 }, type: 'battle', state: 'pending' },   // 底部
    { id: 'l4', position: { x: 50, y: 105 }, type: 'battle', state: 'pending' },   // 底部
    { id: 'l5', position: { x: 60, y: 100 }, type: 'battle', state: 'pending' },   // 底部
    { id: 'l6', position: { x: 65, y: 90 }, type: 'battle', state: 'pending' },    // 右下（P区域）
    { id: 'l7', position: { x: 70, y: 80 }, type: 'boss', state: 'locked' },       // 右下（N区域，Boss格）
    { id: 'l8', position: { x: 65, y: 75 }, type: 'end', state: 'locked' },         // 终点（N区域上方）
  ];
  
  // 短柄延伸
  const stemPath = [
    { id: 's1', position: { x: 45, y: 2 }, type: 'battle', state: 'pending' },     // 短柄
    { id: 's2', position: { x: 40, y: 4 }, type: 'battle', state: 'pending' },     // 短柄
  ];
  
  // 添加所有格子
  [...stemPath, ...upperPath, ...connectorPath, ...lowerPath].forEach(cell => {
    cells.push(cell);
  });
  
  return cells;
}

export function SRayLandMapRenderer({ cells, currentCellId, onCellClick, layerNumber = 1 }: SRayLandMapRendererProps) {
  const defaultCells = useMemo(() => generateGridCells(), []);
  const [displayCells, setDisplayCells] = useState<SRayLandCell[]>(cells || defaultCells);
  const [levelAssignments, setLevelAssignments] = useState<Map<string, any>>(new Map());
  const [scrollY, setScrollY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScrollY, setDragStartScrollY] = useState(0);
  
  // 滚动事件处理
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newScrollY = scrollY - e.deltaY * 0.1;
    // 限制滚动范围
    setScrollY(Math.max(-50, Math.min(50, newScrollY)));
  };

  // 拖拽开始
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartScrollY(scrollY);
  };

  // 拖拽移动
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const deltaY = e.clientY - dragStartY;
      const newScrollY = dragStartScrollY - deltaY * 0.1;
      // 限制滚动范围
      setScrollY(Math.max(-50, Math.min(50, newScrollY)));
    }
  };

  // 拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 构建连接路径 - 葫芦形路径结构
  const connections = useMemo(() => {
    const paths: { from: string; to: string }[] = [];
    
    // 短柄延伸连接
    paths.push({ from: 's2', to: 's1' });
    paths.push({ from: 's1', to: 'u1' });
    
    // 上半部分 - 葫芦形上半部分路径
    const upperPath = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'];
    for (let i = 0; i < upperPath.length - 1; i++) {
      paths.push({ from: upperPath[i], to: upperPath[i + 1] });
    }
    
    // 连接路径
    const connectorPath = ['u7', 'c1', 'c2'];
    for (let i = 0; i < connectorPath.length - 1; i++) {
      paths.push({ from: connectorPath[i], to: connectorPath[i + 1] });
    }
    
    // 下半部分 - 葫芦形底部圆形路径（W-N-I-P十字分区）
    const lowerPath = ['c2', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'c2'];
    for (let i = 0; i < lowerPath.length - 1; i++) {
      paths.push({ from: lowerPath[i], to: lowerPath[i + 1] });
    }
    
    return paths;
  }, []);
  
  // 导入关卡并分配到战斗格
  useEffect(() => {
    const battleCells = displayCells.filter(cell => cell.type === 'battle');
    const bossCell = displayCells.find(cell => cell.type === 'boss');
    if (battleCells.length > 0 && bossCell) {
      const levelEngine = new LevelAssignmentEngine();
      
      // 创建关卡数据库
      const levelDatabase = [];
      const theme = TIER_THEME_MAP[layerNumber];
      const levels = THEME_LEVELS[theme] || [];
      
      for (const levelId of levels) {
        levelDatabase.push({
          id: levelId,
          theme,
          difficulty: Math.ceil(layerNumber / 3),
          title: `关卡 ${levelId}`,
          description: `第 ${layerNumber} 层 ${theme} 主题关卡`,
        });
      }
      
      // 添加BOSS关卡
      const bossId = BOSS_LEVELS[theme];
      if (bossId) {
        levelDatabase.push({
          id: bossId,
          theme,
          difficulty: Math.ceil(layerNumber / 3) + 1,
          title: `BOSS 关卡 ${bossId}`,
          description: `第 ${layerNumber} 层 BOSS 战`,
          isBoss: true,
        });
      }
      
      try {
        levelEngine.initializePools(levelDatabase);
        const battleCellIds = battleCells.map(cell => cell.id);
        const assignment = levelEngine.assignLayer(layerNumber, battleCellIds, bossCell.id);
        
        // 创建关卡分配映射
        const assignmentsMap = new Map();
        Object.entries(assignment.battleCellAssignments).forEach(([cellId, levelId]) => {
          const levelInfo = levelDatabase.find(l => l.id === levelId);
          if (levelInfo) {
            assignmentsMap.set(cellId, {
              id: levelId,
              name: levelInfo.title,
              difficulty: levelInfo.difficulty,
              isElite: levelInfo.difficulty >= 4
            });
          }
        });
        
        setLevelAssignments(assignmentsMap);
        
        // 更新战斗格的难度和状态
        const updatedCells = displayCells.map(cell => {
          if (cell.type === 'battle') {
            const assignment = assignmentsMap.get(cell.id);
            if (assignment) {
              return {
                ...cell,
                metadata: {
                  levelId: assignment.id,
                  levelName: assignment.name,
                  difficulty: assignment.difficulty,
                  isElite: assignment.isElite
                }
              };
            }
          }
          return cell;
        });
        setDisplayCells(updatedCells);
      } catch (error) {
        console.error('Level assignment error:', error);
      }
    }
  }, [layerNumber, connections]);
  
  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #F5DEB3 0%, #DEB887 50%, #D2B48C 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '4px solid #8B4513',
        boxShadow: 'inset 0 0 50px rgba(139, 69, 19, 0.3)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg 
        viewBox="0 0 100 110" 
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          position: 'absolute', 
          inset: 0, 
          width: '100%', 
          height: '100%',
          transform: `translateY(${scrollY}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
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
          <line x1="50" y1="75" x2="50" y2="105" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.8" />
          <line x1="35" y1="90" x2="65" y2="90" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.8" />
          
          {/* 区域效果视觉指示器 */}
          {/* W区域（虚弱区）- 淡红色半透明覆盖 */}
          <rect x="40" y="75" width="10" height="15" fill="#FF6B6B" fillOpacity="0.2" />
          {/* N区域（知识区）- 淡蓝色半透明覆盖 */}
          <rect x="50" y="75" width="10" height="15" fill="#4ECDC4" fillOpacity="0.2" />
          {/* I区域（反转区）- 淡紫色半透明覆盖 */}
          <rect x="40" y="90" width="10" height="15" fill="#9B59B6" fillOpacity="0.2" />
          {/* P区域（跳过区）- 淡黄色半透明覆盖 */}
          <rect x="50" y="90" width="10" height="15" fill="#FFE66D" fillOpacity="0.2" />
          
          {/* 四个象限标注 */}
          <text x="45" y="82" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">W</text>
          <text x="55" y="82" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">N</text>
          <text x="45" y="97" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">I</text>
          <text x="55" y="97" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">P</text>
          
          {/* 右上N象限的end标记 */}
          <text x="65" y="75" textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize="3" fontWeight="bold" fontFamily="'Georgia', serif">end</text>
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
