<template>
  <div class="main-panel-container flex flex-column vh-100">
    <!--头部区域-->
    <PanelHeader></PanelHeader>

    <div class="main-panel flex flex-1 min-h-0">
      <!--综合面板-->
      <CompositePanel></CompositePanel>

      <!--工作区域面板-->
      <WorkspacePanel></WorkspacePanel>

      <!--设置区域面板-->
      <SettingsPanel></SettingsPanel>
    </div>
  </div>
</template>

<script>
import PanelHeader from './components/PanelHeader'
import CompositePanel from './components/CompositePanel'
import WorkspacePanel from './components/WorkspacePanel'
import SettingsPanel from './components/SettingsPanel'

export default {
  name: 'Editor',
  components: { SettingsPanel, WorkspacePanel, CompositePanel, PanelHeader }
}
</script>

<style scoped lang="scss">
.main-panel-container {
}
</style>
