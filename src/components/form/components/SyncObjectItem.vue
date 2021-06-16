<template>
  <div class="sync-object-item-wrap">
    <ElFormItem>
      <div class="e-label">
        <label class="el-form-item__label">{{
          $t('editor.cell.link.copySourceDatabase')
        }}</label>
        <el-popover
          class="align-middle"
          placement="top-start"
          width="400"
          trigger="hover"
        >
          <span>{{ $t('editor.cell.link.formTip') }}</span>
          <template #reference>
            <VIcon color="#999">tishi</VIcon>
          </template>
        </el-popover>
      </div>

      <ElCheckboxGroup v-model="syncTypes" @change="syncTypesChanged">
        <ElCheckbox
          v-for="(option, i) in options"
          :key="i"
          :label="options.value"
          :disabled="option.disabled"
          >{{ option.label }}
          <el-popover
            v-if="option.tooltip"
            class="align-middle"
            placement="top-start"
            width="400"
            trigger="hover"
          >
            <span>{{ $t(option.tooltip) }}</span>
            <template #reference>
              <VIcon color="#999">tishi</VIcon>
            </template>
          </el-popover>
        </ElCheckbox>
      </ElCheckboxGroup>
    </ElFormItem>
    <ElFormItem required class="transfer-item">
      <template #label>
        <div class="flex flex-grow-1">
          <span>
            {{ $t('editor.cell.link.migrationSetting') }}
          </span>
          <div class="flex-grow-1 flex-shrink-1"></div>
          <el-button
            class="e-button"
            size="mini"
            :disabled="syncTypes.includes('view')"
            @click="handDialog"
            >{{ $t('dataFlow.changeName') }}</el-button
          >
          <el-button
            size="mini"
            class="e-button ml-2"
            :disabled="syncTypes.includes('view')"
            @click="handleReduction"
            >{{ $t('editor.cell.link.reduction') }}</el-button
          >
        </div>
      </template>
      <div class="transfer flex-fill">
        <ElTransfer
          filterable
          :titles="titles"
          :filter-method="filterMethod"
          :filter-placeholder="$t('editor.cell.link.searchContent')"
          v-model="tables"
          :data="sourceData"
          @change="handleChangeTransfer"
          @right-check-change="handleSelectTable"
        >
          <span class="box" slot-scope="{ option }">
            <span
              class="text"
              :title="option.label"
              :class="[{ active: option.label !== option.key }, 'text']"
              >{{ option.label }}</span
            >
          </span>
        </ElTransfer>
      </div>
      <!--<div
        class="database-tableBox flex flex-column flex-grow-1 overflow-hidden"
        v-loading="transferLoading"
      >
        <div class="box-text">
          <h3>
            {{ $t('editor.cell.link.migrationSetting')
            }}<i style="color: red"> *</i>
          </h3>
          <div class="box-btn">
            <el-button
              class="e-button"
              size="mini"
              :disabled="syncTypes.includes('view')"
              @click="handDialog"
            >{{ $t('dataFlow.changeName') }}</el-button
            >
            <el-button
              size="mini"
              class="e-button"
              :disabled="disabled || syncTypes.includes('view')"
              @click="handleReduction"
            >{{ $t('editor.cell.link.reduction') }}</el-button
            >
          </div>
        </div>

      </div>-->
    </ElFormItem>
  </div>
</template>

<script>
import { useForm, observer } from '@formily/vue'
import VIcon from '../../VIcon'
export default {
  name: 'SyncObjects',
  components: { VIcon },
  props: {
    value: Array,
    disabled: Boolean,
    options: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      syncTypes: [],
      sourceData: [],
      tables: [],
      titles: [
        this.$t('editor.cell.link.migrationObjece'),
        this.$t('editor.cell.link.chosen')
      ]
    }
  },

  mounted() {
    console.log('SyncObjects.vue', this.value)
  },

  methods: {
    syncTypesChanged() {},
    // 添加前后缀弹窗开关
    handDialog() {
      const formRef = useForm()
      const form = formRef.value
      console.log('handDialog', form)
      this.table_prefix = form.table_prefix
      this.table_suffix = form.table_suffix
      this.dialogVisible = true
    },
    // 还原
    handleReduction() {
      this.model.table_suffix = ''
      this.model.table_prefix = ''
      if (this.sourceData.length) {
        for (let i = 0; i < this.sourceData.length; i++) {
          // for (let j = 0; j < selectKeepArr.length; j++) {
          for (let k = 0; k < this.model.selectSourceArr.length; k++) {
            if (
              // this.sourceData[i].label === selectKeepArr[j] &&
              this.sourceData[i].key === this.model.selectSourceArr[k]
            ) {
              this.sourceData[i].label = this.sourceData[i].key
              // this.sourceData[i].key = this.sourceData[i].label;
              // this.model.selectSourceArr[k] = this.sourceData[i].value;
            }
            // 	}
          }
        }
      }
    },
    // 穿梭框搜索
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1
    },

    // 已选择的表
    handleSelectTable(data) {
      // selectKeepArr = data
    },

    // 穿梭框值改变的时候
    handleChangeTransfer(tables) {
      // this.sourceData.forEach(el => {
      //   if (selectKeepArr.length && selectKeepArr.includes(el.key)) {
      //     el.label = el.key
      //   }
      // })
      // this.preFixSuffixData()

      this.setNodeValueByPath({
        id: this.node.id,
        path: 'syncObjects.objectNames',
        conditions: [
          {
            type: 'table'
          }
        ],
        value: tables
      })

      console.log('node', this.node)

      /*const syncObjects = [...this.node.syncObjects]
      const syncItem = syncObjects.find(item => item.type === 'table')

      syncItem.objectNames = tables

      this.valueChanged(syncObjects, 'syncObjects')*/
    }
  }
}
</script>

<style lang="scss" scoped>
.sync-object-item-wrap {
  ::v-deep {
    .transfer-item {
      .el-form-item__label {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        width: 100%;
      }
    }

    .el-transfer__buttons {
      display: inline-flex;
      flex-direction: column;
      .el-button:last-child {
        margin-left: 0;
      }
    }

    .el-transfer .el-transfer-panel {
      .el-transfer-panel__header {
        height: 28px;

        .el-checkbox {
          height: 28px;
          line-height: 28px;
          overflow: hidden;
        }
      }

      .el-transfer-panel__filter {
        margin: 10px;
        .el-input__inner {
          border-radius: 3px;
        }
      }
    }

    .el-checkbox__label {
      height: 30px;
      font-size: 12px !important;
      padding-right: 6px;
    }
  }
}
</style>
