import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  availableCoupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

  getMyCoupon: async () => {
    try {
      const response = await axios.get("/coupon");
      set({ availableCoupon: response.data });
    } catch (error) {
      console.log("Error fetching coupon", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch available coupon",
      );
    }
  },
  applyCoupon: async (code) => {
try {
  const response = await axios.post("/coupon/validate", { code });
  set({ coupon: response.data, isCouponApplied: true });
  get().calculateTotals();
  toast.success("Coupon applied successfully");
} catch (error) {
  console.log("Error applying coupon", error);
  toast.error(
    error.response?.data?.message || "Failed to apply coupon",
  );
}
  },

  removeCoupon: () => {
    try {
      set({ coupon: null, isCouponApplied: false });
      get().calculateTotals();
      toast.success("Coupon removed successfully");
    } catch (error) {
      console.log("Error removing coupon", error);
      toast.error(
        error.response?.data?.message || "Failed to remove coupon",
      );
    }
  },

  getCartItems: async () => {
    try {
      const response = await axios.get("/cart");

      set({ cart: response.data });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(
        error.response?.data?.message || "Failed to fetch cart items",
      );
    }
  },
  clearCart: async () => {
    try {
      await axios.delete("/cart");
      set({
        cart: [],
        total: 0,
        subtotal: 0,
        coupon: null,
        availableCoupon: null,
        isCouponApplied: false,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to clear cart",
      );
    }
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", {
        productId: product._id,
      });
      toast.success("Item added to cart");

      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => String(item._id) === String(product._id),
        );
        const newCart = existingItem
          ? prevState.cart.map((item) =>
              String(item._id) === String(product._id)
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...prevState.cart, { ...product, quantity: 1 }];

        return { cart: newCart };
      });
      get().calculateTotals();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add item to cart",
      );
    }
  },
  removeFromCart: async (productId) => {
    try {
      await axios.delete(`/cart`, { data: { productId } });
      set((prevState) => ({
        cart: prevState.cart.filter(
          (item) => String(item._id) !== String(productId),
        ),
      }));
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item from cart");
    }
  },
  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      await get().removeFromCart(productId);
      return;
    }
    try {
      await axios.put(`/cart/${productId}`, { quantity });
      set((prevState) => ({
        cart: prevState.cart.map((item) =>
          String(item._id) === String(productId)
            ? { ...item, quantity }
            : item,
        ),
      }));
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update item quantity");
    }
  },
  calculateTotals: () => {
    const { cart, coupon, isCouponApplied } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    let total = subtotal;
    if (coupon && isCouponApplied) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }
    set({ subtotal, total });
  },
}));
