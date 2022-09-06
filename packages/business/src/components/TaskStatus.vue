<template>
  <span v-if="show" class="status-block" :class="['status-' + task.status]">
    {{ $t(STATUS_MAP[task.status].i18n) }}
  </span>
</template>

<script>
import { STATUS_MAP } from '../shared'

export default {
  name: 'TaskStatus',
  props: {
    task: Object
  },
  data() {
    return {
      STATUS_MAP
    }
  },
  computed: {
    show() {
      return this.task.status in this.STATUS_MAP
    }
  }
}
</script>

<style lang="scss" scoped>
.status-block {
  display: inline-block;
  min-width: 60px;
  padding: 3px 10px;
  text-align: center;
  font-weight: 500;
  border-radius: 4px;
  box-sizing: border-box;
}
.status-running {
  color: #178061;
  background-color: #c4f3cb;
}
.status-complete {
  color: #008b58;
  background-color: #b4edd8;
}
.status-error {
  color: #d44d4d;
  background-color: #ffecec;
}
.status-edit {
  color: #0083c7;
  background-color: #d1eefd;
}
.status-starting {
  color: #2c65ff;
  background-color: #ddebff;
}
.status-stop {
  color: #c88500;
  background-color: #ffe4ae;
}
.status-wait_start,
.status-stopping {
  color: #c39700;
  background-color: #fdf1c8;
}
</style>
