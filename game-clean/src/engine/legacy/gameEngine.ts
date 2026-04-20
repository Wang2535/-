import type { 
  GameState, Player, Card, Resources, GamePhase, 
  AreaType, AreaState, Faction, GameLogEntry, 
  TokenType, Team 
} from '@/types/game';
import { RESOURCE_LIMITS, AREA_STRATEGIC_VALUE } from '@/types/game';
import { allCards, victoryConditions } from '@/data/cards';

// 创建初始资源
export function createInitialResources(): Resources {
  return {
    compute: RESOURCE_LIMITS.compute.initial,
    funds: RESOURCE_LIMITS.funds.initial,
    information: RESOURCE_LIMITS.information.initial,
    access: RESOURCE_LIMITS.access.initial
  };
}

// 创建初始区域状态
export function createInitialAreas(): Record<AreaType, AreaState> {
  return {
    Perimeter: { type: 'Perimeter', tokens: [], defenses: [], controlledBy: null, controlTeam: null, controlTurn: 0, controlStrength: 0 },
    DMZ: { type: 'DMZ', tokens: [], defenses: [], controlledBy: null, controlTeam: null, controlTurn: 0, controlStrength: 0 },
    Internal: { type: 'Internal', tokens: [], defenses: [], controlledBy: null, controlTeam: null, controlTurn: 0, controlStrength: 0 },
    ICS: { type: 'ICS', tokens: [], defenses: [], controlledBy: null, controlTeam: null, controlTurn: 0, controlStrength: 0 }
  };
}

// 创建牌组
export function createDeck(faction: Faction): Card[] {
  let cards: Card[] = [];
  
  if (faction === 'attack') {
    const attackCards = allCards.filter(c => c.faction === 'attack');
    cards = shuffleArray([...attackCards]).slice(0, 30);
  } else if (faction === 'defense') {
    const defenseCards = allCards.filter(c => c.faction === 'defense');
    cards = shuffleArray([...defenseCards]).slice(0, 25);
  }
  
  return cards;
}

// 洗牌
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 抽牌
export function drawCards(player: Player, count: number): { player: Player; drawn: Card[] } {
  const drawn: Card[] = [];
  const newPlayer = { ...player, hand: [...player.hand], deck: [...player.deck] };
  
  for (let i = 0; i < count; i++) {
    if (newPlayer.deck.length > 0) {
      const card = newPlayer.deck.pop()!;
      newPlayer.hand.push(card);
      drawn.push(card);
    } else if (newPlayer.discard.length > 0) {
      newPlayer.deck = shuffleArray(newPlayer.discard);
      newPlayer.discard = [];
      if (newPlayer.deck.length > 0) {
        const card = newPlayer.deck.pop()!;
        newPlayer.hand.push(card);
        drawn.push(card);
      }
    }
  }
  
  return { player: newPlayer, drawn };
}

// 检查资源是否足够
export function hasEnoughResources(player: Player, cost: Partial<Resources>): boolean {
  for (const [resource, amount] of Object.entries(cost)) {
    if (amount && player.resources[resource as keyof Resources] < amount) {
      return false;
    }
  }
  return true;
}

// 消耗资源
export function consumeResources(player: Player, cost: Partial<Resources>): Player {
  const newResources = { ...player.resources };
  for (const [resource, amount] of Object.entries(cost)) {
    if (amount) {
      newResources[resource as keyof Resources] -= amount;
    }
  }
  return { ...player, resources: newResources };
}

// 增加资源（带上限限制）
export function addResources(player: Player, gains: Partial<Resources>): Player {
  const newResources = { ...player.resources };
  for (const [resource, amount] of Object.entries(gains)) {
    if (amount) {
      const key = resource as keyof Resources;
      const limit = RESOURCE_LIMITS[key];
      newResources[key] = Math.min(newResources[key] + amount, limit.max);
    }
  }
  return { ...player, resources: newResources };
}

// 骰子判定
export function rollDice(difficulty: number, modifier: number = 0): { success: boolean; roll: number } {
  const roll = Math.floor(Math.random() * 10) + 1 + modifier;
  return { success: roll >= difficulty, roll };
}

// 默认权限资源
export function createInitialPermissions() {
  return {
    infiltrationLevel: 0,  // 进攻方：0-10，达10胜利
    securityLevel: 10      // 防御方：0-10，归0失败
  };
}

// 创建新游戏 - 支持2v2模式
export function createGame(
  gameId: string, 
  playerConfigs: Player[]
): GameState {
  // BUGFIX: 确保所有玩家开局手牌数量一致（标准5张）
  const INITIAL_HAND_SIZE = 5;
  
  const players: Player[] = playerConfigs.map((p, index) => {
    const deck = createDeck(p.faction);
    // BUGFIX: 确保每个玩家都获得5张初始手牌
    const hand = deck.splice(0, INITIAL_HAND_SIZE);
    
    // 调整初始资源：防御方获得更多初始资源以应对早期攻击
    let initialResources = createInitialResources();
    if (p.faction === 'defense') {
      initialResources.compute += 2;  // 防御方初始算力+2
      initialResources.funds += 3;    // 防御方初始资金+3
      initialResources.information += 1; // 防御方初始信息+1
    }
    
    return {
      ...p,
      id: p.id || `player_${index}`,
      hand,  // 标准5张手牌
      deck,  // 剩余牌库
      discard: [],
      resources: initialResources,
      permissions: p.permissions || createInitialPermissions(),
      remainingActions: 3,
      maxActions: 3,
      isAlive: true
    };
  });

  // 检测游戏模式
  const gameMode = players.length > 2 ? '2v2' : '1v1';
  
  // 2v2模式：如果没有分配队伍，自动分配
  if (gameMode === '2v2') {
    const teamAPlayers = players.filter(p => p.team === 'teamA');
    const teamBPlayers = players.filter(p => p.team === 'teamB');
    
    // 自动分配未分配队伍的玩家
    players.forEach((p) => {
      if (!p.team) {
        if (teamAPlayers.length <= teamBPlayers.length) {
          p.team = 'teamA';
          teamAPlayers.push(p);
        } else {
          p.team = 'teamB';
          teamBPlayers.push(p);
        }
      }
    });
  }

  return {
    id: gameId,
    players,
    currentPlayerIndex: 0,
    phase: 'planning',
    turn: 1,
    maxTurns: 12,
    areas: createInitialAreas(),
    attackChain: [],
    defenseCardsUsed: {},
    log: [{
      timestamp: Date.now(),
      turn: 1,
      phase: 'planning',
      action: '游戏开始',
      details: { 
        players: players.map(p => ({ 
          name: p.name, 
          faction: p.faction,
          team: p.team 
        })),
        gameMode
      }
    }],
    winner: null,
    victoryType: null,
    startTime: Date.now(),
    phaseTimeLeft: 180,
    gameMode
  };
}

