<template>
  <header class="layout-header border-bottom px-4 text-nowrap">
    <div class="left-content flex align-center overflow-hidden">
      <button @click="$emit('page-return')" class="icon-btn mr-2">
        <VIcon size="18">left</VIcon>
      </button>
      <div class="overflow-hidden">
        <div class="flex align-items-center">
          <TextEditable
            class="overflow-hidden"
            v-model="name"
            :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
            :input-min-width="32"
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
      <div v-if="dataflow.agentId && !hideMenus.includes('agent')" class="agent-data__item ml-4 px-4">
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

    <div class="flex align-center">
      <!--内容居中-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_button_center_content') + '(Shift + 1)'">
        <button @click="$emit('center-content')" class="icon-btn">
          <VIcon size="20">compress</VIcon>
        </button>
      </ElTooltip>
      <VDivider class="mx-3" vertical></VDivider>
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
      <VDivider class="mx-3" vertical></VDivider>
      <!--设置-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('public_button_setting')">
        <button @click="$emit('showSettings')" class="icon-btn" :class="{ active: activeType === 'settings' }">
          <VIcon size="20">setting-outline</VIcon>
        </button>
      </ElTooltip>
      <ElTooltip transition="tooltip-fade-in" :content="$t('packages_dag_monitor_bottompanel_rizhi')">
        <button :class="{ active: showBottomPanel }" class="icon-btn" @click="$emit('showBottomPanel')">
          <VIcon size="16">list</VIcon>
        </button>
      </ElTooltip>
    </div>
    <div class="flex-grow-1"></div>
    <div class="flex align-center ml-2">
      <template v-if="!hideMenus.includes('operation')">
        <ElButton
          v-if="!(dataflow.disabledData && dataflow.disabledData.reset)"
          :disabled="$disabledReadonlyUserBtn()"
          class="mx-2"
          size="medium"
          @click="$emit('reset')"
        >
          {{ $t('public_button_reset') }}
        </ElButton>
        <ElButton
          v-if="dataflow.disabledData && !dataflow.disabledData.edit"
          :disabled="$disabledReadonlyUserBtn()"
          class="mx-2"
          size="medium"
          @click="$emit('edit')"
        >
          {{ $t('public_button_edit') }}
        </ElButton>
        <ElButton
          v-if="!(dataflow.disabledData && dataflow.disabledData.start)"
          :disabled="$disabledReadonlyUserBtn()"
          class="mx-2"
          size="medium"
          type="primary"
          @click="$emit('start')"
        >
          {{ $t('public_button_start') }}
        </ElButton>
        <template v-else>
          <ElButton
            v-if="isShowForceStop(dataflow)"
            :disabled="(dataflow.disabledData && dataflow.disabledData.forceStop) || $disabledReadonlyUserBtn()"
            key="forceStop"
            class="mx-2"
            size="medium"
            type="danger"
            @click="$emit('forceStop')"
          >
            {{ $t('public_button_force_stop') }}
          </ElButton>
          <ElButton
            v-else
            :disabled="(dataflow.disabledData && dataflow.disabledData.stop) || $disabledReadonlyUserBtn()"
            key="stop"
            size="medium"
            type="danger"
            class="mx-2"
            @click="$emit('stop')"
          >
            {{ $t('public_button_stop') }}
          </ElButton>
        </template>
      </template>
    </div>
  </header>
</template>

<script>
import i18n from '@tap/i18n'

import { mapGetters, mapMutations, mapState } from 'vuex'
import dayjs from 'dayjs'

import focusSelect from '@tap/component/src/directives/focusSelect'
import { TextEditable, VIcon, VDivider, OverflowTooltip } from '@tap/component'
import { TaskStatus } from '@tap/business'
import syncTaskAgent from '@tap/business/src/mixins/syncTaskAgent'

export default {
  name: 'TopHeader',

  directives: { focusSelect },

  props: {
    loading: Boolean,
    dataflowName: String,
    dataflow: Object,
    scale: Number,
    showBottomPanel: Boolean,
    hideMenus: {
      type: Array,
      default: () => []
    },
    quota: Object
  },

  mixins: [syncTaskAgent],

  components: { VIcon, TaskStatus, VDivider, OverflowTooltip, TextEditable },

  data() {
    const isMacOs = /(ipad|iphone|ipod|mac)/i.test(navigator.platform)
    return {
      commandCode: isMacOs ? '⌘' : 'Ctrl',
      optionCode: isMacOs ? 'Option' : 'Alt',
      name: '',
      syncMap: {
        'initial_sync+cdc': this.$t('public_task_type_initial_sync') + '+' + this.$t('public_task_type_cdc'),
        initial_sync: this.$t('public_task_type_initial_sync'),
        cdc: this.$t('public_task_type_cdc')
      },
      chooseItems: [4, 2, 1.5, 1, 0.5, 0.25],
      showSearchNodePopover: false,
      nodeSearchInput: '',
      editSvg: require('@tap/assets/images/edit-fill.svg'),
      syncType: {
        initial_sync: i18n.t('public_task_type_initial_sync'),
        cdc: i18n.t('public_task_type_cdc'),
        'initial_sync+cdc': i18n.t('public_task_type_initial_sync_and_cdc')
      }
    }
  },

  computed: {
    ...mapGetters('dataflow', ['dataflowId', 'allNodes', 'activeType']),
    ...mapState('dataflow', ['spaceKeyPressed']),

    scaleTxt() {
      return Math.round(this.scale * 100) + '%'
    },

    startTime() {
      const { startTime } = this.dataflow
      return startTime ? dayjs(startTime).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    lastStartDate() {
      const { lastStartDate } = this.dataflow
      return lastStartDate ? dayjs(lastStartDate).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    agentData() {
      const data = this.quota?.samples?.agentData?.[0] || {}
      const { cpuUsage, gcRate, memoryRate } = data
      return {
        cpuUsage:
          typeof cpuUsage === 'number'
            ? (cpuUsage * 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
            : '',
        memoryRate:
          typeof memoryRate === 'number'
            ? (memoryRate * 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
            : '',
        gcRate:
          typeof gcRate === 'number'
            ? (gcRate * 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
            : ''
      }
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
    ...mapMutations('dataflow', ['setActiveType', 'setPaperSpaceKeyPressed']),

    isShowForceStop(dataflow) {
      return ['stopping'].includes(dataflow.status)
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
    background-color: map-get($color, primary);
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
    transition: background, color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    cursor: pointer;

    &.active,
    &:not(.disabled):hover {
      color: map-get($color, primary);
      background: $hoverBg;
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
        color: map-get($color, primary);
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
