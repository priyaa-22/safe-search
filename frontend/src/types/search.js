/**
 * @typedef {Object} SearchResultShape
 * @property {string} documentId - Identifier of matched document.
 * @property {string} documentName - Name of matched document.
 * @property {number} relevanceScore - Cryptographic relevance match coefficient.
 * @property {string[]} matchedKeywords - List of keywords matching HMACS queries.
 * @property {string} timestamp - Timestamp of query execution.
 */
export const SearchResultShape = {};
