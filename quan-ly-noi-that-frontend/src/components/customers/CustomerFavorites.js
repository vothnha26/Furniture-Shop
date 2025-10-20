import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoHeart, IoCart, IoStar, IoSearch } from 'react-icons/io5';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { readFavoritesLocal, writeFavoritesLocal, readFavoritesWithLegacy } from '../../utils/favorites';

const ProductCard = ({ product, onAddToCart, onToggleFavorite }) => {
  const { id, name, image, collection, rating, reviewCount, price, originalPrice, discount, variants, isFavorite, inStock } = product;

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative">
        {image ? (
          <Link to={`/shop/products/${id}`} className="block">
            <img loading="lazy" src={image} alt={name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
          </Link>
        ) : (
          <Link to={`/shop/products/${id}`} className="block w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">No image</Link>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          { (product.discountPercent != null && product.discountPercent > 0) || (discount && discount > 0) ? (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">-{product.discountPercent != null && product.discountPercent > 0 ? product.discountPercent : Math.round(((discount || 0) / (originalPrice || 1)) * 100)}%</span>
          ) : null }
        </div>

        <button onClick={onToggleFavorite} className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
          <IoHeart className={isFavorite ? 'text-red-500' : 'text-gray-400'} />
        </button>
      </div>

      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">{collection}</div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2"><Link to={`/shop/products/${id}`} className="hover:text-primary">{name}</Link></h3>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <IoStar key={i} className={`text-sm ${i < Math.floor(rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-600">{rating} ({reviewCount})</span>
        </div>

        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-900">{price > 0 ? formatPrice(price) : 'Liên hệ'}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>
          {(discount && discount > 0) && (
            <div className="text-xs text-gray-500">Tiết kiệm: {formatPrice(discount)}</div>
          )}
        </div>

        <div className="text-sm font-medium mb-3">
          { inStock === false ? (
            <span className="text-gray-500">Hết hàng</span>
          ) : (
            <span className="text-green-600">Còn hàng</span>
          ) }
        </div>

        <button onClick={() => onAddToCart && onAddToCart(product)} disabled={inStock === false} className={`w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded shadow-md font-semibold flex items-center justify-center gap-2 transition-colors ${inStock === false ? 'opacity-60 cursor-not-allowed' : ''}`}>
          <IoCart /> THÊM VÀO GIỎ
        </button>
      </div>
    </div>
  );
};

const CustomerFavorites = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const auth = useAuth();
  const currentUser = auth?.user ?? null;
  const { addToCart: ctxAddToCart } = useCart();

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const user = currentUser;
        const res = await api.get('/favorites');
        const data = res?.data || res || [];
        const mapped = (Array.isArray(data) ? data : []).map(p => ({
          id: p.id ?? p.maSanPham ?? p.productId,
          name: p.ten ?? p.tenSanPham ?? p.name ?? 'Sản phẩm',
          price: p.gia ?? p.giaBan ?? p.price ?? null,
          originalPrice: p.giaGoc ?? p.originalPrice ?? null,
          image: (() => {
            const img = (p.hinhAnhs && Array.isArray(p.hinhAnhs) && p.hinhAnhs[0]?.duongDanHinhAnh) || p.hinhAnh || p.image || null;
            return img && typeof img === 'string' && img.startsWith('/') ? api.buildUrl(img) : img;
          })(),
          rating: Number(p.averageRating ?? p.danhGia ?? p.rating) || 0,
          reviews: Number(p.reviewCount ?? p.soLuotDanhGia ?? p.reviews) || 0,
          category: p.danhMuc || p.category || '',
          inStock: (p.tonKho ?? p.soLuongTonKho ?? p.stockQuantity) != null ? ((p.tonKho ?? p.soLuongTonKho ?? p.stockQuantity) > 0) : true,
        }));

        // enrich missing image/stock by calling detail endpoint if necessary
        const needsDetail = mapped.filter(m => (m.image == null || m.inStock == null) && m.id);
        if (needsDetail.length > 0) {
          await Promise.all(needsDetail.map(async nf => {
            try {
              const resp = await api.get(`/api/products/${nf.id}/detail`);
              const pd = resp?.data ?? resp;
              if (pd) {
                nf.inStock = (pd.tonKho ?? pd.soLuongTonKho ?? pd.stockQuantity) != null ? ((pd.tonKho ?? pd.soLuongTonKho ?? pd.stockQuantity) > 0) : true;
                let img = pd.hinhAnh || pd.image || (Array.isArray(pd.hinhAnhs) && pd.hinhAnhs[0]?.duongDanHinhAnh) || null;
                if (img && typeof img === 'string' && img.startsWith('/')) img = api.buildUrl(img);
                nf.image = nf.image || img;
                nf.price = nf.price || (pd.gia ?? pd.price ?? nf.price);
                nf.originalPrice = nf.originalPrice || (pd.giaGoc ?? pd.originalPrice ?? nf.originalPrice);
              }
            } catch (e) { /* ignore */ }
          }));
        }

        setFavorites(mapped);
        try { writeFavoritesLocal(user, mapped.map(m => ({ id: m.id }))); } catch (e) {}
        try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: mapped.length } })); } catch (e) {}
      } catch (e) {
        console.debug('Favorites API not available', e);
        try { window.__FAVORITES_API_BROKEN = true; } catch (err) {}
        try {
          const local = readFavoritesWithLegacy(currentUser);
          const mappedLocal = local.map(p => ({ id: p.id ?? p.maSanPham, name: p.name || p.ten || 'Sản phẩm', image: p.image && typeof p.image === 'string' && p.image.startsWith('/') ? api.buildUrl(p.image) : p.image, price: p.price || null, originalPrice: p.originalPrice || null, rating: p.rating || 0, reviews: p.reviews || 0, category: p.category || '', inStock: (p.stockQuantity ?? p.tonKho ?? p.soLuongTonKho) != null ? ((p.stockQuantity ?? p.tonKho ?? p.soLuongTonKho) > 0) : true }));
          setFavorites(mappedLocal);
          try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: mappedLocal.length } })); } catch (e) {}
        } catch (le) { console.debug('local favorites load failed', le); setFavorites([]); }
      }
    };
    loadFavorites();
  }, [currentUser]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const removeFromFavorites = async (id) => {
    const user = currentUser;
    setFavorites(prev => {
      const next = prev.filter(item => String(item.id) !== String(id));
      try {
        const favObjs = readFavoritesLocal(user);
        const filtered = favObjs.filter(f => String(f.id ?? f.maSanPham) !== String(id));
        writeFavoritesLocal(user, filtered);
        try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: filtered.length } })); } catch (e) {}
      } catch (e) { try { window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { count: next.length } })); } catch (e) {} }
      return next;
    });
    try { if (auth?.isAuthenticated) await api.delete(`/api/v1/yeu-thich/${id}`); } catch (e) { /* ignore */ }
  };

  const addToCart = (product) => {
    if (!auth?.isAuthenticated) { window.location.href = '/login'; return false; }
    try {
      const ok = ctxAddToCart(product, null, 1);
      if (ok !== false) { try { window.alert(`Đã thêm "${product.name || 'sản phẩm'}" vào giỏ hàng`); } catch (e) {} }
      return ok;
    } catch (e) { console.error(e); return false; }
  };

  const filteredFavorites = favorites.filter(item => String(item?.name || '').toLowerCase().includes(String(searchTerm || '').toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sản phẩm yêu thích</h1>
          <p className="text-gray-600">Danh sách sản phẩm bạn đã thêm vào yêu thích</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Tìm kiếm sản phẩm yêu thích..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map(item => (
              <ProductCard key={item.id} product={{ id: item.id, name: item.name, image: item.image, collection: item.category, rating: item.rating, reviewCount: item.reviews, price: item.price || 0, originalPrice: item.originalPrice || 0, discount: (item.originalPrice && item.price) ? (item.originalPrice - item.price) : 0, variants: 0, isFavorite: true, inStock: item.inStock !== false }} onAddToCart={() => addToCart(item)} onToggleFavorite={() => removeFromFavorites(item.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoHeart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm yêu thích'}</h3>
            <p className="text-gray-500">{searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy thêm sản phẩm vào yêu thích khi mua sắm'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerFavorites;

