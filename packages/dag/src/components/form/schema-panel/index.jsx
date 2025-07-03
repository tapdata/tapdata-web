import { observe } from '@formily/reactive'
import { useForm } from '@tap/form'
import { defineComponent, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import MigrateMetaPane from '../../migration/MigrateMetaPane.vue'

export const SchemaPanel = defineComponent({
  props: ['formTab'],
  setup(props) {
    const paneRef = ref()
    const formRef = useForm()
    const dispose = observe(formRef.value.values.$inputs, () => {
      loadData()
    })
    const loadData = () => {
      if (props.formTab?.activeKey === 'tab2') {
        nextTick(() => {
          paneRef.value?.loadData()
        })
      }
    }
    const unWatch = watch(
      () => props.formTab?.activeKey,
      () => {
        loadData()
      },
      {
        immediate: true,
      },
    )

    onBeforeUnmount(() => {
      dispose()
      unWatch()
    })

    return () => {
      return (
        <MigrateMetaPane ref={paneRef} form={formRef.value}></MigrateMetaPane>
      )
    }
  },
})
