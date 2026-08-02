import 'dotenv/config';

/**
 * Centralized environment variable configuration.
 * Validates that all required variables are set and non-empty at import time,
 * preventing silent failures during test execution.
 */

const REQUIRED_ENV_VARS = [
  'BASE_URL',
  'EMPTY_USER_EMAIL',
  'EMPTY_USER_PASSWORD',
  'EMPTY_USER_DISPLAY_NAME',
  'DEMO_USER_EMAIL',
  'DEMO_USER_PASSWORD',
  'DEMO_USER_DISPLAY_NAME',
] as const;

type EnvVarName = (typeof REQUIRED_ENV_VARS)[number];

function validateEnvVars(): Record<EnvVarName, string> {
  const missing = REQUIRED_ENV_VARS.filter(
    (name) => !process.env[name]?.trim(),
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing or empty environment variable(s): ${missing.join(', ')}. ` +
        `Ensure these are defined in your .env file or CI environment.`,
    );
  }

  return Object.fromEntries(
    REQUIRED_ENV_VARS.map((name) => [name, process.env[name]!.trim()]),
  ) as Record<EnvVarName, string>;
}

export const ENV = validateEnvVars();

/**
 * API base URL for REST API endpoints (v1)
 */
export const BASE_API_URL = `${ENV.BASE_URL}/api/v1`;
