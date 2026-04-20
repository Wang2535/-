import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PathSelector } from '../PathSelector';

describe('PathSelector', () => {
  const mockOnSelect = vi.fn();
  const defaultProps = {
    availablePaths: [
      { targetCellId: 'cell-A1', totalSteps: 3 },
      { targetCellId: 'cell-B2', totalSteps: 5 },
      { targetCellId: 'cell-C3', totalSteps: 2 },
    ],
    onSelect: mockOnSelect,
    visible: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when availablePaths is empty array', () => {
    const { container } = render(
      <PathSelector availablePaths={[]} onSelect={mockOnSelect} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders 3 buttons when availablePaths has 3 paths', () => {
    render(<PathSelector {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('displays correct path numbers and target cell IDs', () => {
    render(<PathSelector {...defaultProps} />);

    expect(screen.getByText('路径1')).toBeInTheDocument();
    expect(screen.getByText('路径2')).toBeInTheDocument();
    expect(screen.getByText('路径3')).toBeInTheDocument();

    expect(screen.getByText(/→ cell-A1/)).toBeInTheDocument();
    expect(screen.getByText(/→ cell-B2/)).toBeInTheDocument();
    expect(screen.getByText(/→ cell-C3/)).toBeInTheDocument();
  });

  it('calls onSelect(0) when first button is clicked', () => {
    render(<PathSelector {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockOnSelect).toHaveBeenCalledWith(0);
    expect(mockOnSelect).toHaveBeenCalledOnce();
  });

  it('calls onSelect(1) when second button is clicked', () => {
    render(<PathSelector {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(mockOnSelect).toHaveBeenCalledWith(1);
    expect(mockOnSelect).toHaveBeenCalledOnce();
  });

  it('calls onSelect(2) when third button is clicked', () => {
    render(<PathSelector {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]);
    expect(mockOnSelect).toHaveBeenCalledWith(2);
    expect(mockOnSelect).toHaveBeenCalledOnce();
  });

  it('does not render when visible is false', () => {
    const { container } = render(
      <PathSelector {...defaultProps} visible={false} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('displays step count when totalSteps is provided', () => {
    render(<PathSelector {...defaultProps} />);
    expect(screen.getByText('3步')).toBeInTheDocument();
    expect(screen.getByText('5步')).toBeInTheDocument();
    expect(screen.getByText('2步')).toBeInTheDocument();
  });

  it('does not display step count when totalSteps is undefined', () => {
    const pathWithoutSteps = [{ targetCellId: 'cell-X' }];
    render(
      <PathSelector
        availablePaths={pathWithoutSteps}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.queryByText(/\d+步/)).not.toBeInTheDocument();
  });
});
