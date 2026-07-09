/**
 * @typedef {Object} DocumentShape
 * @property {string} id - Unique identifier for the document.
 * @property {string} name - Filename.
 * @property {string} size - Size string (e.g. "2.4 MB").
 * @property {string} uploadedBy - Username of the uploader.
 * @property {string} uploadedAt - Timestamp of upload.
 * @property {string} encryptionStatus - Cryptographic index status (Pending, Completed, Failed).
 * @property {string} indexHash - Index SHA256 hex string.
 */
export const DocumentShape = {};
