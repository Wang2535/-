import React from 'react';

interface LayerLockedModalProps {
  layerNumber: number;
  onClose: () => void;
}

export const LayerLockedModal: React.FC<LayerLockedModalProps> = ({ layerNumber, onClose }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'rgba(40,40,40,0.95)', borderRadius: '16px',
        padding: '40px', maxWidth: '400px', textAlign: 'center',
        border: '2px solid #666'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ color: '#888', marginBottom: '15px' }}>层级锁定</h2>
        <p style={{ color: '#aaa', marginBottom: '25px' }}>第 {layerNumber} 层尚未解锁</p>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '25px' }}>需完成第 {layerNumber - 1} 层后解锁</p>
        <button onClick={onClose} style={{
          padding: '12px 30px', backgroundColor: 'rgba(100,100,100,0.3)',
          color: 'white', border: '1px solid #666', borderRadius: '8px', cursor: 'pointer'
        }}>关闭</button>
      </div>
    </div>
  );
};
