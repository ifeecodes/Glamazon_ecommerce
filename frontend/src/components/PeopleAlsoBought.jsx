import ProductCard from "./ProductCard";
import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const PeopleAlsoBought = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get("/product/recommendations");
        setRecommendations(response.data.products);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error fetching recommendations",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);
  if (isLoading) return <LoadingSpinner />;
  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold text-blue-400">
        People Also Bought
      </h3>
      <div className="mt-6 gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default PeopleAlsoBought;
