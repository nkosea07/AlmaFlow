import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import app from "./app.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`AlmaFlow API running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});
