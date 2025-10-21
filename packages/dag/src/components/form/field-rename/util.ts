import { get, merge, set } from 'lodash-es'
export const convertSchemaToTreeData = function (Schema) {
  if (Schema) {
    const root = {}
    let fields = Schema || []
    for (const field of fields) {
      if (field && field.field_name && field.original_field_name) {
        const previousFieldName = field.previousFieldName
        const jsonPathForFieldName = field.field_name.split('.')
        const treeItem = {
          id:
            field.id ||
            `${field.table_name}${field.original_field_name ? `_${field.original_field_name}` : ''}`.replaceAll(
              '.',
              '_',
            ),
          label: jsonPathForFieldName.at(-1),
          field_name: jsonPathForFieldName.at(-1),
          type: field.previousDataType,
          data_type: field.data_type,
          primary_key_position: field.primary_key_position,
          table_name: field.table_name || 'table',
          original_field_name: field.original_field_name,
          is_deleted: field.is_deleted,
          comment: field.comment,
          oldIdList: field.oldIdList || [],
          field: previousFieldName.split('.').pop(),
          previousFieldName,
          previousDataType: field.previousDataType,
          columnPosition: field.columnPosition,
        }
        const path = `children.${jsonPathForFieldName.join('.children.')}`
        const partField = get(root, path)
        if (!partField) {
          set(root, path, treeItem)
        } else {
          set(root, path, merge(partField, treeItem))
        }
      }
    }
    const re = function (field, count) {
      if (field && field.children) {
        count++
        field.children = Object.values(field.children).map((it) => {
          it.level = count
          return it
        })
        field.children.forEach((it) => {
          re(it, count)
        })
      }
    }
    re(root, 0)

    // let sort = function (node) {
    //   if (node.children && node.children.length > 0) {
    //     node.children.sort((c1, c2) => (c1.table_name > c2.table_name ? 1 : c1.table_name === c2.table_name ? 0 : -1))
    //     node.children.forEach(sort)
    //   }
    // }
    // sort(root)
    fields = root.children
    return fields
  } else {
    return null
  }
}

export const getFieldsIds = function (fields) {
  let fieldIds = []
  if (fields) {
    fieldIds = fields.map((field) => field.id)
  }
  return fieldIds
}
export const getOperationIds = function (operation) {
  let fieldIds = []
  if (operation) {
    fieldIds = operation.map((field) => field.id)
  }
  return fieldIds
}

export const getFieldsNames = function (fields) {
  let fieldNames = []
  if (fields) {
    fieldNames = fields.map((field) => field.field_name)
  }
  return fieldNames
}

export const fieldsNamesMap = function (fields) {
  const fieldsNamesMap = {}
  if (fields) {
    fields.map((s) => (fieldsNamesMap[s.field_name] = s.id))
  }
  return fieldsNamesMap
}

export const fieldIsDeleted = function (fields) {
  let fieldIsDeleted = []
  if (fields) {
    fieldIsDeleted = fields.filter((field) => field.is_deleted).map((n) => n.id)
  }
  return fieldIsDeleted
}

export const fieldNameIndex = function (name) {
  let fieldNameIndex = ''
  if (name) {
    fieldNameIndex = name.indexOf('.')
  }
  return fieldNameIndex
}

export const handleOperation = function (fields, operations) {
  //查找是否有被删除的字段且operation有操作
  const fieldOriginalIds = getFieldsIds(fields)
  const fieldOriginalIsDeleted = fieldIsDeleted(fields)
  const fieldOriginalNames = getFieldsNames(fields)
  const operationIds = getOperationIds(operations)
  const temporary = operations
  if (temporary.length > 0) {
    for (let i = 0; i < temporary.length; i++) {
      const indexOf = fieldNameIndex(temporary[i].field) || -1
      if (
        fieldOriginalIsDeleted.includes(temporary[i].id) &&
        !temporary[i].keep
      ) {
        temporary.splice(i, 1)
        i--
        continue
      } else if (
        temporary[i].op === 'CREATE' &&
        (fieldOriginalNames.includes(temporary[i].field) ||
          (!fieldOriginalIds.includes(temporary[i].triggerFieldId) &&
            indexOf > -1 &&
            !operationIds.includes(temporary[i].triggerFieldId)))
      ) {
        temporary.splice(i, 1)
        i--
        continue
      }
    }
  }
  return temporary
}

export const isValidate = function (operations, schema) {
  //字段处理器是否校验通过
  const operation = operations || []
  let isValidate = true
  const errorList = []
  if (operation.length > 0) {
    //data.operation id不匹配的字段验证 跟当前schema进行比较operation.id
    const originalSchema = schema || {}
    const fieldOriginalIds = getFieldsIds(originalSchema.fields)
    const fieldDeleted = fieldIsDeleted(originalSchema.fields)
    const fieldOriginalNames = getFieldsNames(originalSchema.fields)
    const operationIds = getOperationIds(operation)
    for (const element of operation) {
      // isType 1表示id name 都不匹配 2表示name匹配 3表示该字段被标记为删除且id匹配 4 新建字段处理 5 脚本处理
      const indexOf = fieldNameIndex(element.field) || -1
      let node = {}
      if (element.op === 'CREATE') {
        node = {
          id: element.id,
          isType: 4,
          keep: false,
          action: element.action,
          op: element.op,
          field: element.field,
          data_type: element.data_type,
          level: element.level,
          tableName: element.tableName,
          triggerFieldId: element.triggerFieldId,
        }
      } else {
        node = {
          id: element.id,
          color: element.color,
          field: element.field,
          isType: 1,
          keep: false,
          label: element.label,
          op: element.op,
          operand: element.operand,
          originalDataType: element.originalDataType || element.type,
          primary_key_position: element.primary_key_position,
          table_name: element.table_name,
          type: element.type,
        }
      }
      if (
        element.op === 'CREATE' &&
        (fieldOriginalNames.includes(element.field) ||
          (!fieldOriginalIds.includes(element.triggerFieldId) &&
            indexOf > -1 &&
            !operationIds.includes(element.triggerFieldId)))
      ) {
        errorList.push(node)
        isValidate = false
      } else if (
        !fieldOriginalIds.includes(element.id) &&
        !fieldOriginalNames.includes(element.field) &&
        element.op !== 'CREATE'
      ) {
        node.isType = 1
        node.keep = false
        errorList.push(node)
        isValidate = false
      } else if (
        !fieldOriginalIds.includes(element.id) &&
        fieldOriginalNames.includes(element.field) &&
        element.op !== 'CREATE'
      ) {
        node.isType = 2
        node.keep = true
        errorList.push(node)
        isValidate = false
      } else if (fieldDeleted.includes(element.id)) {
        node.isType = 3
        node.keep = true
        errorList.push(node)
        isValidate = false
      }
    }
  }
  return {
    isValidate,
    errorList,
  }
}
export const isScript = function (operations, scripts) {
  let fieldIds = []
  const errorList = []
  if (operations) {
    fieldIds = operations.map((field) => field.id)
  }
  if (scripts) {
    for (const script of scripts) {
      if (!fieldIds.includes(script.id)) {
        const node = {
          isType: 5,
          keep: false,
          color: script.color,
          field: script.field,
          id: script.id,
          label: script.label,
          primary_key_position: script.primary_key_position,
          script: script.script,
          scriptType: script.scriptType,
          tableName: script.tableName,
          type: script.type,
        }
        errorList.push(node)
      }
    }
  }
  return errorList
}
export const delScript = function (operations, scripts, id) {
  let fieldIds = []
  if (operations) {
    fieldIds = operations.map((field) => field.id)
  }
  if (scripts) {
    for (let i = 0; i < scripts.length; i++) {
      if (!fieldIds.includes(scripts[i].id)) {
        scripts.splice(i, 1)
        i--
      } else if (id === scripts[i].id) {
        scripts.splice(i, 1)
        i--
      }
    }
  }
  return scripts
}

//兼容数据 操作记录改变type => original_type
export const originalType = function (operations, id) {
  const data = operations.filter((v) => v.id === id && v.op === 'CONVERT')
  let original_type = ''
  if (data.length > 0) {
    original_type = data[0].originalDataType
  }
  return original_type
}
export const uuid = function () {
  // credit: http://stackoverflow.com/posts/2117523/revisions

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replaceAll(
    /[xy]/g,
    function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    },
  )
}
