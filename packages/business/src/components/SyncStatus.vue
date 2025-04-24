<script>
import { MILESTONE_TYPE as STATUS_MAP } from '../shared'

export default {
  name: 'SyncStatus',
  props: {
    status: String,
  },
  data() {
    return {
      typeIconMap: {
        info: 'exclamation-circle-filled',
        success: 'success-filled',
        primary: 'more-circle-filled',
      },
      STATUS_MAP,
    }
  },
  computed: {
    item() {
      return this.STATUS_MAP[this.status]
    },
  },
}
</script>

<template>
  <div>
    <div v-if="item" class="inline-flex align-center gap-1">
      <span>
        {{ item.text }}
      </span>
    </div>
    <span v-else>-</span>
  </div>
</template>

<style lang="scss" scoped>
.status-info {
  color: #86909c;
}
.status-primary {
  color: #3b47e5;
}
.status-success {
  color: #00b42a;
}
</style>
