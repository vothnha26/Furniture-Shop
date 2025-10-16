import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';

// Import admin components
import AccountManagement from './components/admin/system/AccountManagement';
import AttributeManagement from './components/admin/products/AttributeManagement';
import AttributeValueManagement from './components/admin/products/AttributeValueManagement';
import BackendExplorer from './components/admin/system/BackendExplorer';
import BackupRestore from './components/admin/system/BackupRestore';
import CategoryManagement from './components/admin/products/CategoryManagement';
import CollectionManagement from './components/admin/products/CollectionManagement';
import CustomerManagement from './components/admin/customers/CustomerManagement';
import Dashboard from './components/admin/system/Dashboard';
import DiscountManagement from './components/admin/products/DiscountManagement';
import Notifications from './components/admin/system/Notifications';
import ProductManagement from './components/admin/products/ProductManagement';
import ProductVariantManagement from './components/admin/products/ProductVariantManagement';
import ImageManagement from './components/admin/products/ImageManagement';
import PromotionManagement from './components/admin/products/PromotionManagement';
import ReportsAnalytics from './components/admin/system/ReportsAnalytics';
import Settings from './components/admin/system/Settings';
import VIPManagement from './components/admin/customers/VIPManagement';
import VoucherManagement from './components/admin/products/VoucherManagement';

// Import customer components
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

// Import staff components
import InventoryAlerts from './components/staff/inventory/InventoryAlerts';
import OrderManagement from './components/staff/orders/OrderManagement';
import SalesManagement from './components/staff/orders/SalesManagement';
import StaffLayout from './components/staff/StaffLayout';
import InvoiceManagement from './components/staff/orders/InvoiceManagement';
import OrderDetailManagement from './components/staff/orders/OrderDetailManagement';
import PaymentTransactionManagement from './components/staff/orders/PaymentTransactionManagement';

// Import shared components
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

import MembershipTierManagement from './components/admin/products/MembershipTierManagement';

// Import styles
import './slider.css';
import './animations.css';

// Admin Layout Component
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <a href="/admin" className="text-2xl font-bold text-orange-600">
                  FurniShop Admin
                </a>
              </div>

              {/* Admin Nav Links */}
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <a href="/admin/dashboard" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium">
                  📊 Dashboard
                </a>
                <a href="/admin/products" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium">
                  📦 Sản phẩm
                </a>
                <a href="/admin/customers" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium">
                  👤 Khách hàng
                </a>
                <a href="/admin/orders" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium">
                  🛒 Đơn hàng
                </a>
                <a href="/admin/reports" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium">
                  📈 Báo cáo
                </a>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <a href="/admin/notifications" className="text-gray-700 hover:text-orange-600">
                🔔
              </a>
              <a href="/admin/settings" className="text-gray-700 hover:text-orange-600">
                ⚙️
              </a>
              <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                🏠 Trang chủ
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        {children}
      </main>
    </div>
  );
};

