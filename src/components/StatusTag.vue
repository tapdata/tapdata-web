<template>
  <span class="td-status-tag">
    <ElTag :type="statusObj.type" v-if="type === 'tag'">{{
      statusObj.text
    }}</ElTag>
    <span style="display:flex;align-items:center;" v-else>
      <img
        v-if="statusObj.icon === 'loading'"
        class="td-status-tag__icon"
        src="../assets/icons/loading.gif"
      />
      <i
        class="iconfont td-icon-yunhangzhong td-status-tag__icon"
        v-if="statusObj.icon === 'running'"
      ></i>
      <i
        class="iconfont td-icon-yichang td-status-tag__icon"
        v-if="statusObj.icon === 'warning'"
      ></i>
      <span class="td-status-tag__text">{{ statusObj.text }}</span>
    </span>
  </span>
</template>

<script>
import { STATUS_MAP } from '../const'
export default {
  props: {
    type: {
      type: String,
      default: 'tag'
    },
    status: {
      type: String
    }
  },
  computed: {
    statusObj() {
      return STATUS_MAP[this.status === 'Running' ? 'Running' : 'Offline']
    }
  }
}
</script>

<style lang="scss">
.td-status-tag {
  display: inline-block;
  vertical-align: middle;
}
.td-status-tag__icon {
  font-size: 14px;
  display: inline-block;
  width: 26px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  &.td-icon-yunhangzhong {
    color: map-get($color, success);
  }
  &.td-icon-yichang {
    color: map-get($color, warning);
  }
}
.td-status-tag__text {
  display: inline-block;
  height: 26px;
  line-height: 26px;
}
</style>
