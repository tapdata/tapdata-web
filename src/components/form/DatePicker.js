import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { DatePicker as ElDatePicker } from 'element-ui'
import { getComponentByTag } from './utils/util'

const TransformElDatePicker = getComponentByTag(ElDatePicker, {
  change: 'input'
})

const getDefaultFormat = (props, formatType = 'format') => {
  const type = props.type

  if (type === 'week' && formatType === 'format') {
    return 'yyyy-WW'
  } else if (type === 'month') {
    return 'yyyy-MM'
  } else if (type === 'year') {
    return 'yyyy'
  } else if (type === 'datetime' || type === 'datetimerange') {
    return 'yyyy-MM-dd HH:mm:ss'
  }

  return 'yyyy-MM-dd'
}

export const DatePicker = connect(
  TransformElDatePicker,
  mapProps({ readOnly: 'readonly' }, props => {
    return {
      ...props,
      format: props.format || getDefaultFormat(props),
      valueFormat: props.valueFormat || getDefaultFormat(props, 'valueFormat')
    }
  })
)
