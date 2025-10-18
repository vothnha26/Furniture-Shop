import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { IoArrowBack, IoStar, IoStarOutline, IoHeart, IoHeartOutline, IoShare, IoCart, IoEye, IoCheckmarkCircle, IoWarning, IoEllipsisVertical } from 'react-icons/io5';

const CustomerProductDetail = ({ product: initialProduct, onBack, onAddToCart, onToggleFavorite, onToggleWishlist }) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  // Use the fetched product detail (from API) when available
  const [productState, setProductState] = useState(initialProduct || {});

  // If mounted via route /shop/products/:id, fetch full product details with variants
  const params = useParams();
  useEffect(() => {
    const id = params?.id;
    if (id && (!initialProduct || (!initialProduct.id && !initialProduct.maSanPham))) {
      (async () => {
        try {
          // Gọi API mới để lấy chi tiết đầy đủ với biến thể và giảm giá
          const res = await api.get(`/api/products/${id}/detail`);
          setProductState(res?.data ?? res);
        } catch (err) {
          console.error('Failed to fetch product detail', err);
        }
      })();
    }
  }, [params?.id, initialProduct]);
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '', name: '', photos: [] });
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleVariantSelect = (variant) => {
    // normalize variant fields to a predictable shape
    const norm = normalizeVariant(variant);
    setSelectedVariant(norm);
  };

  // Normalize different variant shapes from backend
  const normalizeVariant = (v) => {
    if (!v) return null;
    const id = v.maBienThe ?? v.id ?? v.variantId ?? v._id ?? v.bienTheId ?? null;

    // Ưu tiên giá sau khi giảm nếu có
    const price = Number(v.giaSauGiam ?? v.giaBan ?? v.gia ?? v.price ?? v.unitPrice) || 0;
    const originalPrice = Number(v.giaBan ?? v.giaGoc ?? v.gia_goc ?? v.originalPrice ?? 0) || 0;
    const stock = Number(v.soLuong ?? v.soLuongTon ?? v.tonKho ?? v.stockQuantity ?? v.quantity ?? 0) || 0;

    // Build tên biến thể from many possible fields
    let name = v.tenBienThe ?? v.ten ?? v.name ?? v.displayName ?? v.variantName ?? v.label;
    // Try to derive from attribute arrays with multiple possible key names
    if (!name && (v.thuocTinh || v.attributes || v.attrs)) {
      const attrs = v.thuocTinh ?? v.attributes ?? v.attrs;
      if (Array.isArray(attrs) && attrs.length > 0) {
        const parts = attrs.map(attr => attr.giaTri ?? attr.value ?? attr.val ?? attr.gia_tri ?? attr.tenThuocTinh ?? (attr.name ? (attr.name + (attr.value ? ': ' + attr.value : '')) : null)).filter(Boolean);
        if (parts.length > 0) name = parts.join(' - ');
      }
    }
    // Fallbacks using color/size fields
    if (!name && (v.mauSac || v.color || v.colorName)) {
      name = `${v.mauSac ?? v.color ?? v.colorName}${v.kichThuoc ? ' - ' + v.kichThuoc : ''}`;
    }
    if (!name && v.sku) {
      name = `SKU ${v.sku}`;
    }
    if (!name) name = 'Phiên bản';
    
    // Tính phần trăm giảm giá
    const discountPercent = v.phanTramGiam ? Math.round(Number(v.phanTramGiam)) : 
                           (originalPrice > price && originalPrice > 0 ? Math.round((1 - price/originalPrice) * 100) : 0);
    
    return {
      ...v,
      id,
      price,
      originalPrice,
      stock,
      name,
      discountPercent,
      attributes: v.thuocTinh ?? v.attributes ?? [],
      discount: v.giamGia ?? v.discount
    };
  };

  // Debug: log normalized variants whenever productState changes (helpful to see backend shape)
  useEffect(() => {
    const variantsArr = Array.isArray(productState.bienThe) ? productState.bienThe : (Array.isArray(productState.variants) ? productState.variants : []);
    if (variantsArr.length > 0) {
      try {
        const norm = variantsArr.map(v => normalizeVariant(v));
        console.debug('[ProductDetail] normalized variants:', norm);
      } catch (e) {
        console.debug('[ProductDetail] failed to normalize variants', e);
      }
    }
  }, [productState]);

  const handleAddToCart = () => {
    // Check if variant is selected
    if (!selectedVariant) {
      alert('Vui lòng chọn phiên bản sản phẩm!');
      return;
    }

    // Check stock
    if (selectedVariant.stock === 0) {
      alert('Sản phẩm này hiện đang hết hàng!');
      return;
    }

    // Check quantity
    if (quantity > selectedVariant.stock) {
      alert(`Số lượng tối đa: ${selectedVariant.stock}`);
      return;
    }

  // Debug: log selected variant details so we can confirm variant id/name
  console.log('[AddToCart] product:', productState?.maSanPham ?? productState?.id, 'variant:', selectedVariant?.id, selectedVariant?.name || selectedVariant?.tenBienThe, 'quantity:', quantity);
  // Add to cart using context
  addToCart(productState, selectedVariant, quantity);

    // Show success message
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);

    // Call parent callback if provided (for backward compatibility)
    const cartItem = {
      ...productState,
      bienTheChon: selectedVariant,
      soLuong: quantity
    };
    onAddToCart?.(cartItem);
  };

  const toggleFavorite = () => {
    setProductState(prev => ({
      ...prev,
      isFavorite: !prev.isFavorite
    }));
    onToggleFavorite?.(productState.maSanPham);
  };

  

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };
  // Determine active price/stock based on selected variant or product-level values
  const basePrice = Number(productState.giaBan ?? productState.gia ?? productState.price) || 0;
  const baseOriginal = Number(productState.giaGoc ?? productState.gia_goc ?? productState.originalPrice) || 0;
  const baseStock = Number(productState.soLuongTonKho ?? productState.tongSoLuong ?? productState.stockQuantity ?? 0) || 0;
  const activePrice = selectedVariant ? (Number(selectedVariant.price) || 0) : basePrice;
  const activeOriginal = selectedVariant ? (Number(selectedVariant.originalPrice) || 0) : baseOriginal;
  const activeStock = selectedVariant ? (Number(selectedVariant.stock) || 0) : baseStock;

  // If productState carries variants and none is selected yet, pick the first one
  useEffect(() => {
    const variantsArr = Array.isArray(productState.bienThe) ? productState.bienThe : (Array.isArray(productState.variants) ? productState.variants : []);
    if ((!selectedVariant || !selectedVariant.id) && variantsArr.length > 0) {
      setSelectedVariant(normalizeVariant(variantsArr[0]));
    }
    // include selectedVariant in deps to satisfy exhaustive-deps; change is idempotent
  }, [productState, selectedVariant]);

  const renderStars = (rating, size = 'w-4 h-4') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i}>
          {i <= rating ? (
            <IoStar className={`${size} text-yellow-400`} />
          ) : (
            <IoStarOutline className={`${size} text-gray-300`} />
          )}
        </span>
      );
    }
    return stars;
  };

  const handleSubmitReview = async () => {
    // Submit review to backend
    try {
      console.log('Submitting review', newReview);
      const productId = productState?.maSanPham || params?.id;
      if (!productId) throw new Error('Không xác định được sản phẩm');

      const payload = {
        sanPham: { maSanPham: Number(productId) },
        diem: newReview.rating,
        tieuDe: newReview.title,
        noiDung: newReview.content
      };

      let resp;
      if (newReview && newReview.id) {
        // Editing an existing review -> use PUT
        resp = await api.put(`/api/v1/reviews/${newReview.id}`, payload);
      } else {
        resp = await api.post('/api/v1/reviews', payload);
      }
      console.debug('Review created', resp?.data ?? resp);

      // Refresh product detail so ratings / counts update immediately
      try {
        const refreshed = await api.get(`/api/products/${productId}/detail`);
        setProductState(refreshed?.data ?? refreshed);
      } catch (fetchErr) {
        console.warn('Unable to refresh product detail after review:', fetchErr);
      }

      setShowReviewModal(false);
      setNewReview({ rating: 5, title: '', content: '', name: '', photos: [] });
    } catch (err) {
      console.error('Failed to submit review', err);
      const msg = err?.response?.data || err?.message || 'Lỗi khi gửi đánh giá';
      alert('Không thể gửi đánh giá: ' + msg);
    }
  };

    const toggleMenu = (id) => {
      setOpenMenuId(prev => (prev === id ? null : id));
    };

  // Expose current user for simple ownership checks (used above) - set from AuthContext if available
  const { user } = useAuth();

  const handleEditReviewClick = (review) => {
    // Prefill modal with review data for editing
    setNewReview({
      rating: review.danhGia || 5,
      title: review.tieuDe || '',
      content: review.noiDung || '',
      name: review.tenKhachHang || '',
      id: review.id ?? review.maDanhGia ?? review.ma_danh_gia
    });
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      const rid = typeof reviewId === 'object' ? (reviewId.id ?? reviewId.maDanhGia ?? reviewId.ma_danh_gia) : reviewId;
      await api.del(`/api/v1/reviews/${rid}`);
      // refresh product
      const productId = productState?.maSanPham || params?.id;
      const refreshed = await api.get(`/api/products/${productId}/detail`);
      setProductState(refreshed?.data ?? refreshed);
    } catch (err) {
      console.error('Failed to delete review', err);
      alert('Không thể xóa đánh giá: ' + (err?.data || err?.message || err));
    }
  };

  // Resolve possibly-relative backend image paths to absolute URLs
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Success notification */}
      {addedToCart && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-down">
          <IoCheckmarkCircle className="w-5 h-5" />
          <span>Đã thêm vào giỏ hàng!</span>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <IoArrowBack className="w-5 h-5" />
        Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            {(() => {
              const source = Array.isArray(productState.hinhAnh) ? (productState.hinhAnh[selectedImage] || productState.hinhAnh[0]) : (Array.isArray(productState.images) ? (productState.images[selectedImage] || productState.images[0]) : productState.image);
              const src = resolveImageUrl(source);
              if (src) {
                return (
                  <img src={src} alt={productState.tenSanPham} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }} />
                );
              }
              return (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {(
              Array.isArray(productState.hinhAnh) ? productState.hinhAnh : (
                Array.isArray(productState.images) ? productState.images : []
              )
            ).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                  {(() => { const s = resolveImageUrl(image); return s ? (<img src={s} alt={`${productState.tenSanPham} ${index + 1}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }} />) : (<div className="w-full h-full bg-gray-100 flex items-center justify-center"><span className="text-gray-400 text-xs">No image</span></div>); })()}
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {productState.tenSanPham}
            </h1>
            <p className="text-gray-600 mb-4">Mã sản phẩm: {productState.maSanPham}</p>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(productState.danhGia)}
                <span className="text-sm text-gray-600 ml-1">
                  {productState.danhGia} ({productState.soLuotDanhGia} đánh giá)
                </span>
              </div>
              
              {/* view count removed as requested */}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600">
                  {formatCurrency(activePrice)}
                </span>
                {activeOriginal > activePrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatCurrency(activeOriginal)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                      -{Math.round((1 - (activePrice / activeOriginal || 1)) * 100)}%
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {activeStock > 0 ? (
                  <>
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">Còn hàng ({activeStock} sản phẩm)</span>
                  </>
                ) : (
                  <>
                    <IoWarning className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 font-medium">Hết hàng</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Variants Selection */}
          {((productState.bienThe || productState.variants) || []).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Chọn phiên bản:</h3>
              <div className="space-y-3">
                {(productState.bienThe || productState.variants || []).map((variantRaw) => {
                  const v = normalizeVariant(variantRaw);
                  const isSelected = selectedVariant && (selectedVariant.id === v.id || selectedVariant.maBienThe === v.id);
                  return (
                    <div
                      key={v.id ?? JSON.stringify(v)}
                      onClick={() => handleVariantSelect(variantRaw)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{v.name}</div>
                          {/* Hiển thị thuộc tính của biến thể */}
                          {v.attributes && v.attributes.length > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              {v.attributes.map((attr, idx) => (
                                <span key={idx}>
                                  {attr.tenThuocTinh}: <span className="font-medium">{attr.giaTri}</span>
                                  {idx < v.attributes.length - 1 ? ' • ' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Fallback: show old format if no attributes array */}
                          {(!v.attributes || v.attributes.length === 0) && variantRaw.mauSac && (
                            <div className="text-sm text-gray-600">{variantRaw.mauSac}{variantRaw.kichThuoc ? ' • ' + variantRaw.kichThuoc : ''}</div>
                          )}
                          {/* Hiển thị giảm giá nếu có */}
                          {v.discount && (
                            <div className="text-xs text-green-600 mt-1">
                              🎉 {v.discount.tenChuongTrinh}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <div className="font-semibold text-red-600">
                              {formatCurrency(v.price)}
                            </div>
                            {v.originalPrice > v.price && (
                              <>
                                <div className="text-sm text-gray-500 line-through">
                                  {formatCurrency(v.originalPrice)}
                                </div>
                                <div className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                  -{v.discountPercent}%
                                </div>
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Còn {v.stock} sản phẩm</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Số lượng:
                </label>
                {selectedVariant && isInCart(selectedVariant.id) && (
                  <span className="text-sm text-blue-600">
                    Đã có {getItemQuantity(selectedVariant.id)} trong giỏ
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  (Tối đa {selectedVariant?.stock ?? productState.soLuongTonKho ?? productState.stockQuantity ?? 0} sản phẩm)
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={activeStock === 0 || !selectedVariant}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeStock === 0 || !selectedVariant
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : addedToCart
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {addedToCart ? (
                  <>
                    <IoCheckmarkCircle className="w-5 h-5" />
                    Đã thêm vào giỏ
                  </>
                ) : (
                  <>
                    <IoCart className="w-5 h-5" />
                    {!selectedVariant ? 'Chọn phiên bản' : 'Thêm vào giỏ hàng'}
                  </>
                )}
              </button>
              
              <button
                onClick={toggleFavorite}
                className={`p-3 border rounded-lg ${
                  productState.isFavorite
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                }`}
              >
                {productState.isFavorite ? (
                  <IoHeart className="w-5 h-5" />
                ) : (
                  <IoHeartOutline className="w-5 h-5" />
                )}
              </button>

              <button className="p-3 border border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-500">
                <IoShare className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Features */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Miễn phí vận chuyển</span>
            </div>
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Bảo hành 24 tháng</span>
            </div>
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Lắp đặt tận nơi</span>
            </div>
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Đổi trả trong 7 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="border-t pt-8">
        <div className="flex space-x-8 border-b mb-6">
          {[
            { id: 'description', label: 'Mô tả sản phẩm' },
            { id: 'specifications', label: 'Thông số kỹ thuật' },
            { id: 'reviews', label: `Đánh giá (${productState.soLuotDanhGia})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-8">
          {activeTab === 'description' && (
            <div className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{productState.moTa}</p>
                
                {showFullDescription && (
                  <div 
                    className="mt-4 text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: productState.moTaChiTiet }}
                  />
                )}
                
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productState.thongSoKyThuat && Array.isArray(productState.thongSoKyThuat) ? (
                // New format: array of {tenThuocTinh, giaTriList}
                productState.thongSoKyThuat.map((spec, index) => (
                  <div key={index} className="flex py-3 border-b border-gray-200">
                    <div className="w-1/2 text-gray-600 font-medium">{spec.tenThuocTinh}:</div>
                    <div className="w-1/2 text-gray-900">
                      {Array.isArray(spec.giaTriList) 
                        ? spec.giaTriList.join(', ') 
                        : spec.giaTriList}
                    </div>
                  </div>
                ))
              ) : (
                // Old format: object with key-value pairs
                Object.entries(productState.thongSoKyThuat || {}).map(([key, value]) => (
                  <div key={key} className="flex py-3 border-b border-gray-200">
                    <div className="w-1/2 text-gray-600 font-medium">{key}:</div>
                    <div className="w-1/2 text-gray-900">{value}</div>
                  </div>
                ))
              )}
              {(!productState.thongSoKyThuat || 
                (Array.isArray(productState.thongSoKyThuat) && productState.thongSoKyThuat.length === 0) ||
                (!Array.isArray(productState.thongSoKyThuat) && Object.keys(productState.thongSoKyThuat).length === 0)) && (
                <div className="col-span-2 text-center text-gray-500 py-8">
                  Chưa có thông số kỹ thuật
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {productState.danhGia}
                    </div>
                    <div className="flex justify-center mb-2">
                      {renderStars(productState.danhGia, 'w-5 h-5')}
                    </div>
                    <div className="text-gray-600">
                      {productState.soLuotDanhGia} đánh giá
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const ratings = productState.danhGiaKhachHang || [];
                      const count = ratings.filter(r => r.danhGia === star).length;
                      const percentage = ratings.length === 0 ? 0 : (count / ratings.length) * 100;
                      
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-sm w-2">{star}</span>
                          <IoStar className="w-4 h-4 text-yellow-400" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Write Review Button */}
              <div className="text-center">
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Viết đánh giá
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {(productState.danhGiaKhachHang || []).map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 relative">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {review.tenKhachHang.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{review.tenKhachHang}</h4>
                          <div className="flex">
                            {renderStars(review.danhGia)}
                          </div>
                          <span className="text-sm text-gray-500">{review.ngayDanhGia}</span>
                          {/* 3-dot menu: show only if current user is review owner */}
                          { user && (user.maKhachHang || user.ma_khach_hang) && (() => {
                              const currentId = user.maKhachHang || user.ma_khach_hang;
                              if (review.maKhachHang && review.maKhachHang === currentId) {
                                const rid = review.id ?? review.maDanhGia ?? review.ma_danh_gia;
                                return (
                                  <div className="ml-auto relative">
                                    <>
                                      <button onClick={(e) => { e.stopPropagation(); toggleMenu(rid); }} className="text-gray-500 hover:text-gray-800 px-2" aria-label="Actions">
                                        <IoEllipsisVertical className="w-5 h-5" />
                                      </button>
                                      {openMenuId === rid && (
                                        <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-md z-50">
                                          <button onClick={(e) => { e.stopPropagation(); toggleMenu(null); handleEditReviewClick(review); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Sửa</button>
                                          <button onClick={(e) => { e.stopPropagation(); toggleMenu(null); handleDeleteReview(rid); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Xóa</button>
                                        </div>
                                      )}
                                    </>
                                  </div>
                                );
                              }
                              return null;
                            })()
                          }
                        </div>
                        
                        <h5 className="font-medium mb-2">{review.tieuDe}</h5>
                        <p className="text-gray-700 mb-3">{review.noiDung}</p>
                        
                        {review.bienThe && (
                          <p className="text-sm text-gray-500 mb-2">
                            Phiên bản: {review.bienThe}
                          </p>
                        )}
                        
                        {(review.hinhAnh || []).length > 0 && (
                          <div className="flex gap-2">
                            {review.hinhAnh.map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt={`Review ${index + 1}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
        {productState.sanPhamLienQuan && productState.sanPhamLienQuan.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productState.sanPhamLienQuan.map((relatedProduct) => {
              const relPrice = relatedProduct.giaMin || relatedProduct.giaBan || 0;
              const relOriginal = relatedProduct.giaMax || relatedProduct.giaGoc || relPrice;
              const relImage = resolveImageUrl(relatedProduct.hinhAnh || relatedProduct.image);
              
              return (
                <div 
                  key={relatedProduct.maSanPham} 
                  className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    // Navigate to related product
                    window.location.href = `/shop/products/${relatedProduct.maSanPham}`;
                  }}
                >
                  {relImage ? (
                    <img
                      src={relImage}
                      alt={relatedProduct.tenSanPham}
                      className="w-full h-48 object-cover"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 h-12">{relatedProduct.tenSanPham}</h3>
                    
                    {relatedProduct.danhGia && (
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(relatedProduct.danhGia)}
                        <span className="text-sm text-gray-600">
                          ({relatedProduct.soLuotDanhGia || 0})
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {relatedProduct.giaMin && relatedProduct.giaMax && relatedProduct.giaMin !== relatedProduct.giaMax ? (
                        <span className="text-lg font-bold text-red-600">
                          {formatCurrency(relatedProduct.giaMin)} - {formatCurrency(relatedProduct.giaMax)}
                        </span>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-red-600">
                            {formatCurrency(relPrice)}
                          </span>
                          {relOriginal > relPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(relOriginal)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    
                    {relatedProduct.soLuongTon !== undefined && (
                      <div className="text-sm text-gray-600 mt-2">
                        {relatedProduct.soLuongTon > 0 ? (
                          <span className="text-green-600">Còn hàng</span>
                        ) : (
                          <span className="text-red-600">Hết hàng</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Không có sản phẩm liên quan
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Viết đánh giá</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Đánh giá</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview({...newReview, rating: star})}
                      >
                        {star <= newReview.rating ? (
                          <IoStar className="w-6 h-6 text-yellow-400" />
                        ) : (
                          <IoStarOutline className="w-6 h-6 text-gray-300" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tên của bạn</label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên của bạn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề đánh giá"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nội dung</label>
                  <textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Gửi đánh giá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProductDetail;
