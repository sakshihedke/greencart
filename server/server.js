import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';

import userRouter from './routes/UserRoute.js';
import sellerRouter from './routes/sellerRoutes.js';
import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhook } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

// Connect to DB & Cloudinary
await connectDB();
await connectCloudinary();

// ✅ Middleware (important order)
const allowedOrigins = ['http://localhost:5173','https://greencart-5myb-dis8osz3r-sakshis-projects-ac7e9add.vercel.app']; // add production domains when needed

// Stripe webhook must be before express.json() for raw body parsing
app.post('/api/order/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Then, use general middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// ✅ Routes
app.get('/', (req, res) => {
  res.send("API is working ✅");
});

app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
