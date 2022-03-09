<template>
  <!--<div class="main-panel-container flex flex-column vh-100 node-design">-->
  <!--头部区域-->
  <!--<Designer class="main-panel-container flex flex-column vh-100 node-designmain-panel flex flex-1 min-h-0">-->
  <Designer class="node-design">
    <StudioPanel>
      <PanelHeader slot="header"></PanelHeader>
      <CompositePanel></CompositePanel>
      <Workspace id="form">
        <WorkspacePanel>
          <ViewportPanel :style="{ height: '100%' }">
            <ViewPanel type="DESIGNABLE">
              <ComponentTreeWidget :components="components"></ComponentTreeWidget>
            </ViewPanel>
          </ViewportPanel>
        </WorkspacePanel>
      </Workspace>
      <SettingsPanel title="panels.PropertySettings">
        <SettingsForm :components="settingsFormComponents"></SettingsForm>
      </SettingsPanel>
    </StudioPanel>
  </Designer>
  <!--</div>-->
</template>

<script>
import PanelHeader from './components/PanelHeader'
import CompositePanel from './components/CompositePanel'
// import WorkspacePanel from './components/WorkspacePanel'

import {
  Designer,
  StudioPanel,
  Workspace,
  SettingsPanel,
  ComponentTreeWidget,
  WorkspacePanel,
  ViewportPanel,
  ViewPanel
} from './components'
import { GlobalRegistry } from './core'
import * as icons from './icons'
import './theme.scss'
import './locales'
import { Input, Field, Select, Form, FormLayout, InputNumber } from './sources'
import { Slider } from '@daas/form'
import {
  SettingsForm,
  SizeInput,
  // ColorInput,
  // ImageInput,
  // BackgroundImageInput,
  // PositionInput,
  // CornerInput,
  // MonacoInput,
  // ValueInput,
  // BoxStyleSetter,
  // BorderStyleSetter,
  // BorderRadiusStyleSetter,
  // BackgroundStyleSetter,
  // BoxShadowStyleSetter,
  // FontStyleSetter,
  DisplayStyleSetter,
  FlexStyleSetter
  // DrawerSetter,
  // CollapseItem
} from './components'

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
    StudioPanel,
    SettingsPanel,
    WorkspacePanel,
    ViewportPanel,
    CompositePanel,
    PanelHeader,
    Designer,
    Workspace,
    ComponentTreeWidget,
    SettingsForm,
    ViewPanel
  },

  data() {
    return {
      components: { Field, Input, Select, Form, FormLayout, InputNumber },
      settingsFormComponents: { SizeInput, DisplayStyleSetter, FlexStyleSetter, Slider }
    }
  }
}
</script>

<style scoped lang="scss">
.main-panel-container {
}
</style>
