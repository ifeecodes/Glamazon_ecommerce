import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user_id,
      isActive: true,
    });
    if (!coupon) {
      return res.status(404).json({ message: "No active coupon found" });
    }
    res.status(200).json(coupon || null);
  } catch (error) {
    console.error("Error in getCoupon controller:", error);
    res
      .status(500)
      .json({ message: "Error fetching coupon", error: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) {
      return res
        .status(404)
        .json({ message: "Invalid or inactive coupon code" });
    }

    if (coupon.expirationDate && new Date(coupon.expirationDate) < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Coupon has expired" });
    }
    res
      .status(200)
      .json({
        message: "Coupon is valid",
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
      });
  } catch (error) {
    console.error("Error in validateCoupon controller:", error);
    res
      .status(500)
      .json({ message: "Error validating coupon", error: error.message });
  }
};
