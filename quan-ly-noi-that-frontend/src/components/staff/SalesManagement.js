import React, { useState, useEffect } from 'react';
import { IoAdd, IoSearch, IoCreate, IoTrash, IoEye, IoCart, IoReceipt, IoPerson, IoTime, IoCheckmark, IoClose } from 'react-icons/io5';
import api from '../../api';

const SalesManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map sales data from API
  const mapSalesFromApi = (sale) => ({
    id: sale.maBanHang || sale.id,
    orderNumber: sale.maDonHang || sale.orderNumber,
    customerName: sale.khachHang?.hoTen || sale.customerName || '',
    customerPhone: sale.khachHang?.soDienThoai || sale.customerPhone || '',
    items: sale.chiTietDonHangList?.map(item => ({
      name: item.bienTheSanPham?.sanPham?.tenSanPham || item.name,
      quantity: item.soLuong || item.quantity,
      price: item.donGia || item.price
    })) || [],
    subtotal: sale.tongTien || sale.subtotal || 0,
    discount: sale.giamGia || sale.discount || 0,
    total: sale.tongTienSauGiam || sale.total || 0,
    status: sale.trangThai || sale.status || 'pending',
    paymentMethod: sale.phuongThucThanhToan || sale.paymentMethod || 'cash',
    createdAt: sale.ngayTao || sale.createdAt || '',
    notes: sale.ghiChu || sale.notes || ''
  });

  // Fetch sales/orders
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/banhang/donhang');
        if (Array.isArray(data)) {
          setOrders(data.map(mapSalesFromApi));
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
      items: [
        { name: 'Ghế gỗ cao cấp', quantity: 2, price: 2500000 },
        { name: 'Bàn ăn 6 người', quantity: 1, price: 4500000 }
      ],
      subtotal: 9500000,
      discount: 500000,
      total: 9000000,
      status: 'pending',
      paymentMethod: 'cash',
      createdAt: '2024-01-15 10:30:00',
      notes: 'Khách hàng yêu cầu giao hàng vào buổi chiều'
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      customerName: 'Trần Thị Bình',
      customerPhone: '0987654321',
      items: [
        { name: 'Tủ quần áo 3 cánh', quantity: 1, price: 3200000 }
      ],
      subtotal: 3200000,
      discount: 0,
      total: 3200000,
      status: 'completed',
      paymentMethod: 'card',
      createdAt: '2024-01-14 14:20:00',
      notes: 'Đã thanh toán và giao hàng'
    }
  ]);

  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerPhone: '',
    items: [],
    discount: 0,
    paymentMethod: 'cash',
    notes: ''
  });

  const products = [
    { id: 1, name: 'Ghế gỗ cao cấp', price: 2500000, stock: 15 },
    { id: 2, name: 'Bàn ăn 6 người', price: 4500000, stock: 8 },
    { id: 3, name: 'Tủ quần áo 3 cánh', price: 3200000, stock: 5 },
    { id: 4, name: 'Giường ngủ gỗ', price: 6000000, stock: 3 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const handleCreateOrder = () => {
    const order = {
      id: orders.length + 1,
      orderNumber: `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`,
      ...newOrder,
      subtotal: newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      total: newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - newOrder.discount,
      status: 'pending',
      createdAt: new Date().toLocaleString('vi-VN')
    };
    setOrders([order, ...orders]);
    setNewOrder({
      customerName: '',
      customerPhone: '',
      items: [],
      discount: 0,
      paymentMethod: 'cash',
      notes: ''
    });
    setShowCreateOrderModal(false);
  };

  const handleAddItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: newItems });
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...newOrder.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setNewOrder({ ...newOrder, items: newItems });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const handleProcessPayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleCompletePayment = () => {
    setOrders(orders.map(order => 
      order.id === selectedOrder.id 
        ? { ...order, status: 'completed' }
        : order
    ));
    setShowPaymentModal(false);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Bán hàng</h1>
          <p className="text-gray-600">Tạo đơn hàng và xử lý thanh toán</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IoCart className="w-6 h-6 text-blue-600" />
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <IoReceipt className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders
                    .filter(o => o.status === 'completed')
                    .reduce((sum, o) => sum + o.total, 0)
                    .toLocaleString('vi-VN')}đ
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
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Create Order Button */}
            <button
              onClick={() => setShowCreateOrderModal(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <IoAdd className="w-5 h-5" />
              Tạo đơn hàng
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                        {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Thẻ'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerPhone}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt}
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
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleProcessPayment(order)}
                            className="text-green-600 hover:text-green-800"
                            title="Xử lý thanh toán"
                          >
                            <IoReceipt className="w-4 h-4" />
                          </button>
                        )}
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

        {/* Create Order Modal */}
        {showCreateOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Tạo đơn hàng mới</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên khách hàng
                    </label>
                    <input
                      type="text"
                      value={newOrder.customerName}
                      onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nhập tên khách hàng"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={newOrder.customerPhone}
                      onChange={(e) => setNewOrder({...newOrder, customerPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phương thức thanh toán
                    </label>
                    <select
                      value={newOrder.paymentMethod}
                      onChange={(e) => setNewOrder({...newOrder, paymentMethod: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="cash">Tiền mặt</option>
                      <option value="card">Thẻ</option>
                      <option value="transfer">Chuyển khoản</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giảm giá (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={newOrder.discount}
                      onChange={(e) => setNewOrder({...newOrder, discount: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nhập số tiền giảm giá"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={newOrder.notes}
                      onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nhập ghi chú"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Sản phẩm</h4>
                    <button
                      onClick={handleAddItem}
                      className="flex items-center gap-2 text-primary hover:text-primary/80"
                    >
                      <IoAdd className="w-4 h-4" />
                      Thêm sản phẩm
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {newOrder.items.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sản phẩm
                            </label>
                            <select
                              value={item.name}
                              onChange={(e) => {
                                const selectedProduct = products.find(p => p.name === e.target.value);
                                handleUpdateItem(index, 'name', e.target.value);
                                if (selectedProduct) {
                                  handleUpdateItem(index, 'price', selectedProduct.price);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">Chọn sản phẩm</option>
                              {products.map(product => (
                                <option key={product.id} value={product.name}>
                                  {product.name} - {product.price.toLocaleString('vi-VN')}đ
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Số lượng
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Giá
                            </label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(index, 'price', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">
                            Thành tiền: {(item.quantity * item.price).toLocaleString('vi-VN')}đ
                          </span>
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <IoTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Tạm tính:</span>
                      <span>{newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Giảm giá:</span>
                      <span>{newOrder.discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Tổng cộng:</span>
                      <span>{(newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - newOrder.discount).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateOrderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Tạo đơn hàng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {showOrderDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Chi tiết đơn hàng {selectedOrder.orderNumber}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Thông tin khách hàng</h4>
                    <p className="text-gray-600">{selectedOrder.customerName}</p>
                    <p className="text-gray-600">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phương thức thanh toán</h4>
                    <p className="text-gray-600">
                      {selectedOrder.paymentMethod === 'cash' ? 'Tiền mặt' : 
                       selectedOrder.paymentMethod === 'card' ? 'Thẻ' : 'Chuyển khoản'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ghi chú</h4>
                    <p className="text-gray-600">{selectedOrder.notes || 'Không có ghi chú'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Sản phẩm</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
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
                  <div>
                    <h4 className="font-semibold text-gray-900">Trạng thái</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
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
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowOrderDetailModal(false);
                      handleProcessPayment(selectedOrder);
                    }}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Xử lý thanh toán
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Xử lý thanh toán</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Đơn hàng: {selectedOrder.orderNumber}</h4>
                  <p className="text-gray-600">Khách hàng: {selectedOrder.customerName}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Tổng tiền: {selectedOrder.total.toLocaleString('vi-VN')}đ</h4>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Phương thức thanh toán</h4>
                  <p className="text-gray-600">
                    {selectedOrder.paymentMethod === 'cash' ? 'Tiền mặt' : 
                     selectedOrder.paymentMethod === 'card' ? 'Thẻ' : 'Chuyển khoản'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú thanh toán
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập ghi chú thanh toán"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCompletePayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Hoàn tất thanh toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesManagement;


