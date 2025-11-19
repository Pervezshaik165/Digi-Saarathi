import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] ||
      req.headers.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin not authorized. Token missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default adminAuth;
