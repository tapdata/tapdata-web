import type { RequestClientConfig } from '@tap/request'
import { requestClient } from '../request'

const BASE_URL = '/api/measurement'

/**
 * Query measurements
 */
export function queryMeasurements(params: any, config?: RequestClientConfig) {
  return requestClient.post(`${BASE_URL}/query`, params, config)
}

/**
 * Query transmit total
 */
export function queryTransmitTotal() {
  return requestClient.get(`${BASE_URL}/queryTransmitTotal`)
}

/**
 * Query measurements v2
 */
export function queryMeasurementsV2(params: any) {
  return requestClient.post(`${BASE_URL}/query/v2`, params)
}

/**
 * Batch measurements
 */
export function batchMeasurements(params: any, config?: RequestClientConfig) {
  return requestClient.post(`${BASE_URL}/batch`, params, config)
}

/**
 * Get full statistics
 */
export function getFullStatistics(params?: any) {
  return requestClient.get(`${BASE_URL}/full_statistics`, { params })
}
