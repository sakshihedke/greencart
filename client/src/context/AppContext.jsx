import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  // —————— State ——————
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserLogin, setShowUserLogin] = useState(false);

    // —————— Fetch user ——————
  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/user/is-auth');
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});  // make sure this resets cartItems
      }
    } catch (err) {
      setUser(null);
    }
  };


  // —————— Fetch seller status ——————
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get('/api/seller/is-auth');
      setIsSeller(data.success);
    } catch {
      setIsSeller(false);
    }
  };

  // —————— Fetch all products ——————
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message || 'Error fetching products');
    }
  };

  // —————— Cart actions ——————
  const addToCart = (productId) => {
    if (!productId) return;
    setCartItems((prev = {}) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
    toast.success('Added to cart');
  };

  const removeFromCart = (productId) => {
    if (!productId) return;
    setCartItems((prev = {}) => {
      const updated = { ...prev };
      if (updated[productId]) {
        updated[productId] -= 1;
        if (updated[productId] <= 0) {
          delete updated[productId];
        }
      }
      return updated;
    });
    toast.success('Removed from cart');
  };

  const updateCartItem = (itemId, quantity) => {
    if (!itemId || quantity < 0) return;
    setCartItems((prev = {}) => ({
      ...prev,
      [itemId]: quantity,
    }));
    toast.success('Cart updated');
  };

  // —————— Cart count & total ——————
  const getCartCount = () => {
    return Object.values(cartItems || {}).reduce((acc, qty) => acc + qty, 0);
  };

  const getCartTotal = () => {
    let total = 0;
    for (const id in cartItems) {
      const itemInfo = products.find((product) => String(product._id) === id);
      if (itemInfo) {
        total += itemInfo.offerPrice * cartItems[id];
      }
    }
    return Math.floor(total * 100) / 100;
  };

  // —————— Initial fetch ——————
  useEffect(() => {
    fetchUser();
    fetchSeller();
    fetchProducts();
  }, []);

  useEffect(() => {
  const updateCart = async () => {
    try {
      if (!user) return;  // Don't sync if no logged in user
      const { data } = await axios.post('/api/cart/update', { cartItems });
      if (!data.success) {
        toast.error(data.message || 'Failed to update cart');
      }
    } catch (error) {
      toast.error(error.message || 'Error updating cart');
    }
  };

  updateCart();
}, [cartItems, user]); 


  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    cartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    getCartCount,
    getCartTotal,
    searchQuery,
    setSearchQuery,
    fetchProducts,
    fetchUser,
    axios,
    setCartItems
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
