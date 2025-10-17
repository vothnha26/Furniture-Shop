import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Normalize older saved items so we always have variantId and displayName
      const migrated = parsed.map(i => {
        const variant = i.variant || {};
        const variantId = i.variantId || i.id || variant.id || variant.maBienThe || null;
        const productName = i.name || i.displayName || (i.product && (i.product.tenSanPham || i.product.name)) || 'Sản phẩm';
        const variantName = variant.name || variant.tenBienThe || (variant.attributes && Array.isArray(variant.attributes) ? variant.attributes.map(a => a.giaTri).join(' - ') : null) || null;
        return {
          ...i,
          id: i.id || variantId,
          variantId: variantId,
          displayName: i.displayName || (variantName ? `${productName} - ${variantName}` : productName),
          quantity: typeof i.quantity === 'number' ? i.quantity : 1
        };
      });
      return migrated;
    } catch (err) {
      console.warn('Failed to read cart from localStorage', err);
      return [];
    }
  });

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to persist cart to localStorage', err);
    }
  }, [items]);

  const addToCart = (product, variant, quantity = 1) => {
    const variantId = variant?.id ?? variant?.maBienThe ?? product?.id ?? product?.maSanPham ?? Math.random().toString(36).slice(2,9);
    setItems(prev => {
      const existing = prev.find(i => i.variantId === variantId);
      if (existing) {
        return prev.map(i => i.variantId === variantId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      const item = {
        // Prefer variantId for uniqueness when a variant is selected. Fall back to product id.
        id: variantId ?? product?.id ?? product?.maSanPham ?? Math.random().toString(36).slice(2,9),
        variantId,
        // Prefer a variant-aware display name so different variants don't appear identical in the cart
        displayName: variant?.name ? `${product?.tenSanPham ?? product?.name ?? 'Sản phẩm'} - ${variant.name}` : (product?.tenSanPham ?? product?.name ?? 'Sản phẩm'),
        name: product?.tenSanPham ?? product?.name ?? 'Sản phẩm',
        image: (variant?.image || (product?.hinhAnh && Array.isArray(product.hinhAnh) ? product.hinhAnh[0] : (product?.image || product?.images?.[0]))) ?? null,
        price: Number(variant?.price ?? variant?.giaSauGiam ?? variant?.giaBan ?? product?.giaBan ?? product?.price ?? 0),
        quantity,
        product,
        variant
      };
      return [...prev, item];
    });
  };

  const updateQuantity = (variantIdOrId, newQuantity) => {
    setItems(prev => prev.map(i => (i.variantId === variantIdOrId || i.id === variantIdOrId) ? { ...i, quantity: Math.max(1, newQuantity) } : i));
  };

  const removeItem = (variantIdOrId) => {
    setItems(prev => prev.filter(i => !(i.variantId === variantIdOrId || i.id === variantIdOrId)));
  };

  const isInCart = (variantId) => items.some(i => i.variantId === variantId || i.id === variantId);

  const getItemQuantity = (variantId) => {
    const it = items.find(i => i.variantId === variantId || i.id === variantId);
    return it ? it.quantity : 0;
  };

  const getTotalItems = () => items.reduce((s, i) => s + i.quantity, 0);

  const getTotalPrice = () => items.reduce((s, i) => s + (Number(i.price || 0) * (i.quantity || 0)), 0);

  const clearCart = () => setItems([]);

  const value = {
    items,
    addToCart,
    updateQuantity,
    removeItem,
    isInCart,
    getItemQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      items: [],
      addToCart: () => {},
      updateQuantity: () => {},
      removeItem: () => {},
      isInCart: () => false,
      getItemQuantity: () => 0,
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
      clearCart: () => {}
    };
  }
  return ctx;
};

export default CartContext;
