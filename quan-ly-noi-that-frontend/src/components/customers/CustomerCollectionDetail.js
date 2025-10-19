import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CollectionsSidebar from './CollectionsSidebar';
import api from '../../api';

// Resolve relative image paths (starting with '/') to full URL using api.buildUrl
function resolveImage(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return api.buildUrl(path);
  return api.buildUrl('/' + path);
}

// No local mock for collections: sidebar should display only what backend returns.

const CustomerCollectionDetail = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchList = async () => {
      try {
        const data = await api.get('/api/collections');
        if (mounted) setCollections(Array.isArray(data) ? data : (data.content || []));
      } catch (err) {
        // If backend is not available, leave collections empty (do not show local mocks)
        if (mounted) setCollections([]);
      }
    };
    fetchList();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchOne = async () => {
      try {
        // fetch collection summary
        const data = await api.get(`/api/collections/${id}`);
        // fetch products in collection
        let products = [];
        try { products = await api.get(`/api/collections/${id}/products`); } catch (e) { products = []; }
        if (mounted) setCollection({ ...data, products });
      } catch (err) {
        // If fetching fails, don't reference local mocks (may not exist) — fall back to null
        if (mounted) setCollection(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOne();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:flex lg:gap-8">
          <CollectionsSidebar collections={collections} activeId={id} />

          <main className="flex-1">
            {loading ? (
              <div>Đang tải...</div>
            ) : !collection ? (
              <div>Không tìm thấy bộ sưu tập.</div>
            ) : (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold">{collection.tenBoSuuTap || collection.name}</h1>
                  <p className="text-gray-600">{collection.moTa || collection.description}</p>
                </div>

                {(collection.hinhAnh || collection.hinhAnhList || collection.image) && (
                  <div className="mb-6">
                    <img
                      src={resolveImage(collection.hinhAnh || (collection.hinhAnhList && collection.hinhAnhList[0]?.duongDanHinhAnh) || collection.image)}
                      alt={collection.tenBoSuuTap || collection.name}
                      className="w-full h-56 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collection.products && collection.products.map(p => {
                    const prodId = p.maSanPham ?? p.id;
                    const prodName = p.tenSanPham ?? p.name;
                    const prodDesc = p.moTa ?? p.description;
                    // Prefer hinhAnhList[0].duongDanHinhAnh, then hinhAnh, then image
                    let rawImg = null;
                    if (p.hinhAnhList && p.hinhAnhList.length > 0) {
                      rawImg = p.hinhAnhList[0].duongDanHinhAnh || p.hinhAnhList[0].duongDan || null;
                    }
                    if (!rawImg) rawImg = p.hinhAnh || p.image || null;
                    const prodImage = rawImg ? resolveImage(rawImg) : null;
                    const price = p.giaBan ?? p.price ?? (p.bienTheList && p.bienTheList[0] && (p.bienTheList[0].gia || p.bienTheList[0].giaBan));

                    return (
                      <article key={prodId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {prodImage ? (
                          <img src={prodImage} alt={prodName} className="w-full h-44 object-cover" />
                        ) : (
                          <div className="w-full h-44 bg-gray-100 flex items-center justify-center">No image</div>
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">{prodName}</h3>
                          <div className="text-primary font-bold mb-2">{price ? new Intl.NumberFormat('vi-VN').format(price) + ' ₫' : 'Liên hệ'}</div>
                          <Link to={`/shop/products/${prodId}`} className="inline-block px-3 py-2 bg-primary text-white rounded-lg">Xem chi tiết</Link>
                        </div>
                      </article>
                    );
                  })}
                  {(!collection.products || collection.products.length === 0) && (
                    <div className="text-gray-500">Chưa có sản phẩm nào thuộc bộ sưu tập này.</div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomerCollectionDetail;
