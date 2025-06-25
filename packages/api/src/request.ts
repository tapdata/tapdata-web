import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
  type AxiosResponseHeaders,
  type RequestClientOptions,
} from '@tap/request'

const apiURL = import.meta.env.BASE_URL

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  })

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: (config) => {
      const accessStore = useAccessStore()

      config.headers.Authorization = formatToken(accessStore.accessToken)
      config.headers['Accept-Language'] = preferences.app.locale
      return config
    },
  })

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 0,
    }),
  )

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  )

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      // 当前mock接口返回的错误字段是 error 或者 message
      const responseData = error?.response?.data ?? {}
      const errorMessage = responseData?.error ?? responseData?.message ?? ''
      // 如果没有错误信息，则会根据状态码进行提示
      message.error(errorMessage || msg)
    }),
  )

  return client
}

// export const requestClient = createRequestClient(apiURL, {
//   responseReturn: 'data',
// })

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
