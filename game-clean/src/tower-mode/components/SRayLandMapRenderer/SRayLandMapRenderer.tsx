import React, { useMemo, useState } from 'react';

export interface SRayLandCell {
  id: string;
  position: { x: number; y: number };
  angle?: number;
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

interface PathSegment {
  centerX: number;
  centerY: number;
  angle: number;
}

function generatePathSegments(): PathSegment[] {
  const segments: PathSegment[] = [];
  
  // 坐标系设定：画布宽度100，高度178（9:16比例）
  const upperCircleCenterX = 50; // 上半圆圆心在水平中心
  const upperCircleCenterY = 44.5; // 上半圆圆心在25%处
  const upperCircleRadius = 16.5; // 上半圆直径33
  const lowerCircleCenterX = 50; // 下半圆圆心在水平中心
  const lowerCircleCenterY = 115.7; // 下半圆圆心在65%处
  const lowerCircleRadius = 30; // 下半圆直径60（上圆直径是下圆的55%：33/60=0.55）
  
  // 色块尺寸（完全等宽、等面积）
  const cellWidth = 6;
  const cellHeight = 4;
  
  // ================== 【强制约束：上半小圆路径顺序】 ==================
  
  // 1. 起点：仅在小圆正顶端生成1个独立色块
  segments.push({
    centerX: upperCircleCenterX,
    centerY: upperCircleCenterY - upperCircleRadius,
    angle: 0
  });
  
  // 2. 步骤1：右外弧（仅沿外边缘）
  // 计算右外弧的步数，确保紧贴圆外边缘
  const rightArcSteps = 8;
  for (let i = 1; i <= rightArcSteps; i++) {
    const angle = (i * 90 / rightArcSteps) * Math.PI / 180;
    const offsetX = upperCircleRadius * Math.sin(angle) + 0.5; // 向外偏移0.5确保紧贴外边缘
    const offsetY = upperCircleRadius * Math.cos(angle) - 0.5; // 向外偏移0.5确保紧贴外边缘
    segments.push({
      centerX: upperCircleCenterX + offsetX,
      centerY: upperCircleCenterY - offsetY,
      angle: angle
    });
  }
  
  // 到达上半小圆正底端（葫芦腰位置）
  segments.push({
    centerX: upperCircleCenterX,
    centerY: upperCircleCenterY + upperCircleRadius,
    angle: Math.PI
  });
  
  // 3. 步骤2：左上直线（仅内切，不交叉）
  // 计算从葫芦腰到小圆最左侧顶点的直线距离
  const leftVertexX = upperCircleCenterX - upperCircleRadius;
  const leftVertexY = upperCircleCenterY;
  const distanceToLeftVertex = Math.sqrt(
    Math.pow(upperCircleCenterX - leftVertexX, 2) + 
    Math.pow((upperCircleCenterY + upperCircleRadius) - leftVertexY, 2)
  );
  const leftLineSteps = Math.ceil(distanceToLeftVertex / cellWidth);
  
  for (let i = 1; i <= leftLineSteps; i++) {
    const ratio = i / leftLineSteps;
    segments.push({
      centerX: upperCircleCenterX - ratio * upperCircleRadius,
      centerY: upperCircleCenterY + upperCircleRadius - ratio * upperCircleRadius,
      angle: -Math.PI * 3 / 4
    });
  }
  
  // 到达上半小圆最左侧顶点
  segments.push({
    centerX: leftVertexX,
    centerY: leftVertexY,
    angle: Math.PI / 2
  });
  
  // 4. 步骤3：右上直线（仅内切，不碰起点）
  // 计算从最左侧顶点到起点正下方相邻位置的直线距离
  const startBelowX = upperCircleCenterX;
  const startBelowY = upperCircleCenterY - upperCircleRadius + cellHeight + 1; // 保持1个色块间距
  const distanceToStartBelow = Math.sqrt(
    Math.pow(startBelowX - leftVertexX, 2) + 
    Math.pow(startBelowY - leftVertexY, 2)
  );
  const rightLineSteps = Math.ceil(distanceToStartBelow / cellWidth);
  
  for (let i = 1; i <= rightLineSteps; i++) {
    const ratio = i / rightLineSteps;
    segments.push({
      centerX: leftVertexX + ratio * upperCircleRadius,
      centerY: leftVertexY - ratio * upperCircleRadius,
      angle: Math.PI / 4
    });
  }
  
  // 到达小圆正顶端、起点色块的正下方相邻位置（与起点水平相邻，不重合，保持1个色块间距）
  segments.push({
    centerX: startBelowX,
    centerY: startBelowY,
    angle: 0
  });
  
  // 5. 步骤4：左外弧（仅沿外边缘，对称无交叉）
  // 计算左外弧的步数，确保紧贴圆外边缘，与右外弧对称
  const leftArcSteps = rightArcSteps;
  for (let i = leftArcSteps; i >= 1; i--) {
    const angle = (180 - i * 90 / leftArcSteps) * Math.PI / 180;
    const offsetX = upperCircleRadius * Math.sin(angle) - 0.5; // 向外偏移0.5确保紧贴外边缘
    const offsetY = upperCircleRadius * Math.cos(angle) - 0.5; // 向外偏移0.5确保紧贴外边缘
    segments.push({
      centerX: upperCircleCenterX + offsetX,
      centerY: upperCircleCenterY - offsetY,
      angle: angle
    });
  }
  
  // 回到葫芦腰（上半小圆正底端）
  segments.push({
    centerX: upperCircleCenterX,
    centerY: upperCircleCenterY + upperCircleRadius,
    angle: Math.PI
  });
  
  // ================== 【强制约束：下半大圆正方形路径】 ==================
  
  // 1. 切入位置（仅从外弧向内）
  // 沿大圆左侧外弧顺时针行进，绕经大圆最底端，沿右侧外弧向上行进
  const lowerArcSteps = 16;
  for (let i = 1; i <= lowerArcSteps; i++) {
    const angle = (180 + i * 180 / lowerArcSteps) * Math.PI / 180;
    const offsetX = lowerCircleRadius * Math.sin(angle) + (angle > Math.PI ? 0.5 : -0.5); // 向外偏移确保紧贴外边缘
    const offsetY = lowerCircleRadius * Math.cos(angle) - 0.5; // 向外偏移确保紧贴外边缘
    segments.push({
      centerX: lowerCircleCenterX + offsetX,
      centerY: lowerCircleCenterY - offsetY,
      angle: angle
    });
  }
  
  // 到达下半大圆右侧外弧、从上往下数1/5高度的位置
  const entryY = lowerCircleCenterY - lowerCircleRadius * 0.8; // 1/5高度位置
  segments.push({
    centerX: lowerCircleCenterX + lowerCircleRadius,
    centerY: entryY,
    angle: 0
  });
  
  // 从此处水平向左（从外向内）切入正方形的右边框上半部分
  const squareCenterX = 50;
  const squareCenterY = 124;
  const squareHalfSize = 12;
  const squareRightX = squareCenterX + squareHalfSize;
  
  // 计算从右侧外弧到正方形右边框的距离
  const entryToSquareDistance = (lowerCircleCenterX + lowerCircleRadius) - squareRightX;
  const entrySteps = Math.ceil(entryToSquareDistance / cellWidth);
  
  for (let i = 1; i <= entrySteps; i++) {
    segments.push({
      centerX: lowerCircleCenterX + lowerCircleRadius - i * cellWidth,
      centerY: entryY,
      angle: 0
    });
  }
  
  // 进入正方形路径的右边框上半部分
  segments.push({
    centerX: squareRightX,
    centerY: squareCenterY - squareHalfSize / 2,
    angle: 0
  });
  
  // 2. 绕行顺序（仅顺时针绕边框）
  
  // ① 沿正方形上边框向左行进，到上边框与左边框的交点
  const squareTopY = squareCenterY - squareHalfSize;
  const squareLeftX = squareCenterX - squareHalfSize;
  
  // 从右边框上半部分到上边框右上角
  segments.push({
    centerX: squareRightX,
    centerY: squareTopY,
    angle: 0
  });
  
  // 沿上边框向左到左上角
  const topBorderLength = squareHalfSize * 2;
  const topBorderSteps = Math.ceil(topBorderLength / cellWidth);
  
  for (let i = 1; i <= topBorderSteps; i++) {
    segments.push({
      centerX: squareRightX - i * cellWidth,
      centerY: squareTopY,
      angle: 0
    });
  }
  
  // 到达左上角
  segments.push({
    centerX: squareLeftX,
    centerY: squareTopY,
    angle: Math.PI
  });
  
  // ② 沿正方形左边框向下行进，到左边框与下边框的交点
  const squareBottomY = squareCenterY + squareHalfSize;
  const leftBorderLength = squareHalfSize * 2;
  const leftBorderSteps = Math.ceil(leftBorderLength / cellHeight);
  
  for (let i = 1; i <= leftBorderSteps; i++) {
    segments.push({
      centerX: squareLeftX,
      centerY: squareTopY + i * cellHeight,
      angle: Math.PI
    });
  }
  
  // 到达左下角
  segments.push({
    centerX: squareLeftX,
    centerY: squareBottomY,
    angle: Math.PI / 2
  });
  
  // ③ 沿正方形下边框向右行进，到下边框与右边框的交点
  const bottomBorderLength = squareHalfSize * 2;
  const bottomBorderSteps = Math.ceil(bottomBorderLength / cellWidth);
  
  for (let i = 1; i <= bottomBorderSteps; i++) {
    segments.push({
      centerX: squareLeftX + i * cellWidth,
      centerY: squareBottomY,
      angle: Math.PI / 2
    });
  }
  
  // 到达右下角
  segments.push({
    centerX: squareRightX,
    centerY: squareBottomY,
    angle: -Math.PI
  });
  
  // ④ 沿正方形右边框向上行进，到右边框与上边框的交点（即正方形右上角），此为终点色块
  const rightBorderLength = squareHalfSize * 2;
  const rightBorderSteps = Math.ceil(rightBorderLength / cellHeight);
  
  for (let i = 1; i <= rightBorderSteps; i++) {
    segments.push({
      centerX: squareRightX,
      centerY: squareBottomY - i * cellHeight,
      angle: -Math.PI
    });
  }
  
  // 终点色块（正方形右上角）
  segments.push({
    centerX: squareRightX,
    centerY: squareTopY,
    angle: Math.PI / 4
  });
  
  return segments;
}

export function SRayLandMapRenderer({ cells, currentCellId, onCellClick, layerNumber = 1 }: SRayLandMapRendererProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScrollY, setDragStartScrollY] = useState(0);
  
