export interface LayerSpecialMechanicData {
  type: string;
  name: string;
  triggerCondition: string;
  effect: string;
  visualHint: string;
  [key: string]: any;
}

export const LAYER_MECHANICS: Record<number, LayerSpecialMechanicData> = {
  1: {
    type: 'acceleration',
    name: '扩散加速',
    triggerCondition: '每3回合自动触发',
    effect: '所有已感染格子的相邻格子获得"暴露"状态',
    visualHint: '被影响格子边缘出现绿色脉冲波纹',
    accelerationRate: 1.5,
    triggerInterval: 3,
  },
  2: {
    type: 'jump',
    name: '跨环跳跃',
    triggerCondition: '玩家在connector区域时可选择',
    effect: '直接跳到对面环的对应位置',
    visualHint: '跳跃路径显示为虚线弧',
    jumpRange: 'cross-ring',
  },
  3: {
    type: 'sequence',
    name: '层层解锁',
    triggerCondition: '必须按外→中→内顺序清除',
    effect: '未解锁圈层的格子不可进入',
    visualHint: '锁定圈层覆盖灰色锁链图案',
    unlockOrder: ['outer', 'middle', 'inner'],
  },
  4: {
    type: 'event',
    name: '街区事件',
    triggerCondition: '进入新街区时触发',
    effect: '随机触发街区事件(增益/减益/中立)',
    visualHint: '事件触发时街区边框闪烁',
    eventPool: ['增益', '减益', '中立'],
    eventProbability: { positive: 0.35, negative: 0.35, neutral: 0.30 },
  },
  5: {
    type: 'blockade',
    name: '流水线阻塞',
    triggerCondition: '每4回合触发一次',
    effect: '随机一条路径被阻塞1回合',
    visualHint: '被阻塞路径显示红色X标记',
    blockadeDuration: 1,
    triggerInterval: 4,
  },
  6: {
    type: 'teleport',
    name: '信号迷路',
    triggerCondition: '进入信号塔格子时',
    effect: '随机传送到同环其他格子',
    visualHint: '传送起点和终点显示紫色漩涡',
    teleportRange: 'same-ring',
  },
  7: {
    type: 'drift',
    name: '云端漂移',
    triggerCondition: '每2回合自动触发',
    effect: '所有格子位置向随机方向偏移一小格',
    visualHint: '格子移动时显示半透明拖影',
    driftInterval: 2,
    driftMagnitude: 0.02,
  },
  8: {
    type: 'collapse',
    name: '观测坍缩',
    triggerCondition: '玩家选择"观测"时触发',
    effect: '隐藏路径概率性显现实/虚',
    visualHint: '坍缩时格子闪烁白光',
    hiddenPaths: true,
    collapseProbability: 0.6,
  },
  9: {
    type: 'protocol',
    name: '殿堂礼仪',
    triggerCondition: '每回合开始时检查',
    effect: '必须按指定顺序行动(否则受到惩罚)',
    visualHint: '当前要求行动类型显示在地图中央',
    protocolOrder: ['battle', 'chance', 'battle', 'skill'],
    penaltyType: 'damage',
    penaltyAmount: 2,
  },
};
