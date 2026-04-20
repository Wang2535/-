/**
 * 剪刀石头布判定界面组件
 * 
 * 功能：
 * 1. 双方同时选择的交互界面
 * 2. 5秒倒计时选择机制
 * 3. 资源投入选择功能
 * 4. 根据投入情况执行不同逻辑
 * 5. 结果公示和记录
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RPS_JUDGMENT_CONFIG } from '@/types/gameConstants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { gameLogger } from '@/engine/GameLogger';

type RPSChoice = 'rock' | 'paper' | 'scissors' | null;
type ResourceCommit = 0 | 1 | 2;

interface RPSResult {
  winner: 'initiator' | 'target' | 'draw' | null;
  initiatorChoice: RPSChoice;
  targetChoice: RPSChoice;
  initiatorCommit: ResourceCommit;
  targetCommit: ResourceCommit;
  outcome: 'win' | 'lose' | 'draw' | 'cancelled';
  description: string;
}

interface RPSJudgmentPanelProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 判定标题 */
  title: string;
  /** 判定描述 */
  description: string;
  /** 发起者名称 */
  initiatorName: string;
  /** 目标名称 */
  targetName: string;
  /** 当前玩家是否是发起者 */
  isInitiator: boolean;
  /** 判定完成回调 */
  onComplete: (result: RPSResult) => void;
}

/**
 * 剪刀石头布判定面板组件
 */
