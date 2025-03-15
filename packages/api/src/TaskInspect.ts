import Http from './Http'

interface TaskInspectConfig {
  custom: {
    cdc: {
      enable: boolean
      sample: {
        interval: number
        limit: number
      }
      type: 'CLOSE' | 'SAMPLE'
    }
    full?: {
      enable: boolean
      cron: string
      diffEnable: boolean
      diffLimit: number
      diffRetryTimes: number
      sampleLimit: number
      samplePercent: number
      trigger: string
      type: string
    }
  }
  intelligent?: {
    cdcSampleInterval: number
    cdcSampleLimit: number
    enableRecover: boolean
    fullDiffLimit: number
    fullSampleLimit: number
  }
  mode: 'CLOSE' | 'INTELLIGENT' | 'CUSTOM'
}

export default class TaskInspect extends Http {
  constructor() {
    super('/api/task-inspect')
  }

  getConfig(taskId: string, params: any): Promise<TaskInspectConfig> {
    return this.axios.get(this.url + `/${taskId}`, { params }).catch(err => {
      console.error(err)
      return Promise.resolve({
        mode: 'CUSTOM',
        custom: {
          cdc: {
            enable: true,
            sample: { interval: 60, limit: 20 }
          }
        }
      })
    })
  }

  putConfig(taskId: string, params: TaskInspectConfig) {
    return this.axios.put<TaskInspectConfig>(this.url + `/${taskId}`, params)
  }

  getHistories(taskId: string, params: any) {
    return this.axios.get<TaskInspectHistory[]>(this.url + `/${taskId}/histories`, { params })
  }
}
