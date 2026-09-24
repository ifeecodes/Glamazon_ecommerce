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
      const response = await axios.post("/products", productData);
      set((prevStates) => ({
        products: [...prevStates.products, response.data],
        loading: false,
      }));
    } catch (error) {
      toast.error("Failed to create product");
      set({ loading: false });
    }
  },
}));
