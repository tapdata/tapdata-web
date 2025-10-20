import VCodeEditor from '@tap/component/src/base/VCodeEditor.vue'
import { Input, InputNumber } from '@tap/form'
import {
  ElButton as Button,
  ElOption as Option,
  ElPopover as Popover,
  ElSelect as Select,
} from 'element-plus'
import { defineComponent } from 'vue'
import { TextWidget } from '../../widgets'
/*
 * 支持文本、数字、布尔、表达式
 * Todo: JSON、富文本，公式
 */
import { createPolyInput } from '../PolyInput'

// Improved regex: Fixes ambiguous overlapping in attribute value parsing
const STARTTAG_REX =
  /<[-\w]+(?:\s+[a-z_:][-\w:.]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>/i

// The EXPRESSION_REX was fine, so we leave it unchanged.
const EXPRESSION_REX = /^\{\{[\s\S]*\}\}$/

const isNumber = (value: unknown): value is number => typeof value === 'number'

const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean'

const isExpression = (value: unknown): value is string => {
  return typeof value === 'string' && EXPRESSION_REX.test(value)
}

const isRichText = (value: unknown): value is string => {
  return typeof value === 'string' && STARTTAG_REX.test(value)
}

const isNormalText = (value: unknown): value is string => {
  return typeof value === 'string' && !isExpression(value) && !isRichText(value)
}

const takeNumber = (value: unknown): number | undefined => {
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
            {{
              default: () => (
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
                    {...props}
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
              ),
              reference: () => (
                <Button class="w-100">
                  <TextWidget token="SettingComponents.ValueInput.expression" />
                </Button>
              ),
            }}
          </Popover>
        )
      },
    }),
    checker: isExpression,
    toInputValue: (value: unknown): string => {
      if (!value || value === '{{}}') return ''
      const matched = String(value).match(EXPRESSION_REX)
      return (matched?.[1] as string) || (value as string) || ''
    },
    toChangeValue: (value: unknown): string => {
      if (!value || value === '{{}}') return ''
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
            modelValue={props.value}
          >
            <Option label="True" value={true} />
            <Option label="False" value={false} />
          </Select>
        )
      },
    }),
    checker: isBoolean,
    toInputValue: (value: unknown): boolean => {
      return !!value
    },
    toChangeValue: (value: unknown): boolean => {
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
