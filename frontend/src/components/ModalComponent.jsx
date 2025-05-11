import React from 'react';
import MessageBoard from './tools/MessageBoard';
import Tasks from './tools/Tasks';
import DocsFiles from './tools/DocsFiles';
import Chat from './tools/Chat';
import Schedule from './tools/Schedule';
import CardTable from './tools/CardTable';

const ModalComponent = ({ title, closeModal,projectId }) => {
  const renderContent = () => {
    console.log(title);
    switch (title) {
      case 'Message Board':
        return <MessageBoard />;
      case 'To-dos':
        return <Tasks projectId={projectId} />;
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
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-[#121620] rounded-xl w-[80%] h-[80%] overflow-auto p-6 relative shadow-2xl shadow-black/40"
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
