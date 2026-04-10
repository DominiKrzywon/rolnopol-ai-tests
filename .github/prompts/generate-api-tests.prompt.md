---
description: 'Generate REST API tests for specified endpoints or modules using Playwright and Organize Act Assert pattern'
name: 'Generate REST API Tests'
argument-hint: "Specify endpoint (e.g., 'POST /api/auth/login') or module name (e.g., 'auth', 'users')"
agent: 'agent'
tools: ['search', 'web']
---

# Generate REST API Tests

Generate comprehensive Playwright REST API tests for the specified endpoint(s) or module.

## Input

Specify endpoints or modules to test:

- **By endpoint**: `POST /api/auth/login`, `GET /api/users/{id}`, `DELETE /api/posts/{id}`
- **By module**: `auth`, `users`, `marketplace`

If not specified, ask the user before proceeding.

## Instructions

### 1. Discover Endpoint Details

- Fetch the OpenAPI schema: `http://localhost:3000/schema/openapi.json`
- Identify the endpoint(s) method, path, request/response structure, required parameters, and validation rules
- Look for error scenarios and edge cases in the schema

### 2. Follow Project Conventions

- **Framework**: Playwright Test with `@playwright/test`
- **Pattern**: Arrange-Act-Assert (setup → execute → verify)
- **Base URL**: Import `BASE_API_URL` from [src/config/env.config.ts](./src/config/env.config.ts)
- **Existing helpers**: Reference [src/helpers/testDataHelpers.ts](./src/helpers/testDataHelpers.ts) and [src/models/User.ts](./src/models/User.ts)
- **Test structure**: See [tests/api/auth.api.spec.ts](./tests/api/auth.api.spec.ts) for patterns

### 3. Generate Tests

Create a new test file (or extend existing) with:

**Happy Path Tests**:

- Successful request with valid data
- Verify correct status code, response structure, and data payload
- Add descriptive assertion messages: `expect(...).toEqual(..., 'Verify user email matches request')`

**Error/Validation Tests**:

- Invalid inputs (null, empty, wrong type, out of range)
- Missing required fields
- Unauthorized/forbidden scenarios (if applicable)
- Each with specific error message assertions

**Test Independence**:

- No test should depend on another test's output
- Use unique, isolated test data (timestamps, random values) from helpers
- Clean up resources if needed (use Playwright hooks)

### 4. Code Quality

- **Modular helpers**: Extract repeated setup/assertions into helper functions
- **Clear test names**: Describe what is being tested: `'should return 200 with user data when valid credentials provided'`
- **Inline assertions**: Include context in assertion messages
- **Comments**: Explain complex scenarios or non-obvious logic

### 5. Location

- Place file in `tests/api/` directory
- Follow naming: `<module>.api.spec.ts` (e.g., `marketplace.api.spec.ts`)
- Follow [CODING_STANDARDS.md](./CODING_STANDARDS.md) guidelines
