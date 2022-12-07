import i18n from '@tap/i18n'
import { registerValidateRules } from '@formily/core'
import cronParse from 'cron-parser'
import * as components from './components'
import { composeExport } from '@formily/element/lib/__builtins__'
import langs from './locale'
import './style.scss'
import SchemaToForm from './SchemaToForm'

export { SchemaToForm }

registerValidateRules({
  cron(value, rule) {
    try {
      if (!value || cronParse.parseExpression(value).hasNext()) {
        return ''
      }
    } catch (e) {
      console.log('cron-rule', e) // eslint-disable-line
    }
    return rule.message || i18n.t('packages_form_src_index_cronbiao')
  }
})

export { composeExport, langs, components }

export * from './components'
export * from './shared'
export * from '@formily/vue'
