import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Zap,
  Sparkles,
  Shield,
  Sword,
  Heart,
  Brain,
  Target,
  RefreshCw,
  Star,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export type SkillType = 'attack' | 'defense' | 'buff' | 'debuff' | 'heal' | 'utility' | 'special';

export interface SkillEffect {
  id: string;
  type: 'resource' | 'status' | 'card' | 'area';
  target: 'self' | 'ally' | 'enemy' | 'all';
  value?: number;
  description: string;
}

export interface SkillVisualizerProps {
  isVisible: boolean;
  skillName: string;
  skillDescription: string;
  skillType: SkillType;
  skillIcon?: string;
  actor?: 'player' | 'dadong' | 'enemy';
  effects?: SkillEffect[];
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

const SKILL_CONFIG: Record<SkillType, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  title: string;
}> = {
  attack: {
    icon: <Sword className="w-6 h-6" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/50',
    glowColor: 'shadow-red-500/30',
    title: '攻击技能'
  },
  defense: {
    icon: <Shield className="w-6 h-6" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    glowColor: 'shadow-blue-500/30',
    title: '防御技能'
  },
  buff: {
    icon: <Sparkles className="w-6 h-6" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
    glowColor: 'shadow-emerald-500/30',
    title: '增益技能'
  },
  debuff: {
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    glowColor: 'shadow-orange-500/30',
    title: '减益技能'
  },
  heal: {
    icon: <Heart className="w-6 h-6" />,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50',
    glowColor: 'shadow-pink-500/30',
    title: '治疗技能'
  },
  utility: {
    icon: <Brain className="w-6 h-6" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/30',
    title: '实用技能'
  },
  special: {
    icon: <Star className="w-6 h-6" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    glowColor: 'shadow-yellow-500/30',
    title: '特殊技能'
  }
};

