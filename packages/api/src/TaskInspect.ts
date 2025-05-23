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
    recover?: {
      enable: boolean
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

interface TaskInspectHistory {
  id: string
  taskId: string
  createdAt: string
  status: string
  type: string
  [key: string]: any
}

export default class TaskInspect extends Http {
  constructor() {
    super('/api/task-inspect')
  }

  async getConfig(taskId: string, params?: any): Promise<TaskInspectConfig> {
    const response = (await this.axios.get(`${this.url}/${taskId}`, {
      params,
    })) as unknown as TaskInspectConfig

    return (
      response || {
        mode: 'CLOSE',
        custom: {
          cdc: {
            enable: true,
            sample: { interval: 1, limit: 10 },
            type: 'SAMPLE',
          },
        },
      }
    )
  }

  putConfig(taskId: string, params: TaskInspectConfig) {
    return this.axios.put<TaskInspectConfig>(`${this.url}/${taskId}`, params)
  }

  getHistories(taskId: string, params: any) {
    return this.axios.get<TaskInspectHistory[]>(
      `${this.url}/${taskId}/histories`,
      { params },
    )
  }
}
