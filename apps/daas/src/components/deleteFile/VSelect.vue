<script>
export default {
  name: 'VSelect',
  props: {
    value: [String, Number, Array],
    options: { type: Array, default: () => [] },
    loading: Boolean,
    config: {
      require: true,
      type: Object
    }
  },
  data() {
    return {}
  },

  render(h) {
    let self = this
    let config = { ...this.config }
    let options = this.options.map(opt => {
      return h('ElOption', {
        props: {
          label: opt.label,
          value: opt.value,
          disabled: opt.disabled
        },
        key: opt.key || opt.value
      })
    })
    //当多选时，判断是否显示全选框
    let checkboxEl = null
    if (options.length && config.multiple && config.showAllCheckbox) {
      checkboxEl = h(
        'ElOption',
        {
          props: { value: '0', disabled: true },
          style: 'padding: 0 20px;background-color: map-get($bgColor, white);cursor: default;'
        },
        [
          h(
            'ElCheckbox',
            {
              props: { value: this.value.length === this.filterList.length },
              on: {
                input: val => {
                  if (val) {
                    this.$emit(
                      'input',
                      this.options.map(opt => opt.value)
                    )
                  } else {
                    this.$emit('input', [])
                  }
                }
              }
            },
            [this.$t('dataFlow_selectAll')]
          )
        ]
      )
    }
    return h('div', { class: 'v-select' }, [
      h(
        'ElSelect',
        {
          domProps: {
            readonly: true
          },
          props: {
            value: this.value,
            placeholder: config.placeholder,
            size: config.size,
            filterable: config.filterable,
            filterMethod: config.filterable ? this.filterMethod : null,
            allowCreate: config.allowCreate,
            defaultFirstOption: config.defaultFirstOption,
            clearable: config.clearable,
            multiple: config.multiple,
            disabled: config.disabled ? config.disabled : false
          },
          on: {
            ...this.$listeners,
            'visible-change'(value) {
              if (value && config.filterable) {
                self.filterMethod('')
              }
            }
          },
          ref: 'select'
        },
        [checkboxEl, ...options]
      ),
      h(
        'div',
        {
          class: {
            'v-select-mask': true,
            'is-show': this.loading
          }
        },
        [h('i', { class: 'el-icon-loading' })]
      )
    ])
  },
  methods: {
    filterMethod(keyword = '') {
      keyword = keyword.toLowerCase()
      let reg = new RegExp(keyword, 'ig')
      this.filterList = this.config.options
        .filter(d => d.label.match(reg))
        .sort((a, b) => {
          if (a.label.toLowerCase() === keyword) {
            return -1
          } else if (b.label.toLowerCase() === keyword) {
            return 1
          } else {
            return a.label <= b.label ? -1 : 1
          }
        })
    }
  }
}
</script>

<style lang="scss">
.v-select {
  position: relative;
  display: inline-block;
  width: 100%;
  .el-select {
    display: block;
  }
  .v-select-mask {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: none;
    text-align: right;
    padding-right: 30px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.1);
    &.is-show {
      display: block;
    }
  }
}
</style>
