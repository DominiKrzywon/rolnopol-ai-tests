/**
 * Centralized page URLs for consistent navigation across page objects and tests.
 */
export const PAGE_URLS = {
  HOME: '',
  LOGIN: '/login.html',
  REGISTER: '/register.html',
  PROFILE: '/profile.html',
  DOCS: '/docs.html',
  API_DOCS: '/swagger.html',
  STAFF_FIELDS: '/staff-fields-main.html',
  MARKETPLACE: '/marketplace.html',
  MANAGEMENT: '/staff-fields-main.html',
  ASSIGN: '/staff-fields-assign.html',
  CHARTS: '/staff-fields-charts.html',
} as const;

export type PageUrl = (typeof PAGE_URLS)[keyof typeof PAGE_URLS];
