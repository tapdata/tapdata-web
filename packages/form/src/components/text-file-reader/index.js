import { defineComponent } from 'vue-demi'

export const TextFileReader = defineComponent({
  props: ['value', 'accept', 'maxFileSize', 'base64'],
  setup(props, { emit, root }) {
    let selectFile = file => {
      if (file) {
        if (props.maxFileSize && file.size / 1024 > props.maxFileSize) {
          root.$message.error(`上传文件大小不能超过 ${props.maxFileSize}KB`)
        } else {
          let reader = new FileReader()
          if (props.base64) {
            let fileResult = ''
            reader.readAsDataURL(file)
            reader.onload = function () {
              fileResult = reader.result
            }
            reader.onloadend = function () {
              emit('change', {
                name: file.name,
                value: fileResult.split(',')[1]
              })
            }
          } else {
            reader.readAsText(file)
            reader.onload = () => {
              emit('change', {
                name: file.name,
                value: reader.result
              })
            }
          }
        }
      } else {
        emit('change', {
          name: '',
          value: ''
        })
      }
    }

    return () => {
      return (
        <ElInput
          value={props.value?.name}
          placeholder={root.$t('formBuilder.file.placeholder')}
          vOn:clear={() => {
            emit('change', null)
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
              <ElButton>{root.$t('formBuilder.file.button')}</ElButton>
            </ElUpload>
          </template>
        </ElInput>
      )
    }
  }
})
