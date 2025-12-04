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

export interface CountFetchResult {
  count: number
}

export interface Filter {
  where?: Record<string, any>
  order?: string
  limit?: number
  skip?: number
  pageNo?: number
  pageSize?: number
  fields?: any
}

export { useRequest } from 'vue-request'
export { CancelToken, isCancel }

export const PdkRenamedData: Record<string, string> = {
  Mysql: 'MySQL',
  "HuaWei'Cloud GaussDB": 'Huawei Cloud GaussDB',
}
