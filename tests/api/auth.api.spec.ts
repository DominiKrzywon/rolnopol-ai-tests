import { expect, test } from "@playwright/test";
import { BASE_API_URL } from "../../src/config/env.config";
import { getDemoUserData } from "../../src/models/User";

/**
 * Helper interface for registration requests
 */
interface RegistrationData {
  email: string;
  password: string;
  displayedName: string;
}

/**
 * Helper interface for login requests
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Test helpers for API interactions
 */
const authHelpers = {
  /**
   * Generate unique test user data with current timestamp
   */
  generateTestUser(): RegistrationData {
    return {
      email: `test_${Date.now()}@example.com`,
      password: "testPassword123",
      displayedName: "Test User",
    };
  },

  /**
   * Register a new user
   */
  async registerUser(page: any, userData: RegistrationData) {
    return page.request.post(`${BASE_API_URL}/register`, {
      data: userData,
    });
  },

  /**
   * Login with credentials
   */
  async login(page: any, credentials: LoginCredentials) {
    return page.request.post(`${BASE_API_URL}/login`, {
      data: credentials,
    });
  },

  /**
   * Extract token from login response
   */
  async extractTokenFromResponse(response: any): Promise<string> {
    const body = await response.json();
    return body.data?.token || "";
  },

  /**
   * Validate authorization with token (GET method)
   */
  async validateAuthorizationGet(page: any, token: string) {
    return page.request.get(`${BASE_API_URL}/authorization`, {
      headers: { token },
    });
  },

  /**
   * Validate authorization with token (POST method)
   */
  async validateAuthorizationPost(page: any, token: string) {
    return page.request.post(`${BASE_API_URL}/authorization`, {
      data: { token },
    });
  },

  /**
   * Logout user
   */
  async logout(page: any) {
    return page.request.post(`${BASE_API_URL}/logout`);
  },
};

