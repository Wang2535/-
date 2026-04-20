/**
 * ZoneEffectResolver �?处理6种Zone类型的被动效�? * 
 * W(虚弱): 进入时骰�?1
 * N(知识): 进入时可获取随机书籍/信息
 * I(反转): 地图倒置(视觉效果+移动逻辑反转)
 * P(跳过): 进入后跳过下回合
 * S(加�?: 进入时下回合骰子+1
 * D(危险): 进入时随机损失资�? */

import type { TowerGameEngine } from './TowerGameEngine';

export type ZoneEffectResult =
  | { type: 'none' }
  | { type: 'dice_penalty'; amount: number; message: string; duration: string }
  | { type: 'book_acquired'; bookName: string; computeBonus: number; message: string }
  | { type: 'map_inverted'; duration: string; message: string }
  | { type: 'skip_next_turn'; message: string }
  | { type: 'dice_bonus'; amount: number; message: string; duration: string }
  | { type: 'resource_loss'; resourceType: string; amount: number; message: string };

export class ZoneEffectResolver {
  private engine: TowerGameEngine;

  constructor(engine: TowerGameEngine) {
    this.engine = engine;
  }

  resolveZoneEffect(cellId: string, zoneId: string): ZoneEffectResult {
    switch (zoneId.toUpperCase()) {
      case 'W': return this.applyWeakZone(cellId);
      case 'N': return this.applyKnowledgeZone(cellId);
      case 'I': return this.applyInvertZone(cellId);
      case 'P': return this.applySkipZone(cellId);
      case 'S': return this.applySpeedZone(cellId);
      case 'D': return this.applyDangerZone(cellId);
      default: return { type: 'none' };
    }
  }

  private applyWeakZone(_cellId: string): ZoneEffectResult {
    return {
      type: 'dice_penalty',
      amount: -1,
      message: '虚弱区域! 下次掷骰-1',
      duration: 'next_roll',
    };
  }

  private applyKnowledgeZone(_cellId: string): ZoneEffectResult {
    const books = ['防火墙手册', '加密算法导论', '渗透测试指南', '网络协议分析'];
    const book = books[Math.floor(Math.random() * books.length)];
    return {
      type: 'book_acquired',
      bookName: book,
      computeBonus: 2,
      message: `知识区域! 获得书籍《${book}》，算力+2`,
    };
  }

  private applyInvertZone(_cellId: string): ZoneEffectResult {
    return {
      type: 'map_inverted',
      duration: 'while_in_zone',
      message: '反转区域! 地图上下颠�?移动方向反转',
    };
  }

  private applySkipZone(_cellId: string): ZoneEffectResult {
    return {
      type: 'skip_next_turn',
      message: '跳过区域! 你的下回合将被跳过',
    };
  }

  private applySpeedZone(_cellId: string): ZoneEffectResult {
    return {
      type: 'dice_bonus',
      amount: 1,
      message: '加速区域! 下次掷骰+1',
      duration: 'next_roll',
    };
  }

  private applyDangerZone(_cellId: string): ZoneEffectResult {
    const loss = 3 + Math.floor(Math.random() * 6);
    return {
      type: 'resource_loss',
      resourceType: 'tech',
      amount: loss,
      message: `危险区域! 随机损失${loss}技术值`,
    };
  }
}
