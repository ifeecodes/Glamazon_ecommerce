import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const getAnalyticsData = async () => {
  // Implementation for fetching analytics data
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const salesData = await Order.aggregate([
    { $group: { _id: null, //it groups all documents together
        totalSales: { $sum: 1 }, //it counts the number of documents
        totalRevenue: { $sum: "$totalAmount" } } },
  ]);

  const { totalRevenue, totalSales,} = salesData[0] || { totalRevenue: 0, totalSales: 0 };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

export const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },//grouping by date, we are using $dateToString to format the date to YYYY-MM-DD
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 } // Sort by date ascending
            }
        ]);
        /*
        example output of dailySalesData:
        [
            {
                _id: "2026-09-01",
                sales: 10,
                revenue: 14700
            }
        ]*/
       const dateArray = generateDatesInRange(startDate, endDate);
       return dateArray.map(date => {
            const dateString = date.toISOString().split("T")[0];
            const foundData = dailySalesData.find(item => item._id === dateString);
            return foundData || { _id: dateString, sales: 0, revenue: 0 };
        });
    } catch (error) {
        console.error("Error fetching daily sales data:", error);
        throw error;//rethrow the error to be handled by the calling function
    }
};

function generateDatesInRange(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}