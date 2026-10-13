import JSONBig from 'json-bigint'
import { requestClient } from '../request'

const BASE_URL = '/api/InspectDetails'

const jsonBig = JSONBig()

/**
 * 校验明细中的数值可能超出 JS Number 精度（如 bigint 主键、高精度 decimal），
 * 无法用 Number 精确表示的数值保留为字符串，其余仍转为 Number
 */
function toExactValue(value: any): any {
  if (value?._isBigNumber === true) {
    const num = Number(value)
    return value.isEqualTo(String(num)) ? num : value.toFixed()
  }
  if (Array.isArray(value)) {
    return value.map(toExactValue)
  }
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      value[key] = toExactValue(value[key])
    })
  }
  return value
}

function parseExactJson(data: any) {
  if (typeof data !== 'string' || !data) {
    return data
  }
  try {
    return toExactValue(jsonBig.parse(data))
  } catch {
    return data
  }
}

export function fetchInspectDetails(filter?: any) {
  return requestClient.get(BASE_URL, {
    params: { filter: filter ? JSON.stringify(filter) : undefined },
    transformResponse: [parseExactJson],
  })
}

export function exportInspectDetails(
  inspectResultId: string,
  fullField: boolean,
) {
  return requestClient.post(
    `${BASE_URL}/export`,
    {
      inspectResultId,
      fullField,
    },
    {
      responseType: 'blob',
      responseReturn: 'raw',
      skipErrorHandler: true,
    },
  )
}
