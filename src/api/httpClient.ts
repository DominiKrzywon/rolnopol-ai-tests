import { APIRequestContext } from '@playwright/test';

export class ApiError extends Error {
  constructor(
    readonly method: string,
    readonly url: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(`${method} ${url} -> ${status}: ${body}`);
  }
}

async function send<T>(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'DELETE',
  url: string,
  data?: unknown,
): Promise<T> {
  const response = await request.fetch(url, {
    method,
    data,
  });

  const body = await response.text();

  if (!response.ok()) {
    throw new ApiError(method, url, response.status(), body);
  }

  let parsed: {
    success: boolean;
    data?: T;
  };

  try {
    parsed = JSON.parse(body);
  } catch {
    throw new ApiError(
      method,
      url,
      response.status(),
      `Invalid JSON response: ${body}`,
    );
  }

  if (parsed.success === false) {
    throw new ApiError(method, url, response.status(), body);
  }

  return parsed.data as T;
}

export async function getJson<T>(
  request: APIRequestContext,
  url: string,
): Promise<T> {
  return send<T>(request, 'GET', url);
}

export async function postJson<T>(
  request: APIRequestContext,
  url: string,
  data?: unknown,
): Promise<T> {
  return send<T>(request, 'POST', url, data);
}

export async function deleteJson(
  request: APIRequestContext,
  url: string,
): Promise<void> {
  return send(request, 'DELETE', url);
}
