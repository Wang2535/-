/**
 * 判定过程面板组件
 * 
 * 功能：
 * 1. 美观的判定过程展示
 * 2. 支持骰子判定和RPS判定
 * 3. 支持单方判定和双方判定
 * 4. 判定开始时才弹出，完成后自动关闭
 * 5. 所有玩家都能看到判定过程
 * 6. RPS判定支持玩家选择交互
 * 
 * 设计特点：
 * - 赛博朋克风格，深色主题
 * - 发光边框效果
 * - 流畅的动画过渡
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DICE_JUDGMENT_CONFIG } from '@/types/gameConstants';
import type { JudgmentEventData, JudgmentResultData } from '@/engine/JudgmentEventBus';
import { JudgmentEventBus } from '@/engine/JudgmentEventBus';
import { JudgmentEffectApplier } from '@/engine/JudgmentEffectApplier';
import type { GameState } from '@/types/gameRules';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sword, Shield, Sparkles, Zap, Target, Dice5, Hand, User } from 'lucide-react';

type RPSChoice = 'rock' | 'paper' | 'scissors';
type JudgmentPhase = 'intro' | 'waiting' | 'rolling' | 'revealing' | 'result';

interface JudgmentProcessPanelProps {
  /** 是否显示（由事件总线控制） */
  isOpen: boolean;
  /** 判定事件数据 */
  eventData: JudgmentEventData | null;
  /** 当前玩家ID */
  currentPlayerId?: string;
  /** 当前游戏状态 */
  gameState?: GameState;
  /** 判定完成回调 */
  onComplete?: (result: JudgmentResultData, newGameState?: GameState) => void;
  /** RPS选择回调 */
  onRPSChoice?: (choice: RPSChoice) => void;
  /** 游戏状态更新回调 */
  onGameStateUpdate?: (newGameState: GameState) => void;
}

/**
 * 判定过程面板组件
 */
