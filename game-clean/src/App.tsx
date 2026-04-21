import { useState, useCallback, useEffect, useRef } from 'react';
import { GameLobby, type GameConfig } from '@/components/GameLobby';
import { GameRoom } from '@/components/GameRoom';
import { GameInterface } from '@/components/GameInterface';
import { VictoryModal } from '@/components/game/VictoryModal';
import { 
  LevelSelection, 
  LevelGameInterface, 
  LevelCompleteModal,
  LevelDeckBuilder
} from '@/components/level';
import { Toaster, toast } from '@/components/ui/sonner';
import type { Faction, Player, GameState, TurnPhase, GameLogEntry } from '@/types/gameRules';
import type { CharacterId } from '@/types/characterRules';
import type { LevelId, LevelGameState, LevelCompletionResult, AreaType } from '@/types/levelTypes';
import { GameStateManager } from '@/engine/GameStateManager_v2';
import { GameLoop } from '@/engine/GameLoop';
import { TurnPhaseSystem } from '@/engine/TurnPhaseSystem';
import { LevelGameStateManager } from '@/engine/LevelGameStateManager';
import { getHandLimitByRound } from '@/types/gameConstants';
import type { VictoryResult } from '@/engine/VictoryConditionSystem';
import { TowerModeApp } from './tower-mode/TowerModeApp';
import { TowerClimbView } from './tower-mode/components/TowerClimbView/TowerClimbView';
import { SRayLandMapTest } from './components/SRayLandMapTest';
import './styles/theme.css';

