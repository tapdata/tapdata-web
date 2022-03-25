<template>
  <!-- api过滤条件 -->
  <div class="query-build-wrap">
    <ConditionGroup
      :field-label="fieldLabel"
      :field-value="fieldValue"
      :fields="fields"
      v-model="root"
      :level="1"
      :max-level="maxLevel"
    ></ConditionGroup>
    <div class="query-build-show-filter">
      <el-collapse accordion>
        <el-collapse-item class="query-build-pre" :title="$t('query_build_show_filter')" name="1">
          <pre>{{ value }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- :showFilterDialog="showFilterDialog" -->
  </div>
</template>
<script>
import ConditionGroup from './ConditionGroup'
const command = ['eq', 'gt', 'gte', 'lt', 'lte', /*'between',*/ 'inq', 'nin', 'near', 'neq', 'like', 'nlike', 'regexp']
export default {
  name: 'QueryBuild',
  components: { ConditionGroup },
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
        return []
      }
    },
    maxLevel: {
      type: Number,
      default: 3
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
      root: {
        type: 'group',
        operator: 'and',
        conditions: []
      }
    }
  },
  watch: {
    root: {
      immediate: true,
      deep: true,
      handler() {
        let condition = this.flat(this.root)
        // eslint-disable-next-line
        console.log('root', this.root)
        this.$emit('input', condition)
      }
    },
    value: {
      deep: true,
      immediate: true,
      handler() {}
    }
    // showFilterDialog: {
    //   deep: true,
    //   immediate: true,
    //   handler() {
    //     let condition = this.flat(this.root)
    //     this.$emit('input', condition)
    //   }
    // }
  },

  mounted() {
    this.setCondition(this.value)
  },
  methods: {
    setCondition(condition) {
      // eslint-disable-next-line
      console.log('setCondition', condition)
      let result = this.standard(condition) || []

      if (result.length === 1 && result[0].type === 'group') {
        this.root = result[0]
      } else {
        this.root.conditions = result
      }
      if (this.root.conditions.length === 0) {
        this.root.conditions.push({
          type: 'condition',
          field: '',
          command: '',
          value: ''
        })
      }
    },
    standard(condition) {
      let conditions = []
      // if (Object.prototype.toString.call(condition) === '[object Array]') {

      // } else
      if (typeof condition === 'object') {
        let keys = Object.keys(condition)
        keys.forEach(key => {
          let value = condition[key]
          if (['and', 'or'].indexOf(key) >= 0) {
            let group = {
              type: 'group',
              operator: key,
              conditions: []
            }
            value.forEach(c => {
              if (Object.keys(c).length > 1) {
                group.conditions.push({
                  type: 'group',
                  operator: 'and',
                  conditions: this.standard(c)
                })
              } else {
                group.conditions = group.conditions.concat(this.standard(c))
              }
            })
            conditions.push(group)
          } else if (typeof value === 'object' && Object.keys(value).length >= 1) {
            Object.keys(value).forEach(v => {
              if (command.indexOf(v)) {
                conditions.push({
                  type: 'condition',
                  field: key,
                  command: v,
                  value: value[v]
                })
              }
            })
          } else {
            conditions.push({
              type: 'condition',
              field: key,
              command: 'eq',
              value: value
            })
          }
        })
      }
      return conditions
    },
    // 过滤数据处理
    flat(condition) {
      if (condition && condition.type === 'group') {
        if (condition.operator === 'and') {
          let result = {}
          // let groupCount = condition.conditions.filter(v => v.type === 'group')
          condition.conditions.forEach(v => {
            let _flat = this.flat(v)
            if (_flat) {
              result.and = result.and || []
              result.and.push(_flat)
            }
          })
          return result
        } else if (condition.operator === 'or') {
          let result = {
            or: []
          }
          condition.conditions.forEach(v => {
            let _flat = this.flat(v)
            if (_flat) result.or.push(_flat)
          })
          return result
        }
      } else if (condition.type === 'condition' && condition.field) {
        if (condition.command === 'eq') {
          return {
            ['' + condition.field + '']: condition.value
          }
        } else {
          return {
            ['' + condition.field + '']: {
              ['' + condition.command + '']: condition.value
            }
          }
        }
      } else {
        return null
      }
    },
    serializationToRestFilter(key, val) {
      if (typeof val === 'object') {
        if (Array.isArray(val)) {
          let result = []
          for (let i = 0; i < val.length; i++) result.push(this.serializationToRestFilter(`${key}[${i}]`, val[i]))
          return result.join('&')
        } else {
          let result = []
          for (let name in val) {
            if (name && val.hasOwnProperty(name)) {
              let temp = this.serializationToRestFilter(`${key}[${name}]`, val[name])
              if (temp) result.push(temp)
            }
          }
          return result.join('&')
        }
      } else {
        return `${key}=${typeof val === 'string' ? val.trim() : val}`
      }
    }
  }
}
</script>
<style scoped lang="scss">
.query-build-wrap {
  .query-build-show-filter {
    max-height: 500px;
    overflow-y: auto;
    pre {
      line-height: 20px;
    }
    ::v-deep {
      .el-collapse {
        border: 0;
        .el-collapse-item:last-child {
          margin-bottom: 0;
        }
      }
      .el-collapse-item__header {
        padding-bottom: 5px;
        border-bottom: 0;
        color: #2c65ff;
        font-size: 12px;
        .el-collapse-item__arrow {
          margin-left: 6px;
          transform: rotate(90deg);
        }
        .el-collapse-item__arrow.is-active {
          transform: rotate(270deg);
        }
      }
      .el-collapse-item__wrap {
        margin-bottom: 30px;
        padding: 15px;
        border-bottom: 0;
        background-color: #3a3d4c;
        .el-collapse-item__content {
          padding: 15px;
          color: #82b290;
          background: #262838;
        }
      }
    }
  }
}
.condition-group.level1 {
  border-left-color: #00c7ff;
}
.condition-group.level2 {
  border-left-color: #a463f2;
}
.condition-group.level3 {
  border-left-color: #ffb700;
}
.condition-group.level4 {
  border-left-color: #818182;
}
.condition-group.level5 {
  border-left-color: #3ae698;
}
.condition-group.level6 {
  border-left-color: #000000;
}
.condition-group.level7 {
  border-left-color: #e7040f;
}
</style>
