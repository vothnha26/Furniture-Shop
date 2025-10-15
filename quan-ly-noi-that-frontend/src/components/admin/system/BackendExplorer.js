import React, { useEffect, useState } from 'react';
import api from '../../../api';

const BackendExplorer = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [prodRes, custRes] = await Promise.all([
          api.get('/api/products').catch(() => []),
          api.get('/api/customers').catch(() => [])
        ]);

        // products may be array or {content: []}
        const prods = Array.isArray(prodRes) ? prodRes : (prodRes && prodRes.content) ? prodRes.content : [];
        const custs = Array.isArray(custRes) ? custRes : (custRes && custRes.content) ? custRes.content : [];

        setProducts(prods);
        setCustomers(custs);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="p-6">Đang tải dữ liệu từ backend...</div>;
  if (error) return <div className="p-6 text-red-600">Lỗi: {String(error.message || error)}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Backend Explorer</h2>

      <section className="mb-8">
        <h3 className="text-lg font-medium mb-2">Sản phẩm</h3>
        {products.length === 0 ? (
          <div className="text-sm text-gray-600">Không có sản phẩm trả về</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tên</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Giá</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tồn</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-sm">
                {products.map((p, idx) => (
                  <tr key={p.id || p.maSanPham || idx}>
                    <td className="px-4 py-2">{p.id || p.maSanPham || '-'}</td>
                    <td className="px-4 py-2">{p.tenSanPham || p.name || p.ten || '-'}</td>
                    <td className="px-4 py-2">{p.giaBan || p.price || '-'}</td>
                    <td className="px-4 py-2">{p.soLuongTon || p.stock || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-medium mb-2">Khách hàng</h3>
        {customers.length === 0 ? (
          <div className="text-sm text-gray-600">Không có khách hàng trả về</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Tên</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-sm">
                {customers.map((c, idx) => (
                  <tr key={c.id || c.maKhachHang || idx}>
                    <td className="px-4 py-2">{c.id || c.maKhachHang || '-'}</td>
                    <td className="px-4 py-2">{c.hoTen || c.name || c.ten || '-'}</td>
                    <td className="px-4 py-2">{c.email || c.emailKhachHang || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default BackendExplorer;
