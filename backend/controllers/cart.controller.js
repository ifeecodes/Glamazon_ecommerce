import Product from "../models/product.model.js";
export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({
      _id: { $in: req.user.cartItems.map((item) => item.product) },
    });
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => String(cartItem.product) === String(product._id),
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });
    res.json(cartItems);
  } catch (error) {
    console.error("Error in getCartProducts controller:", error);
    res.status(500).json({ message: "Error fetching cart products", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    const existingCartItem = user.cartItems.find(
      (item) => String(item.product) === String(productId),
    );
    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      user.cartItems.push({ product: productId });
    }
    await user.save();
    res.status(200).json({
      message: "Product added to cart successfully",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.error("Error in addToCart controller :", error);
    res.status(500).json({ message: "Error adding product to cart", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter(
        (item) => String(item.product) !== String(productId),
      );
    }
    await user.save();
    res.status(200).json({
      message: "Cart items removed successfully",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.error("Error in removeAllFromCart controller:", error);
    res.status(500).json({ message: "Error removing products from cart", error: error.message });
  }
};
export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be a positive integer" });
    }

    const existingItem = user.cartItems.find(
      (item) => String(item.product) === String(productId),
    );
    if (!existingItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    existingItem.quantity = quantity;
    await user.save();
    return res.status(200).json({
      message: "Product quantity updated successfully",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.error("Error in updateQuantity controller:", error);
    return res.status(500).json({
      message: "Error updating product quantity",
      error: error.message,
    });
  }
};
