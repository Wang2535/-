export interface BootstrapStep {
  id: string;
  name: string;
  dependencies: string[];
  validate: () => boolean;
}

export const BOOTSTRAP_SEQUENCE: BootstrapStep[] = [
  { id: 'A-types', name: '加载类型定义', dependencies: [], validate: () => true },
  { id: 'B-mapData', name: '加载9层裸拓扑数据', dependencies: ['A-types'], validate: () => true },
  { id: 'B-visualConfig', name: '加载视觉配置', dependencies: ['A-types'], validate: () => true },
  { id: 'C-levelData', name: '执行关卡分配', dependencies: ['A-types', 'B-mapData'], validate: () => true },
  { id: 'D-engine', name: '初始化引擎', dependencies: ['A-types', 'C-levelData'], validate: () => true },
  { id: 'E-ui', name: '渲染UI', dependencies: ['A-types', 'C-levelData', 'B-visualConfig'], validate: () => true },
  { id: 'F-flow', name: '启动游戏流程', dependencies: ['A-types', 'B-mapData', 'C-levelData', 'D-engine', 'E-ui'], validate: () => true },
];

export interface BootstrapResult {
  success: boolean;
  completedSteps: string[];
  failedStep?: string;
  error?: string;
}

export function validateBootstrapOrder(completedSteps: string[], nextStep: string): boolean {
  const step = BOOTSTRAP_SEQUENCE.find(s => s.id === nextStep);
  if (!step) return false;
  return step.dependencies.every(dep => completedSteps.includes(dep));
}

export function runBootstrap(): BootstrapResult {
  const completedSteps: string[] = [];

  for (const step of BOOTSTRAP_SEQUENCE) {
    const depsMet = step.dependencies.every(dep => completedSteps.includes(dep));
    if (!depsMet) {
      return {
        success: false,
        completedSteps,
        failedStep: step.id,
        error: `Dependency not met for ${step.id}: requires [${step.dependencies.join(', ')}], completed [${completedSteps.join(', ')}]`,
      };
    }

    if (!step.validate()) {
      return {
        success: false,
        completedSteps,
        failedStep: step.id,
        error: `Validation failed for ${step.id}`,
      };
    }

    completedSteps.push(step.id);
  }

  return { success: true, completedSteps };
}
