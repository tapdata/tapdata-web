<template>
  <div v-loading="loading" class="table-selector">
    <!-- 候选区 -->
    <div class="candidate-panel selector-panel">
      <div class="selector-panel__header">
        <div class="flex-1">
          <ElCheckbox
            v-if="table.tables.length"
            v-model="table.isCheckAll"
            :indeterminate="!table.isCheckAll && table.checked.length > 0"
            @input="checkAll($event, 'table')"
          ></ElCheckbox>
          <span class="ml-3">{{ t('component_table_selector_candidate_label') }}</span>
          <span v-if="table.tables.length" class="font-color-light ml-2"
            >({{ table.checked.length }}/{{ table.tables.length }})</span
          >
        </div>
        <span v-if="showProgress" class="ml-2 color-primary">
          <i class="el-icon-loading mx-2"></i>
          <span>{{ progress }}%</span>
        </span>
        <ElLink v-else-if="!disabled" type="primary" :disabled="stateIsReadonly" @click="reload()">
          <div class="flex align-center">
            <span>{{ t('button_reload') }}</span>
            <VIcon class="ml-1" size="9">icon_table_selector_load</VIcon>
          </div>
        </ElLink>
        <ConnectionTest ref="test"></ConnectionTest>
      </div>

      <div class="selector-panel__body">
        <div class="selector-panel__search">
          <ElInput
            v-model="table.searchKeyword"
            clearable
            suffix-icon="el-icon-search"
            :placeholder="t('common_placeholder_search_input')"
          ></ElInput>
        </div>
        <ElCheckboxGroup
          v-model="table.checked"
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
            :image="require('@/assets/images/img_empty.png')"
            :description="t('component_table_selector_tables_empty') + '~'"
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
          <i class="el-icon-arrow-right"></i>
        </span>
        <span
          class="btn-transfer mt-4"
          :class="{
            'btn-transfer--disabled': isOpenClipMode || disabled,
            'btn-transfer--primary': selected.checked.length > 0 && !isOpenClipMode && !disabled
          }"
          @click="remove"
        >
          <i class="el-icon-arrow-left"></i>
        </span>
      </div>
    </div>
    <!-- 已选择区 -->
    <div class="checked-panel selector-panel">
      <div class="selector-panel__header">
        <div class="flex-1">
          <ElCheckbox
            v-if="selected.tables.length && !isOpenClipMode"
            v-model="selected.isCheckAll"
            :indeterminate="!selected.isCheckAll && selected.checked.length > 0"
            @input="checkAll($event, 'selected')"
          ></ElCheckbox>
          <span class="ml-3">{{ t('component_table_selector_checked_label') }}</span>
          <span v-if="selected.tables.length && !isOpenClipMode" class="font-color-light ml-2"
            >({{ selected.checked.length }}/{{ selected.tables.length }})</span
          >
        </div>
        <ElLink v-if="!disabled" type="primary" @click="changeSeletedMode()">
          <div class="flex align-center">
            <span v-if="!isOpenClipMode">{{ t('component_table_selector_bulk_name') }}</span>
            <span v-else>{{ t('component_table_selector_bulk_pick') }}</span>
            <VIcon class="ml-1" size="9">icon_table_selector_bulk_pick</VIcon>
          </div>
        </ElLink>
      </div>
      <div class="selector-panel__body">
        <div v-show="!isOpenClipMode" class="selector-panel__search">
          <ElInput
            v-model="selected.searchKeyword"
            clearable
            suffix-icon="el-icon-search"
            :placeholder="t('common_placeholder_search_input')"
          ></ElInput>
        </div>
        <ElCheckboxGroup
          v-model="selected.checked"
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
            :image="require('@/assets/images/img_empty.png')"
            :description="t('component_table_selector_not_checked') + '~'"
          ></ElEmpty>
        </div>
        <div v-if="isOpenClipMode" class="selector-clipboard h-100 flex flex-column">
          <div
            v-show="!isFocus"
            class="selector-clipboard__view"
            @click="
              isFocus = true
              clipboardValue = clipboardTables.concat().join(', ')
            "
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
              t('component_table_selector_clipboard_placeholder')
            }}</span>
          </div>
          <ElInput
            v-show="isFocus"
            v-model="clipboardValue"
            ref="textarea"
            class="selector-clipboard__textarea"
            type="textarea"
            resize="none"
            :placeholder="t('component_table_selector_clipboard_placeholder')"
            @blur="isFocus = false"
          ></ElInput>
        </div>
      </div>
      <div class="selector-panel__footer">
        <div v-if="Object.keys(errorTables).length" class="selector-error flex align-center">
          <span class="color-danger">*{{ t('component_table_selector_error') }}</span>
          <ElLink class="ml-2" type="primary" @click="autofix">{{ t('component_table_selector_autofix') }}</ElLink>
        </div>
        <div v-if="isOpenClipMode" class="px-4 pb-4 text-end">
          <!--          <ElButton @click="changeSeletedMode()">{{ t('button_cancel') }}</ElButton>-->
          <ElButton type="primary" @click="submitClipboard">{{ t('button_confirm') }}</ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

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
  font-size: 14px;
}
.selector-panel__body {
  padding: 16px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  overflow: auto;
  cursor: text;
  > span {
    display: inline-block;
    line-height: 20px;
    height: 20px;
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

<script>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller } from 'vue-virtual-scroller'
import OverflowTooltip from 'web-core/components/overflow-tooltip'
import { metadataInstancesApi, connectionsApi } from '@tap/api'
import Locale from '../../mixins/locale'

export default {
  mixins: [Locale],
  components: { RecycleScroller, OverflowTooltip },
  props: {
    connectionId: {
      type: String,
      required: true
    },
    value: Array,
    disabled: Boolean
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
      let reg = new RegExp(searchKeyword, 'i')
      return tables.filter(item => reg.test(item))
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
      let value = this.clipboardValue?.replace(/\s+/g, '')
      let tables = value ? value.split(',') : []
      return Array.from(new Set(tables.filter(it => !!it && it.trim())))
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
        let tables = this.clipboardTables.concat()
        this.selected.tables = tables
        this.$emit('input', this.selected.tables)
        this.$emit('change', this.selected.tables)
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
        this.$emit('input', this.selected.tables)
        this.$emit('change', this.selected.tables)
      } else {
        this.$message.warning(this.t('component_table_selector_not_checked'))
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
        this.$emit('input', this.selected.tables)
        this.$emit('change', this.selected.tables)
      } else {
        this.$message.warning(this.t('component_table_selector_not_checked'))
      }
    },
    autofix() {
      if (this.isOpenClipMode) {
        this.clipboardValue = this.clipboardTables.filter(t => !this.errorTables[t]).join(', ')
        this.errorTables = {}
      } else {
        this.selected.tables = Object.freeze(this.selected.tables.filter(t => !this.errorTables[t]))
        this.$emit('input', this.selected.tables)
        this.$emit('change', this.selected.tables)
      }
    },
    getErrorTables(tables) {
      let allTables = this.table.tables
      let errorTables = {}

      if (!this.loading) {
        tables.forEach(t => {
          if (!allTables.includes(t)) {
            errorTables[t] = this.t('component_table_selector_error_not_exit')
          }
        })
      }

      this.errorTables = errorTables
      return errorTables
    },
    checkAll(flag, name) {
      let { tables } = this[name]
      if (flag) {
        this[name].checked = tables
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
      const workerApi = new workerApi()
      const data = await workerApi.getAvailableAgent()
      if (!data?.result?.length) {
        this.$message.error(this.t('agent_check_error'))
      } else {
        let config = {
          title: this.t('connection_reload_schema_confirm_title'),
          Message: this.t('connection_reload_schema_confirm_msg')
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
          this.$refs.test.start(data, false, true)
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
              this.getTables() //更新schema
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
          // this.$message.error(this.t('connection_reload_schema_fail'))
          this.showProgress = false
          this.progress = 0 //加载完成
        })
    }
  }
}
</script>
