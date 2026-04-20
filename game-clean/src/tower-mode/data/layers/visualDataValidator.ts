import { L1_VISUAL_DATA } from './L1_visualData';
import { L2_VISUAL_DATA } from './L2_visualData';
import { L3_VISUAL_DATA } from './L3_visualData';
import { L4_VISUAL_DATA } from './L4_visualData';
import { L5_VISUAL_DATA } from './L5_visualData';
import { L6_VISUAL_DATA } from './L6_visualData';
import { L7_VISUAL_DATA } from './L7_visualData';
import { L8_VISUAL_DATA } from './L8_visualData';
import { L9_VISUAL_DATA } from './L9_visualData';
import type { GourdShapeParams, GourdCoordinate } from './gourdShapes';

export interface VisualValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_BORDER_FIELDS = ['enabled', 'mode', 'borderWidth', 'colors', 'tileSize', 'innerPadding', 'cornerRadius', 'opacity', 'glowColor'];
const REQUIRED_QUADRANT_FIELDS = ['quadrant', 'label', 'fontSizeRatio', 'color', 'fontWeight', 'fontFamily', 'strokeColor', 'strokeWidth'];
const REQUIRED_ZONE_V2_FIELDS = ['fillColor', 'pattern', 'patternColor', 'enterAnimClass', 'centerPosition', 'shape'];

