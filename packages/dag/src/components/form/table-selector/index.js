import { transformComponent } from '@formily/element-plus/lib/__builtins__/shared'
import _TableSelector from './TableSelector'

export const TableSelector = transformComponent(_TableSelector, {
  change: 'input'
})

export default TableSelector
