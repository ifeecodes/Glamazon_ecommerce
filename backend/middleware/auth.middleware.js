import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      res
        .status(401)
        .json({ message: "Unauthorized -  No access token provided" });
    }
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      // Attach the user object to the request for further use
      req.user = user;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        res
          .status(401)
          .json({ message: "Unauthorized -  Access token expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in productRoute middleware", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized - Invalid access token" });
  }
};

export const adminRoute = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied - Admin only" });
  }
};
