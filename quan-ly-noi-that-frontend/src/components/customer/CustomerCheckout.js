import React, { useState, useEffect } from 'react';
import { 
  IoLocationOutline, 
  IoPersonOutline, 
  IoCallOutline, 
  IoMailOutline, 
  IoGiftOutline,
  IoCheckmarkCircleOutline,
  IoArrowBackOutline,
  IoShieldCheckmarkOutline,
  IoCarOutline,
  IoTimeOutline,
  IoStarOutline,
  IoCashOutline,
  IoWalletOutline,
  IoTrashOutline,
  IoAddOutline,
  IoCloseCircleOutline
} from 'react-icons/io5';
import { FaCreditCard, FaUniversity } from 'react-icons/fa';
import Toast from '../shared/Toast';
import ConfirmDialog from '../shared/ConfirmDialog';
import api from '../../api';

const CustomerCheckout = ({ cartItems: initialCartItems = [], total: initialTotal = 0, onBack, onOrderComplete }) => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [step, setStep] = useState(1); // 1: Cart Review, 2: Shipping Info, 3: Payment, 4: Confirmation
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Customer info and order metadata (previously assumed to exist)
  const [customerInfo, setCustomerInfo] = useState({ customerId: null, name: '', phone: '', email: '' });
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);

  // Create order data for API
  const createOrderData = () => ({
    maKhachHang: customerInfo.customerId || null,
    thongTinKhachHang: {
      hoTen: customerInfo.name,
      soDienThoai: customerInfo.phone,
      email: customerInfo.email
    },
    diaChiGiaoHang: `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.city}`,
    phuongThucThanhToan: paymentMethod,
    ghiChu: orderNotes,
    chiTietDonHangList: cartItems.map(item => ({
      maBienThe: item.id,
      soLuong: item.quantity,
      donGia: item.price
    })),
    maVoucherSuDung: selectedVoucher?.id || null,
    dichVuBoSung: selectedServices.map(service => ({
      maDichVu: service.id,
      giaTriDichVu: service.price
    }))
  });

  // Submit order to API
  const submitOrder = async () => {
    setIsLoading(true);
    try {
      const orderData = createOrderData();
      const response = await api.post('/api/checkout/create-order', orderData);
      
      if (response.success) {
        setStep(4); // Move to confirmation step
        if (onOrderComplete) {
          onOrderComplete(response.order);
        }
        
        // Clear cart after successful order
        localStorage.removeItem('cart');
        
        // Show success message
        Toast.success('Đặt hàng thành công!');
      } else {
        throw new Error(response.message || 'Đặt hàng thất bại');
      }
    } catch (err) {
      console.error('Submit order error', err);
      setError(err.message || 'Có lỗi xảy ra khi đặt hàng');
      Toast.error(err.message || 'Đặt hàng thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available vouchers for user
  useEffect(() => {
    const fetchAvailableVouchers = async () => {
      try {
        const customerId = customerInfo.customerId;
        if (customerId) {
          const data = await api.get(`/api/v1/voucher/eligible/${customerId}/details`);
          if (Array.isArray(data)) {
            setAvailableVouchers(data);
          }
        }
      } catch (err) {
        console.error('Fetch vouchers error', err);
      }
    };
    
    if (step >= 2 && customerInfo.customerId) {
      fetchAvailableVouchers();
    }
  }, [step, customerInfo.customerId]);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    note: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    bankCode: ''
  });
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [appliedLoyaltyPoints, setAppliedLoyaltyPoints] = useState(0);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  // Mock data initialization
  useEffect(() => {
    const mockCartItems = [
      {
        id: 1,
        name: 'Ghế Sofa Nordic',
        variant: 'Màu đỏ - Chất liệu vải',
        price: 4500000,
        originalPrice: 5000000,
        quantity: 2,
        image: '/api/placeholder/80/80',
        inStock: true
      },
      {
        id: 2,
        name: 'Bàn Ăn Gỗ Sồi',
        variant: 'Kích thước 1.6m - Màu nâu',
        price: 8000000,
        originalPrice: 8000000,
        quantity: 1,
        image: '/api/placeholder/80/80',
        inStock: true
      }
    ];

    const mockVouchers = [
      {
        id: 1,
        code: 'NEWUSER50',
        title: 'Giảm 50K cho khách hàng mới',
        discount: 50000,
        type: 'fixed',
        minOrder: 1000000,
        maxDiscount: 50000,
        expiry: '2024-12-31'
      },
      {
        id: 2,
        code: 'SALE10',
        title: 'Giảm 10% đơn hàng',
        discount: 10,
        type: 'percentage',
        minOrder: 2000000,
        maxDiscount: 500000,
        expiry: '2024-11-30'
      }
    ];

    setCartItems(mockCartItems);
    setAvailableVouchers(mockVouchers);
    setLoyaltyPoints(125000); // Available loyalty points

    // Pre-fill shipping info from localStorage (if available)
    const savedShippingInfo = localStorage.getItem('customerShippingInfo');
    if (savedShippingInfo) {
      setShippingInfo(JSON.parse(savedShippingInfo));
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
    showToast('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateSavings = () => {
    return cartItems.reduce((total, item) => 
      total + ((item.originalPrice - item.price) * item.quantity), 0
    );
  };

  const getShippingFee = () => {
    const subtotal = calculateSubtotal();
    if (subtotal >= 10000000) return 0; // Free shipping over 10M
    
    switch (shippingMethod) {
      case 'express': return 150000;
      case 'same-day': return 300000;
      default: return 50000; // standard
    }
  };

  const getVoucherDiscount = () => {
    if (!selectedVoucher) return 0;
    
    const subtotal = calculateSubtotal();
    if (subtotal < selectedVoucher.minOrder) return 0;
    
    if (selectedVoucher.type === 'fixed') {
      return selectedVoucher.discount;
    } else {
      const percentDiscount = subtotal * (selectedVoucher.discount / 100);
      return Math.min(percentDiscount, selectedVoucher.maxDiscount);
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingFee = getShippingFee();
    const voucherDiscount = getVoucherDiscount();
    const loyaltyDiscount = appliedLoyaltyPoints;
    
    return Math.max(0, subtotal + shippingFee - voucherDiscount - loyaltyDiscount);
  };

  const applyVoucher = (voucher) => {
    const subtotal = calculateSubtotal();
    if (subtotal < voucher.minOrder) {
      showToast(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrder)} để sử dụng voucher này`, 'error');
      return;
    }
    
    setSelectedVoucher(voucher);
    showToast('Áp dụng voucher thành công!');
  };

  const removeVoucher = () => {
    setSelectedVoucher(null);
    showToast('Đã hủy voucher');
  };

  const applyLoyaltyPoints = (points) => {
    const maxPoints = Math.min(loyaltyPoints, calculateSubtotal() * 0.3); // Max 30% of subtotal
    const appliedPoints = Math.min(points, maxPoints);
    setAppliedLoyaltyPoints(appliedPoints);
    
    if (appliedPoints > 0) {
      showToast(`Đã áp dụng ${appliedPoints.toLocaleString()} điểm thưởng`);
    }
  };

  const validateShippingInfo = () => {
    const required = ['fullName', 'phone', 'email', 'address', 'ward', 'district', 'city'];
    const missing = required.filter(field => !shippingInfo[field].trim());
    
    if (missing.length > 0) {
      showToast('Vui lòng điền đầy đủ thông tin giao hàng', 'error');
      return false;
    }
    
    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      showToast('Số điện thoại không hợp lệ', 'error');
      return false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      showToast('Email không hợp lệ', 'error');
      return false;
    }
    
    return true;
  };

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.cardName || 
          !paymentDetails.expiryDate || !paymentDetails.cvv) {
        showToast('Vui lòng điền đầy đủ thông tin thẻ', 'error');
        return false;
      }
    } else if (paymentMethod === 'bank') {
      if (!paymentDetails.bankCode) {
        showToast('Vui lòng chọn ngân hàng', 'error');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && cartItems.length === 0) {
      showToast('Giỏ hàng trống', 'error');
      return;
    }
    
    if (step === 2 && !validateShippingInfo()) {
      return;
    }
    
    if (step === 3 && !validatePayment()) {
      return;
    }
    
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Save shipping info for future use
      localStorage.setItem('customerShippingInfo', JSON.stringify(shippingInfo));
      
      // Generate order code
      const newOrderCode = 'DH' + Date.now().toString().slice(-6);
      setOrderCode(newOrderCode);
      setOrderSuccess(true);
      setStep(4);
      
      showToast('Đặt hàng thành công!');
      
      // Call the onOrderComplete callback if provided
      if (onOrderComplete) {
        setTimeout(() => {
          onOrderComplete();
        }, 2000); // Delay to show success message
      }
    } catch (error) {
      showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Xem lại giỏ hàng';
      case 2: return 'Thông tin giao hàng';
      case 3: return 'Phương thức thanh toán';
      case 4: return 'Hoàn thành đặt hàng';
      default: return '';
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <IoCheckmarkCircleOutline className="text-4xl text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
            <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Mã đơn hàng:</span>
                <span className="font-bold text-lg text-blue-600">{orderCode}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Tổng tiền:</span>
                <span className="font-bold text-lg">{formatCurrency(calculateTotal())}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
                <span className="text-sm">
                  {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
                   paymentMethod === 'card' ? 'Thẻ tín dụng' :
                   paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Ví điện tử'}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/orders'}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Theo dõi đơn hàng
              </button>
              <button
                onClick={() => window.location.href = '/shop'}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
            <button
              onClick={onBack || (() => window.history.back())}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <IoArrowBackOutline />
              Quay lại
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6">
            {[1, 2, 3, 4].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= stepNum 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {step > stepNum ? <IoCheckmarkCircleOutline /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="mt-4">
            <h2 className="text-lg font-medium text-gray-900">{getStepTitle()}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            
            {/* Step 1: Cart Review */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm trong giỏ hàng</h3>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.variant}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-blue-600">{formatCurrency(item.price)}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(item.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Xóa sản phẩm"
                      >
                        <IoTrashOutline />
                      </button>
                    </div>
                  ))}
                </div>
                
                {cartItems.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl text-gray-300 mb-4">🛒</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
                    <p className="text-gray-600 mb-4">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
                    <button
                      onClick={() => window.location.href = '/shop'}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Shipping Information */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin giao hàng</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IoPersonOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IoCallOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IoMailOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập địa chỉ email"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IoLocationOutline className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập địa chỉ chi tiết"
                        rows="3"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.ward}
                      onChange={(e) => setShippingInfo({...shippingInfo, ward: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập phường/xã"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.district}
                      onChange={(e) => setShippingInfo({...shippingInfo, district: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập quận/huyện"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tỉnh/thành phố"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={shippingInfo.note}
                      onChange={(e) => setShippingInfo({...shippingInfo, note: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                      rows="2"
                    />
                  </div>
                </div>
                
                {/* Shipping Methods */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Phương thức giao hàng</h4>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="mr-3"
                      />
                      <IoCarOutline className="text-blue-600 mr-3" />
                      <div className="flex-1">
                        <div className="font-medium">Giao hàng tiêu chuẩn</div>
                        <div className="text-sm text-gray-600">3-5 ngày làm việc</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(50000)}</div>
                        <div className="text-xs text-gray-600">Miễn phí &gt; 10 triệu</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="mr-3"
                      />
                      <IoTimeOutline className="text-orange-600 mr-3" />
                      <div className="flex-1">
                        <div className="font-medium">Giao hàng nhanh</div>
                        <div className="text-sm text-gray-600">1-2 ngày làm việc</div>
                      </div>
                      <div className="font-medium">{formatCurrency(150000)}</div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="same-day"
                        checked={shippingMethod === 'same-day'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="mr-3"
                      />
                      <IoStarOutline className="text-purple-600 mr-3" />
                      <div className="flex-1">
                        <div className="font-medium">Giao trong ngày</div>
                        <div className="text-sm text-gray-600">Trong vòng 6 giờ</div>
                      </div>
                      <div className="font-medium">{formatCurrency(300000)}</div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Phương thức thanh toán</h3>
                
                <div className="space-y-4">
                  {/* Cash on Delivery */}
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <IoCashOutline className="text-green-600 text-2xl mr-4" />
                    <div>
                      <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </label>
                  
                  {/* Credit Card */}
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <FaCreditCard className="text-blue-600 text-2xl mr-4" />
                    <div>
                      <div className="font-medium">Thẻ tín dụng/ghi nợ</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard, JCB</div>
                    </div>
                  </label>
                  
                  {/* Bank Transfer */}
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <FaUniversity className="text-purple-600 text-2xl mr-4" />
                    <div>
                      <div className="font-medium">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-gray-600">Internet Banking, ATM</div>
                    </div>
                  </label>
                  
                  {/* E-Wallet */}
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={paymentMethod === 'wallet'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <IoWalletOutline className="text-orange-600 text-2xl mr-4" />
                    <div>
                      <div className="font-medium">Ví điện tử</div>
                      <div className="text-sm text-gray-600">MoMo, ZaloPay, VNPay</div>
                    </div>
                  </label>
                </div>
                
                {/* Payment Details */}
                {paymentMethod === 'card' && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin thẻ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số thẻ</label>
                        <input
                          type="text"
                          value={paymentDetails.cardNumber}
                          onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ thẻ</label>
                        <input
                          type="text"
                          value={paymentDetails.cardName}
                          onChange={(e) => setPaymentDetails({...paymentDetails, cardName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="NGUYEN VAN A"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                        <input
                          type="text"
                          value={paymentDetails.expiryDate}
                          onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input
                          type="text"
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="123"
                          maxLength="4"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'bank' && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Chọn ngân hàng</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Vietcombank', 'Techcombank', 'BIDV', 'VietinBank', 'ACB', 'Sacombank'].map((bank) => (
                        <label key={bank} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white">
                          <input
                            type="radio"
                            name="bankCode"
                            value={bank}
                            checked={paymentDetails.bankCode === bank}
                            onChange={(e) => setPaymentDetails({...paymentDetails, bankCode: e.target.value})}
                            className="mr-2"
                          />
                          <span className="text-sm">{bank}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
              
              {/* Voucher Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Mã giảm giá</span>
                  <IoGiftOutline className="text-orange-500" />
                </div>
                
                {selectedVoucher ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">{selectedVoucher.code}</div>
                      <div className="text-sm text-green-600">
                        -{selectedVoucher.type === 'fixed' 
                          ? formatCurrency(selectedVoucher.discount)
                          : `${selectedVoucher.discount}%`}
                      </div>
                    </div>
                    <button
                      onClick={removeVoucher}
                      className="text-green-600 hover:text-green-800"
                    >
                      <IoCloseCircleOutline />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableVouchers.map((voucher) => (
                      <button
                        key={voucher.id}
                        onClick={() => applyVoucher(voucher)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{voucher.code}</div>
                            <div className="text-sm text-gray-600">{voucher.title}</div>
                          </div>
                          <IoAddOutline className="text-blue-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Loyalty Points Section */}
              {loyaltyPoints > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Điểm thưởng</span>
                    <IoStarOutline className="text-yellow-500" />
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-800 mb-2">
                      Có sẵn: {loyaltyPoints.toLocaleString()} điểm
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={Math.min(loyaltyPoints, calculateSubtotal() * 0.3)}
                        value={appliedLoyaltyPoints}
                        onChange={(e) => applyLoyaltyPoints(parseInt(e.target.value) || 0)}
                        className="flex-1 px-3 py-1 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Nhập điểm"
                      />
                      <button
                        onClick={() => applyLoyaltyPoints(Math.min(loyaltyPoints, calculateSubtotal() * 0.3))}
                        className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                      >
                        Tối đa
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                
                {calculateSavings() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Tiết kiệm</span>
                    <span>-{formatCurrency(calculateSavings())}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí giao hàng</span>
                  <span>
                    {getShippingFee() === 0 ? 'Miễn phí' : formatCurrency(getShippingFee())}
                  </span>
                </div>
                
                {getVoucherDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá voucher</span>
                    <span>-{formatCurrency(getVoucherDiscount())}</span>
                  </div>
                )}
                
                {appliedLoyaltyPoints > 0 && (
                  <div className="flex justify-between text-yellow-600">
                    <span>Điểm thưởng</span>
                    <span>-{formatCurrency(appliedLoyaltyPoints)}</span>
                  </div>
                )}
                
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg mb-4">
                <IoShieldCheckmarkOutline className="text-green-600" />
                <div className="text-sm text-green-800">
                  Thanh toán an toàn và bảo mật
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                {step < 3 ? (
                  <button
                    onClick={handleNextStep}
                    disabled={cartItems.length === 0}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {step === 1 ? 'Tiếp tục' : step === 2 ? 'Chọn thanh toán' : 'Đặt hàng'}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={isProcessing || cartItems.length === 0}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <IoCheckmarkCircleOutline />
                        Xác nhận đặt hàng
                      </>
                    )}
                  </button>
                )}
                
                {step > 1 && (
                  <button
                    onClick={handlePreviousStep}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Quay lại
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handlePlaceOrder}
        title="Xác nhận đặt hàng"
        message={`Bạn có chắc chắn muốn đặt hàng với tổng tiền ${formatCurrency(calculateTotal())}?`}
        confirmText="Đặt hàng"
        confirmColor="green"
      />

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: '' })}
      />
    </div>
  );
};

export default CustomerCheckout;
