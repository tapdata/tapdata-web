import { connect, mapProps } from '@formily/vue'
import VSelect from 'web-core/components/VSelect'

export const ComboSelect = connect(VSelect, mapProps({ dataSource: 'options', loading: true }))
