// Faculty sees the same Analytics UI as Admin — the backend automatically
// scopes /api/analytics/attendance and /api/analytics/grades to only the
// courses this faculty member teaches (see analytics.controller.js).
export { default } from '../admin/Analytics';
