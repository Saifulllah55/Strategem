import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const Card = ({ card, onEdit, onDelete, isOwner }) => (
  <div className="bg-[#2c323f] rounded-lg p-4 hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-medium text-white">{card.title}</h3>
      {isOwner && (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(card)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(card._id)}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{card.description}</p>
    {card.tags && card.tags.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {card.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs rounded-full bg-[#3a404e] text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

const CardTable = ({ projectId }) => {
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.projects.byId[projectId]);
  const isOwner = project?.owner === user?._id;

  const handleAddCard = () => {
    if (!newCard.title.trim()) return;

    const card = {
      _id: Math.random().toString(36).substr(2, 9),
      ...newCard,
      createdAt: new Date().toISOString(),
      createdBy: user._id
    };

    setCards(prev => [...prev, card]);
    setNewCard({ title: '', description: '', tags: [] });
    setIsModalOpen(false);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setNewCard({
      title: card.title,
      description: card.description,
      tags: card.tags || []
    });
    setIsModalOpen(true);
  };

  const handleUpdateCard = () => {
    if (!editingCard || !newCard.title.trim()) return;

    setCards(prev => prev.map(card => 
      card._id === editingCard._id
        ? { ...card, ...newCard, updatedAt: new Date().toISOString() }
        : card
    ));

    setEditingCard(null);
    setNewCard({ title: '', description: '', tags: [] });
    setIsModalOpen(false);
  };

  const handleDeleteCard = (cardId) => {
    setCards(prev => prev.filter(card => card._id !== cardId));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    setNewCard(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()]
    }));
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewCard(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Card Table</h2>
          <button
            onClick={() => {
              setEditingCard(null);
              setNewCard({ title: '', description: '', tags: [] });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Add New Card
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => (
          <Card
            key={card._id}
            card={card}
            onEdit={handleEditCard}
            onDelete={handleDeleteCard}
            isOwner={isOwner}
          />
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No cards added yet. {isOwner && "Click 'Add New Card' to get started."}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#1c2331] rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-4">
              {editingCard ? 'Edit Card' : 'Add New Card'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newCard.title}
                  onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#2c323f] border border-gray-600 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="Enter card title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={newCard.description}
                  onChange={(e) => setNewCard(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#2c323f] border border-gray-600 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  rows="3"
                  placeholder="Enter card description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-3 py-2 bg-[#2c323f] border border-gray-600 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="Add a tag"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newCard.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-sm rounded-full bg-[#3a404e] text-gray-300 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCard(null);
                  setNewCard({ title: '', description: '', tags: [] });
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingCard ? handleUpdateCard : handleAddCard}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                {editingCard ? 'Update Card' : 'Add Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardTable;
