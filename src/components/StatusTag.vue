<template>
  <span class="td-status-tag">
    <ElTag :type="statusObj.type" v-if="type === 'tag'">{{ statusObj.text }}</ElTag>
    <span :class="['flex', 'align-items-center', 'icon-span', `color-${statusObj.type}`, status]" v-else>
      <VIcon v-if="statusObj.icon" class="v-icon" size="16">{{ statusObj.icon }}</VIcon>
      <span v-else class="circle-icon mr-2" :style="{ 'background-color': statusObj.color }"></span>
      <span class="td-status-tag__text">{{ statusObj.text }}</span>
    </span>
  </span>
</template>

<script>
import VIcon from '@/components/VIcon'
import { CONNECTION_STATUS_MAP, INSTANCE_STATUS_MAP, TASK_STATUS_MAP } from '../const'
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
    }
  },
  computed: {
    map() {
      return {
        instance: INSTANCE_STATUS_MAP,
        task: TASK_STATUS_MAP,
        connection: CONNECTION_STATUS_MAP
      }[this.target]
    },
    statusObj() {
      return this.map[this.status]
    }
  }
}
</script>

<style lang="scss">
.td-status-tag {
  display: inline-block;
  vertical-align: middle;
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
  height: 26px;
  line-height: 26px;
  color: rgba(0, 0, 0, 0.65);
}
</style>
