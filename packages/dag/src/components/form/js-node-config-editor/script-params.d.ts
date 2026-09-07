export interface ScriptParam {
  key: string
  type: 'string' | 'number' | 'boolean' | 'json'
  value: string
  encrypted: boolean
  description: string
}

export const SCRIPT_PARAM_TYPES: Array<{
  label: string
  value: ScriptParam['type']
}>
export function createDefaultScriptParam(): ScriptParam
export function normalizeScriptParams(params: unknown): ScriptParam[]
export function duplicateScriptParamKeys(params: unknown): Set<string>
export function serializeScriptParams(
  params: unknown,
): Array<Omit<ScriptParam, 'value'> & { value: unknown }>
