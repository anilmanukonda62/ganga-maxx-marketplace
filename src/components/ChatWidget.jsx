import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      content: "Hi! 👋 I'm Ganga, your AI assistant for Ganga Maxx Marketplace. Ask me about our products, prices, availability, or anything else! How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);
    
    // Add typing indicator
    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: typingId,
      role: 'bot',
      content: '',
      isTyping: true,
      timestamp: new Date()
    }]);
    
    setIsLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://ganga-maxx-marketplace-ct25.onrender.com/api');
      const response = await fetch(`${apiUrl}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistory.slice(-8)
        })
      });
      
      const data = await response.json();
      
      setMessages(prev => prev
        .filter(m => m.id !== typingId)
        .concat({
          id: Date.now() + 2,
          role: 'bot',
          content: data.message,
          timestamp: new Date()
        })
      );
      
      setConversationHistory(prev => [...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: data.message }
      ]);
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev
        .filter(m => m.id !== typingId)
        .concat({
          id: Date.now() + 2,
          role: 'bot',
          content: "Sorry, I'm having trouble right now. Please call us at +91 9110306090!",
          timestamp: new Date()
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Bubble Button */}
      <AnimatePresence>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            zIndex: 9998,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#1a7a4c',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(26, 122, 76, 0.4)'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {isOpen ? <X size={24} color="white" /> : <MessageCircle size={24} color="white" />}
          {/* AI badge */}
          {!isOpen && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#f59e0b',
              color: 'white',
              fontSize: '9px',
              fontWeight: 'bold',
              padding: '2px 5px',
              borderRadius: '10px'
            }}>AI</span>
          )}
        </motion.button>
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: '160px',
              right: '24px',
              zIndex: 9997,
              width: '360px',
              height: '500px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column'
            }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
          >
            {/* Header */}
            <div style={{
              backgroundColor: '#1a7a4c',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={20} color="white" />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>Ganga AI Assistant</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>🟢 Online · Powered by AI</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }} className="bg-slate-50 dark:bg-slate-950">
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}>
                  {msg.role === 'bot' && (
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      backgroundColor: '#1a7a4c',
                      display: 'flex', alignItems: 'center', justify_content: 'center',
                      flexShrink: 0,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Bot size={14} color="white" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: msg.role === 'user' ? '#1a7a4c' : undefined,
                    color: msg.role === 'user' ? 'white' : undefined,
                    fontSize: '13px',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}
                  className={msg.role === 'user' ? '' : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100'}
                  >
                    {msg.isTyping ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
                        {[0,1,2].map(i => (
                          <motion.div key={i}
                            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1a7a4c' }}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about products, prices..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '24px',
                  border: '1px solid',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: 'transparent'
                }}
                className="border-slate-200 dark:border-slate-800 dark:text-white"
              />
              <motion.button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  backgroundColor: inputValue.trim() && !isLoading ? '#1a7a4c' : undefined,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                className={inputValue.trim() && !isLoading ? '' : 'bg-slate-100 dark:bg-slate-800'}
              >
                <Send size={16} color={inputValue.trim() && !isLoading ? 'white' : '#9ca3af'} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
