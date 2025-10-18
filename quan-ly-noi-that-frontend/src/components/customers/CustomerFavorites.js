import React, { useState, useEffect } from 'react';
import { IoHeart, IoTrash, IoCart, IoStar, IoSearch } from 'react-icons/io5';
import api from '../../api';

const CustomerFavorites = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await api.get('/favorites');
        const data = res?.data || res;
        // Map API fields if necessary; assume API returns list of products
        const mapped = (Array.isArray(data) ? data : []).map(p => {
          const id = p.id ?? p.maSanPham ?? p.productId;
          const name = p.ten ?? p.tenSanPham ?? p.name ?? 'Sản phẩm';
          // defensive price parsing
          const rawPrice = p.gia ?? p.giaBan ?? p.price ?? p.priceMin ?? p.giaMin ?? null;
          const price = rawPrice != null ? (Number(rawPrice) || null) : null;
          const rawOriginal = p.giaGoc ?? p.originalPrice ?? null;
          const originalPrice = rawOriginal != null ? (Number(rawOriginal) || null) : null;
          let imageVal = null;
          if (p.hinhAnhs && Array.isArray(p.hinhAnhs) && p.hinhAnhs.length > 0) {
            imageVal = p.hinhAnhs[0].duongDanHinhAnh ?? p.hinhAnhs[0];
          } else if (p.hinhAnh) imageVal = p.hinhAnh;
          else if (p.image) imageVal = p.image;

          const image = imageVal && typeof imageVal === 'string' && imageVal.startsWith('/') ? api.buildUrl(imageVal) : imageVal;
          const rating = p.averageRating ?? p.danhGia ?? p.rating ?? 0;
          const reviews = p.reviewCount ?? p.soLuotDanhGia ?? p.reviews ?? 0;
          // if stock fields not present, assume available to avoid showing "Hết hàng" erroneously
          const inStock = (p.tonKho ?? p.soLuongTonKho ?? p.stockQuantity ?? null) != null ? ((p.tonKho ?? p.soLuongTonKho ?? p.stockQuantity) > 0) : true;
          return {
            id,
            name,
            price,
            originalPrice,
            image,
            rating: Number(rating) || 0,
            reviews: Number(reviews) || 0,
            category: p.danhMuc || p.category || null,
            inStock,
            isNew: p.sanPhamMoi || p.isNew || false,
            addedDate: p.ngayThem || p.addedDate || ''
          };
        });
        setFavorites(mapped);
        try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: mapped.length } })); } catch (err) {}
      } catch (e) {
        console.debug('Favorites API not available', e);
        // Fallback to localStorage favorites saved by shop page
        try {
          const raw = localStorage.getItem('favorites') || '[]';
          const local = JSON.parse(raw);
          const mappedLocal = local.map(p => ({
            ...p,
            image: p.image && typeof p.image === 'string' && p.image.startsWith('/') ? api.buildUrl(p.image) : (p.image || null)
          }));
          setFavorites(mappedLocal);
          try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: mappedLocal.length } })); } catch (err) {}
        } catch (le) { console.debug('local favorites load failed', le); }
      }
    };
    loadFavorites();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const removeFromFavorites = async (id) => {
    try {
      // Optimistic update: compute next favorites and persist to localStorage
      setFavorites(prev => {
        const next = prev.filter(item => item.id !== id);
        try {
          const raw = localStorage.getItem('favorites') || '[]';
          const favObjs = JSON.parse(raw);
          const filtered = favObjs.filter(f => (f.id ?? f.maSanPham) !== id);
          localStorage.setItem('favorites', JSON.stringify(filtered));
          try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: filtered.length } })); } catch (e) {}
        } catch (lsErr) {
          try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: next.length } })); } catch (e) {}
        }
        return next;
      });

      try {
        await api.delete(`/api/v1/yeu-thich/${id}`);
      } catch (e) {
        console.debug('Remove favorite API not available', e);
      }
    } catch (e) {
      console.error('Error removing favorite', e);
    }
  };

  const addToCart = async (product) => {
    try {
      try {
        await api.post('/api/v1/gio-hang', { san_pham_id: product.id, so_luong: 1 });
        // optionally show toast / UI feedback
      } catch (e) {
        console.debug('Cart API not available', e);
        alert(`Đã thêm "${product.name}" vào giỏ hàng (local)`);
      }
    } catch (e) {
      console.error('Error adding to cart', e);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <IoStar
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredFavorites = favorites.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sản phẩm yêu thích</h1>
          <p className="text-gray-600">Danh sách sản phẩm bạn đã thêm vào yêu thích</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm yêu thích..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Favorites List */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  {item.isNew && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Mới
                    </span>
                  )}
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">Hết hàng</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {renderStars(item.rating ?? 0)}
                    </div>
                    <span className="text-sm text-gray-500">({item.reviews ?? 0})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-primary">
                      {item.price != null ? formatPrice(item.price) : 'Liên hệ'}
                    </span>
                    {(item.originalPrice != null && item.price != null && item.originalPrice > item.price) && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Added Date */}
                  <p className="text-sm text-gray-500 mb-4">
                    Thêm vào: {item.addedDate}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        item.inStock
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <IoCart className="w-4 h-4" />
                      {item.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                    </button>
                    <button
                      onClick={() => removeFromFavorites(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <IoTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoHeart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm yêu thích'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy thêm sản phẩm vào yêu thích khi mua sắm'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerFavorites;