test.describe("Authentication API", () => {
  test.describe("Registration", () => {
    test(
      "should register new user successfully with valid data",
      { tag: ["@api", "@auth", "@registration", "@happy-path"] },
      async ({ page }) => {
        // Arrange
        const newUser = authHelpers.generateTestUser();

        // Act
        const response = await authHelpers.registerUser(page, newUser);
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          "Registration should return 201 Created",
        ).toBe(201);
        expect(body.success, "Response success flag should be true").toBe(true);
        expect(
          body.data,
          "Response should contain user data in data field",
        ).toBeDefined();
      },
    );

    test(
      "should reject registration with invalid email format",
      { tag: ["@api", "@auth", "@validation", "@negative"] },
      async ({ page }) => {
        // Arrange
        const invalidUser: RegistrationData = {
          email: "invalid-email",
          password: "testPassword123",
          displayedName: "Test User",
        };

        // Act
        const response = await authHelpers.registerUser(page, invalidUser);
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          "Invalid email should return 400 Bad Request",
        ).toBe(400);
        expect(
          body.success,
          "Response success flag should be false for invalid email",
        ).toBe(false);
        expect(
          body.error,
          "Response should contain error message",
        ).toBeDefined();
      },
    );

    test(
      "should reject registration with duplicate email",
      { tag: ["@api", "@auth", "@validation", "@negative"] },
      async ({ page }) => {
        // Arrange
        const existingUser = getDemoUserData();

        // Act
        const response = await authHelpers.registerUser(page, {
          email: existingUser.email,
          password: "whatever123",
          displayedName: "Whatever",
        });
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          "Duplicate email should return 409 Conflict",
        ).toBe(409);
        expect(
          body.success,
          "Response success flag should be false for duplicate email",
        ).toBe(false);
      },
    );
  });

  test.describe("Login", () => {
    test(
      "should login successfully with valid credentials",
      { tag: ["@api", "@auth", "@login", "@happy-path"] },
      async ({ page }) => {
        // Arrange
        const user = getDemoUserData();
        const credentials: LoginCredentials = {
          email: user.email,
          password: user.password,
        };

        // Act
        const response = await authHelpers.login(page, credentials);
        const body = await response.json();

        // Assert
        expect(response.status(), "Login should return 200 OK").toBe(200);
        expect(body.success, "Response success flag should be true").toBe(true);
        expect(
          body.data.token,
          "Response should contain authentication token",
        ).toBeDefined();
        expect(
          body.data.id,
          "Response should contain numeric user ID",
        ).toBeDefined();
        expect(
          body.data.userId,
          "Response should contain string user ID",
        ).toBeDefined();
        expect(body.data.email, "Response email should match login email").toBe(
          user.email,
        );
      },
    );

    test(
      "should reject login with non-existent email",
      { tag: ["@api", "@auth", "@login", "@negative"] },
      async ({ page }) => {
        // Arrange
        const invalidCredentials: LoginCredentials = {
          email: "nonexistent@example.com",
          password: "wrongPassword123",
        };

        // Act
        const response = await authHelpers.login(page, invalidCredentials);
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          "Invalid credentials should return 401 Unauthorized",
        ).toBe(401);
        expect(
          body.success,
          "Response success flag should be false for invalid credentials",
        ).toBe(false);
      },
    );

    test(
      "should reject login with wrong password",
      { tag: ["@api", "@auth", "@login", "@negative"] },
      async ({ page }) => {
        // Arrange
        const user = getDemoUserData();
        const invalidCredentials: LoginCredentials = {
          email: user.email,
          password: "wrongPassword123",
        };

        // Act
        const response = await authHelpers.login(page, invalidCredentials);
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          "Wrong password should return 401 Unauthorized",
        ).toBe(401);
        expect(
          body.success,
          "Response success flag should be false for wrong password",
        ).toBe(false);
      },
    );
  });

  test.describe("Token Authorization", () => {
    test(
      "should validate valid token via GET request",
      { tag: ["@api", "@auth", "@authorization", "@happy-path"] },
      async ({ page }) => {
        // Arrange
        const user = getDemoUserData();
        const loginResponse = await authHelpers.login(page, {
          email: user.email,
          password: user.password,
        });
        const token = await authHelpers.extractTokenFromResponse(loginResponse);

        // Act
        const response = await authHelpers.validateAuthorizationGet(
          page,
          token,
        );
        const body = await response.json();

        // Assert
        expect(response.status(), "Valid token should return 200 OK").toBe(200);
        expect(
          body.success,
          "Authorization response success flag should be true",
        ).toBe(true);
        expect(
          body.data,
          "Authorization response should contain user data",
        ).toBeDefined();
      },
    );

    test(
      "should reject invalid token via GET request",
      { tag: ["@api", "@auth", "@authorization", "@negative"] },
      async ({ page }) => {
        // Arrange
        const invalidToken = "invalid_token_xyz";

        // Act
        const response = await authHelpers.validateAuthorizationGet(
          page,
          invalidToken,
        );
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          "Invalid token should return 401 Unauthorized",
        ).toBe(401);
        expect(
          body.success,
          "Response success flag should be false for invalid token",
        ).toBe(false);
      },
    );

    test(
      "should validate valid token via POST request",
      { tag: ["@api", "@auth", "@authorization", "@happy-path"] },
      async ({ page }) => {
        // Arrange
        const user = getDemoUserData();
        const loginResponse = await authHelpers.login(page, {
          email: user.email,
          password: user.password,
        });
        const token = await authHelpers.extractTokenFromResponse(loginResponse);

        // Act
        const response = await authHelpers.validateAuthorizationPost(
          page,
          token,
        );
        const body = await response.json();

        // Assert
        expect(response.status(), "Valid token should return 200 OK").toBe(200);
        expect(
          body.success,
          "Authorization response success flag should be true",
        ).toBe(true);
      },
    );

    test(
      "should reject invalid token via POST request",
      { tag: ["@api", "@auth", "@authorization", "@negative"] },
      async ({ page }) => {
        // Arrange
        const invalidToken = "invalid_token_xyz";

        // Act
        const response = await authHelpers.validateAuthorizationPost(
          page,
          invalidToken,
        );
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          "Invalid token should return 401 Unauthorized",
        ).toBe(401);
        expect(
          body.success,
          "Response success flag should be false for invalid token",
        ).toBe(false);
      },
    );
  });

  test.describe("Logout", () => {
    test(
      "should logout successfully",
      { tag: ["@api", "@auth", "@logout", "@happy-path"] },
      async ({ page }) => {
        // Act
        const response = await authHelpers.logout(page);
        const body = await response.json();

        // Assert
        expect(response.status(), "Logout should return 200 OK").toBe(200);
        expect(
          body.success,
          "Logout response success flag should be true",
        ).toBe(true);
      },
    );
  });
});
