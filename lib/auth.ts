export function isAdminTokenValid(token?: string | null) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  return (token ?? "") === expected;
}

export function getGoogleReviewUrl() {
  return process.env.GOOGLE_REVIEW_URL || "";
}
