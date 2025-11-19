import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    let token =
      req.headers.token ||
      req.headers.authorization?.split(" ")[1] ||
      req.headers.Authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized - No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.body.userId = decoded.id;
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default authUser;
