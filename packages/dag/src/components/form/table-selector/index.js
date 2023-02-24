import { transformComponent } from '@formily/element/lib/__builtins__/shared'
import _TableSelector from './TableSelector'

export const TableSelector = transformComponent(_TableSelector, {
  change: 'input'
})

export default TableSelector
