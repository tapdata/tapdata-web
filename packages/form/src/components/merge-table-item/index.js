import { defineComponent } from 'vue-demi'
import { observer } from '@formily/reactive-vue'
import { useForm } from '@formily/vue'
import { FormLayout, ArrayBase } from '@formily/element'

export const MergeTableItem = observer(
  defineComponent({
    props: {
      loadFieldsMethod: Function
    },
    setup(props, { slots }) {
      const formRef = useForm()
      const indexRef = ArrayBase.useIndex()
      const recordRef = ArrayBase.useRecord()
      const layoutPropss = {
        colon: false,
        shallow: false,
        labelAlign: 'left',
        // layout: 'vertical',
        feedbackLayout: 'terse',
        labelWidth: 150,
        wrapperWidth: 500
      }
      const sourceId = recordRef.value.sourceId
      // 加载字段，并且默认将主键设置到joinKeys上
      props.loadFieldsMethod(sourceId).then(fields => {
        if (!recordRef.value.joinKeys?.length) {
          const joinKeys = fields
            .filter(item => item.isPrimaryKey)
            .map(item => ({ source: item.value, target: item.value }))
          formRef.value.setValuesIn(`mergeProperties.${indexRef.value}.joinKeys`, joinKeys)
        }

        formRef.value.setFieldState(`*(mergeProperties.${indexRef.value}.*(joinKeys.*.source,arrayKeys))`, {
          loading: false,
          dataSource: fields
        })
      })

      return () => {
        if (!sourceId) return null
        return (
          <FormLayout
            key={`${sourceId}_${indexRef.value}`}
            props={layoutPropss}
            style={{
              'margin-bottom': '16px',
              padding: '16px',
              border: '1px solid #f2f2f2',
              borderRadius: '4px'
            }}
          >
            {slots.default?.()}
          </FormLayout>
        )
      }
    }
  })
)

export default MergeTableItem
