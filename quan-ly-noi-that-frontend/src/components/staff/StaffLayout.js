import React, { useState, useEffect } from 'react';
import { IoPerson, IoLogOut, IoMenu, IoClose, IoHome, IoStorefront, IoReceipt, IoChatbubbles, IoNotifications, IoGift, IoStar } from 'react-icons/io5';
import StaffDashboard from './StaffDashboard';
import WarehouseDashboard from '../shared/WarehouseDashboard';
import CustomerManagement from '../admin/customers/CustomerManagement';
import OrderManagement from './orders/OrderManagement';
import ProductManagement from '../admin/products/ProductManagement';
import InventoryManagement from './inventory/InventoryManagement';
import CustomerSupport from './support/CustomerSupport';
import LiveChat from '../shared/LiveChat';
import PromotionManagement from '../admin/products/PromotionManagement';
import VIPManagement from '../admin/customers/VIPManagement';
import SalesManagement from './orders/SalesManagement';
import ReportsAnalytics from '../admin/system/ReportsAnalytics';
import InventoryAlerts from './inventory/InventoryAlerts';
import SupplierManagement from '../shared/SupplierManagement';
import ShippingTracking from './orders/ShippingTracking';

// Import home page components
import Header from '../shared/Header';
import Hero from '../shared/Hero';
import Stats from '../shared/Stats';
import Features from '../shared/Features';
import FeaturesSecond from '../shared/FeaturesSecond';
import NewItemsSlider from '../shared/NewItemsSlider';
import ProductSlider from '../shared/ProductSlider';
import TestimonialSlider from '../shared/TestimonialSlider';
import Newsletter from '../shared/Newsletter';
import Footer from '../shared/Footer';

// Import CSS files
import '../../slider.css';
import '../../animations.css';

const StaffLayout = ({ userRole = 'staff' }) => {
  const [currentView, setCurrentView] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Organized by category
  const staffCategories = {
    'Quản lý': [
      { id: 'customers', name: '👤 Khách hàng', component: CustomerManagement },
      { id: 'orders', name: '📋 Đơn hàng', component: OrderManagement },
      { id: 'products', name: '📦 Sản phẩm', component: ProductManagement },
      { id: 'vip', name: '💎 VIP', component: VIPManagement }
    ],
    'Bán hàng': [
      { id: 'sales', name: '💰 Bán hàng', component: SalesManagement },
      { id: 'promotions', name: '🎁 Khuyến mãi', component: PromotionManagement },
      { id: 'reports', name: '📈 Báo cáo', component: ReportsAnalytics }
    ],
    'Hỗ trợ': [
      { id: 'support', name: '🎧 Hỗ trợ', component: CustomerSupport },
      { id: 'livechat', name: '💬 Live Chat', component: LiveChat }
    ]
  };

  const warehouseCategories = {
    'Kho hàng': [
      { id: 'inventory', name: '📊 Tồn kho', component: InventoryManagement },
      { id: 'alerts', name: '⚠️ Cảnh báo', component: InventoryAlerts },
      { id: 'products', name: '📦 Sản phẩm', component: ProductManagement }
    ],
    'Vận chuyển': [
      { id: 'orders', name: '📋 Đơn hàng', component: OrderManagement },
      { id: 'shipping', name: '🚚 Vận chuyển', component: ShippingTracking },
      { id: 'suppliers', name: '🏢 Nhà cung cấp', component: SupplierManagement }
    ]
  };

  const systemViews = [
    { id: 'home', name: '🏠 Trang chủ', component: null },
    { id: 'dashboard', name: '📊 Dashboard', component: userRole === 'warehouse' ? WarehouseDashboard : StaffDashboard }
  ];

  const categories = userRole === 'warehouse' ? warehouseCategories : staffCategories;

  // Combine all views for mobile menu
  const allViews = [
    ...systemViews,
    ...Object.values(categories).flat()
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCategoryDropdown && !event.target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryDropdown]);

  const renderCurrentView = () => {
    // Handle home page
    if (currentView === 'home') {
      return (
        <div className='max-w-[1440px] mx-auto bg-white'>
          <Header />
          <Hero />
          <Stats />
          <Features />
          <FeaturesSecond />
          <NewItemsSlider />
          <ProductSlider />
          <TestimonialSlider />
          <Newsletter />
          <Footer />
        </div>
      );
    }

    // Check system views first
    const systemView = systemViews.find(view => view.id === currentView);
    if (systemView && systemView.component) {
      const Component = systemView.component;
      return <Component />;
    }

    // Check category views
    for (const category in categories) {
      const categoryView = categories[category].find(view => view.id === currentView);
      if (categoryView) {
        const Component = categoryView.component;
        return <Component />;
      }
    }
    
    return <StaffDashboard />;
  };

  const handleLogout = () => {
    // Simulate logout
    alert('Đăng xuất thành công!');
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
                <h1 className="text-xl font-bold text-primary">
                  FurniShop {userRole === 'warehouse' ? 'Kho hàng' : 'Nhân viên'}
                </h1>
              </div>
            </div>

            {/* System Navigation */}
            <div className="hidden md:flex gap-2">
              {systemViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    currentView === view.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {view.name}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="hidden md:block">
              <div className="relative category-dropdown">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {selectedCategory ? `📁 ${selectedCategory}` : '📁 Chọn danh mục...'}
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {Object.keys(categories).map((category) => (
                      <div key={category}>
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 font-medium text-gray-900 border-b border-gray-200"
                        >
                          📁 {category}
                        </button>
                        {selectedCategory === category && (
                          <div className="bg-gray-50 p-2 space-y-1">
                            {categories[category].map((view) => (
                              <button
                                key={view.id}
                                onClick={() => setCurrentView(view.id)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                  currentView === view.id
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {view.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show selected category's functions */}
                {selectedCategory && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Chức năng của {selectedCategory}:
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {categories[selectedCategory].map((view) => (
                        <button
                          key={view.id}
                          onClick={() => setCurrentView(view.id)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentView === view.id
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {view.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <IoNotifications className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {userRole === 'warehouse' ? 'Nhân viên kho' : 'Nhân viên bán hàng'}
                  </p>
                  <p className="text-xs text-gray-500">user@furnishop.com</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <IoLogOut className="w-5 h-5" />
                </button>
              </div>

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
              {allViews.map((view) => (
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">FurniShop</h3>
              <p className="text-gray-400 text-sm">
                Hệ thống quản lý bán hàng và kho hàng chuyên nghiệp.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Hướng dẫn sử dụng</li>
                <li>Liên hệ IT</li>
                <li>Báo cáo lỗi</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Thông tin</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📞 Hotline: 1900 1234</p>
                <p>✉️ support@furnishop.com</p>
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

export default StaffLayout;



