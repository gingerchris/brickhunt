import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BrickList as BrickListType } from '../types';
import { getBrickList, updateItemFound, removeItemFromBrickList } from '../services/storage';
import { BrickListItem } from './BrickListItem';
import { AddBrickModal } from './AddBrickModal';

export function BrickListView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<BrickListType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'missing' | 'found'>('all');

  useEffect(() => {
    if (id) {
      loadList();
    }
  }, [id]);

  const loadList = () => {
    if (id) {
      const loaded = getBrickList(id);
      setList(loaded);
      if (!loaded) {
        navigate('/');
      }
    }
  };

  const handleFoundChange = (itemId: string, found: number) => {
    if (id) {
      updateItemFound(id, itemId, found);
      loadList();
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (id && confirm('Remove this brick from the list?')) {
      removeItemFromBrickList(id, itemId);
      loadList();
    }
  };

  if (!list) {
    return <div className="loading">Loading...</div>;
  }

  const filteredItems = list.items.filter(item => {
    if (filter === 'missing') return item.found < item.quantity;
    if (filter === 'found') return item.found >= item.quantity;
    return true;
  });

  const totalBricks = list.items.reduce((sum, item) => sum + item.quantity, 0);
  const foundBricks = list.items.reduce((sum, item) => sum + item.found, 0);
  const percentComplete = totalBricks > 0 ? (foundBricks / totalBricks) * 100 : 0;

  return (
    <div className="brick-list-view">
      <div className="list-header">
        <button onClick={() => navigate('/')} className="back-btn">← Back</button>
        <div className="list-info">
          <h1>{list.name}</h1>
          {list.setNum && <p className="set-number">Set #{list.setNum}</p>}
        </div>
      </div>

      <div className="list-stats">
        <div className="stat">
          <span className="stat-value">{foundBricks} / {totalBricks}</span>
          <span className="stat-label">Bricks Found</span>
        </div>
        <div className="stat">
          <span className="stat-value">{Math.round(percentComplete)}%</span>
          <span className="stat-label">Complete</span>
        </div>
        <div className="stat">
          <span className="stat-value">{list.items.length}</span>
          <span className="stat-label">Unique Parts</span>
        </div>
      </div>

      <div className="list-controls">
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({list.items.length})
          </button>
          <button
            className={filter === 'missing' ? 'active' : ''}
            onClick={() => setFilter('missing')}
          >
            Missing ({list.items.filter(i => i.found < i.quantity).length})
          </button>
          <button
            className={filter === 'found' ? 'active' : ''}
            onClick={() => setFilter('found')}
          >
            Found ({list.items.filter(i => i.found >= i.quantity).length})
          </button>
        </div>

        <button onClick={() => setShowAddModal(true)} className="add-brick-btn">
          + Add Brick
        </button>
      </div>

      <div className="brick-items">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>No bricks in this list yet.</p>
            <button onClick={() => setShowAddModal(true)} className="primary-btn">
              Add Your First Brick
            </button>
          </div>
        ) : (
          filteredItems.map(item => (
            <BrickListItem
              key={item.id}
              item={item}
              onFoundChange={(found) => handleFoundChange(item.id, found)}
              onRemove={() => handleRemoveItem(item.id)}
            />
          ))
        )}
      </div>

      {showAddModal && (
        <AddBrickModal
          listId={list.id}
          onClose={() => {
            setShowAddModal(false);
            loadList();
          }}
        />
      )}
    </div>
  );
}
