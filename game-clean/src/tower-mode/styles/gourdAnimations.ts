export const GOURD_ANIMATIONS = {
  CELL: {
    PULSE: 'gourd-cell-pulse',
    CURRENT: 'gourd-cell-current',
    CLEARED: 'gourd-cell-cleared',
    LOCKED: 'gourd-cell-locked',
    PENDING: 'gourd-cell-pending',
    HOVER: 'gourd-cell-hover',
    CLICK: 'gourd-cell-click',
    ELITE_GLOW: 'gourd-cell-elite-glow',
  },
  PATH: {
    FLOW: 'gourd-path-flow',
    DASH_FLOW: 'gourd-path-dash-flow',
    APPEAR: 'gourd-path-appear',
    HIGHLIGHT: 'gourd-path-highlight',
  },
  ZONE: {
    RIPPLE: 'gourd-zone-ripple',
    SPARKLE: 'gourd-zone-sparkle',
    FLASH: 'gourd-zone-flash',
    COUNTDOWN: 'gourd-zone-countdown',
    WARNING: 'gourd-zone-warning',
  },
  BACKGROUND: {
    GRADIENT_SHIFT: 'gourd-bg-gradient-shift',
    BREATH: 'gourd-bg-breath',
    TRANSITION_IN: 'gourd-bg-transition-in',
    TRANSITION_OUT: 'gourd-bg-transition-out',
  },
} as const;

const GOURD_KEYFRAMES = `
@keyframes gourd-cell-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.9; }
}

@keyframes gourd-cell-current {
  0%, 100% { box-shadow: 0 0 8px rgba(255,215,0,0.6); }
  50% { box-shadow: 0 0 20px rgba(255,215,0,0.9); }
}

@keyframes gourd-cell-cleared {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 0.5; }
}

@keyframes gourd-cell-locked {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.35; }
}

@keyframes gourd-cell-pending {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.8; }
}

@keyframes gourd-cell-hover {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

@keyframes gourd-cell-click {
  0% { transform: scale(1); }
  50% { transform: scale(0.92); }
  100% { transform: scale(1); }
}

@keyframes gourd-cell-elite-glow {
  0%, 100% { box-shadow: 0 0 6px rgba(255,0,0,0.4); }
  50% { box-shadow: 0 0 16px rgba(255,0,0,0.8); }
}

@keyframes gourd-path-flow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -20; }
}

@keyframes gourd-path-dash-flow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -40; }
}

@keyframes gourd-path-appear {
  0% { opacity: 0; stroke-width: 0; }
  100% { opacity: 1; stroke-width: 3; }
}

@keyframes gourd-path-highlight {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes gourd-zone-ripple {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1.2); opacity: 0.3; }
}

@keyframes gourd-zone-sparkle {
  0%, 100% { opacity: 0.3; }
  25% { opacity: 0.6; }
  50% { opacity: 0.3; }
  75% { opacity: 0.5; }
}

@keyframes gourd-zone-flash {
  0% { opacity: 0; }
  50% { opacity: 0.5; }
  100% { opacity: 0.3; }
}

@keyframes gourd-zone-countdown {
  0% { opacity: 0.3; }
  80% { opacity: 0.3; }
  90% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

@keyframes gourd-zone-warning {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes gourd-bg-gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes gourd-bg-breath {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.25; }
}

@keyframes gourd-bg-transition-in {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes gourd-bg-transition-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.05); }
}
`;

let injected = false;

export function injectGourdAnimations(): void {
  if (injected) return;
  if (typeof document === 'undefined') return;

  const existingStyle = document.getElementById('gourd-animations');
  if (existingStyle) {
    injected = true;
    return;
  }

  const style = document.createElement('style');
  style.id = 'gourd-animations';
  style.textContent = GOURD_KEYFRAMES;
  document.head.appendChild(style);
  injected = true;
}
