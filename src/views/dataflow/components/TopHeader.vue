<template>
  <header class="layout-header border-bottom">
    <div class="title-wrap flex flex-shrink-0">
      <div class="nav-icon flex align-center justify-center">
        <VIcon color="#fff" size="24">left</VIcon>
      </div>
      <div class="title-input-wrap flex align-center mx-2">
        <div
          class="title-input overflow-hidden text-nowrap"
          contenteditable="true"
          @keydown.enter.prevent
        >
          Dataflow 任务名称
        </div>
      </div>
    </div>
    <div class="flex align-center flex-grow-1 pr-3">
      <button class="icon-btn">
        <VIcon size="18">undo</VIcon>
      </button>
      <button class="icon-btn">
        <VIcon size="18">redo</VIcon>
      </button>
      <button @click="$emit('delete')" class="icon-btn">
        <VIcon size="18">delete</VIcon>
      </button>
      <button class="icon-btn">
        <VIcon size="18">fullscreen</VIcon>
      </button>
      <button class="icon-btn">
        <VIcon size="18">compress</VIcon>
      </button>
      <button class="icon-btn">
        <VIcon size="18">zoom-out</VIcon>
      </button>
      <button class="icon-btn">
        <VIcon size="18">zoom-in</VIcon>
      </button>
      <VDivider class="mx-3" vertical></VDivider>

      <ElButton
        @click="$emit('save')"
        class="btn-base mr-3"
        size="mini"
        :loading="isSaving"
      >
        <VIcon size="12" class="mr-1">save</VIcon>
        <span>{{ $t('dataFlow.button.save') }}</span>
      </ElButton>

      <ElAutocomplete
        class="mr-3"
        id="searchNode"
        size="mini"
        hide-loading
        clearable
        suffix-icon="el-icon-search"
        :placeholder="$t('dataFlow.searchNode')"
      ></ElAutocomplete>

      <ElButtonGroup class="flex mr-3">
        <ElButton
          v-if="
            ['scheduled', 'running'].includes(status) &&
            executeMode === 'running_debug'
          "
          class="btn-base"
          size="mini"
          :disabled="
            $disabledByPermission('SYNC_job_operation_all_data', creatUserId)
          "
          v-readonlybtn="'SYNC_job_operation'"
        >
          <VIcon class="mr-1" size="12">zanting3</VIcon>
          <span>{{ $t('dataFlow.button.stop_capture') }}</span>
        </ElButton>
        <ElButton
          v-readonlybtn="'SYNC_job_operation'"
          :disabled="
            $disabledByPermission('SYNC_job_operation_all_data', creatUserId)
          "
          v-if="
            ['running'].includes(status) &&
            executeMode === 'normal' &&
            $window.getSettingByKey('SHOW_DATA_TRACE')
          "
          class="btn-base"
          size="mini"
        >
          <VIcon class="mr-1" size="12">yulan1</VIcon>
          <span>{{ $t('dataFlow.button.capture') }}</span>
        </ElButton>
        <ElButton
          v-readonlybtn="'SYNC_job_operation'"
          :disabled="
            $disabledByPermission('SYNC_job_operation_all_data', creatUserId)
          "
          class="btn-base"
          size="mini"
        >
          <VIcon class="mr-1" size="12">kujitongbu</VIcon>
          <span>{{ $t('dataFlow.button.reloadSchema') }}</span>
        </ElButton>
        <ElButton
          v-readonlybtn="'SYNC_job_operation'"
          :disabled="
            $disabledByPermission('SYNC_job_operation_all_data', creatUserId)
          "
          v-if="isEditable && $window.getSettingByKey('SHOW_DATA_TRACE')"
          class="btn-base"
          size="mini"
        >
          <VIcon class="mr-1" size="12">yulan</VIcon>
          <span>{{ $t('dataFlow.button.preview') }}</span>
        </ElButton>
        <ElButton class="btn-base" size="mini">
          <VIcon class="mr-1" size="12">rizhi</VIcon>
          <span>{{ $t('dataFlow.button.logs') }}</span>
        </ElButton>
      </ElButtonGroup>

      <ElButton class="btn-base btn-setting" size="mini">
        <span class="btn-setting-icon inline-flex justify-center align-center">
          <VIcon size="12">shezhi</VIcon>
        </span>
        <span class="btn-setting-text">{{
          {
            'initial_sync+cdc':
              $t('dataFlow.initial_sync') + '+' + $t('dataFlow.cdc'),
            initial_sync: $t('dataFlow.initial_sync'),
            cdc: $t('dataFlow.cdc')
          }[sync_type]
        }}</span>
      </ElButton>

      <div class="flex-grow-1"></div>

      <ElTag
        :type="
          status === 'running'
            ? 'success'
            : status === 'error'
            ? 'danger'
            : status === 'paused'
            ? 'warning'
            : 'info'
        "
        effect="plain"
        class="flex align-center mx-3 border-0"
      >
        <span v-if="status === 'running'" class="flex align-center px-1">
          <el-image
            style="width: 15px; height: 15px"
            src="static/editor/running.svg"
          ></el-image>
        </span>
        <span v-else-if="status === 'stopping'" class="flex align-center px-1">
          <el-image
            style="width: 15px; height: 15px"
            src="static/editor/stopping.svg"
          ></el-image>
        </span>
        <span v-else-if="status === 'scheduled'" class="flex align-center px-1">
          <el-image
            style="width: 15px; height: 15px"
            src="static/editor/scheduled.svg"
          ></el-image>
        </span>
        <span
          class="lh-1"
          :style="{
            color:
              status === 'scheduled'
                ? '#b0e58c'
                : status === 'stopping'
                ? '#fccd85'
                : ''
          }"
          >{{ $t('dataFlow.state') }}:
          {{ $t('dataFlow.status.' + status.replace(/ /g, '_')) }}</span
        >
      </ElTag>

      <ElButtonGroup class="flex" v-readonlybtn="'SYNC_job_operation'">
        <ElButton
          :disabled="
            $disabledByPermission('SYNC_job_operation_all_data', creatUserId) ||
            statusBtMap[status].start
          "
          class="btn-base btn-operation"
          size="mini"
        >
          <VIcon class="mr-1" size="12">play</VIcon>
          <span>{{ $t('dataFlow.button.start') }}</span>
        </ElButton>
        <ElButton
          :disabled="
            $disabledByPermission('SYNC_job_operation_all_data', creatUserId) ||
            statusBtMap[status].stop
          "
          class="btn-base btn-operation"
          size="mini"
        >
          <VIcon class="mr-1" size="12">pause</VIcon>
          <span>{{ $t('dataFlow.button.stop') }}</span>
        </ElButton>
        <ElButton
          :disabled="
            $disabledByPermission('SYNC_job_operation_all_data', creatUserId) ||
            statusBtMap[status].reset
          "
          class="btn-base btn-operation"
          size="mini"
        >
          <VIcon class="mr-1" size="12">shuaxin</VIcon>
          <span>{{ $t('dataFlow.button.reset') }}</span>
        </ElButton>
        <ElButton
          :disabled="
            $disabledByPermission('SYNC_job_operation_all_data', creatUserId) ||
            statusBtMap[status].forceStop
          "
          class="btn-base btn-operation"
          size="mini"
        >
          <VIcon class="mr-1" size="12">stop</VIcon>
          <span>{{ $t('dataFlow.button.force_stop') }}</span>
        </ElButton>
      </ElButtonGroup>

      <!--<ElButton
        v-readonlybtn="'SYNC_job_edition'"
        :disabled="
          $disabledByPermission('SYNC_job_edition_all_data', creatUserId)
        "
        v-if="!statusBtMap[status].edit && !editable"
        class="btn-edit ml-3"
        size="mini"
        type="primary"
      >
        <i class="mr-1 iconfont icon-bianji2"></i>
        <span>{{ $t('dataFlow.edit') }}</span>
      </ElButton>-->
    </div>
  </header>
