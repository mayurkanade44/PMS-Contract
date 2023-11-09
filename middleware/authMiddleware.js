import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authenticateUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ msg: "Authentication Invalid" });

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) return res.status(401).json({ msg: "Authentication Invalid" });
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ msg: "Authentication Invalid" });
    }
  } else {
    res.status(401).json({ msg: "Authentication Invalid" });
  }
};

export const authorizeUser = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ msg: "You don't have permission, please contact admin" });
    }
    next();
  };
};
