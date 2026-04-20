/**
 * 可播种随机数生成器（用于测试可复现性）
 * 使用线性同余生成器 (LCG) 算法
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /** 生成 [0, 1) 范围的随机浮点数 */
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (this.state >>> 0) / 0xFFFFFFFF;
  }

  /** 生成 [min, max] 范围的随机整数 */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** 生成 [0, 1) 范围的随机浮点数（别名） */
  nextFloat(): number {
    return this.next();
  }

  /** 重置种子 */
  reset(seed: number): void {
    this.state = seed;
  }
}

export function seededRNG(seed: number): () => number {
  const rng = new SeededRNG(seed);
  return () => rng.next();
}
