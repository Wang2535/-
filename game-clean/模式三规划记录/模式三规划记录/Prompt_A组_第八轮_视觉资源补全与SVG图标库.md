# A组第八轮 — 视觉资源类型补全与SVG图标库

## 背景

第七轮A组定义了完整的类型体系（GourdCoordinate/CheckerboardBorder/CellVisualStyle等），但部分类型的**默认值不够完善**，特别是：
1. SVG图标数据为空字符串占位（`data: '<svg>...</svg>'`）
2. CSS动画类名已定义但无实际CSS规则
3. 背景装饰元素类型缺少更多变体

## 任务目标

补充A组类型体系中的**资源引用和默认值**，使E组可以直接使用而无需额外配置。

## 具体任务

### Task A1: 内置SVG图标库

创建文件 `src/tower-mode/assets/gridIcons.ts`：

```typescript
/**
 * 格子类型 → 内置SVG图标
 * 
 * 替代第七轮的Emoji图标。
 * 每个图标为精简的inline SVG path data，
 * 可直接用于 <svg><path d={...}/></svg>
 */
export const GRID_ICONS: Record<string, string> = {
  start: 'M12 2C6.48 2 2 6.48 2 12s4 5 4 10c0 4-3 7.5-6.5 8.5L12 22l4.5-3.5C19.5 17.5 22 14 22 10c0-5.52-4.48-10-10-10zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58z', // 起点：圆形路径
  boss: 'M12 2L2 7v10l10 5 10-5V7L12 2zM12 18a6 6 0 110-12 6 6 0 010 12z', // Boss：皇冠/王座
  battle: 'M13 10V1h-2v9H4v2h7v7h2v-7h7v-2h-7z', // 战斗：剑交叉
  bookstore: 'M4 6H2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6h-2v12H4V6zm16-4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z', // 书店：书本
  skill: 'M7 2v11h3v9a2 2 0 002 2h2a2 2 0 002-2v-9h3V2H7z', // 技能：闪电
  exchange: 'M12 2C6.48 2 2 6.48 2 12s4 5 4 10c0 4-3 7.5-6.5 8.5L12 22l4.5-3.5C19.5 17.5 22 14 22 10c0-5.52-4.48-10-10-10zm0 15a5 5 0 110-10 5 5 0 010 10z', // 交流会：对话气泡
  opportunity: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z', // 事件：礼物盒
  special: 'M12 2l3 6 6 .5L12 16l-9-7.5L9 8z', // 特殊：星星
  chance: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z', // 随机：问号
  elite: 'M12 2L4 7v10l8 5 8-5V7l-8-5z M12 8l-3 2 3 2 3-2-3-2z', // 精英：骷髅盾牌
  locked: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 19H7v-2h2v2z', // 锁定：锁
};
```

### Task A2: CSS动画规则集

创建文件 `src/tower-mode/styles/gourdAnimations.css`：

