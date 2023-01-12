import i18n from '@tap/i18n'
import { registerValidateRules } from '@formily/core'
import cronParse from 'cron-parser'
import * as components from './components'
import { composeExport } from '@formily/element/lib/__builtins__'
import langs from './locale'
import './style.scss'
import SchemaToForm from './SchemaToForm'

export { SchemaToForm }

// cron表达式校验
registerValidateRules({
  cron(value, rule) {
    value = value?.trim()
    if (!value) return ''
    const message = rule.message || i18n.t('packages_form_src_index_cronbiao')
    const list = value.split(/\s+/g)
    if (list.length < 6 || list.length > 7) return message
    // 包含年份的情况（一般不会...
    if (list.length === 7) {
      if (!/\d{4}$/.test(list.pop())) return message
      // cron-parser 暂不支持年份，将年份去掉，进行校验
      value = list.join(' ')
    }
    try {
      if (cronParse.parseExpression(value).hasNext()) {
        return ''
      }
    } catch (e) {
      console.log('cron-rule', e) // eslint-disable-line
    }
    return message
  }
})

export { composeExport, langs, components }

export * from './components'
export * from './shared'
export * from '@formily/vue'