// 添加日志
export function addLog(
  gameState: GameState, 
  action: string, 
  details?: any
): GameState {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const entry: GameLogEntry = {
    timestamp: Date.now(),
    turn: gameState.turn,
    phase: gameState.phase,
    playerId: currentPlayer?.id,
    team: currentPlayer?.team,
    action,
    details
  };
  
  return {
    ...gameState,
    log: [...gameState.log, entry]
  };
}

/**
 * 检查胜利条件 - 支持2v2模式
 * 
 * 2v2胜利判定逻辑:
 * 1. 资源枯竭：对方队伍所有玩家算力+资金 ≤ 2
 * 2. 权限主宰：己方队伍在同一关键区域权限总和 ≥ 4
 * 3. 攻击链完成：队伍内玩家共同完成4种攻击类型
 * 4. 威胁清零：清除对方队伍所有威胁标记
 * 5. 韧性加固：队伍内所有玩家使用4类防御卡牌
 * 6. 反杀：对方队伍信息总和 ≤ 1
 */
export function checkVictory(gameState: GameState): { winner: Faction | Team | 'draw' | null; type: string | null } {
  // 检查是否达到最大回合数
  if (gameState.turn > gameState.maxTurns) {
    return { winner: 'draw', type: '回合耗尽' };
  }
  
  // 2v2模式：队伍胜利判定
  if (gameState.gameMode === '2v2') {
    return checkTeamVictory(gameState);
  }
  
  // 1v1模式：个人胜利判定
  for (const condition of victoryConditions) {
    if (condition.check(gameState)) {
      return { winner: condition.faction, type: condition.name };
    }
  }
  
  return { winner: null, type: null };
}

