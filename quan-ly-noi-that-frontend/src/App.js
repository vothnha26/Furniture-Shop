import React, { useState, useEffect } from 'react';

// Import admin components that exist
import AccountManagement from './components/admin/AccountManagement';
import ProductManagement from './components/admin/ProductManagement';
import CustomerManagement from './components/admin/CustomerManagement';
import PromotionManagement from './components/admin/PromotionManagement';
import ReportsAnalytics from './components/admin/ReportsAnalytics';
import Dashboard from './components/admin/Dashboard';
import AttributeManagement from './components/admin/AttributeManagement';
import AttributeValueManagement from './components/admin/AttributeValueManagement';
import CategoryManagement from './components/admin/CategoryManagement';
import CollectionManagement from './components/admin/CollectionManagement';
import DiscountManagement from './components/admin/DiscountManagement';
import ProductVariantManagement from './components/admin/ProductVariantManagement';
import BackupRestore from './components/admin/BackupRestore';

// Import customer components that exist
import CustomerFavorites from './components/customer/CustomerFavorites';
import CustomerNotifications from './components/customer/CustomerNotifications';
import CustomerOrders from './components/customer/CustomerOrders';
import CustomerOrderTracking from './components/customer/CustomerOrderTracking';
import CustomerProfile from './components/customer/CustomerProfile';
import CustomerLayout from './components/customer/CustomerLayout';
import CustomerCart from './components/customer/CustomerCart';
import CustomerCheckout from './components/customer/CustomerCheckout';
import CustomerProductDetail from './components/customer/CustomerProductDetail';
import CustomerShop from './components/customer/CustomerShop';
import CustomerShopPage from './components/customer/CustomerShopPage';

// Import staff components that exist
import InventoryAlerts from './components/staff/InventoryAlerts';
import OrderManagement from './components/staff/OrderManagement';
import SalesManagement from './components/staff/SalesManagement';
import StaffLayout from './components/staff/StaffLayout';
import InvoiceManagement from './components/staff/InvoiceManagement';
import OrderDetailManagement from './components/staff/OrderDetailManagement';
import PaymentTransactionManagement from './components/staff/PaymentTransactionManagement';

// Import shared components that exist
import Login from './components/shared/Login';
import PendingTasks from './components/shared/PendingTasks';
import MainDashboard from './components/shared/MainDashboard';
import Header from './components/shared/Header';
import Hero from './components/shared/Hero';
import Stats from './components/shared/Stats';
import Features from './components/shared/Features';
import FeaturesSecond from './components/shared/FeaturesSecond';
import NewItemsSlider from './components/shared/NewItemsSlider';
import ProductSlider from './components/shared/ProductSlider';
import TestimonialSlider from './components/shared/TestimonialSlider';
import Newsletter from './components/shared/Newsletter';
import Footer from './components/shared/Footer';

