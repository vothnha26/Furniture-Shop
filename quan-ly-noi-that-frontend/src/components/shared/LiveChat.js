import React, { useState, useEffect } from 'react';
import { IoChatbubbles, IoTime, IoCheckmarkCircle, IoClose, IoSend, IoPerson, IoCall, IoMail, IoNotifications } from 'react-icons/io5';
import api from '../../api';

// Mapping functions for Vietnamese API field names
const mapChatFromApi = (chat) => ({
  id: chat.id,
  chatId: chat.ma_chat,
  customer: {
    id: chat.khach_hang_id,
    name: chat.ten_khach_hang,
    email: chat.email_khach_hang,
    phone: chat.sdt_khach_hang,
    avatar: chat.avatar_khach_hang,
    isOnline: chat.khach_hang_online || false
  },
  status: chat.trang_thai,
  createdDate: chat.ngay_tao,
  lastMessage: chat.tin_nhan_cuoi,
  lastMessageTime: chat.thoi_gian_tin_nhan_cuoi,
  unreadCount: chat.so_tin_nhan_chua_doc || 0,
  assignedTo: chat.nhan_vien_phu_trach,
  assignedToId: chat.nhan_vien_id,
  messages: (chat.tin_nhan || []).map(mapMessageFromApi),
  tags: chat.nhan || [],
  isArchived: chat.da_luu_tru || false
});

const mapMessageFromApi = (message) => ({
  id: message.id,
  chatId: message.chat_id,
  content: message.noi_dung,
  sender: message.nguoi_gui,
  senderType: message.loai_nguoi_gui,
  sentTime: message.thoi_gian_gui,
  isRead: message.da_doc || false,
  messageType: message.loai_tin_nhan || 'text',
  attachments: message.tep_dinh_kem || []
});

const mapChatToApi = (chat) => ({
  khach_hang_id: chat.customer.id,
  trang_thai: chat.status,
  nhan_vien_id: chat.assignedToId
});

const mapMessageToApi = (message) => ({
  chat_id: message.chatId,
  noi_dung: message.content,
  loai_nguoi_gui: message.senderType,
  loai_tin_nhan: message.messageType || 'text'
});

