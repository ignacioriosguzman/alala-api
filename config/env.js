import dotenv from "dotenv";
dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  PORT: process.env.PORT || 3000,
};

if (!env.DATABASE_URL) {
  console.error("❌ DATABASE_URL no está definida");
}
if (!env.JWT_SECRET) {
  console.error("❌ JWT_SECRET no está definida");
}
