import { requestClient, type Filter, type PageFetchResult } from '../request'

const BASE_URL = '/api/customNode'

export interface CustomNode {
  id: string
  name: string
  description: string
  createTime: string
  createTimeFmt: string
  createBy: string
  createByName: string
  updateTime: string
  updateTimeFmt: string
}

/**
 * 检查使用该节点的任务
 */
export function checkCustomNodeUsed(id: string) {
  return requestClient.get(`${BASE_URL}/checkUsed/${id}`)
}

// Base Http methods that are used in the codebase
export function fetchCustomNodes(filter?: Filter) {
  return requestClient.get<PageFetchResult<CustomNode>>(BASE_URL, {
    params: {
      filter: filter ? JSON.stringify(filter) : undefined,
    },
  })
}

export function patchCustomNode(params: any, config?: any) {
  return requestClient.patch(BASE_URL, params, config)
}

export function deleteCustomNode(id: string) {
  return requestClient.delete(`${BASE_URL}/${id}`)
}

export function createCustomNode(params: any) {
  return requestClient.post(BASE_URL, params)
}
