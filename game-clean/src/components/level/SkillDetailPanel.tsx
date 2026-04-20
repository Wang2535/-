/**
 * 技能详情面板组件
 * 
 * 功能：
 * 1. 右键点击角色时显示技能详情
 * 2. 展示角色所有技能信息
 * 3. 点击空白区域或再次右键关闭
 * 4. 支持拖动窗口
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X, Zap, Shield, Clock, AlertCircle, GripVertical } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'passive' | 'trigger';
  cooldown?: number;
  currentCooldown?: number;
  effect: string;
}

interface SkillDetailPanelProps {
  isOpen: boolean;
  characterName: string;
  characterTitle?: string;
  characterType: 'player' | 'dadong' | 'enemy';
  skills: Skill[];
  position: { x: number; y: number };
  onClose: () => void;
}

// 窗口尺寸常量
const WINDOW_WIDTH = 400;
const WINDOW_MAX_HEIGHT = 500;
const HEADER_HEIGHT = 60;
const FOOTER_HEIGHT = 40;
const CONTENT_MAX_HEIGHT = WINDOW_MAX_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT;

export function SkillDetailPanel({
  isOpen,
  characterName,
  characterTitle,
  characterType,
  skills,
  position,
  onClose
}: SkillDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  // 拖动状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // 窗口位置状态
  const [windowPosition, setWindowPosition] = useState({
    x: Math.min(position.x, window.innerWidth - WINDOW_WIDTH),
    y: Math.min(position.y, window.innerHeight - WINDOW_MAX_HEIGHT)
  });

  // 当 position prop 改变时更新窗口位置
  useEffect(() => {
    if (isOpen) {
      setWindowPosition({
        x: Math.min(position.x, window.innerWidth - WINDOW_WIDTH),
        y: Math.min(position.y, window.innerHeight - WINDOW_MAX_HEIGHT)
      });
    }
  }, [position.x, position.y, isOpen]);

  // 处理鼠标按下 - 开始拖动
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 只有点击标题栏时才允许拖动
    if (headerRef.current && headerRef.current.contains(e.target as Node)) {
      e.preventDefault();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - windowPosition.x,
        y: e.clientY - windowPosition.y
      });
    }
  }, [windowPosition.x, windowPosition.y]);

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // 边界约束：确保窗口不会被拖出屏幕
      const minX = 0;
      const minY = 0;
      const maxX = window.innerWidth - WINDOW_WIDTH;
      const maxY = window.innerHeight - 100; // 保留顶部100px可拖动
      
      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));
      
      setWindowPosition({ x: newX, y: newY });
    }
  }, [isDragging, dragOffset]);

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 添加/移除全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'move';
    } else {
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 右键点击关闭
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isOpen, onClose]);

  // 窗口大小改变时重新计算边界
  useEffect(() => {
    const handleResize = () => {
      setWindowPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - WINDOW_WIDTH),
        y: Math.min(prev.y, window.innerHeight - WINDOW_MAX_HEIGHT)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'active':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'passive':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'trigger':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Zap className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'active':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'passive':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'trigger':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getCharacterColor = () => {
    switch (characterType) {
      case 'player':
        return 'border-blue-500 bg-blue-900/20';
      case 'dadong':
        return 'border-green-500 bg-green-900/20';
      case 'enemy':
        return 'border-red-500 bg-red-900/20';
      default:
        return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getHeaderColor = () => {
    switch (characterType) {
      case 'player':
        return 'bg-blue-800/40 border-blue-600/50';
      case 'dadong':
        return 'bg-green-800/40 border-green-600/50';
      case 'enemy':
        return 'bg-red-800/40 border-red-600/50';
      default:
        return 'bg-slate-800/40 border-slate-600/50';
    }
  };

  // 计算面板位置
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    left: windowPosition.x,
    top: windowPosition.y,
    zIndex: 1000,
    width: WINDOW_WIDTH,
    maxHeight: WINDOW_MAX_HEIGHT,
  };

  return (
    <div 
      style={panelStyle} 
      ref={panelRef}
      onMouseDown={handleMouseDown}
      className={cn(
        'select-none',
        isDragging && 'pointer-events-none'
      )}
    >
      <Card className={cn(
        'border-2 shadow-2xl overflow-hidden flex flex-col',
        getCharacterColor()
      )}
      style={{ 
        width: WINDOW_WIDTH, 
        maxHeight: WINDOW_MAX_HEIGHT,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }}
      >
        {/* 可拖动的标题栏 */}
        <div 
          ref={headerRef}
          className={cn(
            'flex items-center justify-between px-4 py-3 border-b cursor-move select-none',
            getHeaderColor()
          )}
          style={{ height: HEADER_HEIGHT }}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-slate-400 opacity-50" />
            <div>
              <h3 className="text-lg font-bold text-white">{characterName}</h3>
              {characterTitle && (
                <p className="text-xs text-slate-400">{characterTitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-700/50 rounded-full transition-colors pointer-events-auto"
            title="关闭"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* 技能列表 - 可滚动 */}
        <div 
          className="p-4 space-y-3 overflow-y-auto pointer-events-auto"
          style={{ maxHeight: CONTENT_MAX_HEIGHT }}
        >
          {skills.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <p>暂无技能信息</p>
            </div>
          ) : (
            skills.map((skill, index) => (
              <div
                key={skill.id}
                className={cn(
                  'p-3 rounded-lg border',
                  getTypeColor(skill.type)
                )}
              >
                {/* 技能头部 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(skill.type)}
                    <span className="font-semibold">{skill.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {skill.type === 'active' ? '主动' : 
                     skill.type === 'passive' ? '被动' : '触发'}
                  </Badge>
                </div>

                {/* 技能描述 */}
                <p className="text-sm mb-2 opacity-90">{skill.description}</p>

                {/* 冷却时间 */}
                {(skill.cooldown !== undefined && skill.cooldown > 0) && (
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>
                      冷却: {skill.currentCooldown || 0}/{skill.cooldown} 回合
                    </span>
                  </div>
                )}

                {/* 效果说明 */}
                <div className="mt-2 text-xs opacity-75">
                  <span className="font-medium">效果: </span>
                  {skill.effect}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部提示 */}
        <div 
          className="px-4 py-2 border-t border-slate-700 text-xs text-slate-500 text-center bg-slate-900/30 pointer-events-auto"
          style={{ height: FOOTER_HEIGHT }}
        >
          拖动标题栏移动窗口 · 点击空白区域或右键关闭
        </div>
      </Card>
    </div>
  );
}

export default SkillDetailPanel;
