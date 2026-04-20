import { getGourdTopology, getAllGourdTopologies } from '../data/gourdTopologies';
import type { GourdMapTopology } from '../types/grid.types';

declare const require: (id: string) => any;

export interface AssembledTopology {
  topology: GourdMapTopology;
  visualData: Record<string, any> | null;
  layer: number;
}

function getLayerVisualData(layer: number): Record<string, any> | null {
  try {
    const visualModule = require(`../data/layers/L${layer}_visualData`);
    return visualModule[`L${layer}_VISUAL_DATA`] ?? visualModule.default ?? null;
  } catch {
    return null;
  }
}

export function assembleL1Topology(): AssembledTopology {
  return assembleLayerTopology(1);
}

export function assembleLayerTopology(layer: number): AssembledTopology {
  const topology = getGourdTopology(layer);
  const visualData = getLayerVisualData(layer);
  return { topology, visualData, layer };
}

export function preassembleAllLayers(): Map<number, AssembledTopology> {
  const result = new Map<number, AssembledTopology>();
  for (let i = 1; i <= 9; i++) {
    result.set(i, assembleLayerTopology(i));
  }
  return result;
}
