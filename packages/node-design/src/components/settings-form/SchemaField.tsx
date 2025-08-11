// import { Slider, FormItemSwitcher } from '@formily/element-plus-renderer'
import * as ElementUI from '@formily/element-plus'
import { createSchemaField } from '@formily/vue'
import { BackgroundStyleSetter } from './BackgroundStyleSetter'
import { BorderRadiusStyleSetter } from './BorderRadiusStyleSetter'

import {
  BorderRadiusStyleSetter,
  BorderStyleSetter,
  BoxShadowStyleSetter,
  BoxStyleSetter,
  CollapseItem,
  ColorInput,
  DisplayStyleSetter,
  DrawerSetter,
  FontStyleSetter,
  SizeInput,
  ValueInput,
} from './components'

const SchemaFields = createSchemaField({
  components: {
    // ...ElementUI,
    CollapseItem,
    ColorInput,
    SizeInput,
    DisplayStyleSetter,
    BackgroundStyleSetter,
    BoxShadowStyleSetter,
    FontStyleSetter,
    DrawerSetter,
    BoxStyleSetter,
    BorderRadiusStyleSetter,
    BorderStyleSetter,
    ValueInput,
    // Slider,
    // FormItemSwitcher
  },
})

export const SchemaField = SchemaFields.SchemaField
