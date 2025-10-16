import React, { useState, useEffect, useCallback } from 'react';
import { IoAdd } from 'react-icons/io5';
import api from '../../../api';
import DataTable from '../../shared/DataTable';
import Modal from '../../shared/Modal';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [categoryForm, setCategoryForm] = useState({
    tenDanhMuc: '',
    moTa: '',
    maDanhMucCha: ''
  });

  // Map API category object -> UI shape
  const mapCategoryFromApi = (c) => ({
    id: c.maDanhMuc || c.id,
    tenDanhMuc: c.tenDanhMuc || '',
    moTa: c.moTa || '',
    maDanhMucCha: c.maDanhMucCha || null,
    tenDanhMucCha: c.tenDanhMucCha || '',
    trangThai: c.trangThai !== false,
    ngayTao: c.ngayTao || '',
    ngayCapNhat: c.ngayCapNhat || ''
  });

  // Map UI shape -> API payload
  const mapCategoryToApi = (c) => ({
    tenDanhMuc: c.tenDanhMuc,
    moTa: c.moTa,
    maDanhMucCha: c.maDanhMucCha ? parseInt(c.maDanhMucCha) : null
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/categories');
      if (Array.isArray(data)) {
        setCategories(data.map(mapCategoryFromApi));
      } else if (data && data.content) {
        setCategories(data.content.map(mapCategoryFromApi));
      } else {
        setCategories([]);
      }
    } catch (err) {
      setError(err);
      console.error('Fetch categories error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async () => {
    try {
      const payload = mapCategoryToApi(categoryForm);
      const created = await api.post('/api/categories', { body: payload });
      const createdMapped = mapCategoryFromApi(created);
      setCategories(prev => [...prev, createdMapped]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Add category error', err);
      setError(err);
    }
  };

  const handleEditCategory = async () => {
    try {
      const payload = mapCategoryToApi(categoryForm);
      await api.put(`/api/categories/${selectedCategory.id}`, { body: payload });
      setCategories(prev => prev.map(c => c.id === selectedCategory.id ? { ...c, ...categoryForm } : c));
      setShowEditModal(false);
      setSelectedCategory(null);
      resetForm();
    } catch (err) {
      console.error('Edit category error', err);
      setError(err);
    }
  };

  const handleDeleteCategory = (id) => {
    const category = categories.find(c => c.id === id);
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await api.del(`/api/categories/${categoryToDelete.id}`);
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Delete category error', err);
      setError(err);
    }
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setCategoryForm({
      tenDanhMuc: category.tenDanhMuc,
      moTa: category.moTa,
      maDanhMucCha: category.maDanhMucCha
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setCategoryForm({
      tenDanhMuc: '',
      moTa: '',
      maDanhMucCha: ''
    });
  };

  const filteredCategories = categories.filter(category =>
    category.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.tenDanhMucCha.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'tenDanhMuc', label: 'Tên danh mục', sortable: true },
    { key: 'tenDanhMucCha', label: 'Danh mục cha', sortable: true, render: (value) => value || 'Danh mục gốc' },
    { key: 'trangThai', label: 'Trạng thái', sortable: true, render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {value ? 'Hoạt động' : 'Ngừng'}
      </span>
    )}
  ];

  // Get available parent categories (exclude current category and its children)
  const getAvailableParents = (excludeId = null) => {
    return categories.filter(cat => {
      if (excludeId && cat.id === excludeId) return false;
      // In a real implementation, you'd check for circular references
      // For now, just exclude self
      return true;
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <IoAdd className="w-5 h-5" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      <DataTable
        data={filteredCategories}
        columns={columns}
        onEdit={handleEditClick}
        onDelete={handleDeleteCategory}
        searchable={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoading={isLoading}
      />

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Thêm danh mục mới"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên danh mục *</label>
            <input
              type="text"
              value={categoryForm.tenDanhMuc}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, tenDanhMuc: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={categoryForm.moTa}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, moTa: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Danh mục cha</label>
            <select
              value={categoryForm.maDanhMucCha}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, maDanhMucCha: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Danh mục gốc</option>
              {getAvailableParents().map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.tenDanhMuc}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleAddCategory}
              disabled={!categoryForm.tenDanhMuc}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Thêm danh mục
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedCategory(null); resetForm(); }}
        title="Chỉnh sửa danh mục"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên danh mục *</label>
            <input
              type="text"
              value={categoryForm.tenDanhMuc}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, tenDanhMuc: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={categoryForm.moTa}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, moTa: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Danh mục cha</label>
            <select
              value={categoryForm.maDanhMucCha}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, maDanhMucCha: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Danh mục gốc</option>
              {getAvailableParents(selectedCategory?.id).map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.tenDanhMuc}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => { setShowEditModal(false); setSelectedCategory(null); resetForm(); }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleEditCategory}
              disabled={!categoryForm.tenDanhMuc}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setCategoryToDelete(null); }}
        title="Xác nhận xóa"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc muốn xóa danh mục "{categoryToDelete?.tenDanhMuc}"?
          </p>
          <p className="text-sm text-gray-500">
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => { setShowDeleteConfirm(false); setCategoryToDelete(null); }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={confirmDeleteCategory}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryManagement;