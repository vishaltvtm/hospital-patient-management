const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  console.log("authMiddleware.js: protect middleware called");
  console.log("Request body:", req.body?.jsonwebtoken_whatsapp_chatbot);
  let token;
  if (!req.body?.jsonwebtoken_whatsapp_chatbot == undefined) {
    if (req.body?.jsonwebtoken_whatsapp_chatbot == "hospital_chatbot_vinayak") {
      console.log("Token is valid comes with request Whatsapp Chatbot, proceeding to next middleware");
      next();
    }
  }



  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Contains user id
      console.log("Token is valid comes with request Applications , proceeding to next middleware")
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };