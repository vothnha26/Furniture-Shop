import React, { useState } from 'react';
import { useOutlet } from 'react-router-dom';
import { IoCart, IoPerson, IoSearch, IoMenu, IoClose, IoHeart, IoNotifications, IoStorefront, IoReceipt } from 'react-icons/io5';
import CustomerShop from './CustomerShop';
import CustomerCart from './CustomerCart';
import CustomerOrders from './CustomerOrders';
import CustomerOrderTracking from './CustomerOrderTracking';
import CustomerProfile from './CustomerProfile';
import CustomerFavorites from './CustomerFavorites';
import CustomerNotifications from './CustomerNotifications';
import CustomerChat from './CustomerChat';

const CustomerLayout = ({ children }) => {
  const [currentView, setCurrentView] = useState('shop');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount] = useState(3); // Simulate cart count
  const [favoritesCount] = useState(5); // Simulate favorites count
  const [notificationsCount] = useState(3); // Simulate notifications count

  const views = [
    { id: 'shop', name: 'Cửa hàng', icon: IoStorefront, component: CustomerShop },
    { id: 'cart', name: 'Giỏ hàng', icon: IoCart, component: CustomerCart },
    { id: 'orders', name: 'Đơn hàng', icon: IoReceipt, component: CustomerOrders },
    { id: 'tracking', name: 'Tra cứu đơn hàng', icon: IoSearch, component: CustomerOrderTracking },
    { id: 'favorites', name: 'Yêu thích', icon: IoHeart, component: CustomerFavorites },
    { id: 'notifications', name: 'Thông báo', icon: IoNotifications, component: CustomerNotifications },
    { id: 'profile', name: 'Tài khoản', icon: IoPerson, component: CustomerProfile }
  ];

  // If this layout is used as a parent route, `useOutlet()` returns the nested element.
  const outlet = useOutlet();

  const renderCurrentView = () => {
    // If a nested route element is present, render it instead of the internal tab view
    if (outlet) return outlet;
    // If a direct child was passed (e.g. <CustomerLayout><CustomerCheckout/></CustomerLayout>), render it
    if (children) return children;
    const view = views.find(v => v.id === currentView);
    if (view) {
      const Component = view.component;
      return <Component />;
    }
    return <CustomerShop />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">FurniShop</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentView === view.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  {view.name}
                </button>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden sm:block">
                <div className="relative">
                  <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Cart */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <IoCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Favorites */}
              <button 
                onClick={() => setCurrentView('favorites')}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <IoHeart className="w-6 h-6" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <button 
                onClick={() => setCurrentView('notifications')}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <IoNotifications className="w-6 h-6" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationsCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {isMobileMenuOpen ? <IoClose className="w-6 h-6" /> : <IoMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => {
                    setCurrentView(view.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors ${
                    currentView === view.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  {view.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {renderCurrentView()}
      </main>

      {/* Customer Chat Widget */}
      <CustomerChat />

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">FurniShop</h3>
              <p className="text-gray-400 text-sm">
                Cửa hàng nội thất cao cấp với chất lượng tốt nhất và dịch vụ tận tâm.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Ghế</li>
                <li>Bàn</li>
                <li>Giường</li>
                <li>Tủ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Liên hệ</li>
                <li>Hướng dẫn mua hàng</li>
                <li>Chính sách đổi trả</li>
                <li>Bảo hành</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📞 1900 1234</p>
                <p>✉️ info@furnishop.com</p>
                <p>📍 123 Đường ABC, TP.HCM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 FurniShop. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;

