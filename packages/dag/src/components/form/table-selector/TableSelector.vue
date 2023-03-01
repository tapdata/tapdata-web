<template>
  <div v-loading="loading" class="table-selector">
    <!-- 候选区 -->
    <div class="candidate-panel selector-panel">
      <div class="selector-panel__header">
        <div class="flex-1">
          <ElCheckbox
            v-if="table.tables.length"
            v-model:value="table.isCheckAll"
            @input="checkAll($event, 'table')"
            :indeterminate="isIndeterminate"
          ></ElCheckbox>
          <span class="ml-3">{{ $t('packages_form_component_table_selector_candidate_label') }}</span>
          <span v-if="table.tables.length" class="font-color-light ml-2"
            >({{ table.checked.length }}/{{ table.tables.length }})</span
          >
        </div>
        <span v-if="showProgress" class="ml-2 color-primary">
          <el-icon class="mx-2"><el-icon-loading /></el-icon>
          <span>{{ progress }}%</span>
        </span>
        <ElLink v-else-if="!disabled && !hideReload" type="primary" :disabled="stateIsReadonly" @click="reload()">
          <div class="flex align-center">
            <span>{{ $t('packages_form_button_reload') }}</span>
            <VIcon class="ml-1" size="9">icon_table_selector_load</VIcon>
          </div>
        </ElLink>
        <ConnectionTest ref="test" />
      </div>

      <div class="selector-panel__body">
        <div class="selector-panel__search">
          <ElInput
            v-model:value="table.searchKeyword"
            clearable
            suffix-icon="el-icon-search"
            :placeholder="$t('packages_form_common_placeholder_search_input')"
          ></ElInput>
        </div>
        <ElCheckboxGroup
          v-model:value="table.checked"
          v-show="filteredData.length"
          class="selector-panel__list"
          @input="checkedChange('table')"
        >
          <RecycleScroller class="selector-panel__scroller" :item-size="36" :buffer="50" :items="filteredData">
            <template #default="{ item }">
              <ElCheckbox class="selector-panel__item" :label="item" :key="item">
                <OverflowTooltip :text="item" placement="right" :enterable="false"></OverflowTooltip>
              </ElCheckbox>
            </template>
          </RecycleScroller>
        </ElCheckboxGroup>
        <div v-if="!filteredData.length" class="flex-1 flex flex-column justify-center">
          <ElEmpty
            :image-size="111"
            :image="require('@tap/assets/images/img_empty.png')"
            :description="$t('packages_form_component_table_selector_tables_empty') + '~'"
          ></ElEmpty>
        </div>
      </div>
    </div>
    <!-- 左右箭头 按钮 -->
    <div class="selector-center">
      <div class="selector-btns">
        <span
          class="btn-transfer"
          :class="{
            'btn-transfer--disabled': isOpenClipMode || disabled,
            'btn-transfer--primary': table.checked.length > 0 && !isOpenClipMode && !disabled
          }"
          @click="add"
        >
          <el-icon><el-icon-arrow-right /></el-icon>
        </span>
        <span
          class="btn-transfer mt-4"
          :class="{
            'btn-transfer--disabled': isOpenClipMode || disabled,
            'btn-transfer--primary': selected.checked.length > 0 && !isOpenClipMode && !disabled
          }"
          @click="remove"
        >
          <el-icon><el-icon-arrow-left /></el-icon>
        </span>
      </div>
    </div>
    <!-- 已选择区 -->
    <div class="checked-panel selector-panel">
      <div class="selector-panel__header">
        <div class="flex-1">
          <ElCheckbox
            v-if="selected.tables.length && !isOpenClipMode"
            v-model:value="selected.isCheckAll"
            :indeterminate="selectedIsIndeterminate"
            @input="checkAll($event, 'selected')"
          ></ElCheckbox>
          <span class="ml-3">{{ $t('packages_form_component_table_selector_checked_label') }}</span>
          <span v-if="selected.tables.length && !isOpenClipMode" class="font-color-light ml-2"
            >({{ selected.checked.length }}/{{ selected.tables.length }})</span
          >
        </div>
        <ElLink v-if="!disabled" type="primary" @click="changeSeletedMode()">
          <div class="flex align-center">
            <span v-if="!isOpenClipMode">{{ $t('packages_form_component_table_selector_bulk_name') }}</span>
            <span v-else>{{ $t('packages_form_component_table_selector_bulk_pick') }}</span>
            <VIcon class="ml-1" size="9">icon_table_selector_bulk_pick</VIcon>
          </div>
        </ElLink>
      </div>
      <div class="selector-panel__body" :class="{ isOpenClipMode }">
        <div v-show="!isOpenClipMode" class="selector-panel__search">
          <ElInput
            v-model:value="selected.searchKeyword"
            clearable
            suffix-icon="el-icon-search"
            :placeholder="$t('packages_form_common_placeholder_search_input')"
          ></ElInput>
        </div>
        <ElCheckboxGroup
          v-model:value="selected.checked"
          v-show="filterSelectedData.length && !isOpenClipMode"
          class="selector-panel__list"
          @input="checkedChange('selected')"
        >
          <RecycleScroller class="selector-panel__scroller" :item-size="36" :buffer="50" :items="filterSelectedData">
            <template #default="{ item }">
              <ElCheckbox class="selector-panel__item" :label="item" :key="item">
                <ElTooltip
                  class="ellipsis"
                  placement="right"
                  :enterable="false"
                  :disabled="!errorTables[item]"
                  :content="errorTables[item]"
                >
                  <div :class="{ 'color-danger': errorTables[item] }">
                    <slot name="right-item" :row="item">{{ item }}</slot>
                  </div>
                </ElTooltip>
              </ElCheckbox>
            </template>
          </RecycleScroller>
        </ElCheckboxGroup>
        <div v-if="!isOpenClipMode && !filterSelectedData.length" class="flex-1 flex flex-column justify-center">
          <ElEmpty
            :image-size="111"
            :image="require('@tap/assets/images/img_empty.png')"
            :description="$t('packages_form_component_table_selector_not_checked') + '~'"
          ></ElEmpty>
        </div>
        <div v-if="isOpenClipMode" class="selector-clipboard flex flex-column">
          <div
            v-show="!isFocus"
            class="selector-clipboard__view"
            @click=";(isFocus = true), (clipboardValue = clipboardTables.concat().join(', '))"
          >
            <template v-if="clipboardTables.length">
              <ElTooltip
                v-for="(t, i) in clipboardTables"
                :key="t"
                placement="top"
                :enterable="false"
                :disabled="!errorTables[t]"
                :content="errorTables[t]"
              >
                <span :class="{ 'color-danger': errorTables[t] }"
                  >{{ t }}<template v-if="i < clipboardTables.length - 1">,&nbsp;</template></span
                >
              </ElTooltip>
            </template>
            <span v-else class="selector-clipboard__view--empty">{{
              $t('packages_form_component_table_selector_clipboard_placeholder')
            }}</span>
          </div>
          <ElInput
            v-show="isFocus"
            v-model:value="clipboardValue"
            autosize
            ref="textarea"
            class="selector-clipboard__textarea"
            type="textarea"
            resize="none"
            :placeholder="$t('packages_form_component_table_selector_clipboard_placeholder')"
            @blur="isFocus = false"
          ></ElInput>
        </div>
      </div>
      <div class="selector-panel__footer">
        <div v-if="Object.keys(errorTables).length" class="selector-error flex align-center">
          <span class="color-danger">*{{ $t('packages_form_component_table_selector_error') }}</span>
          <ElLink class="ml-2" type="primary" @click="autofix">{{
            $t('packages_form_component_table_selector_autofix')
          }}</ElLink>
        </div>
        <div v-if="isOpenClipMode" class="px-4 pb-4 text-end">
          <!--          <ElButton @click="changeSeletedMode()">{{ $t('packages_form_button_cancel') }}</ElButton>-->
          <ElButton type="primary" @click="submitClipboard">{{ $t('packages_form_button_confirm') }}</ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Loading as ElIconLoading,
  ArrowRight as ElIconArrowRight,
  ArrowLeft as ElIconArrowLeft
} from '@element-plus/icons'
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller } from 'vue-virtual-scroller'

