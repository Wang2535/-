import React from 'react';
import { cn } from '@/lib/utils';
import { Zap, Shield, Sword, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { DadongSkill } from '@/types/levelTypes';

interface SkillStatus {
  skillId: string;
  skillName: string;
  skillType: 'active' | 'passive' | 'special' | 'trigger';
  isAvailable: boolean;
  currentCooldown: number;
  maxCooldown: number;
  description?: string;
}

interface SkillStatusIndicatorProps {
  skills: SkillStatus[];
  actorType: 'dadong' | 'enemy' | 'enemy2';
  onSkillRightClick?: (skill: SkillStatus, event: React.MouseEvent) => void;
}

const skillTypeConfig = {
  active: {
    label: '主动',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    icon: Sword
  },
  passive: {
    label: '被动',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    icon: Shield
  },
  special: {
    label: '特殊',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    icon: Zap
  },
  trigger: {
    label: '触发',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    icon: Clock
  }
};

const actorTypeConfig = {
  dadong: {
    title: '大东技能',
    themeColor: 'emerald'
  },
  enemy: {
    title: '敌人技能',
    themeColor: 'red'
  },
  enemy2: {
    title: '敌人2技能',
    themeColor: 'orange'
  }
};

export function SkillStatusIndicator({
  skills,
  actorType,
  onSkillRightClick
}: SkillStatusIndicatorProps) {
  const config = actorTypeConfig[actorType];

  if (!skills || skills.length === 0) {
    return (
      <div className={cn(
        "bg-slate-800/50 rounded-lg p-3 border border-slate-700/50",
        "text-slate-500 text-sm text-center"
      )}>
        暂无技能信息
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className={cn(
        "text-sm font-semibold flex items-center gap-2",
        actorType === 'dadong' ? 'text-emerald-400' : 'text-red-400'
      )}>
        <Zap className="w-4 h-4" />
        {config.title}
      </h4>
      
      <div className="grid grid-cols-2 gap-2">
        {skills.map((skill) => {
          const typeConfig = skillTypeConfig[skill.skillType] || skillTypeConfig.active;
          const Icon = typeConfig.icon;
          
          // 技能状态样式
          const isOnCooldown = skill.currentCooldown > 0;
          const isAvailable = skill.isAvailable && !isOnCooldown;
          
          return (
            <div
              key={skill.skillId}
              className={cn(
                "relative p-2 rounded-lg border transition-all duration-200 cursor-pointer",
                "hover:scale-105 hover:shadow-lg",
                isAvailable 
                  ? cn(typeConfig.bgColor, typeConfig.borderColor, "opacity-100")
                  : "bg-slate-800/50 border-slate-700/50 opacity-60 grayscale"
              )}
              onContextMenu={(e) => {
                e.preventDefault();
                onSkillRightClick?.(skill, e);
              }}
              title={`${skill.skillName} (${typeConfig.label})\n${skill.description || ''}\n${isOnCooldown ? `冷却: ${skill.currentCooldown}/${skill.maxCooldown} 轮` : '就绪'}`}
            >
              {/* 技能图标和名称 */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-md",
                  typeConfig.bgColor
                )}>
                  <Icon className={cn("w-3.5 h-3.5", typeConfig.color)} />
                </div>
                <span className={cn(
                  "text-xs font-medium truncate flex-1",
                  isAvailable ? "text-slate-200" : "text-slate-500"
                )}>
                  {skill.skillName}
                </span>
              </div>
              
              {/* 冷却状态指示 */}
              <div className="flex items-center justify-between mt-1.5">
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded",
                  typeConfig.bgColor,
                  typeConfig.color
                )}>
                  {typeConfig.label}
                </span>
                
                {isOnCooldown ? (
                  <div className="flex items-center gap-1 text-orange-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-mono">
                      {skill.currentCooldown}/{skill.maxCooldown}
                    </span>
                  </div>
                ) : isAvailable ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="text-[10px]">就绪</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-500">
                    <XCircle className="w-3 h-3" />
                    <span className="text-[10px]">不可用</span>
                  </div>
                )}
              </div>
              
              {/* 冷却进度条 */}
              {skill.maxCooldown > 0 && (
                <div className="mt-1.5 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      isOnCooldown ? "bg-orange-500/60" : "bg-green-500/60"
                    )}
                    style={{
                      width: `${((skill.maxCooldown - skill.currentCooldown) / skill.maxCooldown) * 100}%`
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <p className="text-[10px] text-slate-500 text-center">
        右键点击技能查看详情
      </p>
    </div>
  );
}

export default SkillStatusIndicator;
