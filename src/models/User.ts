import { ENV } from "../config/env.config";

export interface User {
  email: string;
  password: string;
  displayName: string;
}

/**
 * Creates a User instance with values sourced from environment variables.
 * Allows partial overrides for flexibility in individual tests.
 */
export function createUser(overrides: Partial<User> = {}): User {
  return {
    email: ENV.EMPTY_USER_EMAIL,
    password: ENV.EMPTY_USER_PASSWORD,
    displayName: ENV.EMPTY_USER_DISPLAY_NAME,
    ...overrides,
  };
}