// Home Page Component
const HomePage = () => {
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
};

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* ============================================
            PUBLIC ROUTES - Không cần đăng nhập
        ============================================ */}

          {/* Home & Landing Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} /> {/* Có thể tạo component Register riêng */}
          <Route path="/forgot-password" element={<Login />} /> {/* Có thể tạo component ForgotPassword riêng */}

          {/* Public Shop Pages (nested under CustomerLayout) */}
          <Route path="/shop" element={<CustomerLayout />}>
            <Route index element={<CustomerShop />} />
            <Route path="products" element={<CustomerShopPage />} />
            <Route path="products/:id" element={<CustomerProductDetail />} />
          </Route>
          <Route path="/products" element={<Navigate to="/shop/products" replace />} />
          <Route path="/products/:id" element={<Navigate to="/shop/products/:id" replace />} />


          {/* ============================================
            CUSTOMER ROUTES - Yêu cầu đăng nhập
        ============================================ */}

          {/* Shopping Cart & Checkout */}
          <Route path="/cart" element={<CustomerLayout><CustomerCart /></CustomerLayout>} />
          <Route path="/checkout" element={<CustomerLayout><CustomerCheckout /></CustomerLayout>} />
          <Route path="/checkout/success" element={<CustomerLayout><CustomerCheckout /></CustomerLayout>} />
          <Route path="/checkout/cancel" element={<CustomerLayout><CustomerCheckout /></CustomerLayout>} />

          {/* Customer Profile & Account */}
          <Route path="/profile" element={<CustomerLayout><CustomerProfile /></CustomerLayout>} />
          <Route path="/account" element={<Navigate to="/profile" replace />} />
          <Route path="/profile/edit" element={<CustomerLayout><CustomerProfile /></CustomerLayout>} />
          <Route path="/profile/password" element={<CustomerLayout><CustomerProfile /></CustomerLayout>} />
          <Route path="/profile/addresses" element={<CustomerLayout><CustomerProfile /></CustomerLayout>} />

          {/* Customer Orders */}
          <Route path="/orders" element={<CustomerLayout><CustomerOrders /></CustomerLayout>} />
          <Route path="/orders/:id" element={<CustomerLayout><CustomerOrderTracking /></CustomerLayout>} />
          <Route path="/orders/track/:id" element={<CustomerLayout><CustomerOrderTracking /></CustomerLayout>} />
          <Route path="/order-history" element={<Navigate to="/orders" replace />} />

          {/* Customer Favorites & Wishlist */}
          <Route path="/favorites" element={<CustomerLayout><CustomerFavorites /></CustomerLayout>} />
          <Route path="/wishlist" element={<Navigate to="/favorites" replace />} />

          {/* Customer Notifications */}
          <Route path="/notifications" element={<CustomerLayout><CustomerNotifications /></CustomerLayout>} />

          {/* Customer Loyalty & Points */}
          <Route path="/loyalty" element={<CustomerLayout><CustomerProfile /></CustomerLayout>} />
          <Route path="/points" element={<CustomerLayout><CustomerProfile /></CustomerLayout>} />
          <Route path="/vouchers" element={<CustomerLayout><CustomerProfile /></CustomerLayout>} />


          {/* ============================================
            ADMIN ROUTES - Quản trị viên
        ============================================ */}

          {/* Admin Dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />

          {/* Product Management */}
          <Route path="/admin/products" element={<AdminLayout><ProductManagement /></AdminLayout>} />
          <Route path="/admin/products/add" element={<AdminLayout><ProductManagement /></AdminLayout>} />
          <Route path="/admin/products/:id" element={<AdminLayout><ProductManagement /></AdminLayout>} />
          <Route path="/admin/products/:id/edit" element={<AdminLayout><ProductManagement /></AdminLayout>} />
          <Route path="/admin/products/:id/images" element={<AdminLayout><ImageManagement /></AdminLayout>} />
          <Route path="/admin/products/:id/variants" element={<AdminLayout><ProductVariantManagement /></AdminLayout>} />
          <Route path="/admin/products/variants" element={<AdminLayout><ProductVariantManagement /></AdminLayout>} />
          <Route path="/admin/products/variants/add" element={<AdminLayout><ProductVariantManagement /></AdminLayout>} />
          <Route path="/admin/products/variants/:id" element={<AdminLayout><ProductVariantManagement /></AdminLayout>} />

          {/* Category Management */}
          <Route path="/admin/categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
          <Route path="/admin/categories/add" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
          <Route path="/admin/categories/:id" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
          <Route path="/admin/categories/:id/edit" element={<AdminLayout><CategoryManagement /></AdminLayout>} />

          {/* Collection Management */}
          <Route path="/admin/collections" element={<AdminLayout><CollectionManagement /></AdminLayout>} />
          <Route path="/admin/collections/add" element={<AdminLayout><CollectionManagement /></AdminLayout>} />
          <Route path="/admin/collections/:id" element={<AdminLayout><CollectionManagement /></AdminLayout>} />
          <Route path="/admin/collections/:id/edit" element={<AdminLayout><CollectionManagement /></AdminLayout>} />

          {/* Attribute Management */}
          <Route path="/admin/attributes" element={<AdminLayout><AttributeManagement /></AdminLayout>} />
          <Route path="/admin/attributes/add" element={<AdminLayout><AttributeManagement /></AdminLayout>} />
          <Route path="/admin/attributes/:id" element={<AdminLayout><AttributeManagement /></AdminLayout>} />
          <Route path="/admin/attributes/:id/edit" element={<AdminLayout><AttributeManagement /></AdminLayout>} />
          <Route path="/admin/attribute-values" element={<AdminLayout><AttributeValueManagement /></AdminLayout>} />
          <Route path="/admin/attribute-values/add" element={<AdminLayout><AttributeValueManagement /></AdminLayout>} />
          <Route path="/admin/attribute-values/:id" element={<AdminLayout><AttributeValueManagement /></AdminLayout>} />

          {/* Customer Management */}
          <Route path="/admin/customers" element={<AdminLayout><CustomerManagement /></AdminLayout>} />
          <Route path="/admin/customers/add" element={<AdminLayout><CustomerManagement /></AdminLayout>} />
          <Route path="/admin/customers/:id" element={<AdminLayout><CustomerManagement /></AdminLayout>} />
          <Route path="/admin/customers/:id/edit" element={<AdminLayout><CustomerManagement /></AdminLayout>} />
          <Route path="/admin/customers/:id/orders" element={<AdminLayout><CustomerManagement /></AdminLayout>} />
          <Route path="/admin/customers/:id/points" element={<AdminLayout><CustomerManagement /></AdminLayout>} />

          {/* VIP & Membership Management */}
          <Route path="/admin/vip" element={<AdminLayout><VIPManagement /></AdminLayout>} />
          <Route path="/admin/vip/levels" element={<AdminLayout><VIPManagement /></AdminLayout>} />
          <Route path="/admin/vip/levels/add" element={<AdminLayout><VIPManagement /></AdminLayout>} />
          <Route path="/admin/vip/levels/:id" element={<AdminLayout><VIPManagement /></AdminLayout>} />
          <Route path="/admin/vip/customers" element={<AdminLayout><VIPManagement /></AdminLayout>} />
          <Route path="/admin/membership" element={<Navigate to="/admin/vip" replace />} />

          {/* Order Management */}
          <Route path="/admin/orders" element={<AdminLayout><OrderManagement /></AdminLayout>} />
          <Route path="/admin/orders/add" element={<AdminLayout><OrderManagement /></AdminLayout>} />
          <Route path="/admin/orders/:id" element={<AdminLayout><OrderDetailManagement /></AdminLayout>} />
          <Route path="/admin/orders/:id/edit" element={<AdminLayout><OrderDetailManagement /></AdminLayout>} />
          <Route path="/admin/orders/:id/status" element={<AdminLayout><OrderDetailManagement /></AdminLayout>} />
          <Route path="/admin/orders/:id/cancel" element={<AdminLayout><OrderDetailManagement /></AdminLayout>} />

          {/* Invoice Management */}
          <Route path="/admin/invoices" element={<AdminLayout><InvoiceManagement /></AdminLayout>} />
          <Route path="/admin/invoices/:id" element={<AdminLayout><InvoiceManagement /></AdminLayout>} />
          <Route path="/admin/invoices/:id/print" element={<AdminLayout><InvoiceManagement /></AdminLayout>} />

          {/* Payment Management */}
          <Route path="/admin/payments" element={<AdminLayout><PaymentTransactionManagement /></AdminLayout>} />
          <Route path="/admin/payments/:id" element={<AdminLayout><PaymentTransactionManagement /></AdminLayout>} />
          <Route path="/admin/payments/pending" element={<AdminLayout><PaymentTransactionManagement /></AdminLayout>} />
          <Route path="/admin/payments/completed" element={<AdminLayout><PaymentTransactionManagement /></AdminLayout>} />
          <Route path="/admin/transactions" element={<Navigate to="/admin/payments" replace />} />

          {/* Promotion & Discount Management */}
          <Route path="/admin/promotions" element={<AdminLayout><PromotionManagement /></AdminLayout>} />
          <Route path="/admin/promotions/add" element={<AdminLayout><PromotionManagement /></AdminLayout>} />
          <Route path="/admin/promotions/:id" element={<AdminLayout><PromotionManagement /></AdminLayout>} />
          <Route path="/admin/promotions/:id/edit" element={<AdminLayout><PromotionManagement /></AdminLayout>} />

          <Route path="/admin/discounts" element={<AdminLayout><DiscountManagement /></AdminLayout>} />
          <Route path="/admin/discounts/add" element={<AdminLayout><DiscountManagement /></AdminLayout>} />
          <Route path="/admin/discounts/:id" element={<AdminLayout><DiscountManagement /></AdminLayout>} />
          <Route path="/admin/discounts/:id/edit" element={<AdminLayout><DiscountManagement /></AdminLayout>} />

          {/* Voucher Management */}
          <Route path="/admin/vouchers" element={<AdminLayout><VoucherManagement /></AdminLayout>} />
          <Route path="/admin/vouchers/add" element={<AdminLayout><VoucherManagement /></AdminLayout>} />
          <Route path="/admin/vouchers/:id" element={<AdminLayout><VoucherManagement /></AdminLayout>} />
          <Route path="/admin/vouchers/:id/edit" element={<AdminLayout><VoucherManagement /></AdminLayout>} />
          <Route path="/admin/vouchers/:id/assign" element={<AdminLayout><VoucherManagement /></AdminLayout>} />

          {/* Inventory Management */}
          <Route path="/admin/inventory" element={<AdminLayout><InventoryAlerts /></AdminLayout>} />
          <Route path="/admin/inventory/alerts" element={<AdminLayout><InventoryAlerts /></AdminLayout>} />
          <Route path="/admin/inventory/stock" element={<AdminLayout><InventoryAlerts /></AdminLayout>} />
          <Route path="/admin/inventory/import" element={<AdminLayout><InventoryAlerts /></AdminLayout>} />
          <Route path="/admin/inventory/export" element={<AdminLayout><InventoryAlerts /></AdminLayout>} />

          {/* Sales Management */}
          <Route path="/admin/sales" element={<AdminLayout><SalesManagement /></AdminLayout>} />
          <Route path="/admin/sales/pos" element={<AdminLayout><SalesManagement /></AdminLayout>} />
          <Route path="/admin/sales/statistics" element={<AdminLayout><SalesManagement /></AdminLayout>} />

          {/* Reports & Analytics */}
          <Route path="/admin/reports" element={<AdminLayout><ReportsAnalytics /></AdminLayout>} />
          <Route path="/admin/reports/revenue" element={<AdminLayout><ReportsAnalytics /></AdminLayout>} />
          <Route path="/admin/reports/products" element={<AdminLayout><ReportsAnalytics /></AdminLayout>} />
          <Route path="/admin/reports/customers" element={<AdminLayout><ReportsAnalytics /></AdminLayout>} />
          <Route path="/admin/reports/inventory" element={<AdminLayout><ReportsAnalytics /></AdminLayout>} />
          <Route path="/admin/analytics" element={<Navigate to="/admin/reports" replace />} />

          {/* Account & User Management */}
          <Route path="/admin/accounts" element={<AdminLayout><AccountManagement /></AdminLayout>} />
          <Route path="/admin/accounts/add" element={<AdminLayout><AccountManagement /></AdminLayout>} />
          <Route path="/admin/accounts/:id" element={<AdminLayout><AccountManagement /></AdminLayout>} />
          <Route path="/admin/accounts/:id/edit" element={<AdminLayout><AccountManagement /></AdminLayout>} />
          <Route path="/admin/users" element={<Navigate to="/admin/accounts" replace />} />

          {/* System Settings */}
          <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
          <Route path="/admin/settings/general" element={<AdminLayout><Settings /></AdminLayout>} />
          <Route path="/admin/settings/payment" element={<AdminLayout><Settings /></AdminLayout>} />
          <Route path="/admin/settings/shipping" element={<AdminLayout><Settings /></AdminLayout>} />
          <Route path="/admin/settings/email" element={<AdminLayout><Settings /></AdminLayout>} />
          <Route path="/admin/settings/sms" element={<AdminLayout><Settings /></AdminLayout>} />

          {/* Backup & Restore */}
          <Route path="/admin/backup" element={<AdminLayout><BackupRestore /></AdminLayout>} />
          <Route path="/admin/backup/create" element={<AdminLayout><BackupRestore /></AdminLayout>} />
          <Route path="/admin/backup/restore" element={<AdminLayout><BackupRestore /></AdminLayout>} />
          <Route path="/admin/backup/schedule" element={<AdminLayout><BackupRestore /></AdminLayout>} />

          {/* Notifications */}
          <Route path="/admin/notifications" element={<AdminLayout><Notifications /></AdminLayout>} />
          <Route path="/admin/notifications/send" element={<AdminLayout><Notifications /></AdminLayout>} />

          {/* Backend Explorer - Development Tool */}
          <Route path="/admin/backend-explorer" element={<AdminLayout><BackendExplorer /></AdminLayout>} />
          <Route path="/admin/api-explorer" element={<Navigate to="/admin/backend-explorer" replace />} />


          {/* ============================================
            STAFF ROUTES - Nhân viên
        ============================================ */}

          {/* Staff Dashboard */}
          <Route path="/staff" element={<StaffLayout />} />
          <Route path="/staff/dashboard" element={<StaffLayout />} />

          {/* Staff Order Management */}
          <Route path="/staff/orders" element={<StaffLayout><OrderManagement /></StaffLayout>} />
          <Route path="/staff/orders/:id" element={<StaffLayout><OrderDetailManagement /></StaffLayout>} />
          <Route path="/staff/orders/pending" element={<StaffLayout><OrderManagement /></StaffLayout>} />
          <Route path="/staff/orders/processing" element={<StaffLayout><OrderManagement /></StaffLayout>} />
          <Route path="/staff/orders/completed" element={<StaffLayout><OrderManagement /></StaffLayout>} />

          {/* Staff Sales */}
          <Route path="/staff/sales" element={<StaffLayout><SalesManagement /></StaffLayout>} />
          <Route path="/staff/sales/pos" element={<StaffLayout><SalesManagement /></StaffLayout>} />

          {/* Staff Invoices */}
          <Route path="/staff/invoices" element={<StaffLayout><InvoiceManagement /></StaffLayout>} />
          <Route path="/staff/invoices/:id" element={<StaffLayout><InvoiceManagement /></StaffLayout>} />

          {/* Staff Payments */}
          <Route path="/staff/payments" element={<StaffLayout><PaymentTransactionManagement /></StaffLayout>} />
          <Route path="/staff/payments/:id" element={<StaffLayout><PaymentTransactionManagement /></StaffLayout>} />

          {/* Staff Inventory */}
          <Route path="/staff/inventory" element={<StaffLayout><InventoryAlerts /></StaffLayout>} />
          <Route path="/staff/inventory/alerts" element={<StaffLayout><InventoryAlerts /></StaffLayout>} />
          <Route path="/staff/inventory/check" element={<StaffLayout><InventoryAlerts /></StaffLayout>} />


          {/* ============================================
            UTILITY ROUTES
        ============================================ */}

          {/* Pending Tasks */}
          <Route path="/pending" element={<PendingTasks />} />
          <Route path="/tasks" element={<Navigate to="/pending" replace />} />

          {/* Main Dashboard (Role-based redirect) */}
          <Route path="/main-dashboard" element={<MainDashboard />} />
          <Route path="/dashboard" element={<MainDashboard />} />

          <Route path="/admin/membership/tiers" element={<AdminLayout><MembershipTierManagement /></AdminLayout>} />

          {/* ============================================
            ERROR & FALLBACK ROUTES
        ============================================ */}

          {/* 404 - Not Found - Redirect to home */}
          <Route path="/404" element={<Navigate to="/" replace />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;