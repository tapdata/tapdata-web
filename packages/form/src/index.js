import { registerValidateRules } from '@formily/core'
import { composeExport } from '@formily/element-plus/lib/__builtins__'
import i18n from '@tap/i18n'
import cronParse from 'cron-parser'
import * as components from './components'
import langs from './locale'
import SchemaForm from './SchemaForm.vue'
import SchemaToForm from './SchemaToForm.vue'
import './style.scss'

export { SchemaForm, SchemaToForm }

export const validateCron = (value) => {
  value = value?.trim()
  if (!value) return true
  const list = value.split(/\s+/g)
  if (list.length < 6 || list.length > 7) return false
  // 包含年份的情况（一般不会...
  if (list.length === 7) {
    if (!/\d{4}$/.test(list.pop())) return false
    // cron-parser 暂不支持年份，将年份去掉，进行校验
    value = list.join(' ')
  }
  try {
    if (cronParse.parseExpression(value).hasNext()) {
      return true
    }
  } catch (error) {
    console.log('cron-rule', error) // eslint-disable-line
  }
  return false
}

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
export * from '@formily/vue'
export * from '@formily/reactive-vue'
