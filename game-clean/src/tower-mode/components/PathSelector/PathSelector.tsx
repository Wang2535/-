import React from 'react';

interface PathSelectorProps {
  availablePaths: Array<{
    targetCellId: string;
    pathCells?: string[];
    totalSteps?: number;
    direction?: string;
  }>;
  onSelect: (index: number) => void;
  visible?: boolean;
}

export function PathSelector({
  availablePaths,
  onSelect,
  visible = true,
}: PathSelectorProps) {
  if (!visible || !availablePaths || availablePaths.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        background: 'rgba(10, 10, 40, 0.85)',
        borderRadius: '12px',
        border: '2px solid #4466aa',
        maxWidth: '500px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '1.15rem',
          color: '#88ddff',
          marginBottom: '0.8rem',
          textAlign: 'center',
        }}
      >
        📍 选择路径 ({availablePaths.length}条可选)
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          width: '100%',
        }}
      >
        {availablePaths.map((path, index) => (
          <button
            key={`${path.targetCellId}-${index}`}
            onClick={() => onSelect(index)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0.75rem 1rem',
              background: 'rgba(68, 102, 170, 0.25)',
              border: '1px solid #5577bb',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              marginBottom: '0.5rem',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(80, 120, 200, 0.45)';
              (e.target as HTMLElement).style.borderColor = '#7799dd';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(68, 102, 170, 0.25)';
              (e.target as HTMLElement).style.borderColor = '#5577bb';
            }}
          >
            <div
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#ccddee',
                marginBottom: '0.25rem',
              }}
            >
              路径{index + 1}
            </div>
            <div
              style={{
                fontSize: '0.9rem',
                color: '#99aacc',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              {path.totalSteps !== undefined && (
                <span>{path.totalSteps}步</span>
              )}
              <span>→ {path.targetCellId}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
