import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('furnitureCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('furnitureCart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('furnitureCart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (product, variant, quantity = 1) => {
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(
        item => item.maBienThe === variant.maBienThe
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].soLuong += quantity;
        
        // Check stock limit
        if (updatedCart[existingItemIndex].soLuong > variant.soLuong) {
          updatedCart[existingItemIndex].soLuong = variant.soLuong;
        }
        
        return updatedCart;
      } else {
        // Add new item
        const newItem = {
          maSanPham: product.maSanPham,
          tenSanPham: product.tenSanPham,
          hinhAnh: product.hinhAnh,
          maBienThe: variant.maBienThe,
          sku: variant.sku,
          giaBan: variant.giaSauGiam || variant.giaBan,
          giaGoc: variant.giaBan,
          soLuong: Math.min(quantity, variant.soLuong),
          soLuongTon: variant.soLuong,
          thuocTinh: variant.thuocTinh || [],
          giamGia: variant.giamGia,
          phanTramGiam: variant.phanTramGiam
        };
        
        return [...prevCart, newItem];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (maBienThe) => {
    setCart(prevCart => prevCart.filter(item => item.maBienThe !== maBienThe));
  };

  // Update item quantity
  const updateQuantity = (maBienThe, quantity) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.maBienThe === maBienThe) {
          const newQuantity = Math.max(1, Math.min(quantity, item.soLuongTon));
          return { ...item, soLuong: newQuantity };
        }
        return item;
      });
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('furnitureCart');
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.giaBan * item.soLuong);
    }, 0);
  };

  // Get cart count
  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.soLuong, 0);
  };

  // Check if item is in cart
  const isInCart = (maBienThe) => {
    return cart.some(item => item.maBienThe === maBienThe);
  };

  // Get item quantity in cart
  const getItemQuantity = (maBienThe) => {
    const item = cart.find(item => item.maBienThe === maBienThe);
    return item ? item.soLuong : 0;
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isInCart,
    getItemQuantity
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
