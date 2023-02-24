import { useField, Field, FragmentComponent } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { FormItem } from '@tap/form'
import { RadioGroup, RadioButton } from 'element-ui'
import { IconWidget } from '../../widgets'
import { usePrefix } from '../../../hooks'
import { FlexStyleSetter } from '../FlexStyleSetter'
import './styles.scss'
import { defineComponent } from 'vue-demi'

export const DisplayStyleSetter = observer(
  defineComponent({
    props: {
      value: { type: String }
    },
    setup: (props, { emit }) => {
      const fieldRef = useField()
      const prefix = usePrefix('display-style-setter')
      return () => {
        const field = fieldRef.value
        return (
          <FragmentComponent>
            <FormItem.BaseItem label={field.title} class={prefix}>
              <RadioGroup
                class={prefix + '-radio'}
                value={props.value}
                onInput={label => {
                  emit('change', label)
                }}
              >
                <RadioButton props={{ label: 'block' }}>
                  <IconWidget infer="DisplayBlock" size={16} />
                </RadioButton>
                <RadioButton props={{ label: 'inline-block' }}>
                  <IconWidget infer="DisplayInlineBlock" size={16} />
                </RadioButton>
                <RadioButton props={{ label: 'inline' }}>
                  <IconWidget infer="DisplayInline" size={16} />
                </RadioButton>
                <RadioButton props={{ label: 'flex' }}>
                  <IconWidget infer="DisplayFlex" size={16} />
                </RadioButton>
              </RadioGroup>
            </FormItem.BaseItem>
            <Field
              name="flex"
              basePath={field.address.parent()}
              visible={false}
              reactions={flexField => {
                flexField.visible = field.value === 'flex'
              }}
              component={[FlexStyleSetter]}
            />
          </FragmentComponent>
        )
      }
    }
  })
)
