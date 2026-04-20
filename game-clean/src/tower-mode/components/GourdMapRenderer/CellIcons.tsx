import React from 'react';

const VIEWBOX = '0 0 24 24';

export function CombatIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 19L19 5" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 19L5 5" stroke="#888" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 3L19 5L17 7" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17L5 19L3 21" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17L19 19L17 21" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3L5 5L3 7" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.5" fill="#ddd" />
    </svg>
  );
}

export function EliteIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="13" r="5" fill="#e53" stroke="#f80" strokeWidth="1.5" />
      <circle cx="10" cy="12" r="1.2" fill="#fff" />
      <circle cx="14" cy="12" r="1.2" fill="#fff" />
      <circle cx="10" cy="12" r="0.6" fill="#222" />
      <circle cx="14" cy="12" r="0.6" fill="#222" />
      <path d="M10 15.5Q12 17 14 15.5" stroke="#fff" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M8 7C8 5 9 3 12 3C15 3 16 5 16 7" stroke="#f80" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M7 5C7 2 9 0 12 0C15 0 17 2 17 5" stroke="#e53" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M9 8L7 6" stroke="#f80" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15 8L17 6" stroke="#f80" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ChanceIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C8 3 5 6 5 10C5 16 12 21 12 21C12 21 19 16 19 10C19 6 16 3 12 3Z" fill="#93f" stroke="#fc0" strokeWidth="1.2" />
      <text x="12" y="13.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fc0" fontFamily="sans-serif">?</text>
    </svg>
  );
}

export function BookshopIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6C4 6 7 4 12 4C17 4 20 6 20 6V18C20 18 17 16 12 16C7 16 4 18 4 18V6Z" fill="#f5e" stroke="#864" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="12" y1="4" x2="12" y2="16" stroke="#864" strokeWidth="1.2" />
      <line x1="7" y1="8" x2="10" y2="8" stroke="#864" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="7" y1="10" x2="10" y2="10" stroke="#864" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="7" y1="12" x2="10" y2="12" stroke="#864" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="14" y1="8" x2="17" y2="8" stroke="#864" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="14" y1="10" x2="17" y2="10" stroke="#864" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="14" y1="12" x2="17" y2="12" stroke="#864" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

export function SkillIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="#38f" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5" stroke="#3cf" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.5" fill="#3cf" />
      <circle cx="12" cy="12" r="1" fill="#fff" />
      <line x1="12" y1="2" x2="12" y2="5" stroke="#38f" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="#38f" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2" y1="12" x2="5" y2="12" stroke="#38f" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19" y1="12" x2="22" y2="12" stroke="#38f" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function BossIcon({ size = 16, isUltimate = false }: { size?: number; isUltimate?: boolean }): React.ReactElement {
  if (isUltimate) {
    return (
      <svg width={size} height={size} viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12,2 14.5,8 21,8 15.5,12 17.5,19 12,15 6.5,19 8.5,12 3,8 9.5,8" fill="#fd0" stroke="#fa0" strokeWidth="0.8" strokeLinejoin="round" />
        <circle cx="12" cy="11" r="2" fill="#fff" opacity="0.7" />
        <circle cx="12" cy="11" r="0.8" fill="#f60" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16V9L7 12L12 5L17 12L20 9V16H4Z" fill="#fd0" stroke="#fa0" strokeWidth="1" strokeLinejoin="round" />
      <rect x="4" y="16" width="16" height="2.5" rx="1" fill="#fd0" stroke="#fa0" strokeWidth="0.8" />
      <circle cx="7.5" cy="11" r="1" fill="#fff" opacity="0.5" />
      <circle cx="12" cy="8.5" r="1" fill="#fff" opacity="0.5" />
      <circle cx="16.5" cy="11" r="1" fill="#fff" opacity="0.5" />
    </svg>
  );
}

export function StartIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox={VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="6" y1="4" x2="6" y2="20" stroke="#5a5" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 4L18 8L6 12" fill="#3c3" stroke="#5a5" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="6" cy="20" r="1.5" fill="#5a5" />
    </svg>
  );
}

const ICON_MAP: Record<string, (props: { size?: number }) => React.ReactElement> = {
  combat: CombatIcon,
  battle: CombatIcon,
  level: CombatIcon,
  elite: EliteIcon,
  chance: ChanceIcon,
  opportunity: ChanceIcon,
  bookshop: BookshopIcon,
  bookstore: BookshopIcon,
  skill: SkillIcon,
  boss: BossIcon,
  start: StartIcon,
};

export function renderCellIcon(
  cellType: string,
  size = 16,
  isUltimateBoss = false,
): React.ReactElement | null {
  const type = cellType.toLowerCase();

  if (type === 'boss') {
    return <BossIcon size={size} isUltimate={isUltimateBoss} />;
  }

  const IconComponent = ICON_MAP[type];
  if (!IconComponent) return null;

  return <IconComponent size={size} />;
}
