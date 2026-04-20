import type { LayerSpecialMechanicData } from '../types/gameMechanics.types';

export const LAYER_MECHANICS: Record<number, LayerSpecialMechanicData> = {
  1: {
    type: 'acceleration',
    params: { turnLimit: 8, speedUpPerRound: 0.5 },
    description: '加速机制：每回合行动速度递增，回合数有限制',
  },
  2: {
    type: 'firewall_bypass',
    params: { firewallCount: 3, bypassKeys: ['key1', 'key2', 'key3'] },
    description: '防火墙绕过：需收集密钥绕过多重防火墙',
  },
  3: {
    type: 'encryption',
    params: { encryptedCells: 3, decryptionCost: 1 },
    description: '加密机制：部分格子被加密，需消耗资源解密',
  },
  4: {
    type: 'phishing',
    params: { trapCells: 3, disguiseRate: 0.3 },
    description: '钓鱼机制：陷阱格子伪装为普通格子，有概率识破',
  },
  5: {
    type: 'scada',
    params: { monitoredCells: 4, alertThreshold: 2 },
    description: '工控监控：部分格子被监控，触发警报次数有上限',
  },
  6: {
    type: 'signal_switch',
    params: { signalTypes: ['5G', '4G', 'WiFi', 'Bluetooth'], switchInterval: 3 },
    description: '信号切换：需在不同信号类型间切换，定时切换',
  },
  7: {
    type: 'container',
    params: { containerCount: 3, isolationTurns: 2 },
    description: '容器隔离：进入容器后将被隔离若干回合',
  },
  8: {
    type: 'collapse',
    params: { observationCells: 4, collapseTrigger: 'visit' },
    description: '观测坍缩：访问观测格子触发路径坍缩，隐藏路径显现',
    hiddenPaths: [
      { from: 'R3C2', to: 'R4C1', locked: true },
      { from: 'R3C3', to: 'R4C2', locked: true },
      { from: 'R2C2', to: 'R3C1', locked: true },
    ],
  },
  9: {
    type: 'protocol',
    params: { protocolSteps: 5 },
    description: '协议机制：需按正确顺序执行协议步骤通关',
    correctSequence: ['outer_cw', 'inner_ccw', 'center', 'inner_cw', 'outer_ccw'],
  },
};
