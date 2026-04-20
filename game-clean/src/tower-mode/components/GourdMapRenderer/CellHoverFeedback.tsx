import React, { useState, useCallback } from 'react';

interface CellHoverFeedbackProps {
  position: { x: number; y: number };
  size?: number;
  cellType: string;
  state: 'default' | 'hover' | 'selected' | 'arrived' | 'blocked';
  onClick?: () => void;
  children: React.ReactNode;
}

const CellHoverFeedback: React.FC<CellHoverFeedbackProps> = ({
  position,
  size = 10,
  cellType,
  state,
  onClick,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const effectiveState = isHovered && state !== 'blocked' ? 'hover' : state;

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const renderStateEffects = () => {
    switch (effectiveState) {
      case 'hover':
        return (
          <>
            <circle
              r={size + 4}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity="0.5"
            >
              <animate
                attributeName="r"
                values={`${size + 3};${size + 6};${size + 3}`}
                dur="0.5s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        );

      case 'selected':
        return (
          <>
            {/* 内圈 - 脉动效果 */}
            <circle
              r={size + 3}
              fill="none"
              stroke="#ffd700"
              strokeWidth="2"
            >
              <animate
                attributeName="r"
                values={`${size + 2};${size + 5};${size + 2}`}
                dur="0.8s"
                repeatCount="indefinite"
              />
            </circle>
            {/* 外圈 - 旋转虚线 */}
            <circle
              r={size + 6}
              fill="none"
              stroke="#ffd700"
              strokeWidth="1"
              opacity="0.3"
              strokeDasharray="3 3"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 0 0`}
                to={`360 0 0`}
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        );

      case 'arrived':
        return (
          <circle
            r={size + 5}
            fill="none"
            stroke="#44ff88"
            strokeWidth="2"
            opacity="0.8"
          >
            <animate
              attributeName="r"
              from={size}
              to={size + 10}
              dur="0.6s"
              repeatCount="1"
            />
            <animate
              attributeName="opacity"
              from="1"
              to="0"
              dur="0.6s"
              repeatCount="1"
            />
          </circle>
        );

      case 'blocked':
        return (
          <g>
            <line
              x1={-size}
              y1={-size}
              x2={size}
              y2={size}
              stroke="#ff3344"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1={-size}
              y1={size}
              x2={size}
              y2={-size}
              stroke="#ff3344"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        cursor: effectiveState === 'blocked' ? 'not-allowed' : 'pointer',
      }}
    >
      {renderStateEffects()}
      {children}
    </g>
  );
};

export { CellHoverFeedback, CellHoverFeedbackProps };
export default CellHoverFeedback;
