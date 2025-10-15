import React, { useState, useEffect } from 'react';
import { 
  IoAdd, 
  IoTrashOutline, 
  IoPencilOutline, 
  IoSearch, 
  IoFilterOutline, 
  IoCalendarOutline,
  IoTimeOutline,
  IoCloseCircle,
  IoGiftOutline,
  IoStatsChartOutline,
  IoEyeOutline,
  IoCopyOutline,
  IoPlayOutline,
  IoPauseOutline,
  IoStopOutline
} from 'react-icons/io5';
import Modal from '../../shared/Modal';
import ConfirmDialog from '../../shared/ConfirmDialog';
import Toast from '../../shared/Toast';
import api from '../../../api';

const DiscountManagement = () => {
  const [discountPrograms, setDiscountPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map discount program from API
  const mapDiscountFromApi = (discount) => ({
    maChuongTrinh: discount.maChuongTrinh || discount.id,
    tenChuongTrinh: discount.tenChuongTrinh || discount.name,
    moTa: discount.moTa || discount.description,
    loaiGiamGia: discount.loaiGiamGia || discount.discountType,
    giaTriGiam: discount.giaTriGiam || discount.discountValue,
    giaTriGiamToiDa: discount.giaTriGiamToiDa || discount.maxDiscountValue,
    ngayBatDau: discount.ngayBatDau || discount.startDate,
    ngayKetThuc: discount.ngayKetThuc || discount.endDate,
    trangThai: discount.trangThai || discount.status,
    soLuongSanPhamApDung: discount.soLuongSanPhamApDung || discount.appliedProductCount || 0,
    tongTienGiam: discount.tongTienGiam || discount.totalDiscountAmount || 0,
    dieuKienApDung: discount.dieuKienApDung || discount.conditions || []
  });

  const mapDiscountToApi = (discount) => ({
    tenChuongTrinh: discount.tenChuongTrinh,
    moTa: discount.moTa,
    loaiGiamGia: discount.loaiGiamGia,
    giaTriGiam: discount.giaTriGiam,
    giaTriGiamToiDa: discount.giaTriGiamToiDa,
    ngayBatDau: discount.ngayBatDau,
    ngayKetThuc: discount.ngayKetThuc,
    trangThai: discount.trangThai,
    dieuKienApDung: discount.dieuKienApDung
  });

  // Fetch discount programs
  useEffect(() => {
    const fetchDiscountPrograms = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/v1/chuong-trinh-giam-gia');
        if (Array.isArray(data)) {
          setDiscountPrograms(data.map(mapDiscountFromApi));
          setFilteredPrograms(data.map(mapDiscountFromApi));
        }
      } catch (err) {
        console.error('Fetch discount programs error', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiscountPrograms();
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [deletingProgram, setDeletingProgram] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formData, setFormData] = useState({
    tenChuongTrinh: '',
    ngayBatDau: '',
    ngayKetThuc: ''
  });
  const [variantDiscounts, setVariantDiscounts] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Mock data initialization
  useEffect(() => {
    const mockVariants = [
      { id: 1, maBienThe: 'BT001', tenSanPham: 'Ghế Sofa Nordic', thuocTinh: 'Màu đỏ - Chất liệu vải', giaGoc: 5000000 },
      { id: 2, maBienThe: 'BT002', tenSanPham: 'Bàn Ăn Gỗ Sồi', thuocTinh: 'Kích thước 1.6m - Màu nâu', giaGoc: 8000000 },
      { id: 3, maBienThe: 'BT003', tenSanPham: 'Tủ Quần Áo', thuocTinh: 'Màu trắng - 4 cánh', giaGoc: 12000000 },
      { id: 4, maBienThe: 'BT004', tenSanPham: 'Ghế Làm Việc', thuocTinh: 'Màu đen - Có bánh xe', giaGoc: 3500000 },
      { id: 5, maBienThe: 'BT005', tenSanPham: 'Bàn Làm Việc', thuocTinh: 'Gỗ tự nhiên - 120x60cm', giaGoc: 4500000 },
      { id: 6, maBienThe: 'BT006', tenSanPham: 'Giường Ngủ', thuocTinh: 'Kích thước 1.8m - Màu walnut', giaGoc: 15000000 }
    ];

    const mockPrograms = [
      {
        id: 1,
        maChuongTrinhGiamGia: 1,
        tenChuongTrinh: 'Black Friday 2024',
        ngayBatDau: '2024-11-20T00:00',
        ngayKetThuc: '2024-11-30T23:59',
        status: 'upcoming',
        bienTheGiamGias: [
          { maBienThe: 1, giaSauGiam: 4000000, bienTheSanPham: mockVariants[0] },
          { maBienThe: 2, giaSauGiam: 7200000, bienTheSanPham: mockVariants[1] }
        ]
      },
      {
        id: 2,
        maChuongTrinhGiamGia: 2,
        tenChuongTrinh: 'Khuyến mãi cuối năm',
        ngayBatDau: '2024-12-01T00:00',
        ngayKetThuc: '2024-12-31T23:59',
        status: 'upcoming',
        bienTheGiamGias: [
          { maBienThe: 3, giaSauGiam: 10800000, bienTheSanPham: mockVariants[2] },
          { maBienThe: 4, giaSauGiam: 3150000, bienTheSanPham: mockVariants[3] }
        ]
      },
      {
        id: 3,
        maChuongTrinhGiamGia: 3,
        tenChuongTrinh: 'Flash Sale Tuần',
        ngayBatDau: '2024-10-07T00:00',
        ngayKetThuc: '2024-10-13T23:59',
        status: 'active',
        bienTheGiamGias: [
          { maBienThe: 5, giaSauGiam: 3600000, bienTheSanPham: mockVariants[4] }
        ]
      },
      {
        id: 4,
        maChuongTrinhGiamGia: 4,
        tenChuongTrinh: 'Khai trương chi nhánh mới',
        ngayBatDau: '2024-09-01T00:00',
        ngayKetThuc: '2024-09-30T23:59',
        status: 'expired',
        bienTheGiamGias: [
          { maBienThe: 6, giaSauGiam: 13500000, bienTheSanPham: mockVariants[5] }
        ]
      }
    ];

    setProductVariants(mockVariants);
    setDiscountPrograms(mockPrograms);
    setFilteredPrograms(mockPrograms);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = discountPrograms;

    if (filters.searchTerm) {
      filtered = filtered.filter(program =>
        program.tenChuongTrinh.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(program => program.status === filters.status);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'this-week':
          const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(program => 
            new Date(program.ngayBatDau) >= thisWeek
          );
          break;
        case 'this-month':
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = filtered.filter(program => 
            new Date(program.ngayBatDau) >= thisMonth
          );
          break;
        case 'next-month':
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          const monthAfter = new Date(now.getFullYear(), now.getMonth() + 2, 1);
          filtered = filtered.filter(program => 
            new Date(program.ngayBatDau) >= nextMonth && 
            new Date(program.ngayBatDau) < monthAfter
          );
          break;
        default:
          break;
      }
    }

    setFilteredPrograms(filtered);
  }, [discountPrograms, filters]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const formatDateTime = (dateString) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang chạy';
      case 'upcoming': return 'Sắp diễn ra';
      case 'expired': return 'Đã kết thúc';
      case 'paused': return 'Tạm dừng';
      default: return 'Không xác định';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <IoPlayOutline className="text-green-600" />;
      case 'upcoming': return <IoTimeOutline className="text-blue-600" />;
      case 'expired': return <IoStopOutline className="text-gray-600" />;
      case 'paused': return <IoPauseOutline className="text-yellow-600" />;
      default: return <IoCloseCircle className="text-gray-600" />;
    }
  };

  const calculateTotalDiscount = (program) => {
    return program.bienTheGiamGias?.reduce((total, item) => {
      const originalPrice = item.bienTheSanPham?.giaGoc || 0;
      const discountedPrice = item.giaSauGiam || 0;
      return total + (originalPrice - discountedPrice);
    }, 0) || 0;
  };

  const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  const resetForm = () => {
    setFormData({
      tenChuongTrinh: '',
      ngayBatDau: '',
      ngayKetThuc: ''
    });
    setVariantDiscounts([]);
    setEditingProgram(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (program) => {
    setFormData({
      tenChuongTrinh: program.tenChuongTrinh,
      ngayBatDau: program.ngayBatDau,
      ngayKetThuc: program.ngayKetThuc
    });
    setVariantDiscounts(program.bienTheGiamGias || []);
    setEditingProgram(program);
    setShowModal(true);
  };

  const handleDelete = (program) => {
    setDeletingProgram(program);
    setShowConfirmDialog(true);
  };

  const handleViewDetails = (program) => {
    setSelectedProgram(program);
    setShowVariantModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.tenChuongTrinh.trim()) {
      showToast('Vui lòng nhập tên chương trình', 'error');
      return;
    }

    if (!formData.ngayBatDau || !formData.ngayKetThuc) {
      showToast('Vui lòng chọn ngày bắt đầu và kết thúc', 'error');
      return;
    }

    if (new Date(formData.ngayBatDau) >= new Date(formData.ngayKetThuc)) {
      showToast('Ngày bắt đầu phải trước ngày kết thúc', 'error');
      return;
    }

    if (variantDiscounts.length === 0) {
      showToast('Vui lòng thêm ít nhất một sản phẩm vào chương trình', 'error');
      return;
    }

    // Check for duplicate program name
    const isDuplicate = discountPrograms.some(program => 
      program.tenChuongTrinh.toLowerCase() === formData.tenChuongTrinh.toLowerCase() &&
      (!editingProgram || program.id !== editingProgram.id)
    );

    if (isDuplicate) {
      showToast('Tên chương trình đã tồn tại', 'error');
      return;
    }

    // Determine status based on dates
    const now = new Date();
    const startDate = new Date(formData.ngayBatDau);
    const endDate = new Date(formData.ngayKetThuc);
    let status = 'upcoming';
    
    if (now >= startDate && now <= endDate) {
      status = 'active';
    } else if (now > endDate) {
      status = 'expired';
    }

    const programData = {
      id: editingProgram ? editingProgram.id : Date.now(),
      maChuongTrinhGiamGia: editingProgram ? editingProgram.maChuongTrinhGiamGia : Date.now(),
      tenChuongTrinh: formData.tenChuongTrinh.trim(),
      ngayBatDau: formData.ngayBatDau,
      ngayKetThuc: formData.ngayKetThuc,
      status: status,
      bienTheGiamGias: variantDiscounts
    };

    if (editingProgram) {
      setDiscountPrograms(discountPrograms.map(program => 
        program.id === editingProgram.id ? programData : program
      ));
      showToast('Cập nhật chương trình giảm giá thành công');
    } else {
      setDiscountPrograms([...discountPrograms, programData]);
      showToast('Thêm chương trình giảm giá thành công');
    }

    setShowModal(false);
    resetForm();
  };

  const confirmDelete = () => {
    setDiscountPrograms(discountPrograms.filter(program => program.id !== deletingProgram.id));
    setShowConfirmDialog(false);
    setDeletingProgram(null);
    showToast('Xóa chương trình giảm giá thành công');
  };

  const addVariantDiscount = (variant, discountedPrice) => {
    const existingIndex = variantDiscounts.findIndex(item => item.maBienThe === variant.id);
    
    if (existingIndex >= 0) {
      const updated = [...variantDiscounts];
      updated[existingIndex] = {
        maBienThe: variant.id,
        giaSauGiam: discountedPrice,
        bienTheSanPham: variant
      };
      setVariantDiscounts(updated);
    } else {
      setVariantDiscounts([...variantDiscounts, {
        maBienThe: variant.id,
        giaSauGiam: discountedPrice,
        bienTheSanPham: variant
      }]);
    }
  };

  const removeVariantDiscount = (variantId) => {
    setVariantDiscounts(variantDiscounts.filter(item => item.maBienThe !== variantId));
  };

  const duplicateProgram = (program) => {
    const newProgram = {
      ...program,
      id: Date.now(),
      maChuongTrinhGiamGia: Date.now(),
      tenChuongTrinh: `${program.tenChuongTrinh} (Bản sao)`,
      status: 'upcoming'
    };
    
    setDiscountPrograms([...discountPrograms, newProgram]);
    showToast('Sao chép chương trình thành công');
  };

  const getStats = () => {
    const total = discountPrograms.length;
    const active = discountPrograms.filter(p => p.status === 'active').length;
    const upcoming = discountPrograms.filter(p => p.status === 'upcoming').length;
    const expired = discountPrograms.filter(p => p.status === 'expired').length;
    
    return { total, active, upcoming, expired };
  };

  const stats = getStats();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Chương trình Giảm giá</h1>
        <p className="text-gray-600">Tạo và quản lý các chương trình khuyến mãi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Tổng chương trình</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <IoStatsChartOutline className="text-4xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Đang hoạt động</p>
              <p className="text-3xl font-bold">{stats.active}</p>
            </div>
            <IoPlayOutline className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Sắp diễn ra</p>
              <p className="text-3xl font-bold">{stats.upcoming}</p>
            </div>
            <IoTimeOutline className="text-4xl text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100">Đã kết thúc</p>
              <p className="text-3xl font-bold">{stats.expired}</p>
            </div>
            <IoStopOutline className="text-4xl text-gray-200" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm chương trình..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <IoFilterOutline />
              Bộ lọc
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <IoAdd />
            Thêm chương trình
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="expired">Đã kết thúc</option>
                  <option value="paused">Tạm dừng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="this-week">Tuần này</option>
                  <option value="this-month">Tháng này</option>
                  <option value="next-month">Tháng tới</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <div key={program.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Program Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
                  {program.tenChuongTrinh}
                </h3>
                <div className="flex items-center gap-1">
                  {getStatusIcon(program.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                    {getStatusText(program.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <IoCalendarOutline className="text-gray-400" />
                  <span>Bắt đầu: {formatDateTime(program.ngayBatDau)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoTimeOutline className="text-gray-400" />
                  <span>Kết thúc: {formatDateTime(program.ngayKetThuc)}</span>
                </div>
              </div>
            </div>

            {/* Program Stats */}
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {program.bienTheGiamGias?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600">Sản phẩm</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculateTotalDiscount(program))}
                  </div>
                  <div className="text-xs text-gray-600">Tổng giảm</div>
                </div>
              </div>
            </div>

            {/* Product Preview */}
            {program.bienTheGiamGias && program.bienTheGiamGias.length > 0 && (
              <div className="p-4">
                <div className="text-sm font-medium text-gray-700 mb-3">Sản phẩm khuyến mãi:</div>
                <div className="space-y-2">
                  {program.bienTheGiamGias.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex-1 truncate">
                        <div className="font-medium text-gray-900 truncate">
                          {item.bienTheSanPham?.tenSanPham}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {item.bienTheSanPham?.thuocTinh}
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="font-bold text-red-600">
                          {formatCurrency(item.giaSauGiam)}
                        </div>
                        <div className="text-xs text-gray-500 line-through">
                          {formatCurrency(item.bienTheSanPham?.giaGoc)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {program.bienTheGiamGias.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{program.bienTheGiamGias.length - 2} sản phẩm khác
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleViewDetails(program)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <IoEyeOutline />
                  Xem chi tiết
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => duplicateProgram(program)}
                    className="text-gray-600 hover:text-gray-800 p-1 rounded"
                    title="Sao chép"
                  >
                    <IoCopyOutline />
                  </button>
                  <button
                    onClick={() => handleEdit(program)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded"
                    title="Chỉnh sửa"
                  >
                    <IoPencilOutline />
                  </button>
                  <button
                    onClick={() => handleDelete(program)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    title="Xóa"
                  >
                    <IoTrashOutline />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <IoGiftOutline className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có chương trình giảm giá</h3>
          <p className="text-gray-500 mb-4">
            {filters.searchTerm || filters.status !== 'all' || filters.dateRange !== 'all'
              ? 'Không tìm thấy chương trình nào phù hợp với bộ lọc'
              : 'Chưa có chương trình giảm giá nào được tạo'}
          </p>
          {!filters.searchTerm && filters.status === 'all' && filters.dateRange === 'all' && (
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Tạo chương trình đầu tiên
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingProgram ? 'Chỉnh sửa chương trình giảm giá' : 'Thêm chương trình giảm giá'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên chương trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tenChuongTrinh}
                  onChange={(e) => setFormData({...formData, tenChuongTrinh: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên chương trình"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.ngayBatDau}
                    onChange={(e) => setFormData({...formData, ngayBatDau: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.ngayKetThuc}
                    onChange={(e) => setFormData({...formData, ngayKetThuc: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-900">Sản phẩm áp dụng</h4>
              <span className="text-sm text-gray-600">
                {variantDiscounts.length} sản phẩm được chọn
              </span>
            </div>

            {/* Selected Products */}
            {variantDiscounts.length > 0 && (
              <div className="mb-4 space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                {variantDiscounts.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.bienTheSanPham?.tenSanPham}</div>
                      <div className="text-xs text-gray-600">{item.bienTheSanPham?.thuocTinh}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        <span className="line-through text-gray-500">
                          {formatCurrency(item.bienTheSanPham?.giaGoc)}
                        </span>
                        <span className="ml-2 font-bold text-red-600">
                          {formatCurrency(item.giaSauGiam)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariantDiscount(item.maBienThe)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <IoTrashOutline />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Products */}
            <div className="space-y-3">
              {productVariants.map((variant) => {
                const isSelected = variantDiscounts.some(item => item.maBienThe === variant.id);
                const selectedItem = variantDiscounts.find(item => item.maBienThe === variant.id);
                
                return (
                  <div key={variant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium">{variant.tenSanPham}</div>
                      <div className="text-sm text-gray-600">{variant.thuocTinh}</div>
                      <div className="text-sm text-gray-900">Giá gốc: {formatCurrency(variant.giaGoc)}</div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={variant.giaGoc}
                            step="1000"
                            value={selectedItem?.giaSauGiam || ''}
                            onChange={(e) => addVariantDiscount(variant, parseFloat(e.target.value) || 0)}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Giá sau giảm"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantDiscount(variant.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <IoTrashOutline />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addVariantDiscount(variant, variant.giaGoc * 0.9)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          <IoAdd />
                          Thêm
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingProgram ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        title={`Chi tiết: ${selectedProgram?.tenChuongTrinh}`}
        size="large"
      >
        {selectedProgram && (
          <div className="space-y-6">
            {/* Program Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Trạng thái</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedProgram.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProgram.status)}`}>
                      {getStatusText(selectedProgram.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Thời gian</div>
                  <div className="mt-1">
                    <div className="text-sm">{formatDateTime(selectedProgram.ngayBatDau)}</div>
                    <div className="text-sm text-gray-500">đến {formatDateTime(selectedProgram.ngayKetThuc)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Sản phẩm áp dụng ({selectedProgram.bienTheGiamGias?.length || 0})
              </h4>
              <div className="space-y-3">
                {selectedProgram.bienTheGiamGias?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.bienTheSanPham?.tenSanPham}</div>
                      <div className="text-sm text-gray-600">{item.bienTheSanPham?.thuocTinh}</div>
                      <div className="text-sm text-gray-500">{item.bienTheSanPham?.maBienThe}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(item.bienTheSanPham?.giaGoc)}
                        </span>
                        <span className="font-bold text-red-600">
                          {formatCurrency(item.giaSauGiam)}
                        </span>
                      </div>
                      <div className="text-sm text-green-600">
                        -{calculateDiscountPercentage(item.bienTheSanPham?.giaGoc, item.giaSauGiam)}%
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có sản phẩm nào được thêm vào chương trình
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {selectedProgram.bienTheGiamGias && selectedProgram.bienTheGiamGias.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900">Tổng tiết kiệm</div>
                    <div className="text-sm text-blue-700">
                      Từ {selectedProgram.bienTheGiamGias.length} sản phẩm
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculateTotalDiscount(selectedProgram))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDelete}
        title="Xóa chương trình giảm giá"
        message={`Bạn có chắc chắn muốn xóa chương trình "${deletingProgram?.tenChuongTrinh}"? Hành động này không thể hoàn tác.`}
      />

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: '' })}
      />
    </div>
  );
};

export default DiscountManagement;
