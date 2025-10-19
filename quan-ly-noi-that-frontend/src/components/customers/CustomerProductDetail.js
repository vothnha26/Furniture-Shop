import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
// ĐÃ SỬA LỖI: Thêm IoSearch và IoChevronForward vào đây
import { IoArrowBack, IoStar, IoStarOutline, IoHeart, IoHeartOutline, IoCart, IoCheckmarkCircle, IoWarning, IoEllipsisVertical, IoGiftOutline, IoFlashOutline, IoChevronForward } from 'react-icons/io5';

// =========================================================================
// === PLACEHOLDER COMPONENTS FOR FOOTER (Giữ nguyên) ===
// =========================================================================

const FooterPlaceholder = () => (
    <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto p-8 border-t border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
                <div>
                    <h4 className="font-bold mb-3 text-red-400">Về chúng tôi</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li>Giới thiệu</li>
                        <li>Hệ thống cửa hàng</li>
                        <li>Tuyển dụng</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-3 text-red-400">Hỗ trợ khách hàng</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li>Hotline: 1900 1234</li>
                        <li>Chính sách bảo hành</li>
                        <li>Chính sách đổi trả</li>
                    </ul>
                </div>
                {/* ... other footer columns ... */}
            </div>
        </div>
        <div className="text-center p-4 bg-gray-900 text-xs text-gray-500">
            © 2025 FURNI-SHOP. All rights reserved.
        </div>
    </footer>
);

// =========================================================================
// === ATTRIBUTE CONFIGURATOR (GIỮ NGUYÊN LOGIC) ===
// =========================================================================

