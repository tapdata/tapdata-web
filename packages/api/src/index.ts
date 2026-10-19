import Http, { CancelToken, isCancel } from './Http'

export { CancelToken, isCancel }

export default Http

export * from './request'
export { downloadAuthenticated } from './download'
// export * from './core'

export { useRequest } from 'vue-request'
