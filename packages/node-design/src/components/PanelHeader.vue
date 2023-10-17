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
import { VIcon } from '@tap/component'

export default {
  name: 'PanelHeader',
  components: { VIcon }
}
</script>
