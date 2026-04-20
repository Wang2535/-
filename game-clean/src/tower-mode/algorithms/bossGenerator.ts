import type {
  LevelPoolEntry,
  BossMechanism,
  MechanismType,
  GeneratedBoss,
  BossBaseStats,
  BossVisualConfig,
} from '../types';

const MECHANISM_TEMPLATES: Record<MechanismType, Omit<BossMechanism, 'params'>> = {
  summon: { type: 'summon', name: '召唤增援', description: '每N回合召唤小怪增援', triggerInterval: 3 },
  control: { type: 'control', name: '精神控制', description: '控制玩家卡牌使其无法使用', triggerInterval: 4 },
  recover: { type: 'recover', name: '自我修复', description: '每N回合恢复一定比例HP', triggerInterval: 2 },
  interfere: { type: 'interfere', name: '信号干扰', description: '干扰玩家手牌抽取', triggerInterval: 3 },
  evolve: { type: 'evolve', name: '形态进化', description: 'HP低于阈值时进化增强', triggerInterval: 0 },
  timed: { type: 'timed', name: '时限压力', description: '限定回合内必须击败否则增强', triggerInterval: 1 },
  clone: { type: 'clone', name: '分身幻影', description: '生成分身迷惑玩家', triggerInterval: 5 },
  psychological: { type: 'psychological', name: '心理博弈', description: '提供选择影响后续战斗', triggerInterval: 4 },
};

const TAG_MECHANISM_MAP: Record<string, MechanismType[]> = {
  'malware': ['summon', 'evolve'],
  'ransomware': ['control', 'timed'],
  'trojan': ['clone', 'psychological'],
  'worm': ['summon', 'interfere'],
  'virus-analysis': ['evolve', 'psychological'],
  'reverse-engineering': ['control', 'psychological'],
  'ddos': ['summon', 'interfere'],
  'firewall': ['recover', 'control'],
  'ids': ['interfere', 'psychological'],
  'mitm': ['clone', 'interfere'],
  'packet-analysis': ['control', 'psychological'],
  'network-forensics': ['evolve', 'psychological'],
  'encryption': ['control', 'timed'],
  'database': ['recover', 'summon'],
  'backup': ['recover', 'timed'],
  'access-control': ['control', 'interfere'],
  'compliance': ['timed', 'psychological'],
  'phishing': ['clone', 'psychological'],
  'impersonation': ['clone', 'psychological'],
  'baiting': ['psychological', 'summon'],
  'pretexting': ['psychological', 'clone'],
  'awareness': ['psychological', 'interfere'],
  'scada': ['interfere', 'timed'],
  'plc': ['control', 'interfere'],
  'iot-device': ['summon', 'evolve'],
  'ot-security': ['recover', 'control'],
  'supply-chain': ['summon', 'psychological'],
  'mobile-app': ['interfere', 'clone'],
  'mdm': ['control', 'recover'],
  'mobile-payment': ['timed', 'control'],
  'location-privacy': ['clone', 'psychological'],
  'byod': ['summon', 'interfere'],
  'container': ['summon', 'evolve'],
  'kubernetes': ['summon', 'recover'],
  'devsecops': ['evolve', 'control'],
  'zero-trust': ['control', 'timed'],
  'cnapp': ['interfere', 'recover'],
  'adversarial-ai': ['evolve', 'psychological'],
  'quantum': ['interfere', 'timed'],
  'blockchain': ['recover', 'control'],
  'web3': ['clone', 'summon'],
  'pqc': ['control', 'timed'],
  'siem': ['interfere', 'psychological'],
  'threat-intel': ['psychological', 'evolve'],
  'incident-response': ['timed', 'recover'],
  'governance': ['control', 'timed'],
  'red-team': ['evolve', 'psychological'],
  'boss': ['evolve', 'timed'],
};

