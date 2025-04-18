<script>
import { taskApi } from '@tap/api'
import { TaskStatus } from '@tap/business'
import {
  IconButton,
  TextEditable,
  VDivider,
  VEmpty,
  VIcon,
} from '@tap/component'
import focusSelect from '@tap/component/src/directives/focusSelect'
import { ElSelect as Select } from 'element-plus'
import { mapGetters, mapMutations, mapState } from 'vuex'
import { $emit, $off, $on, $once } from '../../utils/gogocodeTransfer'
import DataCaptureDebug from './DataCaptureDebug.vue'

export default {
  name: 'TopHeader',
  directives: { focusSelect },

  components: {
    DataCaptureDebug,
    TextEditable,
    TaskStatus,
    VDivider,
    VIcon,
    ElScrollbar: Select.components.ElScrollbar,
    VEmpty,
    IconButton,
  },
  props: {
    loading: Boolean,
    isSaving: Boolean,
    dataflowName: String,
    dataflow: Object,
    scale: Number,
    buttonShowMap: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },

  data() {
    const isMacOs = /(ipad|iphone|ipod|mac)/i.test(navigator.platform)
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      commandCode: isMacOs ? '⌘' : 'Ctrl',
      optionCode: isMacOs ? 'Option' : 'Alt',
      name: '',
      syncMap: {
        'initial_sync+cdc': this.$t('public_task_type_initial_sync_and_cdc'),
        initial_sync: this.$t('public_task_type_initial_sync'),
        cdc: this.$t('public_task_type_cdc'),
      },
      chooseItems: [4, 2, 1.5, 1, 0.5, 0.25],
      showSearchNodePopover: false,
      nodeSearchInput: '',
      refreshing: false,
      openDebug: false,
    }
  },
  computed: {
    ...mapGetters('dataflow', [
      'dataflowId',
      'stateIsReadonly',
      'allNodes',
      'activeType',
    ]),
    ...mapState('dataflow', [
      'spaceKeyPressed',
      'shiftKeyPressed',
      'showConsole',
      'transformLoading',
    ]),

    scaleTxt() {
      return `${Math.round(this.scale * 100)}%`
    },

    isViewer() {
      return ['DataflowViewer', 'MigrateViewer'].includes(this.$route.name)
    },

    nodeList() {
      if (this.nodeSearchInput) {
        const txt = this.nodeSearchInput.toLocaleLowerCase()
        return this.allNodes.filter((node) =>
          node.name.toLocaleLowerCase().includes(txt),
        )
      }
      return this.allNodes
    },
  },
  watch: {
    dataflowName(v) {
      this.name = v
    },
  },
  mounted() {
    this.name = this.dataflowName
  },
  methods: {
    ...mapMutations('dataflow', [
      'setActiveType',
      'toggleShiftKeyPressed',
      'toggleConsole',
      'setSchemaRefreshing',
    ]),

    isShowForceStop(data) {
      return data?.length && data.every((t) => ['stopping'].includes(t.status))
    },

    onNameInputChange() {
      if (!this.name) {
        this.name = this.dataflowName
      } else {
        $emit(this, 'change-name', this.name)
      }
    },

    focusNameInput() {
      this.$refs.nameInput.focus()
    },

    back() {
      const mapping = this.$route.query.mapping
      const $PLATFORM = window.getSettingByKey('DFS_TCM_PLATFORM')
      const backToList = () => {
        if ($PLATFORM === 'dfs') {
          top.window.App.$router.push({
            name: 'Task',
          })
        } else {
          this.$router.push({
            name: 'dataFlows',
            query: {
              mapping,
            },
          })
        }
      }
      backToList()
    },

    handleClickNode(node) {
      this.showSearchNodePopover = false
      $emit(this, 'locate-node', node)
    },

    refreshSchema() {
      if (this.refreshing) return

      this.refreshing = true
      this.setSchemaRefreshing(true)

      taskApi.refreshSchema(this.dataflow.id).finally(() => {
        this.refreshing = false
        this.setSchemaRefreshing(false)
      })
    },
  },
  emits: [
    'page-return',
    'undo',
    'redo',
    'delete',
    'center-content',
    'auto-layout',
    'zoom-out',
    'zoom-in',
    'zoom-to',
    'showSettings',
    'save',
    'reset',
    'detail',
    'edit',
    'forceStop',
    'stop',
    'start',
    'change-name',
    'locate-node',
    'page-return',
    'undo',
    'redo',
    'delete',
    'center-content',
    'auto-layout',
    'zoom-out',
    'zoom-in',
    'zoom-to',
    'showSettings',
    'save',
    'reset',
    'detail',
    'edit',
    'forceStop',
    'stop',
    'start',
  ],
}
</script>

