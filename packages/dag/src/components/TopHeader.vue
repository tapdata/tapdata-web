<template>
  <header class="layout-header border-bottom px-4">
    <button @click="$emit('page-return')" class="icon-btn mr-2">
      <VIcon size="18">left</VIcon>
    </button>

    <TextEditable
      v-model="name"
      class="mr-3"
      :readonly="stateIsReadonly"
      :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
      max-width="260"
      hidden-icon
      :input-min-width="32"
      @change="onNameInputChange"
    />

    <slot name="status" :result="dataflow.statusResult">
      <TaskStatus :task="dataflow" />
    </slot>

    <div class="operation-center flex align-center">
      <template v-if="!stateIsReadonly">
        <!--撤销-->
        <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_undo') + `(${commandCode} + Z)`">
          <button @click="$emit('undo')" class="icon-btn">
            <VIcon size="20">undo</VIcon>
          </button>
        </ElTooltip>
        <!--重做-->
        <ElTooltip
          transition="tooltip-fade-in"
          :content="$t('packages_dag_button_redo') + `(${commandCode} + Shift + Z)`"
        >
          <button @click="$emit('redo')" class="icon-btn">
            <VIcon size="20">redo</VIcon>
          </button>
        </ElTooltip>
        <!--删除-->
        <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_delete') + '(Del)'">
          <button @click="$emit('delete')" class="icon-btn">
            <VIcon size="20">delete</VIcon>
          </button>
        </ElTooltip>
      </template>
      <!--内容居中-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_center_content') + '(Shift + 1)'">
        <button @click="$emit('center-content')" class="icon-btn">
          <VIcon size="20">compress</VIcon>
        </button>
      </ElTooltip>
      <!--自动布局-->
      <ElTooltip
        transition="tooltip-fade-in"
        :content="$t('packages_dag_button_auto_layout') + `(${commandCode} + ${optionCode} + L)`"
      >
        <button @click="$emit('auto-layout')" class="icon-btn">
          <VIcon size="20">auto-layout</VIcon>
        </button>
      </ElTooltip>
      <!--移动画布-->
      <!--<ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_move_paper')">
        <button @click="toggleMovePaper" class="icon-btn" :class="{ active: spaceKeyPressed }">
          <VIcon size="20">hand</VIcon>
        </button>
      </ElTooltip>-->
      <!--拖选画布-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_mouse_selection')">
        <button @click="toggleShiftKeyPressed()" class="icon-btn" :class="{ active: shiftKeyPressed }">
          <VIcon size="20">kuangxuan</VIcon>
        </button>
      </ElTooltip>
      <VDivider class="mx-3" vertical inset></VDivider>
      <!--缩小-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_zoom_out') + `(${commandCode} -)`">
        <button @click="$emit('zoom-out')" class="icon-btn">
          <VIcon size="20">remove-outline</VIcon>
        </button>
      </ElTooltip>
      <div class="choose-size mx-2">
        <ElPopover placement="bottom" trigger="hover" popper-class="rounded-xl p-0">
          <div slot="reference" class="size-wrap">{{ scaleTxt }}</div>
          <div class="choose-list p-2">
            <div @click="$emit('zoom-in')" class="choose-item pl-4 flex justify-content-between align-center">
              <span class="title">{{ $t('packages_dag_button_zoom_out') }}</span>
              <div class="kbd-wrap flex align-center mr-2"><kbd>⌘</kbd><span class="mx-1">+</span><kbd>+</kbd></div>
            </div>
            <div @click="$emit('zoom-out')" class="choose-item pl-4 flex justify-content-between align-center">
              <span class="title">{{ $t('packages_dag_button_zoom_in') }}</span>
              <div class="kbd-wrap flex align-center mr-2"><kbd>⌘</kbd><span class="mx-1">+</span><kbd>–</kbd></div>
            </div>
            <VDivider class="my-2"></VDivider>
            <div v-for="val in chooseItems" :key="val" class="choose-item pl-4" @click="$emit('zoom-to', val)">
              {{ val * 100 }}%
            </div>
          </div>
        </ElPopover>
      </div>
      <!--放大-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_zoom_in') + `(${commandCode} +)`">
        <button @click="$emit('zoom-in')" class="icon-btn">
          <VIcon size="20">add-outline</VIcon>
        </button>
      </ElTooltip>
      <VDivider class="mx-3" vertical inset></VDivider>
      <!--信息输出-->
      <ElTooltip
        transition="tooltip-fade-in"
        :content="$t('packages_dag_monitor_bottompanel_rizhi')"
        v-if="$route.name === 'MigrateEditor'"
      >
        <button @click="toggleConsole()" class="icon-btn" :class="{ active: showConsole }">
          <VIcon size="16">list</VIcon>
        </button>
      </ElTooltip>
      <!--设置-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_setting')">
        <button @click="$emit('showSettings')" class="icon-btn" :class="{ active: activeType === 'settings' }">
          <VIcon size="20">setting-outline</VIcon>
        </button>
      </ElTooltip>
    </div>
    <!--复制dag查看不显示-->
    <div class="flex align-center flex-grow-1" v-if="$route.name !== 'MigrateViewer'">
      <div class="flex-grow-1"></div>
      <ElButton v-if="stateIsReadonly" size="medium" class="mx-1 btn--text" @click="$emit('detail')">
        <VIcon>monitoring</VIcon>
        <!--运行监控-->
        {{ $t('packages_dag_task_list_button_monitor') }}
      </ElButton>

      <ElButton
        v-if="dataflow.disabledData && dataflow.disabledData.reset"
        key="reset"
        class="mx-1 btn--text"
        size="medium"
        @click="$emit('reset')"
      >
        <VIcon>reset</VIcon>
        {{ $t('packages_dag_dataFlow_button_reset') }}
      </ElButton>

      <ElButton
        v-if="!stateIsReadonly"
        :loading="isSaving"
        :disabled="dataflow.disabledData && dataflow.disabledData.edit"
        class="mx-2"
        size="medium"
        @click="$emit('save')"
      >
        <!--保存-->
        {{ $t('packages_dag_button_save') }}
      </ElButton>
      <template v-else>
        <ElButton
          v-if="$route.name !== 'MigrateEditor'"
          key="edit"
          class="mx-1 btn--text"
          size="medium"
          :disabled="dataflow.disabledData && dataflow.disabledData.edit"
          @click="$emit('edit')"
        >
          <VIcon>edit</VIcon>
          <!--编辑-->
          {{ $t('packages_dag_button_edit') }}
        </ElButton>

        <ElButton
          key="forceStop"
          v-if="dataflow.status === 'stopping'"
          class="mx-1 btn--text"
          :disabled="dataflow.disabledData && dataflow.disabledData.forceStop"
          size="medium"
          @click="$emit('forceStop')"
        >
          <VIcon>stop</VIcon>
          {{ $t('packages_dag_task_list_force_stop') }}
        </ElButton>
        <ElButton
          key="stop"
          v-else
          class="mx-1 btn--text"
          :disabled="dataflow.disabledData && dataflow.disabledData.stop"
          size="medium"
          @click="$emit('stop')"
        >
          <VIcon>stop</VIcon>
          {{ $t('packages_dag_task_list_stop') }}
        </ElButton>
      </template>

      <ElButton
        :disabled="isSaving || (dataflow.disabledData && dataflow.disabledData.start) || transformLoading"
        class="mx-2"
        size="medium"
        type="primary"
        @click="$emit('start')"
      >
        {{ $t('packages_dag_task_list_run') }}
      </ElButton>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import { VIcon, TextEditable, VDivider } from '@tap/component'
