import i18n from '@tap/i18n'
import { defineComponent, ref } from 'vue'
import { useForm, useField } from '@formily/vue'

export const TextFileReader = defineComponent({
  props: ['value', 'accept', 'maxFileSize', 'base64', 'fileName', 'fileNameField'],
  setup(props, { emit, root }) {
    const formRef = useForm()
    const fieldRef = useField()
    const form = formRef.value
    const fileNameField = props.fileNameField ?? `__TAPDATA_UI.${fieldRef.value.props.name}`
    const fileName = ref(props.fileName || form.getValuesIn(fileNameField) || '')
    let selectFile = file => {
      if (file) {
        fileName.value = file.name
        if (props.maxFileSize && file.size / 1024 > props.maxFileSize) {
          root.$message.error(
            i18n.global.t('packages_form_text_file_reader_index_shangchuanwenjianda', {
              val1: props.maxFileSize
            })
          )
        } else {
          let reader = new FileReader()
          if (props.base64) {
            let fileResult = ''
            reader.readAsDataURL(file)
            reader.onload = function () {
              fileResult = reader.result
            }
            reader.onloadend = function () {
              emit('change', fileResult.split(',')[1])
              emit('update:fileName', file.name)
            }
          } else {
            reader.readAsText(file)
            reader.onload = () => {
              emit('change', reader.result)
              emit('update:fileName', file.name)
              fileNameField && form.setValuesIn(fileNameField, file.name)
            }
          }
        }
      } else {
        emit('change', '')
        emit('update:fileName', '')
        fileNameField && form.setValuesIn(fileNameField, '')
      }
    }

    return () => {
      return (
        <ElInput
          value={fileName.value}
          placeholder={root.$t('packages_form_formBuilder_file_placeholder')}
          vOn:clear={() => {
            emit('change', null)
            emit('update:fileName', null)
          }}
        >
          <template slot="append">
            <ElUpload
              props={{
                action: '',
                limit: 1,
                autoUpload: false,
                accept: props.accept,
                showFileList: false,
                onChange: file => {
                  selectFile(file.raw)
                },
                onExceed: fileList => {
                  selectFile(fileList[0])
                }
              }}
            >
              <ElButton>{root.$t('packages_form_formBuilder_file_button')}</ElButton>
            </ElUpload>
          </template>
        </ElInput>
      )
    }
  }
})
