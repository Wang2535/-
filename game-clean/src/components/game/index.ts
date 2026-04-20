/**
 * 游戏组件统一导出
 */

export { TurnPhaseIndicator } from './TurnPhaseIndicator';
export type { TurnPhase } from '@/types/gameRules';
export { RegionMap, type RegionId, type Controller } from './RegionMap';
export { JudgmentPanel, type RPSChoice, type JudgmentType } from './JudgmentPanel';
export { TechTreePanel, type TechLevel } from './TechTreePanel';
export { CardDetail, CardPreview, type CardType, type CardRarity, type CardFaction } from './CardDetail';
export type { CardData } from './CardDetail';
export { ComboEffectOverlay } from './ComboEffectOverlay';
export { GameLogPanel } from './GameLogPanel';
export { AreaSelectionModal, type AreaType } from './AreaSelectionModal';
export { EnhancedCardHand } from './EnhancedCardHand';
export { TargetSelectionModal } from './TargetSelectionModal';
