import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios'
import { ElMessage as Message } from 'element-plus'
import Cookie from '@tap/shared/src/cookie'
import { signOut } from '../utils/util'
import i18n from '@/i18n'
import Qs from 'qs'
import { showErrorMessage } from '@tap/business/src/components/error-message'

type AxiosRequestConfigPro = AxiosRequestConfig & {
  silenceMessage?: boolean
}

const pending = [] //声明一个数组用于存储每个ajax请求的取消函数和ajax标识

const CancelToken = axios.CancelToken

axios.defaults.baseURL = import.meta.env.BASE_URL || './'

const getPendingKey = (config: AxiosRequestConfig): string => {
  const { url, method, data, params } = config
  const headers = {}
  // headers 这里，有时候服务端响应的时候会多一些头，造成响应头跟请求头不一致，无法remove，后续的请求都会被cancel
  /*for (const key in config.headers) {
    const value = config.headers[key]
    if (Object.prototype.toString.call(value) === '[object String]' && !['Content-Type', 'Accept'].includes(key)) {
      headers[key] = value
    }
  }*/
  config.data = Object.prototype.toString.call(data) === '[object String]' ? JSON.parse(data) : data
  const key = JSON.stringify({
    url,
    method,
    data: config.data,
    params,
    headers,
  })
  return key
}
const removePending = (config: AxiosRequestConfig): void => {
  const key = getPendingKey(config)
  const index = pending.findIndex((it) => it === key)
  if (index >= 0) {
    pending.splice(index, 1)
  }
}
const errorCallback = (error: AxiosError): Promise<AxiosError | string> => {
  if (axios.isCancel(error)) {
    // eslint-disable-next-line no-console
    console.log('Request canceled', error.message)
    return Promise.reject(error)
  }
  if (error?.config || error?.response?.config) {
    removePending(error.config || error.response.config)
  }
  const rsp = error.response
  if (rsp) {
    if (rsp.data && rsp.data.state === 'EXCEPTION') {
      return Promise.reject(error)
    }
    switch (rsp.status) {
      // 用户无权限访问接口
      case 401:
        signOut()
        setTimeout(() => {
          Message.error({ message: i18n.t('public_message_401').toString() })
        }, 500)
        break
      // 请求的资源不存在
      case 404:
        Message.error({ message: i18n.t('public_message_404').toString() })
        break
      case 504:
        Message.error({ message: i18n.t('public_message_5xx').toString() })
        break
      case 500:
        Message.error({ message: i18n.t('public_message_5xx').toString() })
        break
    }
  } else if (error.code === 'ECONNABORTED' /* || error.message === 'Network Error' || !window.navigator.onLine*/) {
    // 这两种情况已在ws-client.js里监听 👉 error.message === 'Network Error' || !window.navigator.onLine
    Message.error({
      message: i18n.t('public_message_network_unconnected').toString(),
    })
  } else if (error.message && error.message.includes('timeout')) {
    Message.error({
      message: i18n.t('public_message_request_timeout').toString(),
    })
  }
  return Promise.reject(error)
}
axios.interceptors.request.use(function (config: AxiosRequestConfig): AxiosRequestConfig {
  config.paramsSerializer = (params) => {
    return Qs.stringify(params, {
      arrayFormat: 'brackets',
      encoder: (str) => window.encodeURIComponent(str),
    })
  }
  const accessToken = Cookie.get('access_token')
  if (accessToken) {
    if (~config.url.indexOf('?')) {
      if (!~config.url.indexOf('access_token')) {
        config.url = `${config.url}&access_token=${accessToken}`
      }
    } else {
      config.url = `${config.url}?access_token=${accessToken}`
    }
  }
  config.headers['x-requested-with'] = 'XMLHttpRequest'

  // 业务内设置了cancel
  if (config.cancelToken) return config

  const key = getPendingKey(config)
  let cancelFunc = null
  config.cancelToken = new CancelToken((c) => {
    cancelFunc = c
  })
  if (pending.includes(key)) {
    console.warn('Cancel request:', JSON.parse(key)) //eslint-disable-line
    cancelFunc()
  } else if (config.method !== 'get') {
    pending.push(key)
  }
  return config
}, errorCallback)

