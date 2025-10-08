<script>
import editSvg from '@tap/assets/images/edit-fill.svg'
import { TaskStatus } from '@tap/business'

import syncTaskAgent from '@tap/business/src/mixins/syncTaskAgent'
import { OverflowTooltip, TextEditable, VDivider, VIcon } from '@tap/component'

import focusSelect from '@tap/component/src/directives/focusSelect'
import i18n from '@tap/i18n'
import dayjs from 'dayjs'
import { mapGetters, mapMutations, mapState } from 'vuex'
import { $emit } from '../../../utils/gogocodeTransfer'
import DataCaptureDebug from '../DataCaptureDebug.vue'
import DataValidationDialog from '../DataValidationDialog.vue'

export default {
  name: 'TopHeader',
  directives: { focusSelect },
  components: {
    DataCaptureDebug,
    VIcon,
    TaskStatus,
    VDivider,
    OverflowTooltip,
    TextEditable,
    DataValidationDialog,
  },
  mixins: [syncTaskAgent],
  props: {
    loading: Boolean,
    dataflowName: String,
    dataflow: Object,
    scale: Number,
    showBottomPanel: Boolean,
    hideOperation: Boolean,
    hideMenus: {
      type: Array,
      default: () => [],
    },
    quota: Object,
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
      isCommunity: import.meta.env.VUE_APP_MODE === 'community',
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
      editSvg,
      syncType: {
        initial_sync: i18n.t('public_task_type_initial_sync'),
        cdc: i18n.t('public_task_type_cdc'),
        'initial_sync+cdc': i18n.t('public_task_type_initial_sync_and_cdc'),
      },
      openDebug: false,
      openValidation: false,
    }
  },
  computed: {
    ...mapGetters('dataflow', ['dataflowId', 'allNodes', 'activeType']),
    ...mapState('dataflow', ['spaceKeyPressed']),

    scaleTxt() {
      return `${Math.round(this.scale * 100)}%`
    },

    startTime() {
      const { startTime } = this.dataflow
      return startTime ? dayjs(startTime).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    lastStartDate() {
      const { lastStartDate } = this.dataflow
      return lastStartDate
        ? dayjs(lastStartDate).format('YYYY-MM-DD HH:mm:ss')
        : '-'
    },

    agentData() {
      const data = this.quota?.samples?.agentData?.[0] || {}
      const { cpuUsage, gcRate, memoryRate } = data
      return {
        cpuUsage:
          typeof cpuUsage === 'number'
            ? `${(cpuUsage * 100).toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}%`
            : '',
        memoryRate:
          typeof memoryRate === 'number'
            ? `${(memoryRate * 100).toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}%`
            : '',
        gcRate:
          typeof gcRate === 'number'
            ? `${(gcRate * 100).toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}%`
            : '',
      }
    },

    hideSetting() {
      // 心跳任务、共享缓存，不显示设置
      return ['connHeartbeat', 'shareCache'].includes(this.dataflow.syncType)
    },

    hideEdit() {
      // 心跳任务，不显示编辑
      return ['connHeartbeat'].includes(this.dataflow.syncType)
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
    ...mapMutations('dataflow', ['setActiveType', 'setPaperSpaceKeyPressed']),

    isShowForceStop(dataflow) {
      return ['stopping'].includes(dataflow.status)
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

      this.$router.push({
        name: 'dataFlows',
        query: {
          mapping,
        },
      })
    },

    handleOpenDebug() {
      if (this.dataflow.status === 'running') {
        this.$emit('open-capture')
        return
      }

      this.openDebug = true
    },
  },
  emits: [
    'page-return',
    'center-content',
    'zoom-out',
    'zoom-in',
    'zoom-to',
    'showBottomPanel',
    'showSettings',
    'edit',
    'reset',
    'start',
    'forceStop',
    'stop',
    'change-name',
    'page-return',
    'center-content',
    'zoom-out',
    'zoom-in',
    'zoom-to',
    'showBottomPanel',
    'showSettings',
    'edit',
    'reset',
    'start',
    'forceStop',
    'stop',
  ],
}
</script>

<template>
  <header class="layout-header border-bottom px-4 text-nowrap">
    <div class="left-content flex align-center overflow-hidden">
      <button class="icon-btn mr-2" @click="$emit('page-return')">
        <VIcon size="18">left</VIcon>
      </button>
      <div class="overflow-hidden">
        <div class="flex align-items-center">
          <TextEditable
            v-model:value="name"
            class="overflow-hidden"
            :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
            :maxlength="200"
            @change="onNameInputChange"
          />
          <TaskStatus :task="dataflow" :agent-map="agentMap" class="ml-4" />
        </div>
        <div class="flex align-items-center font-color-light mt-1">
          <span class="mr-2">{{ syncType[dataflow.type] }}</span>
          <template v-if="!hideMenus.includes('agent')">
            <span>{{ $t('packages_dag_monitor_topheader_zuijinyiciqi') }}</span>
            <span>{{ lastStartDate }}</span>
          </template>
        </div>
      </div>
      <div
        v-if="dataflow.agentId && !hideMenus.includes('agent')"
        class="agent-data__item ml-4 px-4"
      >
        <OverflowTooltip
          class="agent-name__item text-truncate mb-2 font-color-dark"
          placement="bottom"
          :text="dataflow.agentName"
          :open-delay="400"
        />
        <div v-if="agentData" class="font-color-sslight agent-statistical">
          <span>CPU：</span>
          <span>{{ agentData.cpuUsage }}</span>
          <span class="ml-3">MEM：</span>
          <span>{{ agentData.memoryRate }}</span>
          <span class="ml-3">GC：</span>
          <span>{{ agentData.gcRate }}</span>
        </div>
      </div>
    </div>

    <div v-if="!hideOperation" class="flex align-center">
      <!--内容居中-->
      <ElTooltip
        transition="tooltip-fade-in"
        :content="`${$t('packages_dag_button_center_content')}(Shift + 1)`"
      >
        <button class="icon-btn" @click="$emit('center-content')">
          <VIcon size="20">compress</VIcon>
        </button>
      </ElTooltip>
      <el-divider direction="vertical" />
      <!--缩小-->
      <ElTooltip
        transition="tooltip-fade-in"
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
          <div class="choose-list p-2">
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
            <VDivider class="my-2" />
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
        transition="tooltip-fade-in"
        :content="`${$t('packages_dag_button_zoom_in')}(${commandCode} +)`"
      >
        <button class="icon-btn" @click="$emit('zoom-in')">
          <VIcon size="20">add-outline</VIcon>
        </button>
      </ElTooltip>
      <el-divider direction="vertical" />
      <ElTooltip
        transition="tooltip-fade-in"
        :content="$t('packages_dag_monitor_bottompanel_rizhi')"
      >
        <button
          :class="{ active: showBottomPanel }"
          class="icon-btn"
          @click="$emit('showBottomPanel')"
        >
          <VIcon size="16">list</VIcon>
        </button>
      </ElTooltip>
      <el-divider direction="vertical" />
      <button
        v-if="buttonShowMap.Start"
        class="icon-btn"
        :class="{
          disabled:
            dataflow.disabledData &&
            dataflow.disabledData.start &&
            dataflow.status !== 'running',
        }"
        @click="handleOpenDebug"
      >
        <VIcon size="18">bug-outlined</VIcon>
      </button>
      <template v-if="isDaas && !isCommunity">
        <el-divider direction="vertical" />
        <ElTooltip
          transition="tooltip-fade-in"
          :content="$t('public_data_validation')"
        >
          <button class="icon-btn" @click="openValidation = true">
            <VIcon size="18">data-scan</VIcon>
          </button>
        </ElTooltip>
      </template>
    </div>
    <div class="flex-grow-1" />
    <div class="flex align-center ml-2">
      <ElButton
        v-if="!hideSetting && !hideOperation"
        class="ml-3"
        @click="$emit('showSettings')"
      >
        <VIcon class="mr-1">cog-o</VIcon>
        {{ $t('public_button_setting') }}
      </ElButton>
      <template v-if="!hideMenus.includes('operation')">
        <ElButton
          v-if="
            dataflow.disabledData &&
            !dataflow.disabledData.edit &&
            !hideEdit &&
            buttonShowMap.Edit
          "
          class="ml-3"
          @click="$emit('edit')"
        >
          <VIcon class="mr-1">edit-outline</VIcon>
          {{ $t('public_button_edit') }}
        </ElButton>
        <ElButton
          v-if="
            !(dataflow.disabledData && dataflow.disabledData.reset) &&
            buttonShowMap.Reset
          "
          class="ml-3"
          type="warning"
          @click="$emit('reset')"
        >
          {{ $t('public_button_reset') }}
        </ElButton>
        <ElButton
          v-if="
            !(dataflow.disabledData && dataflow.disabledData.start) &&
            buttonShowMap.Start
          "
          class="ml-3"
          type="primary"
          @click="$emit('start')"
        >
          {{ $t('public_button_start') }}
        </ElButton>
        <template v-else>
          <ElButton
            v-if="isShowForceStop(dataflow) && buttonShowMap.Stop"
            :disabled="dataflow.disabledData && dataflow.disabledData.forceStop"
            class="ml-3"
            type="danger"
            @click="$emit('forceStop')"
          >
            {{ $t('public_button_force_stop') }}
          </ElButton>
          <ElButton
            v-else-if="buttonShowMap.Stop"
            :disabled="dataflow.disabledData && dataflow.disabledData.stop"
            type="danger"
            class="ml-3"
            @click="$emit('stop')"
          >
            {{ $t('public_button_stop') }}
          </ElButton>
        </template>
      </template>
    </div>

    <DataCaptureDebug
      :visible="openDebug"
      :task-id="dataflow.id"
      @update:visible="openDebug = $event"
      @start="$emit('debug-start')"
    />

    <DataValidationDialog v-model="openValidation" :task-id="dataflow.id" />
  </header>
</template>

<style lang="scss" scoped>
$sidebarW: 236px;
$hoverBg: #eef3ff;
$radius: 6px;
$baseHeight: 26px;
$sidebarBg: #fff;

.layout-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  width: 100%;
  flex: 0 0 64px;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.87);
  box-sizing: border-box;
  .left-content {
    min-width: calc(50% - 140px);
  }

  .nav-icon {
    width: 40px;
    height: 100%;
    background-color: var(--color-primary);
    cursor: pointer;
    font-size: 24px;

    &:hover {
      background-color: var(--primary-hover);
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
    &:not(.disabled):hover {
      color: var(--color-primary);
      background: $hoverBg;
    }

    &.disabled {
      opacity: 0.8;
      pointer-events: none;
      cursor: not-allowed !important;
    }
  }

  .icon-btn + .icon-btn {
    margin-left: 10px;
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
        color: var(--color-primary);
        background: $hoverBg;
      }
    }
  }

  .operation-center {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .agent-statistical {
    min-width: 260px;
  }
}
.agent-data__item {
  border-left: 1px solid #f2f2f2;
}
</style>

<style lang="scss">
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
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background-color: var(--el-fill-color-light);
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
