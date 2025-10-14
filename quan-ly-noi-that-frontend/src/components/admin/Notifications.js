import React, { useState, useEffect } from 'react';
import { IoNotifications, IoCheckmarkCircle, IoWarning, IoInformation, IoClose, IoTime, IoPeople, IoStorefront, IoCash, IoCalendar } from 'react-icons/io5';
import api from '../../api';

// Mapping functions for Vietnamese API field names
const mapNotificationFromApi = (notification) => ({
  id: notification.id,
  type: notification.loai,
  title: notification.tieu_de,
  message: notification.noi_dung,
  time: notification.thoi_gian,
  read: notification.da_doc || false,
  icon: getNotificationIcon(notification.loai),
  color: getNotificationColor(notification.loai),
  bgColor: getNotificationBgColor(notification.loai),
  userId: notification.nguoi_nhan_id,
  createdAt: notification.ngay_tao,
  actionUrl: notification.duong_dan_hanh_dong,
  priority: notification.do_uu_tien || 'normal'
});

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success': return IoCheckmarkCircle;
    case 'warning': return IoWarning;
    case 'info': return IoInformation;
    case 'order': return IoCash;
    case 'customer': return IoPeople;
    case 'inventory': return IoStorefront;
    default: return IoNotifications;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'success': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'error': return 'text-red-600';
    case 'info': return 'text-blue-600';
    default: return 'text-gray-600';
  }
};

const getNotificationBgColor = (type) => {
  switch (type) {
    case 'success': return 'bg-green-100';
    case 'warning': return 'bg-yellow-100';
    case 'error': return 'bg-red-100';
    case 'info': return 'bg-blue-100';
    default: return 'bg-gray-100';
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedFilter, setSelectedFilter] = useState('all');

  // API Functions
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/thong-bao');
      setNotifications(response.data.map(mapNotificationFromApi));
    } catch (error) {
      setError('Không thể tải thông báo');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/v1/thong-bao/${notificationId}/danh-dau-da-doc`);
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/v1/thong-bao/danh-dau-tat-ca-da-doc');
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/v1/thong-bao/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const [mockNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Đơn hàng mới',
      message: 'Đơn hàng #ORD001 đã được tạo thành công',
      time: '2 phút trước',
      read: false,
      icon: IoCheckmarkCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Cảnh báo tồn kho',
      message: 'Ghế gỗ cao cấp sắp hết hàng (còn 3 sản phẩm)',
      time: '15 phút trước',
      read: false,
      icon: IoWarning,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      id: 3,
      type: 'info',
      title: 'Khách hàng VIP',
      message: 'Khách hàng Trần Thị B đã đạt cấp VIP Gold',
      time: '1 giờ trước',
      read: true,
      icon: IoPeople,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 4,
      type: 'success',
      title: 'Thanh toán thành công',
      message: 'Đơn hàng #ORD002 đã thanh toán 15,000,000đ',
      time: '2 giờ trước',
      read: true,
      icon: IoCash,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 5,
      type: 'warning',
      title: 'Hết hàng',
      message: 'Tủ quần áo 3 cánh đã hết hàng',
      time: '3 giờ trước',
      read: true,
      icon: IoStorefront,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      id: 6,
      type: 'info',
      title: 'Khuyến mãi sắp hết hạn',
      message: 'Chương trình giảm giá 20% còn 2 ngày',
      time: '1 ngày trước',
      read: true,
      icon: IoCalendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]);

  const filters = [
    { id: 'all', name: 'Tất cả', count: notifications.length },
    { id: 'unread', name: 'Chưa đọc', count: notifications.filter(n => !n.read).length },
    { id: 'success', name: 'Thành công', count: notifications.filter(n => n.type === 'success').length },
    { id: 'warning', name: 'Cảnh báo', count: notifications.filter(n => n.type === 'warning').length },
    { id: 'info', name: 'Thông tin', count: notifications.filter(n => n.type === 'info').length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.read;
    return notification.type === selectedFilter;
  });

  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (id) => {
    deleteNotification(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông báo</h1>
          <p className="text-gray-600">Quản lý và theo dõi các thông báo hệ thống</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.name} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <IoCheckmarkCircle className="w-5 h-5" />
                Đánh dấu tất cả đã đọc
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                <IoTime className="w-5 h-5" />
                Xóa thông báo cũ
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {filteredNotifications.length} thông báo
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <IoNotifications className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
              <p className="text-gray-500">Chưa có thông báo nào phù hợp với bộ lọc hiện tại</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                    notification.read ? 'border-gray-200' : 'border-primary'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${notification.bgColor}`}>
                        <IconComponent className={`w-6 h-6 ${notification.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <IoTime className="w-4 h-4" />
                            {notification.time}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.type === 'success' ? 'bg-green-100 text-green-800' :
                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.type === 'success' ? 'Thành công' :
                             notification.type === 'warning' ? 'Cảnh báo' :
                             notification.type === 'info' ? 'Thông tin' : 'Khác'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <IoClose className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt thông báo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Thông báo đơn hàng</h4>
                  <p className="text-sm text-gray-500">Nhận thông báo khi có đơn hàng mới</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Cảnh báo tồn kho</h4>
                  <p className="text-sm text-gray-500">Thông báo khi sản phẩm sắp hết hàng</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Thông báo VIP</h4>
                  <p className="text-sm text-gray-500">Thông báo khi khách hàng đạt cấp VIP</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Thông báo thanh toán</h4>
                  <p className="text-sm text-gray-500">Thông báo khi có thanh toán thành công</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;

