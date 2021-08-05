import { connect, mapProps } from '@formily/vue'
import { getComponentByTag } from './utils/util'

const ElSwitch = getComponentByTag('el-switch')

export const Switch = connect(ElSwitch, mapProps({ readOnly: 'readonly' }))
