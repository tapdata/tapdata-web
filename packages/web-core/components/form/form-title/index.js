import { connect, h, mapProps } from '@formily/vue'
import { stylePrefix } from '../configs'
import './style.scss'

export const FormTitle = connect(
  {
    name: 'FormTitle',
    props: ['title'],
    setup(props) {
      return () => {
        return h(
          'div',
          {
            class: `${stylePrefix}-form-title`
          },
          { default: () => props.title }
        )
      }
    }
  },
  mapProps({ title: true })
)

export default FormTitle
