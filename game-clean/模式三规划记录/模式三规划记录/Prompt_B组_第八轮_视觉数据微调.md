# B组第八轮 — 视觉数据微调：W/N/I/P尺寸、边框样式、Boss格配置

## 背景

第七轮B组产出了9层完整的visualData，但实际渲染时发现以下参数需要调整：

1. **W/N/I/P标识太小** — fontSizeRatio=0.18 但E组渲染时用了固定值5
2. **棋盘格边框不是真正的"格子"** — 当前是36段径向线段，需要改为实心方格交替填充
3. **Boss格在visualData中sizeMultiplier=2.5但E组未读取该字段**

## 任务目标

修正9层visualData中的关键参数，确保E组能正确消费。

## 具体任务

### Task B1: 修正 W/N/I/P 标识为"大号填充式"

每层的 `quadrantLabels` 需要更新：

```typescript
// 修改前（第七轮）:
{ quadrant: 'W', label: 'W', fontSizeRatio: 0.18, color: '#FF8800', fontWeight: '900', backgroundColor: '#FECACA', backgroundOpacity: 0.25 }

// 修改后（第八轮）:
{
  quadrant: 'W',
  label: 'W',
  fontSizeRatio: 0.22,           // 增大到22%（占下圆直径的22%，非常醒目）
  color: '#FF8800',
  fontWeight: '900',
  fontFamily: '"Arial Black", "Impact", sans-serif',  // 粗体无衬线
  backgroundColor: 'transparent',   // 去掉半透明背景，让字母更突出
  backgroundOpacity: 0,
  // 新增：文字描边增强可读性
  strokeColor: '#FFFFFF',
  strokeWidth: 0.8,
  // 新增：文字阴影
  shadowColor: '#000000',
  shadowBlur: 3,
  shadowOffsetX: 1,
  shadowOffsetY: 1,
}
```

**4个象限全部按此模板调整**，颜色保持不变：
- W: #FF8800 (橙)
- N: #FFCC00 (黄)
- I: #FFCC00 (黄)
- P: #FF8800 (橙)

### Task B2: 棋盘格边框改为实心方格模式

```typescript
// 修改前（第七轮）:
border: {
  enabled: true,
  borderWidth: 8,
  colors: ['#FFAA00', '#FFFFFF'],
  tileSize: 16,       // 径向线段长度
  borderRadius: 20,
  padding: 4,
}

// 修改后（第八轮）:
border: {
  enabled: true,
  mode: 'checkerboard-fill',    // 新增：实心方格填充模式
  borderWidth: 10,                // 边框总宽度
  colors: ['#FFAA00', '#FFFFFF'], // 橙黄白交替
  tileSize: 12,                  // 单个方格大小(px)
  innerPadding: 2,               // 内部留白
  cornerRadius: 3,               // 方格圆角
  opacity: 0.85,                 // 边框整体透明度
  glowColor: 'rgba(255,170,0,0.5)', // 边框外发光
}
```

**关键变化**: E组需要根据 `mode: 'checkerboard-fill'` 使用 CSS `repeating-conic-gradient` 或 SVG pattern 来绘制真正的棋盘格，而非径向线段。

### Task B3: 确保 Boss 格配置在各层一致

验证并确认所有9层的 cellVisualStyles 中 boss 条目：

```typescript
// 每层必须包含：
['boss', {
  sizeMultiplier: 2.5,        // 必须=2.5！
  shape: 'circle',
  backgroundGradient: { from: '#4a0a0a', to: '#2a0000' },
  border: { width: 4, color: '#ff0000', style: 'double' },
  icon: { type: 'svg', data: '<svg>...</svg>' },  // 使用A组的GRID_ICONS.boss
  glowEffect: { color: '#ff3333', size: 30, pulse: true },
  animationClass: 'boss-emerge',  // Boss登场动画
}]
```

## 验收标准

1. ✅ 9层 quadrantLabels 的 fontSizeRatio ≥ 0.20
2. ✅ 9层 border.mode = 'checkerboard-fill'
3. ✅ 9层 boss 的 sizeMultiplier = 2.5
4. ✅ 所有图标引用 A 组 GRID_ICONS 而非 Emoji
