import React from 'react';

interface SkillPanelProps {
  data: {
    offeredSkills?: Array<{
      id: string;
      name: string;
      quality?: string;
      description?: string;
      effectDescription?: string;
    }>;
    currentActiveSkills?: Array<{
      id: string;
      name: string;
      quality?: string;
    }>;
    maxSlots?: number;
  } | null;
  onSelectSkill: (skillId: string, replaceSlot?: number) => void;
  onSkip: () => void;
}

export function SkillPanel({ data, onSelectSkill, onSkip }: SkillPanelProps) {
  const qualityColors: Record<string, string> = {
    common: '#aaaaaa',
    uncommon: '#44cc44',
    rare: '#4488ff',
    epic: '#aa44ff',
    legendary: '#ffaa00',
  };

  const maxSlots = data?.maxSlots ?? 3;
  const currentSkills = data?.currentActiveSkills ?? [];
  const isSlotFull = currentSkills.length >= maxSlots;

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
        border: '2px solid #aa44ff',
        borderRadius: '12px',
        padding: '1.5rem',
        minWidth: '360px',
        maxWidth: '440px',
        color: '#e0e0ff',
        fontFamily: 'monospace',
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#aa44ff',
          marginBottom: '1rem',
          fontSize: '1.3rem',
        }}>
          ⚡ 技能获取
        </h2>

        {data?.offeredSkills?.map((skill) => {
          const qualityColor = qualityColors[skill.quality ?? 'common'] ?? '#aaaaaa';
          return (
            <div
              key={skill.id}
              style={{
                background: 'rgba(170, 68, 255, 0.1)',
                border: `1px solid ${qualityColor}`,
                borderRadius: '8px',
                padding: '0.8rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: qualityColor, fontSize: '1.1rem' }}>
                  {skill.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: qualityColor }}>
                  [{skill.quality ?? 'common'}]
                </span>
              </div>
              {skill.description && (
                <div style={{ fontSize: '0.85rem', color: '#aaaacc', marginTop: '0.3rem' }}>
                  {skill.description}
                </div>
              )}
              {skill.effectDescription && (
                <div style={{ fontSize: '0.85rem', color: '#cc88ff', marginTop: '0.2rem' }}>
                  ✦ {skill.effectDescription}
                </div>
              )}

              <div style={{ marginTop: '0.8rem' }}>
                {!isSlotFull ? (
                  <button
                    onClick={() => onSelectSkill(skill.id)}
                    style={{
                      padding: '0.4rem 1rem',
                      background: 'linear-gradient(135deg, #8833cc 0%, #6622aa 100%)',
                      border: '1px solid #aa44ff',
                      borderRadius: '6px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    装备技能
                  </button>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#ffaa44', marginBottom: '0.4rem' }}>
                      技能槽已满，选择替换：
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {currentSkills.map((current, idx) => (
                        <button
                          key={current.id}
                          onClick={() => onSelectSkill(skill.id, idx)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            background: 'rgba(60, 60, 100, 0.6)',
                            border: '1px solid #6666aa',
                            borderRadius: '4px',
                            color: '#ccccee',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          替换 {current.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={onSkip}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'rgba(60, 60, 100, 0.6)',
              border: '1px solid #5555aa',
              borderRadius: '8px',
              color: '#8888aa',
              cursor: 'pointer',
            }}
          >
            放弃获取
          </button>
        </div>
      </div>
    </div>
  );
}
