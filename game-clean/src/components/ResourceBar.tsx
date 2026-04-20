import type { Resources } from '@/types/gameRules';
import { Zap, DollarSign, Eye, Crown } from 'lucide-react';

interface ResourceBarProps {
  resources: Resources;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

export function ResourceBar({ 
  resources, 
  showLabels = true, 
  size = 'md',
  isActive = false
}: ResourceBarProps) {
  const sizeClasses = {
    sm: 'text-xs gap-2',
    md: 'text-sm gap-4',
    lg: 'text-base gap-6'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <div className={`
      flex items-center ${sizeClasses[size]}
      ${isActive ? 'animate-pulse' : ''}
    `}>
      {/* 算力 */}
      <div className="flex items-center gap-1" title="算力">
        <Zap className={`${iconSizes[size]} text-yellow-400`} />
        <span className={resources.compute < 2 ? 'text-red-400 font-bold' : ''}>
          {resources.compute}
        </span>
        {showLabels && <span className="text-slate-400 text-[10px]">/15</span>}
      </div>
      
      {/* 资金 */}
      <div className="flex items-center gap-1" title="资金">
        <DollarSign className={`${iconSizes[size]} text-green-400`} />
        <span className={resources.funds < 2 ? 'text-red-400 font-bold' : ''}>
          {resources.funds}
        </span>
        {showLabels && <span className="text-slate-400 text-[10px]">/20</span>}
      </div>
      
      {/* 信息 */}
      <div className="flex items-center gap-1" title="信息">
        <Eye className={`${iconSizes[size]} text-blue-400`} />
        <span className={resources.information < 2 ? 'text-red-400 font-bold' : ''}>
          {resources.information}
        </span>
        {showLabels && <span className="text-slate-400 text-[10px]">/10</span>}
      </div>
      
      {/* 权限 */}
      <div className="flex items-center gap-1" title="权限">
        <Crown className={`${iconSizes[size]} text-purple-400`} />
        <span className={resources.permission > 0 ? 'text-purple-400 font-bold' : ''}>
          {resources.permission}
        </span>
        {showLabels && <span className="text-slate-400 text-[10px]">/5</span>}
      </div>
    </div>
  );
}

// 资源变化动画
export function ResourceChange({ 
  type, 
  amount, 
  onComplete 
}: { 
  type: keyof Resources; 
  amount: number; 
  onComplete?: () => void;
}) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    compute: Zap,
    funds: DollarSign,
    information: Eye,
    permission: Crown
  };
  
  const Icon = icons[type];
  
  return (
    <div 
      className={`
        absolute flex items-center gap-1 
        ${amount > 0 ? 'text-green-400' : 'text-red-400'}
        animate-bounce
      `}
      onAnimationEnd={onComplete}
    >
      <Icon className="w-4 h-4" />
      <span className="font-bold">
        {amount > 0 ? '+' : ''}{amount}
      </span>
    </div>
  );
}

export default ResourceBar;
