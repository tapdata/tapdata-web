import type { InjectionKey, Ref } from 'vue'
import { ISettingFormProps } from '../types'

export const SettingsFormSymbol: InjectionKey<Ref<ISettingFormProps>> = Symbol('SettingsFormContext')
