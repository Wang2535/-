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
  
  // 坐标系设定
  const upperCircleCenterX = 50; // 上半圆圆心在水平中心
  const upperCircleCenterY = 40; // 上半圆圆心在25%处
  const upperCircleRadius = 15; // 上半圆半径15
  const lowerCircleCenterX = 50; // 下半圆圆心在水平中心
  const lowerCircleCenterY = 110; // 下半圆圆心在65%处
  const lowerCircleRadius = 27; // 下半圆半径27（上圆直径30:下圆直径54 = 1:1.8）
  
  // 色块尺寸
  const cellWidth = 6;
  const cellHeight = 4;
  
  // ================== 【绝对强制：上半小圆路径】 ==================
  
  // ①起点：仅在上半小圆的正顶端放置1个路径色块
  const startX = upperCircleCenterX;
  const startY = upperCircleCenterY - upperCircleRadius;
  segments.push({
    centerX: startX,
    centerY: startY,
    angle: 0
  });
  
  // ②右外弧段：沿上半小圆的右侧外轮廓，顺时针走平滑弧线到A点
  const rightArcSteps = 10;
  for (let i = 1; i <= rightArcSteps; i++) {
    const angle = (i * 90 / rightArcSteps) * Math.PI / 180;
    const offsetX = upperCircleRadius * Math.sin(angle);
    const offsetY = upperCircleRadius * Math.cos(angle);
    segments.push({
      centerX: upperCircleCenterX + offsetX,
      centerY: upperCircleCenterY - offsetY,
      angle: angle
    });
  }
  
  // A点：上半小圆正底端、偏右1个色块的位置
  const pointA_X = upperCircleCenterX + cellWidth / 2;
  const pointA_Y = upperCircleCenterY + upperCircleRadius;
  segments.push({
    centerX: pointA_X,
    centerY: pointA_Y,
    angle: Math.PI
  });
  
  // ③左上直线段：从A点沿45°西北方向到B点
  const pointB_X = upperCircleCenterX - upperCircleRadius + cellWidth;
  const pointB_Y = upperCircleCenterY - cellWidth;
  
  const leftLineSteps = 8;
  for (let i = 1; i <= leftLineSteps; i++) {
    const t = i / leftLineSteps;
    segments.push({
      centerX: pointA_X + (pointB_X - pointA_X) * t,
      centerY: pointA_Y + (pointB_Y - pointA_Y) * t,
      angle: -Math.PI * 3 / 4
    });
  }
  
  segments.push({
    centerX: pointB_X,
    centerY: pointB_Y,
    angle: Math.PI / 2
  });
  
  // ④右上直线段：从B点沿45°东北方向到C点
  const pointC_X = upperCircleCenterX;
  const pointC_Y = startY + cellHeight + 1;
  
  const rightLineSteps = 8;
  for (let i = 1; i <= rightLineSteps; i++) {
    const t = i / rightLineSteps;
    segments.push({
      centerX: pointB_X + (pointC_X - pointB_X) * t,
      centerY: pointB_Y + (pointC_Y - pointB_Y) * t,
      angle: Math.PI / 4
    });
  }
  
  segments.push({
    centerX: pointC_X,
    centerY: pointC_Y,
    angle: 0
  });
  
  // ⑤左外弧段：从C点沿上半小圆的左侧外轮廓，顺时针到D点
  const leftArcSteps = rightArcSteps;
  for (let i = leftArcSteps; i >= 1; i--) {
    const angle = (180 - i * 90 / leftArcSteps) * Math.PI / 180;
    const offsetX = upperCircleRadius * Math.sin(angle);
    const offsetY = upperCircleRadius * Math.cos(angle);
    segments.push({
      centerX: upperCircleCenterX + offsetX,
      centerY: upperCircleCenterY - offsetY,
      angle: angle
    });
  }
  
  // D点：上半小圆正底端、偏左1个色块的位置
  const pointD_X = upperCircleCenterX - cellWidth / 2;
  const pointD_Y = upperCircleCenterY + upperCircleRadius;
  segments.push({
    centerX: pointD_X,
    centerY: pointD_Y,
    angle: Math.PI
  });
  
  // ================== 【绝对强制：衔接与下半大圆路径】 ==================
  
  // ⑥衔接段：D点与下半大圆的顶端色块无缝衔接
  const lowerCircleTopX = lowerCircleCenterX;
  const lowerCircleTopY = lowerCircleCenterY - lowerCircleRadius;
  
  // 添加衔接色块
  const connectSteps = 5;
  for (let i = 1; i <= connectSteps; i++) {
    const t = i / connectSteps;
    segments.push({
      centerX: pointD_X + (lowerCircleTopX - pointD_X) * t,
      centerY: pointD_Y + (lowerCircleTopY - pointD_Y) * t,
      angle: Math.PI
    });
  }
  
  segments.push({
    centerX: lowerCircleTopX,
    centerY: lowerCircleTopY,
    angle: 0
  });
  
  // 沿下半大圆左侧外轮廓顺时针走平滑弧线，绕经大圆最底端，沿右侧外弧向上
  const lowerArcSteps = 20;
  for (let i = 1; i <= lowerArcSteps; i++) {
    const angle = (180 + i * 180 / lowerArcSteps) * Math.PI / 180;
    const offsetX = lowerCircleRadius * Math.sin(angle);
    const offsetY = lowerCircleRadius * Math.cos(angle);
    segments.push({
      centerX: lowerCircleCenterX + offsetX,
      centerY: lowerCircleCenterY - offsetY,
      angle: angle
    });
  }
  
  // E点：下半大圆右侧外弧、从上往下数1/5高度的位置
  const pointE_Y = lowerCircleCenterY - lowerCircleRadius * 0.8;
  const pointE_X = lowerCircleCenterX + lowerCircleRadius;
  segments.push({
    centerX: pointE_X,
    centerY: pointE_Y,
    angle: 0
  });
  
  // ================== 【绝对强制：切入正方形】 ==================
  
  const squareCenterX = 50;
  const squareCenterY = 118;
  const squareHalfSize = 12;
  const squareRightX = squareCenterX + squareHalfSize;
  const squareTopY = squareCenterY - squareHalfSize;
  const squareLeftX = squareCenterX - squareHalfSize;
  const squareBottomY = squareCenterY + squareHalfSize;
  
  // ⑦切入正方形：从E点水平向左切入正方形的右边框上半部分
  const entrySteps = 6;
  for (let i = 1; i <= entrySteps; i++) {
    segments.push({
      centerX: pointE_X - i * (pointE_X - squareRightX) / entrySteps,
      centerY: pointE_Y,
      angle: 0
    });
  }
  
  // 进入正方形右边框
  segments.push({
    centerX: squareRightX,
    centerY: squareCenterY - squareHalfSize / 2,
    angle: 0
  });
  
  // ⑧正方形绕行：按「上边框向左→左边框向下→下边框向右→右边框向上」顺序
  
  // 到上边框右上角
  segments.push({
    centerX: squareRightX,
    centerY: squareTopY,
    angle: 0
  });
  
  // 沿上边框向左到左上角
  const topBorderSteps = 7;
  for (let i = 1; i <= topBorderSteps; i++) {
    segments.push({
      centerX: squareRightX - i * (squareHalfSize * 2) / topBorderSteps,
      centerY: squareTopY,
      angle: 0
    });
  }
  
  // 到左上角
  segments.push({
    centerX: squareLeftX,
    centerY: squareTopY,
    angle: Math.PI
  });
  
  // 沿左边框向下到左下角
  const leftBorderSteps = 7;
  for (let i = 1; i <= leftBorderSteps; i++) {
    segments.push({
      centerX: squareLeftX,
      centerY: squareTopY + i * (squareHalfSize * 2) / leftBorderSteps,
      angle: Math.PI
    });
  }
  
  // 到左下角
  segments.push({
    centerX: squareLeftX,
    centerY: squareBottomY,
    angle: Math.PI / 2
  });
  
  // 沿下边框向右到右下角
  const bottomBorderSteps = 7;
  for (let i = 1; i <= bottomBorderSteps; i++) {
    segments.push({
      centerX: squareLeftX + i * (squareHalfSize * 2) / bottomBorderSteps,
      centerY: squareBottomY,
      angle: Math.PI / 2
    });
  }
  
  // 到右下角
  segments.push({
    centerX: squareRightX,
    centerY: squareBottomY,
    angle: -Math.PI
  });
  
  // 沿右边框向上到右上角（终点）
  const rightBorderSteps = 7;
  for (let i = 1; i <= rightBorderSteps; i++) {
    segments.push({
      centerX: squareRightX,
      centerY: squareBottomY - i * (squareHalfSize * 2) / rightBorderSteps,
      angle: -Math.PI
    });
  }
  
  // ⑨终点：正方形右上角的边框色块
  const endPointX = squareRightX;
  const endPointY = squareTopY;
  segments.push({
    centerX: endPointX,
    centerY: endPointY,
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
  
  // 颜色：橙色→米白→亮黄循环
  const colors = ['#FFA500', '#FAF0E6', '#FFD700'];
  
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
  const squareCenterY = 118;
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
        viewBox="0 0 100 178" 
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
        {/* ================== 复古拼贴风格背景 ================== */}
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
          
          {/* 山川 */}
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
            <path d="M 8 90 Q 15 85 Q 22 90 Q 29 95 Q 36 90" stroke="#8B4513" strokeWidth="0.6" fill="none" opacity="0.4" />
            <path d="M 64 85 Q 71 80 Q 78 85 Q 85 90 Q 92 85" stroke="#8B4513" strokeWidth="0.6" fill="none" opacity="0.4" />
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
              {/* 长方形色块，1px纯黑色描边 */}
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
