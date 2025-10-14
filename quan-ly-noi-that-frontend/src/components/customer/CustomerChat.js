import React, { useState, useEffect } from 'react';
import { IoChatbubbles, IoSend, IoClose, IoPerson, IoTime, IoCheckmarkCircle } from 'react-icons/io5';

const CustomerChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'support',
      senderName: 'Nhã - Hỗ trợ khách hàng',
      message: 'Xin chào! Tôi có thể giúp gì cho bạn?',
      timestamp: '2024-01-15 09:30:00',
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Khách hàng',
    email: 'customer@email.com',
    orderId: 'ORD001' // Mã đơn hàng gần nhất
  });
  const [chatType, setChatType] = useState('general'); // general, complaint, support

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        sender: 'customer',
        senderName: customerInfo.name,
        message: newMessage,
        timestamp: new Date().toLocaleString('vi-VN'),
        type: 'text'
      };
      
      setMessages([...messages, userMessage]);
      setNewMessage('');
      
      // Simulate typing indicator
      setIsTyping(true);
      
      // Simulate auto response after 2 seconds based on chat type
      setTimeout(() => {
        let responseMessage = '';
        switch(chatType) {
          case 'complaint':
            responseMessage = 'Cảm ơn bạn đã phản hồi về sản phẩm. Chúng tôi rất tiếc về sự cố này và sẽ xử lý ngay lập tức. Bạn có thể gửi ảnh sản phẩm để chúng tôi kiểm tra không?';
            break;
          case 'support':
            responseMessage = 'Cảm ơn bạn đã liên hệ! Tôi sẽ kiểm tra thông tin đơn hàng và phản hồi bạn trong vài phút.';
            break;
          default:
            responseMessage = 'Xin chào! Tôi có thể giúp gì cho bạn về sản phẩm hoặc dịch vụ của chúng tôi?';
        }
        
        const autoResponse = {
          id: messages.length + 2,
          sender: 'support',
          senderName: 'Nhã - Hỗ trợ khách hàng',
          message: responseMessage,
          timestamp: new Date().toLocaleString('vi-VN'),
          type: 'text'
        };
        
        setMessages(prev => [...prev, autoResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center gap-2"
          >
            <IoChatbubbles className="w-6 h-6" />
            <span className="hidden sm:block">Chat hỗ trợ</span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <IoPerson className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Hỗ trợ khách hàng</h3>
                <p className="text-xs opacity-90">Demo - Không phải hệ thống thực</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
              title="Đóng chat"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Type Selection */}
          {messages.length === 1 && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Bạn cần hỗ trợ gì?</h4>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setChatType('complaint')}
                  className={`p-2 text-left rounded-lg border transition-colors ${
                    chatType === 'complaint' 
                      ? 'border-red-300 bg-red-50 text-red-700' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">😠</span>
                    <div>
                      <p className="text-sm font-medium">Khiếu nại sản phẩm</p>
                      <p className="text-xs text-gray-500">Sản phẩm lỗi, không đúng mô tả</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setChatType('support')}
                  className={`p-2 text-left rounded-lg border transition-colors ${
                    chatType === 'support' 
                      ? 'border-blue-300 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">❓</span>
                    <div>
                      <p className="text-sm font-medium">Hỏi đáp đơn hàng</p>
                      <p className="text-xs text-gray-500">Tình trạng giao hàng, thanh toán</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setChatType('general')}
                  className={`p-2 text-left rounded-lg border transition-colors ${
                    chatType === 'general' 
                      ? 'border-green-300 bg-green-50 text-green-700' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    <div>
                      <p className="text-sm font-medium">Tư vấn chung</p>
                      <p className="text-xs text-gray-500">Hỏi về sản phẩm, dịch vụ</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.sender === 'customer'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {msg.senderName} • {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">Đang nhập...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IoSend className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                💡 Demo chat - Không lưu trữ thực tế
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
                title="Đóng chat"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerChat;

