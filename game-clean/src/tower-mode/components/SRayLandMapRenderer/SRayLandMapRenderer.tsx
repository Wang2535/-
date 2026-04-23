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
  const upperCircleCenterY = 44.5; // 上半圆圆心在25%处
  const upperCircleRadius = 16.5; // 上半圆直径33
  const lowerCircleCenterY = 115.7; // 下半圆圆心在65%处
  const lowerCircleRadius = 30; // 下半圆直径60（上圆直径是下圆的55%：33/60=0.55）
  const gourdWaistY = 74.76; // 葫芦腰在42%处
  
  // ================== 第一段：起点与上半葫芦右外弧段 ==================
  // 起点：上半圆正顶端
  segments.push({
    centerX: 50,
    centerY: upperCircleCenterY - upperCircleRadius,
    angle: 0
  });
  
  // 沿上半圆右侧外轮廓顺时针走
  for (let i = 1; i <= 6; i++) {
    const angle = (i * 30) * Math.PI / 180;
    segments.push({
      centerX: 50 + upperCircleRadius * Math.sin(angle),
      centerY: upperCircleCenterY - upperCircleRadius * Math.cos(angle),
      angle: angle
    });
  }
  
  // ================== 第二段：上半葫芦内部菱形折返段 ==================
  // 45°左上方向直线行进
  segments.push({
    centerX: 46,
    centerY: gourdWaistY - 4,
    angle: -Math.PI * 3 / 4
  });
  segments.push({
    centerX: 42,
    centerY: gourdWaistY - 8,
    angle: -Math.PI * 3 / 4
  });
  segments.push({
    centerX: 38,
    centerY: gourdWaistY - 12,
    angle: -Math.PI * 3 / 4
  });
  
  // 到达上半圆最左侧顶点
  segments.push({
    centerX: 50 - upperCircleRadius,
    centerY: upperCircleCenterY,
    angle: Math.PI / 2
  });
  
  // 45°右上方向直线行进
  segments.push({
    centerX: 46,
    centerY: upperCircleCenterY - 4,
    angle: Math.PI / 4
  });
  segments.push({
    centerX: 50,
    centerY: upperCircleCenterY - 8,
    angle: Math.PI / 4
  });
  segments.push({
    centerX: 54,
    centerY: upperCircleCenterY - 12,
    angle: Math.PI / 4
  });
  
  // 到达起点右侧相邻位置
  segments.push({
    centerX: 55,
    centerY: upperCircleCenterY - upperCircleRadius,
    angle: 0
  });
  
  // 沿上半圆左侧外轮廓顺时针走
  for (let i = 5; i >= 0; i--) {
    const angle = (180 - i * 30) * Math.PI / 180;
    segments.push({
      centerX: 50 + upperCircleRadius * Math.sin(angle),
      centerY: upperCircleCenterY - upperCircleRadius * Math.cos(angle),
      angle: angle
    });
  }
  
  // ================== 第三段：下半葫芦外弧行进段 ==================
  // 沿下半圆左侧外轮廓顺时针走
  for (let i = 1; i <= 8; i++) {
    const angle = (180 + i * 22.5) * Math.PI / 180;
    segments.push({
      centerX: 50 + lowerCircleRadius * Math.sin(angle),
      centerY: lowerCircleCenterY - lowerCircleRadius * Math.cos(angle),
      angle: angle
    });
  }
  
  // ================== 第四段：内部正方形绕行段 ==================
  const squareCenterX = 50;
  const squareCenterY = 124;
  const squareHalfSize = 12;
  
  // 切入正方形上边框
  segments.push({
    centerX: squareCenterX + 6,
    centerY: squareCenterY - squareHalfSize,
    angle: Math.PI / 2
  });
  
  // 沿正方形上边框向左走
  segments.push({
    centerX: squareCenterX,
    centerY: squareCenterY - squareHalfSize,
    angle: Math.PI / 2
  });
  segments.push({
    centerX: squareCenterX - 6,
    centerY: squareCenterY - squareHalfSize,
    angle: Math.PI / 2
  });
  segments.push({
    centerX: squareCenterX - squareHalfSize,
    centerY: squareCenterY - squareHalfSize,
    angle: Math.PI
  });
  
  // 沿正方形右边框向下走
  segments.push({
    centerX: squareCenterX - squareHalfSize,
    centerY: squareCenterY - 6,
    angle: Math.PI
  });
  segments.push({
    centerX: squareCenterX - squareHalfSize,
    centerY: squareCenterY,
    angle: Math.PI
  });
  segments.push({
    centerX: squareCenterX - squareHalfSize,
    centerY: squareCenterY + 6,
    angle: Math.PI
  });
  segments.push({
    centerX: squareCenterX - squareHalfSize,
    centerY: squareCenterY + squareHalfSize,
    angle: -Math.PI / 2
  });
  
  // 沿正方形下边框向右走
  segments.push({
    centerX: squareCenterX - 6,
    centerY: squareCenterY + squareHalfSize,
    angle: -Math.PI / 2
  });
  segments.push({
    centerX: squareCenterX,
    centerY: squareCenterY + squareHalfSize,
    angle: -Math.PI / 2
  });
  segments.push({
    centerX: squareCenterX + 6,
    centerY: squareCenterY + squareHalfSize,
    angle: -Math.PI / 2
  });
  segments.push({
    centerX: squareCenterX + squareHalfSize,
    centerY: squareCenterY + squareHalfSize,
    angle: 0
  });
  
  // 沿正方形左边框向上走
  segments.push({
    centerX: squareCenterX + squareHalfSize,
    centerY: squareCenterY + 6,
    angle: 0
  });
  segments.push({
    centerX: squareCenterX + squareHalfSize,
    centerY: squareCenterY,
    angle: 0
  });
  segments.push({
    centerX: squareCenterX + squareHalfSize,
    centerY: squareCenterY - 6,
    angle: 0
  });
  
  // 终点：正方形右上顶点
  segments.push({
    centerX: squareCenterX + squareHalfSize,
    centerY: squareCenterY - squareHalfSize,
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

  const cellWidth = 6.5;
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
          
          {/* end标识 */}
          <g transform={`translate(${squareCenterX + squareHalfSize + 2}, ${squareCenterY - squareHalfSize})`}>
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
              {/* 长方形色块 */}
              <rect
                x={-cellWidth / 2}
                y={-cellHeight / 2}
                width={cellWidth}
                height={cellHeight}
                fill={fillColor}
                stroke={isCurrent ? '#4CAF50' : '#000000'}
                strokeWidth={isCurrent ? 2.5 : 1.5}
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
