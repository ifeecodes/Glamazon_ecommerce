import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import stripe from "../lib/stripe.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ error: "Products array is required and cannot be empty" });
    }
    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); //Stripe wants your price sent in cents
      const quantity = product.quantity || 1;
      totalAmount += amount * quantity;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            ...(product.image ? { images: [product.image] } : {}),
          },
          unit_amount: amount,
        },
        quantity,
      };
    });

    //To make the coupon work
    let userCoupon = null;
    if (couponCode) {
      userCoupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (!userCoupon) {
        return res.status(400).json({ error: "Coupon is invalid or inactive" });
      }
      if (userCoupon.expirationDate < new Date()) {
        userCoupon.isActive = false;
        await userCoupon.save();
        return res.status(400).json({ error: "Coupon has expired" });
      }
      if (userCoupon) {
        totalAmount -= Math.round(
          (totalAmount * userCoupon.discount) / 100,
        );
      }
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: userCoupon
        ? [
            {
              coupon: await createStripeCoupon(userCoupon.discount),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity || 1,
            price: p.price,
          })),
        ),
      },
    });
    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }
    res.status(200).json({
      id: session.id,
      url: session.url,
      totalAmount: totalAmount / 100,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "Checkout session ID is required." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Checkout session does not belong to this user." });
    }
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Checkout session payment is not complete." });
    }

    let order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      const products = JSON.parse(session.metadata.products);
      try {
        order = await Order.create({
          userId: session.metadata.userId,
          products: products.map((product) => ({
            product: product.id,
            quantity: product.quantity,
            price: product.price,
          })),
          totalAmount: session.amount_total / 100, //convert from cents to dollars
          stripeSessionId: sessionId,
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
        order = await Order.findOne({ stripeSessionId: sessionId });
        if (!order) throw error;
      }
    }

    if (session.metadata.couponCode) {
      await Coupon.findOneAndUpdate(
        {
          code: session.metadata.couponCode,
          userId: session.metadata.userId,
        },
        { isActive: false },
      );
    }

    res.status(200).json({
      success: true,
      message: "Payment successful and order created.",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error in checkout-success route:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discount: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userId: userId,
  });
  await newCoupon.save();
  return newCoupon;
}
