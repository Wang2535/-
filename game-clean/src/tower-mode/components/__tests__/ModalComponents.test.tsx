import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookstoreModal } from '../BookstoreModal';
import { SkillPanel } from '../SkillPanel';
import { DataPacketSelector } from '../DataPacketSelector';
import { LayerTransition } from '../LayerTransition';
import { CellInfoPanel } from '../CellInfoPanel/CellInfoPanel';

describe('BookstoreModal', () => {
  const mockBooks = [
    { id: 'book-1', name: '网络安全基础', description: '入门指南', quality: 'common', effectDescription: '+10防御' },
    { id: 'book-2', name: '高级渗透测试', description: '进阶教程', quality: 'rare', effectDescription: '+20攻击' },
    { id: 'book-3', name: '密码学原理', description: '理论书籍', quality: 'epic', effectDescription: '+15技能' },
  ];

  const baseProps = {
    data: { books: mockBooks, playerGold: 100, canAfford: [true, false, true] },
    onSelectBook: vi.fn(),
    onLeave: vi.fn(),
  };

  it('renders bookstore title', () => {
    render(<BookstoreModal {...baseProps} />);
    expect(screen.getByText(/📚.*书店/i)).toBeInTheDocument();
  });

  it('displays all book names', () => {
    render(<BookstoreModal {...baseProps} />);
    expect(screen.getByText('网络安全基础')).toBeInTheDocument();
    expect(screen.getByText('高级渗透测试')).toBeInTheDocument();
    expect(screen.getByText('密码学原理')).toBeInTheDocument();
  });

  it('shows player gold amount', () => {
    render(<BookstoreModal {...baseProps} />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('calls onLeave when leave button clicked', () => {
    render(<BookstoreModal {...baseProps} />);
    fireEvent.click(screen.getByText('离开书店'));
    expect(baseProps.onLeave).toHaveBeenCalledOnce();
  });
});

describe('SkillPanel', () => {
  const mockSkills = [
    { id: 'skill-fireball', name: '火球术', quality: 'common', description: '发射火球', effectDescription: '造成30伤害' },
  ];

  const baseProps = {
    data: { offeredSkills: mockSkills, currentActiveSkills: [], maxSlots: 3 },
    onSelectSkill: vi.fn(),
    onSkip: vi.fn(),
  };

  it('renders skill panel title', () => {
    render(<SkillPanel {...baseProps} />);
    expect(screen.getByText(/技能获取/i)).toBeInTheDocument();
  });

  it('shows offered skill name', () => {
    render(<SkillPanel {...baseProps} />);
    expect(screen.getByText('火球术')).toBeInTheDocument();
  });

  it('calls onSkip when skip button clicked', () => {
    render(<SkillPanel {...baseProps} />);
    fireEvent.click(screen.getByText('放弃获取'));
    expect(baseProps.onSkip).toHaveBeenCalledOnce();
  });

  it('shows equip button when slots not full', () => {
    render(<SkillPanel {...baseProps} />);
    expect(screen.getByText(/装备技能/i)).toBeInTheDocument();
  });
});

describe('DataPacketSelector', () => {
  const mockPackets = [
    { id: 'packet-a', name: '防火墙配置', description: '网络防御包', quality: 'rare', effectDescription: '+25防御' },
    { id: 'packet-b', name: '入侵检测规则', description: '监控包', quality: 'epic', effectDescription: '+30感知' },
    { id: 'packet-c', name: '漏洞扫描器', description: '扫描包', quality: 'legendary', effectDescription: '+50攻击' },
  ];

  const baseProps = {
    data: { dataPackets: mockPackets },
    onSelectPacket: vi.fn(),
  };

  it('renders boss reward title', () => {
    render(<DataPacketSelector {...baseProps} />);
    expect(screen.getByText(/BOSS奖励.*选择数据包/i)).toBeInTheDocument();
  });

  it('displays all packet names', () => {
    render(<DataPacketSelector {...baseProps} />);
    expect(screen.getByText('防火墙配置')).toBeInTheDocument();
    expect(screen.getByText('入侵检测规则')).toBeInTheDocument();
    expect(screen.getByText('漏洞扫描器')).toBeInTheDocument();
  });

  it('calls onSelectPacket when packet selected', () => {
    render(<DataPacketSelector {...baseProps} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(baseProps.onSelectPacket).toHaveBeenCalledWith('packet-a');
  });
});

describe('LayerTransition', () => {
  const baseProps = {
    data: { fromLayer: 3, toLayer: 4, nextLayerPreview: { themeName: '云安全层', shapeDescription: '六边形网格', estimatedDifficulty: '中等' } },
    onProceed: vi.fn(),
  };

  it('renders completion message', async () => {
    render(<LayerTransition {...baseProps} />);
    expect(await screen.findByText(/第 3 层 完成/i, { timeout: 2000 })).toBeInTheDocument();
  });

  it('shows next layer info', async () => {
    render(<LayerTransition {...baseProps} />);
    expect(await screen.findByText(/进入.*第 4 层/i, { timeout: 2000 })).toBeInTheDocument();
  });

  it('shows next layer preview if available', async () => {
    render(<LayerTransition {...baseProps} />);
    expect(await screen.findByText(/云安全层/i, { timeout: 2000 })).toBeInTheDocument();
  });

  it('calls onProceed when proceed button clicked', async () => {
    render(<LayerTransition {...baseProps} />);
    const btn = await screen.findByText('进入下一层', { timeout: 2000 });
    fireEvent.click(btn);
    expect(baseProps.onProceed).toHaveBeenCalledOnce();
  });

  it('renders without preview when data is minimal', async () => {
    render(<LayerTransition data={{ fromLayer: 1, toLayer: 2 }} onProceed={vi.fn()} />);
    expect(await screen.findByText(/第 1 层 完成/i, { timeout: 2000 })).toBeInTheDocument();
    expect(screen.queryByText(/云安全层/i)).not.toBeInTheDocument();
  });
});

describe('CellInfoPanel', () => {
  const baseCellData = {
    cellId: 'cell-1',
    cellType: 'battle',
    displayName: '测试单元格',
    difficultyStars: 2,
    estimatedTechGain: 5,
    estimatedGoldGain: 10,
  };

  const baseProps = {
    visible: true,
    cellData: baseCellData,
    onEnter: vi.fn(),
    onSkip: vi.fn(),
    onClose: vi.fn(),
    layerNumber: 1,
  };

  it('shows zone tip when zoneId is W', () => {
    render(<CellInfoPanel {...baseProps} zoneId="W" />);
    expect(screen.getByText('⚠️ 虚弱区域: 下次掷骰-1')).toBeInTheDocument();
  });

  it('shows zone tip when zoneId is D', () => {
    render(<CellInfoPanel {...baseProps} zoneId="D" />);
    expect(screen.getByText('💀 危险区域: 随机损失技术值')).toBeInTheDocument();
  });

  it('shows buy book button when cellType is bookstore and onBuyBook provided', () => {
    render(
      <CellInfoPanel
        {...baseProps}
        cellData={{ ...baseCellData, cellType: 'bookstore', displayName: '知识殿堂' }}
        onBuyBook={vi.fn()}
      />
    );
    expect(screen.getByText('📖 购买书籍')).toBeInTheDocument();
  });

  it('shows start battle button when cellType is boss and onStartBattle provided', () => {
    render(
      <CellInfoPanel
        {...baseProps}
        cellData={{ ...baseCellData, cellType: 'boss', displayName: 'Boss关', difficultyStars: 5 }}
        onStartBattle={vi.fn()}
      />
    );
    expect(screen.getByText('⚔️ 开始战斗')).toBeInTheDocument();
  });

  it('does not show zone tip when zoneId is not provided', () => {
    render(<CellInfoPanel {...baseProps} />);
    expect(screen.queryByText('⚠️ 虚弱区域: 下次掷骰-1')).not.toBeInTheDocument();
    expect(screen.queryByText('💀 危险区域: 随机损失技术值')).not.toBeInTheDocument();
  });

  it('does not show special action buttons when callbacks not provided', () => {
    render(
      <CellInfoPanel
        {...baseProps}
        cellData={{ ...baseCellData, cellType: 'bookstore', displayName: '知识殿堂' }}
      />
    );
    expect(screen.queryByText('📖 购买书籍')).not.toBeInTheDocument();
  });

  it('backward compatibility: existing enter and skip buttons work normally', async () => {
    const onEnter = vi.fn();
    const onSkip = vi.fn();
    render(<CellInfoPanel {...baseProps} onEnter={onEnter} onSkip={onSkip} />);
    const buttons = screen.getAllByRole('button');
    const enterBtn = buttons.find(b => b.className?.includes('cip-btn-enter'));
    const skipBtn = buttons.find(b => b.className?.includes('cip-btn-skip'));
    expect(enterBtn).toBeInTheDocument();
    expect(skipBtn).toBeInTheDocument();
    fireEvent.click(enterBtn!);
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(onEnter).toHaveBeenCalledWith('cell-1');
  });

  it('shows select skill button when cellType is skill and onSelectSkill provided', () => {
    render(
      <CellInfoPanel
        {...baseProps}
        cellData={{ ...baseCellData, cellType: 'skill', displayName: '技能研习' }}
        onSelectSkill={vi.fn()}
      />
    );
    expect(screen.getByText('⚡ 选择技能')).toBeInTheDocument();
  });

  it('shows exchange button when cellType is exchange and onExchange provided', () => {
    render(
      <CellInfoPanel
        {...baseProps}
        cellData={{ ...baseCellData, cellType: 'exchange', displayName: '交流会' }}
        onExchange={vi.fn()}
      />
    );
    expect(screen.getByText('🔄 交换')).toBeInTheDocument();
  });

  it('calls onStartBattle when start battle button clicked', () => {
    const handleStartBattle = vi.fn();
    render(
      <CellInfoPanel
        {...baseProps}
        cellData={{ ...baseCellData, cellType: 'boss', displayName: 'Boss关', difficultyStars: 5 }}
        onStartBattle={handleStartBattle}
      />
    );
    fireEvent.click(screen.getByText('⚔️ 开始战斗'));
    expect(handleStartBattle).toHaveBeenCalledOnce();
  });
});
