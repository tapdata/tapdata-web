<template>
  <ElForm :model="form" :rules="rules" ref="filterForm" inline class="filter-form" @submit.native.prevent>
    <ElFormItem
      v-for="(item, index) in items"
      :key="index"
      :prop="item.key + ''"
      :label="showItemLabel(item)"
      :class="[item.class, item.type]"
    >
      <template v-if="item.slotName" v-slot="scope">
        <slot :name="item.slotName" :row="scope.row"></slot>
      </template>
      <component
        v-else
        v-bind="getOptions(item)"
        v-model="item.value"
        :is="getComponent(item.type)"
        :style="getStyle(item)"
        @input="search(item)"
        @clear="fetch()"
      >
        <VIcon slot="suffix" size="14" class="inline-block">{{ item.icon }}</VIcon>
      </component>
    </ElFormItem>
    <ElFormItem v-if="!hideRefresh">
      <ElButton plain class="btn-refresh" @click="fetch">
        <VIcon class="text-primary">refresh</VIcon>
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>

<script>
import VIcon from '@/components/VIcon'
import SelectList from '@/components/SelectList'
import PopInput from './PopInput'
import DatetimeRange from './DatetimeRange'
import Datetime from './Datetime'

export default {
  name: 'FilterBar',
  components: { VIcon, SelectList, PopInput, DatetimeRange, Datetime },
  props: {
    value: {
      type: Object,
      default: () => {}
    },
    items: {
      type: Array,
      default: () => []
      /**参考src/views/operation-log/List.vue:184
       * 1.支持表单的rules
       * 格式 rules: () => { let flag = false;//false表示没有错误 if (可取this.searchParams的值做条件) { flag = '报错信息' } return flag }
       */
    },
    hideRefresh: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {},
      rules: {}
    }
  },
  watch: {
    value: {
      deep: true,
      handler(v) {
        v && this.init()
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      let { value } = this
      this.getRules()
      let form = {}
      this.items.forEach(el => {
        if (hasOwnProperty.call(value, el.key)) {
          this.$set(el, 'value', value[el.key])
        }
        if (el.type === 'datetimerange') {
          if (el.key.indexOf(',') > -1) {
            let result = []
            el.key.split(',').forEach(k => {
              form[k] = value?.[k]
              result.push(form[k])
            })
            form[el.key] = result
            this.$set(el, 'value', form[el.key])
          } else {
            form[el.key] = el.value
          }
        } else {
          form[el.key] = el.value
        }
      })
      this.form = form
    },
    getValue() {
      let result = {}
      this.items.forEach(el => {
        if (el.value) {
          if (el.type === 'datetimerange') {
            if (el.key.indexOf(',') > -1) {
              el.key.split(',').forEach((k, i) => {
                result[k] = el.value[i]
              })
            }
          } else if (el.type === 'input') {
            let value = el.value?.trim() || ''
            result[el.key] = value
          } else {
            result[el.key] = el.value
          }
        }
      })
      return result
    },
    getRules() {
      let result = {}
      this.items.forEach(el => {
        if (el.rules) {
          if (typeof el.rules === 'function') {
            result[el.key] = [
              {
                validator: (rule, value, callback) => {
                  let result = el.rules?.()
                  if (result) {
                    callback(new Error(result))
                  } else {
                    callback()
                  }
                }
              }
            ]
          } else {
            result[el.key] = el.rules
          }
        }
      })
      this.rules = result
    },
    search(item) {
      this.$refs.filterForm.validate(res => {
        if (res) {
          const { delayTrigger } = this.$util
          delayTrigger(() => {
            this.$emit('input', this.getValue())
            this.$router.replace({
              name: this.$route.name,
              query: this.getValue()
            })
          }, item.debounce)
        }
      })
    },
    fetch() {
      this.$emit('input', this.getValue())
      this.$refs.filterForm.validate(res => {
        if (res) {
          this.$emit('fetch')
        }
      })
    },
    showItemLabel(item) {
      if (item.outerLabel) {
        return item.label
      }
    },
    // 匹配组件
    getComponent(type) {
      let obj = {
        select: 'SelectList',
        'select-inner': 'SelectList',
        datetime: 'Datetime',
        datetimerange: 'DatetimeRange',
        'input-pop': 'PopInput',
        input: 'ElInput'
      }
      return obj[type] || obj['input']
    },
    getStyle(item) {
      let obj = {}
      // { width: item.width }
      switch (item.type) {
        case 'input':
          this.setDefaultValue(obj, 'width', '200px')
          break
      }
      return obj
    },
    // 默认设置
    getOptions(item) {
      switch (item.type) {
        case 'select-inner':
          this.setDefaultValue(item, 'inner-label', item.label)
          this.setDefaultValue(item, 'last-page-text', '')
          this.setDefaultValue(item, 'none-border', true)
          break
        case 'input':
          this.setDefaultValue(item, 'debounce', 800)
          this.setDefaultValue(item, 'suffix-icon', 'search')
          this.setDefaultValue(item, 'class', 'filter-el-input')
          break
        case 'input-pop':
          this.setDefaultValue(item, 'placement', 'bottom-start')
          this.setDefaultValue(item, 'trigger', 'click')
          this.setDefaultValue(item, 'width', '200')
          this.setDefaultValue(item, 'overflow', true)
          this.setDefaultValue(item, 'dark', true)
          break
        case 'datetimerange':
        case 'datetime':
          this.setDefaultValue(item, 'value-format', 'timestamp')
          break
        default:
          break
      }
      this.setDefaultValue(item, 'clearable', true)
      return item
    },
    setDefaultValue(item, key, val) {
      if (!hasOwnProperty.call(item, key)) {
        item[key] = val
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 0;
  margin-right: 8px;
}
.btn-refresh {
  padding: 0;
  height: 32px;
  line-height: 32px;
  width: 32px;
  min-width: 32px;
  font-size: 16px;
  &:hover,
  &.is-plain:focus:hover {
    border-color: #2c65ff;
    background-color: #f5f6f7;
  }
}
.filter-form {
  font-size: 12px;
  ::v-deep {
    .el-form-item__content {
      font-size: 12px;
      .el-input {
        font-size: 12px;
      }
    }
  }
}
.filter-el-input {
  ::v-deep {
    .el-input__inner {
      &:hover {
        border-color: #d9d9d9;
      }
      &:focus,
      &:target {
        border-color: map-get($color, primary);
      }
    }
  }
}
</style>
