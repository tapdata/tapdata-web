<script>
import { Slider } from '@tap/form'
import { markRaw } from 'vue'
import {
  CodeEditorWidget,
  // DrawerSetter,
  CollapseItem,
  ComponentTreeWidget,
  CompositePanel,
  Designer,
  // BoxStyleSetter,
  // BorderStyleSetter,
  // BorderRadiusStyleSetter,
  // BackgroundStyleSetter,
  // BoxShadowStyleSetter,
  // FontStyleSetter,
  DisplayStyleSetter,
  FlexStyleSetter,
  PreviewWidget,
  ResourceWidget,
  SchemaEditorWidget,
  SettingsForm,
  SettingsPanel,
  SizeInput,
  StudioPanel,
  // ColorInput,
  // ImageInput,
  // BackgroundImageInput,
  // PositionInput,
  // CornerInput,
  // MonacoInput,
  ValueInput,
  ViewPanel,
  ViewportPanel,
  Workspace,
  WorkspacePanel,
} from './components'
import { GlobalRegistry } from './core'
import * as icons from './icons'
import {
  Checkbox,
  Field,
  FieldSelect,
  Form,
  FormLayout,
  Input,
  InputNumber,
  Radio,
  Select,
} from './sources'
import './locales'
import './theme.scss'

GlobalRegistry.registerDesignerIcons(icons)
GlobalRegistry.registerDesignerLocales({
  'zh-CN': {
    sources: {
      Inputs: '输入控件',
      Layouts: '布局组件',
      Arrays: '自增组件',
      Displays: '展示组件',
      Business: '业务组件',
    },
  },
  'en-US': {
    sources: {
      Inputs: 'Inputs',
      Layouts: 'Layouts',
      Arrays: 'Arrays',
      Displays: 'Displays',
      Business: 'Business',
    },
  },
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
    PreviewWidget,
  },

  data() {
    return {
      sources: [Input, Select, InputNumber, Checkbox, Radio],
      businessSources: [FieldSelect],
      components: markRaw({
        Field,
        Input,
        Select,
        Form,
        FormLayout,
        InputNumber,
        Checkbox,
        Radio,
        FieldSelect,
      }),
      settingsFormComponents: markRaw({
        SizeInput,
        DisplayStyleSetter,
        FlexStyleSetter,
        Slider,
        CollapseItem,
        ValueInput,
      }),
    }
  },
}
</script>

<template>
  <Designer class="node-design">
    <StudioPanel>
      <CompositePanel>
        <CompositePanel.Item title="panels.Component" icon="Component">
          <ResourceWidget title="sources.Inputs" :sources="sources" />
          <ResourceWidget title="sources.Business" :sources="businessSources" />
        </CompositePanel.Item>
      </CompositePanel>
      <Workspace id="form">
        <WorkspacePanel>
          <ViewportPanel :style="{ height: '100%' }">
            <ViewPanel type="DESIGNABLE">
              <ComponentTreeWidget :components="components" />
            </ViewPanel>
            <ViewPanel type="JSONTREE" :scrollable="false">
              <template #default="{ tree, onChange }">
                <SchemaEditorWidget :tree="tree" :on-change="onChange" />
              </template>
            </ViewPanel>
            <ViewPanel type="CODE" :scrollable="false">
              <template #default="{ customNode, tree, onChange }">
                <CodeEditorWidget
                  :custom-node="customNode"
                  :tree="tree"
                  :on-change="onChange"
                />
              </template>
            </ViewPanel>
            <ViewPanel type="PREVIEW" :scrollable="false">
              <template #default="{ tree, onChange }">
                <PreviewWidget :tree="tree" :on-change="onChange" />
              </template>
            </ViewPanel>
          </ViewportPanel>
        </WorkspacePanel>
      </Workspace>
      <SettingsPanel title="panels.PropertySettings">
        <SettingsForm :components="settingsFormComponents" />
      </SettingsPanel>
    </StudioPanel>
  </Designer>
</template>

<style lang="scss" scoped>
.main-panel-container {
}
</style>
