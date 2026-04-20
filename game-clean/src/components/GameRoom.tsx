import { useState } from 'react';
import type { Player, Faction } from '@/types/gameRules';
import type { CharacterId, CharacterDefinition } from '@/types/characterRules';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, Play, ArrowLeft, Bot, UserPlus, UserMinus,
  Shuffle, Swords, Shield, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CHARACTER_DATABASE } from '@/data/characterDatabase';

interface GameRoomProps {
  hostPlayer: { name: string; faction: Faction; characterId: CharacterId };
  onStartGame: (players: Player[]) => void;
  onCancel: () => void;
}

interface RoomPlayer {
  id: string;
  name: string;
  faction: Faction;
  characterId: CharacterId;
  isAI: boolean;
  team: 'A' | 'B';
  isHost?: boolean;
}

// AI预设名称
const AI_NAMES: Record<Faction, string[]> = {
  attacker: ['暗影猎手', '幽灵特工', '数据海盗', '网络幽灵', '渗透专家'],
  defender: ['防火墙卫士', '安全哨兵', '数据守护者', '网络骑士', '防御专家']
};

// 根据阵营获取可用角色
function getCharactersByFaction(faction: Faction): CharacterDefinition[] {
  return Object.values(CHARACTER_DATABASE).filter(char => char.faction === faction);
}

// 获取随机角色ID
function getRandomCharacterId(faction: Faction): CharacterId {
  const chars = getCharactersByFaction(faction);
  if (chars.length === 0) return faction === 'attacker' ? 'AR01' : 'AR02';
  const randomChar = chars[Math.floor(Math.random() * chars.length)];
  return randomChar.id as CharacterId;
}

