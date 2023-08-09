import i18n from '@tap/i18n'
import { NodeType } from './extends/NodeType'
import { AllLocales } from './locales'

export class JavaScript extends NodeType {
  constructor() {
    super()
  }

  type = 'python_processor'

  beta = true

  maxInputs = 1 // 最大输入个数

  group = 'processor'

  formSchema = {
    type: 'object',
    properties: {
      $inputs: {
        type: 'array',
        'x-display': 'hidden'
      },

      tabs: {
        type: 'void',
        'x-component': 'FormTab',
        'x-component-props': {
          class: 'config-tabs',
          formTab: '{{formTab}}'
        },
        properties: {
          tab1: {
            type: 'void',
            'x-component': 'FormTab.TabPane',
            'x-component-props': {
              label: i18n.t('public_basic_settings')
            },
            properties: {
              name: {
                type: 'string',
                title: i18n.t('public_node_name'),
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Input'
              },
              script: {
                title: i18n.t('packages_dag_nodes_javascript_jiaoben'),
                type: 'string',
                required: true,
                default: `import json, random, time, datetime, uuid, types\nimport urllib, urllib2\nimport math, hashlib, base64\ndef process(record, context):"""
Detailed context description can be found in the API documentation
context = {
  "event": {},  #Data source event type, table name, and other information
  "before": {}, #Content before data changes
  "info": {},   #Data source event information
  "global": {}  #A state storage container on the node dimension within the task cycle
}
"""
# Enter you code at here\nreturn record;`,
                'x-component': 'PythonProcessor',
                'x-component-props': {
                  height: 500,
                  options: { showPrintMargin: false, wrap: false },
                  includeBeforeAndAfter: true,
                  before: `import json, random, time, datetime, uuid, types\nimport urllib, urllib2\nimport math, hashlib, base64\ndef process(record, context):`,
                  beforeRegexp: '^[^]*def\\s+process\\s*\\(record\\,\\s+context\\)\\:',
                  param: 'tapTable',
                  handleAddCompleter: '{{addDeclaredCompleterForSync}}'
                }
              },

              schemaPreview: {
                type: 'void',
                'x-component': 'SchemaPreview'
              }
            }
          }
        }
      }
    }
  }

  locales = AllLocales.JavaScript
}
