import React, { useState, useEffect } from 'react';
import { IoArrowBack, IoStar, IoStarOutline, IoHeart, IoHeartOutline, IoShare, IoCart, IoEye, IoCheckmarkCircle, IoWarning, IoImage, IoResize, IoColorPalette, IoTime } from 'react-icons/io5';
import api from '../../api';

const CustomerProductDetail = ({ product: initialProduct, onBack, onAddToCart, onToggleFavorite, onToggleWishlist }) => {
  const [product, setProduct] = useState(initialProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    name: '',
    photos: []
  });

  // Map product detail from API
  const mapProductDetailFromApi = (productData) => ({
    id: productData.maSanPham || productData.id,
    name: productData.tenSanPham || productData.name,
    category: productData.danhMuc?.tenDanhMuc || productData.category,
    price: productData.giaBan || productData.price || 0,
    originalPrice: productData.giaGoc || productData.originalPrice || 0,
    discount: productData.phanTramGiamGia || 0,
    rating: productData.danhGiaTrungBinh || productData.rating || 5,
    reviewCount: productData.soLuongDanhGia || productData.reviewCount || 0,
    description: productData.moTaChiTiet || productData.description || '',
    specifications: productData.thongSoKyThuat || productData.specifications || {},
    images: productData.hinhAnhList?.map(img => img.duongDan) || productData.images || [],
    variants: productData.bienTheList?.map(variant => ({
      id: variant.maBienThe,
      name: variant.tenBienThe,
      price: variant.giaBan,
      originalPrice: variant.giaGoc,
      stock: variant.tonKho,
      attributes: variant.thuocTinhList?.map(attr => ({
        name: attr.thuocTinh?.tenThuocTinh,
        value: attr.giaTri?.giaTri
      })) || []
    })) || [],
    inStock: productData.tonKho > 0,
    stockCount: productData.tonKho || 0
  });

  // Fetch product details
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!initialProduct?.id) return;
      
      setIsLoading(true);
      try {
        const data = await api.get(`/api/products/${initialProduct.id}/detail`);
        setProduct(mapProductDetailFromApi(data));
      } catch (err) {
        console.error('Fetch product detail error', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetail();
  }, [initialProduct?.id]);

  // Fetch product reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!initialProduct?.id) return;
      
      try {
        const data = await api.get(`/api/products/${initialProduct.id}/reviews`);
        if (Array.isArray(data)) {
          setReviews(data.map(review => ({
            id: review.maDanhGia,
            customerName: review.khachHang?.hoTen || 'Ẩn danh',
            rating: review.danhGia,
            title: review.tieuDe,
            content: review.noiDung,
            date: review.ngayTao,
            images: review.hinhAnhList || []
          })));
        }
      } catch (err) {
        console.error('Fetch reviews error', err);
      }
    };
    fetchReviews();
  }, [initialProduct?.id]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!initialProduct?.id) return;
      
      try {
        const data = await api.get(`/api/products/${initialProduct.id}/related`);
        if (Array.isArray(data)) {
          setRelatedProducts(data.map(prod => ({
            id: prod.maSanPham,
            name: prod.tenSanPham,
            price: prod.giaBan,
            originalPrice: prod.giaGoc,
            image: prod.hinhAnhChinh,
            rating: prod.danhGiaTrungBinh || 5,
            reviewCount: prod.soLuongDanhGia || 0
          })));
        }
      } catch (err) {
        console.error('Fetch related products error', err);
      }
    };
    fetchRelatedProducts();
  }, [initialProduct?.id]);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Mock product data with full details
  const productDetail = {
    maSanPham: 'SP001',
    tenSanPham: 'Bộ sofa góc L hiện đại Milan',
    giaBan: 15500000,
    giaGoc: 18500000,
    moTa: 'Bộ sofa góc L hiện đại Milan được thiết kế với phong cách tối giản, sang trọng. Khung gỗ thông cao cấp kết hợp với đệm mút memory foam mang lại cảm giác êm ái, thoải mái. Bọc da PU cao cấp chống thấm nước, dễ vệ sinh. Thiết kế góc L tối ưu không gian phòng khách.',
    moTaChiTiet: `
      <h3>Đặc điểm nổi bật:</h3>
      <ul>
        <li>Khung gỗ thông tự nhiên cao cấp, chịu lực tốt</li>
        <li>Đệm mút memory foam dày 12cm, ôm sát cơ thể</li>
        <li>Bọc da PU cao cấp, chống thấm nước và dễ vệ sinh</li>
        <li>Thiết kế góc L tối ưu hóa không gian phòng khách</li>
        <li>Màu sắc đa dạng phù hợp mọi phong cách nội thất</li>
      </ul>
      
      <h3>Hướng dẫn bảo quản:</h3>
      <ul>
        <li>Vệ sinh định kỳ bằng khăn ẩm</li>
        <li>Tránh để nơi ẩm ướt hoặc ánh nắng trực tiếp</li>
        <li>Sử dụng chất tẩy rửa chuyên dụng khi cần thiết</li>
      </ul>
    `,
    hinhAnh: [
      '/api/placeholder/600/400',
      '/api/placeholder/600/400', 
      '/api/placeholder/600/400',
      '/api/placeholder/600/400',
      '/api/placeholder/600/400'
    ],
    danhGia: 4.5,
    soLuotDanhGia: 128,
    soLuongTonKho: 15,
    trangThai: 'con_hang',
    bienThe: [
      {
        maBienThe: 'BT001',
        mauSac: 'Nâu đậm',
        kichThuoc: '220x160x85cm',
        soLuong: 8,
        gia: 15500000
      },
      {
        maBienThe: 'BT002', 
        mauSac: 'Xám nhạt',
        kichThuoc: '220x160x85cm',
        soLuong: 5,
        gia: 15500000
      },
      {
        maBienThe: 'BT003',
        mauSac: 'Đen',
        kichThuoc: '240x180x85cm', 
        soLuong: 2,
        gia: 17500000
      }
    ],
    thongSoKyThuat: {
      'Chất liệu khung': 'Gỗ thông tự nhiên',
      'Chất liệu đệm': 'Mút memory foam',
      'Chất liệu bọc': 'Da PU cao cấp',
      'Kích thước': '220x160x85cm (DxRxC)',
      'Trọng lượng': '95kg',
      'Màu sắc': 'Nâu, Xám, Đen',
      'Xuất xứ': 'Việt Nam',
      'Bảo hành': '24 tháng',
      'Phong cách': 'Hiện đại, tối giản'
    },
    danhGiaKhachHang: [
      {
        id: 1,
        tenKhachHang: 'Nguyễn Văn An',
        danhGia: 5,
        tieuDe: 'Sản phẩm tuyệt vời!',
        noiDung: 'Chất lượng sofa rất tốt, đúng như mô tả. Giao hàng nhanh, lắp đặt tận nơi. Gia đình tôi rất hài lòng.',
        ngayDanhGia: '2024-01-10',
        hinhAnh: ['/api/placeholder/150/150', '/api/placeholder/150/150'],
        bienThe: 'Nâu đậm - 220x160x85cm'
      },
      {
        id: 2,
        tenKhachHang: 'Trần Thị Bình', 
        danhGia: 4,
        tieuDe: 'Đẹp và chất lượng',
        noiDung: 'Sofa đẹp, ngồi thoải mái. Màu sắc đúng như hình. Chỉ có điều thời gian giao hàng hơi lâu.',
        ngayDanhGia: '2024-01-08',
        hinhAnh: ['/api/placeholder/150/150'],
        bienThe: 'Xám nhạt - 220x160x85cm'
      },
      {
        id: 3,
        tenKhachHang: 'Lê Minh Cường',
        danhGia: 5,
        tieuDe: 'Đáng tiền',
        noiDung: 'Giá cả hợp lý so với chất lượng. Thiết kế hiện đại, phù hợp với phòng khách nhà tôi.',
        ngayDanhGia: '2024-01-05',
        hinhAnh: [],
        bienThe: 'Đen - 240x180x85cm'
      }
    ],
    sanPhamLienQuan: [
      {
        maSanPham: 'SP002',
        tenSanPham: 'Bàn trà kính cường lực',
        giaBan: 2500000,
        giaGoc: 3000000,
        hinhAnh: '/api/placeholder/300/200',
        danhGia: 4.3
      },
      {
        maSanPham: 'SP003', 
        tenSanPham: 'Thảm trải sàn cao cấp',
        giaBan: 1200000,
        giaGoc: 1500000,
        hinhAnh: '/api/placeholder/300/200',
        danhGia: 4.7
      },
      {
        maSanPham: 'SP004',
        tenSanPham: 'Đèn trang trí phòng khách',
        giaBan: 800000,
        giaGoc: 1000000,
        hinhAnh: '/api/placeholder/300/200', 
        danhGia: 4.2
      }
    ],
    isFavorite: false,
    isInWishlist: false
  };

  const [productState, setProductState] = useState(productDetail);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = () => {
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

  const toggleWishlist = () => {
    setProductState(prev => ({
      ...prev,
      isInWishlist: !prev.isInWishlist
    }));
    onToggleWishlist?.(productState.maSanPham);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getDiscountPercent = () => {
    if (!productState.giaGoc || productState.giaGoc <= productState.giaBan) return 0;
    return Math.round((1 - productState.giaBan / productState.giaGoc) * 100);
  };

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

  const handleSubmitReview = () => {
    // Logic to submit review
    console.log('Submit review:', newReview);
    setShowReviewModal(false);
    setNewReview({
      rating: 5,
      title: '',
      content: '',
      name: '',
      photos: []
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
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
            <img
              src={productState.hinhAnh[selectedImage]}
              alt={productState.tenSanPham}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {productState.hinhAnh.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={image}
                  alt={`${productState.tenSanPham} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
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
              
              <div className="flex items-center gap-2">
                <IoEye className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">1,245 lượt xem</span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600">
                  {formatCurrency(productState.giaBan)}
                </span>
                {productState.giaGoc > productState.giaBan && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatCurrency(productState.giaGoc)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                      -{getDiscountPercent()}%
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {productState.soLuongTonKho > 0 ? (
                  <>
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">
                      Còn hàng ({productState.soLuongTonKho} sản phẩm)
                    </span>
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
          {productState.bienThe && productState.bienThe.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Chọn phiên bản:</h3>
              <div className="space-y-3">
                {productState.bienThe.map((variant) => (
                  <div
                    key={variant.maBienThe}
                    onClick={() => handleVariantSelect(variant)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVariant?.maBienThe === variant.maBienThe
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{variant.mauSac}</div>
                        <div className="text-sm text-gray-600">{variant.kichThuoc}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-600">
                          {formatCurrency(variant.gia)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Còn {variant.soLuong} sản phẩm
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng:
              </label>
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
                  (Tối đa {selectedVariant?.soLuong || productState.soLuongTonKho} sản phẩm)
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={productState.soLuongTonKho === 0}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <IoCart className="w-5 h-5" />
                Thêm vào giỏ hàng
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
              {Object.entries(productState.thongSoKyThuat).map(([key, value]) => (
                <div key={key} className="flex py-3 border-b border-gray-200">
                  <div className="w-1/2 text-gray-600 font-medium">{key}:</div>
                  <div className="w-1/2 text-gray-900">{value}</div>
                </div>
              ))}
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
                      const count = productState.danhGiaKhachHang.filter(r => r.danhGia === star).length;
                      const percentage = (count / productState.danhGiaKhachHang.length) * 100;
                      
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
                {productState.danhGiaKhachHang.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6">
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
                        </div>
                        
                        <h5 className="font-medium mb-2">{review.tieuDe}</h5>
                        <p className="text-gray-700 mb-3">{review.noiDung}</p>
                        
                        {review.bienThe && (
                          <p className="text-sm text-gray-500 mb-2">
                            Phiên bản: {review.bienThe}
                          </p>
                        )}
                        
                        {review.hinhAnh.length > 0 && (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productState.sanPhamLienQuan.map((relatedProduct) => (
            <div key={relatedProduct.maSanPham} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={relatedProduct.hinhAnh}
                alt={relatedProduct.tenSanPham}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{relatedProduct.tenSanPham}</h3>
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(relatedProduct.danhGia)}
                  <span className="text-sm text-gray-600">({relatedProduct.danhGia})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(relatedProduct.giaBan)}
                  </span>
                  {relatedProduct.giaGoc > relatedProduct.giaBan && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(relatedProduct.giaGoc)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
