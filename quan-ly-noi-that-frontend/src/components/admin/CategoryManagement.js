import React, { useState, useEffect } from 'react';
import { IoAdd, IoSearch, IoCreate, IoTrash, IoSave, IoClose, IoGrid, IoHome, IoLeaf } from 'react-icons/io5';
import { FaChair, FaCouch, FaBed, FaTable, FaBookOpen } from 'react-icons/fa';
import Modal from '../shared/Modal';
import ConfirmDialog from '../shared/ConfirmDialog';
import Toast from '../shared/Toast';
import api from '../../api';

const CategoryManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map category data from API
  const mapCategoryFromApi = (category) => ({
    maDanhMuc: category.maDanhMuc || category.id,
    tenDanhMuc: category.tenDanhMuc || category.name,
    soLuongSanPham: category.soLuongSanPham || category.productCount || 0,
    icon: category.icon || 'folder',
    moTa: category.moTa || category.description || '',
    trangThai: category.trangThai || category.active || true
  });

  const mapCategoryToApi = (category) => ({
    tenDanhMuc: category.tenDanhMuc,
    moTa: category.moTa,
    icon: category.icon,
    trangThai: category.trangThai
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/danhmuc');
        if (Array.isArray(data)) {
          setCategories(data.map(mapCategoryFromApi));
        }
      } catch (err) {
        console.error('Fetch categories error', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const [categories, setCategories] = useState([
    { maDanhMuc: 1, tenDanhMuc: 'Ghế', soLuongSanPham: 25, icon: 'chair' },
    { maDanhMuc: 2, tenDanhMuc: 'Bàn', soLuongSanPham: 18, icon: 'table' },
    { maDanhMuc: 3, tenDanhMuc: 'Sofa', soLuongSanPham: 12, icon: 'sofa' },
    { maDanhMuc: 4, tenDanhMuc: 'Giường', soLuongSanPham: 15, icon: 'bed' },
    { maDanhMuc: 5, tenDanhMuc: 'Tủ', soLuongSanPham: 22, icon: 'cabinet' },
    { maDanhMuc: 6, tenDanhMuc: 'Kệ sách', soLuongSanPham: 8, icon: 'bookshelf' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [formData, setFormData] = useState({
    tenDanhMuc: '',
    icon: 'grid'
  });

  const iconOptions = [
    { value: 'grid', label: 'Lưới', component: IoGrid },
    { value: 'chair', label: 'Ghế', component: FaChair },
    { value: 'table', label: 'Bàn', component: FaTable },
    { value: 'sofa', label: 'Sofa', component: FaCouch },
    { value: 'bed', label: 'Giường', component: FaBed },
    { value: 'cabinet', label: 'Tủ', component: IoHome },
    { value: 'bookshelf', label: 'Kệ sách', component: FaBookOpen },
    { value: 'plant', label: 'Cây cảnh', component: IoLeaf }
  ];

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.tenDanhMuc.trim()) {
      showToast('Vui lòng nhập tên danh mục', 'error');
      return;
    }

    // Check if category name already exists
    const exists = categories.some(category => 
      category.tenDanhMuc.toLowerCase() === formData.tenDanhMuc.toLowerCase() &&
      category.maDanhMuc !== editingCategory?.maDanhMuc
    );

    if (exists) {
      showToast('Tên danh mục đã tồn tại', 'error');
      return;
    }

    if (editingCategory) {
      // Update existing category
      setCategories(categories.map(category =>
        category.maDanhMuc === editingCategory.maDanhMuc
          ? { 
              ...category, 
              tenDanhMuc: formData.tenDanhMuc,
              icon: formData.icon
            }
          : category
      ));
      showToast('Cập nhật danh mục thành công');
    } else {
      // Add new category
      const newCategory = {
        maDanhMuc: Math.max(...categories.map(c => c.maDanhMuc), 0) + 1,
        tenDanhMuc: formData.tenDanhMuc,
        icon: formData.icon,
        soLuongSanPham: 0
      };
      setCategories([...categories, newCategory]);
      showToast('Thêm danh mục thành công');
    }

    closeModal();
  };

  const openModal = (category = null) => {
    setEditingCategory(category);
    setFormData({
      tenDanhMuc: category ? category.tenDanhMuc : '',
      icon: category ? category.icon : 'grid'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ tenDanhMuc: '', icon: 'grid' });
  };

  const handleDelete = (id) => {
    const category = categories.find(c => c.maDanhMuc === id);
    if (category && category.soLuongSanPham > 0) {
      showToast('Không thể xóa danh mục có sản phẩm. Vui lòng di chuyển sản phẩm trước khi xóa.', 'error');
      return;
    }
    setDeleteId(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    setCategories(categories.filter(category => category.maDanhMuc !== deleteId));
    setShowConfirmDialog(false);
    setDeleteId(null);
    showToast('Xóa danh mục thành công');
  };

  const getCategoryIcon = (iconName, className = "text-2xl") => {
    const icon = iconOptions.find(opt => opt.value === iconName);
    if (!icon) return <IoGrid className={className} />;
    const IconComponent = icon.component;
    return <IconComponent className={className} />;
  };

  const getCategoryColor = (index) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white', 
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
      'bg-indigo-500 text-white',
      'bg-yellow-500 text-white',
      'bg-red-500 text-white',
      'bg-cyan-500 text-white'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h1>
              <p className="text-gray-600 mt-1">Phân loại sản phẩm theo các danh mục để dễ quản lý và tìm kiếm</p>
            </div>
            
            <button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <IoAdd className="text-lg" />
              Thêm danh mục
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <IoSearch className="text-4xl text-gray-400 mb-4 mx-auto" />
            <p className="text-gray-500">Không tìm thấy danh mục nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category, index) => (
              <div key={category.maDanhMuc} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Category Header */}
                <div className={`p-6 ${getCategoryColor(index)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(category.icon)}
                      <div>
                        <h3 className="font-semibold text-lg">{category.tenDanhMuc}</h3>
                        <p className="text-white/80 text-sm">#{category.maDanhMuc}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{category.soLuongSanPham}</div>
                      <div className="text-sm text-gray-500">Sản phẩm</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      category.soLuongSanPham === 0 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {category.soLuongSanPham === 0 ? 'Trống' : 'Có sản phẩm'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(category)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <IoCreate className="text-sm" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(category.maDanhMuc)}
                      className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center ${
                        category.soLuongSanPham > 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-50 hover:bg-red-100 text-red-600'
                      }`}
                      disabled={category.soLuongSanPham > 0}
                      title={category.soLuongSanPham > 0 ? 'Không thể xóa danh mục có sản phẩm' : 'Xóa danh mục'}
                    >
                      <IoTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê tổng quan</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-blue-600">Tổng danh mục</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {categories.reduce((total, category) => total + category.soLuongSanPham, 0)}
              </div>
              <div className="text-sm text-green-600">Tổng sản phẩm</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {categories.filter(c => c.soLuongSanPham > 0).length}
              </div>
              <div className="text-sm text-purple-600">Danh mục có sản phẩm</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {categories.filter(c => c.soLuongSanPham === 0).length}
              </div>
              <div className="text-sm text-yellow-600">Danh mục trống</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tenDanhMuc" className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục *
            </label>
            <input
              type="text"
              id="tenDanhMuc"
              value={formData.tenDanhMuc}
              onChange={(e) => setFormData({ ...formData, tenDanhMuc: e.target.value })}
              placeholder="Ví dụ: Ghế, Bàn, Sofa..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
              Biểu tượng
            </label>
            <div className="grid grid-cols-4 gap-3">
              {iconOptions.map((option) => {
                const IconComponent = option.component;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: option.value })}
                    className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1 ${
                      formData.icon === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <IconComponent className="text-lg" />
                    <span className="text-xs">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <IoClose />
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <IoSave />
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default CategoryManagement;
