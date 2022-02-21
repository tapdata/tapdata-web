<template>
  <div class="panel-header flex align-center border-bottom">
    <div class="panel-header-nav text-center">
      <button class="panel-header-btn inline-flex align-center p-1">
        <VIcon size="20">left</VIcon>
      </button>
    </div>

    <div class="panel-header-logo mx-2">
      <VIcon size="24">component</VIcon>
    </div>
    <div class="panel-header-title">自定义节点名称</div>
    <div class="panel-header-actions text-end flex-grow-1 mr-3">
      <ElButton size="small" type="primary"> 保存 </ElButton>
    </div>
  </div>
</template>

<script>
import VIcon from 'web-core/components/VIcon'

export default {
  name: 'PanelHeader',
  components: { VIcon }
}
</script>

<style scoped lang="scss">
.panel-header {
  $hoverBg: #eef3ff;

  height: 48px;

  &-nav {
    width: 48px;
  }

  &-btn {
    width: 30px;
    height: 30px;
    background: #fff;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: background, color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

    &:hover {
      color: map-get($color, primary);
      background: $hoverBg;
    }
  }

  &-logo {
    .v-icon {
      color: map-get($color, primary);
    }
  }
}
</style>
