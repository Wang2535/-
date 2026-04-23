import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { LayerState } from '../../types/layerMetadata.types';
import { HOTSPOT_CONFIG, TIER_DATA } from '../../data/layerMetadata';

interface TowerMapViewProps {
  layerData?: any;
  cells?: any[];
  currentPosition?: { x: number; y: number };
  onCellClick?: (x: number, y: number) => void;
  highlightedCells?: Set<string>;
  layerStates?: Record<number, LayerState>;
  onSelectLayer?: (layerNumber: number) => void;
}

export function TowerMapView({
  layerData,
  cells,
  currentPosition,
  onCellClick,
  highlightedCells,
  layerStates,
  onSelectLayer,
}: TowerMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const cloudsLayerRef = useRef<HTMLDivElement>(null);
  const auroraLayerRef = useRef<HTMLDivElement>(null);
  const energyFlowRef = useRef<HTMLDivElement>(null);
  const hotspotsContainerRef = useRef<HTMLDivElement>(null);

  const [focusedLayer, setFocusedLayer] = useState<number | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [settings, setSettings] = useState({
    starCount: 150,
    starBrightness: 80,
    auroraIntensity: 70,
    auroraDensity: 3,
    auroraSpread: 50,
    auroraColor: 'default',
    cloudDensity: 2,
    cloudSpeed: 100,
    glowIntensity: 100,
    brightness: 100
  });

  const handleEnterFlashRef = useRef<HTMLDivElement>(null);
  const focusOverlayRef = useRef<HTMLDivElement>(null);
  const toastContainerRef = useRef<HTMLDivElement>(null);

  function isOverviewMode(props: TowerMapViewProps): props is TowerMapViewProps & {
    layerStates: Record<number, LayerState>;
    onSelectLayer: (layerNumber: number) => void;
  } {
    return !!props.layerStates && !!props.onSelectLayer;
  }

  const initStars = useCallback(() => {
    if (!starsContainerRef.current) return;
    starsContainerRef.current.innerHTML = '';

    const count = settings.starCount;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';

      const colorRand = Math.random();
      if (colorRand > 0.92) {
        star.classList.add('colored-blue');
      } else if (colorRand > 0.85) {
        star.classList.add('colored-yellow');
      }

      const size = Math.random() * 3 + 1.5;
      const maxOpacityBase = settings.starBrightness / 100;
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        --duration: ${Math.random() * 3 + 2}s;
        --max-opacity: ${(Math.random() * 0.5 + 0.5) * maxOpacityBase};
        animation-delay: ${Math.random() * 5}s;
      `;
      starsContainerRef.current.appendChild(star);
    }
  }, [settings.starCount, settings.starBrightness]);

  const renderAurora = useCallback(() => {
    if (!auroraLayerRef.current) return;
    auroraLayerRef.current.innerHTML = '';

    const density = settings.auroraDensity;
    const spread = settings.auroraSpread / 100;

    for (let i = 0; i < density; i++) {
      const aurora = document.createElement('div');
      aurora.className = `aurora ${settings.auroraColor}`;

      const baseDelay = -(i * (15 / density));
      const baseOpacity = (settings.auroraIntensity / 100) * (0.6 - i * 0.1);
      const topPosition = 5 + (i * 8 * spread) + Math.random() * 5;
      const heightValue = 20 + Math.random() * 10 * (1 + spread);

      aurora.style.cssText = `
        animation-delay: ${baseDelay}s;
        opacity: ${baseOpacity};
        top: ${topPosition}%;
        height: ${heightValue}%;
      `;
      auroraLayerRef.current.appendChild(aurora);
    }
  }, [settings.auroraDensity, settings.auroraSpread, settings.auroraIntensity, settings.auroraColor]);

  const initClouds = useCallback(() => {
    if (!cloudsLayerRef.current) return;
    cloudsLayerRef.current.innerHTML = '';

    const density = settings.cloudDensity;
    const counts = { 1: 4, 2: 8, 3: 12 };
    const cloudCount = counts[density] || 8;

    for (let i = 0; i < cloudCount; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';

      const size = 200 + Math.random() * 300;
      const baseOpacity = 0.2 + Math.random() * 0.15;
      const baseDuration = 60 + Math.random() * 40;
      const speedMultiplier = settings.cloudSpeed / 100;
      const duration = baseDuration / speedMultiplier;

      cloud.style.cssText = `
        width: ${size}px;
        height: ${size * 0.35}px;
        left: ${Math.random() * 100}%;
        top: ${50 + Math.random() * 40}%;
        --cloud-opacity: ${baseOpacity};
        --cloud-duration: ${duration}s;
        --cloud-pulse-duration: ${12 + Math.random() * 8}s;
        z-index: 5;
        animation-delay: ${-(Math.random() * duration)}s;
      `;
      cloudsLayerRef.current.appendChild(cloud);
    }
  }, [settings.cloudDensity, settings.cloudSpeed]);

  const renderEnergyFlow = useCallback(() => {
    if (!energyFlowRef.current || !layerStates) return;
    energyFlowRef.current.innerHTML = '';

    let maxUnlocked = 1;
    for (let i = 9; i >= 1; i--) {
      if (layerStates[i]?.unlocked) {
        maxUnlocked = i;
        break;
      }
    }

    for (let i = 1; i < 9; i++) {
      const configCurrent = HOTSPOT_CONFIG[i];
      const configNext = HOTSPOT_CONFIG[i + 1];
      const lineTop = configNext.bottom + configNext.height;
      const lineBottom = configCurrent.bottom;

      const line = document.createElement('div');
      line.className = `energy-line ${i >= maxUnlocked ? 'locked-segment' : ''}`;
      line.style.cssText = `
        bottom: ${lineBottom}%;
        height: ${(lineBottom - lineTop)}%;
      `;
      energyFlowRef.current.appendChild(line);
    }

    if (maxUnlocked > 1) {
      const startConfig = HOTSPOT_CONFIG[1];
      const endConfig = HOTSPOT_CONFIG[maxUnlocked];
      const startPos = startConfig.bottom + startConfig.height / 2;
      const endPos = endConfig.bottom + endConfig.height / 2;

      for (let j = 0; j < 6; j++) {
        const particle = document.createElement('div');
        particle.className = 'energy-particle';
        particle.style.setProperty('--start-pos', `${startPos}%`);
        particle.style.setProperty('--end-pos', `${endPos}%`);
        particle.style.setProperty('--rise-duration', `${2.5 + Math.random() * 2}s`);
        particle.style.setProperty('--delay', `${j * 0.6}s`);
        energyFlowRef.current.appendChild(particle);
      }
    }
  }, [layerStates]);

  const renderHotspots = useCallback(() => {
    if (!hotspotsContainerRef.current || !layerStates) return;
    hotspotsContainerRef.current.innerHTML = '';

    for (let i = 1; i <= 9; i++) {
      const data = TIER_DATA[i];
      const state = layerStates[i];
      const config = HOTSPOT_CONFIG[i];

      const hotspot = document.createElement('div');
      hotspot.className = `tier-hotspot ${state?.unlocked ? 'unlocked' : 'locked'}`;
      hotspot.dataset.tier = String(i);
      hotspot.style.setProperty('--tier-color', data.color);
      hotspot.style.setProperty('--glow-intensity', String(settings.glowIntensity / 100));

      const leftPercent = (100 - config.width) / 2;
      hotspot.style.cssText += `
        bottom: ${config.bottom}%;
        left: ${leftPercent}%;
        width: ${config.width}%;
        height: ${config.height}%;
      `;

      const tooltip = document.createElement('div');
      tooltip.className = 'hotspot-tooltip';
      tooltip.innerHTML = `<span style="color:${data.color}">●</span> L${i}. ${data.name}`;
      hotspot.appendChild(tooltip);

      if (state?.unlocked) {
        hotspot.addEventListener('click', () => zoomToTier(i));
      } else {
        hotspot.addEventListener('click', () => showLockedMessage(i));
      }

      hotspotsContainerRef.current.appendChild(hotspot);
    }

    renderEnergyFlow();
  }, [layerStates, settings.glowIntensity, renderEnergyFlow]);

  const zoomToTier = useCallback((tierNum: number) => {
    if (isZooming || isFullscreenMode) return;
    setIsZooming(true);
    setFocusedLayer(tierNum);

    if (!mapContainerRef.current) return;
    const config = HOTSPOT_CONFIG[tierNum];
    const data = TIER_DATA[tierNum];

    const targetScale = 1.6;
    const centerX = 50;
    const centerY = 100 - (config.bottom + config.height / 2);
    const tx = (50 - centerX) * targetScale;
    const ty = (50 - centerY) * targetScale;

    mapContainerRef.current.style.transform = `scale(${targetScale}) translate(${tx / targetScale}px, ${ty / targetScale}px)`;
    mapContainerRef.current.classList.add('zooming');

    setTimeout(() => {
      setIsZooming(false);
    }, 1000);
  }, [isZooming, isFullscreenMode]);

  const showLockedMessage = useCallback((tierNum: number) => {
    showToast(`🔒 第${tierNum}层尚未解锁`);
  }, []);

  const showToast = useCallback((message: string) => {
    if (!toastContainerRef.current) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainerRef.current.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 3000);
  }, []);

  const fullScreenEnter = useCallback((tierNum: number) => {
    if (!onSelectLayer) return;
    setIsFullscreenMode(true);
    
    if (handleEnterFlashRef.current) {
      handleEnterFlashRef.current.classList.add('active');
      setTimeout(() => {
        if (handleEnterFlashRef.current) {
          handleEnterFlashRef.current.classList.remove('active');
        }
        onSelectLayer(tierNum);
      }, 200);
    } else {
      onSelectLayer(tierNum);
    }
  }, [onSelectLayer]);

  const returnToMainView = useCallback(() => {
    setFocusedLayer(null);
    
    if (mapContainerRef.current) {
      mapContainerRef.current.style.transform = 'scale(1) translate(0, 0)';
      mapContainerRef.current.classList.remove('zooming');
    }
  }, []);

  useEffect(() => {
    if (isOverviewMode({ layerStates, onSelectLayer })) {
      initStars();
      renderAurora();
      initClouds();
      renderHotspots();
    }
  }, [initStars, renderAurora, initClouds, renderHotspots, layerStates, onSelectLayer]);

  if (isOverviewMode({ layerStates, onSelectLayer })) {
    return (
      <div className="tower-map-container" style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        filter: `brightness(${settings.brightness}%)`,
        transition: 'filter 0.3s ease'
      }}>
        <style>{`
          :root {
            --bg-dark: #0a0a1a;
            --glass-bg: rgba(15, 15, 35, 0.85);
            --text-primary: #ffffff;
            --text-secondary: #b0b0c8;
            --accent-gold: #FFD700;
            --success: #00ff88;
            --locked: #4a4a6a;
          }

          .tower-map-container {
            background: var(--bg-dark);
            overflow: hidden;
          }

          .bg-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            overflow: hidden;
            background: radial-gradient(ellipse at center bottom, #1a0a2e 0%, #0a0a1a 70%);
          }

          .aurora-layer {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 0;
          }

          .aurora {
            position: absolute;
            width: 300%;
            height: 25%;
            left: -100%;
            filter: blur(20px);
            transition: opacity 0.5s ease;
            border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          }

          .aurora.default {
            background:
              radial-gradient(ellipse 80% 50% at 20% 50%, rgba(0, 255, 136, 0.08) 0%, transparent 70%),
              radial-gradient(ellipse 60% 40% at 50% 40%, rgba(138, 43, 226, 0.1) 0%, transparent 60%),
              radial-gradient(ellipse 70% 45% at 80% 55%, rgba(0, 206, 209, 0.07) 0%, transparent 65%);
            animation: auroraDrift 30s linear infinite, auroraWave 15s ease-in-out infinite, auroraBreathe 12s ease-in-out infinite;
          }

          .aurora.blue-pink {
            background:
              radial-gradient(ellipse 80% 50% at 20% 50%, rgba(65, 105, 225, 0.1) 0%, transparent 70%),
              radial-gradient(ellipse 60% 40% at 50% 40%, rgba(255, 105, 180, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse 70% 45% at 80% 55%, rgba(138, 43, 226, 0.07) 0%, transparent 65%);
            animation: auroraDrift 30s linear infinite, auroraWave 15s ease-in-out infinite, auroraBreathe 12s ease-in-out infinite;
          }

          .aurora.rainbow {
            background:
              radial-gradient(ellipse 80% 50% at 15% 50%, rgba(255, 0, 0, 0.06) 0%, transparent 70%),
              radial-gradient(ellipse 60% 40% at 35% 45%, rgba(255, 165, 0, 0.07) 0%, transparent 60%),
              radial-gradient(ellipse 70% 45% at 55% 55%, rgba(0, 255, 0, 0.08) 0%, transparent 65%),
              radial-gradient(ellipse 65% 42% at 75% 48%, rgba(0, 0, 255, 0.06) 0%, transparent 60%),
              radial-gradient(ellipse 75% 48% at 90% 52%, rgba(138, 43, 226, 0.07) 0%, transparent 70%);
            animation: auroraDrift 35s linear infinite, auroraWave 18s ease-in-out infinite, auroraBreathe 10s ease-in-out infinite;
          }

          .aurora.off {
            display: none;
          }

          @keyframes auroraDrift {
            0% { transform: translateX(-33%); }
            100% { transform: translateX(33%); }
          }

          @keyframes auroraWave {
            0%, 100% { 
              border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
              transform: translateX(-33%) scaleY(1);
            }
            25% { 
              border-radius: 45% 55% 55% 45% / 55% 65% 35% 45%;
              transform: translateX(-25%) scaleY(1.1);
            }
            50% { 
              border-radius: 55% 45% 45% 55% / 65% 55% 45% 35%;
              transform: translateX(0%) scaleY(0.95);
            }
            75% { 
              border-radius: 48% 52% 52% 48% / 58% 62% 38% 42%;
              transform: translateX(25%) scaleY(1.05);
            }
          }

          @keyframes auroraBreathe {
            0%, 100% { opacity: ${settings.auroraIntensity / 100}; }
            50% { opacity: calc(${settings.auroraIntensity / 100} * 1.2); }
          }

          .clouds-layer {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 5;
          }

          .cloud {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(ellipse at center, rgba(220, 230, 255, var(--cloud-opacity, 0.35)) 0%, rgba(180, 190, 240, calc(var(--cloud-opacity, 0.35) * 0.6)) 30%, rgba(140, 150, 200, calc(var(--cloud-opacity, 0.35) * 0.3)) 60%, transparent 80%);
            box-shadow: 
              0 0 60px 20px rgba(200, 210, 255, calc(var(--cloud-opacity, 0.35) * 0.5)),
              0 0 100px 40px rgba(180, 190, 240, calc(var(--cloud-opacity, 0.35) * 0.3)),
              inset 0 0 40px 10px rgba(255, 255, 255, calc(var(--cloud-opacity, 0.35) * 0.2));
            animation: cloudDrift var(--cloud-duration, 60s) ease-in-out infinite, cloudPulse var(--cloud-pulse-duration, 12s) ease-in-out infinite;
            will-change: transform, opacity;
            filter: blur(8px);
          }

          @keyframes cloudDrift {
            0% { transform: translateX(-40%) translateY(0) scale(1); }
            25% { transform: translateX(-10%) translateY(-20px) scale(1.08); }
            50% { transform: translateX(20%) translateY(-10px) scale(0.95); }
            75% { transform: translateX(0%) translateY(-25px) scale(1.05); }
            100% { transform: translateX(-40%) translateY(0) scale(1); }
          }

          @keyframes cloudPulse {
            0%, 100% { opacity: var(--cloud-opacity, 0.35); transform: scale(1); }
            50% { opacity: calc(var(--cloud-opacity, 0.35) * 1.4); transform: scale(1.12); }
          }

          .stars {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 0;
          }

          .star {
            position: absolute;
            background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 40%, transparent 70%);
            border-radius: 50%;
            box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.6), 0 0 8px 2px rgba(255, 255, 255, 0.3);
            animation: twinkle var(--duration) ease-in-out infinite;
            opacity: 0;
            will-change: opacity, transform;
          }

          .star.colored-blue {
            background: radial-gradient(circle, rgba(135, 206, 250, 1) 0%, rgba(135, 206, 250, 0.6) 40%, transparent 70%);
            box-shadow: 0 0 4px 1px rgba(135, 206, 250, 0.6), 0 0 8px 2px rgba(135, 206, 250, 0.3);
          }

          .star.colored-yellow {
            background: radial-gradient(circle, rgba(255, 255, 200, 1) 0%, rgba(255, 255, 200, 0.6) 40%, transparent 70%);
            box-shadow: 0 0 4px 1px rgba(255, 255, 200, 0.6), 0 0 8px 2px rgba(255, 255, 200, 0.3);
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.6); }
            50% { opacity: var(--max-opacity); transform: scale(1); }
          }

          .map-container {
            position: relative;
            max-width: 900px;
            width: 100%;
            transform-origin: center center;
            transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
            will-change: transform;
            opacity: 0.7;
          }

          .map-container.zooming {
            z-index: 100;
          }

          #towerMap {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 12px;
            box-shadow: 0 0 60px rgba(138, 43, 226, 0.2);
            transition: box-shadow 0.5s ease;
          }

          .tier-hotspot {
            position: absolute;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            border-radius: 8px;
            z-index: 10;
            overflow: visible;
          }

          .tier-hotspot::before {
            content: '';
            position: absolute;
            inset: -3px;
            border-radius: 10px;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            pointer-events: none;
          }

          .tier-hotspot.unlocked:hover::before {
            border-color: var(--tier-color);
            box-shadow: 0 0 calc(25px * var(--glow-intensity)) var(--tier-color), inset 0 0 calc(20px * var(--glow-intensity)) rgba(255, 255, 255, 0.05);
          }

          .tier-hotspot.unlocked:hover {
            transform: scale(1.05);
            z-index: 20;
          }

          .tier-hotspot.locked {
            background: rgba(74, 74, 106, 0.4);
            cursor: not-allowed;
          }

          .tier-hotspot.locked::after {
            content: '🔒';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20px;
            opacity: 0.6;
            animation: pulse-lock 2s ease-in-out infinite;
          }

          @keyframes pulse-lock {
            0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
          }

          .hotspot-tooltip {
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%) translateY(5px);
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.25s ease;
            border: 1px solid rgba(255, 255, 255, 0.15);
            pointer-events: none;
            z-index: 100;
          }

          .tier-hotspot:hover .hotspot-tooltip {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
          }

          .energy-flow {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 100%;
            pointer-events: none;
            z-index: 5;
          }

          .energy-particle {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--accent-gold);
            box-shadow: 0 0 12px var(--accent-gold), 0 0 24px var(--accent-gold);
            animation: energyRise var(--rise-duration) linear infinite;
            animation-delay: var(--delay);
            opacity: 0;
          }

          @keyframes energyRise {
            0% { bottom: var(--start-pos); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { bottom: var(--end-pos); opacity: 0; }
          }

          .energy-line {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 2px;
            background: repeating-linear-gradient(to top, rgba(255, 215, 0, 0.4) 0px, rgba(255, 215, 0, 0.4) 8px, transparent 8px, transparent 16px);
          }

          .energy-line.locked-segment {
            background: repeating-linear-gradient(to top, rgba(74, 74, 106, 0.3) 0px, rgba(74, 74, 106, 0.3) 8px, transparent 8px, transparent 16px);
          }

          .enter-flash {
            position: fixed;
            inset: 0;
            background: white;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.15s ease;
          }

          .enter-flash.active {
            opacity: 1;
          }

          .focus-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(4px);
            z-index: 500;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.35s ease, visibility 0.35s ease;
          }

          .focus-overlay.active {
            opacity: 1;
            visibility: visible;
          }

          .focus-content {
            text-align: center;
            padding: 48px 60px;
            background: linear-gradient(145deg, rgba(21, 21, 48, 0.95), rgba(13, 13, 34, 0.95));
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
            transform: scale(0.9) translateY(20px);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            max-width: 480px;
          }

          .focus-overlay.active .focus-content {
            transform: scale(1) translateY(0);
          }

          .focus-tier-label {
            font-size: 56px;
            font-weight: 800;
            margin-bottom: 12px;
            text-shadow: 0 0 30px currentColor, 0 2px 10px rgba(0, 0, 0, 0.5);
            letter-spacing: 2px;
          }

          .focus-tier-name {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          }

          .focus-tier-theme {
            font-size: 16px;
            color: var(--text-secondary);
            margin-bottom: 36px;
            text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
          }

          .focus-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
          }

          .btn-focus-enter {
            padding: 16px 32px;
            border: none;
            border-radius: 14px;
            font-size: 17px;
            font-weight: 700;
            cursor: pointer;
            background: linear-gradient(135deg, #00cc6a, #00ff88);
            color: #001a0d;
            box-shadow: 0 4px 24px rgba(0, 255, 136, 0.35);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .btn-focus-enter:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 32px rgba(0, 255, 136, 0.5);
          }

          .btn-focus-return {
            padding: 16px 32px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 14px;
            font-size: 17px;
            font-weight: 600;
            cursor: pointer;
            background: transparent;
            color: var(--text-primary);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .btn-focus-return:hover {
            border-color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.05);
            transform: translateY(-3px);
          }

          .toast-container {
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
          }

          .toast {
            background: linear-gradient(135deg, #1a1a3e, #12122a);
            border: 1px solid var(--accent-gold);
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            color: var(--accent-gold);
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.25);
            animation: toastIn 0.4s ease forwards, toastOut 0.4s ease 2.6s forwards;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          @keyframes toastIn {
            from { opacity: 0; transform: translateY(-20px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @keyframes toastOut {
            from { opacity: 1; transform: translateY(0) scale(1); }
            to { opacity: 0; transform: translateY(-10px) scale(0.95); }
          }

          .settings-btn {
            position: fixed;
            right: 24px;
            bottom: 24px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: none;
            background: rgba(15, 15, 35, 0.85);
            backdrop-filter: blur(20px);
            color: var(--text-primary);
            font-size: 24px;
            cursor: pointer;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
          }

          .settings-btn:hover {
            transform: scale(1.1);
            background: rgba(25, 25, 55, 0.95);
            box-shadow: 0 6px 28px rgba(0, 0, 0, 0.4);
          }

          .settings-panel {
            position: fixed;
            right: 0;
            bottom: 84px;
            width: 300px;
            max-height: calc(100vh - 120px);
            background: rgba(15, 15, 35, 0.92);
            backdrop-filter: blur(20px);
            border-radius: 16px 0 0 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-right: none;
            z-index: 2001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            overflow-y: auto;
            box-shadow: -8px 0 32px rgba(0, 0, 0, 0.3);
          }

          .settings-panel.open {
            transform: translateX(0);
          }

          .settings-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 20px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .settings-header h3 {
            font-size: 16px;
            font-weight: 700;
            color: var(--accent-gold);
          }

          .settings-close {
            width: 32px;
            height: 32px;
            border: none;
            background: rgba(255, 255, 255, 0.06);
            color: var(--text-secondary);
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .settings-close:hover {
            background: rgba(255, 255, 255, 0.15);
            color: white;
          }

          .settings-body {
            padding: 16px 20px;
          }

          .setting-item {
            margin-bottom: 18px;
          }

          .setting-item label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 8px;
          }

          .setting-item input[type="range"] {
            width: calc(100% - 48px);
            height: 6px;
            -webkit-appearance: none;
            appearance: none;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            outline: none;
            vertical-align: middle;
          }

          .setting-item input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #00cc6a, #00ff88);
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 255, 136, 0.4);
            transition: transform 0.2s;
          }

          .setting-item input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.15);
          }

          .setting-value {
            display: inline-block;
            width: 44px;
            text-align: right;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            vertical-align: middle;
            margin-left: 4px;
          }

          .main-area {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            padding: 20px;
          }
        `}</style>

        <div className="bg-layer">
          <div className="aurora-layer" ref={auroraLayerRef} />
          <div className="stars" ref={starsContainerRef} />
          <div className="clouds-layer" ref={cloudsLayerRef} />
        </div>

        <div className="enter-flash" ref={handleEnterFlashRef} />

        <div className="toast-container" ref={toastContainerRef} />

        {focusedLayer && (
          <div className="focus-overlay active" ref={focusOverlayRef}>
            <div className="focus-content">
              <div className="focus-tier-label" style={{ color: TIER_DATA[focusedLayer].color }}>
                L{focusedLayer}
              </div>
              <div className="focus-tier-name" style={{ color: TIER_DATA[focusedLayer].color }}>
                {TIER_DATA[focusedLayer].name}
              </div>
              <div className="focus-tier-theme">
                {TIER_DATA[focusedLayer].theme}
              </div>

              <div className="focus-buttons">
                <button 
                  className="btn-focus-enter" 
                  onClick={() => fullScreenEnter(focusedLayer)}
                >
                  🚀 进入本层
                </button>
                <button 
                  className="btn-focus-return" 
                  onClick={returnToMainView}
                >
                  ↩ 返回
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="main-area">
          <div className="map-container" ref={mapContainerRef} style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src="/tower-map.png" id="towerMap" alt="9层网络安全塔" style={{ display: 'block', maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />

            <div className="energy-flow" ref={energyFlowRef} style={{ zIndex: 2 }} />

            <div ref={hotspotsContainerRef} style={{ zIndex: 3 }} />
          </div>
        </div>

        <button className="settings-btn" onClick={() => setSettingsOpen(!settingsOpen)}>
          ⚙️
        </button>

        <div className={`settings-panel ${settingsOpen ? 'open' : ''}`}>
          <div className="settings-header">
            <h3>✨ 视效设置</h3>
            <button className="settings-close" onClick={() => setSettingsOpen(false)}>×</button>
          </div>

          <div className="settings-body">
            <div className="setting-item">
              <label>🌟 星空密度</label>
              <input 
                type="range" 
                min="50" 
                max="300" 
                value={settings.starCount}
                onChange={(e) => setSettings({ ...settings, starCount: parseInt(e.target.value) })}
              />
              <span className="setting-value">{settings.starCount}</span>
            </div>
            <div className="setting-item">
              <label>✨ 星星闪烁亮度</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={settings.starBrightness}
                onChange={(e) => setSettings({ ...settings, starBrightness: parseInt(e.target.value) })}
              />
              <span className="setting-value">{settings.starBrightness}%</span>
            </div>
            <div className="setting-item">
              <label>� 星空密度</label>
              <input 
                type="range" 
                min="50" 
                max="300" 
                value={settings.starCount}
                onChange={(e) => setSettings({ ...settings, starCount: parseInt(e.target.value) })}
              />
              <span className="setting-value">{settings.starCount}</span>
            </div>
            <div className="setting-item">
              <label>✨ 星星闪烁亮度</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={settings.starBrightness}
                onChange={(e) => setSettings({ ...settings, starBrightness: parseInt(e.target.value) })}
              />
              <span className="setting-value">{settings.starBrightness}%</span>
            </div>
            <div className="setting-item">
              <label>🌌 极光强度</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={settings.auroraIntensity}
                onChange={(e) => setSettings({ ...settings, auroraIntensity: parseInt(e.target.value) })}
              />
              <span className="setting-value">{settings.auroraIntensity}%</span>
            </div>
            <div className="setting-item">
              <label>🌠 极光密度</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                step="1"
                value={settings.auroraDensity}
                onChange={(e) => setSettings({ ...settings, auroraDensity: parseInt(e.target.value) })}
              />
              <span className="setting-value">{settings.auroraDensity}</span>
            </div>
            <div className="setting-item">
              <label>🌫️ 极光松散度</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={settings.auroraSpread}
                onChange={(e) => setSettings({ ...settings, auroraSpread: parseInt(e.target.value) })}
              />
              <span className="setting-value">{settings.auroraSpread}%</span>
            </div>
            <div className="setting-item">
              <label>🎨 极光色彩</label>
              <select 
                value={settings.auroraColor}
                onChange={(e) => setSettings({ ...settings, auroraColor: e.target.value })}
              >
                <option value="default">绿紫渐变</option>
                <option value="blue-pink">蓝粉渐变</option>
                <option value="rainbow">彩虹色</option>
                <option value="off">关闭</option>
              </select>
            </div>
            <div className="setting-item">
              <label>☁️ 云朵密度</label>
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="1"
                value={settings.cloudDensity}
                onChange={(e) => setSettings({ ...settings, cloudDensity: parseInt(e.target.value) })}
              />
              <span className="setting-value">{settings.cloudDensity === 1 ? '低' : settings.cloudDensity === 2 ? '中' : '高'}</span>
            </div>
            <div className="setting-item">
              <label>💨 云朵速度</label>
              <input 
                type="range" 
                min="20" 
                max="200" 
                value={settings.cloudSpeed}
                onChange={(e) => setSettings({ ...settings, cloudSpeed: parseInt(e.target.value) })}
              />
              <span className="setting-value">{settings.cloudSpeed}%</span>
            </div>
            <div className="setting-item">
              <label>🔆 层级发光</label>
              <input 
                type="range" 
                min="0" 
                max="200" 
                value={settings.glowIntensity}
                onChange={(e) => setSettings({ ...settings, glowIntensity: parseInt(e.target.value) })}
              />
              <span className="setting-value">{settings.glowIntensity}%</span>
            </div>
            <div className="setting-item">
              <label>💡 整体亮度</label>
              <input 
                type="range" 
                min="50" 
                max="150" 
                value={settings.brightness}
                onChange={(e) => setSettings({ ...settings, brightness: parseInt(e.target.value) })}
              />
              <span className="setting-value">{settings.brightness}%</span>
            </div>
          </div>

          <button 
            className="btn-reset-settings" 
            style={{
              width: 'calc(100% - 40px)',
              margin: '16px 20px 20px',
              padding: '12px',
              border: '1px solid rgba(255, 107, 107, 0.4)',
              borderRadius: '10px',
              background: 'rgba(255, 107, 107, 0.08)',
              color: '#ff6b6b',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setSettings({
              starCount: 150,
              starBrightness: 80,
              auroraIntensity: 70,
              auroraDensity: 3,
              auroraSpread: 50,
              auroraColor: 'default',
              cloudDensity: 2,
              cloudSpeed: 100,
              glowIntensity: 100,
              brightness: 100
            })}
          >
            重置为默认
          </button>
        </div>
      </div>
    );
  }

  if (!layerData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: '#8888aa',
        fontSize: '1.2rem',
      }}>
        等待地图数据加载...
      </div>
    );
  }

  return null;
}
