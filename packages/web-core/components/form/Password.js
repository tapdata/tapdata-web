import { Input } from './Input'
import { connect, mapProps, mapReadPretty } from '@formily/vue'
import { PreviewText } from './preview-text'

export const Password = connect(
  Input,
  mapProps(props => {
    return {
      ...props,
      showPassword: true
    }
  }),
  mapReadPretty(PreviewText.Input)
)

export default Password
