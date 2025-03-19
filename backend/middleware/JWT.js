import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

function verifyToken(req, res, next) {
  // Toverify user Token
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ message: "Access Denied. No Token Provided" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
}

function generateToken(data) {
  // Will generate token using user info and server secret key
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1h" });
}

const JWT = {
  verifyToken,
  generateToken,
};

export default JWT;