export const RPSJudgmentPanel: React.FC<RPSJudgmentPanelProps> = ({
  isOpen,
  title,
  description,
  initiatorName,
  targetName,
  isInitiator,
  onComplete,
}) => {
  // 选择状态
  const [initiatorChoice, setInitiatorChoice] = useState<RPSChoice>(null);
  const [targetChoice, setTargetChoice] = useState<RPSChoice>(null);
  const [initiatorCommit, setInitiatorCommit] = useState<ResourceCommit>(0);
  const [targetCommit, setTargetCommit] = useState<ResourceCommit>(0);
  
  // 当前玩家的选择（根据isInitiator决定）
  const [myChoice, setMyChoice] = useState<RPSChoice>(null);
  const [myCommit, setMyCommit] = useState<ResourceCommit>(0);
  
  // 游戏状态
  const [timeLeft, setTimeLeft] = useState<number>(RPS_JUDGMENT_CONFIG.CHOICE_TIME_LIMIT);
  const [phase, setPhase] = useState<'selecting' | 'committing' | 'revealing' | 'result'>('selecting');
  const [result, setResult] = useState<RPSResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 判定胜负逻辑
  const judgeWinner = useCallback((choice1: RPSChoice, choice2: RPSChoice): 'win' | 'lose' | 'draw' => {
    if (choice1 === choice2) return 'draw';
    if (
      (choice1 === 'rock' && choice2 === 'scissors') ||
      (choice1 === 'paper' && choice2 === 'rock') ||
      (choice1 === 'scissors' && choice2 === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  }, []);

  // 处理资源投入逻辑
  const processResourceCommit = useCallback((
    initCommit: ResourceCommit,
    targCommit: ResourceCommit,
    initChoice: RPSChoice,
    targChoice: RPSChoice
  ): RPSResult => {
    // 双方都不投入 - 取消判定
    if (initCommit === 0 && targCommit === 0) {
      return {
        winner: null,
        initiatorChoice: initChoice,
        targetChoice: targChoice,
        initiatorCommit: initCommit,
        targetCommit: targCommit,
        outcome: 'cancelled',
        description: '双方均未投入资源，判定取消',
      };
    }

    // 一方投入，一方不投入
    if (initCommit > 0 && targCommit === 0) {
      // 发起方投入，目标方不投入 - 发起方选择结果
      return {
        winner: 'initiator',
        initiatorChoice: initChoice,
        targetChoice: targChoice,
        initiatorCommit: initCommit,
        targetCommit: targCommit,
        outcome: 'win',
        description: `${initiatorName}投入资源，${targetName}未投入，${initiatorName}获得胜利`,
      };
    }

    if (initCommit === 0 && targCommit > 0) {
      // 目标方投入，发起方不投入 - 目标方选择结果
      return {
        winner: 'target',
        initiatorChoice: initChoice,
        targetChoice: targChoice,
        initiatorCommit: initCommit,
        targetCommit: targCommit,
        outcome: 'lose',
        description: `${targetName}投入资源，${initiatorName}未投入，${targetName}获得胜利`,
      };
    }

    // 双方都投入 - 执行标准RPS判定
    const rpsResult = judgeWinner(initChoice, targChoice);
    
    if (rpsResult === 'draw') {
      return {
        winner: 'draw',
        initiatorChoice: initChoice,
        targetChoice: targChoice,
        initiatorCommit: initCommit,
        targetCommit: targCommit,
        outcome: 'draw',
        description: '双方选择相同，判定平局',
      };
    }

    const winner = rpsResult === 'win' ? 'initiator' : 'target';
    const winnerName = rpsResult === 'win' ? initiatorName : targetName;
    
    return {
      winner,
      initiatorChoice: initChoice,
      targetChoice: targChoice,
      initiatorCommit: initCommit,
      targetCommit: targCommit,
      outcome: rpsResult === 'win' ? 'win' : 'lose',
      description: `${winnerName}在剪刀石头布中获胜！`,
    };
  }, [initiatorName, targetName, judgeWinner]);

  // 倒计时
  useEffect(() => {
    if (!isOpen || phase === 'revealing' || phase === 'result') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          // 时间到，自动处理
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, phase]);

  // 处理超时
  const handleTimeout = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 根据当前阶段处理
    if (phase === 'selecting') {
      // 选择阶段超时，随机选择
      const randomChoice = RPS_JUDGMENT_CONFIG.CHOICE_OPTIONS[
        Math.floor(Math.random() * 3)
      ].value as RPSChoice;
      
      if (isInitiator) {
        setInitiatorChoice(randomChoice);
      } else {
        setTargetChoice(randomChoice);
      }
      setMyChoice(randomChoice);
      setPhase('committing');
      setTimeLeft(RPS_JUDGMENT_CONFIG.CHOICE_TIME_LIMIT);
    } else if (phase === 'committing') {
      // 投入阶段超时，默认不投入
      if (isInitiator) {
        setInitiatorCommit(0);
      } else {
        setTargetCommit(0);
      }
      setMyCommit(0);
      setPhase('revealing');
    }
  }, [phase, isInitiator]);

  // 确认选择
  const confirmChoice = useCallback(() => {
    if (!myChoice) return;

    if (isInitiator) {
      setInitiatorChoice(myChoice);
    } else {
      setTargetChoice(myChoice);
    }

    setPhase('committing');
    setTimeLeft(RPS_JUDGMENT_CONFIG.CHOICE_TIME_LIMIT);

    gameLogger.info('dice_check', '玩家确认选择', {
      extra: {
        isInitiator,
        choice: myChoice,
      }
    });
  }, [myChoice, isInitiator]);

  // 确认资源投入
  const confirmCommit = useCallback(() => {
    if (isInitiator) {
      setInitiatorCommit(myCommit);
    } else {
      setTargetCommit(myCommit);
    }

    setPhase('revealing');

    gameLogger.info('dice_check', '玩家确认资源投入', {
      extra: {
        isInitiator,
        commit: myCommit,
      }
    });
  }, [myCommit, isInitiator]);

  // 双方都已选择，显示结果
  useEffect(() => {
    if (phase === 'revealing' && initiatorChoice && targetChoice) {
      const finalResult = processResourceCommit(
        initiatorCommit,
        targetCommit,
        initiatorChoice,
        targetChoice
      );
      
      setResult(finalResult);
      setShowResult(true);
      setPhase('result');

      gameLogger.info('dice_check', '判定完成', {
        extra: {
          result: finalResult,
        }
      });

      // 延迟后调用完成回调
      setTimeout(() => {
        onComplete(finalResult);
      }, 3000);
    }
  }, [phase, initiatorChoice, targetChoice, initiatorCommit, targetCommit, processResourceCommit, onComplete]);

  // 获取选择图标
  const getChoiceIcon = (choice: RPSChoice) => {
    switch (choice) {
      case 'rock': return '✊';
      case 'paper': return '✋';
      case 'scissors': return '✌️';
      default: return '?';
    }
  };

  // 获取选择名称
  const getChoiceName = (choice: RPSChoice) => {
    switch (choice) {
      case 'rock': return '石头';
      case 'paper': return '布';
      case 'scissors': return '剪刀';
      default: return '未选择';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl animate-in zoom-in-95 duration-200">
        <Card className="p-6 bg-white shadow-2xl">
          {/* 标题区域 */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>

          {/* 倒计时 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                {phase === 'selecting' && '请选择出拳'}
                {phase === 'committing' && '请选择资源投入'}
                {phase === 'revealing' && '揭晓结果中...'}
                {phase === 'result' && '判定结果'}
              </span>
              <span className={`text-lg font-bold ${timeLeft <= 2 ? 'text-red-500' : 'text-blue-600'}`}>
                {timeLeft}秒
              </span>
            </div>
            <Progress 
              value={(timeLeft / RPS_JUDGMENT_CONFIG.CHOICE_TIME_LIMIT) * 100} 
              className="h-2"
            />
          </div>

          {/* 对战信息 */}
          <div className="flex items-center justify-between mb-8">
            {/* 发起者 */}
            <div className={`flex-1 text-center p-4 rounded-lg ${isInitiator ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'}`}>
              <div className="font-bold text-lg text-blue-600 mb-2">{initiatorName}</div>
              <div className="text-xs text-gray-500 mb-2">发起者</div>
              <div 
                className="text-5xl mb-2 transition-all duration-500"
                style={{ transform: phase === 'revealing' || phase === 'result' ? 'rotateY(0deg)' : 'rotateY(180deg)' }}
              >
                {phase === 'revealing' || phase === 'result' 
                  ? getChoiceIcon(initiatorChoice)
                  : '🂠'
                }
              </div>
              <div className="text-sm text-gray-600">
                {phase === 'revealing' || phase === 'result' 
                  ? getChoiceName(initiatorChoice)
                  : '???'
                }
              </div>
              {(phase === 'revealing' || phase === 'result') && (
                <div className="mt-2 text-xs text-gray-500">
                  投入: {initiatorCommit}点资源
                </div>
              )}
            </div>

            {/* VS */}
            <div className="px-6">
              <div className="text-3xl font-bold text-gray-400">VS</div>
            </div>

            {/* 目标 */}
            <div className={`flex-1 text-center p-4 rounded-lg ${!isInitiator ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50'}`}>
              <div className="font-bold text-lg text-red-600 mb-2">{targetName}</div>
              <div className="text-xs text-gray-500 mb-2">目标</div>
              <div 
                className="text-5xl mb-2 transition-all duration-500"
                style={{ transform: phase === 'revealing' || phase === 'result' ? 'rotateY(0deg)' : 'rotateY(180deg)' }}
              >
                {phase === 'revealing' || phase === 'result'
                  ? getChoiceIcon(targetChoice)
                  : '🂠'
                }
              </div>
              <div className="text-sm text-gray-600">
                {phase === 'revealing' || phase === 'result'
                  ? getChoiceName(targetChoice)
                  : '???'
                }
              </div>
              {(phase === 'revealing' || phase === 'result') && (
                <div className="mt-2 text-xs text-gray-500">
                  投入: {targetCommit}点资源
                </div>
              )}
            </div>
          </div>

          {/* 选择阶段 */}
          {phase === 'selecting' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-center">请选择你的出拳</h3>
              <div className="flex justify-center gap-4">
                {RPS_JUDGMENT_CONFIG.CHOICE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMyChoice(option.value as RPSChoice)}
                    className={`p-6 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                      myChoice === option.value
                        ? 'bg-blue-100 border-blue-500 shadow-lg'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{option.icon}</div>
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button 
                  onClick={confirmChoice} 
                  disabled={!myChoice}
                  size="lg"
                  className="px-8"
                >
                  确认选择
                </Button>
              </div>
            </div>
          )}

          {/* 资源投入阶段 */}
          {phase === 'committing' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-center">请选择资源投入</h3>
              <div className="flex justify-center gap-4">
                {RPS_JUDGMENT_CONFIG.RESOURCE_COMMIT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMyCommit(option.value as ResourceCommit)}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 w-32 ${
                      myCommit === option.value
                        ? 'bg-purple-100 border-purple-500 shadow-lg'
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-bold text-lg mb-1">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button 
                  onClick={confirmCommit}
                  size="lg"
                  className="px-8"
                >
                  确认投入
                </Button>
              </div>
            </div>
          )}

          {/* 结果展示 */}
          {showResult && result && (
            <div className={`p-6 rounded-lg border-2 mb-4 animate-in slide-in-from-bottom-2 duration-300 ${
              result.outcome === 'cancelled'
                ? 'bg-gray-100 border-gray-400'
                : result.outcome === 'draw'
                  ? 'bg-yellow-100 border-yellow-400'
                  : result.winner === (isInitiator ? 'initiator' : 'target')
                    ? 'bg-green-100 border-green-400'
                    : 'bg-red-100 border-red-400'
            }`}>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {result.outcome === 'cancelled' && '⛔ 判定取消'}
                  {result.outcome === 'draw' && '🤝 平局'}
                  {result.outcome === 'win' && isInitiator && '🎉 你赢了！'}
                  {result.outcome === 'win' && !isInitiator && '😔 你输了'}
                  {result.outcome === 'lose' && isInitiator && '😔 你输了'}
                  {result.outcome === 'lose' && !isInitiator && '🎉 你赢了！'}
                </div>
                <p className="text-lg">{result.description}</p>
                
                {result.outcome !== 'cancelled' && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/50 p-2 rounded">
                      <div className="font-semibold">{initiatorName}</div>
                      <div>选择: {getChoiceName(result.initiatorChoice)}</div>
                      <div>投入: {result.initiatorCommit}点</div>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <div className="font-semibold">{targetName}</div>
                      <div>选择: {getChoiceName(result.targetChoice)}</div>
                      <div>投入: {result.targetCommit}点</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 说明文字 */}
          <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
            <p>✊ 石头胜剪刀 | ✌️ 剪刀胜布 | ✋ 布胜石头</p>
            <p>💡 一方投入资源而另一方不投入时，投入方自动获胜</p>
            <p>💡 双方都不投入时，判定取消</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RPSJudgmentPanel;
