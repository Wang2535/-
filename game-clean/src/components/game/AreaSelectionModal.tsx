/**
 * 区域选择弹窗组件
 * 用于在使用标志相关卡牌时选择目标区域
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Sword, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type AreaType = 'perimeter' | 'dmz' | 'internal' | 'ics';

interface AreaInfo {
  id: AreaType;
  name: string;
  description: string;
  attackerBonus: string;
  defenderBonus: string;
  strategicValue: number;
}

const AREA_INFO: Record<AreaType, AreaInfo> = {
  perimeter: {
    id: 'perimeter',
    name: '网络边界',
    description: '第一道防线，渗透难度较低',
    attackerBonus: '渗透+1/回合',
    defenderBonus: '安全+1/回合',
    strategicValue: 1,
  },
  dmz: {
    id: 'dmz',
    name: '隔离区',
    description: '缓冲区域，资源获取优势',
    attackerBonus: '行动点+1/回合',
    defenderBonus: '行动点+1/回合',
    strategicValue: 2,
  },
  internal: {
    id: 'internal',
    name: '内网',
    description: '核心区域，防御方优势',
    attackerBonus: '渗透+2/回合',
    defenderBonus: '安全+1/回合',
    strategicValue: 3,
  },
  ics: {
    id: 'ics',
    name: '工控系统',
    description: '最关键区域，高价值目标',
    attackerBonus: '渗透+2/回合',
    defenderBonus: '安全+2/回合',
    strategicValue: 4,
  },
};

interface AreaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (area: AreaType) => void;
  cardName: string;
  cardDescription: string;
  currentFaction?: 'attacker' | 'defender';
  markerType?: 'threat' | 'defense' | 'aura';
  title?: string;
}

export function AreaSelectionModal({
  isOpen,
  onClose,
  onSelect,
  cardName,
  cardDescription,
  currentFaction: _currentFaction,
  markerType = 'threat',
  title = '选择目标区域',
}: AreaSelectionModalProps) {
  const [selectedArea, setSelectedArea] = useState<AreaType | null>(null);
  const [hoveredArea, setHoveredArea] = useState<AreaType | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedArea) {
      onSelect(selectedArea);
      setSelectedArea(null);
    }
  };

  const getMarkerIcon = () => {
    switch (markerType) {
      case 'threat':
        return <Sword className="w-5 h-5 text-red-500" />;
      case 'defense':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'aura':
        return <MapPin className="w-5 h-5 text-purple-500" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMarkerTypeText = () => {
    switch (markerType) {
      case 'threat':
        return '威胁标记';
      case 'defense':
        return '防御标记';
      case 'aura':
        return '光环标记';
      default:
        return '标记';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {getMarkerIcon()}
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-sm text-slate-400">{cardName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 卡牌描述 */}
        <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-700">
          <p className="text-sm text-slate-300">{cardDescription}</p>
          <p className="text-xs text-slate-500 mt-1">
            选择要放置{getMarkerTypeText()}的区域
          </p>
        </div>

        {/* 区域选择网格 */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(AREA_INFO) as AreaType[]).map((areaId) => {
              const area = AREA_INFO[areaId];
              const isSelected = selectedArea === areaId;
              const isHovered = hoveredArea === areaId;

              return (
                <button
                  key={areaId}
                  onClick={() => setSelectedArea(areaId)}
                  onMouseEnter={() => setHoveredArea(areaId)}
                  onMouseLeave={() => setHoveredArea(null)}
                  className={cn(
                    'relative p-4 rounded-lg border-2 text-left transition-all duration-200',
                    isSelected
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 bg-slate-800 hover:border-slate-500 hover:bg-slate-700'
                  )}
                >
                  {/* 选中标记 */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* 区域名称和战略价值 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-white">{area.name}</span>
                    <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded">
                      价值 {area.strategicValue}
                    </span>
                  </div>

                  {/* 区域描述 */}
                  <p className="text-sm text-slate-400 mb-3">{area.description}</p>

                  {/* 控制加成 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Sword className="w-3 h-3 text-red-400" />
                      <span className="text-slate-400">进攻方:</span>
                      <span className="text-red-400">{area.attackerBonus}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Shield className="w-3 h-3 text-blue-400" />
                      <span className="text-slate-400">防御方:</span>
                      <span className="text-blue-400">{area.defenderBonus}</span>
                    </div>
                  </div>

                  {/* 悬停提示 */}
                  {isHovered && !isSelected && (
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-800 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedArea}
            className={cn(
              'bg-blue-600 hover:bg-blue-700 text-white',
              !selectedArea && 'opacity-50 cursor-not-allowed'
            )}
          >
            确认放置到 {selectedArea ? AREA_INFO[selectedArea].name : '...'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AreaSelectionModal;
