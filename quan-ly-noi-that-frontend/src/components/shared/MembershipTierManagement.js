import React, { useState, useEffect } from 'react';
import { IoAdd, IoCreate, IoTrash, IoEye, IoSearch, IoFilter, IoDownload, IoTrophy, IoStar, IoTrendingUp, IoCard, IoGift, IoTime } from 'react-icons/io5';
import Modal from './Modal';
import Toast from './Toast';
import api from '../api';

const MembershipTierManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map membership tier data from API
  const mapMembershipTierFromApi = (tier) => ({
    maHang: tier.maHangThanhVien || tier.id,
    tenHang: tier.tenHang || tier.name,
    diemToiThieu: tier.diemToiThieu || tier.minPoints || 0,
    diemToiDa: tier.diemToiDa || tier.maxPoints || 0,
    tiLeHoan: tier.tiLeHoan || tier.pointsRate || 1.0,
    tiLeGiam: tier.tiLeGiam || tier.discountRate || 0,
    gioiHanMuaHang: tier.gioiHanMuaHang || tier.purchaseLimit || 0,
    uu_dai: tier.uuDaiList?.map(benefit => ({
      tenUuDai: benefit.tenUuDai || benefit.name,
      moTa: benefit.moTa || benefit.description,
      giaTriUuDai: benefit.giaTriUuDai || benefit.value
    })) || [],
    mauSac: tier.mauSac || tier.color || '#gray',
    icon: tier.icon || tier.icon || 'star',
    thuTu: tier.thuTu || tier.order || 0,
    trangThai: tier.trangThai || tier.active || true,
    soKhachHang: tier.soKhachHang || tier.memberCount || 0
  });

  const mapMembershipTierToApi = (tier) => ({
    tenHang: tier.tenHang,
    diemToiThieu: tier.diemToiThieu,
    diemToiDa: tier.diemToiDa,
    tiLeHoan: tier.tiLeHoan,
    tiLeGiam: tier.tiLeGiam,
    gioiHanMuaHang: tier.gioiHanMuaHang,
    mauSac: tier.mauSac,
    icon: tier.icon,
    thuTu: tier.thuTu,
    trangThai: tier.trangThai,
    uuDaiList: tier.uu_dai.map(benefit => ({
      tenUuDai: benefit.tenUuDai,
      moTa: benefit.moTa,
      giaTriUuDai: benefit.giaTriUuDai
    }))
  });

  // Fetch membership tiers
  useEffect(() => {
    const fetchMembershipTiers = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/hang-thanh-vien');
        if (Array.isArray(data)) {
          setMembershipTiers(data.map(mapMembershipTierFromApi));
        }
      } catch (err) {
        console.error('Fetch membership tiers error', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembershipTiers();
  }, []);

  const [membershipTiers, setMembershipTiers] = useState([
    {
      maHang: 'HTV001',
      tenHang: 'Đồng',
      diemToiThieu: 0,
      diemToiDa: 999,
      tiLeHoan: 1.0,
      tiLeGiam: 0,
      gioiHanMuaHang: 10000000,
      uu_dai: [
        'Tích điểm cơ bản 1%',
        'Tư vấn miễn phí',
        'Bảo hành cơ bản 12 tháng'
      ],
      mauSac: 'bg-amber-600',
      bieuTuong: '🥉',
      moTa: 'Hạng thành viên cơ bản dành cho khách hàng mới',
      trangThai: 'hoat_dong',
      soThanhVien: 1250,
      ngayTao: '2024-01-01',
      nguoiTao: 'Huy'
    },
    {
      maHang: 'HTV002',
      tenHang: 'Bạc',
      diemToiThieu: 1000,
      diemToiDa: 4999,
      tiLeHoan: 1.5,
      tiLeGiam: 2,
      gioiHanMuaHang: 50000000,
      uu_dai: [
        'Tích điểm 1.5%',
        'Giảm giá 2% tất cả sản phẩm',
        'Miễn phí vận chuyển nội thành',
        'Ưu tiên hỗ trợ khách hàng',
        'Bảo hành mở rộng 18 tháng'
      ],
      mauSac: 'bg-gray-500',
      bieuTuong: '🥈',
      moTa: 'Hạng thành viên trung cấp với nhiều ưu đãi',
      trangThai: 'hoat_dong',
      soThanhVien: 850,
      ngayTao: '2024-01-01',
      nguoiTao: 'Huy'
    },
    {
      maHang: 'HTV003',
      tenHang: 'Vàng',
      diemToiThieu: 5000,
      diemToiDa: 14999,
      tiLeHoan: 2.0,
      tiLeGiam: 5,
      gioiHanMuaHang: 100000000,
      uu_dai: [
        'Tích điểm 2%',
        'Giảm giá 5% tất cả sản phẩm',
        'Miễn phí vận chuyển toàn quốc',
        'Tư vấn thiết kế miễn phí',
        'Ưu tiên đặt hàng sản phẩm mới',
        'Bảo hành VIP 24 tháng',
        'Quà tặng sinh nhật'
      ],
      mauSac: 'bg-yellow-500',
      bieuTuong: '🥇',
      moTa: 'Hạng thành viên cao cấp với ưu đãi đặc biệt',
      trangThai: 'hoat_dong',
      soThanhVien: 420,
      ngayTao: '2024-01-01',
      nguoiTao: 'Huy'
    },
    {
      maHang: 'HTV004',
      tenHang: 'Bạch Kim',
      diemToiThieu: 15000,
      diemToiDa: 49999,
      tiLeHoan: 3.0,
      tiLeGiam: 8,
      gioiHanMuaHang: 200000000,
      uu_dai: [
        'Tích điểm 3%',
        'Giảm giá 8% tất cả sản phẩm',
        'Miễn phí vận chuyển và lắp đặt',
        'Tư vấn thiết kế chuyên sâu',
        'Truy cập sớm sản phẩm limited',
        'Bảo hành premium 36 tháng',
        'Quà tặng sinh nhật cao cấp',
        'Hỗ trợ 24/7',
        'Voucher đặc biệt hàng tháng'
      ],
      mauSac: 'bg-gray-400',
      bieuTuong: '💎',
      moTa: 'Hạng thành viên platinum với đầy đủ đặc quyền',
      trangThai: 'hoat_dong',
      soThanhVien: 180,
      ngayTao: '2024-01-01',
      nguoiTao: 'Huy'
    },
    {
      maHang: 'HTV005',
      tenHang: 'Kim Cương',
      diemToiThieu: 50000,
      diemToiDa: 999999,
      tiLeHoan: 5.0,
      tiLeGiam: 12,
      gioiHanMuaHang: 500000000,
      uu_dai: [
        'Tích điểm 5%',
        'Giảm giá 12% tất cả sản phẩm',
        'Miễn phí toàn bộ dịch vụ',
        'Tư vấn kiến trúc sư chuyên nghiệp',
        'Sản phẩm độc quyền và custom',
        'Bảo hành trọn đời',
        'Quà tặng sinh nhật sang trọng',
        'Chăm sóc khách hàng riêng',
        'Voucher VIP hàng tháng',
        'Mời tham gia sự kiện độc quyền',
        'Ưu tiên tối đa trong mọi dịch vụ'
      ],
      mauSac: 'bg-blue-600',
      bieuTuong: '👑',
      moTa: 'Hạng thành viên VIP cao nhất với đặc quyền tối đa',
      trangThai: 'hoat_dong',
      soThanhVien: 45,
      ngayTao: '2024-01-01',
      nguoiTao: 'Huy'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [editingTier, setEditingTier] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tierToDelete, setTierToDelete] = useState(null);

  const [newTier, setNewTier] = useState({
    tenHang: '',
    diemToiThieu: '',
    diemToiDa: '',
    tiLeHoan: '',
    tiLeGiam: '',
    gioiHanMuaHang: '',
    uu_dai: [''],
    mauSac: 'bg-blue-600',
    bieuTuong: '⭐',
    moTa: '',
    trangThai: 'hoat_dong'
  });

  // Filter membership tiers
  const filteredTiers = membershipTiers.filter(tier => {
    const matchesSearch = tier.tenHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tier.maHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tier.moTa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tier.trangThai === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => a.diemToiThieu - b.diemToiThieu);

  // Statistics
  const stats = {
    total: membershipTiers.length,
    active: membershipTiers.filter(tier => tier.trangThai === 'hoat_dong').length,
    inactive: membershipTiers.filter(tier => tier.trangThai === 'tam_dung').length,
    totalMembers: membershipTiers.reduce((sum, tier) => sum + tier.soThanhVien, 0),
    avgRewardRate: membershipTiers.reduce((sum, tier) => sum + tier.tiLeHoan, 0) / membershipTiers.length,
    avgDiscountRate: membershipTiers.reduce((sum, tier) => sum + tier.tiLeGiam, 0) / membershipTiers.length
  };

  const colors = [
    'bg-amber-600', 'bg-gray-500', 'bg-yellow-500', 'bg-gray-400', 
    'bg-blue-600', 'bg-purple-600', 'bg-red-600', 'bg-green-600',
    'bg-indigo-600', 'bg-pink-600'
  ];

  const icons = ['⭐', '🥉', '🥈', '🥇', '💎', '👑', '🏆', '🎖️', '🌟', '✨'];

  const handleAddTier = () => {
    if (!newTier.tenHang || !newTier.diemToiThieu || !newTier.diemToiDa || !newTier.tiLeHoan) {
      Toast.show('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    if (parseInt(newTier.diemToiThieu) >= parseInt(newTier.diemToiDa)) {
      Toast.show('Điểm tối thiểu phải nhỏ hơn điểm tối đa', 'error');
      return;
    }

    const tier = {
      maHang: `HTV${String(membershipTiers.length + 1).padStart(3, '0')}`,
      ...newTier,
      diemToiThieu: parseInt(newTier.diemToiThieu),
      diemToiDa: parseInt(newTier.diemToiDa),
      tiLeHoan: parseFloat(newTier.tiLeHoan),
      tiLeGiam: parseFloat(newTier.tiLeGiam) || 0,
      gioiHanMuaHang: parseInt(newTier.gioiHanMuaHang) || 0,
      uu_dai: newTier.uu_dai.filter(benefit => benefit.trim() !== ''),
      soThanhVien: 0,
      ngayTao: new Date().toISOString().split('T')[0],
      nguoiTao: 'Huy'
    };

    setMembershipTiers([...membershipTiers, tier]);
    setNewTier({
      tenHang: '',
      diemToiThieu: '',
      diemToiDa: '',
      tiLeHoan: '',
      tiLeGiam: '',
      gioiHanMuaHang: '',
      uu_dai: [''],
      mauSac: 'bg-blue-600',
      bieuTuong: '⭐',
      moTa: '',
      trangThai: 'hoat_dong'
    });
    setShowAddModal(false);
    Toast.show('Thêm hạng thành viên thành công', 'success');
  };

  const handleEditTier = () => {
    if (!editingTier.tenHang || !editingTier.diemToiThieu || !editingTier.diemToiDa || !editingTier.tiLeHoan) {
      Toast.show('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    if (parseInt(editingTier.diemToiThieu) >= parseInt(editingTier.diemToiDa)) {
      Toast.show('Điểm tối thiểu phải nhỏ hơn điểm tối đa', 'error');
      return;
    }

    setMembershipTiers(membershipTiers.map(tier => 
      tier.maHang === editingTier.maHang 
        ? { 
            ...editingTier, 
            diemToiThieu: parseInt(editingTier.diemToiThieu),
            diemToiDa: parseInt(editingTier.diemToiDa),
            tiLeHoan: parseFloat(editingTier.tiLeHoan),
            tiLeGiam: parseFloat(editingTier.tiLeGiam) || 0,
            gioiHanMuaHang: parseInt(editingTier.gioiHanMuaHang) || 0,
            uu_dai: editingTier.uu_dai.filter(benefit => benefit.trim() !== '')
          }
        : tier
    ));
    setShowEditModal(false);
    setEditingTier(null);
    Toast.show('Cập nhật hạng thành viên thành công', 'success');
  };

  const handleDeleteTier = () => {
    setMembershipTiers(membershipTiers.filter(tier => tier.maHang !== tierToDelete));
    setShowDeleteConfirm(false);
    setTierToDelete(null);
    Toast.show('Xóa hạng thành viên thành công', 'success');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'hoat_dong': return 'bg-green-100 text-green-800';
      case 'tam_dung': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'hoat_dong': return 'Hoạt động';
      case 'tam_dung': return 'Tạm dừng';
      default: return status;
    }
  };

  const addBenefit = (benefits, setBenefits) => {
    setBenefits([...benefits, '']);
  };

  const removeBenefit = (benefits, setBenefits, index) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const updateBenefit = (benefits, setBenefits, index, value) => {
    const updated = [...benefits];
    updated[index] = value;
    setBenefits(updated);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý hạng thành viên</h1>
        <p className="text-gray-600">Thiết lập và quản lý các hạng thành viên với ưu đãi tương ứng</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <IoTrophy className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Tổng hạng</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <IoStar className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-500">Hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <IoTime className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              <p className="text-sm text-gray-500">Tạm dừng</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <IoTrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Thành viên</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <IoCard className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.avgRewardRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">TB tích điểm</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
              <IoGift className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.avgDiscountRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">TB giảm giá</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 sm:max-w-md">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm hạng thành viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <IoFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="hoat_dong">Hoạt động</option>
                <option value="tam_dung">Tạm dừng</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <IoAdd className="w-4 h-4" />
              Thêm hạng mới
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <IoDownload className="w-4 h-4" />
              Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* Membership Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {filteredTiers.map((tier) => (
          <div key={tier.maHang} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className={`${tier.mauSac} p-4 text-white relative`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{tier.bieuTuong}</span>
                  <h3 className="text-lg font-bold">{tier.tenHang}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tier.trangThai === 'hoat_dong' ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'
                }`}>
                  {getStatusText(tier.trangThai)}
                </span>
              </div>
              <p className="text-sm opacity-90 mt-1">{tier.maHang}</p>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Điểm yêu cầu</label>
                  <p className="text-sm font-semibold">{tier.diemToiThieu.toLocaleString()} - {tier.diemToiDa.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Tích điểm</label>
                    <p className="text-sm font-semibold text-green-600">{tier.tiLeHoan}%</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Giảm giá</label>
                    <p className="text-sm font-semibold text-blue-600">{tier.tiLeGiam}%</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Thành viên</label>
                  <p className="text-sm font-semibold">{tier.soThanhVien.toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Ưu đãi chính</label>
                  <ul className="text-xs text-gray-600 space-y-1 max-h-20 overflow-y-auto">
                    {tier.uu_dai.slice(0, 3).map((benefit, index) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                    {tier.uu_dai.length > 3 && (
                      <li className="text-blue-600">+ {tier.uu_dai.length - 3} ưu đãi khác</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedTier(tier);
                    setShowDetailModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  title="Xem chi tiết"
                >
                  <IoEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingTier({
                      ...tier,
                      diemToiThieu: tier.diemToiThieu.toString(),
                      diemToiDa: tier.diemToiDa.toString(),
                      tiLeHoan: tier.tiLeHoan.toString(),
                      tiLeGiam: tier.tiLeGiam.toString(),
                      gioiHanMuaHang: tier.gioiHanMuaHang.toString()
                    });
                    setShowEditModal(true);
                  }}
                  className="text-yellow-600 hover:text-yellow-800"
                  title="Chỉnh sửa"
                >
                  <IoCreate className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setTierToDelete(tier.maHang);
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-600 hover:text-red-800"
                  title="Xóa"
                >
                  <IoTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTiers.length === 0 && (
        <div className="text-center py-12">
          <IoTrophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy hạng thành viên</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm hạng mới</p>
        </div>
      )}

      {/* Add Tier Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Thêm hạng thành viên mới">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên hạng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newTier.tenHang}
                onChange={(e) => setNewTier({...newTier, tenHang: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên hạng thành viên"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={newTier.trangThai}
                onChange={(e) => setNewTier({...newTier, trangThai: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hoat_dong">Hoạt động</option>
                <option value="tam_dung">Tạm dừng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm tối thiểu <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newTier.diemToiThieu}
                onChange={(e) => setNewTier({...newTier, diemToiThieu: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm tối đa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newTier.diemToiDa}
                onChange={(e) => setNewTier({...newTier, diemToiDa: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="9999"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỷ lệ hoàn điểm (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={newTier.tiLeHoan}
                onChange={(e) => setNewTier({...newTier, tiLeHoan: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1.0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ giảm giá (%)</label>
              <input
                type="number"
                step="0.1"
                value={newTier.tiLeGiam}
                onChange={(e) => setNewTier({...newTier, tiLeGiam: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn mua hàng (VND)</label>
              <input
                type="number"
                value={newTier.gioiHanMuaHang}
                onChange={(e) => setNewTier({...newTier, gioiHanMuaHang: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
              <select
                value={newTier.mauSac}
                onChange={(e) => setNewTier({...newTier, mauSac: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {colors.map(color => (
                  <option key={color} value={color}>
                    {color.replace('bg-', '').replace('-', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biểu tượng</label>
              <select
                value={newTier.bieuTuong}
                onChange={(e) => setNewTier({...newTier, bieuTuong: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {icons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={newTier.moTa}
                onChange={(e) => setNewTier({...newTier, moTa: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mô tả hạng thành viên"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ưu đãi</label>
              {newTier.uu_dai.map((benefit, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateBenefit(newTier.uu_dai, (benefits) => setNewTier({...newTier, uu_dai: benefits}), index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập ưu đãi"
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefit(newTier.uu_dai, (benefits) => setNewTier({...newTier, uu_dai: benefits}), index)}
                    className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <IoTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addBenefit(newTier.uu_dai, (benefits) => setNewTier({...newTier, uu_dai: benefits}))}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
              >
                + Thêm ưu đãi
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleAddTier}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Thêm hạng
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Tier Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Chỉnh sửa hạng thành viên">
        {editingTier && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên hạng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingTier.tenHang}
                  onChange={(e) => setEditingTier({...editingTier, tenHang: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={editingTier.trangThai}
                  onChange={(e) => setEditingTier({...editingTier, trangThai: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hoat_dong">Hoạt động</option>
                  <option value="tam_dung">Tạm dừng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm tối thiểu <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={editingTier.diemToiThieu}
                  onChange={(e) => setEditingTier({...editingTier, diemToiThieu: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm tối đa <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={editingTier.diemToiDa}
                  onChange={(e) => setEditingTier({...editingTier, diemToiDa: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỷ lệ hoàn điểm (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editingTier.tiLeHoan}
                  onChange={(e) => setEditingTier({...editingTier, tiLeHoan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ giảm giá (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingTier.tiLeGiam}
                  onChange={(e) => setEditingTier({...editingTier, tiLeGiam: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn mua hàng (VND)</label>
                <input
                  type="number"
                  value={editingTier.gioiHanMuaHang}
                  onChange={(e) => setEditingTier({...editingTier, gioiHanMuaHang: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                <select
                  value={editingTier.mauSac}
                  onChange={(e) => setEditingTier({...editingTier, mauSac: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {colors.map(color => (
                    <option key={color} value={color}>
                      {color.replace('bg-', '').replace('-', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biểu tượng</label>
                <select
                  value={editingTier.bieuTuong}
                  onChange={(e) => setEditingTier({...editingTier, bieuTuong: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {icons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={editingTier.moTa}
                  onChange={(e) => setEditingTier({...editingTier, moTa: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ưu đãi</label>
                {editingTier.uu_dai.map((benefit, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateBenefit(editingTier.uu_dai, (benefits) => setEditingTier({...editingTier, uu_dai: benefits}), index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeBenefit(editingTier.uu_dai, (benefits) => setEditingTier({...editingTier, uu_dai: benefits}), index)}
                      className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <IoTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addBenefit(editingTier.uu_dai, (benefits) => setEditingTier({...editingTier, uu_dai: benefits}))}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                >
                  + Thêm ưu đãi
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleEditTier}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Cập nhật
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Tier Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Chi tiết hạng thành viên">
        {selectedTier && (
          <div className="space-y-4">
            <div className={`${selectedTier.mauSac} p-4 rounded-lg text-white`}>
              <div className="flex items-center">
                <span className="text-3xl mr-3">{selectedTier.bieuTuong}</span>
                <div>
                  <h3 className="text-xl font-bold">{selectedTier.tenHang}</h3>
                  <p className="opacity-90">{selectedTier.maHang}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Điểm yêu cầu</label>
                <p className="text-sm text-gray-900">{selectedTier.diemToiThieu.toLocaleString()} - {selectedTier.diemToiDa.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số thành viên</label>
                <p className="text-sm text-gray-900">{selectedTier.soThanhVien.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ hoàn điểm</label>
                <p className="text-sm text-green-600 font-semibold">{selectedTier.tiLeHoan}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ giảm giá</label>
                <p className="text-sm text-blue-600 font-semibold">{selectedTier.tiLeGiam}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn mua hàng</label>
                <p className="text-sm text-gray-900">{formatCurrency(selectedTier.gioiHanMuaHang)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTier.trangThai)}`}>
                  {getStatusText(selectedTier.trangThai)}
                </span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <p className="text-sm text-gray-900">{selectedTier.moTa}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ưu đãi</label>
                <ul className="text-sm text-gray-900 space-y-1">
                  {selectedTier.uu_dai.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                <p className="text-sm text-gray-900">{selectedTier.ngayTao}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người tạo</label>
                <p className="text-sm text-gray-900">{selectedTier.nguoiTao}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Xác nhận xóa">
        <div className="space-y-4">
          <p className="text-gray-700">Bạn có chắc chắn muốn xóa hạng thành viên này không? Hành động này không thể hoàn tác.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteTier}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MembershipTierManagement;


