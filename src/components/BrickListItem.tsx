import { BrickListItem as BrickListItemType } from '../types';

interface BrickListItemProps {
  item: BrickListItemType;
  onFoundChange: (found: number) => void;
  onRemove: () => void;
}

export function BrickListItem({ item, onFoundChange, onRemove }: BrickListItemProps) {
  const percentFound = (item.found / item.quantity) * 100;
  const isComplete = item.found >= item.quantity;

  const handleIncrement = () => {
    if (item.found < item.quantity) {
      onFoundChange(item.found + 1);
    }
  };

  const handleDecrement = () => {
    if (item.found > 0) {
      onFoundChange(item.found - 1);
    }
  };

  return (
    <div className={`brick-item ${isComplete ? 'complete' : ''}`}>
      <div className="brick-image">
        {item.part.part_img_url ? (
          <img src={item.part.part_img_url} alt={item.part.name} />
        ) : (
          <div className="no-image">No image</div>
        )}
      </div>

      <div className="brick-details">
        <h4>{item.part.name}</h4>
        <p className="part-number">Part #{item.part.part_num}</p>
        <p className="color-info" style={{ color: `#${item.color.rgb}` }}>
          {item.color.name}
        </p>
      </div>

      <div className="brick-progress">
        <div className="counter-controls">
          <button onClick={handleDecrement} disabled={item.found === 0}>-</button>
          <span className="count">
            {item.found} / {item.quantity}
          </span>
          <button onClick={handleIncrement} disabled={item.found >= item.quantity}>+</button>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${percentFound}%` }}
          ></div>
        </div>

        {isComplete && <span className="complete-badge">✓ Complete</span>}
      </div>

      <button onClick={onRemove} className="remove-btn" title="Remove from list">
        🗑
      </button>
    </div>
  );
}
