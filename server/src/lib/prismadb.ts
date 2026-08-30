import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

// Extend the global object with PrismaClient
declare global {
  var prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

// Prevent multiple instances of Prisma Client in development
const prisma = global.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") global.prisma = prisma

export default prisma
