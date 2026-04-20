import React from 'react';

interface BookstoreModalProps {
  data: {
    books?: Array<{
      id: string;
      name: string;
      description?: string;
      quality?: string;
      effectDescription?: string;
    }>;
    playerGold?: number;
    canAfford?: boolean[];
  } | null;
  onSelectBook: (bookId: string) => void;
  onLeave: () => void;
}

export function BookstoreModal({ data, onSelectBook, onLeave }: BookstoreModalProps) {
  const qualityColors: Record<string, string> = {
    common: '#aaaaaa',
    uncommon: '#44cc44',
    rare: '#4488ff',
    epic: '#aa44ff',
    legendary: '#ffaa00',
  };

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
        border: '2px solid #44aaff',
        borderRadius: '12px',
        padding: '1.5rem',
        minWidth: '360px',
        maxWidth: '440px',
        color: '#e0e0ff',
        fontFamily: 'monospace',
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#44aaff',
          marginBottom: '1rem',
          fontSize: '1.3rem',
        }}>
          📚 书店
        </h2>

        {data?.playerGold !== undefined && (
          <div style={{
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#ffcc44',
          }}>
            💰 金币：{data.playerGold}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
          {data?.books?.map((book, idx) => {
            const canAfford = data?.canAfford?.[idx] ?? true;
            const qualityColor = qualityColors[book.quality ?? 'common'] ?? '#aaaaaa';

            return (
              <button
                key={book.id}
                onClick={() => canAfford && onSelectBook(book.id)}
                disabled={!canAfford}
                style={{
                  padding: '0.8rem',
                  background: canAfford ? 'rgba(68, 170, 255, 0.1)' : 'rgba(60, 60, 80, 0.3)',
                  border: `1px solid ${canAfford ? qualityColor : '#444466'}`,
                  borderRadius: '8px',
                  color: canAfford ? '#e0e0ff' : '#666688',
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: qualityColor }}>{book.name}</span>
                  <span style={{ fontSize: '0.75rem', color: qualityColor }}>
                    [{book.quality ?? 'common'}]
                  </span>
                </div>
                {book.description && (
                  <div style={{ fontSize: '0.8rem', color: '#8888aa', marginTop: '0.3rem' }}>
                    {book.description}
                  </div>
                )}
                {book.effectDescription && (
                  <div style={{ fontSize: '0.8rem', color: '#66cc88', marginTop: '0.2rem' }}>
                    ✦ {book.effectDescription}
                  </div>
                )}
                {!canAfford && (
                  <div style={{ fontSize: '0.75rem', color: '#ff6644', marginTop: '0.2rem' }}>
                    金币不足
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onLeave}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'rgba(60, 60, 100, 0.6)',
              border: '1px solid #5555aa',
              borderRadius: '8px',
              color: '#ccccee',
              cursor: 'pointer',
            }}
          >
            离开书店
          </button>
        </div>
      </div>
    </div>
  );
}
