import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { getProjectMessages, sendMessage, addMessage } from "../../Store/features/chatSlice";
import { format, isToday, isYesterday } from "date-fns";

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

  const getDateLabel = (date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM dd, yyyy");
  };

  let lastLabel = null;

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
    <div className="flex flex-col h-full bg-[#121620]">
      <div className="flex-1 overflow-y-auto px-0 pt-6 pb-2">
        {messages.map((msg) => {
          const msgDate = new Date(msg.createdAt);
          const dateLabel = getDateLabel(msgDate);
          const showDivider = dateLabel !== lastLabel;
          if (showDivider) lastLabel = dateLabel;

          return (
            <React.Fragment key={msg._id}>
              {showDivider && (
                <div className="flex justify-center my-4">
                  <span className="bg-[#22313c] text-gray-300 text-xs px-4 py-1 rounded-full font-semibold tracking-wide shadow-sm">
                    {dateLabel.toUpperCase()}
                  </span>
                </div>
              )}
              <div className={`flex w-full mb-2 ${msg.sender._id === user._id ? "justify-end" : "justify-start"}`}>
                {msg.sender._id !== user._id && (
                  <div className="mr-2 flex items-end">
                    <div className="w-8 h-8 rounded-full bg-[#22313c] flex items-center justify-center text-white font-bold text-lg">
                      {msg.sender.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                <div className={`max-w-[70%] rounded-xl px-4 py-2 ${msg.sender._id === user._id ? "bg-[#22313c] text-white" : "bg-[#1c2331] text-white"} shadow-sm relative`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.sender._id !== user._id && (
                      <span className="text-xs font-medium text-green-400">{msg.sender.username}</span>
                    )}
                    <span className="text-[10px] text-gray-400 font-mono">
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm break-words">{msg.content}</p>
                  {msg.sender._id === user._id && (
                    <div className="flex justify-end mt-1">
                      <span className="text-[10px] text-gray-400">Delivered</span>
                    </div>
                  )}
                </div>
                {msg.sender._id === user._id && (
                  <div className="ml-2 flex items-end">
                    <div className="w-8 h-8 rounded-full bg-[#f25c5c] flex items-center justify-center text-white font-bold text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="px-4 pb-6 pt-2">
        <div className="flex items-center bg-[#1c2331] rounded-2xl px-4 py-2 gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-2"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-1 rounded-xl ml-2 font-semibold hover:bg-green-700 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
