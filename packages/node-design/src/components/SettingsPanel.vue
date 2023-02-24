<template>
  <div
    class="settings-panel flex flex-column flex-grow-0 flex-shrink-0 border-start"
  >
    <div
      class="settings-panel-header px-2 flex justify-space-between align-center border-bottom"
    >
      <span class="settings-panel-header-title">属性配置</span>
      <span class="settings-panel-header-actions"></span>
    </div>
    <div class="settings-panel-body"></div>
  </div>
</template>

<script>
export default {
  name: 'SettingsPanel',
}
</script>

<style lang="scss" scoped>
.settings-panel {
  position: relative;
  width: 300px;
  &-header {
    height: 48px;
  }
}
</style>
