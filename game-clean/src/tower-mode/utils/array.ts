/**
 * 数组洗牌（Fisher-Yates算法）
 * @param array 源数组（会被复制，不修改原数组）
 * @param rng 随机数生成器（可选）
 * @returns 洗牌后的新数组
 */
export function shuffle<T>(array: T[], rng?: () => number): T[] {
  const result = [...array];
  const random = rng ?? Math.random;
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 数组去重
 * @param array 源数组
 * @param keyFn 去重键函数（可选）
 * @returns 去重后的新数组
 */
export function unique<T>(array: T[], keyFn?: (item: T) => unknown): T[] {
  if (!keyFn) return Array.from(new Set(array));
  const seen = new Set<unknown>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * 数组分组
 * @param array 源数组
 * @param keyFn 分组键函数
 * @returns 分组后的Map
 */
export function groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const result = new Map<K, T[]>();
  for (const item of array) {
    const key = keyFn(item);
    const group = result.get(key) ?? [];
    group.push(item);
    result.set(key, group);
  }
  return result;
}