// 【v8.0重构】2v2队伍胜利判定 - 新增权限资源胜利条件
function checkTeamVictory(gameState: GameState): { winner: Team | 'draw' | null; type: string | null } {
  const teamA = gameState.players.filter(p => p.team === 'teamA');
  const teamB = gameState.players.filter(p => p.team === 'teamB');
  
  if (teamA.length === 0 || teamB.length === 0) {
    return { winner: null, type: null };
  }
  
  // 获取队伍阵营
  const teamAFaction = teamA[0].faction;
  const teamBFaction = teamB[0].faction;
  
  // === 【v15.0重构】权限资源胜利判定 - 4种攻击方胜利条件 ===
  
  const currentTurn = gameState.turn;
  
  // 攻击方胜利条件1：完全渗透 - 渗透等级达到75
  const checkCompleteInfiltration = (team: Player[]) => {
    return team.some(p => p.permissions?.infiltrationLevel >= 75);
  };
  
  // 攻击方胜利条件2：安全瓦解 - 防御方安全等级降至0（需轮数>6）
  const checkSecurityCollapse = (enemyTeam: Player[]) => {
    // 修复：添加轮数检查，必须超过6轮才能触发
    if (currentTurn <= 6) return false;
    return enemyTeam.some(p => p.permissions?.securityLevel === 0);
  };
  
  // 攻击方胜利条件3：速攻胜利 - 第8回合前渗透≥50且防御安全<50
  const checkBlitzVictory = (team: Player[], enemyTeam: Player[]) => {
    if (currentTurn > 8) return false;
    const hasHighInfiltration = team.some(p => p.permissions?.infiltrationLevel >= 50);
    const enemyLowSecurity = enemyTeam.some(p => p.permissions?.securityLevel < 50);
    return hasHighInfiltration && enemyLowSecurity;
  };
  
  // 攻击方胜利条件4：持久胜利 - 第20回合后渗透>安全
  const checkEnduranceVictoryAttack = (team: Player[], enemyTeam: Player[]) => {
    if (currentTurn < 20) return false;
    const maxInfiltration = Math.max(...team.map(p => p.permissions?.infiltrationLevel || 0));
    const maxSecurity = Math.max(...enemyTeam.map(p => p.permissions?.securityLevel || 0));
    return maxInfiltration > maxSecurity;
  };
  
  // 检查攻击方胜利
  if (teamAFaction === 'attack') {
    if (checkCompleteInfiltration(teamA)) {
      return { winner: 'teamA', type: '完全渗透' };
    }
    if (checkSecurityCollapse(teamB)) {
      return { winner: 'teamA', type: '安全瓦解' };
    }
    if (checkBlitzVictory(teamA, teamB)) {
      return { winner: 'teamA', type: '速攻胜利' };
    }
    if (checkEnduranceVictoryAttack(teamA, teamB)) {
      return { winner: 'teamA', type: '持久胜利' };
    }
  }
  
  if (teamBFaction === 'attack') {
    if (checkCompleteInfiltration(teamB)) {
      return { winner: 'teamB', type: '完全渗透' };
    }
    if (checkSecurityCollapse(teamA)) {
      return { winner: 'teamB', type: '安全瓦解' };
    }
    if (checkBlitzVictory(teamB, teamA)) {
      return { winner: 'teamB', type: '速攻胜利' };
    }
    if (checkEnduranceVictoryAttack(teamB, teamA)) {
      return { winner: 'teamB', type: '持久胜利' };
    }
  }
  
  // === 【v15.0重构】防御方胜利判定 - 4种防御方胜利条件 ===
  
  // 防御方胜利条件1：绝对安全 - 安全等级达到75
  const checkAbsoluteSecurity = (team: Player[]) => {
    return team.some(p => p.permissions?.securityLevel >= 75);
  };
  
  // 防御方胜利条件2：威胁清除 - 攻击方渗透等级降至0（需轮数>6）
  const checkThreatElimination = (enemyTeam: Player[]) => {
    // 修复：添加轮数检查，必须超过6轮才能触发
    if (currentTurn <= 6) return false;
    return enemyTeam.some(p => p.permissions?.infiltrationLevel === 0);
  };
  
  // 防御方胜利条件3：速防胜利 - 第8回合前安全≥50且攻击渗透<50
  const checkRapidDefense = (team: Player[], enemyTeam: Player[]) => {
    if (currentTurn > 8) return false;
    const hasHighSecurity = team.some(p => p.permissions?.securityLevel >= 50);
    const enemyLowInfiltration = enemyTeam.some(p => p.permissions?.infiltrationLevel < 50);
    return hasHighSecurity && enemyLowInfiltration;
  };
  
  // 防御方胜利条件4：持久胜利 - 第20回合后安全>渗透
  const checkEnduranceVictoryDefense = (team: Player[], enemyTeam: Player[]) => {
    if (currentTurn < 20) return false;
    const maxSecurity = Math.max(...team.map(p => p.permissions?.securityLevel || 0));
    const maxInfiltration = Math.max(...enemyTeam.map(p => p.permissions?.infiltrationLevel || 0));
    return maxSecurity > maxInfiltration;
  };
  
  // 检查防御方胜利
  if (teamAFaction === 'defense') {
    if (checkAbsoluteSecurity(teamA)) {
      return { winner: 'teamA', type: '绝对安全' };
    }
    if (checkThreatElimination(teamB)) {
      return { winner: 'teamA', type: '威胁清除' };
    }
    if (checkRapidDefense(teamA, teamB)) {
      return { winner: 'teamA', type: '速防胜利' };
    }
    if (checkEnduranceVictoryDefense(teamA, teamB)) {
      return { winner: 'teamA', type: '持久胜利' };
    }
  }
  
  if (teamBFaction === 'defense') {
    if (checkAbsoluteSecurity(teamB)) {
      return { winner: 'teamB', type: '绝对安全' };
    }
    if (checkThreatElimination(teamA)) {
      return { winner: 'teamB', type: '威胁清除' };
    }
    if (checkRapidDefense(teamB, teamA)) {
      return { winner: 'teamB', type: '速防胜利' };
    }
    if (checkEnduranceVictoryDefense(teamB, teamA)) {
      return { winner: 'teamB', type: '持久胜利' };
    }
  }
  
  // === 原有胜利条件 ===
  
  // 1. 资源枯竭：对方队伍所有玩家算力+资金 ≤ 2
  const checkResourceDepletion = (enemyTeam: Player[]) => {
    return enemyTeam.every(p => p.resources.compute + p.resources.funds <= 2);
  };
  
  if (teamAFaction === 'attack' && checkResourceDepletion(teamB)) {
    return { winner: 'teamA', type: '资源枯竭' };
  }
  if (teamBFaction === 'attack' && checkResourceDepletion(teamA)) {
    return { winner: 'teamB', type: '资源枯竭' };
  }
  
  // 2. 权限主宰：己方队伍在同一关键区域权限总和 ≥ 4
  const checkAccessDomination = (team: Player[]) => {
    const teamIds = team.map(p => p.id);
    const internalArea = gameState.areas.Internal;
    const teamAccessTokens = internalArea.tokens.filter(t => 
      teamIds.includes(t.owner) && t.type === '权限标记'
    );
    return teamAccessTokens.length >= 4;
  };
  
  if (teamAFaction === 'attack' && checkAccessDomination(teamA)) {
    return { winner: 'teamA', type: '权限主宰' };
  }
  if (teamBFaction === 'attack' && checkAccessDomination(teamB)) {
    return { winner: 'teamB', type: '权限主宰' };
  }
  
  // 3. 攻击链完成：队伍内玩家本回合共同使用4种不同类型攻击卡牌
  const checkAttackChain = (team: Player[]) => {
    const currentTurn = gameState.turn;
    const teamIds = team.map(p => p.id);
    const teamAttacks = gameState.attackChain.filter(a => 
      teamIds.includes(a.playerId) && a.turn === currentTurn
    );
    const uniqueTypes = new Set(teamAttacks.map(a => a.cardType));
    return uniqueTypes.size >= 4;
  };
  
  if (teamAFaction === 'attack' && checkAttackChain(teamA)) {
    return { winner: 'teamA', type: '攻击链完成' };
  }
  if (teamBFaction === 'attack' && checkAttackChain(teamB)) {
    return { winner: 'teamB', type: '攻击链完成' };
  }
  
  // === 防御方胜利条件 ===
  
  // 4. 【v8.0修复】威胁清零：第5-12回合检测
  const checkThreatClearance = (enemyTeam: Player[], currentTurn: number) => {
    // 第1-4回合不检测
    if (currentTurn < 5) return false;
    
    const enemyIds = enemyTeam.map(p => p.id);
    const allAreas = Object.values(gameState.areas);
    const hasThreatTokens = allAreas.some(area => 
      area.tokens.some(t => {
        const owner = gameState.players.find(p => p.id === t.owner);
        return enemyIds.includes(t.owner) && owner?.faction === 'attack';
      })
    );
    return !hasThreatTokens;
  };
  
  if (teamAFaction === 'defense' && checkThreatClearance(teamB, gameState.turn)) {
    return { winner: 'teamA', type: '威胁清零' };
  }
  if (teamBFaction === 'defense' && checkThreatClearance(teamA, gameState.turn)) {
    return { winner: 'teamB', type: '威胁清零' };
  }
  
  // 5. 韧性加固：队伍内每位玩家都使用过4类防御卡牌
  const checkResilienceFortification = (team: Player[]) => {
    const requiredTypes = ['基础防御类', '入侵检测与响应类', '主动与欺骗防御类', '资源与应急管理类'];
    return team.every(p => {
      const usedTypes = gameState.defenseCardsUsed[p.id] || [];
      return requiredTypes.every(t => usedTypes.includes(t as any));
    });
  };
  
  if (teamAFaction === 'defense' && checkResilienceFortification(teamA)) {
    return { winner: 'teamA', type: '韧性加固' };
  }
  if (teamBFaction === 'defense' && checkResilienceFortification(teamB)) {
    return { winner: 'teamB', type: '韧性加固' };
  }
  
  // 6. 反杀：对方队伍所有玩家信息总和 ≤ 1
  const checkCounterKill = (enemyTeam: Player[]) => {
    const totalInfo = enemyTeam.reduce((sum, p) => sum + p.resources.information, 0);
    return totalInfo <= 1;
  };
  
  if (teamAFaction === 'defense' && checkCounterKill(teamB)) {
    return { winner: 'teamA', type: '反杀' };
  }
  if (teamBFaction === 'defense' && checkCounterKill(teamA)) {
    return { winner: 'teamB', type: '反杀' };
  }
  
  return { winner: null, type: null };
}

