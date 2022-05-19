<template>
  <header class="layout-header border-bottom px-4">
    <button @click="$emit('page-return')" class="icon-btn">
      <VIcon size="20">left</VIcon>
    </button>
    <div class="title-input-wrap flex align-center mx-2 flex-shrink-0 h-100" :data-value="hiddenValue">
      <input
        v-focus-select
        ref="nameInput"
        v-model.trim="name"
        class="title-input"
        :readonly="stateIsReadonly"
        @change="onNameInputChange"
      />
      <VIcon v-if="!stateIsReadonly" @click="focusNameInput" class="title-input-icon" size="14">edit-outline</VIcon>
    </div>

    <StatusItem inline :value="dataflow.statusResult" />

    <div class="operation-center flex align-center">
      <template v-if="!stateIsReadonly">
        <!--撤销-->
        <ElTooltip transition="tooltip-fade-in" :content="$t('button_undo')">
          <button @click="$emit('undo')" class="icon-btn">
            <VIcon size="20">undo</VIcon>
          </button>
        </ElTooltip>
        <!--重做-->
        <ElTooltip transition="tooltip-fade-in" :content="$t('button_redo')">
          <button @click="$emit('redo')" class="icon-btn">
            <VIcon size="20">redo</VIcon>
          </button>
        </ElTooltip>
        <!--删除-->
        <ElTooltip transition="tooltip-fade-in" :content="$t('button_delete')">
          <button @click="$emit('delete')" class="icon-btn">
            <VIcon size="20">delete</VIcon>
          </button>
        </ElTooltip>
      </template>
      <!--内容居中-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('button_center_content')">
        <button @click="$emit('center-content')" class="icon-btn">
          <VIcon size="20">compress</VIcon>
        </button>
      </ElTooltip>
      <!--自动布局-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('button_auto_layout')">
        <button @click="$emit('auto-layout')" class="icon-btn">
          <VIcon size="20">auto-layout</VIcon>
        </button>
      </ElTooltip>
      <!--移动画布-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('button_move_paper')">
        <button @click="toggleMovePaper" class="icon-btn" :class="{ active: spaceKeyPressed }">
          <VIcon size="20">hand</VIcon>
        </button>
      </ElTooltip>
      <VDivider class="mx-3" vertical inset></VDivider>
      <!--缩小-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('button_zoom_out')">
        <button @click="$emit('zoom-out')" class="icon-btn">
          <VIcon size="20">remove-outline</VIcon>
        </button>
      </ElTooltip>
      <div class="choose-size mx-2">
        <ElPopover placement="bottom" trigger="hover" popper-class="rounded-xl p-0">
          <div slot="reference" class="size-wrap">{{ scaleTxt }}</div>
          <div class="choose-list p-2">
            <div @click="$emit('zoom-in')" class="choose-item pl-4 flex justify-content-between align-center">
              <span class="title">{{ $t('button_zoom_out') }}</span>
              <div class="kbd-wrap flex align-center mr-2"><kbd>⌘</kbd><span class="mx-1">+</span><kbd>+</kbd></div>
            </div>
            <div @click="$emit('zoom-out')" class="choose-item pl-4 flex justify-content-between align-center">
              <span class="title">{{ $t('button_zoom_in') }}</span>
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
      <ElTooltip transition="tooltip-fade-in" :content="$t('button_zoom_in')">
        <button @click="$emit('zoom-in')" class="icon-btn">
          <VIcon size="20">add-outline</VIcon>
        </button>
      </ElTooltip>
      <VDivider class="mx-3" vertical inset></VDivider>
      <!--搜索节点-->
      <ElPopover
        v-model="showSearchNodePopover"
        placement="bottom"
        trigger="click"
        popper-class="rounded-xl p-0"
        @after-leave="nodeSearchInput = null"
      >
        <ElTooltip slot="reference" transition="tooltip-fade-in" :content="$t('button_search_node')">
          <button class="icon-btn mx-2">
            <VIcon size="20">magnify</VIcon>
          </button>
        </ElTooltip>

        <div class="choose-pane-wrap">
          <ElInput class="input-filled" v-model="nodeSearchInput" :placeholder="$t('dag_search_node_placeholder')">
            <template #prefix>
              <VIcon size="14" class="ml-1 h-100">magnify</VIcon>
            </template>
          </ElInput>
          <ElDivider class="m-0" />
          <ElScrollbar tag="div" wrap-class="choose-list-wrap" view-class="choose-list p-2">
            <div
              v-for="(node, i) in nodeList"
              :key="i"
              class="choose-item ellipsis px-4"
              @click="handleClickNode(node)"
            >
              {{ node.name }}
            </div>
            <EmptyItem v-if="!nodeList.length"></EmptyItem>
          </ElScrollbar>
        </div>
      </ElPopover>
      <!--设置-->
      <ElTooltip transition="tooltip-fade-in" :content="$t('button_setting')">
        <button @click="$emit('showSettings')" class="icon-btn" :class="{ active: spaceKeyPressed }">
          <VIcon size="20">setting</VIcon>
        </button>
      </ElTooltip>
    </div>
    <div class="flex align-center flex-grow-1">
      <div class="flex-grow-1"></div>

      <ElButton
        v-if="stateIsReadonly"
        size="mini"
        class="mx-1 btn--text"
        @click="
          $router.push({
            name: 'dataflowDetails',
            params: {
              id: dataflow.id
            }
          })
        "
      >
        <VIcon>monitoring</VIcon>
        <!--运行监控-->
        {{ $t('task_list_button_monitor') }}
      </ElButton>

      <ElButton v-if="!stateIsReadonly" :loading="isSaving" size="mini" class="mx-2" @click="$emit('save')">
        <!--保存-->
        {{ $t('button_save') }}
      </ElButton>
      <template v-else>
        <ElButton
          key="edit"
          size="mini"
          class="mx-1 btn--text"
          :disabled="dataflow.disabledData && dataflow.disabledData.edit"
          @click="$emit('edit')"
        >
          <VIcon>edit</VIcon>
          <!--编辑-->
          {{ $t('button_edit') }}
        </ElButton>

        <ElButton
          key="forceStop"
          v-if="isShowForceStop(dataflow.statuses)"
          class="mx-1 btn--text"
          :disabled="dataflow.disabledData && dataflow.disabledData.stop"
          size="mini"
          @click="$emit('forceStop')"
        >
          <VIcon>stop</VIcon>
          {{ $t('task_list_force_stop') }}
        </ElButton>
        <ElButton
          key="stop"
          v-else
          class="mx-1 btn--text"
          :disabled="dataflow.disabledData && dataflow.disabledData.stop"
          size="mini"
          @click="$emit('stop')"
        >
          <VIcon>stop</VIcon>
          {{ $t('task_list_stop') }}
        </ElButton>
        <ElButton
          key="reset"
          class="mx-1 btn--text"
          :disabled="dataflow.disabledData && dataflow.disabledData.reset"
          size="mini"
          @click="$emit('reset')"
        >
          <VIcon>reset</VIcon>
          {{ $t('dataFlow.button.reset') }}
        </ElButton>
      </template>

      <ElButton
        :disabled="isSaving || (dataflow.disabledData && dataflow.disabledData.start && dataflow.statuses.length > 0)"
        size="mini"
        class="mx-2"
        type="primary"
        @click="$emit('start')"
      >
        {{ $t('task_list_run') }}
      </ElButton>
    </div>
  </header>
