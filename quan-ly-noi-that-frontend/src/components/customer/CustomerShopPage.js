import React, { useState, useEffect } from 'react';
import { IoSearch, IoFilter, IoHeart, IoCart, IoStar, IoGrid, IoList, IoArrowForward } from 'react-icons/io5';
import { FaChair, FaCouch, FaBed, FaTable } from 'react-icons/fa';
import api from '../../api';

// Mapping functions for Vietnamese API field names
const mapProductFromApi = (product) => ({
  id: product.id,
  name: product.ten,
  price: product.gia,
  originalPrice: product.gia_goc,
  image: product.hinh_anh,
  images: product.danh_sach_hinh_anh || [],
  category: product.danh_muc,
  categoryId: product.danh_muc_id,
  collection: product.bo_suu_tap,
  collectionId: product.bo_suu_tap_id,
  description: product.mo_ta,
  rating: product.danh_gia || 0,
  reviewCount: product.so_luot_danh_gia || 0,
  isInStock: product.ton_kho > 0,
  stockQuantity: product.ton_kho,
  discount: product.giam_gia || 0,
  isNew: product.san_pham_moi || false,
  isFeatured: product.noi_bat || false,
  tags: product.nhan || [],
  attributes: (product.thuoc_tinh || []).map(attr => ({
    name: attr.ten_thuoc_tinh,
    value: attr.gia_tri
  }))
});

const mapCategoryFromApi = (category) => ({
  id: category.id,
  name: category.ten,
  description: category.mo_ta,
  icon: category.icon,
  productCount: category.so_san_pham || 0,
  isActive: category.kich_hoat
});

const CustomerShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  // API Functions
  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('tim_kiem', filters.search);
      if (filters.categoryId) params.append('danh_muc_id', filters.categoryId);
      if (filters.collectionId) params.append('bo_suu_tap_id', filters.collectionId);
      if (filters.minPrice) params.append('gia_tu', filters.minPrice);
      if (filters.maxPrice) params.append('gia_den', filters.maxPrice);
      if (filters.sortBy) params.append('sap_xep', filters.sortBy);
      
      const response = await api.get(`/api/products?${params.toString()}`);
      setProducts(response.data.map(mapProductFromApi));
    } catch (error) {
      setError('Không thể tải danh sách sản phẩm');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data.map(mapCategoryFromApi));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await api.get('/api/collections');
      setCollections(response.data.map(collection => ({
        id: collection.id,
        name: collection.ten,
        description: collection.mo_ta,
        productCount: collection.so_san_pham || 0
      })));
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const addToFavorites = async (productId) => {
    try {
      // TODO: Backend API not implemented yet - need Favorites/Wishlist controller
      console.log('Adding to favorites (placeholder):', productId);
      // await api.post('/api/v1/yeu-thich', { san_pham_id: productId });
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      // TODO: Backend API not implemented yet - need Shopping Cart controller
      console.log('Adding to cart (placeholder):', { productId, quantity });
      // await api.post('/api/v1/gio-hang', { 
      //   san_pham_id: productId,
      //   so_luong: quantity 
      // });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCollections();
    fetchProducts();
  }, []);

  useEffect(() => {
    const filters = {
      search: searchTerm,
      categoryId: selectedCategory,
      collectionId: selectedCollection,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sortBy: sortBy
    };
    fetchProducts(filters);
  }, [searchTerm, selectedCategory, selectedCollection, priceRange, sortBy]);

  // Sample data for fallback
  const sampleCategories = [
    { id: 1, name: 'Ghế', icon: FaChair, count: 25 },
    { id: 2, name: 'Bàn', icon: FaTable, count: 18 },
    { id: 3, name: 'Sofa', icon: FaCouch, count: 12 },
    { id: 4, name: 'Giường', icon: FaBed, count: 15 }
  ];

  const sampleCollections = [
    { id: 1, name: 'Nordic Collection', count: 20 },
    { id: 2, name: 'Vintage Collection', count: 15 },
    { id: 3, name: 'Modern Collection', count: 18 },
    { id: 4, name: 'Rustic Collection', count: 12 }
  ];

  const sampleProducts = [
    {
      id: 1,
      name: 'Ghế gỗ cao cấp Parker',
      category: 'Ghế',
      collection: 'Nordic Collection',
      price: 2500000,
      originalPrice: 3000000,
      image: '/api/placeholder/300/200',
      rating: 4.8,
      reviewCount: 127,
      isOnSale: true,
      isFavorite: false,
      variants: 3
    },
    {
      id: 2,
      name: 'Bàn ăn gỗ sồi 6 người',
      category: 'Bàn',
      collection: 'Rustic Collection',
      price: 4500000,
      originalPrice: null,
      image: '/api/placeholder/300/200',
      rating: 4.6,
      reviewCount: 89,
      isOnSale: false,
      isFavorite: true,
      variants: 2
    },
    {
      id: 3,
      name: 'Sofa da thật 3 chỗ ngồi',
      category: 'Sofa',
      collection: 'Modern Collection',
      price: 8900000,
      originalPrice: 9500000,
      image: '/api/placeholder/300/200',
      rating: 4.9,
      reviewCount: 203,
      isOnSale: true,
      isFavorite: false,
      variants: 5
    },
    {
      id: 4,
      name: 'Giường ngủ phong cách Vintage',
      category: 'Giường',
      collection: 'Vintage Collection',
      price: 6200000,
      originalPrice: null,
      image: '/api/placeholder/300/200',
      rating: 4.7,
      reviewCount: 156,
      isOnSale: false,
      isFavorite: false,
      variants: 4
    },
    {
      id: 5,
      name: 'Bàn làm việc hiện đại',
      category: 'Bàn',
      collection: 'Modern Collection',
      price: 3200000,
      originalPrice: null,
      image: '/api/placeholder/300/200',
      rating: 4.5,
      reviewCount: 74,
      isOnSale: false,
      isFavorite: true,
      variants: 2
    },
    {
      id: 6,
      name: 'Ghế thư giãn có massage',
      category: 'Ghế',
      collection: 'Modern Collection',
      price: 12500000,
      originalPrice: 14000000,
      image: '/api/placeholder/300/200',
      rating: 4.9,
      reviewCount: 95,
      isOnSale: true,
      isFavorite: false,
      variants: 3
    }
  ];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    const matchesCollection = selectedCollection === '' || product.collection === selectedCollection;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesCollection && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateDiscountPercent = (originalPrice, currentPrice) => {
    if (!originalPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isOnSale && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              -{calculateDiscountPercent(product.originalPrice, product.price)}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
          <IoHeart className={product.isFavorite ? 'text-red-500' : 'text-gray-400'} />
        </button>

        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Xem chi tiết
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">{product.collection}</div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <IoStar
                key={i}
                className={`text-sm ${
                  i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-lg text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Variants */}
        <div className="text-xs text-gray-500 mb-3">
          {product.variants} biến thể có sẵn
        </div>

        {/* Add to Cart Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
          <IoCart />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );

  const ProductListItem = ({ product }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex">
      <div className="relative w-48 h-48 flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {/* Badges */}
        {product.isOnSale && (
          <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            -{calculateDiscountPercent(product.originalPrice, product.price)}%
          </span>
        )}
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">{product.collection}</div>
            <h3 className="font-semibold text-xl text-gray-900 mb-2">{product.name}</h3>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <IoStar
                    key={i}
                    className={`text-lg ${
                      i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviewCount} đánh giá)
              </span>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              {product.variants} biến thể có sẵn
            </div>
          </div>

          <div className="text-right">
            <button className="mb-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <IoHeart className={product.isFavorite ? 'text-red-500' : 'text-gray-400'} />
            </button>
            
            <div className="mb-4">
              <div className="font-bold text-xl text-gray-900">
                {formatPrice(product.price)}
              </div>
              {product.originalPrice && (
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <IoCart />
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Khám phá bộ sưu tập nội thất cao cấp</h1>
            <p className="text-xl text-blue-100 mb-8">
              Tìm kiếm món đồ nội thất hoàn hảo cho không gian sống của bạn
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <IoSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 text-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.name ? '' : category.name)}
                  className={`p-6 rounded-lg border-2 transition-colors text-center ${
                    selectedCategory === category.name
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <IconComponent className="text-3xl mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm opacity-75">{category.count} sản phẩm</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Bộ lọc</h3>
              
              {/* Collections */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Bộ sưu tập</h4>
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => setSelectedCollection(selectedCollection === collection.name ? '' : collection.name)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${
                        selectedCollection === collection.name
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{collection.name}</span>
                        <span className="text-sm">({collection.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Khoảng giá</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000000])}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <IoFilter />
                    Bộ lọc
                  </button>
                  
                  <span className="text-gray-600">
                    Hiển thị {sortedProducts.length} sản phẩm
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="featured">Nổi bật</option>
                    <option value="newest">Mới nhất</option>
                    <option value="price-low">Giá thấp đến cao</option>
                    <option value="price-high">Giá cao đến thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>

                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                      <IoGrid />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                      <IoList />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {sortedProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <IoSearch className="text-4xl text-gray-400 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-6'
              }>
                {sortedProducts.map((product) =>
                  viewMode === 'grid' ? (
                    <ProductCard key={product.id} product={product} />
                  ) : (
                    <ProductListItem key={product.id} product={product} />
                  )
                )}
              </div>
            )}

            {/* Load More */}
            {sortedProducts.length > 0 && (
              <div className="text-center mt-12">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors">
                  Xem thêm sản phẩm
                  <IoArrowForward />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerShopPage;