// BUGFIX: 使用卡牌 - 真实执行卡牌效果
export function playCard(
  gameState: GameState, 
  playerId: string, 
  cardIndex: number,
  target?: { area?: AreaType; playerId?: string }
): { success: boolean; gameState: GameState; message?: string } {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return { success: false, gameState, message: '玩家不存在' };
  }
  
  const player = gameState.players[playerIndex];
  if (cardIndex < 0 || cardIndex >= player.hand.length) {
    return { success: false, gameState, message: '卡牌索引无效' };
  }
  
  const card = player.hand[cardIndex];
  
  // 检查资源
  if (!hasEnoughResources(player, card.cost)) {
    return { success: false, gameState, message: '资源不足' };
  }
  
  // 消耗资源
  let newPlayer = consumeResources(player, card.cost);
  
  // 从手牌移除
  const newHand = [...newPlayer.hand];
  newHand.splice(cardIndex, 1);
  newPlayer = { ...newPlayer, hand: newHand };
  
  // 添加到弃牌堆
  newPlayer = { ...newPlayer, discard: [...newPlayer.discard, card] };
  
  // 更新玩家
  const newPlayers = [...gameState.players];
  newPlayers[playerIndex] = newPlayer;
  
  // BUGFIX: 处理卡牌效果
  let newGameState = { ...gameState, players: newPlayers };
  newGameState = executeCardEffects(newGameState, player, card, target);
  
  // 记录攻击链
  if (player.faction === 'attack') {
    newGameState.attackChain = [...newGameState.attackChain, {
      playerId: player.id,
      cardType: card.type,
      turn: newGameState.turn,
      team: player.team
    }];
  }
  
  // 记录防御卡牌使用
  if (player.faction === 'defense') {
    const used = newGameState.defenseCardsUsed[player.id] || [];
    if (!used.includes(card.type)) {
      newGameState.defenseCardsUsed = {
        ...newGameState.defenseCardsUsed,
        [player.id]: [...used, card.type]
      };
    }
  }
  
  // 添加日志（记录具体效果）
  const effectSummary = card.effects.map(e => e.mechanic).join(', ');
  newGameState = addLog(newGameState, `使用卡牌: ${card.name} [${effectSummary}]`, { 
    card: card.name, 
    effects: card.effects.map(e => ({ mechanic: e.mechanic, detail: e.detail })),
    target,
    team: player.team 
  });
  
  return { success: true, gameState: newGameState };
}

