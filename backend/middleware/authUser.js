import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    // Try common header locations
    let token =
      req.headers.authorization?.split(" ")[1] ||
      req.headers.token ||
      req.headers.Authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }

    // Attach userId to request (use req.userId as other code expects)
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authUser;
