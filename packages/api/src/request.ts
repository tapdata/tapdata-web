import { RequestClient } from '@tap/request'
import axios from 'axios'

const CancelToken = axios.CancelToken
const isCancel = axios.isCancel

const apiURL = import.meta.env.BASE_URL

export const requestClient = new RequestClient({
  baseURL: apiURL,
  responseReturn: 'data',
})

export const baseRequestClient = new RequestClient({ baseURL: apiURL })

export interface PageFetchParams {
  [key: string]: any
  pageNo?: number
  pageSize?: number
}

export interface PageFetchResult<T> {
  total: number
  items: T[]
}

export interface Page<T> {
  total: number
  items: T[]
}

export interface CountFetchResult {
  count: number
}

export interface Filter {
  where?: Record<string, any>
  order?: string | string[]
  limit?: number
  skip?: number
  page?: number
  size?: number
  pageNo?: number
  pageSize?: number
  fields?: any
}

/**
 * 被动请求作用域计数器。仅在同步执行栈内有效：
 * 调用 withPassive(fn) 期间发起的请求（拦截器以同步方式执行时）会被标记为被动。
 */
let passiveDepth = 0

export function isPassiveScope(): boolean {
  return passiveDepth > 0
}

/**
 * 在同步作用域内将其中发起的请求标记为被动（不顺延会话）。
 * 注意：fn 内若在调用 API 之前先 await，作用域已退出，标记将失效；
 * 建议把 API 调用直接放在 fn 内同步发起，例如 withPassive(() => fetchXxx(...))。
 */
export function withPassive<T>(fn: () => T): T {
  passiveDepth++
  try {
    return fn()
  } finally {
    passiveDepth--
  }
}

export { usePagination, useRequest } from 'vue-request'
export { CancelToken, isCancel }
