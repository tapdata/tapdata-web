import {
  ElAlert as Alert,
  ElDivider as Divider,
  ElLink as Link,
} from 'element-plus'
import { FormCollapse, FormCollapseItem } from './form-collapse'
import { FormTab } from './form-tab'
import { Input } from './input'
import { Radio } from './radio'
import { Select } from './select'
import { Space } from './space'
import { Switch } from './switch'

// element-plus
export { Alert, Divider, Link }
// 覆盖 formily-element-plus
export {
  FormCollapse,
  FormCollapseItem,
  FormTab,
  Input,
  Radio,
  Select,
  Space,
  Switch,
}
// 自定义
export * from './js-editor'
export * from './js-editor-dialog'
export * from './python-editor'
export * from './sql-editor'
export * from './slider'
export * from './clipboard-button'
export * from './form-flex'
export * from './field-select'
export * from './form-content'
export * from './text-file-reader'
export * from './text'
export * from './tag'
export * from './highlight-code'
export * from './Button'
// export * from './InputNumber'
// export * from './input'
export * from './batch-add-field'
export * from './json-editor'
// export * from './form-collapse'
export * from './table-field-select'
export * from './verify-fields-dialog'
export * from './infinite-select'
// export * from './switch' // 为了扩展开关的二次确认

export * from '@formily/element-plus'
