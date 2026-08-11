import { APIRequestContext, APIResponse } from '@playwright/test';
import { BASE_API_URL } from 'src/config/env.config';
import { User } from 'src/models/User';

export async function registerUser(
  request: APIRequestContext,
  user: User,
): Promise<APIResponse> {
  const response = await request.post(`${BASE_API_URL}/register`, {
    data: {
      email: user.email,
      password: user.password,
      displayedName: user.displayName,
    },
  });

  return response;
}

export async function loginUser(
  request: APIRequestContext,
  credentials: Pick<User, 'email' | 'password'>,
): Promise<APIResponse> {
  const response = await request.post(`${BASE_API_URL}/login`, {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  return response;
}
