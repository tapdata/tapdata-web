import { Schema } from '@formily/json-schema'
import { clone, uid } from '@tap/shared'

const createOptions = (options) => {
  return {
    designableFieldName: 'Field',
    designableFormName: 'Form',
    ...options,
  }
}

const findNode = (node, finder) => {
  if (!node) return
  if (finder(node)) return node
  if (!node.children) return
  for (let i = 0; i < node.children.length; i++) {
    if (findNode(node.children[i])) return node.children[i]
  }
  return
}

/**
 * TreeNode 转 Schema
 * @param node
 * @param options
 * @returns {{schema: {}, form: *}|{schema: {type: string, properties: {}}}}
 */
export const transformToSchema = (node, options) => {
  const realOptions = createOptions(options)
  const root = findNode(node, (child) => {
    return child.componentName === realOptions.designableFormName
  })
  const schema = {
    type: 'object',
    properties: {},
  }
  if (!root) return { schema }
  const createSchema = (node, schema = {}) => {
    if (node !== root) {
      Object.assign(schema, clone(node.props))
    }
    schema['x-designable-id'] = node.id
    if (schema.type === 'array') {
      if (node.children[0]) {
        if (
          node.children[0].componentName === realOptions.designableFieldName
        ) {
          schema.items = createSchema(node.children[0])
          schema['x-index'] = 0
        }
      }
      node.children.slice(1).forEach((child, index) => {
        if (child.componentName !== realOptions.designableFieldName) return
        const key = child.props.name || child.id
        schema.properties = schema.properties || {}
        schema.properties[key] = createSchema(child)
        schema.properties[key]['x-index'] = index
      })
    } else {
      node.children.forEach((child, index) => {
        if (child.componentName !== realOptions.designableFieldName) return
        const key = child.props.name || child.id
        schema.properties = schema.properties || {}
        schema.properties[key] = createSchema(child)
        schema.properties[key]['x-index'] = index
      })
    }
    return schema
  }
  return { form: clone(root.props), schema: createSchema(root, schema) }
}

/**
 * Schema 转 TreeNode
 * @param formily
 * @param options
 * @returns {{children: [], componentName: string, props: *}}
 */
export const transformToTreeNode = (formily = {}, options) => {
  const realOptions = createOptions(options)
  const root = {
    componentName: realOptions.designableFormName,
    props: formily.form,
    children: [],
  }
  const schema = new Schema(formily.schema)
  const cleanProps = (props) => {
    if (props['name'] === props['x-designable-id']) {
      delete props.name
    }
    delete props['version']
    delete props['_isJSONSchemaObject']
    return props
  }
  const appendTreeNode = (parent, schema) => {
    if (!schema) return
    const current = {
      id: schema['x-designable-id'] || uid(),
      componentName: realOptions.designableFieldName,
      props: cleanProps(schema.toJSON(false)),
      children: [],
    }
    parent.children.push(current)
    if (schema.items && !Array.isArray(schema.items)) {
      appendTreeNode(current, schema.items)
    }
    schema.mapProperties((schema) => {
      schema['x-designable-id'] = schema['x-designable-id'] || uid()
      appendTreeNode(current, schema)
    })
  }
  schema.mapProperties((schema) => {
    schema['x-designable-id'] = schema['x-designable-id'] || uid()
    appendTreeNode(root, schema)
  })
  return root
}
