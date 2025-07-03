import { requestClient } from '../request'

const BASE_URL = '/api/Settings'

export interface Setting {
  category: string
  category_sort: string
  default_value: string
  documentation: string
  enums?: []
  hot_reloading: boolean
  id: string
  key: string
  key_label: string
  last_update: string
  scope: string
  sort: string
  user_visible: boolean
  value: string
  open?: boolean
}

export function fetchSettings() {
  return requestClient.get<Setting[]>(BASE_URL)
}

export function getRegistryPolicy() {
  return requestClient.get(`${BASE_URL}/getRegistryPolicy`)
}

export function patchSetting(params: { id: string; [key: string]: any }) {
  return requestClient.patch(`${BASE_URL}/${params.id}`, params)
}

export function updateSettings(params: any) {
  return requestClient.patch(BASE_URL, params)
}

export function testEmail(params: any) {
  return requestClient.post(`${BASE_URL}/testEmail`, params)
}

export function saveSettings(params: any) {
  return requestClient.patch(`${BASE_URL}/save`, params)
}

export function getObjectId() {
  return requestClient.post(`${BASE_URL}/ObjectId`)
}

export function findOneSetting(id: string) {
  return requestClient.get(`${BASE_URL}/${id}`)
}

export function enterpriseUpdate(where: any, attributes: any) {
  if (typeof where === 'object') where = JSON.stringify(where)
  return requestClient.post(
    `${BASE_URL}/enterpriseUpdate?where=${encodeURIComponent(where)}`,
    attributes,
  )
}

export function findAlarm() {
  return requestClient.get(`${BASE_URL}/alarm_find`)
}

export function saveAlarm(params: any) {
  return requestClient.post(`${BASE_URL}/alarm_save`, params)
}

export function updateAlarm(params: any) {
  return requestClient.patch(`${BASE_URL}/alarm_update`, params)
}

export function fetchAppVersion() {
  return requestClient.get<string>(`${BASE_URL}/appVersion`)
}
