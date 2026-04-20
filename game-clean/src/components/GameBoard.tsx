import type { GameState, AreaType, AreaState, Player, Faction, Token } from '@/types/gameRules';
import { Shield, Server, Database, Cpu, Eye } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  onAreaClick?: (areaType: string) => void;
}

export function GameBoard({ gameState, onAreaClick }: GameBoardProps) {
  const areas: AreaType[] = ['perimeter', 'dmz', 'internal', 'ics'];
  
  return (
    <div className="w-full h-full flex flex-col gap-2">
      {/* 区域网格 */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {areas.map(area => (
          <AreaComponent 
            key={area}
            areaType={area}
            areaState={gameState.areas[area]}
            players={gameState.players}
            onClick={() => onAreaClick?.(area)}
          />
        ))}
      </div>
      
      {/* 游戏信息栏 */}
      <div className="bg-slate-900/80 rounded-lg p-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">
            轮次: <span className="text-white font-bold">{gameState.round}</span> / {gameState.maxRounds}
          </span>
          <span className="text-slate-400 text-sm">
            阶段: <span className="text-white font-bold">{getPhaseName(gameState.currentPhase)}</span>
          </span>
        </div>
        
        {/* 回合进度条 */}
        <div className="flex-1 mx-4">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(gameState.round / gameState.maxRounds) * 100}%` }}
            />
          </div>
        </div>
        
        {/* 倒计时 - 暂不使用 */}
        {/* {gameState.phaseTimeLeft && gameState.phaseTimeLeft > 0 && (
          <div className="text-slate-400 text-sm">
            剩余: <span className="text-white font-mono">
              {Math.floor(gameState.phaseTimeLeft / 60)}:{(gameState.phaseTimeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )} */}
      </div>
    </div>
  );
}

// 区域组件
function AreaComponent({ 
  areaType, 
  areaState, 
  players,
  onClick
}: { 
  areaType: AreaType; 
  areaState: AreaState;
  players: Player[];
  onClick?: () => void;
}) {
  const areaNames: Record<AreaType, string> = {
    perimeter: '网络边界',
    dmz: '隔离区',
    internal: '内网',
    ics: '工控系统'
  };

  const areaIcons: Record<AreaType, typeof Shield> = {
    perimeter: Shield,
    dmz: Server,
    internal: Database,
    ics: Cpu
  };

  const areaColors: Record<AreaType, string> = {
    perimeter: 'from-cyan-900/50 to-blue-900/50 border-cyan-600',
    dmz: 'from-orange-900/50 to-amber-900/50 border-orange-600',
    internal: 'from-purple-900/50 to-pink-900/50 border-purple-600',
    ics: 'from-emerald-900/50 to-green-900/50 border-emerald-600'
  };
  
  const Icon = areaIcons[areaType];
  
  // 统计各阵营的标记
  const attackTokens = areaState.tokens.filter((t: Token) => {
    const owner = players.find(p => p.id === t.owner);
    return owner?.faction === 'attacker';
  });

  const defenseTokens = areaState.tokens.filter((t: Token) => {
    const owner = players.find(p => p.id === t.owner);
    return owner?.faction === 'defender';
  });
  
  // 统计防御卡牌数量
  const defenseCardCount = areaState.defenses.length;
  
  // 获取控制者信息
  const controller = areaState.controlledBy ? players.find(p => p.id === areaState.controlledBy) : null;
  const controlColor = areaState.controlStrength > 1 ? 'bg-red-600/80' : areaState.controlStrength < -1 ? 'bg-blue-600/80' : 'bg-slate-600/80';
  const controlText = areaState.controlStrength > 1 ? '攻击方控制' : areaState.controlStrength < -1 ? '防御方控制' : '争夺中';
  
  return (
    <div 
      onClick={onClick}
      className={`
        relative rounded-lg border-2 p-3 cursor-pointer
        bg-gradient-to-br ${areaColors[areaType]}
        flex flex-col min-h-[140px]
        hover:brightness-110 hover:scale-[1.02]
        transition-all duration-200
        group
        ${areaState.controlStrength > 1 ? 'ring-2 ring-red-500 ring-opacity-70' : ''}
        ${areaState.controlStrength < -1 ? 'ring-2 ring-blue-500 ring-opacity-70' : ''}
      `}
    >
      {/* 点击查看提示 */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Eye className="w-4 h-4 text-white/60" />
      </div>
      
      {/* 区域标题 */}
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-white/80" />
        <span className="text-white font-bold">{areaNames[areaType]}</span>
      </div>
      
      {/* 控制状态 */}
      {areaState.controlStrength !== 0 && (
        <div className={`
          absolute top-1 left-1 px-2 py-0.5 rounded text-[10px] text-white
          ${controlColor}
          animate-pulse
        `}>
          {controlText}
        </div>
      )}
      
      {/* 控制者信息 */}
      {controller && (
        <div className="absolute bottom-1 right-1 text-[10px] text-white/70">
          控制者: {controller.name}
        </div>
      )}
      
      {/* 标记显示 */}
      <div className="flex-1 flex flex-wrap gap-1 content-start">
        {/* 攻击方标记 */}
        {attackTokens.map((token: Token, i: number) => (
          <TokenBadge key={`atk-${i}`} type={token.type} faction="attacker" />
        ))}

        {/* 防御方标记 */}
        {defenseTokens.map((token: Token, i: number) => (
          <TokenBadge key={`def-${i}`} type={token.type} faction="defender" />
        ))}
        
        {/* 防御卡牌 */}
        {areaState.defenses.map((_def: any, i: number) => (
          <div
            key={`def-card-${i}`}
            className="px-2 py-1 bg-blue-600/80 rounded text-[10px] text-white"
          >
            防御
          </div>
        ))}
      </div>
      
      {/* 标记数量统计 */}
      <div className="mt-2 flex justify-between text-[10px]">
        <div className="flex gap-2">
          {attackTokens.length > 0 && (
            <span className="text-red-400">
              威胁: {attackTokens.length}
            </span>
          )}
          {defenseTokens.length > 0 && (
            <span className="text-blue-400">
              防护: {defenseTokens.length}
            </span>
          )}
        </div>
        {defenseCardCount > 0 && (
          <span className="text-green-400">
            卡牌: {defenseCardCount}
          </span>
        )}
      </div>
      
      {/* 控制强度指示器 */}
      {areaState.controlStrength !== 0 && (
        <div className="mt-1 h-1 bg-slate-800/80 rounded-full overflow-hidden">
          <div 
            className={`
              h-full transition-all duration-500 ease-out
              ${areaState.controlStrength > 0 ? 'bg-red-600' : 'bg-blue-600'}
            `}
            style={{
              width: `${Math.min(Math.abs(areaState.controlStrength) * 20, 100)}%`,
              transform: areaState.controlStrength < 0 ? 'translateX(-100%)' : 'none'
            }}
          />
        </div>
      )}
    </div>
  );
}

// 标记徽章
function TokenBadge({ type }: { type: string; faction: Faction }) {
  const tokenColors: Record<string, string> = {
    '权限标记': 'bg-purple-600',
    'APT控制标记': 'bg-rose-700',
    'CC攻击标记': 'bg-red-600',
    '恶意载荷标记': 'bg-orange-600',
    '监听标记': 'bg-yellow-600',
    '恶意二维码标记': 'bg-pink-600',
    '应用风险标记': 'bg-cyan-600',
    'XSS载荷标记': 'bg-indigo-600',
    '水坑钓鱼标记': 'bg-teal-600',
    '恶意脚本标记': 'bg-lime-600',
    '潜伏威胁标记': 'bg-fuchsia-600'
  };
  
  const tokenIcons: Record<string, string> = {
    '权限标记': '👑',
    'APT控制标记': '☠️',
    'CC攻击标记': '💥',
    '恶意载荷标记': '🦠',
    '监听标记': '👂',
    '恶意二维码标记': '🔲',
    '应用风险标记': '📱',
    'XSS载荷标记': '💉',
    '水坑钓鱼标记': '🎣',
    '恶意脚本标记': '📜',
    '潜伏威胁标记': '👁️'
  };
  
  return (
    <div 
      className={`
        px-1.5 py-0.5 rounded text-[10px] text-white
        ${tokenColors[type] || 'bg-slate-600'}
        flex items-center gap-1
        animate-pulse
      `}
      title={type}
    >
      <span>{tokenIcons[type] || '●'}</span>
      <span className="truncate max-w-[60px]">{type.slice(0, 2)}</span>
    </div>
  );
}

// 获取阶段名称
function getPhaseName(phase: string): string {
  const phaseNames: Record<string, string> = {
    judgment: '判定阶段',
    recovery: '恢复阶段',
    draw: '抽牌阶段',
    action: '行动阶段',
    response: '响应阶段',
    discard: '弃牌阶段',
    end: '结束阶段',
    planning: '策略规划',
    resolution: '对抗判定',
    cleanup: '状态更新',
    victory_check: '胜利检查',
    ended: '游戏结束'
  };
  return phaseNames[phase] || phase;
}

export default GameBoard;
