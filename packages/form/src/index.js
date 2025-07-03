import { registerValidateRules } from '@formily/core'
import { composeExport } from '@formily/element-plus/lib/__builtins__'
import i18n from '@tap/i18n'
import * as components from './components'
import langs from './locale'
import SchemaForm from './SchemaForm.vue'
import SchemaToForm from './SchemaToForm.vue'
import { validateCron } from './shared/validate'
import './style.scss'

export { SchemaForm, SchemaToForm }

// cron表达式校验
registerValidateRules({
  cron(value, rule) {
    return validateCron(value)
      ? ''
      : rule.message || i18n.t('packages_form_src_index_cronbiao')
  },
})

export { components, composeExport, langs }

export * from './components'
export * from './shared'
export * from './FormilyVue'
export * from './FormilyReactiveVue'