  const pathSegments = useMemo(() => generatePathSegments(), []);
  
  const colors = ['#FFA500', '#FAF0E6', '#FFD700']; // 橙色、米白色、亮黄色
  
  // 滚动事件处理
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newScrollY = scrollY - e.deltaY * 0.1;
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
      setScrollY(Math.max(-20, Math.min(20, newScrollY)));
    }
  };

  // 拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const cellWidth = 6;
  const cellHeight = 4;
  const squareCenterX = 50;
  const squareCenterY = 124;
  const squareHalfSize = 12;

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#F5DEB3',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '4px solid #8B4513',
        boxShadow: 'inset 0 0 50px rgba(139, 69, 19, 0.3)',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 1,
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg 
        viewBox="5 5 90 170" 
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
        {/* ================== 复古美式拼贴风格背景 ================== */}
        <g style={{ opacity: 0.7 }}>
          {/* 米黄色底 */}
          <rect width="100" height="178" fill="#F5DEB3" />
          
          {/* 纸张纹理 */}
          <pattern id="paperPattern" width="15" height="15" patternUnits="userSpaceOnUse">
            <rect width="15" height="15" fill="#F5DEB3" />
            <circle cx="7.5" cy="7.5" r="0.5" fill="#D2B48C" opacity="0.3" />
            <path d="M 0 7.5 L 15 7.5" stroke="#DEB887" strokeWidth="0.3" strokeOpacity="0.2" />
          </pattern>
          <rect width="100" height="178" fill="url(#paperPattern)" />
          
          {/* 针叶林 */}
          <g>
            {[10, 25, 85, 95].map((x, i) => (
              <g key={i} transform={`translate(${x}, ${140 + i * 2})`}>
                <path d="M -3 0 L 0 -8 L 3 0 Z" fill="#228B22" />
                <path d="M -2.5 -5 L 0 -12 L 2.5 -5 Z" fill="#2E8B57" />
              </g>
            ))}
          </g>
          
          {/* 山脉 */}
          <path d="M 5 60 L 15 45 L 25 55 L 35 40 L 45 50 L 55 38 L 65 48 L 75 42 L 85 52 L 95 48" fill="#8B4513" opacity="0.4" />
          
          {/* 火山 */}
          <g transform="translate(88, 50)">
            <path d="M -4 0 L 0 -10 L 4 0 Z" fill="#CD5C5C" opacity="0.6" />
            <path d="M 0 -10 L 0 -15 L -1 -12 L 0 -17 L 1 -12" stroke="#FF4500" strokeWidth="0.8" fill="none" />
          </g>
          
          {/* 雪山 */}
          <path d="M 10 35 L 20 20 L 30 35 L 40 22 L 50 35" fill="#FFFFFF" opacity="0.6" />
          <path d="M 15 30 L 20 18 L 25 30 L 35 20 L 40 30" fill="#E8E8E8" opacity="0.7" />
          
          {/* 星球天体 */}
          <g>
            <circle cx="12" cy="18" r="3" fill="#FFD700" />
            <circle cx="12" cy="18" r="3.5" fill="none" stroke="#FFA500" strokeWidth="0.3" />
            <circle cx="82" cy="15" r="2" fill="#1E90FF" />
            <circle cx="82" cy="15" r="2.5" fill="none" stroke="#00BFFF" strokeWidth="0.3" />
            <circle cx="22" cy="155" r="1.5" fill="#CD853F" />
          </g>
          
          {/* 复古罗盘 */}
          <g transform="translate(18, 55)">
            <circle r="5" fill="#8B4513" opacity="0.7" />
            <circle r="4.5" fill="#DEB887" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#8B4513" strokeWidth="0.6" />
            <line x1="-4" y1="0" x2="4" y2="0" stroke="#8B4513" strokeWidth="0.6" />
            <polygon points="0,-4 0.5,-2 -0.5,-2" fill="#CD5C5C" />
            <polygon points="0,4 0.5,2 -0.5,2" fill="#2F4F4F" />
          </g>
          
          {/* 手绘地形装饰 */}
          <g>
            <path d="M 8 90 Q 15 85 22 90 Q 29 95 36 90" stroke="#8B4513" strokeWidth="0.6" fill="none" opacity="0.4" />
            <path d="M 64 85 Q 71 80 78 85 Q 85 90 92 85" stroke="#8B4513" strokeWidth="0.6" fill="none" opacity="0.4" />
            <circle cx="78" cy="98" r="2" fill="#6B8E23" opacity="0.5" />
            <circle cx="25" cy="100" r="1.5" fill="#6B8E23" opacity="0.4" />
          </g>
        </g>
        
        {/* ================== 内部正方形的白色十字线和字母标注 ================== */}
        <g>
          {/* 白色十字线 */}
          <line 
            x1={squareCenterX - squareHalfSize} 
            y1={squareCenterY} 
            x2={squareCenterX + squareHalfSize} 
            y2={squareCenterY} 
            stroke="#FFFFFF" 
            strokeWidth="2.5" 
            strokeOpacity="0.95"
          />
          <line 
            x1={squareCenterX} 
            y1={squareCenterY - squareHalfSize} 
            x2={squareCenterX} 
            y2={squareCenterY + squareHalfSize} 
            stroke="#FFFFFF" 
            strokeWidth="2.5" 
            strokeOpacity="0.95"
          />
          
          {/* 四个象限字母标注 */}
          <text 
            x={squareCenterX - squareHalfSize / 2} 
            y={squareCenterY - squareHalfSize / 2} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="#FFA500" 
            fontSize="10" 
            fontWeight="bold" 
            fontFamily="'Georgia', serif"
          >
            W
          </text>
          <text 
            x={squareCenterX + squareHalfSize / 2} 
            y={squareCenterY - squareHalfSize / 2} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="#FFA500" 
            fontSize="10" 
            fontWeight="bold" 
            fontFamily="'Georgia', serif"
          >
            N
          </text>
          <text 
            x={squareCenterX - squareHalfSize / 2} 
            y={squareCenterY + squareHalfSize / 2} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="#FFA500" 
            fontSize="10" 
            fontWeight="bold" 
            fontFamily="'Georgia', serif"
          >
            I
          </text>
          <text 
            x={squareCenterX + squareHalfSize / 2} 
            y={squareCenterY + squareHalfSize / 2} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="#FFA500" 
            fontSize="10" 
            fontWeight="bold" 
            fontFamily="'Georgia', serif"
          >
            P
          </text>
          
          {/* end标识：位于终点色块的右侧，白色底、黑色粗体字 */}
          <g transform={`translate(${squareCenterX + squareHalfSize + 6}, ${squareCenterY - squareHalfSize})`}>
            <rect x="-4" y="-3" width="10" height="6" rx="1" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
            <text x="1" y="0.5" textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize="4" fontWeight="bold" fontFamily="'Georgia', serif">end</text>
          </g>
        </g>
        
        {/* ================== 路径色块 ================== */}
        {pathSegments.map((segment, index) => {
          const colorIndex = index % colors.length;
          const fillColor = colors[colorIndex];
          const isStart = index === 0;
          const isEnd = index === pathSegments.length - 1;
          const isCurrent = currentCellId === `cell-${index}`;
          
          const prevSegment = index > 0 ? pathSegments[index - 1] : null;
          const nextSegment = index < pathSegments.length - 1 ? pathSegments[index + 1] : null;
          
          let angle = segment.angle;
          if (prevSegment && nextSegment) {
            const dx1 = segment.centerX - prevSegment.centerX;
            const dy1 = segment.centerY - prevSegment.centerY;
            const dx2 = nextSegment.centerX - segment.centerX;
            const dy2 = nextSegment.centerY - segment.centerY;
            angle = Math.atan2((dx1 + dx2), (dy1 + dy2));
          } else if (prevSegment) {
            const dx = segment.centerX - prevSegment.centerX;
            const dy = segment.centerY - prevSegment.centerY;
            angle = Math.atan2(dx, dy);
          } else if (nextSegment) {
            const dx = nextSegment.centerX - segment.centerX;
            const dy = nextSegment.centerY - segment.centerY;
            angle = Math.atan2(dx, dy);
          }
          
          return (
            <g 
              key={index}
              transform={`translate(${segment.centerX}, ${segment.centerY}) rotate(${angle * 180 / Math.PI})`}
              style={{ cursor: 'pointer' }}
              onClick={() => onCellClick?.(`cell-${index}`)}
            >
              {/* 长方形色块，1px黑色描边 */}
              <rect
                x={-cellWidth / 2}
                y={-cellHeight / 2}
                width={cellWidth}
                height={cellHeight}
                fill={fillColor}
                stroke={isCurrent ? '#4CAF50' : '#000000'}
                strokeWidth={isCurrent ? 2.5 : 1}
                rx="0.5"
              />
              
              {/* 起点标记 */}
              {isStart && (
                <text
                  x="0"
                  y="0.5"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="3.5"
                  fontWeight="bold"
                >
                  🚩
                </text>
              )}
              
              {/* 终点标记 */}
              {isEnd && (
                <text
                  x="0"
                  y="0.5"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="3.5"
                  fontWeight="bold"
                >
                  🏁
                </text>
              )}
              
              {/* 当前位置高亮 */}
              {isCurrent && (
                <rect
                  x={-cellWidth / 2 - 1}
                  y={-cellHeight / 2 - 1}
                  width={cellWidth + 2}
                  height={cellHeight + 2}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="1"
                  rx="1"
                >
                  <animate
                    attributeName="stroke-opacity"
                    values="1;0.4;1"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </rect>
              )}
            </g>
          );
        })}
        
        {/* ================== 底部SRayLand标识 ================== */}
        <text 
          x="50" 
          y="168" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill="#000000" 
          fontSize="9" 
          fontWeight="bold" 
          fontFamily="'Georgia', serif"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        >
          SRayLand
        </text>
      </svg>
    </div>
  );
}
