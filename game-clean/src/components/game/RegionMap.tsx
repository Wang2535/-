/**
 * 4区域控制地图
 * 规则依据: R3.0 区域控制系统
 */

import { cn } from '@/lib/utils';
import { Shield, Sword, CircleDot, AlertTriangle, Lock } from 'lucide-react';

export type RegionId = 'perimeter' | 'dmz' | 'internal' | 'ics';
export type Controller = 'attacker' | 'defender' | 'neutral';

interface RegionState {
  id: RegionId;
  name: string;
  description: string;
  controller: Controller;
  attackerMarks: number;
  defenderMarks: number;
  threatMarks: number;
  defenseMarks: number;
  attackerBonus: string;
  defenderBonus: string;
}

interface RegionMapProps {
  regions: Record<RegionId, RegionState>;
  currentFaction: 'attacker' | 'defender';
  onRegionClick?: (regionId: RegionId) => void;
  selectedRegion?: RegionId | null;
}

const REGION_CONFIG: Record<RegionId, { name: string; icon: string; position: string }> = {
  perimeter: { 
    name: '网络边界', 
    icon: '🛡️',
    position: '进攻方主战场'
  },
  dmz: { 
    name: '隔离区', 
    icon: '🚧',
    position: '缓冲带'
  },
  internal: { 
    name: '内网', 
    icon: '🏢',
    position: '防御方核心'
  },
  ics: { 
    name: '工控系统', 
    icon: '⚙️',
    position: '高价值目标'
  }
};

export function RegionMap({
  regions,
  currentFaction,
  onRegionClick,
  selectedRegion
}: RegionMapProps) {
  const getControllerColor = (controller: Controller) => {
    switch (controller) {
      case 'attacker': return 'border-red-500 bg-red-500/10';
      case 'defender': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-slate-600 bg-slate-800/50';
    }
  };

  const getControllerBadge = (controller: Controller) => {
    switch (controller) {
      case 'attacker': 
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs rounded">
            <Sword className="w-3 h-3" />
            进攻方控制
          </span>
        );
      case 'defender': 
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">
            <Shield className="w-3 h-3" />
            防御方控制
          </span>
        );
      default: 
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
            <CircleDot className="w-3 h-3" />
            无人控制
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 text-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span>🗺️</span>
          区域控制
        </h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-slate-400">进攻方</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-slate-400">防御方</span>
          </div>
        </div>
      </div>

      {/* 区域网格 */}
      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(regions) as RegionId[]).map((regionId) => {
          const region = regions[regionId];
          const config = REGION_CONFIG[regionId];
          const isSelected = selectedRegion === regionId;
          const isControlledByPlayer = region.controller === currentFaction;

          return (
            <button
              key={regionId}
              onClick={() => onRegionClick?.(regionId)}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all text-left",
                getControllerColor(region.controller),
                isSelected && "ring-2 ring-yellow-400 scale-105",
                "hover:scale-105 hover:shadow-lg"
              )}
            >
              {/* 区域头部 */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <div className="font-bold">{config.name}</div>
                    <div className="text-xs text-slate-400">{config.position}</div>
                  </div>
                </div>
                {getControllerBadge(region.controller)}
              </div>

              {/* 标记数量 */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-800/50 rounded p-2">
                  <div className="flex items-center gap-1 text-red-400 text-xs mb-1">
                    <Sword className="w-3 h-3" />
                    <span>进攻标记</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{region.attackerMarks}</span>
                    {region.threatMarks > 0 && (
                      <span className="flex items-center gap-1 text-xs text-orange-400">
                        <AlertTriangle className="w-3 h-3" />
                        {region.threatMarks}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded p-2">
                  <div className="flex items-center gap-1 text-blue-400 text-xs mb-1">
                    <Shield className="w-3 h-3" />
                    <span>防御标记</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{region.defenderMarks}</span>
                    {region.defenseMarks > 0 && (
                      <span className="flex items-center gap-1 text-xs text-cyan-400">
                        <Lock className="w-3 h-3" />
                        {region.defenseMarks}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 控制效果 */}
              <div className="text-xs">
                {region.controller === 'attacker' ? (
                  <div className="text-red-300">
                    <span className="text-slate-400">效果:</span> {region.attackerBonus}
                  </div>
                ) : region.controller === 'defender' ? (
                  <div className="text-blue-300">
                    <span className="text-slate-400">效果:</span> {region.defenderBonus}
                  </div>
                ) : (
                  <div className="text-slate-500">
                    控制该区域获得加成效果
                  </div>
                )}
              </div>

              {/* 玩家控制指示 */}
              {isControlledByPlayer && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 区域控制规则提示 */}
      <div className="mt-4 p-3 bg-slate-800 rounded-lg text-sm text-slate-400">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="font-medium text-slate-300">区域控制规则</span>
        </div>
        <ul className="space-y-1 text-xs">
          <li>• 区域内己方标记数 &gt; 对方标记数 = 控制该区域</li>
          <li>• 进攻方优势区域: 网络边界、工控系统</li>
          <li>• 防御方优势区域: 内网</li>
          <li>• 中立区域: 隔离区</li>
        </ul>
      </div>
    </div>
  );
}

export default RegionMap;
