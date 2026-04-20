# B组 - 第五轮：动态背景效果组件开发 Prompt

## 任务目标
实现9层塔主地图的动态背景效果，包括极光、星空、云层三大背景组件。

## 参考设计
参考文件：`tower_final_interactive.html` 中的CSS动画效果

## 具体任务

### Task B1: 实现极光背景组件

创建文件 `src/tower-mode/components/AuroraBackground.tsx`：

```typescript
import React from 'react';

interface AuroraBackgroundProps {
  theme?: 'green-purple' | 'blue-pink' | 'rainbow';
  intensity?: number; // 0-1
}

// CSS动画关键帧（内联样式或CSS文件）
const auroraStyles = `
  @keyframes auroraMove {
    0%, 100% { transform: translateX(-10%) translateY(-10%); }
    25% { transform: translateX(5%) translateY(5%); }
    50% { transform: translateX(10%) translateY(-5%); }
    75% { transform: translateX(-5%) translateY(10%); }
  }
  
  @keyframes auroraHue {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
  
  @keyframes auroraBreathe {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
`;

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  theme = 'green-purple',
  intensity = 0.5
}) => {
  const gradients = {
    'green-purple': 'linear-gradient(135deg, #00ff88 0%, #8b5cf6 50%, #00ff88 100%)',
    'blue-pink': 'linear-gradient(135deg, #3b82f6 0%, #ec4899 50%, #3b82f6 100%)',
    'rainbow': 'linear-gradient(135deg, #ff0000 0%, #ff7f00 15%, #ffff00 30%, #00ff00 45%, #0000ff 60%, #4b0082 75%, #9400d3 100%)'
  };

  return (
    <div style={{
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: gradients[theme],
      opacity: intensity * 0.5,
      filter: 'blur(100px)',
      animation: 'auroraMove 20s ease-in-out infinite, auroraHue 30s linear infinite, auroraBreathe 8s ease-in-out infinite',
      pointerEvents: 'none',
      zIndex: 0
    }} />
  );
};
```

### Task B2: 实现星空背景组件

创建文件 `src/tower-mode/components/StarfieldBackground.tsx`：

```typescript
import React, { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color?: string;
  twinkleDelay: number;
}

interface StarfieldBackgroundProps {
  starCount?: number;
  density?: 'low' | 'medium' | 'high';
  brightness?: number; // 0-1
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  starCount = 150,
  density = 'medium',
  brightness = 0.8
}) => {
  const stars = useMemo<Star[]>(() => {
    const count = density === 'low' ? starCount * 0.5 : 
                  density === 'high' ? starCount * 1.5 : starCount;
    
    return Array.from({ length: Math.floor(count) }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.3,
      color: Math.random() > 0.8 ? ['#a8d8ff', '#fffacd'][Math.floor(Math.random() * 2)] : undefined,
      twinkleDelay: Math.random() * 5
    }));
  }, [starCount, density]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1
    }}>
      {stars.map(star => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color || '#ffffff',
            borderRadius: '50%',
            opacity: star.opacity * brightness,
            boxShadow: `0 0 ${star.size * 2}px ${star.color || '#ffffff'}`,
            animation: `twinkle 3s ease-in-out ${star.twinkleDelay}s infinite`
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};
```

### Task B3: 实现云层背景组件

创建文件 `src/tower-mode/components/CloudLayer.tsx`：

```typescript
import React, { useMemo } from 'react';

interface Cloud {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

interface CloudLayerProps {
  cloudCount?: number;
  speed?: 'slow' | 'medium' | 'fast';
}

export const CloudLayer: React.FC<CloudLayerProps> = ({
  cloudCount = 8,
  speed = 'medium'
}) => {
  const clouds = useMemo<Cloud[]>(() => {
    const speedMultiplier = speed === 'slow' ? 1.5 : speed === 'fast' ? 0.7 : 1;
    
    return Array.from({ length: cloudCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 300 + 200,
      opacity: Math.random() * 0.1 + 0.05,
      duration: (Math.random() * 20 + 30) * speedMultiplier,
      delay: Math.random() * -30
    }));
  }, [cloudCount, speed]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 2,
      overflow: 'hidden'
    }}>
      {clouds.map(cloud => (
        <div
          key={cloud.id}
          style={{
            position: 'absolute',
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
            background: `radial-gradient(ellipse at center, rgba(255,255,255,${cloud.opacity}) 0%, transparent 70%)`,
            borderRadius: '50%',
            animation: `cloudDrift ${cloud.duration}s linear ${cloud.delay}s infinite, cloudPulse 8s ease-in-out ${cloud.delay}s infinite`,
            filter: 'blur(20px)'
          }}
        />
      ))}
      <style>{`
        @keyframes cloudDrift {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(calc(100vw + 100px)); }
        }
        @keyframes cloudPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1.2; }
        }
      `}</style>
    </div>
  );
};
```

