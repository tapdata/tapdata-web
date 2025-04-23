<script>
import { $emit, $off, $on, $once } from '../../utils/gogocodeTransfer'
export default {
  name: 'Condition',
  props: {
    fields: {
      type: Array,
      default() {
        return []
      },
    },
    fieldValue: {
      type: String,
      default() {
        return 'value'
      },
    },
    fieldLabel: {
      type: String,
      default() {
        return 'text'
      },
    },
    value: {
      type: Object,
      default() {
        return {
          field: '',
          command: '',
          value: '',
        }
      },
    },
    level: {
      type: Number,
      default() {
        return 1
      },
    },
    // showFilterDialog: {
    //   type: Boolean,
    //   default() {
    //     return {}
    //   }
    // }
  },
  emits: ['update:value'],
  data() {
    return {
      color: '',
      fieldList: [],
      model: {
        queryField: '',
        queryCommand: '',
        queryValue: '',
        smallerValue: '',
        largerValue: '',
      },
      commands: [
        { text: '=', value: 'eq' },
        { text: '!=', value: 'neq' },
        { text: '>', value: 'gt' },
        { text: '>=', value: 'gte' },
        { text: '<', value: 'lt' },
        { text: '<=', value: 'lte' },
        { text: 'Between', value: 'between' },
        { text: 'In (comma-delimited)', value: 'inq' },
        { text: 'Not In (comma-delimited)', value: 'nin' },
        { text: 'Like', value: 'like' },
        { text: 'Not Like', value: 'nlike' },
        { text: 'Regexp', value: 'regexp' },
      ],
    }
  },
  computed: {
    childLevel() {
      return this.level + 1
    },
    operator() {
      return this.value.operator
    },
    conditions() {
      return this.value.conditions
    },
    conditionCount() {
      return this.value.conditions.length
    },
    isDatetime() {
      const field = this.fields.find((v) => v.value === this.model.queryField)
      if (field) {
        const type = field.type

        if (type === 'string' && field.format === 'date-time') {
          return true
        }
      }
      return false
    },
  },
  watch: {
    // showFilterDialog: {
    //   deep: true,
    //   immediate: true,
    //   handler() {
    //     this.setValue(this.value)
    //   }
    // },
    conditions: {
      deep: true,

      handler() {
        this.filterChange()
      },
    },
    'model.queryField': {
      deep: true,

      handler() {
        this.filterChange()
      },
    },
    'model.queryCommand': {
      deep: true,

      handler() {
        this.filterChange()
      },
    },
    'model.queryValue': {
      deep: true,

      handler() {
        this.filterChange()
      },
    },
    'model.smallerValue': {
      deep: true,

      handler() {
        this.filterChange()
      },
    },
    'model.largerValue': {
      deep: true,

      handler() {
        this.filterChange()
      },
    },
  },
  created() {
    this.fieldList = this.fields
  },
  mounted() {
    this.setValue(this.value)
  },
  methods: {
    // 改变字段名称
    queryFieldChange(value) {
      if (value) {
        const item = this.fields.find((v) => v.field_name === value)
        if (item) {
          this.model.queryField = item.field_name
        } else {
          this.model.queryField = value
        }
      }
      this.model.queryCommand = ''
      this.model.queryValue = ''
    },
    addChild(type) {
      let child = {}
      if (type === 'group') {
        child = {
          type: 'group',
          operator: 'and',
          conditions: [
            {
              type: 'condition',
              field: '',
              command: 'eq',
              value: '',
            },
          ],
        }
      } else if (type === 'condition') {
        child = {
          type: 'condition',
          field: '',
          command: '',
          value: '',
        }
      }
      this.value.conditions.push(child)
      $emit(this, 'update:value', this.value)
    },
    setValue() {
      this.model.queryField = this.value.field
      this.model.queryCommand = this.value.command
      this.model.queryValue = this.value.value
    },
    // 过滤条件初始值
    filterChange() {
      const data = {
        type: 'condition',
        field: this.model.queryField,
        command: this.model.queryCommand,
        value: this.model.queryValue,
      }
      if (this.model.queryCommand === 'between') {
        const small = /^-?(?:\d+\.\d+|\d{2,})$/.test(this.model.smallerValue)
          ? Number(this.model.smallerValue)
          : this.model.smallerValue
        const larger = /^-?(?:\d+\.\d+|\d{2,})$/.test(this.model.largerValue)
          ? Number(this.model.largerValue)
          : this.model.largerValue
        data.value = [small, larger]
      } else if (['inq', 'nin'].includes(this.model.queryCommand)) {
        data.value = this.model.queryValue.split(',')
      }
      // eslint-disable-next-line
      console.log('data', data)
      $emit(this, 'update:value', data)
    },
    commandChange() {
      this.model.queryValue = ''
      this.model.smallerValue = ''
      this.model.largerValue = ''
    },
  },
}
</script>

<template>
  <!-- api过滤条件 -->
  <div class="condition-warp">
    <!-- 选择字段 -->
    <div class="condition-warp-group">
      <div class="condition-warp-group-item">
        <el-select
          v-model="model.queryField"
          style="width: 170px"
          @change="queryFieldChange"
        >
          <el-option
            v-for="field in fieldList"
            :key="field[fieldValue]"
            :label="field[fieldLabel]"
            :value="field[fieldValue]"
          />
        </el-select>

        <template v-if="model.queryField">
          <el-select
            v-model="model.queryCommand"
            style="width: 100px; padding: 0 10px"
            @change="commandChange"
          >
            <el-option
              v-for="command in commands"
              :key="command.value"
              :label="command.label"
              :value="command.value"
            />
          </el-select>
          <el-input
            v-if="model.queryCommand !== 'between' && !isDatetime"
            v-model="model.queryValue"
            :placeholder="$t('query_build_queryValue')"
            style="width: 250px; padding-right: 10px"
          />
          <el-date-picker
            v-if="model.queryCommand !== 'between' && isDatetime"
            v-model="model.queryValue"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 120px; padding-right: 10px"
          />
          <el-input
            v-if="model.queryCommand === 'between' && !isDatetime"
            v-model="model.smallerValue"
            :placeholder="$t('query_build_queryValue')"
            style="width: 125px; padding-right: 10px"
          />
          <el-input
            v-if="model.queryCommand === 'between' && !isDatetime"
            v-model="model.largerValue"
            :placeholder="$t('query_build_queryValue')"
            style="width: 125px; padding-right: 10px"
          />
          <el-date-picker
            v-if="model.queryCommand === 'between' && isDatetime"
            v-model="model.smallerValue"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 120px"
          />
          <el-date-picker
            v-if="model.queryCommand === 'between' && isDatetime"
            v-model="model.largerValue"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 160px"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.condition-warp {
  .condition-warp-group {
    // padding: 0 10px 0 24px;
    .condition-warp-group-item {
      display: flex;
      justify-content: space-between;
      width: 100%;

      .condition-warp-group-button {
        width: 70px;
      }
    }
  }
}
</style>
