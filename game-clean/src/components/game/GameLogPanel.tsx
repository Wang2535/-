/**
 * 游戏日志面板组件
 * 实现翻页式日志展示，每一轮游戏内容为单独一页
 * 包含详细的日志记录：玩家卡牌操作、游戏流程、资源变动、卡牌效果判定
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  User, 
  Zap, 
  Sword, 
  Shield, 
  MapPin, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  History,
  Layers
} from 'lucide-react';
import type { GameLogEntry, TurnPhase } from '@/types/gameRules';
import { COMPLETE_CARD_DATABASE } from '@/data/completeCardDatabase';

// 日志类型图标映射
const LOG_TYPE_ICONS: Record<string, React.ReactNode> = {
  card_play: <Zap className="w-3 h-3" />,
  phase_change: <Clock className="w-3 h-3" />,
  resource_change: <Sparkles className="w-3 h-3" />,
  area_control: <MapPin className="w-3 h-3" />,
  judgment: <Sword className="w-3 h-3" />,
  combo: <Sparkles className="w-3 h-3" />,
  area_bonus: <Shield className="w-3 h-3" />,
  turn_start: <User className="w-3 h-3" />,
  round_start: <Clock className="w-3 h-3" />,
  draw_cards: <Layers className="w-3 h-3" />,
  resource_recovery: <Sparkles className="w-3 h-3" />,
  judgment_result: <Sword className="w-3 h-3" />,
  delayed_judgment_set: <Clock className="w-3 h-3" />,
  immediate_judgment_triggered: <Zap className="w-3 h-3" />,
  turn_end: <History className="w-3 h-3" />,
  tech_level_up: <Sparkles className="w-3 h-3" />,
  combo_effect: <Sparkles className="w-3 h-3" />,
  round_state_applied: <BookOpen className="w-3 h-3" />,
  round_state_effect: <BookOpen className="w-3 h-3" />,
  default: <Clock className="w-3 h-3" />,
};

// 日志类型颜色映射
const LOG_TYPE_COLORS: Record<string, string> = {
  card_play: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  phase_change: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  resource_change: 'bg-green-500/20 text-green-400 border-green-500/30',
  area_control: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  judgment: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  combo: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  area_bonus: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  turn_start: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  round_start: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  draw_cards: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  resource_recovery: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  judgment_result: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  delayed_judgment_set: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  immediate_judgment_triggered: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  turn_end: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  tech_level_up: 'bg-gold-500/20 text-yellow-400 border-yellow-500/30',
  combo_effect: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  round_state_applied: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  round_state_effect: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  default: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

// 阶段名称映射
const PHASE_NAMES: Record<TurnPhase, string> = {
  judgment: '判定',
  recovery: '恢复',
  draw: '摸牌',
  action: '行动',
  response: '响应',
  discard: '弃牌',
  end: '结束',
};

interface GameLogPanelProps {
  logs: GameLogEntry[];
  currentRound: number;
  currentPhase: TurnPhase;
  maxHeight?: string;
  onClear?: () => void;
}

interface CardDetailModalProps {
  cardId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// 卡牌详情弹窗
function CardDetailModal({ cardId, isOpen, onClose }: CardDetailModalProps) {
  if (!isOpen || !cardId) return null;

  const card = COMPLETE_CARD_DATABASE[cardId];
  if (!card) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
          <p className="text-slate-400">找不到卡牌信息</p>
        </div>
      </div>
    );
  }

  const cost = card.cost as Record<string, number> || {};

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{card.name}</h3>
            <p className="text-sm text-slate-400">{card.card_code}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 卡牌信息 */}
        <div className="space-y-4">
          {/* 阵营和稀有度 */}
          <div className="flex gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                card.faction === 'attack' && 'border-red-500/50 text-red-400',
                card.faction === 'defense' && 'border-blue-500/50 text-blue-400',
                card.faction === 'neutral' && 'border-slate-500/50 text-slate-400',
              )}
            >
              {card.faction === 'attack' ? '进攻' : card.faction === 'defense' ? '防御' : '通用'}
            </Badge>
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
              T{card.techLevel}
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
              {card.rarity}
            </Badge>
          </div>

          {/* 资源消耗 */}
          {(cost.compute > 0 || cost.funds > 0 || cost.information > 0 || cost.access > 0) && (
            <div className="bg-slate-800 p-3 rounded-lg">
              <p className="text-sm text-slate-400 mb-2">资源消耗</p>
              <div className="flex gap-3">
                {cost.compute > 0 && (
                  <span className="text-cyan-400 text-sm">算力 {cost.compute}</span>
                )}
                {cost.funds > 0 && (
                  <span className="text-yellow-400 text-sm">资金 {cost.funds}</span>
                )}
                {cost.information > 0 && (
                  <span className="text-green-400 text-sm">信息 {cost.information}</span>
                )}
                {cost.access > 0 && (
                  <span className="text-purple-400 text-sm">权限 {cost.access}</span>
                )}
              </div>
            </div>
          )}

          {/* 描述 */}
          <div className="bg-slate-800 p-3 rounded-lg">
            <p className="text-sm text-slate-300 leading-relaxed">{card.description}</p>
          </div>

          {/* 效果 */}
          {card.effects && card.effects.length > 0 && (
            <div>
              <p className="text-sm text-slate-400 mb-2">效果</p>
              <div className="space-y-1">
                {card.effects.map((effect, idx) => (
                  <div key={idx} className="text-sm text-slate-300">
                    • {(effect as { description?: string }).description || '特殊效果'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 连击效果 */}
          {card.comboEffect && (
            <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg">
              <p className="text-sm text-orange-400 font-medium mb-1">连击效果</p>
              <p className="text-sm text-slate-300">{card.comboEffect.description}</p>
              <p className="text-xs text-orange-400 mt-1">加成: +{card.comboEffect.bonus}</p>
            </div>
          )}

          {/* 判定难度 */}
          {card.difficulty && card.difficulty > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">判定难度:</span>
              <div className="flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-4 h-4 rounded-sm',
                      i < card.difficulty! ? 'bg-yellow-500' : 'bg-slate-700'
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function GameLogPanel({ 
  logs, 
  currentRound, 
  currentPhase,
  maxHeight = '400px',
  onClear 
}: GameLogPanelProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUserNavigating, setIsUserNavigating] = useState(false); // 标记用户是否正在手动导航
  const userNavigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // 按轮次分组日志
  const logsByRound = useMemo(() => {
    const grouped = new Map<number, GameLogEntry[]>();
    
    logs.forEach(log => {
      // 使用日志中的round字段，如果没有则使用currentRound，最后默认为1
      const round = log.round || currentRound || 1;
      if (!grouped.has(round)) {
        grouped.set(round, []);
      }
      grouped.get(round)!.push(log);
    });
    
    return grouped;
  }, [logs, currentRound]);

  // 获取所有轮次列表
  const rounds = useMemo(() => {
    const roundKeys = Array.from(logsByRound.keys()).sort((a, b) => a - b);
    // 确保当前轮次在列表中（即使该轮次还没有日志）
    if (!roundKeys.includes(currentRound)) {
      roundKeys.push(currentRound);
      roundKeys.sort((a, b) => a - b);
    }
    return roundKeys;
  }, [logsByRound, currentRound]);

  // 当前页的日志
  const currentPageLogs = useMemo(() => {
    const pageLogs = logsByRound.get(currentPage) || [];
    return pageLogs;
  }, [logsByRound, currentPage]);

  // 自动滚动到底部（当切换页面时）
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [currentPage]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (userNavigationTimerRef.current) {
        clearTimeout(userNavigationTimerRef.current);
      }
    };
  }, []);

  // 当有新日志时，自动跳转到最新轮次（仅在用户没有手动导航时）
  useEffect(() => {
    if (logs.length > 0 && !isUserNavigating) {
      // 获取最新日志的轮次
      const latestLog = logs[logs.length - 1];
      const latestRound = latestLog?.round || currentRound;
      if (latestRound !== currentPage) {
        setCurrentPage(latestRound);
      }
    }
  }, [logs, currentRound, currentPage, isUserNavigating]);

  const toggleExpand = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  // 处理长按/右键点击显示卡牌详情
  const handleCardInteraction = (cardId: string | undefined) => {
    if (!cardId) return;
    setSelectedCardId(cardId);
    setIsCardModalOpen(true);
  };

  const handleMouseDown = (cardId: string | undefined) => {
    if (!cardId) return;
    const timer = setTimeout(() => {
      handleCardInteraction(cardId);
    }, 3000); // 3秒长按
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, cardId: string | undefined) => {
    e.preventDefault();
    handleCardInteraction(cardId);
  };

  // 格式化时间戳
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  // 格式化完整时间
  const formatFullTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  // 获取日志类型显示
  const getLogTypeDisplay = (action: string) => {
    const typeMap: Record<string, string> = {
      card_play: '出牌',
      phase_change: '阶段',
      resource_change: '资源',
      area_control: '区域',
      judgment: '判定',
      combo: '连击',
      area_bonus: '加成',
      turn_start: '回合开始',
      round_start: '轮次开始',
      draw_cards: '摸牌',
      resource_recovery: '资源恢复',
      judgment_result: '判定结果',
      delayed_judgment_set: '延迟判定',
      immediate_judgment_triggered: '即时判定',
      turn_end: '回合结束',
      tech_level_up: '科技升级',
      combo_effect: '连击效果',
      round_state_applied: '轮次状态',
      round_state_effect: '状态效果',
    };
    return typeMap[action] || '事件';
  };

  // 获取日志详情显示
  const getLogDetailDisplay = (key: string, value: unknown): { label: string; display: string } => {
    const labelMap: Record<string, string> = {
      cardId: '卡牌ID',
      cardName: '卡牌名称',
      playerId: '玩家ID',
      playerName: '玩家名称',
      targetPlayerId: '目标玩家ID',
      difficulty: '判定难度',
      judgmentId: '判定ID',
      actionPoints: '行动点数',
      baseActionPoints: '基础行动点',
      areaBonus: '区域加成',
      oldLevel: '旧等级',
      newLevel: '新等级',
      level: '当前等级',
      count: '数量',
      handLimit: '手牌上限',
      faction: '阵营',
      infiltrationBonus: '渗透加成',
      safetyBonus: '安全加成',
      actionPointBonus: '行动点加成',
      round: '轮次',
      turn: '回合',
      phase: '阶段',
      resourceType: '资源类型',
      beforeValue: '变动前',
      afterValue: '变动后',
      changeAmount: '变动量',
      reason: '原因',
      success: '成功',
      result: '结果',
    };

    let display = '';
    if (typeof value === 'object' && value !== null) {
      display = JSON.stringify(value);
    } else if (typeof value === 'boolean') {
      display = value ? '是' : '否';
    } else {
      display = String(value);
    }

    return { label: labelMap[key] || key, display };
  };

  // 设置用户导航状态（3秒内不自动跳转）
  const setUserNavigatingState = () => {
    setIsUserNavigating(true);
    // 清除之前的定时器
    if (userNavigationTimerRef.current) {
      clearTimeout(userNavigationTimerRef.current);
    }
    // 3秒后恢复自动跳转
    userNavigationTimerRef.current = setTimeout(() => {
      setIsUserNavigating(false);
    }, 3000);
  };

  // 切换到上一页
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setUserNavigatingState();
      setCurrentPage(currentPage - 1);
    }
  };

  // 切换到下一页
  const goToNextPage = () => {
    if (currentPage < rounds.length) {
      setUserNavigatingState();
      setCurrentPage(currentPage + 1);
    }
  };

  // 跳转到指定页
  const goToPage = (page: number) => {
    if (page >= 1 && page <= rounds.length) {
      setUserNavigatingState();
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="bg-slate-900 rounded-lg shadow-lg overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">📜</span>
            <h3 className="font-bold text-white">游戏日志</h3>
            <Badge variant="outline" className="text-xs">
              第{currentRound}轮 · {PHASE_NAMES[currentPhase]}阶段
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              共 {logs.length} 条记录
            </span>
            {onClear && (
              <button
                onClick={onClear}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                清空
              </button>
            )}
          </div>
        </div>

        {/* 翻页控制栏 */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="h-7 px-2 text-xs border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
          >
            <ChevronLeft className="w-3 h-3 mr-1" />
            上一轮
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">轮次:</span>
            <div className="flex gap-1">
              {rounds.map((round) => (
                <button
                  key={round}
                  onClick={() => goToPage(round)}
                  className={cn(
                    'w-6 h-6 rounded text-xs font-medium transition-colors',
                    currentPage === round
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  )}
                >
                  {round}
                </button>
              ))}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage >= rounds.length}
            className="h-7 px-2 text-xs border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
          >
            下一轮
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* 当前页信息 */}
        <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">第 {currentPage} 轮日志</span>
              <Badge variant="outline" className="text-xs">
                {currentPageLogs.length} 条记录
              </Badge>
            </div>
            <span className="text-xs text-slate-500">
              {currentPageLogs.length > 0 && formatFullTime(currentPageLogs[0].timestamp)}
            </span>
          </div>
        </div>

        {/* 日志列表 */}
        <ScrollArea className="flex-1 p-2" style={{ maxHeight }}>
          <div ref={scrollViewportRef} className="space-y-1 overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 1rem)` }}>
            {currentPageLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">该轮次暂无日志记录</p>
              </div>
            ) : (
              currentPageLogs.map((log, index) => {
                const isExpanded = expandedLogs.has(log.id);
                const hasDetails = log.details && Object.keys(log.details).length > 0;
                const cardId = log.details?.cardId as string | undefined;

                return (
                  <div
                    key={log.id}
                    className={cn(
                      'group rounded-lg transition-all duration-200',
                      index % 2 === 0 ? 'bg-slate-800/30' : 'bg-transparent',
                      'hover:bg-slate-800/60'
                    )}
                    onMouseDown={() => handleMouseDown(cardId)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onContextMenu={(e) => handleContextMenu(e, cardId)}
                  >
                    {/* 主要内容 */}
                    <div className="flex items-start gap-2 p-2">
                      {/* 类型图标 */}
                      <div className={cn(
                        'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center border',
                        LOG_TYPE_COLORS[log.action] || LOG_TYPE_COLORS.default
                      )}>
                        {LOG_TYPE_ICONS[log.action] || LOG_TYPE_ICONS.default}
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* 时间 */}
                          <span className="text-xs text-slate-500">
                            {formatTime(log.timestamp)}
                          </span>

                          {/* 轮次和阶段 */}
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                            轮{log.round} · {PHASE_NAMES[log.phase]}
                          </Badge>

                          {/* 类型标签 */}
                          <span className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded border',
                            LOG_TYPE_COLORS[log.action] || LOG_TYPE_COLORS.default
                          )}>
                            {getLogTypeDisplay(log.action)}
                          </span>
                        </div>

                        {/* 消息 */}
                        <p className={cn(
                          'text-sm mt-1',
                          cardId ? 'cursor-pointer text-blue-400 hover:text-blue-300' : 'text-slate-300'
                        )}>
                          {log.message}
                          {cardId && (
                            <span className="text-xs text-slate-500 ml-2">
                              (右键或长按3秒查看卡牌)
                            </span>
                          )}
                        </p>
                      </div>

                      {/* 展开按钮 */}
                      {hasDetails && (
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="flex-shrink-0 p-1 hover:bg-slate-700 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* 详细信息 */}
                    {isExpanded && hasDetails && log.details && (
                      <div className="px-2 pb-2 pl-10">
                        <div className="bg-slate-800/80 rounded p-2 text-xs space-y-1">
                          {Object.entries(log.details).map(([key, value]) => {
                            if (key === 'message' || key === 'cardId') return null;
                            const { label, display } = getLogDetailDisplay(key, value);
                            return (
                              <div key={key} className="flex gap-2">
                                <span className="text-slate-500 min-w-[80px]">{label}:</span>
                                <span className="text-slate-300 break-all">
                                  {display}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 卡牌详情弹窗 */}
      <CardDetailModal
        cardId={selectedCardId}
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setSelectedCardId(null);
        }}
      />
    </>
  );
}

export default GameLogPanel;