// import slider styles
import './slider.css';
// import animations
import './animations.css';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState('admin'); // 'admin', 'customer', 'staff'
  const [selectedPerson, setSelectedPerson] = useState('');
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState('');
  const [showFunctionDropdown, setShowFunctionDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPersonDropdown && !event.target.closest('.person-dropdown')) {
        setShowPersonDropdown(false);
      }
      if (showFunctionDropdown && !event.target.closest('.function-dropdown')) {
        setShowFunctionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPersonDropdown, showFunctionDropdown]);

    // Phân quyền theo 3 roles: Admin, Customer, Staff  
  const adminViews = {
    'Admin - 📦 Quản lý Sản phẩm & Danh mục': [
      { id: 'products', name: '📦 Quản lý sản phẩm', component: ProductManagement },
      { id: 'productvariants', name: '🎨 Biến thể sản phẩm', component: ProductVariantManagement },
      { id: 'categories', name: '📂 Danh mục sản phẩm', component: CategoryManagement },
      { id: 'collections', name: '📚 Bộ sưu tập', component: CollectionManagement },
      { id: 'attributes', name: '🏷️ Thuộc tính SP', component: AttributeManagement },
      { id: 'attributevalues', name: '🔖 Giá trị thuộc tính', component: AttributeValueManagement }
    ],
    'Admin - ⭐ Quản lý Khách hàng & Marketing': [
      { id: 'customers', name: '👤 Quản lý khách hàng', component: CustomerManagement },
      { id: 'promotions', name: '🎁 Chương trình khuyến mãi', component: PromotionManagement },
      { id: 'discounts', name: '💸 Mã giảm giá', component: DiscountManagement }
    ],
    'Admin - 📊 Báo cáo & Quản trị Hệ thống': [
      { id: 'reports', name: '📈 Báo cáo & thống kê', component: ReportsAnalytics },
      { id: 'login', name: '🔐 Hệ thống đăng nhập', component: Login },
      { id: 'accounts', name: '👥 Quản lý tài khoản', component: AccountManagement },
      { id: 'backup', name: '💾 Sao lưu & phục hồi', component: BackupRestore }
    ]
  };

  const systemViews = [
    { id: 'home', name: '🏠 Trang chủ', component: null },
    { id: 'dashboard', name: '📊 Dashboard', component: Dashboard },
    { id: 'pending', name: '📋 Chưa làm', component: PendingTasks },
    { id: 'maindashboard', name: '🎛️ Dashboard chính', component: MainDashboard }
  ];

  const renderCurrentView = () => {
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

    // Handle dashboard for all roles
    if (currentView === 'dashboard') {
      if (userRole === 'staff') {
        return <StaffLayout userRole={userRole} />;
      } else {
        return <Dashboard />;
      }
    }

    // Check system views first
    const systemView = systemViews.find(view => view.id === currentView);
    if (systemView && systemView.component) {
      const Component = systemView.component;
      return <Component />;
    }

    // Check admin views by person
    for (const person in adminViews) {
      const personView = adminViews[person].find(view => view.id === currentView);
      if (personView && personView.component) {
        const Component = personView.component;
        return <Component />;
      }
    }

    return <div>Không tìm thấy component</div>;
  };

  // Role switcher
  const switchRole = () => {
    const roles = ['admin', 'customer', 'staff'];
    const currentIndex = roles.indexOf(userRole);
    const nextIndex = (currentIndex + 1) % roles.length;
    setUserRole(roles[nextIndex]);
    setCurrentView('home');
  };

  // If customer role, render customer layout
  if (userRole === 'customer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerLayout />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo và Navigation */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-orange-600">FurniShop</span>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {/* System Views */}
                {systemViews.map(view => (
                  <button
                    key={view.id}
                    onClick={() => setCurrentView(view.id)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      currentView === view.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {view.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Person Dropdown */}
              <div className="relative person-dropdown">
                <button
                  onClick={() => setShowPersonDropdown(!showPersonDropdown)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
                >
                  <span>{selectedPerson || '👤 Chọn vai trò'}</span>
                  <svg className="ml-2 -mr-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showPersonDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border">
                    <div className="py-1">
                      {Object.keys(adminViews).map((person) => (
                        <button
                          key={person}
                          onClick={() => {
                            setSelectedPerson(person);
                            setShowPersonDropdown(false);
                            setSelectedFunction('');
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          {person}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Function Dropdown */}
              <div className="relative function-dropdown">
                <button
                  onClick={() => setShowFunctionDropdown(!showFunctionDropdown)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
                  disabled={!selectedPerson}
                >
                  <span>{selectedFunction || '⚙️ Chọn chức năng'}</span>
                  <svg className="ml-2 -mr-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showFunctionDropdown && selectedPerson && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border">
                    <div className="py-1">
                      {adminViews[selectedPerson]?.map((func) => (
                        <button
                          key={func.id}
                          onClick={() => {
                            setSelectedFunction(func.name);
                            setCurrentView(func.id);
                            setShowFunctionDropdown(false);
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          {func.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Role Switcher */}
              <button
                onClick={switchRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                🔄 {userRole === 'admin' ? 'Admin' : userRole === 'customer' ? 'Khách hàng' : 'Nhân viên'}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {renderCurrentView()}
    </div>
  );
};

export default App;