### Task B4: 整合动态背景组件

创建文件 `src/tower-mode/components/DynamicBackground.tsx`：

```typescript
import React, { useState } from 'react';
import { AuroraBackground } from './AuroraBackground';
import { StarfieldBackground } from './StarfieldBackground';
import { CloudLayer } from './CloudLayer';

export interface BackgroundSettings {
  auroraEnabled: boolean;
  auroraTheme: 'green-purple' | 'blue-pink' | 'rainbow';
  auroraIntensity: number;
  starsEnabled: boolean;
  starDensity: 'low' | 'medium' | 'high';
  starBrightness: number;
  cloudsEnabled: boolean;
  cloudSpeed: 'slow' | 'medium' | 'fast';
}

export const defaultBackgroundSettings: BackgroundSettings = {
  auroraEnabled: true,
  auroraTheme: 'green-purple',
  auroraIntensity: 0.5,
  starsEnabled: true,
  starDensity: 'medium',
  starBrightness: 0.8,
  cloudsEnabled: true,
  cloudSpeed: 'medium'
};

interface DynamicBackgroundProps {
  settings?: BackgroundSettings;
  onSettingsChange?: (settings: BackgroundSettings) => void;
  showControls?: boolean;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  settings = defaultBackgroundSettings,
  onSettingsChange,
  showControls = false
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const updateSetting = <K extends keyof BackgroundSettings>(
    key: K,
    value: BackgroundSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f23 100%)',
        zIndex: -1
      }}>
        {localSettings.auroraEnabled && (
          <AuroraBackground 
            theme={localSettings.auroraTheme}
            intensity={localSettings.auroraIntensity}
          />
        )}
        {localSettings.starsEnabled && (
          <StarfieldBackground
            density={localSettings.starDensity}
            brightness={localSettings.starBrightness}
          />
        )}
        {localSettings.cloudsEnabled && (
          <CloudLayer
            speed={localSettings.cloudSpeed}
          />
        )}
      </div>
      
      {showControls && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.8)',
          padding: '15px',
          borderRadius: '8px',
          color: 'white',
          zIndex: 1000,
          minWidth: '200px'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>背景设置</h4>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={localSettings.auroraEnabled}
              onChange={(e) => updateSetting('auroraEnabled', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            极光效果
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={localSettings.starsEnabled}
              onChange={(e) => updateSetting('starsEnabled', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            星空效果
          </label>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={localSettings.cloudsEnabled}
              onChange={(e) => updateSetting('cloudsEnabled', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            云层效果
          </label>
        </div>
      )}
    </>
  );
};
```

## 验收标准
- [ ] 极光背景组件支持3种主题（绿紫/蓝粉/彩虹）
- [ ] 极光动画流畅（auroraMove/auroraHue/auroraBreathe）
- [ ] 星空背景组件星星数量可配置（150颗默认）
- [ ] 星星闪烁动画正常（twinkle）
- [ ] 云层背景组件云朵漂移动画正常（cloudDrift）
- [ ] 云层脉动动画正常（cloudPulse）
- [ ] 动态背景整合组件可用
- [ ] 背景设置面板功能正常
- [ ] 背景不影响前景交互（pointerEvents: none）
- [ ] TypeScript编译无错误
