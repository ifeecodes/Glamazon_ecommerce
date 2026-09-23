import express from "express";
//importing route handlers from the controller
import { addToCart, removeAllFromCart, updateQuantity, getCartProducts } from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/", protectRoute, addToCart);
router.get("/", protectRoute, getCartProducts); //get all products in the cart
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);//update quantity of a product in the cart

export default router;