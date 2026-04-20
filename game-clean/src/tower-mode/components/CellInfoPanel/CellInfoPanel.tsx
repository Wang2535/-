import { useState, useEffect, useCallback } from 'react';
import './cellInfoPanel.css';

export interface CellInfoPanelData {
  cellId: string;
  cellType: string;
  displayName: string;
  difficultyStars: number;
  enemyPreview?: { name: string; type: string; estimatedPower: number } | null;
  estimatedTechGain?: number | string;
  estimatedGoldGain?: number | string;
  estimatedCoreRewards?: Record<string, number> | null;
  unlockCardsPreview?: Array<{ name: string; rarity: string }> | null;
  description?: string;
}

interface CellInfoPanelProps {
  visible: boolean;
  cellData: CellInfoPanelData | null;
  onEnter: (cellId: string) => void;
  onSkip: (cellId: string) => void;
  onClose: () => void;
  layerNumber: number;
  zoneId?: string;
  onBuyBook?: () => void;
  onSelectSkill?: () => void;
  onExchange?: () => void;
  onStartBattle?: () => void;
}

const CELL_TYPE_LABELS: Record<string, { name: string; icon: string; color: string }> = {
  battle: { name: '挑战关', icon: '⚔️', color: '#e74c3c' },
  boss: { name: 'Boss战', icon: '👑', color: '#c0392b' },
  bookstore: { name: '知识殿堂', icon: '📚', color: '#3498db' },
  skill: { name: '技能研习', icon: '⚡', color: '#9b59b6' },
  exchange: { name: '交流会', icon: '🤝', color: '#1abc9c' },
  opportunity: { name: '机遇格', icon: '🎲', color: '#f39c12' },
  chance: { name: '随机事件', icon: '❓', color: '#e67e22' },
  special: { name: '特殊格', icon: '⭐', color: '#f1c40f' },
  elite: { name: '精英关', icon: '💀', color: '#8e44ad' },
};

const DIFFICULTY_STARS = ['★', '★★', '★★★', '★★★★', '★★★★★'];

const ZONE_TIPS: Record<string, string> = {
  W: '⚠️ 虚弱区域: 下次掷骰-1',
  N: '📚 知识区域: 获得随机书籍,算力+2',
  I: '🔄 反转区域: 地图倒置,移动方向反转',
  P: '⏭️ 跳过区域: 下回合将被跳过',
  S: '💨 加速区域: 下次掷骰+1',
  D: '💀 危险区域: 随机损失技术值',
};

const ZONE_COLORS: Record<string, string> = {
  W: '#FF6B6B',
  N: '#4ECDC4',
  I: '#aa44ff',
  P: '#F39C12',
  S: '#44ff88',
  D: '#FF4444',
};

