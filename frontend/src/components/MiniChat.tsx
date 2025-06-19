import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MiniChatProps {
  placeholder?: string;
  height?: string;
}

const MiniChat: React.FC<MiniChatProps> = ({ 
  placeholder = "输入问题，AI助手将为您解答...",
  height = "400px"
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 使用流式响应
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      // 添加一个空的AI消息用于流式更新
      let streamingMessageIndex = -1;
      setMessages(prev => {
        const newMessages = [...prev, { role: 'assistant' as const, content: '' }];
        streamingMessageIndex = newMessages.length - 1;
        return newMessages;
      });

      if (reader) {
        let streamingContent = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          streamingContent += chunk;
          
          // 更新流式消息内容
          setMessages(prev => {
            const newMessages = [...prev];
            if (streamingMessageIndex >= 0 && streamingMessageIndex < newMessages.length) {
              newMessages[streamingMessageIndex] = {
                role: 'assistant',
                content: streamingContent
              };
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，发生了错误。请稍后再试。'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mini-chat" style={{ height }}>
      <div className="mini-chat-messages">
        {messages.length === 0 ? (
          <div className="mini-chat-welcome">
            <p>👋 您好！我是GIST AI助手</p>
            <p>有什么问题可以问我</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`mini-message ${message.role}`}>
              <div className="mini-message-content">
                {message.role === 'assistant' ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="mini-loading">AI正在思考...</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mini-chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={placeholder}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="mini-send-button"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default MiniChat;