import React, { useState } from 'react';
import { IoPerson, IoCart, IoStorefront, IoReceipt, IoChatbubbles, IoNotifications, IoTime, IoCheckmarkCircle, IoTrendingUp, IoTrendingDown } from 'react-icons/io5';

const StaffDashboard = () => {
  const [timeRange, setTimeRange] = useState('today');

  // Mock data
  const stats = {
    today: {
      orders: 24,
      revenue: 125000000,
      customers: 18,
      products: 156,
      growth: 12.5
    },
    week: {
      orders: 156,
      revenue: 780000000,
      customers: 98,
      products: 892,
      growth: 8.3
    },
    month: {
      orders: 624,
      revenue: 3120000000,
      customers: 456,
      products: 3456,
      growth: 15.2
    }
  };

  const currentStats = stats[timeRange];

  const recentOrders = [
    {
      id: 'ORD001',
      customer: 'Nguyễn Văn A',
      amount: 2500000,
      status: 'processing',
      time: '10:30'
    },
    {
      id: 'ORD002',
      customer: 'Trần Thị B',
      amount: 4500000,
      status: 'shipping',
      time: '09:15'
    },
    {
      id: 'ORD003',
      customer: 'Lê Văn C',
      amount: 1800000,
      status: 'delivered',
      time: '08:45'
    }
  ];

  const recentCustomers = [
    {
      name: 'Phạm Thị D',
      email: 'phamthid@email.com',
      orders: 3,
      totalSpent: 8500000,
      joinDate: '2024-01-10'
    },
    {
      name: 'Hoàng Văn E',
      email: 'hoangvane@email.com',
      orders: 1,
      totalSpent: 3200000,
      joinDate: '2024-01-12'
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'order',
      message: 'Đơn hàng mới #ORD004 từ khách hàng Nguyễn Văn F',
      time: '5 phút trước',
      priority: 'high'
    },
    {
      id: 2,
      type: 'inventory',
      message: 'Sản phẩm "Ghế gỗ cao cấp" sắp hết hàng',
      time: '15 phút trước',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'customer',
      message: 'Khách hàng Trần Thị G cần hỗ trợ',
      time: '30 phút trước',
      priority: 'low'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      processing: 'text-blue-600 bg-blue-100',
      shipping: 'text-yellow-600 bg-yellow-100',
      delivered: 'text-green-600 bg-green-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status) => {
    const labels = {
      processing: 'Đang xử lý',
      shipping: 'Đang giao hàng',
      delivered: 'Đã giao hàng'
    };
    return labels[status] || status;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order: IoReceipt,
      inventory: IoStorefront,
      customer: IoPerson
    };
    return icons[type] || IoNotifications;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-gray-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Nhân viên</h1>
              <p className="text-gray-600">Tổng quan hoạt động kinh doanh</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <IoReceipt className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{currentStats.orders}</p>
                <div className="flex items-center text-sm text-green-600">
                  <IoTrendingUp className="w-4 h-4 mr-1" />
                  +{currentStats.growth}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <IoTrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(currentStats.revenue)}</p>
                <div className="flex items-center text-sm text-green-600">
                  <IoTrendingUp className="w-4 h-4 mr-1" />
                  +{currentStats.growth}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <IoPerson className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                <p className="text-2xl font-bold text-gray-900">{currentStats.customers}</p>
                <div className="flex items-center text-sm text-green-600">
                  <IoTrendingUp className="w-4 h-4 mr-1" />
                  +{currentStats.growth}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <IoStorefront className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900">{currentStats.products}</p>
                <div className="flex items-center text-sm text-green-600">
                  <IoTrendingUp className="w-4 h-4 mr-1" />
                  +{currentStats.growth}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <IoReceipt className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">#{order.id}</p>
                          <p className="text-sm text-gray-500">{order.customer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatPrice(order.amount)}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{order.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <button className="text-primary hover:text-primary/80 font-medium">
                    Xem tất cả đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-primary rounded-full">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{notification.time}</span>
                            <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority === 'high' ? 'Cao' : notification.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-center">
                  <button className="text-primary hover:text-primary/80 font-medium">
                    Xem tất cả thông báo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <IoPerson className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium">Quản lý khách hàng</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <IoReceipt className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium">Xử lý đơn hàng</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <IoChatbubbles className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium">Hỗ trợ khách hàng</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <IoStorefront className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium">Quản lý sản phẩm</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;


