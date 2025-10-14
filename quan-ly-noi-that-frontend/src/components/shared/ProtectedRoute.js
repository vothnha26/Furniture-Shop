import React from 'react';
import { IoShield, IoLockClosed } from 'react-icons/io5';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermissions = [],
  fallback = null 
}) => {
  // Mock authentication state - in real app, this would come from context/state
  const isAuthenticated = true; // Mock: user is logged in
  const userRole = 'admin'; // Mock: user role
  const userPermissions = ['read', 'write', 'delete']; // Mock: user permissions

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-blue-500 mb-4">
            <IoLockClosed className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để truy cập trang này.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <IoShield className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không có quyền truy cập
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-yellow-500 mb-4">
              <IoShield className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Thiếu quyền
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn không có đủ quyền để thực hiện thao tác này.
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      );
    }
  }

  // Return fallback if provided and user doesn't meet requirements
  if (fallback) {
    return fallback;
  }

  // All checks passed, render children
  return children;
};

export default ProtectedRoute;