// BUGFIX: 执行卡牌效果 - 真实结算
function executeCardEffects(
  gameState: GameState,
  player: Player,
  card: Card,
  target?: { area?: AreaType; playerId?: string }
): GameState {
  let newGameState = { ...gameState };
  const playerIndex = newGameState.players.findIndex(p => p.id === player.id);
  if (playerIndex === -1) return gameState;
  
  // 获取目标玩家（如果是攻击卡牌）
  const getTargetPlayer = () => {
    if (target?.playerId) {
      return newGameState.players.find(p => p.id === target.playerId);
    }
    // 默认选择对手阵营的第一个玩家
    return newGameState.players.find(p => p.faction !== player.faction);
  };
  
  // 遍历所有效果并执行
  for (const effect of card.effects) {
    const targetPlayer = getTargetPlayer();
    
    switch (effect.mechanic) {
      // 即时伤害效果（减少目标资源）
      case 'instant_damage': {
        if (targetPlayer) {
          const targetIndex = newGameState.players.findIndex(p => p.id === targetPlayer.id);
          if (targetIndex !== -1) {
            let damage = 2;
            if (effect.detail.includes('3点')) damage = 3;
            
            const newResources = { ...newGameState.players[targetIndex].resources };
            if (effect.detail.includes('算力')) {
              newResources.compute = Math.max(0, newResources.compute - damage);
            }
            if (effect.detail.includes('资金')) {
              newResources.funds = Math.max(0, newResources.funds - damage);
            }
            if (effect.detail.includes('信息')) {
              newResources.information = Math.max(0, newResources.information - 1);
            }
            
            newGameState.players[targetIndex] = {
              ...newGameState.players[targetIndex],
              resources: newResources
            };
          }
        }
        break;
      }
      
      // 资源窃取效果
      case 'resource_steal': {
        if (targetPlayer) {
          const targetIndex = newGameState.players.findIndex(p => p.id === targetPlayer.id);
          if (targetIndex !== -1) {
            const stealAmount = effect.detail.includes('2点') ? 2 : 1;
            
            const targetResources = { ...newGameState.players[targetIndex].resources };
            const actualSteal = Math.min(stealAmount, targetResources.information);
            targetResources.information -= actualSteal;
            
            const attackerResources = { ...newGameState.players[playerIndex].resources };
            attackerResources.information = Math.min(
              attackerResources.information + actualSteal,
              RESOURCE_LIMITS.information.max
            );
            
            newGameState.players[targetIndex] = {
              ...newGameState.players[targetIndex],
              resources: targetResources
            };
            newGameState.players[playerIndex] = {
              ...newGameState.players[playerIndex],
              resources: attackerResources
            };
          }
        }
        break;
      }
      
      // 资源获得效果
      case 'resource_gain': {
        const gainResources = { ...newGameState.players[playerIndex].resources };
        if (effect.detail.includes('权限')) {
          gainResources.access = Math.min(gainResources.access + 1, RESOURCE_LIMITS.access.max);
        }
        newGameState.players[playerIndex] = {
          ...newGameState.players[playerIndex],
          resources: gainResources
        };
        break;
      }
      
      // 放置标记效果
      case 'place_token': {
        const areaType = target?.area || 'DMZ';
        const areas = { ...newGameState.areas };
        const area = { ...areas[areaType] };
        
        let tokenType: TokenType = '权限标记';
        if (card.type === 'DDoS攻击类') tokenType = 'CC攻击标记';
        if (card.type === '钓鱼攻击类') tokenType = '恶意载荷标记';
        if (effect.detail.includes('监听')) tokenType = '监听标记';
        if (effect.detail.includes('APT')) tokenType = 'APT控制标记';
        
        area.tokens = [...area.tokens, {
          type: tokenType,
          owner: player.id,
          duration: card.duration || 1,
          team: player.team
        }];
        
        // 更新区域控制状态
        area = updateAreaControl(area, newGameState, newGameState.turn);
        
        areas[areaType] = area;
        newGameState = { ...newGameState, areas };
        break;
      }
      
      // 防御效果 - 增加防御卡牌
      case 'area_protection': {
        const areaType = target?.area || 'Internal';
        const areas = { ...newGameState.areas };
        const area = { ...areas[areaType] };
        
        area.defenses = [...area.defenses, {
          card: card,
          duration: card.duration || -1,
          playerId: player.id
        }];
        
        areas[areaType] = area;
        newGameState = { ...newGameState, areas };
        break;
      }
      
      // 骰子判定效果（简化版：60%成功率）
      case 'dice_check': {
        const success = Math.random() > 0.4;
        newGameState = addLog(newGameState, `  → 判定${success ? '成功' : '失败'}`, {
          diceResult: success,
          playerId: player.id
        });
        break;
      }
      
      // 【Trae优化】持续伤害效果
      case 'continuous_damage': {
        const areaType = target?.area || 'DMZ';
        const areas = { ...newGameState.areas };
        const area = { ...areas[areaType] };
        
        // 添加持续伤害标记
        area.tokens = [...area.tokens, {
          type: 'CC攻击标记',
          owner: player.id,
          duration: card.duration || 2,
          team: player.team
        }];
        
        areas[areaType] = area;
        newGameState = { ...newGameState, areas };
        
        newGameState = addLog(newGameState, `  → 在${areaType}区域放置持续伤害标记(${card.duration || 2}回合)`);
        break;
      }
      
      // 【Trae优化】移除标记效果
      case 'token_remove': {
        const areaType = target?.area || 'Internal';
        const areas = { ...newGameState.areas };
        const area = { ...areas[areaType] };
        
        // 移除攻击方标记
        const removedCount = area.tokens.length;
        area.tokens = area.tokens.filter(t => {
          const owner = newGameState.players.find(p => p.id === t.owner);
          return owner?.faction !== 'attack';
        });
        const actuallyRemoved = removedCount - area.tokens.length;
        
        areas[areaType] = area;
        newGameState = { ...newGameState, areas };
        
        if (actuallyRemoved > 0) {
          newGameState = addLog(newGameState, `  → 清除${areaType}区域的${actuallyRemoved}个威胁标记`);
        }
        break;
      }
      
      // 【Trae优化】揭示手牌效果
      case 'reveal': {
        if (targetPlayer) {
          const revealCount = effect.detail.includes('2张') ? 2 : 1;
          newGameState = addLog(newGameState, `  → 揭示${targetPlayer.name}的${revealCount}张手牌`, {
            targetPlayerId: targetPlayer.id,
            revealedCount: revealCount
          });
        }
        break;
      }
      
      // 【Trae优化】弃牌效果
      case 'discard': {
        if (targetPlayer) {
          const targetIndex = newGameState.players.findIndex(p => p.id === targetPlayer.id);
          if (targetIndex !== -1 && newGameState.players[targetIndex].hand.length > 0) {
            const discardCount = Math.min(1, newGameState.players[targetIndex].hand.length);
            const discardedCards = newGameState.players[targetIndex].hand.slice(0, discardCount);
            const newHand = newGameState.players[targetIndex].hand.slice(discardCount);
            const newDiscard = [...newGameState.players[targetIndex].discard, ...discardedCards];
            
            newGameState.players[targetIndex] = {
              ...newGameState.players[targetIndex],
              hand: newHand,
              discard: newDiscard
            };
            
            newGameState = addLog(newGameState, `  → ${targetPlayer.name}被迫弃掉${discardCount}张牌`);
          }
        }
        break;
      }
      
      // 【Trae优化】资源转移效果（CEO欺诈等）
      case 'resource_transfer': {
        if (targetPlayer && effect.detail.includes('资金')) {
          const targetIndex = newGameState.players.findIndex(p => p.id === targetPlayer.id);
          const transferAmount = effect.detail.includes('3点') ? 3 : 2;
          
          if (targetIndex !== -1) {
            const targetResources = { ...newGameState.players[targetIndex].resources };
            const actualTransfer = Math.min(transferAmount, targetResources.funds);
            targetResources.funds -= actualTransfer;
            
            const attackerResources = { ...newGameState.players[playerIndex].resources };
            attackerResources.funds = Math.min(
              attackerResources.funds + actualTransfer,
              RESOURCE_LIMITS.funds.max
            );
            
            newGameState.players[targetIndex] = {
              ...newGameState.players[targetIndex],
              resources: targetResources
            };
            newGameState.players[playerIndex] = {
              ...newGameState.players[playerIndex],
              resources: attackerResources
            };
            
            newGameState = addLog(newGameState, `  → 从${targetPlayer.name}窃取${actualTransfer}点资金`);
          }
        }
        break;
      }
      
      // 【Trae优化】下回合效果
      case 'next_turn_effect': {
        newGameState = addLog(newGameState, `  → 下回合效果已设置`, {
          effectDetail: effect.detail,
          duration: card.duration || 1
        });
        break;
      }
      
      // 【Trae优化】条件消耗效果
      case 'conditional_cost': {
        newGameState = addLog(newGameState, `  → 条件消耗效果已应用`, {
          effectDetail: effect.detail
        });
        break;
      }
      
      // 【Trae优化】升级标记效果
      case 'upgrade_token': {
        const areaType = target?.area || 'Internal';
        const areas = { ...newGameState.areas };
        const area = { ...areas[areaType] };
        
        // 查找并升级权限标记
        const tokenIndex = area.tokens.findIndex(t => 
          t.owner === player.id && t.type === '权限标记'
        );
        
        if (tokenIndex !== -1) {
          area.tokens[tokenIndex] = {
            ...area.tokens[tokenIndex],
            type: 'APT控制标记'
          };
          areas[areaType] = area;
          newGameState = { ...newGameState, areas };
          newGameState = addLog(newGameState, `  → 权限标记升级为APT控制标记`);
        }
        break;
      }
      
      // 【Trae优化】自动成功效果（0day）
      case 'auto_success': {
        newGameState = addLog(newGameState, `  → 【0day】攻击自动成功！`, {
          isZeroDay: true
        });
        
        // 自动放置权限标记
        const areaType = target?.area || 'Internal';
        const areas = { ...newGameState.areas };
        const area = { ...areas[areaType] };
        
        area.tokens = [...area.tokens, {
          type: '权限标记',
          owner: player.id,
          duration: card.duration || 2,
          team: player.team
        }];
        
        areas[areaType] = area;
        newGameState = { ...newGameState, areas };
        break;
      }
      
      // 【v8.0新增】权限等级变化效果
      case 'infiltration_gain': {
        const gainAmount = effect.detail.includes('2点') ? 2 : 1;
        const currentPermissions = newGameState.players[playerIndex].permissions || { infiltrationLevel: 0, securityLevel: 10 };
        const newInfiltration = Math.min(10, currentPermissions.infiltrationLevel + gainAmount);
        
        newGameState.players[playerIndex] = {
          ...newGameState.players[playerIndex],
          permissions: {
            ...currentPermissions,
            infiltrationLevel: newInfiltration
          }
        };
        
        newGameState = addLog(newGameState, `  → 渗透等级 +${gainAmount} (当前: ${newInfiltration}/10)`);
        
        // 检查胜利条件
        if (newInfiltration >= 10) {
          newGameState = addLog(newGameState, `【胜利条件】渗透等级达到10！`);
        }
        break;
      }
      
      // 【v8.0新增】安全等级变化效果
      case 'security_change': {
        // 【v8.1修复】根据detail判断是增加还是减少
        let changeAmount: number;
        if (effect.detail.includes('+2') || effect.detail.includes('增加2')) {
          changeAmount = 2;
        } else if (effect.detail.includes('+1') || effect.detail.includes('增加1') || effect.detail.includes('安全等级+')) {
          changeAmount = 1;
        } else if (effect.detail.includes('2点')) {
          changeAmount = -2;
        } else {
          changeAmount = -1;
        }
        
        // 防御方对自己使用是增加，攻击方对防御方使用是减少
        const targetIndex = targetPlayer 
          ? newGameState.players.findIndex(p => p.id === targetPlayer.id)
          : playerIndex;
          
        if (targetIndex !== -1) {
          const currentPermissions = newGameState.players[targetIndex].permissions || { infiltrationLevel: 0, securityLevel: 10 };
          const newSecurity = Math.min(10, Math.max(0, currentPermissions.securityLevel + changeAmount));
          
          newGameState.players[targetIndex] = {
            ...newGameState.players[targetIndex],
            permissions: {
              ...currentPermissions,
              securityLevel: newSecurity
            }
          };
          
          const changeText = changeAmount > 0 ? `+${changeAmount}` : `${changeAmount}`;
          newGameState = addLog(newGameState, `  → ${newGameState.players[targetIndex].name} 安全等级 ${changeText} (当前: ${newSecurity}/10)`);
          
          if (newSecurity === 0) {
            newGameState = addLog(newGameState, `【胜利条件】${newGameState.players[targetIndex].name} 安全防线崩溃！`);
          }
        }
        break;
      }
      
      // 【v8.0新增】区域控制效果
      case 'area_control': {
        const areaType = target?.area || 'Internal';
        const areaValue = AREA_STRATEGIC_VALUE[areaType];
        
        // 根据阵营应用不同的控制效果
        if (player.faction === 'attack' && areaValue.controlBonus.infiltration) {
          const currentPermissions = newGameState.players[playerIndex].permissions || { infiltrationLevel: 0, securityLevel: 10 };
          const bonus = areaValue.controlBonus.infiltration;
          const newInfiltration = Math.min(10, currentPermissions.infiltrationLevel + bonus);
          
          newGameState.players[playerIndex] = {
            ...newGameState.players[playerIndex],
            permissions: {
              ...currentPermissions,
              infiltrationLevel: newInfiltration
            }
          };
          
          newGameState = addLog(newGameState, `【区域控制】${player.name} 控制 ${areaValue.name}，渗透+${bonus}`);
        }
        
        if (player.faction === 'defense' && areaValue.controlBonus.security) {
          const currentPermissions = newGameState.players[playerIndex].permissions || { infiltrationLevel: 0, securityLevel: 10 };
          const bonus = areaValue.controlBonus.security;
          const newSecurity = Math.min(10, currentPermissions.securityLevel + bonus);
          
          newGameState.players[playerIndex] = {
            ...newGameState.players[playerIndex],
            permissions: {
              ...currentPermissions,
              securityLevel: newSecurity
            }
          };
          
          newGameState = addLog(newGameState, `【区域控制】${player.name} 控制 ${areaValue.name}，安全+${bonus}`);
        }
        break;
      }
      
      default:
        console.log(`[gameEngine] 未实现的效果类型: ${effect.mechanic}`);
        break;
    }
  }
  
  return newGameState;
}

