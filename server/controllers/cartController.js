import User from '../models/User.js';

export const updateCart = async (req, res) => {
  try {
    const userId = req.userId;  // read directly from req.userId
    const { cartItems } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!cartItems || typeof cartItems !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid cart items' });
    }

    await User.findByIdAndUpdate(userId, { cartItems });

    res.json({ success: true, message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Return the authenticated user’s saved cartItems array
export const getCart = async (req, res) => {
  try {
    const userId = req.userId;  // directly from req.userId set by authUser middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const user = await User.findById(userId, 'cartItems');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, cartItems: user.cartItems || {} });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
