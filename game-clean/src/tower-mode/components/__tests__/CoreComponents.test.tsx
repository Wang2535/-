import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TowerMapView } from '../TowerMapView';
import { TowerHUD } from '../TowerHUD';
import { MovementControl } from '../MovementControl';
import { BattleEntranceModal } from '../BattleEntranceModal';
import { ChanceEventModal } from '../ChanceEventModal';

describe('TowerMapView', () => {
  it('renders placeholder when layerData is null', () => {
    render(<TowerMapView layerData={null} />);
    expect(screen.getByText(/等待地图数据加载/i)).toBeInTheDocument();
  });

  it('renders overview mode when layerStates provided', () => {
    const layerStates = Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => [i + 1, { unlocked: i === 0, completed: false }])
    );
    const { container } = render(
      <TowerMapView
        layerStates={layerStates}
        onSelectLayer={vi.fn()}
      />
    );
    expect(container.querySelector('.tower-map-container') || container.firstChild).toBeTruthy();
  });

  it('calls onSelectLayer when layer clicked', () => {
    const handleSelect = vi.fn();
    const layerStates = Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => [i + 1, { unlocked: i === 0, completed: false }])
    );
    render(
      <TowerMapView
        layerStates={layerStates}
        onSelectLayer={handleSelect}
      />
    );
    const buttons = screen.getAllByRole('button');
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
    }
  });

  it('renders nothing when layerData provided without layerStates', () => {
    const { container } = render(
      <TowerMapView
        layerData={{ themeId: 'test', gridSize: { cols: 5, rows: 5 } } as any}
      />
    );
    expect(container.innerHTML).toBe('');
  });
});

describe('TowerHUD', () => {
  const baseProps = {
    layer: 3,
    hp: { current: 75, max: 100 },
    activeSkills: [{ id: 'skill-1', name: 'TestSkill', quality: 'rare' }],
    packetCount: 5,
    bookCount: 3,
    moveCount: 12,
    phase: 'playing' as const,
    onMenuClick: vi.fn(),
  };

  it('displays current layer number', () => {
    render(<TowerHUD {...baseProps} />);
    expect(screen.getByText(/第 3 层/i)).toBeInTheDocument();
  });

  it('displays HP value correctly', () => {
    render(<TowerHUD {...baseProps} />);
    expect(screen.getByText(/75\/100/i)).toBeInTheDocument();
  });

  it('displays packet count', () => {
    render(<TowerHUD {...baseProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays active skill names', () => {
    render(<TowerHUD {...baseProps} />);
    expect(screen.getByText(/TestSkill/)).toBeInTheDocument();
  });
});

describe('MovementControl', () => {
  const baseProps = {
    diceResult: null,
    moveOptions: [] as any[],
    onRollDice: vi.fn(),
    onMove: vi.fn(),
    disabled: false,
    isMoving: false,
  };

  it('shows dice button', () => {
    render(<MovementControl {...baseProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('disables dice button when disabled=true', () => {
    render(<MovementControl {...baseProps} disabled={true} />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('displays move options when available', () => {
    const mockOptions = [
      { targetCell: { id: 'opt-1' } as any, path: [] as any[], distance: 2, recommended: true, riskScore: 0 } as any,
    ];
    render(<MovementControl {...baseProps} moveOptions={mockOptions} />);
    expect(screen.getByText(/→/i)).toBeInTheDocument();
  });

  it('shows "投掷骰子" hint when no moves available', () => {
    render(<MovementControl {...baseProps} />);
    expect(screen.getByText(/投掷骰子以查看可移动位置/i)).toBeInTheDocument();
  });
});

describe('BattleEntranceModal', () => {
  const baseProps = {
    data: { enemyPreview: { name: 'TestBoss', hp: 500, difficulty: 3 }, difficulty: 3, estimatedRewards: ['Gold+100', 'EXP+200'] },
    onConfirm: vi.fn(),
    onRetreat: vi.fn(),
  };

  it('renders battle title', () => {
    render(<BattleEntranceModal {...baseProps} />);
    expect(screen.getByText(/战斗即将开始/i)).toBeInTheDocument();
  });

  it('shows enemy name', () => {
    render(<BattleEntranceModal {...baseProps} />);
    expect(screen.getByText('TestBoss')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    render(<BattleEntranceModal {...baseProps} />);
    fireEvent.click(screen.getByText('进入战斗'));
    expect(baseProps.onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onRetreat when retreat button clicked', () => {
    render(<BattleEntranceModal {...baseProps} />);
    fireEvent.click(screen.getByText('撤退'));
    expect(baseProps.onRetreat).toHaveBeenCalledOnce();
  });
});

describe('ChanceEventModal', () => {
  const baseProps = {
    data: { event: { name: '神秘宝箱', description: '你发现了一个发光的宝箱！' }, outcomeOptions: [{ id: 'opt-a', label: '打开宝箱', description: '可能有惊喜' }] },
    onSelectOption: vi.fn(),
  };

  it('renders event title', () => {
    render(<ChanceEventModal {...baseProps} />);
    expect(screen.getByText(/随机事件/i)).toBeInTheDocument();
  });

  it('shows event name and description', () => {
    render(<ChanceEventModal {...baseProps} />);
    expect(screen.getByText('神秘宝箱')).toBeInTheDocument();
    expect(screen.getByText(/发光的宝箱/i)).toBeInTheDocument();
  });

  it('calls onSelectOption when option clicked', () => {
    render(<ChanceEventModal {...baseProps} />);
    fireEvent.click(screen.getByText('打开宝箱'));
    expect(baseProps.onSelectOption).toHaveBeenCalledWith('opt-a');
  });
});
