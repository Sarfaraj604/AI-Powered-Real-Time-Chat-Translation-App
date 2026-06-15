const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

export const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!allowedOrigins.length) {
  allowedOrigins.push(...defaultOrigins);
}

for (const origin of defaultOrigins) {
  if (!allowedOrigins.includes(origin)) {
    allowedOrigins.push(origin);
  }
}
