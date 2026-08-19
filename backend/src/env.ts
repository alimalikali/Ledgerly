// Load .env into process.env before anything reads it. Native (Node >=20.12),
// no dotenv dependency. Imported first by prisma.ts and server.ts.
try {
  process.loadEnvFile();
} catch {
  // .env is optional (e.g. env vars provided by the platform)
}
