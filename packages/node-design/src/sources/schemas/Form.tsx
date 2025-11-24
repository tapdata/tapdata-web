import { CSSStyle } from './CSSStyle'
import { FormLayout } from './FormLayout'

export const Form = {
  type: 'object',
  properties: {
    ...FormLayout.properties,
    style: CSSStyle,
  },
}
