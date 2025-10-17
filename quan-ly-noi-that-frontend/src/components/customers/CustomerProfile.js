import React, { useState, useEffect } from 'react';
import { IoCreate, IoSave, IoClose, IoCheckmarkCircle, IoStar, IoWarning } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const CustomerProfile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'male',
    vipLevel: 'bronze',
    joinDate: '',
    totalOrders: 0,
    totalSpent: 0,
    avatar: 'https://via.placeholder.com/150'
  });

  const [editProfile, setEditProfile] = useState(profile);
  const [recentOrders, setRecentOrders] = useState([]);

  // Load user data from AuthContext and fetch additional details
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setLoading(true);
        try {
          // Map user data from backend to profile state
          const userProfile = {
            name: user.hoTen || user.tenKhachHang || user.name || '',
            email: user.email || '',
            phone: user.soDienThoai || user.phone || '',
            address: user.diaChi || user.address || '',
            dateOfBirth: user.ngaySinh || user.dateOfBirth || '',
            gender: user.gioiTinh || user.gender || 'male',
            vipLevel: user.capDoThanhVien || user.vipLevel || 'bronze',
            joinDate: user.ngayTaoTaiKhoan || user.createdAt || new Date().toISOString().split('T')[0],
            totalOrders: user.tongDonHang || user.totalOrders || 0,
            totalSpent: user.tongChiTieu || user.totalSpent || 0,
            avatar: user.avatar || user.hinhAnh || 'https://via.placeholder.com/150'
          };
          
          setProfile(userProfile);
          setEditProfile(userProfile);

          // Fetch recent orders
          try {
            const ordersResponse = await api.get('/api/customers/orders?limit=3&sort=desc');
            const orders = ordersResponse.data?.orders || ordersResponse.data || ordersResponse || [];
            setRecentOrders(orders.slice(0, 3));
          } catch (err) {
            console.error('Failed to fetch recent orders:', err);
          }
        } catch (err) {
          console.error('Failed to load user data:', err);
          setError('Không thể tải thông tin người dùng');
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [user]);

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
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for backend (map to backend field names)
      const updateData = {
        hoTen: editProfile.name,
        email: editProfile.email,
        soDienThoai: editProfile.phone,
        diaChi: editProfile.address,
        ngaySinh: editProfile.dateOfBirth,
        gioiTinh: editProfile.gender
      };

      const result = await updateProfile(updateData);
      
      if (result.success) {
        setProfile(editProfile);
        setIsEditing(false);
        setSuccess('Cập nhật thông tin thành công!');
        
        // Refresh user data
        await refreshUser();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (field, value) => {
    setEditProfile(prev => ({ ...prev, [field]: value }));
  };

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

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <IoCheckmarkCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <IoWarning className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
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
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <IoSave className="w-4 h-4" />
                            Lưu thay đổi
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id || order.maDonHang} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">#{order.id || order.maDonHang}</p>
                        <p className="text-sm text-gray-500">{order.date || order.ngayDatHang}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatPrice(order.total || order.tongTien)}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || order.trangThai)}`}>
                          {getStatusLabel(order.status || order.trangThai)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">Chưa có đơn hàng nào</p>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;

