<template>
  <!-- api过滤条件 -->
  <div class="condition-warp">
    <!-- 选择字段 -->
    <div class="condition-warp-group">
      <div class="condition-warp-group-item">
        <el-select v-model="model.queryField" size="mini" @change="queryFieldChange" style="width: 170px">
          <el-option
            v-for="field in fieldList"
            :label="field[fieldLabel]"
            :value="field[fieldValue]"
            :key="field[fieldValue]"
          ></el-option>
        </el-select>

        <template v-if="model.queryField">
          <el-select
            v-model="model.queryCommand"
            @change="commandChange"
            size="mini"
            style="width: 100px; padding: 0 10px"
          >
            <el-option
              v-for="command in commands"
              :label="command.label"
              :value="command.value"
              :key="command.value"
            ></el-option>
          </el-select>
          <el-input
            v-model="model.queryValue"
            v-if="model.queryCommand !== 'between' && !isDatetime"
            :placeholder="$t('query_build_queryValue')"
            size="mini"
            style="width: 250px; padding-right: 10px"
          ></el-input>
          <el-date-picker
            v-model="model.queryValue"
            v-if="model.queryCommand !== 'between' && isDatetime"
            type="datetime"
            format="yyyy-MM-dd HH:mm:ss"
            size="mini"
            style="width: 120px; padding-right: 10px"
          >
          </el-date-picker>
          <el-input
            v-model="model.smallerValue"
            :placeholder="$t('query_build_queryValue')"
            size="mini"
            v-if="model.queryCommand === 'between' && !isDatetime"
            style="width: 125px; padding-right: 10px"
          ></el-input>
          <el-input
            v-model="model.largerValue"
            v-if="model.queryCommand === 'between' && !isDatetime"
            :placeholder="$t('query_build_queryValue')"
            size="mini"
            style="width: 125px; padding-right: 10px"
          ></el-input>
          <el-date-picker
            v-model="model.smallerValue"
            v-if="model.queryCommand === 'between' && isDatetime"
            type="datetime"
            format="yyyy-MM-dd HH:mm:ss"
            size="mini"
            style="width: 120px"
          >
          </el-date-picker>
          <el-date-picker
            v-model="model.largerValue"
            v-if="model.queryCommand === 'between' && isDatetime"
            type="datetime"
            format="yyyy-MM-dd HH:mm:ss"
            size="mini"
            style="width: 160px"
          >
          </el-date-picker>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
export default {
  name: 'Condition',
  props: {
    fields: {
      type: Array,
      default() {
        return []
      }
    },
    fieldValue: {
      type: String,
      default() {
        return 'value'
      }
    },
    fieldLabel: {
      type: String,
      default() {
        return 'text'
      }
    },
    value: {
      type: Object,
      default() {
        return {
          field: '',
          command: '',
          value: ''
        }
      }
    },
    level: {
      type: Number,
      default() {
        return 1
      }
    }
    // showFilterDialog: {
    //   type: Boolean,
    //   default() {
    //     return {}
    //   }
    // }
  },
  data() {
    return {
      color: '',
      fieldList: [],
      model: {
        queryField: '',
        queryCommand: '',
        queryValue: '',
        smallerValue: '',
        largerValue: ''
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
        { text: 'Regexp', value: 'regexp' }
      ]
    }
  },
  created() {
    this.fieldList = this.fields
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
      }
    },
    'model.queryField': {
      deep: true,

      handler() {
        this.filterChange()
      }
    },
    'model.queryCommand': {
      deep: true,

      handler() {
        this.filterChange()
      }
    },
    'model.queryValue': {
      deep: true,

      handler() {
        this.filterChange()
      }
    },
    'model.smallerValue': {
      deep: true,

      handler() {
        this.filterChange()
      }
    },
    'model.largerValue': {
      deep: true,

      handler() {
        this.filterChange()
      }
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
      let field = this.fields.filter(v => v.value === this.model.queryField)[0]
      if (field) {
        let type = field.type

        if (type === 'string' && field.format === 'date-time') {
          return true
        }
      }
      return false
    }
  },
  mounted() {
    this.setValue(this.value)
  },
  methods: {
    // 改变字段名称
    queryFieldChange(value) {
      if (value) {
        let item = this.fields.find(v => v.field_name === value)
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
              value: ''
            }
          ]
        }
      } else if (type === 'condition') {
        child = {
          type: 'condition',
          field: '',
          command: '',
          value: ''
        }
      }
      this.value.conditions.push(child)
      $emit(this, 'update:value', this.value)
    },
    setValue() {
      this.model['queryField'] = this.value.field
      this.model['queryCommand'] = this.value.command
      this.model['queryValue'] = this.value.value
    },
    // 过滤条件初始值
    filterChange() {
      let data = {
        type: 'condition',
        field: this.model.queryField,
        command: this.model.queryCommand,
        value: this.model.queryValue
      }
      if (this.model.queryCommand === 'between') {
        let small = /^-?\d+\.?\d+$/.test(this.model.smallerValue)
          ? Number(this.model.smallerValue)
          : this.model.smallerValue
        let larger = /^-?\d+\.?\d+$/.test(this.model.largerValue)
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
    }
  },
  emits: ['update:value']
}
</script>

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
