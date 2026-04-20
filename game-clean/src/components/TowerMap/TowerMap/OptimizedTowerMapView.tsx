/**
 * 优化版大地图视图组件
 * 使用虚拟化、缓存和性能优化技术
 */

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TowerMap, TowerMapNode, NodeType } from '@/types/towerMapTypes';
import { getActTheme, getNodeStyle, NODE_COLORS } from '@/styles/towerMapTheme';
import { useTowerMapInteraction } from '@/hooks/useTowerMapInteraction';
import { TowerMapProgress } from './TowerMapProgress';
import { TowerMapNavigation } from './TowerMapNavigation';
import { NodeEnterAnimation, CurrentPositionIndicator } from './TowerMapAnimations';
import { 
  Sword, Skull, Crown, Gift, Store, HelpCircle, 
  Flame, Check, Lock, Sparkles 
} from 'lucide-react';

// 节点图标映射
const NODE_ICONS: Record<NodeType, React.ComponentType<{ className?: string }>> = {
  combat: Sword,
  elite: Skull,
  boss: Crown,
  reward: Gift,
  shop: Store,
  event: HelpCircle,
  rest: Flame,
};

interface OptimizedTowerMapViewProps {
  map: TowerMap;
  onNodeClick?: (node: TowerMapNode) => void;
  onNodeHover?: (node: TowerMapNode | null) => void;
  enableZoom?: boolean;
  enablePan?: boolean;
  className?: string;
}

// 节点渲染缓存
const nodeCache = new Map<string, React.ReactNode>();