</template>

<script>
import VIcon from '@/components/VIcon'
import VDivider from '@/components/VDivider'
export default {
  name: 'TopHeader',

  props: {
    isSaving: Boolean,
    isEditable: Boolean,
    editable: Boolean,
    statusBtMap: Object,
    status: String,
    creatUserId: String,
    sync_type: String
  },

  components: { VDivider, VIcon }
}
</script>

<style scoped lang="scss">
$sidebarW: 236px;
$hoverBg: #e1e1e1;
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
  display: flex;
  width: 100%;
  flex: 0 0 40px;

  .title-wrap {
    width: $sidebarW;
  }

  .nav-icon {
    width: 40px;
    height: 100%;
    background-color: var(--primary);
    cursor: pointer;
    font-size: 24px;
    &:hover {
      background-color: var(--primary-hover);
    }
  }

  .title-input-wrap {
    flex: 1;
    width: 0;
    font-size: 13px;
    line-height: 18px;

    .title-input {
      color: #1f2d3d;
      max-width: 100%;
      position: relative;
      outline: none;
      border: none;
      box-shadow: none;
      background: 0 0;
      border-bottom: 1px dashed rgba(0, 0, 0, 0.22);
      padding: 0 2px;

      &:focus {
        border-color: rgba(0, 0, 0, 0.8);
      }
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
    transition: background 0.15s ease-in-out;
    cursor: pointer;

    &:hover {
      background: $hoverBg;
    }
  }

  .icon-btn + .icon-btn {
    margin-left: 4px;
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
}
</style>
