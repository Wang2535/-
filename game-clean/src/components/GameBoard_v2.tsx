/**
 * GameBoard v2 - 连接GameLoop的游戏主组件
 * 实现完整的7阶段回合流程
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { GameState, TurnPhase } from '@/types/gameRules';
import { GameStateManager } from '@/engine/GameStateManager_v2';
import { GameLoop, type GameLoopConfig } from '@/engine/GameLoop';
import { type VictoryResult } from '@/engine/VictoryConditionSystem';
import { GameInterface } from './GameInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock } from 'lucide-react';

interface GameBoardV2Props {
  gameStateManager: GameStateManager;
  onGameEnd: (winner: 'attacker' | 'defender' | null, victoryType: string) => void;
  onExit: () => void;
}

export function GameBoardV2({ gameStateManager, onGameEnd, onExit }: GameBoardV2Props) {
  const [gameState, setGameState] = useState<GameState | null>(gameStateManager.getGameState());
  const [currentPhase, setCurrentPhase] = useState<TurnPhase>('judgment');
  const [timerDisplay, setTimerDisplay] = useState<{ remaining: number; total: number } | null>(null);
  const [victoryResult, setVictoryResult] = useState<VictoryResult | null>(null);
  const [isAIThinking] = useState(false);
  
  const gameLoopRef = useRef<GameLoop | null>(null);

  // 初始化GameLoop
  useEffect(() => {
    const config: GameLoopConfig = {
      gameStateManager,
      onStateChange: (newState) => {
        setGameState(newState);
      },
      onPhaseChange: (phase) => {
        setCurrentPhase(phase);
        setTimerDisplay(null);
      },
      onTimerUpdate: (remaining, total) => {
        setTimerDisplay({ remaining, total });
      },
      onVictory: (result) => {
        setVictoryResult(result);
        onGameEnd(result.winner, result.victoryType || 'unknown');
      },
      onError: (error) => {
        console.error('[GameBoardV2] GameLoop错误:', error);
      }
    };

    gameLoopRef.current = new GameLoop(config);
    gameLoopRef.current.start();

    return () => {
      gameLoopRef.current?.stop();
    };
  }, [gameStateManager, onGameEnd]);

  // 处理玩家出牌
  const handlePlayCard = useCallback((cardIndex: number) => {
    if (!gameLoopRef.current) return false;
    return gameLoopRef.current.playerPlayCard(cardIndex);
  }, []);

  // 处理玩家结束回合
  const handleEndTurn = useCallback(() => {
    if (!gameLoopRef.current) return;
    gameLoopRef.current.playerEndPhase();
  }, []);

  // 处理玩家弃牌
  const handleDiscardCard = useCallback((cardIndex: number) => {
    if (!gameLoopRef.current) return;
    gameLoopRef.current.playerDiscardCard(cardIndex);
  }, []);

  // 获取当前玩家
  const currentPlayer = gameState?.players[gameState.currentPlayerIndex];

  // 检查是否是当前玩家的回合
  const isPlayerTurn = useCallback((playerId: string) => {
    return gameState?.players[gameState.currentPlayerIndex]?.id === playerId;
  }, [gameState]);

  // 渲染胜利弹窗
  if (victoryResult?.isGameOver) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-slate-900" />
            </div>
            <CardTitle className="text-2xl text-white">
              {victoryResult.winner ? (
                victoryResult.winner === 'attacker' ? '进攻方胜利！' : '防御方胜利！'
              ) : (
                '平局！'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 text-center">
              {victoryResult.victoryDescription}
            </p>
            <div className="text-sm text-slate-500 text-center">
              游戏进行了 {victoryResult.roundsPlayed} 个回合
            </div>
            <div className="flex gap-2">
              <Button onClick={onExit} className="flex-1">
                返回主菜单
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 渲染计时器
  const renderTimer = () => {
    if (!timerDisplay) return null;
    
    const isLowTime = timerDisplay.remaining <= 5;
    
    return (
      <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg ${
        isLowTime ? 'bg-red-600 animate-pulse' : 'bg-slate-800'
      }`}>
        <Clock className="w-5 h-5" />
        <span className="text-xl font-bold">
          {timerDisplay.remaining}s
        </span>
      </div>
    );
  };

  // 渲染阶段信息
  const renderPhaseInfo = () => {
    const phaseNames: Record<TurnPhase, string> = {
      judgment: '判定阶段',
      recovery: '恢复阶段',
      draw: '摸牌阶段',
      action: '行动阶段',
      response: '响应阶段',
      discard: '弃牌阶段',
      end: '结束阶段'
    };

    return (
      <div className="fixed top-4 left-4 z-50 bg-slate-800 px-4 py-2 rounded-lg">
        <div className="text-sm text-slate-400">当前阶段</div>
        <div className="text-lg font-bold text-white">{phaseNames[currentPhase]}</div>
      </div>
    );
  };

  // 渲染AI思考指示器
  const renderAIThinking = () => {
    if (!isAIThinking) return null;
    
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <span className="text-white">AI思考中...</span>
      </div>
    );
  };

  if (!gameState || !currentPlayer) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">加载游戏中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {renderTimer()}
      {renderPhaseInfo()}
      {renderAIThinking()}
      
      <GameInterface
        gameState={gameState}
        currentPlayer={currentPlayer}
        currentPhase={currentPhase}
        onPlayCard={handlePlayCard}
        onEndTurn={handleEndTurn}
        onDiscardCard={handleDiscardCard}
        isPlayerTurn={isPlayerTurn(currentPlayer.id)}
      />
    </div>
  );
}

export default GameBoardV2;
