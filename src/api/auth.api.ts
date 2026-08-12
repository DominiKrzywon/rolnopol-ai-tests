import {
  APIRequestContext,
  APIResponse,
  BrowserContext,
  expect,
} from '@playwright/test';
import { BASE_API_URL, ENV } from 'src/config/env.config';
import { ApiEnvelope } from 'src/models/ApiResponse';
import { LoginResponseData } from 'src/models/AuthResponse';
import { Session } from 'src/models/Session';
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

export async function loginAs(
  request: APIRequestContext,
  credentials: Pick<User, 'email' | 'password'>,
): Promise<Session> {
  const response = await loginUser(request, credentials);

  expect(
    response.status(),
    `Login request failed. Status: ${response.status()} ${response.statusText()}`,
  ).toBe(200);

  const body = (await response.json()) as ApiEnvelope<LoginResponseData>;

  if (!body.data) {
    throw new Error(
      `Failed to get data: ${body.error ?? JSON.stringify(body)}`,
    );
  }
  return {
    id: body.data.user.id,
    displayedName: body.data.user.displayedName,
    token: body.data.token,
  };
}

export async function applySessionCookies(
  context: BrowserContext,
  request: APIRequestContext,
  session: Session,
): Promise<void> {
  const { cookies } = await request.storageState();
  await context.addCookies(cookies);
  await context.addCookies([
    { name: 'rolnopolIsLogged', value: 'true', url: ENV.BASE_URL },
    {
      name: 'rolnopolUserLabel',
      value: session.displayedName,
      url: ENV.BASE_URL,
    },
    {
      name: 'rolnopolUserId',
      value: String(session.id),
      url: ENV.BASE_URL,
    },
  ]);
}
