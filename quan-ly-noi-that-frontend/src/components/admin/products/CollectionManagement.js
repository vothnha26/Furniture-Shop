import React, { useState, useEffect, useCallback } from 'react';
import { IoAdd, IoSearch, IoCreate, IoTrash, IoSave, IoClose, IoLayers, IoText } from 'react-icons/io5';
import Modal from '../../shared/Modal';
import ConfirmDialog from '../../shared/ConfirmDialog';
import Toast from '../../shared/Toast';
import api from '../../../api';

const CollectionManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map collection data from API
  const mapCollectionFromApi = (collection) => ({
    maBoSuuTap: collection.maBoSuuTap || collection.id,
    tenBoSuuTap: collection.tenBoSuuTap || collection.name,
    moTa: collection.moTa || collection.description || '',
    soLuongSanPham: collection.soLuongSanPham || collection.productCount || 0,
    ngayTao: collection.ngayTao || collection.createdAt || '',
    trangThai: collection.trangThai || collection.active || true
  });

  const mapCollectionToApi = (collection) => ({
    tenBoSuuTap: collection.tenBoSuuTap,
    moTa: collection.moTa,
    trangThai: collection.trangThai
  });

  // Fetch collections (exposed so handlers can refresh after edit/delete)
  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      // Backend controller exposes /api/collections
      const data = await api.get('/api/collections');
      if (Array.isArray(data)) {
        setCollections(data.map(mapCollectionFromApi));
      } else if (data && data.content) {
        setCollections(data.content.map(mapCollectionFromApi));
      }
    } catch (err) {
      console.error('Fetch collections error', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const [collections, setCollections] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [formData, setFormData] = useState({
    tenBoSuuTap: '',
    moTa: ''
  });

  // Filter collections based on search term
  const filteredCollections = collections.filter(collection =>
    collection.tenBoSuuTap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.moTa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.tenBoSuuTap.trim()) {
      showToast('Vui lòng nhập tên bộ sưu tập', 'error');
      return;
    }

    // Check if collection name already exists
    const exists = collections.some(collection => 
      collection.tenBoSuuTap.toLowerCase() === formData.tenBoSuuTap.toLowerCase() &&
      collection.maBoSuuTap !== editingCollection?.maBoSuuTap
    );

    if (exists) {
      showToast('Tên bộ sưu tập đã tồn tại', 'error');
      return;
    }

    // Persist to backend
    (async () => {
      setIsLoading(true);
      try {
        if (editingCollection) {
          await api.put(`/api/collections/${editingCollection.maBoSuuTap}`, { body: mapCollectionToApi(formData) });
          showToast('Cập nhật bộ sưu tập thành công');
        } else {
          await api.post('/api/collections', { body: mapCollectionToApi(formData) });
          showToast('Thêm bộ sưu tập thành công');
        }
        await fetchCollections();
        closeModal();
      } catch (err) {
        console.error('Save collection error', err);
        showToast('Lưu bộ sưu tập thất bại', 'error');
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const openModal = (collection = null) => {
    setEditingCollection(collection);
    setFormData({
      tenBoSuuTap: collection ? collection.tenBoSuuTap : '',
      moTa: collection ? collection.moTa : ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCollection(null);
    setFormData({ tenBoSuuTap: '', moTa: '' });
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    (async () => {
      setIsLoading(true);
      try {
        await api.del(`/api/collections/${deleteId}`);
        showToast('Xóa bộ sưu tập thành công');
        await fetchCollections();
      } catch (err) {
        console.error('Delete collection error', err);
        showToast('Xóa bộ sưu tập thất bại', 'error');
      } finally {
        setIsLoading(false);
        setShowConfirmDialog(false);
        setDeleteId(null);
      }
    })();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getCollectionIcon = (index) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Bộ sưu tập</h1>
              <p className="text-gray-600 mt-1">Nhóm các sản phẩm thành bộ sưu tập theo chủ đề để khách hàng dễ mua sắm</p>
            </div>
            
            <button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <IoAdd className="text-lg" />
              Thêm bộ sưu tập
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
                  placeholder="Tìm kiếm bộ sưu tập..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Collections Grid */}
        {filteredCollections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <IoSearch className="text-4xl text-gray-400 mb-4 mx-auto" />
            <p className="text-gray-500">Không tìm thấy bộ sưu tập nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection, index) => (
              <div key={collection.maBoSuuTap} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Collection Header */}
                <div className={`p-6 ${getCollectionIcon(index)} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IoLayers className="text-2xl" />
                      <div>
                        <h3 className="font-semibold text-lg">{collection.tenBoSuuTap}</h3>
                        <p className="text-white/80 text-sm">#{collection.maBoSuuTap}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 rounded-lg px-3 py-1">
                        <span className="text-sm font-medium">{collection.soLuongSanPham}</span>
                        <div className="text-xs opacity-80">sản phẩm</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collection Content */}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <IoText className="text-gray-400 mt-1 flex-shrink-0" />
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {collection.moTa || 'Chưa có mô tả'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Ngày tạo: {formatDate(collection.ngayTao)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(collection)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <IoCreate className="text-sm" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(collection.maBoSuuTap)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
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
              <div className="text-2xl font-bold text-blue-600">{collections.length}</div>
              <div className="text-sm text-blue-600">Tổng bộ sưu tập</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {collections.reduce((total, collection) => total + collection.soLuongSanPham, 0)}
              </div>
              <div className="text-sm text-green-600">Tổng sản phẩm</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {collections.length > 0 ? Math.round(collections.reduce((total, collection) => total + collection.soLuongSanPham, 0) / collections.length) : 0}
              </div>
              <div className="text-sm text-purple-600">Trung bình/bộ sưu tập</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {collections.filter(c => c.soLuongSanPham === 0).length}
              </div>
              <div className="text-sm text-yellow-600">Bộ sưu tập trống</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingCollection ? 'Chỉnh sửa bộ sưu tập' : 'Thêm bộ sưu tập mới'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tenBoSuuTap" className="block text-sm font-medium text-gray-700 mb-1">
              Tên bộ sưu tập *
            </label>
            <input
              type="text"
              id="tenBoSuuTap"
              value={formData.tenBoSuuTap}
              onChange={(e) => setFormData({ ...formData, tenBoSuuTap: e.target.value })}
              placeholder="Ví dụ: Bộ sưu tập Nordic, Vintage..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="moTa" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              id="moTa"
              value={formData.moTa}
              onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              placeholder="Mô tả về phong cách, đặc điểm của bộ sưu tập..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
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
              {editingCollection ? 'Cập nhật' : 'Thêm mới'}
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
        message="Bạn có chắc chắn muốn xóa bộ sưu tập này? Các sản phẩm trong bộ sưu tập sẽ không bị xóa nhưng sẽ không còn thuộc bộ sưu tập này."
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

export default CollectionManagement;
