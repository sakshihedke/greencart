import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

// PLACE ORDER - CASH ON DELIVERY
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address } = req.body;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02); // Add 2% tax

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    res.json({ success: true, message: "Order Placed successfully" });
  } catch (error) {
    console.error("❌ placeOrderCOD error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PLACE ORDER - STRIPE ONLINE PAYMENT
export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address } = req.body;
    const { origin } = req.headers;

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let productData = [];
    let amount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02); // Add 2% tax

    // ✅ Set isPaid: false initially
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
      isPaid: false, // Payment will be confirmed via webhook
    });

    const line_items = productData.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(), // ensure it's string
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("❌ placeOrderStripe error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// STRIPE WEBHOOK - HANDLE EVENTS
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log("✅ Stripe event received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { userId, orderId } = session.metadata;

      console.log("✅ Payment success for user:", userId, "Order:", orderId);

      // Mark order as paid
      await Order.findByIdAndUpdate(orderId, { isPaid: true });

      // Clear user's cart
      const user = await User.findById(userId);
      if (user) {
        user.cartItems = [];
        await user.save();
        console.log(`🛒 Cart cleared for user ${userId}`);
      } else {
        console.warn(`⚠️ User not found: ${userId}`);
      }

    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const sessionList = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });

      const session = sessionList.data[0];
      if (session?.metadata?.orderId) {
        await Order.findByIdAndDelete(session.metadata.orderId);
        console.log(`❌ Payment failed, order deleted: ${session.metadata.orderId}`);
      }
    } else {
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler failed:", err);
    res.status(500).send("Internal Server Error");
  }
};



// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const rawOrders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    const filteredOrders = rawOrders.map(order => {
      const validItems = order.items.filter(item => item.product !== null);
      return { ...order.toObject(), items: validItems };
    });

    res.json({ success: true, orders: filteredOrders });
  } catch (error) {
    console.error("❌ getUserOrders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL ORDERS (ADMIN / SELLER)
export const getAllOrders = async (req, res) => {
  try {
    const rawOrders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    const filteredOrders = rawOrders.map(order => {
      const validItems = order.items.filter(item => item.product !== null);
      return { ...order.toObject(), items: validItems };
    });

    res.json({ success: true, orders: filteredOrders });
  } catch (error) {
    console.error("❌ getAllOrders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
