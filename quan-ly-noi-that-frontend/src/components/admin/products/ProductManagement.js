import React, { useState, useEffect, useCallback } from 'react';
import { IoAdd, IoImage, IoCube, IoPricetag, IoGrid, IoList } from 'react-icons/io5';
import api from '../../../api';
import DataTable from '../../shared/DataTable';
import Modal from '../../shared/Modal';
import FileUpload from '../../shared/FileUpload';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Variant state
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [showDeleteVariantConfirm, setShowDeleteVariantConfirm] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantToDelete, setVariantToDelete] = useState(null);
  const [attributes, setAttributes] = useState([]); // list of attributes with values
  const [attrLoading, setAttrLoading] = useState(false);
  const [attrError, setAttrError] = useState(null);
  const [variantSelections, setVariantSelections] = useState({}); // { attributeId: Array(valueId) }
  const [bulkVariantsPreview, setBulkVariantsPreview] = useState([]); // preview list for bulk creation
  const [useExplicitRows, setUseExplicitRows] = useState(false);
  const [explicitRows, setExplicitRows] = useState([]); // [{ maThuocTinh, giaTri }]
  const [attrTextInputs, setAttrTextInputs] = useState({}); // { [attrId]: current input text }
  const [attrLastAdded, setAttrLastAdded] = useState({}); // { [attrId]: last added raw value }

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCollection, setFilterCollection] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const [productForm, setProductForm] = useState({
    tenSanPham: '',
    moTa: '',
    maDanhMuc: '',
    maNhaCungCap: '',
    maBoSuuTap: '',
    diemThuong: 0
  });

  const [productImages, setProductImages] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [variantCountsMap, setVariantCountsMap] = useState({}); // { [productId]: count }

  const [variantForm, setVariantForm] = useState({
    tenBienThe: '',
    sku: '',
    giaMua: '',
    giaBan: '',
    soLuongTon: '',
    mucTonToiThieu: '',
    moTa: ''
  });

  // Map API product object -> UI shape
  const mapProductFromApi = (p) => ({
    id: p.maSanPham || p.id,
    tenSanPham: p.tenSanPham || '',
    moTa: p.moTa || '',
    // category id/name may come as maDanhMuc/tenDanhMuc or nested object 'danhMuc' or 'category'
    maDanhMuc: p.maDanhMuc || (p.danhMuc && (p.danhMuc.maDanhMuc || p.danhMuc.id)) || (p.category && (p.category.id || p.category.maDanhMuc)) || '',
    tenDanhMuc: p.tenDanhMuc || (p.danhMuc && (p.danhMuc.tenDanhMuc || p.danhMuc.name)) || (p.category && (p.category.name || p.category.tenDanhMuc)) || 'Chưa phân loại',
    // supplier id/name may come as maNhaCungCap/tenNhaCungCap or nested object 'nhaCungCap' or 'supplier'
    maNhaCungCap: p.maNhaCungCap || (p.nhaCungCap && (p.nhaCungCap.maNhaCungCap || p.nhaCungCap.id)) || (p.supplier && (p.supplier.id || p.supplier.maNhaCungCap)) || '',
    tenNhaCungCap: p.tenNhaCungCap || (p.nhaCungCap && (p.nhaCungCap.tenNhaCungCap || p.nhaCungCap.name)) || (p.supplier && (p.supplier.name || p.supplier.tenNhaCungCap)) || 'Chưa phân loại',
    maBoSuuTap: p.maBoSuuTap || (p.boSuuTap && (p.boSuuTap.maBoSuuTap || p.boSuuTap.id)) || '',
    tenBoSuuTap: p.tenBoSuuTap || (p.boSuuTap && (p.boSuuTap.tenBoSuuTap || p.boSuuTap.name)) || 'Chưa phân loại',
    trangThai: p.trangThai !== false,
    ngayTao: p.ngayTao || '',
    ngayCapNhat: p.ngayCapNhat || '',
    soLuongBienThe: p.soLuongBienThe || 0,
    hinhAnhs: p.hinhAnhs || [],
    diemThuong: p.diemThuong != null ? p.diemThuong : (p.diemThuong || 0)
  });

  // Map UI shape -> API payload
  const mapProductToApi = (p) => ({
    tenSanPham: p.tenSanPham,
    moTa: p.moTa,
    maDanhMuc: p.maDanhMuc ? parseInt(p.maDanhMuc) : null,
    maNhaCungCap: parseInt(p.maNhaCungCap),
    maBoSuuTap: p.maBoSuuTap ? parseInt(p.maBoSuuTap) : null
    , diemThuong: p.diemThuong != null ? parseInt(p.diemThuong) : 0
  });

  // Helper to detect File-like objects
  const isFileLike = (f) => {
    if (!f) return false;
    // Check instanceof File first (works even if File has extra properties via Object.assign)
    if (typeof File !== 'undefined' && f instanceof File) return true;
    // Check for wrapped file
    if (f && f.file && typeof File !== 'undefined' && f.file instanceof File) return true;
    // Fallback: duck-type for File-like objects
    if (f && typeof f.name === 'string' && typeof f.size === 'number' && typeof f.type === 'string') return true;
    return false;
  };

  const logFormData = (fd, label = 'FormData') => {
    try {
      console.log(`[DEBUG] ${label} entries:`);
      for (const pair of fd.entries()) {
        const [k, v] = pair;
        if (v instanceof File) {
          console.log(k, 'File ->', v.name, v.size, v.type);
        } else {
          console.log(k, v);
        }
      }
    } catch (e) {
      console.log('[DEBUG] failed to log FormData', e);
    }
  };

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/products');
      console.log('fetchProducts raw data:', data);
      if (Array.isArray(data)) {
        const mapped = data.map(mapProductFromApi);
        console.log('fetchProducts mapped products:', mapped);
        setProducts(mapped);
        // Load variant counts for visible products so the list shows counts immediately
        fetchVariantCountsForProducts(mapped).catch(e => console.warn('fetchVariantCountsForProducts failed', e));
      } else if (data && data.content) {
        const mapped = data.content.map(mapProductFromApi);
        console.log('fetchProducts mapped products (paged):', mapped);
        setProducts(mapped);
        // Load variant counts for visible products so the list shows counts immediately
        fetchVariantCountsForProducts(mapped).catch(e => console.warn('fetchVariantCountsForProducts failed', e));
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err);
      console.error('Fetch products error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch variant counts for a list of products and populate variantCountsMap.
  // This runs in small batches to avoid flooding the backend with too many concurrent requests.
  const fetchVariantCountsForProducts = async (productsList) => {
    if (!Array.isArray(productsList) || productsList.length === 0) return;
    const batchSize = 8; // concurrent requests per batch
    const counts = {};
    for (let i = 0; i < productsList.length; i += batchSize) {
      const batch = productsList.slice(i, i + batchSize);
      await Promise.all(batch.map(async (p) => {
        try {
          const resp = await api.get(`/api/bien-the-san-pham/san-pham/${p.id}`);
          counts[p.id] = Array.isArray(resp) ? resp.length : Number(p.soLuongBienThe || 0);
        } catch (e) {
          // fallback to stored value on error
          console.warn(`Failed to load variants for product ${p.id}`, e?.message || e);
          counts[p.id] = Number(p.soLuongBienThe || 0);
        }
      }));
    }
    // merge into state
    setVariantCountsMap(prev => ({ ...prev, ...counts }));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
    fetchCollections();
  }, [fetchProducts]);

  const fetchCategories = async () => {
    try {
      const data = await api.get('/api/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch categories error', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await api.get('/api/suppliers');
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch suppliers error', err);
    }
  };

  const fetchCollections = async () => {
    try {
      const data = await api.get('/api/collections');
      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch collections error', err);
    }
  };

  const fetchProductVariants = async (maSanPham) => {
    try {
      const data = await api.get(`/api/bien-the-san-pham/san-pham/${maSanPham}`);
      setProductVariants(Array.isArray(data) ? data : []);
      // update counts map so list view can reflect loaded counts
      if (Array.isArray(data)) {
        setVariantCountsMap(prev => ({ ...prev, [maSanPham]: data.length }));
      }
    } catch (err) {
      console.error('Fetch variants error', err);
      setProductVariants([]);
    }
  };

  // Lightweight attribute loader used when we only need attribute names for display
  const fetchAttributesSilent = async () => {
    setAttrLoading(true);
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
    } catch (e) {
      console.warn('fetchAttributesSilent failed', e?.message || e);
    } finally {
      setAttrLoading(false);
    }
  };

  // Compute the number of variants for a product. Prefer live `productVariants` if it matches the product.
  const computeVariantCount = (product) => {
    if (!product) return 0;
    // Prefer an explicit count we stored when variants were fetched
    if (variantCountsMap && variantCountsMap[product.id] != null) return Number(variantCountsMap[product.id]);
    // If the currently selected product matches and we have productVariants loaded, use that
    if (selectedProduct && product.id === selectedProduct.id && Array.isArray(productVariants)) {
      return productVariants.length;
    }
    // Fallback to the stored count on product object
    return Number(product.soLuongBienThe || 0);
  };

  const handleAddProduct = async () => {
    const formData = new FormData();

    // Add product data - ensure required fields are always sent
    formData.append('tenSanPham', productForm.tenSanPham);
    formData.append('maNhaCungCap', productForm.maNhaCungCap);

    // Add optional fields if they have values
    if (productForm.moTa) {
      formData.append('moTa', productForm.moTa);
    }
    if (productForm.maDanhMuc) {
      formData.append('maDanhMuc', productForm.maDanhMuc);
    }
    if (productForm.maBoSuuTap) {
      formData.append('maBoSuuTap', productForm.maBoSuuTap);
    }
    // bonus points
    if (productForm.diemThuong != null) {
      formData.append('diemThuong', String(productForm.diemThuong));
    }

    // Add images (append array-style keys so Spring can bind to Integer[] / Boolean[])
    // Only append real File-like images. Let the backend assign thuTu and laAnhChinh (first image becomes main).
    // Debug: print productImages array shape and types
    console.debug('[DEBUG] handleAddProduct - productImages.length=', Array.isArray(productImages) ? productImages.length : 0);
    productImages.forEach((file, i) => {
      console.debug(`[DEBUG] handleAddProduct - productImages[${i}] type:`, file && file.constructor ? file.constructor.name : typeof file, 'keys:', file && typeof file === 'object' ? Object.keys(file) : undefined);
      if (isFileLike(file)) {
        // If file is wrapped, unwrap
        const f = file.file || file;
        formData.append('images', f);
      }
    });

    // Log FormData (shows File entries with name/size/type)
    logFormData(formData, 'Creating product with images');

    try {
      const created = await api.post('/api/products/with-images', { body: formData });

      // If server response is partial (no images or timestamps), fetch full product
      let finalCreated = created;
      if (created && ((!created.hinhAnhs || created.hinhAnhs.length === 0) || !created.ngayTao || !created.ngayCapNhat)) {
        try {
          console.debug('[DEBUG] create response missing images/timestamps, refetching product', created?.maSanPham || created?.id);
          const id = created?.maSanPham || created?.id;
          if (id) {
            const refreshed = await api.get(`/api/products/${id}`);
            if (refreshed) finalCreated = refreshed;
          }
        } catch (refetchErr) {
          console.warn('Failed to refetch product after create', refetchErr);
        }
      }

      const createdMapped = mapProductFromApi(finalCreated);
      setProducts(prev => [...prev, createdMapped]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Add product error', err);
      setError(err);
    }
  };

  const handleEditProduct = async () => {
    try {
      const payload = mapProductToApi(productForm);

      // First, update the product JSON fields
      let updatedProduct = null;
      try {
        updatedProduct = await api.put(`/api/products/${selectedProduct.id}`, { body: payload });
      } catch (jsonErr) {
        // If the single-field update fails, still try to continue to image upload if needed
        console.warn('PUT /api/products failed, will still try image upload if present', jsonErr?.message || jsonErr);
      }

      // If there are any File-like objects in productImages, upload them
      const hasFileObjects = Array.isArray(productImages) && productImages.some(f => f && ((typeof File !== 'undefined' && f instanceof File) || (f.name && typeof f.size === 'number')));
      if (hasFileObjects) {
        const formData = new FormData();
        // include product JSON fields so server can associate
        formData.append('maSanPham', selectedProduct.id);
        formData.append('tenSanPham', productForm.tenSanPham);
        if (productForm.moTa) formData.append('moTa', productForm.moTa);
        if (productForm.maDanhMuc) formData.append('maDanhMuc', productForm.maDanhMuc);
        if (productForm.maBoSuuTap) formData.append('maBoSuuTap', productForm.maBoSuuTap);
        if (productForm.maNhaCungCap) formData.append('maNhaCungCap', productForm.maNhaCungCap);
        if (productForm.diemThuong != null) formData.append('diemThuong', String(productForm.diemThuong));

        // Debug: print productImages array and each entry's runtime details
        console.debug('[DEBUG] handleEditProduct - productImages.length=', Array.isArray(productImages) ? productImages.length : 0);
        productImages.forEach((file, index) => {
          console.debug(`[DEBUG] handleEditProduct - productImages[${index}] type:`, file && file.constructor ? file.constructor.name : typeof file, 'keys:', file && typeof file === 'object' ? Object.keys(file) : undefined);
          // only append File-like objects
          if (file && ((typeof File !== 'undefined' && file instanceof File) || (file.name && typeof file.size === 'number'))) {
            if (isFileLike(file)) {
              const f = file.file || file;
              formData.append('images', f);
            }
          }
        });

        // Try a dedicated images upload endpoint first, then fallback to a with-images update endpoint
        try {
          // Debug: log FormData contents so we can verify files are attached
          logFormData(formData, `Uploading images for product ${selectedProduct?.id}`);
          // Upload files to the product images upload endpoint
          const imgResp = await api.post(`/api/products/${selectedProduct.id}/images/upload`, { body: formData });
          if (imgResp) updatedProduct = imgResp;
        } catch (imgErr1) {
          console.error('Image upload failed for product', selectedProduct?.id, imgErr1);
          // don't throw — product fields may have been updated above
        }
      }

      // Update UI using server response when available, otherwise merge local changes
      if (updatedProduct) {
        // If the upload endpoint returned a partial object (no hinhAnhs or timestamps), fetch the full product
        if ((!updatedProduct.hinhAnhs || updatedProduct.hinhAnhs.length === 0) || !updatedProduct.ngayTao || !updatedProduct.ngayCapNhat) {
          try {
            console.debug('[DEBUG] upload response missing images/timestamps, fetching full product', selectedProduct?.id);
            const refreshed = await api.get(`/api/products/${selectedProduct.id}`);
            if (refreshed) updatedProduct = refreshed;
          } catch (refetchErr) {
            console.warn('Failed to refetch product after upload', refetchErr);
          }
        }
        const mapped = mapProductFromApi(updatedProduct);
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, ...mapped } : p));
      } else {
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, ...productForm } : p));
      }

      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
    } catch (err) {
      console.error('Edit product error', err);
      setError(err);
    }
  };

  const handleDeleteProduct = (maybeIdOrObj) => {
    let product = null;
    if (!maybeIdOrObj) return;
    if (typeof maybeIdOrObj === 'object') {
      product = maybeIdOrObj;
    } else {
      product = products.find(p => p.id === maybeIdOrObj || p.maSanPham === maybeIdOrObj);
    }
    if (!product) {
      console.warn('Could not find product to delete for', maybeIdOrObj);
      return;
    }
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await api.del(`/api/products/${productToDelete.id}`);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Delete product error', err);
      setError(err);
    }
  };

  const handleViewProduct = async (product) => {
    setSelectedProduct(product);
    setProductForm({
      tenSanPham: product.tenSanPham,
      moTa: product.moTa,
      maDanhMuc: product.maDanhMuc,
      maNhaCungCap: product.maNhaCungCap,
      maBoSuuTap: product.maBoSuuTap
    });
    // Normalize images coming from API so FileUpload can render them reliably
    const normalized = (product.hinhAnhs || []).map((h, idx) => ({
      maHinhAnh: h.maHinhAnh || h.id,
      duongDanHinhAnh: h.duongDanHinhAnh || h.url || h.path,
      thuTu: h.thuTu != null ? h.thuTu : idx,
      laAnhChinh: !!h.laAnhChinh,
      moTa: h.moTa || h.description || ''
    }));
    setProductImages(normalized);
    await fetchProductVariants(product.id);
    // Ensure attribute names are loaded so variant attribute display shows names
    await fetchAttributesSilent();
    setShowDetailModal(true);
    setActiveTab('info');
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setProductForm({
      tenSanPham: product.tenSanPham,
      moTa: product.moTa,
      maDanhMuc: product.maDanhMuc,
      maNhaCungCap: product.maNhaCungCap,
      maBoSuuTap: product.maBoSuuTap
    });
    // Normalize images for edit modal too
    const normalized = (product.hinhAnhs || []).map((h, idx) => ({
      maHinhAnh: h.maHinhAnh || h.id,
      duongDanHinhAnh: h.duongDanHinhAnh || h.url || h.path,
      thuTu: h.thuTu != null ? h.thuTu : idx,
      laAnhChinh: !!h.laAnhChinh,
      moTa: h.moTa || h.description || ''
    }));
    setProductImages(normalized);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setProductForm({
      tenSanPham: '',
      moTa: '',
      maDanhMuc: '',
      maNhaCungCap: '',
      maBoSuuTap: ''
    });
    setProductImages([]);
  };

  const handleImageUpload = (files) => {
    const newFiles = Array.isArray(files) ? files : [files];
    console.debug('[DEBUG] handleImageUpload - received', newFiles.length, 'files');
    setProductImages(prev => {
      const merged = [...(Array.isArray(prev) ? prev : []), ...newFiles];
      // If no image is currently marked main, mark the first found (either existing laAnhChinh or new file)
      const hasMain = merged.some(i => !!(i.laAnhChinh || i._isMain || i.isMain || i.main));
      if (!hasMain && merged.length > 0) {
        // mark first new File as _isMain, preserve File prototype
        for (let i = 0; i < merged.length; i++) {
          const item = merged[i];
          if (item instanceof File) {
            Object.assign(item, { _isMain: true });
            break;
          }
          if (item && item.laAnhChinh) {
            // already server-marked
            break;
          }
        }
      }
      return merged;
    });
  };

  const handleImageRemove = (index) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleImageMain = (index) => {
    setProductImages(prev => {
      if (!Array.isArray(prev)) return prev;
      // Don't spread File objects - just mark the index, we'll handle laAnhChinh at upload time
      // Store main index separately or use array index order (first = main)
      return prev.map((img, i) => {
        // If img is a File, attach a custom property without spreading
        if (img instanceof File) {
          // Create a wrapper that preserves the File
          return Object.assign(img, { _isMain: i === index });
        }
        // For existing image objects (from server), spread is fine
        return { ...img, laAnhChinh: i === index };
      });
    });
  };

  // --- Variant Management Logic ---

  const resetVariantForm = () => {
    setVariantForm({
      tenBienThe: '',
      sku: '',
      giaMua: '',
      giaBan: '',
      soLuongTon: '',
      moTa: ''
    });
  };

  const handleAddVariant = () => {
    // Open add-variant modal and load attributes+values
    if (!selectedProduct) {
      console.error('Cannot add variant: no product selected');
      return;
    }
    resetVariantForm();
    setBulkVariantsPreview([]);
    setVariantSelections({});

    // fetch attributes and their values (shows add modal after load)
    fetchAttributes(true);
  };
  const fetchAttributes = async (openForAdd = true, variantForPrefill = null) => {
    setAttrLoading(true);
    setAttrError(null);
    try {
      const attrs = await api.get('/api/attributes');
      if (!Array.isArray(attrs)) {
        setAttributes([]);
      } else {
        // Load values for each attribute by querying the product-variants endpoint (server provides variant attribute values there).
        // This avoids the per-attribute endpoint which may return 500. We still keep /api/attribute-values as a last-resort fallback.
        // Use product-variant endpoint as the sole source of attribute values.
        let variantsValues = [];
        try {
          if (selectedProduct && selectedProduct.id != null) {
            const resp = await api.get(`/api/bien-the-san-pham/san-pham/${selectedProduct.id}`);
            console.log('fetchProducts data end:', resp);
            variantsValues = Array.isArray(resp) ? resp : [];
          }
        } catch (e) {
          console.warn('Failed to load variant-values from /api/bien-the-san-pham/san-pham/{id}', e?.message || e);
          variantsValues = [];
        }
        // Debug: show raw variantsValues retrieved for this product
        console.debug('[DEBUG] fetchAttributes - variantsValues for product', selectedProduct?.id, variantsValues);

        // If we are editing a specific variant and the caller provided the variant data (variantForPrefill),
        // prefer constructing the attributes list from that single-variant's mappings so the edit UI shows
        // exactly the attribute:value pairs present on that variant (avoids aggregating values across all product variants).
        let loaded;
        if (!openForAdd && variantForPrefill) {
          // Accept many possible shapes returned by the server for a single variant (including bienTheThuocTinhs)
          const mappingCandidates =
            variantForPrefill.thuocTinhGiaTriTuDo ||
            variantForPrefill.bienTheThuocTinhs ||
            variantForPrefill.giaTriThuocTinhs ||
            variantForPrefill.thuocTinh ||
            variantForPrefill.thuocTinhMappings ||
            [];
          // Normalize mapping entries to { maThuocTinh, giaTri }
          const norm = (Array.isArray(mappingCandidates) ? mappingCandidates : []).map(m => {
            // Support nested shapes like { bienTheThuocTinhs: [{ thuocTinh: { maThuocTinh }, giaTri: { giaTri } }] }
            if (!m) return null;
            // If mapping itself is a wrapper containing an array
            if (Array.isArray(m.bienTheThuocTinhs || m.thuocTinhMappings || m.mappings)) {
              // extract first entry for normalization (we'll flatten below for list-based flows)
              const first = (m.bienTheThuocTinhs || m.thuocTinhMappings || m.mappings)[0] || {};
              return { maThuocTinh: first.maThuocTinh ?? first.thuocTinh?.maThuocTinh ?? first.thuocTinh?.id ?? first.attributeId ?? first.ma, giaTri: first.giaTri ?? first.giaTri?.giaTri ?? first.tenGiaTri ?? first.value ?? first.name };
            }
            // Direct mapping shapes
            return { maThuocTinh: m.maThuocTinh ?? m.attributeId ?? m.ma ?? m.thuocTinh?.maThuocTinh ?? m.thuocTinh?.id, giaTri: m.giaTri ?? m.giaTri?.giaTri ?? m.tenGiaTri ?? m.value ?? m.name };
          }).filter(Boolean);
          console.debug('[DEBUG] fetchAttributes - variantForPrefill mappingCandidates normalized (norm):', norm, 'variantForPrefill:', variantForPrefill);

          // Build attributes only for mapped attribute IDs, using metadata from attrs when available
          loaded = (norm || []).map((m) => {
            const attrId = m.maThuocTinh;
            const meta = attrs.find(a => String(a.maThuocTinh || a.id) === String(attrId)) || {};
            const val = { id: String(m.giaTri ?? ''), tenGiaTri: String(m.giaTri ?? ''), raw: m };
            return { id: attrId, tenThuocTinh: meta.tenThuocTinh || meta.name || meta.label || String(attrId), values: [val], raw: meta };
          });

          // Also include any attribute metadata that might be useful but not present in the variant mapping
          // (keeps attribute order stable). Append attributes from attrs that were not in the variant mapping but
          // include an empty values array so selection UI still renders if needed.
          const mappedIds = new Set((norm || []).map(m => String(m.maThuocTinh)));
          for (const a of attrs) {
            const aId = a.maThuocTinh || a.id;
            if (!mappedIds.has(String(aId))) {
              loaded.push({ id: aId, tenThuocTinh: a.tenThuocTinh || a.name || a.label || String(aId), values: [], raw: a });
            }
          }
        } else {
          // Previous behavior: aggregate textual values across all product variants
          loaded = await Promise.all(attrs.map(async (a) => {
            const attrId = a.maThuocTinh || a.id;
            const mapVals = (vals) => (Array.isArray(vals) ? vals.map(v => ({
              id: v.maGiaTriThuocTinh || v.id,
              tenGiaTri: v.giaTri || v.tenGiaTri || v.tenGiaTriThuocTinh || v.name || v.value || String(v.id || v.maGiaTriThuocTinh),
              raw: v
            })) : []);

            // variantsValues is a list of variant objects; each variant may contain thuocTinhGiaTriTuDo: [{ maThuocTinh, giaTri }]
            // Flatten those mappings and use them as attribute values (textual values)
            let flatMappings = [];
            if (Array.isArray(variantsValues)) {
              for (const variantItem of variantsValues) {
                if (!variantItem) continue;
                // variant may store mappings under different keys - try several possible fields (including bienTheThuocTinhs)
                const candidate = variantItem.thuocTinhGiaTriTuDo || variantItem.thuocTinhGiaTriTuDos || variantItem.thuocTinh || variantItem.thuocTinhMappings || variantItem.bienTheThuocTinhs || variantItem.giaTriThuocTinhs || null;
                if (Array.isArray(candidate)) {
                  for (const m of candidate) {
                    if (!m) continue;
                    // m may be { maThuocTinh, giaTri } or { thuocTinh: { maThuocTinh, ... }, giaTri }
                    const extractedMa = m.maThuocTinh ?? m.attributeId ?? m.ma ?? (m.thuocTinh && (m.thuocTinh.maThuocTinh ?? m.thuocTinh.id ?? m.thuocTinh.ma)) ?? null;
                    const extractedVal = m.giaTri ?? (typeof m.giaTri === 'object' ? (m.giaTri.giaTri ?? m.giaTri.value ?? '') : null) ?? m.tenGiaTri ?? m.value ?? m.name;
                    if (extractedMa != null) {
                      flatMappings.push({ maThuocTinh: extractedMa, giaTri: extractedVal });
                    }
                  }
                }
              }
            }
            // Debug: per-attribute collected flatMappings
            console.debug('[DEBUG] fetchAttributes - attrId', attrId, 'flatMappings:', flatMappings.slice(0, 20));

            const filtered = flatMappings.filter(m => String(m.maThuocTinh) === String(attrId));
            // map to value objects
            const mappedVals = (filtered || []).map((m, idx) => ({ id: String(m.giaTri ?? `val-${idx}`), tenGiaTri: String(m.giaTri ?? ''), raw: m }));
            return { id: attrId, tenThuocTinh: a.tenThuocTinh || a.name || a.label || String(attrId), values: mapVals(mappedVals), raw: a };
          }));
        }

        setAttributes(loaded);

        // Prefill selections when editing. Accept an explicit variantForPrefill to avoid race with setState.
        if (!openForAdd) {
          const variantToUse = variantForPrefill || selectedVariant;
          if (variantToUse) {
            const pre = {};

            // legacy numeric IDs
            if (Array.isArray(variantToUse.giaTriThuocTinhIds) && variantToUse.giaTriThuocTinhIds.length > 0) {
              for (const attr of loaded) {
                const aKey = String(attr.id || attr.maThuocTinh);
                const vals = (attr.values || []).map(v => String(v.id || v.maGiaTriThuocTinh));
                const selectedForAttr = (variantToUse.giaTriThuocTinhIds || []).map(String).filter(id => vals.includes(id));
                if (selectedForAttr.length > 0) pre[aKey] = selectedForAttr;
              }
            }

            // free-text mappings
            if (Array.isArray(variantToUse.thuocTinhGiaTriTuDo) && variantToUse.thuocTinhGiaTriTuDo.length > 0) {
              for (const mapping of variantToUse.thuocTinhGiaTriTuDo) {
                const aKey = String(mapping.maThuocTinh);
                pre[aKey] = Array.isArray(pre[aKey]) ? [...pre[aKey], String(mapping.giaTri)] : [String(mapping.giaTri)];
              }
            }

            setVariantSelections(pre);
            // If the variant has free-text mappings (thuocTinhGiaTriTuDo) populate explicitRows,
            // otherwise clear explicitRows to avoid showing mappings left over from previous edits.
            if (Array.isArray(variantToUse.thuocTinhGiaTriTuDo) && variantToUse.thuocTinhGiaTriTuDo.length > 0) {
              const rows = variantToUse.thuocTinhGiaTriTuDo.map(m => ({ maThuocTinh: m.maThuocTinh, giaTri: m.giaTri }));
              setExplicitRows(rows);
            } else {
              setExplicitRows([]);
            }
          }
        }
      }
    } catch (err) {
      console.error('Load attributes error', err);
      setAttributes([]);
      setAttrError(err?.message || 'Lỗi tải thuộc tính');
    } finally {
      setAttrLoading(false);
      if (openForAdd) setShowAddVariantModal(true); else setShowEditVariantModal(true);
    }
  };

  // Sửa lỗi: Đảm bảo logic thêm/xóa ID trong mảng trạng thái
  const toggleSelection = (attributeId, valueId) => {
    const aKey = String(attributeId);
    const vKey = String(valueId);
    setVariantSelections(prev => {
      const next = { ...prev };
      const current = Array.isArray(next[aKey]) ? next[aKey].slice() : [];
      const idx = current.indexOf(vKey);
      if (idx >= 0) current.splice(idx, 1); else current.push(vKey);
      next[aKey] = current;
      // clear bulk preview when selection changes
      setBulkVariantsPreview([]);
      return next;
    });
  };

  // Helper: generate cartesian product of arrays of values (value objects)
  const cartesian = (arrays) => {
    return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]]);
  };

  const handleGenerateBulk = () => {
    if (useExplicitRows) {
      // Build preview directly from explicitRows: one variant per row
      const rows = explicitRows.filter(r => r && r.maThuocTinh && String(r.giaTri || '').trim() !== '');
      if (rows.length === 0) { alert('Vui lòng thêm ít nhất một cặp Thuộc tính:Giá trị'); return; }
      const preview = rows.map((r, idx) => ({
        id: `preview-exp-${idx}`,
        thuocTinhMappings: [{ maThuocTinh: Number(r.maThuocTinh), giaTri: String(r.giaTri).trim() }],
        labels: String(r.giaTri).trim(),
        sku: variantForm.sku || '',
        giaMua: variantForm.giaMua || 0,
        giaBan: variantForm.giaBan || 0,
        soLuongTon: parseInt(variantForm.soLuongTon || 0),
        mucTonToiThieu: variantForm.mucTonToiThieu || undefined
      }));
      setBulkVariantsPreview(preview);
      return;
    }

    // Build selected arrays from textual inputs (variantSelections stores arrays of strings)
    const selectedArrays = attributes.map(attr => {
      const aKey = String(attr.id || attr.maThuocTinh);
      const selVals = variantSelections[aKey] || [];
      // Each selVals entry is a free-text value (may be empty string when newly added)
      return selVals.filter(v => v != null && String(v).trim() !== '').map(v => ({ maThuocTinh: attr.id || attr.maThuocTinh, giaTri: String(v).trim(), label: String(v).trim() }));
    }).filter(arr => arr.length > 0);

    if (selectedArrays.length === 0) {
      alert('Vui lòng nhập ít nhất một giá trị thuộc tính để tạo biến thể hàng loạt');
      return;
    }

    const combos = cartesian(selectedArrays);
    const preview = combos.map((combo, idx) => ({
      id: `preview-${idx}`,
      // keep preview values as strings to match selection state
      giaTriTexts: combo.map(v => v.giaTri),
      thuocTinhMappings: combo.map(v => ({ maThuocTinh: v.maThuocTinh, giaTri: v.giaTri })),
      labels: combo.map(v => v.label).join(' / '),
      sku: variantForm.sku || '', // Use default from form
      giaMua: variantForm.giaMua || 0, // Use default from form
      giaBan: variantForm.giaBan || 0, // Use default from form
      soLuongTon: parseInt(variantForm.soLuongTon || 0),
      mucTonToiThieu: variantForm.mucTonToiThieu || undefined
    }));
    setBulkVariantsPreview(preview);

  };

  const handleCreateBulk = async () => {
    if (!selectedProduct) return;
    if (bulkVariantsPreview.length === 0) return;

    try {
      const bulkPayloads = bulkVariantsPreview.map(item => ({
        maSanPham: selectedProduct.id,
        sku: item.sku || `AUTO-${Math.random().toString(36).slice(2, 8)}`,
        giaMua: item.giaMua ? Number(item.giaMua) : 0,
        giaBan: item.giaBan ? Number(item.giaBan) : 0,
        soLuongTon: parseInt(item.soLuongTon || 0),
        mucTonToiThieu: item.mucTonToiThieu != null ? Number(item.mucTonToiThieu) : undefined,
        // send free-text attribute values mappings so backend can create attribute values if needed
        thuocTinhGiaTriTuDo: item.thuocTinhMappings || [],
        tenBienThe: item.labels
      }));

      for (const payload of bulkPayloads) {
        await api.post(`/api/bien-the-san-pham/san-pham/${selectedProduct.id}`, { body: payload });
      }

      // refresh variants
      await fetchProductVariants(selectedProduct.id);
      setShowAddVariantModal(false);
      setBulkVariantsPreview([]);
      resetVariantForm();

      // Update the product count in the main list
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, soLuongBienThe: p.soLuongBienThe + bulkPayloads.length } : p));
      setVariantCountsMap(prev => ({ ...prev, [selectedProduct.id]: (Number(prev[selectedProduct.id] || selectedProduct.soLuongBienThe || 0) + bulkPayloads.length) }));

    } catch (err) {
      console.error('Bulk create error', err);
      setError(err);
    }
  };

  const handleCreateSingleFromSelection = async () => {
    if (!selectedProduct) return;
    // Build thuocTinhGiaTriTuDo from textual inputs in variantSelections
    const mappings = [];
    for (const attr of attributes) {
      const aKey = String(attr.id || attr.maThuocTinh);
      const sel = variantSelections[aKey] || [];

      if (sel.length > 1) {
        alert('Vui lòng chỉ nhập 1 giá trị trên mỗi thuộc tính để tạo biến thể đơn.');
        return;
      }

      if (sel.length === 1 && String(sel[0]).trim() !== '') {
        mappings.push({ maThuocTinh: attr.id || attr.maThuocTinh, giaTri: String(sel[0]).trim() });
      }
    }

    if (mappings.length === 0) { alert('Vui lòng nhập ít nhất một giá trị thuộc tính'); return; }

    // Build label from mappings
    const labels = mappings.map(m => m.giaTri).join(' / ');

    try {
      const payload = {
        maSanPham: selectedProduct.id,
        tenBienThe: variantForm.tenBienThe || labels,
        sku: variantForm.sku || `AUTO-${Math.random().toString(36).slice(2, 8)}`,
        moTa: variantForm.moTa,
        giaMua: variantForm.giaMua ? Number(variantForm.giaMua) : 0,
        giaBan: variantForm.giaBan ? Number(variantForm.giaBan) : 0,
        soLuongTon: parseInt(variantForm.soLuongTon || 0),
        mucTonToiThieu: variantForm.mucTonToiThieu != null ? Number(variantForm.mucTonToiThieu) : undefined,
        // include free-text attribute values for server to create/persist
        thuocTinhGiaTriTuDo: mappings
      };

      const created = await api.post(`/api/bien-the-san-pham/san-pham/${selectedProduct.id}`, { body: payload });
      setProductVariants(prev => [...prev, created]);
      setShowAddVariantModal(false);
      resetVariantForm();

      // Update the product count in the main list
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, soLuongBienThe: p.soLuongBienThe + 1 } : p));
      setVariantCountsMap(prev => ({ ...prev, [selectedProduct.id]: (Number(prev[selectedProduct.id] || selectedProduct.soLuongBienThe || 0) + 1) }));

    } catch (err) {
      console.error('Create single variant error', err);
      setError(err);
    }
  };


  const handleEditVariant = (variant) => {
    // Fetch the authoritative variant data from server to get thuocTinhGiaTriTuDo
    (async () => {
      try {
        const id = variant.id || variant.maBienThe || variant.ma;
        const full = await api.get(`/api/bien-the-san-pham/${id}`);
        const variantData = full || variant;
        console.debug('[DEBUG] handleEditVariant - fetched variantData:', variantData);
        setSelectedVariant(variantData);
        setVariantForm({
          tenBienThe: variantData.tenBienThe || '',
          sku: variantData.sku || '',
          giaMua: variantData.giaMua || '',
          giaBan: variantData.giaBan || '',
          soLuongTon: variantData.soLuongTon || '',
          moTa: variantData.moTa || ''
        });
        // reset selections before prefill
        setVariantSelections({});
        // Load attributes and pre-fill selections from the server-provided variant
        fetchAttributes(false, variantData);
      } catch (err) {
        console.warn('Failed to fetch full variant for edit, falling back to provided object', err?.message || err);
        setSelectedVariant(variant);
        setVariantForm({
          tenBienThe: variant.tenBienThe || '',
          sku: variant.sku || '',
          giaMua: variant.giaMua || '',
          giaBan: variant.giaBan || '',
          soLuongTon: variant.soLuongTon || '',
          moTa: variant.moTa || ''
        });
        fetchAttributes(false, variant);
      }
    })();
  };

  // Renamed from handleSaveVariant to clarify it only handles updates
  const handleUpdateVariant = async () => {
    if (!selectedVariant) {
      console.error('No selected variant for update');
      return;
    }

    try {
      const payload = {
        tenBienThe: variantForm.tenBienThe, // Include optional fields in update payload
        sku: variantForm.sku,
        moTa: variantForm.moTa,
        maSanPham: selectedProduct.id,
        giaMua: parseFloat(variantForm.giaMua) || 0,
        giaBan: parseFloat(variantForm.giaBan) || 0,
        soLuongTon: parseInt(variantForm.soLuongTon) || 0,
        mucTonToiThieu: variantForm.mucTonToiThieu ? Number(variantForm.mucTonToiThieu) : undefined
      };

      // If explicitRows (free-text mappings) exist (we loaded them for edit), prefer sending them directly
      if (Array.isArray(explicitRows) && explicitRows.length > 0) {
        const mappings = explicitRows.map(r => ({ maThuocTinh: Number(r.maThuocTinh), giaTri: String(r.giaTri) }));
        payload.thuocTinhGiaTriTuDo = mappings;
      } else {
        // If variantSelections contains textual (non-numeric) entries, send them as thuocTinhGiaTriTuDo
        const allSelected = Object.values(variantSelections).flat();
        const textual = allSelected.filter(v => isNaN(Number(v)) || String(v).trim() === '').map(v => String(v));
        if (textual.length > 0) {
          // build mappings from attributes state
          const mappings = [];
          for (const attr of attributes) {
            const aKey = String(attr.id || attr.maThuocTinh);
            const sel = variantSelections[aKey] || [];
            for (const s of sel) {
              if (String(s).trim() !== '') mappings.push({ maThuocTinh: attr.id || attr.maThuocTinh, giaTri: String(s).trim() });
            }
          }
          if (mappings.length > 0) payload.thuocTinhGiaTriTuDo = mappings;
        } else {
          // Otherwise preserve numeric ids for backward compatibility
          payload.giaTriThuocTinhIds = Array.from(new Set(Object.values(variantSelections).flat().map(id => Number(id))));
        }
      }

      // Determine variant id robustly (server may use different id field names)
      const variantId = selectedVariant?.id ?? selectedVariant?.maBienThe ?? selectedVariant?.ma ?? selectedVariant?.maBienTheId ?? null;
      if (!variantId) {
        console.error('Cannot determine variant id for update', selectedVariant);
        setError(new Error('Không xác định được ID biến thể'));
        return;
      }

      await api.put(`/api/bien-the-san-pham/${variantId}/variant`, { body: payload });

      // Update the productVariants state with the new data (match by computed id)
      setProductVariants(prev => prev.map(v => (String(v.id) === String(variantId) || String(v.maBienThe) === String(variantId) ? { ...v, ...payload } : v)));

      setShowEditVariantModal(false);
      setSelectedVariant(null);
      resetVariantForm();
    } catch (err) {
      console.error('Update variant error', err);
      setError(err);
    }
  };

  const handleDeleteVariant = (variant) => {
    setVariantToDelete(variant);
    setShowDeleteVariantConfirm(true);
  };

  const confirmDeleteVariant = async () => {
    if (!variantToDelete) return;

    try {
      const delId = variantToDelete?.id ?? variantToDelete?.maBienThe ?? variantToDelete?.ma ?? variantToDelete?.maBienTheId ?? null;
      if (!delId) {
        console.error('Cannot determine variant id for delete', variantToDelete);
        setError(new Error('Không xác định được ID biến thể để xóa'));
        return;
      }

      await api.del(`/api/bien-the-san-pham/${delId}`);
      setProductVariants(prev => prev.filter(v => !(String(v.id) === String(delId) || String(v.maBienThe) === String(delId))));
      setShowDeleteVariantConfirm(false);
      setVariantToDelete(null);
    } catch (err) {
      console.error('Delete variant error', err);
      setError(err);
    }
  };

  // --- End Variant Management Logic ---

  const filteredProducts = products.filter(product => {
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      const match = (product.tenSanPham || '').toLowerCase().includes(q) ||
        (product.tenDanhMuc || 'chưa phân loại').toLowerCase().includes(q) ||
        (product.tenNhaCungCap || 'chưa phân loại').toLowerCase().includes(q) ||
        (product.tenBoSuuTap || 'chưa phân loại').toLowerCase().includes(q);
      if (!match) return false;
    }

    // category filter
    if (filterCategory) {
      const catId = String(filterCategory);
      const prodCat = String(product.maDanhMuc || (product.danhMuc && (product.danhMuc.maDanhMuc || product.danhMuc.id)) || '');
      if (prodCat !== catId) return false;
    }

    // collection filter
    if (filterCollection) {
      const colId = String(filterCollection);
      const prodCol = String(product.maBoSuuTap || (product.boSuuTap && (product.boSuuTap.maBoSuuTap || product.boSuuTap.id)) || '');
      if (prodCol !== colId) return false;
    }

    // supplier filter
    if (filterSupplier) {
      const supId = String(filterSupplier);
      const prodSup = String(product.maNhaCungCap || (product.nhaCungCap && (product.nhaCungCap.maNhaCungCap || product.nhaCungCap.id)) || '');
      if (prodSup !== supId) return false;
    }

    return true;
  });

  const columns = [
    { field: 'tenSanPham', header: 'Tên sản phẩm', sortable: true },
    { field: (p) => (p.tenDanhMuc || (p.danhMuc && (p.danhMuc.tenDanhMuc || p.danhMuc.name || p.danhMuc.name)) || (p.category && (p.category.name || p.category.tenDanhMuc)) || ''), header: 'Danh mục', sortable: true },
    { field: (p) => (p.tenNhaCungCap || (p.nhaCungCap && (p.nhaCungCap.tenNhaCungCap || p.nhaCungCap.name)) || (p.supplier && (p.supplier.name || p.supplier.tenNhaCungCap)) || ''), header: 'Nhà cung cấp', sortable: true },
    { field: (p) => (p.tenBoSuuTap || (p.boSuuTap && (p.boSuuTap.tenBoSuuTap || p.boSuuTap.name)) || ''), header: 'Bộ sưu tập', sortable: true },
    { field: (p) => computeVariantCount(p), header: 'Biến thể', sortable: true },
    {
      field: 'trangThai', header: 'Trạng thái', sortable: true, render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Hoạt động' : 'Ngừng'}
        </span>
      )
    }
  ];

  const tabs = [
    { id: 'info', label: '🏷️ Thông tin chung', icon: IoPricetag },
    { id: 'images', label: '🖼️ Hình ảnh', icon: IoImage },
    { id: 'variants', label: '🧬 Biến thể', icon: IoCube }
  ];

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-100 text-red-700 rounded">
          Lỗi: {String(error)}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
              title="Xem dạng danh sách"
            >
              <IoList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
              title="Xem dạng lưới"
            >
              <IoGrid className="w-5 h-5" />
            </button>
          </div>

          {/* Filters: Category, Collection, Supplier */}
          <div className="flex items-center space-x-2">
            <select className="p-2 border rounded" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">Tất cả danh mục</option>
              {categories.map(c => (
                <option key={c.maDanhMuc || c.id} value={c.maDanhMuc || c.id}>{c.tenDanhMuc || c.name}</option>
              ))}
            </select>
            <select className="p-2 border rounded" value={filterCollection} onChange={e => setFilterCollection(e.target.value)}>
              <option value="">Tất cả bộ sưu tập</option>
              {collections.map(col => (
                <option key={col.maBoSuuTap || col.id} value={col.maBoSuuTap || col.id}>{col.tenBoSuuTap || col.name}</option>
              ))}
            </select>
            <select className="p-2 border rounded" value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}>
              <option value="">Tất cả nhà cung cấp</option>
              {suppliers.map(s => (
                <option key={s.maNhaCungCap || s.id} value={s.maNhaCungCap || s.id}>{s.tenNhaCungCap || s.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => { setShowAddModal(true); resetForm(); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <IoAdd className="w-5 h-5" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <DataTable
          data={filteredProducts}
          columns={columns}
          onView={handleViewProduct}
          onEdit={handleEditClick}
          onDelete={handleDeleteProduct}
          searchable={true}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={isLoading}
        />
      ) : (
        <div className="space-y-6">
          {/* Search Bar for Grid View */}
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    {product.hinhAnhs && product.hinhAnhs.length > 0 ? (
                      <img
                        src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}${product.hinhAnhs[0].duongDanHinhAnh}`}
                        alt={product.tenSanPham}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <IoImage className="w-12 h-12" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.trangThai
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {product.trangThai ? 'Hoạt động' : 'Ngừng'}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 overflow-hidden"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.5em',
                        maxHeight: '3em'
                      }}>
                      {product.tenSanPham}
                    </h3>

                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p><span className="font-medium">Danh mục:</span> {product.tenDanhMuc || 'Chưa phân loại'}</p>
                      <p><span className="font-medium">Nhà cung cấp:</span> {product.tenNhaCungCap}</p>
                      <p><span className="font-medium">Biến thể:</span> {computeVariantCount(product)} loại</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => handleEditClick(product)}
                        className="flex-1 bg-yellow-50 text-yellow-600 px-3 py-2 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <IoCube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc thêm sản phẩm mới.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Thêm sản phẩm mới"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              value={productForm.tenSanPham}
              onChange={(e) => setProductForm(prev => ({ ...prev, tenSanPham: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={productForm.moTa}
              onChange={(e) => setProductForm(prev => ({ ...prev, moTa: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Danh mục</label>
              <select
                value={productForm.maDanhMuc}
                onChange={(e) => setProductForm(prev => ({ ...prev, maDanhMuc: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.maDanhMuc || cat.id} value={cat.maDanhMuc || cat.id}>
                    {cat.tenDanhMuc || cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nhà cung cấp *</label>
              <select
                value={productForm.maNhaCungCap}
                onChange={(e) => setProductForm(prev => ({ ...prev, maNhaCungCap: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map(sup => (
                  <option key={sup.maNhaCungCap || sup.id} value={sup.maNhaCungCap || sup.id}>
                    {sup.tenNhaCungCap || sup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bộ sưu tập</label>
            <select
              value={productForm.maBoSuuTap}
              onChange={(e) => setProductForm(prev => ({ ...prev, maBoSuuTap: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Chọn bộ sưu tập</option>
              {collections.map(col => (
                <option key={col.maBoSuuTap || col.id} value={col.maBoSuuTap || col.id}>
                  {col.tenBoSuuTap || col.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Điểm thưởng (Diem thuong)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={productForm.diemThuong ?? 0}
              onChange={(e) => setProductForm(prev => ({ ...prev, diemThuong: Number(e.target.value) || 0 }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hình ảnh</label>
            <FileUpload
              multiple={true}
              accept="image/*"
              onUpload={handleImageUpload}
              files={productImages}
              onRemove={handleImageRemove}
              onToggleMain={handleToggleImageMain}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleAddProduct}
              disabled={!productForm.tenSanPham || !productForm.maNhaCungCap}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Thêm sản phẩm
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedProduct(null); resetForm(); }}
        title="Chỉnh sửa sản phẩm"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              value={productForm.tenSanPham}
              onChange={(e) => setProductForm(prev => ({ ...prev, tenSanPham: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={productForm.moTa}
              onChange={(e) => setProductForm(prev => ({ ...prev, moTa: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Danh mục</label>
              <select
                value={productForm.maDanhMuc}
                onChange={(e) => setProductForm(prev => ({ ...prev, maDanhMuc: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.maDanhMuc || cat.id} value={cat.maDanhMuc || cat.id}>
                    {cat.tenDanhMuc || cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nhà cung cấp *</label>
              <select
                value={productForm.maNhaCungCap}
                onChange={(e) => setProductForm(prev => ({ ...prev, maNhaCungCap: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map(sup => (
                  <option key={sup.maNhaCungCap || sup.id} value={sup.maNhaCungCap || sup.id}>
                    {sup.tenNhaCungCap || sup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bộ sưu tập</label>
            <select
              value={productForm.maBoSuuTap}
              onChange={(e) => setProductForm(prev => ({ ...prev, maBoSuuTap: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Chọn bộ sưu tập</option>
              {collections.map(col => (
                <option key={col.maBoSuuTap || col.id} value={col.maBoSuuTap || col.id}>
                  {col.tenBoSuuTap || col.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Điểm thưởng (Diem thuong)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={productForm.diemThuong ?? 0}
              onChange={(e) => setProductForm(prev => ({ ...prev, diemThuong: Number(e.target.value) || 0 }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hình ảnh</label>
            <FileUpload
              multiple={true}
              accept="image/*"
              onUpload={handleImageUpload}
              files={productImages}
              onRemove={handleImageRemove}
              onToggleMain={handleToggleImageMain}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => { setShowEditModal(false); setSelectedProduct(null); resetForm(); }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleEditProduct}
              disabled={!productForm.tenSanPham || !productForm.maNhaCungCap}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Product Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedProduct(null); resetForm(); }}
        title={`Chi tiết sản phẩm: ${selectedProduct?.tenSanPham}`}
        size="xl"
      >
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct?.tenSanPham}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct?.tenDanhMuc || 'Chưa phân loại'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nhà cung cấp</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct?.tenNhaCungCap}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bộ sưu tập</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct?.tenBoSuuTap || 'Chưa phân loại'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số lượng biến thể</label>
                  <p className="mt-1 text-sm text-gray-900">{computeVariantCount(selectedProduct)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${selectedProduct?.trangThai ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedProduct?.trangThai ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Điểm thưởng</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct?.diemThuong != null ? String(selectedProduct.diemThuong).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <p className="mt-1 text-sm text-gray-900">{selectedProduct?.moTa || 'Không có mô tả'}</p>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hình ảnh sản phẩm</h3>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    // open edit modal pre-filled so user can upload/remove images
                    if (selectedProduct) {
                      setProductForm({
                        tenSanPham: selectedProduct.tenSanPham || '',
                        moTa: selectedProduct.moTa || '',
                        maDanhMuc: selectedProduct.maDanhMuc || '',
                        maNhaCungCap: selectedProduct.maNhaCungCap || '',
                        maBoSuuTap: selectedProduct.maBoSuuTap || ''
                      });
                      setProductImages(selectedProduct.hinhAnhs || []);
                      setShowEditModal(true);
                    }
                  }}
                  className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
                >
                  Sửa hình ảnh
                </button>
              </div>
              {selectedProduct?.hinhAnhs && selectedProduct.hinhAnhs.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedProduct.hinhAnhs.map((image, index) => (
                    <div key={image.maHinhAnh || index} className="relative">
                      <img
                        src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}${image.duongDanHinhAnh}`}
                        alt={image.moTa || `Ảnh ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {image.laAnhChinh && (
                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Ảnh chính
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        Thứ tự: {image.thuTu}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Chưa có hình ảnh nào</p>
              )}
            </div>
          )}

          {activeTab === 'variants' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Biến thể sản phẩm</h3>
                <button
                  onClick={handleAddVariant}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
                >
                  Thêm biến thể
                </button>
              </div>
              {productVariants.length > 0 ? (
                <div className="space-y-2">
                  {productVariants.map(variant => (
                    <div key={variant.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{variant.tenBienThe || `Biến thể ${variant.id}`}</h4>
                          <p className="text-sm text-gray-600">SKU: {variant.sku}</p>
                          <p className="text-sm text-gray-600">Giá bán: {variant.giaBan ? variant.giaBan.toLocaleString('vi-VN') + ' VNĐ' : 'Chưa thiết lập'}</p>
                          <p className="text-sm text-gray-600">Tồn kho: {variant.soLuongTon || 0}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => { setSelectedVariant(variant); setShowDetailModal(true); setActiveTab('variants'); }}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => handleEditVariant(variant)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteVariant(variant)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>

                      {/* Attributes display */}
                      <div className="mt-3">
                        <h5 className="text-sm font-medium mb-2">Thuộc tính</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {(() => {
                            const mappings = variant.bienTheThuocTinhs || variant.thuocTinhGiaTriTuDo || variant.thuocTinhGiaTriTuDos || variant.thuocTinh || variant.thuocTinhMappings || [];
                            if (!Array.isArray(mappings) || mappings.length === 0) {
                              return <p className="text-gray-500 col-span-2">Chưa có thuộc tính nào</p>;
                            }
                            return mappings.map((m, idx) => {
                              // m may be { id, thuocTinh: { maThuocTinh, tenThuocTinh }, giaTri }
                              const ma = m.maThuocTinh ?? (m.thuocTinh && (m.thuocTinh.maThuocTinh ?? m.thuocTinh.id)) ?? m.attributeId ?? m.ma ?? null;
                              const value = m.giaTri ?? (m.giaTri && typeof m.giaTri === 'object' ? (m.giaTri.giaTri ?? m.giaTri.value) : null) ?? m.tenGiaTri ?? m.value ?? m.name ?? '';
                              const attrObj = attributes.find(a => String(a.id ?? a.maThuocTinh) === String(ma));
                              const attrName = attrObj ? (attrObj.tenThuocTinh || attrObj.name) : ((m.thuocTinh && (m.thuocTinh.tenThuocTinh || m.thuocTinh.name)) || m.tenThuocTinh || `Thuộc tính ${ma}`);
                              return (
                                <div key={`${variant.id}-attr-${idx}`} className="p-2 border rounded-md bg-gray-50">
                                  <div className="text-xs text-gray-600">{attrName}</div>
                                  <div className="text-sm font-medium">{String(value)}</div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Chưa có biến thể nào</p>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setProductToDelete(null); }}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc muốn xóa sản phẩm "{productToDelete?.tenSanPham}"?
          </p>
          <p className="text-sm text-gray-500">
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => { setShowDeleteConfirm(false); setProductToDelete(null); }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={confirmDeleteProduct}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>

      {/* --- NEW VARIANT CREATION MODAL (Selection & Bulk) --- */}
      <Modal
        isOpen={showAddVariantModal}
        onClose={() => {
          setShowAddVariantModal(false);
          resetVariantForm();
          setBulkVariantsPreview([]);
          setVariantSelections({});
        }}
        title={`Thêm biến thể mới cho: ${selectedProduct?.tenSanPham}`}
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Chọn giá trị thuộc tính để tạo biến thể. Bạn có thể tạo **biến thể đơn** (chọn tối đa 1 giá trị/thuộc tính) hoặc **biến thể hàng loạt** (tổ hợp).</p>

          {/* Common Variant Fields for Single Creation (Optional for bulk) */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <h4 className="font-semibold text-blue-700 mb-2">Thông tin cơ bản (Áp dụng cho biến thể đơn hoặc làm giá trị mặc định cho hàng loạt)</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={variantForm.sku}
                  onChange={(e) => setVariantForm(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giá mua (VNĐ)</label>
                <input
                  type="number"
                  value={variantForm.giaMua}
                  onChange={(e) => setVariantForm(prev => ({ ...prev, giaMua: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  min="0" step="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giá bán (VNĐ)</label>
                <input
                  type="number"
                  value={variantForm.giaBan}
                  onChange={(e) => setVariantForm(prev => ({ ...prev, giaBan: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  min="0" step="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số lượng tồn</label>
                <input
                  type="number"
                  value={variantForm.soLuongTon}
                  onChange={(e) => setVariantForm(prev => ({ ...prev, soLuongTon: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mức tồn tối thiểu</label>
                <input
                  type="number"
                  value={variantForm.mucTonToiThieu}
                  onChange={(e) => setVariantForm(prev => ({ ...prev, mucTonToiThieu: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Attributes Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Chế độ thêm giá trị</h4>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="mode" checked={!useExplicitRows} onChange={() => setUseExplicitRows(false)} />
                  <span>Chế độ tổ hợp (mặc định)</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="mode" checked={useExplicitRows} onChange={() => setUseExplicitRows(true)} />
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
                <h4 className="font-medium">Chọn giá trị thuộc tính</h4>
                <div className="space-y-3">
                  {useExplicitRows && (
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
                    const isSelected = variantSelections[aKey] && variantSelections[aKey].length > 0;

                    return (
                      <div key={`attr-panel-${attr.id ?? attr.maThuocTinh ?? ai}`} className="border-2 p-4 rounded-lg bg-gray-50">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Chọn thuộc tính: khởi tạo với giá trị rỗng
                                setVariantSelections(prev => ({ ...prev, [aKey]: [''] }));
                              } else {
                                // Bỏ chọn: xóa thuộc tính
                                setVariantSelections(prev => {
                                  const next = { ...prev };
                                  delete next[aKey];
                                  return next;
                                });
                              }
                            }}
                            className="w-5 h-5 mt-1 cursor-pointer"
                          />
                          <div className="flex-1">
                            <label className="font-semibold text-gray-700 cursor-pointer select-none">
                              {attr.tenThuocTinh}
                            </label>
                            {isSelected && (
                              <div className="mt-2 space-y-2">
                                {(variantSelections[aKey] || []).map((valText, index) => (
                                  <div key={`val-${aKey}-${index}`} className="flex items-center gap-2">
                                    {String(valText).trim() === '' ? (
                                      <input
                                        type="text"
                                        value={valText}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setVariantSelections(prev => {
                                            const next = { ...prev };
                                            const arr = Array.isArray(next[aKey]) ? next[aKey].slice() : [];
                                            arr[index] = value;
                                            next[aKey] = arr;
                                            return next;
                                          });
                                        }}
                                        placeholder={`Nhập giá trị cho ${attr.tenThuocTinh} (VD: Đỏ, 120cm, v.v.)`}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                    ) : (
                                      <div className="flex-1">
                                        <span className="block p-2 border border-gray-200 rounded bg-gray-50 text-gray-800">{valText}</span>
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // remove this specific input/value
                                        setVariantSelections(prev => {
                                          const next = { ...prev };
                                          const arr = Array.isArray(next[aKey]) ? next[aKey].slice() : [];
                                          arr.splice(index, 1);
                                          if (arr.length === 0) delete next[aKey]; else next[aKey] = arr;
                                          return next;
                                        });
                                      }}
                                      className="px-2 py-1 bg-red-50 text-red-600 border rounded hover:bg-red-100"
                                    >X</button>
                                  </div>
                                ))}

                                <div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVariantSelections(prev => {
                                        const next = { ...prev };
                                        const arr = Array.isArray(next[aKey]) ? next[aKey].slice() : [];
                                        arr.push('');
                                        next[aKey] = arr;
                                        return next;
                                      });
                                    }}
                                    className="mt-1 px-3 py-1 bg-green-50 text-green-700 border rounded hover:bg-green-100"
                                  >+ Thêm giá trị</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-start space-x-2 border-t pt-3 mt-3">
                  <button
                    onClick={handleCreateSingleFromSelection}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    // Logic: Disable if NO attributes selected OR if ANY attribute has > 1 value selected
                    disabled={
                      Object.values(variantSelections).every(arr => arr.length === 0) ||
                      Object.values(variantSelections).some(arr => arr.length > 1)
                    }
                  >
                    Tạo biến thể đơn
                  </button>
                  <button
                    onClick={handleGenerateBulk}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-800"
                    disabled={Object.values(variantSelections).every(arr => arr.length === 0)}
                  >
                    Tạo xem trước hàng loạt
                  </button>
                  {bulkVariantsPreview.length > 0 && (
                    <button onClick={handleCreateBulk} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Tạo {bulkVariantsPreview.length} biến thể hàng loạt</button>
                  )}
                </div>


                {/* Bulk preview editable */}
                {bulkVariantsPreview && bulkVariantsPreview.length > 0 && (
                  <div className="mt-3 max-h-64 overflow-auto border rounded">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-50 border-b">
                        <tr>
                          <th className="p-2 text-left w-1/4">Biến thể</th>
                          <th className="p-2 w-1/5">SKU</th>
                          <th className="p-2 w-1/5">Giá mua</th>
                          <th className="p-2 w-1/5">Giá bán</th>
                          <th className="p-2 w-1/6">Tồn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkVariantsPreview.map((row, idx) => (
                          <tr key={row.id} className="border-t hover:bg-gray-50">
                            <td className="p-2 max-w-xs overflow-hidden text-ellipsis">{row.labels}</td>
                            <td className="p-2">
                              <input
                                value={row.sku}
                                placeholder="Tự động nếu trống"
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setBulkVariantsPreview(prev => prev.map((r, i) => i === idx ? { ...r, sku: v } : r));
                                }}
                                className="w-full p-1 border rounded text-right"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={row.giaMua}
                                onChange={(e) => {
                                  const v = e.target.value; setBulkVariantsPreview(prev => prev.map((r, i) => i === idx ? { ...r, giaMua: v } : r));
                                }}
                                className="w-full p-1 border rounded text-right"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={row.giaBan}
                                onChange={(e) => {
                                  const v = e.target.value; setBulkVariantsPreview(prev => prev.map((r, i) => i === idx ? { ...r, giaBan: v } : r));
                                }}
                                className="w-full p-1 border rounded text-right"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={row.soLuongTon}
                                onChange={(e) => {
                                  const v = e.target.value; setBulkVariantsPreview(prev => prev.map((r, i) => i === idx ? { ...r, soLuongTon: v } : r));
                                }}
                                className="w-full p-1 border rounded text-right"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* --- EDIT VARIANT MODAL (Details Only) --- */}
      <Modal
        isOpen={showEditVariantModal}
        onClose={() => { setShowEditVariantModal(false); setSelectedVariant(null); resetVariantForm(); }}
        title={`Chỉnh sửa biến thể: ${selectedVariant?.tenBienThe || 'Không tên'}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên biến thể</label>
            <input
              type="text"
              value={variantForm.tenBienThe}
              onChange={(e) => setVariantForm(prev => ({ ...prev, tenBienThe: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SKU *</label>
            <input
              type="text"
              value={variantForm.sku}
              onChange={(e) => setVariantForm(prev => ({ ...prev, sku: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Giá mua (VNĐ)</label>
              <input
                type="number"
                value={variantForm.giaMua}
                onChange={(e) => setVariantForm(prev => ({ ...prev, giaMua: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Giá bán (VNĐ)</label>
              <input
                type="number"
                value={variantForm.giaBan}
                onChange={(e) => setVariantForm(prev => ({ ...prev, giaBan: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Số lượng tồn</label>
              <input
                type="number"
                value={variantForm.soLuongTon}
                onChange={(e) => setVariantForm(prev => ({ ...prev, soLuongTon: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={variantForm.moTa}
              onChange={(e) => setVariantForm(prev => ({ ...prev, moTa: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          {/* Editable attributes selection for editing a variant */}
          {attrLoading ? (
            <div className="py-4 text-center text-gray-600">Đang tải thuộc tính...</div>
          ) : attrError ? (
            <div className="p-4 bg-red-50 border rounded">
              <p className="text-sm text-red-700 mb-2">Lỗi khi tải thuộc tính: {attrError}</p>
              <div className="flex justify-end">
                <button onClick={() => fetchAttributes(false)} className="px-3 py-1 bg-blue-600 text-white rounded">Tải lại</button>
              </div>
            </div>
          ) : (!attributes || attributes.length === 0) ? (
            <div className="p-4 text-gray-600">Chưa có thuộc tính nào.</div>
          ) : (
            // If explicitRows were loaded (editing a variant created via explicit rows), show a simplified editor
            (Array.isArray(explicitRows) && explicitRows.length > 0) ? (
              <div className="p-4 border-2 border-gray-200 rounded-lg bg-white space-y-3">
                <h4 className="font-semibold">Chỉnh sửa các cặp Thuộc tính:Giá trị</h4>
                <div className="space-y-2">
                  {explicitRows.map((r, idx) => (
                    <div key={`edit-er-${idx}`} className="flex items-center gap-2">
                      <select value={r.maThuocTinh || ''} onChange={(e) => {
                        const v = e.target.value;
                        setExplicitRows(prev => prev.map((row, i) => i === idx ? { ...row, maThuocTinh: v } : row));
                      }} className="p-2 border rounded">
                        <option value="">-- Chọn thuộc tính --</option>
                        {attributes.map((a, ai) => (
                          <option key={a.id ?? a.maThuocTinh ?? `attr-${ai}`} value={a.id ?? a.maThuocTinh}>{a.tenThuocTinh}</option>
                        ))}
                      </select>
                      <input type="text" value={r.giaTri || ''} onChange={(e) => {
                        const v = e.target.value;
                        setExplicitRows(prev => prev.map((row, i) => i === idx ? { ...row, giaTri: v } : row));
                      }} placeholder="Giá trị (VD: Đỏ)" className="flex-1 p-2 border rounded" />
                      <button type="button" onClick={() => setExplicitRows(prev => prev.filter((_, i) => i !== idx))} className="px-2 py-1 bg-red-50 text-red-600 rounded">X</button>
                    </div>
                  ))}
                  <div>
                    <button type="button" onClick={() => setExplicitRows(prev => [...prev, { maThuocTinh: '', giaTri: '' }])} className="px-3 py-1 bg-green-50 text-green-700 rounded">+ Thêm mapping</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 border-2 border-gray-200 p-4 rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-700">Thuộc tính</h4>
                <div className="space-y-3">
                  {attributes.map((attr, ai) => (
                    <div key={attr.id ?? attr.maThuocTinh ?? `attr-panel-${ai}`} className="p-3 border-2 border-gray-300 rounded-lg bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-gray-700">{attr.tenThuocTinh}</div>
                        <div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                // compute attribute key the same way other code uses it
                                const aKey = String(attr.id ?? attr.maThuocTinh ?? attr.ma ?? '');
                                if (!aKey) return;

                                // If we have a selectedVariant with mapping entries, try to delete those mapping rows by id
                                const variantId = selectedVariant?.id ?? selectedVariant?.maBienThe ?? selectedVariant?.ma ?? null;
                                if (variantId && selectedVariant && Array.isArray(selectedVariant.bienTheThuocTinhs)) {
                                  const mappingsForAttr = selectedVariant.bienTheThuocTinhs.filter(btt => {
                                    const tId = btt?.thuocTinh?.maThuocTinh ?? btt?.thuocTinh?.id ?? btt?.thuocTinh;
                                    return String(tId) === String(attr.id ?? attr.maThuocTinh);
                                  });
                                  // delete each mapping row by its id if available
                                  for (const m of mappingsForAttr) {
                                    const mappingId = m?.id;
                                    if (mappingId) {
                                      await api.del(`/api/bien-the-san-pham/thuoc-tinh/${mappingId}`);
                                    }
                                  }
                                }

                                // remove from variantSelections locally
                                setVariantSelections(prev => {
                                  const next = { ...prev };
                                  if (next[aKey]) delete next[aKey];
                                  return next;
                                });
                                // also remove explicit rows that reference this attribute
                                setExplicitRows(prev => (Array.isArray(prev) ? prev.filter(r => String(r.maThuocTinh) !== aKey) : prev));

                                // If selectedVariant exists, refresh its detail DTO from server to reflect DB state
                                if (selectedVariant && (selectedVariant.id || selectedVariant.maBienThe || selectedVariant.ma)) {
                                  const id = selectedVariant.id || selectedVariant.maBienThe || selectedVariant.ma;
                                  try {
                                    // Use the detail endpoint which returns the ThuocTinhBienTheResponse list
                                    const freshDetail = await api.get(`/api/bien-the-san-pham/${id}/chi-tiet`);
                                    if (freshDetail) {
                                      // replace selectedVariant with the authoritative DTO
                                      setSelectedVariant(freshDetail);
                                      // re-run attribute prefill using fetched variant detail so UI lists update
                                      try {
                                        await fetchAttributes(false, freshDetail);
                                      } catch (prefillErr) {
                                        console.warn('Failed to re-prefill attributes after mapping delete', prefillErr);
                                      }
                                    }
                                  } catch (refreshErr) {
                                    // ignore refresh errors but log a warning
                                    console.warn('Failed to refresh variant detail after deleting mapping', refreshErr);
                                  }
                                }
                              } catch (err) {
                                console.error('Failed to delete variant attribute mapping', err);
                                alert('Không thể xóa thuộc tính trên server: ' + (err?.message || 'Lỗi'));
                              }
                            }}
                            className="px-2 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                            title={`Xóa thuộc tính ${attr.tenThuocTinh} khỏi biến thể`}
                          >
                            Xóa thuộc tính
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {/* Always show input + datalist to allow typing or selecting existing values */}
                        <div className="flex items-center gap-2">
                          <select
                            value={attrLastAdded[String(attr.id || attr.maThuocTinh) || ''] || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              const k = String(attr.id || attr.maThuocTinh);
                              setAttrLastAdded(prev => ({ ...prev, [k]: v }));
                              setAttrTextInputs(prev => ({ ...prev, [k]: v }));
                            }}
                            className="p-2 border rounded flex-1"
                          >
                            <option value="">-- Chọn hoặc gõ giá trị --</option>
                            {(attr.values || []).map((v, i) => (
                              <option key={`attr-${attr.id ?? attr.maThuocTinh}-val-${String(v.id ?? i)}`} value={v.tenGiaTri}>{v.tenGiaTri}</option>
                            ))}
                          </select>

                          {/* Quick text input so admin can type a value directly */}
                          <input
                            type="text"
                            value={attrTextInputs[String(attr.id || attr.maThuocTinh)] || ''}
                            onChange={(e) => {
                              const k = String(attr.id || attr.maThuocTinh);
                              const v = e.target.value;
                              setAttrTextInputs(prev => ({ ...prev, [k]: v }));
                              setAttrLastAdded(prev => ({ ...prev, [k]: v }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const key = String(attr.id || attr.maThuocTinh);
                                const text = (attrTextInputs[key] || '').trim();
                                if (!text) return;
                                setVariantSelections(prev => {
                                  const cur = Array.isArray(prev[key]) ? prev[key].slice() : [];
                                  if (!cur.includes(String(text))) cur.push(String(text));
                                  setBulkVariantsPreview([]);
                                  return { ...prev, [key]: cur };
                                });
                                // add the new value into the attribute's values list so it appears immediately
                                setAttributes(prev => (Array.isArray(prev) ? prev.map(a => {
                                  const aId = String(a.id ?? a.maThuocTinh ?? '');
                                  if (aId !== key) return a;
                                  const exists = (a.values || []).some(v => String(v.tenGiaTri) === String(text) || String(v.id) === String(text));
                                  if (exists) return a;
                                  const newVal = { id: String(text), tenGiaTri: String(text), raw: { giaTri: text } };
                                  return { ...a, values: [...(a.values || []), newVal] };
                                }) : prev));
                                setAttrTextInputs(prev => ({ ...prev, [key]: '' }));
                                setAttrLastAdded(prev => ({ ...prev, [key]: '' }));
                              }
                            }}
                            placeholder={`Gõ nhanh giá trị cho ${attr.tenThuocTinh}`}
                            className="p-2 border rounded flex-1"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const key = String(attr.id || attr.maThuocTinh);
                              const text = (attrTextInputs[key] || '').trim();
                              if (!text) return;
                              // mark selection for this attribute (do not mutate attributes list)
                              setVariantSelections(prev => {
                                const cur = Array.isArray(prev[key]) ? prev[key].slice() : [];
                                // avoid duplicate
                                if (!cur.includes(String(text))) cur.push(String(text));
                                setBulkVariantsPreview([]);
                                return { ...prev, [key]: cur };
                              });
                              // also add to attributes list so it appears immediately
                              setAttributes(prev => (Array.isArray(prev) ? prev.map(a => {
                                const aId = String(a.id ?? a.maThuocTinh ?? '');
                                if (aId !== key) return a;
                                const exists = (a.values || []).some(v => String(v.tenGiaTri) === String(text) || String(v.id) === String(text));
                                if (exists) return a;
                                const newVal = { id: String(text), tenGiaTri: String(text), raw: { giaTri: text } };
                                return { ...a, values: [...(a.values || []), newVal] };
                              }) : prev));
                              // clear input and lastSelected
                              setAttrTextInputs(prev => ({ ...prev, [key]: '' }));
                              setAttrLastAdded(prev => ({ ...prev, [key]: '' }));
                            }}
                            className="px-3 py-1 bg-green-50 text-green-700 rounded"
                          >
                            Thêm
                          </button>
                        </div>

                        {/* Render existing values as selectable checkboxes */}
                        <div className="flex flex-wrap gap-2">
                          {(attr.values || []).map((val, vi) => {
                            const valId = String(val.id ?? vi);
                            const aKey = String(attr.id ?? attr.maThuocTinh ?? ai);
                            const selected = (variantSelections[aKey] || []).includes(valId);
                            return (
                              <label key={`val-${aKey}-${valId}-${vi}`} className={`px-3 py-2 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 select-none ${selected ? 'bg-blue-500 border-blue-600 text-white font-medium' : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                                <input type="checkbox" checked={selected} onChange={() => toggleSelection(aKey, valId)} className="w-4 h-4 cursor-pointer" />
                                <span>{val.tenGiaTri}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}


          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              onClick={() => { setShowEditVariantModal(false); setSelectedVariant(null); resetVariantForm(); }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleUpdateVariant}
              disabled={!variantForm.sku}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Variant Confirmation Modal */}
      <Modal
        isOpen={showDeleteVariantConfirm}
        onClose={() => { setShowDeleteVariantConfirm(false); setVariantToDelete(null); }}
        title="Xác nhận xóa biến thể"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Bạn có chắc muốn xóa biến thể "{variantToDelete?.tenBienThe}"?
          </p>
          <p className="text-sm text-gray-500">
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => { setShowDeleteVariantConfirm(false); setVariantToDelete(null); }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={confirmDeleteVariant}
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

export default ProductManagement;