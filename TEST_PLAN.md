# Rolnopol Test Plan

## Overview

Testing strategy for Rolnopol agricultural management system based on http://localhost:3000/docs.html

**Application**: Farm management system with marketplace functionality  
**Environment**: http://localhost:3000  
**Framework**: Playwright

## Core Test Areas

### 1. Smoke Tests

- [x] Homepage loads with title "Rolnopol" `@smoke` `@critical`
- [x] Login page loads successfully `@smoke` `@auth`
- [x] Register page loads successfully `@smoke` `@auth` `@registration`
- [x] API documentation page loads successfully `@smoke` `@documentation`
- [x] Documentation page loads successfully `@smoke` `@documentation`
- [ ] Marketplace page accessible `@smoke` `@navigation`
- [ ] API health check responds `@smoke` `@api`

### 2. Authentication

#### Positive Cases

- [x] User registration with valid data `@auth` `@registration` `@happy-path`
- [ ] User login `@auth` `@login`
- [ ] Session management and logout `@auth` `@session` `@logout`
- [ ] Role-based access (farmer, admin, superadmin) `@auth` `@rbac` `@permissions`

#### Negative Cases

- [x] Registration with invalid email format `@auth` `@registration` `@validation` `@negative`
- [x] Registration with password less than 3 characters `@auth` `@registration` `@validation` `@negative`
- [x] Registration with empty required fields `@auth` `@registration` `@validation` `@negative`
- [x] Registration with multiple validation errors (invalid email + short password) `@auth` `@registration` `@validation` `@negative`
- [ ] Registration with already existing email `@auth` `@registration` `@validation` `@negative`

### 3. Farm Management

- [ ] Add/edit/delete fields, animals, staff `@crud` `@farm` `@resources`
- [ ] Create assignments between staff and fields `@farm` `@assignments` `@business-logic`
- [ ] Prevent operations on assigned resources `@farm` `@validation` `@edge-case`

### 4. Marketplace

- [ ] Create offers for unassigned resources `@marketplace` `@offers` `@crud`
- [ ] Purchase offers with sufficient funds `@marketplace` `@purchase` `@happy-path`
- [ ] Block purchases with insufficient funds `@marketplace` `@purchase` `@validation` `@edge-case`
- [ ] Transfer ownership after successful purchase `@marketplace` `@ownership` `@business-logic`

### 5. Financial Operations

- [ ] View account balance and transaction history `@financial` `@balance` `@history`
- [ ] Fund transfers between users `@financial` `@transfer` `@business-logic`
- [ ] Prevent overdraft (negative balances) `@financial` `@validation` `@edge-case`

### 6. End-to-End Scenarios

- [ ] **New Farm Setup**: Register → Login → Add resources → Create assignments `@e2e` `@farm-setup` `@user-journey`
- [ ] **Marketplace Trade**: Create offer → Browse → Purchase → Verify ownership transfer `@e2e` `@marketplace-flow` `@user-journey`
- [ ] **Insufficient Funds**: Attempt expensive purchase → Verify blocked transaction `@e2e` `@edge-case` `@validation`

## Test Priorities

- **P0**: Smoke tests, authentication, basic CRUD
- **P1**: Marketplace trading, financial operations
- **P2**: Edge cases, error handling

## Success Criteria

- All P0 and P1 tests pass
- Core user flows work as documented
- Financial transactions are accurate and secure

## Test Progress Summary

### Completed ✅

- **Smoke Tests**: 5/7 core page load tests implemented
- **Authentication - Registration**: Positive case + 4 comprehensive negative test cases implemented

### In Progress 🚧

- Smoke tests for marketplace page and API health check

### Not Started 📋

- User login functionality tests
- Session management and logout tests
- Role-based access control tests
- Farm management CRUD operations
- Marketplace trading functionality
- Financial operations
- End-to-end user journey tests

## Next Steps

1. ✅ ~~Expand smoke tests for key pages~~ (5/7 completed)
2. 🚧 Complete remaining smoke tests (marketplace, API health check)
3. Add user login tests (positive and negative cases)
4. Implement duplicate email registration test
5. Add authentication test suite (session management, RBAC)
6. Implement marketplace transaction tests
7. Create end-to-end user journey tests
