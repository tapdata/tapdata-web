import { FormLayout } from './FormLayout'
import { CSSStyle } from './CSSStyle'

export const Form = {
  type: 'object',
  properties: {
    ...FormLayout.properties,
    style: CSSStyle,
  },
}
