import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameHUD } from '../GameHUD';

describe('GameHUD', () => {
  const baseProps = {
    layerName: '葫芦谷',
    turnNumber: 5,
    techValue: 120,
    gold: 350,
    phase: 'idle' as const,
    onRollDice: vi.fn(),
    isRolling: false,
    canRoll: true,
  };

  describe('基础渲染', () => {
    it('正确渲染层级名称', () => {
      render(<GameHUD {...baseProps} />);
      expect(screen.getByText('葫芦谷')).toBeInTheDocument();
    });

    it('正确渲染回合数', () => {
      render(<GameHUD {...baseProps} />);
      expect(screen.getByText(/第 5 回合/)).toBeInTheDocument();
    });

    it('正确渲染技术值', () => {
      render(<GameHUD {...baseProps} />);
      expect(screen.getByText('120')).toBeInTheDocument();
    });

    it('正确渲染金币数', () => {
      render(<GameHUD {...baseProps} />);
      expect(screen.getByText('350')).toBeInTheDocument();
    });

    it('正确显示投掷骰子按钮', () => {
      render(<GameHUD {...baseProps} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('🎲 投掷骰子');
    });
  });

  describe('Phase 标签显示', () => {
    it('idle 阶段显示"⏳ 等待投掷"', () => {
      render(<GameHUD {...baseProps} phase="idle" />);
      expect(screen.getByText('⏳ 等待投掷')).toBeInTheDocument();
    });

    it('dice_ready 阶段显示"🎲 准备投掷"', () => {
      render(<GameHUD {...baseProps} phase="dice_ready" />);
      expect(screen.getByText('🎲 准备投掷')).toBeInTheDocument();
    });

    it('dice_rolling 阶段显示"🎲 投掷中..."', () => {
      render(<GameHUD {...baseProps} phase="dice_rolling" />);
      expect(screen.getByText('🎲 投掷中...')).toBeInTheDocument();
    });

    it('dice_result 阶段显示"📍 选择路径"', () => {
      render(<GameHUD {...baseProps} phase="dice_result" />);
      expect(screen.getByText('📍 选择路径')).toBeInTheDocument();
    });

    it('path_selecting 阶段显示"🔀 选择路径"', () => {
      render(<GameHUD {...baseProps} phase="path_selecting" />);
      expect(screen.getByText('🔀 选择路径')).toBeInTheDocument();
    });

    it('moving 阶段显示"🏃 移动中..."', () => {
      render(<GameHUD {...baseProps} phase="moving" />);
      expect(screen.getByText('🏃 移动中...')).toBeInTheDocument();
    });

    it('cell_arrived 阶段显示"👀 到达新位置"', () => {
      render(<GameHUD {...baseProps} phase="cell_arrived" />);
      expect(screen.getByText('👀 到达新位置')).toBeInTheDocument();
    });

    it('cell_interacting 阶段显示"⚡ 格子交互中"', () => {
      render(<GameHUD {...baseProps} phase="cell_interacting" />);
      expect(screen.getByText('⚡ 格子交互中')).toBeInTheDocument();
    });

    it('battle_preparing 阶段显示"⚔️ 战斗准备"', () => {
      render(<GameHUD {...baseProps} phase="battle_preparing" />);
      expect(screen.getByText('⚔️ 战斗准备')).toBeInTheDocument();
    });

    it('battle_active 阶段显示"⚔️ 战斗进行中"', () => {
      render(<GameHUD {...baseProps} phase="battle_active" />);
      expect(screen.getByText('⚔️ 战斗进行中')).toBeInTheDocument();
    });

    it('battle_settling 阶段显示"✅ 战斗结算"', () => {
      render(<GameHUD {...baseProps} phase="battle_settling" />);
      expect(screen.getByText('✅ 战斗结算')).toBeInTheDocument();
    });

    it('turn_ending 阶段显示"🔄 回合结束"', () => {
      render(<GameHUD {...baseProps} phase="turn_ending" />);
      expect(screen.getByText('🔄 回合结束')).toBeInTheDocument();
    });

    it('layer_transitioning 阶段显示"🔄 层级过渡"', () => {
      render(<GameHUD {...baseProps} phase="layer_transitioning" />);
      expect(screen.getByText('🔄 层级过渡')).toBeInTheDocument();
    });
  });

  describe('投掷按钮状态', () => {
    it('isRolling=true 时按钮禁用且文字变为"🎲 投掷中..."', () => {
      render(<GameHUD {...baseProps} isRolling={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('🎲 投掷中...');
      expect(button.className).toContain('rolling');
    });

    it('canRoll=false 时按钮禁用', () => {
      render(<GameHUD {...baseProps} canRoll={false} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('正常状态时点击按钮触发 onRollDice 回调', () => {
      const onRollDice = vi.fn();
      render(<GameHUD {...baseProps} onRollDice={onRollDice} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onRollDice).toHaveBeenCalledOnce();
    });

    it('isRolling=true 时点击按钮不触发回调', () => {
      const onRollDice = vi.fn();
      render(<GameHUD {...baseProps} isRolling={true} onRollDice={onRollDice} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onRollDice).not.toHaveBeenCalled();
    });

    it('canRoll=false 时点击按钮不触发回调', () => {
      const onRollDice = vi.fn();
      render(<GameHUD {...baseProps} canRoll={false} onRollDice={onRollDice} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onRollDice).not.toHaveBeenCalled();
    });
  });

  describe('数据渲染验证', () => {
    it('不同技术值正确显示', () => {
      render(<GameHUD {...baseProps} techValue={999} />);
      expect(screen.getByText('999')).toBeInTheDocument();
    });

    it('不同金币数正确显示', () => {
      render(<GameHUD {...baseProps} gold={1234} />);
      expect(screen.getByText('1234')).toBeInTheDocument();
    });

    it('不同回合数正确显示', () => {
      render(<GameHUD {...baseProps} turnNumber={10} />);
      expect(screen.getByText(/第 10 回合/)).toBeInTheDocument();
    });

    it('不同层级名正确显示', () => {
      render(<GameHUD {...baseProps} layerName="盘丝洞" />);
      expect(screen.getByText('盘丝洞')).toBeInTheDocument();
    });
  });
});
