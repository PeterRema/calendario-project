import { PrismaClient } from "../generated/prisma";

// Ensure a single PrismaClient instance in dev (Next.js HMR)
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
