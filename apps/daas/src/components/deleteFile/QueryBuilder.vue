<template>
  <div class="e-qb">
    <el-tabs type="border-card" v-model="value.filterType">
      <el-tab-pane name="field" :disabled="disabled">
        <span slot="label"> {{ $t('editor.cell.data_node.collection.form.filter.fieldFilter') }}</span>
        <el-form-item
          v-if="!value.noFieldFilter"
          :placeholder="$t('editor.cell.data_node.collection.form.filter.allField')"
        >
          <el-select v-model="value.fieldFilterType" size="mini">
            <el-option
              v-for="item in filterTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="value.fieldFilterType !== 'keepAllFields'"
          :placeholder="
            value.fieldFilterType === 'retainedField'
              ? $t('editor.cell.data_node.collection.form.fieldFilter.placeholderKeep')
              : $t('editor.cell.data_node.collection.form.fieldFilter.placeholderDelete')
          "
        >
          <el-select
            size="mini"
            v-model="value.selectedFields"
            multiple
            filterable
            default-first-option
            @change="handleFilterChange()"
          >
            <el-option v-for="opt in primaryKeyOptions" :key="opt" :label="opt" :value="opt"> </el-option>
          </el-select>
        </el-form-item>
        <div class="fiflter">
          <div v-if="!value.noLineLimit" class="rowSlot">
            <span slot="prepend">{{ $t('editor.cell.data_node.collection.form.filter.rowLimit') }}</span>
            <el-select v-model="value.limitLines" size="mini" class="e-select">
              <el-option
                v-for="item in rowNumberList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </div>
          <el-row v-if="databaseType == 'mongodb' && value.conditions.length == 0">
            <el-button plain class="el-button--small" size="mini" @click="addCond('group', 'and')">+ and()</el-button>
            <el-button plain class="el-button--small" size="mini" @click="addCond('group', 'or')">+ or()</el-button>
          </el-row>
          <el-row v-if="databaseType != 'mongodb' && value.conditions.length == 0">
            <el-button plain class="el-button--small" size="mini" @click="addCond('cond')"
              >+{{ $t('queryBuilder.addCond') }}</el-button
            >
            <el-button plain class="el-button--small" size="mini" @click="addCond('group')"
              >+({{ $t('queryBuilder.addCond') }})</el-button
            >
          </el-row>
          <el-row v-if="databaseType != 'mongodb' && value.conditions.length > 0" style="padding-bottom: 10px">
            <el-button plain class="el-button--small" size="mini" @click="addCond('cond', 'and')">+ and</el-button>
            <el-button plain class="el-button--small" size="mini" @click="addCond('cond', 'or')">+ or</el-button>
            <el-button plain class="el-button--small" size="mini" @click="addCond('group', 'and')">+ and()</el-button>
            <el-button plain class="el-button--small" size="mini" @click="addCond('group', 'or')">+ or()</el-button>
          </el-row>
          <queryCond
            v-if="value.conditions.length > 0"
            :level="0"
            :databaseType="databaseType"
            :primaryKeyOptions="primaryKeyOptions"
            v-model="value"
          ></queryCond>
          <el-row class="selectSql">
            <div>{{ value.cSql }}</div>
          </el-row>
        </div>
      </el-tab-pane>
      <el-tab-pane name="sql" :disabled="disabled">
        <span v-if="databaseType != 'mongodb'" slot="label">
          {{ $t('editor.cell.data_node.collection.form.filter.sqlFilter') }}</span
        >
        <span v-if="databaseType == 'mongodb'" slot="label">
          {{ $t('editor.cell.data_node.collection.form.filter.mqlFilter') }}</span
        >
        <el-form-item prop="sql">
          <el-input
            type="textarea"
            rows="10"
            v-model="value.editSql"
            :placeholder="
              databaseType == 'mongodb'
                ? $t('editor.cell.data_node.table.form.custom_sql.mplaceholder')
                : $t('editor.cell.data_node.table.form.custom_sql.placeholder')
            "
            size="mini"
          ></el-input>
        </el-form-item>

        <el-form-item
          v-if="databaseType != 'mongodb'"
          :label="$t('editor.cell.data_node.table.form.initial_offset.label')"
        >
          <el-input
            :value="initialOffset"
            @input="$emit('update:initialOffset', $event)"
            :placeholder="$t('editor.cell.data_node.table.form.initial_offset.placeholder')"
            size="mini"
          ></el-input>
        </el-form-item>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import queryCond from './QueryCond'

