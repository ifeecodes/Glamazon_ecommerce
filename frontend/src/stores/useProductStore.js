import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  setProducts: (products) => set({ products }),
  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const response = await axios.post("/product", productData);
      set((prevStates) => ({
        products: [...prevStates.products, response.data],
        loading: false,
      }));
    } catch (error) {
      toast.error("Failed to create product");
      set({ loading: false });
    }
  },
  fetchAllProduct: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/product");
      set({ products: response.data.products, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.message || "Failed to fetch products");
    }
  },
  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/product/${productId}`);
      set((prevStates) => ({
        products: prevStates.products.filter((product) => product._id !== productId),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || "Failed to delete product");
    }
  },
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
        const response = await axios.patch(`/product/${productId}`);
        //this will update the product in the store with the new featured status
        set((prevProducts) => ({
          products: prevProducts.products.map((product) =>
            product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
          ),
          loading: false,
        }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || "Failed to toggle featured product");
    }
  },
}));
