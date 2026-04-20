import React from 'react';

interface ChanceEventModalProps {
  data: {
    event?: {
      name?: string;
      description?: string;
    };
    outcomeOptions?: Array<{
      id: string;
      label: string;
      description?: string;
    }>;
    onSelectOption?: (optionId: string) => void;
  } | null;
  onSelectOption: (optionId: string) => void;
}

export function ChanceEventModal({ data, onSelectOption }: ChanceEventModalProps) {
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
        border: '2px solid #ffcc44',
        borderRadius: '12px',
        padding: '1.5rem',
        minWidth: '320px',
        maxWidth: '400px',
        color: '#e0e0ff',
        fontFamily: 'monospace',
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#ffcc44',
          marginBottom: '1rem',
          fontSize: '1.3rem',
        }}>
          ❓ 随机事件
        </h2>

        {data?.event && (
          <div style={{
            background: 'rgba(255, 204, 68, 0.1)',
            borderRadius: '8px',
            padding: '0.8rem',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 204, 68, 0.3)',
          }}>
            {data.event.name && (
              <div style={{ fontWeight: 'bold', marginBottom: '0.3rem', color: '#ffcc44' }}>
                {data.event.name}
              </div>
            )}
            {data.event.description && (
              <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                {data.event.description}
              </div>
            )}
          </div>
        )}

        {data?.outcomeOptions && data.outcomeOptions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.outcomeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => onSelectOption(option.id)}
                style={{
                  padding: '0.6rem 1rem',
                  background: 'rgba(80, 80, 150, 0.4)',
                  border: '1px solid #5555aa',
                  borderRadius: '8px',
                  color: '#ccccee',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{option.label}</div>
                {option.description && (
                  <div style={{ fontSize: '0.8rem', color: '#8888aa', marginTop: '0.2rem' }}>
                    {option.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#8888aa', padding: '1rem' }}>
            事件效果已自动应用
          </div>
        )}
      </div>
    </div>
  );
}
