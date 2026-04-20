import type { GameCell, PathConnection } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * 验证地图连通性
 * @param cells 所有格子
 * @param paths 路径连接
 * @returns 验证结果
 */
export function validateMapConnectivity(cells: GameCell[], paths: PathConnection[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const cellSet = new Set(cells.map(c => c.id));

  for (const path of paths) {
    if (!cellSet.has(path.from)) errors.push({ field: 'paths.from', message: `Cell ${path.from} not found` });
    if (!cellSet.has(path.to)) errors.push({ field: 'paths.to', message: `Cell ${path.to} not found` });
  }

  return { valid: errors.length === 0, errors, warnings };
}
