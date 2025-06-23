import type { Form } from '@formily/core'
import type { VueComponent } from '@formily/vue'
import type { CSSProperties } from 'vue'

export interface ISettingFormProps {
  className?: string
  style?: CSSProperties
  uploadAction?: string
  components?: Record<string, VueComponent>
  effects?: (form: Form) => void
  scope?: any
  headers?: Record<string, string>
}
