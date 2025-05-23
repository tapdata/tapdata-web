import { useField, useForm } from '@formily/vue'
import i18n from '@tap/i18n'
import { defineComponent, ref } from 'vue'

export const TextFileReader = defineComponent({
  props: [
    'value',
    'accept',
    'maxFileSize',
    'base64',
    'fileName',
    'fileNameField',
  ],
  setup(props, { emit, root }) {
    const formRef = useForm()
    const fieldRef = useField()
    const form = formRef.value

    let fileNameField
    const fileName = props.fileName
    const fileNameRef = ref(props.fileName || '')

    if (form) {
      fileNameField =
        props.fileNameField ?? `__TAPDATA_UI.${fieldRef.value.props.name}`
      fileNameRef.value = fileName || form.getValuesIn(fileNameField) || ''
    }

    const selectFile = (file) => {
      if (file) {
        fileNameRef.value = file.name
        if (props.maxFileSize && file.size / 1024 > props.maxFileSize) {
          root.$message.error(
            t('packages_form_text_file_reader_index_shangchuanwenjianda', {
              val1: props.maxFileSize,
            }),
          )
        } else {
          const reader = new FileReader()
          if (props.base64) {
            let fileResult = ''
            reader.readAsDataURL(file)
            reader.addEventListener('load', function () {
              fileResult = reader.result
            })
            reader.onloadend = function () {
              emit('change', fileResult.split(',')[1])
              emit('update:fileName', file.name)
            }
          } else {
            reader.readAsText(file)
            reader.addEventListener('load', () => {
              emit('change', reader.result)
              emit('update:fileName', file.name)
              fileNameField && form?.setValuesIn(fileNameField, file.name)
            })
          }
        }
      } else {
        emit('change', '')
        emit('update:fileName', '')
        fileNameField && form?.setValuesIn(fileNameField, '')
      }
    }

    return () => {
      return (
        <ElInput
          modelValue={fileNameRef.value}
          placeholder={i18n.global.t(
            'packages_form_formBuilder_file_placeholder',
          )}
          onClear={() => {
            emit('change', null)
            emit('update:fileName', null)
          }}
        >
          {{
            append: () => (
              <ElUpload
                {...{
                  action: '',
                  limit: 1,
                  autoUpload: false,
                  accept: props.accept,
                  showFileList: false,
                  onChange: (file) => {
                    selectFile(file.raw)
                  },
                  onExceed: (fileList) => {
                    selectFile(fileList[0])
                  },
                }}
              >
                <ElButton>
                  {i18n.global.t('packages_form_formBuilder_file_button')}
                </ElButton>
              </ElUpload>
            ),
          }}
        </ElInput>
      )
    }
  },
})
