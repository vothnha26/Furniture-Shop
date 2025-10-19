import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearch, IoCart, IoHeart, IoStar, IoGrid, IoList, IoEye } from 'react-icons/io5';
import CustomerProductDetail from './CustomerProductDetail';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const CustomerShop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [, setCart] = useState([]);
  const [, setIsLoading] = useState(false);
  const [, setError] = useState(null);

  // Map product data from API for public shop
  const mapProductFromApi = (product) => {
    const rawPrice = product.giaBan ?? product.gia ?? product.price ?? product.gia_ban ?? 0;
    const rawOriginal = product.giaGoc ?? product.gia_goc ?? product.originalPrice ?? 0;
    const price = Number(rawPrice) || 0;
    const originalPrice = Number(rawOriginal) || 0;

    // Extract a usable image value. Backend may return:
    // - a string url in product.hinhAnh / product.image
    // - an array of image objects in product.hinhAnhs or product.danh_sach_hinh_anh
    // - an object with field duongDanHinhAnh
  let rawImage = null;
    if (product) {
      if (product.hinhAnhs && Array.isArray(product.hinhAnhs) && product.hinhAnhs.length > 0) {
        const first = product.hinhAnhs[0];
        rawImage = first?.duongDanHinhAnh ?? first ?? rawImage;
      } else if (product.danh_sach_hinh_anh && Array.isArray(product.danh_sach_hinh_anh) && product.danh_sach_hinh_anh.length > 0) {
        const first = product.danh_sach_hinh_anh[0];
        rawImage = first?.duongDanHinhAnh ?? first ?? rawImage;
      } else if (product.hinhAnh) {
        rawImage = product.hinhAnh;
      } else if (product.image) {
        rawImage = product.image;
      }
    }

    // Prefer explicit product-level discount fields only. Do NOT derive discount from price<original (min/max) here.
    const rawDiscountPercent = product.phanTramGiamGia ?? product.discountPercent ?? null;
    const explicitDiscountPercent = rawDiscountPercent != null ? Number(rawDiscountPercent) || 0 : null;
    // We'll compute final discount percent/amount after evaluating variants (prefer variant-level discounted variant when present)
    let discountPercent = explicitDiscountPercent ?? null;
    let discountAmount = 0;

    // If variants exist, compute:
    // - lowestVariantOverall: the variant with the lowest final price (used for price display)
    // - lowestVariantDiscounted: the variant with the lowest final price among only variants that have a discount
    let lowestVariantOverall = null;
    let lowestVariantDiscounted = null;
    try {
      const rawVariants = product.bienTheList ?? product.bienThe ?? product.variants ?? [];
      if (Array.isArray(rawVariants) && rawVariants.length > 0) {
        rawVariants.forEach(v => {
          const vPrice = Number(v.giaBan ?? v.gia ?? v.price ?? v.priceAfterDiscount ?? 0) || 0;
          const vOriginal = Number((v.giaGoc ?? v.gia_goc ?? v.originalPrice ?? originalPrice) || 0) || 0;
          // compute percent/amount for variant
          let vDiscountPercent = v.phanTramGiamGia ?? v.discountPercent ?? null;
          vDiscountPercent = vDiscountPercent != null ? Number(vDiscountPercent) || 0 : 0;
          if ((!v.phanTramGiamGia && !v.discountPercent) && vOriginal > 0 && vPrice < vOriginal) {
            vDiscountPercent = Math.round(((vOriginal - vPrice) / vOriginal) * 100);
          }
          const vDiscountAmount = vOriginal > 0 && vPrice < vOriginal ? (vOriginal - vPrice) : 0;

          const finalPrice = vPrice; // assume provided price already reflects any variant-level applied discounts

          // track overall lowest (for display of price range)
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

          // Only consider this variant for discount-derived fields if it actually has a discount
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
      // ignore any variant parsing errors
      console.warn('Variant parsing error', e);
      lowestVariantOverall = null;
      lowestVariantDiscounted = null;
    }

    return {
      id: product.maSanPham ?? product.id ?? product.productId,
      name: product.tenSanPham ?? product.ten ?? product.name ?? 'Sản phẩm',
      // expose both category id and name when available so we can merge with API categories
      categoryId: product.danhMuc?.maDanhMuc ?? product.maDanhMuc ?? product.danhMucId ?? null,
      category: product.danhMuc?.tenDanhMuc ?? product.category ?? '',
      price,
      originalPrice,
  // percentage value (if available or computed) and absolute amount —
  // (derived later below to prefer variant-level discounts)
  // Support multiple possible backend field names for rating/review count
  rating: Number(product.averageRating ?? product.danhGia ?? product.rating ?? product.review ?? product.reviews ?? 0) || 0,
  reviews: Number(product.reviewCount ?? product.soLuotDanhGia ?? product.soLuongDanhGia ?? product.reviews ?? product.review ?? 0) || 0,
      // store the raw image value; the rendering layer will convert it to absolute URL
          image: rawImage || null,
  // Prefer explicit stockQuantity when available, fall back to older fields
  inStock: Number(product.stockQuantity ?? product.tonKho ?? product.soLuongTonKho ?? 0) > 0,
  stockCount: Number(product.stockQuantity ?? product.tonKho ?? product.soLuongTonKho ?? 0) || 0,
      description: product.moTa ?? product.description ?? '',
      variants: (product.bienTheList || product.bienThe || []).map(variant => ({
        id: variant.maBienThe ?? variant.id,
        name: variant.tenBienThe ?? variant.ten ?? variant.name,
        price: Number(variant.giaBan ?? variant.gia ?? variant.price) || 0,
        inStock: Number(variant.tonKho ?? variant.soLuong ?? 0) > 0
      })),
      // expose lowest variant pricing so the shop list can show the best (lowest) variant price and discount
      // price display uses the overall lowest final price, but discount fields come only from discounted variants
      lowestVariantId: lowestVariantOverall?.id ?? null,
      lowestVariantName: lowestVariantOverall?.name ?? null,
      lowestVariantPrice: lowestVariantOverall?.price ?? null,
      lowestVariantOriginalPrice: lowestVariantOverall?.originalPrice ?? null,
      lowestVariantDiscountPercent: lowestVariantDiscounted?.discountPercent ?? null,
      lowestVariantDiscountAmount: lowestVariantDiscounted?.discountAmount ?? 0,
      lowestVariantFinalPrice: lowestVariantDiscounted?.finalPrice ?? null,
      // derive final product-level discount values: prefer explicit product discount, otherwise the discounted variant
      discount: Number(explicitDiscountPercent ?? lowestVariantDiscounted?.discountPercent ?? 0) || 0,
      discountPercent: (explicitDiscountPercent ?? lowestVariantDiscounted?.discountPercent) > 0 ? (explicitDiscountPercent ?? lowestVariantDiscounted?.discountPercent) : null,
      discountAmount: lowestVariantDiscounted ? (lowestVariantDiscounted.discountAmount ?? 0) : (explicitDiscountPercent && explicitDiscountPercent > 0 && originalPrice > 0 ? Math.round((explicitDiscountPercent / 100) * originalPrice) : 0),
      // mark on sale only when there is an explicit product-level discount or a discounted variant
      isOnSale: Boolean(lowestVariantDiscounted) || (explicitDiscountPercent != null && explicitDiscountPercent > 0)
    };
  };

  // Convert possibly-relative backend image path to absolute URL using api.buildUrl.
  const resolveImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') {
      const s = img.trim();
      // reject known frontend placeholders so we don't show default-product.png
      if (s === '/default-product.jpg' || s === 'default-product.jpg' || s === '/logo192.png' || s === 'logo192.png') return null;
      if (s.startsWith('http://') || s.startsWith('https://')) return s;
      // relative path like /uploads/products/1/abc.png -> build absolute URL to backend
      return api.buildUrl(s);
    }
    // If it's an object with duongDanHinhAnh field
    if (img.duongDanHinhAnh) return resolveImageUrl(img.duongDanHinhAnh);
    return null;
  };

  // Fetch public products for shop
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Prefer the shop-specific endpoint which returns variant-aware aggregates
        const response = await api.get('/api/products/shop');
        const data = response?.data ?? response;

        // Support paged responses (content/items) or plain arrays
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.content)) items = data.content;
        else if (Array.isArray(data.items)) items = data.items;

        // Map shop DTO -> UI product shape. Shop DTO may include fields like:
        // - giaMin/giaMax or priceMin/priceMax
        // - tongSoLuong or totalStock
        // - soLuongBienThe / availableVariantCount
        // - hinhAnhs (array of image DTO or strings)
        const mapped = items.map(it => {
          // If the item already looks like a full product (contains price or giaBan), reuse existing mapper
          if (it && (it.giaBan != null || it.gia != null || it.price != null)) {
            return mapProductFromApi(it);
          }
          // If the shop response already has min/max price, use them to compute display
          const priceMin = it.giaMin ?? it.priceMin ?? it.minPrice ?? it.giaMinVnd ?? 0;
          const priceMax = it.giaMax ?? it.priceMax ?? it.maxPrice ?? it.giaMaxVnd ?? 0;

          const displayPrice = (priceMin && priceMax && priceMin !== priceMax)
            ? { min: Number(priceMin) || 0, max: Number(priceMax) || 0 }
            : { min: Number(it.giaBan ?? it.price ?? priceMin) || 0, max: Number(it.giaBan ?? it.price ?? priceMax) || 0 };

          // images
          let imageRaw = null;
          if (Array.isArray(it.hinhAnhs) && it.hinhAnhs.length > 0) {
            const first = it.hinhAnhs[0];
            imageRaw = first?.duongDanHinhAnh ?? first ?? imageRaw;
          } else if (it.hinhAnh) {
            imageRaw = it.hinhAnh;
          }

          // derive discount info; do NOT compute discount from price range (min/max)
          // prefer explicit dto-level discountPercent or variant-level discounted variant
          let dtoOriginalPrice = Number(it.giaGoc ?? it.originalPrice ?? 0) || 0;
          let dtoDiscountPercent = it.discountPercent ?? it.phanTramGiamGia ?? null;
          dtoDiscountPercent = dtoDiscountPercent != null ? Number(dtoDiscountPercent) || 0 : null;
          let dtoDiscountAmount = 0;

          // compute two things from DTO variants:
          // - dtoLowestVariantOverall: lowest final price (for price display)
          // - dtoLowestVariantDiscounted: lowest final price among only variants that have discounts
          let dtoLowestVariantOverall = null;
          let dtoLowestVariantDiscounted = null;
          try {
            const rawVariants = it.bienTheList ?? it.bienThe ?? it.variants ?? it.variantDtos ?? [];
            if (Array.isArray(rawVariants) && rawVariants.length > 0) {
              rawVariants.forEach(v => {
                const vPrice = Number(v.giaBan ?? v.gia ?? v.price ?? v.priceAfterDiscount ?? displayPrice.min) || 0;
                const vOriginal = Number((v.giaGoc ?? v.gia_goc ?? v.originalPrice ?? dtoOriginalPrice) || 0) || 0;
                let vDiscountPercent = v.phanTramGiamGia ?? v.discountPercent ?? null;
                vDiscountPercent = vDiscountPercent != null ? Number(vDiscountPercent) || 0 : 0;
                if ((!v.phanTramGiamGia && !v.discountPercent) && vOriginal > 0 && vPrice < vOriginal) {
                  vDiscountPercent = Math.round(((vOriginal - vPrice) / vOriginal) * 100);
                }
                const vDiscountAmount = vOriginal > 0 && vPrice < vOriginal ? (vOriginal - vPrice) : 0;
                const finalPrice = vPrice;

                if (!dtoLowestVariantOverall || finalPrice < dtoLowestVariantOverall.finalPrice) {
                  dtoLowestVariantOverall = {
                    id: v.maBienThe ?? v.id ?? v.variantId,
                    name: v.tenBienThe ?? v.ten ?? v.name ?? null,
                    price: vPrice,
                    originalPrice: vOriginal,
                    discountPercent: vDiscountPercent > 0 ? vDiscountPercent : null,
                    discountAmount: vDiscountAmount,
                    finalPrice
                  };
                }

                const hasDiscount = vDiscountAmount > 0 || (vDiscountPercent && vDiscountPercent > 0) || Boolean(v.priceAfterDiscount) || (vPrice < vOriginal && vOriginal > 0);
                if (hasDiscount) {
                  if (!dtoLowestVariantDiscounted || finalPrice < dtoLowestVariantDiscounted.finalPrice) {
                    dtoLowestVariantDiscounted = {
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
            dtoLowestVariantOverall = null;
            dtoLowestVariantDiscounted = null;
          }

          // After examining variants, derive final dto-level discount values but DO NOT use displayPrice.min/max
          // Priority: explicit dto discountPercent > variant-level discounted info > no discount
          const finalDtoDiscountPercent = dtoDiscountPercent ?? dtoLowestVariantDiscounted?.discountPercent ?? null;
          if (dtoLowestVariantDiscounted) {
            dtoDiscountAmount = dtoLowestVariantDiscounted.discountAmount ?? 0;
          } else if (finalDtoDiscountPercent != null && finalDtoDiscountPercent > 0 && dtoOriginalPrice > 0) {
            dtoDiscountAmount = Math.round((finalDtoDiscountPercent / 100) * dtoOriginalPrice);
          }
          dtoDiscountPercent = finalDtoDiscountPercent;

          return {
            id: it.maSanPham ?? it.id ?? it.productId,
            name: it.tenSanPham ?? it.ten ?? it.name ?? 'Sản phẩm',
            categoryId: it.maDanhMuc ?? it.danhMuc?.maDanhMuc ?? null,
            category: it.tenDanhMuc ?? it.danhMuc?.tenDanhMuc ?? '',
            // use min price for singular display; we will render range when min!=max
            price: displayPrice.min,
            priceRange: displayPrice,
            originalPrice: it.giaGoc ?? it.originalPrice ?? 0,
            // prefer backend-provided discountPercent if available; fall back to computed dtoDiscountPercent
            discount: Number(it.discountPercent ?? it.phanTramGiamGia ?? it.giam_gia ?? dtoDiscountPercent ?? 0) || 0,
            discountAmount: dtoDiscountAmount,
            // Support multiple possible backend field names for rating/review count
            rating: Number(it.averageRating ?? it.danhGia ?? it.rating ?? it.review ?? it.reviews ?? 0) || 0,
            reviews: Number(it.reviewCount ?? it.soLuotDanhGia ?? it.soLuongDanhGia ?? it.reviews ?? it.review ?? 0) || 0,
            image: imageRaw,
            // Prefer API's explicit stockQuantity if present
            inStock: Number(it.stockQuantity ?? it.tongSoLuong ?? it.totalStock ?? it.soLuongTon ?? it.stockCount ?? 0) > 0,
            stockCount: Number(it.stockQuantity ?? it.tongSoLuong ?? it.totalStock ?? it.soLuongTon ?? it.stockCount ?? 0) || 0,
            description: it.moTa ?? it.description ?? '',
            variants: [], // the shop DTO intentionally does not include full variants; keep empty here
            // mark on sale only when there is an explicit dto-level discount or a variant with a discount
            isOnSale: Boolean(dtoLowestVariantDiscounted) || (dtoDiscountPercent != null && dtoDiscountPercent > 0),
            discountPercent: dtoDiscountPercent != null && dtoDiscountPercent > 0 ? dtoDiscountPercent : (it.discountPercent != null ? it.discountPercent : null),
            // expose dto-level lowest overall for price, but discount fields only from discounted variants
            lowestVariantId: dtoLowestVariantOverall?.id ?? null,
            lowestVariantName: dtoLowestVariantOverall?.name ?? null,
            lowestVariantPrice: dtoLowestVariantOverall?.price ?? null,
            lowestVariantOriginalPrice: dtoLowestVariantOverall?.originalPrice ?? null,
            lowestVariantDiscountPercent: dtoLowestVariantDiscounted?.discountPercent ?? null,
            lowestVariantDiscountAmount: dtoLowestVariantDiscounted?.discountAmount ?? 0,
            lowestVariantFinalPrice: dtoLowestVariantDiscounted?.finalPrice ?? null
          };
  });

        setProducts(mapped);
        try {
          // expose for debugging in browser console: window.__DEBUG__products
          // and print a compact sample showing id/category fields to help diagnose filtering
          // (safe-guard in case window is not available in some environments)
          if (typeof window !== 'undefined') {
            window.__DEBUG__products = mapped;
            // eslint-disable-next-line no-console
            console.log('CustomerShop: loaded products sample (id,categoryId,category): ' + JSON.stringify(mapped.slice(0,3).map(p => ({ id: p.id, categoryId: p.categoryId, category: p.category })), null, 2));
          }
        } catch (e) {}
      } catch (err) {
        console.error('Fetch products error', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Load favorites (server-backed when authenticated, otherwise localStorage)
  useEffect(() => {
    let mounted = true;
    const loadFavorites = async () => {
        if (user) {
        try {
          const resp = await api.get('/favorites');
          const data = resp?.data ?? resp;
          if (!Array.isArray(data)) {
            if (mounted) setFavorites([]);
            return;
          }
          const ids = data.map(p => p.maSanPham ?? p.id ?? p.productId ?? p.productId ?? p.id).filter(Boolean);
          if (mounted) {
            setFavorites(ids);
            try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: ids.length } })); } catch (e) {}
          }
          return;
        } catch (e) {
          console.debug('Favorites API not available on load', e);
          // fallthrough to localStorage
        }
      }
      try {
        const raw = localStorage.getItem('favorites') || '[]';
        const arr = JSON.parse(raw);
        const ids = Array.isArray(arr) ? arr.map(f => f.id ?? f.maSanPham).filter(Boolean) : [];
        if (mounted) {
          setFavorites(ids);
          try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: ids.length } })); } catch (e) {}
        }
      } catch (e) {
        if (mounted) setFavorites([]);
      }
    };
    loadFavorites();
    return () => { mounted = false; };
  }, [user]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        const data = response?.data ?? response;
        if (Array.isArray(data)) {
          const mappedCategories = data.map(cat => ({
            id: cat.maDanhMuc,
            name: cat.tenDanhMuc,
            count: cat.soLuongSanPham || 0
          }));
          // store API categories separately; we'll merge counts with product-derived counts below
          setApiCategories(mappedCategories);
          setCategories([{ id: 'all', name: 'Tất cả', count: mappedCategories.reduce((sum, cat) => sum + cat.count, 0) }, ...mappedCategories]);
        }
      } catch (err) {
        console.error('Fetch categories error', err);
      }
    };
    fetchCategories();
  }, []);

  const [categories, setCategories] = useState([
    // start empty; will be populated from API
    { id: 'all', name: 'Tất cả', count: 0 }
  ]);

  const [products, setProducts] = useState([
    // start empty and rely on API fetch
  ]);
  // keep a ref to products so some effects can read the latest value
  // without re-subscribing to products changes (prevents repeated fetches)
  const productsRef = useRef(products);
  useEffect(() => { productsRef.current = products; }, [products]);
  // Keep API categories in a separate state so we can merge product counts into them
  const [apiCategories, setApiCategories] = useState([]);

  // When products load, derive category counts from product data and merge with API categories.
  useEffect(() => {
    if (!products || products.length === 0) {
      // fallback to API categories if present
      if (apiCategories && apiCategories.length > 0) {
        const total = apiCategories.reduce((s, c) => s + (c.count || 0), 0);
        setCategories([{ id: 'all', name: 'Tất cả', count: total }, ...apiCategories]);
      } else {
        setCategories([{ id: 'all', name: 'Tất cả', count: 0 }]);
      }
      return;
    }

    // compute counts from products
    const countsById = {};
    const countsByName = {};
    products.forEach(p => {
      const id = p.categoryId ?? null;
      const name = (p.category && p.category !== '') ? p.category : 'Khác';
      if (id) countsById[id] = (countsById[id] || 0) + 1;
      countsByName[name] = (countsByName[name] || 0) + 1;
    });

    // prefer merging into apiCategories (keeps canonical ids/names) when available
    let merged = [];
    if (apiCategories && apiCategories.length > 0) {
      merged = apiCategories.map(ac => ({
        id: ac.id,
        name: ac.name,
        count: countsById[ac.id] ?? ac.count ?? 0
      }));
      // add any product-derived names that were not present in API categories
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
  const navigate = useNavigate();

  // If products don't include category info (categoryId/category empty for all items),
  // fall back to asking the backend for products of the selected category.
  useEffect(() => {
    // If products already include usable category info, we don't need to hit the backend each time the products state updates.
    // Only run this effect when the selectedCategory changes (see dependency array below).
  const currentProducts = productsRef.current;
  const shouldProductsProvideCategory = currentProducts && currentProducts.length > 0 && currentProducts.some(p => (p.categoryId || '').toString().trim() !== '' || (p.category || '').toString().trim() !== '');
  if (shouldProductsProvideCategory) return; // client-side filtering is fine

  // If no products yet, nothing to do here — initial fetch runs on mount in a separate effect.
  if (!currentProducts || currentProducts.length === 0) return;

  // Avoid unnecessary reload when selecting 'all' if we already have a non-empty products list
  if (selectedCategory === 'all' && currentProducts && currentProducts.length > 0) return;

    // When category is 'all' or a specific category is selected, refetch the list scoped to that category
    const fetchForCategory = async (cat) => {
      try {
        // Try several common query param names the backend might support
        const candidates = [
          `/api/products/shop?categoryId=${encodeURIComponent(cat)}`,
          `/api/products/shop?maDanhMuc=${encodeURIComponent(cat)}`,
          `/api/products?categoryId=${encodeURIComponent(cat)}`,
          `/api/products?maDanhMuc=${encodeURIComponent(cat)}`,
          `/api/products/shop?category=${encodeURIComponent(cat)}`
        ];

        for (const url of candidates) {
          try {
            const resp = await api.get(url);
            const data = resp?.data ?? resp;
            let items = [];
            if (Array.isArray(data)) items = data;
            else if (Array.isArray(data.content)) items = data.content;
            else if (Array.isArray(data.items)) items = data.items;
            if (items && items.length > 0) {
              // Map similarly to initial fetch: prefer mapProductFromApi when item looks like full product
              const mapped = items.map(it => (it && (it.giaBan != null || it.gia != null || it.price != null)) ? mapProductFromApi(it) : {
                id: it.maSanPham ?? it.id ?? it.productId,
                name: it.tenSanPham ?? it.ten ?? it.name ?? 'Sản phẩm',
                categoryId: it.maDanhMuc ?? it.danhMuc?.maDanhMuc ?? null,
                category: it.tenDanhMuc ?? it.danhMuc?.tenDanhMuc ?? '',
                price: Number(it.giaBan ?? it.price ?? 0) || 0,
                image: (it.hinhAnhs && it.hinhAnhs[0]) ? (it.hinhAnhs[0].duongDanHinhAnh ?? it.hinhAnhs[0]) : (it.hinhAnh ?? null),
                inStock: Number(it.stockQuantity ?? it.tongSoLuong ?? it.totalStock ?? 0) > 0,
                stockCount: Number(it.stockQuantity ?? it.tongSoLuong ?? it.totalStock ?? 0) || 0,
                description: it.moTa ?? it.description ?? '',
                variants: []
              });
              setProducts(mapped);
              return;
            }
          } catch (e) {
            // try next candidate
          }
        }
        // If none returned items, leave existing products as-is (no matches)
      } catch (e) {
        // ignore
      }
    };

    if (selectedCategory && selectedCategory !== 'all') {
      fetchForCategory(selectedCategory);
    } else if (selectedCategory === 'all') {
      // reload full list
      (async () => {
        try {
          const resp = await api.get('/api/products/shop');
          const data = resp?.data ?? resp;
          let items = [];
          if (Array.isArray(data)) items = data;
          else if (Array.isArray(data.content)) items = data.content;
          else if (Array.isArray(data.items)) items = data.items;
          const mapped = items.map(it => (it && (it.giaBan != null || it.gia != null || it.price != null)) ? mapProductFromApi(it) : ({ id: it.maSanPham ?? it.id ?? it.productId, name: it.tenSanPham ?? it.ten ?? it.name ?? 'Sản phẩm', categoryId: it.maDanhMuc ?? it.danhMuc?.maDanhMuc ?? null, category: it.tenDanhMuc ?? it.danhMuc?.tenDanhMuc ?? '', price: Number(it.giaBan ?? it.price ?? 0) || 0, image: (it.hinhAnhs && it.hinhAnhs[0]) ? (it.hinhAnhs[0].duongDanHinhAnh ?? it.hinhAnhs[0]) : (it.hinhAnh ?? null), inStock: Number(it.stockQuantity ?? it.tongSoLuong ?? it.totalStock ?? 0) > 0, stockCount: Number(it.stockQuantity ?? it.tongSoLuong ?? it.totalStock ?? 0) || 0, description: it.moTa ?? it.description ?? '', variants: [] }));
          setProducts(mapped);
        } catch (e) {}
      })();
    }
  }, [selectedCategory]);

  // Filter by search term and category, then sort according to sortBy
  const filteredProducts = (() => {
    const term = (searchTerm || '').toString().toLowerCase();
    const list = products.filter(product => {
      const name = (product.name || '').toString().toLowerCase();
      const matchesSearch = term === '' || name.includes(term);

      // Category matching: selectedCategory is category.id when available, otherwise category name.
      const cat = (selectedCategory || '').toString().toLowerCase();
      let matchesCategory = false;
      if (cat === 'all') {
        matchesCategory = true;
      } else {
        const prodCatId = (product.categoryId ?? '').toString().toLowerCase();
        const prodCatName = (product.category ?? '').toString().toLowerCase();
        // direct id match or direct name match or name contains selected (fallback)
        matchesCategory = (prodCatId && prodCatId === cat) || (prodCatName && prodCatName === cat) || (prodCatName && prodCatName.includes(cat));
      }

      return matchesSearch && matchesCategory;
    });

    // Sorting
    const by = sortBy;
    const getPrice = (p) => Number(p.lowestVariantFinalPrice ?? p.price ?? (p.priceRange && p.priceRange.min) ?? 0) || 0;

    if (by === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (by === 'price-low') {
      list.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (by === 'price-high') {
      list.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (by === 'rating') {
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (by === 'newest') {
      // best-effort: if products have createdAt or addedDate, sort by that; otherwise leave as-is
      list.sort((a, b) => {
        const ta = new Date(a.createdAt || a.addedDate || 0).getTime() || 0;
        const tb = new Date(b.createdAt || b.addedDate || 0).getTime() || 0;
        return tb - ta;
      });
    }

    return list;
  })();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Debug helper: when selectedCategory, products or searchTerm change, log matching stats to help tune filters
  useEffect(() => {
    try {
      const cat = (selectedCategory || '').toString().toLowerCase();
  const currentProducts = productsRef.current || [];
  const total = currentProducts.length;
  const exactId = currentProducts.filter(p => (p.categoryId ?? '').toString().toLowerCase() === cat).length;
  const exactName = currentProducts.filter(p => (p.category ?? '').toString().toLowerCase() === cat).length;
  const includesName = currentProducts.filter(p => (p.category ?? '').toString().toLowerCase().includes(cat)).length;

      // compute shown (apply same category + searchTerm filtering used by filteredProducts)
      const term = (searchTerm || '').toString().toLowerCase();
  const shown = currentProducts.filter(product => {
        const name = (product.name || '').toString().toLowerCase();
        const matchesSearch = term === '' || name.includes(term);
        if (cat === 'all') return matchesSearch;
        const prodCatId = (product.categoryId ?? '').toString().toLowerCase();
        const prodCatName = (product.category ?? '').toString().toLowerCase();
        const matchesCategory = (prodCatId && prodCatId === cat) || (prodCatName && prodCatName === cat) || (prodCatName && prodCatName.includes(cat));
        return matchesSearch && matchesCategory;
      }).length;

      // eslint-disable-next-line no-console
      console.log('CustomerShop: category debug ' + JSON.stringify({ selectedCategory: cat, total, exactId, exactName, includesName, shown }, null, 2));
    } catch (e) {
      // ignore
    }
  }, [selectedCategory, searchTerm]);

  const toggleFavorite = async (productOrId) => {
    try {
      // accept either product object or id
      let product = null;
      if (typeof productOrId === 'object') product = productOrId;
      else product = products.find(p => p.id === productOrId || p.maSanPham === productOrId) || null;
      const id = product ? (product.id ?? product.maSanPham) : productOrId;
      const existing = favorites.includes(id);

      // Update local state
      setFavorites(prev => existing ? prev.filter(x => x !== id) : [...prev, id]);

      // Maintain a localStorage copy of favorite product objects for offline display
      try {
        const raw = localStorage.getItem('favorites') || '[]';
        const favObjs = JSON.parse(raw);
        if (existing) {
          const filtered = favObjs.filter(f => (f.id ?? f.maSanPham) !== id);
          localStorage.setItem('favorites', JSON.stringify(filtered));
          // notify layout
          try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: filtered.length } })); } catch (e) {}
        } else {
          const toStore = {
            id,
            name: product ? (product.name ?? product.tenSanPham ?? product.ten) : '',
            price: product ? (product.price ?? product.gia ?? product.giaBan) : 0,
            originalPrice: product ? (product.originalPrice ?? product.giaGoc ?? product.gia_goc) : 0,
            image: product ? (product.image ?? (product.hinhAnhs && product.hinhAnhs.length > 0 ? (product.hinhAnhs[0].duongDanHinhAnh ?? product.hinhAnhs[0]) : (product.hinhAnh ?? product.image))) : '',
            rating: product ? (product.rating ?? product.danhGia ?? 0) : 0,
            reviews: product ? (product.reviews ?? product.soLuotDanhGia ?? 0) : 0,
            addedDate: new Date().toISOString()
          };
          favObjs.push(toStore);
          localStorage.setItem('favorites', JSON.stringify(favObjs));
          try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: favObjs.length } })); } catch (e) {}
        }
      } catch (e) { console.debug('localStorage favorites error', e); }

      // Call backend (server-backed only when authenticated) — payload uses { productId }
      try {
        if (user) {
          if (!existing) {
            await api.post('/api/v1/yeu-thich', { productId: id });
                  try { navigate('/favorites', { replace: false }); } catch (e) {}
          } else {
            await api.delete(`/api/v1/yeu-thich/${id}`);
          }
        }
      } catch (e) {
        console.debug('Favorites API error (best-effort)', e);
      }
    } catch (err) {
      console.error('toggleFavorite error', err);
    }
  };

  // Navigate to product page route
  const handleViewProduct = (product) => {
    try {
      const id = product.id ?? product.maSanPham;
      // debug: ensure click reaches here and id is present
      // eslint-disable-next-line no-console
      console.log('CustomerShop: handleViewProduct', { productId: id, product });
      if (!id) {
        // missing id -> open modal fallback
        // eslint-disable-next-line no-console
        console.warn('CustomerShop: product has no id, opening modal instead', product);
        setSelectedProduct(product);
        setShowProductDetail(true);
        return;
      }
  // Use SPA navigation (relative) instead of full reload — this file is mounted under /shop
  navigate(`products/${id}`);
    } catch (e) {
      // fallback to modal if routing fails
      setSelectedProduct(product);
      setShowProductDetail(true);
    }
  };

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Show toast notification
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const handleBackToShop = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  const renderStars = (rating) => {
    const rounded = Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <IoStar key={i} className={`w-4 h-4 ${i < rounded ? 'text-yellow-400' : 'text-gray-300'}`} />
    ));
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 lg:flex lg:items-center lg:justify-between">
          <div className="mb-3 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Cửa hàng nội thất</h1>
            <p className="text-gray-600">Khám phá bộ sưu tập nội thất cao cấp</p>
          </div>
          <div className="w-full lg:w-1/2" />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(String(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(category => (
                  // prefer stable id when present, otherwise fall back to name
                  <option key={String(category.id ?? category.name)} value={String(category.id ?? category.name)}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="name">Tên A-Z</option>
                <option value="price-low">Giá thấp đến cao</option>
                <option value="price-high">Giá cao đến thấp</option>
                <option value="rating">Đánh giá cao</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <IoGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <IoList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              role="button"
              tabIndex={0}
              onClick={() => handleViewProduct(product)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewProduct(product); } }}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Product Image */}
              <div className="relative">
                {(() => {
                  const imgSrc = resolveImageUrl(product.image);
                  if (imgSrc) {
                    return (
                      <img
                        src={imgSrc}
                        title={imgSrc}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '';
                        }}
                      />
                    );
                  }
                  // No real image available — render neutral placeholder box (no default image file)
                  return (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  );
                })()}
                {product.isNew && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Mới
                  </span>
                )}
                {/* Prefer lowest-variant discount if available */}
                {product.lowestVariantDiscountPercent != null && product.lowestVariantDiscountPercent > 0 ? (
                  <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    -{product.lowestVariantDiscountPercent}%
                  </span>
                ) : product.lowestVariantDiscountAmount > 0 ? (
                  <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    -{formatPrice(product.lowestVariantDiscountAmount)}
                  </span>
                ) : product.discountPercent != null && product.discountPercent > 0 ? (
                  <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    -{product.discountPercent}%
                  </span>
                ) : product.discountAmount > 0 ? (
                  <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    -{formatPrice(product.discountAmount)}
                  </span>
                ) : null}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">Hết hàng</span>
                  </div>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                  aria-label="Thêm yêu thích"
                >
                  <IoHeart className={`w-5 h-5 ${favorites.includes(product.id) ? 'text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-500">({product.reviews})</span>
                </div>

                {/* Stock */}
                <div className="mb-2">
                  {product.stockCount > 0 ? (
                    <span className="text-sm text-green-600 font-medium">Còn hàng: {product.stockCount}</span>
                  ) : (
                    <span className="text-sm text-red-600 font-medium">Hết hàng</span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">

                  <span className="text-lg font-bold text-primary">
                    {/* Prefer showing lowest variant final price when available */}
                    {product.lowestVariantFinalPrice != null ? (
                      formatPrice(product.lowestVariantFinalPrice)
                    ) : product.priceRange && product.priceRange.min != null && product.priceRange.max != null && product.priceRange.min !== product.priceRange.max
                      ? `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`
                      : (product.price > 0 ? formatPrice(product.price) : 'Liên hệ')
                    }
                  </span>

                  {/* show discount amount or percent inline next to price when available, prefer variant-level */}
                  {product.lowestVariantDiscountPercent != null && product.lowestVariantDiscountPercent > 0 && (
                    <span className="text-sm text-red-600 font-medium">
                      &nbsp;(-{product.lowestVariantDiscountPercent}%)
                    </span>
                  )}
                  {((!product.lowestVariantDiscountPercent || product.lowestVariantDiscountPercent === null) && product.lowestVariantDiscountAmount > 0) && (
                    <span className="text-sm text-red-600 font-medium">
                      &nbsp;(-{formatPrice(product.lowestVariantDiscountAmount)})
                    </span>
                  )}
                  {/* fallbacks to product-level discount */}
                  {product.lowestVariantDiscountPercent == null && (!product.lowestVariantDiscountAmount || product.lowestVariantDiscountAmount === 0) && product.discountPercent != null && product.discountPercent > 0 && (
                    <span className="text-sm text-red-600 font-medium">
                      &nbsp;(-{product.discountPercent}%)
                    </span>
                  )}
                  {product.lowestVariantDiscountPercent == null && (!product.lowestVariantDiscountAmount || product.lowestVariantDiscountAmount === 0) && (!product.discountPercent || product.discountPercent === null) && product.discountAmount > 0 && (
                    <span className="text-sm text-red-600 font-medium">
                      &nbsp;(-{formatPrice(product.discountAmount)})
                    </span>
                  )}

                  {product.originalPrice > 0 && product.isOnSale && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewProduct(product); }}
                    className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <IoEye className="w-4 h-4" />
                    Chi tiết
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                    disabled={!product.inStock}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      product.inStock
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <IoCart className="w-4 h-4" />
                    {product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Trước
            </button>
            <button className="px-3 py-2 bg-primary text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              3
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {showProductDetail && selectedProduct && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <CustomerProductDetail 
            product={selectedProduct}
            onBack={handleBackToShop}
            onAddToCart={(cartItem) => {
              setCart(prev => {
                const existingItem = prev.find(item => item.id === cartItem.id);
                if (existingItem) {
                  return prev.map(item =>
                    item.id === cartItem.id 
                      ? { ...item, quantity: item.quantity + cartItem.soLuong }
                      : item
                  );
                }
                return [...prev, { ...cartItem, quantity: cartItem.soLuong }];
              });
              alert(`Đã thêm ${cartItem.tenSanPham || cartItem.name} vào giỏ hàng!`);
            }}
            onToggleFavorite={(productId) => toggleFavorite(productId)}
          />
        </div>
      )}
    </div>
  );

};

export default CustomerShop;
