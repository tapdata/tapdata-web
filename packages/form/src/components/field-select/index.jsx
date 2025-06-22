import { PreviewText } from '@formily/element-plus'
import { connect, mapProps, mapReadPretty } from '@formily/vue'

import {
  FieldSelect as BaseFieldSelect,
  mapFieldsData,
} from './FieldSelect.tsx'

export { BaseFieldSelect, mapFieldsData }

export const FieldSelect = connect(
  BaseFieldSelect,
  mapProps(
    { dataSource: 'options', loading: true, value: 'modelValue' },
    (props) => {
      const _props = { ...props }
      const dataSource = props.dataSource || props['data-source']

      if (dataSource) {
        _props.options = dataSource
      }

      return _props
    },
  ),
  mapReadPretty(PreviewText.Select),
)
