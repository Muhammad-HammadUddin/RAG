import { PrismaClient } from "@prisma/client";
import { env } from "./config/env.js";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

export async function disconnect() {
  await prisma.$disconnect();
}

export default prisma;