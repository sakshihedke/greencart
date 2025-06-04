import jwt from 'jsonwebtoken';

export const authUser = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized: No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // ✅ attach userId to request
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
