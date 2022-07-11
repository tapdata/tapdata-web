<template>
  <header class="layout-header border-bottom px-4">
    <button @click="$emit('page-return')" class="icon-btn">
      <VIcon size="18">left</VIcon>
    </button>

    <TextEditable
      v-model="name"
      class="mr-3"
      placeholder="请输入任务名称"
      max-width="260"
      @change="onNameInputChange"
    />

    <div class="flex align-center flex-grow-1">
      <div class="flex-grow-1"></div>
      <ElTooltip transition="tooltip-fade-in" content="校验">
        <button
          @click="$emit('handleHide', 'settings').$emit('handleShow', 'verify')"
          class="icon-btn"
          :class="{ active: activeType && activeType.includes('verify') }"
        >
          <VIcon size="20">verify-list</VIcon>
        </button>
      </ElTooltip>
      <ElTooltip transition="tooltip-fade-in" content="日志">
        <button
          @click="$emit('handleShow', 'record')"
          class="icon-btn"
          :class="{ active: activeType && activeType.includes('record') }"
        >
          <VIcon size="20">list</VIcon>
        </button>
      </ElTooltip>
      <ElTooltip transition="tooltip-fade-in" :content="t('button_setting')">
        <button
          @click="$emit('handleHide', 'verify').$emit('handleShow', 'settings')"
          class="icon-btn"
          :class="{ active: activeType && activeType.includes('settings') }"
        >
          <VIcon size="20">setting-outline</VIcon>
        </button>
      </ElTooltip>
      <ElTooltip
        v-if="dataflow.disabledData && !dataflow.disabledData.edit"
        transition="tooltip-fade-in"
        :content="t('button_edit')"
      >
        <button @click="$emit('edit')" class="icon-btn">
          <VIcon size="20">edit</VIcon>
        </button>
      </ElTooltip>

      <!--      <template>-->
      <!--        <ElButton-->
      <!--          key="edit"-->
      <!--          size="mini"-->
      <!--          class="mx-1 btn&#45;&#45;text"-->
      <!--          :disabled="dataflow.disabledData && dataflow.disabledData.edit"-->
      <!--          @click="$emit('edit')"-->
      <!--        >-->
      <!--          <VIcon>edit</VIcon>-->
      <!--          &lt;!&ndash;编辑&ndash;&gt;-->
      <!--          {{ t('button_edit') }}-->
      <!--        </ElButton>-->

      <!--              <ElButton-->
      <!--                key="forceStop"-->
      <!--                v-if="isShowForceStop(dataflow.statuses)"-->
      <!--                class="mx-1 btn&#45;&#45;text"-->
      <!--                :disabled="dataflow.disabledData && dataflow.disabledData.stop"-->
      <!--                size="mini"-->
      <!--                @click="$emit('forceStop')"-->
      <!--              >-->
      <!--                <VIcon>stop</VIcon>-->
      <!--                {{ t('task_list_force_stop') }}-->
      <!--              </ElButton>-->
      <!--              <ElButton-->
      <!--                key="stop"-->
      <!--                v-else-->
      <!--                class="mx-1 btn&#45;&#45;text"-->
      <!--                :disabled="dataflow.disabledData && dataflow.disabledData.stop"-->
      <!--                size="mini"-->
      <!--                @click="$emit('stop')"-->
      <!--              >-->
      <!--                <VIcon>stop</VIcon>-->
      <!--                {{ t('task_list_stop') }}-->
      <!--              </ElButton>-->
      <!--        <ElButton-->
      <!--          key="reset"-->
      <!--          class="mx-1 btn&#45;&#45;text"-->
      <!--          :disabled="dataflow.disabledData && dataflow.disabledData.reset"-->
      <!--          size="mini"-->
      <!--          @click="$emit('reset')"-->
      <!--        >-->
      <!--          <VIcon>reset</VIcon>-->
      <!--          {{ t('dataFlow_button_reset') }}-->
      <!--        </ElButton>-->
      <!--      </template>-->
      <ElButton v-if="isShowReset(dataflow.statuses)" size="mini" class="mx-2" @click="$emit('reset')">
        {{ t('dataFlow_button_reset') }}
      </ElButton>
      <ElButton
        v-if="isShowStart(dataflow.statuses)"
        :disabled="
          dataflow.disabledData && dataflow.disabledData.start && dataflow.statuses && dataflow.statuses.length > 0
        "
        size="mini"
        class="mx-2"
        type="primary"
        @click="$emit('start')"
      >
        {{ t('task_list_run') }}
      </ElButton>
      <template v-else>
        <ElButton
          v-if="isShowForceStop(dataflow.statuses)"
          key="forceStop"
          class="mx-2"
          :disabled="dataflow.disabledData && dataflow.disabledData.stop"
          size="mini"
          type="danger"
          @click="$emit('forceStop')"
        >
          {{ t('task_list_force_stop') }}
        </ElButton>
        <ElButton
          key="stop"
          v-else
          class="mx-2"
          :disabled="dataflow.disabledData && dataflow.disabledData.stop"
          size="mini"
          type="danger"
          @click="$emit('stop')"
        >
          {{ t('task_list_stop') }}
        </ElButton>
      </template>
    </div>
  </header>
</template>

<script>
import VIcon from 'web-core/components/VIcon'
import focusSelect from 'web-core/directives/focusSelect'
import { mapGetters, mapMutations, mapState } from 'vuex'
import { TextEditable } from '@tap/component'
import Locale from '../../mixins/locale'

export default {
  name: 'TopHeader',

  directives: { focusSelect },

  mixins: [Locale],

  props: {
    loading: Boolean,
    dataflowName: String,
    dataflow: Object,
    scale: Number
  },

  components: { VIcon, TextEditable },

  data() {
    return {
      name: '',
      syncMap: {
        'initial_sync+cdc': this.t('dataFlow_initial_sync') + '+' + this.t('dataFlow_cdc'),
        initial_sync: this.t('dataFlow_initial_sync'),
        cdc: this.t('dataFlow_cdc')
      },
      chooseItems: [4, 2, 1.5, 1, 0.5, 0.25],
      showSearchNodePopover: false,
      nodeSearchInput: ''
    }
  },

  computed: {
    ...mapGetters('dataflow', ['dataflowId', 'allNodes', 'activeType']),
    ...mapState('dataflow', ['spaceKeyPressed']),

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
    ...mapMutations('dataflow', ['setActiveType', 'setPaperSpaceKeyPressed']),

    isShowStart(data) {
      return (
        !data?.length ||
        data?.some(t => ['ready', 'complete', 'error', 'schedule_failed', 'stop', 'edit'].includes(t.status))
      )
    },

    isShowReset(data) {
      return data?.length && data.some(t => ['complete', 'error', 'schedule_failed', 'stop'].includes(t.status))
    },

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
  //justify-content: space-between;
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
    width: 30px;
    height: 30px;
    padding: 5px;
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

  //::v-deep {
  //  .el-button {
  //    line-height: 1;
  //
  //    &.btn--text {
  //      min-width: auto;
  //      background: unset;
  //      border: none;
  //      padding: 7px 8px;
  //      &:hover {
  //        background: $hoverBg;
  //      }
  //      > span {
  //        display: flex;
  //        align-items: center;
  //        gap: 4px;
  //      }
  //    }
  //  }
  //  .el-link--inner {
  //    display: flex;
  //    align-items: center;
  //    gap: 4px;
  //  }
  //}

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