export function validateLayerVisualData(data: Record<string, any>, layerNum: number): VisualValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.border || typeof data.border !== 'object') {
    errors.push(`L${layerNum}: border is missing or not an object`);
  } else {
    if (!data.border.mode) {
      errors.push(`L${layerNum}: border.mode is missing`);
    } else if (!['checkerboard-fill', 'radial-lines'].includes(data.border.mode)) {
      errors.push(`L${layerNum}: border.mode="${data.border.mode}" is not valid`);
    }
    for (const field of REQUIRED_BORDER_FIELDS) {
      if (data.border[field] === undefined) {
        errors.push(`L${layerNum}: border.${field} is missing`);
      }
    }
    if (data.border.tileSize !== undefined && data.border.tileSize !== 7) {
      warnings.push(`L${layerNum}: border.tileSize=${data.border.tileSize} (should be 7)`);
    }
    if (data.border.opacity !== undefined && data.border.opacity < 0.90) {
      warnings.push(`L${layerNum}: border.opacity=${data.border.opacity} (should be >=0.95)`);
    }
  }

  if (!Array.isArray(data.quadrantLabels)) {
    errors.push(`L${layerNum}: quadrantLabels is missing or not an array`);
  } else if (data.quadrantLabels.length < 4) {
    errors.push(`L${layerNum}: quadrantLabels needs 4 elements, got ${data.quadrantLabels.length}`);
  } else {
    for (const q of data.quadrantLabels) {
      if (!q.quadrant) errors.push(`L${layerNum}: quadrantLabel missing "quadrant" field (has "position"?)`);
      if ((q.fontSizeRatio ?? 0) < 0.36) warnings.push(`L${layerNum}: ${q.quadrant ?? '?'} fontSizeRatio=${q.fontSizeRatio} (should be >=0.36)`);
      if (!q.strokeColor) warnings.push(`L${layerNum}: ${q.quadrant ?? '?'} missing strokeColor`);
      if (!q.fontFamily) warnings.push(`L${layerNum}: ${q.quadrant ?? '?'} missing fontFamily`);
      for (const field of REQUIRED_QUADRANT_FIELDS) {
        if (q[field] === undefined) warnings.push(`L${layerNum}: quadrantLabel ${q.quadrant ?? '?'} missing ${field}`);
      }
    }
  }

  const cellVisualStyles = data.cellVisualStyles;
  if (!cellVisualStyles || typeof cellVisualStyles !== 'object') {
    errors.push(`L${layerNum}: cellVisualStyles is missing or not an object`);
  } else {
    const hasBoss = 'boss' in cellVisualStyles;
    if (!hasBoss) {
      errors.push(`L${layerNum}: cellVisualStyles must contain "boss" key`);
    } else {
      const boss = cellVisualStyles.boss;
      if (!boss || boss.sizeMultiplier === undefined) {
        errors.push(`L${layerNum}: boss must have sizeMultiplier`);
      } else if (layerNum === 9 ? Math.abs(boss.sizeMultiplier - 3.0) > 0.1 : Math.abs(boss.sizeMultiplier - 2.5) > 0.1) {
        errors.push(`L${layerNum}: boss sizeMultiplier=${boss.sizeMultiplier} (should be ${layerNum === 9 ? '3.0' : '2.5'})`);
      }
      if (!boss.animationClass) warnings.push(`L${layerNum}: boss missing animationClass`);
    }

    const hasElite = 'elite' in cellVisualStyles;
    if (hasElite && !cellVisualStyles.elite.animationClass) {
      warnings.push(`L${layerNum}: elite missing animationClass`);
    }

    const hasChance = 'chance' in cellVisualStyles;
    if (hasChance && !cellVisualStyles.chance.animationClass) {
      warnings.push(`L${layerNum}: chance missing animationClass`);
    }

    for (const [type, style] of Object.entries(cellVisualStyles as Record<string, any>)) {
      if (style.icon && typeof style.icon === 'object' && style.icon.type !== 'svg') {
        warnings.push(`L${layerNum}: ${type} icon.type="${style.icon.type}" (should be "svg")`);
      }
      if (style.icon && typeof style.icon === 'string') {
        errors.push(`L${layerNum}: ${type} icon is a string (emoji), must be {type:'svg',data:''}`);
      }
    }
  }

  if (!data.stateVisualOverrides || typeof data.stateVisualOverrides !== 'object') {
    errors.push(`L${layerNum}: stateVisualOverrides is missing or not an object`);
  } else {
    for (const [state, override] of Object.entries(data.stateVisualOverrides as Record<string, any>)) {
      if (override.animationClass === undefined && state !== 'locked' && state !== 'failed') {
        warnings.push(`L${layerNum}: stateVisualOverrides.${state} missing animationClass`);
      }
    }
  }

  if (!data.pathVisualStyles || typeof data.pathVisualStyles !== 'object') {
    errors.push(`L${layerNum}: pathVisualStyles is missing or not an object`);
  }

  if (!data.zoneBackgrounds || typeof data.zoneBackgrounds !== 'object') {
    errors.push(`L${layerNum}: zoneBackgrounds is missing or not an object`);
  } else {
    for (const [zone, bg] of Object.entries(data.zoneBackgrounds as Record<string, any>)) {
      for (const field of REQUIRED_ZONE_V2_FIELDS) {
        if (bg[field] === undefined) {
          warnings.push(`L${layerNum}: zoneBackgrounds.${zone} missing ${field}`);
        }
      }
    }
  }

  if (!data.background || typeof data.background !== 'object') {
    errors.push(`L${layerNum}: background is missing or not an object`);
  } else {
    if (!data.background.primary) errors.push(`L${layerNum}: background.primary is missing`);
    if (!data.background.decorations || !Array.isArray(data.background.decorations)) {
      errors.push(`L${layerNum}: background.decorations is missing or not an array`);
    } else if (data.background.decorations.length < 5) {
      warnings.push(`L${layerNum}: decorations.length=${data.background.decorations.length} (should be >=5)`);
    }
  }

  if (!data.gourdCoordinates || typeof data.gourdCoordinates !== 'object' || Array.isArray(data.gourdCoordinates)) {
    errors.push(`L${layerNum}: gourdCoordinates is missing or not a Record`);
  }

  if (!data.layerMechanic || typeof data.layerMechanic !== 'object') {
    warnings.push(`L${layerNum}: layerMechanic is missing`);
  } else {
    if (!data.layerMechanic.type) warnings.push(`L${layerNum}: layerMechanic.type is missing`);
    if (!data.layerMechanic.name) warnings.push(`L${layerNum}: layerMechanic.name is missing`);
    if (!data.layerMechanic.triggerCondition) warnings.push(`L${layerNum}: layerMechanic.triggerCondition is missing`);
    if (!data.layerMechanic.effect) warnings.push(`L${layerNum}: layerMechanic.effect is missing`);
    if (!data.layerMechanic.visualHint) warnings.push(`L${layerNum}: layerMechanic.visualHint is missing`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateCoordinatesInBounds(
  coords: Record<string, GourdCoordinate>,
  params: GourdShapeParams
): boolean[] {
  const results: boolean[] = [];
  const narrowPointY = params.connector.narrowPointY;

  for (const key of Object.keys(coords)) {
    const coord = coords[key];
    let valid = true;

    if (
      coord.cartesian.x < 0 || coord.cartesian.x > 1 ||
      coord.cartesian.y < 0 || coord.cartesian.y > 1
    ) {
      valid = false;
    }

    if (valid) {
      switch (coord.region) {
        case 'upperCircle' as any:
          if (coord.cartesian.y >= narrowPointY) valid = false;
          break;
        case 'connector' as any:
          if (Math.abs(coord.cartesian.y - narrowPointY) > 0.1) valid = false;
          break;
        case 'lowerCircle' as any:
          if (coord.cartesian.y <= narrowPointY) valid = false;
          break;
        default:
          valid = false;
      }
    }

    results.push(valid);
  }

  return results;
}

export function validateBossPosition(
  bossCoord: GourdCoordinate,
  params: GourdShapeParams
): boolean {
  if (bossCoord.region !== ('lowerCircle' as any)) return false;

  const dx = Math.abs(bossCoord.cartesian.x - params.lowerCircle.centerX);
  if (dx >= 0.1) return false;

  const dy = Math.abs(bossCoord.cartesian.y - params.lowerCircle.centerY);
  if (dy >= 0.15) return false;

  return true;
}

export function validateAllLayers(): void {
  const layers = [
    L1_VISUAL_DATA,
    L2_VISUAL_DATA,
    L3_VISUAL_DATA,
    L4_VISUAL_DATA,
    L5_VISUAL_DATA,
    L6_VISUAL_DATA,
    L7_VISUAL_DATA,
    L8_VISUAL_DATA,
    L9_VISUAL_DATA,
  ];

  let totalErrors = 0;
  let totalWarnings = 0;

  for (let i = 0; i < layers.length; i++) {
    const result = validateLayerVisualData(layers[i], i + 1);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;

    console.log(`\n=== L${i + 1} ${result.valid ? '✅' : '❌'} ===`);
    if (result.errors.length) console.error('  ERRORS:', result.errors);
    if (result.warnings.length) console.warn('  WARNINGS:', result.warnings);
  }

  console.log(`\n总计: ${totalErrors} errors, ${totalWarnings} warnings`);
  if (totalErrors > 0) process.exit(1);
}