type AppScreen = 'lobby' | 'room' | 'game' | 'levelSelection' | 'levelGame' | 'levelDeckBuilder' | 'towerMode' | 'towerMap' | 'sraylandTest';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('lobby');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStateManager] = useState(() => new GameStateManager());
  const gameLoopRef = useRef<GameLoop | null>(null);
  const [currentPhase, setCurrentPhase] = useState<TurnPhase>('judgment');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [phaseTotalTime, setPhaseTotalTime] = useState(0);
  const [gameLogs, setGameLogs] = useState<string[]>([]);
  const [hostPlayer, setHostPlayer] = useState<{ 
    name: string; 
    faction: Faction;
    characterId: CharacterId;
  } | null>(null);
  const [victoryResult, setVictoryResult] = useState<VictoryResult | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const [levelGameStateManager] = useState(() => new LevelGameStateManager());
  const [levelGameState, setLevelGameState] = useState<LevelGameState | null>(null);
  const [levelCompletionResult, setLevelCompletionResult] = useState<LevelCompletionResult | null>(null);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
  const [currentLevelId, setCurrentLevelId] = useState<LevelId | null>(null);

  // 更新游戏状态
  const updateGameState = useCallback((newState: GameState) => {
    setGameState(newState);
    setCurrentPhase(newState.currentPhase);
  }, []);

  // 添加游戏日志
  const addGameLog = useCallback((log: string) => {
    setGameLogs(prev => [...prev, log]);
  }, []);

  // 快速开始游戏（1v1模式）
  const handleStartGame = useCallback((config: GameConfig) => {
    // 初始化游戏
    const initialState = gameStateManager.initGame({
      gameId: `game_${Date.now()}`,
      players: [
        {
          id: 'p1',
          name: config.playerName,
          faction: config.faction,
          characterId: config.characterId || 'AR01',
          isAI: false,
        },
        {
          id: 'p2',
          name: 'AI对手',
          faction: config.faction === 'attacker' ? 'defender' : 'attacker',
          characterId: config.faction === 'attacker' ? 'DR01' : 'AR01',
          isAI: true,
          aiDifficulty: config.aiDifficulty || 'medium',
        }
      ]
    });

    // 设置状态变更回调
    gameStateManager.setOnStateChange((state) => {
      updateGameState(state);
    });

    // 初始化游戏循环
    const gameLoop = new GameLoop({
      gameStateManager,
      onStateChange: (state) => {
        updateGameState(state);
      },
      onPhaseChange: (phase: TurnPhase) => {
        setCurrentPhase(phase);
        const currentState = gameStateManager.getGameState();
        if (currentState) {
          addGameLog(`=== 第${currentState.round}轮次 - ${TurnPhaseSystem.getPhaseName(phase)} ===`);
        }
      },
      onTimerUpdate: (remaining: number, total: number) => {
        setPhaseTimeLeft(remaining);
        setPhaseTotalTime(total);
      },
      onVictory: (result) => {
        addGameLog(`🎉 游戏结束！${result.winner} 获胜 - ${result.victoryType}`);
        setVictoryResult(result);
        setShowVictoryModal(true);
      },
      onError: (error: string) => {
        addGameLog(`❌ 错误: ${error}`);
      },
    });

    gameLoopRef.current = gameLoop;
    
    // 启动游戏循环
    gameLoop.start();
    
    updateGameState(initialState);
    setCurrentScreen('game');
  }, [gameStateManager, updateGameState, addGameLog]);

  // 进入房间
  const handleEnterRoom = useCallback((player: { name: string; faction: Faction; characterId: CharacterId }) => {
    setHostPlayer(player);
    setCurrentScreen('room');
  }, []);

  // 房间开始游戏
  const handleRoomStartGame = useCallback((players: Player[]) => {
    // 转换玩家配置
    const playerConfigs = players.map(p => ({
      id: p.id,
      name: p.name,
      faction: p.faction,
      characterId: p.characterId as CharacterId,
      isAI: p.isAI,
      aiDifficulty: p.aiDifficulty,
    }));

    // 初始化游戏
    const initialState = gameStateManager.initGame({
      gameId: `game_${Date.now()}`,
      players: playerConfigs,
    });

    // 设置状态变更回调
    gameStateManager.setOnStateChange((state) => {
      updateGameState(state);
    });

    // 初始化游戏循环
    const gameLoop = new GameLoop({
      gameStateManager,
      onStateChange: (state) => {
        updateGameState(state);
      },
      onPhaseChange: (phase: TurnPhase) => {
        setCurrentPhase(phase);
        const currentState = gameStateManager.getGameState();
        if (currentState) {
          addGameLog(`=== 第${currentState.round}轮次 - ${TurnPhaseSystem.getPhaseName(phase)} ===`);
        }
      },
      onTimerUpdate: (remaining: number, total: number) => {
        setPhaseTimeLeft(remaining);
        setPhaseTotalTime(total);
      },
      onVictory: (result) => {
        addGameLog(`🎉 游戏结束！${result.winner} 获胜 - ${result.victoryType}`);
        setVictoryResult(result);
        setShowVictoryModal(true);
      },
      onError: (error: string) => {
        addGameLog(`❌ 错误: ${error}`);
      },
    });

    gameLoopRef.current = gameLoop;
    
    // 启动游戏循环
    gameLoop.start();
    
    updateGameState(initialState);
    setCurrentScreen('game');
  }, [gameStateManager, updateGameState, addGameLog]);

  // 取消房间
  const handleRoomCancel = useCallback(() => {
    setHostPlayer(null);
    setCurrentScreen('lobby');
  }, []);

  // 出牌处理
  const handlePlayCard = useCallback((cardIndex: number) => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    // 检查是否在行动阶段
    if (gameState.currentPhase !== 'action') {
      addGameLog('❌ 只能在行动阶段出牌');
      return;
    }
    
    // 检查是否有剩余行动点
    if (currentPlayer.remainingActions <= 0) {
      addGameLog('❌ 没有剩余行动点');
      return;
    }
    
    // 执行出牌
    const success = gameStateManager.playCard(currentPlayer.id, cardIndex);
    
    if (success) {
      addGameLog(`✅ ${currentPlayer.name} 打出了一张卡牌`);
      // 通知游戏循环出牌成功（用于延长计时器）
      gameLoopRef.current?.notifyCardPlayed();
    } else {
      addGameLog('❌ 出牌失败');
    }
  }, [gameState, gameStateManager, addGameLog]);

  // 结束回合
  const handleEndTurn = useCallback(() => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    // 检查是否在行动阶段
    if (gameState.currentPhase !== 'action') {
      addGameLog('❌ 只能在行动阶段结束回合');
      return;
    }
    
    addGameLog(`${currentPlayer.name} 结束回合`);
    
    // 手动推进到下一阶段
    gameLoopRef.current?.advancePhase();
  }, [gameState, addGameLog]);

  // 弃牌处理
  const handleDiscardCard = useCallback((cardIndex: number) => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    // 检查是否在弃牌阶段
    if (gameState.currentPhase !== 'discard') {
      addGameLog('❌ 只能在弃牌阶段弃牌');
      return;
    }
    
    // 执行弃牌
    const success = gameStateManager.discardCard(currentPlayer.id, cardIndex);
    
    if (success) {
      addGameLog(`${currentPlayer.name} 弃置了一张卡牌`);
      
      // 检查是否还需要继续弃牌
      // 根据轮次获取手牌上限（R4.3: 1-4轮次3张，5-8轮次4张，9-12轮次5张）
      const handLimit = getHandLimitByRound(gameState.round);
      const currentHandSize = currentPlayer.hand.length - 1; // 已经弃掉一张
      
      if (currentHandSize <= handLimit) {
        addGameLog('✅ 弃牌完成，进入下一阶段');
        // 延迟后自动推进到下一阶段
        setTimeout(() => {
          gameLoopRef.current?.advancePhase();
        }, 500);
      }
    } else {
      addGameLog('❌ 弃牌失败');
    }
  }, [gameState, gameStateManager, addGameLog]);

  // 结束弃牌阶段
  const handleEndDiscard = useCallback(() => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    // 检查是否在弃牌阶段
    if (gameState.currentPhase !== 'discard') {
      addGameLog('❌ 只能在弃牌阶段结束弃牌');
      return;
    }
    
    // 检查手牌是否<=上限
    const handLimit = getHandLimitByRound(
      gameState.round,
      currentPlayer.individualModifiers.handLimitOffset,
      currentPlayer.individualModifiers.handLimitTempOffset
    );
    
    if (currentPlayer.hand.length > handLimit) {
      addGameLog(`❌ 手牌数(${currentPlayer.hand.length})超过上限(${handLimit})，无法结束弃牌`);
      return;
    }
    
    addGameLog('✅ 弃牌完成，进入下一阶段');
    gameLoopRef.current?.advancePhase();
  }, [gameState, addGameLog]);

  const handleStartLevelGame = useCallback(async (levelId: LevelId) => {
    console.log('[App] handleStartLevelGame called for level:', levelId);
    setCurrentLevelId(levelId);
    
    console.log('[App] setting up callbacks');
    levelGameStateManager.setOnStateChange((state) => {
      console.log('[App] onStateChange callback called, phase:', state.currentPhase, 'turn:', state.currentTurn, 'round:', state.round);
      setLevelGameState(state);
    });
    levelGameStateManager.setOnLevelComplete((result) => {
      setLevelCompletionResult(result);
      setShowLevelCompleteModal(true);
    });
    levelGameStateManager.setOnGameOver(() => {
      toast.error('游戏结束！安全等级降为0，请重新挑战。', {
        duration: 3000,
        position: 'top-center'
      });
      setCurrentScreen('levelSelection');
    });
    
    console.log('[App] calling startLevel');
    const initialState = await levelGameStateManager.startLevel(levelId);
    console.log('[App] startLevel completed, setting initial state');
    setLevelGameState(initialState);
    setCurrentScreen('levelGame');
  }, [levelGameStateManager]);

  const handleLevelPlayCard = useCallback((cardIndex: number): boolean | 'needs_area_selection' | 'needs_advance_to_response' => {
    return levelGameStateManager.playCard(cardIndex);
  }, [levelGameStateManager]);

  const handleLevelPlayCardWithArea = useCallback((cardIndex: number, area: AreaType): boolean | 'needs_advance_to_response' => {
    return levelGameStateManager.playCardWithAreaSelection(area);
  }, [levelGameStateManager]);

  const handleLevelEndTurn = useCallback(() => {
    // 玩家点击"结束行动"，应该推进到响应阶段
    // 而不是直接调用endTurn（那样会跳过响应、弃牌、结束阶段）
    levelGameStateManager.advancePhase();
  }, [levelGameStateManager]);

  const handleLevelDiscardCard = useCallback((cardIndex: number) => {
    levelGameStateManager.discardCard(cardIndex);
  }, [levelGameStateManager]);

  const handleLevelEndDiscard = useCallback(async () => {
    const result = levelGameStateManager.endDiscardPhase();
    if (result.canProceed) {
      await levelGameStateManager.advancePhase();
    }
  }, [levelGameStateManager]);

  const handleLevelAdvancePhase = useCallback(async () => {
    console.log('[App] handleLevelAdvancePhase called');
    await levelGameStateManager.advancePhase();
  }, [levelGameStateManager]);

  const handleLevelJudgmentComplete = useCallback((judgmentId: string, resultData: any) => {
    console.log('[App] handleLevelJudgmentComplete called:', judgmentId, resultData);
    levelGameStateManager.resolveJudgmentWithResult(judgmentId, resultData);
  }, [levelGameStateManager]);

  const handleExitLevel = useCallback(() => {
    setLevelGameState(null);
    setCurrentLevelId(null);
    setCurrentScreen('levelSelection');
  }, []);

  const handleNextLevel = useCallback(() => {
    if (levelCompletionResult?.nextLevel) {
      setShowLevelCompleteModal(false);
      setLevelCompletionResult(null);
      handleStartLevelGame(levelCompletionResult.nextLevel);
    }
  }, [levelCompletionResult, handleStartLevelGame]);

  const handleBackToLevelSelection = useCallback(() => {
    setShowLevelCompleteModal(false);
    setLevelCompletionResult(null);
    setLevelGameState(null);
    setCurrentLevelId(null);
    setCurrentScreen('levelSelection');
  }, []);

  const handleRetryLevel = useCallback(() => {
    if (currentLevelId) {
      setShowLevelCompleteModal(false);
      setLevelCompletionResult(null);
      handleStartLevelGame(currentLevelId);
    }
  }, [currentLevelId, handleStartLevelGame]);

  // 打开卡牌库配置界面
  const handleOpenCardLibrary = useCallback(() => {
    setCurrentScreen('levelDeckBuilder');
  }, []);

  // 从卡牌库返回关卡选择
  const handleBackFromCardLibrary = useCallback(() => {
    setCurrentScreen('levelSelection');
  }, []);

  // 清理游戏循环和事件监听器
  useEffect(() => {
    // 监听资源不足事件
    const handleResourceInsufficient = (event: CustomEvent) => {
      const { required, available } = event.detail;
      
      // 构建资源不足的消息
      const missingResources = [];
      if (required.compute > available.compute) {
        missingResources.push(`算力: ${available.compute}/${required.compute}`);
      }
      if (required.funds > available.funds) {
        missingResources.push(`资金: ${available.funds}/${required.funds}`);
      }
      if (required.information > available.information) {
        missingResources.push(`信息: ${available.information}/${required.information}`);
      }
      if (required.permission > available.permission) {
        missingResources.push(`权限: ${available.permission}/${required.permission}`);
      }
      
      // 显示资源不足提示
      toast.error(
        `资源不足，无法出牌\n缺少: ${missingResources.join(', ')}`,
        {
          duration: 3000,
          position: 'top-center'
        }
      );
    };
    
    // 添加事件监听器
    if (typeof window !== 'undefined') {
      window.addEventListener('resourceInsufficient', handleResourceInsufficient as EventListener);
    }
    
    return () => {
      // 清理事件监听器
      if (typeof window !== 'undefined') {
        window.removeEventListener('resourceInsufficient', handleResourceInsufficient as EventListener);
      }
      
      // 清理游戏循环
      if (gameLoopRef.current) {
        gameLoopRef.current.stop();
      }
    };
  }, []);

  // 进入安全实践模式
  const handleEnterTowerMode = useCallback(() => {
    setCurrentScreen('towerMode');
  }, []);

  // 从安全实践返回主菜单
  const handleBackFromTowerMode = useCallback(() => {
    setCurrentScreen('lobby');
  }, []);

  // 开始爬塔（进入地图）
  const handleStartTowerRun = useCallback(() => {
    setCurrentScreen('towerMap');
  }, []);

  // 进入SRayLand地图测试页面
  const handleEnterSRayLandTest = useCallback(() => {
    setCurrentScreen('sraylandTest');
  }, []);

  // 返回大厅
  const handleBackToLobby = useCallback(() => {
    setCurrentScreen('lobby');
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep-space)' }}>
      {currentScreen === 'lobby' && (
        <GameLobby 
          onStartGame={handleStartGame}
          onEnterRoom={handleEnterRoom}
          onEnterLevelMode={() => setCurrentScreen('levelSelection')}
          onEnterTowerMode={handleEnterTowerMode}
          onEnterSRayLandTest={handleEnterSRayLandTest}
        />
      )}
      
      {currentScreen === 'room' && hostPlayer && (
        <GameRoom
          hostPlayer={hostPlayer}
          onStartGame={handleRoomStartGame}
          onCancel={handleRoomCancel}
        />
      )}
      
      {currentScreen === 'game' && gameState && gameState.players.length > 0 && (
        <GameInterface 
          gameState={gameState}
          currentPlayer={gameState.players[gameState.currentPlayerIndex]}
          currentPhase={currentPhase}
          phaseTimeLeft={phaseTimeLeft}
          phaseTotalTime={phaseTotalTime}
          gameLogs={gameLogs}
          onPlayCard={handlePlayCard}
          onEndTurn={handleEndTurn}
          onDiscardCard={handleDiscardCard}
          onEndDiscard={handleEndDiscard}
          isPlayerTurn={!gameState.players[gameState.currentPlayerIndex]?.isAI}
        />
      )}

      {currentScreen === 'levelSelection' && (
        <LevelSelection
          onStartLevel={handleStartLevelGame}
          onBack={() => setCurrentScreen('lobby')}
          onOpenCardLibrary={handleOpenCardLibrary}
          onReloadLevelProgress={() => levelGameStateManager.reloadProgress()}
        />
      )}

      {currentScreen === 'levelDeckBuilder' && (
        <LevelDeckBuilder
          onBack={handleBackFromCardLibrary}
        />
      )}

      {/* 安全实践模式入口 */}
      {currentScreen === 'towerMode' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 pt-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  安全实践
                </span>
              </h1>
              <p className="text-lg text-slate-400">Roguelike爬塔模式</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-3">游戏特色</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    3幕28层随机地图
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    20个重新编排的关卡
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    永久继承系统
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    T0-T10科技树
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-3">游戏流程</h3>
                <ol className="space-y-2 text-slate-300 list-decimal list-inside">
                  <li>选择路径，进入节点</li>
                  <li>完成战斗/事件/商店</li>
                  <li>获得奖励，提升实力</li>
                  <li>挑战Boss，进入下一幕</li>
                </ol>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartTowerRun}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-300"
              >
                开始新爬塔
              </button>
              <button
                onClick={handleBackFromTowerMode}
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all duration-300"
              >
                返回主菜单
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 爬塔地图页面 - 使用TowerModeApp作为总入口 */}
      {currentScreen === 'towerMap' && (
        <TowerModeApp 
          onSaveExit={() => setCurrentScreen('towerMode')}
        />
      )}

      {/* TowerModeApp (保留作为备用入口) */}
      {currentScreen === 'towerMapLegacy' && (
        <TowerModeApp 
          onSaveExit={() => setCurrentScreen('towerMode')}
        />
      )}

      {currentScreen === 'levelGame' && levelGameState && (
        <LevelGameInterface
          gameState={levelGameState}
          onPlayCard={handleLevelPlayCard}
          onPlayCardWithArea={handleLevelPlayCardWithArea}
          onEndTurn={handleLevelEndTurn}
          onDiscardCard={handleLevelDiscardCard}
          onEndDiscard={handleLevelEndDiscard}
          onAdvancePhase={handleLevelAdvancePhase}
          onExit={handleExitLevel}
          getCardAreaSelectionInfo={levelGameStateManager.getCardAreaSelectionInfo.bind(levelGameStateManager)}
          onJudgmentComplete={handleLevelJudgmentComplete}
          onRogueSelect={(optionId) => {
            console.log(`[App] 肉鸽选择: ${optionId}`);
            return levelGameStateManager.selectRogueOption(optionId);
          }}
        />
      )}

      {currentScreen === 'sraylandTest' && (
        <div style={{ position: 'relative' }}>
          <SRayLandMapTest />
          <button 
            onClick={handleBackToLobby}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              zIndex: 100,
              padding: '10px 20px',
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← 返回大厅
          </button>
        </div>
      )}
      
      <VictoryModal
        victoryResult={victoryResult}
        isOpen={showVictoryModal}
        onClose={() => setShowVictoryModal(false)}
        onBackToLobby={() => {
          setShowVictoryModal(false);
          setVictoryResult(null);
          setGameState(null);
          setGameLogs([]);
          setCurrentScreen('lobby');
          if (gameLoopRef.current) {
            gameLoopRef.current.stop();
            gameLoopRef.current = null;
          }
        }}
        gameLogs={gameState?.log || []}
        totalRounds={gameState?.round || 0}
      />

      {levelCompletionResult && (
        <LevelCompleteModal
          result={levelCompletionResult}
          isOpen={showLevelCompleteModal}
          onClose={() => setShowLevelCompleteModal(false)}
          onNextLevel={handleNextLevel}
          onBackToMenu={handleBackToLevelSelection}
          onRetry={handleRetryLevel}
        />
      )}
      
      <Toaster />
    </div>
  );
}

export default App;
