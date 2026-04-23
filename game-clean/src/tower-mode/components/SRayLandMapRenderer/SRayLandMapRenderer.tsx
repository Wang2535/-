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

// 苹果形状的路径格子位置
function generateGridCells(): SRayLandCell[] {
  const cells: SRayLandCell[] = [];
  
  // 上半部分 - 苹果顶部圆弧（从顶部开始顺时针）
  const upperArcPath = [
    { id: 'u1', position: { x: 50, y: 10 }, type: 'start', state: 'current' },      // 起点（苹果梗下方）
    { id: 'u2', position: { x: 58, y: 12 }, type: 'battle', state: 'pending' },
    { id: 'u3', position: { x: 66, y: 18 }, type: 'battle', state: 'pending' },
    { id: 'u4', position: { x: 72, y: 26 }, type: 'battle', state: 'pending' },
    { id: 'u5', position: { x: 74, y: 36 }, type: 'battle', state: 'pending' },
    { id: 'u6', position: { x: 72, y: 46 }, type: 'battle', state: 'pending' },
    { id: 'u7', position: { x: 66, y: 56 }, type: 'battle', state: 'pending' },
    { id: 'u8', position: { x: 58, y: 64 }, type: 'battle', state: 'pending' },
  ];
  
  // 连接段 - 连接上弧底部和下圆顶部
  const connectorPath = [
    { id: 'c1', position: { x: 50, y: 68 }, type: 'battle', state: 'pending' },    // 连接点
  ];
  
  // 下半部分 - 苹果底部圆形（顺时针）
  const lowerCirclePath = [
    { id: 'l1', position: { x: 42, y: 72 }, type: 'battle', state: 'pending' },    // W象限区域
    { id: 'l2', position: { x: 34, y: 78 }, type: 'battle', state: 'pending' },
    { id: 'l3', position: { x: 30, y: 88 }, type: 'battle', state: 'pending' },    // I象限区域
    { id: 'l4', position: { x: 34, y: 98 }, type: 'battle', state: 'pending' },
    { id: 'l5', position: { x: 42, y: 106 }, type: 'battle', state: 'pending' },
    { id: 'l6', position: { x: 50, y: 110 }, type: 'battle', state: 'pending' },    // 底部
    { id: 'l7', position: { x: 58, y: 106 }, type: 'battle', state: 'pending' },
    { id: 'l8', position: { x: 66, y: 98 }, type: 'battle', state: 'pending' },
    { id: 'l9', position: { x: 70, y: 88 }, type: 'battle', state: 'pending' },    // P象限区域
    { id: 'l10', position: { x: 66, y: 78 }, type: 'battle', state: 'pending' },
    { id: 'l11', position: { x: 62, y: 72 }, type: 'boss', state: 'locked' },   // N象限（Boss格）
    { id: 'l12', position: { x: 58, y: 68 }, type: 'end', state: 'locked' },     // 终点（在N象限旁边）
  ];
  
  // 添加所有格子
  [...upperArcPath, ...connectorPath, ...lowerCirclePath].forEach(cell => {
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
    setScrollY(Math.max(-20, Math.min(20, newScrollY)));
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
      setScrollY(Math.max(-20, Math.min(20, newScrollY)));
    }
  };

  // 拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 构建连接路径
  const connections = useMemo(() => {
    const paths: { from: string; to: string }[] = [];
    
    // 上半部分圆弧路径
    const upperArc = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'];
    for (let i = 0; i < upperArc.length - 1; i++) {
      paths.push({ from: upperArc[i], to: upperArc[i + 1] });
    }
    
    // 连接段
    paths.push({ from: 'u8', to: 'c1' });
    
    // 下半部分圆形路径
    const lowerCircle = ['c1', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10', 'l11', 'l12'];
    for (let i = 0; i < lowerCircle.length - 1; i++) {
      paths.push({ from: lowerCircle[i], to: lowerCircle[i + 1] });
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
        viewBox="20 5 60 115" 
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
          <rect width="100" height="120" fill="#F5DEB3" />
          <pattern id="vintageTexture" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 10 L 20 10" stroke="#DEB887" strokeWidth="0.5" strokeOpacity="0.3" />
            <path d="M 10 0 L 10 20" stroke="#DEB887" strokeWidth="0.5" strokeOpacity="0.3" />
            <circle cx="5" cy="5" r="0.5" fill="#8B4513" opacity="0.2" />
            <circle cx="15" cy="15" r="0.3" fill="#8B4513" opacity="0.1" />
          </pattern>
          <rect width="100" height="120" fill="url(#vintageTexture)" />
          
          {/* 手绘森林/山脉景观 */}
          <path d="M 10 100 Q 20 95 30 100 Q 40 105 50 100 Q 60 95 70 100 Q 80 105 90 100" fill="#228B22" opacity="0.4" />
          <path d="M 15 80 Q 25 75 35 80 Q 45 85 55 80 Q 65 75 75 80 Q 85 85 95 80" fill="#2E8B57" opacity="0.3" />
          
          {/* 星球插画 */}
          <circle cx="10" cy="25" r="4" fill="#FFD700" opacity="0.7" />
          <circle cx="85" cy="20" r="2.5" fill="#1E90FF" opacity="0.8" />
          
          {/* 复古地理元素 */}
          <path d="M 20 45 L 25 40 L 30 45 L 25 50 Z" fill="#8B4513" opacity="0.5" />
          <path d="M 70 55 L 75 50 L 80 55 L 75 60 Z" fill="#8B4513" opacity="0.5" />
        </g>
        
        {/* 下方圆形内部的白色十字线 - 分为四个象限 */}
        <g>
          {/* 十字线 */}
          <line x1="30" y1="88" x2="70" y2="88" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.9" />
          <line x1="50" y1="68" x2="50" y2="108" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.9" />
          
          {/* 四个象限标注 - W N I P */}
          <text x="40" y="78" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="10" fontWeight="bold" fontFamily="'Georgia', serif">W</text>
          <text x="60" y="78" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="10" fontWeight="bold" fontFamily="'Georgia', serif">N</text>
          <text x="40" y="98" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="10" fontWeight="bold" fontFamily="'Georgia', serif">I</text>
          <text x="60" y="98" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="10" fontWeight="bold" fontFamily="'Georgia', serif">P</text>
          
          {/* End标签 - 在N象限旁边 */}
          <rect x="61" y="63" width="10" height="6" rx="1" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />
          <text x="66" y="67" textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize="4" fontWeight="bold" fontFamily="'Georgia', serif">end</text>
        </g>
        
        {/* 苹果梗装饰 */}
        <g>
          <rect x="48" y="2" width="4" height="10" rx="1" fill="#8B4513" />
          <ellipse cx="50" cy="2" rx="3" ry="2" fill="#228B22" />
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
      </svg>
    </div>
  );
}
