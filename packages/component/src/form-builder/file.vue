<script>
import i18n from '@tap/i18n'

import mixins from './mixin'
export default {
  name: 'FbFile',
  mixins: [mixins],
  props: {
    value: [File, String, Object],
    config: {
      require: true,
      type: Object
    }
  },
  data() {
    return {
      fileName: ''
    }
  },
  render(h) {
    let self = this
    let config = self.config
    let fileName = this?.value?.name || config.fileName || ''
    let selectFile = file => {
      let value = {
        name: '',
        value: ''
      }
      if (file) {
        this.fileName = file.name
        if (config.maxFileSize && file.size / 1024 > config.maxFileSize) {
          this.$message.error(
            i18n.t('packages_component_form_builder_file_shangchuanwenjianda', { val1: config.maxFileSize })
          )
        } else {
          let reader = new FileReader()
          let emitInput = val => {
            value = {
              name: file.name,
              value: config.base64 ? val.split(',')[1] : val
            }
            self.$emit('input', value)
            self.$emit('change', value)
          }
          if (config.base64) {
            let fileResult = ''
            reader.readAsDataURL(file)
            //开始转
            reader.onload = function () {
              fileResult = reader.result
            }
            //转 结束  咱就 resolve 出去
            reader.onloadend = function () {
              emitInput(fileResult)
            }
          } else {
            reader.readAsText(file)
            reader.onload = () => {
              emitInput(reader.result)
            }
          }
        }
      } else {
        self.$emit('input', value)
        self.$emit('change', value)
      }
    }
    fileName = Object.prototype.toString.call(fileName) === '[object Object]' ? '' : fileName
    return h(
      'ElInput',
      {
        attrs: {
          placeholder: config.placeholder || self.$t('packages_component_formBuilder_file_placeholder')
        },
        props: {
          value: fileName,
          clearable: config.clearable
        },
        on: {
          clear() {
            self.$emit('input', null)
            self.$emit('change', null)
          }
        }
      },
      [
        h(
          'ElUpload',
          {
            props: {
              action: '',
              limit: 1,
              autoUpload: false,
              accept: config.accept,
              showFileList: false,
              onChange: file => {
                selectFile(file.raw)
              },
              onExceed: fileList => {
                selectFile(fileList[0])
              }
            },
            slot: 'append'
          },
          [h('ElButton', self.$t('packages_component_formBuilder_file_button'))]
        )
      ]
    )
  }
}
</script>

<style></style>
