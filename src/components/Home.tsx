import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrickList } from '../types';
import { getAllBrickLists, createBrickList, deleteBrickList } from '../services/storage';

export function Home() {
  const navigate = useNavigate();
  const [lists, setLists] = useState<BrickList[]>([]);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    const allLists = getAllBrickLists();
    setLists(allLists.sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;

    const newList = createBrickList(newListName.trim());
    setNewListName('');
    setShowNewListModal(false);
    navigate(`/list/${newList.id}`);
  };

  const handleDeleteList = (id: string, name: string) => {
    if (confirm(`Delete list "${name}"? This cannot be undone.`)) {
      deleteBrickList(id);
      loadLists();
    }
  };

  const getListProgress = (list: BrickList) => {
    const total = list.items.reduce((sum, item) => sum + item.quantity, 0);
    const found = list.items.reduce((sum, item) => sum + item.found, 0);
    return total > 0 ? Math.round((found / total) * 100) : 0;
  };

  return (
    <div className="home">
      <header className="app-header">
        <h1>🧱 BrickHunt</h1>
        <p>Find your missing LEGO bricks</p>
      </header>

      <div className="home-content">
        <div className="lists-header">
          <h2>Your Brick Lists</h2>
          <button onClick={() => setShowNewListModal(true)} className="primary-btn">
            + New List
          </button>
        </div>

        {lists.length === 0 ? (
          <div className="empty-state">
            <p>No brick lists yet. Create your first one!</p>
            <button onClick={() => setShowNewListModal(true)} className="primary-btn">
              Create Your First List
            </button>
          </div>
        ) : (
          <div className="lists-grid">
            {lists.map(list => {
              const progress = getListProgress(list);
              const totalParts = list.items.reduce((sum, item) => sum + item.quantity, 0);
              const foundParts = list.items.reduce((sum, item) => sum + item.found, 0);

              return (
                <div
                  key={list.id}
                  className="list-card"
                  onClick={() => navigate(`/list/${list.id}`)}
                >
                  <div className="list-card-header">
                    <h3>{list.name}</h3>
                    {list.setNum && (
                      <span className="set-badge">Set #{list.setNum}</span>
                    )}
                  </div>

                  <div className="list-card-stats">
                    <div className="stat">
                      <span className="stat-label">Parts</span>
                      <span className="stat-value">{list.items.length}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Bricks</span>
                      <span className="stat-value">{totalParts}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Found</span>
                      <span className="stat-value">{foundParts}</span>
                    </div>
                  </div>

                  <div className="list-card-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{progress}% Complete</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id, list.name);
                    }}
                    className="delete-list-btn"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNewListModal && (
        <div className="modal-overlay" onClick={() => setShowNewListModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New List</h2>
              <button onClick={() => setShowNewListModal(false)} className="close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="list-name">List Name</label>
                <input
                  id="list-name"
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Millennium Falcon Missing Pieces"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowNewListModal(false)} className="secondary-btn">
                Cancel
              </button>
              <button onClick={handleCreateList} className="primary-btn">
                Create List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
