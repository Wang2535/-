// src/data/level1Knowledge.ts

export interface KnowledgeEntry {
  id: string;
  content: string;
  source: string;
  category: 'virus' | 'prevention' | 'history';
}

export const LEVEL_1_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'k1',
    content: '1982 年，15 岁的里奇·斯克伦塔创造了历史上第一款攻击个人计算机的全球病毒Elk Cloner。这个病毒通过感染 Apple II 操作系统的软盘进行传播，开创了计算机病毒传播的先河。',
    source: '《大东话安全》系列原文',
    category: 'history'
  },
  {
    id: 'k2',
    content: 'Elk Cloner 病毒每第 50 次启动受感染的系统时，就会显示一首诗。虽然它只是一个"恶作剧"病毒，不会破坏数据，但它开创了计算机病毒的先河。',
    source: '《大东话安全》系列原文',
    category: 'virus'
  },
  {
    id: 'k3',
    content: '一旦 Elk Cloner 被删除，以前感染的磁盘将不会被重新感染，因为它已经在其目录中包含 Elk Cloner"签名"。也可以将"签名"写入磁盘来"接种"未受感染的磁盘对抗 Elk Cloner。',
    source: '《大东话安全》系列原文',
    category: 'prevention'
  },
  {
    id: 'k4',
    content: '计算机病毒的传播方式主要有：通过可移动存储介质（如软盘、U 盘）、网络传播、电子邮件附件等。早期病毒主要通过软盘传播。',
    source: '《大东话安全》系列原文',
    category: 'virus'
  },
  {
    id: 'k5',
    content: '预防计算机病毒的有效方法包括：安装杀毒软件、定期更新系统补丁、不随意使用来路不明的存储介质、备份重要数据等。',
    source: '《大东话安全》系列原文',
    category: 'prevention'
  },
  {
    id: 'k6',
    content: '病毒"接种"技术的原理是：在系统中预先写入病毒的特征码（签名），当真正的病毒试图感染时，系统会误认为已经感染而不再重复感染。',
    source: '《大东话安全》系列原文',
    category: 'prevention'
  },
  {
    id: 'k7',
    content: 'Elk Cloner 病毒的传播范围虽然有限，但它证明了个人计算机也可能成为病毒攻击的目标，这一发现对计算机安全领域产生了深远影响。',
    source: '《大东话安全》系列原文',
    category: 'history'
  },
  {
    id: 'k8',
    content: '现代杀毒软件的"特征码扫描"技术，正是源于早期对 Elk Cloner 等病毒的研究。通过识别病毒的唯一标识（签名）来检测和清除病毒。',
    source: '《大东话安全》系列原文',
    category: 'prevention'
  },
  {
    id: 'k9',
    content: '计算机病毒的发展历程：1982 年 Elk Cloner（首个 PC 病毒） 1986 年 Brain（首个 DOS 病毒） 1990 年代宏病毒  2000 年代网络蠕虫  现代勒索软件。',
    source: '《大东话安全》系列原文',
    category: 'history'
  },
  {
    id: 'k10',
    content: '网络安全意识教育的重要性：据统计，超过 70% 的网络安全事件是由于用户缺乏安全意识造成的。提高用户的安全意识是预防网络攻击的第一道防线。',
    source: '《大东话安全》系列原文',
    category: 'prevention'
  }
];

export function getRandomKnowledge(): KnowledgeEntry {
  const index = Math.floor(Math.random() * LEVEL_1_KNOWLEDGE.length);
  return LEVEL_1_KNOWLEDGE[index];
}

export function getKnowledgeById(id: string): KnowledgeEntry | undefined {
  return LEVEL_1_KNOWLEDGE.find(k => k.id === id);
}
