import React, { useState, useEffect, useCallback } from 'react';
import { IoAdd, IoSearch, IoTrash, IoEye, IoCart, IoReceipt, IoTime, IoCheckmark } from 'react-icons/io5';
import api from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

const SalesManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map sales data from API (compute items first so subtotal/total can fall back to items sum)
  const mapSalesFromApi = useCallback((sale) => {
    const items = (sale.chiTietDonHangList || []).map(item => ({
      name: item.bienTheSanPham?.sanPham?.tenSanPham ?? item.sanPham?.tenSanPham ?? item.tenSanPham ?? item.ten ?? item.name ?? item.bienTheSanPham?.ten ?? '',
      quantity: Number(item.soLuong ?? item.quantity ?? item.so_luong ?? 0),
      price: Number(item.donGia ?? item.price ?? item.giaBan ?? item.unitPrice ?? 0)
    }));

    const itemsSum = items.reduce((acc, it) => acc + (Number(it.quantity || 0) * Number(it.price || 0)), 0);

    const reportedSubtotal = Number(sale.tongTien ?? sale.subtotal ?? 0);
    const subtotal = (reportedSubtotal && !Number.isNaN(reportedSubtotal) && reportedSubtotal > 0) ? reportedSubtotal : itemsSum;

    // Prefer backend-provided totals when available
    const backendTongGiamGia = sale.tongGiamGia ?? sale.tong_giam_gia ?? sale.tongGiamgia ?? sale.totalDiscount ?? null;

    // compute discount as sum of voucher + points + vip discounts when backend total not provided
    const voucherDiscount = Number(sale.giam_gia_voucher ?? sale.giamGiaVoucher ?? sale.tienGiamVoucher ?? 0);
    const pointsDiscount = Number(sale.giam_gia_diem_thuong ?? sale.giamGiaDiemThuong ?? sale.tienGiamTuDiem ?? 0);
    const vipDiscount = Number(sale.giam_gia_vip ?? sale.giamGiaVip ?? 0);
    const rawDiscount = Number(sale.giamGia ?? sale.discount ?? 0);
    const computedDiscount = (rawDiscount && rawDiscount > 0) ? rawDiscount : (voucherDiscount + pointsDiscount + vipDiscount);
    const discount = (backendTongGiamGia !== null && backendTongGiamGia !== undefined) ? Number(backendTongGiamGia) : computedDiscount;

    const diemThuongNhanDuoc = Number(sale.diemThuongNhanDuoc ?? sale.diem_thuong_nhan_duoc ?? sale.diemThuongNhan ?? sale.diemVipThuong ?? 0);

    const reportedTotal = Number(sale.tongTienSauGiam ?? sale.total ?? sale.tongCong ?? sale.tongTien ?? 0);
    const total = (reportedTotal && !Number.isNaN(reportedTotal) && reportedTotal > 0) ? reportedTotal : Math.max(0, itemsSum - discount);

    return {
      // Normalize identifier: backend may return maDonHang, maBanHang or id
      id: sale.maDonHang ?? sale.maBanHang ?? sale.id,
      orderNumber: sale.maDonHang ?? sale.orderNumber ?? String(sale.id ?? ''),
      customerName: (
        sale.khachHang?.hoTen ??
        sale.khachHang?.tenKhachHang ??
        sale.khachHang?.ten ??
        sale.tenKhachHang ??
        sale.hoTen ??
        (typeof sale.khachHang === 'string' ? sale.khachHang : undefined) ??
        sale.customerName ??
        ''
      ),
      customerPhone: sale.khachHang?.soDienThoai ?? sale.customerPhone ?? '',
      items,
      subtotal,
      discount,
      total,
      // expose backend discount breakdown if available
      giamGiaVoucher: voucherDiscount,
      giamGiaDiemThuong: pointsDiscount,
      giamGiaVip: vipDiscount,
      diemThuongNhanDuoc,
      tongGiamGia: (backendTongGiamGia !== null && backendTongGiamGia !== undefined) ? Number(backendTongGiamGia) : undefined,
      status: normalizeStatus(sale.trangThai ?? sale.status),
      paymentMethod: normalizePaymentMethod(sale.phuongThucThanhToan ?? sale.paymentMethod),
      // try multiple fields for creation time (may be in various shapes). Prefer server-provided formatted string when available
      createdAt: (sale.ngayDatHangStr ?? sale.ngayDatHang ?? sale.ngayTao ?? sale.createdAt ?? sale.ngayTaoGio ?? sale.thoiGianTao ?? sale.created_at ?? sale.createdDate) ?? '',
      notes: sale.ghiChu ?? sale.notes ?? ''
    };
  }, []);

  // Normalizers
  const normalizeStatus = (raw) => {
    if (raw === null || raw === undefined) return 'pending';
    const s = String(raw).trim().toLowerCase();
    if (!s) return 'pending';
    // map common variants and backend constants
    if (['pending', 'cho xac nhan', 'chờ xác nhận', 'chờ xử lý', 'cho xu ly', 'cho-xac-nhan', 'cho_xac_nhan', 'cho_xu_ly'].includes(s)) return 'pending';
    if (['processing', 'dang xu ly', 'đang xử lý', 'dang-xu-ly', 'xac_nhan', 'xac-nhan', 'xacnhan', 'xac nhan', 'xác nhận', 'xacnhan', 'xác nhận'].includes(s)) return 'processing';
    if (['preparing', 'dang_chuan_bi', 'dang chuan bi', 'đang chuẩn bị', 'dang-chuan-bi', 'dang chuan bi'].includes(s)) return 'processing';
    if (['shipping', 'dang giao', 'đang giao', 'dang-giao', 'dang_giao', 'dang giao'].includes(s) || s === 'dang_giao' || s === 'dang giao') return 'shipping';
    if (['completed', 'hoan thanh', 'hoàn thành', 'completed', 'hoan_thanh', 'hoan-thanh', 'hoant hanh'].includes(s)) return 'completed';
    if (['cancelled', 'huy', 'hủy', 'da huy', 'đã hủy', 'huy_bo', 'huy-bo', 'huybo'].includes(s)) return 'cancelled';
    // backend constant names
    if (s === 'cho_xac_nhan' || s === 'xac_nhan' || s === 'dang_chuan_bi' || s === 'dang_giao' || s === 'hoan_thanh' || s === 'huy_bo') {
      if (s === 'dang_giao') return 'shipping';
      if (s === 'hoan_thanh') return 'completed';
      if (s === 'huy_bo') return 'cancelled';
      if (s === 'cho_xac_nhan') return 'pending';
      return 'processing';
    }
    return 'pending';
  };

  const normalizePaymentMethod = (raw) => {
    if (!raw && raw !== '') return 'cash';
    const p = String(raw).trim().toLowerCase();
    if (['card', 'thẻ', 'the', 'card_payment'].includes(p)) return 'card';
    // treat many server variants as cash by default
    return 'cash';
  };

  // Fetch sales/orders and products
  // mapSalesFromApi is stable (useCallback) so it's safe to include in deps
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const ordersData = await api.get('/api/banhang/donhang').catch(() => []);
        // product/variant list is fetched separately when opening the Create Order modal to prefer variant search

        if (Array.isArray(ordersData)) {
          setOrders(ordersData.map(mapSalesFromApi));
        }

        // productsData not used in admin flow; skip
      } catch (err) {
        console.error('Fetch data error', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [mapSalesFromApi]);

  // modal/state must be declared before effects that reference it
  const [variants, setVariants] = useState([]);
  const [variantQuery, setVariantQuery] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null); // { maVoucherCode, giamGiaVoucher, type, value, maxDiscount }

  // API Functions
  const createOrder = async (orderData) => {
    const response = await api.post('/api/banhang/donhang', orderData);
    return response;
  };

  const updateOrder = async (id, orderData) => {
    const response = await api.put(`/api/banhang/donhang/${id}`, orderData);
    return response;
  };

  const deleteOrder = async (id) => {
    const response = await api.delete(`/api/banhang/donhang/${id}`);
    return response;
  };

  const [orders, setOrders] = useState([]);

  // get logged-in user (staff) from AuthContext to identify who updates statuses
  const { user } = useAuth();

  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [createStep, setCreateStep] = useState(1); // 1 = chọn sản phẩm, 2 = thông tin & review
  // fetch variants when the Create Order modal opens so admin can search/select specific product variants
  useEffect(() => {
    if (!showCreateOrderModal) return;

    let active = true;
    const fetchVariants = async (q = '') => {
      try {
        const res = await api.get(`/api/v1/admin/san-pham/search?q=${encodeURIComponent(q || '')}`);
        if (!active) return;
        if (Array.isArray(res)) {
          setVariants(res.map(v => ({
            maBienThe: v.maBienThe ?? v.ma_bien_the ?? v.id ?? v.ma,
            sku: v.sku ?? v.maBienThe ?? '',
            tenSanPham: v.tenSanPham ?? v.ten ?? '',
            giaBan: Number(v.giaBan ?? v.gia ?? 0),
            soLuongTon: Number(v.soLuongTon ?? v.stock ?? 0),
            attributes: v.attributes ?? v.giaTriThuocTinhs ?? v.gia_tri_thuoc_tinhs ?? []
          })));
        }
      } catch (e) {
        console.warn('Variant search failed', e);
        if (active) setVariants([]);
      }
    };

    fetchVariants('');
    return () => { active = false; };
  }, [showCreateOrderModal]);
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

  // local toast fallback for admin page
  const showToast = (message, type = 'success') => {
    if (type === 'error') {
      alert(message);
    } else {
      // keep simple for admin flows
      console.info('[Toast]', message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipping': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipping': return 'Đang giao';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    const d = (value instanceof Date) ? value : new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleString('vi-VN');
  };

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        tenKhachHang: newOrder.customerName,
        soDienThoai: newOrder.customerPhone,
        chiTietDonHangList: newOrder.items.map(item => ({
          tenSanPham: item.name,
          soLuong: item.quantity,
          donGia: item.price,
          maBienThe: item.maBienThe // include variant id when admin selected a specific variant
        })),
        giamGia: appliedVoucher?.giamGiaVoucher ?? newOrder.discount,
        maVoucherCode: appliedVoucher?.maVoucherCode || voucherCode || null,
        phuongThucThanhToan: newOrder.paymentMethod,
        ghiChu: newOrder.notes,
        trangThai: 'Chờ xác nhận'
      };

      await createOrder(orderData);

      // Refresh data
      const data = await api.get('/api/banhang/donhang');
      if (Array.isArray(data)) {
        setOrders(data.map(mapSalesFromApi));
      }

      setNewOrder({
        customerName: '',
        customerPhone: '',
        items: [],
        discount: 0,
        paymentMethod: 'cash',
        notes: ''
      });
      setShowCreateOrderModal(false);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng!');
    }
  };

  const handleAddItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: '', maBienThe: null, quantity: 1, price: 0 }]
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

  // Voucher functions: apply (server-validated) and clear
  const applyVoucher = async () => {
    if (!voucherCode || voucherCode.trim() === '') {
      alert('Vui lòng nhập mã voucher');
      return;
    }

    try {
      // Compose minimal request similar to customer checkout: maKhachHang is optional for admin flow
      const subtotal = newOrder.items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
      const payload = { maKhachHang: null, maVoucherCode: voucherCode.trim(), orderAmountForCheck: subtotal };
      const res = await api.post('/api/thanhtoan/apply-voucher', payload).catch(err => err?.data || err);
      if (!res) {
        alert('Không thể áp dụng voucher lúc này');
        return;
      }
      if (!res.success) {
        alert(res.message || 'Voucher không hợp lệ');
        return;
      }
      // res.giamGiaVoucher is the discount amount
      setAppliedVoucher({ maVoucherCode: res.maVoucherCode || voucherCode.trim(), giamGiaVoucher: Number(res.giamGiaVoucher || 0), raw: res });
      // distribute discount proportionally to items for preview
      distributeVoucherDiscount(Number(res.giamGiaVoucher || 0));
      showToast('Áp dụng voucher thành công');
    } catch (err) {
      console.error('Apply voucher error', err);
      alert('Lỗi khi áp dụng voucher');
    }
  };

  const clearVoucher = () => {
    setVoucherCode('');
    setAppliedVoucher(null);
    // reset item prices to their original variant price if available
    setNewOrder(prev => ({ ...prev, items: prev.items.map(it => ({ ...it, price: it._origPrice ?? it.price })) }));
  };

  const distributeVoucherDiscount = (discountAmount, itemsArg = null) => {
    if (!discountAmount || discountAmount <= 0) return;
    const items = Array.isArray(itemsArg) ? itemsArg : (newOrder.items || []);
    // Use _origPrice when present as the base for computing shares
    const subtotal = items.reduce((s, it) => s + (Number(it._origPrice != null ? it._origPrice : it.price || 0) * Number(it.quantity || 0)), 0);
    if (subtotal <= 0) return;

    // Keep original price snapshot so clearing voucher can restore it
    const updated = items.map(it => ({ ...it, _origPrice: it._origPrice ?? it.price }));

    // For each item, compute its share of the discount proportional to base line total
    const withDistributed = updated.map(it => {
      const baseLine = Number(it._origPrice || it.price) * Number(it.quantity || 0);
      const share = (baseLine / subtotal) * discountAmount;
      const unitDiscount = share / (it.quantity || 1);
      const newPrice = Math.max(0, Number(it._origPrice || it.price) - unitDiscount);
      return { ...it, price: Math.round(newPrice) };
    });

    setNewOrder(prev => ({ ...prev, items: withDistributed }));
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const handleProcessPayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleCompletePayment = async () => {
    try {
      await updateOrder(selectedOrder.id, { trangThai: 'completed' });
      // Refresh orders data
      const ordersData = await api.get('/api/banhang/donhang');
      if (Array.isArray(ordersData)) {
        setOrders(ordersData.map(mapSalesFromApi));
      }
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Complete payment error', err);
      setError(err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      try {
        await deleteOrder(orderId);
        // Refresh orders data
        const ordersData = await api.get('/api/banhang/donhang');
        if (Array.isArray(ordersData)) {
          setOrders(ordersData.map(mapSalesFromApi));
        }
      } catch (err) {
        console.error('Delete order error', err);
        setError(err);
      }
    }
  };
  const callStatusEndpoint = async (orderId, action, payload = {}) => {
    switch (action) {
      case 'confirm':
        return api.post(`/api/v1/quan-ly-trang-thai-don-hang/${orderId}/confirm`, { body: payload });
      case 'prepare':
        return api.post(`/api/v1/quan-ly-trang-thai-don-hang/${orderId}/prepare`, { body: payload });
      case 'ship':
        return api.post(`/api/v1/quan-ly-trang-thai-don-hang/${orderId}/ship`, { body: payload });
      case 'complete':
        return api.post(`/api/v1/quan-ly-trang-thai-don-hang/${orderId}/complete`, { body: payload });
      case 'cancel':
        return api.post(`/api/v1/quan-ly-trang-thai-don-hang/${orderId}/cancel`, { body: payload });
      default:
        return api.put(`/api/v1/quan-ly-trang-thai-don-hang/cap-nhat-trang-thai/${orderId}`, { body: payload });
    }
  };

  const handleChangeStatus = async (orderId, newStatus) => {
    if (!orderId || !newStatus) {
      console.warn('handleChangeStatus called with invalid args', { orderId, newStatus });
      return;
    }

    // Optimistic UI: update the order status locally first so the select reflects the change immediately
    const prevOrders = [...orders];
    const updated = prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);

    try {
      console.log('Updating status for order', orderId, '->', newStatus);
      // Prefer sending staff's display name, fall back to id or 'admin'
      const staffName = user?.hoTen ?? user?.name ?? user?.username ?? (user?.maNhanVien ? String(user.maNhanVien) : (user?.id ? String(user.id) : 'admin'));
      // Include maNhanVien when available (backend may accept it) so Postman-like payloads match
      const payload = { nguoiThayDoi: staffName, ghiChu: '', maNhanVien: user?.maNhanVien ?? user?.id };
      console.log('Status change payload:', payload);
      // Determine previous status from local prevOrders
      const prev = prevOrders.find(o => o.id === orderId);
      const prevStatus = prev?.status ?? 'pending';

      // If moving from pending -> processing, backend expects confirm first.
      // capture the response from the endpoint so we can update the specific order locally
      let resp = null;
      if (prevStatus === 'pending' && newStatus === 'processing') {
        console.log('Sequencing confirm -> prepare for pending -> processing');
        // call confirm endpoint first
        const confirmResp = await callStatusEndpoint(orderId, 'confirm', payload);
        console.log('Confirm response:', confirmResp);
        // then call prepare and capture its response
        resp = await callStatusEndpoint(orderId, 'prepare', payload);
      } else if (newStatus === 'pending') {
        resp = await callStatusEndpoint(orderId, 'confirm', payload);
      } else if (newStatus === 'processing') {
        resp = await callStatusEndpoint(orderId, 'prepare', payload);
      } else if (newStatus === 'shipping') {
        resp = await callStatusEndpoint(orderId, 'ship', payload);
      } else if (newStatus === 'completed') {
        resp = await callStatusEndpoint(orderId, 'complete', payload);
      } else if (newStatus === 'cancelled') {
        resp = await callStatusEndpoint(orderId, 'cancel', payload);
      } else {
        resp = await callStatusEndpoint(orderId, 'generic', { trangThaiMoi: newStatus, nguoiCapNhat: staffName, maNhanVien: user?.maNhanVien ?? user?.id });
      }

      // If backend returns the updated order, apply it locally to avoid full refetch
      // Note: backend includes `order` in the JSON response (controller added it).
      if (resp && resp.order) {
        try {
          const updatedOrder = mapSalesFromApi(resp.order);
          setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
        } catch (e) {
          // fallback to full refresh on mapping error
          const ordersData = await api.get('/api/banhang/donhang');
          if (Array.isArray(ordersData)) {
            setOrders(ordersData.map(mapSalesFromApi));
          }
        }
      } else {
        const ordersData = await api.get('/api/banhang/donhang');
        if (Array.isArray(ordersData)) {
          setOrders(ordersData.map(mapSalesFromApi));
        }
      }
    } catch (err) {
      // Log richer error details to help compare with Postman
      console.error('Update status error', err, 'status=', err?.status, 'data=', err?.data);
      setError(err);
      // revert optimistic update
      setOrders(prevOrders);
      const serverMsg = err?.data?.message || err?.data?.details || err?.message || 'Cập nhật trạng thái thất bại';
      // show a more informative alert for debugging
      alert(`Cập nhật trạng thái thất bại: ${serverMsg}`);
    }
  };

  const filteredOrders = orders.filter(order => {
    const q = String(searchTerm || '').toLowerCase();
    const orderNumber = String(order?.orderNumber ?? '').toLowerCase();
    const customerName = String(order?.customerName ?? '').toLowerCase();
    const customerPhone = String(order?.customerPhone ?? '');

    const matchesSearch = (
      orderNumber.includes(q) ||
      customerName.includes(q) ||
      customerPhone.includes(searchTerm)
    );

    const matchesStatus = selectedStatus === 'all' || order?.status === selectedStatus;
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
                <option value="shipping">Đang giao</option>
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

        {/* Loading / Error */}
        {isLoading && (
          <div className="mb-4 text-center text-gray-600">Đang tải dữ liệu đơn hàng...</div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {String(error)}
          </div>
        )}

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
                {filteredOrders.map((order, _idx) => (
                  <tr key={`${order.id ?? order.orderNumber ?? 'order'}-${_idx}`} className="hover:bg-gray-50">
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
                        {Number(order.items?.length || 0)} sản phẩm
                      </div>
                      <div className="text-sm text-gray-500">
                        {(order.items || [])
                          .map(i => String(i?.name || '').trim())
                          .filter(n => n.length > 0)
                          .slice(0, 2)
                          .join(', ')}
                        {(order.items || []).length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{Number(order.total || 0).toLocaleString('vi-VN')}đ</div>
                        {(order.tongGiamGia || order.tongGiamGia === 0) && (
                          <div className="text-xs text-gray-500">Giảm: {Number(order.tongGiamGia).toLocaleString('vi-VN')}đ</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <select
                          value={order.status ?? 'pending'}
                          onChange={(e) => handleChangeStatus(order.id, e.target.value)}
                          className="ml-2 px-2 py-1 border border-gray-200 rounded text-sm"
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="shipping">Đang giao</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
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
                          onClick={() => handleDeleteOrder(order.id)}
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
              {/* Step indicator */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`px-3 py-1 rounded-full ${createStep === 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>1. Chọn sản phẩm</div>
                <div className={`px-3 py-1 rounded-full ${createStep === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>2. Thông tin & Xác nhận</div>
              </div>

              {createStep === 1 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Sản phẩm</h4>
                    <button
                      onClick={handleAddItem}
                      className="flex items-center gap-2 text-primary hover:text-primary/80"
                    >
                      <IoAdd className="w-4 h-4" />
                      Thêm sản phẩm
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
                    {newOrder.items.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sản phẩm (tìm theo mã/sku hoặc tên)
                            </label>
                            <input
                              type="search"
                              value={variantQuery}
                              onChange={(e) => setVariantQuery(e.target.value)}
                              placeholder="Gõ mã hoặc tên để lọc"
                              className="mb-2 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <select
                              value={item.maBienThe ?? ''}
                              onChange={(e) => {
                                const selected = variants.find(v => String(v.maBienThe) === String(e.target.value));
                                // update full items array atomically
                                setNewOrder(prev => {
                                  const updated = (prev.items || []).map((it, i) => {
                                    if (i !== index) return it;
                                    if (selected) {
                                      const orig = Number(selected.giaBan || 0);
                                      return { ...it, maBienThe: selected.maBienThe, name: `${selected.sku || ''} - ${selected.tenSanPham || ''}`, _origPrice: orig, price: orig };
                                    }
                                    return { ...it, maBienThe: null, name: '', _origPrice: null, price: 0 };
                                  });
                                  return { ...prev, items: updated };
                                });
                                // if voucher applied, re-distribute discount after state settles
                                if (appliedVoucher && Number(appliedVoucher.giamGiaVoucher || 0) > 0) {
                                  setTimeout(() => distributeVoucherDiscount(Number(appliedVoucher.giamGiaVoucher || 0)), 0);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">Chọn biến thể</option>
                              {variants
                                .filter(v => {
                                  const q = String(variantQuery || '').trim().toLowerCase();
                                  if (!q) return true;
                                  return (String(v.sku || '').toLowerCase().includes(q) || String(v.tenSanPham || '').toLowerCase().includes(q));
                                })
                                .map(v => (
                                  <option key={v.maBienThe} value={v.maBienThe}>
                                    {v.sku ? `${v.sku} — ` : ''}{v.tenSanPham} {v.attributes && v.attributes.length ? `(${v.attributes.map(a => a.giaTri || a.value || a).join(',')})` : ''} — {Number(v.giaBan || 0).toLocaleString('vi-VN')}đ
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(index, 'price', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {item._origPrice != null && Number(item._origPrice) > Number(item.price) && (
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="line-through">{Number(item._origPrice).toLocaleString('vi-VN')}đ</span>
                                <span className="ml-2 text-green-700">-{(Number(item._origPrice) - Number(item.price)).toLocaleString('vi-VN')}đ</span>
                              </div>
                            )}
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
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => { setShowCreateOrderModal(false); setCreateStep(1); }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCreateStep(2)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                      >
                        Tiếp theo
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                        <input type="text" value={newOrder.customerName} onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nhập tên khách hàng" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input type="tel" value={newOrder.customerPhone} onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nhập số điện thoại" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                        <select value={newOrder.paymentMethod} onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                          <option value="cash">Tiền mặt</option>
                          <option value="card">Thẻ</option>
                          <option value="transfer">Chuyển khoản</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (VNĐ)</label>
                        <input type="number" value={newOrder.discount} onChange={(e) => setNewOrder({ ...newOrder, discount: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nhập số tiền giảm giá" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea value={newOrder.notes} onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nhập ghi chú" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Xem trước đơn hàng</h4>
                      <div className="space-y-2">
                        {newOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name || item.maBienThe || 'Sản phẩm chưa chọn'} x{item.quantity}</span>
                            <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã voucher</label>
                        <div className="flex gap-2">
                          <input type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} placeholder="Nhập mã voucher" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                          <button onClick={applyVoucher} className="px-3 py-2 bg-primary text-white rounded-lg">Áp dụng</button>
                          <button onClick={clearVoucher} className="px-3 py-2 border border-gray-300 rounded-lg">Xóa</button>
                        </div>
                        {appliedVoucher && (
                          <div className="text-sm text-green-600 mt-2">Áp dụng: {appliedVoucher.maVoucherCode} — Giảm {Number(appliedVoucher.giamGiaVoucher || 0).toLocaleString('vi-VN')}đ</div>
                        )}
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-sm"><span>Tạm tính:</span><span>{newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('vi-VN')}đ</span></div>
                        <div className="flex justify-between text-sm"><span>Giảm giá:</span><span>{newOrder.discount.toLocaleString('vi-VN')}đ</span></div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2"><span>Tổng cộng:</span><span>{(newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - newOrder.discount).toLocaleString('vi-VN')}đ</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <button onClick={() => setCreateStep(1)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Quay lại</button>
                    <div className="flex gap-3">
                      <button onClick={() => { setShowCreateOrderModal(false); setCreateStep(1); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Hủy</button>
                      <button onClick={handleCreateOrder} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Tạo đơn hàng</button>
                    </div>
                  </div>
                </div>
              )}
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
                      {((selectedOrder.items || [])
                        .map(i => ({
                          name: String(i?.name || '').trim(),
                          quantity: Number(i?.quantity || 0),
                          price: Number(i?.price || 0)
                        })))
                        .map((item, index) => (
                          <div key={`${item.name || 'item'}-${index}`} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    {(() => {
                      const items = (selectedOrder.items || []).map(i => ({
                        quantity: Number(i?.quantity || 0),
                        price: Number(i?.price || 0)
                      }));
                      const itemsSum = items.reduce((acc, it) => acc + it.quantity * it.price, 0);
                      const subtotalVal = (Number(selectedOrder.subtotal) && Number(selectedOrder.subtotal) > 0) ? Number(selectedOrder.subtotal) : itemsSum;
                      const discountVal = Number(selectedOrder.discount || 0);
                      const totalVal = (Number(selectedOrder.total) && Number(selectedOrder.total) > 0) ? Number(selectedOrder.total) : Math.max(0, itemsSum - discountVal);

                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Tạm tính:</span>
                            <span>{subtotalVal.toLocaleString('vi-VN')}đ</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Giảm giá:</span>
                            <span>{(selectedOrder.tongGiamGia ?? discountVal).toLocaleString('vi-VN')}đ</span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg border-t pt-2">
                            <span>Tổng cộng:</span>
                            <span>{totalVal.toLocaleString('vi-VN')}đ</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {selectedOrder.diemThuongNhanDuoc !== undefined && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-gray-900">Điểm thưởng nhận được</h4>
                      <p className="text-gray-600">{selectedOrder.diemThuongNhanDuoc} điểm</p>
                    </div>
                  )}
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
                  <h4 className="font-semibold text-gray-900">Tổng tiền: {(selectedOrder.total || 0).toLocaleString('vi-VN')}đ</h4>
                  {(selectedOrder.tongGiamGia || selectedOrder.giamGiaVoucher || selectedOrder.giamGiaDiemThuong || selectedOrder.giamGiaVip) && (
                    <div className="text-sm text-gray-600 mt-2">
                      <div>Giảm voucher: {Number(selectedOrder.giamGiaVoucher || 0).toLocaleString('vi-VN')}đ</div>
                      <div>Giảm điểm: {Number(selectedOrder.giamGiaDiemThuong || 0).toLocaleString('vi-VN')}đ</div>
                      <div>Giảm VIP: {Number(selectedOrder.giamGiaVip || 0).toLocaleString('vi-VN')}đ</div>
                      {selectedOrder.tongGiamGia !== undefined && (
                        <div className="font-semibold">Tổng giảm: {Number(selectedOrder.tongGiamGia).toLocaleString('vi-VN')}đ</div>
                      )}
                    </div>
                  )}
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


