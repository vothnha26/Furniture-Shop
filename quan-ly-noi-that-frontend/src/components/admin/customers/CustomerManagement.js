import React, { useState, useEffect } from 'react';
import { IoAdd, IoSearch, IoCreate, IoTrash, IoEye, IoPerson, IoMail, IoCall, IoLocation, IoStar, IoStarOutline } from 'react-icons/io5';
import api from '../../../api';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVipLevel, setSelectedVipLevel] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    vipLevel: 'silver'
  });

  const vipLevels = [
    { value: 'silver', label: 'Bạc', color: 'bg-gray-100 text-gray-800' },
    { value: 'gold', label: 'Vàng', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'platinum', label: 'Bạch kim', color: 'bg-purple-100 text-purple-800' },
    { value: 'diamond', label: 'Kim cương', color: 'bg-blue-100 text-blue-800' }
  ];

  const getVipLevelInfo = (level) => {
    return vipLevels.find(vip => vip.value === level) || vipLevels[0];
  };

  // Map API customer object -> UI shape
  const mapCustomerFromApi = (c) => ({
    id: c.maKhachHang || c.id || c.ma || c.maKhachHang,
    name: c.hoTen || c.name || c.ten || '',
    email: c.email || '',
    phone: c.soDienThoai || c.phone || '',
    address: c.diaChi || c.address || '',
    totalOrders: c.tongSoDonHang || c.totalOrders || 0,
    totalSpent: c.tongChiTieu || c.totalSpent || 0,
    lastOrder: c.donHangCuoi || c.lastOrder || '',
    status: c.trangThai === false ? 'inactive' : (c.trangThai || 'active'),
    vipLevel: (c.maHangThanhVien && String(c.maHangThanhVien)) || c.vipLevel || 'silver',
    joinDate: c.ngayTao || c.joinDate || ''
  });

  // Map UI shape -> API payload for create/update (assumptions)
  const mapCustomerToApi = (u) => ({
    hoTen: u.name,
    email: u.email,
    soDienThoai: u.phone,
    diaChi: u.address,
    maHangThanhVien: u.vipLevel
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/v1/khach-hang');
        if (Array.isArray(data)) {
          setCustomers(data.map(mapCustomerFromApi));
        } else if (data && data.content) {
          // handle paged response shape
          setCustomers(data.content.map(mapCustomerFromApi));
        } else {
          setCustomers([]);
        }
      } catch (err) {
        setError(err);
        console.error('Fetch customers error', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleAddCustomer = () => {
    const doAdd = async () => {
      const payload = mapCustomerToApi(newCustomer);
      try {
        const created = await api.post('/api/v1/khach-hang', { body: payload });
        // map response
        const createdMapped = mapCustomerFromApi(created || {});
        setCustomers(prev => [...prev, createdMapped]);
      } catch (err) {
        console.error('Add customer error', err);
        setError(err);
      } finally {
        setNewCustomer({ name: '', email: '', phone: '', address: '', vipLevel: 'silver' });
        setShowAddModal(false);
      }
    };
    doAdd();
  };

  const handleDeleteCustomer = (id) => {
    const doDelete = async () => {
      try {
        await api.del(`/api/v1/khach-hang/${id}`);
        setCustomers(prev => prev.filter(customer => customer.id !== id));
      } catch (err) {
        console.error('Delete customer error', err);
        setError(err);
      }
    };
    doDelete();
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const doSave = async () => {
      try {
        const payload = mapCustomerToApi(selectedCustomer);
        await api.put(`/api/v1/khach-hang/${selectedCustomer.id}`, { body: payload });
        setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, ...selectedCustomer } : c));
      } catch (err) {
        console.error('Save edit error', err);
        setError(err);
      } finally {
        setShowEditModal(false);
        setSelectedCustomer(null);
      }
    };
    doSave();
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    const matchesVipLevel = selectedVipLevel === 'all' || customer.vipLevel === selectedVipLevel;
    return matchesSearch && matchesStatus && matchesVipLevel;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Khách hàng</h1>
          <p className="text-gray-600">Quản lý thông tin và phân loại khách hàng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IoPerson className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng khách hàng</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <IoStar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Khách hàng hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(customer => customer.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <IoStar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">VIP Gold+</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(customer => ['gold', 'platinum', 'diamond'].includes(customer.vipLevel)).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IoStar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">VIP Platinum+</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(customer => ['platinum', 'diamond'].includes(customer.vipLevel)).length}
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
                  placeholder="Tìm kiếm khách hàng..."
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
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
              <select
                value={selectedVipLevel}
                onChange={(e) => setSelectedVipLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tất cả VIP</option>
                <option value="silver">Bạc</option>
                <option value="gold">Vàng</option>
                <option value="platinum">Bạch kim</option>
                <option value="diamond">Kim cương</option>
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <IoAdd className="w-5 h-5" />
              Thêm khách hàng
            </button>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VIP Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng chi tiêu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => {
                  const vipInfo = getVipLevelInfo(customer.vipLevel);
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <IoPerson className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Tham gia: {customer.joinDate}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${vipInfo.color}`}>
                          {vipInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.totalSpent.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Xem chi tiết"
                          >
                            <IoEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="text-green-600 hover:text-green-800"
                            title="Chỉnh sửa"
                          >
                            <IoCreate className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa"
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

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Thêm khách hàng mới</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VIP Level
                  </label>
                  <select
                    value={newCustomer.vipLevel}
                    onChange={(e) => setNewCustomer({...newCustomer, vipLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {vipLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Thêm khách hàng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Detail Modal */}
        {showDetailModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Chi tiết khách hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedCustomer.name}</h4>
                    <p className="text-gray-600">{selectedCustomer.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoCall className="w-4 h-4 text-gray-500" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoLocation className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedCustomer.address}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tham gia: </span>
                    <span className="text-sm font-medium">{selectedCustomer.joinDate}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">VIP Level: </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVipLevelInfo(selectedCustomer.vipLevel).color}`}>
                      {getVipLevelInfo(selectedCustomer.vipLevel).label}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tổng đơn hàng: </span>
                    <span className="text-sm font-medium">{selectedCustomer.totalOrders}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tổng chi tiêu: </span>
                    <span className="text-sm font-medium">{selectedCustomer.totalSpent.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Đơn hàng cuối: </span>
                    <span className="text-sm font-medium">{selectedCustomer.lastOrder}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Trạng thái: </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedCustomer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCustomer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Chỉnh sửa khách hàng</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên khách hàng
                    </label>
                    <input
                      type="text"
                      value={selectedCustomer.name}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={selectedCustomer.email}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={selectedCustomer.phone}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VIP Level
                    </label>
                    <select
                      value={selectedCustomer.vipLevel}
                      onChange={(e) => setSelectedCustomer({...selectedCustomer, vipLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {vipLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <textarea
                    value={selectedCustomer.address}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={selectedCustomer.status}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;

