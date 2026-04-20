import React from 'react';
import type { DataPacket } from '../../types';

interface DataPacketSelectorProps {
  data: {
    dataPackets?: DataPacket[];
  } | null;
  onSelectPacket: (packetId: string) => void;
}

export function DataPacketSelector({ data, onSelectPacket }: DataPacketSelectorProps) {
  const qualityColors: Record<string, string> = {
    common: '#aaaaaa',
    uncommon: '#44cc44',
    rare: '#4488ff',
    epic: '#aa44ff',
    legendary: '#ffaa00',
  };

  const packets = data?.dataPackets ?? [];

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
        border: '2px solid #ffaa00',
        borderRadius: '12px',
        padding: '1.5rem',
        minWidth: '400px',
        maxWidth: '520px',
        color: '#e0e0ff',
        fontFamily: 'monospace',
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#ffaa00',
          marginBottom: '1rem',
          fontSize: '1.3rem',
        }}>
          👑 BOSS奖励 - 选择数据包
        </h2>

        <div style={{
          display: 'flex',
          gap: '0.8rem',
          justifyContent: 'center',
        }}>
          {packets.length > 0 ? packets.map((packet) => {
            const qualityColor = qualityColors[packet.quality ?? 'common'] ?? '#aaaaaa';
            return (
              <button
                key={packet.id}
                onClick={() => onSelectPacket(packet.id)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'rgba(255, 170, 0, 0.08)',
                  border: `2px solid ${qualityColor}`,
                  borderRadius: '10px',
                  color: '#e0e0ff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  minWidth: '110px',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                <div style={{ fontWeight: 'bold', color: qualityColor, marginBottom: '0.3rem' }}>
                  {packet.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: qualityColor, marginBottom: '0.3rem' }}>
                  [{packet.quality ?? 'common'}]
                </div>
                {packet.effectDescription && (
                  <div style={{ fontSize: '0.75rem', color: '#88ccaa' }}>
                    ✦ {packet.effectDescription}
                  </div>
                )}
              </button>
            );
          }) : (
            <div style={{ color: '#8888aa', padding: '2rem', textAlign: 'center' }}>
              暂无数据包可选
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#8888aa' }}>
          选择一个数据包永久获得
        </div>
      </div>
    </div>
  );
}
