import { useField, Field, observer } from '@formily/vue'
import { usePrefix } from '../../../hooks'
import { Select, Input } from '@daas/form'
import { FoldItem } from '../FoldItem'
import { ColorInput } from '../ColorInput'
import { BackgroundSizeInput } from '../SizeInput'
import { BackgroundImageInput } from '../ImageInput'
import { InputItems } from '../InputItems'
import { defineComponent } from 'vue-demi'

export const BackgroundStyleSetter = observer(
  defineComponent({
    setup: () => {
      const fieldRef = useField()
      const prefix = usePrefix('background-style-setter')
      return () => {
        const field = fieldRef.value
        return (
          <FoldItem class={prefix} label={field.title}>
            <FoldItem.Base>
              <Field name="backgroundColor" basePath={field.address.parent()} component={[ColorInput]} />
            </FoldItem.Base>
            <FoldItem.Extra>
              <InputItems>
                <InputItems.Item icon="Image">
                  <Field name="backgroundImage" basePath={field.address.parent()} component={[BackgroundImageInput]} />
                </InputItems.Item>
                <InputItems.Item icon="ImageSize" width="50%">
                  <Field name="backgroundSize" basePath={field.address.parent()} component={[BackgroundSizeInput]} />
                </InputItems.Item>
                <InputItems.Item icon="Repeat" width="50%">
                  <Field
                    name="backgroundRepeat"
                    basePath={field.address.parent()}
                    component={[Select, { style: { width: '100%' }, placeholder: 'Repeat' }]}
                    dataSource={[
                      {
                        label: 'No Repeat',
                        value: 'no-repeat'
                      },
                      {
                        label: 'Repeat',
                        value: 'repeat'
                      },
                      {
                        label: 'Repeat X',
                        value: 'repeat-x'
                      },
                      {
                        label: 'Repeat Y',
                        value: 'repeat-y'
                      },
                      {
                        label: 'Space',
                        value: 'space'
                      },
                      {
                        label: 'Round',
                        value: 'round'
                      }
                    ]}
                  />
                </InputItems.Item>
                <InputItems.Item icon="Position">
                  <Field
                    name="backgroundPosition"
                    basePath={field.address.parent()}
                    component={[Input, { placeholder: 'center center' }]}
                  />
                </InputItems.Item>
              </InputItems>
            </FoldItem.Extra>
          </FoldItem>
        )
      }
    }
  })
)
