<template>
  <div class="main-panel-container flex flex-column vh-100 node-design">
    <!--头部区域-->
    <PanelHeader></PanelHeader>

    <div class="main-panel flex flex-1 min-h-0">
      <!--综合面板-->
      <!--<CompositePanel></CompositePanel>-->
      <!--<Designer>
        <div>
          &lt;!&ndash;综合面板&ndash;&gt;
          <CompositePanel></CompositePanel>

          &lt;!&ndash;工作区域面板&ndash;&gt;
          <WorkspacePanel>
            <ComponentTreeWidget :components="components"></ComponentTreeWidget>
          </WorkspacePanel>

          &lt;!&ndash;设置区域面板&ndash;&gt;
          <SettingsPanel></SettingsPanel>
        </div>
      </Designer>-->
      <!--综合面板-->
      <!--<CompositePanel></CompositePanel>-->

      <!--工作区域面板-->
      <Designer>
        <CompositePanel></CompositePanel>
        <Workspace id="form">
          <WorkspacePanel>
            <ComponentTreeWidget :components="components"></ComponentTreeWidget>
          </WorkspacePanel>
        </Workspace>
        <!--设置区域面板-->
        <SettingsPanel title="panels.PropertySettings">
          <SettingsForm></SettingsForm>
        </SettingsPanel>
      </Designer>
    </div>
  </div>
</template>

<script>
import PanelHeader from './components/PanelHeader'
import CompositePanel from './components/CompositePanel'
import WorkspacePanel from './components/WorkspacePanel'
// import SettingsPanel from './components/SettingsPanel'
import { SettingsPanel } from './components/panels'
import { GlobalRegistry } from './core'
import * as icons from './icons'
import './theme.scss'
import './locales'
import { Designer, Workspace } from './containers'
import { ComponentTreeWidget } from './widgets'
import { Input, Field, Select, Form, FormLayout } from './sources'
import { SettingsForm } from './components/settings-form'

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

export default {
  name: 'Editor',
  components: {
    SettingsPanel,
    WorkspacePanel,
    CompositePanel,
    PanelHeader,
    Designer,
    Workspace,
    ComponentTreeWidget,
    SettingsForm
  },

  data() {
    return {
      components: { Field, Input, Select, Form, FormLayout }
    }
  }
}
</script>

<style scoped lang="scss">
.main-panel-container {
}
</style>
