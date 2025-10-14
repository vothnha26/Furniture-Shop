import React, { useState } from 'react';
import { IoPerson, IoMail, IoCall, IoLocation, IoCreate, IoSave, IoClose, IoCheckmarkCircle, IoStar } from 'react-icons/io5';

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    vipLevel: 'gold',
    joinDate: '2023-01-15',
    totalOrders: 12,
    totalSpent: 25000000,
    avatar: 'https://via.placeholder.com/150'
  });

  const [editProfile, setEditProfile] = useState(profile);

  const vipLevels = [
    { value: 'bronze', label: 'Đồng', color: 'text-orange-600', bg: 'bg-orange-100' },
    { value: 'silver', label: 'Bạc', color: 'text-gray-600', bg: 'bg-gray-100' },
    { value: 'gold', label: 'Vàng', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'platinum', label: 'Bạch kim', color: 'text-purple-600', bg: 'bg-purple-100' }
  ];

  const getVipInfo = (level) => {
    return vipLevels.find(vip => vip.value === level) || vipLevels[0];
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleEdit = () => {
    setEditProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(editProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditProfile(prev => ({ ...prev, [field]: value }));
  };

  const recentOrders = [
    { id: 'ORD001', date: '2024-01-15', total: 2500000, status: 'delivered' },
    { id: 'ORD002', date: '2024-01-10', total: 4500000, status: 'shipping' },
    { id: 'ORD003', date: '2024-01-05', total: 6500000, status: 'processing' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'text-green-600 bg-green-100',
      shipping: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status) => {
    const labels = {
      delivered: 'Đã giao hàng',
      shipping: 'Đang giao hàng',
      processing: 'Đang xử lý'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h2>
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-3 py-2 text-primary hover:bg-primary/10 rounded-lg"
                    >
                      <IoCreate className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={editProfile.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editProfile.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={editProfile.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          value={editProfile.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giới tính
                      </label>
                      <select
                        value={editProfile.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ
                      </label>
                      <textarea
                        value={editProfile.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                      >
                        <IoSave className="w-4 h-4" />
                        Lưu thay đổi
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <IoClose className="w-4 h-4" />
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ và tên
                        </label>
                        <p className="text-gray-900">{profile.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900">{profile.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <p className="text-gray-900">{profile.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày sinh
                        </label>
                        <p className="text-gray-900">{profile.dateOfBirth}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giới tính
                      </label>
                      <p className="text-gray-900 capitalize">{profile.gender}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ
                      </label>
                      <p className="text-gray-900">{profile.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* VIP Status */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thành viên VIP</h3>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👑</span>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVipInfo(profile.vipLevel).bg} ${getVipInfo(profile.vipLevel).color}`}>
                  {getVipInfo(profile.vipLevel).label}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Tham gia từ {profile.joinDate}
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng đơn hàng</span>
                  <span className="font-medium">{profile.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng chi tiêu</span>
                  <span className="font-medium">{formatPrice(profile.totalSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đánh giá trung bình</span>
                  <div className="flex items-center gap-1">
                    <IoStar className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng gần đây</h3>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(order.total)}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;

