import jwt from "jsonwebtoken";

const authEmployer = async (req, res, next) => {
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

    req.body.employerId = decoded.id;
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default authEmployer;