// 结束回合
export function endTurn(gameState: GameState): GameState {
  const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  
  let newGameState = { ...gameState, currentPlayerIndex: nextPlayerIndex };
  
  // 如果回到第一个玩家，进入下一阶段
  if (nextPlayerIndex === 0) {
    newGameState = nextPhase(newGameState);
  }
  
  return newGameState;
}

// 进入下一阶段
export function nextPhase(gameState: GameState): GameState {
  const phaseOrder: GamePhase[] = ['planning', 'action', 'resolution', 'cleanup', 'victory_check'];
  const currentIndex = phaseOrder.indexOf(gameState.phase);
  let nextPhaseIndex = (currentIndex + 1) % phaseOrder.length;
  let nextPhase = phaseOrder[nextPhaseIndex];
  let nextTurn = gameState.turn;
  
  // 如果是victory_check之后，进入下一回合的planning
  if (gameState.phase === 'victory_check') {
    nextPhase = 'planning';
    nextTurn = gameState.turn + 1;
  }
  
  // 设置阶段时间限制
  let timeLeft = 180;
  if (nextPhase === 'planning') timeLeft = 180;
  if (nextPhase === 'action') timeLeft = 240;
  if (nextPhase === 'cleanup') timeLeft = 120;
  
  let newGameState = {
    ...gameState,
    phase: nextPhase,
    turn: nextTurn,
    phaseTimeLeft: timeLeft
  };
  
  // 在cleanup阶段处理持续效果
  if (nextPhase === 'cleanup') {
    newGameState = processOngoingEffects(newGameState);
  }
  
  // 在victory_check阶段检查胜利条件
  if (nextPhase === 'victory_check') {
    const victory = checkVictory(newGameState);
    if (victory.winner) {
      newGameState = {
        ...newGameState,
        winner: victory.winner,
        victoryType: victory.type,
        phase: 'ended'
      };
    } else {
      newGameState = {
        ...newGameState,
        phase: 'planning',
        turn: nextTurn + 1
      };
      
      newGameState = processCardDraw(newGameState);
    }
  }
  
  return addLog(newGameState, `进入阶段: ${nextPhase}`);
}

