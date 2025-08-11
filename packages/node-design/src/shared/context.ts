import type { ISettingFormProps } from '../types'
import type { InjectionKey, Ref } from 'vue'

export const SettingsFormSymbol: InjectionKey<Ref<ISettingFormProps>> = Symbol(
  'SettingsFormContext',
)
