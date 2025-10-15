import React, { useState, useEffect } from 'react';
import { IoTrash, IoAdd, IoRemove, IoCart, IoHeart, IoCheckmarkCircle, IoCard } from 'react-icons/io5';
import CustomerCheckout from './CustomerCheckout';
import api from '../../api';

const CustomerCart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map cart item from API
  const mapCartItemFromApi = (item) => ({
    id: item.maBienThe || item.id,
    productId: item.sanPham?.maSanPham || item.productId,
    name: item.sanPham?.tenSanPham || item.name,
    variantName: item.tenBienThe || item.variantName,
    price: item.giaBan || item.price || 0,
    originalPrice: item.giaGoc || item.originalPrice || 0,
    image: item.hinhAnh || item.image || '/default-product.jpg',
    quantity: item.soLuong || item.quantity || 1,
    inStock: item.tonKho > 0,
    stockCount: item.tonKho || 0,
    isFavorite: false,
    attributes: item.thuocTinhList?.map(attr => ({
      name: attr.thuocTinh?.tenThuocTinh,
      value: attr.giaTri?.giaTri
    })) || []
  });

  const mapCartItemToApi = (item) => ({
    maBienThe: item.id,
    soLuong: item.quantity
  });

  // Fetch cart items (from localStorage or API)
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        // Try to load from API if user is logged in
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          const data = await api.get('/api/cart');
          if (Array.isArray(data)) {
            setCartItems(data.map(mapCartItemFromApi));
          }
        } else {
          // Load from localStorage for guest users
          const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
          setCartItems(localCart);
        }
      } catch (err) {
        console.error('Load cart error', err);
        // Fallback to localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(localCart);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, []);

  // Save cart to localStorage and API
  const saveCart = async (items) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        // Save to API for logged in users
        await api.post('/api/cart/sync', items.map(mapCartItemToApi));
      }
      // Always save to localStorage as backup
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (err) {
      console.error('Save cart error', err);
      // Fallback to localStorage only
      localStorage.setItem('cart', JSON.stringify(items));
    }
  };

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Ghế gỗ cao cấp',
      price: 2500000,
      originalPrice: 3000000,
      image: 'https://via.placeholder.com/300x200?text=Ghế+gỗ',
      quantity: 1,
      inStock: true,
      isFavorite: false
    },
    {
      id: 2,
      name: 'Bàn ăn 6 người',
      price: 4500000,
      originalPrice: 5000000,
      image: 'https://via.placeholder.com/300x200?text=Bàn+ăn',
      quantity: 2,
      inStock: true,
      isFavorite: true
    },
    {
      id: 3,
      name: 'Giường ngủ gỗ',
      price: 6500000,
      originalPrice: 7500000,
      image: 'https://via.placeholder.com/300x200?text=Giường+ngủ',
      quantity: 1,
      inStock: false,
      isFavorite: false
    }
  ]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const toggleFavorite = (id) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const applyCoupon = () => {
    if (couponCode === 'SAVE10') {
      setAppliedCoupon({ code: 'SAVE10', discount: 0.1, description: 'Giảm 10%' });
    } else if (couponCode === 'SAVE20') {
      setAppliedCoupon({ code: 'SAVE20', discount: 0.2, description: 'Giảm 20%' });
    } else {
      alert('Mã giảm giá không hợp lệ');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = appliedCoupon ? subtotal * appliedCoupon.discount : 0;
  const shipping = subtotal > 5000000 ? 0 : 50000; // Miễn phí ship trên 5M
  const total = subtotal - discount + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Giỏ hàng</h1>
          <p className="text-gray-600">Kiểm tra và thanh toán đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Sản phẩm trong giỏ ({cartItems.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(item.price)}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>
                        {!item.inStock && (
                          <span className="text-sm text-red-600">Hết hàng</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <IoRemove className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={!item.inStock}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <IoAdd className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={`p-2 rounded-full hover:bg-gray-50 ${
                            item.isFavorite ? 'text-red-500' : 'text-gray-400'
                          }`}
                        >
                          <IoHeart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-full hover:bg-red-50 text-red-500"
                        >
                          <IoTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mã giảm giá</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Áp dụng
                </button>
              </div>
              {appliedCoupon && (
                <div className="mt-3 flex items-center gap-2 text-green-600">
                  <IoCheckmarkCircle className="w-5 h-5" />
                  <span>Đã áp dụng mã {appliedCoupon.code}: {appliedCoupon.description}</span>
                  <button
                    onClick={removeCoupon}
                    className="text-red-500 hover:text-red-700"
                  >
                    <IoTrash className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({appliedCoupon.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <p className="text-sm text-gray-500">
                    Miễn phí ship cho đơn hàng trên 5.000.000đ
                  </p>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <IoCard className="w-5 h-5" />
                  Thanh toán ngay
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Tiếp tục mua sắm
                </button>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                  <span>Thanh toán an toàn</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                  <span>Bảo hành chính hãng</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                  <span>Giao hàng miễn phí</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty Cart */}
        {cartItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
            <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90">
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <CustomerCheckout 
            cartItems={cartItems}
            total={total}
            onBack={() => setShowCheckout(false)}
            onOrderComplete={() => {
              setCartItems([]);
              setShowCheckout(false);
              alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerCart;