const THEME_COLOR_MAP: Record<string, { primary: string; secondary: string; aura: string }> = {
  'virus': { primary: '#8B0000', secondary: '#FF4444', aura: 'toxic' },
  'network': { primary: '#0066CC', secondary: '#44AAFF', aura: 'electric' },
  'data-security': { primary: '#2E8B57', secondary: '#66DDAA', aura: 'shield' },
  'social-engineer': { primary: '#8B4513', secondary: '#DDA060', aura: 'shadow' },
  'industrial-iot': { primary: '#FF8C00', secondary: '#FFD700', aura: 'industrial' },
  'mobile-terminal': { primary: '#4B0082', secondary: '#9370DB', aura: 'wireless' },
  'cloud-virtual': { primary: '#4682B4', secondary: '#87CEEB', aura: 'cloud' },
  'ai-emerging': { primary: '#9400D3', secondary: '#DA70D6', aura: 'neural' },
  'security-mgmt': { primary: '#2F4F4F', secondary: '#708090', aura: 'command' },
};

const BASE_MECHANISM_PARAMS: Record<MechanismType, Record<string, unknown>> = {
  summon: { summonCount: 2, summonType: 'minion' },
  control: { controlDuration: 1, controlTarget: 'random' },
  recover: { healPercent: 15, healTrigger: 'interval' },
  interfere: { interfereCount: 1, interfereType: 'draw-block' },
  evolve: { evolveThreshold: 50, evolveBonus: 1.5 },
  timed: { timeLimit: 10, penaltyPerTurn: 0.1 },
  clone: { cloneCount: 1, cloneHpPercent: 30 },
  psychological: { choiceCount: 2, penaltyWeight: 0.5 },
};

export class BossGenerator {
  generateFromPrototype(prototype: LevelPoolEntry, layer: number): GeneratedBoss {
    const mechanisms = this.matchMechanismsByTags(prototype.tags);
    const mechanismCount = layer >= 5 ? 3 : 2;
    const selectedMechanisms = mechanisms
      .slice(0, mechanismCount)
      .map((m) => this.scaleMechanismIntensity(m, layer));

    const baseStats: BossBaseStats = {
      hp: 100 + layer * 50,
      attack: 10 + layer * 8,
      defense: 5 + layer * 5,
      speed: 3 + layer * 2,
    };

    const stageThresholds = [25, 50];

    const themeColors = THEME_COLOR_MAP[prototype.theme] ?? {
      primary: '#555555',
      secondary: '#AAAAAA',
      aura: 'default',
    };

    const size: BossVisualConfig['size'] =
      layer <= 3 ? 'normal' : layer <= 6 ? 'large' : 'epic';

    const visualConfig: BossVisualConfig = {
      primaryColor: themeColors.primary,
      secondaryColor: themeColors.secondary,
      auraEffect: themeColors.aura,
      size,
    };

    return {
      prototypeId: prototype.id,
      name: prototype.name,
      baseStats,
      mechanisms: selectedMechanisms,
      stageThresholds,
      visualConfig,
    };
  }

  matchMechanismsByTags(tags: string[]): BossMechanism[] {
    const seen = new Set<MechanismType>();
    const mechanisms: BossMechanism[] = [];

    for (const tag of tags) {
      const mechanismTypes = TAG_MECHANISM_MAP[tag];
      if (!mechanismTypes) continue;

      for (const type of mechanismTypes) {
        if (seen.has(type)) continue;
        seen.add(type);

        const template = MECHANISM_TEMPLATES[type];
        mechanisms.push({
          ...template,
          params: { ...BASE_MECHANISM_PARAMS[type] },
        });
      }
    }

    return mechanisms;
  }

  scaleMechanismIntensity(mechanism: BossMechanism, layer: number): BossMechanism {
    const scaledInterval = Math.max(
      1,
      mechanism.triggerInterval - Math.floor(layer / 3),
    );

    const scaledParams: Record<string, unknown> = {};
    const multiplier = 1 + (layer - 1) * 0.15;

    for (const [key, value] of Object.entries(mechanism.params)) {
      if (typeof value === 'number') {
        scaledParams[key] = Math.round(value * multiplier * 100) / 100;
      } else {
        scaledParams[key] = value;
      }
    }

    return {
      ...mechanism,
      triggerInterval: scaledInterval,
      params: scaledParams,
    };
  }
}
