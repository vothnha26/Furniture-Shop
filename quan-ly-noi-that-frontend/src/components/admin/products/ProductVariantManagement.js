import React, { useState, useEffect, useCallback } from 'react';
import { IoAdd, IoSearch, IoCreate, IoSave, IoClose, IoCube, IoBarcode, IoPricetag, IoLayers, IoPause, IoPlay } from 'react-icons/io5';
import Modal from '../../shared/Modal';
import ConfirmDialog from '../../shared/ConfirmDialog';
import Toast from '../../shared/Toast';
import api from '../../../api';

const ProductVariantManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Attribute/variant helper state (to mirror ProductManagement behavior)
  const [attributes, setAttributes] = useState([]);
  const [attrLoading, setAttrLoading] = useState(false);
  const [attrError, setAttrError] = useState(null);
  const [variantSelections, setVariantSelections] = useState({}); // { attributeId: Array(valueTextOrId) }
  const [explicitRows, setExplicitRows] = useState([]); // [{ maThuocTinh, giaTri }]
  const [variantMode, setVariantMode] = useState('single'); // 'single' | 'rows'
  const [useExplicitRows, setUseExplicitRows] = useState(false);
  const [attrTextInputs, setAttrTextInputs] = useState({}); // quick text per-attribute
  const [dropdownSelections, setDropdownSelections] = useState({}); // quick select per-attribute

  // Map variant data from API
  const mapVariantFromApi = (variant) => ({
    maBienThe: variant.maBienThe || variant.id,
    sanPham: {
      maSanPham: variant.sanPham?.maSanPham || variant.productId,
      tenSanPham: variant.sanPham?.tenSanPham || variant.productName
    },
    tenBienThe: variant.tenBienThe || variant.name,
    sku: variant.sku || variant.sku,
    giaBan: variant.giaBan || variant.price || 0,
    giaGoc: variant.giaGoc || variant.originalPrice || 0,
    soLuongTon: variant.tonKho || variant.stock || 0,
    trangThai: variant.trangThai || variant.active || true,
    attributes: variant.thuocTinhList?.map(attr => ({
      thuocTinh: attr.thuocTinh?.tenThuocTinh || attr.attributeName,
      giaTri: attr.giaTri?.giaTri || attr.attributeValue
    })) || [],
    hinhAnh: variant.hinhAnh || variant.image || ''
  });

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

  // Fetch variants
  useEffect(() => {
    const fetchVariants = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/products/variants');
        if (Array.isArray(data)) {
          setVariants(data.map(mapVariantFromApi));
        }
      } catch (err) {
        console.error('Fetch variants error', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVariants();
  }, []);

  const [variants, setVariants] = useState([
    {
      maBienThe: 1,
      sanPham: { maSanPham: 1, tenSanPham: 'Ghế gỗ cao cấp' },
      sku: 'GG001-R-L',
      giaBan: 2500000,
      soLuongTon: 15,
      attributes: [
        { thuocTinh: 'Màu sắc', giaTri: 'Đỏ' },
        { thuocTinh: 'Kích thước', giaTri: 'L' }
      ]
    },
    {
      maBienThe: 2,
      sanPham: { maSanPham: 1, tenSanPham: 'Ghế gỗ cao cấp' },
      sku: 'GG001-B-M',
      giaBan: 2300000,
      soLuongTon: 8,
      attributes: [
        { thuocTinh: 'Màu sắc', giaTri: 'Xanh' },
        { thuocTinh: 'Kích thước', giaTri: 'M' }
      ]
    },
    {
      maBienThe: 3,
      sanPham: { maSanPham: 2, tenSanPham: 'Bàn ăn 6 người' },
      sku: 'BA001-OAK-STD',
      giaBan: 4500000,
      soLuongTon: 12,
      attributes: [
        { thuocTinh: 'Chất liệu', giaTri: 'Gỗ sồi' }
      ]
    }
  ]);

  const [products] = useState([
    { maSanPham: 1, tenSanPham: 'Ghế gỗ cao cấp' },
    { maSanPham: 2, tenSanPham: 'Bàn ăn 6 người' },
    { maSanPham: 3, tenSanPham: 'Tủ quần áo 3 cánh' }
  ]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.maSanPham || !formData.sku.trim() || !formData.giaBan || !formData.soLuongTon) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    // Check if SKU already exists
    const exists = variants.some(variant => 
      variant.sku.toLowerCase() === formData.sku.toLowerCase() &&
      variant.maBienThe !== editingVariant?.maBienThe
    );

    if (exists) {
      showToast('Mã SKU đã tồn tại', 'error');
      return;
    }

    const selectedProd = products.find(prod => prod.maSanPham.toString() === formData.maSanPham);
    const tenBienThe = selectedProd ? `${selectedProd.tenSanPham} - ${formData.sku}` : formData.sku;

    if (editingVariant) {
      // Update existing variant
      const updatedAttributes = buildAttributesForDisplay();
      setVariants(variants.map(variant =>
        variant.maBienThe === editingVariant.maBienThe
          ? { 
              ...variant, 
              sanPham: selectedProd,
              tenBienThe: tenBienThe,
              sku: formData.sku,
              giaBan: parseInt(formData.giaBan),
              soLuongTon: parseInt(formData.soLuongTon),
              attributes: updatedAttributes
            }
          : variant
      ));
      showToast('Cập nhật biến thể sản phẩm thành công');
    } else {
      // Add new variant
      const newVariant = {
        maBienThe: Math.max(...variants.map(v => v.maBienThe), 0) + 1,
        sanPham: selectedProd,
        tenBienThe: tenBienThe,
        sku: formData.sku,
        giaBan: parseInt(formData.giaBan),
        soLuongTon: parseInt(formData.soLuongTon),
        attributes: buildAttributesForDisplay()
      };
      setVariants([...variants, newVariant]);
      showToast('Thêm biến thể sản phẩm thành công');
    }

    closeModal();
  };

  const openModal = (variant = null) => {
    setEditingVariant(variant);
    setFormData({
      maSanPham: variant ? variant.sanPham.maSanPham.toString() : '',
      sku: variant ? variant.sku : '',
      giaBan: variant ? variant.giaBan.toString() : '',
      soLuongTon: variant ? variant.soLuongTon.toString() : ''
    });
    // Prepare attribute helpers
    setVariantSelections({});
    setExplicitRows([]);
    setVariantMode('single');
    setUseExplicitRows(false);
    fetchAttributes().catch(() => {});
    setShowModal(true);
  };

  // Build attribute display objects for storing on the variant in frontend state.
  const buildAttributesForDisplay = () => {
    if (Array.isArray(explicitRows) && explicitRows.length > 0) {
      return explicitRows.filter(r => r && (r.maThuocTinh || r.giaTri)).map(r => {
        const attrMeta = attributes.find(a => String(a.id ?? a.maThuocTinh) === String(r.maThuocTinh));
        return { thuocTinh: attrMeta ? (attrMeta.tenThuocTinh || attrMeta.name) : String(r.maThuocTinh || ''), giaTri: String(r.giaTri || '') };
      });
    }
    const out = [];
    for (const a of attributes) {
      const aKey = String(a.id ?? a.maThuocTinh);
      const sel = variantSelections[aKey] || [];
      if (sel.length === 0) continue;
      const first = sel[0];
      let valueName = first;
      if (a.values && a.values.length > 0) {
        const v = a.values.find(vv => String(vv.id) === String(first) || String(vv.tenGiaTri) === String(first));
        if (v) valueName = v.tenGiaTri || v.name || String(first);
      }
      out.push({ thuocTinh: a.tenThuocTinh || a.name || a.label || String(aKey), giaTri: String(valueName) });
    }
    return out;
  };

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
      await api.put(`/api/bien-the-san-pham/${deleteId}/variant`, {
        trangThaiKho: 'DISCONTINUED'
      });
      setVariants(prev => prev.map(v => v.maBienThe === deleteId ? { ...v, trangThai: false } : v));
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
      await api.put(`/api/bien-the-san-pham/${id}/variant`, {
        trangThaiKho: 'ACTIVE'
      });
      setVariants(prev => prev.map(v => v.maBienThe === id ? { ...v, trangThai: true } : v));
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
                {filteredVariants.length === 0 ? (
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
                              {variant.sanPham.tenSanPham}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: #{variant.maBienThe}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {variant.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {variant.attributes.map((attr, index) => (
                              <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                                {attr.thuocTinh}: {attr.giaTri}
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

          {/* Attribute selection UI (single / rows) */}
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Chế độ thêm giá trị</h4>
              <div className="flex items-center gap-3">
                <label className={`flex items-center gap-2 text-sm ${variantMode === 'single' ? 'font-semibold' : ''}`}>
                  <input type="radio" name="variantMode" checked={variantMode === 'single'} onChange={() => { setVariantMode('single'); setUseExplicitRows(false); }} />
                  <span>Biến thể đơn (chọn 1 giá trị / thuộc tính)</span>
                </label>
                <label className={`flex items-center gap-2 text-sm ${variantMode === 'rows' ? 'font-semibold' : ''}`}>
                  <input type="radio" name="variantMode" checked={variantMode === 'rows'} onChange={() => { setVariantMode('rows'); setUseExplicitRows(true); }} />
                  <span>Chế độ hàng (một hàng = một thuộc tính:giá trị)</span>
                </label>
              </div>
            </div>

            {attrLoading ? (
              <div className="py-4 text-center text-gray-600">Đang tải thuộc tính...</div>
            ) : attrError ? (
              <div className="p-4 bg-red-50 border rounded">
                <p className="text-sm text-red-700 mb-2">Lỗi khi tải thuộc tính: {attrError}</p>
                <div className="flex justify-end">
                  <button onClick={fetchAttributes} className="px-3 py-1 bg-blue-600 text-white rounded">Tải lại</button>
                </div>
              </div>
            ) : (!attributes || attributes.length === 0) ? (
              <div className="p-4 text-gray-600">Chưa có thuộc tính nào. Bạn có thể tạo thuộc tính trên backend hoặc thử tải lại.</div>
            ) : (
              <div className="space-y-3">
                {useExplicitRows && variantMode === 'rows' && (
                  <div className="p-3 border rounded bg-white">
                    <h5 className="font-semibold mb-2">Danh sách hàng (một hàng = một thuộc tính:giá trị)</h5>
                    <div className="space-y-2">
                      {explicitRows.map((row, idx) => (
                        <div key={`er-${idx}`} className="flex items-center gap-2">
                          <select value={row.maThuocTinh || ''} onChange={(e) => {
                            const v = e.target.value;
                            setExplicitRows(prev => prev.map((r, i) => i === idx ? { ...r, maThuocTinh: v } : r));
                          }} className="p-2 border rounded">
                            <option value="">-- Chọn thuộc tính --</option>
                            {attributes.map((a, ai) => (
                              <option key={`attr-option-${a.id ?? a.maThuocTinh ?? ai}`} value={a.id ?? a.maThuocTinh}>{a.tenThuocTinh}</option>
                            ))}
                          </select>
                          <input type="text" value={row.giaTri || ''} onChange={(e) => {
                            const v = e.target.value;
                            setExplicitRows(prev => prev.map((r, i) => i === idx ? { ...r, giaTri: v } : r));
                          }} placeholder="Giá trị (VD: Đỏ)" className="p-2 border rounded flex-1" />
                          <button type="button" onClick={() => setExplicitRows(prev => prev.filter((_, i) => i !== idx))} className="px-2 py-1 bg-red-50 text-red-600 rounded">X</button>
                        </div>
                      ))}

                      <div>
                        <button type="button" onClick={() => setExplicitRows(prev => [...prev, { maThuocTinh: '', giaTri: '' }])} className="px-3 py-1 bg-green-50 text-green-700 rounded">+ Thêm hàng</button>
                      </div>
                    </div>
                  </div>
                )}

                {attributes.map((attr, ai) => {
                  const aKey = String(attr.id ?? attr.maThuocTinh ?? ai);
                  return (
                    <div key={`attr-row-${aKey}`} className="p-3 border rounded bg-white">
                      <div className="flex items-start justify-between">
                        <div className="font-semibold text-gray-700">{attr.tenThuocTinh}</div>
                        <button type="button" onClick={() => setAttributes(prev => prev.filter(a => String(a.id ?? a.maThuocTinh) !== String(attr.id ?? attr.maThuocTinh)))} className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">Xóa thuộc tính</button>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <select
                          value={dropdownSelections[aKey] || ''}
                          onChange={(e) => setDropdownSelections(prev => ({ ...prev, [aKey]: e.target.value }))}
                          className="p-2 border rounded w-1/3"
                        >
                          <option value="">-- Chọn hoặc gõ giá trị --</option>
                          {(attr.values || []).map((v, vi) => (
                            <option key={`opt-${aKey}-${vi}`} value={v.tenGiaTri || v.id}>{v.tenGiaTri || v.name || v.id}</option>
                          ))}
                        </select>

                        <input
                          type="text"
                          placeholder={`Gõ nhanh giá trị cho ${attr.tenThuocTinh}`}
                          value={attrTextInputs[aKey] || ''}
                          onChange={(e) => setAttrTextInputs(prev => ({ ...prev, [aKey]: e.target.value }))}
                          className="p-2 border rounded flex-1"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const val = (attrTextInputs[aKey] || dropdownSelections[aKey] || '').toString().trim();
                            if (!val) { showToast('Vui lòng nhập hoặc chọn một giá trị', 'error'); return; }
                            setVariantSelections(prev => ({ ...prev, [aKey]: [val] }));
                            showToast('Đã thêm giá trị cho thuộc tính', 'success');
                          }}
                          className="px-3 py-1 bg-green-50 text-green-700 rounded"
                        >Thêm</button>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-start space-x-2 border-t pt-3 mt-3">
                  <button
                    onClick={() => {
                      // Build attributes and submit form manually by triggering submit
                      // We simply allow normal submit to pick up state in handleSubmit
                      // but ensure selections are present
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Thiết lập thuộc tính
                  </button>
                  <button
                    onClick={() => {
                      setVariantMode('rows');
                      setUseExplicitRows(true);
                      if (!Array.isArray(explicitRows) || explicitRows.length === 0) setExplicitRows([{ maThuocTinh: '', giaTri: '' }]);
                    }}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-800"
                  >
                    Tạo hàng thuộc tính
                  </button>
                </div>
              </div>
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
