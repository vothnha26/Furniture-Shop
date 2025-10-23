import React, { useState, useEffect } from 'react';
import { IoAdd, IoSearch, IoTrash, IoTrendingUp, IoTrendingDown, IoRefresh } from 'react-icons/io5';
import api from '../../../api';

const InventoryManagement = () => {
  const [variants, setVariants] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Note: modal and search state are declared further down to keep related state grouped together

  const [importForm, setImportForm] = useState({
    soLuong: '',
    nguoiNhap: localStorage.getItem('username') || 'admin',
    lyDo: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  const [exportForm, setExportForm] = useState({
    soLuong: '',
    nguoiXuat: localStorage.getItem('username') || 'admin',
    lyDo: '',
    maThamChieu: ''
  });

  // UI state: modals, search and transaction forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newTransaction, setNewTransaction] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
    note: ''
  });

  // Temp state used when creating new products/variants via this UI
  const [newItem, setNewItem] = useState({
    productCode: '',
    productName: '',
    category: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unitPrice: 0,
    variants: []
  });

  // Lấy danh sách biến thể
  useEffect(() => {
    fetchVariants();
  }, []);

  const fetchVariants = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/bien-the-san-pham', { params: { size: 1000 } });
      const list = Array.isArray(data) ? data : (data?.content || []);
      setVariants(list);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách biến thể');
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = (variant) => {
    const { soLuongTon, mucTonToiThieu } = variant;
    if (soLuongTon === 0) return 'out_of_stock';
    if (soLuongTon <= (mucTonToiThieu || 5)) return 'low';
    return 'normal';
  };

  // Map raw API item to UI inventory shape
  const mapInventoryFromApi = (item) => {
    const soLuong = item.soLuongTon ?? item.stock ?? 0;
    const gia = item.giaBan ?? item.price ?? 0;
    const mucTon = item.mucTonToiThieu ?? item.tonKhoToiThieu ?? 5;
    return {
      maBienThe: item.maBienThe ?? item.id,
      sanPham: {
        maSanPham: item.sanPham?.maSanPham ?? item.productId,
        tenSanPham: item.sanPham?.tenSanPham ?? item.productName,
        danhMuc: item.sanPham?.danhMuc?.tenDanhMuc ?? item.category
      },
      sku: item.sku ?? '',
      giaBan: gia,
      soLuongTon: soLuong,
      tonKhoToiThieu: mucTon,
      tonKhoToiDa: item.tonKhoToiDa ?? 100,
      giaTriTongKho: gia * soLuong,
      ngayCapNhat: item.ngayCapNhat ?? item.updatedAt ?? new Date().toISOString().split('T')[0],
      trangThai: getStockStatus({ soLuongTon: soLuong, mucTonToiThieu: mucTon }),
      thuocTinh: item.thuocTinh ?? item.attributes ?? []
    };
  };

  // Fetch inventory data on mount (use refresh helper)
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        await refreshInventoryFromServer();
        // load products list from backend (for consistency)
        try {
          const prodResp = await api.get('/api/products');
          const prodList = Array.isArray(prodResp) ? prodResp : (prodResp?.data || prodResp?.content || []);
          setProducts(prodList.map(p => ({ maSanPham: p.maSanPham ?? p.id, tenSanPham: p.tenSanPham ?? p.name })));
        } catch (e) {
          
        }
        // load recent transactions (from stock history table) - fetch last 20 entries
        try {
          const recent = await api.get('/api/v1/quan-ly-ton-kho/lich-su-xuat-nhap/0?limit=20');
          const recentList = Array.isArray(recent) ? recent : (recent?.data || recent?.content || []);
          setTransactions(recentList.map((r, i) => ({
            id: r.maLichSu ?? i,
            productName: r.bienTheSanPham?.sanPham?.tenSanPham ?? r.bienTheSanPham?.tenSanPham ?? `VT-${r.bienTheSanPham?.maBienThe}`,
            type: r.loaiGiaoDich?.toLowerCase?.() ?? 'unknown',
            quantity: r.soLuongThayDoi ?? r.soLuong ?? 0,
            unitPrice: 0,
            totalValue: 0,
            date: r.thoiGianThucHien?.split?.('T')?.[0] ?? r.thoiGianThucHien,
            note: r.lyDo || ''
          })));
        } catch (e) {
          // ignore
        }
        // fetch suppliers for import modal
        try {
          const supResp = await api.get('/api/suppliers');
          setSuppliers(Array.isArray(supResp) ? supResp : (supResp?.data || []));
        } catch (err) {
          
        }
        // Auto-open import modal if quick-launch flag is set
        try {
          const shouldOpen = localStorage.getItem('openImportModal');
          if (shouldOpen) {
            setShowImportModal(true);
            localStorage.removeItem('openImportModal');
          }
        } catch (e) {
          // ignore
        }
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu tồn kho');
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshInventoryFromServer = async () => {
    try {
      const variantsResp = await api.get('/api/bien-the-san-pham', { params: { size: 1000 } });
      const variantsList = Array.isArray(variantsResp) ? variantsResp : (variantsResp?.content || variantsResp?.variants || []);
      const mapped = variantsList.map(mapInventoryFromApi);
      // apply low-stock flag if soLuongTon <= threshold
      const threshold = 5;
      mapped.forEach(m => {
        m.isLowStock = (m.soLuongTon ?? 0) <= threshold && (m.soLuongTon ?? 0) > 0;
        m.isOutOfStock = (m.soLuongTon ?? 0) === 0;
      });
      setInventory(mapped);
    } catch (err) {
      
    }
  };

  // inventory will be populated from backend on mount
  const [inventory, setInventory] = useState([]);

  const [transactions, setTransactions] = useState([]);


  const getStatusColor = (status) => {
    // accept both english keys (from getStockStatus) and vietnamese keys
    switch (status) {
      case 'normal':
      case 'binh_thuong':
        return 'bg-green-100 text-green-800';
      case 'low':
      case 'thap':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
      case 'het_hang':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal':
      case 'binh_thuong':
        return 'Bình thường';
      case 'low':
      case 'thap':
        return 'Sắp hết';
      case 'out_of_stock':
      case 'het_hang':
        return 'Hết hàng';
      default:
        return 'Không xác định';
    }
  };

  const handleImport = () => {
    // Call backend API to import stock
    (async () => {
      const maBienThe = parseInt(newTransaction.productId);
      const soLuong = parseInt(newTransaction.quantity);
      const nguoiNhap = importForm.nguoiNhap || localStorage.getItem('username') || 'admin';
      const lyDo = importForm.lyDo || newTransaction.note || '';
      if (!maBienThe || !soLuong) {
        alert('Vui lòng chọn sản phẩm và số lượng');
        return;
      }
      try {
        setIsLoading(true);
        const payload = { maBienThe, soLuong, nguoiNhap, lyDo };
        // include supplier if selected
        if (importForm.maNhaCungCap) payload.maNhaCungCap = parseInt(importForm.maNhaCungCap);
        const resp = await api.post('/api/v1/quan-ly-ton-kho/nhap-kho', { body: payload });
        if (resp && resp.success) {
          // Refresh inventory from server
          const variantsResp = await api.get('/api/bien-the-san-pham', { params: { size: 1000 } });
          const variantsList = Array.isArray(variantsResp) ? variantsResp : (variantsResp?.content || variantsResp?.variants || []);
          setInventory(variantsList.map(mapInventoryFromApi));
          const transaction = {
            id: transactions.length + 1,
            productName: inventory.find(i => i.maBienThe === maBienThe)?.sanPham?.tenSanPham || String(maBienThe),
            type: 'import',
            quantity: soLuong,
            unitPrice: parseInt(newTransaction.unitPrice) || 0,
            totalValue: soLuong * (parseInt(newTransaction.unitPrice) || 0),
            date: new Date().toISOString().split('T')[0],
            note: lyDo
          };
          setTransactions([transaction, ...transactions]);
        } else {
          alert(resp?.message || 'Nhập kho thất bại');
        }
      } catch (err) {
        alert('Lỗi khi gọi API nhập kho');
      } finally {
        setIsLoading(false);
        setNewTransaction({ productId: '', quantity: '', unitPrice: '', note: '' });
        setShowImportModal(false);
      }
    })();
  };

  const handleCreateSupplierInline = async () => {
    if (!newSupplierName || !newSupplierName.trim()) {
      alert('Tên nhà cung cấp không được để trống');
      return;
    }
    try {
      const body = { tenNhaCungCap: newSupplierName };
      const resp = await api.post('/api/suppliers', body);
      if (resp) {
        // refresh suppliers list and select newly created
        const supResp = await api.get('/api/suppliers');
        const list = Array.isArray(supResp) ? supResp : (supResp?.data || []);
        setSuppliers(list);
        const created = list.find(s => (s.tenNhaCungCap || s.name) === newSupplierName) || list[list.length - 1];
        setImportForm(prev => ({ ...prev, maNhaCungCap: created.maNhaCungCap || created.id }));
        setCreatingSupplier(false);
        setNewSupplierName('');
        alert('Tạo nhà cung cấp thành công');
      } else {
        alert('Không thể tạo nhà cung cấp');
      }
    } catch (err) {
      alert('Lỗi khi tạo nhà cung cấp');
    }
  };

  const handleExport = () => {
    // Call backend API to export stock
    (async () => {
      const maBienThe = parseInt(newTransaction.productId);
      const soLuong = parseInt(newTransaction.quantity);
      const nguoiXuat = exportForm.nguoiXuat || localStorage.getItem('username') || 'admin';
      const lyDo = exportForm.lyDo || newTransaction.note || '';
      const maThamChieu = exportForm.maThamChieu || '';
      if (!maBienThe || !soLuong) {
        alert('Vui lòng chọn sản phẩm và số lượng');
        return;
      }
      try {
        setIsLoading(true);
        const payload = { maBienThe, soLuong, nguoiXuat, lyDo, maThamChieu };
        const resp = await api.post('/api/v1/quan-ly-ton-kho/xuat-kho', { body: payload });
        if (resp && resp.success) {
          // refresh inventory
          const variantsResp = await api.get('/api/bien-the-san-pham', { params: { size: 1000 } });
          const variantsList = Array.isArray(variantsResp) ? variantsResp : (variantsResp?.content || variantsResp?.variants || []);
          setInventory(variantsList.map(mapInventoryFromApi));
          const transaction = {
            id: transactions.length + 1,
            productName: inventory.find(i => i.maBienThe === maBienThe)?.sanPham?.tenSanPham || String(maBienThe),
            type: 'export',
            quantity: soLuong,
            unitPrice: parseInt(newTransaction.unitPrice) || 0,
            totalValue: soLuong * (parseInt(newTransaction.unitPrice) || 0),
            date: new Date().toISOString().split('T')[0],
            note: lyDo
          };
          setTransactions([transaction, ...transactions]);
        } else {
          alert(resp?.message || 'Xuất kho thất bại');
        }
      } catch (err) {
        alert('Lỗi khi gọi API xuất kho');
      } finally {
        setIsLoading(false);
        setNewTransaction({ productId: '', quantity: '', unitPrice: '', note: '' });
        setShowExportModal(false);
      }
    })();
  };

  // Adjust stock (dieu chinh)
  const handleAdjust = () => {
    (async () => {
      const maBienThe = parseInt(newTransaction.productId);
      const soLuongMoi = parseInt(newTransaction.quantity);
      const nguoiDieuChinh = localStorage.getItem('username') || 'admin';
      const lyDo = newTransaction.note || '';

      if (!maBienThe || isNaN(soLuongMoi)) {
        alert('Vui lòng chọn sản phẩm và nhập số lượng mới');
        return;
      }

      try {
        setIsLoading(true);
        const payload = { maBienThe, soLuongMoi, nguoiDieuChinh, lyDo };
        const resp = await api.post('/api/v1/quan-ly-ton-kho/dieu-chinh', { body: payload });
        if (resp && resp.success) {
          await refreshInventoryFromServer();
          alert('Điều chỉnh tồn kho thành công');
        } else {
          alert(resp?.message || 'Điều chỉnh thất bại');
        }
      } catch (err) {
        alert('Lỗi khi gọi API điều chỉnh');
      } finally {
        setIsLoading(false);
        setNewTransaction({ productId: '', quantity: '', unitPrice: '', note: '' });
        setShowAdjustModal(false);
      }
    })();
  };

  // Variant Management Functions
  const handleAddVariant = () => {
    const newVariant = {
      sku: '',
      giaBan: 0,
      soLuongTon: 0,
      thuocTinh: []
    };
    setNewItem({
      ...newItem,
      variants: [...(newItem.variants || []), newVariant]
    });
  };

  const handleRemoveVariant = (index) => {
    const updatedVariants = (newItem.variants || []).filter((_, i) => i !== index);
    setNewItem({
      ...newItem,
      variants: updatedVariants
    });
  };

  const handleVariantChange = (variantIndex, field, value) => {
    const updatedVariants = [...(newItem.variants || [])];
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      [field]: value
    };
    setNewItem({
      ...newItem,
      variants: updatedVariants
    });
  };

  const handleAddAttribute = (variantIndex) => {
    const updatedVariants = [...(newItem.variants || [])];
    if (!updatedVariants[variantIndex].thuocTinh) {
      updatedVariants[variantIndex].thuocTinh = [];
    }
    updatedVariants[variantIndex].thuocTinh.push({
      tenThuocTinh: '',
      giaTri: ''
    });
    setNewItem({
      ...newItem,
      variants: updatedVariants
    });
  };

  const handleRemoveAttribute = (variantIndex, attrIndex) => {
    const updatedVariants = [...(newItem.variants || [])];
    updatedVariants[variantIndex].thuocTinh = updatedVariants[variantIndex].thuocTinh.filter((_, i) => i !== attrIndex);
    setNewItem({
      ...newItem,
      variants: updatedVariants
    });
  };

  const handleAttributeChange = (variantIndex, attrIndex, field, value) => {
    const updatedVariants = [...(newItem.variants || [])];
    updatedVariants[variantIndex].thuocTinh[attrIndex] = {
      ...updatedVariants[variantIndex].thuocTinh[attrIndex],
      [field]: value
    };
    setNewItem({
      ...newItem,
      variants: updatedVariants
    });
  };

  const handleAddProductWithVariants = () => {
    if (!newItem.variants || newItem.variants.length === 0) {
      alert('Vui lòng thêm ít nhất một biến thể cho sản phẩm!');
      return;
    }

    // Validate variants
    for (let i = 0; i < newItem.variants.length; i++) {
      const variant = newItem.variants[i];
      if (!variant.sku || !variant.giaBan || variant.soLuongTon < 0) {
        alert(`Vui lòng điền đầy đủ thông tin cho biến thể ${i + 1}!`);
        return;
      }
    }

    // Create new inventory entries for each variant
    const newInventoryItems = newItem.variants.map((variant, index) => ({
      maBienThe: inventory.length + index + 1,
      sanPham: {
        maSanPham: newItem.productCode,
        tenSanPham: newItem.productName,
        danhMuc: newItem.category
      },
      sku: variant.sku,
      giaBan: variant.giaBan,
      soLuongTon: variant.soLuongTon,
      tonKhoToiThieu: 5, // Default value
      tonKhoToiDa: 100, // Default value
      giaTriTongKho: variant.giaBan * variant.soLuongTon,
      ngayCapNhat: new Date().toISOString().split('T')[0],
      trangThai: variant.soLuongTon > 5 ? 'binh_thuong' : variant.soLuongTon > 0 ? 'thap' : 'het_hang',
      thuocTinh: variant.thuocTinh
    }));

    setInventory([...inventory, ...newInventoryItems]);
    
    // Reset form
    setNewItem({
      productName: '',
      category: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unitPrice: 0,
      variants: []
    });
    
    setShowAddModal(false);
    alert(`Đã nhập thành công sản phẩm "${newItem.productName}" với ${newItem.variants.length} biến thể!`);
  };

  const filteredInventory = inventory.filter(item => {
    const name = (item?.sanPham?.tenSanPham ?? item?.sanPham ?? '').toString().toLowerCase();
    const sku = (item?.sku ?? '').toString().toLowerCase();
    const term = (searchTerm ?? '').toString().toLowerCase();
    const matchesSearch = term === '' || name.includes(term) || sku.includes(term);
    const matchesStatus = selectedStatus === 'all' || item.trangThai === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Tồn kho</h1>
          <p className="text-gray-600">Theo dõi và quản lý tồn kho sản phẩm</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/** compute counts from inventory so UI updates when data refreshes **/}
          {(() => {
            const lowCount = inventory.filter(i => (i.isLowStock) || (i.trangThai === 'low' || i.trangThai === 'thap')).length;
            const outCount = inventory.filter(i => (i.isOutOfStock) || (i.trangThai === 'out_of_stock' || i.trangThai === 'het_hang')).length;
            return (
              <>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <p className="text-sm font-medium text-gray-600">Sắp hết</p>
                  <p className="text-2xl font-bold text-gray-900">{lowCount}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <IoTrash className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Hết hàng</p>
                      <p className="text-2xl font-bold text-gray-900">{outCount}</p>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="normal">Bình thường</option>
                <option value="low">Sắp hết</option>
                <option value="out">Hết hàng</option>
              </select>
            </div>

            {/* Action Buttons - keep only main actions: Nhập hàng, Cập nhật tồn kho, Tải lại */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <IoTrendingUp className="w-5 h-5" />
                Nhập hàng
              </button>
              <button
                onClick={() => setShowAdjustModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <IoRefresh className="w-5 h-5" />
                Cập nhật tồn kho
              </button>
              <button
                onClick={refreshInventoryFromServer}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <IoRefresh className="w-5 h-5" />
                Tải lại
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách tồn kho</h3>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <IoAdd className="w-4 h-4" />
              Thêm sản phẩm
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm & SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Biến thể
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá bán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng giá trị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cập nhật cuối
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.maBienThe} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.sanPham.tenSanPham}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {item.sku}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.sanPham.danhMuc}
                        </div>
                      </div>
                    </td>
                    {/* removed extra history column to align with table headers */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {item.thuocTinh.map((attr, index) => (
                          <div key={index} className="text-xs">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {attr.tenThuocTinh}: {attr.giaTri}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{item.soLuongTon}</div>
                        <div className="text-xs text-gray-500">
                          Min: {item.tonKhoToiThieu} | Max: {item.tonKhoToiDa}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.giaBan.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.giaTriTongKho.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.trangThai)}`}>
                        {getStatusText(item.trangThai)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.ngayCapNhat}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá đơn vị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng giá trị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'import' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'import' ? 'Nhập' : 'Xuất'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.unitPrice.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.totalValue.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Nhập hàng</h3>
                  <span className="text-sm text-gray-500">Thêm số lượng cho biến thể đã có</span>
                </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sản phẩm
                  </label>
                  <select
                    value={newTransaction.productId}
                    onChange={(e) => setNewTransaction({...newTransaction, productId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {inventory.map(product => (
                      <option key={product.maBienThe} value={product.maBienThe}>
                        {`${product.sanPham?.tenSanPham ?? `VT-${product.maBienThe}`} — SKU: ${product.sku || '-'} — Tồn: ${product.soLuongTon ?? 0}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp (tùy chọn)</label>
                  {!creatingSupplier ? (
                    <div className="flex gap-2">
                      <select
                        value={importForm.maNhaCungCap || ''}
                        onChange={(e) => setImportForm({...importForm, maNhaCungCap: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Chọn nhà cung cấp (nếu có)</option>
                        {suppliers.map(s => (
                          <option key={s.maNhaCungCap || s.id} value={s.maNhaCungCap || s.id}>{String(s.tenNhaCungCap ?? s.name ?? '')}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setCreatingSupplier(true)}
                        className="px-3 py-2 bg-gray-100 rounded-lg"
                      >
                        Thêm
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        placeholder="Tên nhà cung cấp"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button onClick={handleCreateSupplierInline} className="px-3 py-2 bg-green-600 text-white rounded-lg">Lưu</button>
                      <button onClick={() => { setCreatingSupplier(false); setNewSupplierName(''); }} className="px-3 py-2 bg-gray-100 rounded-lg">Hủy</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    value={newTransaction.quantity}
                    onChange={(e) => setNewTransaction({...newTransaction, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập số lượng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá đơn vị (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={newTransaction.unitPrice}
                    onChange={(e) => setNewTransaction({...newTransaction, unitPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập giá đơn vị"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={newTransaction.note}
                    onChange={(e) => setNewTransaction({...newTransaction, note: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập ghi chú"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Nhập hàng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Adjust Modal (Cập nhật tồn kho) */}
        {showAdjustModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Cập nhật tồn kho</h3>
                <span className="text-sm text-gray-500">Chỉnh số lượng hiện có cho biến thể</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biến thể</label>
                  <select
                    value={newTransaction.productId}
                    onChange={(e) => setNewTransaction({...newTransaction, productId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Chọn biến thể</option>
                    {inventory.map(v => (
                      <option key={v.maBienThe} value={v.maBienThe}>
                        {`${v.sanPham?.tenSanPham ?? `VT-${v.maBienThe}`} — SKU: ${v.sku || '-'} — Tồn: ${v.soLuongTon ?? 0}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng mới</label>
                  <input
                    type="number"
                    value={newTransaction.quantity}
                    onChange={(e) => setNewTransaction({...newTransaction, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập số lượng mới (ví dụ: 50)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (lý do)</label>
                  <textarea
                    value={newTransaction.note}
                    onChange={(e) => setNewTransaction({...newTransaction, note: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Lý do điều chỉnh (tùy chọn)"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowAdjustModal(false); setNewTransaction({ productId: '', quantity: '', unitPrice: '', note: '' }); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAdjust}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Xuất hàng</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sản phẩm
                  </label>
                  <select
                    value={newTransaction.productId}
                    onChange={(e) => setNewTransaction({...newTransaction, productId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {inventory.map(product => (
                      <option key={product.maBienThe} value={product.maBienThe}>
                        {product.sanPham?.tenSanPham || product.sanPham || `VT-${product.maBienThe}`} (Tồn: {product.soLuongTon ?? 0})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    value={newTransaction.quantity}
                    onChange={(e) => setNewTransaction({...newTransaction, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập số lượng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={newTransaction.unitPrice}
                    onChange={(e) => setNewTransaction({...newTransaction, unitPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập giá bán"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={newTransaction.note}
                    onChange={(e) => setNewTransaction({...newTransaction, note: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập ghi chú"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Xuất hàng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product with Variants Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Nhập hàng - Sản phẩm và Biến thể
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleAddProductWithVariants(); }}>
                  {/* Product Basic Info */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin sản phẩm</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã sản phẩm</label>
                        <input
                          type="text"
                          value={newItem.productCode || ''}
                          onChange={(e) => setNewItem({...newItem, productCode: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="SP001"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                        <input
                          type="text"
                          value={newItem.productName}
                          onChange={(e) => setNewItem({...newItem, productName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nhập tên sản phẩm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                        <select
                          value={newItem.category}
                          onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        >
                          <option value="">Chọn danh mục</option>
                          <option value="Ghế">Ghế</option>
                          <option value="Bàn">Bàn</option>
                          <option value="Tủ">Tủ</option>
                          <option value="Giường">Giường</option>
                          <option value="Sofa">Sofa</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <input
                          type="text"
                          value={newItem.description || ''}
                          onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Mô tả sản phẩm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Variants Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Biến thể sản phẩm</h4>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                      >
                        <IoAdd className="w-4 h-4" />
                        Thêm biến thể
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(newItem.variants || []).map((variant, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">Biến thể #{index + 1}</h5>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <IoTrash className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                              <input
                                type="text"
                                value={variant.sku || ''}
                                onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="ABC-XYZ-001"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                              <input
                                type="number"
                                value={variant.giaBan || 0}
                                onChange={(e) => handleVariantChange(index, 'giaBan', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng nhập</label>
                              <input
                                type="number"
                                value={variant.soLuongTon || 0}
                                onChange={(e) => handleVariantChange(index, 'soLuongTon', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0"
                                required
                              />
                            </div>
                          </div>

                          {/* Attributes */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-gray-700">Thuộc tính</label>
                              <button
                                type="button"
                                onClick={() => handleAddAttribute(index)}
                                className="text-sm text-primary hover:text-primary/80"
                              >
                                + Thêm thuộc tính
                              </button>
                            </div>
                            <div className="space-y-2">
                              {(variant.thuocTinh || []).map((attr, attrIndex) => (
                                <div key={attrIndex} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={attr.tenThuocTinh || ''}
                                    onChange={(e) => handleAttributeChange(index, attrIndex, 'tenThuocTinh', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Tên thuộc tính (VD: Màu sắc)"
                                  />
                                  <input
                                    type="text"
                                    value={attr.giaTri || ''}
                                    onChange={(e) => handleAttributeChange(index, attrIndex, 'giaTri', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Giá trị (VD: Đỏ)"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAttribute(index, attrIndex)}
                                    className="px-3 py-2 text-red-600 hover:text-red-800"
                                  >
                                    <IoTrash className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!newItem.variants || newItem.variants.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Chưa có biến thể nào. Nhấn "Thêm biến thể" để bắt đầu.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Nhập hàng
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;


