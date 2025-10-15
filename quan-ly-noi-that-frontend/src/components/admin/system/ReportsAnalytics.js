import React, { useState, useEffect } from 'react';
import { IoBarChart, IoPieChart, IoTrendingUp, IoTrendingDown, IoDownload, IoCalendar, IoRefresh, IoEye, IoWarning } from 'react-icons/io5';
import api from '../../../api';

const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedReport, setSelectedReport] = useState('sales');
  const [selectedReportType, setSelectedReportType] = useState('overview');

  // API data states
  const [salesData, setSalesData] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [customerStats, setCustomerStats] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [salesRes, productsRes, customersRes, inventoryRes] = await Promise.all([
          api.get('/api/reports/sales').catch(() => []),
          api.get('/api/reports/products').catch(() => []),
          api.get('/api/reports/customers').catch(() => []),
          api.get('/api/reports/inventory').catch(() => [])
        ]);

        setSalesData(Array.isArray(salesRes) ? salesRes : []);
        setProductSales(Array.isArray(productsRes) ? productsRes : []);
        setCustomerStats(Array.isArray(customersRes) ? customersRes : []);
        setInventoryAlerts(Array.isArray(inventoryRes) ? inventoryRes : []);
      } catch (err) {
        console.error('Error fetching reports data:', err);
        setError('Không thể tải dữ liệu báo cáo');
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  // API Functions
  const fetchSalesReport = async (period = selectedPeriod) => {
    try {
      const response = await api.get(`/api/reports/sales?period=${period}`);
      setSalesData(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  const fetchProductReport = async () => {
    try {
      const response = await api.get('/api/reports/products');
      setProductSales(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching product report:', error);
    }
  };

  const fetchCustomerReport = async () => {
    try {
      const response = await api.get('/api/reports/customers');
      setCustomerStats(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching customer report:', error);
    }
  };

  const fetchInventoryReport = async () => {
    try {
      const response = await api.get('/api/reports/inventory');
      setInventoryAlerts(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching inventory report:', error);
    }
  };

  const exportReport = async (reportType) => {
    try {
      const response = await api.get(`/api/reports/export/${reportType}`, {
        responseType: 'blob'
      });
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Không thể xuất báo cáo');
    }
  };

  const reportTypes = [
    { id: 'overview', name: 'Tổng quan', icon: IoBarChart, color: 'bg-blue-100 text-blue-800' },
    { id: 'sales', name: 'Báo cáo bán hàng', icon: IoBarChart, color: 'bg-green-100 text-green-800' },
    { id: 'inventory', name: 'Báo cáo tồn kho', icon: IoBarChart, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'customers', name: 'Báo cáo khách hàng', icon: IoBarChart, color: 'bg-purple-100 text-purple-800' },
    { id: 'products', name: 'Báo cáo sản phẩm', icon: IoBarChart, color: 'bg-red-100 text-red-800' },
    { id: 'financial', name: 'Báo cáo tài chính', icon: IoBarChart, color: 'bg-indigo-100 text-indigo-800' },
    { id: 'marketing', name: 'Báo cáo marketing', icon: IoBarChart, color: 'bg-pink-100 text-pink-800' },
    { id: 'performance', name: 'Báo cáo hiệu suất', icon: IoBarChart, color: 'bg-gray-100 text-gray-800' }
  ];

  // Calculate metrics from API data
  const totalRevenue = salesData.reduce((sum, day) => sum + (day.doanhThu || day.revenue || 0), 0);
  const totalOrders = salesData.reduce((sum, day) => sum + (day.soDonHang || day.orders || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate report data based on selected type and API data
  const getReportData = (reportType) => {
    switch (reportType) {
      case 'sales':
        return {
          title: 'Báo cáo Bán hàng',
          description: 'Phân tích doanh thu và xu hướng bán hàng',
          data: [
            { metric: 'Tổng doanh thu', value: `${totalRevenue.toLocaleString('vi-VN')}đ`, change: '+12.5%' },
            { metric: 'Số đơn hàng', value: totalOrders.toString(), change: '+8.2%' },
            { metric: 'Giá trị đơn hàng TB', value: `${Math.round(averageOrderValue).toLocaleString('vi-VN')}đ`, change: '-2.1%' },
            { metric: 'Tỷ lệ chuyển đổi', value: '3.2%', change: '+0.5%' }
          ]
        };
      case 'inventory':
        const totalProducts = inventoryAlerts.length;
        const lowStock = inventoryAlerts.filter(item => item.trangThai === 'sap_het' || item.status === 'low').length;
        const outOfStock = inventoryAlerts.filter(item => item.trangThai === 'het_hang' || item.status === 'out').length;
        const normalStock = totalProducts - lowStock - outOfStock;
        return {
          title: 'Báo cáo Tồn kho',
          description: 'Theo dõi tồn kho và cảnh báo hết hàng',
          data: [
            { metric: 'Tổng sản phẩm', value: totalProducts.toString(), change: '+3' },
            { metric: 'Tồn kho bình thường', value: normalStock.toString(), change: '+5' },
            { metric: 'Sắp hết hàng', value: lowStock.toString(), change: '-2' },
            { metric: 'Hết hàng', value: outOfStock.toString(), change: '+1' }
          ]
        };
      case 'customers':
        const totalCustomers = customerStats.reduce((sum, stat) => sum + (stat.soLuong || stat.count || 0), 0);
        const vipCustomers = customerStats.filter(stat => stat.capBac?.includes('VIP') || stat.level?.includes('VIP')).reduce((sum, stat) => sum + (stat.soLuong || stat.count || 0), 0);
        return {
          title: 'Báo cáo Khách hàng',
          description: 'Phân tích hành vi và phân khúc khách hàng',
          data: [
            { metric: 'Tổng khách hàng', value: totalCustomers.toString(), change: '+23' },
            { metric: 'Khách hàng mới', value: '89', change: '+15.3%' },
            { metric: 'Khách hàng VIP', value: vipCustomers.toString(), change: '+8' },
            { metric: 'Tỷ lệ quay lại', value: '68%', change: '+5.2%' }
          ]
        };
      case 'products':
        const topProduct = productSales.length > 0 ? productSales[0] : null;
        const maxRevenue = productSales.length > 0 ? Math.max(...productSales.map(p => p.doanhThu || p.revenue || 0)) : 0;
        const maxRevenueProduct = productSales.find(p => (p.doanhThu || p.revenue || 0) === maxRevenue);
        return {
          title: 'Báo cáo Sản phẩm',
          description: 'Hiệu suất bán hàng theo sản phẩm',
          data: [
            { metric: 'Sản phẩm bán chạy', value: topProduct?.tenSanPham || topProduct?.name || 'N/A', change: `${topProduct?.soLuongBan || topProduct?.sales || 0} đơn` },
            { metric: 'Doanh thu cao nhất', value: `${maxRevenue.toLocaleString('vi-VN')}đ`, change: maxRevenueProduct?.tenSanPham || maxRevenueProduct?.name || 'N/A' },
            { metric: 'Tỷ lệ lợi nhuận TB', value: '35%', change: '+2.1%' },
            { metric: 'Sản phẩm mới', value: '3', change: 'Tháng này' }
          ]
        };
      case 'financial':
        return {
          title: 'Báo cáo Tài chính',
          description: 'Tình hình tài chính và dòng tiền',
          data: [
            { metric: 'Doanh thu thuần', value: `${totalRevenue.toLocaleString('vi-VN')}đ`, change: '+12.5%' },
            { metric: 'Chi phí vận hành', value: '450,000,000đ', change: '+8.2%' },
            { metric: 'Lợi nhuận gộp', value: `${(totalRevenue * 0.757).toLocaleString('vi-VN')}đ`, change: '+15.3%' },
            { metric: 'Biên lợi nhuận', value: '75.7%', change: '+2.1%' }
          ]
        };
      case 'marketing':
        return {
          title: 'Báo cáo Marketing',
          description: 'Hiệu quả các chiến dịch marketing',
          data: [
            { metric: 'Khách hàng từ marketing', value: '234', change: '+18.5%' },
            { metric: 'Chi phí marketing', value: '120,000,000đ', change: '+12.3%' },
            { metric: 'ROI Marketing', value: '3.2x', change: '+0.5x' },
            { metric: 'Tỷ lệ chuyển đổi', value: '4.8%', change: '+1.2%' }
          ]
        };
      case 'performance':
        return {
          title: 'Báo cáo Hiệu suất',
          description: 'KPI và hiệu suất hoạt động',
          data: [
            { metric: 'Thời gian xử lý đơn hàng', value: '2.3 giờ', change: '-0.5 giờ' },
            { metric: 'Tỷ lệ giao hàng đúng hạn', value: '94.2%', change: '+2.1%' },
            { metric: 'Đánh giá khách hàng', value: '4.7/5', change: '+0.2' },
            { metric: 'Tỷ lệ khiếu nại', value: '1.2%', change: '-0.3%' }
          ]
        };
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'low': return 'Sắp hết';
      case 'critical': return 'Nguy hiểm';
      case 'out': return 'Hết hàng';
      default: return 'Bình thường';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Báo cáo và Thống kê</h1>
          <p className="text-gray-600">Phân tích hiệu suất kinh doanh và xu hướng</p>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu báo cáo...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <IoWarning className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Report Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn loại báo cáo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReportType(report.id)}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedReportType === report.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-2 rounded-lg mb-2 ${report.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{report.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Period Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khoảng thời gian
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="7days">7 ngày qua</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="90days">90 ngày qua</option>
                  <option value="1year">1 năm qua</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <IoRefresh className="w-5 h-5" />
                Làm mới
              </button>
              <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <IoDownload className="w-5 h-5" />
                Xuất báo cáo
              </button>
            </div>
          </div>
        </div>

        {/* Selected Report Details */}
        {selectedReportType !== 'overview' && getReportData(selectedReportType) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{getReportData(selectedReportType).title}</h3>
                <p className="text-gray-600">{getReportData(selectedReportType).description}</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <IoEye className="w-5 h-5" />
                  Xem chi tiết
                </button>
                <button 
                  onClick={() => exportReport(selectedReportType)}
                  className="flex items-center gap-2 text-green-600 hover:text-green-800"
                >
                  <IoDownload className="w-5 h-5" />
                  Xuất PDF
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getReportData(selectedReportType).data.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600">{item.metric}</h4>
                    <span className={`text-sm font-semibold ${
                      item.change.startsWith('+') ? 'text-green-600' : 
                      item.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {item.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IoBarChart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalRevenue.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-sm text-green-600 flex items-center">
                  <IoTrendingUp className="w-4 h-4 mr-1" />
                  +12.5% so với tháng trước
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <IoBarChart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <IoTrendingUp className="w-4 h-4 mr-1" />
                  +8.2% so với tháng trước
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <IoBarChart className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Giá trị đơn hàng TB</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(averageOrderValue).toLocaleString('vi-VN')}đ
                </p>
                <p className="text-sm text-red-600 flex items-center">
                  <IoTrendingDown className="w-4 h-4 mr-1" />
                  -2.1% so với tháng trước
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IoBarChart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Khách hàng mới</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
                <p className="text-sm text-green-600 flex items-center">
                  <IoTrendingUp className="w-4 h-4 mr-1" />
                  +15.3% so với tháng trước
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Xu hướng doanh thu</h3>
              <button className="text-blue-600 hover:text-blue-800">
                <IoEye className="w-5 h-5" />
              </button>
            </div>
            <div className="h-64 flex items-end justify-between">
              {salesData.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t w-8 mb-2"
                    style={{ height: `${(day.revenue / 35000000) * 200}px` }}
                  ></div>
                  <div className="text-xs text-gray-500">
                    {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Doanh thu cao nhất</p>
                <p className="font-semibold text-gray-900">
                  {Math.max(...salesData.map(d => d.revenue)).toLocaleString('vi-VN')}đ
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Doanh thu thấp nhất</p>
                <p className="font-semibold text-gray-900">
                  {Math.min(...salesData.map(d => d.revenue)).toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          </div>

          {/* Product Sales Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Bán hàng theo sản phẩm</h3>
              <button className="text-blue-600 hover:text-blue-800">
                <IoPieChart className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {productSales.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                    <span className="text-sm text-gray-900">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {product.revenue.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-xs text-gray-500">{product.sales} đơn</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Phân tích khách hàng VIP</h3>
            <div className="space-y-4">
              {customerStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{stat.level}</p>
                    <p className="text-sm text-gray-600">{stat.count} khách hàng</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {stat.revenue.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round((stat.revenue / totalRevenue) * 100)}% tổng doanh thu
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Cảnh báo tồn kho</h3>
            <div className="space-y-4">
              {inventoryAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{alert.product}</p>
                    <p className="text-sm text-gray-600">
                      Tồn: {alert.currentStock} | Tối thiểu: {alert.minStock}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                      {getStatusText(alert.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top sản phẩm bán chạy</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng bán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ lệ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productSales.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.revenue.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(product.revenue / Math.max(...productSales.map(p => p.revenue))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round((product.revenue / totalRevenue) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-800">
                        <IoEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Report Sections */}
        {selectedReportType === 'sales' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích chi tiết Bán hàng</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Top sản phẩm bán chạy</h4>
                <div className="space-y-3">
                  {productSales.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{product.sales} đơn</p>
                        <p className="text-xs text-gray-500">{product.revenue.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Xu hướng doanh thu</h4>
                <div className="h-48 flex items-end justify-between">
                  {salesData.map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="bg-primary rounded-t w-6 mb-2"
                        style={{ height: `${(day.revenue / 35000000) * 150}px` }}
                      ></div>
                      <div className="text-xs text-gray-500">
                        {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReportType === 'inventory' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích chi tiết Tồn kho</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Cảnh báo tồn kho</h4>
                <div className="space-y-3">
                  {inventoryAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{alert.product}</p>
                        <p className="text-sm text-gray-500">Tồn: {alert.currentStock} | Tối thiểu: {alert.minStock}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                        {getStatusText(alert.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Phân bố tồn kho</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bình thường</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sắp hết</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hết hàng</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                      </div>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReportType === 'customers' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích chi tiết Khách hàng</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Phân khúc khách hàng VIP</h4>
                <div className="space-y-3">
                  {customerStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{stat.level}</p>
                        <p className="text-sm text-gray-500">{stat.count} khách hàng</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{stat.revenue.toLocaleString('vi-VN')}đ</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((stat.revenue / totalRevenue) * 100)}% tổng doanh thu
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Hành vi khách hàng</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tỷ lệ quay lại</span>
                    <span className="text-lg font-semibold text-green-600">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Khách hàng mới</span>
                    <span className="text-lg font-semibold text-blue-600">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giá trị đơn hàng TB</span>
                    <span className="text-lg font-semibold text-purple-600">2,450,000đ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tần suất mua hàng</span>
                    <span className="text-lg font-semibold text-orange-600">2.3 lần/tháng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xuất báo cáo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <IoDownload className="w-5 h-5 text-blue-600" />
              <span>Xuất PDF</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <IoDownload className="w-5 h-5 text-green-600" />
              <span>Xuất Excel</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <IoDownload className="w-5 h-5 text-purple-600" />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;

