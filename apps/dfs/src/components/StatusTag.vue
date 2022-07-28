<template>
  <span v-if="onlyImg" class="td-status-tag inline-flex align-items-center">
    <img :src="imgSrc" :data-status="statusObj.text" alt="" />
  </span>
  <span v-else class="td-status-tag">
    <span v-if="type === 'tag'" :class="['status-tag', statusObj.type ? 'tag--' + statusObj.type : '']">{{
      statusObj.text
    }}</span>
    <span :class="['flex', 'align-items-center', 'icon-span', `color-${statusObj.type}`, status]" v-else>
      <VIcon v-if="statusObj.icon" class="v-icon" size="16">{{ statusObj.icon }}</VIcon>
      <span
        v-else
        :class="['circle-icon', 'mr-2', `bg-color-${statusObj.type}`]"
        :style="{ 'background-color': statusObj.color }"
      ></span>
      <span class="td-status-tag__text font-color-sub">{{ statusObj.text }}</span>
    </span>
  </span>
</template>

<script>
import { VIcon } from '@tap/component'
import {
  CONNECTION_STATUS_MAP,
  INSTANCE_STATUS_MAP,
  TASK_STATUS_MAP,
  MILESTONE_STATUS_MAP,
  CONNECTION_STATUS_MAP_EN
} from '../const'
export default {
  name: 'StatusTag',
  components: { VIcon },
  props: {
    type: {
      type: String,
      default: 'tag'
    },
    status: {
      type: String
    },
    target: {
      type: String,
      default: 'instance'
    },
    onlyImg: {
      type: Boolean,
      default: false
    },
    statusMap: {
      type: Object,
      default: () => {
        return null
      }
    },
    defaultStatus: {
      type: String
    }
  },
  computed: {
    map() {
      return (
        this.statusMap ||
        {
          instance: INSTANCE_STATUS_MAP,
          task: TASK_STATUS_MAP,
          connection: CONNECTION_STATUS_MAP,
          milestone: MILESTONE_STATUS_MAP,
          connection_en: CONNECTION_STATUS_MAP_EN
        }[this.target]
      )
    },
    statusObj() {
      return this.map[this.status] || this.map[this.defaultStatus] || {}
    },
    imgSrc() {
      return require(`../../public/images/task/${this.statusObj.icon}.png`)
    }
  }
}
</script>

<style lang="scss">
.td-status-tag {
  display: inline-block;
  vertical-align: middle;
  img {
    height: 25px;
  }
  .icon-span {
    .v-icon {
      margin: 0 4px;
    }
    .circle-icon {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
  }
}
.td-status-tag__icon {
  font-size: 14px;
  display: inline-block;
  width: 26px;
  height: 26px;
  line-height: 26px;
  text-align: center;
}
.td-status-tag__text {
  display: inline-block;
}
.status-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #d9ecff;
  background-color: #ecf5ff;
  color: #409eff;
  &.tag--success {
    background-color: #f0f9eb;
    border-color: #e1f3d8;
    color: #67c23a;
  }
  &.tag--info {
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
  }
  &.tag--warning {
    background-color: #fdf6ec;
    border-color: #faecd8;
    color: #e6a23c;
  }
  &.tag--danger {
    background-color: #fef0f0;
    border-color: #fde2e2;
    color: #f56c6c;
  }
}
</style>
