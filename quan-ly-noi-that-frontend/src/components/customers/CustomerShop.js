import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearch, IoCart, IoHeart, IoStar, IoGrid, IoList, IoEye, IoChevronDown, IoChevronForward, IoFunnel } from 'react-icons/io5';
import CustomerProductDetail from './CustomerProductDetail';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getFavoritesKey, readFavoritesLocal, writeFavoritesLocal, readFavoritesWithLegacy } from '../../utils/favorites';

// --- (KHỞI TẠO VÀ LOGIC KHÔNG THAY ĐỔI) ---

const CustomerShop = () => {
  // GIỮ NGUYÊN TẤT CẢ STATE
  const [searchTerm, setSearchTerm] = useState('');
  // multi-select categories: empty array means 'all'
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState(null);
  const [apiCategories, setApiCategories] = useState([]);
  const [apiSuppliers, setApiSuppliers] = useState([]);
  // Giá min/max mặc định
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(999999999);
  const [categories, setCategories] = useState([
    { id: 'all', name: 'Tất cả', count: 0 }
  ]);
  const [products, setProducts] = useState([]);
  const productsRef = useRef(products);
  useEffect(() => { productsRef.current = products; }, [products]);
  const navigate = useNavigate();
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(true);
  const [isSupplierFilterOpen, setIsSupplierFilterOpen] = useState(true);
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(true);

  // -----------------------------------------------------
  // ********* GIỮ NGUYÊN CÁC HÀM LOGIC CŨ ************
  // mapProductFromApi, resolveImageUrl, useEffects, toggleFavorite, 
  // handleViewProduct, handleAddToCart, handleBackToShop, renderStars, 
  // handlePriceRangeChange, filteredProducts, formatPrice, resetFilters
  // (Logic được giữ nguyên từ phiên bản trước, chỉ tập trung vào JSX và CSS classes)
  // -----------------------------------------------------

  // Hàm mapProductFromApi (Giữ nguyên logic)
  const mapProductFromApi = (product) => {
    const rawPrice = product.giaBan ?? product.gia ?? product.price ?? product.gia_ban ?? 0;
    const rawOriginal = product.giaGoc ?? product.gia_goc ?? product.originalPrice ?? 0;
    const price = Number(rawPrice) || 0;
    const originalPrice = Number(rawOriginal) || 0;

    // pick main image from many possible shapes
    const rawImage = pickMainImage(product);

    const rawDiscountPercent = product.phanTramGiamGia ?? product.discountPercent ?? null;
    const explicitDiscountPercent = rawDiscountPercent != null ? Number(rawDiscountPercent) || 0 : null;
    let lowestVariantOverall = null;
    let lowestVariantDiscounted = null;
    try {
      const rawVariants = product.bienTheList ?? product.bienThe ?? product.variants ?? [];
      if (Array.isArray(rawVariants) && rawVariants.length > 0) {
        rawVariants.forEach(v => {
          const vPrice = Number(v.giaBan ?? v.gia ?? v.price ?? v.priceAfterDiscount ?? 0) || 0;
          const vOriginal = Number((v.giaGoc ?? v.gia_goc ?? v.originalPrice ?? originalPrice) || 0) || 0;
          let vDiscountPercent = v.phanTramGiamGia ?? v.discountPercent ?? null;
          vDiscountPercent = vDiscountPercent != null ? Number(vDiscountPercent) || 0 : 0;
          if ((!v.phanTramGiamGia && !v.discountPercent) && vOriginal > 0 && vPrice < vOriginal) {
            vDiscountPercent = Math.round(((vOriginal - vPrice) / vOriginal) * 100);
          }
          const vDiscountAmount = vOriginal > 0 && vPrice < vOriginal ? (vOriginal - vPrice) : 0;
          const finalPrice = vPrice;

          if (!lowestVariantOverall || finalPrice < lowestVariantOverall.finalPrice) {
            lowestVariantOverall = {
              id: v.maBienThe ?? v.id ?? v.variantId,
              name: v.tenBienThe ?? v.ten ?? v.name ?? null,
              price: vPrice,
              originalPrice: vOriginal,
              discountPercent: vDiscountPercent > 0 ? vDiscountPercent : null,
              discountAmount: vDiscountAmount,
              finalPrice
            };
          }

          const hasVariantDiscount = vDiscountAmount > 0 || (vDiscountPercent && vDiscountPercent > 0) || Boolean(v.priceAfterDiscount) || (vPrice < vOriginal && vOriginal > 0);
          if (hasVariantDiscount) {
            if (!lowestVariantDiscounted || finalPrice < lowestVariantDiscounted.finalPrice) {
              lowestVariantDiscounted = {
                id: v.maBienThe ?? v.id ?? v.variantId,
                name: v.tenBienThe ?? v.ten ?? v.name ?? null,
                price: vPrice,
                originalPrice: vOriginal,
                discountPercent: vDiscountPercent > 0 ? vDiscountPercent : null,
                discountAmount: vDiscountAmount,
                finalPrice
              };
            }
          }
        });
      }
    } catch (e) {
      lowestVariantOverall = null;
      lowestVariantDiscounted = null;
    }

    // If product itself has an originalPrice > price and no explicit discount percent,
    // compute a top-level discount percent so the UI can show it even when there are no variants.
    let topLevelDiscountPercent = explicitDiscountPercent;
    let topLevelDiscountAmount = 0;
    if ((topLevelDiscountPercent == null || topLevelDiscountPercent === 0) && originalPrice > 0 && price < originalPrice) {
      topLevelDiscountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
      topLevelDiscountAmount = Math.round(originalPrice - price);
    }

    // Normalize category (handle object returned as `category: { id, name }`)
    const catObj = product.category && typeof product.category === 'object' ? product.category : (product.danhMuc && typeof product.danhMuc === 'object' ? product.danhMuc : null);
    const normalizedCategoryId = catObj ? (catObj.id ?? catObj.maDanhMuc ?? catObj.maDanhMuc ?? null) : (product.maDanhMuc ?? product.danhMucId ?? null);
    const normalizedCategoryName = catObj ? (catObj.name ?? catObj.tenDanhMuc ?? '') : (product.tenDanhMuc ?? product.category ?? '');

    // Normalize supplier
    const supObj = product.supplier && typeof product.supplier === 'object' ? product.supplier : (product.nhaCungCap && typeof product.nhaCungCap === 'object' ? product.nhaCungCap : null);
    const normalizedSupplierId = supObj ? (supObj.id ?? supObj.maNhaCungCap ?? null) : (product.maNhaCungCap ?? product.supplierId ?? null);
    const normalizedSupplierName = supObj ? (supObj.name ?? supObj.tenNhaCungCap ?? '') : (product.tenNhaCungCap ?? product.supplier ?? null);

    return {
      id: product.maSanPham ?? product.id ?? product.productId,
      name: product.tenSanPham ?? product.ten ?? product.name ?? 'Sản phẩm',
      categoryId: normalizedCategoryId,
      category: normalizedCategoryName,
  // createdAt: backend may return several possible date fields
  createdAt: product.ngayTao || product.ngayTaoSanPham || product.createdAt || product.addedDate || product.created_at || null,
  // supplier info (may be absent in some APIs)
    supplierId: normalizedSupplierId,
  supplier: normalizedSupplierName,
      price,
      originalPrice,
      rating: Number(product.averageRating ?? product.danhGia ?? product.rating ?? product.review ?? product.reviews ?? 0) || 0,
      reviews: Number(product.reviewCount ?? product.soLuotDanhGia ?? product.soLuongDanhGia ?? product.reviews ?? product.review ?? 0) || 0,
      image: rawImage || null,
      inStock: Number(product.stockQuantity ?? product.tonKho ?? product.soLuongTonKho ?? 0) > 0,
      stockCount: Number(product.stockQuantity ?? product.tonKho ?? product.soLuongTonKho ?? 0) || 0,
      description: product.moTa ?? product.description ?? '',
      variants: (product.bienTheList || product.bienThe || []).map(variant => ({
        id: variant.maBienThe ?? variant.id,
        name: variant.tenBienThe ?? variant.ten ?? variant.name,
        price: Number(variant.giaBan ?? variant.gia ?? variant.price) || 0,
        inStock: Number(variant.tonKho ?? variant.soLuong ?? 0) > 0
      })),
      lowestVariantId: lowestVariantOverall?.id ?? null,
      lowestVariantName: lowestVariantOverall?.name ?? null,
      lowestVariantPrice: lowestVariantOverall?.price ?? null,
      lowestVariantOriginalPrice: lowestVariantOverall?.originalPrice ?? null,
      lowestVariantDiscountPercent: lowestVariantDiscounted?.discountPercent ?? null,
      lowestVariantDiscountAmount: lowestVariantDiscounted?.discountAmount ?? 0,
      lowestVariantFinalPrice: lowestVariantDiscounted?.finalPrice ?? null,
      discount: Number(topLevelDiscountPercent ?? lowestVariantDiscounted?.discountPercent ?? 0) || 0,
      discountPercent: (topLevelDiscountPercent ?? lowestVariantDiscounted?.discountPercent) > 0 ? (topLevelDiscountPercent ?? lowestVariantDiscounted?.discountPercent) : null,
      discountAmount: lowestVariantDiscounted ? (lowestVariantDiscounted.discountAmount ?? 0) : (topLevelDiscountAmount && topLevelDiscountAmount > 0 ? topLevelDiscountAmount : 0),
      isOnSale: Boolean(lowestVariantDiscounted) || ((topLevelDiscountPercent != null) && topLevelDiscountPercent > 0)
    };
  };

  // Hàm resolveImageUrl (Giữ nguyên logic)
  const resolveImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') {
      const s = img.trim();
      if (s === '/default-product.jpg' || s === 'default-product.jpg' || s === '/logo192.png' || s === 'logo192.png') return null;
      if (s.startsWith('http://') || s.startsWith('https://')) return s;
      return api.buildUrl(s);
    }
    if (img.duongDanHinhAnh) return resolveImageUrl(img.duongDanHinhAnh);
    return null;
  };

    // Helper: pick the best main image from a product DTO with many possible shapes
    const pickMainImage = (p) => {
      if (!p) return null;

      const tryArrayFirst = (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) return null;
        const first = arr.find(x => x != null);
        if (!first) return null;
        if (typeof first === 'string') return first;
        return first.duongDanHinhAnh ?? first.url ?? first.path ?? first.src ?? first;
      };

      let img = null;
      img = tryArrayFirst(p.hinhAnhs) || tryArrayFirst(p.danh_sach_hinh_anh) || tryArrayFirst(p.images) || tryArrayFirst(p.photos) || img;
      img = img || p.hinhAnh || p.image || p.coverImage || p.anhDaiDien || p.thumbnail || p.avatar || null;

      if (!img && p.hinhAnh && typeof p.hinhAnh === 'object') img = p.hinhAnh.duongDanHinhAnh ?? p.hinhAnh.url ?? null;
      if (!img && p.image && typeof p.image === 'object') img = p.image.url ?? p.image.path ?? null;

      try {
        const variants = p.bienTheList ?? p.bienThe ?? p.variants ?? [];
        if (!img && Array.isArray(variants)) {
          for (const v of variants) {
            if (!v) continue;
            const vImg = tryArrayFirst(v.hinhAnhs) || v.hinhAnh || v.image || (v.images && tryArrayFirst(v.images));
            if (vImg) { img = vImg; break; }
          }
        }
      } catch (e) { /* ignore */ }

      return img || null;
    };

  // Các useEffect để fetch data (GIỮ NGUYÊN)
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/products/shop');
        const data = response?.data ?? response;
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.content)) items = data.content;
        else if (Array.isArray(data.items)) items = data.items;
        const mapped = items.map(it => {
          if (it && (it.giaBan != null || it.gia != null || it.price != null)) {
            return mapProductFromApi(it);
          }
          // Logic mapping DTO...
          // fallback minimal mapping; include originalPrice and discount calculation so UI can show discount
          const fallbackPrice = Number(it.giaBan ?? it.price ?? 0) || 0;
          const fallbackOriginal = Number(it.giaGoc ?? it.gia_goc ?? it.originalPrice ?? 0) || 0;
          let fallbackDiscountPercent = null;
          if (fallbackOriginal > 0 && fallbackPrice < fallbackOriginal) {
            fallbackDiscountPercent = Math.round(((fallbackOriginal - fallbackPrice) / fallbackOriginal) * 100);
          }
          return {
            id: it.maSanPham ?? it.id ?? it.productId,
            name: it.tenSanPham ?? it.ten ?? it.name ?? 'Sản phẩm',
            categoryId: it.maDanhMuc ?? it.danhMuc?.maDanhMuc ?? null,
            category: it.tenDanhMuc ?? it.danhMuc?.tenDanhMuc ?? '',
            price: fallbackPrice,
            originalPrice: fallbackOriginal,
            lowestVariantFinalPrice: fallbackPrice,
            lowestVariantDiscountPercent: fallbackDiscountPercent,
            image: (it.hinhAnhs && it.hinhAnhs[0]) ? (it.hinhAnhs[0].duongDanHinhAnh ?? it.hinhAnhs[0]) : (it.hinhAnh ?? null),
            inStock: Number(it.stockQuantity ?? it.tongSoLuong ?? it.totalStock ?? 0) > 0,
            stockCount: Number(it.stockQuantity ?? it.tongSoLuong ?? it.totalStock ?? 0) || 0,
            description: it.moTa ?? it.description ?? '',
            variants: []
          };
        });
        setProducts(mapped);
        try { console.debug('[CustomerShop] mapped products (sample)', mapped.slice(0,20).map(p=>({ id: p.id, categoryId: p.categoryId, category: p.category, supplierId: p.supplierId, supplier: p.supplier, image: p.image }))); } catch(e){}
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    // ... loadFavorites logic ...
    let mounted = true;
    const loadFavorites = async () => {
      // ... logic giữ nguyên ...
      if (user) {
        // If we previously detected favorites API is broken, skip network call and fallback to localStorage
        if (window.__FAVORITES_API_BROKEN) {
          try {
            const arr = readFavoritesWithLegacy(user);
            const ids = Array.isArray(arr) ? arr.map(f => f.id ?? f.maSanPham).filter(Boolean) : [];
            if (mounted) {
              setFavorites(ids);
              try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: ids.length } })); } catch (e) {}
            }
            return;
          } catch (le) { if (mounted) setFavorites([]); return; }
        }

        try {
          const resp = await api.get('/favorites');
          const data = resp?.data ?? resp;
          if (!Array.isArray(data)) {
            if (mounted) setFavorites([]);
            return;
          }
          const ids = data.map(p => p.maSanPham ?? p.id ?? p.productId ?? p.productId ?? p.id).filter(Boolean);
          // persist per-user fallback copy locally so we don't mix users
          try { writeFavoritesLocal(user, ids.map(i=>({ id: i }))); } catch(e) {}
          if (mounted) {
            setFavorites(ids);
            try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: ids.length } })); } catch (e) { }
          }
          return;
        } catch (e) {
          console.debug('Favorites API not available on load', e);
          // mark global flag so other components fallback to localStorage
          try { window.__FAVORITES_API_BROKEN = true; } catch (err) {}
        }
      }
      try {
        const arr = readFavoritesLocal(user);
        const ids = Array.isArray(arr) ? arr.map(f => f.id ?? f.maSanPham).filter(Boolean) : [];
        if (mounted) {
          setFavorites(ids);
          try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: ids.length } })); } catch (e) { }
        }
      } catch (e) {
        if (mounted) setFavorites([]);
      }
    };
    loadFavorites();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    // ... fetchCategories logic ...
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        const data = response?.data ?? response;
        if (Array.isArray(data)) {
          const mappedCategories = data.map(cat => ({
            id: cat.maDanhMuc ?? cat.id ?? cat._id ?? (cat.tenDanhMuc ?? cat.name ?? cat.ten ?? ''),
            name: cat.tenDanhMuc ?? cat.name ?? cat.ten ?? '',
            count: cat.soLuongSanPham ?? cat.count ?? cat.productCount ?? 0
          }));
          setApiCategories(mappedCategories);
          try { console.debug('[CustomerShop] apiCategories', mappedCategories); } catch(e) {}
          setCategories([{ id: 'all', name: 'Tất cả', count: mappedCategories.reduce((sum, cat) => sum + cat.count, 0) }, ...mappedCategories]);
        }
      } catch (err) {
        console.error('Fetch categories error', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch suppliers so the customer shop can filter by supplier
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const resp = await api.get('/api/suppliers');
        const data = resp?.data ?? resp;
        if (Array.isArray(data)) {
          const mapped = data.map(s => ({
            // Be tolerant: if there's no explicit id, fallback to the supplier name so filters can still match
            id: s.maNhaCungCap ?? s.id ?? s.ma_nha_cung_cap ?? (s.tenNhaCungCap ?? s.name ?? s.ten_nha_cung_cap ?? ''),
            name: s.tenNhaCungCap ?? s.name ?? s.ten_nha_cung_cap ?? ''
          }));
          setApiSuppliers(mapped);
          try { console.debug('[CustomerShop] apiSuppliers', mapped); } catch(e) {}
        }
      } catch (err) {
        // ignore - suppliers endpoint may not exist on all deployments
        console.debug('Fetch suppliers error', err);
      }
    };
    fetchSuppliers();
  }, []);
  // multi-select suppliers: empty array means 'all'
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  // Mounted marker to confirm bundle is the latest and component runs
  useEffect(() => {
    try { console.debug('[CustomerShop] mounted'); } catch (e) { }
  }, []);

  useEffect(() => {
    // ... update category counts logic ...
    if (!products || products.length === 0) {
      if (apiCategories && apiCategories.length > 0) {
        const total = apiCategories.reduce((s, c) => s + (c.count || 0), 0);
        setCategories([{ id: 'all', name: 'Tất cả', count: total }, ...apiCategories]);
      } else {
        setCategories([{ id: 'all', name: 'Tất cả', count: 0 }]);
      }
      return;
    }

    const countsById = {};
    const countsByName = {};
    products.forEach(p => {
      const id = p.categoryId ?? null;
      const name = (p.category && p.category !== '') ? p.category : 'Khác';
      if (id) countsById[id] = (countsById[id] || 0) + 1;
      countsByName[name] = (countsByName[name] || 0) + 1;
    });

    let merged = [];
    if (apiCategories && apiCategories.length > 0) {
      merged = apiCategories.map(ac => ({
        id: ac.id,
        name: ac.name,
        count: countsById[ac.id] ?? ac.count ?? 0
      }));
      Object.keys(countsByName).forEach(name => {
        const exists = merged.some(m => m.name === name);
        if (!exists) merged.push({ id: name, name, count: countsByName[name] });
      });
    } else {
      merged = Object.keys(countsByName).map(name => ({ id: name, name, count: countsByName[name] }));
    }

    const total = products.length;
    setCategories([{ id: 'all', name: 'Tất cả', count: total }, ...merged]);
  }, [products, apiCategories]);

  // Logic filter/sort (GIỮ NGUYÊN)
  const filteredProducts = (() => {
    try { console.debug('[CustomerShop] filters selectedCategories, selectedSuppliers', selectedCategories, selectedSuppliers); } catch(e){}
    const term = (searchTerm || '').toString().toLowerCase();
    const getPrice = (p) => Number(p.lowestVariantFinalPrice ?? p.price ?? (p.priceRange && p.priceRange.min) ?? 0) || 0;

    const list = products.filter(product => {
      const name = (product.name || '').toString().toLowerCase();
      const matchesSearch = term === '' || name.includes(term);

      // category multi-select: if none selected -> all pass
        const selectedCats = Array.isArray(selectedCategories) ? selectedCategories.map(x => (x || '').toString().toLowerCase()).filter(Boolean) : [];
        let matchesCategory = false;
        if (selectedCats.length === 0) {
          matchesCategory = true;
        } else {
          const prodCatId = (product.categoryId ?? '').toString().toLowerCase();
          const prodCatName = (product.category ?? '').toString().toLowerCase();
          matchesCategory = selectedCats.some(sc => (prodCatId && prodCatId === sc) || (prodCatName && prodCatName === sc) || (prodCatName && prodCatName.includes(sc)));
        }

      const price = getPrice(product);
      const matchesPrice = (price >= minPrice) && (price <= maxPrice);

      // Supplier filter
      // supplier multi-select: empty => all
      const selectedSups = Array.isArray(selectedSuppliers) ? selectedSuppliers.map(x => (x || '').toString().toLowerCase()).filter(Boolean) : [];
      let matchesSupplier = false;
      if (selectedSups.length === 0) {
        matchesSupplier = true;
      } else {
        const prodSupplierId = product.supplierId ? String(product.supplierId).toLowerCase() : null;
        const prodSupplierName = product.supplier ? String(product.supplier).toLowerCase() : '';
        matchesSupplier = selectedSups.some(ss => (prodSupplierId && prodSupplierId === ss) || (prodSupplierName && prodSupplierName.includes(ss)));
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesSupplier;
    });

    const by = sortBy;
    if (by === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (by === 'price-low') {
      list.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (by === 'price-high') {
      list.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (by === 'rating') {
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (by === 'newest') {
      list.sort((a, b) => {
        const parseDate = (x) => {
          if (!x) return 0;
          const d = (typeof x === 'string' || typeof x === 'number') ? new Date(x) : x;
          const t = d instanceof Date && !isNaN(d.getTime()) ? d.getTime() : 0;
          return t;
        };
        const ta = parseDate(a.createdAt || a.addedDate || a.ngayTao || 0);
        const tb = parseDate(b.createdAt || b.addedDate || b.ngayTao || 0);
        return tb - ta;
      });
    }

    return list;
  })();

  // Định dạng giá (GIỮ NGUYÊN)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price).replace('₫', ' VNĐ');
  };

  // Hàm xử lý chọn khoảng giá (GIỮ NGUYÊN)
  const handlePriceRangeChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  // Hàm reset filter (GIỮ NGUYÊN)
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(999999999);
    setSortBy('newest');
  };

  // Hàm xử lý actions (GIỮ NGUYÊN)
  const toggleFavorite = async (productOrId) => {
    // productOrId may be an object or id
    const id = typeof productOrId === 'string' || typeof productOrId === 'number' ? productOrId : (productOrId && (productOrId.id ?? productOrId.maSanPham));
    if (!id) return;

    // require login
    if (!user) {
      // redirect to login page
      window.location.href = '/login';
      return;
    }

    // optimistic toggle locally (per-user)
    setFavorites(prev => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter(x => x !== id) : [...prev, id];
      try { writeFavoritesLocal(user, next.map(i=>({ id: i }))); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: next.length } })); } catch (e) {}
      return next;
    });

    // If favorites API is known broken, skip network call
    if (window.__FAVORITES_API_BROKEN) return;

    try {
      // toggle via API if available
      await api.post('/api/v1/yeu-thich/toggle', { maSanPham: id });
    } catch (e) {
      console.debug('Favorites toggle API failed, marking as broken', e);
      try { window.__FAVORITES_API_BROKEN = true; } catch (err) {}
      // ensure per-user copy is in localStorage
      try { const existing = readFavoritesLocal(user); const exists = existing.find(f => String(f.id) === String(id)); let nextArr; if (exists) nextArr = existing.filter(f => String(f.id) !== String(id)); else nextArr = [...existing, { id }]; writeFavoritesLocal(user, nextArr); } catch(e) {}
    }
  };

  const handleViewProduct = (product) => {
    if (!product) return;
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleAddToCart = (product) => {
    // Require login before allowing add to cart
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      // No explicit variant on listing page; add product as-is with default quantity 1
      const ok = addToCart(product, null, 1);
      if (ok !== false) {
        alert(`Đã thêm ${product.name || product.tenSanPham || 'sản phẩm'} vào giỏ hàng!`);
      }
    } catch (e) {
      console.error('Failed to add to cart', e);
      alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  const handleBackToShop = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };
  const renderStars = (rating) => { /* Logic giữ nguyên */ return Array.from({ length: 5 }, (_, i) => (<IoStar key={i} className={`w-4 h-4 ${i < Math.round(rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />)); };


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Bọc nội dung chính trong một container có width tối đa cố định (ví dụ: 1280px) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-1">
          <span className="hover:text-red-600 cursor-pointer transition-colors" onClick={() => navigate('/')}>Trang chủ</span>
          <IoChevronForward className="w-3 h-3 text-gray-400" />
          <span className="hover:text-red-600 cursor-pointer transition-colors">Danh mục</span>
          <IoChevronForward className="w-3 h-3 text-gray-400" />
          <span className="text-gray-900 font-medium">Tất cả sản phẩm</span>
        </div>

        {/* Main Content: Sidebar + Banner + Products */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar (Filter Column) - CỐ ĐỊNH WIDTH */}
          <aside className="lg:w-64 flex-shrink-0">

            {/* Search Bar (Di chuyển vào Sidebar) */}
            <div className="relative mb-6">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 transition-shadow"
              />
            </div>

            {/* Danh mục sản phẩm - Collapsible */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-6">
              <div
                className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none"
                onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
              >
                <h3 className="font-semibold text-gray-900">Danh mục sản phẩm</h3>
                <IoChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isCategoryFilterOpen ? 'rotate-180' : 'rotate-0'}`} />
              </div>
              {isCategoryFilterOpen && (
                <ul className="p-4 space-y-2 text-sm max-h-80 overflow-y-auto">
                  {/* Các mục tĩnh */}
                  <li className="text-gray-600 hover:text-red-600 cursor-pointer transition-colors">Được mua nhiều gần đây</li>
                  <li className="text-gray-600 hover:text-red-600 cursor-pointer transition-colors">Sản phẩm mới</li>
                  {/* Danh mục từ API */}
                  {categories.map(cat => {
                    const cid = String(cat.id ?? cat.name ?? '').toLowerCase();
                    const isChecked = selectedCategories.map(x => String(x).toLowerCase()).includes(cid);
                    return (
                      <li key={String(cat.id ?? cat.name)} className={`cursor-pointer py-0.5 transition-colors flex justify-between items-center ${cat.id === 'all' ? 'border-t pt-2 mt-2 border-gray-200 font-semibold' : 'ml-0'}`}>
                        <label className="flex items-center gap-2 w-full cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cat.id === 'all' ? selectedCategories.length === 0 : isChecked}
                            onChange={() => {
                              if (cat.id === 'all') {
                                setSelectedCategories([]);
                                return;
                              }
                              setSelectedCategories(prev => {
                                const lowered = prev.map(x => String(x).toLowerCase());
                                if (lowered.includes(cid)) return prev.filter(x => String(x).toLowerCase() !== cid);
                                return [...prev, cat.id ?? cat.name];
                              });
                            }}
                          />
                          <span className="flex-1 text-left">{cat.name}</span>
                          <span className="text-xs text-gray-500">({cat.count})</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Nhà cung cấp (Placeholder) - Collapsible */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-6">
              <div
                className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none"
                onClick={() => setIsSupplierFilterOpen(!isSupplierFilterOpen)}
              >
                <h3 className="font-semibold text-gray-900">Nhà cung cấp</h3>
                <IoChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSupplierFilterOpen ? 'rotate-180' : 'rotate-0'}`} />
              </div>
              {isSupplierFilterOpen && (
                <ul className="p-4 space-y-2 text-sm max-h-60 overflow-y-auto">
                  <li className={`cursor-pointer py-0.5 transition-colors flex justify-between items-center ${selectedSuppliers.length === 0 ? 'text-red-600 font-bold' : 'text-gray-700 hover:text-red-600'}`}>
                    <label className="flex items-center gap-2 w-full cursor-pointer">
                      <input type="checkbox" checked={selectedSuppliers.length === 0} onChange={() => { setSelectedSuppliers([]); }} />
                      <span className="flex-1 text-left">Tất cả</span>
                    </label>
                  </li>
                  {apiSuppliers.length > 0 ? apiSuppliers.map(s => {
                    const sid = String(s.id ?? s.name ?? '').toLowerCase();
                    const isChecked = selectedSuppliers.map(x => String(x).toLowerCase()).includes(sid);
                    return (
                      <li key={String(s.id ?? s.name)} className={`cursor-pointer py-0.5 transition-colors flex justify-between items-center ${isChecked ? 'text-red-600 font-bold' : 'text-gray-700 hover:text-red-600'}`}>
                        <label className="flex items-center gap-2 w-full cursor-pointer">
                          <input type="checkbox" checked={isChecked} onChange={() => {
                            setSelectedSuppliers(prev => {
                              const lowered = prev.map(x => String(x).toLowerCase());
                              if (lowered.includes(sid)) return prev.filter(x => String(x).toLowerCase() !== sid);
                              return [...prev, s.id ?? s.name];
                            });
                          }} />
                          <span className="flex-1 text-left">{s.name || 'Không tên'}</span>
                        </label>
                      </li>
                    );
                  }) : (
                    <li className="text-sm text-gray-500">Chưa có nhà cung cấp</li>
                  )}
                </ul>
              )}
            </div>

            {/* Lọc theo Giá - Collapsible */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-6">
              <div
                className="p-4 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none"
                onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
              >
                <h3 className="font-semibold text-gray-900">Giá</h3>
                <IoChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isPriceFilterOpen ? 'rotate-180' : 'rotate-0'}`} />
              </div>
              {isPriceFilterOpen && (
                <div className="p-4 space-y-3 text-sm">
                  {([
                    { min: 0, max: 999999999, label: 'Tất cả giá', id: 'all' },
                    { min: 0, max: 1000000, label: 'Dưới 1.000.000 VNĐ', id: 'range1' },
                    { min: 1000000, max: 2000000, label: '1.000.000 - 2.000.000 VNĐ', id: 'range2' },
                    { min: 2000000, max: 3000000, label: '2.000.000 - 3.000.000 VNĐ', id: 'range3' },
                    { min: 3000000, max: 4000000, label: '3.000.000 - 4.000.000 VNĐ', id: 'range4' },
                    { min: 4000001, max: 999999999, label: 'Trên 4.000.000 VNĐ', id: 'range5' },
                  ]).map(range => (
                    <div key={range.id} className="flex items-center">
                      <input
                        type="radio"
                        id={`price-${range.id}`}
                        name="price-range"
                        checked={minPrice === range.min && maxPrice === range.max}
                        onChange={() => handlePriceRangeChange(range.min, range.max)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded-full focus:ring-red-500 transition-colors"
                      />
                      <label htmlFor={`price-${range.id}`} className="ml-3 text-gray-700 cursor-pointer hover:text-red-600 transition-colors">
                        {range.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-1 p-2 border border-red-600 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition-colors text-sm font-medium shadow-sm"
            >
              <IoFunnel className="w-4 h-4" /> ĐẶT LẠI BỘ LỌC
            </button>
          </aside>

          {/* Product List (Main Column) */}
          <main className="flex-1 min-w-0">

            {/* Banner LỚN - Giống hình ảnh cung cấp */}
            <div className="mb-6 relative h-64 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
              {/* Đây là nơi Banner Lớn sẽ được đặt. Giả lập một banner sale. */}
              <div className="text-center">
                <p className="text-4xl font-extrabold text-red-600">SALE UP TO 80%</p>
                <p className="text-xl text-gray-800 mt-1">TOÀN BỘ SẢN PHẨM NỘI THẤT VÀ TRANG TRÍ</p>
              </div>
            </div>

            {/* Heading và Sort/View Mode */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-xl font-bold text-gray-900 flex items-baseline gap-3">
                <span>Tất cả sản phẩm</span>
                <span className="text-base font-normal text-gray-500">({filteredProducts.length} sản phẩm)</span>
              </div>

              {/* Sort select box + View Mode */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Sắp xếp:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-gray-700 text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer transition-shadow"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price-low">Giá thấp nhất</option>
                    <option value="price-high">Giá cao nhất</option>
                    <option value="rating">Đánh giá cao</option>
                    <option value="name">Tên A-Z</option>
                  </select>
                  <IoChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products Grid - Bố cục 4 cột linh hoạt */}
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {isLoading ? (
                <div className="col-span-full text-center py-20 text-gray-500 text-lg">Đang tải sản phẩm...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-md overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer relative group"
                  >
                    {/* Product Image & Actions */}
                    <div
                      onClick={() => handleViewProduct(product)}
                      className="relative w-full h-48 overflow-hidden bg-gray-100"
                    >
                      {(() => {
                        const imgSrc = resolveImageUrl(product.image);
                        return imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                        );
                      })()}

                      {/* Discount Tag */}
                      {((product.lowestVariantDiscountPercent != null && product.lowestVariantDiscountPercent > 0) || (product.discountPercent != null && product.discountPercent > 0) || (product.discount && product.discount > 0)) && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white px-2 py-0.5 text-xs font-semibold rounded shadow-md">
                          -{product.lowestVariantDiscountPercent ?? product.discountPercent ?? product.discount}%
                        </span>
                      )}

                      {/* Hover Actions: Heart (visible always) + Cart (on hover) */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg transition-colors hover:bg-red-50"
                        aria-label="Thêm yêu thích"
                      >
                        <IoHeart className={`w-5 h-5 transition-colors ${favorites.includes(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 text-center">

                      {/* Category Name/Brand */}
                      <p className="text-xs text-gray-500 uppercase mb-1">{product.category || 'THƯƠNG HIỆU'}</p>

                      {/* Name */}
                      <h3
                        className="font-semibold text-gray-900 mb-2 text-base h-10 overflow-hidden hover:text-red-600 transition-colors"
                        onClick={() => handleViewProduct(product)}
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Rating and stock */}
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          {renderStars(product.rating)}
                          <span className="text-xs text-gray-500">({product.reviews || 0})</span>
                        </div>
                        <div className={`text-xs ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
                          {product.inStock ? `Còn ${product.stockCount || 1}` : 'Hết hàng'}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {/* Giá khuyến mãi/Giá hiện tại (Màu ĐỎ) */}
                        <span className="text-lg font-bold text-red-600">
                          {product.lowestVariantFinalPrice != null ? (
                            formatPrice(product.lowestVariantFinalPrice)
                          ) : product.priceRange && product.priceRange.min != null && product.priceRange.max != null && product.priceRange.min !== product.priceRange.max
                            ? `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`
                            : (product.price > 0 ? formatPrice(product.price) : 'Liên hệ')
                          }
                        </span>

                        {/* Giá gốc (Màu XÁM, gạch ngang) */}
                        {product.originalPrice > 0 && product.isOnSale && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Button Thêm vào giỏ hàng (Text) */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        disabled={!product.inStock}
                        className={`
                          w-full flex items-center justify-center gap-2 p-3 rounded-md font-bold text-sm uppercase transition-all duration-300
                          ${product.inStock
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transform group-hover:scale-105'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
                        `}
                      >
                        <IoCart className="w-4 h-4" />
                        {product.inStock ? 'THÊM VÀO GIỎ' : 'HẾT HÀNG'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <div className="flex gap-1 text-sm">
                <button className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                  Trước
                </button>
                <button className="px-4 py-2 bg-red-600 text-white font-bold rounded-md shadow-md">
                  1
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                  2
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                  3
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                  Sau
                </button>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* Product Detail Modal - Giữ nguyên */}
      {showProductDetail && selectedProduct && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <CustomerProductDetail
            product={selectedProduct}
            onBack={handleBackToShop}
            onAddToCart={(cartItem) => {
              // Ensure user is logged in before adding
              if (!user) {
                window.location.href = '/login';
                return;
              }
              try {
                const variant = cartItem.bienTheChon || cartItem.bienThe || cartItem.variant || null;
                const qty = cartItem.soLuong || cartItem.quantity || 1;
                const ok = addToCart(cartItem, variant, qty);
                if (ok !== false) {
                  alert(`Đã thêm ${cartItem.tenSanPham || cartItem.name || 'sản phẩm'} vào giỏ hàng!`);
                }
              } catch (e) {
                console.error('Failed to add from modal', e);
                alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
              }
            }}
            onToggleFavorite={(productId) => toggleFavorite(productId)}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerShop;