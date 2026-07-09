/**
 * @typedef {Object} IdentityShape
 * @property {string} id - Unique identifier for the user.
 * @property {string} fullName - The full name of the user.
 * @property {string} username - The username used for login.
 * @property {string} [email] - Optional email address.
 * @property {string} role - The assigned role (Administrator, Internal Analyst, Compliance Officer, External Auditor, Read Only Analyst).
 * @property {string} [organization] - Associated organization (only for External Auditor).
 * @property {string} [orgCode] - Associated organization code (only for External Auditor).
 * @property {string} status - Access status (Active, Disabled, Locked).
 * @property {string} lastLogin - Relative timestamp of last login.
 * @property {string} created - Date string when identity was created (YYYY-MM-DD).
 */
export const IdentityShape = {};
