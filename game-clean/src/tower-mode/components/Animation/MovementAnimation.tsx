import React, { useEffect, useRef, useState, useMemo } from 'react';

interface MovementAnimationProps {
  pathCellIds: string[];
  cellPositions: Record<string, { x: number; y: number }>;
  speedPerCell?: number;
  onComplete?: () => void;
}

export const MovementAnimation: React.FC<MovementAnimationProps> = ({
  pathCellIds,
  cellPositions,
  speedPerCell = 300,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset animation state when path changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsComplete(false);
  }, [pathCellIds]);

  // Advance along the path at the specified speed
  useEffect(() => {
    if (pathCellIds.length === 0 || isComplete) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= pathCellIds.length) {
          clearInterval(intervalId);
          // Defer side effects out of updater function
          queueMicrotask(() => {
            setIsComplete(true);
            onCompleteRef.current?.();
          });
          return prev;
        }
        return next;
      });
    }, speedPerCell);

    return () => clearInterval(intervalId);
  }, [pathCellIds.length, speedPerCell, isComplete]);

  // Compute the positions for the already-traversed path
  const traversedPositions = pathCellIds
    .slice(0, currentIndex + 1)
    .map((id) => cellPositions[id])
    .filter(Boolean);

  // Build polyline points string (computed before any early return to maintain hook order)
  const polylinePoints = traversedPositions
    .map((pos) => `${pos.x},${pos.y}`)
    .join(' ');

  // Current piece position (last traversed position)
  const currentPos = traversedPositions.length > 0
    ? traversedPositions[traversedPositions.length - 1]
    : { x: 0, y: 0 };

  // Compute SVG viewBox (always called to maintain hook ordering)
  const viewBox = useMemo(() => {
    if (traversedPositions.length === 0) {
      return '0 0 100 100';
    }
    const xs = traversedPositions.map((p) => p.x);
    const ys = traversedPositions.map((p) => p.y);
    const padding = 30;
    const minX = Math.min(...xs) - padding;
    const maxX = Math.max(...xs) + padding;
    const minY = Math.min(...ys) - padding;
    const maxY = Math.max(...ys) + padding;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [traversedPositions]);

  // Return null for empty path, completed animation, or no positions
  if (pathCellIds.length === 0 || isComplete || traversedPositions.length === 0) {
    return null;
  }

  return (
    <svg viewBox={viewBox} className="movement-animation-svg">
      {/* Traversed path - golden dashed polyline */}
      {traversedPositions.length > 1 && (
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#ffd700"
          strokeWidth={3}
          strokeDasharray="4 4"
        />
      )}

      {/* Previous positions - small dim circles */}
      {traversedPositions.slice(0, -1).map((pos, idx) => (
        <circle
          key={`trail-${idx}`}
          cx={pos.x}
          cy={pos.y}
          r={4}
          fill="#ffd700"
          opacity={0.3}
        />
      ))}

      {/* Current piece - pulsing outer circle + solid inner blue circle */}
      <g>
        {/* Outer pulsing circle */}
        <circle cx={currentPos.x} cy={currentPos.y} r={10} fill="#ffd700">
          <animate
            attributeName="r"
            values="10;14;10"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.4;0.2"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Inner solid blue circle */}
        <circle
          cx={currentPos.x}
          cy={currentPos.y}
          r={8}
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth={2}
        />
      </g>
    </svg>
  );
};

export default MovementAnimation;
