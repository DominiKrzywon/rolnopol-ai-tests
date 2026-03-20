import "dotenv/config";

/**
 * Centralized environment variable configuration.
 * Validates that all required variables are set and non-empty at import time,
 * preventing silent failures during test execution.
 */

const REQUIRED_ENV_VARS = [
  "BASE_URL",
  "EMPTY_USER_EMAIL",
  "EMPTY_USER_PASSWORD",
  "EMPTY_USER_DISPLAY_NAME",
  "DEMO_USER_EMAIL",
  "DEMO_USER_PASSWORD",
  "DEMO_USER_DISPLAY_NAME",
] as const;

type EnvVarName = (typeof REQUIRED_ENV_VARS)[number];

function validateEnvVars(): Record<EnvVarName, string> {
  const missing: string[] = [];

  for (const name of REQUIRED_ENV_VARS) {
    const value = process.env[name];
    if (!value || value.trim() === "") {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing or empty environment variable(s): ${missing.join(", ")}. ` +
        `Ensure these are defined in your .env file or CI environment.`,
    );
  }

  return Object.fromEntries(
    REQUIRED_ENV_VARS.map((name) => [name, process.env[name]!.trim()]),
  ) as Record<EnvVarName, string>;
}

const validated = validateEnvVars();

export const ENV = {
  BASE_URL: validated.BASE_URL,
  EMPTY_USER_EMAIL: validated.EMPTY_USER_EMAIL,
  EMPTY_USER_PASSWORD: validated.EMPTY_USER_PASSWORD,
  EMPTY_USER_DISPLAY_NAME: validated.EMPTY_USER_DISPLAY_NAME,
  DEMO_USER_EMAIL: validated.DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD: validated.DEMO_USER_PASSWORD,
  DEMO_USER_DISPLAY_NAME: validated.DEMO_USER_DISPLAY_NAME,
} as const;
