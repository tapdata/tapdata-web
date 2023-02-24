import { FormPath } from '@formily/core'
import { toJS } from '@formily/reactive'
import {
  ArrayField,
  Field as InternalField,
  ObjectField,
  VoidField,
  Schema,
} from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { FormItem } from '@tap/form'
import { each, reduce } from '@formily/shared'
import { createBehavior } from '../../../core'
import { defineComponent } from 'vue-demi'

import { isArr, isStr } from '@tap/shared'
import { Container } from '../../../components/common/Container'
import { AllLocales } from '../../locales'
import { useComponents, useDesigner, useTreeNode } from '../../../hooks'

Schema.silent(true)

const SchemaStateMap = {
  title: 'title',
  description: 'description',
  default: 'value',
  enum: 'dataSource',
  readOnly: 'readOnly',
  writeOnly: 'editable',
  required: 'required',
  'x-content': 'content',
  'x-value': 'value',
  'x-editable': 'editable',
  'x-disabled': 'disabled',
  'x-read-pretty': 'readPretty',
  'x-read-only': 'readOnly',
  'x-visible': 'visible',
  'x-hidden': 'hidden',
  'x-display': 'display',
  'x-pattern': 'pattern',
}

const NeedShownExpression = {
  title: true,
  description: true,
  default: true,
  'x-content': true,
  'x-value': true,
}

const isExpression = (val) => isStr(val) && /^\{\{.*\}\}$/.test(val)

const filterExpression = (val) => {
  if (typeof val === 'object') {
    const isArray = isArr(val)
    const results = reduce(
      val,
      (buf, value, key) => {
        if (isExpression(value)) {
          return buf
        } else {
          const results = filterExpression(value)
          if (results === undefined || results === null) return buf
          if (isArray) {
            return buf.concat([results])
          }
          buf[key] = results
          return buf
        }
      },
      isArray ? [] : {}
    )
    return results
  }
  if (isExpression(val)) {
    return
  }
  return val
}

const toDesignableFieldProps = (schema, components, nodeIdAttrName, id) => {
  const props = {}
  each(SchemaStateMap, (fieldKey, schemaKey) => {
    const value = schema[schemaKey]
    if (isExpression(value)) {
      if (!NeedShownExpression[schemaKey]) return
      if (value) {
        props[fieldKey] = value
        return
      }
    } else if (value) {
      props[fieldKey] = filterExpression(value)
    }
  })
  if (!components['FormItem']) {
    components['FormItem'] = FormItem
  }
  const decorator =
    schema['x-decorator'] && FormPath.getIn(components, schema['x-decorator'])
  const component =
    schema['x-component'] && FormPath.getIn(components, schema['x-component'])
  const decoratorProps = schema['x-decorator-props'] || {}
  const componentProps = schema['x-component-props'] || {}

  if (decorator) {
    props.decorator = [decorator, toJS(decoratorProps)]
  }
  if (component) {
    props.component = [component, toJS(componentProps)]
  }
  if (decorator) {
    FormPath.setIn(props['decorator'][1], nodeIdAttrName, id)
  } else if (component) {
    FormPath.setIn(props['component'][1], nodeIdAttrName, id)
  }
  const title = props.title
  props.title =
    props.title && (() => <span data-content-editable="title">{title}</span>)
  props.description = props.description && (
    <span data-content-editable="description">{props.description}</span>
  )
  return props
}

export const Field = observer(
  defineComponent({
    name: 'FormPreviewer',
    setup(props, { attrs, slots }) {
      const designer = useDesigner()
      const components = useComponents()
      const nodeRef = useTreeNode()

      return () => {
        if (!nodeRef?.value) return null

        const node = nodeRef.value

        const fieldProps = toDesignableFieldProps(
          attrs,
          components.value,
          designer.value.props.nodeIdAttrName,
          node.id
        )

        if (attrs.type === 'object') {
          return (
            <Container>
              <ObjectField attrs={fieldProps} name={node.id}>
                {slots.default?.()}
              </ObjectField>
            </Container>
          )
        } else if (attrs.type === 'array') {
          return <ArrayField attrs={fieldProps} name={node.id} />
        } else if (node.props.type === 'void') {
          return (
            <VoidField attrs={fieldProps} name={node.id}>
              {slots.default?.()}
            </VoidField>
          )
        }
        return <InternalField attrs={fieldProps} name={node.id} />
        /*return CreateElement(
          InternalField,
          {
            props: {},
            attrs: {
              ...fieldProps,
              name: node.id
            }
          },
          {}
        )*/
      }
    },
  })
)

Field.Behavior = createBehavior({
  name: 'Field',
  selector: 'Field',
  designerLocales: AllLocales.Field,
})
