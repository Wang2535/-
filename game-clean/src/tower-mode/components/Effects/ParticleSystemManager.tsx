import React, { useState, useEffect, useCallback } from 'react';

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: string;
}

export interface ParticleSystemManagerProps {
  type: 'circuit' | 'conveyor' | 'lightning' | 'dataflow' | 'boss';
  position?: { x: number; y: number };
  direction?: 'up' | 'down' | 'left' | 'right' | 'radial';
  count?: number;
  color?: string;
  active?: boolean;
}

const DEFAULT_COLORS: Record<ParticleSystemManagerProps['type'], string> = {
  circuit: '#00ffff',
  conveyor: '#7fff7f',
  lightning: '#ffff00',
  dataflow: '#ffd700',
  boss: '#FFD700',
};

function generateId(): string {
  return `particle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createParticle(
  type: ParticleSystemManagerProps['type'],
  position: { x: number; y: number },
  direction: ParticleSystemManagerProps['direction'],
  color: string,
): Particle {
  const random = () => Math.random();
  let vx = 0;
  let vy = 0;

  switch (direction) {
    case 'up':
      vy = -(1 + random());
      break;
    case 'down':
      vy = 1 + random();
      break;
    case 'left':
      vx = -(1 + random());
      break;
    case 'right':
      vx = 1 + random();
      break;
    case 'radial': {
      const angle = random() * Math.PI * 2;
      const speed = 1 + random();
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
      break;
    }
  }

  return {
    id: generateId(),
    x: position.x + (random() - 0.5) * 40,
    y: position.y + (random() - 0.5) * 40,
    vx,
    vy,
    life: 30 + Math.floor(random() * 21),
    maxLife: 50,
    color,
    size: 1.5 + random() * 2,
    type,
  };
}

const ParticleSystemManager: React.FC<ParticleSystemManagerProps> = ({
  type,
  position = { x: 0, y: 0 },
  direction = 'up',
  count = 20,
  color: propColor,
  active = true,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const resolvedColor = propColor ?? DEFAULT_COLORS[type];

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const intervalId = setInterval(() => {
      setParticles((prev) => {
        // Update existing particles
        const updated = prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0);

        // Spawn new particles if below target count
        if (updated.length < count) {
          const newParticles: Particle[] = [];
          for (let i = 0; i < 2; i++) {
            newParticles.push(createParticle(type, position, direction, resolvedColor));
          }
          return [...updated, ...newParticles];
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(intervalId);
  }, [active, type, position, direction, count, resolvedColor]);

  if (!active || particles.length === 0) {
    return null;
  }

  return (
    <g className={`particle-system particle-system-${type}`}>
      {particles.map((p) => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.size}
          fill={p.color}
          opacity={p.life / p.maxLife}
        />
      ))}
    </g>
  );
};

export default ParticleSystemManager;
