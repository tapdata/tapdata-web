<template>
  <Designer class="node-design">
    <StudioPanel>
      <CompositePanel>
        <CompositePanel.Item title="panels.Component" icon="Component">
          <ResourceWidget title="sources.Inputs" :sources="sources"></ResourceWidget>
        </CompositePanel.Item>
      </CompositePanel>
      <Workspace id="form">
        <WorkspacePanel>
          <ViewportPanel :style="{ height: '100%' }">
            <ViewPanel type="DESIGNABLE">
              <ComponentTreeWidget :components="components"></ComponentTreeWidget>
            </ViewPanel>
            <ViewPanel type="JSONTREE" :scrollable="false">
              <template #default="{ tree, onChange }">
                <SchemaEditorWidget :tree="tree" :onChange="onChange" />
              </template>
            </ViewPanel>
            <ViewPanel type="CODE" :scrollable="false">
              <template #default="{ customNode, tree, onChange }">
                <CodeEditorWidget :customNode="customNode" :tree="tree" :onChange="onChange" />
              </template>
            </ViewPanel>
            <ViewPanel type="PREVIEW" :scrollable="false">
              <template #default="{ tree, onChange }">
                <PreviewWidget :tree="tree" :onChange="onChange" />
              </template>
            </ViewPanel>
          </ViewportPanel>
        </WorkspacePanel>
      </Workspace>
      <SettingsPanel title="panels.PropertySettings">
        <SettingsForm :components="settingsFormComponents"></SettingsForm>
      </SettingsPanel>
    </StudioPanel>
  </Designer>
</template>

<script>
import 'web-core/assets/icons/svg/component.svg'
import 'web-core/assets/icons/svg/outline.svg'
import 'web-core/assets/icons/svg/history.svg'

import {
  Designer,
  StudioPanel,
  Workspace,
  SettingsPanel,
  ComponentTreeWidget,
  ResourceWidget,
  SchemaEditorWidget,
  CodeEditorWidget,
  PreviewWidget,
  WorkspacePanel,
  ViewportPanel,
  ViewPanel,
  CompositePanel
} from './components'
import { GlobalRegistry } from './core'
import * as icons from './icons'
import './theme.scss'
import './locales'
import { Input, Field, Select, Form, FormLayout, InputNumber, Checkbox, Radio } from './sources'
import { Slider } from '@tap/form'
import {
  SettingsForm,
  SizeInput,
  // ColorInput,
  // ImageInput,
  // BackgroundImageInput,
  // PositionInput,
  // CornerInput,
  // MonacoInput,
  ValueInput,
  // BoxStyleSetter,
  // BorderStyleSetter,
  // BorderRadiusStyleSetter,
  // BackgroundStyleSetter,
  // BoxShadowStyleSetter,
  // FontStyleSetter,
  DisplayStyleSetter,
  FlexStyleSetter,
  // DrawerSetter,
  CollapseItem
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
    Designer,
    Workspace,
    ComponentTreeWidget,
    SettingsForm,
    ViewPanel,
    ResourceWidget,
    SchemaEditorWidget,
    CodeEditorWidget,
    PreviewWidget
  },

  data() {
    return {
      sources: [Input, Select, InputNumber, Checkbox, Radio],
      components: { Field, Input, Select, Form, FormLayout, InputNumber, Checkbox, Radio },
      settingsFormComponents: { SizeInput, DisplayStyleSetter, FlexStyleSetter, Slider, CollapseItem, ValueInput }
    }
  }
}
</script>

<style scoped lang="scss">
.main-panel-container {
}
</style>
