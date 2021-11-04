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
      <ElSelect v-else-if="item.type === 'select'" v-model="item.value" clearable @input="search()">
        <ElOption v-for="(temp, i) in item.options" :key="i" :label="temp.label" :value="temp.value"></ElOption>
      </ElSelect>
      <SelectList
        v-else-if="item.type === 'select-inner'"
        v-model="item.value"
        :items="item.options"
        :inner-label="item.label"
        :menu-min-width="item.menuMinWidth"
        last-page-text=""
        clearable
        class="none-border"
        @input="search()"
      >
      </SelectList>
      <Datetime
        v-else-if="['datetime'].indexOf(item.type) > -1"
        v-model="item.value"
        :title="item.label"
        v-bind="item"
        clearable
        value-format="timestamp"
        @input="search()"
      ></Datetime>
      <DatetimeRange
        v-else-if="['datetimerange'].indexOf(item.type) > -1"
        v-model="item.value"
        :title="item.label"
        v-bind="item"
        clearable
        value-format="timestamp"
        @input="search()"
      ></DatetimeRange>
      <PopInput
        v-else-if="item.type === 'input-pop'"
        v-model="item.value"
        :title="item.label"
        placement="bottom-start"
        overflow
        dark
        clearable
        width="200"
        trigger="click"
        @change="search()"
      >
      </PopInput>
      <ElInput v-else v-model="item.value" :placeholder="item.placeholder" class="filter-el-input" @input="search(800)">
        <VIcon slot="suffix" size="14" class="inline-block">search</VIcon>
      </ElInput>
    </ElFormItem>
    <ElFormItem v-if="!hideRefresh">
      <ElButton plain class="btn-refresh" @click="fetch">
        <VIcon>refresh</VIcon>
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
    search() {
      this.$emit('input', this.getValue())
      this.$refs.filterForm.validate(res => {
        if (res) {
          this.$emit('search')
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
    changeDatetimeFnc(value, item) {
      console.log('changeDatetimeFnc', value, item)
    }
  }
}
</script>

<style lang="scss" scoped>
.btn-refresh {
  padding: 0;
  height: 32px;
  line-height: 32px;
  width: 32px;
  font-size: 16px;
}
.filter-form {
  font-size: 12px;
}
.filter-el-input {
  ::v-deep {
    .el-input__inner {
      &:hover {
        border-color: #d9d9d9;
      }
      &:focus,
      &:target {
        border-color: #409eff;
      }
    }
  }
}
</style>
