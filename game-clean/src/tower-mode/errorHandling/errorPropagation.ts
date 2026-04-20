// F组 Round 6 - 统一错误处理体系
// 错误分类、恢复规则与错误传播

export interface ModuleError {
  source: 'A' | 'B' | 'C' | 'D' | 'E';
  code: string;
  message: string;
  recoverable: boolean;
  fallbackAction?: string;
}

export type ErrorRecoveryAction = 'HALT' | 'FALLBACK_MAP' | 'REASSIGN' | 'ROLLBACK_STATE' | 'FALLBACK_RENDER' | 'RETRY' | 'IGNORE';

export interface ErrorHandlingRule {
  recoverable: boolean;
  action: ErrorRecoveryAction;
  maxRetries?: number;
}

export const ERROR_HANDLING_RULES: Record<string, ErrorHandlingRule> = {
  'A_TYPE_ERROR': { recoverable: false, action: 'HALT' },
  'B_MAP_INVALID': { recoverable: true, action: 'FALLBACK_MAP', maxRetries: 1 },
  'C_ASSIGNMENT_FAILED': { recoverable: true, action: 'REASSIGN', maxRetries: 3 },
  'D_ENGINE_ERROR': { recoverable: true, action: 'ROLLBACK_STATE', maxRetries: 2 },
  'E_RENDER_ERROR': { recoverable: true, action: 'FALLBACK_RENDER', maxRetries: 1 },
  'INIT_FAILED': { recoverable: false, action: 'HALT' },
  'LAYER_LOAD_FAILED': { recoverable: true, action: 'RETRY', maxRetries: 2 },
  'CELL_EXECUTION_FAILED': { recoverable: true, action: 'IGNORE' },
};

export function classifyError(error: Error | string): ModuleError {
  const message = error instanceof Error ? error.message : error;

  if (message.includes('type') || message.includes('Type')) {
    return { source: 'A', code: 'A_TYPE_ERROR', message, recoverable: false, fallbackAction: 'HALT' };
  }
  if (message.includes('map') || message.includes('Map') || message.includes('topology')) {
    return { source: 'B', code: 'B_MAP_INVALID', message, recoverable: true, fallbackAction: 'FALLBACK_MAP' };
  }
  if (message.includes('assign') || message.includes('Assign') || message.includes('level')) {
    return { source: 'C', code: 'C_ASSIGNMENT_FAILED', message, recoverable: true, fallbackAction: 'REASSIGN' };
  }
  if (message.includes('engine') || message.includes('Engine') || message.includes('movement') || message.includes('cell')) {
    return { source: 'D', code: 'D_ENGINE_ERROR', message, recoverable: true, fallbackAction: 'ROLLBACK_STATE' };
  }
  if (message.includes('render') || message.includes('Render') || message.includes('component')) {
    return { source: 'E', code: 'E_RENDER_ERROR', message, recoverable: true, fallbackAction: 'FALLBACK_RENDER' };
  }

  return { source: 'D', code: 'UNKNOWN_ERROR', message, recoverable: true, fallbackAction: 'RETRY' };
}

export function getErrorRule(code: string): ErrorHandlingRule {
  return ERROR_HANDLING_RULES[code] ?? { recoverable: true, action: 'RETRY', maxRetries: 1 };
}
