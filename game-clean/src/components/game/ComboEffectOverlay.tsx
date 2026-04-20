/**
 * 连击效果覆盖层组件
 * 
 * 功能：
 * 1. 显示连击激活的金边特效
 * 2. 支持闪烁动画（1秒1闪）
 * 3. 在卡牌选中和未选中状态下均保持可见
 * 4. 高视觉辨识度
 */

import React from 'react';

interface ComboEffectOverlayProps {
  /** 是否激活 */
  isActive: boolean;
  /** 连击加成值 */
  bonus?: number;
  /** 连击描述 */
  description?: string;
  /** 卡牌尺寸 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 连击效果覆盖层
 */
export const ComboEffectOverlay: React.FC<ComboEffectOverlayProps> = ({
  isActive,
  bonus = 0.5,
  description = '连击效果激活',
  size = 'md',
}) => {
  if (!isActive) return null;

  const sizeClasses = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4',
  };

  return (
    <>
      {/* 金边闪烁效果 */}
      <div
        className={`absolute inset-0 rounded-lg pointer-events-none combo-gold-border ${sizeClasses[size]}`}
        style={{
          border: '3px solid transparent',
          background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700, #FFA500) border-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          animation: 'comboPulse 1s ease-in-out infinite',
        }}
      />

      {/* 外发光效果 */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none combo-glow"
        style={{
          boxShadow: '0 0 20px 5px rgba(255, 215, 0, 0.6), 0 0 40px 10px rgba(255, 165, 0, 0.3)',
          animation: 'comboGlow 1s ease-in-out infinite',
        }}
      />

      {/* 连击标识 */}
      <div
        className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg pointer-events-none combo-badge"
      >
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          +{bonus}
        </span>
      </div>

      {/* 连击提示文字 */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-500/90 to-transparent text-slate-900 text-[10px] font-bold text-center py-1 px-2 rounded-b-lg pointer-events-none combo-text"
      >
        {description}
      </div>

      {/* CSS动画样式 */}
      <style>{`
        @keyframes comboPulse {
          0%, 100% {
            opacity: 0.8;
            filter: brightness(1);
          }
          50% {
            opacity: 1;
            filter: brightness(1.3);
          }
        }
        
        @keyframes comboGlow {
          0%, 100% {
            box-shadow: 0 0 20px 5px rgba(255, 215, 0, 0.6), 0 0 40px 10px rgba(255, 165, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 30px 8px rgba(255, 215, 0, 0.9), 0 0 60px 15px rgba(255, 165, 0, 0.6);
          }
        }
        
        @keyframes comboBadgePop {
          0% {
            transform: scale(0) rotate(-180deg);
          }
          70% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes comboTextSlide {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .combo-badge {
          animation: comboBadgePop 0.5s ease-out forwards;
        }
        
        .combo-text {
          animation: comboTextSlide 0.3s ease-out 0.2s forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
};

export default ComboEffectOverlay;
