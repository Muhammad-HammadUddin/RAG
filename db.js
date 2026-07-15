import pkg from "@prisma/client";
const { PrismaClient } = pkg;

// Singleton so we don't open a new connection pool on every import
const prisma = new PrismaClient();

export default prisma;