import { TaskStatus } from '@tap/business'
import focusSelect from '@tap/component/src/directives/focusSelect'

export default {
  name: 'TopHeader',

  directives: { focusSelect },

  props: {
    loading: Boolean,
    isSaving: Boolean,
    dataflowName: String,
    dataflow: Object,
    scale: Number
  },

  components: { TextEditable, TaskStatus, VDivider, VIcon },

  data() {
    const isMacOs = /(ipad|iphone|ipod|mac)/i.test(navigator.platform)
    return {
      commandCode: isMacOs ? '⌘' : 'Ctrl',
      optionCode: isMacOs ? 'Option' : 'Alt',
      name: '',
      syncMap: {
        'initial_sync+cdc': this.$t('packages_dag_dataFlow_initial_sync') + '+' + this.$t('packages_dag_dataFlow_cdc'),
        initial_sync: this.$t('packages_dag_dataFlow_initial_sync'),
        cdc: this.$t('packages_dag_dataFlow_cdc')
      },
      chooseItems: [4, 2, 1.5, 1, 0.5, 0.25],
      showSearchNodePopover: false,
      nodeSearchInput: ''
    }
  },

  computed: {
    ...mapGetters('dataflow', ['dataflowId', 'stateIsReadonly', 'allNodes', 'activeType']),
    ...mapState('dataflow', ['spaceKeyPressed', 'shiftKeyPressed', 'showConsole', 'transformLoading']),

    scaleTxt() {
      return Math.round(this.scale * 100) + '%'
    }
  },

  watch: {
    dataflowName(v) {
      this.name = v
    }
  },

  mounted() {
    this.name = this.dataflowName
  },

  methods: {
    ...mapMutations('dataflow', ['setActiveType', 'toggleShiftKeyPressed', 'toggleConsole']),

    isShowForceStop(data) {
      return data?.length && data.every(t => ['stopping'].includes(t.status))
    },

    onNameInputChange() {
      if (!this.name) {
        this.name = this.dataflowName
      } else {
        this.$emit('change-name', this.name)
      }
    },

    focusNameInput() {
      this.$refs.nameInput.focus()
    },

    back() {
      let mapping = this.$route.query.mapping
      const $PLATFORM = window.getSettingByKey('DFS_TCM_PLATFORM')
      const backToList = () => {
        if ($PLATFORM === 'dfs') {
          top.window.App.$router.push({
            name: 'Task'
          })
        } else {
          this.$router.push({
            name: 'dataFlows',
            query: {
              mapping: mapping
            }
          })
        }
      }
      backToList()
    }
  }
}
</script>

<style scoped lang="scss">
$sidebarW: 236px;
$hoverBg: #eef3ff;
$radius: 4px;
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
    background-color: map-get($color, primary);
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
        color: map-get($color, primary);
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
        border-color: map-get($color, primary);
        & + .title-input-icon {
          color: map-get($color, primary);
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
    transition: background, color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    cursor: pointer;

    &.active,
    &:hover {
      color: map-get($color, primary);
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
        color: map-get($color, primary);
        background: $hoverBg;
      }
    }
  }

  ::v-deep {
    .el-button {
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
    .el-link--inner {
      display: flex;
      align-items: center;
      gap: 4px;
    }
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
  .input-filled .el-input__inner {
    height: 40px;
    line-height: 40px;
  }
}

.input-filled {
  .el-input__inner {
    border: 0;
    border-radius: 0;
    background: unset;
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
