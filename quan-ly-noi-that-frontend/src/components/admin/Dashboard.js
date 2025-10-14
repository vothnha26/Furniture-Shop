import React, { useState } from 'react';
import { IoBarChart, IoPieChart, IoTrendingUp, IoTrendingDown, IoNotifications, IoCalendar, IoPeople, IoStorefront, IoCash, IoTime, IoCheckmarkCircle, IoWarning } from 'react-icons/io5';

const Dashboard = () => {
  const [selectedWidget, setSelectedWidget] = useState('overview');

  const widgets = [
    {
      id: 'overview',
      title: 'Tổng quan',
      icon: IoBarChart,
      color: 'bg-blue-100 text-blue-800',
      data: {
        totalRevenue: '1,850,000,000đ',
        totalOrders: 156,
        totalCustomers: 1234,
        totalProducts: 45
      }
    },
    {
      id: 'sales',
      title: 'Bán hàng',
      icon: IoCash,
      color: 'bg-green-100 text-green-800',
      data: {
        todayRevenue: '45,000,000đ',
        todayOrders: 8,
        conversionRate: '3.2%',
        avgOrderValue: '5,625,000đ'
      }
    },
    {
      id: 'inventory',
      title: 'Tồn kho',
      icon: IoStorefront,
      color: 'bg-yellow-100 text-yellow-800',
      data: {
        totalStock: 1250,
        lowStock: 5,
        outOfStock: 2,
        stockValue: '2,500,000,000đ'
      }
    },
    {
      id: 'customers',
      title: 'Khách hàng',
      icon: IoPeople,
      color: 'bg-purple-100 text-purple-800',
      data: {
        newCustomers: 23,
        vipCustomers: 45,
        retentionRate: '68%',
        satisfactionScore: '4.7/5'
      }
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: 'Đơn hàng mới #ORD001 từ Nguyễn Văn A',
      time: '2 phút trước',
      icon: IoCheckmarkCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'inventory',
      message: 'Cảnh báo: Ghế gỗ cao cấp sắp hết hàng',
      time: '15 phút trước',
      icon: IoWarning,
      color: 'text-yellow-600'
    },
    {
      id: 3,
      type: 'customer',
      message: 'Khách hàng VIP mới: Trần Thị B',
      time: '1 giờ trước',
      icon: IoPeople,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'payment',
      message: 'Thanh toán thành công: 15,000,000đ',
      time: '2 giờ trước',
      icon: IoCash,
      color: 'text-green-600'
    }
  ];

  const quickActions = [
    { title: 'Tạo đơn hàng mới', icon: IoCheckmarkCircle, color: 'bg-green-600', action: 'sales' },
    { title: 'Nhập hàng', icon: IoStorefront, color: 'bg-blue-600', action: 'inventory' },
    { title: 'Thêm khách hàng', icon: IoPeople, color: 'bg-purple-600', action: 'customer' },
    { title: 'Tạo khuyến mãi', icon: IoCalendar, color: 'bg-orange-600', action: 'promotion' }
  ];

  const selectedWidgetData = widgets.find(w => w.id === selectedWidget);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Tổng quan</h1>
          <p className="text-gray-600">Tổng hợp thông tin và hoạt động hệ thống</p>
        </div>

        {/* Widget Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn widget</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {widgets.map((widget) => {
              const IconComponent = widget.icon;
              return (
                <button
                  key={widget.id}
                  onClick={() => setSelectedWidget(widget.id)}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedWidget === widget.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-2 rounded-lg mb-2 ${widget.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{widget.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Widget Content */}
        {selectedWidgetData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg mr-4 ${selectedWidgetData.color}`}>
                  <selectedWidgetData.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedWidgetData.title}</h3>
                  <p className="text-gray-600">Thống kê chi tiết</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <IoBarChart className="w-5 h-5" />
                  Xem báo cáo
                </button>
                <button className="flex items-center gap-2 text-green-600 hover:text-green-800">
                  <IoCalendar className="w-5 h-5" />
                  Xuất dữ liệu
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(selectedWidgetData.data).map(([key, value], index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <IoBarChart className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Xem tất cả
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${activity.color} bg-opacity-20`}>
                      <IconComponent className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={index}
                    className={`p-4 rounded-lg text-white ${action.color} hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <IconComponent className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">{action.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Charts */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Hiệu suất hệ thống</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">99.8%</div>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">2.3s</div>
              <p className="text-sm text-gray-600">Thời gian phản hồi</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">1,234</div>
              <p className="text-sm text-gray-600">Người dùng hoạt động</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

