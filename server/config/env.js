// Fails fast if a required environment variable is missing.
const required = ["MONGO_URI", "JWT_SECRET", "QR_TOKEN_SECRET", "CLIENT_URL"];

export const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    console.error("Copy server/.env.example to server/.env and fill in the values.");
    process.exit(1);
  }
};
