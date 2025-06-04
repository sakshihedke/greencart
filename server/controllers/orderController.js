import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";

// PLACE ORDER (COD)
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address } = req.body;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    amount += Math.floor(amount * 0.02); // Add 2% tax

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: "Order Placed successfully" });
  } catch (error) {
    console.error("❌ placeOrderCOD error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
//place order stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
   
    const {  userId ,items, address } = req.body;
    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let productData = [];

    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    amount += Math.floor(amount * 0.02); // Add 2% tax

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // Create line items for Stripe
    const line_items = productData.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.floor(item.price + item.price * 0.02) * 100, // cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//Stripe webhooks to verify payments action : /stripe
export const stripeWebhook = async (req, res) => {
  //stripe gateway initialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.header["stripe-signature"];
  let event;
  try{
    event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }catch(error){
    res.send.status(400).send(`Webhook Error: ${error.message}`);
  }

  //handle event
  switch(event.type){
    case "payment_intent.succeeded":{
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
     //getting session metadata
     const session = await stripeInstance.checkout.sessions.list({payment_intent:paymentIntentId});
     const {orderId, userId} = session.data[0].metadata;
    
     //mark payment as paid
     await Order.findByIdAndUpdate(orderId, {isPaid:true});

     //clear user cart
     await User.findByIdAndUpdate(userId, {cartItems:{}});
     break;
    }
    case "payment_intent.payment_failed":{
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
     //getting session metadata
     const session = await stripeInstance.checkout.sessions.list({payment_intent:paymentIntentId});
     const {orderId} = session.data[0].metadata;

     await Order.findByIdAndDelete(orderId);
     break;
    }
    default:
      console.error(`Unhandled event type: ${event.type}`);
      break;
    }
    res.json({recieved: true});
}

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("🔍 Authenticated userId:", userId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
      .populate("items.product") // You can also add "address" if it's a reference
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ getUserOrders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL ORDERS (SELLER / ADMIN)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("❌ getAllOrders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
