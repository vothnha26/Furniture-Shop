import React, { useState, useEffect } from 'react';
import { IoGift, IoAdd, IoCreate, IoTrash, IoEye, IoTime, IoCheckmarkCircle, IoRefresh, IoCopy } from 'react-icons/io5';
import api from '../../api';

const VoucherManagement = () => {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newVoucher, setNewVoucher] = useState({
    name: '',
    code: '',
    type: 'percentage',
    value: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimit: 0,
    startDate: '',
    endDate: '',
    description: '',
    conditions: []
  });

  const [vouchers, setVouchers] = useState([
    {
      id: 'VOUCHER001',
      code: 'WELCOME10',
      name: 'Giảm 10% cho khách hàng mới',
      type: 'percentage',
      value: 10,
      minOrderValue: 500000,
      maxDiscount: 100000,
      usageLimit: 100,
      usedCount: 25,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      applicableProducts: 'Tất cả sản phẩm',
      applicableCustomers: 'Khách hàng mới',
      description: 'Áp dụng cho đơn hàng đầu tiên của khách hàng mới',
      createdBy: 'Phúc',
      createdAt: '2024-01-01'
    },
    {
      id: 'VOUCHER002',
      code: 'VIP20',
      name: 'Giảm 20% cho khách hàng VIP',
      type: 'percentage',
      value: 20,
      minOrderValue: 1000000,
      maxDiscount: 500000,
      usageLimit: 50,
      usedCount: 12,
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      applicableProducts: 'Sản phẩm VIP',
      applicableCustomers: 'Khách hàng VIP',
      description: 'Dành riêng cho khách hàng VIP với đơn hàng từ 1 triệu',
      createdBy: 'Phúc',
      createdAt: '2024-01-15'
    },
    {
      id: 'VOUCHER003',
      code: 'BIRTHDAY50K',
      name: 'Voucher sinh nhật 50K',
      type: 'fixed',
      value: 50000,
      minOrderValue: 200000,
      maxDiscount: 50000,
      usageLimit: 1,
      usedCount: 0,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      applicableProducts: 'Tất cả sản phẩm',
      applicableCustomers: 'Khách hàng có sinh nhật',
      description: 'Tự động tạo cho khách hàng vào ngày sinh nhật',
      createdBy: 'Phúc',
      createdAt: '2024-01-01'
    },
    {
      id: 'VOUCHER004',
      code: 'FLASH30',
      name: 'Flash sale 30%',
      type: 'percentage',
      value: 30,
      minOrderValue: 0,
      maxDiscount: 200000,
      usageLimit: 200,
      usedCount: 150,
      status: 'expired',
      startDate: '2024-01-10',
      endDate: '2024-01-15',
      applicableProducts: 'Sản phẩm flash sale',
      applicableCustomers: 'Tất cả khách hàng',
      description: 'Chương trình flash sale trong 5 ngày',
      createdBy: 'Phúc',
      createdAt: '2024-01-10'
    }
  ]);

  const [usageHistory] = useState([
    {
      id: 1,
      voucherCode: 'WELCOME10',
      customer: 'Nguyễn Văn A',
      orderId: 'ORD001',
      discountAmount: 50000,
      usedAt: '2024-01-15 14:30:00'
    },
    {
      id: 2,
      voucherCode: 'VIP20',
      customer: 'Trần Thị B',
      orderId: 'ORD002',
      discountAmount: 200000,
      usedAt: '2024-01-16 10:15:00'
    },
    {
      id: 3,
      voucherCode: 'FLASH30',
      customer: 'Lê Văn C',
      orderId: 'ORD003',
      discountAmount: 150000,
      usedAt: '2024-01-12 16:45:00'
    }
  ]);

  const statusConfig = {
    active: { color: 'text-green-600', bg: 'bg-green-100', icon: IoCheckmarkCircle, label: 'Hoạt động' },
    expired: { color: 'text-red-600', bg: 'bg-red-100', icon: IoTime, label: 'Hết hạn' },
    paused: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: IoTime, label: 'Tạm dừng' },
    draft: { color: 'text-gray-600', bg: 'bg-gray-100', icon: IoTime, label: 'Nháp' }
  };

  const typeConfig = {
    percentage: { label: 'Phần trăm', color: 'text-blue-600' },
    fixed: { label: 'Số tiền cố định', color: 'text-green-600' }
  };

  const getStatusInfo = (status) => {
    return statusConfig[status] || statusConfig.draft;
  };

  const getTypeInfo = (type) => {
    return typeConfig[type] || typeConfig.percentage;
  };

  // Map voucher from API to UI
  const mapVoucherFromApi = (voucher) => ({
    id: voucher.maVoucher || voucher.id,
    code: voucher.maCode || voucher.code,
    name: voucher.tenVoucher || voucher.name,
    type: voucher.loaiGiamGia === 'PERCENTAGE' ? 'percentage' : 'fixed',
    value: voucher.giaTriGiam || voucher.value || 0,
    minOrderValue: voucher.giaTriDonHangToiThieu || voucher.minOrderValue || 0,
    maxDiscount: voucher.giaTriGiamToiDa || voucher.maxDiscount || 0,
    usageLimit: voucher.soLuongToiDa || voucher.usageLimit || 0,
    usedCount: voucher.soLuongDaSuDung || voucher.usedCount || 0,
    status: voucher.trangThai ? 'active' : 'expired',
    startDate: voucher.ngayBatDau?.split('T')[0] || voucher.startDate || '',
    endDate: voucher.ngayKetThuc?.split('T')[0] || voucher.endDate || '',
    applicableProducts: voucher.sanPhamApDung || 'Tất cả sản phẩm',
    applicableCustomers: voucher.khachHangApDung || 'Tất cả khách hàng',
    description: voucher.moTa || voucher.description || '',
    createdBy: voucher.nguoiTao || 'Admin',
    createdAt: voucher.ngayTao || voucher.createdAt || ''
  });

  // Map voucher from UI to API
  const mapVoucherToApi = (voucher) => ({
    maCode: voucher.code,
    tenVoucher: voucher.name,
    moTa: voucher.description,
    giaTriGiam: parseFloat(voucher.value),
    loaiGiamGia: voucher.type === 'percentage' ? 'PERCENTAGE' : 'FIXED',
    giaTriDonHangToiThieu: parseFloat(voucher.minOrderValue),
    giaTriGiamToiDa: voucher.type === 'percentage' ? parseFloat(voucher.maxDiscount) : null,
    ngayBatDau: voucher.startDate + 'T00:00:00',
    ngayKetThuc: voucher.endDate + 'T23:59:59',
    soLuongToiDa: parseInt(voucher.usageLimit),
    apDungChoMoiNguoi: true
  });

  // Fetch vouchers on component mount
  useEffect(() => {
    const fetchVouchers = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/v1/voucher/all');
        if (Array.isArray(data)) {
          setVouchers(data.map(mapVoucherFromApi));
        }
      } catch (err) {
        console.error('Fetch vouchers error', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const handleViewVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setShowVoucherModal(true);
  };

  const handleAddVoucher = () => {
    setShowAddModal(true);
  };

  const handleSaveVoucher = async () => {
    try {
      const payload = mapVoucherToApi(newVoucher);
      const created = await api.post('/api/v1/voucher', { body: payload });
      const createdMapped = mapVoucherFromApi(created);
      setVouchers(prev => [...prev, createdMapped]);
    } catch (err) {
      console.error('Create voucher error', err);
      setError(err);
    } finally {
      setShowAddModal(false);
      setNewVoucher({
        name: '',
        code: '',
        type: 'percentage',
        value: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        usageLimit: 0,
        startDate: '',
        endDate: '',
        description: '',
        conditions: []
      });
    }
  };

  const handleEditVoucher = (voucher) => {
    setEditingVoucher(voucher);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    // Logic to save edited voucher
    setShowEditModal(false);
    setEditingVoucher(null);
  };

  const handleDeleteVoucher = (voucher) => {
    if (window.confirm(`Bạn có chắc muốn xóa voucher ${voucher.name}?`)) {
      console.log('Deleting voucher:', voucher.id);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    // Show toast notification
  };

  const getVoucherUsage = (voucherCode) => {
    return usageHistory.filter(usage => usage.voucherCode === voucherCode);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === 0) return 0;
    return Math.round((used / limit) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý voucher</h1>
          <p className="text-gray-600">Quản lý mã giảm giá và khuyến mãi</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IoGift className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng voucher</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IoGift className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã sử dụng</p>
                <p className="text-2xl font-bold text-gray-900">187</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <IoGift className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng giảm giá</p>
                <p className="text-2xl font-bold text-gray-900">4.2M</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vouchers List */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách voucher</h3>
            <div className="flex items-center space-x-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <IoRefresh className="w-4 h-4" />
                Làm mới
              </button>
              <button 
                onClick={handleAddVoucher}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <IoAdd className="w-4 h-4" />
                Tạo voucher
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sử dụng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vouchers.map((voucher) => {
                  const statusInfo = getStatusInfo(voucher.status);
                  const typeInfo = getTypeInfo(voucher.type);
                  const StatusIcon = statusInfo.icon;
                  const usagePercentage = getUsagePercentage(voucher.usedCount, voucher.usageLimit);
                  
                  return (
                    <tr key={voucher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{voucher.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          {voucher.code}
                          <button
                            onClick={() => handleCopyCode(voucher.code)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <IoCopy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {voucher.type === 'percentage' ? `${voucher.value}%` : formatCurrency(voucher.value)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Tối thiểu: {formatCurrency(voucher.minOrderValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{voucher.usedCount}/{voucher.usageLimit}</div>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${usagePercentage}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{voucher.startDate}</div>
                        <div className="text-sm text-gray-500">đến {voucher.endDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewVoucher(voucher)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <IoEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditVoucher(voucher)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <IoCreate className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteVoucher(voucher)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <IoTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Voucher Detail Modal */}
        {showVoucherModal && selectedVoucher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Chi tiết voucher
                  </h3>
                  <button
                    onClick={() => setShowVoucherModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoRefresh className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Voucher Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tên voucher:</span>
                          <span className="text-sm font-medium">{selectedVoucher.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Mã voucher:</span>
                          <span className="text-sm font-medium">{selectedVoucher.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Loại:</span>
                          <span className="text-sm font-medium">{getTypeInfo(selectedVoucher.type).label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Giá trị:</span>
                          <span className="text-sm font-medium">
                            {selectedVoucher.type === 'percentage' ? `${selectedVoucher.value}%` : formatCurrency(selectedVoucher.value)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Trạng thái:</span>
                          <span className={`text-sm font-medium ${getStatusInfo(selectedVoucher.status).color}`}>
                            {getStatusInfo(selectedVoucher.status).label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Điều kiện sử dụng</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Đơn hàng tối thiểu:</span>
                          <span className="text-sm font-medium">{formatCurrency(selectedVoucher.minOrderValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Giảm tối đa:</span>
                          <span className="text-sm font-medium">{formatCurrency(selectedVoucher.maxDiscount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Giới hạn sử dụng:</span>
                          <span className="text-sm font-medium">{selectedVoucher.usageLimit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Đã sử dụng:</span>
                          <span className="text-sm font-medium">{selectedVoucher.usedCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Còn lại:</span>
                          <span className="text-sm font-medium">{selectedVoucher.usageLimit - selectedVoucher.usedCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time and Applicability */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Thời gian áp dụng</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Bắt đầu:</span>
                          <span className="text-sm font-medium">{selectedVoucher.startDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Kết thúc:</span>
                          <span className="text-sm font-medium">{selectedVoucher.endDate}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Đối tượng áp dụng</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Sản phẩm:</span>
                          <span className="text-sm font-medium">{selectedVoucher.applicableProducts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Khách hàng:</span>
                          <span className="text-sm font-medium">{selectedVoucher.applicableCustomers}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Mô tả</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{selectedVoucher.description}</p>
                    </div>
                  </div>

                  {/* Usage History */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Lịch sử sử dụng</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {getVoucherUsage(selectedVoucher.code).map((usage) => (
                        <div key={usage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{usage.customer}</span>
                            <div className="text-sm text-gray-500">Đơn hàng: {usage.orderId}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(usage.discountAmount)}</div>
                            <div className="text-sm text-gray-500">{usage.usedAt}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowVoucherModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Đóng
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Voucher Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Tạo voucher mới
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoRefresh className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveVoucher(); }}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên voucher</label>
                        <input
                          type="text"
                          value={newVoucher.name}
                          onChange={(e) => setNewVoucher({...newVoucher, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nhập tên voucher"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã voucher</label>
                        <input
                          type="text"
                          value={newVoucher.code}
                          onChange={(e) => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nhập mã voucher"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
                        <select
                          value={newVoucher.type}
                          onChange={(e) => setNewVoucher({...newVoucher, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        >
                          <option value="percentage">Phần trăm (%)</option>
                          <option value="fixed">Số tiền cố định (VND)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {newVoucher.type === 'percentage' ? 'Phần trăm giảm' : 'Số tiền giảm (VND)'}
                        </label>
                        <input
                          type="number"
                          value={newVoucher.value}
                          onChange={(e) => setNewVoucher({...newVoucher, value: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                          max={newVoucher.type === 'percentage' ? 100 : undefined}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị đơn hàng tối thiểu (VND)</label>
                        <input
                          type="number"
                          value={newVoucher.minOrderValue}
                          onChange={(e) => setNewVoucher({...newVoucher, minOrderValue: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá tối đa (VND)</label>
                        <input
                          type="number"
                          value={newVoucher.maxDiscount}
                          onChange={(e) => setNewVoucher({...newVoucher, maxDiscount: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn sử dụng</label>
                        <input
                          type="number"
                          value={newVoucher.usageLimit}
                          onChange={(e) => setNewVoucher({...newVoucher, usageLimit: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                          placeholder="0 = không giới hạn"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                        <input
                          type="date"
                          value={newVoucher.startDate}
                          onChange={(e) => setNewVoucher({...newVoucher, startDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                      <input
                        type="date"
                        value={newVoucher.endDate}
                        onChange={(e) => setNewVoucher({...newVoucher, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                      <textarea
                        value={newVoucher.description}
                        onChange={(e) => setNewVoucher({...newVoucher, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="3"
                        placeholder="Mô tả chi tiết về voucher..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Điều kiện sử dụng</label>
                      <input
                        type="text"
                        value={newVoucher.conditions.join(', ')}
                        onChange={(e) => setNewVoucher({...newVoucher, conditions: e.target.value.split(',').map(condition => condition.trim()).filter(condition => condition)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nhập điều kiện cách nhau bởi dấu phẩy"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Tạo voucher
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Voucher Modal */}
        {showEditModal && editingVoucher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Chỉnh sửa voucher
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên voucher
                      </label>
                      <input
                        type="text"
                        value={editingVoucher.name}
                        onChange={(e) => setEditingVoucher({...editingVoucher, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nhập tên voucher"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã voucher
                      </label>
                      <input
                        type="text"
                        value={editingVoucher.code}
                        onChange={(e) => setEditingVoucher({...editingVoucher, code: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nhập mã voucher"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại giảm giá
                      </label>
                      <select
                        value={editingVoucher.type}
                        onChange={(e) => setEditingVoucher({...editingVoucher, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="percentage">Phần trăm</option>
                        <option value="fixed">Số tiền cố định</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá trị giảm
                      </label>
                      <input
                        type="number"
                        value={editingVoucher.value}
                        onChange={(e) => setEditingVoucher({...editingVoucher, value: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nhập giá trị giảm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày bắt đầu
                      </label>
                      <input
                        type="date"
                        value={editingVoucher.startDate}
                        onChange={(e) => setEditingVoucher({...editingVoucher, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày kết thúc
                      </label>
                      <input
                        type="date"
                        value={editingVoucher.endDate}
                        onChange={(e) => setEditingVoucher({...editingVoucher, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số lượng
                      </label>
                      <input
                        type="number"
                        value={editingVoucher.quantity}
                        onChange={(e) => setEditingVoucher({...editingVoucher, quantity: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nhập số lượng"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                      </label>
                      <select
                        value={editingVoucher.status}
                        onChange={(e) => setEditingVoucher({...editingVoucher, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                        <option value="expired">Hết hạn</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={editingVoucher.description}
                      onChange={(e) => setEditingVoucher({...editingVoucher, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nhập mô tả voucher"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherManagement;

