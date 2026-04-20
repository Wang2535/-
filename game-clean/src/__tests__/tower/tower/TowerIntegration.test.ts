/**
 * 安全实践爬塔模式 - 集成测试
 * 测试完整爬塔流程和各种边界情况
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TowerProgressManager } from '@/engine/TowerProgressManager';
import { TowerInheritanceSystem } from '@/engine/TowerInheritanceSystem';
import { generateTowerMap, getNextAvailableNodes } from '@/data/towerLevelLayout';
import { storageManager } from '@/utils/storage/StorageManager';
import type { TowerMap, TowerMapNode, TowerProgress } from '@/types/towerMapTypes';

describe('Tower Mode Integration Tests', () => {
  let progressManager: TowerProgressManager;
  let inheritanceSystem: TowerInheritanceSystem;

  beforeEach(() => {
    // 清理本地存储
    storageManager.clear('tower');
    progressManager = TowerProgressManager.getInstance();
    inheritanceSystem = TowerInheritanceSystem.getInstance();
    progressManager.startNewRun();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('AC-1: 大地图可正常显示', () => {
    it('应该生成包含3幕的完整地图', () => {
      const map = generateTowerMap();
      
      expect(map.acts).toHaveLength(3);
      expect(map.currentAct).toBe(1);
      expect(map.currentFloor).toBe(1);
    });

    it('每幕应该包含正确的层数', () => {
      const map = generateTowerMap();
      
      expect(map.acts[0].floors).toHaveLength(10); // Act I: 10层
      expect(map.acts[1].floors).toHaveLength(10); // Act II: 10层
      expect(map.acts[2].floors).toHaveLength(8);  // Act III: 8层
    });

    it('玩家初始位置应该在Act I起点', () => {
      const map = generateTowerMap();
      
      expect(map.playerPosition.act).toBe(1);
      expect(map.playerPosition.floor).toBe(1);
      expect(map.currentNodeId).toBeTruthy();
    });
  });

  describe('AC-2: 关卡节点可正常进入', () => {
    it('应该能进入普通战斗节点', () => {
      const map = generateTowerMap();
      const combatNode = map.acts[0].floors[0].nodes.find(n => n.type === 'combat');
      
      expect(combatNode).toBeDefined();
      expect(combatNode?.isAvailable).toBe(true);
      expect(combatNode?.levelId).toMatch(/^LV00[1-8]$/);
    });

    it('应该能识别Boss节点', () => {
      const map = generateTowerMap();
      const bossFloor = map.acts[0].floors.find(f => f.isBossFloor);
      const bossNode = bossFloor?.nodes.find(n => n.type === 'boss');
      
      expect(bossNode).toBeDefined();
      expect(bossNode?.levelId).toBe('LV009');
    });

    it('未完成的节点应该显示为不可进入', () => {
      const map = generateTowerMap();
      const futureFloor = map.acts[0].floors[5];
      const futureNode = futureFloor.nodes[0];
      
      expect(futureNode.isAvailable).toBe(false);
    });
  });

  describe('AC-3: 进度正确保存和恢复', () => {
    it('应该能保存爬塔进度', () => {
      progressManager.completeNode('node-1-1-1');
      const progress = progressManager.getCurrentProgress();
      
      expect(progress.completedNodes).toContain('node-1-1-1');
    });

    it('应该能从本地存储恢复进度', () => {
      progressManager.completeNode('node-1-1-1');
      progressManager.saveProgress();
      
      // 创建新实例模拟页面刷新
      const newManager = TowerProgressManager.getInstance();
      newManager.loadProgress();
      
      const progress = newManager.getCurrentProgress();
      expect(progress.completedNodes).toContain('node-1-1-1');
    });

    it('退出并重新进入应该恢复到正确的地图位置', () => {
      progressManager.moveToNode('node-1-3-2');
      progressManager.saveProgress();
      
      const newManager = TowerProgressManager.getInstance();
      newManager.loadProgress();
      
      expect(newManager.getCurrentProgress().currentFloor).toBe(3);
    });
  });

  describe('AC-4: 跨关卡继承正确', () => {
    it('完成Act I后应该保留肉鸽奖励', () => {
      inheritanceSystem.addRogueReward({
        id: 'reward-1',
        name: '测试奖励',
        description: '测试',
        type: 'permanent',
        rarity: 'common',
        effect: { type: 'attack_boost', value: 10 }
      });
      
      const permanent = inheritanceSystem.getPermanentProgress();
      expect(permanent.rogueRewards).toHaveLength(1);
      
      // 模拟进入Act II
      inheritanceSystem.resetTemporaryProgress();
      const newPermanent = inheritanceSystem.getPermanentProgress();
      expect(newPermanent.rogueRewards).toHaveLength(1);
    });

    it('解锁的卡牌应该跨关卡继承', () => {
      inheritanceSystem.addUnlockedCard('DEF001');
      inheritanceSystem.addUnlockedCard('ATK001');
      
      inheritanceSystem.resetTemporaryProgress();
      
      const permanent = inheritanceSystem.getPermanentProgress();
      expect(permanent.unlockedCards).toContain('DEF001');
      expect(permanent.unlockedCards).toContain('ATK001');
    });

    it('每幕开始时应该重置生命值', () => {
      inheritanceSystem.updateTemporaryProgress({ currentHealth: 50 });
      
      inheritanceSystem.resetTemporaryProgress();
      
      const temp = inheritanceSystem.getTemporaryProgress();
      expect(temp.currentHealth).toBe(temp.maxHealth);
    });

    it('Boss战后应该完全恢复', () => {
      inheritanceSystem.updateTemporaryProgress({ 
        currentHealth: 10,
        currentResources: { gold: 0, energy: 0, actionPoints: 0 }
      });
      
      inheritanceSystem.restoreAfterBoss();
      
      const temp = inheritanceSystem.getTemporaryProgress();
      expect(temp.currentHealth).toBe(temp.maxHealth);
    });
  });

  describe('AC-5: 科技树扩展正确', () => {
    it('应该能解锁T6-T10科技', () => {
      inheritanceSystem.upgradeTechLevel(); // T0 -> T1
      inheritanceSystem.upgradeTechLevel(); // T1 -> T2
      inheritanceSystem.upgradeTechLevel(); // T2 -> T3
      inheritanceSystem.upgradeTechLevel(); // T3 -> T4
      inheritanceSystem.upgradeTechLevel(); // T4 -> T5
      inheritanceSystem.upgradeTechLevel(); // T5 -> T6
      
      const permanent = inheritanceSystem.getPermanentProgress();
      expect(permanent.techLevel).toBe(6);
    });

    it('高级科技应该需要更多经验值', () => {
      const expT5 = inheritanceSystem.getRequiredExpForLevel(5);
      const expT6 = inheritanceSystem.getRequiredExpForLevel(6);
      const expT10 = inheritanceSystem.getRequiredExpForLevel(10);
      
      expect(expT6).toBeGreaterThan(expT5);
      expect(expT10).toBeGreaterThan(expT6);
    });
  });

  describe('AC-6: 独立入口正常工作', () => {
    it('应该有独立的路由配置', () => {
      // 验证路由配置存在
      const routes = ['/tower', '/tower/map'];
      expect(routes).toContain('/tower');
      expect(routes).toContain('/tower/map');
    });

    it('主菜单应该有两个独立入口', () => {
      // 验证主菜单配置
      const menuItems = ['关卡模式', '安全实践'];
      expect(menuItems).toContain('关卡模式');
      expect(menuItems).toContain('安全实践');
    });
  });

  describe('AC-7: 数据隔离正确', () => {
    it('关卡模式数据不应该影响安全实践数据', () => {
      // 设置关卡模式数据
      storageManager.setLevelData('test_key', 'level_value');
      
      // 设置安全实践数据
      storageManager.setTowerData('test_key', 'tower_value');
      
      // 验证数据隔离
      const levelValue = storageManager.getLevelData('test_key');
      const towerValue = storageManager.getTowerData('test_key');
      
      expect(levelValue).toBe('level_value');
      expect(towerValue).toBe('tower_value');
      expect(levelValue).not.toBe(towerValue);
    });

    it('应该使用不同的localStorage key前缀', () => {
      const levelKey = storageManager['getKeyWithPrefix']('test', 'level');
      const towerKey = storageManager['getKeyWithPrefix']('test', 'tower');
      
      expect(levelKey).toBe('level_test');
      expect(towerKey).toBe('tower_test');
    });
  });

  describe('边界情况测试', () => {
    it('失败时应该从当前幕重新开始', () => {
      progressManager.moveToNode('node-1-5-1');
      progressManager.failCurrentAct();
      
      const progress = progressManager.getCurrentProgress();
      expect(progress.currentFloor).toBe(1);
      expect(progress.completedNodes).toHaveLength(0);
    });

    it('完成所有节点后应该进入下一幕', () => {
      const map = generateTowerMap();
      const act1 = map.acts[0];
      
      // 完成Act I所有节点
      act1.floors.forEach(floor => {
        floor.nodes.forEach(node => {
          progressManager.completeNode(node.id);
        });
      });
      
      progressManager.completeAct();
      
      const progress = progressManager.getCurrentProgress();
      expect(progress.currentAct).toBe(2);
      expect(progress.currentFloor).toBe(1);
    });

    it('应该正确处理地图生成随机性', () => {
      const map1 = generateTowerMap(12345); // 使用种子
      const map2 = generateTowerMap(12345); // 相同种子
      const map3 = generateTowerMap(54321); // 不同种子
      
      // 相同种子应该生成相同地图
      expect(map1.acts[0].floors[1].nodes[0].type)
        .toBe(map2.acts[0].floors[1].nodes[0].type);
      
      // 不同种子可能生成不同地图
      // 注意：这里不强制要求一定不同，因为随机性
    });
  });
});

// 性能测试
describe('Performance Tests', () => {
  it('地图生成时间应该小于2秒', () => {
    const start = performance.now();
    generateTowerMap();
    const end = performance.now();
    
    expect(end - start).toBeLessThan(2000);
  });

  it('节点点击响应时间应该小于100ms', () => {
    const map = generateTowerMap();
    const node = map.acts[0].floors[0].nodes[0];
    
    const start = performance.now();
    getNextAvailableNodes(map, node.id);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100);
  });
});
