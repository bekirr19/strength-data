// Admin helper utilities. Replace HARDCODED_ADMINS with your own UID(s).
// You can find your UID in Firebase Console → Authentication → Users.

const HARDCODED_ADMINS = [
  'ectRAMgrCkfNI3Mw81hNrRRfW5k1'
];

export function isAdminUid(uid) {
  if (!uid) return false;
  return HARDCODED_ADMINS.includes(uid);
}

export function isUserAdmin(user) {
  if (!user || !user.uid) return false;
  return isAdminUid(user.uid);
}