// 处理持续效果
function processOngoingEffects(gameState: GameState): GameState {
  let newGameState = { ...gameState };
  const newAreas = { ...gameState.areas };
  
  for (const areaType of Object.keys(newAreas) as AreaType[]) {
    const area = { ...newAreas[areaType] };
    const tokensToRemove: number[] = [];
    
    // 处理每个标记的持续效果
    for (let i = 0; i < area.tokens.length; i++) {
      const token = area.tokens[i];
      
      // 处理持续伤害效果
      if (token.type === 'CC攻击标记') {
        newGameState = applyContinuousDamage(newGameState, token, areaType);
      }
      
      // 处理持续资源窃取效果（如APT控制标记）
      if (token.type === 'APT控制标记') {
        newGameState = applyResourceSteal(newGameState, token, areaType);
      }
      
      // 减少持续时间
      token.duration -= 1;
      
      // 标记过期的标记
      if (token.duration <= 0) {
        tokensToRemove.push(i);
      }
    }
    
    // 移除过期标记
    for (let i = tokensToRemove.length - 1; i >= 0; i--) {
      area.tokens.splice(tokensToRemove[i], 1);
    }
    
    // 更新区域控制状态
    const updatedArea = updateAreaControl(area, newGameState, newGameState.turn);
    newAreas[areaType] = updatedArea;
  }
  
  // 更新游戏状态
  newGameState = { ...newGameState, areas: newAreas };
  
  // 应用区域控制效果到权限等级
  newGameState = applyAreaControlEffects(newGameState);
  
  return newGameState;
}

// 应用持续伤害效果
function applyContinuousDamage(gameState: GameState, token: any, areaType: AreaType): GameState {
  let newGameState = { ...gameState };
  
  // 找到防御方玩家
  const defenders = newGameState.players.filter(p => p.faction === 'defense');
  
  // 对每个防御方玩家造成伤害
  for (const defender of defenders) {
    const defenderIndex = newGameState.players.findIndex(p => p.id === defender.id);
    if (defenderIndex !== -1) {
      // 减少1点算力
      const newResources = { ...defender.resources };
      newResources.compute = Math.max(0, newResources.compute - 1);
      
      newGameState.players[defenderIndex] = {
        ...defender,
        resources: newResources
      };
      
      newGameState = addLog(newGameState, `【持续伤害】${areaType}区域的CC攻击标记对${defender.name}造成1点算力伤害`);
    }
  }
  
  return newGameState;
}

// 应用持续资源窃取效果
function applyResourceSteal(gameState: GameState, token: any, areaType: AreaType): GameState {
  let newGameState = { ...gameState };
  
  // 找到攻击方玩家（标记所有者）
  const attacker = newGameState.players.find(p => p.id === token.owner);
  // 找到防御方玩家
  const defenders = newGameState.players.filter(p => p.faction === 'defense');
  
  if (attacker) {
    const attackerIndex = newGameState.players.findIndex(p => p.id === attacker.id);
    if (attackerIndex !== -1) {
      // 从防御方窃取信息，给攻击方
      for (const defender of defenders) {
        const defenderIndex = newGameState.players.findIndex(p => p.id === defender.id);
        if (defenderIndex !== -1 && defender.resources.information > 0) {
          // 减少防御方信息
          const newDefenderResources = { ...defender.resources };
          newDefenderResources.information = Math.max(0, newDefenderResources.information - 1);
          
          // 增加攻击方信息
          const newAttackerResources = { ...attacker.resources };
          newAttackerResources.information = Math.min(
            newAttackerResources.information + 1,
            RESOURCE_LIMITS.information.max
          );
          
          newGameState.players[defenderIndex] = {
            ...defender,
            resources: newDefenderResources
          };
          
          newGameState.players[attackerIndex] = {
            ...attacker,
            resources: newAttackerResources
          };
          
          newGameState = addLog(newGameState, `【资源窃取】${areaType}区域的APT控制标记从${defender.name}窃取1点信息给${attacker.name}`);
          
          // 只窃取一个防御方的信息
          break;
        }
      }
    }
  }
  
  return newGameState;
}

// 应用区域控制效果到权限等级
function applyAreaControlEffects(gameState: GameState): GameState {
  let newGameState = { ...gameState };
  const attackBonus = { infiltration: 0 };
  const defenseBonus = { security: 0 };
  
  // 分析每个区域的控制状态
  for (const areaType of Object.keys(gameState.areas) as AreaType[]) {
    const area = gameState.areas[areaType];
    if (area.controlledBy) {
      const controller = gameState.players.find(p => p.id === area.controlledBy);
      if (controller) {
        // 根据区域类型和控制强度计算奖励
        const areaValue = AREA_STRATEGIC_VALUE[areaType];
        if (controller.faction === 'attack' && area.controlStrength > 1) {
          // 攻击方控制区域
          if (areaValue.controlBonus.infiltration) {
            attackBonus.infiltration += areaValue.controlBonus.infiltration;
          }
        } else if (controller.faction === 'defense' && area.controlStrength < -1) {
          // 防御方控制区域
          if (areaValue.controlBonus.security) {
            defenseBonus.security += areaValue.controlBonus.security;
          }
        }
      }
    }
  }
  
  // 应用奖励到相应阵营的玩家
  for (let i = 0; i < newGameState.players.length; i++) {
    const player = newGameState.players[i];
    if (player.faction === 'attack' && attackBonus.infiltration > 0) {
      // 攻击方玩家获得渗透等级奖励
      const currentPermissions = player.permissions || { infiltrationLevel: 0, securityLevel: 10 };
      const newInfiltration = Math.min(
        currentPermissions.infiltrationLevel + attackBonus.infiltration,
        10
      );
      
      newGameState.players[i] = {
        ...player,
        permissions: {
          ...currentPermissions,
          infiltrationLevel: newInfiltration
        }
      };
      
      if (newInfiltration > currentPermissions.infiltrationLevel) {
        newGameState = addLog(newGameState, `【区域控制】${player.name} 渗透等级 +${attackBonus.infiltration}`);
      }
    } else if (player.faction === 'defense' && defenseBonus.security > 0) {
      // 防御方玩家获得安全等级奖励
      const currentPermissions = player.permissions || { infiltrationLevel: 0, securityLevel: 10 };
      const newSecurity = Math.min(
        currentPermissions.securityLevel + defenseBonus.security,
        10
      );
      
      newGameState.players[i] = {
        ...player,
        permissions: {
          ...currentPermissions,
          securityLevel: newSecurity
        }
      };
      
      if (newSecurity > currentPermissions.securityLevel) {
        newGameState = addLog(newGameState, `【区域控制】${player.name} 安全等级 +${defenseBonus.security}`);
      }
    }
  }
  
  return newGameState;
}

