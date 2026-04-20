import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTowerGameController } from '../../controllers/useTowerGameController';
import { GourdMapRenderer } from '../GourdMapRenderer';
import { GameHUD } from '../GameHUD/GameHUD';
import { PathSelector } from '../PathSelector/PathSelector';
import { MovementControl } from '../MovementControl';
import { MechanicVisualizer } from '../GourdMapRenderer/MechanicVisualizer';
import { LayerTransitionFX } from '../GourdMapRenderer/LayerTransitionFX';
import { getGourdTopology } from '../../data/gourdTopologies';
import { LAYER_THEMES } from '../../data/layerThemes';
import type { GridCell } from '../../types/grid.types';
import type { DiceRollResult, MoveOption } from '../../types';
import './styles.css';

export interface GameStats {
  totalTurns: number;
  finalLayer: number;
  techValue: number;
  gold: number;
}

interface TowerClimbViewProps {
  initialLayer?: number;
  onGameComplete?: (stats: GameStats) => void;
}

export function TowerClimbView({ initialLayer = 1, onGameComplete }: TowerClimbViewProps) {
  const controller = useTowerGameController();
  const {
    phase, diceResult, isRolling, techValue, gold, turnNumber,
    cellInfoData, bossDangerActive, rollDice, selectPath,
    enterCell, skipCell, closePanel, startNewGame, engineRef, eventBus,
  } = controller;

  const [currentLayer, setCurrentLayer] = useState(initialLayer);
  const [previousLayer, setPreviousLayer] = useState(initialLayer);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [availablePaths, setAvailablePaths] = useState<Array<{
    targetCellId: string; pathCells?: string[]; totalSteps?: number; direction?: string;
  }>>([]);
  const [moveOptions, setMoveOptions] = useState<MoveOption[]>([]);

  // 将 DiceResult 转换为 DiceRollResult (MovementControl 需要的格式)
  const adaptedDiceResult = useMemo<DiceRollResult | null>(() => {
    if (!diceResult) return null;
    return {
      rawValue: diceResult.baseValue,
      modifiedValue: diceResult.finalValue,
      modifiers: diceResult.modifiers.map(m => ({
        source: m.type === 'zone_w' ? 'zone_W' : m.type === 'zone_s' ? 'zone_S' : 'skill' as const,
        delta: m.delta,
        description: m.description ?? m.source,
      })),
    };
  }, [diceResult]);

  // 监听掷骰子结果，更新可用路径和移动选项
  useEffect(() => {
    if (!eventBus) return;

    const unsubDiceResult = eventBus.on('dice:result' as any, () => {
      const paths = engineRef.current?.getAvailablePaths() ?? [];
      setAvailablePaths(paths);

      // 将 PathOption 转换为 MoveOption
      const topology = getGourdTopology(currentLayer);
      if (topology) {
        const allCellIds = [
          ...topology.upperCircle.cellIds,
          ...topology.connector.cellIds,
          ...topology.lowerCircle.cellIds,
        ];
        const options: MoveOption[] = paths.map((p, idx) => ({
          targetCell: {
            id: p.targetCellId,
            type: 'level' as const,
            coordinate: { x: 0, y: 0 },
          },
          path: [],
          distance: p.totalSteps ?? 1,
          zoneWarnings: [],
          recommended: idx === 0,
          riskScore: 0,
        }));
        setMoveOptions(options);
      }
    });

    const unsubPathSelected = eventBus.on('path:selected' as any, () => {
      setAvailablePaths([]);
      setMoveOptions([]);
    });

    const unsubLayerChange = eventBus.on('layer:change' as any, (event: any) => {
      const newLayer = event.newLayer ?? event.to;
      if (newLayer && newLayer !== currentLayer) {
        setPreviousLayer(currentLayer);
        setCurrentLayer(newLayer);
        setIsTransitioning(true);
      }
    });

    const unsubTurnEnd = eventBus.on('turn:end' as any, () => {
      setMoveOptions([]);
      if (currentLayer >= 9) {
        const gamePhase = engineRef.current?.getPhase();
        if (gamePhase === 'game_over' || gamePhase === 'victory') {
          onGameComplete?.({ totalTurns: turnNumber, finalLayer: currentLayer, techValue, gold });
        }
      }
    });

    return () => { unsubDiceResult(); unsubPathSelected(); unsubLayerChange(); unsubTurnEnd(); };
  }, [eventBus, engineRef, currentLayer, turnNumber, techValue, gold, onGameComplete]);

  const handlePathSelect = useCallback((index: number) => { selectPath(index); }, [selectPath]);
  const handleCellClick = useCallback((cellId: string) => {
    if (phase === 'cell_arrived' || phase === 'cell_interacting') { enterCell(cellId); }
  }, [phase, enterCell]);
  const handleRollDice = useCallback(() => { rollDice(); }, [rollDice]);
  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false);
    engineRef.current?.resetMechanicState?.(currentLayer);
  }, [currentLayer, engineRef]);
  const handleNewGame = useCallback(() => {
    setCurrentLayer(initialLayer); setPreviousLayer(initialLayer); setIsTransitioning(false); startNewGame();
  }, [initialLayer, startNewGame]);

  const layerTheme = useMemo(() => {
    const theme = LAYER_THEMES[currentLayer];
    return theme
      ? {
          accentColor: theme.colorScheme.accent,
          particleStyle: theme.theme,
        }
      : { accentColor: '#4488ff', particleStyle: 'default' };
  }, [currentLayer]);

  const layerName = useMemo(() => {
    const theme = LAYER_THEMES[currentLayer];
    return theme?.name ?? `第${currentLayer}层`;
  }, [currentLayer]);

  const topology = useMemo(() => getGourdTopology(currentLayer), [currentLayer]);

  const currentCells = useMemo<GridCell[]>(() => {
    if (!topology?.cells || topology.cells.length === 0) return [];
    return topology.cells;
  }, [topology]);

  return (
    <div className="tower-climb-view" style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0a0a2e', color: '#ffffff', position: 'relative',
    }}>
      <GameHUD
        layerName={layerName} turnNumber={turnNumber} techValue={techValue} gold={gold}
        phase={phase} onRollDice={handleRollDice} isRolling={isRolling}
        canRoll={phase === 'idle' || phase === 'dice_ready'}
      />

      <div className="tower-map-area" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <GourdMapRenderer
          topology={topology} cells={currentCells} currentPosition={null}
          highlightedCells={[]} pieceState={null} onCellClick={handleCellClick}
          bossDangerActive={bossDangerActive} layerTheme={layerTheme} cellInfoData={cellInfoData}
          onCellEnter={enterCell} onCellSkip={skipCell} onPanelClose={closePanel}
          layerNumber={currentLayer} transitionFromLayer={previousLayer}
          transitionToLayer={currentLayer} onTransitionComplete={handleTransitionComplete}
        />

        <MechanicVisualizer mechanicType={layerTheme.particleStyle} />

        <LayerTransitionFX
          fromLayer={previousLayer} toLayer={currentLayer}
          isActive={isTransitioning} onComplete={handleTransitionComplete}
        />
      </div>

      {(phase === 'path_selecting' || phase === 'dice_result') && availablePaths.length > 0 && (
        <div className="tower-bottom-panel" style={{
          padding: '1rem', background: 'rgba(10, 10, 40, 0.8)', borderTop: '1px solid #333366',
        }}>
          <PathSelector availablePaths={availablePaths} onSelect={handlePathSelect} visible={true} />
        </div>
      )}

      <MovementControl
        diceResult={adaptedDiceResult}
        moveOptions={moveOptions}
        onRollDice={() => rollDice() ?? undefined}
        onMove={(cellId) => {
          const pathIndex = moveOptions.findIndex(o => o.targetCell.id === cellId);
          if (pathIndex >= 0) {
            selectPath(pathIndex);
          }
        }}
        disabled={phase !== 'idle'}
        isMoving={phase === 'moving' || isRolling}
      />
    </div>
  );
}
