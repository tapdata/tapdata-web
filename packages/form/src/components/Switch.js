import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { getComponentByTag } from './utils'
import PreviewText from './preview-text'

const ElSwitch = getComponentByTag('el-switch')

export const Switch = connect(ElSwitch, mapProps({ readOnly: 'readonly' }), mapReadPretty(PreviewText.Switch))
