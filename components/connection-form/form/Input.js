import { connect, mapProps } from '@formily/vue'
import { getComponentByTag } from './utils/util'

const ElInput = getComponentByTag('el-input', { change: 'input' })

export const Input = connect(ElInput, mapProps({ readOnly: 'readonly' }))
