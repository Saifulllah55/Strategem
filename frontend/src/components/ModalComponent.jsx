import React from 'react';
import MessageBoard from './tools/MessageBoard';
import Tasks from './tools/Tasks';
import DocsFiles from './tools/DocsFiles';
import Chat from './tools/Chat';
import Schedule from './tools/Schedule';
import CardTable from './tools/CardTable';

const ModalComponent = ({ title, closeModal,projectId }) => {
  const renderContent = () => {
    switch (title) {
      case 'Message Board':
        return <Chat/>;
      case 'To-Dos':
        return <Tasks />;
      case 'Docs & Files':
        return <DocsFiles />;
      case 'Chat':
        return <Chat />;
      case 'Schedule':
        return <Schedule />;
      case 'Card Table':
        return <CardTable />;
      default:
        return <p className="text-gray-400">Tool not found.</p>;
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === 'modal-overlay') {
      closeModal();
    }
  };

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 z-50 bg-[#121620] flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-[#1c2331] rounded-xl shadow-lg w-[80%] h-[80%] overflow-auto p-6 relative"
      >
        <button
          className="absolute top-3 right-4 text-white text-xl hover:text-red-400"
          onClick={closeModal}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default ModalComponent;
