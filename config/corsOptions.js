const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4000",
  "http://127.0.0.1:4000",
  "https://localhost:3000",
  "https://127.0.0.1:3000",
  "https://localhost:4000",
  "https://127.0.0.1:4000",
  "https://dai-di.com",
]

export default {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin."
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}