import { metadataInstancesApi, connectionsApi, workerApi } from '@tap/api'
import OverflowTooltip from '@tap/component/src/overflow-tooltip'
import VIcon from '@tap/component/src/base/VIcon'
import ConnectionTest from '@tap/business/src/views/connections/Test'

export default {
  components: {
    RecycleScroller,
    OverflowTooltip,
    ConnectionTest,
    VIcon,
    ElIconLoading,
    ElIconArrowRight,
    ElIconArrowLeft
  },
  props: {
    connectionId: {
      type: String,
      required: true
    },
    value: Array,
    disabled: Boolean,
    hideReload: Boolean,
    reloadTime: [String, Number]
  },
  data() {
    return {
      stateIsReadonly: this.$store.state.dataflow.stateIsReadonly,
      loading: false,
      table: {
        isCheckAll: false,
        searchKeyword: '',
        checked: [],
        tables: []
      },
      selected: {
        isCheckAll: false,
        searchKeyword: '',
        checked: [],
        tables: this.value
      },
      showProgress: false,
      progress: '',
      loadFieldsStatus: 'finished',
      errorTables: {},
      isOpenClipMode: false,
      clipboardValue: '',
      isFocus: false
    }
  },
  computed: {
    filteredData() {
      let { searchKeyword, tables } = this.table
      try {
        let reg = new RegExp(searchKeyword, 'i')
        return tables.filter(item => reg.test(item))
      } catch (error) {
        return []
      }
    },
    filterSelectedData() {
      let { searchKeyword, tables } = this.selected
      let errorTables = this.getErrorTables(tables)
      let reg = new RegExp(searchKeyword, 'i')
      let filterTables = tables.filter(item => reg.test(item))
      filterTables = filterTables.sort((t1, t2) => {
        if (errorTables[t1]) {
          return -1
        }
        if (errorTables[t2]) {
          return 1
        }
        return 0
      })
      return filterTables
    },
    clipboardTables() {
      //支持换行符 /n
      let value = this.clipboardValue?.replace(/(\n)/g, ',')
      value = value?.replace(/\s+/g, '')
      let tables = value ? value.split(',') : []
      return Array.from(new Set(tables.filter(it => !!it && it.trim())))
    },
    isIndeterminate() {
      const checkedLength = this.table.checked.length
      const tablesLength = this.filteredData.length
      return checkedLength > 0 && checkedLength < tablesLength
    },
    selectedIsIndeterminate() {
      const checkedLength = this.selected.checked.length
      const tablesLength = this.filterSelectedData.length
      return checkedLength > 0 && checkedLength < tablesLength
    }
  },
  watch: {
    isFocus(v) {
      if (v) {
        this.$nextTick(() => {
          this.$refs?.textarea?.focus()
        })
      }
    },
    value(v = []) {
      this.selected.tables = v.concat()
    },
    'table.checked'() {
      this.updateAllChecked()
    },
    'filteredData.length'() {
      this.updateAllChecked()
    },
    'selected.checked'() {
      this.updateSelectedAllChecked()
    },
    'filterSelectedData.length'() {
      this.updateSelectedAllChecked()
    },
    reloadTime() {
      this.getProgress()
    }
  },
  created() {
    let id = this.connectionId
    if (id) {
      this.getTables()
    }
  },
  methods: {
    submitClipboard() {
      let tables = this.clipboardTables
      let errorTables = this.getErrorTables(tables)
      if (!Object.keys(errorTables).length) {
        this.changeSeletedMode()
        //保留当前选中 以及当前所手动输入
        this.selected.tables = Array.from(new Set([...this.selected.tables, ...this.clipboardTables.concat()]))
        $emit(this, 'update:value', this.selected.tables)
        $emit(this, 'change', this.selected.tables)
      }
    },
    add() {
      if (this.isOpenClipMode || this.disabled) {
        return
      }
      let tables = this.selected.tables.concat(this.table.checked)
      if (tables.length) {
        tables = Array.from(new Set(tables))
        this.selected.tables = Object.freeze(tables)
        $emit(this, 'update:value', this.selected.tables)
        $emit(this, 'change', this.selected.tables)
      } else {
        this.$message.warning(this.$t('packages_form_component_table_selector_not_checked'))
      }
    },
    remove() {
      if (this.isOpenClipMode || this.disabled) {
        return
      }
      let tables = this.selected.checked
      if (tables.length) {
        this.selected.tables = Object.freeze(this.selected.tables.filter(it => !tables.includes(it)))
        this.selected.checked = []
        this.selected.isCheckAll = false
        $emit(this, 'update:value', this.selected.tables)
        $emit(this, 'change', this.selected.tables)
      } else {
        this.$message.warning(this.$t('packages_form_component_table_selector_not_checked'))
      }
    },
    autofix() {
      if (this.isOpenClipMode) {
        this.clipboardValue = this.clipboardTables.filter(t => !this.errorTables[t]).join(', ')
        this.errorTables = {}
      } else {
        this.selected.tables = Object.freeze(this.selected.tables.filter(t => !this.errorTables[t]))
        $emit(this, 'update:value', this.selected.tables)
        $emit(this, 'change', this.selected.tables)
      }
    },
    getErrorTables(tables) {
      let allTables = this.table.tables
      let errorTables = {}

      if (!this.loading) {
        tables.forEach(t => {
          if (!allTables.includes(t)) {
            errorTables[t] = this.$t('packages_form_component_table_selector_error_not_exit')
          }
        })
      }

      this.errorTables = errorTables
      return errorTables
    },
    checkAll(flag, name) {
      if (flag) {
        this[name].checked = name === 'table' ? this.filteredData : this.filterSelectedData
      } else {
        this[name].checked = []
      }
    },
    checkedChange(name) {
      let { checked, tables } = this[name]
      if (checked.length === tables.length) {
        this[name].isCheckAll = true
      } else {
        this[name].isCheckAll = false
      }
    },
    changeSeletedMode() {
      this.isOpenClipMode = !this.isOpenClipMode
      this.errorTables = {}
      if (this.isOpenClipMode) {
        this.clipboardValue = ''
        this.isFocus = true
      } else {
        this.getErrorTables(this.selected.tables)
      }
    },
    // 获取所有表
    getTables() {
      this.loading = true
      metadataInstancesApi
        .getSourceTables(this.connectionId)
        .then((tables = []) => {
          tables.sort((t1, t2) => (t1 > t2 ? 1 : t1 === t2 ? 0 : -1))
          this.table.tables = Object.freeze(tables)
        })
        .finally(() => {
          this.loading = false
        })
    },
    //重新加载模型
    async reload() {
      const data = await workerApi.getAvailableAgent()
      if (!data?.result?.length) {
        this.$message.error(this.$t('packages_form_agent_check_error'))
      } else {
        let config = {
          title: this.$t('packages_form_connection_reload_schema_confirm_title'),
          Message: this.$t('packages_form_connection_reload_schema_confirm_msg')
        }
        this.$confirm(config.Message + '?', config.title, {
          type: 'warning',
          closeOnClickModal: false
        }).then(resFlag => {
          if (resFlag) {
            this.showProgress = true
            this.progress = 0
            this.testSchema()
          }
        })
      }
    },
    //请求测试连接并获取进度
    testSchema() {
      let parms = {
        loadCount: 0,
        loadFieldsStatus: 'loading'
      }
      this.loadFieldsStatus = 'loading'
      connectionsApi.updateById(this.connectionId, parms).then(res => {
        if (this?.$refs?.test) {
          let data = res
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          this.$refs.test.startByConnection(data, true)
          this.getProgress()
        }
      })
    },
    // 获取加载进度
    getProgress() {
      connectionsApi
        .getNoSchema(this.connectionId)
        .then(res => {
          let data = res
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          if (data.loadFieldsStatus === 'finished') {
            this.progress = 100
            setTimeout(() => {
              this.showProgress = false
              this.progress = 0 //加载完成
              const { taskId, activeNodeId } = this.$store.state?.dataflow || {}
              metadataInstancesApi
                .logicSchema(taskId, {
                  nodeId: activeNodeId
                })
                .then(() => {
                  this.getTables() //更新schema
                })
            }, 1000)
          } else {
            let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
            this.progress = progress ? progress : 0
            setTimeout(() => {
              if (this?.$refs?.test) {
                this.getProgress()
              }
            }, 1000)
          }
        })
        .catch(() => {
          // this.$message.error(this.$t('packages_form_connection_reload_schema_fail'))
          this.showProgress = false
          this.progress = 0 //加载完成
        })
    },

    updateAllChecked() {
      this.table.isCheckAll =
        this.filteredData.length > 0 && this.filteredData.every(item => this.table.checked.indexOf(item) > -1)
    },

    updateSelectedAllChecked() {
      this.selected.isCheckAll =
        this.filterSelectedData.length > 0 &&
        this.filterSelectedData.every(item => this.selected.checked.indexOf(item) > -1)
    }
  },
  emits: ['update:value', 'change']
}
</script>

