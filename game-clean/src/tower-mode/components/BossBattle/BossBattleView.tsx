import React from 'react';

export interface Skill {
  id: string;
  name: string;
  cost: number;
  damage: number;
}

export interface BossBattleViewProps {
  bossName: string;
  bossHealth: number;
  bossMaxHealth: number;
  playerHealth: number;
  playerMaxHealth: number;
  playerTech: number;
  availableSkills: Skill[];
  onAttack: (skillId: string) => void;
  onDefend: () => void;
  onUseItem: (itemId: string) => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    padding: '32px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1a0a0a 0%, #0a0a1a 100%)',
    color: '#fff',
    fontFamily: 'inherit',
  },
  bossArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    maxWidth: '500px',
  },
  bossName: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ff4444',
    textShadow: '0 0 10px rgba(255, 68, 68, 0.5)',
  },
  healthBarOuter: {
    width: '100%',
    height: '24px',
    backgroundColor: '#333',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
  },
  healthBarInner: {
    height: '100%',
    borderRadius: '12px',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },
  healthText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
  },
  bossImage: {
    width: '120px',
    height: '120px',
    backgroundColor: '#2a1a1a',
    borderRadius: '8px',
    border: '2px solid #ff4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#888',
  },
  vsDivider: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#ffd700',
    textShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
  },
  playerArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    maxWidth: '500px',
  },
  techValue: {
    fontSize: '18px',
    color: '#88ccff',
  },
  actionPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '500px',
  },
  skillButton: {
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2244aa',
    border: '2px solid #4488ff',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
  },
  skillButtonDisabled: {
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#1a1a2e',
    border: '2px solid #333',
    borderRadius: '8px',
    cursor: 'not-allowed',
  },
  defendButton: {
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#226622',
    border: '2px solid #44aa44',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
  },
};

const BossBattleView: React.FC<BossBattleViewProps> = ({
  bossName,
  bossHealth,
  bossMaxHealth,
  playerHealth,
  playerMaxHealth,
  playerTech,
  availableSkills,
  onAttack,
  onDefend,
  onUseItem,
}) => {
  const bossHealthPercent = Math.max(0, Math.min(100, (bossHealth / bossMaxHealth) * 100));
  const playerHealthPercent = Math.max(0, Math.min(100, (playerHealth / playerMaxHealth) * 100));

  const bossBarColor = bossHealthPercent > 50 ? '#ff4444' : '#ff0000';

  return (
    <div style={styles.container} data-testid="boss-battle-view">
      {/* Boss Area */}
      <div style={styles.bossArea} data-testid="boss-area">
        <span style={styles.bossName} data-testid="boss-name">
          {bossName}
        </span>
        <div style={styles.healthBarOuter} data-testid="boss-health-bar">
          <div
            style={{
              ...styles.healthBarInner,
              width: `${bossHealthPercent}%`,
              backgroundColor: bossBarColor,
            }}
            data-testid="boss-health-fill"
          />
          <span style={styles.healthText} data-testid="boss-health-text">
            {bossHealth}/{bossMaxHealth}
          </span>
        </div>
        <div style={styles.bossImage} data-testid="boss-image">
          Boss Image Placeholder
        </div>
      </div>

      {/* VS Divider */}
      <div style={styles.vsDivider} data-testid="vs-divider">
        VS
      </div>

      {/* Player Area */}
      <div style={styles.playerArea} data-testid="player-area">
        <div style={styles.healthBarOuter} data-testid="player-health-bar">
          <div
            style={{
              ...styles.healthBarInner,
              width: `${playerHealthPercent}%`,
              backgroundColor: '#4488ff',
            }}
            data-testid="player-health-fill"
          />
          <span style={styles.healthText} data-testid="player-health-text">
            {playerHealth}/{playerMaxHealth}
          </span>
        </div>
        <span style={styles.techValue} data-testid="player-tech">
          💡 {playerTech} 技术值
        </span>
      </div>

      {/* Action Panel */}
      <div style={styles.actionPanel} data-testid="action-panel">
        {availableSkills.map((skill) => (
          <button
            key={skill.id}
            style={
              playerTech < skill.cost
                ? styles.skillButtonDisabled
                : styles.skillButton
            }
            disabled={playerTech < skill.cost}
            onClick={() => onAttack(skill.id)}
            data-testid={`skill-button-${skill.id}`}
          >
            {skill.name} (💡{skill.cost})
          </button>
        ))}
        <button
          style={styles.defendButton}
          onClick={onDefend}
          data-testid="defend-button"
        >
          🛡️ 防御
        </button>
      </div>
    </div>
  );
};

export default BossBattleView;
