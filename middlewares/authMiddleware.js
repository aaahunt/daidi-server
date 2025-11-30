import jwt from "jsonwebtoken"

export default function authMiddleware(socket, next) {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error("invalid token"))
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("invalid token"))
    }

    socket.userId = decoded.userId
    socket.username = decoded.username
    next()
  })
}
