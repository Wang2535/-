import React, { useState } from 'react';
import { SRayLandMapRenderer } from '../tower-mode/components/SRayLandMapRenderer';

export function SRayLandMapTest() {
  const [currentCellId, setCurrentCellId] = useState<string>('u1');

  const handleCellClick = (cellId: string) => {
    console.log('点击了格子:', cellId);
    setCurrentCellId(cellId);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a1a 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        marginBottom: '20px', 
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: '#FFD700', 
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '10px',
          textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
        }}>
          SRayLand 复古大航海地图
        </h1>
        <p style={{ 
          color: '#aaa', 
          fontSize: '1rem'
        }}>
          点击格子查看交互效果
        </p>
        <p style={{ 
          color: '#44ff88', 
          fontSize: '0.9rem',
          marginTop: '10px'
        }}>
          当前位置: {currentCellId}
        </p>
      </div>

      <div style={{ 
        width: '100%', 
        maxWidth: '400px',
        aspectRatio: '9/16',
        boxShadow: '0 0 40px rgba(139, 69, 19, 0.5)'
      }}>
        <SRayLandMapRenderer 
          currentCellId={currentCellId}
          onCellClick={handleCellClick}
        />
      </div>

      <div style={{ 
        marginTop: '30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        maxWidth: '800px',
        width: '100%'
      }}>
        <div style={{
          padding: '15px',
          borderRadius: '10px',
          background: 'rgba(139, 69, 19, 0.2)',
          border: '1px solid rgba(139, 69, 19, 0.4)'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '10px', fontSize: '1rem' }}>🎨 设计特点</h3>
          <ul style={{ color: '#ddd', fontSize: '0.85rem', marginLeft: '15px' }}>
            <li>复古大航海地图风格</li>
            <li>美式复古桌游美学</li>
            <li>线条硬朗，色彩对比强烈</li>
            <li>手绘插画质感</li>
          </ul>
        </div>

        <div style={{
          padding: '15px',
          borderRadius: '10px',
          background: 'rgba(139, 69, 19, 0.2)',
          border: '1px solid rgba(139, 69, 19, 0.4)'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '10px', fontSize: '1rem' }}>🗺️ 地图结构</h3>
          <ul style={{ color: '#ddd', fontSize: '0.85rem', marginLeft: '15px' }}>
            <li>双闭合环8字形路径</li>
            <li>上圆角菱形轨道</li>
            <li>下圆角矩形轨道</li>
            <li>2×2核心区(W/N/I/P)</li>
          </ul>
        </div>

        <div style={{
          padding: '15px',
          borderRadius: '10px',
          background: 'rgba(139, 69, 19, 0.2)',
          border: '1px solid rgba(139, 69, 19, 0.4)'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '10px', fontSize: '1rem' }}>🎲 格子类型</h3>
          <ul style={{ color: '#ddd', fontSize: '0.85rem', marginLeft: '15px' }}>
            <li>🚩 起点位置</li>
            <li>⚔️ 战斗节点</li>
            <li>❓ 事件节点</li>
            <li>🏁 终点位置</li>
          </ul>
        </div>

        <div style={{
          padding: '15px',
          borderRadius: '10px',
          background: 'rgba(139, 69, 19, 0.2)',
          border: '1px solid rgba(139, 69, 19, 0.4)'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '10px', fontSize: '1rem' }}>📐 视觉规格</h3>
          <ul style={{ color: '#ddd', fontSize: '0.85rem', marginLeft: '15px' }}>
            <li>9:16竖版构图</li>
            <li>橙白交替格子</li>
            <li>粗黑色轮廓线</li>
            <li>8K超清细节</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
