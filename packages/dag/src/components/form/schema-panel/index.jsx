import { ref, defineComponent, onBeforeUnmount, watch } from 'vue'
import { useForm } from '@tap/form'
import MigrateMetaPane from '../../migration/MigrateMetaPane'
import { observe } from '@formily/reactive'

export const SchemaPanel = defineComponent({
  props: ['formTab'],
  setup(props) {
    const paneRef = ref()
    const formRef = useForm()
    const dispose = observe(formRef.value.values.$inputs, () => {
      loadData()
    })
    const loadData = () => {
      if (props.formTab.activeKey === 'tab2') {
        paneRef.value.loadData()
      }
    }
    const unWatch = watch(
      () => props.formTab.activeKey,
      () => {
        loadData()
      },
    )

    onBeforeUnmount(() => {
      dispose()
      unWatch()
    })

    return () => {
      return <MigrateMetaPane ref={paneRef} form={formRef.value}></MigrateMetaPane>
    }
  },
})
