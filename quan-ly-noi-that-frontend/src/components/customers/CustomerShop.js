import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearch, IoCart, IoHeart, IoStar, IoGrid, IoList, IoEye } from 'react-icons/io5';
import CustomerProductDetail from './CustomerProductDetail';
import api from '../../api';

const CustomerShop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
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
    let rawImage = '/default-product.jpg';
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

    return {
      id: product.maSanPham ?? product.id ?? product.productId,
      name: product.tenSanPham ?? product.ten ?? product.name ?? 'Sản phẩm',
      category: product.danhMuc?.tenDanhMuc ?? product.category ?? '',
      price,
      originalPrice,
      discount: Number(product.phanTramGiamGia ?? product.giam_gia ?? 0) || 0,
      rating: Number(product.danhGia ?? product.rating) || 0,
      reviews: Number(product.soLuongDanhGia ?? product.reviews) || 0,
      // store the raw image value; the rendering layer will convert it to absolute URL
      image: rawImage || '/default-product.jpg',
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
      isOnSale: originalPrice > 0 && price < originalPrice
    };
  };

  // Convert possibly-relative backend image path to absolute URL using api.buildUrl.
  const resolveImageUrl = (img) => {
    if (!img) return api.buildUrl('/default-product.jpg');
    if (typeof img === 'string') {
      const s = img.trim();
      if (s.startsWith('http://') || s.startsWith('https://')) return s;
      // relative path like /uploads/products/1/abc.png -> build absolute URL to backend
      return api.buildUrl(s);
    }
    // If it's an object with duongDanHinhAnh field
    if (img.duongDanHinhAnh) return resolveImageUrl(img.duongDanHinhAnh);
    return api.buildUrl('/default-product.jpg');
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
          let imageRaw = '/default-product.jpg';
          if (Array.isArray(it.hinhAnhs) && it.hinhAnhs.length > 0) {
            const first = it.hinhAnhs[0];
            imageRaw = first?.duongDanHinhAnh ?? first ?? imageRaw;
          } else if (it.hinhAnh) {
            imageRaw = it.hinhAnh;
          }

          return {
            id: it.maSanPham ?? it.id ?? it.productId,
            name: it.tenSanPham ?? it.ten ?? it.name ?? 'Sản phẩm',
            category: it.tenDanhMuc ?? it.danhMuc?.tenDanhMuc ?? '',
            // use min price for singular display; we will render range when min!=max
            price: displayPrice.min,
            priceRange: displayPrice,
            originalPrice: it.giaGoc ?? it.originalPrice ?? 0,
            // prefer backend-provided discountPercent if available
            discount: Number(it.discountPercent ?? it.phanTramGiamGia ?? it.giam_gia ?? 0) || 0,
            rating: Number(it.danhGia ?? it.rating) || 0,
            reviews: Number(it.soLuongDanhGia ?? it.reviews) || 0,
            image: imageRaw,
            // Prefer API's explicit stockQuantity if present
            inStock: Number(it.stockQuantity ?? it.tongSoLuong ?? it.totalStock ?? it.soLuongTon ?? it.stockCount ?? 0) > 0,
            stockCount: Number(it.stockQuantity ?? it.tongSoLuong ?? it.totalStock ?? it.soLuongTon ?? it.stockCount ?? 0) || 0,
            description: it.moTa ?? it.description ?? '',
            variants: [], // the shop DTO intentionally does not include full variants; keep empty here
            isOnSale: (it.giaGoc ?? it.originalPrice ?? 0) > 0 && (displayPrice.min < (it.giaGoc ?? it.originalPrice ?? Number.POSITIVE_INFINITY)),
            discountPercent: it.discountPercent != null ? it.discountPercent : null
          };
  });

        setProducts(mapped);
      } catch (err) {
        console.error('Fetch products error', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
  const navigate = useNavigate();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Navigate to product page route
  const handleViewProduct = (product) => {
    try {
      const id = product.id ?? product.maSanPham;
      // Use SPA navigation instead of full reload
      navigate(`/shop/products/${id}`);
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
    return Array.from({ length: 5 }, (_, i) => (
      <IoStar
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cửa hàng nội thất</h1>
          <p className="text-gray-600">Khám phá bộ sưu tập nội thất cao cấp</p>
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
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
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
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="relative">
                <img
                  src={resolveImageUrl(product.image)}
                  title={resolveImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                  onError={(e) => { 
                    // Log failing URL for easier debugging in browser console
                    // eslint-disable-next-line no-console
                    console.error('Image load failed for', e.currentTarget.src);
                    e.currentTarget.onerror = null; 
                    e.currentTarget.src = api.buildUrl('/logo192.png'); 
                  }}
                />
                {product.isNew && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Mới
                  </span>
                )}
                {product.discountPercent != null && product.discountPercent > 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    -{product.discountPercent}%
                  </span>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">Hết hàng</span>
                  </div>
                )}
                <button 
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
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
                    {product.priceRange && product.priceRange.min != null && product.priceRange.max != null && product.priceRange.min !== product.priceRange.max
                      ? `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`
                      : (product.price > 0 ? formatPrice(product.price) : 'Liên hệ')
                    }
                  </span>
                  {product.originalPrice > 0 && product.isOnSale && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewProduct(product)}
                    className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <IoEye className="w-4 h-4" />
                    Chi tiết
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
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