export function CellInfoPanel({ visible, cellData, onEnter, onSkip, onClose, layerNumber, zoneId, onBuyBook, onSelectSkill, onExchange, onStartBattle }: CellInfoPanelProps) {
  const [animState, setAnimState] = useState<'entering' | 'visible' | 'exiting'>('visible');

  useEffect(() => {
    if (visible) setAnimState('entering');
  }, [visible]);

  const handleEnter = useCallback(() => {
    if (!cellData) return;
    setAnimState('exiting');
    setTimeout(() => onEnter(cellData.cellId), 250);
  }, [cellData, onEnter]);

  const handleSkip = useCallback(() => {
    if (!cellData) return;
    setAnimState('exiting');
    setTimeout(() => onSkip(cellData.cellId), 250);
  }, [cellData, onSkip]);

  if (!visible || !cellData) return null;

  const typeInfo = CELL_TYPE_LABELS[cellData.cellType] ?? { name: '未知', icon: '?', color: '#888' };
  const stars = DIFFICULTY_STARS[Math.min(cellData.difficultyStars - 1, 4)] ?? '';

  const layerGradients: Record<number, string> = {
    1: 'linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%)',
    2: 'linear-gradient(135deg, #0d2137 0%, #1a3a5c 100%)',
    3: 'linear-gradient(135deg, #3d2b1f 0%, #5c4033 100%)',
    4: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)',
    5: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)',
    6: 'linear-gradient(135deg, #0a1628 0%, #1a3050 100%)',
    7: 'linear-gradient(135deg, #1a1a3e 0%, #2a2a5e 100%)',
    8: 'linear-gradient(135deg, #0d0d25 0%, #1d1d45 100%)',
    9: 'linear-gradient(135deg, #1a0a2e 0%, #3a1a5e 100%)',
  };

  return (
    <div className={`cell-info-panel-overlay ${animState}`}>
      <div className="cell-info-panel" style={{
        background: layerGradients[layerNumber] ?? layerGradients[1],
        borderColor: typeInfo.color,
      }}>
        <div className="cip-header" style={{ borderBottomColor: `${typeInfo.color}33` }}>
          <span className="cip-type-icon">{typeInfo.icon}</span>
          <span className="cip-type-name">{typeInfo.name}</span>
          <span className="cip-layer-badge">L{layerNumber}</span>
          <button className="cip-close-btn" onClick={() => { setAnimState('exiting'); setTimeout(onClose, 250); }}>✕</button>
        </div>
        <div className="cip-body">
          <div className="cip-name-row">
            <span className="cip-cell-name">{cellData.displayName}</span>
            <span className="cip-difficulty-stars" style={{ color: '#ffd700' }}>{stars}</span>
          </div>
          {(cellData.cellType === 'battle' || cellData.cellType === 'boss') && cellData.enemyPreview && (
            <div className="cip-enemy-preview">
              <span className="cip-label">敌人:</span>
              <span className="cip-enemy-name">{cellData.enemyPreview.name}</span>
              <span className="cip-enemy-type">[{cellData.enemyPreview.type}]</span>
              <span className="cip-enemy-power">战力≈{cellData.enemyPreview.estimatedPower}</span>
            </div>
          )}
          <div className="cip-rewards-preview">
            <span className="cip-label">预计收益:</span>
            <div className="cip-reward-items">
              <span className="cip-reward tech">技术值 +{cellData.estimatedTechGain ?? '?'}</span>
              <span className="cip-reward gold">金币 +{cellData.estimatedGoldGain ?? '?'}</span>
              {cellData.estimatedCoreRewards && Object.entries(cellData.estimatedCoreRewards).map(([key, val]) => (
                <span key={key} className="cip-reward core">
                  {key === 'compute' ? '算力' : key === 'fund' ? '资金' : '信息'} +{val}
                </span>
              ))}
            </div>
          </div>
          {cellData.unlockCardsPreview && cellData.unlockCardsPreview.length > 0 && (
            <div className="cip-cards-preview">
              <span className="cip-label">解锁卡牌:</span>
              <div className="cip-cards-list">
                {cellData.unlockCardsPreview.map((card, i) => (
                  <span key={i} className="cip-card-mini" title={card.name}>
                    🎴 {card.name}
                    <span className="cip-card-rarity" style={{
                      color: card.rarity === 'legendary' ? '#ff9500' : card.rarity === 'epic' ? '#a335ee' : card.rarity === 'rare' ? '#0070dd' : '#999'
                    }}> [{card.rarity}]</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {cellData.description && <p className="cip-description">{cellData.description}</p>}
        </div>
        {zoneId && ZONE_TIPS[zoneId] && (
          <div className="cip-zone-tip" style={{ color: ZONE_COLORS[zoneId] ?? '#fff' }}>
            {ZONE_TIPS[zoneId]}
          </div>
        )}
        <div className="cip-actions">
          <button className="cip-btn cip-btn-enter" onClick={handleEnter}
                  style={{ background: `linear-gradient(135deg, ${typeInfo.color}, ${typeInfo.color}cc)` }}>
            {cellData.cellType === 'boss' ? '⚔️ 挑战Boss' : '🚀 进入'}
          </button>
          <button className="cip-btn cip-btn-skip" onClick={handleSkip}>⏭️ 暂不进入</button>
        </div>
        {(onBuyBook || onSelectSkill || onExchange || onStartBattle) && (
          <div className="cip-special-actions">
            {cellData.cellType === 'bookstore' && onBuyBook && (
              <button className="cip-btn cip-btn-special" onClick={onBuyBook}>📖 购买书籍</button>
            )}
            {cellData.cellType === 'skill' && onSelectSkill && (
              <button className="cip-btn cip-btn-special" onClick={onSelectSkill}>⚡ 选择技能</button>
            )}
            {cellData.cellType === 'exchange' && onExchange && (
              <button className="cip-btn cip-btn-special" onClick={onExchange}>🔄 交换</button>
            )}
            {cellData.cellType === 'boss' && onStartBattle && (
              <button className="cip-btn cip-btn-special" onClick={onStartBattle}>⚔️ 开始战斗</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
