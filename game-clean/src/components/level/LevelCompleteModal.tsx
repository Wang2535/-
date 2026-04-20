import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, ArrowRight, BookOpen, Home, RotateCcw, Eye, X } from 'lucide-react';
import type { LevelCompletionResult } from '@/types/levelTypes';
import { ArticleDisplay } from './ArticleDisplay';
import { CARD_DATABASE } from '@/data/cardDatabase';
import type { Card as CardType } from '@/types/legacy/card_v16';

interface LevelCompleteModalProps {
  result: LevelCompletionResult;
  isOpen: boolean;
  onClose: () => void;
  onNextLevel: () => void;
  onBackToMenu: () => void;
  onRetry: () => void;
}

interface CardDetailModalProps {
  card: CardType | null;
  isOpen: boolean;
  onClose: () => void;
}

function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  if (!isOpen || !card) return null;

  const getFactionColor = (faction: string) => {
    switch (faction) {
      case 'attack': return 'text-red-400 border-red-400/50 bg-red-950/30';
      case 'defense': return 'text-blue-400 border-blue-400/50 bg-blue-950/30';
      default: return 'text-gray-400 border-gray-400/50 bg-gray-950/30';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <Card className="w-full max-w-sm bg-slate-800 border-slate-600" onClick={e => e.stopPropagation()}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className={getFactionColor(card.faction)}>
              {card.faction === 'attack' ? '攻击方' : card.faction === 'defense' ? '防御方' : '通用'}
            </Badge>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <CardTitle className="text-xl text-white mt-2">{card.name}</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">{card.card_code}</span>
            <span className={getRarityColor(card.rarity)}>
              {card.rarity === 'legendary' ? '传说' : card.rarity === 'epic' ? '史诗' : card.rarity === 'rare' ? '稀有' : '普通'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300">{card.description}</p>
          
          {card.effects && card.effects.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">效果</div>
              <div className="text-sm text-white">
                {card.effects.map((effect, idx) => (
                  <div key={idx}>
                    {effect.type === 'security_gain' && `安全+${effect.baseValue || 1}`}
                    {effect.type === 'security_reduce' && `安全-${effect.baseValue || 1}`}
                    {effect.type === 'infiltration_gain' && `渗透+${effect.baseValue || 1}`}
                    {effect.type === 'infiltration_reduce' && `渗透-${effect.baseValue || 1}`}
                    {effect.type === 'resource_gain' && `${effect.resourceType === 'compute' ? '算力' : effect.resourceType === 'funds' ? '资金' : '信息'}+${effect.value || 1}`}
                    {effect.description}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(card.cost?.compute || card.cost?.funds || card.cost?.information) && (
            <div className="flex gap-3 text-xs">
              {card.cost.compute > 0 && (
                <span className="text-yellow-400">⚡ {card.cost.compute}</span>
              )}
              {card.cost.funds > 0 && (
                <span className="text-green-400">💰 {card.cost.funds}</span>
              )}
              {card.cost.information > 0 && (
                <span className="text-blue-400">👁️ {card.cost.information}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function LevelCompleteModal({
  result,
  isOpen,
  onClose,
  onNextLevel,
  onBackToMenu,
  onRetry
}: LevelCompleteModalProps) {
  const [showArticle, setShowArticle] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [showCardDetail, setShowCardDetail] = useState(false);

  if (!isOpen) return null;

  const getScoreRating = (score: number) => {
    if (score >= 150) return { rating: 'S', color: 'text-yellow-400', stars: 5 };
    if (score >= 120) return { rating: 'A', color: 'text-green-400', stars: 4 };
    if (score >= 90) return { rating: 'B', color: 'text-blue-400', stars: 3 };
    if (score >= 60) return { rating: 'C', color: 'text-gray-400', stars: 2 };
    return { rating: 'D', color: 'text-red-400', stars: 1 };
  };

  const { rating, color, stars } = getScoreRating(result.score);

  const handleCardClick = (cardId: string) => {
    const card = CARD_DATABASE[cardId];
    if (card) {
      setSelectedCard(card);
      setShowCardDetail(true);
    }
  };

  const getCardName = (cardId: string): string => {
    const card = CARD_DATABASE[cardId];
    return card ? card.name : cardId;
  };

  if (showArticle) {
    return (
      <ArticleDisplay
        title={result.articleContent.split('\n')[0]}
        content={result.articleContent}
        onClose={() => setShowArticle(false)}
        onNextLevel={result.nextLevel ? onNextLevel : undefined}
        onBackToMenu={onBackToMenu}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-600">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">关卡完成！</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-5xl font-bold ${color}`}>{rating}</div>
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                />
              ))}
            </div>
            <div className="text-gray-400 mt-2">得分: {result.score}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-700/50">
              <div className="text-2xl font-bold text-white">{result.turnsTaken}</div>
              <div className="text-xs text-gray-400">回合数</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-700/50">
              <div className="text-2xl font-bold text-white">{result.completedObjectives.length}</div>
              <div className="text-xs text-gray-400">完成目标</div>
            </div>
          </div>

          {result.rewards.unlockedCards.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-700/50">
              <div className="text-sm text-gray-300 mb-2">解锁卡牌 (点击查看详情)</div>
              <div className="flex flex-wrap gap-2">
                {result.rewards.unlockedCards.map((cardId) => (
                  <button
                    key={cardId}
                    onClick={() => handleCardClick(cardId)}
                    className="group relative"
                  >
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-600 hover:bg-blue-500 cursor-pointer transition-all duration-200 group-hover:scale-105 flex items-center gap-1 pr-1"
                    >
                      <span>{cardId}</span>
                      <span className="text-blue-200">-</span>
                      <span className="text-white">{getCardName(cardId)}</span>
                      <Eye className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {result.rewards.achievement && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/50">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">成就解锁: {result.rewards.achievement}</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            onClick={() => setShowArticle(true)}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            阅读文章
          </Button>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onRetry} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              重玩
            </Button>
            {result.nextLevel && (
              <Button onClick={onNextLevel} className="flex-1">
                下一关
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            <Button variant="secondary" onClick={onBackToMenu} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* 卡牌详情弹窗 */}
      <CardDetailModal
        card={selectedCard}
        isOpen={showCardDetail}
        onClose={() => setShowCardDetail(false)}
      />
    </div>
  );
}

export default LevelCompleteModal;
