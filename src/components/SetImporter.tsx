import { useState } from 'react';
import { QRScanner } from './QRScanner';
import { extractSetNumberFromQR, getSetByNumber, getSetParts } from '../services/rebrickable';
import { getBrickList, saveBrickList } from '../services/storage';
import { SetPart } from '../types';

interface SetImporterProps {
  listId: string;
  onClose: () => void;
}

export function SetImporter({ listId, onClose }: SetImporterProps) {
  const [inputMethod, setInputMethod] = useState<'choice' | 'qr' | 'manual'>('choice');
  const [isLoading, setIsLoading] = useState(false);
  const [setParts, setSetParts] = useState<SetPart[]>([]);
  const [selectedParts, setSelectedParts] = useState<Set<number>>(new Set());
  const [setName, setSetName] = useState('');
  const [manualSetNum, setManualSetNum] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadSetData = async (setNum: string) => {
    setIsLoading(true);
    setInputMethod('manual'); // Move past input phase

    try {
      const setInfo = await getSetByNumber(setNum);
      const parts = await getSetParts(setNum);

      setSetName(setInfo.name);
      setSetParts(parts);
      setSelectedParts(new Set(parts.map(p => p.id)));
    } catch (err) {
      console.error('Error loading set:', err);
      alert('Failed to load set information. Please check the set number and try again.');
      setInputMethod('choice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async (qrData: string) => {
    const setNum = extractSetNumberFromQR(qrData);

    if (!setNum) {
      alert('Could not extract set number from QR code. Please try manual entry.');
      setInputMethod('choice');
      return;
    }

    await loadSetData(setNum);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSetNum.trim()) return;

    await loadSetData(manualSetNum.trim());
  };

  const togglePart = (partId: number) => {
    const newSelected = new Set(selectedParts);
    if (newSelected.has(partId)) {
      newSelected.delete(partId);
    } else {
      newSelected.add(partId);
    }
    setSelectedParts(newSelected);
  };

  const handleImport = () => {
    const list = getBrickList(listId);
    if (!list) return;

    setParts.forEach(setPart => {
      if (selectedParts.has(setPart.id)) {
        const existingItem = list.items.find(
          item =>
            item.part.part_num === setPart.part.part_num &&
            item.color.id === setPart.color.id
        );

        if (existingItem) {
          existingItem.quantity += setPart.quantity;
        } else {
          list.items.push({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            part: setPart.part,
            color: setPart.color,
            quantity: setPart.quantity,
            found: 0,
          });
        }
      }
    });

    saveBrickList(list);
    onClose();
  };

  if (inputMethod === 'choice') {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Import LEGO Set</h2>
            <button type="button" onClick={onClose} className="close-btn">✕</button>
          </div>

          <div className="add-method-options">
            <button type="button" className="method-option" onClick={() => setInputMethod('qr')}>
              <span className="method-icon">📷</span>
              <h3>Scan QR Code</h3>
              <p>Scan the QR code on the back of a LEGO set box</p>
            </button>

            <button type="button" className="method-option" onClick={() => setInputMethod('manual')}>
              <span className="method-icon">⌨️</span>
              <h3>Enter Set Number</h3>
              <p>Manually type in the LEGO set number (e.g., 75192-1)</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (inputMethod === 'qr') {
    return (
      <QRScanner
        onScan={handleQRScan}
        onError={(err) => {
          console.error('Scanner error:', err);
          alert('Scanner error: ' + err);
        }}
        onClose={() => setInputMethod('choice')}
      />
    );
  }

  if (inputMethod === 'manual' && setParts.length === 0) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Enter Set Number</h2>
            <button type="button" onClick={() => setInputMethod('choice')} className="close-btn">←</button>
          </div>

          <form onSubmit={handleManualSubmit} className="manual-entry-form">
            <div className="form-group">
              <label htmlFor="set-number">LEGO Set Number</label>
              <input
                id="set-number"
                type="text"
                value={manualSetNum}
                onChange={(e) => setManualSetNum(e.target.value)}
                placeholder="e.g., 75192-1 or 10497"
                disabled={isLoading}
              />
              <p className="help-text">
                Enter the set number found on the box (format: XXXXX-X or XXXXX)
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setInputMethod('choice')} className="secondary-btn">
                Back
              </button>
              <button type="submit" className="primary-btn" disabled={!manualSetNum.trim() || isLoading}>
                {isLoading ? 'Loading...' : 'Load Set'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading set information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter parts based on search query
  const filteredParts = setParts.filter(part => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      part.part.name.toLowerCase().includes(query) ||
      part.part.part_num.toLowerCase().includes(query) ||
      part.color.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import from {setName}</h2>
          <button type="button" onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="import-controls">
          <p>Select which bricks are missing from your set ({setParts.length} total parts):</p>

          <div className="search-and-select">
            <input
              type="text"
              placeholder="Search parts by name, number, or color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="parts-search-input"
            />

            <div className="selection-buttons">
              <button type="button" onClick={() => setSelectedParts(new Set(setParts.map(p => p.id)))}>
                Select All
              </button>
              <button type="button" onClick={() => setSelectedParts(new Set())}>
                Deselect All
              </button>
            </div>
          </div>

          {searchQuery && (
            <p className="search-results-text">
              Showing {filteredParts.length} of {setParts.length} parts
            </p>
          )}
        </div>

        <div className="parts-selection-list">
          {filteredParts.length === 0 ? (
            <div className="empty-state">
              <p>No parts match your search.</p>
            </div>
          ) : (
            filteredParts.map(setPart => (
              <label key={setPart.id} className="part-selection-item">
                <input
                  type="checkbox"
                  checked={selectedParts.has(setPart.id)}
                  onChange={() => togglePart(setPart.id)}
                />
                <div className="part-preview">
                  {setPart.part.part_img_url ? (
                    <img src={setPart.part.part_img_url} alt={setPart.part.name} />
                  ) : (
                    <div className="no-image">No image</div>
                  )}
                </div>
                <div className="part-info">
                  <strong>{setPart.part.name}</strong>
                  <span className="part-meta">
                    {setPart.part.part_num} - {setPart.color.name} (×{setPart.quantity})
                  </span>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="secondary-btn">Cancel</button>
          <button onClick={handleImport} className="primary-btn">
            Import {selectedParts.size} Parts
          </button>
        </div>
      </div>
    </div>
  );
}
