import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { getProjectMessages, sendMessage, addMessage } from "../../Store/features/chatSlice";
import { format } from "date-fns";

const Chat = () => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("joinProject", projectId);

    socketRef.current.on("newMessage", (message) => {
      if (message.sender._id !== user._id) {
        dispatch(addMessage(message));
      }
    });

    dispatch(getProjectMessages(projectId));

    return () => {
      socketRef.current.disconnect();
    };
  }, [dispatch, projectId, user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      dispatch(sendMessage({ projectId, content: message }));
      setMessage("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-[#121620] rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.sender._id === user._id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender._id === user._id
                  ? "bg-green-600 text-white"
                  : "bg-[#1c2331] text-gray-200"
              }`}
            >
              {msg.sender._id !== user._id && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-green-400">
                    {msg.sender.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </span>
                </div>
              )}
              <p className="text-sm">{msg.content}</p>
              {msg.sender._id === user._id && (
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-300">
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-[#2c323f]">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-[#1c2331] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 