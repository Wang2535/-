/**
 * 科技树面板
 * 规则依据: R5.0 科技树系统
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Lock, Unlock, Sparkles, ChevronRight } from 'lucide-react';

export type TechLevel = 0 | 1 | 2 | 3 | 4 | 5;

interface TechNode {
  id: string;
  name: string;
  level: TechLevel;
  requiredLevel: number;
  description: string;
  unlockedCards: string[];
  isUnlocked: boolean;
  canUnlock: boolean;
  icon: string;
}

interface RogueOption {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: string;
}

interface TechTreePanelProps {
  faction: 'attacker' | 'defender';
  currentLevel: number;
  techNodes: TechNode[];
  onUnlockNode: (nodeId: string) => void;
  onClose: () => void;
}

interface RogueSelectionModalProps {
  isOpen: boolean;
  techLevel: TechLevel;
  options: RogueOption[];
  onSelect: (optionId: string) => void;
  onClose: () => void;
}

const LEVEL_THRESHOLDS: Record<TechLevel, number> = {
  0: 0,
  1: 15,
  2: 30,
  3: 45,
  4: 60,
  5: 75
};

export function TechTreePanel({
  faction,
  currentLevel,
  techNodes,
  onUnlockNode,
  onClose
}: TechTreePanelProps) {
  const [selectedNode, setSelectedNode] = useState<TechNode | null>(null);
  const [showRogueSelection, setShowRogueSelection] = useState(false);
  const [currentTechLevel, setCurrentTechLevel] = useState<TechLevel>(0);

  const factionColor = faction === 'attacker' ? 'red' : 'blue';
  const levelType = faction === 'attacker' ? '渗透' : '安全';

  // 获取当前可解锁的最高科技等级
  const getAvailableTechLevel = (): TechLevel => {
    for (let i = 5; i >= 0; i--) {
      if (currentLevel >= LEVEL_THRESHOLDS[i as TechLevel]) {
        return i as TechLevel;
      }
    }
    return 0;
  };

  const availableLevel = getAvailableTechLevel();

  // 按等级分组科技节点
  const nodesByLevel: Record<TechLevel, TechNode[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: []
  };
  techNodes.forEach(node => {
    nodesByLevel[node.level].push(node);
  });

  const handleNodeClick = (node: TechNode) => {
    if (node.isUnlocked) {
      setSelectedNode(node);
    } else if (node.canUnlock) {
      setCurrentTechLevel(node.level);
      setShowRogueSelection(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              科技树
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              当前{levelType}等级: {currentLevel}/75 | 可用科技等级: T{availableLevel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 科技树内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>科技进度</span>
              <span>{currentLevel}/75</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  faction === 'attacker' 
                    ? "bg-gradient-to-r from-red-600 to-red-400" 
                    : "bg-gradient-to-r from-blue-600 to-blue-400"
                )}
                style={{ width: `${(currentLevel / 75) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>T1 (15)</span>
              <span>T2 (30)</span>
              <span>T3 (45)</span>
              <span>T4 (60)</span>
              <span>T5 (75)</span>
            </div>
          </div>

          {/* 科技节点 */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((level) => {
              const isLocked = currentLevel < LEVEL_THRESHOLDS[level as TechLevel];
              const isCurrentLevel = availableLevel === level;

              return (
                <div
                  key={level}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    isLocked 
                      ? "border-slate-700 opacity-50" 
                      : isCurrentLevel
                        ? `border-${factionColor}-500 bg-${factionColor}-500/10`
                        : "border-slate-600"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-slate-500" />
                    ) : (
                      <Unlock className={cn("w-5 h-5", `text-${factionColor}-400`)} />
                    )}
                    <h4 className="font-bold text-lg">T{level} 科技</h4>
                    <span className="text-sm text-slate-400">
                      (需要{levelType}等级 {LEVEL_THRESHOLDS[level as TechLevel]})
                    </span>
                    {isCurrentLevel && (
                      <span className={cn(
                        "px-2 py-1 rounded text-xs",
                        faction === 'attacker' ? "bg-red-600" : "bg-blue-600"
                      )}>
                        可解锁
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {nodesByLevel[level as TechLevel].map((node) => (
                      <button
                        key={node.id}
                        onClick={() => handleNodeClick(node)}
                        disabled={isLocked}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all",
                          node.isUnlocked
                            ? `border-${factionColor}-500 bg-${factionColor}-500/20`
                            : node.canUnlock
                              ? `border-${factionColor}-400 bg-${factionColor}-400/10 hover:bg-${factionColor}-400/20`
                              : "border-slate-700 bg-slate-800/50",
                          isLocked && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{node.icon}</span>
                          <span className="font-bold">{node.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {node.description}
                        </p>
                        {node.isUnlocked && (
                          <div className="mt-2 text-xs text-green-400">
                            ✓ 已解锁
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部说明 */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-start gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-300 mb-1">科技树规则</p>
              <ul className="space-y-1 text-xs">
                <li>• T1=5级, T2=15级, T3=30级, T4=40级, T5=50级解锁</li>
                <li>• 解锁科技后可获得新的卡牌和效果</li>
                <li>• T1-T4解锁时会触发肉鸽选择（3选1）</li>
                <li>• 达到75级并持续2回合触发胜利条件</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 肉鸽选择弹窗 */}
      {showRogueSelection && (
        <RogueSelectionModal
          isOpen={showRogueSelection}
          techLevel={currentTechLevel}
          options={generateRogueOptions(currentTechLevel, faction)}
          onSelect={(_optionId) => {
            onUnlockNode(selectedNode?.id || '');
            setShowRogueSelection(false);
          }}
          onClose={() => setShowRogueSelection(false)}
        />
      )}
    </div>
  );
}

// 肉鸽选择弹窗组件
function RogueSelectionModal({
  isOpen,
  techLevel,
  options,
  onSelect,
  onClose
}: RogueSelectionModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  if (!isOpen) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-slate-500 bg-slate-800';
      case 'rare': return 'border-blue-500 bg-blue-900/20';
      case 'epic': return 'border-purple-500 bg-purple-900/20';
      case 'legendary': return 'border-yellow-500 bg-yellow-900/20';
      default: return 'border-slate-500 bg-slate-800';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return '普通';
      case 'rare': return '稀有';
      case 'epic': return '史诗';
      case 'legendary': return '传说';
      default: return '普通';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* 头部 */}
        <div className="p-6 border-b border-slate-700 text-center">
          <h3 className="text-2xl font-bold mb-2">科技升级！</h3>
          <p className="text-slate-400">
            恭喜达到 T{techLevel}，请选择一项强化效果
          </p>
        </div>

        {/* 选项 */}
        <div className="p-6 space-y-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              className={cn(
                "w-full p-4 rounded-lg border-2 text-left transition-all",
                getRarityColor(option.rarity),
                selectedOption === option.id && "ring-2 ring-white scale-[1.02]",
                hoveredOption === option.id && !selectedOption && "scale-[1.01]"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">{option.name}</h4>
                <span className={cn(
                  "px-2 py-1 rounded text-xs",
                  option.rarity === 'legendary' && "bg-yellow-600",
                  option.rarity === 'epic' && "bg-purple-600",
                  option.rarity === 'rare' && "bg-blue-600",
                  option.rarity === 'common' && "bg-slate-600"
                )}>
                  {getRarityName(option.rarity)}
                </span>
              </div>
              <p className="text-slate-300 text-sm mb-2">{option.description}</p>
              <p className="text-xs text-slate-500">{option.effect}</p>
            </button>
          ))}
        </div>

        {/* 底部 */}
        <div className="p-6 border-t border-slate-700 flex justify-between items-center">
          <p className="text-sm text-slate-400">
            选择后将立即生效，本局游戏持续有效
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              onClick={() => selectedOption && onSelect(selectedOption)}
              disabled={!selectedOption}
              className="bg-blue-600 hover:bg-blue-700"
            >
              确认选择
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 生成肉鸽选项
function generateRogueOptions(techLevel: TechLevel, faction: 'attacker' | 'defender'): RogueOption[] {
  const prefix = faction === 'attacker' ? 'ATK' : 'DEF';
  
  // 根据科技等级生成不同的选项
  const options: RogueOption[] = [
    {
      id: `${prefix}-R${techLevel}-01`,
      name: techLevel === 1 ? '算力爆发' : '算力强化',
      description: techLevel === 1 ? '本回合算力+3' : '每回合算力+1',
      rarity: 'common',
      effect: '算力资源提升'
    },
    {
      id: `${prefix}-R${techLevel}-02`,
      name: '快速抽卡',
      description: '抽3张卡，保留2张',
      rarity: 'common',
      effect: '手牌优势'
    },
    {
      id: `${prefix}-R${techLevel}-03`,
      name: '零消耗史诗',
      description: '1张史诗卡本回合零消耗',
      rarity: 'rare',
      effect: '资源节省'
    }
  ];

  return options;
}

export default TechTreePanel;
