import { requestClient } from '../request'

const BASE_URL = '/api/webhook'

export function getWebhookList(params: any) {
  return requestClient.get(`${BASE_URL}/list`, { params })
}

export function createWebhook(params: any) {
  return requestClient.post(`${BASE_URL}/create`, params)
}

export function updateWebhook(params: any) {
  return requestClient.post(`${BASE_URL}/update`, params)
}

export function closeWebhook(id: string) {
  return requestClient.post(`${BASE_URL}/closeOne/${id}`)
}

export function openWebhook(id: string) {
  return requestClient.post(`${BASE_URL}/re-open-one/${id}`)
}

export function pingWebhook(data: any) {
  return requestClient.post(`${BASE_URL}/ping`, data)
}

export function getWebhookHistory(params: any) {
  return requestClient.get(`${BASE_URL}/history/list`, {
    params,
  })
}

export function resendWebhook(data: any) {
  return requestClient.post(`${BASE_URL}/history/re-send`, data)
}

export function deleteWebhook(id: string) {
  return requestClient.delete(`${BASE_URL}/deleteOne/${id}`)
}
