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
  const upperCircleCenterX = 50;
  const upperCircleCenterY = 44;
  const upperCircleRadius = 12;
  const lowerCircleCenterX = 50;
  const lowerCircleCenterY = 110;
  const lowerCircleRadius = 22;
  
  // 格子尺寸
  const cellWidth = 5;
  const cellHeight = 3;
  const step = cellHeight; // 每个格子的步长
  
  // ================== 【第一步：上半部分小圆】 ==================
  
  // 1. 起点：在小圆最顶端
  const startX = upperCircleCenterX;
  const startY = upperCircleCenterY - upperCircleRadius;
  segments.push({
    centerX: startX,
    centerY: startY,
    angle: 0
  });
  
  // 2. 右边圆弧：沿小圆右边向下画弧线
  const rightArcCount = 12;
  for (let i = 1; i <= rightArcCount; i++) {
    const angle = (i * (Math.PI / 2)) / rightArcCount;
    const offsetX = upperCircleRadius * Math.sin(angle);
    const offsetY = upperCircleRadius * Math.cos(angle);
    segments.push({
      centerX: upperCircleCenterX + offsetX,
      centerY: upperCircleCenterY - offsetY,
      angle: angle
    });
  }
  
  // A点：小圆最底部偏右
  const pointA_X = upperCircleCenterX + step * 0.5;
  const pointA_Y = upperCircleCenterY + upperCircleRadius;
  segments.push({
    centerX: pointA_X,
    centerY: pointA_Y,
    angle: Math.PI
  });
  
  // 3. 第一条直线：向左上方45度
  const diagonalSteps = 8;
  for (let i = 1; i <= diagonalSteps; i++) {
    const ratio = i / diagonalSteps;
    segments.push({
      centerX: pointA_X - (upperCircleRadius + step) * ratio,
      centerY: pointA_Y - (upperCircleRadius + step) * ratio,
      angle: -Math.PI * 3 / 4
    });
  }
  
  // B点：小圆左边内侧
  const pointB_X = upperCircleCenterX - upperCircleRadius + step;
  const pointB_Y = upperCircleCenterY - step;
  segments.push({
    centerX: pointB_X,
    centerY: pointB_Y,
    angle: Math.PI / 2
  });
  
  // 4. 第二条直线：向右上方45度
  for (let i = 1; i <= diagonalSteps; i++) {
    const ratio = i / diagonalSteps;
    segments.push({
      centerX: pointB_X + (upperCircleRadius + step) * ratio,
      centerY: pointB_Y - (upperCircleRadius + step) * ratio,
      angle: Math.PI / 4
    });
  }
  
  // C点：起点正下方1个位置
  const pointC_X = upperCircleCenterX;
  const pointC_Y = startY + cellHeight + step;
  segments.push({
    centerX: pointC_X,
    centerY: pointC_Y,
    angle: 0
  });
  
  // 5. 左边圆弧：沿小圆左边向下画弧线
  const leftArcCount = 12;
  for (let i = leftArcCount; i >= 1; i--) {
    const angle = Math.PI - (i * (Math.PI / 2)) / leftArcCount;
    const offsetX = upperCircleRadius * Math.sin(angle);
    const offsetY = upperCircleRadius * Math.cos(angle);
    segments.push({
      centerX: upperCircleCenterX + offsetX,
      centerY: upperCircleCenterY - offsetY,
      angle: angle
    });
  }
  
  // D点：小圆最底部偏左
  const pointD_X = upperCircleCenterX - step * 0.5;
  const pointD_Y = upperCircleCenterY + upperCircleRadius;
  segments.push({
    centerX: pointD_X,
    centerY: pointD_Y,
    angle: Math.PI
  });
  
  // ================== 【第二步：下半部分大圆】 ==================
  
  // 1. 连接：从D点到大圆顶端
  const lowerCircleTopX = lowerCircleCenterX;
  const lowerCircleTopY = lowerCircleCenterY - lowerCircleRadius;
  const connectSteps = 4;
  for (let i = 1; i <= connectSteps; i++) {
    const ratio = i / connectSteps;
    segments.push({
      centerX: pointD_X + (lowerCircleTopX - pointD_X) * ratio,
      centerY: pointD_Y + (lowerCircleTopY - pointD_Y) * ratio,
      angle: Math.PI
    });
  }
  
  // 确保到达大圆顶端
  segments.push({
    centerX: lowerCircleTopX,
    centerY: lowerCircleTopY,
    angle: 0
  });
  
  // 2. 大圆完整圆弧：从左边向下，底部向右，右边向上
  const lowerArcCount = 30;
  for (let i = 1; i <= lowerArcCount; i++) {
    const angle = Math.PI + (i * Math.PI) / lowerArcCount;
    const offsetX = lowerCircleRadius * Math.sin(angle);
    const offsetY = lowerCircleRadius * Math.cos(angle);
    segments.push({
      centerX: lowerCircleCenterX + offsetX,
      centerY: lowerCircleCenterY - offsetY,
      angle: angle
    });
  }
  
  // E点：大圆右边从上往下数1/5位置
  const pointE_Y = lowerCircleCenterY - lowerCircleRadius * 0.8;
  const pointE_X = lowerCircleCenterX + lowerCircleRadius;
  segments.push({
    centerX: pointE_X,
    centerY: pointE_Y,
    angle: 0
  });
  
  // ================== 【第三步：中间正方形】 ==================
  
  const squareCenterX = 50;
  const squareCenterY = 118;
  const squareHalfSize = 10;
  const squareTopY = squareCenterY - squareHalfSize;
  const squareBottomY = squareCenterY + squareHalfSize;
  const squareLeftX = squareCenterX - squareHalfSize;
  const squareRightX = squareCenterX + squareHalfSize;
  
  // 1. 水平向左进入正方形右边框
  const entrySteps = 6;
  for (let i = 1; i <= entrySteps; i++) {
    segments.push({
      centerX: pointE_X - (pointE_X - squareRightX) * (i / entrySteps),
      centerY: pointE_Y,
      angle: 0
    });
  }
  
  // 到达正方形右边框
  segments.push({
    centerX: squareRightX,
    centerY: squareCenterY - squareHalfSize / 2,
    angle: 0
  });
  
  // 2. 顺时针绕正方形一圈
  // 向上到右上角
  const upSteps = 6;
  for (let i = 1; i <= upSteps; i++) {
    segments.push({
      centerX: squareRightX,
      centerY: (squareCenterY - squareHalfSize / 2) - (i * squareHalfSize / 2 / upSteps),
      angle: -Math.PI
    });
  }
  
  // 到达右上角
  segments.push({
    centerX: squareRightX,
    centerY: squareTopY,
    angle: 0
  });
  
  // 向左到左上角
  const leftSteps = 8;
  for (let i = 1; i <= leftSteps; i++) {
    segments.push({
      centerX: squareRightX - (i * (squareHalfSize * 2) / leftSteps),
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
  
  // 向下到左下角
  const downSteps = 8;
  for (let i = 1; i <= downSteps; i++) {
    segments.push({
      centerX: squareLeftX,
      centerY: squareTopY + (i * (squareHalfSize * 2) / downSteps),
      angle: Math.PI
    });
  }
  
  // 到达左下角
  segments.push({
    centerX: squareLeftX,
    centerY: squareBottomY,
    angle: Math.PI / 2
  });
  
  // 向右到右下角
  const rightSteps = 8;
  for (let i = 1; i <= rightSteps; i++) {
    segments.push({
      centerX: squareLeftX + (i * (squareHalfSize * 2) / rightSteps),
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
  
  // 向上到右上角（终点）
  const finalUpSteps = 8;
  for (let i = 1; i <= finalUpSteps; i++) {
    segments.push({
      centerX: squareRightX,
      centerY: squareBottomY - (i * (squareHalfSize * 2) / finalUpSteps),
      angle: -Math.PI
    });
  }
  
  // 终点：正方形右上角
  const endX = squareRightX;
  const endY = squareTopY;
  segments.push({
    centerX: endX,
    centerY: endY,
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
  
  const colors = ['#FFA500', '#FFFFFF', '#FFD700']; // 橙、白、黄循环
  
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newScrollY = scrollY - e.deltaY * 0.1;
    setScrollY(Math.max(-20, Math.min(20, newScrollY)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartScrollY(scrollY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const deltaY = e.clientY - dragStartY;
      const newScrollY = dragStartScrollY - deltaY * 0.1;
      setScrollY(Math.max(-20, Math.min(20, newScrollY)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const cellWidth = 5;
  const cellHeight = 3;
  const squareCenterX = 50;
  const squareCenterY = 118;
  const squareHalfSize = 10;

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
        viewBox="5 5 90 155" 
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
          <rect width="100" height="165" fill="#F5DEB3" />
          
          {/* 针叶林 */}
          <g>
            {[10, 25, 85, 95].map((x, i) => (
              <g key={i} transform={`translate(${x}, ${135 + i * 2})`}>
                <path d="M -3 0 L 0 -8 L 3 0 Z" fill="#228B22" />
                <path d="M -2.5 -5 L 0 -12 L 2.5 -5 Z" fill="#2E8B57" />
              </g>
            ))}
          </g>
          
          {/* 山川 */}
          <path d="M 5 55 L 15 40 L 25 50 L 35 35 L 45 45 L 55 33 L 65 43 L 75 37 L 85 47 L 95 43" fill="#8B4513" opacity="0.4" />
          
          {/* 火山 */}
          <g transform="translate(88, 45)">
            <path d="M -4 0 L 0 -10 L 4 0 Z" fill="#CD5C5C" opacity="0.6" />
            <path d="M 0 -10 L 0 -15 L -1 -12 L 0 -17 L 1 -12" stroke="#FF4500" strokeWidth="0.8" fill="none" />
          </g>
          
          {/* 雪山 */}
          <path d="M 10 30 L 20 15 L 30 30 L 40 17 L 50 30" fill="#FFFFFF" opacity="0.6" />
        </g>
        
        {/* ================== 内部正方形的白色十字线和字母 ================== */}
        <g>
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
          
          <g transform={`translate(${squareCenterX + squareHalfSize + 5}, ${squareCenterY - squareHalfSize})`}>
            <rect x="-3.5" y="-2.5" width="8" height="5" rx="1" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
            <text x="0.5" y="0.3" textAnchor="middle" dominantBaseline="middle" fill="#000000" fontSize="3.5" fontWeight="bold" fontFamily="'Georgia', serif">end</text>
          </g>
        </g>
        
        {/* ================== 路径格子 ================== */}
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
              <rect
                x={-cellWidth / 2}
                y={-cellHeight / 2}
                width={cellWidth}
                height={cellHeight}
                fill={fillColor}
                stroke={isCurrent ? '#4CAF50' : '#000000'}
                strokeWidth={isCurrent ? 2 : 1}
                rx="0.3"
              />
              
              {isStart && (
                <text
                  x="0"
                  y="0.4"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="3"
                  fontWeight="bold"
                >
                  🚩
                </text>
              )}
              
              {isEnd && (
                <text
                  x="0"
                  y="0.4"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="3"
                  fontWeight="bold"
                >
                  🏁
                </text>
              )}
              
              {isCurrent && (
                <rect
                  x={-cellWidth / 2 - 0.5}
                  y={-cellHeight / 2 - 0.5}
                  width={cellWidth + 1}
                  height={cellHeight + 1}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="1"
                  rx="0.5"
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
          y="155" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill="#000000" 
          fontSize="8" 
          fontWeight="bold" 
          fontFamily="'Georgia', serif"
          stroke="#FFFFFF"
          strokeWidth="1"
        >
          SRayLand
        </text>
      </svg>
    </div>
  );
}
