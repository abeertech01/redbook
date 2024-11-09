// import multer from "multer"

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
}

// const storage = multer.memoryStorage() // store image in memory
// const upload = multer({ storage: storage })

export { corsOptions }
