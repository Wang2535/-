import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameCompleteScreen } from '../GameCompleteScreen';
import { NotificationContainer } from '../NotificationContainer';
import { TowerStartScreen } from '../TowerStartScreen';
import { PauseOverlay } from '../PauseOverlay';

describe('GameCompleteScreen', () => {
  const baseProps = {
    stats: {
      layer: 9,
      hp: { current: 80, max: 100 },
      activeSkills: [],
      packetCount: 7,
      bookCount: 12,
      moveCount: 45,
    },
    onRestart: vi.fn(),
    onExit: vi.fn(),
  };

  it('renders congrats message', () => {
    render(<GameCompleteScreen {...baseProps} />);
    expect(screen.getByText(/恭喜通关/i)).toBeInTheDocument();
  });

  it('shows final layer count', () => {
    render(<GameCompleteScreen {...baseProps} />);
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('displays HP correctly', () => {
    render(<GameCompleteScreen {...baseProps} />);
    expect(screen.getByText('80/100')).toBeInTheDocument();
  });

  it('displays packet count', () => {
    render(<GameCompleteScreen {...baseProps} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('displays book count', () => {
    render(<GameCompleteScreen {...baseProps} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('displays move count', () => {
    render(<GameCompleteScreen {...baseProps} />);
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('calls onRestart when restart clicked', () => {
    render(<GameCompleteScreen {...baseProps} />);
    fireEvent.click(screen.getByText(/再来一次/i));
    expect(baseProps.onRestart).toHaveBeenCalledOnce();
  });

  it('calls onExit when exit clicked', () => {
    render(<GameCompleteScreen {...baseProps} />);
    fireEvent.click(screen.getByText(/退出/i));
    expect(baseProps.onExit).toHaveBeenCalledOnce();
  });

  it('hides exit button when onExit not provided', () => {
    const { onExit, ...propsWithoutExit } = baseProps;
    render(<GameCompleteScreen {...propsWithoutExit} />);
    expect(screen.queryByText(/退出/i)).not.toBeInTheDocument();
  });

  it('renders with low HP in red color', () => {
    const lowHpProps = {
      ...baseProps,
      stats: { ...baseProps.stats, hp: { current: 20, max: 100 } },
    };
    render(<GameCompleteScreen {...lowHpProps} />);
    expect(screen.getByText('20/100')).toBeInTheDocument();
  });
});

describe('NotificationContainer', () => {
  it('renders notification messages', () => {
    const notifications = [
      { id: 'n1', type: 'info' as const, message: '测试通知1', duration: 3000, timestamp: Date.now() },
      { id: 'n2', type: 'success' as const, message: '测试通知2', duration: 5000, timestamp: Date.now() },
    ];
    render(<NotificationContainer notifications={notifications} onDismiss={vi.fn()} />);
    expect(screen.getByText('测试通知1')).toBeInTheDocument();
    expect(screen.getByText('测试通知2')).toBeInTheDocument();
  });

  it('renders nothing when no notifications', () => {
    render(<NotificationContainer notifications={[]} onDismiss={vi.fn()} />);
    expect(screen.queryByText(/测试通知/i)).not.toBeInTheDocument();
  });

  it('renders warning notification', () => {
    const notifications = [
      { id: 'w1', type: 'warning' as const, message: '警告消息', timestamp: Date.now() },
    ];
    render(<NotificationContainer notifications={notifications} onDismiss={vi.fn()} />);
    expect(screen.getByText('警告消息')).toBeInTheDocument();
  });

  it('renders error notification', () => {
    const notifications = [
      { id: 'e1', type: 'error' as const, message: '错误消息', timestamp: Date.now() },
    ];
    render(<NotificationContainer notifications={notifications} onDismiss={vi.fn()} />);
    expect(screen.getByText('错误消息')).toBeInTheDocument();
  });

  it('calls onDismiss when notification clicked', () => {
    const onDismiss = vi.fn();
    const notifications = [
      { id: 'd1', type: 'info' as const, message: '可关闭的通知', timestamp: Date.now() },
    ];
    render(<NotificationContainer notifications={notifications} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText('可关闭的通知'));
    expect(onDismiss).toHaveBeenCalledWith('d1');
  });

  it('does not crash when onDismiss is not provided and clicked', () => {
    const notifications = [
      { id: 'nd1', type: 'info' as const, message: '无回调通知', timestamp: Date.now() },
    ];
    render(<NotificationContainer notifications={notifications} />);
    fireEvent.click(screen.getByText('无回调通知'));
  });
});

describe('TowerStartScreen', () => {
  it('renders start menu with new game option', () => {
    render(<TowerStartScreen onStart={vi.fn()} onLoad={vi.fn()} onExit={vi.fn()} />);
    expect(screen.getByText(/新游戏/i)).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<TowerStartScreen onStart={vi.fn()} onLoad={vi.fn()} onExit={vi.fn()} />);
    expect(screen.getByText(/安全实践之塔/i)).toBeInTheDocument();
  });

  it('calls onStart when new game clicked', () => {
    const onStart = vi.fn();
    render(<TowerStartScreen onStart={onStart} onLoad={vi.fn()} onExit={vi.fn()} />);
    fireEvent.click(screen.getByText(/新游戏/i));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('shows continue game option', () => {
    render(<TowerStartScreen onStart={vi.fn()} onLoad={vi.fn()} onExit={vi.fn()} />);
    expect(screen.getByText(/继续游戏/i)).toBeInTheDocument();
  });

  it('toggles save list when continue game clicked', () => {
    render(<TowerStartScreen onStart={vi.fn()} onLoad={vi.fn()} onExit={vi.fn()} />);
    expect(screen.queryByText(/暂无存档/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/继续游戏/i));
    expect(screen.getByText(/暂无存档/i)).toBeInTheDocument();
  });

  it('hides exit button when onExit not provided', () => {
    render(<TowerStartScreen onStart={vi.fn()} onLoad={vi.fn()} />);
    expect(screen.queryByText(/退出/i)).not.toBeInTheDocument();
  });

  it('shows exit button when onExit provided', () => {
    render(<TowerStartScreen onStart={vi.fn()} onLoad={vi.fn()} onExit={vi.fn()} />);
    expect(screen.getByText(/退出/i)).toBeInTheDocument();
  });
});

describe('PauseOverlay', () => {
  it('renders pause title', () => {
    render(<PauseOverlay onResume={vi.fn()} onSave={vi.fn()} onExit={vi.fn()} />);
    expect(screen.getByText(/暂停/i)).toBeInTheDocument();
  });

  it('calls onResume when resume clicked', () => {
    const onResume = vi.fn();
    render(<PauseOverlay onResume={onResume} onSave={vi.fn()} onExit={vi.fn()} />);
    fireEvent.click(screen.getByText(/继续游戏/i));
    expect(onResume).toHaveBeenCalledOnce();
  });

  it('calls onSave when save clicked', () => {
    const onSave = vi.fn();
    render(<PauseOverlay onResume={vi.fn()} onSave={onSave} onExit={vi.fn()} />);
    fireEvent.click(screen.getByText(/快速保存/i));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('calls onExit when exit clicked', () => {
    const onExit = vi.fn();
    render(<PauseOverlay onResume={vi.fn()} onSave={vi.fn()} onExit={onExit} />);
    fireEvent.click(screen.getByText(/保存并退出/i));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('hides exit button when onExit not provided', () => {
    render(<PauseOverlay onResume={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByText(/保存并退出/i)).not.toBeInTheDocument();
  });
});
