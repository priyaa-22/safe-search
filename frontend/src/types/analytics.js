/**
 * @typedef {Object} EncryptionThroughputShape
 * @property {string} timestamp - Time slot (HH:MM).
 * @property {number} value - Megabytes or document count.
 *
 * @typedef {Object} SearchLatencyShape
 * @property {string} timestamp - Time slot (HH:MM).
 * @property {number} latencyMs - Query processing time in milliseconds.
 *
 * @typedef {Object} AnalyticsShape
 * @property {EncryptionThroughputShape[]} encryptionThroughput - List of throughput points.
 * @property {SearchLatencyShape[]} searchLatency - List of latency measurements.
 */
export const AnalyticsShape = {};
