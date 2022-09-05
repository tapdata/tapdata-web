import { connect, mapProps } from '@formily/vue'
import { VSelect } from '@tap/components'

export const ComboSelect = connect(VSelect, mapProps({ dataSource: 'options', loading: true }))
