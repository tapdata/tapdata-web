<script>
import { $emit, $off, $on, $once } from '../../utils/gogocodeTransfer'
import Condition from './Condition'
import ConditionGroup from './ConditionGroup'
export default {
  name: 'ConditionGroup',
  components: { ConditionGroup, Condition },
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
        return []
      },
    },
    level: {
      type: Number,
      default() {
        return 1
      },
    },
    maxLevel: {
      type: Number,
      default: 10,
    },
    // showFilterDialog: {
    //   type: Boolean,
    //   default() {
    //     return {}
    //   }
    // }
  },
  emits: ['update:value', 'remove'],
  data() {
    return {
      color: '',
      fieldList: [],
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
  },
  watch: {
    // showFilterDialog: {
    //   deep: true,
    //   immediate: true,
    //   handler() {
    //     this.$emit('input', this.value)
    //     this.value.operator = this.value.conditions
    //   }
    // }
  },
  created() {
    this.fieldList = this.fields
  },
  mounted() {
    this.color = `level${(this.level % 7) + 1}`
  },
  methods: {
    // 添加
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
    // 删除组
    removeGroup(item) {
      $emit(this, 'remove', item)
    },
    // 删除条件
    removeChild(item, index) {
      const self = this
      self.value.conditions.splice(index, 1)
    },
  },
}
</script>

<template>
  <!-- 过api过滤条件 -->
  <div class="condition-group-wrap" :class="color">
    <div class="query-build-header">
      <div class="query-build-header-left">
        <span class="fw-sub pr-5">{{ $t('query_build_match_condition') }}</span>
        <el-radio v-model="value.operator" label="and">{{
          $t('public_select_option_all')
        }}</el-radio>
        <el-radio v-model="value.operator" label="or">{{
          $t('query_build_any')
        }}</el-radio>
        <!-- <el-radio-group v-model="value.operator"  class="query-build-header-radio">
              <el-radio-button label="and">{{ $t('public_select_option_all') }}</el-radio-button>
              <el-radio-button label="or">{{ $t('query_build_any') }}</el-radio-button>
            </el-radio-group> -->
      </div>
      <div class="query-build-header-right">
        <el-tooltip
          class="item"
          effect="dark"
          :content="$t('query_build_addGroup')"
          placement="top"
        >
          <el-button v-if="level < maxLevel" text @click="addChild('group')">{{
            $t('query_build_add')
          }}</el-button>
        </el-tooltip>

        <el-tooltip
          class="item"
          effect="dark"
          :content="$t('query_build_removeGroup')"
          placement="top"
        >
          <el-button v-if="level > 1" text @click="removeGroup(value)">{{
            $t('public_button_delete')
          }}</el-button>
        </el-tooltip>
      </div>
    </div>
    <div class="query-build-group">
      <div
        v-for="(item, index) in conditions"
        :key="item.field"
        class="query-build-group-item"
      >
        <template v-if="item.type === 'group'">
          <ConditionGroup
            :key="index"
            v-model:value="conditions[index]"
            :fields="fieldList"
            :field-label="fieldLabel"
            :field-value="fieldValue"
            :level="childLevel"
            @remove="removeChild(conditions[index], index)"
          />
        </template>
        <!-- 选择字段 -->
        <template v-if="item.type === 'condition'">
          <div class="query-build-group-row">
            <div class="query-build-group-col">
              <Condition
                :key="index"
                v-model:value="conditions[index]"
                :field-label="fieldLabel"
                :field-value="fieldValue"
                :fields="fieldList"
                :level="childLevel"
              />
              <!-- :showFilterDialog="showFilterDialog" -->
            </div>
            <!-- 添加 条件 -->
            <div class="query-build-group-col query-build-group-button">
              <el-tooltip
                class="item"
                effect="dark"
                :content="$t('query_build_addCondition')"
                placement="top"
              >
                <el-button
                  v-if="item.type === 'condition'"
                  text
                  @click="addChild('condition')"
                  >{{ $t('query_build_add') }}</el-button
                >
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                :content="$t('query_build_removeCondition')"
                placement="top"
              >
                <el-button
                  v-if="conditionCount > 1"
                  text
                  @click="removeChild(item, index)"
                  >{{ $t('public_button_delete') }}</el-button
                >
              </el-tooltip>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.condition-group-wrap {
  margin-bottom: 10px;
  border: 1px solid var(--border-light);
  border-left-width: 3px;
  overflow: hidden;
  .query-build-header {
    display: flex;
    justify-content: space-between;
    height: 38px;
    line-height: 38px;
    padding: 0 10px;
    background-color: var(--bg-main);
    .query-build-header-left {
      font-size: 12px;
      span {
        display: inline-block;
        color: var(--text-light);
      }
      :deep(.el-radio) {
        .el-radio__label {
          color: var(--text-dark);
        }
        &.is-checked .el-radio__label {
          color: rgba(0, 0, 0, 0.65);
        }
      }

      .query-build-header-radio {
        padding: 4px 20px 0;
      }
    }
    .query-build-header-right {
      :deep(.el-button--text) {
        font-size: 12px;
        background-color: var(--bg-main);
      }
    }
  }
  .query-build-group {
    padding: 10px 10px 10px 24px;
    .query-build-group-item {
      padding-bottom: 10px;
    }
    .query-build-group-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      .query-build-group-button {
        width: 70px;
        text-align: right;
      }
    }
  }
}
.condition-group-wrap.level1 {
  border-left-color: #818182;
}
.condition-group-wrap.level2 {
  border-left-color: var(--color-primary);
}
.condition-group-wrap.level3 {
  border-left-color: #a463f2;
}
.condition-group-wrap.level4 {
  border-left-color: #ffb700;
}
.condition-group-wrap.level5 {
  border-left-color: #3ae698;
}
.condition-group-wrap.level6 {
  border-left-color: #000000;
}
.condition-group-wrap.level7 {
  border-left-color: #e7040f;
}
</style>
