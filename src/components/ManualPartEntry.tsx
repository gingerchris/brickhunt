import { useState } from 'react';
import { getPartByNumber } from '../services/rebrickable';
import { addItemToBrickList } from '../services/storage';
import { Part, Color } from '../types';

interface ManualPartEntryProps {
  listId: string;
  onClose: () => void;
}

export function ManualPartEntry({ listId, onClose }: ManualPartEntryProps) {
  const [partNum, setPartNum] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [part, setPart] = useState<Part | null>(null);

  const defaultColor: Color = {
    id: 0,
    name: 'Unknown',
    rgb: '000000',
    is_trans: false,
  };

  const handleSearch = async () => {
    if (!partNum.trim()) return;

    setIsLoading(true);
    try {
      const result = await getPartByNumber(partNum.trim());
      setPart(result);
    } catch (err) {
      console.error('Error fetching part:', err);
      alert('Part not found. Please check the part number and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    if (!part) return;

    addItemToBrickList(listId, {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      part,
      color: defaultColor,
      quantity,
      found: 0,
    });

    setPartNum('');
    setQuantity(1);
    setPart(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manual Part Entry</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="manual-entry-form">
          <div className="form-group">
            <label htmlFor="part-number">LEGO Part Number</label>
            <div className="input-with-button">
              <input
                id="part-number"
                type="text"
                value={partNum}
                onChange={(e) => setPartNum(e.target.value)}
                placeholder="e.g., 3001"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {part && (
            <>
              <div className="part-preview-card">
                {part.part_img_url ? (
                  <img src={part.part_img_url} alt={part.name} />
                ) : (
                  <div className="no-image">No image available</div>
                )}
                <div className="part-details">
                  <h3>{part.name}</h3>
                  <p>Part #{part.part_num}</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity Missing</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="modal-footer">
                <button onClick={onClose} className="secondary-btn">Cancel</button>
                <button onClick={handleAdd} className="primary-btn">Add to List</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
