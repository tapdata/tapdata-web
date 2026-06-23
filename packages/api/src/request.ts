import { RequestClient } from '@tap/request'
import axios from 'axios'

import { isRef, onUnmounted, type Ref } from 'vue'
import {
  useRequest,
  type Options,
  type QueryResult,
  type Service,
} from 'vue-request'

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

/**
 * 异步版被动作用域：fn 整个 Promise 生命周期内（含所有 await）发起的请求均被标记为被动。
 *
 * 与 withPassive 的区别：
 * - withPassive   同步复位，作用域仅覆盖 fn() 调用的同步执行栈，跨 await 失效。
 *                 适合：setInterval/setTimeout 回调、单次同步发起的 API 调用。
 * - withPassiveAsync 异步复位，在 fn 返回的 Promise settle 后才释放计数器。
 *                 适合：async 函数内有多个 await 且每个 await 后都需标记的场景。
 *
 * ⚠️ 竞态说明：passiveDepth 是模块级计数器，并发执行的多个 withPassiveAsync
 * 会互相叠加。若在 fn 飞行期间有用户主动发起的请求，该请求也可能被误标为被动。
 * 对于"仅用于后端忽略活跃刷新"的轻量场景，此副作用可接受。
 */
export async function withPassiveAsync<T>(fn: () => Promise<T>): Promise<T> {
  passiveDepth++
  try {
    return await fn()
  } finally {
    passiveDepth--
  }
}

export { usePagination, useRequest } from 'vue-request'
export { CancelToken, isCancel }

/**
 * 与 useRequest 接口完全相同，但会将 pollingInterval 触发的轮询请求标记为被动
 * （携带 X-User-Activity: 0），手动调用 run() 仍视为用户主动行为。
 */
export function usePollingRequest<R, P extends unknown[] = any>(
  service: Service<R, P>,
  options: Options<R, P> = {},
): QueryResult<R, P> {
  const { pollingInterval, onAfter, ...restOptions } = options
  let timer: ReturnType<typeof setTimeout> | null = null

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const result = useRequest<R, P>(service, {
    ...restOptions,
    onAfter(params: P) {
      onAfter?.(params)
      if (pollingInterval != null) {
        clearTimer()
        const ms = isRef(pollingInterval)
          ? (pollingInterval as Ref<number>).value
          : (pollingInterval as number)
        timer = setTimeout(
          () => withPassiveAsync(() => result.refreshAsync()),
          ms,
        )
      }
    },
  })

  // 手动 run：清掉待执行的轮询，再发起主动请求（不标记被动）
  const run = (...args: P) => {
    clearTimer()
    result.run(...args)
  }

  const cancel = () => {
    clearTimer()
    result.cancel()
  }

  onUnmounted(clearTimer)

  return { ...result, run, cancel }
}