const LiveChat = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newChats, setNewChats] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // API Functions
  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/live-chat');
      setChats(response.data.map(mapChatFromApi));
    } catch (error) {
      setError('Không thể tải danh sách chat');
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (chatId, messageContent) => {
    try {
      const messageData = {
        chatId: chatId,
        content: messageContent,
        senderType: 'staff'
      };
      const response = await api.post('/api/v1/live-chat/tin-nhan', mapMessageToApi(messageData));
      return mapMessageFromApi(response.data);
    } catch (error) {
      throw new Error('Không thể gửi tin nhắn');
    }
  };

  const updateChatStatus = async (chatId, status) => {
    try {
      const response = await api.put(`/api/v1/live-chat/${chatId}/trang-thai`, { trang_thai: status });
      return mapChatFromApi(response.data);
    } catch (error) {
      throw new Error('Không thể cập nhật trạng thái chat');
    }
  };

  const markMessagesAsRead = async (chatId) => {
    try {
      await api.put(`/api/v1/live-chat/${chatId}/danh-dau-da-doc`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    fetchChats();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const [activeChats] = useState([
    {
      id: 'CHAT001',
      customer: {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0901234567',
        avatar: 'https://via.placeholder.com/40'
      },
      lastMessage: 'Tôi cần hỗ trợ về sản phẩm',
      lastMessageTime: '2024-01-15 14:30:00',
      status: 'active', // active, waiting, resolved
      assignedTo: 'Nhã',
      messageCount: 5,
      priority: 'medium'
    },
    {
      id: 'CHAT002',
      customer: {
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0912345678',
        avatar: 'https://via.placeholder.com/40'
      },
      lastMessage: 'Khi nào sản phẩm được giao?',
      lastMessageTime: '2024-01-15 13:45:00',
      status: 'waiting',
      assignedTo: 'Bảo',
      messageCount: 3,
      priority: 'high'
    },
    {
      id: 'CHAT003',
      customer: {
        name: 'Lê Văn C',
        email: 'levanc@email.com',
        phone: '0923456789',
        avatar: 'https://via.placeholder.com/40'
      },
      lastMessage: 'Cảm ơn bạn đã hỗ trợ!',
      lastMessageTime: '2024-01-15 12:20:00',
      status: 'resolved',
      assignedTo: 'Phúc',
      messageCount: 8,
      priority: 'low'
    }
  ]);

  const [chatMessages] = useState([
    {
      id: 1,
      chatId: 'CHAT001',
      sender: 'customer',
      message: 'Xin chào, tôi cần hỗ trợ về sản phẩm ghế gỗ',
      timestamp: '2024-01-15 14:25:00'
    },
    {
      id: 2,
      chatId: 'CHAT001',
      sender: 'staff',
      senderName: 'Nhã',
      message: 'Xin chào! Tôi có thể giúp gì cho bạn về sản phẩm ghế gỗ?',
      timestamp: '2024-01-15 14:26:00'
    },
    {
      id: 3,
      chatId: 'CHAT001',
      sender: 'customer',
      message: 'Ghế tôi mua có vết nứt, tôi muốn đổi sản phẩm khác',
      timestamp: '2024-01-15 14:28:00'
    },
    {
      id: 4,
      chatId: 'CHAT001',
      sender: 'staff',
      senderName: 'Nhã',
      message: 'Tôi rất tiếc về sự cố này. Bạn có thể gửi ảnh sản phẩm để tôi kiểm tra không?',
      timestamp: '2024-01-15 14:30:00'
    },
    {
      id: 5,
      chatId: 'CHAT001',
      sender: 'customer',
      message: 'Được, tôi sẽ gửi ảnh ngay',
      timestamp: '2024-01-15 14:30:00'
    }
  ]);

  const getStatusInfo = (status) => {
    const statusConfig = {
      active: { color: 'text-green-600', bg: 'bg-green-100', icon: IoCheckmarkCircle, label: 'Đang chat' },
      waiting: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: IoTime, label: 'Chờ phản hồi' },
      resolved: { color: 'text-gray-600', bg: 'bg-gray-100', icon: IoCheckmarkCircle, label: 'Đã giải quyết' }
    };
    return statusConfig[status] || statusConfig.waiting;
  };

  const getPriorityInfo = (priority) => {
    const priorityConfig = {
      low: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Thấp' },
      medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Trung bình' },
      high: { color: 'text-red-600', bg: 'bg-red-100', label: 'Cao' }
    };
    return priorityConfig[priority] || priorityConfig.medium;
  };

  const handleViewChat = (chat) => {
    setSelectedChat(chat);
    setShowChatModal(true);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  // Simulate new chat notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new chat every 30 seconds
      if (Math.random() > 0.7) {
        setNewChats(prev => prev + 1);
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification('Chat mới từ khách hàng!', {
            body: 'Có khách hàng cần hỗ trợ',
            icon: '/favicon.ico'
          });
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getChatMessages = (chatId) => {
    return chatMessages.filter(msg => msg.chatId === chatId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Chat</h1>
              <p className="text-gray-600">Quản lý cuộc trò chuyện trực tiếp với khách hàng</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Online Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Đang hoạt động' : 'Offline'}
                </span>
              </div>
              
              {/* New Chat Notification */}
              {newChats > 0 && (
                <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg">
                  <IoNotifications className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {newChats} chat mới
                  </span>
                  <button
                    onClick={() => setNewChats(0)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <IoClose className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <IoChatbubbles className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang chat</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <IoTime className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ phản hồi</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <IoCheckmarkCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IoPerson className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng chat</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Chats */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Cuộc trò chuyện đang hoạt động</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activeChats.map((chat) => {
              const statusInfo = getStatusInfo(chat.status);
              const priorityInfo = getPriorityInfo(chat.priority);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={chat.id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => handleViewChat(chat)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={chat.customer.avatar}
                          alt={chat.customer.name}
                          className="w-12 h-12 rounded-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {chat.customer.name}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.bg} ${priorityInfo.color}`}>
                            {priorityInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-400">{chat.lastMessageTime}</span>
                          <span className="text-xs text-gray-400">Phụ trách: {chat.assignedTo}</span>
                          <span className="text-xs text-gray-400">{chat.messageCount} tin nhắn</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <IoChatbubbles className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Detail Modal */}
        {showChatModal && selectedChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedChat.customer.avatar}
                      alt={selectedChat.customer.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedChat.customer.name}
                      </h3>
                      <p className="text-sm text-gray-600">{selectedChat.customer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChatModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    title="Đóng chat"
                  >
                    <IoClose className="w-6 h-6" />
                  </button>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IoMail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedChat.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoCall className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedChat.customer.phone}</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-4 max-h-60 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                  {getChatMessages(selectedChat.id).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.sender === 'staff'
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {message.senderName || 'Khách hàng'} • {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn phản hồi..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IoSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChat;



