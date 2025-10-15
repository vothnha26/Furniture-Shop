import React, { useState, useEffect } from 'react';
import { IoCloudUpload, IoCloudDownload, IoRefresh, IoTime, IoCheckmarkCircle, IoWarning, IoTrash, IoEye, IoAdd, IoShield } from 'react-icons/io5';
import api from '../../../api';

// Mapping functions for Vietnamese API field names
const mapBackupFromApi = (backup) => ({
  id: backup.id,
  name: backup.ten,
  type: backup.loai,
  size: backup.kich_thuoc,
  status: backup.trang_thai,
  createdAt: backup.ngay_tao,
  description: backup.mo_ta,
  filePath: backup.duong_dan_file,
  checksum: backup.checksum,
  compressionRatio: backup.ty_le_nen,
  createdBy: backup.nguoi_tao,
  tables: backup.bang_du_lieu || [],
  progress: backup.tien_trinh || 0
});

const mapBackupToApi = (backup) => ({
  ten: backup.name,
  loai: backup.type,
  mo_ta: backup.description,
  bang_du_lieu: backup.tables
});

const BackupRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // API Functions
  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/sao-luu');
      setBackups(response.data.map(mapBackupFromApi));
    } catch (error) {
      setError('Không thể tải danh sách sao lưu');
      console.error('Error fetching backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (backupData) => {
    try {
      const response = await api.post('/api/v1/sao-luu', mapBackupToApi(backupData));
      return mapBackupFromApi(response.data);
    } catch (error) {
      throw new Error('Không thể tạo bản sao lưu');
    }
  };

  const restoreBackup = async (backupId) => {
    try {
      const response = await api.post(`/api/v1/sao-luu/${backupId}/khoi-phuc`);
      return response.data;
    } catch (error) {
      throw new Error('Không thể khôi phục dữ liệu');
    }
  };

  const deleteBackup = async (backupId) => {
    try {
      await api.delete(`/api/v1/sao-luu/${backupId}`);
    } catch (error) {
      throw new Error('Không thể xóa bản sao lưu');
    }
  };

  const downloadBackup = async (backupId) => {
    try {
      const response = await api.get(`/api/v1/sao-luu/${backupId}/tai-xuong`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw new Error('Không thể tải xuống bản sao lưu');
    }
  };

  const uploadBackup = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/v1/sao-luu/tai-len', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return mapBackupFromApi(response.data);
    } catch (error) {
      throw new Error('Không thể tải lên bản sao lưu');
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const [mockBackups] = useState([
    {
      id: 'BK001',
      name: 'Backup hàng ngày - 2024-01-15',
      type: 'automatic',
      size: '2.5 GB',
      status: 'completed',
      createdAt: '2024-01-15 02:00:00',
      createdBy: 'Lộc',
      description: 'Sao lưu tự động hàng ngày',
      tables: ['products', 'customers', 'orders', 'inventory', 'users'],
      filePath: '/backups/daily_2024-01-15.sql',
      isEncrypted: true,
      compressionRatio: '75%'
    },
    {
      id: 'BK002',
      name: 'Backup trước cập nhật hệ thống',
      type: 'manual',
      size: '3.2 GB',
      status: 'completed',
      createdAt: '2024-01-14 18:30:00',
      createdBy: 'Lộc',
      description: 'Sao lưu trước khi cập nhật phiên bản mới',
      tables: ['products', 'customers', 'orders', 'inventory', 'users', 'settings'],
      filePath: '/backups/manual_2024-01-14.sql',
      isEncrypted: true,
      compressionRatio: '80%'
    },
    {
      id: 'BK003',
      name: 'Backup hàng tuần - 2024-01-10',
      type: 'scheduled',
      size: '2.8 GB',
      status: 'completed',
      createdAt: '2024-01-10 03:00:00',
      createdBy: 'Lộc',
      description: 'Sao lưu hàng tuần theo lịch',
      tables: ['products', 'customers', 'orders', 'inventory', 'users'],
      filePath: '/backups/weekly_2024-01-10.sql',
      isEncrypted: true,
      compressionRatio: '78%'
    },
    {
      id: 'BK004',
      name: 'Backup khẩn cấp',
      type: 'emergency',
      size: '1.9 GB',
      status: 'in_progress',
      createdAt: '2024-01-16 10:15:00',
      createdBy: 'Lộc',
      description: 'Sao lưu khẩn cấp do sự cố hệ thống',
      tables: ['products', 'customers', 'orders'],
      filePath: '/backups/emergency_2024-01-16.sql',
      isEncrypted: false,
      compressionRatio: '65%'
    }
  ]);

  const [backupSettings] = useState([
    {
      id: 1,
      name: 'Sao lưu hàng ngày',
      type: 'automatic',
      schedule: '02:00',
      frequency: 'daily',
      retention: 7,
      isEnabled: true,
      tables: ['products', 'customers', 'orders', 'inventory', 'users'],
      encryption: true,
      compression: true,
      createdBy: 'Lộc'
    },
    {
      id: 2,
      name: 'Sao lưu hàng tuần',
      type: 'scheduled',
      schedule: '03:00',
      frequency: 'weekly',
      retention: 4,
      isEnabled: true,
      tables: ['products', 'customers', 'orders', 'inventory', 'users', 'settings'],
      encryption: true,
      compression: true,
      createdBy: 'Lộc'
    },
    {
      id: 3,
      name: 'Sao lưu hàng tháng',
      type: 'scheduled',
      schedule: '04:00',
      frequency: 'monthly',
      retention: 12,
      isEnabled: true,
      tables: ['products', 'customers', 'orders', 'inventory', 'users', 'settings', 'logs'],
      encryption: true,
      compression: true,
      createdBy: 'Lộc'
    }
  ]);

  const statusConfig = {
    completed: { color: 'text-green-600', bg: 'bg-green-100', icon: IoCheckmarkCircle, label: 'Hoàn thành' },
    in_progress: { color: 'text-blue-600', bg: 'bg-blue-100', icon: IoTime, label: 'Đang xử lý' },
    failed: { color: 'text-red-600', bg: 'bg-red-100', icon: IoWarning, label: 'Thất bại' },
    pending: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: IoTime, label: 'Chờ xử lý' }
  };

  const typeConfig = {
    automatic: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Tự động' },
    manual: { color: 'text-green-600', bg: 'bg-green-100', label: 'Thủ công' },
    scheduled: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Theo lịch' },
    emergency: { color: 'text-red-600', bg: 'bg-red-100', label: 'Khẩn cấp' }
  };

  const getStatusInfo = (status) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const getTypeInfo = (type) => {
    return typeConfig[type] || typeConfig.manual;
  };

  const handleViewBackup = (backup) => {
    setSelectedBackup(backup);
    setShowBackupModal(true);
  };

  const handleCreateBackup = () => {
    setShowCreateModal(true);
  };

  const handleRestoreBackup = (backup) => {
    if (window.confirm(`Bạn có chắc muốn khôi phục từ backup ${backup.name}? Tất cả dữ liệu hiện tại sẽ bị ghi đè.`)) {
      // Simulate restore process
      console.log('Restoring from backup:', backup.id);
    }
  };

  const handleDownloadBackup = (backup) => {
    // Simulate download
    console.log('Downloading backup:', backup.id);
  };

  const handleDeleteBackup = (backup) => {
    if (window.confirm(`Bạn có chắc muốn xóa backup ${backup.name}?`)) {
      // Simulate delete
      console.log('Deleting backup:', backup.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sao lưu và khôi phục dữ liệu</h1>
          <p className="text-gray-600">Quản lý sao lưu và khôi phục dữ liệu hệ thống</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IoCloudUpload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng backup</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Thành công</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <IoTime className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IoShield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng dung lượng</p>
                <p className="text-2xl font-bold text-gray-900">10.4 GB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Backups List */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách backup</h3>
            <div className="flex items-center space-x-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <IoRefresh className="w-4 h-4" />
                Làm mới
              </button>
              <button 
                onClick={handleCreateBackup}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <IoAdd className="w-4 h-4" />
                Tạo backup
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên backup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kích thước
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tạo bởi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => {
                  const statusInfo = getStatusInfo(backup.status);
                  const typeInfo = getTypeInfo(backup.type);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={backup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                        <div className="text-sm text-gray-500">{backup.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{backup.size}</div>
                        <div className="text-sm text-gray-500">Nén: {backup.compressionRatio}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {backup.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backup.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewBackup(backup)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <IoEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadBackup(backup)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <IoCloudDownload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRestoreBackup(backup)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <IoRefresh className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(backup)}
                            className="text-red-600 hover:text-red-800"
                          >
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

        {/* Backup Settings */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Cài đặt sao lưu</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {backupSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{setting.name}</h4>
                    <p className="text-sm text-gray-600">
                      Lịch: {setting.schedule} • Tần suất: {setting.frequency} • Lưu trữ: {setting.retention} ngày
                    </p>
                    <p className="text-sm text-gray-500">
                      Bảng: {setting.tables.join(', ')} • Mã hóa: {setting.encryption ? 'Có' : 'Không'} • Nén: {setting.compression ? 'Có' : 'Không'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      setting.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {setting.isEnabled ? 'Bật' : 'Tắt'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <IoEye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Backup Detail Modal */}
        {showBackupModal && selectedBackup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Chi tiết backup
                  </h3>
                  <button
                    onClick={() => setShowBackupModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoRefresh className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Backup Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tên:</span>
                          <span className="text-sm font-medium">{selectedBackup.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Loại:</span>
                          <span className="text-sm font-medium">{getTypeInfo(selectedBackup.type).label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Kích thước:</span>
                          <span className="text-sm font-medium">{selectedBackup.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Trạng thái:</span>
                          <span className={`text-sm font-medium ${getStatusInfo(selectedBackup.status).color}`}>
                            {getStatusInfo(selectedBackup.status).label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin kỹ thuật</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Mã hóa:</span>
                          <span className="text-sm font-medium">{selectedBackup.isEncrypted ? 'Có' : 'Không'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tỷ lệ nén:</span>
                          <span className="text-sm font-medium">{selectedBackup.compressionRatio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tạo bởi:</span>
                          <span className="text-sm font-medium">{selectedBackup.createdBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Thời gian:</span>
                          <span className="text-sm font-medium">{selectedBackup.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tables Included */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Bảng dữ liệu</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBackup.tables.map((table) => (
                        <span key={table} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {table}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* File Path */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Đường dẫn file</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-sm text-gray-700">{selectedBackup.filePath}</code>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowBackupModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => handleDownloadBackup(selectedBackup)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Tải xuống
                    </button>
                    <button
                      onClick={() => handleRestoreBackup(selectedBackup)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Khôi phục
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupRestore;