export const OptimizedTowerMapView: React.FC<OptimizedTowerMapViewProps> = ({
  map,
  onNodeClick,
  onNodeHover,
  enableZoom = true,
  enablePan = true,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());

  // 使用虚拟化优化大量节点渲染
  const allNodes = useMemo(() => {
    const nodes: Array<{ node: TowerMapNode; act: number; floor: number }> = [];
    map.acts.forEach((act, actIndex) => {
      act.floors.forEach((floor, floorIndex) => {
        floor.nodes.forEach(node => {
          nodes.push({ node, act: actIndex + 1, floor: floorIndex + 1 });
        });
      });
    });
    return nodes;
  }, [map]);

  // 虚拟化列表
  const virtualizer = useVirtualizer({
    count: allNodes.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  // 性能优化：使用 useCallback 缓存事件处理
  const handleNodeClick = useCallback((node: TowerMapNode) => {
    if (node.isAvailable && onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  const handleNodeHover = useCallback((node: TowerMapNode | null) => {
    if (onNodeHover) {
      onNodeHover(node);
    }
  }, [onNodeHover]);

  // 性能优化：使用 Intersection Observer 实现懒加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const newVisible = new Set(visibleNodes);
        entries.forEach(entry => {
          const nodeId = entry.target.getAttribute('data-node-id');
          if (nodeId) {
            if (entry.isIntersecting) {
              newVisible.add(nodeId);
            } else {
              newVisible.delete(nodeId);
            }
          }
        });
        setVisibleNodes(newVisible);
      },
      { threshold: 0.1, root: containerRef.current }
    );

    const nodes = containerRef.current?.querySelectorAll('[data-node-id]');
    nodes?.forEach(node => observer.observe(node));

    return () => observer.disconnect();
  }, [allNodes]);

  // 拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enablePan) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - translate.x, y: e.clientY - translate.y };
  }, [enablePan, translate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !enablePan) return;
    setTranslate({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, [isDragging, enablePan]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 渲染单个节点（带缓存）
  const renderNode = useCallback((nodeData: typeof allNodes[0], index: number) => {
    const { node, act, floor } = nodeData;
    const cacheKey = `${node.id}-${node.isCompleted}-${node.isAvailable}-${map.currentNodeId}`;
    
    // 检查缓存
    if (nodeCache.has(cacheKey)) {
      return nodeCache.get(cacheKey);
    }

    const theme = getActTheme(act as 1 | 2 | 3);
    const nodeStyle = getNodeStyle(node.type, node.isCompleted, node.isAvailable);
    const Icon = NODE_ICONS[node.type];
    const isCurrentNode = map.currentNodeId === node.id;
    const isVisible = visibleNodes.has(node.id);

    const nodeElement = (
      <motion.g
        key={node.id}
        data-node-id={node.id}
        transform={`translate(${node.position.x}, ${node.position.y})`}
        initial={prefersReducedMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: isVisible ? 1 : 0.3 }}
        transition={{ 
          delay: index * 0.02,
          duration: prefersReducedMotion ? 0 : 0.3,
          type: 'spring',
          stiffness: 200
        }}
        onClick={() => handleNodeClick(node)}
        onMouseEnter={() => handleNodeHover(node)}
        onMouseLeave={() => handleNodeHover(null)}
        style={{ cursor: node.isAvailable ? 'pointer' : 'default' }}
      >
        {/* 节点背景 */}
        <circle
          r={isCurrentNode ? 28 : 24}
          fill={nodeStyle.fill}
          stroke={nodeStyle.stroke}
          strokeWidth={isCurrentNode ? 3 : 2}
          filter={node.isAvailable ? `drop-shadow(0 0 ${isCurrentNode ? 15 : 8}px ${nodeStyle.glow})` : undefined}
          opacity={node.isCompleted ? 0.6 : 1}
        />

        {/* 当前节点指示器 */}
        {isCurrentNode && (
          <CurrentPositionIndicator 
            color={nodeStyle.glow}
            reducedMotion={prefersReducedMotion}
          />
        )}

        {/* 节点图标 */}
        <foreignObject x="-12" y="-12" width="24" height="24">
          <div className="flex items-center justify-center w-full h-full">
            <Icon 
              className={`w-5 h-5 ${node.isCompleted ? 'text-gray-400' : 'text-white'}`}
            />
          </div>
        </foreignObject>

        {/* 完成标记 */}
        {node.isCompleted && (
          <motion.g
            initial={prefersReducedMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <circle r="8" fill="#22c55e" cx="16" cy="-16" />
            <Check className="w-4 h-4 text-white" x="12" y="-20" />
          </motion.g>
        )}

        {/* 锁定标记 */}
        {!node.isAvailable && !node.isCompleted && (
          <g opacity={0.5}>
            <Lock className="w-4 h-4 text-gray-500" x="-8" y="16" />
          </g>
        )}

        {/* Boss特效 */}
        {node.type === 'boss' && node.isAvailable && !node.isCompleted && (
          <motion.circle
            r="32"
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth="2"
            strokeDasharray="5,5"
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </motion.g>
    );

    // 存入缓存
    nodeCache.set(cacheKey, nodeElement);
    return nodeElement;
  }, [handleNodeClick, handleNodeHover, map.currentNodeId, prefersReducedMotion, visibleNodes]);

  // 渲染连接线（优化：只渲染可见节点的连接）
  const renderConnections = useMemo(() => {
    const connections: React.ReactNode[] = [];
    
    map.acts.forEach(act => {
      act.floors.forEach((floor, floorIndex) => {
        if (floorIndex >= act.floors.length - 1) return;
        
        const nextFloor = act.floors[floorIndex + 1];
        
        floor.nodes.forEach(node => {
          if (!visibleNodes.has(node.id)) return;
          
          node.connections.forEach(targetId => {
            const targetNode = nextFloor.nodes.find(n => n.id === targetId);
            if (!targetNode || !visibleNodes.has(targetNode.id)) return;

            const isPathActive = node.isCompleted && targetNode.isAvailable;
            
            connections.push(
              <motion.path
                key={`${node.id}-${targetId}`}
                d={`M ${node.position.x} ${node.position.y} 
                    C ${node.position.x} ${(node.position.y + targetNode.position.y) / 2},
                      ${targetNode.position.x} ${(node.position.y + targetNode.position.y) / 2},
                      ${targetNode.position.x} ${targetNode.position.y}`}
                fill="none"
                stroke={isPathActive ? '#3b82f6' : '#4b5563'}
                strokeWidth={isPathActive ? 3 : 1}
                strokeDasharray={isPathActive ? undefined : '5,5'}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isPathActive ? 1 : 0.4 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
              />
            );
          });
        });
      });
    });

    return connections;
  }, [map.acts, visibleNodes, prefersReducedMotion]);

  // 清理过期缓存
  useEffect(() => {
    const interval = setInterval(() => {
      if (nodeCache.size > 1000) {
        nodeCache.clear();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gray-900 ${className}`}>
      {/* 地图容器 */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <svg
          width="1200"
          height="2000"
          viewBox="0 0 1200 2000"
          className="mx-auto"
        >
          {/* 背景网格 */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2937" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* 幕分隔线 */}
          {map.acts.map((act, index) => {
            if (index === 0) return null;
            const y = map.acts.slice(0, index).reduce((sum, a) => 
              sum + a.floors.length * 100 + 50, 0
            );
            return (
              <g key={`act-divider-${index}`}>
                <line x1="0" y1={y} x2="1200" y2={y} stroke="#374151" strokeWidth="2" />
                <text x="20" y={y - 10} fill="#6b7280" fontSize="14">
                  Act {index + 1}
                </text>
              </g>
            );
          })}

          {/* 连接线 */}
          {renderConnections}

          {/* 虚拟化节点列表 */}
          <g>
            {virtualizer.getVirtualItems().map(virtualItem => {
              const nodeData = allNodes[virtualItem.index];
              return renderNode(nodeData, virtualItem.index);
            })}
          </g>
        </svg>
      </div>

      {/* 进度指示器 */}
      <TowerMapProgress 
        map={map} 
        className="absolute top-4 left-4 w-80 z-10"
      />

      {/* 导航控制 */}
      <TowerMapNavigation
        map={map}
        scale={scale}
        translate={translate}
        onZoomIn={() => setScale(s => Math.min(2, s + 0.1))}
        onZoomOut={() => setScale(s => Math.max(0.5, s - 0.1))}
        onReset={() => { setScale(1); setTranslate({ x: 0, y: 0 }); }}
        onGotoCurrent={() => {
          // 滚动到当前节点
          const currentNode = allNodes.find(n => n.node.id === map.currentNodeId);
          if (currentNode && containerRef.current) {
            containerRef.current.scrollTo({
              top: currentNode.node.position.y - 300,
              behavior: 'smooth'
            });
          }
        }}
      />

      {/* 性能监控（开发模式） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-20">
          <div>Nodes: {visibleNodes.size}/{allNodes.length}</div>
          <div>Cache: {nodeCache.size}</div>
          <div>Scale: {scale.toFixed(2)}x</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedTowerMapView;
