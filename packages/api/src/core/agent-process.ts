import { requestClient, type PageFetchResult } from '../request'

const BASE_URL = '/api/agent-process'

export interface AgentProcessItem {
  proxyProcessId: string
  agentName?: string
  agentType: string
  agentId: string
  advertiseIp?: string
  advertisePort?: number
  startTime?: string | number | Date
  status?: string
  statusReportTime?: string | number | Date
  pid?: number
  cpuUsage?: number
  memoryUsage?: number
  errorReason?: string
  lastRegisterTime?: string | number | Date
}

export interface OracleLogParserAgentProcessItem extends AgentProcessItem {
  sourceServiceId?: string
  sourceState?: string
}

export function fetchAgentProcessTypes() {
  return requestClient.get<string[]>(`${BASE_URL}/types`)
}

export function fetchAgentProcesses(params: {
  agentType: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}) {
  return requestClient.get<PageFetchResult<AgentProcessItem>>(BASE_URL, {
    params,
  })
}

export function deleteAgentProcess(proxyProcessId: string) {
  return requestClient.delete(`${BASE_URL}/${proxyProcessId}`)
}
