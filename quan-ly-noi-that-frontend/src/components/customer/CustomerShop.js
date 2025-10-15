import React, { useState, useEffect } from 'react';
import { IoSearch, IoCart, IoHeart, IoStar, IoFilter, IoGrid, IoList, IoEye } from 'react-icons/io5';
import CustomerProductDetail from './CustomerProductDetail';
import api from '../../api';

const CustomerShop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([2, 6]); // IDs of favorited products
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map product data from API for public shop
  const mapProductFromApi = (product) => ({
    id: product.maSanPham || product.id,
    name: product.tenSanPham || product.name,
    category: product.danhMuc?.tenDanhMuc || product.category,
    price: product.giaBan || product.price || 0,
    originalPrice: product.giaGoc || product.originalPrice || 0,
    discount: product.phanTramGiamGia || 0,
    rating: product.danhGia || product.rating || 5,
    reviews: product.soLuongDanhGia || product.reviews || 0,
    image: product.hinhAnh || product.image || '/default-product.jpg',
    inStock: product.tonKho > 0,
    stockCount: product.tonKho || 0,
    description: product.moTa || product.description || '',
    variants: product.bienTheList?.map(variant => ({
      id: variant.maBienThe,
      name: variant.tenBienThe,
      price: variant.giaBan,
      inStock: variant.tonKho > 0
    })) || []
  });

  // Fetch public products for shop
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/api/products');
        if (Array.isArray(data)) {
          setProducts(data.map(mapProductFromApi));
        }
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
        const data = await api.get('/api/categories');
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
    { id: 'all', name: 'Tất cả', count: 6 },
    { id: 'chairs', name: 'Ghế', count: 2 },
    { id: 'tables', name: 'Bàn', count: 2 },
    { id: 'beds', name: 'Giường', count: 1 },
    { id: 'storage', name: 'Tủ', count: 1 }
  ]);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Ghế gỗ cao cấp',
      price: 2500000,
      originalPrice: 3000000,
      image: 'https://via.placeholder.com/300x200?text=Ghế+gỗ',
      rating: 4.8,
      reviews: 124,
      category: 'chairs',
      inStock: true,
      isNew: true,
      isFavorite: false
    },
    {
      id: 2,
      name: 'Bàn ăn 6 người',
      price: 4500000,
      originalPrice: 5000000,
      image: 'https://via.placeholder.com/300x200?text=Bàn+ăn',
      rating: 4.6,
      reviews: 89,
      category: 'tables',
      inStock: true,
      isNew: false,
      isFavorite: true
    },
    {
      id: 3,
      name: 'Giường ngủ gỗ',
      price: 6500000,
      originalPrice: 7500000,
      image: 'https://via.placeholder.com/300x200?text=Giường+ngủ',
      rating: 4.9,
      reviews: 156,
      category: 'beds',
      inStock: false,
      isNew: false,
      isFavorite: false
    },
    {
      id: 4,
      name: 'Tủ quần áo 3 cánh',
      price: 3200000,
      originalPrice: 3800000,
      image: 'https://via.placeholder.com/300x200?text=Tủ+quần+áo',
      rating: 4.7,
      reviews: 98,
      category: 'storage',
      inStock: true,
      isNew: true,
      isFavorite: false
    },
    {
      id: 5,
      name: 'Ghế sofa 3 chỗ',
      price: 8500000,
      originalPrice: 9500000,
      image: 'https://via.placeholder.com/300x200?text=Sofa+3+chỗ',
      rating: 4.5,
      reviews: 76,
      category: 'chairs',
      inStock: true,
      isNew: false,
      isFavorite: false
    },
    {
      id: 6,
      name: 'Bàn làm việc gỗ',
      price: 1800000,
      originalPrice: 2200000,
      image: 'https://via.placeholder.com/300x200?text=Bàn+làm+việc',
      rating: 4.4,
      reviews: 45,
      category: 'tables',
      inStock: true,
      isNew: true,
      isFavorite: true
    }
  ]);

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

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
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
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {product.isNew && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Mới
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

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
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

