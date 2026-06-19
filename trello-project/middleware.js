import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECREET;

function authMiddleware(req, res, next) {
  const token = req.headers.token;

  const decoded = jwt.verify(token, secret);
  const userId = decoded.userId;
  if (userId) {
    req.userId = userId;
    next();
  } else {
    res.status(403).json({
      message: 'Token was incorrect',
    });
  }
}

export { authMiddleware };
