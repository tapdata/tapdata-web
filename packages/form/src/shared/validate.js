import { createForm } from '@formily/core'
import { Schema } from '@formily/json-schema'
import { isStr } from '@formily/shared'

function recursiveField(form, schema, scope, basePath, name) {
  // 校验的特殊处理：1.x-reactions作为异步请求时；2.去掉默认值
  const reactions = schema['x-reactions']
  if (reactions) {
    if (isStr(reactions) && /use\w+\(.+\)/.test(reactions)) {
      delete schema['x-reactions']
    } else if (Array.isArray(reactions)) {
      schema['x-reactions'] = reactions.filter(item => !(isStr(item) && /use\w+\(.+\)/.test(item)))
    }
  }
  delete schema.default

  const fieldSchema = new Schema(schema)
  const fieldProps = fieldSchema.toFieldProps({
    scope
  })

  function recursiveProperties(propBasePath) {
    fieldSchema.mapProperties((propSchema, propName) => {
      recursiveField(form, propSchema, scope, propBasePath, propName)
    })
  }

  if (name === undefined || name === null) {
    recursiveProperties(basePath)
    return
  }

  if (schema.type === 'object') {
    const field = form.createObjectField({
      ...fieldProps,
      name,
      basePath
    })

    recursiveProperties(field.address.toString())
  } else if (schema.type === 'array') {
    const field = form.createArrayField({
      ...fieldProps,
      name,
      basePath
    })

    const fieldAddress = field.address.toString()
    // const fieldValues = form.getValuesIn(fieldAddress)
    const fieldValues = field.value
    fieldValues?.forEach((value, index) => {
      if (schema.items) {
        const itemsSchema = Array.isArray(schema.items) ? schema.items[index] || schema.items[0] : schema.items

        recursiveField(form, itemsSchema, scope, fieldAddress, index)
      }
    })
  } else if (schema.type === 'void') {
    const field = form.createVoidField({
      ...fieldProps,
      name,
      basePath
    })

    recursiveProperties(field.address.toString())
  } else {
    form.createField({
      ...fieldProps,
      name,
      basePath
    })
  }
}
function makeField(form, schema, scope, basePath, name) {
  const fieldSchema = new Schema(schema)
  const fieldProps = fieldSchema.toFieldProps({
    scope
  })

  function recursiveProperties(propBasePath) {
    fieldSchema.mapProperties((propSchema, propName) => {
      makeField(form, propSchema, scope, propBasePath, propName)
    })
  }

  if (name === undefined || name === null) {
    recursiveProperties(basePath)
    return
  }

  if (schema.type === 'object') {
    const field = form.createObjectField({
      ...fieldProps,
      name,
      basePath
    })

    recursiveProperties(field.address.toString())
  } else if (schema.type === 'array') {
    const field = form.createArrayField({
      ...fieldProps,
      name,
      basePath
    })

    const fieldAddress = field.address.toString()
    // const fieldValues = form.getValuesIn(fieldAddress)
    const fieldValues = field.value
    fieldValues?.forEach((value, index) => {
      if (schema.items) {
        const itemsSchema = Array.isArray(schema.items) ? schema.items[index] || schema.items[0] : schema.items

        recursiveField(form, itemsSchema, scope, fieldAddress, index)
      }
    })
  } else if (schema.type === 'void') {
    const field = form.createVoidField({
      ...fieldProps,
      name,
      basePath
    })

    recursiveProperties(field.address.toString())
  } else {
    form.createField({
      ...fieldProps,
      name,
      basePath
    })
  }
}

/**
 * 根据schema校验表单数据
 * @param schema
 * @param values
 * @param scope
 * @param basePath 可以指定路径校验
 * @returns {Promise<*>} 如果校验成功是不会有任何返回，校验失败会在 promise reject 中返回 IFormFeedback
  interface IFormFeedback {
    path?: string //校验字段数据路径
    address?: string //校验字段绝对路径
    triggerType?: 'onInput' | 'onFocus' | 'onBlur' //校验触发类型
    type?: 'error' | 'success' | 'warning' //反馈类型
    code?: //反馈编码
    | 'ValidateError'
      | 'ValidateSuccess'
      | 'ValidateWarning'
      | 'EffectError'
      | 'EffectSuccess'
      | 'EffectWarning'
    messages?: string[] //反馈消息
  }
 *
 */
export const validateBySchema = (schema, values, scope, basePath) => {
  const form = createForm({
    values
  })

  recursiveField(form, JSON.parse(JSON.stringify(schema)), scope, basePath)

  return form.validate().finally(() => {
    form.onUnmount() // 触发卸载
  })
}

/**
 * 获取schema默认值
 * @param schema
 * @param scope
 * @param path
 * @returns {any}
 */
export const getInitialValuesInBySchema = (schema, scope, path) => {
  const form = createForm()
  try {
    makeField(form, schema, scope)
  } catch (e) {
    console.log('error', e) // eslint-disable-line
  }
  const initialValue = form.getInitialValuesIn(path)
  form.onUnmount() // 触发卸载
  return { ...initialValue }
}
