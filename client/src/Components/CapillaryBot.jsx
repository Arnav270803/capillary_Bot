import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CapillaryBot = () => {
  //initial bot welcome message - hardcoding this so users see something friendly right away
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm your Capillary Bot, here to help with CapillaryTech documentation. Whether it's API authentication, customer management, or InTouch insights, just ask!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);// spinner flag
  const messagesEndRef = useRef(null);// ref to a dummy div at chat bottom
  const textareaRef = useRef(null);//hook into resize logic without DOM queries

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // Auto-resize text-area based on content increases or decreases 
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 100;
      textarea.style.height = textarea.scrollHeight > maxHeight 
        ? `${maxHeight}px` 
        : `${textarea.scrollHeight}px`;
    }
  }, [input]);

  // BACKEND LOGIC - Handle sending messages
  // called on button click or Enter
  const handleSend = async () => {
    if (!input.trim()) return;

    // build user message object
    const userMessage = { 
      role: 'user', 
      content: input.trim(), 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    const tempInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // hit the backend - VITE_API_URL
      const response = await axios.post(import.meta.env.VITE_API_URL, { message: tempInput });
      if (response.data.success) {
        const botMessage = { 
          role: 'assistant', 
          content: response.data.answer, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        // building bot reply - mirror user structure
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // backend said no-go
        throw new Error(response.data.message || 'Unknown error');
      }
      // catch block for error handling 
    } catch (error) {
      console.error('API Error:', error);
      toast.error(error.response?.data?.message || 'Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // keyboard handler - Enter sends (no Shift for newline), prevents default form submit
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {// shift+enter for new line if needed
      e.preventDefault();// stop browser default (newline or submit)
      handleSend();// trigger send
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">CB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Capillary Bot</h1>
              <p className="text-sm text-gray-500">CapillaryTech Documentation Assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white rounded-tr-md shadow-md' 
                : 'bg-white text-gray-800 rounded-tl-md shadow-md border border-gray-200'
            }`}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown 
                  components={{
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 ml-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 ml-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      if (inline && !match) {
                        return <span {...props}>{children}</span>;
                      }
                      return !inline ? (
                        <pre className={`rounded-lg p-3 mt-2 mb-2 overflow-x-auto text-sm ${
                          msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-100'
                        }`}>
                          <code className={className || ''} {...props}>{children}</code>
                        </pre>
                      ) : (
                        <code className={`px-1.5 py-0.5 rounded text-sm ${
                          msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                        }`} {...props}>
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className={`border-l-4 pl-3 italic my-2 ${
                        msg.role === 'user' ? 'border-blue-300' : 'border-blue-500 bg-blue-50'
                      } p-2 rounded-r`}>
                        {children}
                      </blockquote>
                    )
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              <div className={`text-xs mt-2 ${
                msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-md shadow-md">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-500 text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-end space-x-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about APIs, authentication, customer management..."
            className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none min-h-[48px] placeholder-gray-400 disabled:opacity-50"
            disabled={isLoading}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white px-5 py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[48px] h-[48px] flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme="light" 
      />
    </div>
  );
};

export default CapillaryBot;