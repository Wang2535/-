import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Users, Play, Settings, 
  Shield, Swords, Trophy, Clock, 
  UserPlus, Map, Gamepad2, Target,
  Sparkles, ChevronRight, Mountain
} from 'lucide-react';
import type { Faction, Player } from '@/types/gameRules';
import type { CharacterId, CharacterDefinition } from '@/types/characterRules';
import { CHARACTER_DATABASE } from '@/data/characterDatabase';
import { PLAYER_NAME_RULES } from '@/types/gameConstants';

interface GameLobbyProps {
  onStartGame?: (config: GameConfig) => void;
  onEnterRoom?: (hostPlayer: { name: string; faction: Faction; characterId: CharacterId }) => void;
  onEnterLevelMode?: () => void;
  onEnterTowerMode?: () => void;
}

export interface GameConfig {
  gameId?: string;
  playerName: string;
  faction: Faction;
  characterId?: CharacterId;
  mode: '1v1' | '2v2';
  isAI?: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  players?: Player[];
}

// 根据阵营获取可用角色
function getCharactersByFaction(faction: Faction): CharacterDefinition[] {
  return Object.values(CHARACTER_DATABASE).filter(char => char.faction === faction);
}

export function GameLobby({ onStartGame: _onStartGame, onEnterRoom, onEnterLevelMode, onEnterTowerMode }: GameLobbyProps) {
  const [playerName, setPlayerName] = useState('玩家' + Math.floor(Math.random() * 1000));
  const [nameError, setNameError] = useState<string>('');
  const [selectedFaction, setSelectedFaction] = useState<Faction>('attacker');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>('AR01');
  const [gameMode, setGameMode] = useState<'1v1' | '2v2'>('1v1');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [activeTab, setActiveTab] = useState<'pvp' | 'level' | 'tower'>('pvp');

  /**
   * 验证玩家名称
   * 规则：2-20个字符，只允许中文、英文、数字和下划线
   */
  const validatePlayerName = (name: string): { valid: boolean; error: string } => {
    if (name.length < PLAYER_NAME_RULES.MIN_LENGTH) {
      return { valid: false, error: `玩家名称至少需要${PLAYER_NAME_RULES.MIN_LENGTH}个字符` };
    }
    if (name.length > PLAYER_NAME_RULES.MAX_LENGTH) {
      return { valid: false, error: `玩家名称不能超过${PLAYER_NAME_RULES.MAX_LENGTH}个字符` };
    }
    // 只允许中文、英文、数字和下划线
    if (!PLAYER_NAME_RULES.ALLOWED_PATTERN.test(name)) {
      return { valid: false, error: '名称只能包含中文、英文、数字和下划线' };
    }
    return { valid: true, error: '' };
  };

  /**
   * 处理玩家名称变化
   */
  const handlePlayerNameChange = (value: string) => {
    setPlayerName(value);
    const validation = validatePlayerName(value);
    setNameError(validation.error);
  };

  // 当阵营改变时，更新默认角色
  const handleFactionChange = (faction: Faction) => {
    setSelectedFaction(faction);
    // 选择该阵营的第一个可用角色
    const availableChars = getCharactersByFaction(faction);
    if (availableChars.length > 0) {
      setSelectedCharacter(availableChars[0].id as CharacterId);
    }
  };
  
  // 快速开始（对战模式）
  const handleQuickStart = () => {
    const validation = validatePlayerName(playerName);
    if (!validation.valid) {
      setNameError(validation.error);
      return;
    }
    if (onEnterRoom) {
      onEnterRoom({
        name: playerName.trim(),
        faction: selectedFaction,
        characterId: selectedCharacter
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      {/* 标题区域 */}
      <div className="text-center mb-6 pt-4">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 blur-xl opacity-50 rounded-full"></div>
            <Gamepad2 className="w-12 h-12 text-white relative z-10" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            道高一丈
          </span>
        </h1>
        <p className="text-lg text-slate-400">数字博弈</p>
        <p className="text-sm text-slate-500 mt-1">网络安全主题策略卡牌对战</p>
      </div>
      
      {/* 主菜单选择 */}
      <div className="max-w-5xl mx-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pvp' | 'level' | 'tower')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800/50 p-1">
            <TabsTrigger 
              value="pvp" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-white"
            >
              <Swords className="w-4 h-4 mr-2" />
              对战模式
            </TabsTrigger>
            <TabsTrigger 
              value="level"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-white"
            >
              <Map className="w-4 h-4 mr-2" />
              关卡模式
            </TabsTrigger>
            <TabsTrigger 
              value="tower"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white"
            >
              <Mountain className="w-4 h-4 mr-2" />
              安全实践
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pvp" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：游戏设置 */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-900/80 border-slate-700 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-900/50">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-400" />
                      对战设置
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {/* 玩家名称 */}
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        玩家名称
                      </label>
                      <Input
                        value={playerName}
                        onChange={(e) => handlePlayerNameChange(e.target.value)}
                        placeholder="输入你的名称"
                        className={`bg-slate-800 border-slate-600 text-white ${nameError ? 'border-red-500' : ''}`}
                      />
                      {nameError && (
                        <p className="text-red-400 text-xs mt-1">{nameError}</p>
                      )}
                    </div>

                    {/* 游戏模式选择 */}
                    <div>
                      <label className="text-sm text-slate-400 mb-3 block flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        对战模式
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setGameMode('1v1')}
                          className={`
                            p-4 rounded-xl border-2 transition-all duration-300
                            ${gameMode === '1v1'
                              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                              : 'border-slate-700 bg-slate-800 hover:border-purple-500/50'}
                          `}
                        >
                          <div className="flex flex-col items-center">
                            <Users className="w-8 h-8 text-purple-400 mb-2" />
                            <span className="text-white font-bold">1v1 对战</span>
                            <span className="text-xs text-slate-400 mt-1">单挑模式</span>
                          </div>
                        </button>

                        <button
                          onClick={() => setGameMode('2v2')}
                          className={`
                            p-4 rounded-xl border-2 transition-all duration-300
                            ${gameMode === '2v2'
                              ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                              : 'border-slate-700 bg-slate-800 hover:border-cyan-500/50'}
                          `}
                        >
                          <div className="flex flex-col items-center">
                            <div className="flex -space-x-2 mb-2">
                              <Users className="w-6 h-6 text-cyan-400" />
                              <Users className="w-6 h-6 text-cyan-400" />
                            </div>
                            <span className="text-white font-bold">2v2 团队</span>
                            <span className="text-xs text-slate-400 mt-1">组队模式</span>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    {/* 阵营选择 */}
                    <div>
                      <label className="text-sm text-slate-400 mb-3 block flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        选择阵营
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleFactionChange('attacker')}
                          className={`
                            p-4 rounded-xl border-2 transition-all duration-300
                            ${selectedFaction === 'attacker'
                              ? 'border-red-500 bg-red-950/30 shadow-lg shadow-red-500/20'
                              : 'border-slate-700 bg-slate-800 hover:border-red-500/50'}
                          `}
                        >
                          <div className="flex flex-col items-center">
                            <Swords className="w-8 h-8 text-red-500 mb-2" />
                            <span className="text-white font-bold">攻击方</span>
                            <span className="text-xs text-slate-400 mt-1">黑客/渗透测试</span>
                            <Badge variant="outline" className="mt-2 text-red-400 border-red-400/50">
                              进攻型
                            </Badge>
                          </div>
                        </button>

                        <button
                          onClick={() => handleFactionChange('defender')}
                          className={`
                            p-4 rounded-xl border-2 transition-all duration-300
                            ${selectedFaction === 'defender'
                              ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-500/20'
                              : 'border-slate-700 bg-slate-800 hover:border-blue-500/50'}
                          `}
                        >
                          <div className="flex flex-col items-center">
                            <Shield className="w-8 h-8 text-blue-500 mb-2" />
                            <span className="text-white font-bold">防御方</span>
                            <span className="text-xs text-slate-400 mt-1">安全分析师/架构师</span>
                            <Badge variant="outline" className="mt-2 text-blue-400 border-blue-400/50">
                              防守型
                            </Badge>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* 角色选择 */}
                    <div>
                      <label className="text-sm text-slate-400 mb-3 block">选择角色</label>
                      <div className="grid grid-cols-1 gap-2">
                        {getCharactersByFaction(selectedFaction).map(char => (
                          <button
                            key={char.id}
                            onClick={() => setSelectedCharacter(char.id)}
                            className={`
                              p-3 rounded-lg border-2 transition-all duration-300 text-left
                              ${selectedCharacter === char.id
                                ? selectedFaction === 'attacker'
                                  ? 'border-red-500 bg-red-950/30 shadow-md shadow-red-500/10'
                                  : 'border-blue-500 bg-blue-950/30 shadow-md shadow-blue-500/10'
                                : 'border-slate-700 bg-slate-800 hover:border-slate-500'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                                ${selectedFaction === 'attacker' ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}
                              `}>
                                {char.name.chinese[0]}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{char.name.chinese}</span>
                                  <Badge variant="outline" className="text-xs border-slate-600">
                                    {char.type === 'RPS' ? '猜拳系' : char.type === 'Chance' ? '骰子系' : '专属系'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{char.role}</p>
                              </div>
                              {selectedCharacter === char.id && (
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* 开始按钮 */}
                <Button 
                  onClick={handleQuickStart}
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  开始对战
                </Button>
              </div>
              
              {/* 右侧：游戏信息 */}
              <div className="space-y-4">
                <Card className="bg-slate-900/80 border-slate-700 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-900/50">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      胜利条件
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/20">
                      <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                        <Swords className="w-4 h-4" />
                        攻击方
                      </h4>
                      <ul className="text-xs text-slate-300 space-y-1">
                        <li>• 资源枯竭：防御方算力+资金 ≤ 2</li>
                        <li>• 权限主宰：关键区域权限 ≥ 4</li>
                        <li>• 攻击链：一回合使用4种攻击类型</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/20">
                      <h4 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        防御方
                      </h4>
                      <ul className="text-xs text-slate-300 space-y-1">
                        <li>• 威胁清零：清除所有威胁标记</li>
                        <li>• 韧性加固：使用4类防御卡牌</li>
                        <li>• 反杀：攻击方信息总和 ≤ 1</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/80 border-slate-700 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-900/50">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-cyan-400" />
                      游戏规则
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm pt-4">
                    <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/50">
                      <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-300">每局最多24轮次</span>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/50">
                      <Trophy className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-300">达成胜利条件即可获胜</span>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/50">
                      <Users className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-300">支持1v1和2v2模式</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="level" className="mt-0">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 mb-4 shadow-lg shadow-purple-500/30">
                  <Map className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">关卡模式</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  挑战精心设计的关卡，学习网络安全知识，解锁新卡牌和角色
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mb-8">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">5+</div>
                  <div className="text-sm text-slate-400">精心设计的关卡</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">20+</div>
                  <div className="text-sm text-slate-400">可解锁卡牌</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">教程</div>
                  <div className="text-sm text-slate-400">新手引导系统</div>
                </div>
              </div>
              
              <Button 
                onClick={onEnterLevelMode}
                size="lg"
                className="h-14 px-8 text-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-lg shadow-purple-500/25 transition-all duration-300"
              >
                <Map className="w-5 h-5 mr-2" />
                进入关卡模式
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tower" className="mt-0">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 mb-4 shadow-lg shadow-orange-500/30">
                  <Mountain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">安全实践</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  Roguelike爬塔模式，挑战随机生成的地图，永久保留你的成长
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mb-8">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-1">3幕</div>
                  <div className="text-sm text-slate-400">渐进式挑战</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                  <div className="text-2xl font-bold text-pink-400 mb-1">20关</div>
                  <div className="text-sm text-slate-400">重新编排关卡</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">Roguelike</div>
                  <div className="text-sm text-slate-400">永久继承系统</div>
                </div>
              </div>
              
              <Button 
                onClick={onEnterTowerMode}
                size="lg"
                className="h-14 px-8 text-lg bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 shadow-lg shadow-orange-500/25 transition-all duration-300"
              >
                <Mountain className="w-5 h-5 mr-2" />
                开始爬塔
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default GameLobby;