export function GameRoom({ hostPlayer, onStartGame, onCancel }: GameRoomProps) {
  const [players, setPlayers] = useState<RoomPlayer[]>([
    {
      id: 'host',
      name: hostPlayer.name,
      faction: hostPlayer.faction,
      characterId: hostPlayer.characterId,
      isAI: false,
      team: hostPlayer.faction === 'attacker' ? 'A' : 'B',
      isHost: true
    }
  ]);
  const [gameMode, setGameMode] = useState<'1v1' | '2v2'>('1v1');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showCharacterSelect, setShowCharacterSelect] = useState<string | null>(null);

  // 固定阵营：队伍A=攻击方，队伍B=防御方
  const getTeamFaction = (team: 'A' | 'B'): Faction => {
    return team === 'A' ? 'attacker' : 'defender';
  };

  // 添加AI玩家
  const addAIPlayer = () => {
    // 1v1模式最多2人
    if (gameMode === '1v1' && players.length >= 2) return;
    // 2v2模式最多4人
    if (gameMode === '2v2' && players.length >= 4) return;

    const usedNames = players.filter(p => p.isAI).map(p => p.name);
    const teamAPlayers = players.filter(p => p.team === 'A');
    const teamBPlayers = players.filter(p => p.team === 'B');

    // 确定队伍：优先分配到人数少的队伍
    let team: 'A' | 'B';
    if (gameMode === '1v1') {
      // 1v1模式：主机在一个队伍，AI在另一个队伍
      team = players[0].team === 'A' ? 'B' : 'A';
    } else {
      // 2v2模式：平衡队伍人数
      team = teamAPlayers.length <= teamBPlayers.length ? 'A' : 'B';
    }

    // 根据队伍确定阵营
    const faction = getTeamFaction(team);

    // 获取可用名称
    const availableNames = AI_NAMES[faction].filter(n => !usedNames.includes(n));
    const name = availableNames[0] || `AI_${Date.now()}`;

    // 随机选择角色
    const characterId = getRandomCharacterId(faction);

    const newAI: RoomPlayer = {
      id: `ai_${Date.now()}`,
      name,
      faction,
      characterId,
      isAI: true,
      team
    };

    setPlayers([...players, newAI]);
  };

  // 删除AI玩家
  const removeAIPlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // 切换玩家队伍（所有玩家都可以切换）
  const toggleTeam = (id: string) => {
    setPlayers(players.map(p => {
      if (p.id !== id) return p;

      const newTeam = p.team === 'A' ? 'B' : 'A';
      const newFaction = getTeamFaction(newTeam);

      // 切换队伍时，重新选择该阵营的随机角色
      const newCharacterId = getRandomCharacterId(newFaction);

      return {
        ...p,
        team: newTeam,
        faction: newFaction,
        characterId: newCharacterId
      };
    }));
  };

  // 随机分配队伍
  const shuffleTeams = () => {
    if (gameMode === '1v1') {
      // 1v1模式：主机在A队，AI在B队
      setPlayers(players.map((p, index) => {
        const team = index === 0 ? 'A' : 'B';
        const faction = getTeamFaction(team);
        return {
          ...p,
          team,
          faction,
          characterId: p.isHost ? p.characterId : getRandomCharacterId(faction)
        };
      }));
    } else {
      // 2v2模式：随机分配
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      setPlayers(shuffled.map((p, index) => {
        const team = index < 2 ? 'A' : 'B';
        const faction = getTeamFaction(team);
        return {
          ...p,
          team,
          faction,
          characterId: p.isHost ? p.characterId : getRandomCharacterId(faction)
        };
      }));
    }
  };

  // 更改AI角色
  const changeCharacter = (playerId: string, characterId: CharacterId) => {
    setPlayers(players.map(p =>
      p.id === playerId ? { ...p, characterId } : p
    ));
    setShowCharacterSelect(null);
  };

  // 开始游戏
  const handleStartGame = () => {
    let finalPlayers = [...players];

    // 1v1模式：确保只有2人
    if (gameMode === '1v1') {
      if (finalPlayers.length < 2) {
        // 自动添加一个AI对手
        const hostTeam = finalPlayers[0].team;
        const aiTeam = hostTeam === 'A' ? 'B' : 'A';
        const aiFaction = getTeamFaction(aiTeam);

        const aiPlayer: RoomPlayer = {
          id: `ai_opponent_${Date.now()}`,
          name: AI_NAMES[aiFaction][0],
          faction: aiFaction,
          characterId: getRandomCharacterId(aiFaction),
          isAI: true,
          team: aiTeam
        };
        finalPlayers.push(aiPlayer);
      } else if (finalPlayers.length > 2) {
        // 移除多余的AI
        finalPlayers = finalPlayers.slice(0, 2);
      }

      // 确保队伍A是攻击方，队伍B是防御方
      finalPlayers = finalPlayers.map((p, index) => ({
        ...p,
        team: index === 0 ? 'A' : 'B',
        faction: index === 0 ? 'attacker' : 'defender'
      }));
    }

    // 2v2模式：确保队伍A和队伍B都有玩家
    if (gameMode === '2v2') {
      const teamA = finalPlayers.filter(p => p.team === 'A');
      const teamB = finalPlayers.filter(p => p.team === 'B');

      // 如果某队没有玩家，自动调整
      if (teamA.length === 0 || teamB.length === 0) {
        finalPlayers = finalPlayers.map((p, index) => {
          const team = index % 2 === 0 ? 'A' : 'B';
          return {
            ...p,
            team,
            faction: getTeamFaction(team)
          };
        });
      }
    }

    convertAndStart(finalPlayers);
  };

  // 转换玩家并开始游戏
  const convertAndStart = (roomPlayers: RoomPlayer[]) => {
    const gamePlayers: Player[] = roomPlayers.map((rp) => ({
      id: rp.id,
      name: rp.name,
      faction: rp.faction,
      characterId: rp.characterId,
      isAI: rp.isAI,
      aiDifficulty: rp.isAI ? aiDifficulty : undefined,
      team: rp.team,
      hand: [],
      deck: [],
      discard: [],
      resources: {
        compute: 3,
        funds: 5,
        information: 2,
        permission: 0
      },
      techLevel: 'T0',
      infiltrationLevel: 0,
      safetyLevel: 0,
      individualModifiers: {
        infiltrationLevelOffset: 0,
        safetyLevelOffset: 0,
        infiltrationGainModifier: 1.0,
        safetyGainModifier: 1.0,
        cannotGainInfiltration: false,
        cannotGainSafety: false,
        sourceEffects: [],
      },
      controlledAreas: [],
      isAlive: true,
      remainingActions: 2,
      maxActions: 2
    }));

    onStartGame(gamePlayers);
  };

  // 检查是否可以开始游戏
  const canStartGame = () => {
    const teamA = players.filter(p => p.team === 'A');
    const teamB = players.filter(p => p.team === 'B');

    if (gameMode === '1v1') {
      return players.length === 2;
    } else {
      return players.length >= 2 && teamA.length > 0 && teamB.length > 0;
    }
  };

  // 获取角色信息
  const getCharacterInfo = (characterId: CharacterId) => {
    return CHARACTER_DATABASE[characterId];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-white">游戏房间</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-purple-400">
              {gameMode === '1v1' ? '1v1 对战' : '2v2 组队'}
            </Badge>
          </div>
        </div>

        {/* 游戏模式选择 */}
        <Card className="mb-6 bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">游戏设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">游戏模式</label>
              <div className="flex gap-2">
                <Button
                  variant={gameMode === '1v1' ? 'default' : 'outline'}
                  onClick={() => {
                    setGameMode('1v1');
                    // 重置玩家列表
                    setPlayers([{
                      id: 'host',
                      name: hostPlayer.name,
                      faction: hostPlayer.faction,
                      characterId: hostPlayer.characterId,
                      isAI: false,
                      team: hostPlayer.faction === 'attacker' ? 'A' : 'B',
                      isHost: true
                    }]);
                  }}
                >
                  <Swords className="w-4 h-4 mr-2" />
                  1v1 对战
                </Button>
                <Button
                  variant={gameMode === '2v2' ? 'default' : 'outline'}
                  onClick={() => {
                    setGameMode('2v2');
                    // 重置玩家列表
                    setPlayers([{
                      id: 'host',
                      name: hostPlayer.name,
                      faction: hostPlayer.faction,
                      characterId: hostPlayer.characterId,
                      isAI: false,
                      team: hostPlayer.faction === 'attacker' ? 'A' : 'B',
                      isHost: true
                    }]);
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  2v2 组队
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">AI难度</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map(diff => (
                  <Button
                    key={diff}
                    variant={aiDifficulty === diff ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAiDifficulty(diff)}
                  >
                    {diff === 'easy' ? '简单' : diff === 'medium' ? '中等' : '困难'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 队伍配置 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* 队伍A - 攻击方 */}
          <Card className="bg-slate-900/50 border-red-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                队伍 A
                <Badge className="bg-red-600">攻击方</Badge>
                <Badge variant="outline" className="ml-auto">
                  {players.filter(p => p.team === 'A').length} 人
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {players.filter(p => p.team === 'A').map(player => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    character={getCharacterInfo(player.characterId)}
                    onToggleTeam={() => toggleTeam(player.id)}
                    onRemove={() => removeAIPlayer(player.id)}
                    onChangeCharacter={() => setShowCharacterSelect(player.id)}
                    showCharacterSelect={showCharacterSelect === player.id}
                    onSelectCharacter={(charId) => changeCharacter(player.id, charId)}
                    teamColor="red"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 队伍B - 防御方 */}
          <Card className="bg-slate-900/50 border-blue-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                队伍 B
                <Badge className="bg-blue-600">防御方</Badge>
                <Badge variant="outline" className="ml-auto">
                  {players.filter(p => p.team === 'B').length} 人
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {players.filter(p => p.team === 'B').map(player => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    character={getCharacterInfo(player.characterId)}
                    onToggleTeam={() => toggleTeam(player.id)}
                    onRemove={() => removeAIPlayer(player.id)}
                    onChangeCharacter={() => setShowCharacterSelect(player.id)}
                    showCharacterSelect={showCharacterSelect === player.id}
                    onSelectCharacter={(charId) => changeCharacter(player.id, charId)}
                    teamColor="blue"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={addAIPlayer}
            disabled={
              (gameMode === '1v1' && players.length >= 2) ||
              (gameMode === '2v2' && players.length >= 4)
            }
          >
            <UserPlus className="w-4 h-4 mr-2" />
            添加AI
          </Button>

          <Button
            variant="outline"
            onClick={shuffleTeams}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            随机分队
          </Button>

          <Button
            onClick={handleStartGame}
            disabled={!canStartGame()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            开始游戏
          </Button>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>队伍A固定为攻击方，队伍B固定为防御方</p>
          <p>1v1模式需要2名玩家，2v2模式需要2-4名玩家</p>
        </div>
      </div>
    </div>
  );
}

// 玩家卡片组件
interface PlayerCardProps {
  player: RoomPlayer;
  character?: CharacterDefinition;
  onToggleTeam: () => void;
  onRemove: () => void;
  onChangeCharacter: () => void;
  showCharacterSelect: boolean;
  onSelectCharacter: (charId: CharacterId) => void;
  teamColor: 'red' | 'blue';
}

function PlayerCard({
  player,
  character,
  onToggleTeam,
  onRemove,
  onChangeCharacter,
  showCharacterSelect,
  onSelectCharacter,
  teamColor
}: PlayerCardProps) {
  const bgColor = teamColor === 'red' ? 'bg-red-600' : 'bg-blue-600';
  const availableChars = player.faction ? getCharactersByFaction(player.faction) : [];

  return (
    <div className="relative">
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg",
        player.isHost ? 'bg-yellow-500/20' : 'bg-slate-800/50'
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
            bgColor
          )}>
            {player.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{player.name}</span>
              {player.isHost && (
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  主机
                </Badge>
              )}
              {player.isAI && (
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  <Bot className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">
                {player.faction === 'attacker' ? '攻击方' : '防御方'}
              </span>
              {character && (
                <button
                  onClick={onChangeCharacter}
                  className="text-xs text-slate-300 hover:text-white underline"
                >
                  {character.name.chinese}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!player.isHost && (
            <>
              <Button variant="ghost" size="sm" onClick={onToggleTeam}>
                切换队伍
              </Button>
              <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-400 hover:text-red-300">
                <UserMinus className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 角色选择下拉菜单 */}
      {showCharacterSelect && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {availableChars.map(char => (
            <button
              key={char.id}
              onClick={() => onSelectCharacter(char.id as CharacterId)}
              className={cn(
                "w-full p-2 text-left hover:bg-slate-700 flex items-center gap-2",
                player.characterId === char.id && "bg-slate-700"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
                bgColor
              )}>
                {char.name.chinese[0]}
              </div>
              <div>
                <div className="text-sm text-white">{char.name.chinese}</div>
                <div className="text-xs text-slate-400">{char.role}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
