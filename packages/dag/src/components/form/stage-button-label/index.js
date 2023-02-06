import { defineComponent } from '@vue/composition-api'
import { observer } from '@formily/reactive-vue'

import StageButton from '@tap/business/src/components/StageButton'
import { FormItem, useForm } from '@tap/form'

export const StageButtonLabel = observer(
  defineComponent({
    props: ['value', 'disabled', 'connectionId', 'title'],
    setup(props, { emit, root, attrs, refs, slots }) {
      const { taskId, activeNodeId } = root.$store.state?.dataflow || {}

      const formRef = useForm()

      const trigger = () => {
        const field = formRef.value.query('tableNameWrap.tableName').take() || formRef.value.query('tableNames').take()
        field?.setComponentProps({
          reloadTime: Date.now()
        })
      }

      return () => {
        const label = (
          <div class="inline-flex align-center">
            <span class="mr-2">{props.title}</span>
            <StageButton
              connection-id={props.connectionId}
              task-id={taskId}
              node-id={activeNodeId}
              on={{ complete: trigger }}
            ></StageButton>
          </div>
        )

        return (
          <FormItem.BaseItem class="js-editor-form-item" label={label} attrs={attrs}>
            {slots.default?.()}
          </FormItem.BaseItem>
        )
      }
    }
  })
)
