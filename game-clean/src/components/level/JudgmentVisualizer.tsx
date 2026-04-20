import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Scale,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  RefreshCw,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface JudgmentVisualizerProps {
  isVisible: boolean;
  type: 'dice' | 'rps';
  phase: 'judgment' | 'response';
  title: string;
  description?: string;
  difficulty?: number;
  cardName?: string;
  cardIcon?: string;
  onComplete?: (success: boolean, isCritical?: boolean) => void;
  className?: string;
}

export function JudgmentVisualizer({
  isVisible,
  type,
  phase,
  title,
  description,
  difficulty = 3,
  cardName,
  cardIcon,
  onComplete,
  className
}: JudgmentVisualizerProps) {
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // 先显示卡牌，然后翻牌，然后开始滚动
      setShowCard(true);
      setTimeout(() => {
        setCardFlipped(true);
        setTimeout(() => {
          startRolling();
        }, 600);
      }, 300);
    } else {
      // 重置状态
      setRollResult(null);
      setIsRolling(false);
      setShowResult(false);
      setCardFlipped(false);
      setShowCard(false);
    }
  }, [isVisible]);

  const startRolling = () => {
    setIsRolling(true);
    setShowResult(false);
    
    // 模拟滚动过程
    const rollInterval = setInterval(() => {
      setRollResult(Math.floor(Math.random() * 6) + 1);
    }, 100);

    // 停止滚动并确定最终结果
    setTimeout(() => {
      clearInterval(rollInterval);
      const finalResult = Math.floor(Math.random() * 6) + 1;
      setRollResult(finalResult);
      setIsRolling(false);
      setShowResult(true);

      // 计算结果
      const success = finalResult > difficulty;
      const isCriticalSuccess = finalResult === 6 && difficulty <= 3;
      const isCriticalFailure = finalResult === 1 && difficulty >= 4;

      setTimeout(() => {
        onComplete?.(success || isCriticalSuccess, isCriticalSuccess || isCriticalFailure);
      }, 2000);
    }, 1800);
  };

  if (!isVisible) return null;

  const success = rollResult ? rollResult > difficulty : false;
  const isCriticalSuccess = rollResult === 6 && difficulty <= 3;
  const isCriticalFailure = rollResult === 1 && difficulty >= 4;

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-black/80 backdrop-blur-md',
      className
    )}>
      <div className="relative w-full max-w-lg mx-4">
        {/* 主面板 */}
        <div className={cn(
          'relative bg-slate-900/95 rounded-2xl border-2 backdrop-blur-xl',
          'shadow-2xl overflow-hidden',
          phase === 'judgment' ? 'border-blue-500/50' : 'border-purple-500/50'
        )}>
          {/* 顶部渐变条 */}
          <div className={cn(
            'absolute top-0 left-0 right-0 h-1.5',
            'bg-gradient-to-r',
            phase === 'judgment'
              ? 'from-blue-500 to-cyan-500'
              : 'from-purple-500 to-pink-500'
          )} />

          {/* 内容区域 */}
          <div className="p-6">
            {/* 头部信息 */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Scale className={cn(
                  'w-6 h-6',
                  phase === 'judgment' ? 'text-blue-400' : 'text-purple-400'
                )} />
                <h3 className={cn(
                  'text-xl font-bold',
                  phase === 'judgment' ? 'text-blue-400' : 'text-purple-400'
                )}>
                  {title}
                </h3>
              </div>
              <p className="text-sm text-slate-400">
                {phase === 'judgment' ? '判定阶段' : '响应阶段'}
              </p>
              {description && (
                <p className="text-xs text-slate-500 mt-1">{description}</p>
              )}
            </div>

            {/* 卡牌展示区域 */}
            {(cardName || cardIcon) && showCard && (
              <div className="flex justify-center mb-6">
                <JudgmentCard
                  cardName={cardName}
                  cardIcon={cardIcon}
                  isFlipped={cardFlipped}
                  phase={phase}
                />
              </div>
            )}

            {/* 难度指示器 */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
                <span className="text-xs text-slate-400">难度</span>
                <span className="text-lg font-mono font-bold text-yellow-400">
                  {difficulty}
                </span>
                <span className="text-[10px] text-slate-500">
                  (需要 &gt;{difficulty})
                </span>
              </div>
            </div>

            {/* 骰子区域 */}
            <div className="flex justify-center mb-6">
              <DiceRoller
                result={rollResult}
                isRolling={isRolling}
                showResult={showResult}
              />
            </div>

            {/* 结果展示 */}
            {showResult && rollResult && (
              <div className="text-center">
                <JudgmentResult
                  success={success}
                  isCriticalSuccess={isCriticalSuccess}
                  isCriticalFailure={isCriticalFailure}
                  rollValue={rollResult}
                  difficulty={difficulty}
                />
              </div>
            )}

            {/* 状态提示 */}
            {!showResult && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2">
                  {!cardFlipped && (
                    <>
                      <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                      <span className="text-sm text-slate-400">翻开卡牌中...</span>
                    </>
                  )}
                  {cardFlipped && (
                    <>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-sm text-slate-400">
                        {isRolling ? '骰子滚动中...' : '准备判定...'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 装饰效果 */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

interface JudgmentCardProps {
  cardName?: string;
  cardIcon?: string;
  isFlipped: boolean;
  phase: 'judgment' | 'response';
}

function JudgmentCard({ cardName, cardIcon, isFlipped, phase }: JudgmentCardProps) {
  return (
    <div className="relative perspective-1000">
      <div className={cn(
        'relative w-32 h-44 transition-transform duration-700 preserve-3d',
        isFlipped ? 'rotate-y-180' : ''
      )}>
        {/* 卡片背面 */}
        <div className={cn(
          'absolute inset-0 w-full h-full backface-hidden',
          'bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2',
          phase === 'judgment' ? 'border-blue-500/50' : 'border-purple-500/50',
          'flex items-center justify-center',
          'shadow-xl'
        )}>
          <div className="text-center">
            <div className="text-4xl mb-2 opacity-50">🎴</div>
            <div className="text-xs text-slate-400">判定卡牌</div>
          </div>
        </div>

        {/* 卡片正面 */}
        <div className={cn(
          'absolute inset-0 w-full h-full backface-hidden rotate-y-180',
          'bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2',
          phase === 'judgment' ? 'border-blue-500' : 'border-purple-500',
          'flex flex-col',
          'shadow-xl'
        )}>
          {/* 装饰条 */}
          <div className={cn(
            'h-2 rounded-t-xl bg-gradient-to-r',
            phase === 'judgment' ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'
          )} />
          
          {/* 卡片内容 */}
          <div className="flex-1 flex flex-col items-center justify-center p-3">
            <div className="text-4xl mb-2">{cardIcon || '⚖️'}</div>
            <div className="text-sm font-bold text-white text-center leading-tight">
              {cardName || '判定卡牌'}
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="p-2 border-t border-slate-700/50">
            <div className="flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span className="text-[9px] text-slate-400">判定中</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DiceRollerProps {
  result: number | null;
  isRolling: boolean;
  showResult: boolean;
}

function DiceRoller({ result, isRolling, showResult }: DiceRollerProps) {
  const safeResult = result ?? 3;
  const DiceIcon = [
    Dice1, Dice2, Dice3, Dice4, Dice5, Dice6
  ][safeResult - 1] || Dice3;

  return (
    <div className="relative">
      {/* 背景光晕 */}
      {showResult && result && (
        <div className={cn(
          'absolute -inset-4 rounded-full blur-xl opacity-30',
          safeResult === 6 ? 'bg-yellow-500' :
          safeResult === 1 ? 'bg-red-500' :
          safeResult > 3 ? 'bg-green-500' : 'bg-slate-500'
        )} />
      )}

      <div className={cn(
        'relative w-28 h-28 rounded-2xl',
        'bg-gradient-to-br from-slate-700 to-slate-800',
        'border-2 border-slate-600',
        'flex items-center justify-center',
        'shadow-2xl',
        'transition-all duration-300',
        isRolling && 'animate-bounce',
        showResult && !isRolling && 'scale-110',
        showResult && safeResult === 6 && 'border-yellow-400 shadow-yellow-500/30',
        showResult && safeResult === 1 && 'border-red-400 shadow-red-500/30',
        showResult && safeResult > 3 && safeResult < 6 && 'border-green-400 shadow-green-500/30'
      )}>
        <DiceIcon className={cn(
          'w-16 h-16 transition-all duration-300',
          isRolling ? 'text-slate-500' :
          showResult ? (
            (safeResult === 6 ? 'text-yellow-400 drop-shadow-lg' :
             safeResult === 1 ? 'text-red-400 drop-shadow-lg' : 
             safeResult > 3 ? 'text-green-400' : 'text-white')
          ) : 'text-white'
        )} />
        
        {/* 滚动时的闪烁效果 */}
        {isRolling && (
          <>
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-2xl" />
            <div className="absolute inset-0 bg-yellow-500/5 animate-pulse delay-75 rounded-2xl" />
            {/* 滚动粒子 */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400/60 rounded-full"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animation: `pulse 0.5s ease-in-out infinite ${i * 0.1}s`
                }}
              />
            ))}
          </>
        )}
        
        {/* 成功时的发光效果 */}
        {showResult && result && (
          <div className={cn(
            'absolute inset-0 rounded-2xl',
            safeResult === 6 ? 'bg-yellow-500/20' :
            safeResult === 1 ? 'bg-red-500/20' :
            safeResult > 3 ? 'bg-green-500/20' : 'bg-slate-500/10'
          )}>
            {safeResult > 3 && (
              <div className="absolute -top-2 -right-2">
                <Sparkles className={cn(
                  'w-6 h-6 animate-pulse',
                  safeResult === 6 ? 'text-yellow-400' : 'text-green-400'
                )} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface JudgmentResultProps {
  success: boolean;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
  rollValue: number;
  difficulty: number;
}

function JudgmentResult({
  success,
  isCriticalSuccess,
  isCriticalFailure,
  rollValue,
  difficulty
}: JudgmentResultProps) {
  const resultConfig = {
    critical_success: {
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      shadowColor: 'shadow-yellow-500/30',
      title: '大成功！',
      description: `掷出 ${rollValue} > ${difficulty}，效果翻倍！`,
      badge: '🎉 双倍奖励'
    },
    success: {
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      shadowColor: 'shadow-green-500/30',
      title: '判定成功',
      description: `掷出 ${rollValue} > ${difficulty}`,
      badge: '✓ 成功'
    },
    critical_failure: {
      icon: AlertTriangle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/50',
      shadowColor: 'shadow-orange-500/30',
      title: '大失败！',
      description: `掷出 ${rollValue} ≤ ${difficulty}，效果加倍！`,
      badge: '⚠️ 双倍惩罚'
    },
    failure: {
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      shadowColor: 'shadow-red-500/30',
      title: '判定失败',
      description: `掷出 ${rollValue} ≤ ${difficulty}`,
      badge: '✗ 失败'
    }
  };

  const config = isCriticalSuccess ? resultConfig.critical_success :
                isCriticalFailure ? resultConfig.critical_failure :
                success ? resultConfig.success : resultConfig.failure;

  const Icon = config.icon;

  return (
    <div className={cn(
      'animate-in slide-in-from-bottom-4 fade-in duration-500 relative overflow-hidden',
      'p-5 rounded-xl border-2',
      config.bgColor,
      config.borderColor,
      'shadow-xl',
      config.shadowColor
    )}>
      {/* 背景光晕 */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20" 
           style={{ backgroundColor: config.color.includes('yellow') ? '#fbbf24' : 
                          config.color.includes('green') ? '#22c55e' :
                          config.color.includes('orange') ? '#f97316' : '#ef4444' }} />
      
      {/* 装饰线条 */}
      <div className="absolute top-0 left-0 right-0 h-1"
           style={{ backgroundColor: config.color.includes('yellow') ? '#fbbf24' : 
                          config.color.includes('green') ? '#22c55e' :
                          config.color.includes('orange') ? '#f97316' : '#ef4444' }} />

      <div className="relative flex items-center gap-4">
        <div className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center',
          config.bgColor,
          'border-2',
          config.borderColor,
          'shadow-lg',
          isCriticalSuccess || isCriticalFailure ? 'animate-bounce' : ''
        )}>
          <Icon className={cn('w-7 h-7', config.color)} />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn('text-xl font-bold', config.color)}>
              {config.title}
            </div>
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded-full border',
              config.bgColor,
              config.borderColor,
              config.color
            )}>
              {config.badge}
            </span>
          </div>
          <div className="text-sm text-slate-300 mb-2">
            {config.description}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded">
              <span className="text-xs text-slate-400">骰子</span>
              <span className={cn('text-sm font-bold font-mono', config.color)}>
                {rollValue}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded">
              <span className="text-xs text-slate-400">难度</span>
              <span className="text-sm font-bold font-mono text-yellow-400">
                {difficulty}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SkillEffectDisplayProps {
  skillName: string;
  description: string;
  effectType?: 'buff' | 'debuff' | 'damage' | 'heal';
  isVisible: boolean;
  onComplete?: () => void;
}

export function SkillEffectDisplay({
  skillName,
  description,
  effectType = 'buff',
  isVisible,
  onComplete
}: SkillEffectDisplayProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const effectConfig = {
    buff: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: '✨' },
    debuff: { color: 'text-rose-400', bg: 'bg-rose-500/20', icon: '💫' },
    damage: { color: 'text-red-400', bg: 'bg-red-500/20', icon: '⚔️' },
    heal: { color: 'text-green-400', bg: 'bg-green-500/20', icon: '💚' }
  };

  const config = effectConfig[effectType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className={cn(
        'animate-in zoom-in-95 fade-in duration-300',
        'px-6 py-4 rounded-xl border-2',
        'bg-slate-900/95 backdrop-blur-xl',
        config.bg,
        'border-slate-700/50',
        'shadow-2xl'
      )}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <div className={cn('font-bold', config.color)}>
              {skillName}
            </div>
            <div className="text-sm text-slate-400">
              {description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JudgmentVisualizer;