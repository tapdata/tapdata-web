export const SCRIPT_PARAM_TYPES = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'JSON', value: 'json' },
]

export const createDefaultScriptParam = () => ({
  key: '',
  type: 'string',
  value: '',
  encrypted: false,
  description: '',
})

const toEditableValue = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export const normalizeScriptParams = (params) => {
  if (!Array.isArray(params)) return []
  return params.map((param = {}) => ({
    key: String(param.key ?? ''),
    type: SCRIPT_PARAM_TYPES.some((item) => item.value === param.type)
      ? param.type
      : 'string',
    value: toEditableValue(param.value),
    encrypted: Boolean(param.encrypted),
    description: String(param.description ?? ''),
  }))
}

const convertValue = (param) => {
  const rawValue = param.value
  if (param.encrypted || rawValue === '') return rawValue
  if (param.type === 'number') {
    const parsed = Number(rawValue)
    return Number.isNaN(parsed) ? rawValue : parsed
  }
  if (param.type === 'boolean') return rawValue === true || rawValue === 'true'
  if (param.type === 'json') {
    try {
      return JSON.parse(rawValue)
    } catch {
      return rawValue
    }
  }
  return String(rawValue ?? '')
}

export const serializeScriptParams = (params) =>
  normalizeScriptParams(params).map((param) => ({
    ...param,
    value: convertValue(param),
  }))
