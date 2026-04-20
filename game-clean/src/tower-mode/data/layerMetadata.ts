import type { LayerMetadata, HotspotConfig } from '../types';

export const TIER_DATA: Readonly<Record<number, LayerMetadata>> = {
  1: {
    name: '病毒实验室',
    shortName: '病毒实验室',
    color: '#228B22',
    theme: '恶意软件与病毒防御',
    features: [
      { icon: '🦠', text: '计算机病毒基础认知' },
      { icon: '🛡️', text: '勒索软件防御策略' },
      { icon: '🔬', text: '恶意软件分析技术' },
      { icon: '⚔️', text: '病毒防护实战演练' },
      { icon: '☣️', text: '生物危害隔离系统' }
    ],
    progress: 0
  },
  2: {
    name: '网络空间',
    shortName: '网络空间',
    color: '#00CED1',
    theme: '网络攻击与防御',
    features: [
      { icon: '🌐', text: 'DDoS攻击识别与防御' },
      { icon: '🔥', text: '防火墙与边界防护' },
      { icon: '👁️', text: '入侵检测系统(IDS)' },
      { icon: '📊', text: '网络流量分析技术' },
      { icon: '🔗', text: '中间人攻击防护' }
    ],
    progress: 0
  },
  3: {
    name: '数据保险库',
    shortName: '数据保险库',
    color: '#4169E1',
    theme: '数据安全与加密技术',
    features: [
      { icon: '🔐', text: '对称与非对称加密' },
      { icon: '💾', text: '数据库安全防护' },
      { icon: '📋', text: '数据备份与恢复策略' },
      { icon: '🗄️', text: '访问控制与身份认证' },
      { icon: '🏦', text: '安全开发生命周期管理' }
    ],
    progress: 0
  },
  4: {
    name: '城市街区',
    shortName: '城市街区',
    color: '#FF8C00',
    theme: '社会工程学与人因安全',
    features: [
      { icon: '🎭', text: '钓鱼邮件识别技巧' },
      { icon: '📱', text: '电话诈骗防范意识' },
      { icon: '👥', text: '内部威胁检测方法' },
      { icon: '🎯', text: '安全意识培训体系' },
      { icon: '⚠️', text: '物理安全与社交工程' }
    ],
    progress: 0
  },
  5: {
    name: '智能工厂',
    shortName: '智能工厂',
    color: '#DAA520',
    theme: '工业物联网安全',
    features: [
      { icon: '🏭', text: '工业控制系统(ICS)安全' },
      { icon: '🤖', text: '物联网设备安全管理' },
      { icon: '📡', text: 'SCADA系统防护策略' },
      { icon: '🔧', text: 'OT/IT网络安全融合' },
      { icon: '⚙️', text: '智能制造安全标准' }
    ],
    progress: 0
  },
  6: {
    name: '移动终端',
    shortName: '移动终端',
    color: '#9370DB',
    theme: '移动设备与应用安全',
    features: [
      { icon: '📲', text: '移动应用安全测试(MAST)' },
      { icon: '📳', text: '移动设备管理(MDM)' },
      { icon: '🔒', text: '移动支付安全机制' },
      { icon: '📍', text: '位置服务隐私保护' },
      { icon: '🛡️', text: 'BYOD安全策略实施' }
    ],
    progress: 0
  },
  7: {
    name: '云端平台',
    shortName: '云端平台',
    color: '#87CEEB',
    theme: '云计算与虚拟化安全',
    features: [
      { icon: '☁️', text: '云基础设施安全配置' },
      { icon: '🐳', text: '容器与Kubernetes安全' },
      { icon: '🔄', text: 'DevSecOps安全实践' },
      { icon: '🔑', text: '零信任架构实施' },
      { icon: '📊', text: '云原生应用保护(CNAPP)' }
    ],
    progress: 0
  },
  8: {
    name: '未来实验室',
    shortName: '未来实验室',
    color: '#FF69B4',
    theme: 'AI与新兴技术安全',
    features: [
      { icon: '🤖', text: 'AI模型对抗性攻防' },
      { icon: '🧬', text: '量子计算安全影响' },
      { icon: '🔮', text: '区块链安全技术应用' },
      { icon: '🌐', text: 'Web3.0与去中心化安全' },
      { icon: '🚀', text: '后量子密码学(PQC)迁移' }
    ],
    progress: 0
  },
  9: {
    name: '指挥中心',
    shortName: '指挥中心',
    color: '#FFD700',
    theme: '安全运营中心(SOC)与管理',
    features: [
      { icon: '🎛️', text: 'SIEM/SOAR平台部署' },
      { icon: '📡', text: '威胁情报(TI)整合分析' },
      { icon: '🔍', text: '事件响应(IR)流程优化' },
      { icon: '📈', text: '安全度量与KPI体系' },
      { icon: '🏆', text: '红蓝对抗演练体系' }
    ],
    progress: 0
  }
} as const;

export const HOTSPOT_CONFIG: Readonly<Record<number, HotspotConfig>> = {
  1: { bottom: 8, height: 10, width: 82 },
  2: { bottom: 19, height: 10, width: 76 },
  3: { bottom: 30, height: 10, width: 70 },
  4: { bottom: 41, height: 10, width: 63 },
  5: { bottom: 52, height: 10, width: 55 },
  6: { bottom: 63, height: 9, width: 47 },
  7: { bottom: 73, height: 9, width: 39 },
  8: { bottom: 83, height: 7, width: 31 },
  9: { bottom: 90, height: 9, width: 23 }
} as const;
