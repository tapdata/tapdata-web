<template>
  <header class="layout-header border-bottom px-4">
    <button @click="$router.push({ name: 'Task' })" class="icon-btn">
      <VIcon size="20">left</VIcon>
    </button>
    <div class="title-input-wrap flex align-center mx-2 flex-shrink-0 h-100" :data-value="hiddenValue">
      <input
        v-focus-select
        :readonly="isMonitor"
        ref="nameInput"
        v-model="name"
        class="title-input"
        @blur="onNameInputBlur"
      />
      <VIcon @click="focusNameInput" class="title-input-icon" size="14">edit-outline</VIcon>
    </div>
    <div class="operation-center flex align-center">
      <ElTooltip transition="tooltip-fade-in" content="撤销">
        <button @click="$emit('undo')" class="icon-btn">
          <VIcon size="20">undo</VIcon>
        </button>
      </ElTooltip>
      <ElTooltip transition="tooltip-fade-in" content="重做">
        <button @click="$emit('redo')" class="icon-btn">
          <VIcon size="20">redo</VIcon>
        </button>
      </ElTooltip>
      <ElTooltip transition="tooltip-fade-in" content="删除">
        <button @click="$emit('delete')" class="icon-btn">
          <VIcon size="20">delete</VIcon>
        </button>
      </ElTooltip>
      <ElTooltip transition="tooltip-fade-in" content="全屏">
        <button @click="$emit('fullscreen')" class="icon-btn">
          <VIcon size="20">fullscreen</VIcon>
        </button>
      </ElTooltip>
      <ElTooltip transition="tooltip-fade-in" content="内容居中">
        <button @click="$emit('center-content')" class="icon-btn">
          <VIcon size="20">compress</VIcon>
        </button>
      </ElTooltip>
      <ElTooltip transition="tooltip-fade-in" content="缩小">
        <button @click="$emit('zoom-out')" class="icon-btn">
          <VIcon size="20">zoom-out</VIcon>
        </button>
      </ElTooltip>
      <ElTooltip transition="tooltip-fade-in" content="放大">
        <button @click="$emit('zoom-in')" class="icon-btn">
          <VIcon size="20">zoom-in</VIcon>
        </button>
      </ElTooltip>
      <ElTooltip transition="tooltip-fade-in" content="自动布局">
        <button @click="$emit('auto-layout')" class="icon-btn">
          <VIcon size="20">auto-layout</VIcon>
        </button>
      </ElTooltip>
    </div>
    <div class="flex align-center flex-grow-1">
      <div class="flex-grow-1"></div>

      <ElButton type="primary" class="mx-2" @click="$emit('save')"> 保存 </ElButton>
      <ElButton plain class="mx-2" @click="$emit('showSettings')"> 设置 </ElButton>

      <!--<button @click="$emit('showSettings')" class="icon-btn">
        <VIcon size="20">setting</VIcon>
      </button>-->
    </div>
  </header>
</template>

<script>
import VIcon from 'web-core/components/VIcon'
import focusSelect from 'web-core/directives/focusSelect'
import DataflowApi from 'web-core/api/DataFlows'
import { mapGetters, mapMutations } from 'vuex'

const dataflowApi = new DataflowApi()
export default {
  name: 'TopHeader',

  directives: { focusSelect },

  props: {
    isSaving: Boolean,
    isStarting: Boolean,
    isEditable: Boolean,
    isMonitor: Boolean,
    editable: Boolean,
    statusBtMap: Object,
    status: {
      type: String,
      default: ''
    },
    creatUserId: String
  },

  components: { VIcon },

  data() {
    return {
      name: '',
      syncMap: {
        'initial_sync+cdc': this.$t('dataFlow.initial_sync') + '+' + this.$t('dataFlow.cdc'),
        initial_sync: this.$t('dataFlow.initial_sync'),
        cdc: this.$t('dataFlow.cdc')
      }
    }
  },

  computed: {
    ...mapGetters('dataflow', ['dataflowId', 'dataflowName']),

    syncTxt() {
      const settings = this.$store.getters['dataflow/dataflowSettings']
      return this.syncMap[settings.sync_type]
    },

    hiddenValue() {
      let value = this.name.replace(/\s/g, '.')
      return `${value}`
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
    ...mapMutations('dataflow', ['setDataflowName', 'setActiveType']),

    onNameInputBlur() {
      this.setDataflowName({ newName: this.name })
      if (this.dataflowId) {
        dataflowApi.patchId(this.dataflowId, {
          name: this.name
        })
      }
    },

    focusNameInput() {
      this.$refs.nameInput.focus()
    },

    updateInputWidth() {
      this.$nextTick(() => {
        let namePre = this.$refs.namePre
        namePre.style.display = 'inline-block'
        this.inputWidth = Math.max(this.$refs.namePre.offsetWidth, 8) + 'px'
        namePre.removeAttribute('style')
      })
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
$radius: 3px;
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

    &:hover {
      color: map-get($color, primary);
      background: $hoverBg;
    }
  }

  .icon-btn + .icon-btn {
    margin-left: 16px;
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

  ::v-deep {
    .el-button-group {
      .btn-base:not(:first-child) {
        border-left: 1px solid #ddd;
      }
    }

    .el-tag {
      height: $baseHeight;
      border-radius: $radius;
    }

    .el-input__inner {
      border-radius: $radius;
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
