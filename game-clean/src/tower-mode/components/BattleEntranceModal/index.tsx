import React from 'react';

interface BattleEntranceModalProps {
  data: {
    levelId?: string;
    enemyPreview?: {
      name?: string;
      hp?: number;
      difficulty?: number;
    };
    difficulty?: number;
    estimatedRewards?: string[];
    onConfirm?: () => void;
    onRetreat?: () => void;
  } | null;
  onConfirm: () => void;
  onRetreat: () => void;
}

export function BattleEntranceModal({ data, onConfirm, onRetreat }: BattleEntranceModalProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 100,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a3e 0%, #2a2a5e 100%)',
        border: '2px solid #ff6644',
        borderRadius: '12px',
        padding: '1.5rem',
        minWidth: '320px',
        maxWidth: '400px',
        color: '#e0e0ff',
        fontFamily: 'monospace',
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#ff6644',
          marginBottom: '1rem',
          fontSize: '1.3rem',
        }}>
          ⚔️ 战斗即将开始
        </h2>

        {data?.enemyPreview && (
          <div style={{
            background: 'rgba(255, 100, 68, 0.1)',
            borderRadius: '8px',
            padding: '0.8rem',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 100, 68, 0.3)',
          }}>
            <div style={{ marginBottom: '0.3rem' }}>
              <span style={{ color: '#ff8866' }}>敌人：</span>
              {data.enemyPreview.name ?? '未知敌人'}
            </div>
            {data.enemyPreview.hp !== undefined && (
              <div>
                <span style={{ color: '#ff8866' }}>HP：</span>
                {data.enemyPreview.hp}
              </div>
            )}
            {data.difficulty !== undefined && (
              <div>
                <span style={{ color: '#ff8866' }}>难度：</span>
                {'⭐'.repeat(Math.min(data.difficulty, 5))}
              </div>
            )}
          </div>
        )}

        {data?.estimatedRewards && data.estimatedRewards.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#ffcc44', marginBottom: '0.3rem' }}>预计奖励：</div>
            {data.estimatedRewards.map((reward, idx) => (
              <div key={idx} style={{ paddingLeft: '0.5rem', fontSize: '0.85rem' }}>
                • {reward}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'linear-gradient(135deg, #cc3333 0%, #991111 100%)',
              border: '1px solid #ff4444',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            进入战斗
          </button>
          <button
            onClick={onRetreat}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'rgba(60, 60, 100, 0.6)',
              border: '1px solid #5555aa',
              borderRadius: '8px',
              color: '#ccccee',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            撤退
          </button>
        </div>
      </div>
    </div>
  );
}
