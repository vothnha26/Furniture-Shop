import React, { useState, useEffect } from 'react';
import { IoWarning, IoCheckmarkCircle, IoTime, IoRefresh, IoAdd, IoEye, IoCreate, IoTrash, IoNotifications } from 'react-icons/io5';
import api from '../../../api';

const InventoryAlerts = () => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map alert data from API
  const mapAlertFromApi = (alert) => ({
    id: alert.maCanhBao || alert.id,
    product: alert.bienTheSanPham?.sanPham?.tenSanPham || alert.product || '',
    variant: alert.bienTheSanPham?.tenBienThe || alert.variant || '',
    currentStock: alert.soLuongHienTai || alert.currentStock || 0,
    minStock: alert.soLuongToiThieu || alert.minStock || 0,
    maxStock: alert.soLuongToiDa || alert.maxStock || 0,
    priority: mapPriority(alert.mucDoUuTien || alert.priority),
    category: alert.danhMuc?.tenDanhMuc || alert.category || '',
    supplier: alert.nhaCungCap?.tenNhaCungCap || alert.supplier || '',
    status: alert.trangThai || alert.status || 'active',
    createdAt: alert.ngayTao || alert.createdAt || '',
    notes: alert.ghiChu || alert.notes || ''
  });

  const mapPriority = (priority) => {
    const priorityMap = {
      'Thấp': 'low',
      'Trung bình': 'medium', 
      'Cao': 'high',
      'Khẩn cấp': 'critical'
    };
    return priorityMap[priority] || priority;
  };

  // Fetch inventory alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/v1/quan-ly-ton-kho/canh-bao');
        if (Array.isArray(data)) {
          setAlerts(data.map(mapAlertFromApi));
        }
      } catch (err) {
        console.error('Fetch alerts error', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const [newAlert, setNewAlert] = useState({
    product: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    priority: 'medium',
    category: '',
    supplier: '',
    notes: ''
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      product: 'Ghế gỗ cao cấp',
      sku: 'GG001',
      currentStock: 3,
      minStock: 5,
      maxStock: 50,
      status: 'low_stock',
      priority: 'high',
      category: 'Ghế',
      supplier: 'Nhà cung cấp A',
      lastRestock: '2024-01-10',
      nextRestock: '2024-01-25',
      createdBy: 'Huy',
      createdAt: '2024-01-15 09:00:00',
      isActive: true
    },
    {
      id: 2,
      product: 'Bàn ăn 6 người',
      sku: 'BA002',
      currentStock: 1,
      minStock: 3,
      maxStock: 20,
      status: 'critical',
      priority: 'urgent',
      category: 'Bàn',
      supplier: 'Nhà cung cấp B',
      lastRestock: '2024-01-08',
      nextRestock: '2024-01-20',
      createdBy: 'Huy',
      createdAt: '2024-01-12 14:30:00',
      isActive: true
    },
    {
      id: 3,
      product: 'Tủ quần áo 3 cánh',
      sku: 'TQ003',
      currentStock: 0,
      minStock: 2,
      maxStock: 15,
      status: 'out_of_stock',
      priority: 'urgent',
      category: 'Tủ',
      supplier: 'Nhà cung cấp C',
      lastRestock: '2024-01-05',
      nextRestock: '2024-01-18',
      createdBy: 'Huy',
      createdAt: '2024-01-14 16:45:00',
      isActive: true
    },
    {
      id: 4,
      product: 'Giường ngủ gỗ',
      sku: 'GN004',
      currentStock: 8,
      minStock: 5,
      maxStock: 25,
      status: 'normal',
      priority: 'low',
      category: 'Giường',
      supplier: 'Nhà cung cấp D',
      lastRestock: '2024-01-12',
      nextRestock: '2024-02-01',
      createdBy: 'Huy',
      createdAt: '2024-01-10 11:20:00',
      isActive: false
    }
  ]);

  const [alertSettings] = useState([
    {
      id: 1,
      name: 'Cảnh báo tồn kho thấp',
      type: 'low_stock',
      threshold: 5,
      isEnabled: true,
      notificationMethods: ['email', 'sms', 'push'],
      recipients: ['huy@furnishop.com', 'nha@furnishop.com', 'bao@furnishop.com', 'phuc@furnishop.com', 'loc@furnishop.com'],
      createdBy: 'Phúc'
    },
    {
      id: 2,
      name: 'Cảnh báo hết hàng',
      type: 'out_of_stock',
      threshold: 0,
      isEnabled: true,
      notificationMethods: ['email', 'sms'],
      recipients: ['phuc@furnishop.com', 'inventory@furnishop.com'],
      createdBy: 'Phúc'
    },
    {
      id: 3,
      name: 'Cảnh báo tồn kho cao',
      type: 'overstock',
      threshold: 80,
      isEnabled: true,
      notificationMethods: ['email'],
      recipients: ['phuc@furnishop.com'],
      createdBy: 'Phúc'
    }
  ]);

  const statusConfig = {
    normal: { color: 'text-green-600', bg: 'bg-green-100', icon: IoCheckmarkCircle, label: 'Bình thường' },
    low_stock: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: IoWarning, label: 'Tồn kho thấp' },
    critical: { color: 'text-orange-600', bg: 'bg-orange-100', icon: IoWarning, label: 'Cảnh báo' },
    out_of_stock: { color: 'text-red-600', bg: 'bg-red-100', icon: IoWarning, label: 'Hết hàng' }
  };

  const priorityConfig = {
    low: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Thấp' },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Trung bình' },
    high: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Cao' },
    urgent: { color: 'text-red-600', bg: 'bg-red-100', label: 'Khẩn cấp' }
  };

  const getStatusInfo = (status) => {
    return statusConfig[status] || statusConfig.normal;
  };

  const getPriorityInfo = (priority) => {
    return priorityConfig[priority] || priorityConfig.low;
  };

  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setShowAlertModal(true);
  };

  const handleCreateAlert = () => {
    setShowCreateAlertModal(true);
  };

  const handleSaveAlert = () => {
    console.log('Creating new alert:', newAlert);
    setShowCreateAlertModal(false);
    setNewAlert({
      product: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      priority: 'medium',
      category: '',
      supplier: '',
      notes: ''
    });
  };

  const getStockPercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  const getStockColor = (percentage) => {
    if (percentage === 0) return 'bg-red-500';
    if (percentage < 20) return 'bg-orange-500';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cảnh báo tồn kho</h1>
          <p className="text-gray-600">Theo dõi và quản lý cảnh báo tồn kho</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <IoWarning className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cảnh báo khẩn cấp</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <IoTime className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tồn kho thấp</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bình thường</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IoNotifications className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng cảnh báo</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách cảnh báo</h3>
            <div className="flex items-center space-x-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <IoRefresh className="w-4 h-4" />
                Làm mới
              </button>
              <button 
                onClick={handleCreateAlert}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <IoAdd className="w-4 h-4" />
                Tạo cảnh báo
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ưu tiên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhà cung cấp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tạo bởi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert) => {
                  const statusInfo = getStatusInfo(alert.status);
                  const priorityInfo = getPriorityInfo(alert.priority);
                  const StatusIcon = statusInfo.icon;
                  const stockPercentage = getStockPercentage(alert.currentStock, alert.maxStock);
                  
                  return (
                    <tr key={alert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{alert.product}</div>
                        <div className="text-sm text-gray-500">{alert.sku} • {alert.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{alert.currentStock}</span>
                              <span className="text-gray-500">/{alert.maxStock}</span>
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${getStockColor(stockPercentage)}`}
                                style={{ width: `${stockPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.bg} ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewAlert(alert)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <IoEye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <IoCreate className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <IoTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Cài đặt cảnh báo</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alertSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{setting.name}</h4>
                    <p className="text-sm text-gray-600">
                      Ngưỡng: {setting.threshold} • Phương thức: {setting.notificationMethods.join(', ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Người nhận: {setting.recipients.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      setting.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {setting.isEnabled ? 'Bật' : 'Tắt'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <IoCreate className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Detail Modal */}
        {showAlertModal && selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Chi tiết cảnh báo
                  </h3>
                  <button
                    onClick={() => setShowAlertModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoRefresh className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Product Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin sản phẩm</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tên sản phẩm:</span>
                          <span className="text-sm font-medium">{selectedAlert.product}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">SKU:</span>
                          <span className="text-sm font-medium">{selectedAlert.sku}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Danh mục:</span>
                          <span className="text-sm font-medium">{selectedAlert.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Nhà cung cấp:</span>
                          <span className="text-sm font-medium">{selectedAlert.supplier}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin tồn kho</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tồn kho hiện tại:</span>
                          <span className="text-sm font-medium">{selectedAlert.currentStock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tồn kho tối thiểu:</span>
                          <span className="text-sm font-medium">{selectedAlert.minStock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tồn kho tối đa:</span>
                          <span className="text-sm font-medium">{selectedAlert.maxStock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lần nhập cuối:</span>
                          <span className="text-sm font-medium">{selectedAlert.lastRestock}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowAlertModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Đóng
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                      Cập nhật tồn kho
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Alert Modal */}
        {showCreateAlertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Tạo cảnh báo tồn kho mới
                  </h3>
                  <button
                    onClick={() => setShowCreateAlertModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoRefresh className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveAlert(); }}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
                        <input
                          type="text"
                          value={newAlert.product}
                          onChange={(e) => setNewAlert({...newAlert, product: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nhập tên sản phẩm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <select
                          value={newAlert.category}
                          onChange={(e) => setNewAlert({...newAlert, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Chọn danh mục</option>
                          <option value="furniture">Nội thất</option>
                          <option value="decoration">Trang trí</option>
                          <option value="lighting">Đèn</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho hiện tại</label>
                        <input
                          type="number"
                          value={newAlert.currentStock}
                          onChange={(e) => setNewAlert({...newAlert, currentStock: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho tối thiểu</label>
                        <input
                          type="number"
                          value={newAlert.minStock}
                          onChange={(e) => setNewAlert({...newAlert, minStock: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho tối đa</label>
                        <input
                          type="number"
                          value={newAlert.maxStock}
                          onChange={(e) => setNewAlert({...newAlert, maxStock: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên</label>
                        <select
                          value={newAlert.priority}
                          onChange={(e) => setNewAlert({...newAlert, priority: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="low">Thấp</option>
                          <option value="medium">Trung bình</option>
                          <option value="high">Cao</option>
                          <option value="critical">Khẩn cấp</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
                        <input
                          type="text"
                          value={newAlert.supplier}
                          onChange={(e) => setNewAlert({...newAlert, supplier: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nhập tên nhà cung cấp"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                      <textarea
                        value={newAlert.notes}
                        onChange={(e) => setNewAlert({...newAlert, notes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="3"
                        placeholder="Nhập ghi chú bổ sung..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowCreateAlertModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Tạo cảnh báo
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

export default InventoryAlerts;


