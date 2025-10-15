import React, { useState, useEffect } from 'react';
import { IoSearch, IoLocation, IoTime, IoCheckmarkCircle, IoCar, IoClose, IoRefresh } from 'react-icons/io5';
import api from '../../api';

// Mapping functions for Vietnamese API field names
const mapTrackingFromApi = (tracking) => ({
  orderId: tracking.ma_don_hang,
  trackingNumber: tracking.ma_van_don,
  status: tracking.trang_thai,
  carrier: tracking.don_vi_van_chuyen,
  customerName: tracking.ten_khach_hang,
  customerPhone: tracking.sdt_khach_hang,
  shippingAddress: tracking.dia_chi_giao_hang,
  estimatedDelivery: tracking.ngay_giao_hang_du_kien,
  actualDelivery: tracking.ngay_giao_hang_thuc_te,
  trackingHistory: (tracking.lich_su_van_chuyen || []).map(item => ({
    status: item.trang_thai,
    description: item.mo_ta,
    location: item.vi_tri,
    timestamp: item.thoi_gian,
    note: item.ghi_chu
  })),
  items: (tracking.san_pham || []).map(item => ({
    name: item.ten_san_pham,
    quantity: item.so_luong,
    image: item.hinh_anh
  }))
});

const CustomerOrderTracking = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const statusConfig = {
    pending: { color: 'text-gray-600', bg: 'bg-gray-100', icon: IoTime, label: 'Chờ xác nhận' },
    confirmed: { color: 'text-blue-600', bg: 'bg-blue-100', icon: IoCheckmarkCircle, label: 'Đã xác nhận' },
    processing: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: IoTime, label: 'Đang xử lý' },
    shipped: { color: 'text-purple-600', bg: 'bg-purple-100', icon: IoCar, label: 'Đã xuất kho' },
    in_transit: { color: 'text-orange-600', bg: 'bg-orange-100', icon: IoLocation, label: 'Đang vận chuyển' },
    delivered: { color: 'text-green-600', bg: 'bg-green-100', icon: IoCheckmarkCircle, label: 'Đã giao hàng' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-100', icon: IoClose, label: 'Đã hủy' }
  };

  // API Functions
  const searchOrderTracking = async (trackingNumberParam) => {
    try {
      const response = await api.get(`/api/v1/theo-doi-don-hang/ma-van-don/${trackingNumberParam}`);
      return mapTrackingFromApi(response.data);
    } catch (error) {
      throw new Error('Không tìm thấy thông tin vận đơn');
    }
  };

  const searchOrderById = async (orderId) => {
    try {
      const response = await api.get(`/api/v1/theo-doi-don-hang/${orderId}`);
      return mapTrackingFromApi(response.data);
    } catch (error) {
      throw new Error('Không tìm thấy đơn hàng');
    }
  };

  const handleSearch = async () => {
    if (!trackingNumber.trim()) return;
    
    setIsSearching(true);
    setError('');
    
    try {
      let result;
      // Try searching by tracking number first, then by order ID
      try {
        result = await searchOrderTracking(trackingNumber);
      } catch (error) {
        result = await searchOrderById(trackingNumber);
      }
      
      setSearchResult(result);
    } catch (error) {
      setError(error.message);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Mock result for fallback
  const getMockResult = () => ({
    id: 'ORD001',
    trackingNumber: trackingNumber,
    customer: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    status: 'in_transit',
    estimatedDelivery: '2024-01-22',
    actualDelivery: null,
    carrier: 'Viettel Post',
    driver: 'Trần Văn B',
    driverPhone: '0987654321',
    timeline: [
      { status: 'confirmed', time: '2024-01-15 09:00', location: 'Cửa hàng', description: 'Đơn hàng đã được xác nhận' },
      { status: 'processing', time: '2024-01-15 14:30', location: 'Kho hàng', description: 'Đang chuẩn bị hàng' },
      { status: 'shipped', time: '2024-01-16 08:00', location: 'Trung tâm phân phối', description: 'Đã xuất kho' },
      { status: 'in_transit', time: '2024-01-17 10:30', location: 'Đang vận chuyển', description: 'Đang giao hàng' }
    ]
  });

  const getStatusInfo = (status) => {
    return statusConfig[status] || statusConfig.confirmed;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tra cứu đơn hàng</h1>
          <p className="text-gray-600">Nhập mã vận đơn để theo dõi trạng thái giao hàng</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nhập mã vận đơn (VD: VN123456789)"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !trackingNumber.trim()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <IoRefresh className="w-4 h-4 animate-spin" />
                  Đang tìm kiếm...
                </>
              ) : (
                <>
                  <IoSearch className="w-4 h-4" />
                  Tra cứu
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Result */}
        {searchResult ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Order Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Đơn hàng #{searchResult.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mã vận đơn: {searchResult.trackingNumber}
                  </p>
                </div>
                <div className="text-right">
                  {(() => {
                    const statusInfo = getStatusInfo(searchResult.status);
                    const IconComponent = statusInfo.icon;
                    return (
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Thông tin khách hàng</h4>
                  <p className="text-sm text-gray-600">{searchResult.customer}</p>
                  <p className="text-sm text-gray-600">{searchResult.phone}</p>
                  <p className="text-sm text-gray-600">{searchResult.address}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Thông tin giao hàng</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Đơn vị vận chuyển:</strong> {searchResult.carrier}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Tài xế:</strong> {searchResult.driver}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Liên hệ tài xế:</strong> {searchResult.driverPhone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Dự kiến giao:</strong> {searchResult.estimatedDelivery}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Lịch sử giao hàng</h4>
              <div className="space-y-4">
                {searchResult.timeline.map((step, index) => {
                  const statusInfo = getStatusInfo(step.status);
                  const IconComponent = statusInfo.icon;
                  const isLast = index === searchResult.timeline.length - 1;
                  
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900">{statusInfo.label}</h5>
                          <span className="text-sm text-gray-500">{step.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        <p className="text-sm text-gray-500 mt-1">{step.location}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Cần hỗ trợ?</h3>
          <p className="text-blue-800 mb-4">
            Nếu bạn không tìm thấy đơn hàng hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Liên hệ hỗ trợ
            </button>
            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
              Gọi hotline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderTracking;

