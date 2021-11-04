<template>
  <ElForm :model="form" :rules="rules" ref="filterForm" inline class="filter-form" @submit.native.prevent>
    <ElFormItem
      v-for="(item, index) in items"
      :key="index"
      :prop="item.key"
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
        @input="search()"
      >
      </SelectList>
      <ElDatePicker
        v-else-if="item.type === 'datetime'"
        v-model="item.value"
        type="datetime"
        :placeholder="item.label"
        value-format="timestamp"
        @change="search()"
      ></ElDatePicker>
      <DatetimePicker
        v-else-if="item.type === 'datetime-range'"
        v-model="item.value"
        type="datetimerange"
        :title="item.label"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        value-format="timestamp"
        clearable
        @change="search()"
      ></DatetimePicker>
      <PopInput
        v-else-if="item.type === 'input-pop'"
        v-model="item.value"
        :title="item.label"
        placement="bottom-start"
        overflow
        dark
        width="200"
        trigger="click"
        @change="search()"
      >
      </PopInput>
      <ElInput v-else v-model="item.value" :placeholder="item.placeholder" clearable @input="search(800)">
        <VIcon slot="prefix" size="14" class="ml-1" style="height: 100% !important">search</VIcon>
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
import DatetimePicker from './DatetimePicker'
export default {
  name: 'FilterBar',
  components: { VIcon, SelectList, PopInput, DatetimePicker },
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
  mounted() {
    this.init()
  },
  methods: {
    init() {
      let { value } = this
      this.getRules()
      let form = {}
      this.items.forEach(el => {
        if (el.key === 'timerange') {
          return
        }
        if (hasOwnProperty.call(value, el.key)) {
          this.$set(el, 'value', value[el.key])
        }
        form[el.key] = el.value
      })
      this.form = form
    },
    getValue() {
      let result = {}
      this.items.forEach(el => {
        if (el.value) {
          result[el.key] = el.value
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
.el-form-item {
  &:not(.datetime) {
    ::v-deep {
      .el-form-item__content {
        //width: 180px;
      }
    }
  }
  &.none-border {
    .v-select-list {
      &:hover {
        background-color: #fafafa;
      }
      ::v-deep {
        .inner-select {
          border-color: transparent;
        }
        .inner-select__selected {
          max-width: 60px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
