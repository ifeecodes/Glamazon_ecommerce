import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const ProductCard = ({ product }) => {
  const user = useUserStore();
  const { addToCart } = useCartStore();
  const HandleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
    } else {
        addToCart(product);
    }
  };
  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg">
      <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-20" />
      </div>

      <div className="mt-4 flex flex-1 flex-col px-5 pb-5">
        <h5 className="text-xl font-semibold tracking-tight text-white wrap-break-word">
          {product.name}
        </h5>

        <div className="mt-2 mb-5 flex items-center justify-between">
          <p>
            <span className="text-3xl font-bold text-blue-400">
              ${product.price}
            </span>
          </p>
        </div>

        <button
          className="mt-auto flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500"
          onClick={HandleAddToCart}
        >
          <ShoppingCart className="mr-2" size={22} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
