/**
 * 骰子判定界面组件
 * 
 * 功能：
 * 1. 展示骰子投掷动画
 * 2. 同步显示给所有玩家
 * 3. 显示判定结果和效果
 * 4. 支持难度和修正值显示
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DICE_JUDGMENT_CONFIG } from '@/types/gameConstants';
import type { DiceCheckResult } from '@/engine/DiceSystem';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { gameLogger } from '@/engine/GameLogger';

interface DiceJudgmentPanelProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 判定标题 */
  title: string;
  /** 判定描述 */
  description: string;
  /** 难度值 */
  difficulty: number;
  /** 修正值 */
  modifier?: number;
  /** 发起者名称 */
  initiatorName: string;
  /** 目标名称 */
  targetName: string;
  /** 判定完成回调 */
  onComplete: (result: DiceCheckResult) => void;
  /** 关闭回调 */
  onClose?: () => void;
}

/**
 * 骰子判定面板组件
 */
export const DiceJudgmentPanel: React.FC<DiceJudgmentPanelProps> = ({
  isOpen,
  title,
  description,
  difficulty,
  modifier = 0,
  initiatorName,
  targetName,
  onComplete,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState<number | null>(null);
  const [finalResult, setFinalResult] = useState<DiceCheckResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [rollHistory, setRollHistory] = useState<number[]>([]);

  // 执行骰子投掷
  const performRoll = useCallback((): DiceCheckResult => {
    const roll = Math.floor(Math.random() * DICE_JUDGMENT_CONFIG.DICE_FACES) + 
                 DICE_JUDGMENT_CONFIG.MIN_ROLL;
    const modifiedRoll = roll + modifier;
    const success = modifiedRoll > difficulty;

    let resultType: DiceCheckResult['resultType'];
    let finalValue = 1;
    let resultDescription: string;

    // 大成功判定
    if (DICE_JUDGMENT_CONFIG.CRITICAL_SUCCESS_CONDITION(roll, difficulty)) {
      resultType = 'critical_success';
      finalValue = 3;
      resultDescription = `🎉 大成功！掷出${roll}点（难度${difficulty}），效果+2`;
    }
    // 大失败判定
    else if (DICE_JUDGMENT_CONFIG.CRITICAL_FAILURE_CONDITION(roll, difficulty)) {
      resultType = 'critical_failure';
      finalValue = 0;
      resultDescription = `💥 大失败！掷出${roll}点（难度${difficulty}），效果失效`;
    }
    // 普通成功
    else if (success) {
      resultType = 'success';
      finalValue = 1;
      resultDescription = `✅ 成功！掷出${roll}点（难度${difficulty}）`;
    }
    // 普通失败
    else {
      resultType = 'failure';
      finalValue = 0;
      resultDescription = `❌ 失败！掷出${roll}点（难度${difficulty}）`;
    }

    return {
      roll,
      difficulty,
      success: resultType === 'success' || resultType === 'critical_success',
      resultType,
      finalValue,
      description: resultDescription,
    };
  }, [difficulty, modifier]);

  // 开始投掷动画
  const startRoll = useCallback(() => {
    if (isRolling) return;
    
    setIsRolling(true);
    setShowResult(false);
    setRollHistory([]);
    
    gameLogger.info('dice_check', '开始骰子判定', {
      extra: {
        title,
        difficulty,
        modifier,
        initiator: initiatorName,
        target: targetName,
      }
    });

    // 动画阶段：快速切换数字
    const animationDuration = DICE_JUDGMENT_CONFIG.ROLL_ANIMATION_DURATION;
    const intervalTime = 100;
    const totalFrames = animationDuration / intervalTime;
    let frame = 0;

    const animationInterval = setInterval(() => {
      // 生成随机显示的数字（1-6）
      const displayRoll = Math.floor(Math.random() * 6) + 1;
      setCurrentRoll(displayRoll);
      setRollHistory(prev => [...prev.slice(-4), displayRoll]);
      frame++;

      if (frame >= totalFrames) {
        clearInterval(animationInterval);
        
        // 动画结束，生成最终结果
        const result = performRoll();
        setCurrentRoll(result.roll);
        setFinalResult(result);
        setIsRolling(false);
        setShowResult(true);
        
        gameLogger.info('dice_check', '骰子判定完成', {
          extra: {
            roll: result.roll,
            difficulty: result.difficulty,
            success: result.success,
            resultType: result.resultType,
          }
        });

        // 延迟后调用完成回调
        setTimeout(() => {
          onComplete(result);
        }, DICE_JUDGMENT_CONFIG.RESULT_DISPLAY_DURATION);
      }
    }, intervalTime);

    return () => clearInterval(animationInterval);
  }, [isRolling, title, difficulty, modifier, initiatorName, targetName, performRoll, onComplete]);

  // 自动开始投掷
  useEffect(() => {
    if (isOpen && !isRolling && !showResult) {
      const timer = setTimeout(startRoll, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRolling, showResult, startRoll]);

  // 获取结果样式
  const getResultStyle = () => {
    if (!finalResult) return 'bg-gray-100';
    switch (finalResult.resultType) {
      case 'critical_success':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'success':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'critical_failure':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'failure':
        return 'bg-gray-100 border-gray-400 text-gray-800';
      default:
        return 'bg-gray-100';
    }
  };

  // 获取结果图标
  const getResultIcon = () => {
    if (!finalResult) return '🎲';
    switch (finalResult.resultType) {
      case 'critical_success':
        return '👑';
      case 'success':
        return '✅';
      case 'critical_failure':
        return '💥';
      case 'failure':
        return '❌';
      default:
        return '🎲';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">
        <Card className="p-6 bg-white shadow-2xl">
          {/* 标题区域 */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>

          {/* 对战信息 */}
          <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{initiatorName}</div>
              <div className="text-xs text-gray-500">发起者</div>
            </div>
            <div className="text-2xl font-bold text-gray-400">VS</div>
            <div className="text-center">
              <div className="font-semibold text-red-600">{targetName}</div>
              <div className="text-xs text-gray-500">目标</div>
            </div>
          </div>

          {/* 难度和修正值显示 */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-500">难度</div>
              <div className="text-xl font-bold text-purple-600">{difficulty}</div>
            </div>
            {modifier !== 0 && (
              <div className="text-center">
                <div className="text-sm text-gray-500">修正</div>
                <div className={`text-xl font-bold ${modifier > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {modifier > 0 ? '+' : ''}{modifier}
                </div>
              </div>
            )}
            <div className="text-center">
              <div className="text-sm text-gray-500">成功率</div>
              <div className="text-xl font-bold text-blue-600">
                {Math.max(0, Math.min(100, ((6 - difficulty + modifier) / 6) * 100)).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* 骰子显示区域 */}
          <div className="flex flex-col items-center mb-6">
            {/* 历史记录 */}
            {rollHistory.length > 0 && (
              <div className="flex gap-2 mb-4">
                {rollHistory.slice(-5).map((roll, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-bold text-gray-600 animate-in zoom-in duration-200"
                  >
                    {roll}
                  </div>
                ))}
              </div>
            )}

            {/* 主骰子 */}
            <div
              className={`w-32 h-32 rounded-2xl flex items-center justify-center text-6xl font-bold shadow-lg transition-all duration-300 ${
                isRolling 
                  ? 'bg-gradient-to-br from-blue-400 to-purple-500 text-white animate-spin' 
                  : showResult 
                    ? getResultStyle()
                    : 'bg-gray-100 border-2 border-gray-300'
              }`}
            >
              {isRolling ? '🎲' : showResult ? getResultIcon() : currentRoll || '?'}
            </div>

            {/* 点数显示 */}
            {currentRoll && !isRolling && (
              <div className="mt-4 text-4xl font-bold text-gray-800 animate-in slide-in-from-top-2 duration-300">
                {currentRoll}
              </div>
            )}
          </div>

          {/* 结果展示 */}
          {showResult && finalResult && (
            <div className={`p-4 rounded-lg border-2 mb-4 animate-in slide-in-from-bottom-2 duration-300 ${getResultStyle()}`}>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {finalResult.resultType === 'critical_success' && '🎉 大成功！'}
                  {finalResult.resultType === 'success' && '✅ 成功！'}
                  {finalResult.resultType === 'critical_failure' && '💥 大失败！'}
                  {finalResult.resultType === 'failure' && '❌ 失败！'}
                </div>
                <p className="text-sm">{finalResult.description}</p>
                <div className="mt-2 text-sm">
                  效果值: <span className="font-bold">{finalResult.finalValue}</span>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4">
            {!isRolling && !showResult && (
              <Button onClick={startRoll} size="lg" className="px-8">
                开始投掷
              </Button>
            )}
          </div>

          {/* 说明文字 */}
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>🎲 骰子规则：掷出值 &gt; 难度值则成功</p>
            <p>👑 大成功：掷出6且难度≤3 | 💥 大失败：掷出1且难度≥4</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DiceJudgmentPanel;
