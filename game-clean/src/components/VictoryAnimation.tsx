import type { Faction } from '@/types/gameRules';
import { useEffect, useState } from 'react';
import { Crown, Shield, Skull, Zap, AlertTriangle, Swords, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VictoryAnimationProps {
  winner: Faction | 'draw';
  victoryType: string | null;
  onClose: () => void;
}

export function VictoryAnimation({ winner, victoryType, onClose }: VictoryAnimationProps) {
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  if (winner === 'draw') {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className={cn(
          'text-center transition-all duration-1000',
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        )}>
          <div className="w-32 h-32 mx-auto mb-6 bg-slate-700 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-16 h-16 text-yellow-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">平局</h1>
          <p className="text-xl text-slate-400 mb-8">回合耗尽，双方均未达成胜利条件</p>
          <Button onClick={onClose} size="lg">返回大厅</Button>
        </div>
      </div>
    );
  }
  
  // 判断胜利方
  const isAttackWin = winner === 'attacker';
  
  // 胜利条件对应的视觉效果
  const victoryEffects: Record<string, { icon: typeof Crown; color: string; title: string; desc: string }> = {
    '资源枯竭': {
      icon: Skull,
      color: 'text-red-500',
      title: '资源枯竭',
      desc: '防御方资源耗尽，系统崩溃'
    },
    '权限主宰': {
      icon: Crown,
      color: 'text-purple-500',
      title: '权限主宰',
      desc: '攻击方完全控制系统权限'
    },
    '攻击链完成': {
      icon: Swords,
      color: 'text-orange-500',
      title: '攻击链完成',
      desc: '精密的多阶段攻击完美执行'
    },
    '威胁清零': {
      icon: Shield,
      color: 'text-blue-500',
      title: '威胁清零',
      desc: '所有威胁已被成功清除'
    },
    '韧性加固': {
      icon: Zap,
      color: 'text-cyan-500',
      title: '韧性加固',
      desc: '防御体系坚不可摧'
    },
    '反杀': {
      icon: Swords,
      color: 'text-green-500',
      title: '反杀',
      desc: '以彼之道还施彼身'
    }
  };
  
  const effect = victoryType && victoryEffects[victoryType] ? victoryEffects[victoryType] : {
    icon: isAttackWin ? Skull : Shield,
    color: isAttackWin ? 'text-red-500' : 'text-blue-500',
    title: isAttackWin ? '攻击方胜利' : '防御方胜利',
    desc: victoryType || '达成胜利条件'
  };
  
  const Icon = effect.icon;
  
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center overflow-hidden">
      {/* 背景粒子效果 */}
      <ParticleBackground faction={isAttackWin ? 'attacker' : 'defender'} />
      
      {/* 主内容 */}
      <div className={cn(
        'text-center relative z-10 transition-all duration-1000',
        showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      )}>
        {/* 胜利方标识 */}
        
        {/* 胜利图标 */}
        <div className={cn(
          'w-40 h-40 mx-auto mb-8 rounded-full flex items-center justify-center',
          isAttackWin ? 'bg-red-900/50' : 'bg-blue-900/50',
          'animate-pulse ring-4',
          isAttackWin ? 'ring-red-500' : 'ring-blue-500'
        )}>
          <Icon className={cn('w-20 h-20', effect.color)} />
        </div>
        
        {/* 胜利标题 */}
        <h1 className={cn(
          'text-6xl font-bold mb-4',
          isAttackWin ? 'text-red-500' : 'text-blue-500'
        )}>
          {isAttackWin ? '攻击方胜利' : '防御方胜利'}
        </h1>
        
        {/* 胜利类型 */}
        <div className="mb-6">
          <span className={cn(
            'text-2xl font-bold px-6 py-2 rounded-full',
            isAttackWin ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
          )}>
            <Trophy className="w-5 h-5 inline mr-2" />
            {effect.title}
          </span>
        </div>
        
        {/* 胜利描述 */}
        <p className="text-xl text-slate-300 mb-8">{effect.desc}</p>
        
        {/* 按钮 */}
        <div className="flex gap-4 justify-center">
          <Button onClick={onClose} size="lg" variant="default">
            返回大厅
          </Button>
          <Button onClick={() => window.location.reload()} size="lg" variant="outline">
            再来一局
          </Button>
        </div>
      </div>
      
      {/* 装饰性元素 */}
      <DecorativeElements faction={isAttackWin ? 'attacker' : 'defender'} />
    </div>
  );
}

// 粒子背景
function ParticleBackground({ faction }: { faction: Faction | 'draw' }) {
  const color = faction === 'attacker' ? 'bg-red-500' : faction === 'defender' ? 'bg-blue-500' : 'bg-yellow-500';
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'absolute w-1 h-1 rounded-full opacity-50 animate-ping',
            color
          )}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
}

// 装饰元素
function DecorativeElements({ faction }: { faction: Faction | 'draw' }) {
  const isAttack = faction === 'attacker';
  
  return (
    <>
      {/* 左侧装饰 */}
      <div className={cn(
        'absolute left-10 top-1/2 -translate-y-1/2',
        'w-32 h-64 rounded-full blur-3xl opacity-30',
        isAttack ? 'bg-red-600' : 'bg-blue-600'
      )} />
      
      {/* 右侧装饰 */}
      <div className={cn(
        'absolute right-10 top-1/2 -translate-y-1/2',
        'w-32 h-64 rounded-full blur-3xl opacity-30',
        isAttack ? 'bg-red-600' : 'bg-blue-600'
      )} />
      
      {/* 顶部光效 */}
      <div className={cn(
        'absolute top-0 left-1/2 -translate-x-1/2',
        'w-96 h-32 rounded-full blur-3xl opacity-20',
        isAttack ? 'bg-red-500' : 'bg-blue-500'
      )} />
    </>
  );
}

export default VictoryAnimation;
