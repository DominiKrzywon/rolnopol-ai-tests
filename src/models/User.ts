import { ENV } from "../config/env.config";

export interface User {
  email: string;
  password: string;
  displayName: string;
}

/**
 * Returns Empty User test data sourced from environment variables.
 * Allows partial overrides for flexibility in individual tests.
 */
export function getEmptyUserData(overrides: Partial<User> = {}): User {
  return {
    email: ENV.EMPTY_USER_EMAIL,
    password: ENV.EMPTY_USER_PASSWORD,
    displayName: ENV.EMPTY_USER_DISPLAY_NAME,
    ...overrides,
  };
}

export function getDemoUserData(overrides: Partial<User> = {}): User {
  return {
    email: ENV.DEMO_USER_EMAIL,
    password: ENV.DEMO_USER_PASSWORD,
    displayName: ENV.DEMO_USER_DISPLAY_NAME,
    ...overrides,
  };
}
