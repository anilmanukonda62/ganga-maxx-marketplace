import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const formatMessage = (content) => {
  if (!content) return null;

  // Split content by paragraphs/blocks
  const blocks = content.split(/\n\s*\n/);
  
  return blocks.map((block, blockIdx) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return null;

    // Helper to render inline markdown bold (**text**)
    const renderInlineBold = (text) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} style={{ fontWeight: '700', color: '#111827' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    // Helper to render italic (*text*)
    const renderItalicAndBold = (text) => {
      const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} style={{ fontWeight: '700', color: '#111827' }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={idx} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
        }
        return part;
      });
    };

    // 1. Check if block is a list item of product recommendations (e.g. 1. **Disinfectants (Phenyl)** - ₹149\n   Ideal for...)
    if (/^\d+\.\s+\*\*/.test(trimmedBlock)) {
      const lines = trimmedBlock.split('\n');
      const firstLine = lines[0].trim();
      const restLines = lines.slice(1).map(l => l.trim()).join(' ');

      // Extract Name and Price from "1. **Product Name** - ₹Price"
      const nameMatch = firstLine.match(/^\d+\.\s+\*\*(.*?)\*\*/);
      const priceMatch = firstLine.match(/-\s*(₹?\s*\d+.*)$/);

      const productName = nameMatch ? nameMatch[1] : '';
      const productPrice = priceMatch ? priceMatch[1] : '';

      if (productName) {
        return (
          <div key={blockIdx} style={{
            backgroundColor: '#f9fafb',
            borderLeft: '4px solid #1a7a4c',
            padding: '10px 14px',
            margin: '10px 0',
            borderRadius: '0 8px 8px 0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', color: '#1a7a4c', fontSize: '13px' }}>{productName}</span>
              {productPrice && (
                <span style={{
                  backgroundColor: '#e6f4ea',
                  color: '#137333',
                  fontSize: '10.5px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>{productPrice}</span>
              )}
            </div>
            {restLines && (
              <div style={{ color: '#4b5563', fontSize: '12px', lineHeight: '1.4', marginTop: '4px' }}>
                {renderInlineBold(restLines)}
              </div>
            )}
          </div>
        );
      }
    }

    // 2. Check if block is a single product detail block (e.g. "**Product Name**\n💰 Price:...")
    if (trimmedBlock.startsWith('**') && trimmedBlock.includes('💰 Price:')) {
      const lines = trimmedBlock.split('\n').map(l => l.trim());
      const titleLine = lines[0];
      const detailLines = lines.slice(1);

      const productName = titleLine.match(/^\*\*(.*?)\*\*/)?.[1] || titleLine;

      return (
        <div key={blockIdx} style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '12px',
          margin: '10px 0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }} className="dark:bg-slate-800 dark:border-slate-700">
          <div style={{ fontWeight: 'bold', color: '#1a7a4c', fontSize: '13.5px', marginBottom: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '6px' }} className="dark:border-slate-700">
            {productName}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {detailLines.map((line, lIdx) => {
              if (line.startsWith('💰')) {
                return (
                  <div key={lIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span>💰</span>
                    <span style={{ color: '#6b7280' }}>Price:</span>
                    <span style={{ fontWeight: '600', color: '#111827' }} className="dark:text-slate-100">{line.replace('💰 Price:', '').trim()}</span>
                  </div>
                );
              }
              if (line.startsWith('📦')) {
                return (
                  <div key={lIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span>📦</span>
                    <span style={{ color: '#6b7280' }}>Variants:</span>
                    <span style={{ color: '#374151', fontWeight: '500' }} className="dark:text-slate-200">{line.replace('📦 Variants:', '').trim()}</span>
                  </div>
                );
              }
              if (line.startsWith('✅') || line.startsWith('❌') || line.startsWith('⚠️') || line.includes('Stock:')) {
                const stockText = line.replace(/^[✅❌⚠️]\s*/, '').replace('Stock:', '').trim();
                const isAvailable = stockText.toLowerCase().includes('available') || stockText.toLowerCase().includes('in stock');
                const isLimited = stockText.toLowerCase().includes('limited');
                const emoji = isAvailable ? '✅' : (isLimited ? '⚠️' : '❌');
                const badgeBg = isAvailable ? '#e6f4ea' : (isLimited ? '#fef3c7' : '#fde8e8');
                const badgeColor = isAvailable ? '#137333' : (isLimited ? '#b45309' : '#9b1c1c');

                return (
                  <div key={lIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span>{emoji}</span>
                    <span style={{ color: '#6b7280' }}>Stock:</span>
                    <span style={{
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      fontSize: '10.5px',
                      fontWeight: 'bold',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>{stockText}</span>
                  </div>
                );
              }
              if (line.startsWith('📝') || line.length > 0) {
                const descText = line.replace(/^📝\s*/, '').trim();
                return (
                  <div key={lIdx} style={{ display: 'flex', gap: '8px', fontSize: '12.5px', marginTop: '4px', borderTop: '1px dashed #f3f4f6', paddingTop: '6px' }} className="dark:border-slate-700">
                    <span>📝</span>
                    <span style={{ color: '#4b5563', fontStyle: 'italic', lineHeight: '1.4' }} className="dark:text-slate-300">{descText}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    }

    // 3. Check if block is a bulk enquiry suggestion or alert
    if (trimmedBlock.startsWith('💡') || (trimmedBlock.includes('bulk orders') && trimmedBlock.includes('special pricing'))) {
      return (
        <div key={blockIdx} style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: '8px',
          padding: '10px 12px',
          margin: '10px 0',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }} className="dark:bg-slate-900 dark:border-amber-950">
          <span style={{ fontSize: '13px' }}>💡</span>
          <span style={{ fontSize: '12px', color: '#b45309', fontStyle: 'italic', lineHeight: '1.4' }} className="dark:text-amber-300">
            {renderItalicAndBold(trimmedBlock.replace(/^💡\s*/, ''))}
          </span>
        </div>
      );
    }

    // 4. Default Paragraph block
    return (
      <p key={blockIdx} style={{ margin: '8px 0', fontSize: '12.5px', lineHeight: '1.5', color: '#374151' }} className="dark:text-slate-200">
        {renderItalicAndBold(trimmedBlock)}
      </p>
    );
  });
};

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
                    maxWidth: msg.role === 'user' ? '75%' : '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: msg.role === 'user' ? '#1a7a4c' : undefined,
                    color: msg.role === 'user' ? 'white' : undefined,
                    fontSize: '13px',
                    lineHeight: '1.5',
                    whiteSpace: msg.role === 'user' ? 'pre-wrap' : undefined,
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
                    ) : (
                      msg.role === 'bot' ? formatMessage(msg.content) : msg.content
                    )}
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
