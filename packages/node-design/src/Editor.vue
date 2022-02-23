<template>
  <div class="main-panel-container flex flex-column vh-100 node-design">
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
import { GlobalRegistry } from './core'
import * as icons from './icons'
import './theme.scss'

GlobalRegistry.registerDesignerIcons(icons)
GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    sources: {
      Inputs: '输入控件',
      Layouts: '布局组件',
      Arrays: '自增组件',
      Displays: '展示组件'
    }
  },
  'en-US': {
    sources: {
      Inputs: 'Inputs',
      Layouts: 'Layouts',
      Arrays: 'Arrays',
      Displays: 'Displays'
    }
  }
})

// eslint-disable-next-line no-console
console.log('icons', icons.Component)

export default {
  name: 'Editor',
  components: { SettingsPanel, WorkspacePanel, CompositePanel, PanelHeader }
}
</script>

<style scoped lang="scss">
.main-panel-container {
}
</style>
