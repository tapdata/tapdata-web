/*
 * 支持文本、数字、布尔、表达式
 * Todo: JSON、富文本，公式
 */
import { createPolyInput } from '../PolyInput'
import { Button, Popover, Select, Option } from 'element-ui'
import { Input, InputNumber } from '@tap/form'
import { TextWidget } from '../../widgets'
import { defineComponent } from 'vue-demi'
import { VCodeEditor } from '@tap/component'

const STARTTAG_REX =
  /<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/

const EXPRESSION_REX = /^\{\{([\s\S]*)\}\}$/

const isNumber = (value) => typeof value === 'number'

const isBoolean = (value) => typeof value === 'boolean'

const isExpression = (value) => {
  return typeof value === 'string' && EXPRESSION_REX.test(value)
}

const isRichText = (value) => {
  return typeof value === 'string' && STARTTAG_REX.test(value)
}

const isNormalText = (value) => {
  return typeof value === 'string' && !isExpression(value) && !isRichText(value)
}

const takeNumber = (value) => {
  const num = String(value).replace(/[^\d.]+/, '')
  if (num === '') return
  return Number(num)
}

export const ValueInput = createPolyInput([
  {
    type: 'TEXT',
    icon: 'Text',
    component: Input,
    checker: isNormalText,
  },
  {
    type: 'EXPRESSION',
    icon: 'Expression',
    component: defineComponent({
      props: ['value'],
      setup: (props, { emit }) => {
        return () => (
          <Popover trigger="click" class="w-100">
            <div
              style={{
                width: '400px',
                height: '200px',
                margin: ' -12px',
                overflow: 'hidden',
                borderRadius: '4px',
              }}
            >
              <VCodeEditor
                props={props}
                lang="javascript"
                options={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  showPrintMargin: false,
                }}
                onInput={(val) => {
                  emit('change', val)
                }}
              />
            </div>
            <Button slot="reference" class="w-100">
              <TextWidget token="SettingComponents.ValueInput.expression" />
            </Button>
          </Popover>
        )
      },
    }),
    checker: isExpression,
    toInputValue: (value) => {
      if (!value || value === '{{}}') return
      const matched = String(value).match(EXPRESSION_REX)
      return matched?.[1] || value || ''
    },
    toChangeValue: (value) => {
      if (!value || value === '{{}}') return
      const matched = String(value).match(EXPRESSION_REX)
      return `{{${matched?.[1] || value || ''}}}`
    },
  },
  {
    type: 'BOOLEAN',
    icon: 'Boolean',
    component: defineComponent({
      props: ['value'],
      setup: (props, { emit }) => {
        return () => (
          <Select
            onChange={(val) => {
              emit('change', val)
            }}
            value={props.value}
          >
            <Option label="True" value={true} />
            <Option label="False" value={false} />
          </Select>
        )
      },
    }),
    checker: isBoolean,
    toInputValue: (value) => {
      return !!value
    },
    toChangeValue: (value) => {
      return !!value
    },
  },
  {
    type: 'NUMBER',
    icon: 'Number',
    component: InputNumber,
    checker: isNumber,
    toInputValue: takeNumber,
    toChangeValue: takeNumber,
  },
])