export const JudgmentProcessPanel: React.FC<JudgmentProcessPanelProps> = ({
  isOpen,
  eventData,
  currentPlayerId,
  gameState,
  onComplete,
  onRPSChoice,
  onGameStateUpdate,
}) => {
  const [phase, setPhase] = useState<JudgmentPhase>('intro');
  const [timeLeft, setTimeLeft] = useState(3);
  const [result, setResult] = useState<JudgmentResultData | null>(null);
  
  // 骰子判定状态
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState<number[]>([]);
  
  // RPS判定状态
  const [initiatorChoice, setInitiatorChoice] = useState<RPSChoice | null>(null);
  const [targetChoice, setTargetChoice] = useState<RPSChoice | null>(null);
  const [rpsRevealed, setRpsRevealed] = useState(false);
  const [hasMadeChoice, setHasMadeChoice] = useState(false);
  const [playerChoice, setPlayerChoice] = useState<RPSChoice | null>(null);

  // 判断是否为单方判定（只有当前玩家参与）
  const isSinglePlayer = !eventData?.targetId || eventData.initiatorId === eventData.targetId;
  
  // 判断当前玩家是发起者还是目标
  const isInitiator = currentPlayerId === eventData?.initiatorId;
  const isTarget = currentPlayerId === eventData?.targetId;

  // 执行骰子判定
  const performDiceJudgment = useCallback((): JudgmentResultData => {
    if (!eventData) throw new Error('No event data');
    
    const difficulty = eventData.difficulty || 3;
    const modifier = eventData.modifier || 0;
    const roll = Math.floor(Math.random() * 6) + 1;
    const modifiedRoll = roll + modifier;
    
    // 大成功：掷出6且难度≤3
    const isCriticalSuccess = roll === 6 && difficulty <= 3;
    // 大失败：掷出1且难度≥4
    const isCriticalFailure = roll === 1 && difficulty >= 4;
    const success = modifiedRoll > difficulty || isCriticalSuccess;
    
    let resultType: JudgmentResultData['resultType'];
    let detail: string;
    
    if (isCriticalSuccess) {
      resultType = 'critical_success';
      detail = `🎉 大成功！掷出${roll}点（难度${difficulty}），效果翻倍！`;
    } else if (isCriticalFailure) {
      resultType = 'critical_failure';
      detail = `💥 大失败！掷出${roll}点（难度${difficulty}），效果失效！`;
    } else if (success) {
      resultType = 'success';
      detail = `✅ 成功！掷出${roll}点（难度${difficulty}）`;
    } else {
      resultType = 'failure';
      detail = `❌ 失败！掷出${roll}点（难度${difficulty}）`;
    }

    return {
      id: eventData.id,
      success,
      resultType,
      detail,
      roll,
      appliedEffects: success ? eventData.onSuccess : eventData.onFailure,
    };
  }, [eventData]);

  // 执行RPS判定
  const performRPSJudgment = useCallback((pChoice: RPSChoice, oChoice: RPSChoice): JudgmentResultData => {
    if (!eventData) throw new Error('No event data');
    
    setInitiatorChoice(pChoice);
    setTargetChoice(oChoice);
    
    // 判定胜负（从发起者视角）
    let success: boolean;
    let isDraw = false;
    let detail: string;
    
    if (pChoice === oChoice) {
      isDraw = true;
      success = false;
      detail = '🤝 平局！双方选择相同';
    } else if (
      (pChoice === 'rock' && oChoice === 'scissors') ||
      (pChoice === 'paper' && oChoice === 'rock') ||
      (pChoice === 'scissors' && oChoice === 'paper')
    ) {
      success = true;
      detail = `🎉 ${eventData.initiatorName}获胜！${getChoiceName(pChoice)}胜${getChoiceName(oChoice)}`;
    } else {
      success = false;
      detail = `😔 ${eventData.targetName}获胜！${getChoiceName(oChoice)}胜${getChoiceName(pChoice)}`;
    }

    return {
      id: eventData.id,
      success,
      resultType: isDraw ? 'failure' : (success ? 'success' : 'failure'),
      detail,
      rpsChoices: {
        initiator: pChoice,
        target: oChoice,
      },
      appliedEffects: success ? eventData.onSuccess : eventData.onFailure,
    };
  }, [eventData]);

  // 处理RPS选择
  const handleRPSChoice = (choice: RPSChoice) => {
    setPlayerChoice(choice);
    setHasMadeChoice(true);
    onRPSChoice?.(choice);
    
    // 模拟对手选择（实际应该由对手玩家选择）
    const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
    const opponentChoice = choices[Math.floor(Math.random() * 3)];
    
    // 延迟后揭示结果
    setTimeout(() => {
      const initiatorC = isInitiator ? choice : opponentChoice;
      const targetC = isInitiator ? opponentChoice : choice;
      
      const judgmentResult = performRPSJudgment(initiatorC, targetC);
      setResult(judgmentResult);
      setRpsRevealed(true);
      setPhase('result');
      
      JudgmentEventBus.emitJudgmentEnd(judgmentResult);
      
      // 应用判定效果到游戏状态
      let newGameState = gameState;
      if (gameState && eventData) {
        newGameState = JudgmentEffectApplier.applyJudgmentResult(
          gameState,
          judgmentResult,
          eventData.initiatorId,
          eventData.targetId
        );
        onGameStateUpdate?.(newGameState);
      }
      
      setTimeout(() => {
        onComplete?.(judgmentResult, newGameState);
      }, 3000);
    }, 1000);
  };

  // 开始判定流程
  useEffect(() => {
    if (!isOpen || !eventData) return;

    const startJudgment = async () => {
      // 阶段1：介绍（3秒）
      setPhase('intro');
      setTimeLeft(3);
      setHasMadeChoice(false);
      setPlayerChoice(null);
      setRpsRevealed(false);
      
      const introTimer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(introTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 阶段2：判定过程
      if (eventData.type === 'dice') {
        await performDiceRoll();
      } else {
        // RPS判定：等待玩家选择
        setPhase('waiting');
      }
    };

    startJudgment();
  }, [isOpen, eventData]);

  // 骰子滚动动画
  const performDiceRoll = async () => {
    setPhase('rolling');
    setIsRolling(true);
    setRollHistory([]);
    
    const animationDuration = DICE_JUDGMENT_CONFIG.ROLL_ANIMATION_DURATION;
    const intervalTime = 100;
    const totalFrames = animationDuration / intervalTime;
    
    for (let i = 0; i < totalFrames; i++) {
      const displayRoll = Math.floor(Math.random() * 6) + 1;
      setDiceRoll(displayRoll);
      setRollHistory(prev => [...prev.slice(-4), displayRoll]);
      await new Promise(resolve => setTimeout(resolve, intervalTime));
    }
    
    setIsRolling(false);
    
    // 生成最终结果
    const judgmentResult = performDiceJudgment();
    setResult(judgmentResult);
    setDiceRoll(judgmentResult.roll || null);
    setPhase('result');
    
    // 通知事件总线
    JudgmentEventBus.emitJudgmentEnd(judgmentResult);
    
    // 应用判定效果到游戏状态
    let newGameState = gameState;
    if (gameState && eventData) {
      newGameState = JudgmentEffectApplier.applyJudgmentResult(
        gameState,
        judgmentResult,
        eventData.initiatorId,
        eventData.targetId
      );
      onGameStateUpdate?.(newGameState);
    }
    
    // 延迟后关闭（传递更新后的游戏状态）
    setTimeout(() => {
      onComplete?.(judgmentResult, newGameState);
    }, 3000);
  };

  // 获取选择名称
  const getChoiceName = (choice: RPSChoice): string => {
    const names: Record<RPSChoice, string> = {
      rock: '石头',
      paper: '布',
      scissors: '剪刀',
    };
    return names[choice];
  };

  // 获取选择图标
  const getChoiceIcon = (choice: RPSChoice): string => {
    const icons: Record<RPSChoice, string> = {
      rock: '✊',
      paper: '✋',
      scissors: '✌️',
    };
    return icons[choice];
  };

  // 获取结果样式
  const getResultStyle = () => {
    if (!result) return 'from-gray-600 to-gray-700';
    switch (result.resultType) {
      case 'critical_success':
        return 'from-yellow-500 to-orange-600';
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'critical_failure':
        return 'from-red-600 to-red-800';
      case 'failure':
        return 'from-gray-600 to-gray-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  if (!isOpen || !eventData) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl animate-in zoom-in-95 duration-200">
        <Card className="bg-slate-900 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20 overflow-hidden">
          {/* 顶部发光条 */}
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
          
          {/* 标题区域 */}
          <div className="p-6 text-center border-b border-slate-700">
            <div className="flex items-center justify-center gap-3 mb-2 animate-in slide-in-from-top-2 duration-300">
              {eventData.type === 'dice' ? (
                <Dice5 className="w-8 h-8 text-cyan-400" />
              ) : (
                <Hand className="w-8 h-8 text-purple-400" />
              )}
              <h2 className="text-3xl font-bold text-white">
                {eventData.title}
              </h2>
            </div>
            <p className="text-slate-400">{eventData.description}</p>
            {eventData.cardName && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 rounded-full text-cyan-400 text-sm">
                <Sparkles className="w-4 h-4" />
                {eventData.cardName}
              </div>
            )}
            {/* 单方/双方判定标识 */}
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full text-slate-300 text-sm">
              <User className="w-4 h-4" />
              {isSinglePlayer ? '单方判定' : '双方对决'}
            </div>
          </div>

          {/* 对战信息 */}
          {!isSinglePlayer ? (
            // 双方判定：显示两个玩家
            <div className="flex items-center justify-between p-6 bg-slate-800/50">
              {/* 发起者 */}
              <div className="flex-1 text-center animate-in slide-in-from-left-4 duration-300">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 shadow-lg ${
                  isInitiator ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-yellow-500/30' : 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/30'
                }`}>
                  <Sword className="w-8 h-8 text-white" />
                </div>
                <div className="text-xl font-bold text-red-400">{eventData.initiatorName}</div>
                <div className="text-sm text-slate-500">发起者</div>
                {isInitiator && <div className="mt-1 text-xs text-yellow-400">(你)</div>}
              </div>

              {/* VS */}
              <div className="px-6 animate-in zoom-in duration-300">
                <div className="text-4xl font-black text-slate-600">VS</div>
              </div>

              {/* 目标 */}
              <div className="flex-1 text-center animate-in slide-in-from-right-4 duration-300">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 shadow-lg ${
                  isTarget ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-yellow-500/30' : 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/30'
                }`}>
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="text-xl font-bold text-blue-400">{eventData.targetName}</div>
                <div className="text-sm text-slate-500">目标</div>
                {isTarget && <div className="mt-1 text-xs text-yellow-400">(你)</div>}
              </div>
            </div>
          ) : (
            // 单方判定：只显示当前玩家
            <div className="flex items-center justify-center p-6 bg-slate-800/50">
              <div className="text-center animate-in zoom-in duration-300">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 mb-3 shadow-lg shadow-purple-500/30">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-400">{eventData.initiatorName}</div>
                <div className="text-sm text-slate-500">进行判定</div>
              </div>
            </div>
          )}

          {/* 判定展示区域 */}
          <div className="p-8 min-h-[300px] flex items-center justify-center">
            {phase === 'intro' && (
              <div className="text-center animate-in fade-in duration-300">
                <div className="text-6xl mb-4">⚡</div>
                <div className="text-2xl font-bold text-white mb-2">判定即将开始</div>
                <div className="text-slate-400">
                  {eventData.type === 'dice' 
                    ? (isSinglePlayer ? '准备投掷骰子' : '双方准备投掷') 
                    : (isSinglePlayer ? '准备猜拳' : '双方准备猜拳对决')}
                </div>
                <div className="mt-4 text-4xl font-bold text-cyan-400">{timeLeft}</div>
              </div>
            )}

            {phase === 'waiting' && eventData.type === 'rps' && (
              <div className="text-center">
                <div className="text-xl text-white mb-6">
                  {hasMadeChoice ? '等待对手选择...' : '请选择你的出拳'}
                </div>
                
                {!hasMadeChoice ? (
                  <div className="flex justify-center gap-4">
                    {(['rock', 'paper', 'scissors'] as RPSChoice[]).map((choice) => (
                      <Button
                        key={choice}
                        onClick={() => handleRPSChoice(choice)}
                        className="w-24 h-24 text-4xl bg-slate-700 hover:bg-slate-600 border-2 border-slate-500 hover:border-cyan-400 transition-all duration-200"
                      >
                        {getChoiceIcon(choice)}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-6xl animate-pulse">
                    {getChoiceIcon(playerChoice!)}
                  </div>
                )}
                
                <div className="mt-6 flex justify-center gap-8 text-slate-400">
                  <span>✊ 石头</span>
                  <span>✋ 布</span>
                  <span>✌️ 剪刀</span>
                </div>
              </div>
            )}

            {phase === 'rolling' && eventData.type === 'dice' && (
              <div className="text-center">
                {/* 历史记录 */}
                {rollHistory.length > 0 && (
                  <div className="flex justify-center gap-2 mb-6">
                    {rollHistory.slice(-5).map((roll, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-lg font-bold text-slate-400 animate-in zoom-in duration-200"
                      >
                        {roll}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 主骰子 */}
                <div
                  className={`w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-6xl font-bold text-white shadow-2xl shadow-cyan-500/50 ${isRolling ? 'animate-spin' : ''}`}
                >
                  {diceRoll || '🎲'}
                </div>
                
                <div className="mt-6 text-xl text-cyan-400 font-bold">投掷中...</div>
              </div>
            )}

            {phase === 'revealing' && eventData.type === 'rps' && (
              <div className="flex items-center justify-center gap-8">
                {/* 发起者选择 */}
                <div
                  className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-6xl shadow-lg transition-all duration-500"
                  style={{ 
                    transform: rpsRevealed ? 'rotateY(0deg)' : 'rotateY(180deg)',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  {rpsRevealed && initiatorChoice ? getChoiceIcon(initiatorChoice) : '🂠'}
                </div>

                <div className="text-3xl font-bold text-slate-600">VS</div>

                {/* 目标选择 */}
                <div
                  className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-6xl shadow-lg transition-all duration-500"
                  style={{ 
                    transform: rpsRevealed ? 'rotateY(0deg)' : 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                    transitionDelay: '200ms'
                  }}
                >
                  {rpsRevealed && targetChoice ? getChoiceIcon(targetChoice) : '🂠'}
                </div>
              </div>
            )}

            {phase === 'result' && result && (
              <div
                className={`p-8 rounded-2xl bg-gradient-to-br ${getResultStyle()} text-center animate-in zoom-in-95 duration-300`}
              >
                <div className="text-6xl mb-4">
                  {result.resultType === 'critical_success' && '👑'}
                  {result.resultType === 'success' && '✅'}
                  {result.resultType === 'critical_failure' && '💥'}
                  {result.resultType === 'failure' && '❌'}
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {result.resultType === 'critical_success' && '大成功！'}
                  {result.resultType === 'success' && '成功！'}
                  {result.resultType === 'critical_failure' && '大失败！'}
                  {result.resultType === 'failure' && '失败！'}
                </div>
                <p className="text-white/90 text-lg">{result.detail}</p>
                
                {/* 效果展示 */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-sm text-white/70 mb-2">效果</div>
                  <div className="text-white font-medium">
                    {result.appliedEffects.description}
                  </div>
                  {(result.appliedEffects.infiltrationChange || result.appliedEffects.safetyChange) && (
                    <div className="mt-2 flex justify-center gap-4 text-sm">
                      {result.appliedEffects.infiltrationChange && (
                        <span className={result.appliedEffects.infiltrationChange > 0 ? 'text-green-300' : 'text-red-300'}>
                          渗透 {result.appliedEffects.infiltrationChange > 0 ? '+' : ''}{result.appliedEffects.infiltrationChange}
                        </span>
                      )}
                      {result.appliedEffects.safetyChange && (
                        <span className={result.appliedEffects.safetyChange > 0 ? 'text-blue-300' : 'text-red-300'}>
                          安全 {result.appliedEffects.safetyChange > 0 ? '+' : ''}{result.appliedEffects.safetyChange}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 底部信息 */}
          <div className="p-4 bg-slate-800/50 border-t border-slate-700">
            <div className="flex justify-center items-center gap-6 text-sm text-slate-400">
              {eventData.type === 'dice' && (
                <>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>难度: <span className="text-cyan-400 font-bold">{eventData.difficulty || 3}</span></span>
                  </div>
                  {eventData.modifier !== undefined && eventData.modifier !== 0 && (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>修正: <span className={eventData.modifier > 0 ? 'text-green-400' : 'text-red-400'}>
                        {eventData.modifier > 0 ? '+' : ''}{eventData.modifier}
                      </span></span>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>阶段: <span className="text-purple-400">{eventData.phase === 'response' ? '响应阶段' : '判定阶段'}</span></span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JudgmentProcessPanel;
