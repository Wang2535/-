/**
 * 区域选择弹窗组件
 * 
 * 功能：
 * 1. 当玩家使用需要选择区域的卡牌时弹出
 * 2. 显示四个区域的当前状态
 * 3. 允许玩家点击选择目标区域
 * 4. 确认后触发卡牌效果
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AreaType } from '@/types/levelTypes';
import { AREA_NAMES } from '@/types/levelTypes';
import { Shield, Skull, MapPin, X } from 'lucide-react';

interface AreaSelectionModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  cardName: string;
  onSelect: (area: AreaType) => void;
  onCancel: () => void;
  areaControl: Record<AreaType, {
    controller: 'player' | 'enemy' | 'neutral';
    defenseMarkers: number;
    attackMarkers: number;
    specialEffects: string[];
  }>;
  validAreas?: AreaType[]; // 可选的有效区域，如果不传则所有区域都可选
}

export function AreaSelectionModal({
  isOpen,
  title,
  description,
  cardName,
  onSelect,
  onCancel,
  areaControl,
  validAreas = ['internal', 'industrial', 'dmz', 'external']
}: AreaSelectionModalProps) {
  const [selectedArea, setSelectedArea] = useState<AreaType | null>(null);

  if (!isOpen) return null;

  const getAreaIcon = (controller: string) => {
    switch (controller) {
      case 'player':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'enemy':
        return <Skull className="w-5 h-5 text-red-400" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAreaColor = (controller: string) => {
    switch (controller) {
      case 'player':
        return 'border-blue-500 bg-blue-500/10';
      case 'enemy':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const handleConfirm = () => {
    if (selectedArea) {
      onSelect(selectedArea);
      setSelectedArea(null);
    }
  };

  const handleCancel = () => {
    setSelectedArea(null);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="bg-slate-900 border-slate-700 p-6 max-w-lg w-full shadow-2xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 卡牌信息 */}
        <div className="bg-slate-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-cyan-400">正在使用: {cardName}</p>
        </div>

        {/* 区域选择网格 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(Object.keys(areaControl) as AreaType[]).map((area) => {
            const status = areaControl[area];
            const isValid = validAreas.includes(area);
            const isSelected = selectedArea === area;

            return (
              <button
                key={area}
                onClick={() => isValid && setSelectedArea(area)}
                disabled={!isValid}
                className={cn(
                  'relative p-4 rounded-lg border-2 transition-all duration-200 text-left',
                  getAreaColor(status.controller),
                  isSelected && 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900',
                  !isValid && 'opacity-50 cursor-not-allowed',
                  isValid && !isSelected && 'hover:scale-105 hover:brightness-110'
                )}
              >
                {/* 选中标记 */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}

                {/* 区域图标和控制者 */}
                <div className="flex items-center gap-2 mb-2">
                  {getAreaIcon(status.controller)}
                  <span className="font-semibold text-white">
                    {AREA_NAMES[area]}
                  </span>
                </div>

                {/* 标记数量 */}
                <div className="flex gap-2 text-xs">
                  <Badge variant="secondary" className="bg-blue-600/50 text-blue-100">
                    友方: {status.defenseMarkers}
                  </Badge>
                  <Badge variant="secondary" className="bg-red-600/50 text-red-100">
                    敌方: {status.attackMarkers}
                  </Badge>
                </div>

                {/* 特殊效果 */}
                {status.specialEffects.length > 0 && (
                  <div className="mt-2 text-xs text-yellow-400">
                    {status.specialEffects.join(', ')}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedArea}
            className={cn(
              'flex-1',
              selectedArea
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            )}
          >
            确认选择
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AreaSelectionModal;
