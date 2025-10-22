import React, { useState, useEffect, useCallback } from 'react';
import { IoAdd, IoSearch, IoCreate, IoSave, IoClose, IoCube, IoBarcode, IoPricetag, IoLayers, IoPause, IoPlay } from 'react-icons/io5';
import Modal from '../../shared/Modal';
import ConfirmDialog from '../../shared/ConfirmDialog';
import Toast from '../../shared/Toast';
import api from '../../../api';

const ProductVariantManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Attributes for single-variant editing
  const [attributes, setAttributes] = useState([]);
  const [attrLoading, setAttrLoading] = useState(false);
  const [attrError, setAttrError] = useState(null);
  const [editedAttributes, setEditedAttributes] = useState([]); // [{ maThuocTinh, tenThuocTinh, giaTri }]
  const [newAttrId, setNewAttrId] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  // Map variant data from API
  const mapVariantFromApi = (variant) => {
    // Supports BienTheSanPhamDetailResponse from /api/products/{id}/variants
    const maSanPham = variant.maSanPham ?? variant.sanPham?.maSanPham ?? variant.productId;
    const tenSanPham = variant.tenSanPham ?? variant.sanPham?.tenSanPham ?? variant.productName ?? '';
    const attributes = Array.isArray(variant.thuocTinhs)
      ? variant.thuocTinhs.map((a) => ({
          maThuocTinh: a.maThuocTinh ?? a.attributeId ?? null,
          tenThuocTinh: a.tenThuocTinh ?? a.attributeName ?? '',
          giaTri: a.giaTriThuocTinh ?? a.attributeValue ?? '',
        }))
      : Array.isArray(variant.thuocTinhList)
      ? variant.thuocTinhList.map((attr) => ({
          maThuocTinh: attr.thuocTinh?.maThuocTinh || attr.attributeId,
          tenThuocTinh: attr.thuocTinh?.tenThuocTinh || attr.attributeName,
          giaTri: attr.giaTri?.giaTri || attr.attributeValue,
        }))
      : [];
    const trangThaiKho = variant.trangThaiKho || variant.trangThai;
    const trangThaiBool = typeof trangThaiKho === 'string' ? (trangThaiKho === 'ACTIVE') : (trangThaiKho ?? true);

    return {
      maBienThe: variant.maBienThe || variant.id,
      sanPham: { maSanPham, tenSanPham },
      tenBienThe: variant.tenBienThe || variant.name || `${tenSanPham} - ${variant.sku || ''}`,
      sku: variant.sku,
      giaBan: Number(variant.giaBan ?? variant.price ?? 0),
      giaGoc: Number(variant.giaGoc ?? variant.originalPrice ?? variant.giaBan ?? 0),
      soLuongTon: Number(variant.soLuongTon ?? variant.tonKho ?? variant.stock ?? 0),
      trangThai: trangThaiBool,
      attributes,
      hinhAnh: variant.hinhAnh || variant.image || '',
    };
  };

  const mapVariantToApi = useCallback((variant) => ({
    maSanPham: variant.sanPham.maSanPham,
    tenBienThe: variant.tenBienThe,
    sku: variant.sku,
    giaBan: variant.giaBan,
    giaGoc: variant.giaGoc,
    tonKho: variant.soLuongTon,
    trangThai: variant.trangThai,
    hinhAnh: variant.hinhAnh,
    thuocTinhList: (variant.attributes || []).map(attr => ({
      maThuocTinh: attr.attributeId || attr.maThuocTinh || null,
      maGiaTri: attr.valueId || attr.maGiaTri || attr.giaTri || null
    }))
  }), []);

  // Helper: fetch variants by product id (returns mapped list)
  const fetchVariantsByProduct = useCallback(async (productId) => {
    const list = await api.get(`/api/products/${productId}/variants`);
    if (!Array.isArray(list)) return [];
    return list.map(mapVariantFromApi);
  }, []);

  // Helper: merge/replace variants for a given product id
  const replaceProductVariantsInState = useCallback((productId, mappedList) => {
    setVariants((prev) => {
      const others = prev.filter((v) => String(v.sanPham.maSanPham) !== String(productId));
      return [...others, ...mappedList];
    });
  }, []);

  // Fetch products then load variants (aggregated) from backend
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1) Load product list for filter dropdown
        const prods = await api.get('/api/products');
        const mappedProducts = Array.isArray(prods)
          ? prods.map((p) => ({ maSanPham: p.maSanPham ?? p.id, tenSanPham: p.tenSanPham ?? p.name }))
          : [];
        if (!cancelled) setProducts(mappedProducts);

        // 2) Fetch variants per product in parallel
        const allVariants = [];
        for (const p of mappedProducts) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const mapped = await fetchVariantsByProduct(p.maSanPham);
            allVariants.push(...mapped);
          } catch (e) {
            console.warn('Failed to load variants for product', p.maSanPham, e);
          }
        }
        if (!cancelled) setVariants(allVariants);
      } catch (err) {
        console.error('Fetch products/variants error', err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchVariantsByProduct]);

  const [variants, setVariants] = useState([]);

  const [products, setProducts] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [formData, setFormData] = useState({
    maSanPham: '',
    sku: '',
    giaBan: '',
    soLuongTon: ''
  });

  // Filter variants
  const filteredVariants = variants.filter(variant => {
    const matchesSearch = variant.sanPham.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variant.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = selectedProduct === '' || 
                          variant.sanPham.maSanPham.toString() === selectedProduct;
    const matchesStock = stockFilter === '' || 
                        (stockFilter === 'low' && variant.soLuongTon <= 10) ||
                        (stockFilter === 'high' && variant.soLuongTon > 10) ||
                        (stockFilter === 'out' && variant.soLuongTon === 0);
    return matchesSearch && matchesProduct && matchesStock;
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.maSanPham || !formData.sku.trim() || !formData.giaBan || !formData.soLuongTon) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    try {
      // Build ThuocTinhGiaTriTuDoDto list from editedAttributes
      const payloadAttrs = (editedAttributes || [])
        .filter((r) => r && r.maThuocTinh && String(r.giaTri || '').trim().length > 0)
        .map((r) => ({ maThuocTinh: Number(r.maThuocTinh), giaTri: String(r.giaTri) }));

      if (editingVariant) {
        // Update existing variant
        await api.put(`/api/bien-the-san-pham/${editingVariant.maBienThe}/variant`, {
          sku: formData.sku.trim(),
          giaBan: Number(formData.giaBan),
          soLuongTon: Number(formData.soLuongTon),
          thuocTinhGiaTriTuDo: payloadAttrs,
        });
        // Refresh variants for this product
        const pid = Number(formData.maSanPham);
        const mapped = await fetchVariantsByProduct(pid);
        replaceProductVariantsInState(pid, mapped);
        showToast('Cập nhật biến thể sản phẩm thành công');
      } else {
        // Create new variant
        await api.post('/api/bien-the-san-pham/create', {
          maSanPham: Number(formData.maSanPham),
          sku: formData.sku.trim(),
          giaBan: Number(formData.giaBan),
          soLuongTon: Number(formData.soLuongTon),
          thuocTinhGiaTriTuDo: payloadAttrs,
        });
        // Refresh variants for this product
        const pid = Number(formData.maSanPham);
        const mapped = await fetchVariantsByProduct(pid);
        replaceProductVariantsInState(pid, mapped);
        showToast('Thêm biến thể sản phẩm thành công');
      }
      closeModal();
    } catch (err) {
      console.error('Submit variant failed', err);
      const msg = err?.data?.error || err?.message || 'Có lỗi xảy ra';
      showToast(msg, 'error');
    }
  };

  const openModal = (variant = null) => {
    setEditingVariant(variant);
    setFormData({
      maSanPham: variant ? variant.sanPham.maSanPham.toString() : '',
      sku: variant ? variant.sku : '',
      giaBan: variant ? variant.giaBan.toString() : '',
      soLuongTon: variant ? variant.soLuongTon.toString() : ''
    });
    // Prepare attribute edits for single variant
    const preset = variant && Array.isArray(variant.attributes)
      ? variant.attributes.map((a) => ({
          maThuocTinh: a.maThuocTinh,
          tenThuocTinh: a.tenThuocTinh || a.thuocTinh,
          giaTri: a.giaTri || ''
        }))
      : [];
    setEditedAttributes(preset);
    setNewAttrId('');
    setNewAttrValue('');
    fetchAttributes().catch(() => {});
    setShowModal(true);
  };

  // Removed old buildAttributesForDisplay; we now build payload attributes inline in handleSubmit

  // Fetch attributes simple loader
  const fetchAttributes = async () => {
    setAttrLoading(true);
    setAttrError(null);
    try {
      const attrs = await api.get('/api/attributes');
      if (!Array.isArray(attrs)) {
        setAttributes([]);
      } else {
        const loaded = attrs.map(a => ({
          id: a.maThuocTinh || a.id,
          tenThuocTinh: a.tenThuocTinh || a.name || a.label || String(a.maThuocTinh || a.id),
          values: Array.isArray(a.values) ? a.values.map(v => ({ id: v.maGiaTriThuocTinh || v.id, tenGiaTri: v.tenGiaTri || v.name || v.value })) : [],
          raw: a
        }));
        setAttributes(loaded);
      }
    } catch (err) {
      console.warn('fetchAttributes failed', err?.message || err);
      setAttributes([]);
      setAttrError(err?.message || 'Lỗi tải thuộc tính');
    } finally {
      setAttrLoading(false);
    }
  };

  // (selection helpers are implemented inline in the UI)

  const closeModal = () => {
    setShowModal(false);
    setEditingVariant(null);
    setFormData({ maSanPham: '', sku: '', giaBan: '', soLuongTon: '' });
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirmDialog(true);
  };

  const confirmDeactivate = async () => {
    try {
      const v = variants.find((x) => x.maBienThe === deleteId);
      if (!v) throw new Error('Không tìm thấy biến thể');
      await api.put(`/api/bien-the-san-pham/${deleteId}/variant`, {
        sku: v.sku,
        giaBan: Number(v.giaBan),
        soLuongTon: Number(v.soLuongTon),
        trangThaiKho: 'DISCONTINUED',
      });
      setVariants(prev => prev.map(x => x.maBienThe === deleteId ? { ...x, trangThai: false } : x));
      setShowConfirmDialog(false);
      setDeleteId(null);
      showToast('Biến thể đã được tạm dừng hoạt động', 'success');
    } catch (error) {
      console.error('Error deactivating variant:', error);
      showToast('Có lỗi xảy ra khi tạm dừng biến thể', 'error');
      setShowConfirmDialog(false);
      setDeleteId(null);
    }
  };

  const handleActivate = async (id) => {
    try {
      const v = variants.find((x) => x.maBienThe === id);
      if (!v) throw new Error('Không tìm thấy biến thể');
      await api.put(`/api/bien-the-san-pham/${id}/variant`, {
        sku: v.sku,
        giaBan: Number(v.giaBan),
        soLuongTon: Number(v.soLuongTon),
        trangThaiKho: 'ACTIVE',
      });
      setVariants(prev => prev.map(x => x.maBienThe === id ? { ...x, trangThai: true } : x));
      showToast('Đã kích hoạt lại biến thể', 'success');
    } catch (error) {
      console.error('Error activating variant:', error);
      showToast('Có lỗi xảy ra khi kích hoạt biến thể', 'error');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Hết hàng', color: 'bg-red-100 text-red-800' };
    if (stock <= 10) return { text: 'Sắp hết', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Còn hàng', color: 'bg-green-100 text-green-800' };
  };

  // no-op effect to reference some variables/functions so linters don't mark them unused during development
  React.useEffect(() => {
    void isLoading; void error; void mapVariantToApi;
  }, [isLoading, error, mapVariantToApi]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Biến thể Sản phẩm</h1>
              <p className="text-gray-600 mt-1">Quản lý các biến thể (SKU) với giá và tồn kho riêng biệt</p>
            </div>
            
            <button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <IoAdd className="text-lg" />
              Thêm biến thể
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm hoặc SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả sản phẩm</option>
              {products.map(product => (
                <option key={product.maSanPham} value={product.maSanPham}>
                  {product.tenSanPham}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả tồn kho</option>
              <option value="high">Còn nhiều (&gt;10)</option>
              <option value="low">Sắp hết (≤10)</option>
              <option value="out">Hết hàng (0)</option>
            </select>
          </div>
        </div>

        {/* Variants Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách biến thể ({filteredVariants.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            {isLoading && (
              <div className="p-6 text-gray-600">Đang tải dữ liệu biến thể...</div>
            )}
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <IoCube />
                      Sản phẩm
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <IoBarcode />
                      SKU
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <IoLayers />
                      Thuộc tính
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <IoPricetag />
                      Giá bán
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVariants.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <IoSearch className="text-4xl text-gray-400 mb-2" />
                        <p>Không tìm thấy biến thể nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVariants.map((variant) => {
                    const stockStatus = getStockStatus(variant.soLuongTon);
                    return (
                      <tr key={variant.maBienThe} className={`hover:bg-gray-50 transition-colors ${variant.trangThai === false ? 'opacity-50 filter grayscale' : ''}`}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              <span className="font-sans">{variant.sanPham.tenSanPham}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              <span className="font-sans">ID: #{variant.maBienThe}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="text-xs font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded max-w-[80px] truncate inline-block align-middle cursor-pointer"
                            title={variant.sku}
                          >
                            {variant.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 min-w-[220px] max-w-[400px] break-words">
                            {variant.attributes.map((attr, index) => (
                              <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 font-sans">
                                {attr.tenThuocTinh ? `${attr.tenThuocTinh}: ${attr.giaTri}` : attr.giaTri}
                              </span>
                            ))}
                            {variant.attributes.length === 0 && (
                              <span className="text-sm text-gray-400">Chưa có thuộc tính</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(variant.giaBan)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {variant.soLuongTon}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openModal(variant)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                              title="Chỉnh sửa"
                            >
                              <IoCreate className="text-lg" />
                            </button>

                            {variant.trangThai === false ? (
                              <button
                                onClick={() => handleActivate(variant.maBienThe)}
                                className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                                title="Kích hoạt lại"
                              >
                                <IoPlay className="text-lg" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDelete(variant.maBienThe)}
                                className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                                title="Tạm dừng"
                              >
                                <IoPause className="text-lg" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingVariant ? 'Chỉnh sửa biến thể sản phẩm' : 'Thêm biến thể sản phẩm mới'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="maSanPham" className="block text-sm font-medium text-gray-700 mb-1">
              Sản phẩm gốc *
            </label>
            <select
              id="maSanPham"
              value={formData.maSanPham}
              onChange={(e) => setFormData({ ...formData, maSanPham: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Chọn sản phẩm</option>
              {products.map(product => (
                <option key={product.maSanPham} value={product.maSanPham}>
                  {product.tenSanPham}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
              Mã SKU *
            </label>
            <input
              type="text"
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Ví dụ: GG001-R-L"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Mã SKU phải duy nhất cho mỗi biến thể</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="giaBan" className="block text-sm font-medium text-gray-700 mb-1">
                Giá bán (VND) *
              </label>
              <input
                type="number"
                id="giaBan"
                value={formData.giaBan}
                onChange={(e) => setFormData({ ...formData, giaBan: e.target.value })}
                placeholder="2500000"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="soLuongTon" className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng tồn kho *
              </label>
              <input
                type="number"
                id="soLuongTon"
                value={formData.soLuongTon}
                onChange={(e) => setFormData({ ...formData, soLuongTon: e.target.value })}
                placeholder="15"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
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
            </div>

          {/* Attribute editing (single variant only) */}
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-3">Thuộc tính biến thể</h4>
            {attrLoading ? (
              <div className="py-2 text-gray-600">Đang tải thuộc tính...</div>
            ) : attrError ? (
              <div className="p-3 bg-red-50 border rounded text-sm text-red-700">
                Lỗi khi tải thuộc tính: {attrError}
                <div className="mt-2"><button type="button" onClick={fetchAttributes} className="px-3 py-1 bg-blue-600 text-white rounded">Tải lại</button></div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {(editedAttributes || []).map((row, idx) => (
                    <div key={`ea-${idx}`} className="flex items-center gap-3 p-2 border rounded bg-white">
                      <div className="w-1/3 font-medium text-gray-700">{row.tenThuocTinh || row.maThuocTinh}</div>
                      <input
                        type="text"
                        value={row.giaTri || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          setEditedAttributes((prev) => prev.map((r, i) => i === idx ? { ...r, giaTri: v } : r));
                        }}
                        placeholder="Giá trị (VD: Đỏ)"
                        className="p-2 border rounded flex-1"
                      />
                      <button type="button" onClick={() => setEditedAttributes((prev) => prev.filter((_, i) => i !== idx))} className="px-2 py-1 bg-red-50 text-red-600 rounded">Xóa</button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 border rounded bg-white flex items-center gap-3">
                  <select
                    className="p-2 border rounded w-1/3"
                    value={newAttrId}
                    onChange={(e) => setNewAttrId(e.target.value)}
                  >
                    <option value="">-- Chọn thuộc tính --</option>
                    {attributes
                      .filter((a) => !(editedAttributes || []).some((r) => String(r.maThuocTinh) === String(a.id ?? a.maThuocTinh)))
                      .map((a, ai) => (
                        <option key={`attr-opt-${ai}`} value={a.id ?? a.maThuocTinh}>{a.tenThuocTinh}</option>
                      ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Giá trị (VD: Đỏ)"
                    value={newAttrValue}
                    onChange={(e) => setNewAttrValue(e.target.value)}
                    className="p-2 border rounded flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAttrId || !String(newAttrValue).trim()) { showToast('Chọn thuộc tính và nhập giá trị', 'error'); return; }
                      const meta = attributes.find((a) => String(a.id ?? a.maThuocTinh) === String(newAttrId));
                      setEditedAttributes((prev) => [...prev, { maThuocTinh: Number(newAttrId), tenThuocTinh: meta?.tenThuocTinh || String(newAttrId), giaTri: String(newAttrValue) }]);
                      setNewAttrId('');
                      setNewAttrValue('');
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded"
                  >Thêm thuộc tính</button>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <IoSave />
              {editingVariant ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDeactivate}
        title="Tạm dừng biến thể"
        message="Bạn có chắc chắn muốn tạm dừng (ngừng hoạt động) biến thể này? Bạn có thể kích hoạt lại sau."
        confirmText="Tạm dừng"
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

export default ProductVariantManagement;
