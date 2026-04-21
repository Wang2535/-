import { LEVEL_DATABASE } from '../../data/levelDatabase';

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

// 主题配置
const THEME_CONFIGS = {
  1: { theme: 'virus', chineseName: '病毒实验室', levelChineseName: '病毒防御', tags: ['malware', 'ransomware', 'trojan', 'worm', 'virus-analysis', 'reverse-engineering'] },
  2: { theme: 'network', chineseName: '网络空间', levelChineseName: '网络攻防', tags: ['ddos', 'firewall', 'ids', 'mitm', 'packet-analysis', 'network-forensics'] },
  3: { theme: 'data-security', chineseName: '数据保险库', levelChineseName: '数据安全', tags: ['encryption', 'database', 'backup', 'access-control', 'compliance'] },
  4: { theme: 'social-engineer', chineseName: '城市街区', levelChineseName: '社会工程', tags: ['phishing', 'impersonation', 'baiting', 'pretexting', 'awareness'] },
  5: { theme: 'industrial-iot', chineseName: '智能工厂', levelChineseName: '工业物联', tags: ['scada', 'plc', 'iot-device', 'ot-security', 'supply-chain'] },
  6: { theme: 'mobile-terminal', chineseName: '移动终端', levelChineseName: '移动终端', tags: ['mobile-app', 'mdm', 'mobile-payment', 'location-privacy', 'byod'] },
  7: { theme: 'cloud-virtual', chineseName: '云端平台', levelChineseName: '云端虚拟', tags: ['container', 'kubernetes', 'devsecops', 'zero-trust', 'cnapp'] },
  8: { theme: 'ai-emerging', chineseName: '未来实验室', levelChineseName: 'AI新兴', tags: ['adversarial-ai', 'quantum', 'blockchain', 'web3', 'pqc'] },
  9: { theme: 'security-mgmt', chineseName: '指挥中心', levelChineseName: '安全管理', tags: ['siem', 'threat-intel', 'incident-response', 'governance', 'red-team'] },
};

// 从关卡数据库生成关卡池
export const LEVEL_POOL: LevelPoolEntry[] = Object.entries(LEVEL_DATABASE).map(([id, level]) => {
  // 提取关卡编号（去掉LV前缀）
  const levelNum = parseInt(id.replace('LV', ''));
  
  // 根据关卡编号分配层级
  let layer = 1;
  if (levelNum >= 1 && levelNum <= 16) layer = 1;
  else if (levelNum >= 17 && levelNum <= 32) layer = 2;
  else if (levelNum >= 33 && levelNum <= 48) layer = 3;
  else if (levelNum >= 49 && levelNum <= 64) layer = 4;
  else if (levelNum >= 65 && levelNum <= 80) layer = 5;
  else if (levelNum >= 81 && levelNum <= 96) layer = 6;
  else if (levelNum >= 97 && levelNum <= 112) layer = 7;
  else if (levelNum >= 113 && levelNum <= 127) layer = 8;
  else if (levelNum >= 128 && levelNum <= 142) layer = 9;
  
  const config = THEME_CONFIGS[layer];
  const isBoss = levelNum === 16 || levelNum === 32 || levelNum === 48 || levelNum === 64 || levelNum === 80 || levelNum === 96 || levelNum === 112 || levelNum === 127 || levelNum === 142;
  
  return {
    id,
    layer,
    theme: config.theme,
    difficulty: level.difficulty as DifficultyStar,
    tags: isBoss ? ['boss', ...config.tags.slice(0, 2)] : config.tags.slice(0, 3),
    name: level.name,
    description: level.subtitle || `第${layer}层${config.chineseName}关卡`,
  };
});

// 按层级分组
export const LEVEL_POOL_BY_LAYER: Record<number, LevelPoolEntry[]> = LEVEL_POOL.reduce<Record<number, LevelPoolEntry[]>>(
  (acc, entry) => {
    if (!acc[entry.layer]) acc[entry.layer] = [];
    acc[entry.layer].push(entry);
    return acc;
  },
  {},
);
