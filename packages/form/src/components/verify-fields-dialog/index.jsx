import { defineComponent, ref } from 'vue'
import i18n from '@tap/i18n'
import Dialog from './FieldDialog.vue'
import './style.scss'
export const VerifyFieldsDialog = defineComponent({
  props: {
    value: String,
    option: {
      type: Object,
      default: () => {
        return {}
      },
    },
    beforeRegexp: String,
    after: {
      type: String,
      default: '',
    },
    afterRegexp: String,
    height: {
      type: [String, Number],
      default: 200,
    },
    disabled: Boolean,
    includeBeforeAndAfter: Boolean,
  },
  setup(props, { emit }) {
    const visible = ref(false)
    const webScript = ref('')
    const dialogScript = ref('')
    const dialog = ref(null)
    const list = ref([])
    console.log('props!!!!!', props.value)
    // 编辑
    webScript.value = props.value

    const handleOpenDialog = () => {
      visible.value = true
    }

    const handleCloseDialog = () => {
      console.log('handleOpenDialog')
      dialogScript.value = ''
      visible.value = false
    }

    function openDialog() {
      // visible.value = true
      dialog.value?.open?.(props.option)
    }

    function onChange(data = []) {
      list.value = data
      console.log('onChange', data)
      emit('change', data)
      emit('modelValue', data)
      handleCloseDialog()
    }

    return () => {
      return (
        <div class="verify-fields-dialog">
          <ElLink type="primary" onClick={openDialog}>
            {i18n.t('packages_business_components_conditionbox_chakanzidingyi')}({list.value.length})
          </ElLink>
          <Dialog ref={dialog} onChange={onChange}></Dialog>
        </div>
      )
    }
  },
})