</template>

<script>
import VIcon from 'web-core/components/VIcon'
import focusSelect from 'web-core/directives/focusSelect'
import { mapGetters, mapMutations, mapState } from 'vuex'
import VDivider from 'web-core/components/VDivider'
import { Select } from 'element-ui'
import EmptyItem from './EmptyItem'
import { StatusItem } from '@tap/business'

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

  components: { StatusItem, EmptyItem, VDivider, VIcon, ElScrollbar: Select.components.ElScrollbar },

  data() {
    return {
      name: '',
      syncMap: {
        'initial_sync+cdc': this.$t('dataFlow.initial_sync') + '+' + this.$t('dataFlow.cdc'),
        initial_sync: this.$t('dataFlow.initial_sync'),
        cdc: this.$t('dataFlow.cdc')
      },
      chooseItems: [4, 2, 1.5, 1, 0.5, 0.25],
      showSearchNodePopover: false,
      nodeSearchInput: ''
    }
  },

  computed: {
    ...mapGetters('dataflow', ['dataflowId', 'stateIsReadonly', 'allNodes']),
    ...mapState('dataflow', ['spaceKeyPressed']),

    syncTxt() {
      const settings = this.$store.getters['dataflow/dataflowSettings']
      return this.syncMap[settings.sync_type]
    },

    hiddenValue() {
      let value = this.name.replace(/\s/g, '.')
      return `${value}`
    },

    scaleTxt() {
      return Math.round(this.scale * 100) + '%'
    },

    nodeList() {
      if (this.nodeSearchInput) {
        const txt = this.nodeSearchInput.toLocaleLowerCase()
        return this.allNodes.filter(node => node.name.toLocaleLowerCase().includes(txt))
      }
      return this.allNodes
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
    },

    toggleMovePaper() {
      this.setPaperSpaceKeyPressed(!this.spaceKeyPressed)
    },

    handleClickNode(node) {
      this.showSearchNodePopover = false
      this.$emit('locate-node', node)
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
        border-color: #409eff;
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
    width: 30px;
    height: 30px;
    padding: 5px;
    background: #fff;
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
      min-width: 64px;
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
