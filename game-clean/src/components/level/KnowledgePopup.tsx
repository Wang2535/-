import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { X, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { KnowledgeEntry } from '@/data/dadongKnowledgeBase';

interface KnowledgePopupProps {
  knowledge: KnowledgeEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (resourceType: 'computing' | 'funds' | 'information', resourceName: string) => void;
}

export function KnowledgePopup({
  knowledge,
  isOpen,
  onClose,
  onComplete
}: KnowledgePopupProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowContent(false);
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !knowledge) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'virus':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'prevention':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'history':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'virus':
        return '病毒类型';
      case 'prevention':
        return '防护措施';
      case 'history':
        return '历史事件';
      default:
        return '安全知识';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className={cn(
          'bg-slate-900/95 border-2 rounded-xl p-6 max-w-lg w-full shadow-2xl',
          'backdrop-blur-md',
          'border-emerald-500/50 shadow-emerald-500/20'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/50">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">安全知识讲解</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded border',
                  getCategoryColor(knowledge.category)
                )}>
                  {getCategoryLabel(knowledge.category)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className={cn(
          'bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700/50 transition-all duration-500',
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        )}>
          <p className="text-sm text-slate-200 leading-relaxed mb-3">
            {knowledge.content}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-700/50 pt-2">
            <span className="font-medium">来源：</span>
            <span>{knowledge.source}</span>
          </div>
        </div>

        <div className={cn(
          'flex items-center gap-3 mb-4',
          showContent ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="flex-1 h-px bg-slate-700/50" />
          <span className="text-xs text-slate-500">点击下方按钮继续游戏</span>
          <div className="flex-1 h-px bg-slate-700/50" />
        </div>

        <Button
          onClick={() => {
            // 随机选择资源类型
            const resourceTypes: ('computing' | 'funds' | 'information')[] = ['computing', 'funds', 'information'];
            const resourceNames: Record<string, string> = {
              'computing': '算力',
              'funds': '资金',
              'information': '信息'
            };
            const randomType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
            const resourceName = resourceNames[randomType];
            
            // 调用完成回调
            if (onComplete) {
              onComplete(randomType, resourceName);
            }
            onClose();
          }}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/50 hover:border-emerald-400 hover:shadow-emerald-500/30 transition-all duration-300"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          阅读完毕（获得随机资源+1）
        </Button>
      </div>
    </div>
  );
}

export default KnowledgePopup;
