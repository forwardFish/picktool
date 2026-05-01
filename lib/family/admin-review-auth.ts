type AdminReviewUserLike = {
  role?: string | null;
};

const ADMIN_REVIEW_ROLES = new Set(['admin', 'owner', 'reviewer']);

export function canAccessAdminReview(user: AdminReviewUserLike | null | undefined) {
  const role = user?.role?.toLowerCase() || '';
  return ADMIN_REVIEW_ROLES.has(role);
}
