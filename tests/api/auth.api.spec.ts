import { expect, test } from '@playwright/test';
import {
  loginAs,
  loginUser,
  logout,
  registerUser,
  validateAuthorizationGet,
  validateAuthorizationPost,
} from 'src/api/auth.api';
import { prepareRandomUser } from 'src/factories/user.factory';

import { getDemoUserData, User } from '../../src/models/User';

test.describe('Authentication API', () => {
  test.describe('Registration', () => {
    test(
      'should register new user successfully with valid data',
      { tag: ['@api', '@auth', '@registration', '@happy-path'] },
      async ({ request }) => {
        // Arrange
        const newUser = prepareRandomUser();

        // Act
        const response = await registerUser(request, newUser);
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          'Registration should return 201 Created',
        ).toBe(201);
        expect(body.success, 'Response success flag should be true').toBe(true);
        expect(
          body.data,
          'Response should contain user data in data field',
        ).toBeDefined();
      },
    );

    test(
      'should reject registration with invalid email format',
      { tag: ['@api', '@auth', '@validation', '@negative'] },
      async ({ request }) => {
        // Arrange
        const invalidUser: User = {
          email: 'invalid-email',
          password: 'testPassword123',
          displayName: 'Test User',
        };

        // Act
        const response = await registerUser(request, invalidUser);
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          'Invalid email should return 400 Bad Request',
        ).toBe(400);
        expect(
          body.success,
          'Response success flag should be false for invalid email',
        ).toBe(false);
        expect(
          body.error,
          'Response should contain error message',
        ).toBeDefined();
      },
    );

    test(
      'should reject registration with duplicate email',
      { tag: ['@api', '@auth', '@validation', '@negative'] },
      async ({ request }) => {
        // Arrange
        const existingUser = getDemoUserData();

        // Act
        const response = await registerUser(request, {
          email: existingUser.email,
          password: 'whatever123',
          displayName: 'Whatever',
        });
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          'Duplicate email should return 409 Conflict',
        ).toBe(409);
        expect(
          body.success,
          'Response success flag should be false for duplicate email',
        ).toBe(false);
      },
    );
  });

  test.describe('Login', () => {
    test(
      'should login successfully with valid credentials',
      { tag: ['@api', '@auth', '@login', '@happy-path'] },
      async ({ request }) => {
        // Arrange
        const user = getDemoUserData();

        // Act
        const response = await loginUser(request, user);
        const body = await response.json();

        // Assert
        expect(response.status(), 'Login should return 200 OK').toBe(200);
        expect(body.success, 'Response success flag should be true').toBe(true);
        expect(
          body.data.token,
          'Response should contain authentication token',
        ).toBeDefined();
        expect(
          body.data.user.id,
          'Response should contain numeric user ID',
        ).toEqual(expect.any(Number));
        expect(
          body.data.user.email,
          'Response email should match login email',
        ).toBe(user.email);
      },
    );

    test(
      'should reject login with non-existent email',
      { tag: ['@api', '@auth', '@login', '@negative'] },
      async ({ request }) => {
        // Arrange
        const invalidCredentials: User = {
          email: 'nonexistent@example.com',
          password: 'wrongPassword123',
        };

        // Act
        const response = await loginUser(request, invalidCredentials);
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          'Invalid credentials should return 401 Unauthorized',
        ).toBe(401);
        expect(
          body.success,
          'Response success flag should be false for invalid credentials',
        ).toBe(false);
      },
    );

    test(
      'should reject login with wrong password',
      { tag: ['@api', '@auth', '@login', '@negative'] },
      async ({ request }) => {
        // Arrange
        const user = getDemoUserData();
        const invalidCredentials: User = {
          email: user.email,
          password: 'wrongPassword123',
        };

        // Act
        const response = await loginUser(request, invalidCredentials);
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          'Wrong password should return 401 Unauthorized',
        ).toBe(401);
        expect(
          body.success,
          'Response success flag should be false for wrong password',
        ).toBe(false);
      },
    );
  });

  test.describe('Token Authorization', () => {
    test(
      'should validate valid token via GET request',
      { tag: ['@api', '@auth', '@authorization', '@happy-path'] },
      async ({ request }) => {
        // Arrange
        const user = getDemoUserData();
        const session = await loginAs(request, {
          email: user.email,
          password: user.password,
        });

        // Act
        const response = await validateAuthorizationGet(request, session.token);
        const body = await response.json();

        // Assert
        expect(response.status(), 'Valid token should return 200 OK').toBe(200);
        expect(
          body.success,
          'Authorization response success flag should be true',
        ).toBe(true);
        expect(
          body.data,
          'Authorization response should contain user data',
        ).toBeDefined();
      },
    );

    test(
      'should reject invalid token via GET request',
      { tag: ['@api', '@auth', '@authorization', '@negative'] },
      async ({ request }) => {
        // Arrange
        const invalidToken = 'invalid_token_xyz';

        // Act
        const response = await validateAuthorizationGet(request, invalidToken);
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          'Invalid token should return 401 Unauthorized',
        ).toBe(403);
        expect(
          body.success,
          'Response success flag should be false for invalid token',
        ).toBe(false);
      },
    );

    test(
      'should validate valid token via POST request',
      { tag: ['@api', '@auth', '@authorization', '@happy-path'] },
      async ({ request }) => {
        // Arrange
        const user = getDemoUserData();
        const session = await loginAs(request, user);

        // Act
        const response = await validateAuthorizationPost(
          request,
          session.token,
        );
        const body = await response.json();

        // Assert
        expect(response.status(), 'Valid token should return 200 OK').toBe(200);
        expect(
          body.success,
          'Authorization response success flag should be true',
        ).toBe(true);
      },
    );

    test(
      'should reject invalid token via POST request',
      { tag: ['@api', '@auth', '@authorization', '@negative'] },
      async ({ request }) => {
        // Arrange
        const invalidToken = 'invalid_token_xyz';

        // Act
        const response = await validateAuthorizationPost(request, invalidToken);
        const body = await response.json();

        // Assert
        expect(
          response.status(),
          'Invalid token should return 401 Unauthorized',
        ).toBe(401);
        expect(
          body.success,
          'Response success flag should be false for invalid token',
        ).toBe(false);
      },
    );
  });

  test.describe('Logout', () => {
    test(
      'should logout successfully',
      { tag: ['@api', '@auth', '@logout', '@happy-path'] },
      async ({ request }) => {
        // Act
        const response = await logout(request);
        const body = await response.json();

        // Assert
        expect(response.status(), 'Logout should return 200 OK').toBe(200);
        expect(
          body.success,
          'Logout response success flag should be true',
        ).toBe(true);
      },
    );
  });
});
