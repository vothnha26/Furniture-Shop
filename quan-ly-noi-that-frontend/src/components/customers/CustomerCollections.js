import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CollectionsSidebar from './CollectionsSidebar';
import api from '../../api';

// Resolve relative image paths (starting with '/') to full URL using api.buildUrl
function resolveImage(path) {
  if (!path) return null;
  // If already absolute URL (http/https), return as-is
  if (/^https?:\/\//i.test(path)) return path;
  // If path starts with '/', treat as server-hosted static and prefix with API base
  if (path.startsWith('/')) return api.buildUrl(path);
  // Otherwise also try to prefix (covers uploads without leading slash)
  return api.buildUrl('/' + path);
}

const CustomerCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCollections = async () => {
      try {
        const data = await api.get('/api/collections');
        if (mounted) setCollections(Array.isArray(data) ? data : (data.content || []));
      } catch (err) {
        // fallback to a small mock if backend not available
        if (mounted) setCollections([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCollections();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:flex lg:gap-8">
          <CollectionsSidebar collections={collections} />

          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Bộ sưu tập</h1>
              <p className="text-gray-600">Khám phá bộ sưu tập sản phẩm được tuyển chọn.</p>
            </div>

            {loading ? (
              <div>Đang tải...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map(col => (
                  <article key={col.maBoSuuTap ?? col.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {col.hinhAnh || (col.hinhAnhList && col.hinhAnhList[0]) || col.image ? (
                      <img src={resolveImage(col.hinhAnh || (col.hinhAnhList && col.hinhAnhList[0]?.duongDanHinhAnh) || col.image)} alt={col.tenBoSuuTap || col.name} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">No image</div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{col.tenBoSuuTap || col.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{col.moTa || col.description}</p>
                      <Link to={`/shop/collections/${col.maBoSuuTap ?? col.id}`} className="inline-block px-4 py-2 bg-primary text-white rounded-lg">Xem bộ sưu tập</Link>
                    </div>
                  </article>
                ))}
                {collections.length === 0 && (
                  <div className="text-gray-500">Chưa có bộ sưu tập nào được tạo.</div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomerCollections;