<style lang="scss" scoped>
.table-selector {
  display: flex;
  align-items: stretch;
  height: 100%;
  overflow: hidden;
}
.selector-panel {
  flex: 1;
  //height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid map-get($borderColor, light);
  border-radius: 2px;
  overflow: hidden;
}
.selector-panel__header {
  padding: 0 16px;
  display: flex;
  align-items: center;
  background: #f7f8fa;
  line-height: 40px;
  color: map-get($fontColor, normal);
  font-size: 13px;
  font-weight: 500;
}
.selector-panel__body {
  padding: 16px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.isOpenClipMode {
    flex: unset;
    overflow: auto;
  }
}
.selector-panel__search {
  padding: 0 16px;
}
.selector-panel__list {
  margin-top: 16px;
  flex: 1;
  height: calc(100% - 32px);
  padding-bottom: 5px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}
.selector-panel__scroller {
  height: 100%;
}
.selector-panel__item {
  padding: 0 16px;
  width: 100%;
  line-height: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: map-get($bgColor, disable);
  }
  > ::v-deep {
    .el-checkbox__label {
      overflow: hidden;
    }
  }
}
.selector-center {
  width: 46px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .selector-btns {
    width: 28px;
  }
  .btn-transfer {
    display: inline-block;
    margin: 0;
    padding: 0;
    min-width: 28px;
    width: 28px;
    line-height: 28px;
    border-radius: 2px;
    font-size: 14px;
    background: map-get($bgColor, main);
    color: map-get($fontColor, normal);
    text-align: center;
    cursor: pointer;
    &:hover {
      background: map-get($color, primary);
      color: map-get($fontColor, white);
    }
    &.btn-transfer--disabled {
      background: map-get($bgColor, main);
      color: map-get($fontColor, normal);
      cursor: not-allowed;
    }
    &.btn-transfer--primary {
      background: map-get($color, primary);
      color: map-get($fontColor, white);
    }
  }
}
.selector-error {
  padding: 16px;
  font-size: 12px;
}
.selector-clipboard {
  padding: 0 16px;
}
.selector-clipboard__view {
  flex: 1;
  //overflow: auto;
  cursor: text;
  white-space: pre-wrap;
  > span {
    display: inline-block;
    line-height: 20px;
    //height: 20px;
    font-size: 12px;
    color: map-get($fontColor, normal);
    word-break: break-word;
  }
  .selector-clipboard__view--empty {
    color: map-get($fontColor, slight);
    font-size: 12px;
    font-weight: normal;
    line-height: 20px;
  }
}
.selector-clipboard__textarea {
  flex: 1;
  ::v-deep {
    .el-textarea__inner {
      height: 100%;
      border: none;
      padding: 0;
      font-size: 12px;
      line-height: 20px;
    }
  }
}
</style>
