<script>
import mixins from './mixin'
export default {
  name: 'FbFile',
  mixins: [mixins],
  props: {
    value: [File, String],
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
    let selectFile = file => {
      this.fileName = file.name
      self.$emit('input', file)
      self.$emit('change', file)
    }
    let fileName = this.value ? this.value.name : ''
    return h(
      'ElInput',
      {
        attrs: {
          placeholder: config.placeholder || self.$t('formBuilder.file.placeholder')
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
          [h('ElButton', self.$t('formBuilder.file.button'))]
        )
      ]
    )
  }
}
</script>

<style></style>
