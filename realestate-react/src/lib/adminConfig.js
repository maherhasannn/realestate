export const ADMIN_EMAIL = 'demo@signal.com';

export function isAdmin(user) {
  return user?.email?.toLowerCase() === ADMIN_EMAIL;
}
