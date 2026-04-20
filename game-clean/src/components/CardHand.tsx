/**
 * 手牌组件 - 简化版
 */

interface CardHandProps {
  cards: string[];
  selectedIndex: number | null;
  onCardSelect: (index: number) => void;
  disabled?: boolean;
}

export function CardHand({ cards, selectedIndex, onCardSelect, disabled = false }: CardHandProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {cards.map((cardId, index) => (
        <button
          key={index}
          onClick={() => !disabled && onCardSelect(index)}
          disabled={disabled}
          className={`
            p-3 border rounded min-w-[80px] text-center transition-all
            ${selectedIndex === index 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="text-xs font-mono">{cardId}</div>
        </button>
      ))}
    </div>
  );
}

export default CardHand;
