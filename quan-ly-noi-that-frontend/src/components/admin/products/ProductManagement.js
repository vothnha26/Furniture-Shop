import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAdd, IoSearch, IoGrid, IoList } from 'react-icons/io5';
import api from '../../../api';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    category: '', 
    price: '', 
    description: '',
    chieuDai: '',
    chieuRong: '',
    chieuCao: '',
    canNang: '',
    nhaCungCap: '',
    boSuuTap: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Variant management states
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [newVariant, setNewVariant] = useState({
    sku: '',
    giaBan: '',
    soLuongTon: '',
    viTriKho: '',
    mucTonToiThieu: '5'
  });

  const [attributes, setAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState([]);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [newAttribute, setNewAttribute] = useState({ tenThuocTinh: '' });
  const [newAttributeValue, setNewAttributeValue] = useState({ maThuocTinh: '', giaTri: '' });

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const mapProductFromApi = (p) => {
    // Tìm ảnh chính từ danh sách hình ảnh
    let mainImage = '';
    if (p.hinhAnhList && p.hinhAnhList.length > 0) {
      // Ưu tiên ảnh có laAnhChinh = true
      const primaryImg = p.hinhAnhList.find(img => img.laAnhChinh === true);
      if (primaryImg) {
        mainImage = primaryImg.duongDanHinhAnh;
      } else {
        // Nếu không có ảnh chính, lấy ảnh có thuTu = 0
        const firstImg = p.hinhAnhList.find(img => img.thuTu === 0);
        if (firstImg) {
          mainImage = firstImg.duongDanHinhAnh;
        } else {
          // Cuối cùng lấy ảnh đầu tiên trong list
          mainImage = p.hinhAnhList[0].duongDanHinhAnh;
        }
      }
    } else {
      // Fallback sang field cũ nếu không có hinhAnhList
      mainImage = p.hinhAnh || p.image || '';
    }

    return {
      id: p.maSanPham || p.id || p.ma || p.uuid,
      name: p.tenSanPham || p.name || p.title || '',
      category: p.danhMuc?.tenDanhMuc || p.danhMuc || p.category || '',
      price: p.giaBan || p.price || 0,
      stock: p.soLuongTon || p.stock || 0,
      image: mainImage,
      description: p.moTa || p.description || '',
      raw: p
    };
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/products');
      let items = [];
      if (Array.isArray(res)) items = res;
      else if (res && res.content) items = res.content;
      else if (res && res.items) items = res.items;
      setProducts(items.map(mapProductFromApi));
    } catch (e) {
      console.error('fetchProducts', e);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await Promise.any([
        api.get('/api/categories').catch(() => { throw new Error('no') }),
        api.get('/api/danhmuc').catch(() => { throw new Error('no') }),
        api.get('/api/danhmucs').catch(() => { throw new Error('no') })
      ]);
      const list = Array.isArray(res) ? res : (res && res.content) ? res.content : [];
      setCategories(list.map(c => (typeof c === 'string' ? c : (c.tenDanhMuc || c.name || c.ten || c))));
    } catch (e) {
      console.error('fetchCategories', e);
      setCategories([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await Promise.any([
        api.get('/api/suppliers').catch(() => { throw new Error('no') }),
        api.get('/api/nhacungcap').catch(() => { throw new Error('no') }),
        api.get('/api/nha-cung-cap').catch(() => { throw new Error('no') })
      ]);
      const list = Array.isArray(res) ? res : (res && res.content) ? res.content : [];
      setSuppliers(list);
    } catch (e) {
      console.error('fetchSuppliers', e);
      setSuppliers([]);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await Promise.any([
        api.get('/api/collections').catch(() => { throw new Error('no') }),
        api.get('/api/bosuutap').catch(() => { throw new Error('no') }),
        api.get('/api/bo-suu-tap').catch(() => { throw new Error('no') })
      ]);
      const list = Array.isArray(res) ? res : (res && res.content) ? res.content : [];
      setCollections(list);
    } catch (e) {
      console.error('fetchCollections', e);
      setCollections([]);
    }
  };

  const fetchAttributes = async () => {
    try {
      const res = await Promise.any([
        api.get('/api/attributes').catch(() => { throw new Error('no') }),
        api.get('/api/thuoctinh').catch(() => { throw new Error('no') }),
        api.get('/api/thuoc-tinh').catch(() => { throw new Error('no') })
      ]);
      const list = Array.isArray(res) ? res : (res && res.content) ? res.content : [];
      setAttributes(list);
    } catch (e) {
      console.error('fetchAttributes', e);
      setAttributes([]);
    }
  };

  const fetchAttributeValues = async () => {
    try {
      const res = await Promise.any([
        api.get('/api/attribute-values').catch(() => { throw new Error('no') }),
        api.get('/api/giatri-thuoctinh').catch(() => { throw new Error('no') }),
        api.get('/api/gia-tri-thuoc-tinh').catch(() => { throw new Error('no') })
      ]);
      const list = Array.isArray(res) ? res : (res && res.content) ? res.content : [];
      setAttributeValues(list);
    } catch (e) {
      console.error('fetchAttributeValues', e);
      setAttributeValues([]);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchProducts();
      await fetchCategories();
      await fetchSuppliers();
      await fetchCollections();
      await fetchAttributes();
      await fetchAttributeValues();
    })();
    // intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    
    // Tạo preview cho các ảnh
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreview(newPreviews);
  };

  const handleAddProduct = async () => {
    const payload = {
      tenSanPham: newProduct.name,
      moTa: newProduct.description,
      giaBan: newProduct.price || 0,
      danhMuc: newProduct.category,
      chieuDai: newProduct.chieuDai ? parseInt(newProduct.chieuDai) : null,
      chieuRong: newProduct.chieuRong ? parseInt(newProduct.chieuRong) : null,
      chieuCao: newProduct.chieuCao ? parseInt(newProduct.chieuCao) : null,
      canNang: newProduct.canNang ? parseInt(newProduct.canNang) : null,
      maNhaCungCap: newProduct.nhaCungCap ? parseInt(newProduct.nhaCungCap) : null,
      maBoSuuTap: newProduct.boSuuTap ? parseInt(newProduct.boSuuTap) : null
    };
    try {
      // 1. Tạo sản phẩm trước
      const productRes = await api.post('/api/products', { body: payload });
      const newProductId = productRes.maSanPham || productRes.id;

      // 2. Nếu có ảnh, upload ảnh cho sản phẩm vừa tạo
      if (selectedImages.length > 0 && newProductId) {
        const formData = new FormData();
        selectedImages.forEach((file, index) => {
          formData.append('images', file);
          formData.append('thuTu', index);
          formData.append('laAnhChinh', index === 0); // Ảnh đầu tiên là ảnh chính
        });

        try {
          await api.post(`/api/products/${newProductId}/images`, { 
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
          });
        } catch (imgErr) {
          console.error('Upload images error:', imgErr);
          alert('Sản phẩm đã tạo nhưng upload ảnh lỗi. Bạn có thể thêm ảnh sau.');
        }
      }

      await fetchProducts();
      setShowAddModal(false);
      setNewProduct({ 
        name: '', 
        category: '', 
        price: '', 
        description: '',
        chieuDai: '',
        chieuRong: '',
        chieuCao: '',
        canNang: '',
        nhaCungCap: '',
        boSuuTap: ''
      });
      setSelectedImages([]);
      setImagePreview([]);
    } catch (e) {
      console.error('handleAddProduct', e);
      alert('Lỗi khi thêm sản phẩm. Kiểm tra backend.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      try { await api.del(`/api/products/${id}`); } catch (e) { /* ignore */ }
      try { await api.del(`/api/variants/${id}`); } catch (e) { /* ignore */ }
      await fetchProducts();
    } catch (e) {
      console.error('handleDeleteProduct', e);
      alert('Xóa thất bại');
    }
  };

  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleViewVariants = async (product) => {
    setSelectedProduct(product);
    setShowVariantsModal(true);
    setLoadingVariants(true);
    setVariants([]);
    try {
      let data;
      try {
        data = await api.get(`/api/products/${product.id}/variants`);
      } catch (e) {
        data = await api.get(`/api/bien-the-san-pham/san-pham/${product.id}`);
      }
      const list = Array.isArray(data) ? data : (data && data.content) ? data.content : [];
      setVariants(list);
    } catch (e) {
      console.error('load variants', e);
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Xóa biến thể?')) return;
    try {
      await api.del(`/api/variants/${variantId}`);
      // refresh
      if (selectedProduct) handleViewVariants(selectedProduct);
    } catch (e) {
      console.error('delete variant', e);
      alert('Xóa biến thể thất bại');
    }
  };

  const handleAddVariant = async () => {
    const payload = {
      maSanPham: selectedProduct.id,
      sku: newVariant.sku,
      giaBan: parseFloat(newVariant.giaBan) || 0,
      soLuongTon: parseInt(newVariant.soLuongTon) || 0,
      viTriKho: newVariant.viTriKho || '',
      mucTonToiThieu: parseInt(newVariant.mucTonToiThieu) || 5
    };
    try {
      await api.post('/api/variants', { body: payload });
      await handleViewVariants(selectedProduct);
      setShowAddVariantModal(false);
      setNewVariant({
        sku: '',
        giaBan: '',
        soLuongTon: '',
        viTriKho: '',
        mucTonToiThieu: '5'
      });
    } catch (e) {
      console.error('add variant', e);
      alert('Lỗi thêm biến thể');
    }
  };

  const handleEditVariant = async () => {
    const payload = {
      sku: newVariant.sku,
      giaBan: parseFloat(newVariant.giaBan) || 0,
      soLuongTon: parseInt(newVariant.soLuongTon) || 0,
      viTriKho: newVariant.viTriKho || '',
      mucTonToiThieu: parseInt(newVariant.mucTonToiThieu) || 5
    };
    try {
      await api.put(`/api/variants/${editingVariant.maBienThe || editingVariant.id}`, { body: payload });
      await handleViewVariants(selectedProduct);
      setShowAddVariantModal(false);
      setEditingVariant(null);
      setNewVariant({
        sku: '',
        giaBan: '',
        soLuongTon: '',
        viTriKho: '',
        mucTonToiThieu: '5'
      });
    } catch (e) {
      console.error('edit variant', e);
      alert('Lỗi sửa biến thể');
    }
  };

  const openEditVariant = (variant) => {
    setEditingVariant(variant);
    setNewVariant({
      sku: variant.sku || '',
      giaBan: variant.giaBan || variant.price || '',
      soLuongTon: variant.soLuongTon || variant.stock || '',
      viTriKho: variant.viTriKho || '',
      mucTonToiThieu: variant.mucTonToiThieu || '5'
    });
    setShowAddVariantModal(true);
  };

  const openAddVariant = () => {
    setEditingVariant(null);
    setNewVariant({
      sku: '',
      giaBan: '',
      soLuongTon: '',
      viTriKho: '',
      mucTonToiThieu: '5'
    });
    setShowAddVariantModal(true);
  };

  const handleAddAttribute = async () => {
    const payload = { tenThuocTinh: newAttribute.tenThuocTinh };
    try {
      await api.post('/api/attributes', { body: payload });
      await fetchAttributes();
      setNewAttribute({ tenThuocTinh: '' });
    } catch (e) {
      console.error('add attribute', e);
      alert('Lỗi thêm thuộc tính');
    }
  };

  const handleAddAttributeValue = async () => {
    const payload = { 
      maThuocTinh: parseInt(newAttributeValue.maThuocTinh),
      giaTri: newAttributeValue.giaTri 
    };
    try {
      await api.post('/api/attribute-values', { body: payload });
      await fetchAttributeValues();
      setNewAttributeValue({ maThuocTinh: '', giaTri: '' });
    } catch (e) {
      console.error('add attribute value', e);
      alert('Lỗi thêm giá trị thuộc tính');
    }
  };

  const handleAddCategory = async () => {
    const name = (newCategoryName || '').trim();
    if (!name) return alert('Nhập tên danh mục');
    const payload = { tenDanhMuc: name };
    try {
      // try common endpoints
      try { await api.post('/api/categories', { body: payload }); }
      catch (e1) {
        try { await api.post('/api/danhmuc', { body: payload }); }
        catch (e2) { await api.post('/api/danhmucs', { body: { name } }); }
      }
      setShowAddCategoryModal(false);
      setNewCategoryName('');
      await fetchCategories();
      setSelectedCategory(name);
      setNewProduct(prev => ({ ...prev, category: name }));
    } catch (e) {
      console.error('create category', e);
      alert('Tạo danh mục thất bại');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Sản phẩm</h1>
          <p className="text-gray-600">Danh sách sản phẩm (lấy từ backend)</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64" />
              </div>

              <div className="flex items-center gap-2">
                <select value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                </select>
                <button onClick={()=>setShowAddCategoryModal(true)} className="px-2 py-2 border rounded text-sm">+</button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex border border-gray-300 rounded-lg">
                <button onClick={()=>setViewMode('grid')} className={`p-2 ${viewMode==='grid' ? 'bg-primary text-white' : 'text-gray-600'}`}><IoGrid className="w-5 h-5" /></button>
                <button onClick={()=>setViewMode('list')} className={`p-2 ${viewMode==='list' ? 'bg-primary text-white' : 'text-gray-600'}`}><IoList className="w-5 h-5" /></button>
              </div>
              <button onClick={()=>setShowAttributeModal(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <IoAdd/> Thuộc tính
              </button>
              <button onClick={()=>setShowAddModal(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg"><IoAdd/> Thêm sản phẩm</button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : (
          <div className={viewMode==='grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : ''}>
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary">{Number(product.price).toLocaleString('vi-VN')}đ</span>
                    <span className="text-sm text-gray-500">Tồn: {product.stock}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>handleViewVariants(product)} className="flex-1 text-purple-600">Biến thể</button>
                    <button onClick={()=>openProductDetail(product)} className="flex-1 text-blue-600">Chi tiết</button>
                    <button onClick={()=>navigate(`/admin/products/${product.id}/images`)} className="flex-1 text-indigo-600">Ảnh</button>
                    <button onClick={()=>handleDeleteProduct(product.id)} className="flex-1 text-red-600">Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add product modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl my-8">
              <h3 className="text-lg font-semibold mb-4">Thêm sản phẩm</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <div className="flex gap-2">
                    <select value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category: e.target.value})} className="w-full px-3 py-2 border rounded">
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                    </select>
                    <button type="button" onClick={()=>setShowAddCategoryModal(true)} className="px-3 py-2 border rounded hover:bg-gray-50">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (đ)</label>
                  <input type="number" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chiều dài (cm)</label>
                  <input type="number" value={newProduct.chieuDai} onChange={e=>setNewProduct({...newProduct, chieuDai: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chiều rộng (cm)</label>
                  <input type="number" value={newProduct.chieuRong} onChange={e=>setNewProduct({...newProduct, chieuRong: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chiều cao (cm)</label>
                  <input type="number" value={newProduct.chieuCao} onChange={e=>setNewProduct({...newProduct, chieuCao: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng (kg)</label>
                  <input type="number" value={newProduct.canNang} onChange={e=>setNewProduct({...newProduct, canNang: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
                  <select value={newProduct.nhaCungCap} onChange={e=>setNewProduct({...newProduct, nhaCungCap: e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {suppliers.map((s, idx) => (
                      <option key={idx} value={s.maNhaCungCap || s.id}>
                        {s.tenNhaCungCap || s.name || s.ten || 'NCC #' + (s.maNhaCungCap || s.id)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bộ sưu tập</label>
                  <select value={newProduct.boSuuTap} onChange={e=>setNewProduct({...newProduct, boSuuTap: e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option value="">-- Chọn bộ sưu tập --</option>
                    {collections.map((c, idx) => (
                      <option key={idx} value={c.maBoSuuTap || c.id}>
                        {c.tenBoSuuTap || c.name || c.ten || 'BST #' + (c.maBoSuuTap || c.id)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea rows="3" value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                
                {/* Phần upload ảnh */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input 
                      type="file" 
                      id="product-images" 
                      multiple 
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <label 
                      htmlFor="product-images" 
                      className="cursor-pointer flex flex-col items-center justify-center py-4"
                    >
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      <span className="text-sm text-gray-600">Nhấn để chọn ảnh</span>
                      <span className="text-xs text-gray-500 mt-1">Có thể chọn nhiều ảnh</span>
                    </label>
                    
                    {/* Preview ảnh đã chọn */}
                    {imagePreview.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {imagePreview.map((preview, idx) => (
                          <div key={idx} className="relative group">
                            <img src={preview} alt={`Preview ${idx}`} className="w-full h-24 object-cover rounded" />
                            {idx === 0 && (
                              <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">Chính</span>
                            )}
                            <button
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ảnh đầu tiên sẽ là ảnh chính của sản phẩm</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={()=>setShowAddModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                <button onClick={handleAddProduct} className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">Thêm</button>
              </div>
            </div>
          </div>
        )}

        {/* Quick add category modal */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Thêm danh mục nhanh</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                <input value={newCategoryName} onChange={e=>setNewCategoryName(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={()=>setShowAddCategoryModal(false)} className="flex-1 px-4 py-2 border rounded">Hủy</button>
                <button onClick={handleAddCategory} className="flex-1 px-4 py-2 bg-primary text-white rounded">Tạo</button>
              </div>
            </div>
          </div>
        )}

        {/* Product detail modal */}
        {showDetailModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Chi tiết</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img src={selectedProduct.image} alt="" className="w-full h-64 object-cover rounded" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold">{selectedProduct.name}</h4>
                  <p className="text-gray-600">{selectedProduct.category}</p>
                  <p className="mt-2">{selectedProduct.description}</p>
                  <p className="mt-2 font-bold">{Number(selectedProduct.price).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={()=>setShowDetailModal(false)} className="flex-1 px-4 py-2 border rounded">Đóng</button>
                <button onClick={()=>{ setShowDetailModal(false); navigate(`/admin/products/${selectedProduct.id}/images`) }} className="flex-1 px-4 py-2 bg-primary text-white rounded">Ảnh</button>
              </div>
            </div>
          </div>
        )}

        {/* Variants modal */}
        {showVariantsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Biến thể - {selectedProduct?.name}</h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={openAddVariant} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">+ Thêm biến thể</button>
                  <button onClick={()=>handleViewVariants(selectedProduct)} className="px-3 py-2 border rounded">Làm mới</button>
                  <button onClick={()=>setShowVariantsModal(false)} className="px-3 py-2 border rounded">Đóng</button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {loadingVariants ? (
                  <div>Đang tải...</div>
                ) : variants.length===0 ? (
                  <div>Không có biến thể</div>
                ) : (
                  <table className="min-w-full divide-y">
                    <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left">SKU</th><th className="px-4 py-2 text-left">Giá</th><th className="px-4 py-2 text-left">Tồn</th><th className="px-4 py-2 text-left">Vị trí</th><th className="px-4 py-2 text-center">Thao tác</th></tr></thead>
                    <tbody>
                      {variants.map(v=> (
                        <tr key={v.maBienThe || v.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{v.sku}</td>
                          <td className="px-4 py-2">{Number(v.giaBan || v.price || 0).toLocaleString('vi-VN')}đ</td>
                          <td className="px-4 py-2">{v.soLuongTon || v.stock || 0}</td>
                          <td className="px-4 py-2">{v.viTriKho || '-'}</td>
                          <td className="px-4 py-2 text-center space-x-2">
                            <button onClick={()=>openEditVariant(v)} className="text-blue-600 hover:text-blue-800">Sửa</button>
                            <button onClick={()=>handleDeleteVariant(v.maBienThe || v.id)} className="text-red-600 hover:text-red-800">Xóa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Attribute Management Modal */}
        {showAttributeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-2xl font-bold">Quản lý thuộc tính sản phẩm</h2>
                <button onClick={()=>setShowAttributeModal(false)} className="px-3 py-2 border rounded">Đóng</button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Thuộc tính */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Thuộc tính</h3>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input 
                          value={newAttribute.tenThuocTinh}
                          onChange={e=>setNewAttribute({...newAttribute, tenThuocTinh: e.target.value})}
                          placeholder="Tên thuộc tính (vd: Màu sắc)"
                          className="flex-1 px-3 py-2 border rounded"
                        />
                        <button onClick={handleAddAttribute} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Thêm</button>
                      </div>
                      <div className="max-h-60 overflow-y-auto border rounded">
                        {attributes.map(attr => (
                          <div key={attr.maThuocTinh || attr.id} className="p-2 border-b hover:bg-gray-50">
                            {attr.tenThuocTinh || attr.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Giá trị thuộc tính */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Giá trị thuộc tính</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={newAttributeValue.maThuocTinh}
                          onChange={e=>setNewAttributeValue({...newAttributeValue, maThuocTinh: e.target.value})}
                          className="px-3 py-2 border rounded"
                        >
                          <option value="">Chọn thuộc tính</option>
                          {attributes.map(attr => (
                            <option key={attr.maThuocTinh || attr.id} value={attr.maThuocTinh || attr.id}>
                              {attr.tenThuocTinh || attr.name}
                            </option>
                          ))}
                        </select>
                        <input 
                          value={newAttributeValue.giaTri}
                          onChange={e=>setNewAttributeValue({...newAttributeValue, giaTri: e.target.value})}
                          placeholder="Giá trị (vd: Đỏ)"
                          className="px-3 py-2 border rounded"
                        />
                      </div>
                      <button onClick={handleAddAttributeValue} className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Thêm giá trị</button>
                      <div className="max-h-60 overflow-y-auto border rounded">
                        {attributeValues.map(val => (
                          <div key={val.maGiaTri || val.id} className="p-2 border-b hover:bg-gray-50">
                            <span className="font-medium">{val.thuocTinh?.tenThuocTinh || 'Thuộc tính'}:</span> {val.giaTri}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Variant Modal */}
        {showAddVariantModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">{editingVariant ? 'Sửa biến thể' : 'Thêm biến thể'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU <span className="text-red-500">*</span></label>
                  <input 
                    value={newVariant.sku} 
                    onChange={e=>setNewVariant({...newVariant, sku: e.target.value})}
                    className="w-full px-3 py-2 border rounded" 
                    placeholder="SKU duy nhất"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (đ)</label>
                  <input 
                    type="number"
                    value={newVariant.giaBan} 
                    onChange={e=>setNewVariant({...newVariant, giaBan: e.target.value})}
                    className="w-full px-3 py-2 border rounded" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn</label>
                  <input 
                    type="number"
                    value={newVariant.soLuongTon} 
                    onChange={e=>setNewVariant({...newVariant, soLuongTon: e.target.value})}
                    className="w-full px-3 py-2 border rounded" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí kho</label>
                  <input 
                    value={newVariant.viTriKho} 
                    onChange={e=>setNewVariant({...newVariant, viTriKho: e.target.value})}
                    className="w-full px-3 py-2 border rounded" 
                    placeholder="Ví dụ: Kệ A-01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức tồn tối thiểu</label>
                  <input 
                    type="number"
                    value={newVariant.mucTonToiThieu} 
                    onChange={e=>setNewVariant({...newVariant, mucTonToiThieu: e.target.value})}
                    className="w-full px-3 py-2 border rounded" 
                    placeholder="5"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={()=>setShowAddVariantModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                <button 
                  onClick={editingVariant ? handleEditVariant : handleAddVariant} 
                  className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  {editingVariant ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductManagement;

