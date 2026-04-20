/**
 * 目标选择弹窗组件
 * 用于延时类判定卡牌选择使用对象
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Target, User, Sword, Shield } from 'lucide-react';
import type { Player } from '@/types/gameRules';

interface TargetSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (targetPlayerId: string) => void;
  cardName: string;
  cardDescription: string;
  availableTargets: Player[];
  currentPlayerId: string;
  title?: string;
}

export function TargetSelectionModal({
  isOpen,
  onClose,
  onSelect,
  cardName,
  cardDescription,
  availableTargets,
  currentPlayerId,
  title = '选择目标',
}: TargetSelectionModalProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedTargetId) {
      onSelect(selectedTargetId);
      setSelectedTargetId(null);
    }
  };

  const handleClose = () => {
    setSelectedTargetId(null);
    onClose();
  };

  // 过滤掉当前玩家，只显示可选目标
  const targets = availableTargets.filter(p => p.id !== currentPlayerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/50">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-sm text-slate-400">{cardName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 卡牌描述 */}
        <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-700">
          <p className="text-sm text-slate-300">{cardDescription}</p>
          <p className="text-xs text-cyan-400 mt-1">
            选择一个目标玩家，判定将在其下个判定阶段执行
          </p>
        </div>

        {/* 目标选择列表 */}
        <div className="p-6">
          <p className="text-sm text-slate-400 mb-3">可选目标：</p>
          <div className="space-y-2">
            {targets.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                <p>没有可选目标</p>
              </div>
            ) : (
              targets.map((target) => {
                const isSelected = selectedTargetId === target.id;
                const isHovered = hoveredTargetId === target.id;

                return (
                  <button
                    key={target.id}
                    onClick={() => setSelectedTargetId(target.id)}
                    onMouseEnter={() => setHoveredTargetId(target.id)}
                    onMouseLeave={() => setHoveredTargetId(null)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all duration-200',
                      'flex items-center gap-4',
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/20'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-750'
                    )}
                  >
                    {/* 选中标记 */}
                    {isSelected && (
                      <div className="absolute right-4 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    {/* 玩家头像/图标 */}
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center border-2',
                      target.faction === 'attacker' 
                        ? 'bg-red-500/20 border-red-500/50' 
                        : 'bg-blue-500/20 border-blue-500/50'
                    )}>
                      {target.faction === 'attacker' ? (
                        <Sword className="w-6 h-6 text-red-400" />
                      ) : (
                        <Shield className="w-6 h-6 text-blue-400" />
                      )}
                    </div>

                    {/* 玩家信息 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{target.name}</span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded',
                          target.faction === 'attacker'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        )}>
                          {target.faction === 'attacker' ? '进攻方' : '防御方'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {target.faction === 'attacker' 
                          ? `渗透等级: ${target.infiltrationLevel}` 
                          : `安全等级: ${target.safetyLevel}`}
                      </div>
                    </div>

                    {/* 悬停提示 */}
                    {isHovered && !isSelected && (
                      <div className="absolute inset-0 bg-cyan-500/5 rounded-lg pointer-events-none" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-800 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTargetId}
            className={cn(
              'bg-cyan-600 hover:bg-cyan-700 text-white',
              !selectedTargetId && 'opacity-50 cursor-not-allowed'
            )}
          >
            确认选择
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TargetSelectionModal;
