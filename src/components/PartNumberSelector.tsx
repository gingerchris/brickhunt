import { useState, useEffect } from 'react';
import { getPartByNumber } from '../services/rebrickable';
import { addItemToBrickList } from '../services/storage';
import { Part, Color } from '../types';

interface PartNumberSelectorProps {
  partNumbers: string[];
  listId: string;
  onClose: () => void;
}

interface PartOption {
  partNumber: string;
  part: Part | null;
  loading: boolean;
  error: boolean;
  selected: boolean;
}

export function PartNumberSelector({ partNumbers, listId, onClose }: PartNumberSelectorProps) {
  const [parts, setParts] = useState<PartOption[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const defaultColor: Color = {
    id: 0,
    name: 'Unknown',
    rgb: '000000',
    is_trans: false,
  };

  useEffect(() => {
    const initialParts = partNumbers.map(num => ({
      partNumber: num,
      part: null,
      loading: true,
      error: false,
      selected: true,
    }));
    setParts(initialParts);

    const initialQuantities: { [key: string]: number } = {};
    partNumbers.forEach(num => {
      initialQuantities[num] = 1;
    });
    setQuantities(initialQuantities);

    partNumbers.forEach((partNum, index) => {
      getPartByNumber(partNum)
        .then(part => {
          setParts(prev => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              part,
              loading: false,
            };
            return updated;
          });
        })
        .catch(() => {
          setParts(prev => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              loading: false,
              error: true,
            };
            return updated;
          });
        });
    });
  }, [partNumbers]);

  const toggleSelection = (index: number) => {
    setParts(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selected: !updated[index].selected,
      };
      return updated;
    });
  };

  const updateQuantity = (partNumber: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [partNumber]: Math.max(1, quantity),
    }));
  };

  const handleAddSelected = () => {
    parts.forEach(partOption => {
      if (partOption.selected && partOption.part) {
        addItemToBrickList(listId, {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          part: partOption.part,
          color: defaultColor,
          quantity: quantities[partOption.partNumber] || 1,
          found: 0,
        });
      }
    });
    onClose();
  };

  const selectedCount = parts.filter(p => p.selected && p.part).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Parts to Add</h2>
          <button type="button" onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="import-controls">
          <p>Found {parts.length} part number(s). Select which ones to add:</p>
        </div>

        <div className="parts-selection-list">
          {parts.map((partOption, index) => (
            <div key={partOption.partNumber} className="part-selection-item">
              <input
                type="checkbox"
                checked={partOption.selected}
                onChange={() => toggleSelection(index)}
                disabled={partOption.loading || partOption.error}
              />

              <div className="part-preview">
                {partOption.loading && <div className="spinner-small"></div>}
                {partOption.error && <div className="error-icon">✗</div>}
                {partOption.part?.part_img_url ? (
                  <img src={partOption.part.part_img_url} alt={partOption.part.name} />
                ) : (
                  !partOption.loading && !partOption.error && <div className="no-image">No image</div>
                )}
              </div>

              <div className="part-info">
                {partOption.loading && <span>Loading {partOption.partNumber}...</span>}
                {partOption.error && (
                  <>
                    <strong>{partOption.partNumber}</strong>
                    <span className="error-text">Part not found</span>
                  </>
                )}
                {partOption.part && (
                  <>
                    <strong>{partOption.part.name}</strong>
                    <span className="part-meta">Part #{partOption.part.part_num}</span>
                  </>
                )}
              </div>

              {partOption.part && (
                <div className="quantity-input">
                  <label htmlFor={`qty-${partOption.partNumber}`}>Qty:</label>
                  <input
                    id={`qty-${partOption.partNumber}`}
                    type="number"
                    min="1"
                    value={quantities[partOption.partNumber] || 1}
                    onChange={(e) => updateQuantity(partOption.partNumber, parseInt(e.target.value) || 1)}
                    className="small-number-input"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="secondary-btn">Cancel</button>
          <button
            type="button"
            onClick={handleAddSelected}
            className="primary-btn"
            disabled={selectedCount === 0}
          >
            Add {selectedCount} Part{selectedCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