<template>
  <header class="layout-header border-bottom px-4">
    <button class="icon-btn mr-2" @click="$emit('page-return')">
      <VIcon size="18">left</VIcon>
    </button>

    <TextEditable
      v-model:value="name"
      class="mr-3"
      :readonly="stateIsReadonly"
      :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
      max-width="260"
      hidden-icon
      :input-min-width="32"
      :maxlength="200"
      @change="onNameInputChange"
    />

    <slot name="status" :result="dataflow.statusResult">
      <TaskStatus :task="dataflow" />
    </slot>

    <div class="operation-center flex align-center">
      <template v-if="!stateIsReadonly">
        <!--撤销-->
        <ElTooltip
          :hide-after="0"
          :content="`${$t('public_button_revoke')}(${commandCode} + Z)`"
        >
          <button class="icon-btn" @click="$emit('undo')">
            <VIcon size="20">undo</VIcon>
          </button>
        </ElTooltip>
        <!--重做-->
        <ElTooltip
          :hide-after="0"
          :content="`${$t('packages_dag_button_redo')}(${commandCode} + Shift + Z)`"
        >
          <button class="icon-btn" @click="$emit('redo')">
            <VIcon size="20">redo</VIcon>
          </button>
        </ElTooltip>
        <!--删除-->
        <ElTooltip
          :hide-after="0"
          :content="`${$t('public_button_delete')}(Del)`"
        >
          <button class="icon-btn" @click="$emit('delete')">
            <VIcon size="20">delete</VIcon>
          </button>
        </ElTooltip>
      </template>
      <!--内容居中-->
      <ElTooltip
        :hide-after="0"
        :content="`${$t('packages_dag_button_center_content')}(Shift + 1)`"
      >
        <button class="icon-btn" @click="$emit('center-content')">
          <VIcon size="20">compress</VIcon>
        </button>
      </ElTooltip>
      <!--自动布局-->
      <ElTooltip
        :hide-after="0"
        :content="`${$t(
          'packages_dag_button_auto_layout',
        )}(${commandCode} + ${optionCode} + L)`"
      >
        <button class="icon-btn" @click="$emit('auto-layout')">
          <VIcon size="20">auto-layout</VIcon>
        </button>
      </ElTooltip>
      <!--移动画布-->
      <!--<ElTooltip :hide-after="0" :content="$t('packages_dag_button_move_paper')">
              <button @click="toggleMovePaper" class="icon-btn" :class="{ active: spaceKeyPressed }">
                <VIcon size="20">hand</VIcon>
              </button>
            </ElTooltip>-->
      <!--拖选画布-->
      <ElTooltip :hide-after="0" :content="$t('packages_dag_mouse_selection')">
        <button
          class="icon-btn"
          :class="{ active: shiftKeyPressed }"
          @click="toggleShiftKeyPressed()"
        >
          <VIcon size="20">kuangxuan</VIcon>
        </button>
      </ElTooltip>
      <el-divider direction="vertical" />
      <!--缩小-->
      <ElTooltip
        :hide-after="0"
        :content="`${$t('packages_dag_button_zoom_out')}(${commandCode} -)`"
      >
        <button class="icon-btn" @click="$emit('zoom-out')">
          <VIcon size="20">remove-outline</VIcon>
        </button>
      </ElTooltip>
      <div class="choose-size mx-2">
        <ElPopover
          placement="bottom"
          trigger="hover"
          popper-class="rounded-xl p-0"
          width="auto"
        >
          <template #reference>
            <div class="size-wrap">{{ scaleTxt }}</div>
          </template>
          <div class="choose-list p-1">
            <div
              class="choose-item pl-4 flex justify-content-between align-center"
              @click="$emit('zoom-in')"
            >
              <span class="title">{{
                $t('packages_dag_button_zoom_out')
              }}</span>
              <div class="kbd-wrap flex align-center mr-2">
                <kbd>⌘</kbd><span class="mx-1">+</span><kbd>+</kbd>
              </div>
            </div>
            <div
              class="choose-item pl-4 flex justify-content-between align-center"
              @click="$emit('zoom-out')"
            >
              <span class="title">{{ $t('packages_dag_button_zoom_in') }}</span>
              <div class="kbd-wrap flex align-center mr-2">
                <kbd>⌘</kbd><span class="mx-1">+</span><kbd>–</kbd>
              </div>
            </div>
            <VDivider class="my-1" />
            <div
              v-for="val in chooseItems"
              :key="val"
              class="choose-item pl-4"
              @click="$emit('zoom-to', val)"
            >
              {{ val * 100 }}%
            </div>
          </div>
        </ElPopover>
      </div>
      <!--放大-->
      <ElTooltip
        :hide-after="0"
        :content="`${$t('packages_dag_button_zoom_in')}(${commandCode} +)`"
      >
        <button class="icon-btn" @click="$emit('zoom-in')">
          <VIcon size="20">add-outline</VIcon>
        </button>
      </ElTooltip>
      <el-divider direction="vertical" />
      <!--信息输出-->
      <ElTooltip :hide-after="0" :content="$t('public_task_log')">
        <button
          class="icon-btn"
          :class="{ active: showConsole }"
          @click="toggleConsole()"
        >
          <VIcon size="16">list</VIcon>
        </button> </ElTooltip
      ><el-divider direction="vertical" />
      <!--信息输出-->
      <ElTooltip
        transition="tooltip-fade-in"
        :content="$t('packages_dag_refresh_schema')"
      >
        <IconButton
          class="icon-btn"
          :loading="refreshing"
          sm
          @click="refreshSchema"
        >
          refresh
        </IconButton>
        <!--<button @click="loadSchema" class="icon-btn">
          <VIcon size="16">refresh</VIcon>
        </button>--> </ElTooltip
      ><el-divider direction="vertical" />
      <!--搜索节点-->
      <ElPopover
        v-model:visible="showSearchNodePopover"
        width="auto"
        placement="bottom"
        trigger="click"
        popper-class="rounded-xl p-0"
        @after-leave="nodeSearchInput = null"
      >
        <template #reference>
          <div class="inline-flex">
            <ElTooltip
              :hide-after="0"
              :content="$t('packages_dag_search_node')"
            >
              <button class="icon-btn mx-2">
                <VIcon size="20">magnify</VIcon>
              </button>
            </ElTooltip>
          </div>
        </template>

        <div class="choose-pane-wrap">
          <ElInput
            v-model="nodeSearchInput"
            class="input-filled"
            clearable
            :placeholder="$t('packages_business_custom_node_placeholder')"
          >
            <template #prefix>
              <VIcon size="14" class="ml-1 h-100">magnify</VIcon>
            </template>
          </ElInput>
          <ElDivider class="m-0" />
          <ElScrollbar
            tag="div"
            wrap-class="choose-list-wrap"
            view-class="choose-list p-1"
          >
            <div
              v-for="(node, i) in nodeList"
              :key="i"
              class="choose-item ellipsis px-4"
              @click="handleClickNode(node)"
            >
              {{ node.name }}
            </div>
            <VEmpty v-if="!nodeList.length" small />
          </ElScrollbar>
        </div>
      </ElPopover>
      <el-divider direction="vertical" />
      <ElTooltip
        transition="tooltip-fade-in"
        :content="$t('public_data_capture')"
      >
        <button class="icon-btn" @click="openDebug = true">
          <VIcon size="18">bug-outlined</VIcon>
        </button>
      </ElTooltip>
    </div>
    <!--复制dag查看不显示-->
    <div class="flex align-center flex-grow-1">
      <div class="flex-grow-1" />

      <ElButton class="ml-3" @click="$emit('showSettings')">
        <VIcon class="mr-1">cog-o</VIcon>{{ $t('public_button_setting') }}
      </ElButton>
      <ElButton
        v-if="!stateIsReadonly && buttonShowMap.Edit"
        :loading="isSaving"
        :disabled="
          (dataflow.disabledData && dataflow.disabledData.edit) ||
          $disabledReadonlyUserBtn()
        "
        class="ml-3"
        @click="$emit('save')"
      >
        <!--保存-->
        {{ $t('public_button_save') }}
      </ElButton>

      <ElButton
        v-if="
          dataflow.disabledData &&
          !dataflow.disabledData.reset &&
          buttonShowMap.Reset
        "
        :disabled="$disabledReadonlyUserBtn()"
        class="ml-3"
        :class="{ 'btn--text': isViewer }"
        type="warning"
        @click="$emit('reset')"
      >
        <VIcon v-if="isViewer">reset</VIcon>
        {{ $t('public_button_reset') }}
      </ElButton>
      <template v-if="stateIsReadonly">
        <ElButton
          v-if="stateIsReadonly"
          class="ml-3 btn--text"
          @click="$emit('detail')"
        >
          <VIcon>monitoring</VIcon>
          <!--运行监控-->
          {{ $t('packages_dag_task_list_button_monitor') }}
        </ElButton>
        <ElButton
          v-if="$route.name !== 'MigrateEditor' && buttonShowMap.Edit"
          class="ml-3 btn--text"
          :disabled="
            (dataflow.disabledData && dataflow.disabledData.edit) ||
            $disabledReadonlyUserBtn()
          "
          @click="$emit('edit')"
        >
          <VIcon class="mr-1">edit-outline</VIcon>{{ $t('public_button_edit') }}
        </ElButton>

        <ElButton
          v-if="dataflow.status === 'stopping' && buttonShowMap.Stop"
          class="ml-3 btn--text"
          :disabled="dataflow.disabledData && dataflow.disabledData.forceStop"
          @click="$emit('forceStop')"
        >
          <VIcon>stop</VIcon>
          {{ $t('public_button_force_stop') }}
        </ElButton>
        <ElButton
          v-else-if="buttonShowMap.Stop"
          class="ml-3 btn--text"
          :disabled="dataflow.disabledData && dataflow.disabledData.stop"
          @click="$emit('stop')"
        >
          <VIcon>stop</VIcon>
          {{ $t('public_button_stop') }}
        </ElButton>
      </template>

      <ElButton
        v-if="buttonShowMap.Start"
        :disabled="
          isSaving ||
          (dataflow.disabledData && dataflow.disabledData.start) ||
          transformLoading
        "
        class="ml-3"
        type="primary"
        @click="$emit('start')"
      >
        {{ $t('public_button_start') }}
      </ElButton>
    </div>

    <DataCaptureDebug
      :task-id="dataflow.id"
      :visible="openDebug"
      @update:visible="openDebug = $event"
      @start="$emit('debug-start')"
    />
  </header>
</template>

<style lang="scss" scoped>
$sidebarW: 236px;
$hoverBg: #eef3ff;
$radius: 6px;
$baseHeight: 26px;
$sidebarBg: #fff;

.btn-base {
  padding-left: 6px;
  padding-right: 6px;
  height: $baseHeight;
  background-color: #eee;
  color: #606266;
  border: none;
  border-radius: $radius;
  &:hover {
    background-color: #e1e1e1;
    color: #606266;
  }
  &.is-disabled {
    background: #eee;
    color: #bbb;
  }
}
.btn-operation {
  padding-left: 6px;
  padding-right: 10px;
  background-color: #e1e1e1;
  &:hover {
    background-color: #cfcfcf;
  }
}
.layout-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  width: 100%;
  flex: 0 0 48px;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.87);
  box-sizing: border-box;
  .title-wrap {
    width: $sidebarW;
  }

  .nav-icon {
    width: 40px;
    height: 100%;
    background-color: map.get($color, primary);
    cursor: pointer;
    font-size: 24px;
    &:hover {
      background-color: var(--primary-hover);
    }
  }

  .title-input-wrap {
    position: relative;
    flex: 1;
    max-width: 214px;
    font-size: 13px;

    &:hover {
      .title-input {
        border-color: #dcdfe6;
      }
      .title-input-icon {
        color: map.get($color, primary);
      }
    }

    .title-input {
      position: relative;
      padding-left: 8px;
      padding-right: 28px;
      width: 230px;
      height: 28px;
      line-height: 28px;
      outline: none;
      box-shadow: none;
      background: 0 0;
      border: 1px solid transparent;
      border-radius: 4px;
      transition: border-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

      &:focus {
        border-color: map.get($color, primary);
        & + .title-input-icon {
          color: map.get($color, primary);
        }
      }
    }

    .title-input-icon {
      position: absolute;
      right: 8px;
      height: 28px;
    }
  }

  .icon-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    padding: 4px;
    color: #4e5969;
    background: #fff;
    outline: none;
    border: 1px solid transparent;
    border-radius: $radius;
    transition:
      background,
      color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    cursor: pointer;

    &.active,
    &:hover {
      color: map.get($color, primary);
      background: $hoverBg;
    }
  }

  .icon-btn + .icon-btn {
    margin-left: 12px;
  }

  .btn-setting {
    padding: 0;
    $size: $baseHeight;
    &:hover {
      .btn-setting-icon {
        background: #e1e1e1;
        color: #606266;
      }
    }
    &-icon {
      width: $size;
      height: $size;
      background: rgba(225, 225, 225, 1);
      color: #606266;
      border-top-left-radius: $radius;
      border-bottom-left-radius: $radius;
    }
    &-text {
      display: inline-block;
      padding: 0 6px;
      height: $size;
      line-height: $size;
      vertical-align: top;
    }
  }

  .choose-size {
    .size-wrap {
      position: relative;
      padding: 0 6px;
      width: 48px;
      height: 30px;
      font-size: 14px;
      line-height: 30px;
      text-align: center;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        color: map.get($color, primary);
        background: $hoverBg;
      }
    }
  }

  :deep(.el-button) {
    line-height: 1;

    &.btn--text {
      min-width: auto;
      background: unset;
      border: none;
      padding: 7px 8px;
      &:hover {
        background: $hoverBg;
      }
      > span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  :deep(.el-link--inner) {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .operation-center {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>

<style lang="scss">
.choose-pane-wrap {
  max-width: 450px;
}

.input-filled {
  .el-input__wrapper {
    box-shadow: none;
  }
}
.choose-list-wrap {
  max-width: 450px;
  max-height: 274px;
}
.choose-list {
  .choose-item {
    margin-bottom: 2px;
    min-width: 148px;
    font-size: 12px;
    line-height: 32px;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      background-color: #edf1f9;
    }
  }
  &.auto-width .choose-item {
    min-width: unset;
  }
  .kbd-wrap {
    kbd {
      display: inline-block;
      width: 18px;
      height: 18px;
      padding: 0;
      line-height: 16px;
      font-size: 12px;
      font-family: Arial, monospace;
      text-align: center;
      background: rgba(150, 150, 150, 0.06);
      border: 1px solid rgba(100, 100, 100, 0.1);
      border-radius: 3px;
    }
  }
}
</style>
