import i18n from '@tap/i18n'
import { registerValidateRules } from '@formily/core'
import { createSchemaField } from '@formily/vue'
import cronParse from 'cron-parser'
import * as components from './components'
import { composeExport } from '@formily/element/lib/__builtins__'
import langs from './locale'
import './style.scss'

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

const { SchemaField } = createSchemaField({
  components
})

export { SchemaField, composeExport, langs }

export * from './components'
