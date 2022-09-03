<script>
import mixins from './mixin'
export default {
  name: 'FbSelect',
  mixins: [mixins],
  props: {
    value: [String, Number, Array],
    config: {
      require: true,
      type: Object
    }
  },
  data() {
    return {
      defaultConfig: {},
      filterList: this.config.options || []
    }
  },
  watch: {
    'config.options'(data) {
      let list = data || []
      this.filterList = list
    }
  },
  render(h) {
    let self = this
    let config = Object.assign(this.defaultConfig, self.config)
    let options = []
    if (this.filterList?.length) {
      options = this.filterList.map(opt => {
        return h('ElOption', {
          props: {
            label: opt.label,
            value: opt.value,
            disabled: opt.disabled
          },
          key: opt.key || opt.value
        })
      })
    }

    //当多选时，判断是否显示全选框
    let checkboxEl = null
    if (options.length && config.multiple && config.showAllCheckbox) {
      checkboxEl = h(
        'ElOption',
        {
          props: { value: '0', disabled: true },
          style: 'padding: 0 20px;background: #fff;cursor: default;'
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
                      this.filterList.map(opt => opt.value)
                    )
                  } else {
                    this.$emit('input', [])
                  }
                }
              }
            },
            [this.$t('packages_component_dataFlow_selectAll')]
          )
        ]
      )
    }
    const tip = self.config?.tip || ''
    let arr = [
      h('div', { class: 'fb-select' }, [
        h(
          'ElSelect',
          {
            domProps: {
              readonly: true
            },
            props: {
              value: self.value,
              placeholder: config.placeholder,
              size: config.size,
              filterable: config.filterable,
              filterMethod: config.filterable ? this.filterMethod : null,
              allowCreate: config.allowCreate,
              defaultFirstOption: config.defaultFirstOption,
              clearable: config.clearable,
              multiple: config.multiple,
              disabled: config.disabled ? config.disabled : false,
              remote: config.remote,
              remoteMethod: config.remoteMethod
            },
            on: Object.assign(this.on, {
              'visible-change'(value) {
                if (value && config.filterable) {
                  self.filterMethod('')
                }
              }
            }),
            ref: 'select'
          },
          [checkboxEl, ...options]
        ),
        h(
          'div',
          {
            class: {
              'fb-select-mask': true,
              'is-show': config.loading
            }
          },
          [h('i', { class: 'el-icon-loading' })]
        )
      ])
    ]
    if (tip) {
      arr.push(
        h('div', { class: 'fb-switch-tip' }, [
          h('i', { class: 'el-icon-info' }),
          h('span', { class: 'fb-switch-tip__text' }, tip)
        ])
      )
    }
    return h('div', { class: 'select-item' }, arr)
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
.select-item {
  position: relative;
  width: 100%;
}
.fb-select {
  position: relative;
  width: 100%;
  .el-select {
    display: block;
  }
  .fb-select-mask {
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