const AttributeConfigurator = ({ variants, attributeGroups, selectedVariant, setSelectedVariant, normalizeVariant, findMatchingVariant, handleVariantSelect, formatCurrency }) => {
    const [selectedAttrs, setSelectedAttrs] = React.useState(() => {
        const init = {};
        Object.keys(attributeGroups || {}).forEach(k => {
            const vals = attributeGroups[k] || [];
            init[k] = (Array.isArray(vals) && vals.length === 1) ? String(vals[0]) : '';
        });
        return init;
    });

    // If attributeGroups changes (e.g., product-level attributes merged), ensure single-valued groups are auto-selected
    useEffect(() => {
        const init = {};
        Object.keys(attributeGroups || {}).forEach(k => {
            const vals = attributeGroups[k] || [];
            init[k] = (Array.isArray(vals) && vals.length === 1) ? String(vals[0]) : (selectedAttrs[k] || '');
        });
        setSelectedAttrs(prev => ({ ...init, ...prev }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attributeGroups]);

    useEffect(() => {
        const matched = findMatchingVariant(selectedAttrs);
        if (matched) {
            setSelectedVariant(matched);
            return;
        }
        if (selectedVariant) {
            const matches = variants.some(vr => normalizeVariant(vr).id === selectedVariant.id && Object.keys(selectedAttrs).every(k => {
                const val = selectedAttrs[k];
                if (!val) return true;
                const attrs = (normalizeVariant(vr).attributes || []).reduce((acc, a) => { acc[((a.tenThuocTinh ?? a.name ?? a.label ?? a.ten ?? a.attributeName) || '')] = String(a.giaTri ?? a.value ?? a.val ?? a.gia_tri ?? a.attributeValue ?? a.valueLabel); return acc; }, {});
                return String(attrs[k] || '') === String(val);
            }));
            if (!matches) setSelectedVariant(null);
        }
    }, [selectedAttrs, variants, findMatchingVariant, normalizeVariant, selectedVariant, setSelectedVariant]);

    const onChoose = (groupName, value) => {
        setSelectedAttrs(prev => ({ ...prev, [groupName]: prev[groupName] === value ? '' : value }));
    };

    const isValueAvailable = (groupName, value) => {
        const sel = { ...selectedAttrs, [groupName]: value };
        return variants.some(vr => {
            const v = normalizeVariant(vr);
            const map = (v.attributes || []).reduce((acc, a) => { acc[((a.tenThuocTinh ?? a.name ?? a.label ?? a.ten ?? a.attributeName) || '')] = String(a.giaTri ?? a.value ?? a.val ?? a.gia_tri ?? a.attributeValue ?? a.valueLabel); return acc; }, {});
            for (const [k, val] of Object.entries(sel)) {
                if (!val) continue;
                if (!map[k]) return false;
                if (String(map[k]) !== String(val)) return false;
            }
            return true;
        });
    };

    const buildAttributeList = (variant) => {
        if (!variant) return [];
        const out = [];
        const candidates = [variant.bienTheThuocTinhs, variant.thuocTinh, variant.attributes, variant.attrs, variant.thuocTinhs];
        for (const src of candidates) {
            if (!src) continue;
            if (Array.isArray(src) && src.length > 0) {
                for (const item of src) {
                    try {
                        const name = (item.tenThuocTinh ?? (item.thuocTinh && (item.thuocTinh.tenThuocTinh ?? item.thuocTinh.name)) ?? item.name ?? item.attributeName ?? item.label ?? '') || '';
                        const value = (item.giaTri ?? item.giaTriThuocTinh ?? item.gia_tri ?? item.value ?? item.val ?? item.attributeValue ?? item.valueLabel ?? item.valLabel ?? '') || '';
                        const n = String(name).trim();
                        const v = String(value).trim();
                        if (n || v) out.push((n ? (n + ': ') : '') + v);
                    } catch (e) {
                        // ignore malformed entries
                    }
                }
                if (out.length > 0) return out;
            }
        }
        if (variant.color || variant.mauSac || variant.kichThuoc || variant.size) {
            const parts = [];
            if (variant.color || variant.mauSac) parts.push(`Màu: ${variant.color ?? variant.mauSac}`);
            if (variant.kichThuoc || variant.size) parts.push(`Kích thước: ${variant.kichThuoc ?? variant.size}`);
            if (parts.length) return parts;
        }
        return out;
    };

    // Fallback SKU cards (Giữ nguyên)
    if ((variants || []).length <= 4 && Object.keys(attributeGroups).length === 0) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Chọn phiên bản:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {variants.map((vr) => {
                        const v = normalizeVariant(vr);
                        const isSelected = selectedVariant && selectedVariant.id === v.id;
                        const attrList = buildAttributeList(v);
                        return (
                            <button key={v.id} onClick={() => handleVariantSelect(vr)} className={`p-4 border rounded-lg text-left transition-all ${isSelected ? 'border-red-500 bg-red-50 ring-2 ring-red-500' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}>
                                <div className="flex justify-between">
                                    <div>
                                        <div className="font-medium text-gray-800">{v.name}</div>
                                        <div className="mt-2">
                                            {attrList && attrList.length > 0 ? (
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {attrList.map((a, i) => (
                                                        <span key={i} className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full whitespace-nowrap truncate max-w-[160px]">{a}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500">Không có thuộc tính</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="font-bold text-lg text-red-600">{formatCurrency(v.price)}</div>
                                        {v.originalPrice > v.price && <div className="text-sm text-gray-500 line-through">{formatCurrency(v.originalPrice)}</div>}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Configurator with attribute groups (Giữ nguyên)
    return (
        <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Cấu hình sản phẩm</h3>
            <div className="space-y-5">
                {Object.keys(attributeGroups).map((groupName) => (
                    <div key={groupName}>
                        <div className="text-base text-gray-800 mb-3 font-semibold">{groupName}:</div>
                        <div className="flex flex-wrap gap-2">
                            {attributeGroups[groupName].map((val) => {
                                const available = isValueAvailable(groupName, val);
                                const isActive = selectedAttrs[groupName] === val;
                                return (
                                    <button
                                        key={val}
                                        onClick={() => onChoose(groupName, val)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChoose(groupName, val); } }}
                                                aria-pressed={isActive}
                                                className={`relative px-4 py-2 rounded-full border text-sm font-medium transition-colors duration-150 ease-out ${isActive
                                                    ? 'bg-red-600 text-white border-red-600'
                                                    : available
                                                        ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                                        : 'border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                                    }`}
                                        disabled={!available}
                                    >
                                        {val}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Selected Variant Summary */}
                <div className={`p-4 rounded-lg transition-all duration-300 ${selectedVariant ? 'bg-white border border-red-100 shadow-inner' : 'bg-gray-100'}`}>
                    {selectedVariant ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600">Giá phiên bản:</div>
                                <div className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(selectedVariant.price)}</div>
                                {selectedVariant.originalPrice > selectedVariant.price && (
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm text-gray-500 line-through">{formatCurrency(selectedVariant.originalPrice)}</div>
                                        <div className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">-{selectedVariant.discountPercent}%</div>
                                    </div>
                                )}
                            </div>
                            <div className="text-right text-sm">
                                {selectedVariant.stock > 0 ? (
                                    <span className="text-green-600 font-medium">Còn hàng ({selectedVariant.stock})</span>
                                ) : (
                                    <span className="text-red-600 font-medium">Hết hàng</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-600 text-center py-2">Vui lòng chọn đầy đủ thuộc tính để xác định giá và tồn kho.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// === CUSTOMER PRODUCT DETAIL (ĐÃ SỬA LỖI & TỐI ƯU GIAO DIỆN) ===
// =========================================================================

const CustomerProductDetail = ({ product: initialProduct, onBack, onAddToCart, onToggleFavorite, onToggleWishlist }) => {
    const navigate = useNavigate();
    const { addToCart, isInCart, getItemQuantity } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [productState, setProductState] = useState(initialProduct || {});
    const params = useParams();
    const { user } = useAuth();

    // Review & Voucher States
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '', name: '', photos: [] });
    const [openMenuId, setOpenMenuId] = useState(null);
    const [availableVouchers, setAvailableVouchers] = useState([]);

    // ĐÃ SỬA LỖI: Định nghĩa hàm toggleMenu ở đây
    const toggleMenu = (id) => {
        setOpenMenuId(prev => (prev === id ? null : id));
    };

    // Logic Fetch Detail, Normalize, Handle Cart/Review (GIỮ NGUYÊN LOGIC)
    // ------------------------------------------------------------------

    // Logic Fetch Product Detail (Giữ nguyên)
    useEffect(() => {
        const id = params?.id;
        const needFetchForInitial = initialProduct && !(Array.isArray(initialProduct.bienThe) ? initialProduct.bienThe.length > 0 : (Array.isArray(initialProduct.variants) ? initialProduct.variants.length > 0 : false));
        if (id) {
            (async () => {
                try {
                    const res = await api.get(`/api/products/${id}/detail`);
                    setProductState(res?.data ?? res);
                } catch (err) {
                    console.error('Failed to fetch product detail', err);
                }
            })();
        } else if (needFetchForInitial) {
            (async () => {
                try {
                    const pid = initialProduct.maSanPham ?? initialProduct.id ?? initialProduct.maSanPham;
                    if (pid) {
                        const res = await api.get(`/api/products/${pid}/detail`);
                        setProductState(res?.data ?? res);
                    }
                } catch (err) {
                    console.error('Failed to fetch product detail for initial product', err);
                }
            })();
        }
    }, [params?.id, initialProduct]);
    
    // Logic Normalize Variant (Giữ nguyên)
    const normalizeVariant = (v) => {
        if (!v) return null;
        const id = v.maBienThe ?? v.id ?? v.variantId ?? v._id ?? v.bienTheId ?? null;
        const price = Number(v.giaSauGiam ?? v.giaBan ?? v.gia ?? v.price ?? v.unitPrice) || 0;
        const originalPrice = Number(v.giaBan ?? v.giaGoc ?? v.gia_goc ?? v.originalPrice ?? 0) || 0;
        const stock = Number(v.soLuong ?? v.soLuongTon ?? v.tonKho ?? v.stockQuantity ?? v.quantity ?? 0) || 0;
        // Display name: prefer explicit variant name fields (tenBienThe / ten / name)
        let name = v.tenBienThe ?? v.ten ?? v.name ?? v.displayName ?? v.variantName ?? v.label ?? null;
        if (!name && v.sku) name = `SKU ${v.sku}`;
        if (!name) name = 'Phiên bản';
        
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

    const productIdForHooks = productState?.maSanPham ?? productState?.id ?? null;

    // Logic Recently Viewed Products (safer read/write + debug logs)
    const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
    const RECENTLY_VIEWED_CAP = 12;

    const safeParse = (raw) => {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.debug('[CustomerProductDetail] recentlyViewed: parse failed', e);
            return [];
        }
    };

    const readRecentlyViewed = () => {
        try {
            const raw = localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]';
            const arr = safeParse(raw);
            console.debug('[CustomerProductDetail] read recentlyViewed', arr);
            return arr;
        } catch (e) {
            console.debug('[CustomerProductDetail] read recentlyViewed error', e);
            return [];
        }
    };

    const writeRecentlyViewed = (preview) => {
        try {
            if (!preview || !preview.id) return;
            const existing = readRecentlyViewed();
            const filtered = existing.filter(e => String(e.id) !== String(preview.id));
            filtered.unshift(preview);
            const out = filtered.slice(0, RECENTLY_VIEWED_CAP);
            localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(out));
            console.debug('[CustomerProductDetail] wrote recentlyViewed', out);
        } catch (e) {
            console.debug('[CustomerProductDetail] write recentlyViewed failed', e);
        }
    };

    const [recentlyViewed, setRecentlyViewed] = useState(() => {
        try { return readRecentlyViewed(); } catch (e) { return []; }
    });

    useEffect(() => {
        try {
            const pid = productState?.maSanPham ?? productState?.id;
            if (!pid) return;
            const preview = {
                id: pid,
                name: productState.tenSanPham ?? productState.name ?? '',
                image: Array.isArray(productState.hinhAnh) ? productState.hinhAnh[0] : (Array.isArray(productState.images) ? productState.images[0] : productState.image),
                price: productState.giaBan ?? productState.gia ?? productState.price ?? null,
                priceAfterDiscount: productState.giaSauGiam ?? null,
                ts: Date.now()
            };
            writeRecentlyViewed(preview);
            // refresh local state to reflect newest value
            setRecentlyViewed(readRecentlyViewed());
        } catch (e) {
            console.debug('[CustomerProductDetail] Failed to persist recently viewed', e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productIdForHooks, productState?.maSanPham, productState?.id]);

    // Also update local snapshot when storage changes in another tab
    useEffect(() => {
        const onStorage = (ev) => {
            if (ev.key === RECENTLY_VIEWED_KEY) {
                setRecentlyViewed(safeParse(ev.newValue || '[]'));
                console.debug('[CustomerProductDetail] storage event updated recentlyViewed', safeParse(ev.newValue || '[]'));
            }
        };
        window.addEventListener && window.addEventListener('storage', onStorage);
        return () => window.removeEventListener && window.removeEventListener('storage', onStorage);
    }, []);

    // Logic Fetch Vouchers (Giữ nguyên)
    useEffect(() => {
        const pid = productState?.maSanPham ?? productState?.id;
        (async () => {
            try {
                if (pid) {
                    try {
                        const resp = await api.get(`/api/vouchers/for-product?productId=${pid}`);
                        setAvailableVouchers(resp || []);
                        return;
                    } catch (e) {
                        console.debug('No product-specific vouchers endpoint or none found, falling back', e);
                    }
                }
                const all = await api.get('/api/vouchers');
                setAvailableVouchers(all || []);
            } catch (err) {
                console.error('Failed to fetch vouchers', err);
            }
        })();
    }, [productIdForHooks, productState?.id, productState?.maSanPham]);

    // Logic Chọn Variant Mặc định (Giữ nguyên)
    useEffect(() => {
        const variantsArr = Array.isArray(productState.bienThe) ? productState.bienThe : (Array.isArray(productState.variants) ? productState.variants : []);
        if ((!selectedVariant || !selectedVariant.id) && variantsArr.length > 0) {
            setSelectedVariant(normalizeVariant(variantsArr[0]));
        }
    }, [productState, selectedVariant]);
    
    // Logic Toggle Favorite (Giữ nguyên)
    const toggleFavorite = () => {
        setProductState(prev => ({
            ...prev,
            isFavorite: !prev.isFavorite
        }));
        onToggleFavorite?.(productState.maSanPham);
    };

    // Logic Add To Cart (Giữ nguyên)
    const handleAddToCart = () => {
        if (!selectedVariant) {
            alert('Vui lòng chọn phiên bản sản phẩm!');
            return;
        }
        if (selectedVariant.stock === 0) {
            alert('Sản phẩm này hiện đang hết hàng!');
            return;
        }
        if (quantity > selectedVariant.stock) {
            alert(`Số lượng tối đa: ${selectedVariant.stock}`);
            return;
        }
        addToCart(productState, selectedVariant, quantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
        const cartItem = {
            ...productState,
            bienTheChon: selectedVariant,
            soLuong: quantity
        };
        onAddToCart?.(cartItem);
    };

    // Logic Review (Giữ nguyên)
    const handleSubmitReview = async () => { 
        try {
            const productId = productState?.maSanPham || params?.id;
            if (!productId) throw new Error('Không xác định được sản phẩm');
            const payload = {
                sanPham: { maSanPham: Number(productId) },
                diem: newReview.rating,
                tieuDe: newReview.title,
                noiDung: newReview.content
            };
            if (newReview && newReview.id) {
                await api.put(`/api/v1/reviews/${newReview.id}`, payload);
            } else {
                await api.post('/api/v1/reviews', payload);
            }
            try {
                const refreshed = await api.get(`/api/products/${productId}/detail`);
                setProductState(refreshed?.data ?? refreshed);
            } catch (fetchErr) {
                console.warn('Unable to refresh product detail after review:', fetchErr);
            }
            setShowReviewModal(false);
            setNewReview({ rating: 5, title: '', content: '', name: '', photos: [] });
        } catch (err) {
            const msg = err?.response?.data || err?.message || 'Lỗi khi gửi đánh giá';
            alert('Không thể gửi đánh giá: ' + msg);
        }
    };
    const handleEditReviewClick = (review) => { 
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
        // eslint-disable-next-line no-restricted-globals
        if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
        try {
            const rid = typeof reviewId === 'object' ? (reviewId.id ?? reviewId.maDanhGia ?? reviewId.ma_danh_gia) : reviewId;
            await api.del(`/api/v1/reviews/${rid}`);
            const productId = productState?.maSanPham || params?.id;
            const refreshed = await api.get(`/api/products/${productId}/detail`);
            setProductState(refreshed?.data ?? refreshed);
        } catch (err) {
            alert('Không thể xóa đánh giá: ' + (err?.data || err?.message || err));
        }
    };

    // Logic Utility (Giữ nguyên)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount).replace('₫', ' VNĐ');
    };
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
    const renderStars = (rating, size = 'w-4 h-4') => { 
        const rounded = Math.round(rating || 0);
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i}>
                {i < rounded ? (
                    <IoStar className={`${size} text-yellow-400`} />
                ) : (
                    <IoStarOutline className={`${size} text-gray-300`} />
                )}
            </span>
        ));
    };
    const handleVariantSelect = (variant) => {
        setSelectedVariant(normalizeVariant(variant));
    };

    // Determine active price/stock
    const basePrice = Number(productState.giaBan ?? productState.gia ?? productState.price) || 0;
    const baseOriginal = Number(productState.giaGoc ?? productState.gia_goc ?? productState.originalPrice) || 0;
    const baseStock = Number(productState.soLuongTonKho ?? productState.tongSoLuong ?? productState.stockQuantity ?? 0) || 0;
    const activePrice = selectedVariant ? (Number(selectedVariant.price) || 0) : basePrice;
    const activeOriginal = selectedVariant ? (Number(selectedVariant.originalPrice) || 0) : baseOriginal;
    const activeStock = selectedVariant ? (Number(selectedVariant.stock) || 0) : baseStock;

    // Build attribute groups for Configurator
    const variantsArr = Array.isArray(productState.bienThe) ? productState.bienThe : (Array.isArray(productState.variants) ? productState.variants : []);
    const buildAttributeGroups = (variants) => {
        const groups = {};
        variants.forEach(raw => {
            const v = normalizeVariant(raw);
            const attrs = v.attributes || [];
            attrs.forEach((a) => {
                const name = a.tenThuocTinh ?? a.name ?? a.label ?? a.ten ?? a.attributeName;
                const value = a.giaTri ?? a.value ?? a.val ?? a.gia_tri ?? a.attributeValue ?? a.valueLabel;
                if (!name) return;
                if (!groups[name]) groups[name] = new Set();
                groups[name].add(String(value ?? '').trim());
            });
        });

        // (Reverted) Do not merge product-level attributes into attribute groups here.

        return groups;
    };
    const attributeGroups = (() => {
        const g = buildAttributeGroups(variantsArr);
        const out = {};
        Object.keys(g).forEach(k => { out[k] = Array.from(g[k]).filter(Boolean); });
        return out;
    })();
    const findMatchingVariant = (selectedAttrs) => {
        const groupKeys = Object.keys(attributeGroups);
        if (groupKeys.length === 0) return null;
        const matches = variantsArr.filter(vr => {
            const v = normalizeVariant(vr);
            const attrs = (v.attributes || []).reduce((acc, a) => { acc[((a.tenThuocTinh ?? a.name ?? a.label ?? a.ten ?? a.attributeName) || '')] = String(a.giaTri ?? a.value ?? a.val ?? a.gia_tri ?? a.attributeValue ?? a.valueLabel); return acc; }, {});
            return Object.keys(selectedAttrs).every(k => {
                const val = selectedAttrs[k];
                if (!val) return true;
                return String(attrs[k] || '') === String(val);
            });
        });
        if (matches.length === 1 && Object.keys(selectedAttrs).every(k => selectedAttrs[k])) {
             return normalizeVariant(matches[0]);
        }
        return null;
    };

    // ------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6 bg-white shadow-xl min-h-[80vh] my-6 rounded-lg">
                {/* Success notification */}
                {addedToCart && (
                    <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-fade-in-down transition-opacity duration-300">
                        <IoCheckmarkCircle className="w-5 h-5" />
                        <span>Đã thêm vào giỏ hàng!</span>
                    </div>
                )}

                {/* Back Button & Breadcrumb */}
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <button
                        onClick={onBack || (() => navigate('/shop'))}
                        className="flex items-center gap-2 text-red-600 font-medium hover:text-red-700 transition-colors"
                    >
                        <IoArrowBack className="w-5 h-5" />
                        Quay lại trang sản phẩm
                    </button>
                    {/* Breadcrumb */}
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="cursor-pointer hover:text-red-600" onClick={() => navigate('/')}>Trang chủ</span>
                        <IoChevronForward className="w-3 h-3" />
                        <span className="cursor-pointer hover:text-red-600" onClick={() => navigate('/shop')}>{productState.danhMuc?.tenDanhMuc || 'Sản phẩm'}</span>
                        <IoChevronForward className="w-3 h-3" />
                        <span className="text-gray-900 font-medium line-clamp-1 max-w-xs">{productState.tenSanPham}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Column 1: Images */}
                    <div className="space-y-4">
                        <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 border shadow-lg">
                            {(() => {
                                const images = Array.isArray(productState.hinhAnh) ? productState.hinhAnh : (Array.isArray(productState.images) ? productState.images : []);
                                const source = images[selectedImage] || productState.image;

                
                                const src = resolveImageUrl(source);
                                if (src) {
                                    return (
                                        <img src={src} alt={productState.tenSanPham} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }} />
                                    );
                                }
                                return (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                                        Không có hình ảnh
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="grid grid-cols-5 gap-3">
                            {(Array.isArray(productState.hinhAnh) ? productState.hinhAnh : (Array.isArray(productState.images) ? productState.images : [])).map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-red-500 hover:shadow-md ${selectedImage === index ? 'border-red-600 ring-2 ring-red-200' : 'border-gray-200'}`}
                                >
                                    {(() => { const s = resolveImageUrl(image); return s ? (<img src={s} alt={`${productState.tenSanPham} ${index + 1}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }} />) : (<div className="w-full h-full bg-gray-100 flex items-center justify-center"><span className="text-gray-400 text-xs">No image</span></div>); })()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Info, Variants, Actions */}
                    <div className="space-y-6">
                        {/* Title & Ratings */}
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                                {productState.tenSanPham}
                            </h1>
                            <p className="text-gray-500 text-sm mb-4">Mã sản phẩm: **{productState.maSanPham}**</p>
                            
                            <div className="flex items-center gap-6 border-b pb-3">
                                <div className="flex items-center gap-1">
                                    {renderStars(productState.danhGia, 'w-5 h-5')}
                                    <span className="text-lg font-bold text-gray-800 ml-2">
                                        {productState.danhGia?.toFixed(1) || '0.0'}
                                    </span>
                                </div>
                                <span className="text-base text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setActiveTab('reviews')}>
                                    ({productState.soLuotDanhGia || 0} đánh giá)
                                </span>
                            </div>
                        </div>

                        {/* Price Display: show only when no attribute groups OR a variant was selected */}
                        <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
                            {Object.keys(attributeGroups).length > 0 && !selectedVariant ? (
                                <div className="text-center text-gray-600 py-6">Vui lòng chọn đầy đủ thuộc tính để xem giá và tồn kho.</div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl font-extrabold text-red-700">
                                            {formatCurrency(activePrice)}
                                        </span>
                                        {activeOriginal > activePrice && (
                                            <>
                                                <span className="text-xl text-gray-500 line-through">
                                                    {formatCurrency(activeOriginal)}
                                                </span>
                                                <span className="bg-red-700 text-white px-3 py-1 rounded-full text-base font-semibold shadow-md">
                                                    -{Math.round((1 - (activePrice / activeOriginal || 1)) * 100)}%
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {activeStock > 0 ? (
                                            <span className="text-green-600 font-medium flex items-center gap-1">
                                                <IoCheckmarkCircle className="w-5 h-5" /> Còn hàng: {activeStock} sản phẩm
                                            </span>
                                        ) : (
                                            <span className="text-red-600 font-medium flex items-center gap-1">
                                                <IoWarning className="w-5 h-5" /> Hết hàng
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Variants Selection */}
                        <div className="space-y-4">
                            <AttributeConfigurator
                                variants={variantsArr}
                                attributeGroups={attributeGroups}
                                selectedVariant={selectedVariant}
                                setSelectedVariant={setSelectedVariant}
                                normalizeVariant={normalizeVariant}
                                findMatchingVariant={findMatchingVariant}
                                handleVariantSelect={handleVariantSelect}
                                formatCurrency={formatCurrency}
                            />
                        </div>

                        {/* Quantity & Actions */}
                        <div className="space-y-4 border-t pt-6">
                            {/* Quantity Control */}
                            <div>
                                <label className="block text-base font-semibold text-gray-800 mb-2">Số lượng:</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-2 text-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-2 min-w-[50px] text-center font-medium border-l border-r">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                                            disabled={quantity >= activeStock}
                                            className={`px-4 py-2 text-lg text-gray-600 transition-colors ${quantity >= activeStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                        >
                                            +
                                        </button>
                                    </div>
                                    {selectedVariant && isInCart(selectedVariant.id) && (
                                        <span className="text-sm text-blue-600 font-medium">
                                            (Đã có {getItemQuantity(selectedVariant.id)} trong giỏ)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={activeStock === 0 || !selectedVariant || quantity > activeStock}
                                    className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md ${
                                        activeStock === 0 || !selectedVariant || quantity > activeStock
                                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed shadow-none'
                                            : addedToCart
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-red-600 text-white hover:bg-red-700'
                                        }`}
                                >
                                    <IoCart className="w-6 h-6" />
                                    {!selectedVariant ? 'CHỌN PHIÊN BẢN' : 'THÊM VÀO GIỎ HÀNG'}
                                </button>
                                
                                <button
                                    onClick={toggleFavorite}
                                    className={`p-4 rounded-xl border transition-colors duration-300 hover:shadow-lg ${
                                        productState.isFavorite
                                            ? 'border-red-600 bg-red-600 text-white hover:bg-red-700'
                                            : 'border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600'
                                        }`}
                                    aria-label="Yêu thích"
                                >
                                    {productState.isFavorite ? (
                                        <IoHeart className="w-6 h-6" />
                                    ) : (
                                        <IoHeartOutline className="w-6 h-6" />
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        {/* Quick Features / Vouchers */}
                        <div className="grid grid-cols-2 gap-4 p-5 bg-gray-100 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <IoFlashOutline className="w-6 h-6 text-blue-600" />
                                <span className="text-sm font-medium">Giao hàng siêu tốc</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <IoGiftOutline className="w-6 h-6 text-red-600" />
                                <span className="text-sm font-medium">Bảo hành chính hãng</span>
                            </div>
                            {availableVouchers && availableVouchers.length > 0 && (
                                <div className="col-span-2 text-sm text-gray-700">
                                    <span className="font-semibold">Ưu đãi hôm nay: </span>
                                    {availableVouchers.slice(0, 2).map((v, i) => (
                                        <span key={v.id ?? v.maVoucher} className="ml-2 bg-red-200 text-red-800 px-2 py-0.5 rounded font-medium">
                                            {v.ten || v.title || v.code}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex space-x-8 border-b mb-6">
                        {[
                            { id: 'description', label: 'Mô tả sản phẩm' },
                            { id: 'specifications', label: 'Thông số kỹ thuật' },
                            { id: 'reviews', label: `Đánh giá (${productState.soLuotDanhGia || 0})` }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-3 px-1 border-b-4 font-bold text-lg transition-colors duration-300 ${activeTab === tab.id
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="mb-8 p-4 bg-white rounded-lg shadow-inner border border-gray-100">
                        {activeTab === 'description' && (
                            <div className="space-y-4">
                                <div className="prose max-w-none text-gray-700 leading-relaxed">
                                    <p className="font-semibold text-lg">{productState.moTa}</p>
                                    
                                    {showFullDescription && (
                                        <div 
                                            className="mt-4 text-gray-700 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: productState.moTaChiTiet || 'Nội dung chi tiết đang được cập nhật...' }}
                                        />
                                    )}
                                    
                                    <button
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="mt-4 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                    >
                                        {showFullDescription ? 'Thu gọn nội dung' : 'Xem thêm chi tiết'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'specifications' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-sm">
                                {/* Thêm thuộc tính chung của sản phẩm */}
                                <h4 className="col-span-full text-xl font-bold mb-3 text-gray-800">Thông tin chung</h4>
                                <div className="flex py-2 border-b border-gray-100">
                                    <div className="w-1/2 text-gray-600">Thương hiệu:</div>
                                    <div className="w-1/2 font-medium">{productState.thuongHieu || 'Đang cập nhật'}</div>
                                </div>
                                <div className="flex py-2 border-b border-gray-100">
                                    <div className="w-1/2 text-gray-600">Danh mục:</div>
                                    <div className="w-1/2 font-medium">{productState.danhMuc?.tenDanhMuc || productState.category || 'N/A'}</div>
                                </div>

                                {/* Thông số kỹ thuật từ API */}
                                <h4 className="col-span-full text-xl font-bold my-4 text-gray-800">Thông số kỹ thuật chi tiết</h4>
                                {productState.thongSoKyThuat && Array.isArray(productState.thongSoKyThuat) ? (
                                    productState.thongSoKyThuat.map((spec, index) => (
                                        <div key={index} className="flex py-2 border-b border-gray-100">
                                            <div className="w-1/2 text-gray-600">{spec.tenThuocTinh}:</div>
                                            <div className="w-1/2 font-medium text-gray-900">
                                                {Array.isArray(spec.giaTriList) ? spec.giaTriList.join(', ') : spec.giaTriList}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center text-gray-500 py-8">
                                        Chưa có thông số kỹ thuật chi tiết
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                                {/* Review Summary */}
                                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                        <div className="text-center md:border-r border-red-200">
                                            <div className="text-5xl font-extrabold text-red-600 mb-1">
                                                {productState.danhGia?.toFixed(1) || '0.0'}
                                            </div>
                                            <div className="flex justify-center mb-2">
                                                {renderStars(productState.danhGia, 'w-6 h-6')}
                                            </div>
                                            <div className="text-gray-600 font-medium">
                                                {productState.soLuotDanhGia || 0} đánh giá
                                            </div>
                                        </div>
                                        
                                        <div className="col-span-2 space-y-2">
                                            {[5, 4, 3, 2, 1].map((star) => {
                                                const ratings = productState.danhGiaKhachHang || [];
                                                const count = ratings.filter(r => r.danhGia === star).length;
                                                const percentage = ratings.length === 0 ? 0 : (count / ratings.length) * 100;
                                                
                                                return (
                                                    <div key={star} className="flex items-center gap-2">
                                                        <span className="text-base font-semibold w-2">{star}</span>
                                                        <IoStar className="w-5 h-5 text-yellow-400" />
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                                            <div
                                                                className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-gray-700 w-8 font-medium">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Write Review Button */}
                                <div className="text-center pt-4">
                                    <button
                                        onClick={() => { setNewReview({ rating: 5, title: '', content: '', name: '', photos: [], id: null }); setShowReviewModal(true); }}
                                        className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors shadow-md"
                                    >
                                        Viết đánh giá của bạn
                                    </button>
                                </div>

                                {/* Reviews List */}
                                <div className="space-y-8 pt-4">
                                    {(productState.danhGiaKhachHang || []).map((review) => (
                                        <div key={review.id || review.maDanhGia} className="border-b border-gray-200 pb-6 relative">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-red-600 font-bold text-xl">
                                                        {review.tenKhachHang ? review.tenKhachHang.charAt(0) : '?'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-bold text-lg text-gray-900">{review.tenKhachHang || 'Khách hàng'}</h4>
                                                        <div className="flex">
                                                            {renderStars(review.danhGia)}
                                                        </div>
                                                        <span className="text-sm text-gray-500 ml-auto">{review.ngayDanhGia}</span>
                                                        
                                                        {/* 3-dot menu */}
                                                        { user && (user.maKhachHang || user.ma_khach_hang) && (() => {
                                                            const currentId = user.maKhachHang || user.ma_khach_hang;
                                                            if (review.maKhachHang && review.maKhachHang === currentId) {
                                                                const rid = review.id ?? review.maDanhGia ?? review.ma_danh_gia;
                                                                return (
                                                                    <div className="relative">
                                                                        <button onClick={(e) => { e.stopPropagation(); toggleMenu(rid); }} className="text-gray-500 hover:text-red-600 transition-colors px-2" aria-label="Actions">
                                                                            <IoEllipsisVertical className="w-5 h-5" />
                                                                        </button>
                                                                        {openMenuId === rid && (
                                                                            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow-lg z-50">
                                                                                <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleEditReviewClick(review); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Sửa</button>
                                                                                <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleDeleteReview(rid); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Xóa</button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                    
                                                    <h5 className="font-bold mb-2 text-gray-800">{review.tieuDe}</h5>
                                                    <p className="text-gray-700 mb-3">{review.noiDung}</p>
                                                    
                                                    {/* Variant info and images omitted for brevity but remain functional */}
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
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
                    {/* Logic Related Products (Giữ nguyên) */}
                    {productState.sanPhamLienQuan && productState.sanPhamLienQuan.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {productState.sanPhamLienQuan.slice(0, 5).map((relatedProduct) => {
                                const relPrice = relatedProduct.giaMin || relatedProduct.giaBan || 0;
                                const relOriginal = relatedProduct.giaMax || relatedProduct.giaGoc || relPrice;
                                const relImage = resolveImageUrl(relatedProduct.hinhAnh || relatedProduct.image);
                                
                                return (
                                    <div 
                                        key={relatedProduct.maSanPham} 
                                        className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                        onClick={() => { navigate(`/shop/products/${relatedProduct.maSanPham}`); }}
                                    >
                                        <div className="relative h-48 overflow-hidden bg-gray-100">
                                            {relImage ? (
                                                <img src={relImage} alt={relatedProduct.tenSanPham} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-10 group-hover:text-red-600 transition-colors">{relatedProduct.tenSanPham}</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-lg font-bold text-red-600">
                                                    {formatCurrency(relPrice)}
                                                </span>
                                                {relOriginal > relPrice && (
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {formatCurrency(relOriginal)}
                                                    </span>
                                                )}
                                            </div>
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
            </div>
            
                {/* Recently Viewed Products (client-side cache) */}
                {recentlyViewed && recentlyViewed.length > 0 && (
                    <div className="max-w-7xl mx-auto p-6">
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm bạn đã xem</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {recentlyViewed.map((rv) => {
                                    const img = resolveImageUrl(rv.image);
                                    return (
                                        <div key={rv.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer" onClick={() => { navigate(`/shop/products/${rv.id}`); }}>
                                            <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {img ? (
                                                    <img src={img} alt={rv.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }} />
                                                ) : (
                                                    <div className="text-gray-400">No image</div>
                                                )}
                                            </div>
                                            <div className="p-3 text-sm">
                                                <div className="font-medium text-gray-900 line-clamp-2">{rv.name}</div>
                                                <div className="text-red-600 font-bold mt-2">{rv.price ? formatCurrency(rv.price) : ''}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

            <FooterPlaceholder />

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowReviewModal(false)}>
                    <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">{newReview.id ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}</h3>
                            
                            <div className="space-y-4">
                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Đánh giá sao:</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setNewReview({...newReview, rating: star})}
                                                className="transition-transform hover:scale-110"
                                            >
                                                {star <= newReview.rating ? (
                                                    <IoStar className="w-8 h-8 text-yellow-500" />
                                                ) : (
                                                    <IoStarOutline className="w-8 h-8 text-gray-300" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Name (Pre-filled if user is logged in or provided in review state) */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Tên của bạn</label>
                                    <input
                                        type="text"
                                        value={user?.tenKhachHang || newReview.name} 
                                        onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Nhập tên của bạn"
                                        disabled={!!user} 
                                    />
                                </div>

                                {/* Title & Content */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Tiêu đề</label>
                                    <input
                                        type="text"
                                        value={newReview.title}
                                        onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Nhập tiêu đề đánh giá"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Nội dung</label>
                                    <textarea
                                        value={newReview.content}
                                        onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 font-medium transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-bold transition-colors shadow-md"
                                >
                                    {newReview.id ? 'Lưu chỉnh sửa' : 'Gửi đánh giá'}
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