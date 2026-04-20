import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BossBattleView, { BossBattleViewProps } from '../BossBattleView';

describe('BossBattleView', () => {
  const baseSkills = [
    { id: 'fire', name: '火焰攻击', cost: 10, damage: 30 },
    { id: 'ice', name: '冰冻攻击', cost: 20, damage: 50 },
    { id: 'lightning', name: '闪电攻击', cost: 30, damage: 70 },
  ];

  const baseProps: BossBattleViewProps = {
    bossName: '机械巨龙',
    bossHealth: 80,
    bossMaxHealth: 100,
    playerHealth: 60,
    playerMaxHealth: 100,
    playerTech: 25,
    availableSkills: baseSkills,
    onAttack: vi.fn(),
    onDefend: vi.fn(),
    onUseItem: vi.fn(),
  };

  describe('基础渲染', () => {
    it('正确渲染Boss名称', () => {
      render(<BossBattleView {...baseProps} />);
      expect(screen.getByTestId('boss-name')).toHaveTextContent('机械巨龙');
    });

    it('正确渲染VS文字', () => {
      render(<BossBattleView {...baseProps} />);
      const vs = screen.getByTestId('vs-divider');
      expect(vs).toHaveTextContent('VS');
      expect(vs).toHaveStyle({ fontSize: '48px' });
    });
  });

  describe('Boss血量条', () => {
    it('填充宽度正确(80/100=80%)', () => {
      render(<BossBattleView {...baseProps} />);
      const fill = screen.getByTestId('boss-health-fill');
      expect(fill).toHaveStyle({ width: '80%' });
    });

    it('血量条颜色: >50%时为#ff4444', () => {
      render(<BossBattleView {...baseProps} bossHealth={80} bossMaxHealth={100} />);
      const fill = screen.getByTestId('boss-health-fill');
      expect(fill).toHaveStyle({ backgroundColor: '#ff4444' });
    });

    it('血量条颜色: <=50%时为#ff0000', () => {
      render(<BossBattleView {...baseProps} bossHealth={50} bossMaxHealth={100} />);
      const fill = screen.getByTestId('boss-health-fill');
      expect(fill).toHaveStyle({ backgroundColor: '#ff0000' });
    });

    it('血量条颜色: 低于50%时为#ff0000', () => {
      render(<BossBattleView {...baseProps} bossHealth={30} bossMaxHealth={100} />);
      const fill = screen.getByTestId('boss-health-fill');
      expect(fill).toHaveStyle({ backgroundColor: '#ff0000' });
    });

    it('血量文字显示正确', () => {
      render(<BossBattleView {...baseProps} bossHealth={80} bossMaxHealth={100} />);
      expect(screen.getByTestId('boss-health-text')).toHaveTextContent('80/100');
    });
  });

  describe('玩家血量条', () => {
    it('填充宽度正确(60/100=60%)', () => {
      render(<BossBattleView {...baseProps} />);
      const fill = screen.getByTestId('player-health-fill');
      expect(fill).toHaveStyle({ width: '60%' });
    });

    it('血量条颜色为#4488ff', () => {
      render(<BossBattleView {...baseProps} />);
      const fill = screen.getByTestId('player-health-fill');
      expect(fill).toHaveStyle({ backgroundColor: '#4488ff' });
    });

    it('血量文字显示正确', () => {
      render(<BossBattleView {...baseProps} playerHealth={60} playerMaxHealth={100} />);
      expect(screen.getByTestId('player-health-text')).toHaveTextContent('60/100');
    });
  });

  describe('技术值显示', () => {
    it('正确显示技术值', () => {
      render(<BossBattleView {...baseProps} playerTech={25} />);
      expect(screen.getByTestId('player-tech')).toHaveTextContent('💡 25 技术值');
    });

    it('技术值为0时正确显示', () => {
      render(<BossBattleView {...baseProps} playerTech={0} />);
      expect(screen.getByTestId('player-tech')).toHaveTextContent('💡 0 技术值');
    });
  });

  describe('技能按钮', () => {
    it('正确渲染所有技能按钮', () => {
      render(<BossBattleView {...baseProps} />);
      expect(screen.getByTestId('skill-button-fire')).toHaveTextContent('火焰攻击 (💡10)');
      expect(screen.getByTestId('skill-button-ice')).toHaveTextContent('冰冻攻击 (💡20)');
      expect(screen.getByTestId('skill-button-lightning')).toHaveTextContent('闪电攻击 (💡30)');
    });

    it('技术值足够时技能按钮可点击', () => {
      render(<BossBattleView {...baseProps} playerTech={25} />);
      const fireBtn = screen.getByTestId('skill-button-fire');
      const iceBtn = screen.getByTestId('skill-button-ice');
      expect(fireBtn).not.toBeDisabled();
      expect(iceBtn).not.toBeDisabled();
    });

    it('技术值不足时技能按钮disabled', () => {
      render(<BossBattleView {...baseProps} playerTech={25} />);
      const lightningBtn = screen.getByTestId('skill-button-lightning');
      expect(lightningBtn).toBeDisabled();
    });

    it('点击技能按钮调用onAttack(skillId)', () => {
      const onAttack = vi.fn();
      render(<BossBattleView {...baseProps} onAttack={onAttack} playerTech={50} />);
      fireEvent.click(screen.getByTestId('skill-button-fire'));
      expect(onAttack).toHaveBeenCalledWith('fire');
    });

    it('点击不同技能按钮传递对应skillId', () => {
      const onAttack = vi.fn();
      render(<BossBattleView {...baseProps} onAttack={onAttack} playerTech={50} />);
      fireEvent.click(screen.getByTestId('skill-button-ice'));
      expect(onAttack).toHaveBeenCalledWith('ice');
    });
  });

  describe('防御按钮', () => {
    it('正确渲染防御按钮', () => {
      render(<BossBattleView {...baseProps} />);
      expect(screen.getByTestId('defend-button')).toHaveTextContent('🛡️ 防御');
    });

    it('点击防御按钮调用onDefend', () => {
      const onDefend = vi.fn();
      render(<BossBattleView {...baseProps} onDefend={onDefend} />);
      fireEvent.click(screen.getByTestId('defend-button'));
      expect(onDefend).toHaveBeenCalledOnce();
    });
  });

  describe('空技能列表', () => {
    it('可用技能为空时只显示防御按钮', () => {
      render(<BossBattleView {...baseProps} availableSkills={[]} />);
      expect(screen.queryByTestId('skill-button-fire')).not.toBeInTheDocument();
      expect(screen.queryByTestId('skill-button-ice')).not.toBeInTheDocument();
      expect(screen.getByTestId('defend-button')).toBeInTheDocument();
    });
  });
});
