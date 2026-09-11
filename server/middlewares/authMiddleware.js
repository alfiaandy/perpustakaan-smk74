const jwt = require("jsonwebtoken");

// Secret Key Fallback disamakan penuh dengan authController
const JWT_SECRET = process.env.JWT_SECRET || "kunci_rahasia_smkn74";

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak, token tidak ditemukan",
    });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token tidak valid atau telah kadaluwarsa",
    });
  }
};
