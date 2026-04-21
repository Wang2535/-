

interface TowerModeAppProps {
  onSaveExit?: () => void;
  initialSeed?: number;
}

export function TowerModeApp({ onSaveExit, initialSeed }: TowerModeAppProps) {
  const controllerRef = useRef<TowerModeController | null>(null);
  const [renderState, setRenderState] = useState<TowerRenderState | null>(null);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [layerStates, setLayerStates] = useState<Record<number, LayerState>>(getDefaultLayerStates);

  useEffect(() => {
    console.log('[TowerModeApp] Starting initialization...');
    const ctrl = new TowerModeController();
    controllerRef.current = ctrl;

    ctrl.initialize({ seed: initialSeed }).then(() => {
      console.log('[TowerModeApp] Initialization successful');
      // Register callbacks first
      ctrl.onStateChange(setRenderState);
      ctrl.onPhaseChange(setPhase);
      // Get initial state immediately
      const initialState = ctrl.getRenderState();
      console.log('[TowerModeApp] Initial state:', initialState);
      if (initialState) {
        setRenderState(initialState);
      }
      setIsLoading(false);
      console.log('[TowerModeApp] isLoading set to false, phase:', ctrl.getPhase());
    }).catch((error) => {
      console.error('[TowerModeApp] TowerModeController initialization failed:', error);
      setIsLoading(false);
    });

    return () => {
      ctrl.dispose();
      controllerRef.current = null;
    };
  }, [initialSeed]);

  const handleStartNewGame = useCallback(() => {
    controllerRef.current?.startNewGame();
  }, []);

  const handleLoadGame = useCallback((slotId: string) => {
    controllerRef.current?.continueFromSave(slotId);
  }, []);

  const handleRollDice = useCallback(() => {
    return controllerRef.current?.rollDice();
  }, []);

  const handleMoveTo = useCallback(async (cellId: string) => {
    return controllerRef.current?.moveToCell(cellId);
  }, []);

  const handleCellInteraction = useCallback(async (action: string, payload?: unknown) => {
    return controllerRef.current?.interactWithCurrentCell(action, payload);
  }, []);

  const handleQuickSave = useCallback(async () => {
    await controllerRef.current?.quickSave();
  }, []);

  const handleResume = useCallback(() => {
    controllerRef.current?.resume();
  }, []);

  const handleOpenMenu = useCallback((menuType: 'save' | 'load' | 'settings') => {
    controllerRef.current?.openMenu(menuType);
  }, []);

  const handleEnterMapOverview = useCallback(() => {
    setPhase('map_overview');
  }, []);

  const handleStartGameFromMenu = useCallback(() => {
    // 先进入总地图界面，让用户选择层级
    setPhase('map_overview');
  }, []);

  const handleSelectLayer = useCallback((layerNumber: number) => {
    // 启动指定层级的游戏
    controllerRef.current?.startNewGame(layerNumber);
    // TowerModeController 会设置 phase 为 'playing'
    // 我们需要监听 phase 变化来同步 UI
  }, []);

  const handleReturnToMap = useCallback(() => {
    setPhase('map_overview');
  }, []);

  const handleReturnToStart = useCallback(() => {
    setPhase('idle');
  }, []);

  const currentPlayerCellId = useMemo(() => {
    if (!renderState?.layerData?.cells) return null;
    const pos = renderState.currentPosition;
    const cell = renderState.layerData.cells.find(
      (c: any) => c.coordinate?.[0] === pos?.[0] && c.coordinate?.[1] === pos?.[1]
    );
    return cell?.id ?? null;
  }, [renderState?.currentPosition, renderState?.layerData?.cells]);

  const topology = useMemo(() => {
    if (!renderState?.playerStats?.layer) return null;
    // 使用SRayLand地图拓扑
    return getSRayLandTopology(renderState.playerStats.layer);
  }, [renderState?.playerStats?.layer]);

  const convertedCells = useMemo((): GridCell[] => {
    if (!renderState?.layerData?.cells || !topology) return [];
    return topology.cells.map(topoCell => {
      const layerCell = renderState.layerData.cells.find(lc => lc.id === topoCell.id);
      return {
        ...topoCell,
        state: layerCell?.state ?? topoCell.state,
        type: (layerCell?.type === 'battle' ? 'level' :
               layerCell?.type === 'boss' ? 'boss' :
               layerCell?.type === 'chance' ? 'opportunity' :
               layerCell?.type === 'bookstore' ? 'bookstore' :
               layerCell?.type === 'skill' ? 'skill' : topoCell.type) as any,
        difficulty: layerCell?.difficulty ?? topoCell.difficulty,
      };
    });
  }, [renderState?.layerData?.cells, topology]);

  const highlightedCellIds = useMemo(() => {
    if (!renderState?.moveOptions) return [];
    return renderState.moveOptions.map(opt => opt.targetCell.id);
  }, [renderState?.moveOptions]);

  if (isLoading) {
    return (
      <div className="tower-mode-loading" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%)',
        color: '#e0e0ff',
        fontSize: '1.5rem',
        fontFamily: 'monospace',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏰</div>
          <div>加载中...</div>
        </div>
      </div>
    );
  }

  if (phase === 'idle') {
    return (
      <TowerStartScreen
        onStart={handleStartGameFromMenu}
        onLoad={handleLoadGame}
        onExit={onSaveExit}
      />
    );
  }

  if (phase === 'map_overview') {
    return (
      <TowerMainMap
        layerStates={layerStates}
        onSelectLayer={handleSelectLayer}
        onReturn={handleReturnToStart}
      />
    );
  }

  if (phase === 'game_complete' && renderState) {
    return (
      <GameCompleteScreen
        stats={renderState.playerStats}
        onRestart={handleStartNewGame}
        onExit={onSaveExit}
      />
    );
  }

  return (
    <div className="tower-mode-container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #0d0d35 100%)',
      color: '#e0e0ff',
      fontFamily: 'monospace',
      overflow: 'hidden',
    }}>
      <TowerHUD
        layer={renderState?.playerStats.layer ?? 1}
        hp={renderState?.playerStats.hp ?? { current: 100, max: 100 }}
        activeSkills={renderState?.playerStats.activeSkills ?? []}
        packetCount={renderState?.playerStats.packetCount ?? 0}
        bookCount={renderState?.playerStats.bookCount ?? 0}
        moveCount={renderState?.playerStats.moveCount ?? 0}
        phase={phase}
        onMenuClick={() => handleOpenMenu('settings')}
        onReturnToMap={handleReturnToMap}
      />

      <div style={{ flex: 1, position: 'relative', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {renderState?.layerData && topology && (
          <SRayLandMapRenderer
            currentCellId={currentPlayerCellId}
            onCellClick={handleMoveTo}
          />
        )}
      </div>

      <MovementControl
        diceResult={renderState?.diceResult ?? null}
        moveOptions={renderState?.moveOptions ?? []}
        onRollDice={handleRollDice}
        onMove={handleMoveTo}
        disabled={!controllerRef.current?.canAct()}
        isMoving={phase === 'transitioning'}
      />

      {renderState?.uiState.activeModal === 'battle_entrance' && (
        <BattleEntranceModal
          data={renderState.uiState.modalData as any}
          onConfirm={() => handleCellInteraction('confirm')}
          onRetreat={() => handleCellInteraction('retreat')}
        />
      )}

      {renderState?.uiState.activeModal === 'chance_event' && (
        <ChanceEventModal
          data={renderState.uiState.modalData as any}
          onSelectOption={(optionId: string) => handleCellInteraction('select_option', { optionId })}
        />
      )}

      {renderState?.uiState.activeModal === 'bookstore' && (
        <BookstoreModal
          data={renderState.uiState.modalData as any}
          onSelectBook={(bookId: string) => handleCellInteraction('select_book', { bookId })}
          onLeave={() => controllerRef.current?.closeModal()}
        />
      )}

      {renderState?.uiState.activeModal === 'skill_offer' && (
        <SkillPanel
          data={renderState.uiState.modalData as any}
          onSelectSkill={(skillId: string, replaceSlot?: number) => handleCellInteraction('select_skill', { skillId, replaceSlot })}
          onSkip={() => controllerRef.current?.closeModal()}
        />
      )}

      {renderState?.uiState.activeModal === 'boss_reward' && (
        <DataPacketSelector
          data={renderState.uiState.modalData as any}
          onSelectPacket={(packetId: string) => handleCellInteraction('select_packet', { packetId })}
        />
      )}

      {renderState?.uiState.activeModal === 'layer_transition' && (
        <LayerTransition
          data={renderState.uiState.modalData as any}
          onProceed={() => handleCellInteraction('proceed')}
        />
      )}

      <NotificationContainer
        notifications={renderState?.uiState.notifications ?? []}
        onDismiss={(id: string) => controllerRef.current?.removeNotification(id)}
      />

      {phase === 'paused' && (
        <PauseOverlay
          onResume={handleResume}
          onSave={handleQuickSave}
          onExit={onSaveExit}
        />
      )}
    </div>
  );
}
