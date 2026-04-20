export interface Dice3DProps {
  value: number | null;
  isRolling: boolean;
  modifiers: Array<{
    type: string;
    delta: number;
    label: string;
  }>;
  theme: {
    faceColor: string;
    dotColor: string;
    glowColor: string;
  };
  onRollComplete?: (result: number) => void;
  size?: number;
}

export interface DiceFace {
  value: number;
  dotPositions: Array<{ x: number; y: number }>;
}
