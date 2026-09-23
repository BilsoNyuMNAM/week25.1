
import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";
import {PrismaPg} from "@prisma/adapter-pg"

const connectionString = `${process.env.DATABASE_URL}`;


if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing! Check your root .env file.");
}
const adapter = new PrismaPg({connectionString})
const prisma = new PrismaClient({adapter});

export default prisma;