//index as id
'=', '<>', '>', '<', '>=', '<=', 'like'
const mongoCommand = ['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'like']
const calculationList = ['=', '<>', '>', '<', '>=', '<=', 'like']
export default {
  components: { queryCond },
  props: {
    custFields: {
      type: Array,
      default() {
        return []
      }
    },
    primaryKeyOptions: {
      type: Array,
      default() {
        return []
      }
    },
    mergedSchema: {
      type: Object,
      default() {
        return {}
      }
    },
    value: {
      type: Object,
      default() {
        return {}
      }
    },
    initialOffset: {
      type: String,
      default() {
        return ''
      }
    },
    databaseType: {
      type: String,
      default() {
        return ''
      }
    },
    tableName: {
      type: String,
      default() {
        return ''
      }
    },
    disabled: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      isFilter: false,
      sqlFromCust: true,
      sqlNotFromCust: false,
      sqlWhere: '',
      filterTypeOptions: [
        {
          label: this.$t('editor.cell.data_node.collection.form.filter.allField'),
          value: 'keepAllFields'
        },
        {
          label: this.$t('editor.cell.data_node.collection.form.fieldFilterType.retainedField'),
          value: 'retainedField'
        },
        {
          label: this.$t('editor.cell.data_node.collection.form.fieldFilterType.deleteField'),
          value: 'deleteField'
        }
      ],
      rowNumberList: [
        {
          label: this.$t('editor.cell.data_node.collection.form.filter.allRows'),
          value: 'all'
        },
        {
          label: this.$t('editor.cell.data_node.collection.form.filter.oneThousandRows'),
          value: 1000
        },
        {
          label: this.$t('editor.cell.data_node.collection.form.filter.tenThousandRows'),
          value: 10000
        }
      ]
    }
  },
  watch: {
    value: {
      deep: true,
      handler() {
        this.$emit('input', this.value)
        if (this.databaseType != 'mongodb') {
          this.sqlWhere = this.toSqlWhere(this.value.conditions)
          this.createCustSql()
        } else {
          this.createMongoFilter()
        }
      }
    }
  },
  methods: {
    handleFilterChange() {
      this.$nextTick(() => {
        this.createCustSql()
      })
    },
    addCond(type, op) {
      let child = {}
      if (type === 'group') {
        child = {
          type: 'group',
          operator: op || '',
          conditions: [
            {
              type: 'condition',
              field: '',
              command: '',
              value: ''
            }
          ]
        }
      } else {
        child = {
          type: 'condition',
          field: '',
          operator: op || '',
          command: '',
          value: ''
        }
      }
      this.value.conditions.push(child)
    },
    createCustSql() {
      let res = 'SELECT ',
        custSql = this.value
      if (!this.sqlWhere) this.sqlWhere = ''
      while (this.custFields.length > 0) this.custFields.pop()
      if (this.value.selectedFields.length > 0 && custSql.fieldFilterType == 'retainedField')
        this.value.selectedFields.forEach(it => this.custFields.push(it))
      else if (this.value.selectedFields.length > 0 && custSql.fieldFilterType == 'deleteField') {
        this.primaryKeyOptions
          .filter(it => !this.value.selectedFields.includes(it))
          .forEach(it => this.custFields.push(it))
      }

      if (this.custFields.length > 0 && this.custFields.length != this.primaryKeyOptions.length)
        res += this.custFields.join(',')
      else res += '* '
      res += ' FROM ' + this.tableName + ' '
      if (
        (this.sqlWhere && this.sqlWhere.length > 0) ||
        (custSql.limitLines && custSql.limitLines != 'all' && this.databaseType == 'oracle')
      )
        res += ' WHERE '
      res += this.sqlWhere
      if (custSql.limitLines && custSql.limitLines != 'all') {
        if (this.databaseType == 'mysql') res += ' limit ' + custSql.limitLines
        if (this.databaseType == 'sqlserver') res = res.replace('SELECT ', 'SELECT top ' + custSql.limitLines + ' ')
        if (this.databaseType == 'oracle') {
          if (res.indexOf('WHERE ') < res.length - 6) res += ' AND '
          res += ' ROWNUM < ' + custSql.limitLines
        }
        if (this.databaseType == 'db2') res += '  fetch first ' + custSql.limitLines + ' rows only'
      }
      this.value.cSql = res
    },
    setSqlFrom(name) {
      if (name == 'no') this.sqlFromCust = !this.sqlNotFromCust
      else this.sqlNotFromCust = !this.sqlFromCust
    },

    setCondition(condition) {
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
    toSqlWhere(conditions) {
      if (!this.mergedSchema) return
      let res = ''
      conditions.forEach(cond => {
        if (cond.field || cond.type == 'group') {
          if (cond.type == 'group') res += ' ' + cond.operator + ' (' + this.toSqlWhere(cond.conditions) + ')'
          else {
            let quota = ['String', 'Date'].includes(
                this.mergedSchema.fields.find(it => it.field_name == cond.field).javaType
              )
                ? "'"
                : '',
              percent = cond.command == 'like' ? '%' : ''
            if (quota == '' && percent == '%') quota = "'"
            if (res.length > 1) res += ' ' + cond.operator + ' '
            res += cond.field + ' ' + cond.command + ' ' + quota + percent + cond.value + percent + quota
          }
        }
      })
      return res
    },
    createMongoFilter() {
      let cSql = ''
      cSql += JSON.stringify(this.flat(this.value.conditions[0]))
      this.value.cSql = cSql
    },
    flat(condition) {
      if (!condition) return ''
      if (condition && condition.type === 'group') {
        if (condition.operator === 'and') {
          let result = { $and: [] }
          condition.conditions.forEach(v => {
            let _flat = this.flat(v)
            if (_flat) result.$and.push(_flat)
          })
          return result
        } else if (condition.operator === 'or') {
          let result = { $or: [] }
          condition.conditions.forEach(v => {
            let _flat = this.flat(v)
            if (_flat) result.$or.push(_flat)
          })
          return result
        }
      } else if (condition.type === 'condition' && condition.field) {
        let val = condition.value
        if (
          !['String', 'Date'].includes(this.mergedSchema.fields.find(it => it.field_name == condition.field).javaType)
        )
          val = parseFloat(val)
        if (condition.command === 'eq') {
          return {
            ['' + condition.field + '']: val
          }
        } else if (condition.command === 'like') {
          return {
            ['' + condition.field + '']: {
              ['$regex']: val
            }
          }
        } else {
          return {
            ['' + condition.field + '']: {
              ['$' + mongoCommand[calculationList.indexOf(condition.command)] + '']: val
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
            if (name && Object.hasOwnProperty.call(val, name)) {
              let temp = this.serializationToRestFilter(`${key}[${name}]`, val[name])
              if (temp) result.push(temp)
            }
          }
          return result.join('&')
        }
      } else {
        return `${key}=${typeof val === 'string' ? val.trim() : val}`
      }
    },
    sqlTabChanged(tab) {
      if (tab.index == '1') {
        this.sqlFromCust = false
        this.sqlNotFromCust = true
      } else {
        this.sqlFromCust = true
        this.sqlNotFromCust = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.e-qb {
  .e-entity-wrap {
    flex: 1;
    overflow: auto;
  }
  .flex-block {
    display: flex;
    align-items: center;
  }
  .fiflter {
    font-size: 12px;
    box-sizing: border-box;
    .rowSlot {
      display: inline-block;
      margin-bottom: 12px;
      border: 1px solid map-get($borderColor, light);
      border-radius: 4px;
      box-sizing: border-box;
      span {
        float: left;
        display: inline-block;
        height: 28px;
        width: 80px;
        line-height: 28px;
        text-align: center;
        font-size: 12px;
        background-color: map-get($bgColor, disable);
      }
      .e-select {
        width: 160px;
      }
    }
    .e-row {
      padding-bottom: 5px;
      .btn {
        width: 84px;
        height: 28px;
        line-height: 27px;
        border: 1px solid map-get($borderColor, light);
        border-radius: 4px;
        box-sizing: border-box;
        span {
          float: left;
          display: inline-block;
          text-align: center;
          color: map-get($fontColor, slight);
          font-size: 12px;
          cursor: pointer;
          box-sizing: border-box;
        }
        span:first-child {
          width: 40px;
        }
        span:last-child {
          width: 42px;
          border-left: 1px solid map-get($borderColor, light);
        }
        span:hover {
          background-color: map-get($bgColor, hover);
        }
      }
    }
    .selectSql {
      padding-top: 10px;
      font-size: 12px;
      color: map-get($fontColor, slight);
      overflow: hidden;
      div {
        width: 100%;
      }
    }
  }
}
</style>
<style lang="scss">
.e-qb {
  .el-select {
    width: 100%;
  }
  .el-form-item__label {
    line-height: 28px;
  }
  .fiflter {
    .e-select .el-input--mini .el-input__inner {
      border: 0;
      font-size: 12px !important;
    }
  }
  .el-tabs__item,
  .el-input__inner {
    font-size: 12px !important;
  }
  .el-switch__label * {
    font-size: 12px !important;
    color: map-get($fontColor, slight);
  }
}
</style>
