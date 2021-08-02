import { connect, mapProps } from '@formily/vue'
import { getComponentByTag } from './utils/util'

const ElTransfer = getComponentByTag('el-transfer')

export const Transfer = connect(ElTransfer, mapProps({ dataSource: 'data' }))
