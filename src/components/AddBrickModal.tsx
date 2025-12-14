import { useState } from 'react';
import { OCRScanner } from './OCRScanner';
import { ManualPartEntry } from './ManualPartEntry';
import { SetImporter } from './SetImporter';
import { PartNumberSelector } from './PartNumberSelector';
import { AddBrickMethod } from '../types';

interface AddBrickModalProps {
  listId: string;
  onClose: () => void;
}

export function AddBrickModal({ listId, onClose }: AddBrickModalProps) {
  const [method, setMethod] = useState<AddBrickMethod | null>(null);
  const [detectedParts, setDetectedParts] = useState<string[]>([]);

  if (method === 'qr') {
    return (
      <SetImporter
        listId={listId}
        onClose={() => {
          setMethod(null);
          onClose();
        }}
      />
    );
  }

  if (detectedParts.length > 0) {
    return (
      <PartNumberSelector
        partNumbers={detectedParts}
        listId={listId}
        onClose={() => {
          setDetectedParts([]);
          setMethod(null);
          onClose();
        }}
      />
    );
  }

  if (method === 'ocr') {
    return (
      <OCRScanner
        onPartsDetected={(partNumbers) => {
          setDetectedParts(partNumbers);
        }}
        onClose={() => setMethod(null)}
      />
    );
  }

  if (method === 'manual') {
    return (
      <ManualPartEntry
        listId={listId}
        onClose={() => {
          setMethod(null);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Bricks to List</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="add-method-options">
          <button className="method-option" onClick={() => setMethod('qr')}>
            <span className="method-icon">📷</span>
            <h3>Scan QR Code</h3>
            <p>Scan the QR code on a LEGO set box to import all bricks</p>
          </button>

          <button className="method-option" onClick={() => setMethod('ocr')}>
            <span className="method-icon">📸</span>
            <h3>Photo of Manual</h3>
            <p>Take a picture of part numbers in the instruction manual</p>
          </button>

          <button className="method-option" onClick={() => setMethod('manual')}>
            <span className="method-icon">⌨️</span>
            <h3>Manual Entry</h3>
            <p>Enter LEGO part numbers manually</p>
          </button>
        </div>
      </div>
    </div>
  );
}
