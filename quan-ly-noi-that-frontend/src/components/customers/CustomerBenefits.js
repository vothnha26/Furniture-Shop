import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  IoGift, 
  IoTrophy, 
  IoStar, 
  IoStarOutline,
  IoTicket,
  IoCalendar,
  IoArrowForward,
  IoCheckmarkCircle,
  IoTime,
  IoClose,
  IoInformationCircle
} from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

const CustomerBenefits = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState([]);
  const [allVouchers, setAllVouchers] = useState([]); // Store all vouchers before filtering
  const [membershipInfo, setMembershipInfo] = useState(null);
  const [allTiers, setAllTiers] = useState([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [activeTab, setActiveTab] = useState('vouchers'); // 'vouchers' | 'membership'
  const [voucherFilter, setVoucherFilter] = useState('all'); // 'all' | 'for-everyone' | 'for-tier'

  // Check query params for initial tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'membership') {
      setActiveTab('membership');
    }
  }, [location]);

  // Define membership tiers with requirements
  const membershipTiers = [
    { 
      id: 1, 
      name: 'Đồng', 
      level: 'bronze',
      minPoints: 0, 
      maxPoints: 999,
      color: 'from-yellow-700 to-yellow-900',
      benefits: [
        'Tích điểm 1% cho mỗi đơn hàng',
        'Voucher sinh nhật 50.000đ',
        'Ưu đãi đặc biệt dịp lễ'
      ]
    },
    { 
      id: 2, 
      name: 'Bạc', 
      level: 'silver',
      minPoints: 1000, 
      maxPoints: 4999,
      color: 'from-gray-300 to-gray-500',
      benefits: [
        'Tích điểm 2% cho mỗi đơn hàng',
        'Voucher sinh nhật 100.000đ',
        'Miễn phí vận chuyển đơn từ 500k',
        'Ưu tiên hỗ trợ khách hàng'
      ]
    },
    { 
      id: 3, 
      name: 'Vàng', 
      level: 'gold',
      minPoints: 5000, 
      maxPoints: 19999,
      color: 'from-yellow-400 to-yellow-600',
      benefits: [
        'Tích điểm 3% cho mỗi đơn hàng',
        'Voucher sinh nhật 200.000đ',
        'Miễn phí vận chuyển tất cả đơn',
        'Ưu tiên hỗ trợ khách hàng',
        'Trải nghiệm sản phẩm mới trước'
      ]
    },
    { 
      id: 4, 
      name: 'Kim cương', 
      level: 'diamond',
      minPoints: 20000, 
      maxPoints: null,
      color: 'from-blue-400 to-purple-600',
      benefits: [
        'Tích điểm 5% cho mỗi đơn hàng',
        'Voucher sinh nhật 500.000đ',
        'Miễn phí vận chuyển & lắp đặt',
        'Tư vấn thiết kế nội thất miễn phí',
        'Ưu tiên hỗ trợ 24/7',
        'Trải nghiệm sản phẩm mới trước',
        'Ưu đãi độc quyền cho thành viên VIP'
      ]
    }
  ];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load customer data including membership info
      const customerData = await api.get('/api/v1/khach-hang/me');
      const customer = customerData?.data || customerData;
      
      console.log('[CustomerBenefits] Customer data:', customer);

      // Calculate points from total spending (100k = 10 points)
      const points = Math.floor((customer.tongChiTieu || 0) / 10000);
      setCurrentPoints(points);

      // Determine current tier
      const currentTier = membershipTiers.find(tier => 
        points >= tier.minPoints && (tier.maxPoints === null || points <= tier.maxPoints)
      );
      
      setMembershipInfo({
        currentTier: currentTier || membershipTiers[0],
        points: points,
        totalSpent: customer.tongChiTieu || 0,
        memberSince: customer.ngayThamGia || customer.ngayTaoTaiKhoan || new Date()
      });

      // Load available vouchers
      await loadVouchers();

    } catch (error) {
      console.error('[CustomerBenefits] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVouchers = async () => {
    try {
      console.log('[CustomerBenefits] Fetching vouchers from API...');
      
      // Option 1: Try to get eligible vouchers for current customer if we have customer ID
      let response;
      try {
        const customerData = await api.get('/api/v1/khach-hang/me');
        const customer = customerData?.data || customerData;
        const maKhachHang = customer?.maKhachHang;
        
        if (maKhachHang) {
          console.log('[CustomerBenefits] Fetching eligible vouchers for customer:', maKhachHang);
          response = await api.get(`/api/v1/voucher/eligible/${maKhachHang}/details`);
        } else {
          console.log('[CustomerBenefits] No customer ID, fetching all vouchers');
          response = await api.get('/api/v1/voucher/all');
        }
      } catch (err) {
        console.log('[CustomerBenefits] Error getting customer-specific vouchers, falling back to all:', err.message);
        // Fallback to getting all vouchers
        response = await api.get('/api/v1/voucher/all');
      }
      
      console.log('[CustomerBenefits] Raw API response:', response);
      console.log('[CustomerBenefits] Response type:', typeof response);
      console.log('[CustomerBenefits] Response keys:', Object.keys(response || {}));
      
      const voucherList = response?.data || response || [];
      console.log('[CustomerBenefits] Parsed voucher list:', voucherList);
      console.log('[CustomerBenefits] Total vouchers from API:', voucherList.length);
      
      if (voucherList.length > 0) {
        console.log('[CustomerBenefits] Sample voucher structure:', voucherList[0]);
      }
      
      // Filter active vouchers (not expired and available)
      const now = new Date();
      console.log('[CustomerBenefits] Current date for filtering:', now);
      
      const activeVouchers = voucherList.filter((v, index) => {
        const endDate = new Date(v.ngayKetThuc);
        
        // Backend returns: soLuongToiDa (max) and soLuongDaSuDung (used)
        // Available = still have quota remaining
        const soLuongToiDa = v.soLuongToiDa || 0;
        const soLuongDaSuDung = v.soLuongDaSuDung || 0;
        const available = soLuongDaSuDung < soLuongToiDa; // Still has quota
        
        const notExpired = endDate > now;
        const statusOk = v.trangThai !== 'EXPIRED';
        
        const isActive = notExpired && available && statusOk;
        
        if (index < 5) { // Log first 5 vouchers for debugging
          console.log(`[CustomerBenefits] Voucher ${index + 1}:`, {
            tenVoucher: v.tenVoucher,
            maCode: v.maCode,
            ngayKetThuc: v.ngayKetThuc,
            endDate: endDate,
            notExpired: notExpired,
            soLuongToiDa: soLuongToiDa,
            soLuongDaSuDung: soLuongDaSuDung,
            available: available,
            trangThai: v.trangThai,
            statusOk: statusOk,
            isActive: isActive
          });
        }
        
        return isActive;
      });

      console.log('[CustomerBenefits] Active vouchers after filtering:', activeVouchers.length);
      console.log('[CustomerBenefits] Active vouchers:', activeVouchers);
      
      // Store all active vouchers
      setAllVouchers(activeVouchers);
      setVouchers(activeVouchers);
    } catch (error) {
      console.error('[CustomerBenefits] Error loading vouchers:', error);
      console.error('[CustomerBenefits] Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      setAllVouchers([]);
      setVouchers([]);
    }
  };

  // Filter vouchers based on membership tier
  const filterVouchers = (filterType) => {
    setVoucherFilter(filterType);
    
    if (filterType === 'all') {
      setVouchers(allVouchers);
    } else if (filterType === 'for-everyone') {
      // Vouchers for everyone (apDungChoMoiNguoi === true)
      const filtered = allVouchers.filter(v => v.apDungChoMoiNguoi === true);
      setVouchers(filtered);
    } else if (filterType === 'for-tier') {
      // Vouchers for specific membership tiers only (apDungChoMoiNguoi === false or has tier restrictions)
      const filtered = allVouchers.filter(v => 
        v.apDungChoMoiNguoi === false || 
        (v.tenHangThanhVienApDung && v.tenHangThanhVienApDung.length > 0)
      );
      setVouchers(filtered);
    }
  };

  const getPointsToNextTier = () => {
    if (!membershipInfo) return null;
    
    const currentTier = membershipInfo.currentTier;
    const currentIndex = membershipTiers.findIndex(t => t.id === currentTier.id);
    
    if (currentIndex === membershipTiers.length - 1) {
      // Already at highest tier
      return null;
    }
    
    const nextTier = membershipTiers[currentIndex + 1];
    const pointsNeeded = nextTier.minPoints - currentPoints;
    const progress = (currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints) * 100;
    
    return {
      nextTier,
      pointsNeeded: Math.max(0, pointsNeeded),
      progress: Math.min(100, Math.max(0, progress))
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getVoucherType = (voucher) => {
    // Backend returns: PERCENTAGE or FIXED
    if (voucher.loaiGiamGia === 'PERCENTAGE') {
      return `Giảm ${voucher.giaTriGiam}%`;
    } else if (voucher.loaiGiamGia === 'FIXED') {
      return `Giảm ${formatCurrency(voucher.giaTriGiam)}`;
    } else {
      return `Giảm ${voucher.giaTriGiam}%`;
    }
  };

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code);
    // You can add a toast notification here
    alert(`Đã sao chép mã: ${code}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const nextTierInfo = getPointsToNextTier();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Ưu đãi & Khuyến mãi</h1>
          <p className="text-gray-600">Khám phá các ưu đãi dành riêng cho bạn</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'vouchers'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <IoTicket className="inline-block mr-2 text-xl" />
              Voucher của tôi
            </button>
            <button
              onClick={() => setActiveTab('membership')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'membership'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <IoTrophy className="inline-block mr-2 text-xl" />
              Hạng thành viên
            </button>
          </div>
        </div>

        {/* Vouchers Tab */}
        {activeTab === 'vouchers' && (
          <div>
            {/* Current Points Summary */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg shadow-lg p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm mb-1">Điểm tích lũy hiện tại</p>
                  <p className="text-4xl font-bold">{currentPoints.toLocaleString()}</p>
                  <p className="text-orange-100 text-sm mt-1">
                    Tổng chi tiêu: {formatCurrency(membershipInfo?.totalSpent || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <IoStar className="text-6xl text-yellow-300 opacity-50" />
                </div>
              </div>
            </div>

            {/* Voucher List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Voucher khả dụng ({vouchers.length})
                </h2>
                
                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => filterVouchers('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      voucherFilter === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => filterVouchers('for-everyone')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      voucherFilter === 'for-everyone'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Cho mọi người
                  </button>
                  <button
                    onClick={() => filterVouchers('for-tier')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      voucherFilter === 'for-tier'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Theo hạng
                  </button>
                </div>
              </div>
              
              {vouchers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <IoTicket className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Hiện chưa có voucher khả dụng</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Hãy tiếp tục mua sắm để nhận thêm ưu đãi!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vouchers.map((voucher) => (
                    <div
                      key={voucher.maVoucher}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-white font-semibold text-lg">
                                {voucher.tenVoucher}
                              </h3>
                              {/* Membership Badge */}
                              {voucher.apDungChoMoiNguoi ? (
                                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                                  Mọi người
                                </span>
                              ) : (
                                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                                  Thành viên
                                </span>
                              )}
                            </div>
                            <p className="text-white text-2xl font-bold">
                              {getVoucherType(voucher)}
                            </p>
                            {voucher.giaTriGiamToiDa && voucher.loaiGiamGia === 'PERCENTAGE' && (
                              <p className="text-orange-100 text-sm mt-1">
                                Tối đa {formatCurrency(voucher.giaTriGiamToiDa)}
                              </p>
                            )}
                          </div>
                          <IoGift className="text-white text-4xl opacity-50" />
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {voucher.moTa && (
                          <p className="text-gray-600 text-sm mb-3">{voucher.moTa}</p>
                        )}
                        
                        {/* Show membership tier requirements if applicable */}
                        {voucher.tenHangThanhVienApDung && voucher.tenHangThanhVienApDung.length > 0 && (
                          <div className="mb-3 p-2 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-700 font-medium">
                              🎯 Dành cho: {voucher.tenHangThanhVienApDung.join(', ')}
                            </p>
                          </div>
                        )}
                        
                        <div className="space-y-2 mb-4">
                          {voucher.giaTriDonHangToiThieu > 0 && (
                            <div className="flex items-center text-sm text-gray-600">
                              <IoInformationCircle className="mr-2 text-blue-500" />
                              Áp dụng cho đơn từ {formatCurrency(voucher.giaTriDonHangToiThieu)}
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <IoCalendar className="mr-2 text-green-500" />
                            Hết hạn: {formatDate(voucher.ngayKetThuc)}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <IoTicket className="mr-2 text-purple-500" />
                            Còn lại: {(voucher.soLuongToiDa || 0) - (voucher.soLuongDaSuDung || 0)} lượt
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="bg-gray-100 px-3 py-2 rounded font-mono text-sm font-semibold text-gray-800">
                            {voucher.maCode}
                          </div>
                          <button
                            onClick={() => copyVoucherCode(voucher.maCode)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                          >
                            Sao chép mã
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Membership Tab */}
        {activeTab === 'membership' && membershipInfo && (
          <div>
            {/* Current Tier Card */}
            <div className={`bg-gradient-to-r ${membershipInfo.currentTier.color} rounded-lg shadow-lg p-6 mb-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm mb-1">Hạng thành viên hiện tại</p>
                  <h2 className="text-3xl font-bold flex items-center">
                    <IoTrophy className="mr-2" />
                    {membershipInfo.currentTier.name}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm mb-1">Điểm tích lũy</p>
                  <p className="text-3xl font-bold">{currentPoints.toLocaleString()}</p>
                </div>
              </div>

              {nextTierInfo && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/90">Tiến độ lên hạng {nextTierInfo.nextTier.name}</span>
                    <span className="text-white font-semibold">
                      Còn {nextTierInfo.pointsNeeded.toLocaleString()} điểm
                    </span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{ width: `${nextTierInfo.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {!nextTierInfo && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2">
                    <IoCheckmarkCircle className="mr-2" />
                    <span className="font-medium">Bạn đã đạt hạng cao nhất!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Current Benefits */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Quyền lợi hạng {membershipInfo.currentTier.name}
              </h3>
              <div className="space-y-3">
                {membershipInfo.currentTier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <IoCheckmarkCircle className="text-green-500 text-xl mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* All Tiers Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Tất cả hạng thành viên
              </h3>
              <div className="space-y-4">
                {membershipTiers.map((tier, index) => {
                  const isCurrentTier = tier.id === membershipInfo.currentTier.id;
                  const isLowerTier = currentPoints > tier.maxPoints;
                  const isHigherTier = currentPoints < tier.minPoints;

                  return (
                    <div
                      key={tier.id}
                      className={`border-2 rounded-lg p-5 transition-all ${
                        isCurrentTier
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isLowerTier ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center mr-4`}>
                            <IoTrophy className="text-white text-2xl" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800 flex items-center">
                              {tier.name}
                              {isCurrentTier && (
                                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                                  Hạng hiện tại
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {tier.maxPoints === null 
                                ? `Từ ${tier.minPoints.toLocaleString()} điểm trở lên`
                                : `${tier.minPoints.toLocaleString()} - ${tier.maxPoints.toLocaleString()} điểm`
                              }
                            </p>
                          </div>
                        </div>
                        
                        {isHigherTier && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Cần thêm</p>
                            <p className="text-lg font-bold text-orange-600">
                              {(tier.minPoints - currentPoints).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">điểm</p>
                          </div>
                        )}
                        
                        {isCurrentTier && (
                          <div className="text-right">
                            <IoStar className="text-orange-500 text-3xl" />
                          </div>
                        )}
                        
                        {isLowerTier && (
                          <div className="text-right">
                            <IoCheckmarkCircle className="text-green-500 text-3xl" />
                          </div>
                        )}
                      </div>

                      <div className="pl-16">
                        <ul className="space-y-2">
                          {tier.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-start text-sm text-gray-600">
                              <span className="mr-2">•</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Points Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start">
                <IoInformationCircle className="text-blue-500 text-2xl mr-3 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-800 mb-2">Cách tích điểm:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Mỗi 10.000đ chi tiêu = 1 điểm</li>
                    <li>• Điểm được cộng sau khi đơn hàng hoàn thành</li>
                    <li>• Điểm không có hạn sử dụng</li>
                    <li>• Hạng thành viên được cập nhật tự động theo điểm tích lũy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBenefits;
