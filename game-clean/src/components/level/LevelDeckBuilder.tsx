/**
 * 卡牌库配置界面
 * 允许玩家从已解锁卡牌中组建自定义卡组（所有关卡共用一套卡组）
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, Plus, Minus, RotateCcw, Check, Lock, AlertCircle, Library, Info, X, Cpu, Coins, Eye, Shield } from 'lucide-react';
import type { PlayerDeckConfig, DeckValidationResult } from '@/types/playerDeckTypes';
import { MIN_DECK_SIZE, RARITY_DISPLAY_NAMES, RARITY_COLORS } from '@/types/playerDeckTypes';
import {
  validateDeck,
  addCardToDeck,
  removeCardFromDeck,
  setCardCount,
  resetDeck,
  getDeckStatistics,
  getDeckStatusText,
  getDeckProgressPercent,
  canAddCard,
} from '@/utils/deckValidation';
import {
  loadPlayerDeck,
  savePlayerDeck,
  getUnlockedCardCodes,
  initializeDefaultCards,
} from '@/utils/playerCardProgressManager';
import { getCardByCode, getAllCards } from '@/data/cardDatabase';
import type { Card as CardType } from '@/data/cardDatabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface LevelDeckBuilderProps {
  onBack: () => void;
}

// 稀有度样式配置
const RARITY_STYLES: Record<string, { color: string; bgColor: string; name: string; borderColor: string; badge: string }> = {
  common: { 
    color: 'text-slate-300', 
    bgColor: 'bg-slate-600', 
    name: '普通',
    borderColor: 'border-slate-500',
    badge: 'bg-slate-700 text-slate-200 border-slate-600'
  },
  uncommon: { 
    color: 'text-green-300', 
    bgColor: 'bg-green-600', 
    name: '优秀',
    borderColor: 'border-green-500',
    badge: 'bg-green-700 text-green-200 border-green-600'
  },
  rare: { 
    color: 'text-blue-300', 
    bgColor: 'bg-blue-600', 
    name: '稀有',
    borderColor: 'border-blue-500',
    badge: 'bg-blue-700 text-blue-200 border-blue-600'
  },
  epic: { 
    color: 'text-purple-300', 
    bgColor: 'bg-purple-600', 
    name: '史诗',
    borderColor: 'border-purple-500',
    badge: 'bg-purple-700 text-purple-200 border-purple-600'
  },
  legendary: { 
    color: 'text-yellow-300', 
    bgColor: 'bg-yellow-600', 
    name: '传说',
    borderColor: 'border-yellow-500',
    badge: 'bg-yellow-700 text-yellow-200 border-yellow-600'
  }
};

// 资源颜色配置
const RESOURCE_COLORS = {
  compute: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50 shadow-cyan-500/20',
  funds: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50 shadow-yellow-500/20',
  information: 'text-purple-400 bg-purple-500/20 border-purple-500/50 shadow-purple-500/20',
  permission: 'text-orange-400 bg-orange-500/20 border-orange-500/50 shadow-orange-500/20'
};

// 资源图标配置
const RESOURCE_ICONS = {
  compute: <Cpu className="w-3 h-3" />,
  funds: <Coins className="w-3 h-3" />,
  information: <Eye className="w-3 h-3" />,
  permission: <Shield className="w-3 h-3" />
};

export function LevelDeckBuilder({ onBack }: LevelDeckBuilderProps) {
  const [currentDeck, setCurrentDeck] = useState<PlayerDeckConfig>({
    cards: [],
    totalCount: 0,
    lastModified: Date.now(),
  });
  const [validationResult, setValidationResult] = useState<DeckValidationResult>({ valid: false });
  const [selectedCardCode, setSelectedCardCode] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [unlockedCardCodes, setUnlockedCardCodes] = useState<string[]>([]);
  const [detailCard, setDetailCard] = useState<CardType | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 初始化默认卡牌并加载已解锁卡牌列表
  useEffect(() => {
    // 先初始化默认卡牌
    initializeDefaultCards();
    // 然后加载已解锁卡牌列表
    setUnlockedCardCodes(getUnlockedCardCodes());
  }, []);

  // 获取所有可用卡牌
  const availableCards = useMemo(() => {
    return getAllCards().filter(card => unlockedCardCodes.includes(card.card_code));
  }, [unlockedCardCodes]);

  // 获取已收集卡牌统计
  const collectionStats = useMemo(() => {
    const allCards = getAllCards();
    return {
      unlocked: unlockedCardCodes.length,
      total: allCards.length,
    };
  }, [unlockedCardCodes]);

  // 获取卡组统计
  const deckStats = useMemo(() => getDeckStatistics(currentDeck), [currentDeck]);

  // 加载已保存的卡组配置
  useEffect(() => {
    const savedDeck = loadPlayerDeck();
    if (savedDeck) {
      setCurrentDeck(savedDeck);
    }
  }, []);

  // 验证卡组
  useEffect(() => {
    const result = validateDeck(currentDeck);
    setValidationResult(result);
  }, [currentDeck]);

  // 添加卡牌到卡组
  const handleAddCard = useCallback((cardCode: string) => {
    if (!canAddCard(currentDeck, cardCode)) {
      const card = getCardByCode(cardCode);
      toast.error(`${card?.name ?? '该卡牌'}已达到数量上限`);
      return;
    }

    setCurrentDeck(prev => addCardToDeck(prev, cardCode));
    setHasUnsavedChanges(true);
  }, [currentDeck]);

  // 从卡组移除卡牌
  const handleRemoveCard = useCallback((cardCode: string) => {
    setCurrentDeck(prev => removeCardFromDeck(prev, cardCode));
    setHasUnsavedChanges(true);
  }, []);

  // 调整卡牌数量
  const handleSetCardCount = useCallback((cardCode: string, count: number) => {
    setCurrentDeck(prev => setCardCount(prev, cardCode, count));
    setHasUnsavedChanges(true);
  }, []);

  // 重置卡组
  const handleResetDeck = useCallback(() => {
    setCurrentDeck(resetDeck());
    setHasUnsavedChanges(true);
    toast.info('卡组已重置');
  }, []);

  // 保存卡组
  const handleSaveDeck = useCallback(() => {
    if (!validationResult.valid) {
      toast.error(validationResult.reason ?? '卡组配置无效');
      return;
    }

    savePlayerDeck(currentDeck);
    setHasUnsavedChanges(false);
    toast.success('卡组已保存');
    onBack();
  }, [currentDeck, validationResult, onBack]);

  // 返回关卡模式
  const handleBackClick = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      onBack();
    }
  }, [hasUnsavedChanges, onBack]);

  // 确认不保存返回
  const handleConfirmBackWithoutSave = useCallback(() => {
    setShowConfirmDialog(false);
    onBack();
  }, [onBack]);

  // 保存并返回
  const handleSaveAndBack = useCallback(() => {
    if (validationResult.valid) {
      savePlayerDeck(currentDeck);
      setHasUnsavedChanges(false);
      toast.success('卡组已保存');
    }
    setShowConfirmDialog(false);
    onBack();
  }, [currentDeck, validationResult, onBack]);

  // 查看卡牌详情（左键点击信息按钮）
  const handleShowCardDetail = useCallback((card: CardType, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailCard(card);
    setShowDetailModal(true);
  }, []);

  // 右键查看卡牌详情
  const handleContextMenu = useCallback((card: CardType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDetailCard(card);
    setShowDetailModal(true);
  }, []);

  // 关闭卡牌详情
  const handleCloseCardDetail = useCallback(() => {
    setShowDetailModal(false);
    setDetailCard(null);
  }, []);

  // 获取卡牌稀有度样式
  const getRarityStyle = (rarity: string) => {
    return RARITY_STYLES[rarity] || RARITY_STYLES.common;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
              className="text-slate-400 hover:text-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Library className="h-5 w-5 text-emerald-400" />
              <h1 className="text-xl font-bold">卡牌库配置</h1>
            </div>
          </div>
          
          {/* 已收集卡牌进度 */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-slate-400">
              已收集卡牌: {collectionStats.unlocked}/{collectionStats.total}
            </div>
            <Progress
              value={(collectionStats.unlocked / collectionStats.total) * 100}
              className="w-24 h-2 hidden sm:block"
            />
          </div>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="p-4 lg:p-8">
        {/* 卡组统计 */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="bg-slate-900/50 border-slate-800 p-4">
            <div className="text-sm text-slate-400 mb-1">当前卡组</div>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-3xl font-bold",
                currentDeck.totalCount >= MIN_DECK_SIZE ? "text-emerald-400" : "text-amber-400"
              )}>
                {currentDeck.totalCount}
              </span>
              <span className="text-slate-500">/ {MIN_DECK_SIZE}张</span>
            </div>
            <Progress
              value={getDeckProgressPercent(currentDeck)}
              className="mt-2 h-2"
            />
            <div className="mt-2 text-xs text-slate-500">
              {getDeckStatusText(currentDeck)}
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 p-4">
            <div className="text-sm text-slate-400 mb-1">稀有度分布</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(deckStats.rarityDistribution).map(([rarity, count]) => (
                count > 0 && (
                  <Badge
                    key={rarity}
                    style={{ backgroundColor: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] }}
                    className="text-white"
                  >
                    {RARITY_DISPLAY_NAMES[rarity as keyof typeof RARITY_DISPLAY_NAMES]}: {count}
                  </Badge>
                )
              ))}
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 p-4">
            <div className="text-sm text-slate-400 mb-1">资源消耗预估</div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div className="text-cyan-400">算力: {deckStats.resourceCost.compute}</div>
              <div className="text-yellow-400">资金: {deckStats.resourceCost.funds}</div>
              <div className="text-purple-400">信息: {deckStats.resourceCost.information}</div>
              <div className="text-orange-400">权限: {deckStats.resourceCost.permission}</div>
            </div>
          </Card>
        </div>

        {/* 验证错误提示 */}
        {!validationResult.valid && currentDeck.totalCount > 0 && (
          <Alert variant="destructive" className="mb-6 bg-red-950/50 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationResult.reason}</AlertDescription>
          </Alert>
        )}

        {/* 卡牌选择区域 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 可用卡牌区 */}
          <Card className="bg-slate-900/50 border-slate-800">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold">可用卡牌</h2>
              <p className="text-sm text-slate-500">
                点击卡牌添加到卡组，点击 <Info className="inline w-3 h-3" /> 查看详情
              </p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto">
                {availableCards.map(card => {
                  const deckCard = currentDeck.cards.find(c => c.cardCode === card.card_code);
                  const currentCount = deckCard?.count ?? 0;
                  const canAdd = canAddCard(currentDeck, card.card_code);

                  return (
                    <div
                      key={card.card_code}
                      className={cn(
                        "relative p-3 rounded-lg border transition-all duration-200",
                        canAdd
                          ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                          : "bg-slate-800/50 border-slate-800 opacity-60"
                      )}
                      onContextMenu={(e) => handleContextMenu(card, e)}
                    >
                      {/* 稀有度指示条 */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                        style={{ backgroundColor: RARITY_COLORS[card.rarity] }}
                      />
                      
                      {/* 信息按钮 - 右上角 */}
                      <button
                        onClick={(e) => handleShowCardDetail(card, e)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-slate-700/80 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors z-10"
                        title="查看详情"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                      
                      {/* 卡牌内容 - 点击添加 */}
                      <button
                        onClick={() => handleAddCard(card.card_code)}
                        disabled={!canAdd}
                        className="w-full text-left mt-2"
                      >
                        <div className="font-medium text-sm truncate pr-6">{card.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{card.card_code}</div>
                        
                        {currentCount > 0 && (
                          <Badge className="mt-2 bg-emerald-600 text-white">
                            已选 {currentCount} 张
                          </Badge>
                        )}
                        
                        {!canAdd && currentCount > 0 && (
                          <div className="mt-1 text-xs text-red-400">
                            已达上限
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* 已选卡组区 */}
          <Card className="bg-slate-900/50 border-slate-800">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">已选卡组</h2>
                <p className="text-sm text-slate-500">
                  点击 <Info className="inline w-3 h-3" /> 查看详情，点击 +/- 调整数量
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDeck}
                className="text-slate-400 border-slate-700 hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                重置
              </Button>
            </div>
            <div className="p-4">
              {currentDeck.cards.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>卡组为空</p>
                  <p className="text-sm mt-1">从左侧选择卡牌添加到卡组</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {currentDeck.cards.map(deckCard => {
                    const card = getCardByCode(deckCard.cardCode);
                    if (!card) return null;

                    return (
                      <div
                        key={deckCard.cardCode}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700"
                        onContextMenu={(e) => handleContextMenu(card, e)}
                      >
                        {/* 卡牌信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: RARITY_COLORS[card.rarity] }}
                            />
                            <span className="font-medium truncate">{card.name}</span>
                            {/* 信息按钮 */}
                            <button
                              onClick={(e) => handleShowCardDetail(card, e)}
                              className="p-1 rounded-full bg-slate-700/80 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
                              title="查看详情"
                            >
                              <Info className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {RARITY_DISPLAY_NAMES[card.rarity]} · 最多可携带 {5 - ['legendary', 'epic', 'rare', 'uncommon', 'common'].indexOf(card.rarity)} 张
                          </div>
                        </div>

                        {/* 数量控制 */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-slate-700 hover:bg-slate-700"
                            onClick={() => handleSetCardCount(deckCard.cardCode, deckCard.count - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <span className="w-8 text-center font-medium">
                            {deckCard.count}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-slate-700 hover:bg-slate-700"
                            onClick={() => handleSetCardCount(deckCard.cardCode, deckCard.count + 1)}
                            disabled={!canAddCard(currentDeck, deckCard.cardCode)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* 移除按钮 */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-950/30"
                          onClick={() => handleRemoveCard(deckCard.cardCode)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 底部操作栏 */}
        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleBackClick}
            className="border-slate-700 hover:bg-slate-800"
          >
            返回
          </Button>
          <Button
            onClick={handleSaveDeck}
            disabled={!validationResult.valid}
            className={cn(
              "bg-emerald-600 hover:bg-emerald-700 text-white",
              !validationResult.valid && "opacity-50 cursor-not-allowed"
            )}
          >
            <Check className="h-4 w-4 mr-2" />
            确认卡组
          </Button>
        </div>
      </main>

      {/* 未保存确认对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle>未保存的更改</DialogTitle>
            <DialogDescription className="text-slate-400">
              您有未保存的卡组配置更改，是否保存？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-slate-700"
            >
              取消
            </Button>
            <Button
              variant="outline"
              onClick={handleConfirmBackWithoutSave}
              className="border-slate-700 text-red-400 hover:text-red-400 hover:bg-red-950/30"
            >
              不保存
            </Button>
            <Button
              onClick={handleSaveAndBack}
              disabled={!validationResult.valid}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              保存并返回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 卡牌详情弹窗 */}
      {showDetailModal && detailCard && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleCloseCardDetail}
        >
          <div 
            className={cn(
              'bg-slate-900/95 border-2 rounded-xl p-6 max-w-md w-full shadow-2xl',
              'backdrop-blur-md',
              getRarityStyle(detailCard.rarity).borderColor
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={handleCloseCardDetail}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            {/* 卡牌标题 */}
            <div className="flex items-start justify-between mb-4 pr-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">{detailCard.name}</h3>
                </div>
                <p className="text-sm text-slate-400 font-mono">{detailCard.card_code}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={cn(
                  'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium border',
                  getRarityStyle(detailCard.rarity).badge
                )}>
                  {detailCard.rarity}
                </span>
                <span className="inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium text-yellow-400 border-yellow-500/50">
                  T{detailCard.tech_level || 1}
                </span>
              </div>
            </div>

            {/* 资源消耗 */}
            {(detailCard.cost.compute > 0 || detailCard.cost.funds > 0 || detailCard.cost.information > 0 || detailCard.cost.permission > 0) && (
              <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-2">资源消耗</p>
                <div className="flex flex-wrap gap-2">
                  {detailCard.cost.compute > 0 && (
                    <div className={cn('px-3 py-1.5 rounded-lg border flex items-center gap-2 shadow-lg', RESOURCE_COLORS.compute)}>
                      {RESOURCE_ICONS.compute}
                      <span className="font-bold">算力 {detailCard.cost.compute}</span>
                    </div>
                  )}
                  {detailCard.cost.funds > 0 && (
                    <div className={cn('px-3 py-1.5 rounded-lg border flex items-center gap-2 shadow-lg', RESOURCE_COLORS.funds)}>
                      {RESOURCE_ICONS.funds}
                      <span className="font-bold">资金 {detailCard.cost.funds}</span>
                    </div>
                  )}
                  {detailCard.cost.information > 0 && (
                    <div className={cn('px-3 py-1.5 rounded-lg border flex items-center gap-2 shadow-lg', RESOURCE_COLORS.information)}>
                      {RESOURCE_ICONS.information}
                      <span className="font-bold">信息 {detailCard.cost.information}</span>
                    </div>
                  )}
                  {detailCard.cost.permission > 0 && (
                    <div className={cn('px-3 py-1.5 rounded-lg border flex items-center gap-2 shadow-lg', RESOURCE_COLORS.permission)}>
                      {RESOURCE_ICONS.permission}
                      <span className="font-bold">权限 {detailCard.cost.permission}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 卡牌效果 */}
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700/50">
              <p className="text-sm text-slate-300 leading-relaxed">{detailCard.description || '暂无效果描述'}</p>
            </div>

            {/* 判定难度 - 仅判定类卡牌显示 */}
            {detailCard.difficulty !== undefined && detailCard.difficulty > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-slate-400">判定难度:</span>
                <div className="flex gap-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-6 h-6 rounded flex items-center justify-center text-xs font-bold border',
                        i < (detailCard.difficulty || 0)
                          ? 'bg-yellow-500/80 text-yellow-950 border-yellow-400 shadow-lg shadow-yellow-500/30' 
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      )}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* 非判定类卡牌提示 */}
            {detailCard.difficulty === 0 && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-slate-400">判定难度:</span>
                <span className="text-sm text-emerald-400">无需判定，直接生效</span>
              </div>
            )}

            {/* 关闭按钮 */}
            <button
              onClick={handleCloseCardDetail}
              className="w-full py-2 bg-slate-800 hover:bg-cyan-600 text-white rounded-lg transition-all duration-300 border border-slate-600 hover:border-cyan-400 shadow-lg hover:shadow-cyan-500/30"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
