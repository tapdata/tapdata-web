<template>
  <section
    class="system-notice g-panel-container"
    v-if="$route.name === 'SystemNotice'"
  >
    <AlarmNotification></AlarmNotification>
  </section>
</template>

<script>
import { AlarmNotification } from '@tap/business'

export default {
  components: { AlarmNotification },
}
</script>

<style lang="scss" scoped>
$unreadColor: #e43737;
.system-notice {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
