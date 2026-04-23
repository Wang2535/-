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

// 葫芦形状的路径格子位置 - 严格按照规则设计
function generateGridCells(): SRayLandCell[] {
  const cells: SRayLandCell[] = [];
  
  // 上半部分 - 小圆（直径为下半椭圆短轴的 3/4）
  // 上半环右弧段
  const upperRightArc = [
    { id: 'u1', position: { x: 50, y: 10 }, type: 'start', state: 'current' },      // 起点（葫芦顶端）
    { id: 'u2', position: { x: 58, y: 14 }, type: 'battle', state: 'pending' },
    { id: 'u3', position: { x: 62, y: 22 }, type: 'battle', state: 'pending' },
    { id: 'u4', position: { x: 60, y: 30 }, type: 'battle', state: 'pending' },
    { id: 'u5', position: { x: 50, y: 34 }, type: 'battle', state: 'pending' },    // 上半小圆正下方顶点
  ];
  
  // 45° 上行左折段
  const upperLeftDiagonal = [
    { id: 'u6', position: { x: 42, y: 30 }, type: 'battle', state: 'pending' },
    { id: 'u7', position: { x: 38, y: 22 }, type: 'battle', state: 'pending' },    // 上半小圆最左侧顶点
  ];
  
  // 45° 上行右折段
  const upperRightDiagonal = [
    { id: 'u8', position: { x: 42, y: 14 }, type: 'battle', state: 'pending' },
    { id: 'u9', position: { x: 50, y: 10 }, type: 'battle', state: 'pending' },    // 回到起点顶点
  ];
  
  // 上半环左弧段
  const upperLeftArc = [
    { id: 'u10', position: { x: 50, y: 10 }, type: 'battle', state: 'pending' },
    { id: 'u11', position: { x: 42, y: 14 }, type: 'battle', state: 'pending' },
    { id: 'u12', position: { x: 38, y: 22 }, type: 'battle', state: 'pending' },
    { id: 'u13', position: { x: 42, y: 30 }, type: 'battle', state: 'pending' },
    { id: 'u14', position: { x: 50, y: 34 }, type: 'battle', state: 'pending' },    // 上半小圆正下方顶点
  ];
  
  // 下半环左弧段
  const lowerLeftArc = [
    { id: 'l1', position: { x: 50, y: 42 }, type: 'battle', state: 'pending' },
    { id: 'l2', position: { x: 42, y: 50 }, type: 'battle', state: 'pending' },
    { id: 'l3', position: { x: 38, y: 60 }, type: 'battle', state: 'pending' },
    { id: 'l4', position: { x: 42, y: 70 }, type: 'battle', state: 'pending' },
    { id: 'l5', position: { x: 50, y: 78 }, type: 'battle', state: 'pending' },
    { id: 'l6', position: { x: 58, y: 70 }, type: 'battle', state: 'pending' },
    { id: 'l7', position: { x: 62, y: 60 }, type: 'battle', state: 'pending' },    // 下半椭圆右侧 1/5 高度位置
  ];
  
  // 内部正方形闭合段
  const innerSquare = [
    { id: 's1', position: { x: 54, y: 60 }, type: 'battle', state: 'pending' },    // 进入正方形
    { id: 's2', position: { x: 54, y: 52 }, type: 'battle', state: 'pending' },    // 上
    { id: 's3', position: { x: 46, y: 52 }, type: 'battle', state: 'pending' },    // 左
    { id: 's4', position: { x: 46, y: 60 }, type: 'battle', state: 'pending' },    // 下
    { id: 's5', position: { x: 54, y: 60 }, type: 'battle', state: 'pending' },    // 右
    { id: 's6', position: { x: 58, y: 56 }, type: 'end', state: 'locked' },         // 终点（N象限右上角）
  ];
  
  // 添加所有格子
  [...upperRightArc, ...upperLeftDiagonal, ...upperRightDiagonal, ...upperLeftArc, ...lowerLeftArc, ...innerSquare].forEach(cell => {
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
    
    // 上半环右弧段
    const upperRightArc = ['u1', 'u2', 'u3', 'u4', 'u5'];
    for (let i = 0; i < upperRightArc.length - 1; i++) {
      paths.push({ from: upperRightArc[i], to: upperRightArc[i + 1] });
    }
    
    // 45° 上行左折段
    const upperLeftDiagonal = ['u5', 'u6', 'u7'];
    for (let i = 0; i < upperLeftDiagonal.length - 1; i++) {
      paths.push({ from: upperLeftDiagonal[i], to: upperLeftDiagonal[i + 1] });
    }
    
    // 45° 上行右折段
    const upperRightDiagonal = ['u7', 'u8', 'u9'];
    for (let i = 0; i < upperRightDiagonal.length - 1; i++) {
      paths.push({ from: upperRightDiagonal[i], to: upperRightDiagonal[i + 1] });
    }
    
    // 上半环左弧段
    const upperLeftArc = ['u9', 'u10', 'u11', 'u12', 'u13', 'u14'];
    for (let i = 0; i < upperLeftArc.length - 1; i++) {
      paths.push({ from: upperLeftArc[i], to: upperLeftArc[i + 1] });
    }
    
    // 下半环左弧段
    const lowerLeftArc = ['u14', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7'];
    for (let i = 0; i < lowerLeftArc.length - 1; i++) {
      paths.push({ from: lowerLeftArc[i], to: lowerLeftArc[i + 1] });
    }
    
    // 内部正方形闭合段
    const innerSquare = ['l7', 's1', 's2', 's3', 's4', 's5', 's6'];
    for (let i = 0; i < innerSquare.length - 1; i++) {
      paths.push({ from: innerSquare[i], to: innerSquare[i + 1] });
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
        viewBox="30 5 40 90" 
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
        </defs>
        
        {/* 复古美式拼贴风格背景 */}
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
          
          {/* 自然景观元素 */}
          {/* 森林 */}
          <path d="M 10 70 Q 20 65 30 70 Q 40 75 50 70 Q 60 65 70 70 Q 80 75 90 70" fill="#228B22" opacity="0.4" />
          <path d="M 15 60 Q 25 55 35 60 Q 45 65 55 60 Q 65 55 75 60 Q 85 65 95 60" fill="#2E8B57" opacity="0.3" />
          
          {/* 山脉 */}
          <path d="M 10 40 L 15 35 L 20 38 L 25 32 L 30 36 L 35 30 L 40 34 L 45 28 L 50 32 L 55 26 L 60 30 L 65 24 L 70 28 L 75 22 L 80 26 L 85 20 L 90 24" fill="#8B4513" opacity="0.3" />
          
          {/* 火山 */}
          <path d="M 85 30 L 90 25 L 95 30 Z" fill="#CD5C5C" opacity="0.4" />
          <path d="M 90 25 L 90 20" stroke="#FF4500" strokeWidth="1" opacity="0.6" />
          
          {/* 星球 */}
          <circle cx="10" cy="20" r="3" fill="#FFD700" opacity="0.7" />
          <circle cx="85" cy="15" r="2" fill="#1E90FF" opacity="0.8" />
          
          {/* 复古罗盘 */}
          <circle cx="20" cy="40" r="5" fill="#8B4513" opacity="0.5" />
          <line x1="20" y1="35" x2="20" y2="45" stroke="#D2B48C" strokeWidth="0.5" />
          <line x1="15" y1="40" x2="25" y2="40" stroke="#D2B48C" strokeWidth="0.5" />
        </g>
        
        {/* 内部正方形的白色十字线 */}
        <g>
          {/* 十字线 */}
          <line x1="42" y1="56" x2="58" y2="56" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.9" />
          <line x1="50" y1="52" x2="50" y2="60" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.9" />
          
          {/* 四个象限标注 */}
          <text x="46" y="56" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">W</text>
          <text x="54" y="56" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">N</text>
          <text x="46" y="56" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">I</text>
          <text x="54" y="56" textAnchor="middle" dominantBaseline="middle" fill="#FFA500" fontSize="8" fontWeight="bold" fontFamily="'Georgia', serif">P</text>
          
          {/* End标签 */}
          <rect x="56" y="50" width="8" height="5" rx="1" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />
          <text x="60" y="53" textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize="3" fontWeight="bold" fontFamily="'Georgia', serif">end</text>
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
        
        {/* 底部SRayLand标识 */}
        <text x="50" y="95" textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize="6" fontWeight="bold" fontFamily="'Georgia', serif" stroke="#FFFFFF" strokeWidth="0.5">
          SRayLand
        </text>
      </svg>
    </div>
  );
}