const ACTOR_CONFIG = {
  player: { name: '小白', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: '🧑‍💻' },
  dadong: { name: '大东', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', icon: '🤖' },
  enemy: { name: '敌人', color: 'text-rose-400', bgColor: 'bg-rose-500/20', icon: '👹' }
};

export function SkillVisualizer({
  isVisible,
  skillName,
  skillDescription,
  skillType,
  skillIcon,
  actor = 'player',
  effects = [],
  duration = 3000,
  onComplete,
  className
}: SkillVisualizerProps) {
  const [animationPhase, setAnimationPhase] = useState<'start' | 'active' | 'end'>('start');
  const [currentEffectIndex, setCurrentEffectIndex] = useState(0);

  const config = SKILL_CONFIG[skillType];
  const actorConfig = ACTOR_CONFIG[actor];

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('start');
      setCurrentEffectIndex(0);

      const startTimer = setTimeout(() => {
        setAnimationPhase('active');
      }, 300);

      const effectTimers: ReturnType<typeof setTimeout>[] = [];
      effects.forEach((_, index) => {
        const timer = setTimeout(() => {
          setCurrentEffectIndex(index);
        }, 300 + index * 400);
        effectTimers.push(timer);
      });

      const endTimer = setTimeout(() => {
        setAnimationPhase('end');
      }, duration - 500);

      const completeTimer = setTimeout(() => {
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
        clearTimeout(completeTimer);
        effectTimers.forEach(clearTimeout);
      };
    }
  }, [isVisible, duration, effects.length, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center pointer-events-none',
      className
    )}>
      {/* 背景光晕 */}
      <div className={cn(
        'absolute inset-0 flex items-center justify-center',
        animationPhase === 'active' && 'animate-pulse'
      )}>
        <div className={cn(
          'w-96 h-96 rounded-full blur-3xl opacity-30',
          config.bgColor.replace('/20', '/40')
        )} />
      </div>

      <div className={cn(
        'relative w-full max-w-md mx-4',
        'transition-all duration-500',
        animationPhase === 'start' && 'scale-75 opacity-0',
        animationPhase === 'active' && 'scale-100 opacity-100',
        animationPhase === 'end' && 'scale-125 opacity-0'
      )}>
        {/* 主面板 */}
        <div className={cn(
          'relative bg-slate-900/95 rounded-2xl border-2 backdrop-blur-xl',
          'shadow-2xl overflow-hidden',
          config.borderColor,
          config.glowColor
        )}>
          {/* 顶部装饰条 */}
          <div className={cn(
            'absolute top-0 left-0 right-0 h-2',
            'bg-gradient-to-r',
            skillType === 'attack' ? 'from-red-500 to-orange-500' :
            skillType === 'defense' ? 'from-blue-500 to-cyan-500' :
            skillType === 'buff' ? 'from-emerald-500 to-teal-500' :
            skillType === 'debuff' ? 'from-orange-500 to-yellow-500' :
            skillType === 'heal' ? 'from-pink-500 to-rose-500' :
            skillType === 'utility' ? 'from-purple-500 to-pink-500' :
            'from-yellow-500 to-orange-500'
          )} />

          {/* 内容区域 */}
          <div className="p-6">
            {/* 头部信息 */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                {/* 行动者 */}
                <div className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full',
                  actorConfig.bgColor,
                  'border border-opacity-30',
                  config.borderColor
                )}>
                  <span className="text-2xl">{actorConfig.icon}</span>
                  <span className={cn('text-sm font-bold', actorConfig.color)}>
                    {actorConfig.name}
                  </span>
                </div>

                {/* 技能类型 */}
                <div className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full',
                  config.bgColor,
                  'border',
                  config.borderColor
                )}>
                  <span className={config.color}>{config.icon}</span>
                  <span className={cn('text-sm font-bold', config.color)}>
                    {config.title}
                  </span>
                </div>
              </div>

              {/* 技能名称和图标 */}
              <div className="flex items-center justify-center gap-3 mb-2">
                {skillIcon && (
                  <div className={cn(
                    'text-5xl',
                    animationPhase === 'active' && 'animate-bounce'
                  )}>
                    {skillIcon}
                  </div>
                )}
                {!skillIcon && (
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center',
                    config.bgColor,
                    'border-2',
                    config.borderColor,
                    'shadow-lg',
                    animationPhase === 'active' && 'animate-pulse'
                  )}>
                    <span className={cn('text-3xl', config.color)}>
                      {config.icon}
                    </span>
                  </div>
                )}
                <h2 className={cn(
                  'text-2xl font-bold',
                  config.color,
                  animationPhase === 'active' && 'animate-pulse'
                )}>
                  {skillName}
                </h2>
              </div>

              {/* 技能描述 */}
              <p className="text-sm text-slate-400 leading-relaxed">
                {skillDescription}
              </p>
            </div>

            {/* 特效展示 */}
            {effects.length > 0 && (
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    技能效果
                  </span>
                </div>
                <div className="space-y-2">
                  {effects.map((effect, index) => (
                    <div
                      key={effect.id}
                      className={cn(
                        'relative p-3 rounded-lg border transition-all duration-300',
                        index <= currentEffectIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4',
                        config.bgColor,
                        config.borderColor
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {effect.type === 'resource' && <Zap className="w-4 h-4 text-yellow-400" />}
                          {effect.type === 'status' && <RefreshCw className="w-4 h-4 text-blue-400" />}
                          {effect.type === 'card' && <Sparkles className="w-4 h-4 text-purple-400" />}
                          {effect.type === 'area' && <Target className="w-4 h-4 text-red-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-400 uppercase tracking-wider">
                              {effect.type === 'resource' && '资源'}
                              {effect.type === 'status' && '状态'}
                              {effect.type === 'card' && '卡牌'}
                              {effect.type === 'area' && '区域'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {effect.target === 'self' && '自身'}
                              {effect.target === 'ally' && '队友'}
                              {effect.target === 'enemy' && '敌人'}
                              {effect.target === 'all' && '全体'}
                            </span>
                            {effect.value && (
                              <span className={cn(
                                'text-xs font-bold font-mono',
                                effect.value > 0 ? 'text-green-400' : 'text-red-400'
                              )}>
                                {effect.value > 0 ? '+' : ''}{effect.value}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300">
                            {effect.description}
                          </p>
                        </div>
                        {index === currentEffectIndex && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          </div>
                        )}
                        {index < currentEffectIndex && (
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 状态提示 */}
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2">
                <RefreshCw className={cn(
                  'w-4 h-4 animate-spin',
                  config.color
                )} />
                <span className="text-sm text-slate-400">
                  {animationPhase === 'start' && '准备释放...'}
                  {animationPhase === 'active' && '技能释放中...'}
                  {animationPhase === 'end' && '技能完成!'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 装饰效果 */}
        <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full blur-2xl opacity-20"
             style={{ backgroundColor: skillType === 'attack' ? '#ef4444' :
                              skillType === 'defense' ? '#3b82f6' :
                              skillType === 'buff' ? '#22c55e' :
                              skillType === 'debuff' ? '#f97316' :
                              skillType === 'heal' ? '#ec4899' :
                              skillType === 'utility' ? '#a855f7' : '#eab308' }} />
        <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20"
             style={{ backgroundColor: skillType === 'attack' ? '#f97316' :
                              skillType === 'defense' ? '#06b6d4' :
                              skillType === 'buff' ? '#14b8a6' :
                              skillType === 'debuff' ? '#eab308' :
                              skillType === 'heal' ? '#f43f5e' :
                              skillType === 'utility' ? '#d946ef' : '#f59e0b' }} />
      </div>
    </div>
  );
}

// 技能效果展示 Hook
export function useSkillVisualizer() {
  const [currentSkill, setCurrentSkill] = useState<{
    isVisible: boolean;
    skillName: string;
    skillDescription: string;
    skillType: SkillType;
    skillIcon?: string;
    actor?: 'player' | 'dadong' | 'enemy';
    effects?: SkillEffect[];
  } | null>(null);

  const showSkill = (
    skillName: string,
    skillDescription: string,
    skillType: SkillType,
    options?: {
      skillIcon?: string;
      actor?: 'player' | 'dadong' | 'enemy';
      effects?: SkillEffect[];
      duration?: number;
      onComplete?: () => void;
    }
  ) => {
    setCurrentSkill({
      isVisible: true,
      skillName,
      skillDescription,
      skillType,
      skillIcon: options?.skillIcon,
      actor: options?.actor,
      effects: options?.effects
    });
  };

  const hideSkill = () => {
    setCurrentSkill(null);
  };

  return {
    currentSkill,
    showSkill,
    hideSkill
  };
}

export default SkillVisualizer;
