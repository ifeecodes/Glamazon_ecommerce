import Product from "../models/product.model.js";
export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });
    //add quantity to each product based on the cartItems in the user object
    const cartItems = products.map((product) => {
      const cartItem = req.user.cartItems.find(cartItem=> cartItem.id === product._id);
      return { ...product.toJSON(), quantity:item.quantity};
    });
    res.json(cartItems);
  } catch (error) {
    console.error("Error in getCartProducts controller:", error);
    res.status(500).json({ message: "Error fetching cart products", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = req.user; // Assuming the user is authenticated and available in req.user
    // Check if the product already exists in the user's cart
    const existingCartItem = user.cartItems.find((item) => item.id === productId);
      if (existingCartItem) {
        // If the product already exists, update the quantity
        existingCartItem.quantity += 1;
      } else {
        // If the product doesn't exist, add it to the cart
        user.cartItems.push({ id: productId});
      }
      await user.save();
      res.json(user.cartItems);
      res.status(200).json({ message: "Product added to cart successfully", cartItems: user.cartItems });
  } catch (error) {
    console.error("Error in addToCart controller :", error);
    res.status(500).json({ message: "Error adding product to cart", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user; 
    if(!productId){
    user.cartItems = []; // Clear the cart items
    }else{
    user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    res.json(user.cartItems);
    res.status(200).json({ message: "All products removed from cart successfully", cartItems: user.cartItems });
  } catch (error) {
    console.error("Error in removeAllFromCart controller:", error);
    res.status(500).json({ message: "Error removing products from cart", error: error.message });
  }
};
export const updateQuantity = async (req, res) => {
    try{
        const {id: productId} = req.params;
        const { quantity } = req.body;
        const user = req.user;
        const existingItem = user.cartItems.find((item) => item.id === productId);

        if (existingItem) {
            if (quantity <= 0) {
                // Remove the item from the cart if quantity is less than or equal to 0
                user.cartItems = user.cartItems.filter((item) => item.id !== productId);
            await user.save();
            res.json(user.cartItems);
        }
        existingItem.quantity = quantity;
        await user.save();
        res.json(user.cartItems);
            res.status(200).json({ message: "Product quantity updated successfully", cartItems: user.cartItems });
        } else {
            res.status(404).json({ message: "Product not found in cart" });
        }
    }
    catch(error) {
        console.error("Error in updateQuantity controller:", error);
        res.status(500).json({ message: "Error updating product quantity", error: error.message });
    }

};