axios.interceptors.response.use((response: AxiosResponse) => {
  return new Promise((resolve, reject) => {
    removePending(response.config)
    const code = response.data.code
    const data = response.data
    if (response?.config?.responseType === 'blob') {
      return resolve(response)
    }

    showErrorMessage({
      message: '🔧 测试测试',
      stack: `<-- Error Message -->
java.lang.RuntimeException: java.lang.IllegalStateException: BinaryLogClient is already connected

<-- Simple Stack Trace -->
Caused by: java.lang.IllegalStateException: BinaryLogClient is already connected
\tcom.github.shyiko.mysql.binlog.BinaryLogClient.connect(BinaryLogClient.java:566)
\tcom.github.shyiko.mysql.binlog.BinaryLogClient$6.run(BinaryLogClient.java:959)
\tjava.lang.Thread.run(Thread.java:748)

<-- Full Stack Trace -->
java.lang.RuntimeException: java.lang.IllegalStateException: BinaryLogClient is already connected
\tat io.tapdata.pdk.core.monitor.PDKInvocationMonitor.invokePDKMethodPrivate(PDKInvocationMonitor.java:186)
\tat io.tapdata.pdk.core.monitor.PDKInvocationMonitor.lambda$invokePDKMethod$12(PDKInvocationMonitor.java:153)
\tat io.tapdata.pdk.core.api.Node.applyClassLoaderContext(Node.java:27)
\tat io.tapdata.pdk.core.monitor.PDKInvocationMonitor.invokePDKMethod(PDKInvocationMonitor.java:153)
\tat io.tapdata.pdk.core.monitor.PDKInvocationMonitor.invoke(PDKInvocationMonitor.java:95)
\tat io.tapdata.flow.engine.V2.node.hazelcast.data.pdk.HazelcastSourcePdkDataNode.lambda$doNormalCDC$33(HazelcastSourcePdkDataNode.java:762)
\tat io.tapdata.aspect.utils.AspectUtils.executeDataFuncAspect(AspectUtils.java:67)
\tat io.tapdata.flow.engine.V2.node.hazelcast.HazelcastBaseNode.executeDataFuncAspect(HazelcastBaseNode.java:148)
\tat io.tapdata.flow.engine.V2.node.hazelcast.data.pdk.HazelcastSourcePdkDataNode.doNormalCDC(HazelcastSourcePdkDataNode.java:752)
\tat io.tapdata.flow.engine.V2.node.hazelcast.data.pdk.HazelcastSourcePdkDataNode.doCdc(HazelcastSourcePdkDataNode.java:641)
\tat io.tapdata.flow.engine.V2.node.hazelcast.data.pdk.HazelcastSourcePdkDataNode.startSourceRunner(HazelcastSourcePdkDataNode.java:205)
\tat java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
\tat java.util.concurrent.FutureTask.run$$$capture(FutureTask.java:266)
\tat java.util.concurrent.FutureTask.run(FutureTask.java)
\tat java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
\tat java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
\tat java.lang.Thread.run(Thread.java:748)
Caused by: java.lang.RuntimeException: java.lang.IllegalStateException: BinaryLogClient is already connected
\tat io.tapdata.common.exception.AbstractExceptionCollector.collectCdcConfigInvalid(AbstractExceptionCollector.java:63)
\tat io.tapdata.connector.mysql.MysqlExceptionCollector.collectCdcConfigInvalid(MysqlExceptionCollector.java:159)
\tat io.tapdata.connector.mysql.MysqlReader.readBinlog(MysqlReader.java:390)
\tat io.tapdata.connector.mysql.MysqlConnector.streamRead(MysqlConnector.java:680)
\tat io.tapdata.flow.engine.V2.node.hazelcast.data.pdk.HazelcastSourcePdkDataNode.lambda$doNormalCDC$31(HazelcastSourcePdkDataNode.java:741)
\tat io.tapdata.pdk.core.monitor.PDKInvocationMonitor.invokePDKMethodPrivate(PDKInvocationMonitor.java:164)
\t... 16 more
Caused by: java.lang.IllegalStateException: BinaryLogClient is already connected
\tat com.github.shyiko.mysql.binlog.BinaryLogClient.connect(BinaryLogClient.java:566)
\tat com.github.shyiko.mysql.binlog.BinaryLogClient$6.run(BinaryLogClient.java:959)
\t... 1 more
`,
    })

    if (code === 'ok') {
      return resolve(response.data.data)
    }

    if ((response.config as AxiosRequestConfigPro).silenceMessage) {
      return reject(response)
    }

    showErrorMessage(response.data)
    return reject(response)
  })
}, errorCallback)

export default axios
