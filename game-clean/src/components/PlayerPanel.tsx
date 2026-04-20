import type { Player } from '@/types/gameRules';
import { ResourceBar } from './ResourceBar';
import { CardHand } from './CardHand';
import { Button } from '@/components/ui/button';
import { User, Bot, ChevronRight, Clock, Zap, Shield, Target, Package, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  selectedCardIndex: number | null;
  onCardSelect: (index: number) => void;
  onEndTurn: () => void;
  waitingForTurn?: boolean;
}

export function PlayerPanel({
  player,
  isCurrentPlayer,
  selectedCardIndex,
  onCardSelect,
  onEndTurn,
  waitingForTurn = false
}: PlayerPanelProps) {
  // 行动点显示
  const remainingActions = player.remainingActions ?? 0;
  const maxActions = player.maxActions ?? 3;
  
  return (
    <div className={cn(
      'bg-slate-900/90 rounded-lg p-4 transition-all duration-300',
      isCurrentPlayer && 'ring-2 ring-yellow-400'
    )}>
      {/* 玩家信息头部 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* 头像 */}
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            player.faction === 'attacker' ? 'bg-red-600' : 'bg-blue-600',
            isCurrentPlayer && 'ring-2 ring-yellow-400 animate-pulse'
          )}>
            {player.isAI ? (
              <Bot className="w-5 h-5 text-white" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          
          {/* 玩家名称和阵营 */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{player.name}</span>
              {player.isAI && (
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                  AI
                </span>
              )}
            </div>
            <span className={cn(
              'text-xs',
              player.faction === 'attacker' ? 'text-red-400' : 'text-blue-400'
            )}>
              {player.faction === 'attacker' ? '攻击方' : '防御方'}
            </span>
          </div>
        </div>
        
        {/* 资源显示 */}
        <ResourceBar 
          resources={player.resources} 
          isActive={isCurrentPlayer}
        />
      </div>
      
      {/* 【v16.0重构】权限资源显示 - 核心血量系统 (0-75) */}
      <div className="mb-3 p-2 bg-slate-800/50 rounded-lg">
        {player.faction === 'attacker' ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-red-400" />
                <span className="text-xs text-slate-400">渗透等级</span>
              </div>
              <span className={cn(
                "text-xs font-bold",
                (player.infiltrationLevel || 0) >= 75 ? "text-red-400 animate-pulse" : "text-red-300"
              )}>
                {player.infiltrationLevel || 0}/75
              </span>
            </div>
            {/* 渗透等级进度条 - v16.0: 范围0-75 */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  (player.infiltrationLevel || 0) >= 75 ? 'bg-red-500 animate-pulse' : 'bg-red-600'
                )}
                style={{ width: `${Math.min(100, ((player.infiltrationLevel || 0) / 75) * 100)}%` }}
              />
            </div>
            {(player.infiltrationLevel || 0) >= 60 && (
              <div className="mt-1 text-[10px] text-red-400 text-center">
                {(player.infiltrationLevel || 0) >= 75 ? '【完全渗透 - 胜利条件达成】' : '接近完全渗透！'}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-slate-400">安全等级</span>
              </div>
              <span className={cn(
                "text-xs font-bold",
                (player.safetyLevel || 0) >= 75 ? "text-blue-400 animate-pulse" : "text-blue-300"
              )}>
                {player.safetyLevel || 0}/75
              </span>
            </div>
            {/* 安全等级进度条 - v16.0: 范围0-75 */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  (player.safetyLevel || 0) >= 75 ? 'bg-blue-500 animate-pulse' : 'bg-blue-600'
                )}
                style={{ width: `${Math.min(100, ((player.safetyLevel || 0) / 75) * 100)}%` }}
              />
            </div>
            {(player.safetyLevel || 0) >= 60 && (
              <div className="mt-1 text-[10px] text-blue-400 text-center">
                {(player.safetyLevel || 0) >= 75 ? '【绝对安全 - 胜利条件达成】' : '接近绝对安全！'}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 【Trae优化】增强行动点显示 - 添加进度条样式 */}
      <div className="mb-3 p-2 bg-slate-800/50 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Zap className={cn(
              'w-3 h-3',
              remainingActions > 0 ? 'text-yellow-400' : 'text-slate-600'
            )} />
            <span className="text-xs text-slate-400">行动点</span>
          </div>
          <span className={cn(
            "text-xs font-bold",
            remainingActions === 0 ? "text-red-400" : 
            remainingActions === 1 ? "text-yellow-400" : "text-green-400"
          )}>
            {remainingActions}/{maxActions}
          </span>
        </div>
        
        {/* 【Trae优化】行动点进度条 */}
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full transition-all duration-300',
              remainingActions === 0 ? 'bg-red-500 w-0' :
              remainingActions === 1 ? 'bg-yellow-500 w-1/3' :
              remainingActions === 2 ? 'bg-green-400 w-2/3' :
              'bg-green-500 w-full'
            )}
            style={{ width: `${(remainingActions / maxActions) * 100}%` }}
          />
        </div>
        
        {/* 【Trae优化】行动点状态提示 */}
        {remainingActions === 0 && (
          <div className="mt-1 text-[10px] text-red-400 text-center">
            行动点耗尽 - 请结束回合
          </div>
        )}
        {remainingActions === maxActions && isCurrentPlayer && (
          <div className="mt-1 text-[10px] text-green-400 text-center">
            行动点充足 - 可以使用卡牌
          </div>
        )}
      </div>
      
      {/* 当前玩家操作区 */}
      {isCurrentPlayer && (
        <div className="mb-3">
          <Button
            variant={waitingForTurn ? 'outline' : 'default'}
            size="sm"
            onClick={onEndTurn}
            disabled={waitingForTurn}
            className="w-full text-xs"
          >
            {waitingForTurn ? (
              <>
                <Clock className="w-3 h-3 mr-1" />
                等待对手...
              </>
            ) : remainingActions === 0 ? (
              <>
                <Clock className="w-3 h-3 mr-1" />
                行动点耗尽 - 结束回合
              </>
            ) : (
              <>
                <ChevronRight className="w-3 h-3 mr-1" />
                结束回合 (剩余{remainingActions}点)
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* 【Trae优化】增强牌库信息显示 - 添加进度条和视觉反馈 */}
      <div className="mb-3 p-2 bg-slate-800/50 rounded-lg">
        <div className="flex justify-between text-xs mb-2">
          <div className="flex items-center gap-1" title="手牌">
            <Target className="w-3 h-3 text-blue-400" />
            <span className="text-slate-300">手牌: {player.hand.length}</span>
          </div>
          <div className="flex items-center gap-1" title="牌库">
            <Package className="w-3 h-3 text-green-400" />
            <span className="text-slate-300">牌库: {player.deck.length}</span>
          </div>
          <div className="flex items-center gap-1" title="弃牌">
            <Trash2 className="w-3 h-3 text-orange-400" />
            <span className="text-slate-300">弃牌: {player.discard.length}</span>
          </div>
        </div>
        
        {/* 【Trae优化】添加牌库状态进度条 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-8">牌库</span>
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, (player.deck.length / 20) * 100)}%`,
                  opacity: player.deck.length < 5 ? 0.5 : 1
                }}
              />
            </div>
            <span className={cn(
              "text-[10px] w-6 text-right",
              player.deck.length < 5 ? "text-red-400" : "text-slate-400"
            )}>
              {player.deck.length}
            </span>
          </div>
        </div>
        
        {/* 【Trae优化】显示总卡牌数 */}
        <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-between text-[10px] text-slate-500">
          <span>总卡牌: {player.hand.length + player.deck.length + player.discard.length}</span>
          {player.deck.length === 0 && player.discard.length > 0 && (
            <span className="text-yellow-400">即将洗牌</span>
          )}
        </div>
      </div>
      
      {/* 手牌区域 */}
      <CardHand
        cards={player.hand}
        selectedIndex={selectedCardIndex}
        onCardSelect={onCardSelect}
        disabled={!isCurrentPlayer || waitingForTurn || remainingActions === 0}
      />
    </div>
  );
}

// 对手面板（简化版）
interface OpponentPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
}

export function OpponentPanel({ player, isCurrentPlayer }: OpponentPanelProps) {
  return (
    <div className={cn(
      'bg-slate-900/80 rounded-lg p-3 transition-all duration-300',
      isCurrentPlayer && 'ring-2 ring-yellow-400'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 头像 */}
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            player.faction === 'attacker' ? 'bg-red-600' : 'bg-blue-600',
            isCurrentPlayer && 'ring-2 ring-yellow-400'
          )}>
            {player.isAI ? (
              <Bot className="w-4 h-4 text-white" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          
          {/* 玩家信息 */}
          <div>
            <div className="flex items-center gap-1">
              <span className="text-white text-sm font-bold">{player.name}</span>
              {player.isAI && (
                <span className="text-[9px] bg-slate-700 px-1 rounded text-slate-300">
                  AI
                </span>
              )}
            </div>
            <ResourceBar resources={player.resources} showLabels={false} size="sm" />
          </div>
        </div>
        
        {/* 行动点指示器 */}
        <div className="flex items-center gap-1">
          {player.remainingActions !== undefined && (
            <div className="flex gap-0.5 mr-2">
              {Array.from({ length: player.maxActions || 3 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    i < (player.remainingActions || 0) ? 'bg-green-500' : 'bg-slate-700'
                  )}
                />
              ))}
            </div>
          )}
          <div className="w-6 h-8 bg-slate-700 rounded border border-slate-600 flex items-center justify-center">
            <span className="text-xs text-white">{player.hand.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerPanel;
