import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle, Play, Star, ArrowLeft, RotateCcw, Package, Library } from 'lucide-react';
import type { LevelDefinition, LevelId, LevelProgress } from '@/types/levelTypes';
import { LEVEL_DATABASE, LEVEL_ORDER, getAllLevels, DEBUG_LEVEL_COUNT } from '@/data/levelDatabase';
import { TUTORIAL_FOCUS_NAMES } from '@/types/levelTypes';
import { hasPlayerDeck, unlockCards, getUnlockedCardCodes } from '@/utils/playerCardProgressManager';

interface LevelSelectionProps {
  onStartLevel: (levelId: LevelId) => void;
  onBack: () => void;
  onOpenCardLibrary?: () => void;
  onReloadLevelProgress?: () => void;
}

export function LevelSelection({ onStartLevel, onBack, onOpenCardLibrary, onReloadLevelProgress }: LevelSelectionProps) {
  const [progress, setProgress] = useState<Record<LevelId, LevelProgress>>({} as Record<LevelId, LevelProgress>);
  const [selectedLevel, setSelectedLevel] = useState<LevelDefinition | null>(null);
  const [hasConfiguredDeck, setHasConfiguredDeck] = useState(false);

  useEffect(() => {
    console.log('[LevelSelection] 组件加载');
    console.log('[LevelSelection] LEVEL_ORDER:', LEVEL_ORDER);
    console.log('[LevelSelection] DEBUG_LEVEL_COUNT:', DEBUG_LEVEL_COUNT);
    console.log('[LevelSelection] LEVEL_DATABASE keys:', Object.keys(LEVEL_DATABASE));
    const stored = localStorage.getItem('level_progress');
    console.log('[LevelSelection] localStorage level_progress:', stored);
    loadProgress();
    checkDeckConfiguration();
    unlockCardsForAvailableLevels();
  }, []);

  const loadProgress = () => {
    const stored = localStorage.getItem('level_progress');
    if (stored) {
      try {
        const storedProgress = JSON.parse(stored);
        // 合并新关卡到现有进度中
        const mergedProgress: Record<LevelId, LevelProgress> = {} as Record<LevelId, LevelProgress>;
        LEVEL_ORDER.forEach((levelId, index) => {
          if (storedProgress[levelId]) {
            // 使用已存储的进度
            mergedProgress[levelId] = storedProgress[levelId];
          } else {
            // 新关卡，初始化为锁定状态
            mergedProgress[levelId] = {
              levelId,
              status: 'locked',
              completedObjectives: [],
              attempts: 0
            };
          }
        });
        setProgress(mergedProgress);
        // 如果有新关卡被添加，更新localStorage
        if (Object.keys(mergedProgress).length !== Object.keys(storedProgress).length) {
          localStorage.setItem('level_progress', JSON.stringify(mergedProgress));
        }
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    } else {
      const initialProgress: Record<LevelId, LevelProgress> = {} as Record<LevelId, LevelProgress>;
      LEVEL_ORDER.forEach((levelId, index) => {
        initialProgress[levelId] = {
          levelId,
          status: index === 0 ? 'available' : 'locked',
          completedObjectives: [],
          attempts: 0
        };
      });
      setProgress(initialProgress);
    }
  };

  // 解锁已解锁关卡的卡牌（关卡解锁时立即获得，而非通关后）
  const unlockCardsForAvailableLevels = () => {
    const stored = localStorage.getItem('level_progress');
    if (!stored) return;

    try {
      const progressData: Record<LevelId, LevelProgress> = JSON.parse(stored);
      const alreadyUnlockedCards = getUnlockedCardCodes();
      let totalUnlocked = 0;

      // 遍历所有关卡，解锁已解锁关卡的卡牌
      Object.entries(progressData).forEach(([levelId, levelProgress]) => {
        // 如果关卡已解锁（可挑战、进行中、已通关、已精通）
        if (levelProgress.status !== 'locked') {
          const level = LEVEL_DATABASE[levelId as LevelId];
          if (level?.rewards?.unlockedCards && level.rewards.unlockedCards.length > 0) {
            // 过滤掉已经解锁的卡牌
            const cardsToUnlock = level.rewards.unlockedCards.filter(
              cardCode => !alreadyUnlockedCards.includes(cardCode)
            );
            if (cardsToUnlock.length > 0) {
              const unlocked = unlockCards(cardsToUnlock, levelId);
              totalUnlocked += unlocked;
              if (unlocked > 0) {
                console.log(`[LevelSelection] 关卡 ${levelId} 已解锁，获得 ${unlocked} 张卡牌:`, cardsToUnlock);
              }
            }
          }
        }
      });

      if (totalUnlocked > 0) {
        console.log(`[LevelSelection] 总共解锁 ${totalUnlocked} 张新卡牌`);
      }
    } catch (e) {
      console.error('解锁关卡卡牌失败:', e);
    }
  };

  const checkDeckConfiguration = () => {
    setHasConfiguredDeck(hasPlayerDeck());
  };

  const handleResetProgress = () => {
    if (confirm('确定要重置所有关卡进度吗？此操作不可撤销。')) {
      localStorage.removeItem('level_progress');
      loadProgress();
      setSelectedLevel(null);
    }
  };

  const handleOpenCardLibrary = () => {
    if (onOpenCardLibrary) {
      onOpenCardLibrary();
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    const clampedDifficulty = Math.max(1, Math.min(5, difficulty));
    return '★'.repeat(clampedDifficulty) + '☆'.repeat(5 - clampedDifficulty);
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = ['text-green-400', 'text-green-500', 'text-yellow-400', 'text-orange-400', 'text-red-400'];
    return colors[difficulty - 1] || colors[0];
  };

  const getStatusBadge = (status: LevelProgress['status']) => {
    switch (status) {
      case 'locked':
        return <Badge variant="secondary" className="bg-gray-600"><Lock className="w-3 h-3 mr-1" />未解锁</Badge>;
      case 'available':
        return <Badge variant="secondary" className="bg-blue-500"><Play className="w-3 h-3 mr-1" />可挑战</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-yellow-500">进行中</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />已通关</Badge>;
      case 'mastered':
        return <Badge variant="secondary" className="bg-purple-500"><Star className="w-3 h-3 mr-1" />已精通</Badge>;
      default:
        return null;
    }
  };

  const levels = getAllLevels();
  
  // 调试日志
  console.log('[LevelSelection] 总关卡数:', levels.length);
  console.log('[LevelSelection] LEVEL_ORDER长度:', LEVEL_ORDER.length);
  console.log('[LevelSelection] 关卡ID列表:', levels.map(l => l.id));
  console.log('[LevelSelection] 进度数据:', progress);
  
  const firstAvailableLevel = levels.find(level => {
    const levelProgress = progress[level.id];
    return levelProgress && levelProgress.status !== 'locked';
  });

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回主菜单
            </Button>
            <h1 className="text-3xl font-bold text-white">关卡模式</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleResetProgress} 
              className="text-gray-400 border-gray-600 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重置进度
            </Button>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-2">新手教程关卡</h2>
          <p className="text-gray-400 text-sm">
            完成这9个关卡，学习网络安全基础知识。每关通关后可阅读相关文章，深入了解网络安全世界。
          </p>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-sm text-gray-400">
              已通关: {Object.values(progress).filter(p => p.status === 'completed' || p.status === 'mastered').length} / {LEVEL_ORDER.length}
            </span>
            <Progress 
              value={(Object.values(progress).filter(p => p.status === 'completed' || p.status === 'mastered').length / LEVEL_ORDER.length) * 100}
              className="w-48 h-2"
            />
          </div>
        </div>

        {/* [TEST_MODE] 测试工具栏 - 删除此区块以移除测试按钮 */}
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-2 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">🧪 测试模式</h3>
              <p className="text-purple-200 text-sm">
                开发者工具：一键解锁所有关卡用于测试
              </p>
            </div>
            <Button
              variant="default"
              size="lg"
              onClick={() => {
                if (confirm('确定要解锁所有关卡吗？')) {
                  // 1. 解锁所有关卡进度
                  const allUnlocked: Record<LevelId, LevelProgress> = {} as Record<LevelId, LevelProgress>;
                  LEVEL_ORDER.forEach((levelId) => {
                    allUnlocked[levelId] = {
                      levelId,
                      status: 'available',
                      completedObjectives: [],
                      attempts: 0
                    };
                  });
                  setProgress(allUnlocked);
                  localStorage.setItem('level_progress', JSON.stringify(allUnlocked));
                  
                  // 2. 直接解锁所有关卡的卡牌（不依赖localStorage读取）
                  let totalUnlocked = 0;
                  const alreadyUnlockedCards = getUnlockedCardCodes();
                  
                  LEVEL_ORDER.forEach((levelId) => {
                    const level = LEVEL_DATABASE[levelId];
                    if (level?.rewards?.unlockedCards && level.rewards.unlockedCards.length > 0) {
                      const cardsToUnlock = level.rewards.unlockedCards.filter(
                        cardCode => !alreadyUnlockedCards.includes(cardCode)
                      );
                      if (cardsToUnlock.length > 0) {
                        const unlocked = unlockCards(cardsToUnlock, levelId);
                        totalUnlocked += unlocked;
                        console.log(`[测试模式] 关卡 ${levelId} 解锁 ${unlocked} 张卡牌:`, cardsToUnlock);
                      }
                    }
                  });
                  
                  console.log(`[测试模式] 总共解锁 ${totalUnlocked} 张新卡牌`);
                  
                  // 3. 通知App重新加载LevelGameStateManager的进度
                  onReloadLevelProgress?.();
                  
                  alert(`所有关卡已解锁！共解锁 ${totalUnlocked} 张新卡牌`);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-400"
            >
              🔓 解锁所有关卡
            </Button>
          </div>
        </div>
        {/* [TEST_MODE_END] */}

        {/* 统一卡牌库入口区域 */}
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">卡牌库</h3>
              <p className="text-gray-400 text-sm">
                {hasConfiguredDeck 
                  ? '已配置卡组，点击可修改卡组配置' 
                  : '尚未配置卡组，请先配置卡组后再开始挑战'}
              </p>
            </div>
            <Button
              variant={hasConfiguredDeck ? "default" : "outline"}
              size="lg"
              onClick={handleOpenCardLibrary}
              className={hasConfiguredDeck 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "border-slate-500 hover:bg-slate-700 text-gray-300"
              }
            >
              <Library className="w-5 h-5 mr-2" />
              {hasConfiguredDeck ? '修改卡组' : '配置卡组'}
              {hasConfiguredDeck && <Package className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
          {levels.map((level, index) => {
            try {
              const levelProgress = progress[level.id];
              const isLocked = !levelProgress || levelProgress.status === 'locked';
              const isCompleted = levelProgress?.status === 'completed' || levelProgress?.status === 'mastered';

              return (
                <Card
                  key={level.id}
                  data-level-id={level.id}
                  className={`
                    relative overflow-hidden transition-all duration-300 cursor-pointer
                    ${isLocked 
                      ? 'bg-slate-900/50 border-slate-700 opacity-60' 
                      : 'bg-slate-800/80 border-slate-600 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
                    }
                    ${selectedLevel?.id === level.id ? 'ring-2 ring-blue-500' : ''}
                  `}
                  onClick={() => !isLocked && setSelectedLevel(level)}
                >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{level.id}</span>
                    {getStatusBadge(levelProgress?.status || 'locked')}
                  </div>
                  <CardTitle className="text-lg text-white mt-1">{level.name}</CardTitle>
                  <CardDescription className="text-gray-400">{level.subtitle}</CardDescription>
                </CardHeader>

                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">难度</span>
                      <span className={getDifficultyColor(level.difficulty)}>
                        {getDifficultyStars(level.difficulty)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">教程重点</span>
                      <span className="text-blue-400">{TUTORIAL_FOCUS_NAMES[level.tutorialFocus]}</span>
                    </div>
                    {isCompleted && levelProgress?.bestScore && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">最高分</span>
                        <span className="text-yellow-400 font-semibold">{levelProgress.bestScore}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    className="w-full"
                    variant={isLocked ? 'secondary' : 'default'}
                    disabled={isLocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLocked) {
                        onStartLevel(level.id);
                      }
                    }}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        未解锁
                      </>
                    ) : isCompleted ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        再次挑战
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        开始挑战
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              );
            } catch (error) {
              console.error(`[LevelSelection] 渲染关卡 ${level.id} 时出错:`, error);
              return (
                <div key={level.id} className="p-4 bg-red-900/50 border border-red-500 text-red-200">
                  关卡 {level.id} 渲染出错: {error instanceof Error ? error.message : String(error)}
                </div>
              );
            }
          })}
        </div>

        {selectedLevel && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">{selectedLevel.name}</CardTitle>
                <CardDescription className="text-gray-400">{selectedLevel.articleTitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">关卡目标</h4>
                  <ul className="space-y-1">
                    {selectedLevel.objectives.map((obj) => (
                      <li key={obj.id} className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {obj.description}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">敌人信息</h4>
                  <div className="text-sm text-gray-400">
                    <p>敌人: {selectedLevel.enemyConfig.name}</p>
                    <p>类型: {selectedLevel.enemyConfig.type}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">提示</h4>
                  <ul className="space-y-1">
                    {selectedLevel.hints.map((hint, i) => (
                      <li key={i} className="text-sm text-gray-400">• {hint}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedLevel(null)} className="flex-1">
                  取消
                </Button>
                <Button onClick={() => onStartLevel(selectedLevel.id)} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  开始挑战
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default LevelSelection;
