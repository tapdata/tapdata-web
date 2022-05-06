<template>
  <div style="" :class="color">
    <div v-for="(cond, idx) in value.conditions" :key="idx">
      <span
        v-if="
          (cond.type == 'group' && cond.conditions.length > 0 && cond.operator && cond.operator.length > 0) ||
          (cond.type != 'group' && cond.operator && cond.operator.length > 0)
        "
        class="cond-operator"
        >{{ cond.operator }}</span
      >
      <queryCond
        v-if="cond.type == 'group'"
        :primaryKeyOptions="primaryKeyOptions"
        :databaseType="databaseType"
        v-model="value.conditions[idx]"
        @remove="removeChild(idx)"
      ></queryCond>
      <div v-if="cond.type != 'group'" class="item">
        <div class="field">
          <el-select v-model="cond.field" filterable size="mini" placeholder="select field">
            <el-option v-for="item in primaryKeyOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </div>
        <div class="field">
          <el-select v-model="cond.command" size="mini" placeholder="select op">
            <el-option v-for="item in calculationList" :label="item" :value="item" :key="item"></el-option>
          </el-select>
        </div>

        <div class="field">
          <el-input
            placeholder="enter value"
            v-if="!cond.isDatetime"
            type="text"
            v-model="cond.value"
            size="mini"
          ></el-input>
          <el-date-picker
            v-if="cond.isDatetime"
            v-model="cond.value"
            type="datetime"
            placeholder="选择日期时间"
          ></el-date-picker>
        </div>

        <div class="field">
          <div class="btn" style="width: 52px">
            <span class="el-icon-close" @click="removeChild(idx)" style="width: 24px"></span>
            <el-dropdown size="mini" @command="handleCommand">
              <span class="el-dropdown-link el-icon-plus"></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="databaseType != 'mongodb'" command="and">+ and</el-dropdown-item>
                <el-dropdown-item v-if="databaseType != 'mongodb'" command="or">+ or</el-dropdown-item>
                <el-dropdown-item v-if="databaseType == 'mongodb'" command="cond"> + </el-dropdown-item>
                <el-dropdown-item command="andQ">+ and()</el-dropdown-item>
                <el-dropdown-item command="orQ">+ or()</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
      <!-- <div>{{ cond.condStr }}</div> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'queryCond',
  props: {
    primaryKeyOptions: {
      type: Array,
      default() {
        return []
      }
    },
    value: {
      type: Object,
      default() {
        return { conditions: [] }
      }
    },
    databaseType: {
      type: String
    },
    level: {
      type: Number,
      default() {
        return 1
      }
    }
  },
  computed: {
    conditions() {
      return this.value.conditions
    },
    isDatetime() {
      let field = this.fields.filter(v => v.value === this.queryField)[0]
      if (field) {
        let type = field.type

        if (type === 'string' && field.format === 'date-time') {
          return true
        }
      }
      return false
    }
  },
  data() {
    return {
      calculationList: ['=', '<>', '>', '<', '>=', '<=', 'like'],
      color: 'level1'
    }
  },
  mounted() {
    this.color = 'level' + ((this.level % 7) + 1)
  },
  watch: {
    value: {
      deep: true,
      handler() {
        this.$emit('input', this.value)
      }
    }
  },
  methods: {
    handleCommand(command) {
      if (command == 'cond') this.addChild('condition', '')
      if (command == 'andQ') this.addChild('group', 'and')
      if (command == 'and') this.addChild('condition', 'and')
      if (command == 'orQ') this.addChild('group', 'or')
      if (command == 'or') this.addChild('condition', 'or')
    },
    addChild(type, operator) {
      let child = {}
      if (type === 'group') {
        child = {
          type: 'group',
          operator: operator,
          conditions: [
            {
              type: 'condition',
              field: '',
              command: '',
              value: ''
            }
          ]
        }
      } else if (type === 'condition') {
        child = {
          type: 'condition',
          operator: operator,
          field: '',
          command: '',
          value: ''
        }
      }
      this.value.conditions.push(child)
      this.$emit('input', this.value)
    },
    removeChild(index) {
      this.value.conditions.splice(index, 1)
      //if (this.value.conditions.length > 0) this.value.conditions[0].operator = '';
      if (this.value.conditions.length == 0) this.$emit('remove')
    }
  }
}
</script>
<style lang="scss">
.level2 {
  border: 1px solid #dedee4;
  padding: 5px;
}
.level1 {
  margin-top: -1px;
}
.level1,
.level2 {
  div:last-child > .item {
    margin-bottom: 0;
  }
}
</style>
<style lang="scss" scoped>
.item {
  display: flex;
  justify-content: space-around;
  justify-items: center;
  margin-bottom: 6px;
  .field + .field {
    margin-left: 5px;
  }
  .btn {
    height: 28px;
    line-height: 46px;
    text-align: center;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    display: flex;
    padding-top: 8px;
    span {
      float: left;
      display: inline-block;
      text-align: center;
      color: map-get($fontColor, slight);
      font-size: 12px;
      cursor: pointer;
      box-sizing: border-box;
    }
  }
}
</style>

<style lang="scss" scoped>
.e-table {
  .e-entity-wrap {
    flex: 1;
    overflow: auto;
  }
  .flex-block {
    display: flex;
    align-items: center;
  }
  .fiflter {
    padding: 10px 12px;
    font-size: 12px;
    box-sizing: border-box;
    border: 1px solid #dcdfe6;
    .title {
      font-size: 12px;
      padding-bottom: 10px;
    }
    .rowSlot {
      display: inline-block;
      margin-bottom: 12px;
      border: 1px solid #dcdfe6;
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
        background-color: #f5f7fa;
      }
      .e-select {
        width: 160px;
      }
    }
    .e-row {
      padding-bottom: 5px;
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
  .cond-operator {
    padding-bottom: 5px;
    display: inline-block;
  }
}
</style>
<style lang="scss">
.e-table {
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
.field {
  padding-right: 3px;
}
</style>
