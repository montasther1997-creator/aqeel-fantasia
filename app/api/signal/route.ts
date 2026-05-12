// Legacy alias — the canonical handler lives at /api/newsletter. Kept here so
// any existing forms POSTing to /api/signal keep working. See CLAUDE.md §9
// (term "الإشارة" is forbidden going forward).
export { POST } from '../newsletter/route';
