<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import { plantRenderPara } from '../utils/gogocodeTransfer'
import * as Vue from 'vue'
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
  render() {
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
            i18n.global.t('packages_component_form_builder_file_shangchuanwenjianda', {
              val1: config.maxFileSize
            })
          )
        } else {
          let reader = new FileReader()
          let emitInput = val => {
            value = {
              name: file.name,
              value: config.base64 ? val.split(',')[1] : val
            }
            $emit(self, 'update:value', value)
            $emit(self, 'change', value)
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
        $emit(self, 'update:value', value)
        $emit(self, 'change', value)
      }
    }
    fileName = Object.prototype.toString.call(fileName) === '[object Object]' ? '' : fileName
    return Vue.h(
      'ElInput',
      plantRenderPara({
        attrs: {
          placeholder: config.placeholder || self.$t('packages_component_formBuilder_file_placeholder')
        },
        props: {
          value: fileName,
          clearable: config.clearable
        },
        on: {
          clear() {
            $emit(self, 'update:value', null)
            $emit(self, 'change', null)
          }
        }
      }),
      [
        Vue.h(
          'ElUpload',
          plantRenderPara({
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
          }),
          [Vue.h('ElButton', self.$t('packages_component_formBuilder_file_button'))]
        )
      ]
    )
  },
  emits: ['update:value', 'change']
}
</script>
