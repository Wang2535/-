export type DifficultyStar = 1 | 2 | 3 | 4 | 5;

export interface LevelPoolEntry {
  id: string;
  layer: number;
  theme: string;
  difficulty: DifficultyStar;
  tags: string[];
  name: string;
  description: string;
}

interface ThemeConfig {
  theme: string;
  layer: number;
  chineseName: string;
  levelChineseName: string;
  tags: string[];
  normalCount: number;
  startId: number;
  bossId: number;
  difficultyRange: [DifficultyStar, DifficultyStar];
  bossDifficulty: DifficultyStar;
}

const THEME_CONFIGS: ThemeConfig[] = [
  { theme: 'virus', layer: 1, chineseName: '病毒实验室', levelChineseName: '病毒防御', tags: ['malware', 'ransomware', 'trojan', 'worm', 'virus-analysis', 'reverse-engineering'], normalCount: 15, startId: 1, bossId: 16, difficultyRange: [1, 2], bossDifficulty: 3 },
  { theme: 'network', layer: 2, chineseName: '网络空间', levelChineseName: '网络攻防', tags: ['ddos', 'firewall', 'ids', 'mitm', 'packet-analysis', 'network-forensics'], normalCount: 15, startId: 17, bossId: 32, difficultyRange: [1, 2], bossDifficulty: 3 },
  { theme: 'data-security', layer: 3, chineseName: '数据保险库', levelChineseName: '数据安全', tags: ['encryption', 'database', 'backup', 'access-control', 'compliance'], normalCount: 15, startId: 33, bossId: 48, difficultyRange: [2, 3], bossDifficulty: 4 },
  { theme: 'social-engineer', layer: 4, chineseName: '城市街区', levelChineseName: '社会工程', tags: ['phishing', 'impersonation', 'baiting', 'pretexting', 'awareness'], normalCount: 15, startId: 49, bossId: 64, difficultyRange: [2, 3], bossDifficulty: 4 },
  { theme: 'industrial-iot', layer: 5, chineseName: '智能工厂', levelChineseName: '工业物联', tags: ['scada', 'plc', 'iot-device', 'ot-security', 'supply-chain'], normalCount: 15, startId: 65, bossId: 80, difficultyRange: [3, 4], bossDifficulty: 5 },
  { theme: 'mobile-terminal', layer: 6, chineseName: '移动终端', levelChineseName: '移动终端', tags: ['mobile-app', 'mdm', 'mobile-payment', 'location-privacy', 'byod'], normalCount: 15, startId: 81, bossId: 96, difficultyRange: [3, 4], bossDifficulty: 5 },
  { theme: 'cloud-virtual', layer: 7, chineseName: '云端平台', levelChineseName: '云端虚拟', tags: ['container', 'kubernetes', 'devsecops', 'zero-trust', 'cnapp'], normalCount: 15, startId: 97, bossId: 112, difficultyRange: [4, 5], bossDifficulty: 5 },
  { theme: 'ai-emerging', layer: 8, chineseName: '未来实验室', levelChineseName: 'AI新兴', tags: ['adversarial-ai', 'quantum', 'blockchain', 'web3', 'pqc'], normalCount: 14, startId: 113, bossId: 127, difficultyRange: [4, 5], bossDifficulty: 5 },
  { theme: 'security-mgmt', layer: 9, chineseName: '指挥中心', levelChineseName: '安全管理', tags: ['siem', 'threat-intel', 'incident-response', 'governance', 'red-team'], normalCount: 14, startId: 128, bossId: 142, difficultyRange: [5, 5], bossDifficulty: 5 },
];

function pickTags(tags: string[], index: number): string[] {
  const count = index % 3 === 0 ? 2 : 3;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(tags[(index * 2 + i) % tags.length]);
  }
  return result;
}

function pickDifficulty(range: [DifficultyStar, DifficultyStar], index: number, total: number): DifficultyStar {
  if (range[0] === range[1]) return range[0];
  const half = Math.ceil(total / 2);
  return (index < half ? range[0] : range[1]) as DifficultyStar;
}

export const LEVEL_POOL: LevelPoolEntry[] = THEME_CONFIGS.flatMap((config) => {
  const normals: LevelPoolEntry[] = Array.from({ length: config.normalCount }, (_, i) => ({
    id: `LV${String(config.startId + i).padStart(3, '0')}`,
    layer: config.layer,
    theme: config.theme,
    difficulty: pickDifficulty(config.difficultyRange, i, config.normalCount),
    tags: pickTags(config.tags, i),
    name: `${config.levelChineseName}-${String(i + 1).padStart(2, '0')}`,
    description: `第${config.layer}层${config.chineseName}关卡${String(i + 1).padStart(2, '0')}`,
  }));

  const boss: LevelPoolEntry = {
    id: `LV${String(config.bossId).padStart(3, '0')}`,
    layer: config.layer,
    theme: config.theme,
    difficulty: config.bossDifficulty,
    tags: ['boss', ...pickTags(config.tags, 0).slice(0, 2)],
    name: `${config.levelChineseName}-BOSS`,
    description: `第${config.layer}层${config.chineseName}BOSS关卡`,
  };

  return [...normals, boss];
});

export const LEVEL_POOL_BY_LAYER: Record<number, LevelPoolEntry[]> = LEVEL_POOL.reduce<Record<number, LevelPoolEntry[]>>(
  (acc, entry) => {
    if (!acc[entry.layer]) acc[entry.layer] = [];
    acc[entry.layer].push(entry);
    return acc;
  },
  {},
);
