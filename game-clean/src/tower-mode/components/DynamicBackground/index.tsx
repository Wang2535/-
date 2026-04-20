import { useState } from 'react';
import { AuroraBackground } from './AuroraBackground';
import { StarfieldBackground } from './StarfieldBackground';
import { CloudLayer } from './CloudLayer';

/**
 * 动态背景设置接口
 */
export interface BackgroundSettings {
  auroraEnabled: boolean;
  auroraTheme: 'green-purple' | 'blue-pink' | 'rainbow';
  auroraIntensity: number;      // 0-1
  starsEnabled: boolean;
  starDensity: 'low' | 'medium' | 'high';
  starBrightness: number;        // 0-1
  cloudsEnabled: boolean;
  cloudSpeed: 'slow' | 'medium' | 'fast';
}

/**
 * 默认背景设置
 */
export const defaultBackgroundSettings: BackgroundSettings = {
  auroraEnabled: true,
  auroraTheme: 'green-purple',
  auroraIntensity: 0.5,
  starsEnabled: true,
  starDensity: 'medium',
  starBrightness: 0.8,
  cloudsEnabled: true,
  cloudSpeed: 'medium',
};

/**
 * DynamicBackground 组件属性
 */
interface DynamicBackgroundProps {
  settings?: BackgroundSettings;
  onSettingsChange?: (settings: BackgroundSettings) => void;
  showControls?: boolean;
}

/**
 * 动态背景整合组件
 *
 * 整合极光、星空、云层三种背景效果，提供统一的配置接口和可选的控制面板。
 */
export function DynamicBackground({
  settings: propsSettings,
  onSettingsChange,
  showControls = false,
}: DynamicBackgroundProps) {
  const [localSettings, setLocalSettings] = useState<BackgroundSettings>(
    propsSettings || defaultBackgroundSettings
  );

  const currentSettings = propsSettings || localSettings;

  /**
   * 更新单个设置项，同时同步本地状态和回调
   */
  function updateSetting<K extends keyof BackgroundSettings>(key: K, value: BackgroundSettings[K]) {
    if (propsSettings) {
      // 外部受控模式：仅通过回调通知
      onSettingsChange?.({ ...propsSettings, [key]: value });
    } else {
      // 内部非受控模式：更新本地状态并触发回调
      const newSettings = { ...localSettings, [key]: value };
      setLocalSettings(newSettings);
      onSettingsChange?.(newSettings);
    }
  }

  return (
    <>
      {/* 背景容器 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f23 100%)',
          zIndex: -1,
          overflow: 'hidden',
        }}
      >
        {currentSettings.auroraEnabled && (
          <AuroraBackground
            theme={currentSettings.auroraTheme}
            intensity={currentSettings.auroraIntensity}
          />
        )}
        {currentSettings.starsEnabled && (
          <StarfieldBackground
            density={currentSettings.starDensity}
            brightness={currentSettings.starBrightness}
          />
        )}
        {currentSettings.cloudsEnabled && (
          <CloudLayer speed={currentSettings.cloudSpeed} />
        )}
      </div>

      {/* 控制面板 */}
      {showControls && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 8,
            color: '#fff',
            zIndex: 1000,
            minWidth: 200,
            padding: 16,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: 14,
              fontWeight: 600,
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              paddingBottom: 8,
            }}
          >
            背景设置
          </h3>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={currentSettings.auroraEnabled}
              onChange={(e) => updateSetting('auroraEnabled', e.target.checked)}
            />
            极光效果
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={currentSettings.starsEnabled}
              onChange={(e) => updateSetting('starsEnabled', e.target.checked)}
            />
            星空效果
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              marginBottom: 0,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={currentSettings.cloudsEnabled}
              onChange={(e) => updateSetting('cloudsEnabled', e.target.checked)}
            />
            云层效果
          </label>
        </div>
      )}
    </>
  );
}

// ============================================================
// 统一 re-export 所有子组件及其类型
// ============================================================

export { AuroraBackground } from './AuroraBackground';
export type { AuroraBackgroundProps } from './AuroraBackground';
export { StarfieldBackground } from './StarfieldBackground';
export type { StarfieldBackgroundProps } from './StarfieldBackground';
export { CloudLayer } from './CloudLayer';
export type { CloudLayerProps } from './CloudLayer';
