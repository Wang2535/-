import type {
  TowerLayerData,
  AssignmentResult,
  EnrichedTopology,
  LevelPoolEntry,
} from '../types';

export class MapLevelIntegrator {
  integrateLevelsToTopology(
    topology: TowerLayerData,
    assignment: AssignmentResult,
  ): EnrichedTopology {
    const assignedLevelsCopy = new Map(assignment.assignedLevels);

    const bossConfig: EnrichedTopology['bossConfig'] = {
      prototype: assignment.selectedBossPrototype,
      generatedBoss: assignment.generatedBoss,
      bossCellId: topology.bossCellId,
      unlockCondition: {
        requiredClearedCount: this.countBattleCells(topology),
        currentClearedCount: 0,
      },
    };

    const difficultyGradient: EnrichedTopology['difficultyGradient'] = {
      mainPath: [...assignment.difficultyGradient.mainPath],
      branchPaths: assignment.difficultyGradient.branchPaths.map(p => [...p]),
      eliteCellIds: [...assignment.difficultyGradient.eliteCellIds],
    };

    const assignmentMeta: EnrichedTopology['assignmentMeta'] = {
      assignedAt: Date.now(),
      algorithm: 'LevelAssignmentAlgorithm',
      seed: 0,
    };

    return {
      ...topology,
      assignedLevels: assignedLevelsCopy,
      bossConfig,
      difficultyGradient,
      assignmentMeta,
    };
  }

  validateAssignment(assignment: AssignmentResult): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (assignment.layer < 1 || assignment.layer > 9) {
      issues.push(`Invalid layer number: ${assignment.layer}`);
    }

    if (assignment.assignedLevels.size === 0) {
      issues.push('No levels assigned');
    }

    const assignedIds = new Set<string>();
    for (const entry of assignment.assignedLevels.values()) {
      if (assignedIds.has(entry.id)) {
        issues.push(`Duplicate level assignment: ${entry.id}`);
      }
      assignedIds.add(entry.id);
    }

    if (!assignment.selectedBossPrototype) {
      issues.push('No boss prototype selected');
    }

    if (!assignment.generatedBoss) {
      issues.push('No generated boss');
    }

    if (assignment.difficultyGradient.mainPath.length === 0) {
      issues.push('Empty main path');
    }

    const eliteCount = assignment.difficultyGradient.eliteCellIds.length;
    const totalCount = assignment.assignedLevels.size;
    if (totalCount > 0 && eliteCount / totalCount > 0.5) {
      issues.push(`Too many elite grids: ${eliteCount}/${totalCount} (${(eliteCount / totalCount * 100).toFixed(1)}%)`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  private countBattleCells(topology: TowerLayerData): number {
    return topology.cells.filter(c => c.type === 'battle').length;
  }
}