// 处理抽牌和资源获取
function processCardDraw(gameState: GameState): GameState {
  const newPlayers = gameState.players.map(player => {
    // 抽牌逻辑
    const handSize = player.hand.length;
    const targetHandSize = 5;
    let newPlayer = player;
    
    if (handSize < targetHandSize) {
      const result = drawCards(player, targetHandSize - handSize);
      newPlayer = result.player;
    }
    
    // 每回合自动资源获取
    // 防御方获得更多资源以维持防御
    const baseResourceGain = {
      compute: 1,
      funds: 2,
      information: 1
    };
    
    const defenseBonus = {
      compute: 1,  // 防御方额外算力
      funds: 1,    // 防御方额外资金
      information: 0
    };
    
    let resourcesToAdd = baseResourceGain;
    if (player.faction === 'defense') {
      resourcesToAdd = {
        compute: baseResourceGain.compute + defenseBonus.compute,
        funds: baseResourceGain.funds + defenseBonus.funds,
        information: baseResourceGain.information + defenseBonus.information
      };
    }
    
    // 应用资源获取
    newPlayer = addResources(newPlayer, resourcesToAdd);
    
    return newPlayer;
  });
  
  return { ...gameState, players: newPlayers };
}

// 获取当前玩家
export function getCurrentPlayer(gameState: GameState): Player | undefined {
  return gameState.players[gameState.currentPlayerIndex];
}

// 获取指定阵营的玩家
export function getPlayersByFaction(gameState: GameState, faction: Faction): Player[] {
  return gameState.players.filter(p => p.faction === faction);
}

// 获取指定队伍的玩家
export function getPlayersByTeam(gameState: GameState, team: Team): Player[] {
  return gameState.players.filter(p => p.team === team);
}

// 计算攻击方总权限数
export function getTotalAttackAccess(gameState: GameState): number {
  const attackers = gameState.players.filter(p => p.faction === 'attack');
  return attackers.reduce((sum, p) => sum + p.resources.access, 0);
}

// 计算防御方总资源
export function getTotalDefenseResources(gameState: GameState): Resources {
  const defenders = gameState.players.filter(p => p.faction === 'defense');
  
  return defenders.reduce((total, p) => ({
    compute: total.compute + p.resources.compute,
    funds: total.funds + p.resources.funds,
    information: total.information + p.resources.information,
    access: total.access + p.resources.access
  }), { compute: 0, funds: 0, information: 0, access: 0 });
}

// 计算队伍总权限
export function getTeamTotalAccess(gameState: GameState, team: Team): number {
  const teamPlayers = getPlayersByTeam(gameState, team);
  return teamPlayers.reduce((sum, p) => sum + p.resources.access, 0);
}

// 计算队伍总资源
export function getTeamTotalResources(gameState: GameState, team: Team): Resources {
  const teamPlayers = getPlayersByTeam(gameState, team);
  
  return teamPlayers.reduce((total, p) => ({
    compute: total.compute + p.resources.compute,
    funds: total.funds + p.resources.funds,
    information: total.information + p.resources.information,
    access: total.access + p.resources.access
  }), { compute: 0, funds: 0, information: 0, access: 0 });
}

// 更新区域控制状态
function updateAreaControl(
  area: AreaState, 
  gameState: GameState,
  currentTurn: number
): AreaState {
  // 计算控制强度
  let attackControl = 0;
  let defenseControl = 0;
  let dominantPlayerId = null;
  let dominantTeam = null;
  
  // 分析现有标记
  for (const token of area.tokens) {
    const tokenOwner = gameState.players.find(p => p.id === token.owner);
    if (tokenOwner?.faction === 'attack') {
      // 攻击方标记增加攻击控制强度
      if (token.type === '权限标记') attackControl += 2;
      else if (token.type === 'APT控制标记') attackControl += 3;
      else attackControl += 1;
      dominantPlayerId = tokenOwner.id;
      dominantTeam = tokenOwner.team;
    } else if (tokenOwner?.faction === 'defense') {
      // 防御方标记增加防御控制强度
      defenseControl += 2; // 防御标记权重更高
      dominantPlayerId = tokenOwner.id;
      dominantTeam = tokenOwner.team;
    }
  }
  
  // 计算净控制强度
  const controlStrength = attackControl - defenseControl;
  
  // 更新控制状态
  let controlledBy = null;
  let controlTeam = null;
  let controlTurn = area.controlTurn;
  
  // 确定控制者
  if (controlStrength > 1) {
    // 攻击方控制
    controlledBy = dominantPlayerId;
    controlTeam = dominantTeam;
    if (area.controlledBy !== dominantPlayerId) {
      controlTurn = currentTurn;
    }
  } else if (controlStrength < -1) {
    // 防御方控制
    controlledBy = dominantPlayerId;
    controlTeam = dominantTeam;
    if (area.controlledBy !== dominantPlayerId) {
      controlTurn = currentTurn;
    }
  } else {
    // 争夺中，无明确控制
    controlledBy = null;
    controlTeam = null;
    controlTurn = 0;
  }
  
  return {
    ...area,
    controlledBy,
    controlTeam,
    controlTurn,
    controlStrength
  };
}