```css
/* ===== 第八轮：完整CSS动画规则 ===== */

/* Boss格脉动光环 */
.glow-pulse {
  animation: glow-pulse 1.5s ease-in-out infinite;
}
@keyframes glow-pulse {
  0%, 100% { filter: drop-shadow(0 0 8px var(--glow-color, #ff3333)); opacity: 0.6; }
  50% { filter: drop-shadow(0 0 20px var(--glow-color, #ff3333)); opacity: 1; }
}

/* 待处理状态橙色闪烁 */
.pulse-orange {
  animation: pulse-orange 1.2s ease-in-out infinite;
}
@keyframes pulse-orange {
  0%, 100% { box-shadow: 0 0 8px #FF8800; }
  50% { box-shadow: 0 0 24px #FF8800; }
}

/* 精英格锯齿抖动 */
.elite-jagged {
  animation: elite-jagged 0.8s ease-in-out infinite;
}
@keyframes elite-jagged {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.03) rotate(1deg); }
  75% { transform: scale(0.97) rotate(-1deg); }
}

/* 区域进入特效 */
.ripple-enter { animation: ripple-enter 0.8s ease-out forwards; }
@keyframes ripple-enter {
  0% { transform: scale(0.5); opacity: 0; }
  50% { opacity: 0.4; }
  100% { transform: scale(1.8); opacity: 0; }
}
.sparkle-enter { animation: sparkle-enter 1s ease-out forwards; }
@keyframes sparkle-enter {
  0% { opacity: 0; filter: brightness(1); }
  50% { opacity: 1; filter: brightness(2); }
  100% { opacity: 0; filter: brightness(1); }
}
.flash-enter { animation: flash-enter 0.5s ease-out 3; }
@keyframes flash-enter {
  0%, 100% { background: transparent; }
  50% { background: rgba(147, 51, 234, 0.3); }
}
.countdown-enter { animation: countdown-enter 1s linear forwards; }
@keyframes countdown-enter {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}
.warning-enter { animation: warning-enter 0.5s ease infinite; }
@keyframes warning-enter {
  0%, 100% { fill: rgba(239, 68, 68, 0.2); }
  50% { fill: rgba(239, 68, 68, 0.5); }
}

/* Boss登场动画 */
.boss-emerge {
  animation: boss-emerge 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes boss-emerge {
  0% { transform: scale(0) translateY(20px); opacity: 0; }
  60% { transform: scale(1.08) translateY(-3px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }

/* 到达波纹 */
.arrival-ripple { animation: arrival-ripple 0.6s ease-out forwards; }
@keyframes arrival-ripple {
  0% { r: 0%; opacity: 0.8; stroke-width: 3; }
  100% { r: 25%; opacity: 0; stroke-width: 1; }
}

/* 玩家棋子呼吸 */
.piece-breathe {
  animation: piece-breathe 2s ease-in-out infinite;
}
@keyframes piece-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}
```

### Task A3: 默认CellVisualStyle 完善化

更新 `visualAssets.types.ts` 中的默认值：

```typescript
/** 第八轮更新的默认格子样式 —— 可被B组每层数据覆盖 */
export const DEFAULT_CELL_VISUAL_STYLES: Map<string, CellVisualStyle> = new Map([
  ['start',   { sizeMultiplier: 1.0, shape: 'roundedRect', backgroundGradient: {from:'#2d5a27',to:'#1a3a15'}, border:{width:2,color:'#44ff88',style:'solid'}, icon:{type:'svg', data:''}, glowEffect:{color:'#44ff88',size:12,pulse:true} }],
  ['battle',  { sizeMultiplier: 1.0, shape: 'circle',       backgroundGradient: {from:'#3a1a1a',to:'#2a0a0a'}, border:{width:2,color:'#ff6644',style:'solid'}, icon:{type:'svg', data:''} }],
  ['boss',    { sizeMultiplier: 2.5, shape: 'circle',       backgroundGradient: {from:'#4a0a0a',to:'#2a0000'}, border:{width:4,color:'#ff0000',style:'double'}, icon:{type:'svg', data:''}, glowEffect:{color:'#ff3333',size:30,pulse:true} }],
  ['bookstore',{ sizeMultiplier: 1.0, shape: 'ellipse',      backgroundGradient: {from:'#1a2a4a',to:'#0a1a3a'}, border:{width:2,color:'#44aaff',style:'solid'}, icon:{type:'svg', data:''} }],
  ['skill',   { sizeMultiplier: 1.0, shape: 'hexagon',       backgroundGradient: {from:'#2a1a4a',to:'#1a0a3a'}, border:{width:2,color:'#aa44ff',style:'solid'}, icon:{type:'svg', data:''} }],
  ['elite',   { sizeMultiplier: 1.2, shape: 'circle',        backgroundGradient: {from:'#4a1a00',to:'#2a0a00'}, border:{width:3,color:'#ff0000',style:'dashed',dashPattern:'3,3'}, icon:{type:'svg', data:''}, animationClass:'elite-jagged' }],
]);
```

## 验收标准

1. ✅ GRID_ICONS 包含全部12种格子类型的SVG path
2. ✅ gourdAnimations.css 包含全部12种动画定义
3. ✅ DEFAULT_CELL_VISUAL_STYLES 中 Boss格 sizeMultiplier=2.5
4. ✅ 所有新文件从 types/index.ts 或统一入口导出
