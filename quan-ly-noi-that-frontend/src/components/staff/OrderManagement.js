import React, { useState, useEffect } from 'react';
import { IoSearch, IoEye, IoCreate, IoTrash, IoReceipt, IoTime, IoCheckmark, IoClose, IoPrint, IoDownload } from 'react-icons/io5';
import api from '../../api';

const OrderManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    status: 'pending',
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    shippingAddress: '',
    notes: ''
  });

  // Map order from API to UI
  const mapOrderFromApi = (order) => ({
    id: order.maDonHang || order.id,
    orderNumber: order.soDonHang || `ORD-${order.maDonHang}`,
    customerName: order.khachHang?.hoTen || order.customerName || '',
    customerPhone: order.khachHang?.soDienThoai || order.customerPhone || '',
    customerEmail: order.khachHang?.email || order.customerEmail || '',
    items: order.chiTietDonHangList?.map(item => ({
      name: item.bienTheSanPham?.sanPham?.tenSanPham || item.name || '',
      quantity: item.soLuong || item.quantity || 0,
      price: item.donGia || item.price || 0
    })) || [],
    subtotal: order.tongTien || order.subtotal || 0,
    discount: order.giamGia || order.discount || 0,
    total: order.tongTienSauGiam || order.total || 0,
    status: mapOrderStatus(order.trangThai || order.status),
    paymentMethod: order.phuongThucThanhToan || order.paymentMethod || 'cash',
    paymentStatus: order.trangThaiThanhToan || (order.daThanhToan ? 'paid' : 'unpaid'),
    shippingAddress: order.diaChiGiaoHang || order.shippingAddress || '',
    createdAt: order.ngayTao || order.createdAt || '',
    updatedAt: order.ngayCapNhat || order.updatedAt || '',
    notes: order.ghiChu || order.notes || ''
  });

  const mapOrderStatus = (status) => {
    const statusMap = {
      'Chờ xác nhận': 'pending',
      'Đã xác nhận': 'confirmed',
      'Đang xử lý': 'processing',
      'Đang giao hàng': 'shipping',
      'Đã giao hàng': 'completed',
      'Đã hủy': 'cancelled'
    };
    return statusMap[status] || status;
  };

  const mapOrderToApi = (order) => ({
    maKhachHang: order.customerId,
    phuongThucThanhToan: order.paymentMethod,
    trangThai: order.status,
    ghiChu: order.notes,
    diaChiGiaoHang: order.shippingAddress,
    chiTietDonHangList: order.items.map(item => ({
      maBienThe: item.variantId,
      soLuong: item.quantity,
      donGia: item.price
    }))
  });

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/banhang/donhang');
        if (Array.isArray(data)) {
          setOrders(data.map(mapOrderFromApi));
        }
      } catch (err) {
        console.error('Fetch orders error', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      customerName: 'Nguyễn Văn An',
      customerPhone: '0123456789',
      customerEmail: 'an.nguyen@email.com',
      items: [
        { name: 'Ghế gỗ cao cấp', quantity: 2, price: 2500000 },
        { name: 'Bàn ăn 6 người', quantity: 1, price: 4500000 }
      ],
      subtotal: 9500000,
      discount: 500000,
      total: 9000000,
      status: 'pending',
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
      shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
      createdAt: '2024-01-15 10:30:00',
      updatedAt: '2024-01-15 10:30:00',
      notes: 'Khách hàng yêu cầu giao hàng vào buổi chiều'
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      customerName: 'Trần Thị Bình',
      customerPhone: '0987654321',
      customerEmail: 'binh.tran@email.com',
      items: [
        { name: 'Tủ quần áo 3 cánh', quantity: 1, price: 3200000 }
      ],
      subtotal: 3200000,
      discount: 0,
      total: 3200000,
      status: 'completed',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      shippingAddress: '456 Đường XYZ, Quận 2, TP.HCM',
      createdAt: '2024-01-14 14:20:00',
      updatedAt: '2024-01-14 16:45:00',
      notes: 'Đã thanh toán và giao hàng'
    },
    {
      id: 3,
      orderNumber: 'ORD-2024-003',
      customerName: 'Lê Văn Cường',
      customerPhone: '0369852147',
      customerEmail: 'cuong.le@email.com',
      items: [
        { name: 'Giường ngủ gỗ', quantity: 1, price: 6000000 },
        { name: 'Tủ quần áo 3 cánh', quantity: 1, price: 3200000 }
      ],
      subtotal: 9200000,
      discount: 1000000,
      total: 8200000,
      status: 'processing',
      paymentMethod: 'transfer',
      paymentStatus: 'paid',
      shippingAddress: '789 Đường DEF, Quận 3, TP.HCM',
      createdAt: '2024-01-13 09:15:00',
      updatedAt: '2024-01-13 11:30:00',
      notes: 'Đang chuẩn bị hàng'
    }
  ]);

  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đã giao hàng';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'unpaid': return 'Chưa thanh toán';
      case 'partial': return 'Thanh toán một phần';
      default: return 'Không xác định';
    }
  };

  const handleAddOrder = async () => {
    if (newOrder.customerName) {
      try {
        const orderData = mapOrderToApi(newOrder);
        const response = await api.post('/api/banhang/donhang', orderData); // Fixed: aligned with backend endpoint
        
        const savedOrder = {
          id: response.maDonHang || Date.now(),
          orderNumber: `ORD-${response.maDonHang || Date.now()}`,
          date: new Date().toLocaleDateString('vi-VN'),
          ...newOrder
        };
        
        setOrders([...orders, savedOrder]);
        setNewOrder({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          items: [],
          subtotal: 0,
          discount: 0,
          total: 0,
          status: 'pending',
          paymentMethod: 'cash',
          paymentStatus: 'unpaid',
          shippingAddress: '',
          notes: ''
        });
        setShowAddModal(false);
      } catch (err) {
        console.error('Create order error', err);
        setError(err);
      }
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await api.delete(`/api/banhang/donhang/${id}`);
      setOrders(orders.filter(order => order.id !== id));
    } catch (err) {
      console.error('Delete order error', err);
      setError(err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/banhang/donhang/${orderId}/trangthai`, { trangThai: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toLocaleString('vi-VN') }
          : order
      ));
      setShowStatusModal(false);
    } catch (err) {
      console.error('Update order status error', err);
      setError(err);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const handlePrintOrder = (order) => {
    // In thực tế sẽ mở cửa sổ in
    console.log('In đơn hàng:', order.orderNumber);
  };

  const handleExportOrder = (order) => {
    // Xuất file thực tế sẽ tạo file PDF/Excel
    console.log('Xuất đơn hàng:', order.orderNumber);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone.includes(searchTerm) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus;
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Đơn hàng</h1>
          <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IoReceipt className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <IoTime className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IoCreate className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <IoCheckmark className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <IoClose className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã hủy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đã giao hàng</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tất cả thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="unpaid">Chưa thanh toán</option>
                <option value="partial">Thanh toán một phần</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách đơn hàng</h3>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <IoReceipt className="w-4 h-4" />
              Thêm đơn hàng
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.paymentMethod === 'cash' ? 'Tiền mặt' : 
                         order.paymentMethod === 'card' ? 'Thẻ' : 'Chuyển khoản'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items.length} sản phẩm
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.slice(0, 2).map(item => item.name).join(', ')}
                        {order.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.total.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{order.createdAt}</div>
                      {order.updatedAt !== order.createdAt && (
                        <div className="text-xs text-gray-400">Cập nhật: {order.updatedAt}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Xem chi tiết"
                        >
                          <IoEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStatusModal(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Cập nhật trạng thái"
                        >
                          <IoCreate className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintOrder(order)}
                          className="text-purple-600 hover:text-purple-800"
                          title="In đơn hàng"
                        >
                          <IoPrint className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportOrder(order)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Xuất file"
                        >
                          <IoDownload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setOrders(orders.filter(o => o.id !== order.id))}
                          className="text-red-600 hover:text-red-800"
                          title="Xóa"
                        >
                          <IoTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        {showOrderDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Chi tiết đơn hàng {selectedOrder.orderNumber}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Thông tin khách hàng</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900">{selectedOrder.customerName}</p>
                      <p className="text-gray-600">{selectedOrder.customerPhone}</p>
                      <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                      <p className="text-gray-600 mt-2">{selectedOrder.shippingAddress}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Thông tin thanh toán</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900">
                        Phương thức: {selectedOrder.paymentMethod === 'cash' ? 'Tiền mặt' : 
                                     selectedOrder.paymentMethod === 'card' ? 'Thẻ' : 'Chuyển khoản'}
                      </p>
                      <p className="text-gray-600">
                        Trạng thái: {getPaymentStatusText(selectedOrder.paymentStatus)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ghi chú</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">{selectedOrder.notes || 'Không có ghi chú'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Sản phẩm</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.price.toLocaleString('vi-VN')}đ/SP
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Tổng kết</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tạm tính:</span>
                        <span>{selectedOrder.subtotal.toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Giảm giá:</span>
                        <span>{selectedOrder.discount.toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Tổng cộng:</span>
                        <span>{selectedOrder.total.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Trạng thái đơn hàng</h4>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Tạo lúc: {selectedOrder.createdAt}
                      </span>
                    </div>
                    {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Cập nhật lúc: {selectedOrder.updatedAt}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowOrderDetailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowOrderDetailModal(false);
                    setShowStatusModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Cập nhật trạng thái
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Cập nhật trạng thái đơn hàng</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Đơn hàng: {selectedOrder.orderNumber}</h4>
                  <p className="text-gray-600">Khách hàng: {selectedOrder.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái hiện tại
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái mới
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Chọn trạng thái mới</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipped">Đã giao hàng</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú cập nhật
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập ghi chú cập nhật trạng thái"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, newStatus)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Order Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Thêm đơn hàng mới
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoClose className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); console.log('Adding new order:', newOrder); setShowAddModal(false); }}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                        <input
                          type="text"
                          value={newOrder.customerName}
                          onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nhập tên khách hàng"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input
                          type="tel"
                          value={newOrder.customerPhone}
                          onChange={(e) => setNewOrder({...newOrder, customerPhone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nhập số điện thoại"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={newOrder.customerEmail}
                          onChange={(e) => setNewOrder({...newOrder, customerEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nhập email"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                        <select
                          value={newOrder.paymentMethod}
                          onChange={(e) => setNewOrder({...newOrder, paymentMethod: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        >
                          <option value="cash">Tiền mặt</option>
                          <option value="card">Thẻ</option>
                          <option value="bank">Chuyển khoản</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
                      <textarea
                        value={newOrder.shippingAddress}
                        onChange={(e) => setNewOrder({...newOrder, shippingAddress: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="3"
                        placeholder="Nhập địa chỉ giao hàng"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select
                          value={newOrder.status}
                          onChange={(e) => setNewOrder({...newOrder, status: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="shipped">Đã giao</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
                        <select
                          value={newOrder.paymentStatus}
                          onChange={(e) => setNewOrder({...newOrder, paymentStatus: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        >
                          <option value="unpaid">Chưa thanh toán</option>
                          <option value="paid">Đã thanh toán</option>
                          <option value="partial">Thanh toán một phần</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                      <textarea
                        value={newOrder.notes}
                        onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="3"
                        placeholder="Nhập ghi chú bổ sung..."
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
                      Thêm đơn hàng
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

export default OrderManagement;


