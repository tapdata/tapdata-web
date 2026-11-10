export interface LogMiningMonitor {
  timestamp: string
  pid?: number
  cpuPercent?: number
  memoryPercent?: number
  state: string
  dataSource: string
  serviceId: string
  isAlive: boolean
  id: number | string
  name: string
  ip: string
  startTime: string
  status: 'running' | 'stopped'
  cpuUsage: string
  memoryUsage: string
  agentType?: string
  proxyProcessId?: string
  sourceServiceId?: string
  address?: string
  processStatus?: string
  errorReason?: string
  reportedData: {
    state: string
    cpuPercent: number
    memoryPercent: number
    createTime?: string | number | Date
  }
}
